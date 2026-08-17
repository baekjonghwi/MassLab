import { createHash, randomBytes } from "crypto";
import { CENTRAL, sbFetch } from "./subscription";

// ==========================================================================
//  라이노 플러그인 신원 — 로그인 연결과 장기 토큰.
//
//  🔴폴링을 쓰지 않는다. 사용자가 라이노에서 [연결 확인]을 누를 때만 요청이 간다.
//    결제 폴링(PaymentHandler)이 서버 CPU를 갉아먹었던 전례가 있어서, 백그라운드
//    스레드·타이머·취소 로직이 아예 없는 구조로 만들었다.
//
//  🔴권한 판정은 DB의 plan_for 한 곳에서만 한다. subscriptions를 직접 조회하면
//    'all' 번들 구독자가 막힌다(번들은 product='all' 행 하나뿐이다).
// ==========================================================================

export const DEVICE_TTL_MIN = 10;      // 연결 대기 유효시간
export const SEAT_LIMIT = 2;           // 계정당 동시 기기 수
export const ENTITLED_TTL_SEC = 86400; // 권한 있음 → 하루 캐시
export const FREE_TTL_SEC = 60;        // 🔴free는 짧게. 결제 직후 바로 풀려야 한다.

// 토큰은 원문을 저장하지 않는다 — DB가 새도 토큰이 그대로 새지는 않게.
export const hashToken = (t: string) => createHash("sha256").update(t).digest("hex");
export const newToken = () => randomBytes(32).toString("hex");

// 사람이 눈으로 대조할 코드. 헷갈리는 글자(0/O, 1/I)를 뺐다.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function newUserCode(): string {
  const b = randomBytes(6);
  const s = Array.from(b, (x) => ALPHABET[x % ALPHABET.length]).join("");
  return `${s.slice(0, 3)}-${s.slice(3)}`;
}

// 🔴기기 ID는 플러그인이 만든 난수여야 한다. 순번이나 MAC 주소를 쓰면 남이
//   추측해서 남의 연결을 가로챌 수 있다. 길이로 최소한의 검사를 한다.
export const isDeviceId = (v: unknown): v is string =>
  typeof v === "string" && /^[0-9a-f]{32,64}$/i.test(v);

// --------------------------------------------------------------------------
//  브라우저(로그인한 사용자) 신원 확인
// --------------------------------------------------------------------------
export async function uidFromAccessToken(accessToken: string): Promise<string | null> {
  if (!accessToken) return null;
  const r = await fetch(`${CENTRAL.supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${accessToken}`, apikey: CENTRAL.serviceKey },
    cache: "no-store",
  });
  if (!r.ok) return null;
  return ((await r.json()) as { id?: string }).id ?? null;
}

export function bearerOf(request: Request): string {
  return (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
}

// --------------------------------------------------------------------------
//  플러그인 토큰 → 사용자
// --------------------------------------------------------------------------
export async function uidFromPluginToken(token: string): Promise<string | null> {
  if (!token) return null;
  const r = await sbFetch(
    `plugin_tokens?token_hash=eq.${hashToken(token)}&revoked_at=is.null&select=id,user_id`,
  );
  if (!r.ok) return null;
  const row = ((await r.json()) as { id: string; user_id: string }[])[0];
  if (!row) return null;

  // 마지막 사용 시각. 좌석을 정리할 때 "제일 안 쓰는 기기"를 고르는 근거가 된다.
  await sbFetch(`plugin_tokens?id=eq.${row.id}`, {
    method: "PATCH",
    body: JSON.stringify({ last_seen_at: new Date().toISOString() }),
    prefer: "return=minimal",
  });
  return row.user_id;
}

// --------------------------------------------------------------------------
//  권한
// --------------------------------------------------------------------------
export type Entitlement = { plan: string; allowed: boolean; until: string };

export async function entitlementOf(uid: string, product: string): Promise<Entitlement> {
  const r = await sbFetch("rpc/plan_for", {
    method: "POST",
    body: JSON.stringify({ p_user: uid, p_product: product }),
  });
  const plan = r.ok ? ((await r.json()) as string) : "free";
  const allowed = plan !== "free";
  return {
    plan,
    allowed,
    until: new Date(Date.now() + (allowed ? ENTITLED_TTL_SEC : FREE_TTL_SEC) * 1000).toISOString(),
  };
}
