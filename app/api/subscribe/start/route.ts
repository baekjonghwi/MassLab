import {
  CENTRAL, sbFetch, priceOf, productOf, hasActiveBundle, type PlanKey,
} from "@/lib/subscription";
import { bearerOf, uidFromAccessToken } from "@/lib/plugin-auth";

// ==========================================================================
//  POST /api/subscribe/start   { product, plan }
//  Authorization: Bearer <Supabase 로그인 토큰>
//
//  결제 세션을 연다. /subscribe 페이지는 이 sid가 있어야 열린다.
//
//  🔴신원은 토큰에서 꺼낸다 — 본문의 user_id를 믿으면 남의 계정으로 구독을
//    걸 수 있다. 금액도 여기서 정하지 않는다(세션 라우트가 다시 계산한다).
// ==========================================================================

export const dynamic = "force-dynamic";

// 다른 하위 도메인(archimap 등)에서도 부를 수 있어야 한다.
function cors(origin: string | null): HeadersInit {
  const ok = origin && /^https:\/\/([a-z0-9-]+\.)?masslabs-archi\.com$/.test(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin : "",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: cors(request.headers.get("origin")) });
}

export async function POST(request: Request) {
  const h = cors(request.headers.get("origin"));

  let body: { product?: string; plan?: PlanKey };
  try { body = await request.json(); } catch { return Response.json({ error: "bad_json" }, { status: 400, headers: h }); }

  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500, headers: h });

  const product = productOf(body.product);
  const plan = (body.plan ?? "plus") as PlanKey;
  // 🔴팔지 않는 조합이면 세션 자체를 만들지 않는다(예: 가격 미정인 번들).
  if (!product || priceOf(product.key, plan) == null) {
    return Response.json({ error: "not_for_sale" }, { status: 409, headers: h });
  }

  const uid = await uidFromAccessToken(bearerOf(request));
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401, headers: h });

  // 이미 전체 구독 중이면 개별 구독을 팔지 않는다(같은 권한에 이중 과금).
  if (product.key !== "all" && (await hasActiveBundle(uid))) {
    return Response.json({ error: "bundle_active" }, { status: 409, headers: h });
  }

  // 열려 있던 옛 세션은 닫는다. 안 닫으면 만료까지 남아 목록이 지저분해진다.
  await sbFetch(`checkout_sessions?user_id=eq.${uid}&status=eq.pending`, {
    method: "PATCH",
    body: JSON.stringify({ status: "failed", note: "새 세션으로 대체" }),
    prefer: "return=minimal",
  });

  const res = await sbFetch("checkout_sessions", {
    method: "POST",
    body: JSON.stringify({ user_id: uid, product: product.key, plan }),
    prefer: "return=representation",
  });
  if (!res.ok) {
    console.error("[subscribe] 세션 생성 실패:", res.status, await res.text());
    return Response.json({ error: "create_failed" }, { status: 500, headers: h });
  }

  const row = ((await res.json()) as { id: string }[])[0];
  const origin = new URL(request.url).origin;
  return Response.json(
    { sid: row.id, url: `${origin}/subscribe?sid=${encodeURIComponent(row.id)}&product=${product.key}` },
    { headers: h },
  );
}
