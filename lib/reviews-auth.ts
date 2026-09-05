import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabase";
import { bearerOf, uidFromAccessToken } from "./plugin-auth";

// ==========================================================================
//  후기 API 의 신원 확인 — **서버 전용**.
//
//  🔴lib/reviews.ts 에서 떼어낸 조각이다. 저 파일은 /review 화면(브라우저)도
//    읽는데, next/headers 와 crypto(plugin-auth)가 섞여 있으면 빌드가 깨진다.
//    ⛔이 파일을 "use client" 파일에서 import 하지 말 것.
//
//  🔴쿠키 세션이 먼저, 없으면 Bearer.
//    차례가 중요하다 — 같은 브라우저에 둘 다 있을 수 있는데(archiMap 은 쿠키도
//    Bearer 도 갖는다), 쿠키 쪽이 곧 "지금 이 브라우저의 로그인"이다.
//  🔴로그인 안 했으면 null 이다. 던지지 않는다 — 목록만 읽을 때는 신원이 없어도 된다.
// ==========================================================================

export async function uidFromReviewRequest(request: Request): Promise<string | null> {
  try {
    const jar = await cookies();
    const client = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll: () => jar.getAll(),
        // ⛔여기서는 쿠키를 갱신하지 않는다. 이 API 는 남의 도메인(제품 하위도메인)
        //   에서 불려 오는데, 그때 Set-Cookie 를 내려 봐야 브라우저가 버리거나
        //   엉뚱한 곳에 붙는다. 세션 갱신은 우리 화면이 제 도메인에서 할 일이다.
        setAll: () => {},
      },
    });
    const { data } = await client.auth.getUser();
    if (data.user?.id) return data.user.id;
  } catch {
    /* 쿠키가 없거나 깨졌다 — 아래 Bearer 로 넘어간다 */
  }
  return uidFromAccessToken(bearerOf(request));
}
