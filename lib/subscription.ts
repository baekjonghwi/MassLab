// ==========================================================================
//  구독 결제(포트원 빌링키) 공용 설정 — /subscribe 페이지와 API 라우트가 공유.
//
//  🔴계정·구독은 중앙 한 곳(CENTRAL)에 모인다. masslabs-archi.com 아래 프로그램이
//    여러 개가 되어도 로그인과 "무엇을 쓸 수 있나"는 여기 하나가 답한다.
//    그래야 '전체 구독'이 성립한다(앱마다 계정이 따로면 원리적으로 불가능).
//    앱 고유 데이터는 각 앱 DB에 그대로 둔다 — 옮기지 않는다.
//
//  🔴제품을 하나 늘리는 일 = CATALOG에 항목 하나. 페이지·API·크론은 그대로다.
//
//  ⚠️단건 결제(/payment)와는 완전히 별개 흐름이다. 그쪽은 로그인이 없어 이메일을
//    직접 입력받지만, 구독은 로그인이 필수라 이메일을 물어보지 않는다.
// ==========================================================================

// 포트원 상점·채널. /payment와 같은 상점을 쓴다(계약이 사업자 단위라 공유된다).
export const PORTONE_STORE_ID = "store-ad54a018-057e-4d48-b98f-920b6d0fa05c";
//  - 해외: 엑심베이. PayPal이 개통되면 이 채널의 결제수단으로 함께 뜬다.
//  - 국내: 갤럭시아머니트리. 🔴빌링키는 카드만 되고 통화는 KRW 전용이다.
export const CHANNEL_EXIMBAY = "channel-key-796e8cff-cddb-4731-a364-910163f64bcb";
export const CHANNEL_GALAXIA = "channel-key-d725a6f3-ff5a-40ab-8f01-9f6b363f15db";

export const PORTONE_API = "https://api.portone.io";

export type PlanKey = "plus" | "pro" | "max" | "all";
export type Channel = "eximbay" | "galaxia";

export const VAT_RATE = 0.1;

// --------------------------------------------------------------------------
//  중앙 원장 — MassLabs 계정·구독
// --------------------------------------------------------------------------
// ⚠️환경변수 이름이 둘로 갈려 있다 — 원래 다른 프로젝트였던 흔적이다.
//   지금은 한 프로젝트이므로 둘 중 아무거나 있으면 쓴다. 배포 순서에 안 걸리게.
export const CENTRAL = {
  supabaseUrl: process.env.ARCHIMAP_SUPABASE_URL ?? "https://tnadzbzvqwoxdghnesrl.supabase.co",
  serviceKey:
    process.env.ARCHIMAP_SUPABASE_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    "",
};

// --------------------------------------------------------------------------
//  제품 목록
//
//  plans = 그 제품이 파는 등급과 표시가(USD, 월). 🔴VAT 별도다 — 실제 청구액엔
//  10%가 붙는다(2026-08-07 사용자 결정).
//
//  🔴'all' = 전체 구독(번들). 사면 모든 제품이 최상위 등급으로 열린다
//    (판정은 DB의 plan_for 함수 한 곳에서만 한다).
//    ⚠️번들 가격이 아직 안 정해졌다 → price가 null이면 판매하지 않는다.
//      값을 넣는 순간 팔리기 시작하므로, 정할 때까지 비워 둔다.
// --------------------------------------------------------------------------
export type ProductDef = {
  key: string;
  label: string;
  returnOrigin: string;                       // 결제 후 돌아갈 앱
  plans: Partial<Record<PlanKey, number | null>>;
};

// 🔴2026-08-18 변경: 제품별 구독을 없앴다. MassLabs 구독 하나(plus/pro/max)가
//   모든 프로그램을 덮는다. Archimap만, LaserFish만 따로 파는 상품은 없다.
//
//   등급이 올라가면 프로그램이 늘어나는 게 아니라 "각 프로그램 안에서 한도가
//   올라간다"(Archimap 최대 직경·크레딧 등). LaserFish처럼 한도 개념이 없는
//   프로그램은 유료 등급이면 전부 열린다.
//
//   ⚠️제품을 추가해도 여기는 손대지 않는다. 새 프로그램은 자기 앱에서
//     my_plan()으로 등급만 읽어 자기 한도를 해석하면 된다.
export const CATALOG: Record<string, ProductDef> = {
  all: {
    key: "all",
    label: "MassLabs",
    returnOrigin: "https://masslabs-archi.com",
    plans: { plus: 4.99, pro: 6.99, max: 9.99 },
  },
};

// 구독 상품은 하나뿐이다. 결제를 시작하는 쪽은 이 값을 쓴다.
export const SUBSCRIPTION_PRODUCT = "all";

export const PLAN_LABEL: Record<PlanKey, string> = {
  plus: "PLUS", pro: "PRO", max: "MAX", all: "ALL",
};

export function productOf(key: string | null | undefined): ProductDef | null {
  if (!key) return null;
  return CATALOG[key] ?? null;
}

// 그 제품이 그 등급을 실제로 팔고 있는가. 값이 없으면(null) 팔지 않는다.
export function priceOf(productKey: string, plan: PlanKey): number | null {
  const p = CATALOG[productKey];
  if (!p) return null;
  const v = p.plans[plan];
  return typeof v === "number" ? v : null;
}

// --------------------------------------------------------------------------
//  Supabase REST — 라이브러리를 안 쓰고 fetch로 직접 부른다(/api/submit-review와 동일).
// --------------------------------------------------------------------------
export async function sbFetch(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<Response> {
  const { prefer, ...rest } = init;
  return fetch(`${CENTRAL.supabaseUrl}/rest/v1/${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${CENTRAL.serviceKey}`,
      apikey: CENTRAL.serviceKey,
      "Content-Type": "application/json",
      ...(prefer ? { Prefer: prefer } : {}),
      ...(rest.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function emailOf(uid: string): Promise<string> {
  const r = await fetch(`${CENTRAL.supabaseUrl}/auth/v1/admin/users/${uid}`, {
    headers: { Authorization: `Bearer ${CENTRAL.serviceKey}`, apikey: CENTRAL.serviceKey },
    cache: "no-store",
  });
  if (!r.ok) return "";
  return ((await r.json()) as { email?: string }).email ?? "";
}

// 🔴profiles.plan은 이제 "캐시"다 — 원장은 subscriptions이고, Archi_map이 지금
//   그대로 읽을 수 있도록 결제 서버가 계산해 넣어 준다. 구독이 바뀔 때마다 부를 것.
//   ⚠️앞으로 만들 앱은 profiles.plan 대신 my_plan(product) RPC를 볼 것.
export async function syncPlanCache(uid: string): Promise<string> {
  const r = await sbFetch("rpc/plan_for", {
    method: "POST",
    body: JSON.stringify({ p_user: uid, p_product: "archimap" }),
  });
  const plan = r.ok ? ((await r.json()) as string) : "free";
  // 🔴plan=neq.admin — 운영자 계정을 덮어쓰지 않는다. admin은 plan_for가 'max'를
  //   돌려주므로, 필터가 없으면 여기서 'max'로 바뀌어 운영자 표시가 영영 사라진다.
  await sbFetch(`profiles?id=eq.${uid}&plan=neq.admin`, {
    method: "PATCH",
    body: JSON.stringify({ plan }),
    prefer: "return=minimal",
  });
  return plan;
}

// 🔴번들이 살아 있나. 개별 구독을 팔기 전에 반드시 본다 — 이미 전체 구독 중인
//   사람에게 개별 구독을 또 팔면 같은 권한에 돈을 두 번 받는 것이 된다.
export async function hasActiveBundle(uid: string): Promise<boolean> {
  const r = await sbFetch(
    `subscriptions?user_id=eq.${uid}&product=eq.all&select=status,canceled_at`,
  );
  if (!r.ok) return false;
  const rows = (await r.json()) as { status: string; canceled_at: string | null }[];
  return rows.some(
    (x) => x.status === "active" ||
      (x.status === "canceled" && x.canceled_at != null && new Date(x.canceled_at) > new Date()),
  );
}

export async function deleteBillingKey(billingKey: string): Promise<void> {
  const secret = process.env.PORTONE_SECRET_KEY?.trim();
  if (!secret || !billingKey) return;
  try {
    const r = await fetch(`${PORTONE_API}/billing-keys/${encodeURIComponent(billingKey)}`, {
      method: "DELETE",
      headers: { Authorization: `PortOne ${secret}` },
      cache: "no-store",
    });
    if (!r.ok) console.error("[billing] 빌링키 삭제 실패:", r.status, await r.text());
  } catch (e) {
    console.error("[billing] 빌링키 삭제 예외:", e);
  }
}

// 🔴번들을 산 순간 개별 구독을 즉시 끊는다(2026-08-07 사용자 결정).
//   안 끊으면 번들과 개별이 나란히 청구되어 같은 권한에 돈이 두 번 나간다.
//   ⚠️일할 환불은 하지 않는다 — 번들이 상위 등급으로 덮으므로 기능 손해는 없다.
//     이 사실은 결제 페이지에 미리 밝힌다.
export async function cancelIndividualSubs(uid: string): Promise<string[]> {
  const r = await sbFetch(
    `subscriptions?user_id=eq.${uid}&product=neq.all&status=eq.active&select=product,billing_key`,
  );
  if (!r.ok) return [];
  const rows = (await r.json()) as { product: string; billing_key: string }[];
  const now = new Date().toISOString();
  for (const row of rows) {
    await sbFetch(`subscriptions?user_id=eq.${uid}&product=eq.${row.product}`, {
      method: "PATCH",
      body: JSON.stringify({ status: "canceled", canceled_at: now, updated_at: now }),
      prefer: "return=minimal",
    });
    await deleteBillingKey(row.billing_key);
  }
  return rows.map((x) => x.product);
}

// --------------------------------------------------------------------------
//  금액
// --------------------------------------------------------------------------
export type Money = { amount: number; currency: "USD" | "KRW" };

// 🔴포트원에 넘기는 금액은 "최소 단위 정수"다 — USD는 센트, KRW는 원.
//   소수점을 그대로 넘기면 통화마다 해석이 갈린다.
//
// 🔴부가세는 국내(KRW)에만 붙는다. 국외 제공 용역은 영세율(0%)이라 해외(USD)에는
//   받을 근거가 없다(2026-08-17 확인: 개인 일반과세자).
//   ⚠️표시가는 둘 다 $4.99지만 실청구는 해외 $4.99 / 국내 $4.99×1.1×환율로 갈린다.
//     국내가 더 비싼 것이 정상이다 — 부가세를 손님이 얹어 내는 구조로 정했다.
//   ⚠️원화 고정가(6900/7590)는 폐지됐다. 기준가는 언제나 USD이고 KRW는 환산값이다.
export function planAmount(
  productKey: string, plan: PlanKey, channel: Channel, krwRate: number,
): Money | null {
  const base = priceOf(productKey, plan);
  if (base == null) return null;             // 팔지 않는 조합
  if (channel === "galaxia") {
    // 갤럭시아는 KRW 전용이라 가입 시점 환율로 환산한다. 여기에만 부가세가 붙는다.
    return { amount: Math.round(base * (1 + VAT_RATE) * krwRate), currency: "KRW" };
  }
  return { amount: Math.round(base * 100), currency: "USD" };
}

// 그 채널에서 실제로 걷는 부가세(USD 기준). 해외는 영세율이라 늘 0이다.
export function vatOf(base: number, channel: Channel): number {
  return channel === "galaxia" ? +(base * VAT_RATE).toFixed(2) : 0;
}

// --------------------------------------------------------------------------
//  식별자
// --------------------------------------------------------------------------
// 🔴갤럭시아는 customerId가 최대 20자인데 Supabase uid는 36자 UUID다.
//   하이픈을 떼고 앞 20자만 쓴다 — 결정론적이고(같은 사용자면 늘 같은 값)
//   20 hex = 80비트라 충돌은 실질적으로 없다.
export function customerIdOf(uid: string): string {
  return uid.replace(/-/g, "").slice(0, 20);
}

// 청구 1건의 id. 🔴'제품-사용자-YYYY-MM'이 이중청구 방지의 핵심이다 — 같은 달에
//   두 번 청구하려 하면 포트원이 "이미 있는 paymentId"로 거절한다.
//   ⚠️재시도는 꼬리표를 붙인다 — 실패한 paymentId를 그대로 다시 쓰면 포트원이
//     거부하고 billing_events의 unique에도 걸린다.
export function monthlyPaymentId(
  productKey: string, uid: string, ym: string, retry = 0,
): string {
  const base = `${productKey}-${customerIdOf(uid)}-${ym}`;
  return retry > 0 ? `${base}-r${retry + 1}` : base;
}

export function ymOf(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

// 다음 청구일 = 한 달 뒤 같은 날.
// 🔴말일 보정이 필요하다 — 1월 31일에 가입하면 2월 31일은 없다. 그대로 두면
//   JS Date가 3월 3일로 넘겨 버려 결제일이 매달 앞으로 밀린다. 말일로 자른다.
export function addMonth(from: Date): Date {
  const d = new Date(from.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + 1);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, last));
  return d;
}

// --------------------------------------------------------------------------
//  포트원 빌링키 청구
// --------------------------------------------------------------------------
export type ChargeArgs = {
  paymentId: string;
  billingKey: string;
  channel: Channel;
  orderName: string;
  amount: number;
  currency: "USD" | "KRW";
  customerId: string;
  email: string;
};

export type ChargeResult =
  | { ok: true; alreadyDone?: boolean; raw: unknown }
  | { ok: false; code?: string; message: string; raw: unknown };

export async function chargeWithBillingKey(a: ChargeArgs): Promise<ChargeResult> {
  const secret = process.env.PORTONE_SECRET_KEY?.trim();
  if (!secret) return { ok: false, message: "PORTONE_SECRET_KEY 없음", raw: null };

  const res = await fetch(
    `${PORTONE_API}/payments/${encodeURIComponent(a.paymentId)}/billing-key`,
    {
      method: "POST",
      headers: { Authorization: `PortOne ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        billingKey: a.billingKey,
        storeId: PORTONE_STORE_ID,
        channelKey: a.channel === "galaxia" ? CHANNEL_GALAXIA : CHANNEL_EXIMBAY,
        orderName: a.orderName,
        customer: { customerId: a.customerId, email: a.email },
        amount: { total: a.amount },
        currency: a.currency,
      }),
      cache: "no-store",
    },
  );

  const raw: unknown = await res.json().catch(() => null);
  if (res.ok) return { ok: true, raw };

  // 🔴같은 paymentId가 이미 있으면 "이미 청구했다"는 뜻이므로 성공으로 친다.
  //   실패로 처리하면 크론이 매일 재시도하며 영원히 실패 로그를 쌓는다.
  const code = (raw as { type?: string })?.type ?? "";
  if (res.status === 409 || /ALREADY_PAID|PAYMENT_ALREADY/i.test(code)) {
    return { ok: true, alreadyDone: true, raw };
  }
  return {
    ok: false,
    code,
    message: (raw as { message?: string })?.message ?? `포트원 ${res.status}`,
    raw,
  };
}
