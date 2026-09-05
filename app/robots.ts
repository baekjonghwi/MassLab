// ==========================================================================
//  robots.txt — 검색 로봇에게 "어디는 훑지 말라"고 알리는 문서.
//
//  🔴Next 의 파일 규약이다. 이 파일 하나가 /robots.txt 주소를 만든다
//    (public/robots.txt 를 따로 두지 말 것 — 두면 그쪽이 이겨서 여기가 죽는다).
//
//  ⚠️Disallow 는 "훑지 말라"이지 "검색결과에서 빼라"가 아니다. 다른 데서 링크가
//    걸리면 주소만 결과에 뜰 수 있다. 그래서 **정말 감춰야 하는 화면**에는
//    화면 쪽에 noindex 를 따로 준다(app/*/layout.tsx 의 robots: { index: false }).
//    여기 목록은 "훑어 봐야 건질 게 없는 곳"을 걸러 크롤 예산을 아끼는 몫이다.
//
//  ⛔/admin 을 여기 적지 말 것(2026-09-06에 적었다가 뺐다). 이 파일은 누구나
//    읽는다 — 감추려고 적은 줄이 오히려 **주소를 광고한다.** 그 화면은
//    로그인 안 한 사람을 /login 으로, 관리자가 아닌 사람을 404 로 보내고,
//    화면 자체에 noindex 가 붙어 있다. 검색에 뜰 길이 없다.
// ==========================================================================

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/api/",          // 서버 통로. 사람이 읽을 글이 없다
        "/auth/",         // 로그인 돌아오는 자리
        "/account",       // 로그인해야 열리는 내 정보 (아래 /security 까지 함께 걸린다)
        "/payment",       // 결제 진행 화면 — 값이 물음표 뒤에 실려 다녀 주소가 무한히 늘어난다
        "/link",          // 기기연결. 일회용 주소다
        "/reset-password",
        "/subscribe",     // 🔴임시(2026-08-21) 구독을 안 파는 동안 홈으로 되돌려진다.
                          //   정기결제를 열면 이 줄을 뺄 것 — lib/interim.ts 의 SUBSCRIPTION_LIVE 와 한 벌이다.
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
