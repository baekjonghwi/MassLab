import {
  CENTRAL, sbFetch, emailOf, chargeWithBillingKey, customerIdOf, type Channel,
} from "@/lib/subscription";
import { bearerOf, uidFromAccessToken } from "@/lib/plugin-auth";

// ==========================================================================
//  POST /api/credits/buy   { product? }
//  Authorization: Bearer <Supabase 로그인 토큰>
//
//  크레딧 3회를 산다. 적립·이월은 없다 — profiles.credits_used를 3 내릴 뿐이다.
//
//  🔴credits_used는 0 밑으로 못 내려간다. 그래서 "이번 달 한도"를 넘겨 쌓아 둘 수
//    없고, 달이 바뀌어 used=0이 되면 그게 곧 최대치다. 월 리셋 함정이 없다.
//  🔴used < 3이면 거절한다. 쓰지도 않은 크레딧을 파는 셈이 되고, 0에서 잘리므로
//    돈만 받고 아무것도 안 주는 결과가 된다.
//  🔴결제가 먼저다. 차감부터 하고 결제가 실패하면 공짜로 준 것이 된다.
// ==========================================================================

export const dynamic = "force-dynamic";

const CREDITS = 3;
const PRICE_USD = 1;          // 표시가. 부가세는 국내(KRW)에만 붙는다.
const VAT = 0.1;

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
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500, headers: h });

  const uid = await uidFromAccessToken(bearerOf(request));
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401, headers: h });

  // --- 살 수 있는 상태인가 -------------------------------------------------
  const pRes = await sbFetch(`profiles?id=eq.${uid}&select=credits_used`);
  if (!pRes.ok) return Response.json({ error: "lookup_failed" }, { status: 500, headers: h });
  const used = ((await pRes.json()) as { credits_used: number }[])[0]?.credits_used ?? 0;
  if (used < CREDITS) {
    return Response.json({ error: "nothing_to_restore", used }, { status: 409, headers: h });
  }

  // --- 결제 수단 -----------------------------------------------------------
  // 🔴구독자의 빌링키로 바로 긁는다. 결제창을 다시 띄우지 않아도 되고, 카드가
  //   이미 검증돼 있다. 구독이 없으면 빌링키가 없으므로 팔 수 없다.
  const sRes = await sbFetch(
    `subscriptions?user_id=eq.${uid}&status=eq.active&select=billing_key,channel,currency&limit=1`,
  );
  if (!sRes.ok) return Response.json({ error: "lookup_failed" }, { status: 500, headers: h });
  const sub = ((await sRes.json()) as {
    billing_key: string; channel: Channel; currency: "USD" | "KRW";
  }[])[0];
  if (!sub?.billing_key) {
    return Response.json({ error: "no_billing_key" }, { status: 409, headers: h });
  }

  // 구독과 같은 통화로 청구한다. 국내(KRW)에만 부가세가 붙는다.
  const isKrw = sub.currency === "KRW";
  let amount: number;
  if (isKrw) {
    let rate = 1500;
    try {
      const r = await fetch(`${new URL(request.url).origin}/api/exchange-rate`, { cache: "no-store" });
      if (r.ok) rate = ((await r.json()) as { rate?: number }).rate ?? 1500;
    } catch { /* 기본값 */ }
    amount = Math.round(PRICE_USD * (1 + VAT) * rate);
  } else {
    amount = Math.round(PRICE_USD * 100);
  }

  // 🔴이번 달 몇 번째 구매인지로 id를 만든다. used를 쓰면 "10회 남았을 때 샀다가
  //   더 쓰고 다시 10회에서 사는" 경우에 같은 id가 나와 포트원이 거절한다.
  const ym = new Date().toISOString().slice(0, 7);
  const seq = await sbFetch(
    `billing_events?user_id=eq.${uid}&status=eq.paid` +
    `&payment_id=like.credits-*-${ym}-*&select=id`,
  );
  const nth = seq.ok ? ((await seq.json()) as unknown[]).length + 1 : 1;
  const paymentId = `credits-${customerIdOf(uid)}-${ym}-${nth}`;
  const charge = await chargeWithBillingKey({
    paymentId,
    billingKey: sub.billing_key,
    channel: sub.channel,
    // 🔴이 값은 포트원 결제창 상품명·카드 명세서·영수증에 그대로 남는다.
    //   해외(USD) 결제자에게 한글로 청구되지 않도록 통화로 가른다.
    orderName: isKrw ? `archiMap 크레딧 ${CREDITS}회` : `archiMap credits ×${CREDITS}`,
    amount,
    currency: sub.currency,
    customerId: customerIdOf(uid),
    email: await emailOf(uid),
  });

  await sbFetch("billing_events", {
    method: "POST",
    body: JSON.stringify({
      user_id: uid, payment_id: paymentId, kind: "charge",
      status: charge.ok ? "paid" : "failed",
      amount, currency: sub.currency, raw: charge.raw ?? null,
    }),
    prefer: "return=minimal",
  });

  if (!charge.ok) {
    // 🔴원인(detail)은 서버 로그에만 남긴다 — 여긴 세션 행이 없어 note 칼럼이 없다.
    //   응답 message는 손님이 읽는 줄이라 Payment failed 한 줄뿐이다.
    console.error("[credits] 크레딧 청구 실패:", paymentId, uid, charge.detail);
    return Response.json({ error: "charge_failed", message: charge.message }, { status: 402, headers: h });
  }

  // --- 차감 ---------------------------------------------------------------
  // 🔴credits_used=gte.3 조건을 함께 건다. 그 사이 다른 요청이 이미 내렸다면
  //   이 PATCH는 0행을 고치고 지나간다(음수 방지).
  const upd = await sbFetch(`profiles?id=eq.${uid}&credits_used=gte.${CREDITS}`, {
    method: "PATCH",
    body: JSON.stringify({ credits_used: used - CREDITS }),
    prefer: "return=representation",
  });
  if (!upd.ok) {
    console.error("[credits] 결제는 됐으나 차감 실패:", paymentId, await upd.text());
    return Response.json({ error: "grant_failed", paymentId }, { status: 500, headers: h });
  }

  const after = ((await upd.json()) as { credits_used: number }[])[0]?.credits_used ?? used;
  return Response.json({ ok: true, credits: CREDITS, creditsUsed: after, amount, currency: sub.currency }, { headers: h });
}
