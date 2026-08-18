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

// 무료체험 기간(일). 🔴요금제 표·결제 화면·서버가 같은 숫자를 봐야 하므로
//   서버 전용 파일이 아니라 여기 둔다(lib/subscription이 이걸 다시 내보낸다).
export const TRIAL_DAYS = 7;

const PLAN_RANK: Record<string, number> = { free: 0, plus: 1, pro: 2, max: 3 };

export const DEFAULT_MIN_PLAN: PlanKey = "plus";

// 🔴프로그램에 등급 문턱을 두려면 여기 한 줄만 더한다.
//   적지 않은 프로그램은 유료면(plus 이상) 전부 열린다.
//   · laserfish — 2026-08-18 사용자 결정: PRO 이상.
export const MIN_PLAN: Record<string, PlanKey> = {
  laserfish: "pro",
};

export function minPlanOf(product: string): PlanKey {
  return MIN_PLAN[product] ?? DEFAULT_MIN_PLAN;
}

// 그 등급으로 그 프로그램을 열 수 있는가.
export function planAllows(plan: string, product: string): boolean {
  return (PLAN_RANK[plan] ?? 0) >= (PLAN_RANK[minPlanOf(product)] ?? 1);
}
