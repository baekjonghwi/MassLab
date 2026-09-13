// ==========================================================================
//  등급 서열과 "프로그램마다 필요한 최소 등급" — 판정의 유일한 출처.
//
//  🔴여기엔 서버 비밀(서비스 키·포트원 시크릿)이 없다. 그래서 브라우저 컴포넌트
//    (요금제 표, /account)도 그대로 import한다. lib/subscription은 서버 전용이라
//    화면에서 부르면 안 되므로, 문턱만 이 파일로 떼어 놓았다.
//
//  🔴DB의 plan_for는 "이 계정의 등급"만 답한다(free/plus/pro/max, 운영자는 max).
//    "그 등급으로 이 프로그램이 열리나"는 여기서만 판정한다 — 표와 플러그인이
//    각자 판정하면 반드시 어긋난다.
// ==========================================================================

export type PlanKey = "plus" | "pro" | "max" | "all";

export const PLAN_LABEL: Record<PlanKey, string> = {
  plus: "PLUS", pro: "PRO", max: "MAX", all: "ALL",
};

// 낮은 것부터. 요금제 표의 열 순서이자 서열이다.
export const TIER_KEYS = ["free", "plus", "pro", "max"] as const;

const PLAN_RANK: Record<string, number> = { free: 0, plus: 1, pro: 2, max: 3 };

export const DEFAULT_MIN_PLAN: PlanKey = "plus";

// 🔴프로그램에 등급 문턱을 두려면 여기 한 줄만 더한다.
//   적지 않은 프로그램은 유료면(plus 이상) 전부 열린다.
//
//   🔴2026-09-05 — laserfish 를 pro 에서 **plus 로 내렸다**(사용자 결정).
//     2026-08-18 에 PRO 로 잡았던 것은 LaserFish 를 건당결제로 따로 팔던 때의
//     서열이다. 건당결제를 폐기하고 구독 하나로 모으면서, 문턱도 archiMap 과
//     같은 자리(PLUS)로 내렸다 — 지금은 "구독 하나로 전부"가 표의 말이라,
//     제일 싼 등급이 프로그램 하나를 못 여는 표는 그 말과 어긋난다.
//   ⚠️여기를 pro 로 되돌리면 요금제 표(PlanTable 의 gate)와 플러그인 판정
//     (lib/plugin-auth 의 entitlementOf)이 **함께** 따라온다. 한 곳이다.
export const MIN_PLAN: Record<string, PlanKey> = {
  laserfish: "plus",
};

// ==========================================================================
//  값 — 🔴표에 보이는 값과 결제창에 뜨는 값은 **이 함수들에서만** 나온다.
//
//  PG 심사는 "화면 값 = 결제 값"을 본다(2026-09-11 지적). 전에는 요금표가
//  "$4.99"를 글자로 따로 들고 있었고, 원화 환산은 서버(lib/subscription)만 했다.
//  그래서 한국 손님에게 표는 달러, 결제창은 원화를 보여 줬다.
//  ⇒ 기준 달러가·부가세율·원화 환산식을 여기로 옮겼다. 이 파일은 서버 비밀이
//    없어 화면도 서버도 같이 import 한다 — 식이 한 벌이라 둘이 갈릴 수 없다.
//
//  🔴기준가는 언제나 USD 다. KRW 는 **결제 시점 환율**로 환산한 값이다
//    (원화 고정가는 2026-08-18 폐지 — 2026-09-11 에 다시 물어 환산 유지로 확인).
//  🔴부가세 10% 는 국내(KRW)에만 붙는다. 해외는 영세율이다.
// ==========================================================================
export const PLAN_USD: Record<"plus" | "pro" | "max", number> = {
  plus: 4.99, pro: 9.90, max: 14.90,
};

export const VAT_RATE = 0.1;

/** 국내 청구액(부가세 포함, 원 단위 정수). ⛔반올림 자리를 바꾸면 표와 결제창이 1원씩 갈린다. */
export function krwTotal(usd: number, krwRate: number): number {
  return Math.round(usd * (1 + VAT_RATE) * krwRate);
}

/** 그 청구액에 든 부가세. 총액에서 공급가를 빼서 구한다 — 따로 반올림하면 합이 안 맞는다. */
export function krwVat(usd: number, krwRate: number): number {
  return krwTotal(usd, krwRate) - Math.round(usd * krwRate);
}

export function minPlanOf(product: string): PlanKey {
  return MIN_PLAN[product] ?? DEFAULT_MIN_PLAN;
}

// 그 등급으로 그 프로그램을 열 수 있는가.
export function planAllows(plan: string, product: string): boolean {
  return (PLAN_RANK[plan] ?? 0) >= (PLAN_RANK[minPlanOf(product)] ?? 1);
}
