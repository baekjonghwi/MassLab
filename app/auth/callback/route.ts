import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import {
  SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, cookieOptionsFor, safeNext,
} from "@/lib/supabase";

// ==========================================================================
//  GET /auth/callback?code=…&next=…
//
//  이메일 인증 링크와 소셜 로그인이 돌아오는 자리. 일회용 code를 세션으로
//  바꿔 쿠키에 심고, 원래 있던 곳으로 돌려보낸다.
//
//  🔴여기서 심는 쿠키도 도메인이 ".masslabs-archi.com"이어야 한다. 안 그러면
//    masslabs-archi.com에서만 로그인되고 archimap 쪽은 여전히 로그아웃이다.
// ==========================================================================

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // 🔴돌아갈 주소는 검증한다(오픈 리디렉트 방지).
  const next = safeNext(url.searchParams.get("next"));
  const dest = new URL(next, url.origin);

  if (!code) {
    dest.searchParams.set("error", "missing_code");
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

  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) {
    console.error("[auth] 세션 교환 실패:", error.message);
    dest.searchParams.set("error", "exchange_failed");
  }
  return Response.redirect(dest, 303);
}
