import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, cookieOptionsFor } from "@/lib/supabase";
import { ipCountry } from "@/lib/countries";

// ==========================================================================
//  POST /api/account/country   (본문 없음)
//
//  "지금 접속한 나라"를 profiles.country 에 적는다. 신원도 국가도 본문에서 받지
//  않는다 — 신원은 쿠키 세션, 국가는 Vercel 엣지가 붙인 x-vercel-ip-country 다.
//  ⇒ 화면이 보낼 수 있는 값이 하나도 없으니 위조할 것도 없다.
//
//  🔴이메일 로그인 전용 통로다. 구글·메일 링크는 /auth/callback 이 서버를 지나가서
//    거기서 같은 일을 하지만, signInWithPassword 는 브라우저가 Supabase 와 직접
//    주고받아 서버를 한 번도 안 지나간다 — 그래서 이 자리가 따로 필요하다.
//    ⚠️둘은 한 벌이다. 한쪽만 고치면 로그인 방법에 따라 나라가 달라진다.
//
//  🔴답은 언제나 204다. 부르는 쪽(/login)은 keepalive 로 던지고 곧장 화면을
//    넘기므로 답을 읽지 않는다 — 실패해도 로그인이 막히면 안 된다.
// ==========================================================================

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const country = ipCountry(request.headers);
  // 헤더가 없거나(로컬 개발) "XX"·"T1" 이면 아무것도 안 한다. 모르면 안 적는다.
  if (!country) return new Response(null, { status: 204 });

  try {
    const url = new URL(request.url);
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

    // 🔴getUser() 로 확인한다 — 쿠키 안의 토큰을 그냥 읽지 않고 Supabase 에 물어
    //   서명을 검증받는다. RPC 는 auth.uid() 로 대상을 정하므로 남의 칸은 못 건드린다.
    const { data: { user } } = await client.auth.getUser();
    if (!user) return new Response(null, { status: 204 });

    // p_only_if_empty=false — 로그인할 때마다 덮는다.
    await client.rpc("set_country", { p_country: country, p_only_if_empty: false });
  } catch (e) {
    console.error("[auth] 접속 국가 기록 실패:", e);
  }

  return new Response(null, { status: 204 });
}
