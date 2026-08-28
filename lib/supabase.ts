import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

// ==========================================================================
//  MassLabs 통합 로그인 — 하위 도메인 전체가 세션 하나를 공유한다.
//
//  🔴세션을 localStorage가 아니라 쿠키에 담고, 도메인을 ".masslabs-archi.com"
//    (앞에 점)으로 준다. localStorage는 주소별로 격리되어 archimap 하위 도메인이
//    못 읽지만, 점으로 시작하는 도메인 쿠키는 모든 하위 도메인이 함께 본다.
//    → 앞으로 프로그램이 늘어도 하위 도메인만 붙이면 로그인은 따라온다.
//
//  ⚠️archiMap도 같은 설정으로 바꿔야 한다. 한쪽만 쿠키로 가면 세션이 안 보인다.
//  ⚠️브라우저가 아닌 프로그램(라이노)은 쿠키를 못 쓴다 — 그쪽은 기기 코드
//    방식(/api/device/*)이 담당한다.
// ==========================================================================

export const SUPABASE_URL = "https://tnadzbzvqwoxdghnesrl.supabase.co";
// publishable 키는 공개해도 되는 값이다(RLS가 실제 방어선). secret 키와 혼동 금지.
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_wiBYfACUapeJ11BqwIeXyg_aMejQ42I";

export const ROOT_DOMAIN = "masslabs-archi.com";

// localhost에서는 도메인을 지정하면 안 된다 — 브라우저가 쿠키를 통째로 버린다.
export function cookieDomain(hostname: string): string | undefined {
  return hostname === ROOT_DOMAIN || hostname.endsWith(`.${ROOT_DOMAIN}`)
    ? `.${ROOT_DOMAIN}`
    : undefined;
}

export function cookieOptionsFor(hostname: string, isHttps: boolean) {
  return {
    domain: cookieDomain(hostname),
    path: "/",
    sameSite: "lax" as const,
    secure: isHttps,
    maxAge: 60 * 60 * 24 * 365,
  };
}

// 🔴로그인 후 돌아갈 주소는 반드시 검증한다. 안 하면 ?next=https://악성사이트로
//   만든 링크에 사람들이 로그인해 버린다(오픈 리디렉트 → 피싱).
export function safeNext(next: string | null | undefined): string {
  if (!next) return "/";
  // 같은 사이트 안의 상대 경로는 그대로 통과. "//evil.com"은 절대주소라 막는다.
  if (next.startsWith("/") && !next.startsWith("//")) return next;
  try {
    const u = new URL(next);
    const ok =
      u.protocol === "https:" &&
      (u.hostname === ROOT_DOMAIN || u.hostname.endsWith(`.${ROOT_DOMAIN}`));
    return ok ? u.toString() : "/";
  } catch {
    return "/";
  }
}

let cached: SupabaseClient | null = null;

export function supabase(): SupabaseClient {
  if (cached) return cached;
  const https = window.location.protocol === "https:";
  cached = createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: cookieOptionsFor(window.location.hostname, https),
    // 🔴메일 링크에 sb_flow_id 를 붙인다(2026-08-26). 안 붙이면 PKCE verifier 를
    //   "가장 최근 flow 하나"만 미러링하는 레거시 키로 찾게 되어, 재설정 메일을
    //   두 번 요청하거나 메일을 기다리는 사이 구글 로그인을 하면 **먼저 온 메일의
    //   링크가 죽는다**. 재설정·가입확인 메일은 flow id 를 받아올 다른 길이 없어
    //   이 플래그로만 짝을 맞출 수 있다(@supabase/auth-js types.d.ts:154-160).
    //   받는 쪽은 app/auth/callback/route.ts 가 이미 읽고 있다.
    // ⚠️리다이렉트 주소는 **물음표 뒤까지 통째로** 검사된다. 그래서 Supabase 의
    //   Redirect URLs 가 와일드카드여야 한다 — 정확일치만 등록돼 있으면 파라미터가
    //   하나 늘어난 순간 인증 메일이 전부 깨진다.
    //   ✅2026-08-26 확인: masslabs-archi.com/** 와 *.masslabs-archi.com/** 로 등록돼 있다.
    auth: { experimental: { appendPkceFlowIdToRedirects: true } },
  });
  return cached;
}
