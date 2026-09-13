import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase";
import { bearerOf, uidFromAccessToken } from "@/lib/plugin-auth";

// ==========================================================================
//  이 요청을 보낸 사람이 누구인가 — 구독 결제 라우트들이 함께 쓴다.
//
//  🔴쿠키(.masslabs-archi.com) 먼저, 없으면 Authorization Bearer.
//    결제 화면(/subscribe)은 둘 다 보낸다. 쿠키를 못 읽는 브라우저에서 주인 확인이
//    통째로 꺼지지 않게 하는 두 번째 줄이다.
//  ⚠️못 알아내면 null 이다. 그걸 거절로 볼지는 **부르는 쪽이 정한다** —
//    confirm 은 PG 창을 거쳐 돌아오는 길이라 null 을 통과시키고(돈이 빠진 뒤라서),
//    buyer 는 결제 전이라 null 을 거절한다.
// ==========================================================================
export async function callerUid(request: Request): Promise<string | null> {
  try {
    const jar = await cookies();
    const client = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: { getAll: () => jar.getAll(), setAll: () => {} },
    });
    const { data } = await client.auth.getUser();
    if (data.user?.id) return data.user.id;
  } catch {
    /* 쿠키가 없거나 깨졌다 — 아래 Bearer 로 넘어간다 */
  }
  return uidFromAccessToken(bearerOf(request));
}
