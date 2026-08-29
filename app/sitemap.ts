// ==========================================================================
//  sitemap.xml — "우리 사이트에 이런 주소들이 있다"고 검색엔진에 건네는 목록.
//
//  🔴Next 의 파일 규약이다. 이 파일 하나가 /sitemap.xml 주소를 만든다.
//    구글 서치콘솔·네이버 서치어드바이저에 이 주소를 제출한다.
//
//  🔴여기엔 **사람에게 보여 줄 화면만** 적는다. 로그인해야 열리는 곳, 결제 진행
//    화면, 일회용 주소는 넣지 않는다(app/robots.ts 의 disallow 와 짝이다 —
//    한쪽에만 적으면 "훑지 말라면서 목록엔 넣은" 모순이 되어 서치콘솔이 경고한다).
//
//  ⚠️화면을 새로 만들면 여기 한 줄을 더할 것. 잊으면 그 화면은 검색에 영영 안 뜬다.
//  ⚠️priority 는 **우리 사이트 안에서의 상대적 무게**일 뿐이다. 다른 사이트와
//    겨루는 힘이 아니다 — 전부 1.0 으로 적으면 아무 말도 안 한 것과 같다.
// ==========================================================================

import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { SUBSCRIPTION_LIVE } from "@/lib/interim";

export default function sitemap(): MetadataRoute.Sitemap {
  // 🔴빌드한 날로 잡는다. 화면마다 진짜 고친 날을 들고 있지 않아서다 —
  //   거짓으로 "오늘 고쳤다"를 계속 보내면 검색엔진이 이 값을 아예 무시하게 된다.
  //   ⚠️글이 자주 바뀌는 화면(후기 같은 것)이 생기면 그때는 실제 날짜를 물어 올 것.
  const built = new Date();

  return [
    { url: `${SITE_URL}/`,                          lastModified: built, changeFrequency: "weekly",  priority: 1.0 },
    // 🔴/price 는 구독을 파는 동안에만 목록에 넣는다. 안 파는 동안에는 next.config.ts
    //   가 홈 가격 구역으로 넘기므로(307), 적어 두면 "목록엔 있는데 열면 딴 데로 가는
    //   주소"가 되어 서치콘솔이 경고한다(2026-08-29).
    ...(SUBSCRIPTION_LIVE
      ? [{ url: `${SITE_URL}/price`, lastModified: built, changeFrequency: "monthly" as const, priority: 0.9 }]
      : []),
    { url: `${SITE_URL}/review`,                    lastModified: built, changeFrequency: "weekly",  priority: 0.6 },
    { url: `${SITE_URL}/contact`,                   lastModified: built, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${SITE_URL}/policy/terms-and-policy`,   lastModified: built, changeFrequency: "yearly",  priority: 0.2 },
    { url: `${SITE_URL}/policy/privacy`,            lastModified: built, changeFrequency: "yearly",  priority: 0.2 },
  ];
}
