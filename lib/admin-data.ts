import { CENTRAL } from "./subscription";

// ==========================================================================
//  /admin 이 읽는 값들 — **서버 전용**. DB 함수 둘을 부르고 타입을 입힌다.
//
//  🔴집계는 DB 가 한다(supabase/migrations/011_admin_dashboard.sql). 여기서
//    행을 긁어다 자바스크립트로 세지 않는다 — 825명일 때는 어느 쪽이든 되지만,
//    825,000명이 되면 한쪽만 살아남는다. 지금 정해 두는 편이 싸다.
//
//  🔴호출은 service_role 키로만 된다. 관리자 판정은 lib/admin-auth.ts 가
//    **먼저** 하고, 통과한 요청만 여기로 온다.
// ==========================================================================

export const PRODUCT_KEYS = ["archimap", "colorgram", "laserfish"] as const;
export type ProductKey = (typeof PRODUCT_KEYS)[number];

export const PRODUCT_LABEL: Record<string, string> = {
  archimap: "archiMap",
  colorgram: "Colorgram",
  laserfish: "LaserFish",
};

// 🔴제품 색 — dataviz 검증을 통과한 3색이다(all-pairs CVD ΔE 9.2 / 일반시야 27.6).
//   ⛔순서를 돌리거나 색을 늘리지 말 것. 슬롯은 **제품에 붙는다** — 필터로
//     제품 하나가 사라져도 남은 제품의 색은 그대로다.
//   ⚠️aqua 는 흰 바닥 대비 2.82:1 이라 3:1 에 못 미친다 → 범례와 막대에 **항상
//     글자 이름을 함께** 적는다(색만으로 구분하게 두지 않는다).
export const PRODUCT_COLOR: Record<string, string> = {
  archimap: "#0066cc", // 슬롯1 blue — Apple Action Blue 와 같은 값
  colorgram: "#eb6834", // 슬롯2 orange
  laserfish: "#1baf7a", // 슬롯3 aqua
};

export type Point = { d: string; n: number; cum: number };

export type Overview = {
  generated_at: string;
  totals: {
    users: number;
    with_country: number;
    countries: number;
    reviews: number;
    devices: number;
    subs: number;
    first_signup: string | null;
    last_signup: string | null;
  };
  signups: {
    today: number;
    this_month: number;
    last_month: number;
    last7: number;
    prev7: number;
  };
  active: {
    d1: number;
    d7: number;
    d30: number;
    ever: number;
    /** 크레딧을 썼지만 시각이 없는 사람(2026-09-06 이전 사용). 시간 창에 못 넣는다. */
    undated: number;
    events_today: number;
    events7: number;
  };
  daily: Point[];
  weekly: Point[];
  monthly: Point[];
  countries: { code: string; n: number; active7: number }[];
  products: {
    key: string;
    users: number;
    users7: number;
    events: number;
    events7: number;
    last_at: string | null;
  }[];
  anon_activity: {
    colorgram_palettes: number;
    laserfish_cuts: number;
    laserfish_cuts7: number;
  };
  plans: { plan: string; n: number }[];
  activity_buckets: { label: string; n: number }[];
  reviews: {
    id: string;
    product: string;
    nickname: string;
    rating: number | null;
    body: string;
    lang: string | null;
    status: string;
    created_at: string;
  }[];
};

export type UserRow = {
  id: string;
  name: string | null;
  email: string; // 🔴이미 가려진 값이다(a***@gmail.com). 원문은 DB 를 안 떠난다.
  country: string | null;
  plan: string;
  created_at: string;
  credits_used: number;
  trial_used_at: string | null;
  events: number;
  last_active: string | null;
  recent_product: string | null;
  products: string[];
};

export type UserPage = { total: number; rows: UserRow[] };

export type UserQuery = {
  q?: string;
  country?: string;
  plan?: string;
  product?: string;
  active?: string; // 'd1' | 'd7' | 'd30' | 'never'
  sort?: string;
  dir?: string;
  limit?: number;
  offset?: number;
};

async function rpc<T>(name: string, args: Record<string, unknown>): Promise<T> {
  if (!CENTRAL.serviceKey) throw new Error("server_misconfigured");
  const r = await fetch(`${CENTRAL.supabaseUrl}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CENTRAL.serviceKey}`,
      // 🔴apikey 를 빼면 sb_secret_ 키를 JWT 로 읽으려다 조용히 실패한다.
      apikey: CENTRAL.serviceKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!r.ok) throw new Error(`${name}: ${r.status} ${await r.text()}`);
  return (await r.json()) as T;
}

export function fetchOverview(): Promise<Overview> {
  return rpc<Overview>("admin_overview", {});
}

export function fetchUsers(q: UserQuery): Promise<UserPage> {
  return rpc<UserPage>("admin_user_rows", {
    q: q.q ?? null,
    f_country: q.country ?? null,
    f_plan: q.plan ?? null,
    f_product: q.product ?? null,
    f_active: q.active ?? null,
    sort: q.sort ?? "created_at",
    dir: q.dir ?? "desc",
    lim: q.limit ?? 25,
    off: q.offset ?? 0,
  });
}
