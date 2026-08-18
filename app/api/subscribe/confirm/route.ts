import {
  CENTRAL, sbFetch, emailOf, syncPlanCache, planAmount, priceOf, productOf,
  chargeWithBillingKey, customerIdOf, monthlyPaymentId, ymOf, addMonth, PLAN_LABEL,
  hasActiveBundle, cancelIndividualSubs, addDays, TRIAL_DAYS,
  type PlanKey, type Channel,
} from "@/lib/subscription";

// ==========================================================================
//  POST /api/subscribe/confirm
//  { sid, billingKey, channel, methodLabel }
//
//  빌링키가 발급된 직후에 불린다. 하는 일 = ①첫 달 청구 ②빌링키 저장
//  ③권한 캐시 갱신 ④세션 닫기.
//
//  🔴금액도 제품도 클라이언트에서 받지 않는다. sid로 세션 행을 읽어 서버가
//    다시 계산한다(브라우저가 보낸 숫자를 믿으면 $0.01 구독이 만들어진다).
//
//  🔴체험(session.trial)이면 ①을 통째로 건너뛴다 — 카드만 등록하고 첫 청구는
//    TRIAL_DAYS 뒤로 미룬다. 체험 여부도 클라이언트가 아니라 세션 행에서 읽는다.
//  ⚠️체험 가입은 승인이 아니라 빌링키 발급만 일어난다. 카드가 실제로 결제 가능한지는
//    7일 뒤 첫 청구에서야 드러난다 — 크론의 재시도 3회가 그걸 받아낸다.
// ==========================================================================

type SessionRow = {
  id: string; user_id: string; product: string; plan: PlanKey;
  status: string; expires_at: string; trial: boolean;
};

async function closeSession(sid: string, status: string, note?: string) {
  await sbFetch(`checkout_sessions?id=eq.${encodeURIComponent(sid)}`, {
    method: "PATCH",
    body: JSON.stringify({ status, note: note ?? null }),
    prefer: "return=minimal",
  });
}

export async function POST(request: Request) {
  let body: { sid?: string; billingKey?: string; channel?: Channel; methodLabel?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "bad_json" }, { status: 400 }); }

  const { sid, billingKey, methodLabel } = body;
  const channel: Channel = body.channel === "galaxia" ? "galaxia" : "eximbay";

  if (!sid || !billingKey) return Response.json({ error: "bad_request" }, { status: 400 });
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  // --- 세션 확인 ---------------------------------------------------------
  const sRes = await sbFetch(`checkout_sessions?id=eq.${encodeURIComponent(sid)}&select=*`);
  if (!sRes.ok) return Response.json({ error: "lookup_failed" }, { status: 500 });
  const s = ((await sRes.json()) as SessionRow[])[0];
  if (!s) return Response.json({ error: "not_found" }, { status: 404 });
  if (s.status !== "pending") return Response.json({ error: "already_used" }, { status: 409 });
  if (new Date(s.expires_at).getTime() < Date.now()) {
    return Response.json({ error: "expired" }, { status: 410 });
  }

  const prod = productOf(s.product);
  if (!prod || priceOf(s.product, s.plan) == null) {
    return Response.json({ error: "not_for_sale" }, { status: 409 });
  }
  // 🔴반드시 청구 '전에' 막는다 — 돈이 빠진 뒤에 알면 환불 처리가 된다.
  //   이미 전체 구독 중인 사람에게 개별 구독을 또 팔면 같은 권한에 이중 과금이다.
  if (s.product !== "all" && (await hasActiveBundle(s.user_id))) {
    await closeSession(sid, "failed", "이미 전체 구독 중");
    return Response.json({ error: "bundle_active" }, { status: 409 });
  }

  // --- 이메일·환율 -------------------------------------------------------
  const email = await emailOf(s.user_id);

  let krwRate = 1500;
  try {
    const r = await fetch(`${new URL(request.url).origin}/api/exchange-rate`, { cache: "no-store" });
    if (r.ok) krwRate = ((await r.json()) as { rate?: number }).rate ?? 1500;
  } catch { /* 기본값 */ }

  const money = planAmount(s.product, s.plan, channel, krwRate)!;
  const now = new Date();
  const paymentId = monthlyPaymentId(s.product, s.user_id, ymOf(now));

  // 체험이면 첫 청구가 7일 뒤, 아니면 지금 결제하고 한 달 뒤.
  const trial = s.trial === true;
  const nextBillingAt = trial ? addDays(now, TRIAL_DAYS) : addMonth(now);

  // --- 첫 달 청구 (체험이면 건너뛴다) -------------------------------------
  if (!trial) {
    const charge = await chargeWithBillingKey({
      paymentId,
      billingKey,
      channel,
      orderName: `${prod.label} ${PLAN_LABEL[s.plan]}`,
      amount: money.amount,
      currency: money.currency,
      customerId: customerIdOf(s.user_id),
      email,
    });

    await sbFetch("billing_events", {
      method: "POST",
      body: JSON.stringify({
        user_id: s.user_id, payment_id: paymentId, kind: "charge",
        status: charge.ok ? "paid" : "failed",
        amount: money.amount, currency: money.currency, raw: charge.raw ?? null,
      }),
      prefer: "return=minimal",
    });

    if (!charge.ok) {
      await closeSession(sid, "failed", charge.message);
      return Response.json({ error: "charge_failed", message: charge.message }, { status: 402 });
    }
  } else {
    // 돈은 안 움직였지만 "체험이 여기서 시작됐다"는 기록은 남긴다.
    // 나중에 "왜 7일간 청구가 없었냐"를 이 줄로 설명한다.
    await sbFetch("billing_events", {
      method: "POST",
      body: JSON.stringify({
        user_id: s.user_id, payment_id: `trial-${s.product}-${customerIdOf(s.user_id)}-${ymOf(now)}`,
        kind: "issue", status: "trial",
        amount: money.amount, currency: money.currency,
        raw: { trialDays: TRIAL_DAYS, firstChargeAt: nextBillingAt.toISOString() },
      }),
      prefer: "return=minimal",
    });
  }

  // --- 빌링키 보관 -------------------------------------------------------
  // 🔴충돌 기준이 (user_id, product)다 — 같은 제품을 다시 사면 덮어쓰고,
  //   다른 제품이나 번들은 별개 행으로 쌓인다.
  const subRes = await sbFetch("subscriptions?on_conflict=user_id,product", {
    method: "POST",
    body: JSON.stringify({
      user_id: s.user_id,
      product: s.product,
      plan: s.plan,
      // 🔴체험 중은 active가 아니라 trialing이다 — "아직 한 번도 청구되지 않았다"를
      //   상태로 남겨야 해지 시 환불 대상이 없다는 판단이 선다. 권한은 둘 다 열린다
      //   (plan_for가 active·trialing을 같이 본다).
      status: trial ? "trialing" : "active",
      billing_key: billingKey,
      channel,
      currency: money.currency,
      amount: money.amount,
      method_label: methodLabel ?? null,
      next_billing_at: nextBillingAt.toISOString(),
      canceled_at: null,
      retry_count: 0,
      updated_at: now.toISOString(),
    }),
    prefer: "resolution=merge-duplicates,return=minimal",
  });
  if (!subRes.ok) {
    // 🔴돈은 빠졌는데 저장이 실패한 상태다. 조용히 넘기면 다음 달 청구가 영영
    //   안 돌아 무료로 쓰게 된다 → 로그를 남기고 실패로 알린다(수동 복구 대상).
    console.error("[subscribe] 결제는 됐으나 구독 저장 실패:", await subRes.text(), paymentId);
    await closeSession(sid, "failed", "구독 저장 실패(결제는 완료). 문의 필요");
    return Response.json({ error: "save_failed", paymentId }, { status: 500 });
  }

  // --- 번들을 샀으면 개별 구독을 끊는다 -----------------------------------
  // 🔴안 끊으면 번들과 개별이 나란히 청구된다(같은 권한에 이중 과금).
  const dropped = s.product === "all" ? await cancelIndividualSubs(s.user_id) : [];

  // --- 권한 캐시 갱신 ----------------------------------------------------
  // 🔴번들을 샀으면 Archi_map 등급도 같이 올라간다 — 그 판정은 DB의 plan_for가 한다.
  const plan = await syncPlanCache(s.user_id);
  // 🔴체험권 소진은 여기서 딱 한 번 적는다. 해지해도 지우지 않는다 —
  //   지우면 가입·해지를 반복해 영원히 공짜로 쓸 수 있다.
  await sbFetch(`profiles?id=eq.${s.user_id}`, {
    method: "PATCH",
    body: JSON.stringify({
      plan_since: now.toISOString(),
      ...(trial ? { trial_used_at: now.toISOString() } : {}),
    }),
    prefer: "return=minimal",
  });

  await closeSession(sid, "done");

  return Response.json({
    ok: true,
    product: s.product,
    plan: s.plan,
    effectivePlan: plan,
    droppedProducts: dropped,
    // 체험이면 지금 빠진 돈은 0이다. 화면이 "결제 완료"가 아니라
    // "체험 시작"으로 말을 바꿔야 하므로 금액과 별개로 내려준다.
    trial,
    charged: trial ? 0 : money.amount,
    amount: money.amount,
    currency: money.currency,
    nextBillingAt: nextBillingAt.toISOString(),
  });
}
