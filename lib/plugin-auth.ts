import { createHash, createSign, randomBytes } from "crypto";
import { CENTRAL, minPlanOf, planAllows, sbFetch, type PlanKey } from "./subscription";
import { effectivePlan } from "./interim";

// ==========================================================================
//  라이노 플러그인 신원 — 로그인 연결과 장기 토큰.
//
//  🔴폴링을 쓰지 않는다. 사용자가 라이노에서 [연결 확인]을 누를 때만 요청이 간다.
//    결제 폴링(PaymentHandler)이 서버 CPU를 갉아먹었던 전례가 있어서, 백그라운드
//    스레드·타이머·취소 로직이 아예 없는 구조로 만들었다.
//
//  🔴"이 계정의 등급"은 DB의 plan_for 한 곳에서만 읽는다. subscriptions를 직접
//    조회하면 'all' 번들 구독자가 막힌다(번들은 product='all' 행 하나뿐이다).
//    "그 등급으로 이 프로그램이 열리나"는 lib/plans의 MIN_PLAN이 답한다.
// ==========================================================================

export const DEVICE_TTL_MIN = 10;      // 연결 대기 유효시간
// 🔴계정당 동시 기기 1대(2026-08-19 결정). 새 기기를 연결하면 device/claim이
//   가장 오래 안 쓴 기기를 끊는다 — 거절하지 않는다. 그래서 사용자가 스스로
//   연결을 해제할 화면이 없어도 컴퓨터를 바꾼 사람이 막히지 않는다.
export const SEAT_LIMIT = 1;
export const ENTITLED_TTL_SEC = 86400; // 권한 있음 → 하루 캐시(온라인 재확인 주기)
export const FREE_TTL_SEC = 60;        // 🔴free는 짧게. 결제 직후 바로 풀려야 한다.
// 🔴서명 만료 = 오프라인 한계. 인터넷 없이 이 시각까지 마지막 권한을 인정한다
//   (인터넷 없는 실습실 대응). until(재확인 주기)보다 길고, 위조가 불가능하다 —
//   플러그인의 옛 lastAllowed(평문 타임스탬프, 위조 가능)를 대체한다.
export const ENT_SIG_TTL_SEC = 7 * 86400;

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
//  서명된 엔타이틀먼트 — 플러그인이 로컬 캐시를 위조하는 것을 막는다.
//
//  🔴플러그인은 %AppData%\LaserFish\account.json 에 plan·until 을 캐시한다.
//    그 파일을 메모장으로 열어 plan="plus", until=2099 로 고치면 서버를 안 부르고도
//    구독이 열린다. 그걸 막으려면 캐시가 "서버가 발급한 것"임을 플러그인이 확인할 수
//    있어야 한다 → 서버가 개인키로 서명하고, 플러그인은 공개키로만 검증한다(개인키가
//    없으면 아무도 새 서명을 못 만든다). 공개키는 플러그인에 박혀 나가도 안전하다.
//
//  🔴대칭키(HMAC)를 쓰지 않는 이유: 플러그인은 디컴파일되므로 공유 비밀이 그대로
//    새어 위조에 쓰인다. 비대칭이라야 "검증만 가능, 발급 불가"가 성립한다.
//
//  형식: base64url(payload JSON) + "." + base64url(RSA-SHA256 서명).
//    payload = { uid, product, plan, allowed, exp }(exp=Unix초). RSA/PKCS1/SHA256 은
//    .NET Framework 4.8 과 .NET 7 양쪽에서 표준 API로 검증된다.
//
//  🔴키가 없으면(LASERFISH_ENT_PRIVATE_KEY 미설정) ent 를 빼고 내려보낸다 —
//    서버를 먼저 배포하고 키·플러그인은 나중에 올리는 순서를 허용하기 위해서다.
//    옛 플러그인은 ent 필드를 무시하므로 이 추가는 하위호환이다.
// --------------------------------------------------------------------------
const b64url = (b: Buffer) => b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export type SignedEntitlement = { uid: string; product: string; plan: string; allowed: boolean; exp: number };

export function signEntitlement(p: SignedEntitlement): string | null {
  const pem = process.env.LASERFISH_ENT_PRIVATE_KEY?.trim();
  if (!pem) return null;
  try {
    const payload = Buffer.from(JSON.stringify(p), "utf8");
    const sig = createSign("SHA256").update(payload).sign(pem);
    return `${b64url(payload)}.${b64url(sig)}`;
  } catch (e) {
    console.error("[entitlement] 서명 실패:", e);
    return null;
  }
}

// --------------------------------------------------------------------------
//  권한
// --------------------------------------------------------------------------
export type Entitlement = {
  plan: string;
  allowed: boolean;
  /** 이 프로그램을 열려면 필요한 최소 등급. 플러그인이 "PRO 이상 필요"를 띄운다. */
  requiredPlan: PlanKey;
  until: string;
  /** 서명된 엔타이틀먼트(위조 방지). 키 미설정 시 생략 — 옛 플러그인은 무시한다. */
  ent?: string;
};

export async function entitlementOf(uid: string, product: string): Promise<Entitlement> {
  const r = await sbFetch("rpc/plan_for", {
    method: "POST",
    body: JSON.stringify({ p_user: uid, p_product: product }),
  });
  const real = r.ok ? ((await r.json()) as string) : "free";
  // 🔴할인 기간 — 로그인만 했으면 PLUS로 본다(lib/interim 의 PLUS_FREE_PROMO).
  //   여기 오는 사람은 이미 신원이 확인된 사람이다(uid 가 있다) → "로그인했다"가
  //   곧 참이다. archiMap 의 promoPlan(그쪽 public/app.js)과 같은 규칙이고,
  //   두 프로그램이 같은 날 같은 스위치로 함께 열리고 닫혀야 해서 이렇게 맞췄다.
  //  ⛔올리는 것은 free 뿐이다. 돈을 낸 pro·max 를 plus 로 끌어내리면 안 된다.
  //  ⚠️DB에는 안 적는다 — 진짜 등급은 free 그대로 두고, 답할 때만 올려 준다.
  //    적어 버리면 행사가 끝난 뒤에도 전원이 PLUS 로 남는다.
  const plan = effectivePlan(real);
  // 🔴"유료냐"가 아니라 "이 프로그램의 문턱을 넘느냐"다. 문턱은 lib/plans의
  //   MIN_PLAN 한 곳에만 둔다(2026-09-05 부터 laserfish 도 PLUS 다).
  const allowed = planAllows(plan, product);
  // until = 온라인 재확인 주기. 서명 exp = 오프라인 한계(더 길다). 둘을 나눈 이유는
  // 🔴온라인일 땐 자주 다시 물어 해지를 빨리 반영하고, 오프라인일 땐 서명 만료까지
  //   버티게 하기 위해서다. 접근의 최종 한계는 언제나 위조 불가능한 서명 exp다.
  const untilSec = allowed ? ENTITLED_TTL_SEC : FREE_TTL_SEC;
  const until = new Date(Date.now() + untilSec * 1000).toISOString();
  const sigTtlSec = allowed ? ENT_SIG_TTL_SEC : FREE_TTL_SEC;
  const ent = signEntitlement({ uid, product, plan, allowed, exp: Math.floor(Date.now() / 1000) + sigTtlSec });
  return {
    plan,
    allowed,
    requiredPlan: minPlanOf(product),
    until,
    ...(ent ? { ent } : {}),
  };
}
