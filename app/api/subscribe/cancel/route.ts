import {
  CENTRAL, sbFetch, syncPlanCache, productOf, PORTONE_API, type ProductDef,
} from "@/lib/subscription";

// ==========================================================================
//  POST /api/subscribe/cancel   (Authorization: Bearer <supabase access token>)
//  { product }
//
//  🔴해지는 결제 세션이 아니라 "로그인한 본인"이 부른다. 그래서 sid가 아니라
//    MassLabs 계정의 액세스 토큰을 받아 서버가 그 토큰으로 신원을 확인한다.
//
//  🔴다른 도메인(archimap.masslabs-archi.com 등)에서 부르므로 CORS가 필요하다.
//    허용 출처는 그 제품에 등록된 것 하나뿐이다 — 와일드카드를 쓰지 않는다.
//
//  정책: 해지해도 이미 결제한 달은 끝까지 쓴다. 그래서 권한을 바로 뺏지 않고
//        canceled_at(=다음 결제 예정일)만 적어 두고, 그날이 지나면 크론이 내린다.
//        (plan_for 함수가 canceled_at을 보고 판정하므로 앱은 저절로 따라온다.)
// ==========================================================================

function cors(p: ProductDef | null): HeadersInit {
  return {
    "Access-Control-Allow-Origin": p?.returnOrigin ?? "",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
  };
}

export async function OPTIONS(request: Request) {
  const p = productOf(new URL(request.url).searchParams.get("product") ?? "archimap");
  return new Response(null, { status: 204, headers: cors(p) });
}

export async function POST(request: Request) {
  let body: { product?: string };
  try { body = await request.json(); } catch { body = {}; }

  const p = productOf(body.product ?? "archimap");
  if (!p || !CENTRAL.serviceKey) {
    return Response.json({ error: "bad_request" }, { status: 400, headers: cors(p) });
  }

  // --- 토큰으로 본인 확인 -------------------------------------------------
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "no_token" }, { status: 401, headers: cors(p) });

  const meRes = await fetch(`${CENTRAL.supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: CENTRAL.serviceKey },
    cache: "no-store",
  });
  if (!meRes.ok) return Response.json({ error: "bad_token" }, { status: 401, headers: cors(p) });
  const uid = ((await meRes.json()) as { id?: string }).id;
  if (!uid) return Response.json({ error: "bad_token" }, { status: 401, headers: cors(p) });

  // --- 그 제품의 구독 ------------------------------------------------------
  const sRes = await sbFetch(`subscriptions?user_id=eq.${uid}&product=eq.${p.key}&select=*`);
  if (!sRes.ok) return Response.json({ error: "lookup_failed" }, { status: 500, headers: cors(p) });
  const sub = ((await sRes.json()) as {
    status: string; billing_key: string; next_billing_at: string | null;
  }[])[0];

  if (!sub) return Response.json({ error: "no_subscription" }, { status: 404, headers: cors(p) });
  if (sub.status !== "active") {
    return Response.json({ error: "not_active", status: sub.status }, { status: 409, headers: cors(p) });
  }

  // 남은 기간의 끝 = 다음 결제 예정일. 그날까지 쓰고 잠긴다.
  // 🔴status가 'canceled'가 되는 순간 크론의 청구 대상에서 빠지므로 더는 안 나간다.
  // next_billing_at이 비어 있으면(이례적) 즉시 종료로 본다.
  const until = sub.next_billing_at ?? new Date().toISOString();

  await sbFetch(`subscriptions?user_id=eq.${uid}&product=eq.${p.key}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "canceled", canceled_at: until, updated_at: new Date().toISOString(),
    }),
    prefer: "return=minimal",
  });

  // --- 포트원에서 빌링키 삭제 ---------------------------------------------
  // 🔴카드 정보를 계속 들고 있을 이유가 없다. 실패해도 해지 자체는 이미 끝났으므로
  //   막지 않고 로그만 남긴다(status='canceled'라 크론이 청구하지 않는다).
  const secret = process.env.PORTONE_SECRET_KEY?.trim();
  if (secret && sub.billing_key) {
    try {
      const del = await fetch(
        `${PORTONE_API}/billing-keys/${encodeURIComponent(sub.billing_key)}`,
        { method: "DELETE", headers: { Authorization: `PortOne ${secret}` }, cache: "no-store" },
      );
      if (!del.ok) console.error("[cancel] 빌링키 삭제 실패:", del.status, await del.text());
    } catch (e) {
      console.error("[cancel] 빌링키 삭제 예외:", e);
    }
  }

  await sbFetch("billing_events", {
    method: "POST",
    body: JSON.stringify({
      user_id: uid, payment_id: `cancel-${p.key}-${uid}-${Date.now()}`,
      kind: "cancel", status: "canceled", raw: { product: p.key, until },
    }),
    prefer: "return=minimal",
  });

  // 아직 만료 전이라 등급은 그대로다(plan_for가 canceled_at을 본다).
  await syncPlanCache(uid);

  return Response.json({ ok: true, until }, { headers: cors(p) });
}
