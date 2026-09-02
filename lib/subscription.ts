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

// 포트원 상점. /payment와 같은 상점을 쓴다(계약이 사업자 단위라 공유된다).
export const PORTONE_STORE_ID = "store-ad54a018-057e-4d48-b98f-920b6d0fa05c";

// 🔴🔴정기결제 채널은 단건 채널과 **다른 것**이다. PG가 정기결제에 상점아이디(MID)를
//   따로 발급하고, 포트원 채널도 그 MID로 새로 만들어야 한다(2026-08-21 포트원 확인).
//   🔴화면 쪽에도 같은 상수가 있다(app/subscribe/page.tsx) — 한쪽만 고치지 말 것.
//     lib을 import하지 않는 이유는 이 파일이 서버 전용 키를 들고 있어서다.
//
//   🔴🔴국내(TOSS)·해외(INTL) **둘 다 지금은 죽은 값**이다. 배선은 다 돼 있지만 계약이 없다.
//     지우지 않은 이유는 되살릴 때 이 줄만 갈아끼우면 나머지가 따라오기 때문이다.
//
//   ⛔국내 = 토스페이먼츠 정기결제 채널. 2026-09-01 에 키를 받아 여기까지 붙였는데,
//     **2026-09-02 심사 중 해지했다**(사용자 결정 — 그 시점에 해지하면 33만원을 돌려받는다).
//     해지한 이유: ①토스로는 해외카드 정기결제가 안 된다 ②그런데 연회비가 따로 든다.
//     ⇒ 국내·해외를 한 번에 덮는 **MoR(Paddle·Creem 등)을 먼저 붙이고**, 한국 회원이
//       충분히 쌓이면(대략 1만 명 규모) 그때 국내 전용으로 토스를 다시 붙인다.
//       그날 하는 일 = 토스 **신규 신청**(취소하면 상점아이디를 재사용할 수 없어 MID·채널키가
//       새로 나온다) + 이 줄의 키 교체. 코드는 그대로 산다.
//       ⚠️신규 신청이라 가입비·심사가 다시 붙는다 — 지금 돌려받는 33만원은 그때 다시 낸다.
//     ⚠️단건결제(/payment)의 갤럭시아·카카오페이는 살아 있다 — 이 해지와 무관하다.
//
//   ⛔해외(INTL)는 애초에 **단건 채널 키**였다 — 자리만 잡아 둔 값이라 빌링키가 발급되지
//     않는다. 엑심베이 토큰빌링을 기다리는 대신 MoR로 가기로 방향을 틀었다(2026-09-02).
//     🔴MoR을 붙이는 날 이 파일이 크게 바뀐다 — 빌링키를 우리가 들고 매달 청구하는
//       구조가 아니라, 그쪽이 구독을 관리하고 webhook 으로 알려주는 구조다.
export const CHANNEL_BILLING_INTL = "channel-key-796e8cff-cddb-4731-a364-910163f64bcb";
export const CHANNEL_BILLING_TOSS = "channel-key-8ebc609c-5d56-429d-91f5-879c78abbf61";

export const PORTONE_API = "https://api.portone.io";

// 🔴등급 서열·프로그램별 문턱은 lib/plans에 있다(브라우저에서도 써야 해서 뗐다).
//   여기서 다시 내보내 주므로 서버 코드는 이 파일 하나만 import하면 된다.
export type { PlanKey } from "./plans";
export { PLAN_LABEL, MIN_PLAN, DEFAULT_MIN_PLAN, minPlanOf, planAllows } from "./plans";
import type { PlanKey } from "./plans";
import { USE_TEST_CHANNELS, TEST_CHANNEL_INTL, TEST_CHANNEL_KRW } from "./interim";

// 🔴이 값이 DB(subscriptions.channel)에 그대로 적힌다. 늘리거나 바꿀 때는 그 칸의
//   CHECK 제약도 함께 고칠 것 — supabase/migrations/007_toss_billing_channel.sql.
//   ⚠️'galaxia'는 2026-09-01에 없앴다(구독 국내 PG가 토스페이먼츠로 바뀌었다).
//     단건결제는 여전히 갤럭시아지만 그쪽은 이 타입을 쓰지 않는다.
export type Channel = "eximbay" | "toss";

// 채널 이름(DB에 남는 값) → 포트원 채널 키. 🔴PG를 바꾸거나 늘릴 때 여기 한 줄만
//   더하면 청구·발급이 함께 따라온다(분기를 코드 여기저기에 흩지 않는다).
export const BILLING_CHANNEL: Record<Channel, string> = {
  eximbay: USE_TEST_CHANNELS ? TEST_CHANNEL_INTL : CHANNEL_BILLING_INTL,
  toss: USE_TEST_CHANNELS ? TEST_CHANNEL_KRW : CHANNEL_BILLING_TOSS,
};

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
//   모든 프로그램을 덮는다. archiMap만, LaserFish만 따로 파는 상품은 없다.
//
//   등급이 올라가면 대개 "각 프로그램 안에서 한도가 올라간다"(archiMap 최대
//   직경·크레딧 등). 다만 프로그램마다 열리는 최소 등급이 다를 수 있다 —
//   LaserFish는 PRO부터다(아래 MIN_PLAN).
//
//   ⚠️제품을 추가해도 여기는 손대지 않는다. 새 프로그램은 자기 앱에서
//     my_plan()으로 등급만 읽어 자기 한도를 해석하면 된다.
export const CATALOG: Record<string, ProductDef> = {
  all: {
    key: "all",
    label: "MassLabs",
    returnOrigin: "https://masslabs-archi.com",
    plans: { plus: 4.99, pro: 9.90, max: 14.90 },
  },
};

// 구독 상품은 하나뿐이다. 결제를 시작하는 쪽은 이 값을 쓴다.
export const SUBSCRIPTION_PRODUCT = "all";


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
  if (channel === "toss") {
    // 토스페이먼츠는 KRW 전용이라 가입 시점 환율로 환산한다. 여기에만 부가세가 붙는다.
    return { amount: Math.round(base * (1 + VAT_RATE) * krwRate), currency: "KRW" };
  }
  return { amount: Math.round(base * 100), currency: "USD" };
}

// 그 채널에서 실제로 걷는 부가세 — **청구 통화 그대로** 돌려준다. 해외는 영세율이라 0.
// 🔴예전엔 USD로만 계산했다(vatUsd). 그래서 원화 결제자 화면에 구독료가 ₩로,
//   부가세가 $로 나란히 떴다(2026-08-26 고침). 청구는 원화인데 부가세만 달러면
//   손님이 영수증을 못 읽는다.
// 🔴총액에서 공급가액을 빼서 구한다. 부가세를 따로 반올림하면 공급가+부가세가
//   실제 청구액과 1원씩 어긋나 계산이 안 맞는다.
//   ⚠️여기 total 식은 planAmount 의 toss 갈래와 **반드시 같아야 한다** —
//     한쪽만 고치면 화면의 부가세가 실제 청구액과 어긋난다.
export function vatOf(
  productKey: string, plan: PlanKey, channel: Channel, krwRate: number,
): Money | null {
  const base = priceOf(productKey, plan);
  if (base == null) return null;                       // 팔지 않는 조합
  if (channel !== "toss") return { amount: 0, currency: "USD" };
  const total = Math.round(base * (1 + VAT_RATE) * krwRate);
  const supply = Math.round(base * krwRate);
  return { amount: total - supply, currency: "KRW" };
}

// --------------------------------------------------------------------------
//  식별자
// --------------------------------------------------------------------------
// 🔴국내 PG는 customerId를 20자까지만 받는데 Supabase uid는 36자 UUID다.
//   하이픈을 떼고 앞 20자만 쓴다 — 결정론적이고(같은 사용자면 늘 같은 값)
//   20 hex = 80비트라 충돌은 실질적으로 없다.
//   ⚠️갤럭시아에서 부딪힌 제한이다. 토스페이먼츠로 옮긴 뒤에도 그대로 짧게 둔다 —
//     늘려서 얻을 것이 없고, 늘리면 옛 빌링키의 customerId와 어긋난다.
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
//  거주 국가 (profiles.country)
// --------------------------------------------------------------------------
// 🔴형식은 ISO 3166-1 alpha-2 대문자 하나뿐이다("KR"·"US") — 포트원이 그 형식으로
//   주기 때문에 그대로 받아 적는다. 형식을 바꾸려면 아래 자리를 **모두** 함께 고칠 것.
//   · 적는 곳 = 가입 화면(/login → DB 가입 트리거) · /welcome · set_country RPC ·
//               /api/subscribe/confirm(비어 있을 때만)
//   · 읽는 곳 = /api/subscribe/session (channelOf)
//   · 모양 지킴이 = DB 트리거 profiles_norm_country (ISO2 가 아니면 null 로 떨어뜨린다)
// 🔴🔴**국가는 이제 가입할 때 받는다**(2026-09-02 결정 — 2026-08-18 의 "묻지 않는다"를
//   뒤집었다. 그전에는 결제한 적 없는 계정의 이 칸이 영영 비어 있었다: 623명 중 0명).
//   ⚠️그래도 비어 있을 수 있다 = 2026-09-02 이전에 가입한 사람 · /welcome 에서
//     [나중에 하기]로 지나간 사람. 그때는 예전처럼 결제 화면이 화면 언어로 고른다.
// 🔴결제가 알려 준 국가는 **비어 있을 때만** 적는다(confirm) — 본인이 고른 거주지를
//   결제 카드의 발급국으로 덮지 않는다.
export const KOREA = "KR";

// 국가 → 결제 채널. 국내만 토스페이먼츠고 나머지는 전부 엑심베이다.
export function channelOf(country: string | null | undefined): Channel {
  return country === KOREA ? "toss" : "eximbay";
}

// 끝난 결제에서 거주 국가를 캐낸다.
// 🔴모르면 null을 낸다 — 추측해서 적으면 다음 결제 때 엉뚱한 통화의 결제창이 뜨고,
//   그 값이 부가세 판정(국내만 VAT) 근거로도 남는다. 비워 두는 편이 낫다.
export function countryOfPayment(raw: unknown, channel: Channel): string | null {
  const p = raw as {
    country?: unknown;
    customer?: { country?: unknown; address?: { country?: unknown } };
  } | null;
  // ⚠️국가가 실려 오는 자리가 PG마다 다르다 — 있는 자리를 순서대로 다 본다.
  for (const c of [p?.country, p?.customer?.country, p?.customer?.address?.country]) {
    if (typeof c === "string" && /^[A-Za-z]{2}$/.test(c)) return c.toUpperCase();
  }
  // 토스페이먼츠(국내 정기결제 채널)는 국내 카드만 받으므로, 결제가 됐다는 사실
  // 자체가 국내라는 뜻이다.
  return channel === "toss" ? KOREA : null;
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

// 🔴손님 화면에 나가는 결제 실패 문구는 이 한 줄뿐이다(2026-08-26 사용자 결정).
//   PG사 이름(포트원)·HTTP 상태코드·결제 상태값·금액 숫자·환경변수 이름은
//   손님이 알 필요가 없는 내부 사정이라 화면에서 전부 뺐다.
export const PAY_FAIL_MESSAGE = "Payment failed";

// ⚠️message = 손님용 한 줄, detail = 운영자용 원인. 둘을 섞지 말 것.
//   detail은 서버 로그와 DB note로만 간다 — 응답 본문에 실어 보내지 않는다.
export type ChargeResult =
  | { ok: true; alreadyDone?: boolean; raw: unknown }
  | { ok: false; code?: string; message: string; detail: string; raw: unknown };

// 실패 하나를 만드는 자리. 🔴여기서 반드시 로그를 함께 남긴다 — 호출자가 detail을
//   흘려 버려도 원인은 서버 로그에 남게 하려는 것이다. 결제 사고가 났을 때
//   무엇이 틀렸는지 되짚을 유일한 단서다. 지우지 말 것.
function payFail(paymentId: string, detail: string, raw: unknown) {
  console.error("[billing] 결제 실패:", paymentId, detail, raw ?? "");
  return { ok: false as const, message: PAY_FAIL_MESSAGE, detail, raw };
}

// 이미 일어난 결제를 조회한다.
// 🔴해외(엑심베이)는 빌링키 발급 시점에 첫 결제가 함께 끝난다 — 포트원이
//   `requestIssueBillingKey`(발급만)를 "EXIMBAY_V2 에 대해 지원하지 않는 기능"으로
//   막기 때문에 `requestIssueBillingKeyAndPay`밖에 길이 없다. 그래서 서버는
//   청구하는 대신 "정말 그 금액이 결제됐는지"만 확인한다. 안 그러면 이중 청구다.
export async function getPayment(paymentId: string): Promise<
  | { ok: true; amount: number; currency: string; raw: unknown }
  | { ok: false; message: string; detail: string; raw: unknown }
> {
  const secret = process.env.PORTONE_SECRET_KEY?.trim();
  if (!secret) return payFail(paymentId, "결제 조회 불가 — PORTONE_SECRET_KEY 없음", null);

  const res = await fetch(`${PORTONE_API}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `PortOne ${secret}` },
    cache: "no-store",
  });
  const raw = await res.json().catch(() => null);
  if (!res.ok) return payFail(paymentId, `포트원 결제 조회 실패 HTTP ${res.status}`, raw);

  const p = raw as { status?: string; amount?: { total?: number }; currency?: string };
  // 🔴PAID가 아니면 돈이 안 들어온 것이다. 구독을 열어 주면 공짜로 쓰게 된다.
  if (p?.status !== "PAID") {
    // ⚠️status가 아예 없으면 ERROR로 적는다 — 손님에겐 안 보이고 로그·note에만 남는 값이다.
    return payFail(paymentId, `결제 상태 ${p?.status ?? "ERROR"}`, raw);
  }
  return { ok: true, amount: p.amount?.total ?? 0, currency: p.currency ?? "", raw };
}

export async function chargeWithBillingKey(a: ChargeArgs): Promise<ChargeResult> {
  const secret = process.env.PORTONE_SECRET_KEY?.trim();
  if (!secret) return payFail(a.paymentId, "청구 불가 — PORTONE_SECRET_KEY 없음", null);

  const res = await fetch(
    `${PORTONE_API}/payments/${encodeURIComponent(a.paymentId)}/billing-key`,
    {
      method: "POST",
      headers: { Authorization: `PortOne ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        billingKey: a.billingKey,
        storeId: PORTONE_STORE_ID,
        channelKey: BILLING_CHANNEL[a.channel],
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
  // 🔴포트원이 준 사유는 손님이 아니라 로그·note로 간다. 화면엔 한 줄만 나간다.
  const reason = (raw as { message?: string })?.message ?? "";
  return {
    ...payFail(a.paymentId, `포트원 청구 실패 HTTP ${res.status}${code ? ` ${code}` : ""}${reason ? ` — ${reason}` : ""}`, raw),
    code,
  };
}
