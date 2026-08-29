import {
  CENTRAL, sbFetch, emailOf, planAmount, priceOf, productOf, hasActiveBundle,
  PLAN_LABEL, vatOf, monthlyPaymentId, ymOf, channelOf, type PlanKey, type Channel,
} from "@/lib/subscription";

// ==========================================================================
//  GET /api/subscribe/session?sid=…
//
//  결제 페이지가 "누가 무엇을 사려는가"를 알아내는 유일한 경로.
//  🔴로그인 토큰·이메일을 URL로 받지 않는 이유가 여기 있다 — 앱이 자기 세션으로
//    checkout_sessions 행을 만들고 랜덤 sid만 넘기면, 신원 조회는 서버가
//    service_role로 한다. 주소창·리퍼러·브라우저 기록에 아무것도 안 남는다.
//  🔴제품도 세션 행에서 읽는다. 쿼리로 받으면 사용자가 바꿔 넣을 수 있다.
// ==========================================================================

type SessionRow = {
  id: string;
  user_id: string;
  product: string;
  plan: PlanKey;
  status: string;
  expires_at: string;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const sid = url.searchParams.get("sid");

  if (!sid) return Response.json({ error: "bad_request" }, { status: 400 });
  if (!CENTRAL.serviceKey) {
    console.error("[subscribe] ARCHIMAP_SUPABASE_SERVICE_KEY 가 환경변수에 없습니다");
    return Response.json({ error: "server_misconfigured" }, { status: 500 });
  }

  // 1) 세션 행
  const sRes = await sbFetch(`checkout_sessions?id=eq.${encodeURIComponent(sid)}&select=*`);
  if (!sRes.ok) {
    console.error("[subscribe] 세션 조회 실패:", sRes.status, await sRes.text());
    return Response.json({ error: "lookup_failed" }, { status: 500 });
  }
  const s = ((await sRes.json()) as SessionRow[])[0];
  if (!s) return Response.json({ error: "not_found" }, { status: 404 });
  if (s.status !== "pending") return Response.json({ error: "already_used" }, { status: 409 });
  if (new Date(s.expires_at).getTime() < Date.now()) {
    return Response.json({ error: "expired" }, { status: 410 });
  }

  const prod = productOf(s.product);
  // 🔴가격이 없는 조합은 팔지 않는 것이다(예: 가격 미정인 번들). 결제창을 띄우지 않는다.
  if (!prod || priceOf(s.product, s.plan) == null) {
    return Response.json({ error: "not_for_sale" }, { status: 409 });
  }
  // 이미 전체 구독 중이면 개별 구독 화면을 아예 열지 않는다(confirm에도 같은 관문이 있다).
  if (s.product !== "all" && (await hasActiveBundle(s.user_id))) {
    return Response.json({ error: "bundle_active" }, { status: 409 });
  }

  // 2) 이메일 — profiles에는 없다. auth 스키마는 REST로 못 읽으므로 Admin API를 쓴다.
  const email = await emailOf(s.user_id);

  // 3) 국가 → 채널. 🔴profiles.country가 있으면 그게 기준이다(ISO alpha-2, "KR").
  //    ⚠️2026-08-18부터 가입 폼에서 거주 지역을 묻지 않는다 — 그래서 첫 결제를
  //      마치기 전까지 country는 비어 있다. 그동안은 해외(달러)로 두고, 실제
  //      기본값은 결제 화면이 화면 언어로 고른다(countryKnown=false로 알려 준다).
  //      🔴서버가 언어로 추정하지 않는다 — Accept-Language는 브라우저 설정이라
  //        사이트에서 고른 언어와 어긋난다.
  //    🔴첫 결제가 끝나면 confirm이 이 칸을 채운다(countryOfPayment) — 두 번째
  //      결제부터는 추측이 아니라 지난 결제가 알려 준 국가로 통화가 정해진다.
  let country: string | null = null;
  const pRes = await sbFetch(`profiles?id=eq.${s.user_id}&select=country`);
  if (pRes.ok) country = ((await pRes.json()) as { country?: string }[])[0]?.country ?? null;

  const channel: Channel = channelOf(country);

  // 4) 환율 — 국내 청구는 KRW라 환산이 필요하다.
  //    🔴가입 시점 환율로 고정한다. 매달 다시 환산하면 청구액이 달마다 달라져
  //      "구독료가 왜 바뀌었냐"는 문의가 된다.
  let krwRate = 1500;
  try {
    const r = await fetch(`${url.origin}/api/exchange-rate`, { cache: "no-store" });
    if (r.ok) krwRate = ((await r.json()) as { rate?: number }).rate ?? 1500;
  } catch { /* 기본값 유지 */ }

  const base = priceOf(s.product, s.plan)!;
  const money = planAmount(s.product, s.plan, channel, krwRate)!;
  const vat = vatOf(s.product, s.plan, channel, krwRate)!;

  return Response.json({
    product: s.product,
    productLabel: prod.label,
    plan: s.plan,
    planLabel: PLAN_LABEL[s.plan],
    email,
    country,
    countryKnown: country != null,
    channel,
    krwRate,
    baseUsd: base,
    // 🔴해외는 영세율이라 0이 온다. 결제 페이지는 0이면 부가세 줄을 아예 숨긴다.
    //   🔴금액은 **청구 통화** 그대로다(2026-08-26) — 화면이 money()로 그린다.
    vat: vat.amount,
    vatCurrency: vat.currency,
    ...money,
    // 🔴해외(엑심베이)는 빌링키 발급과 첫 결제가 한 번에 일어나므로 결제 ID가
    //   결제창 호출 시점에 필요하다. 화면이 만들게 두면 남의 결제 ID를 넣어
    //   구독을 가로챌 수 있으니 **서버가 정해서 내려준다**. confirm은 이 값을
    //   받아 쓰는 게 아니라 같은 규칙으로 다시 계산해 대조한다.
    paymentId: monthlyPaymentId(s.product, s.user_id, ymOf(new Date())),
  });
}
