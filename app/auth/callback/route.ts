import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, cookieOptionsFor, safeNext,
} from "@/lib/supabase";

// ==========================================================================
//  GET /auth/callback?code=…&next=…
//       또는 /auth/callback?token_hash=…&type=recovery&next=…
//
//  이메일 인증 링크와 소셜 로그인이 돌아오는 자리. 일회용 code(또는 token_hash)를
//  세션으로 바꿔 쿠키에 심고, 원래 있던 곳으로 돌려보낸다.
//
//  🔴여기서 심는 쿠키도 도메인이 ".masslabs-archi.com"이어야 한다. 안 그러면
//    masslabs-archi.com에서만 로그인되고 archimap 쪽은 여전히 로그아웃이다.
//  🔴실패해도 그냥 튕기지 않는다 — 이유(error)를 목적지에 달아 보낸다.
//    /reset-password 가 그걸 읽어 "만료됐다 / 잘못됐다"를 구분해 알려준다.
// ==========================================================================

export const dynamic = "force-dynamic";

// 🔴메일 링크의 type 은 GoTrue 가 붙여 보내는 값이라 그대로 믿지 않는다.
//   auth-js 의 EmailOtpType 은 `string & {}` 를 포함해서 아무 문자열이나 통과하므로,
//   타입만으로는 못 막는다. 아는 것만 지나가게 여기서 걸러 낸다.
const EMAIL_OTP_TYPES = [
  "recovery", "signup", "invite", "magiclink", "email_change", "email",
] as const;
type EmailOtpKind = (typeof EMAIL_OTP_TYPES)[number];

function emailOtpKind(raw: string | null): EmailOtpKind | null {
  return EMAIL_OTP_TYPES.includes(raw as EmailOtpKind) ? (raw as EmailOtpKind) : null;
}

// GoTrue 가 준 코드를 화면이 쓰는 말로 줄인다. 모르는 코드는 fallback 으로 둔다
// (/reset-password 는 모르는 값을 "링크가 잘못됐다"로 받는다).
function reasonFor(code: string | undefined, fallback: string): string {
  switch (code) {
    case "otp_expired":
    case "flow_state_expired":
      return "otp_expired";
    // ⚠️PKCE verifier 는 이 브라우저의 쿠키다 — 폰에서 요청하고 PC에서 메일을 열면
    //   무조건 여기로 떨어진다. "기기가 다르다"고 따로 알려 줘야 사람이 원인을 안다.
    case "pkce_code_verifier_not_found":
      return "other_device";
    default:
      return fallback;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  // 🔴돌아갈 주소는 검증한다(오픈 리디렉트 방지).
  const next = safeNext(url.searchParams.get("next"));
  const dest = new URL(next, url.origin);

  // 1) GoTrue 가 이미 실패 이유를 달고 돌려보낸 경우(만료된 링크 등)는
  //    교환을 시도하지 않는다. 그 이유가 우리가 지어낼 어떤 말보다 정확하다.
  //    예) ?error=access_denied&error_code=otp_expired
  const gotrueCode = url.searchParams.get("error_code");
  const gotrueError = url.searchParams.get("error");
  if (gotrueCode || gotrueError) {
    const desc = url.searchParams.get("error_description") ?? "";
    console.error("[auth] 링크가 오류를 달고 돌아왔다:", gotrueCode ?? gotrueError, desc);
    dest.searchParams.set("error", reasonFor(gotrueCode ?? undefined, gotrueCode ?? gotrueError ?? "auth_failed"));
    return Response.redirect(dest, 303);
  }

  // 2) 두 가지 형식을 다 받는다.
  //    - ?code=…                     PKCE(기본 메일 템플릿 · 소셜 로그인)
  //    - ?token_hash=…&type=recovery 커스텀 메일 템플릿({{ .TokenHash }})
  //    ⚠️token_hash 쪽은 브라우저 쿠키(verifier)가 필요 없어서 크로스 디바이스도 산다.
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const otpKind = emailOtpKind(url.searchParams.get("type"));

  if (!code && !tokenHash) {
    dest.searchParams.set("error", "missing_code");
    return Response.redirect(dest, 303);
  }
  if (tokenHash && !otpKind) {
    console.error("[auth] 모르는 token type:", url.searchParams.get("type"));
    dest.searchParams.set("error", "bad_type");
    return Response.redirect(dest, 303);
  }

  const jar = await cookies();
  const opts = cookieOptionsFor(url.hostname, url.protocol === "https:");

  const client = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => jar.getAll(),
      setAll: (list) => {
        for (const { name, value, options } of list) {
          jar.set(name, value, { ...options, ...opts });
        }
      },
    },
  });

  if (tokenHash && otpKind) {
    const { error } = await client.auth.verifyOtp({ token_hash: tokenHash, type: otpKind });
    if (error) {
      console.error("[auth] token_hash 검증 실패:", error.message);
      dest.searchParams.set("error", reasonFor(error.code, "verify_failed"));
    }
  } else if (code) {
    // 🔴flow 마다 verifier 슬롯이 따로다. sb_flow_id 를 안 넘기면 "가장 최근에 시작한
    //   flow" 하나만 미러링하는 옛 고정 키로만 찾는다 — 재설정 메일을 두 번 요청하거나
    //   메일을 기다리는 동안 같은 브라우저에서 구글 로그인을 시작하면 먼저 온 링크가 죽는다.
    //   (auth-js 2.112.3 GoTrueClient.exchangeCodeForSession 공식 예시 그대로다.)
    const flowId = url.searchParams.get("sb_flow_id");
    const { error } = await client.auth.exchangeCodeForSession(code, flowId ? { flowId } : undefined);
    if (error) {
      console.error("[auth] 세션 교환 실패:", error.message);
      dest.searchParams.set("error", reasonFor(error.code, "exchange_failed"));
    }
  }

  return Response.redirect(dest, 303);
}
