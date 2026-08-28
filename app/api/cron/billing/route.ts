import {
  CENTRAL, sbFetch, emailOf, syncPlanCache, productOf, chargeWithBillingKey,
  customerIdOf, monthlyPaymentId, ymOf, addMonth, PLAN_LABEL,
  type PlanKey, type Channel,
} from "@/lib/subscription";

// ==========================================================================
//  GET /api/cron/billing — 매일 도는 정기 청구(Vercel Cron).
//
//  하는 일 두 가지
//   ① status='active' 이고 next_billing_at이 지난 구독을 청구한다.
//   ② status='canceled' 이고 canceled_at이 지난 구독을 정리한다
//      (해지해도 이미 낸 달은 끝까지 쓰게 하는 정책).
//
//  🔴제품 구분 없이 한 표를 훑는다 — 개별 구독이든 번들이든 같은 규칙이다.
//    권한은 DB의 plan_for가 판정하므로 여기서는 캐시만 다시 계산해 준다.
//  🔴날짜가 아니라 "지났는가"로 고른다. 크론이 하루 걸러 실패해도 다음 날
//    그대로 집혀 청구가 건너뛰어지지 않는다.
//  🔴이중 청구는 paymentId가 막는다(제품-사용자-YYYY-MM). 크론이 두 번 돌아도
//    포트원이 같은 id를 거절하고, 그 거절을 성공으로 해석한다.
// ==========================================================================

export const dynamic = "force-dynamic";
export const maxDuration = 300;

// 실패하면 하루 간격으로 다시 시도하고, 이 횟수를 넘기면 연체로 확정한다.
const MAX_RETRY = 3;

type SubRow = {
  user_id: string;
  product: string;
  plan: PlanKey;
  status: string;
  billing_key: string;
  channel: Channel;
  currency: "USD" | "KRW";
  amount: number;
  next_billing_at: string;
  retry_count: number;
};

async function patchSub(uid: string, product: string, body: Record<string, unknown>) {
  await sbFetch(`subscriptions?user_id=eq.${uid}&product=eq.${product}`, {
    method: "PATCH",
    body: JSON.stringify({ ...body, updated_at: new Date().toISOString() }),
    prefer: "return=minimal",
  });
}

export async function GET(request: Request) {
  // 🔴Vercel Cron은 CRON_SECRET이 설정돼 있으면 Bearer로 실어 보낸다.
  //   없으면 이 주소가 그냥 열린 청구 트리거가 되므로 반드시 막는다.
  //
  //  🔴변수가 **없을 때도 거부한다.** 예전에는 `if (secret && …)` 이라 변수를
  //    안 넣으면 검사를 통째로 건너뛰었다 — 즉 아무나 이 주소를 열어 전 회원
  //    청구를 돌릴 수 있었다. "설정을 깜빡하면 열린다"는 잠금은 잠금이 아니다.
  //    ⚠️그래서 Vercel 프로젝트에 CRON_SECRET이 없으면 크론도 함께 멈춘다.
  //      구독을 열기 전에 반드시 넣을 것(없으면 청구가 아예 안 돈다).
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("[cron/billing] CRON_SECRET이 없다 — 청구를 돌리지 않는다.");
    return Response.json({ error: "server_misconfigured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  const now = new Date();
  const nowIso = now.toISOString();
  const out: Record<string, unknown>[] = [];

  // ---- ② 해지 유예 종료 ---------------------------------------------------
  const cRes = await sbFetch(
    `subscriptions?status=eq.canceled&canceled_at=lte.${nowIso}&select=user_id,product`,
  );
  if (cRes.ok) {
    for (const row of (await cRes.json()) as { user_id: string; product: string }[]) {
      await patchSub(row.user_id, row.product, { canceled_at: null, next_billing_at: null });
      // 캐시를 다시 계산한다 — 다른 제품이나 번들이 남아 있으면 등급이 유지된다.
      const plan = await syncPlanCache(row.user_id);
      out.push({ user: row.user_id, product: row.product, action: "expired", plan });
    }
  }

  // ---- ① 청구 ------------------------------------------------------------
  // 🔴active만 집는다. 첫 달은 confirm이 이미 받았으므로 여기 오는 건
  //   두 번째 달부터다.
  const dRes = await sbFetch(
    `subscriptions?status=eq.active&next_billing_at=lte.${nowIso}&select=*`,
  );
  if (!dRes.ok) {
    console.error("[cron] 대상 조회 실패:", await dRes.text());
    return Response.json({ error: "lookup_failed" }, { status: 500 });
  }

  for (const s of (await dRes.json()) as SubRow[]) {
    const prod = productOf(s.product);
    const paymentId = monthlyPaymentId(s.product, s.user_id, ymOf(now), s.retry_count);
    const email = await emailOf(s.user_id);

    const charge = await chargeWithBillingKey({
      paymentId,
      billingKey: s.billing_key,
      channel: s.channel,
      orderName: `${prod?.label ?? s.product} ${PLAN_LABEL[s.plan]}`,
      amount: s.amount,
      currency: s.currency,
      customerId: customerIdOf(s.user_id),
      email,
    });

    await sbFetch("billing_events", {
      method: "POST",
      body: JSON.stringify({
        user_id: s.user_id, payment_id: paymentId, kind: "charge",
        status: charge.ok ? "paid" : "failed",
        amount: s.amount, currency: s.currency, raw: charge.raw ?? null,
      }),
      prefer: "return=minimal",
    });

    if (charge.ok) {
      // 🔴다음 청구일은 "지금"이 아니라 "직전 청구 예정일"에서 한 달 더한다.
      //   지금 기준으로 잡으면 크론이 늦게 돈 만큼 결제일이 매달 뒤로 밀린다.
      await patchSub(s.user_id, s.product, {
        next_billing_at: addMonth(new Date(s.next_billing_at)).toISOString(),
        retry_count: 0,
        status: "active",
      });
      out.push({ user: s.user_id, product: s.product, action: "charged", paymentId });
      continue;
    }

    // 🔴여기 실리는 건 charge.detail(운영자용 원인)이다. charge.message는 손님용
    //   "Payment failed" 한 줄이라 크론 출력에 쓰면 무엇이 틀렸는지 알 수가 없다.
    //   이 응답은 위에서 CRON_SECRET Bearer로 잠가 두었으므로 손님에게 안 나간다.
    const tries = s.retry_count + 1;
    if (tries >= MAX_RETRY) {
      // 세 번 실패 = 연체 확정. 크론 대상에서 빼고 권한을 다시 계산한다.
      await patchSub(s.user_id, s.product, { status: "past_due", retry_count: tries });
      const plan = await syncPlanCache(s.user_id);
      out.push({ user: s.user_id, product: s.product, action: "past_due", plan, message: charge.detail });
    } else {
      // 하루 뒤 다시 시도.
      const next = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      await patchSub(s.user_id, s.product, { next_billing_at: next.toISOString(), retry_count: tries });
      out.push({ user: s.user_id, product: s.product, action: "retry", tries, message: charge.detail });
    }
  }

  return Response.json({ ok: true, at: nowIso, results: out });
}
