// ==========================================================================
//  후기 — 제품마다 화면은 따로, 모이는 곳은 하나 (2026-09-05 사용자 결정)
//
//  🔴화면은 제품 저장소가 각자 갖는다:
//    · archiMap  — 상단 [REVIEW] 모달 (그쪽 public/index.html · app.js)
//    · LaserFish — /review 화면 (그쪽 app/review)
//    · MassLabs  — /review (제품 전부를 한 줄로 보는 자리. 여기서는 안 쓴다)
//  🔴데이터와 판정은 **여기 한 곳**이다. MassLabs 의 /api/reviews 가 유일한 문이고,
//    표(public.reviews)에는 쓰기 정책이 아예 없어 브라우저가 직접 못 쓴다.
//    ⛔제품 저장소에서 Supabase 에 후기를 직접 쓰지 말 것 — 신원·길이·중복 판정이
//      세 벌이 되는 순간 반드시 갈라진다.
//
//  🔴세션은 `.masslabs-archi.com` 쿠키 한 벌을 전 제품이 공유한다(lib/supabase).
//    그래서 laserfish 하위도메인에서 부르는 fetch 도 `credentials:"include"` 만
//    붙이면 우리 서버가 누구인지 안다 — 제품 쪽에 Supabase 클라이언트를 새로
//    달 필요가 없다. archiMap 은 이미 클라이언트가 있으므로 Bearer 로도 온다.
//    ⇒ 두 길을 모두 받는다(lib/reviews-auth 의 uidFromReviewRequest).
//
//  ⚠️이 파일은 **브라우저에도 실린다**(/review 화면이 제품 목록과 타입을 읽는다).
//    그래서 서버 전용 조각(next/headers · createServerClient · crypto)은 여기
//    두지 않고 lib/reviews-auth.ts 로 뺐다 — 하나라도 섞이면 빌드가 깨진다.
// ==========================================================================

import { ROOT_DOMAIN } from "./supabase";

/** 후기를 받는 프로그램. 🔴DB의 CHECK 제약과 같아야 한다(010_reviews.sql). */
export const REVIEW_PRODUCTS = ["archimap", "laserfish", "colorgram"] as const;
export type ReviewProduct = (typeof REVIEW_PRODUCTS)[number];

export const isReviewProduct = (v: unknown): v is ReviewProduct =>
  typeof v === "string" && (REVIEW_PRODUCTS as readonly string[]).includes(v);

// 🔴길이 제한은 서버가 정한다. 화면의 maxLength 는 안내일 뿐이라 얼마든지 우회된다.
export const NICKNAME_MAX = 40;
export const BODY_MAX = 1200;
export const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
/** 한 번에 내려보내는 최대 개수. 화면이 더 큰 수를 물어도 여기서 잘린다. */
export const LIST_MAX = 60;

// --------------------------------------------------------------------------
//  CORS — 제품 하위도메인이 이 API 를 부른다.
//
//  🔴`*` 를 쓸 수 없다. 쿠키를 실어 보내는 요청(credentials)은 브라우저가
//    와일드카드 Allow-Origin 을 거부한다 — 정확한 주소를 되돌려 줘야 한다.
//  🔴그래서 "허락된 주소면 그 주소를 그대로 반향"한다. 목록에 없으면 CORS 머리를
//    아예 안 붙인다(브라우저가 알아서 막는다).
//  ⚠️`Vary: Origin` 이 없으면 CDN 이 한 제품에게 준 답을 다른 제품에게 재사용해
//    엉뚱한 Allow-Origin 이 내려간다.
// --------------------------------------------------------------------------
export function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = { Vary: "Origin" };
  if (!origin) return h;
  let ok = false;
  try {
    const u = new URL(origin);
    ok =
      (u.protocol === "https:" &&
        (u.hostname === ROOT_DOMAIN || u.hostname.endsWith(`.${ROOT_DOMAIN}`))) ||
      // 제품 저장소를 로컬에서 띄워 붙여 볼 때. https 가 아니므로 배포에서는 못 걸린다.
      (u.protocol === "http:" && /^(localhost|127\.0\.0\.1)$/.test(u.hostname));
  } catch {
    ok = false;
  }
  if (!ok) return h;
  h["Access-Control-Allow-Origin"] = origin;
  h["Access-Control-Allow-Credentials"] = "true";
  h["Access-Control-Allow-Methods"] = "GET, POST, DELETE, OPTIONS";
  h["Access-Control-Allow-Headers"] = "Authorization, Content-Type";
  h["Access-Control-Max-Age"] = "86400";
  return h;
}

// --------------------------------------------------------------------------
//  화면에 내려보내는 모양. ⛔user_id 는 절대 안 내려보낸다 — 후기 목록으로
//  누가 어느 계정인지가 새면 안 된다. "내 것인가"는 mine 플래그로만 답한다.
// --------------------------------------------------------------------------
export type ReviewRow = {
  id: string;
  product: string;
  user_id: string | null;
  nickname: string;
  rating: number | null;
  body: string;
  photo_url: string | null;
  created_at: string;
};

export type ReviewOut = {
  id: string;
  product: string;
  nickname: string;
  rating: number | null;
  body: string;
  photoUrl: string | null;
  createdAt: string;
  mine: boolean;
};

export const toReviewOut = (r: ReviewRow, uid: string | null): ReviewOut => ({
  id: r.id,
  product: r.product,
  nickname: r.nickname,
  rating: r.rating,
  body: r.body,
  photoUrl: r.photo_url,
  createdAt: r.created_at,
  mine: !!uid && r.user_id === uid,
});
