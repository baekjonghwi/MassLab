// ==========================================================================
//  검색엔진에 내보내는 글 — 제목·설명을 여기 한 곳에 모은다.
//
//  🔴화면 파일에는 적지 않는다. 제목·설명은 화면에 안 보이는 글이라, 흩어 놓으면
//    누가 어디를 고쳤는지 아무도 모른 채 조용히 갈라진다(lib/products.ts 와 같은 뜻).
//
//  🔴글은 **영어로 쓴다**(2026-08-29 사용자 결정 — 국제시장을 본다).
//    한때 한국어로 적었다가 되돌렸다. 이유는 취향이 아니라 **본문과 맞추기** 위해서다:
//      · 한/영 전환이 브라우저에서 돈다(lib/i18n.tsx). 검색 로봇은 언어를 안 밝히고
//        오므로 판정이 기본값 en 으로 떨어져, 봇이 실제로 읽는 본문은 **영어**다.
//      · 그때 제목·설명만 한국어면 "본문은 영어인데 제목만 한국어인 페이지"가 되어
//        구글이 우리 설명을 버리고 영어 본문에서 제 맘대로 지어낸다(실제로 그랬다).
//    ⚠️그 대가 — 네이버와 국내 구글의 **한국어 검색어에는 안 걸린다.**
//      국내를 다시 잡으려면 글을 번역하는 것으로는 안 되고, /ko · /en 처럼
//      **주소를 언어별로 나눠야** 한다(그래야 봇이 한국어 본문을 볼 수 있다).
//      그날은 여기 글이 언어별로 두 벌이 되고 alternates.languages 를 함께 적는다.
//    🔴archiMap · LaserFish 도 같은 결정을 따른다 — 세 사이트를 함께 볼 것.
//
//  ⚠️길이 — 제목은 약 60자, 설명은 약 155자에서 잘린다(영어 기준).
//    브랜드 이름을 앞에 둬야 잘려도 우리가 남는다.
// ==========================================================================

import type { Metadata } from "next";

// 🔴모든 절대주소의 뿌리. metadataBase 가 이걸 받아서, 아래 글들은 상대경로만 적으면 된다.
//   ⚠️맨 끝에 / 를 붙이지 말 것 — new URL() 이 경로를 이어 붙일 때 //  가 된다.
export const SITE_URL = "https://masslabs-archi.com";
export const SITE_NAME = "MassLabs";

// 🔴공유 미리보기 그림(카톡·트위터·슬랙에 뜨는 것). app/opengraph-image.tsx 가
//   1200×630 으로 그려 낸다 — 여기서 주소를 적지 않아도 Next 가 알아서 물려 준다.

// 🔴제목에는 **사람이 검색창에 칠 낱말**을 넣는다. 구글이 본문보다 제목을 훨씬
//   무겁게 본다 — "site analysis" "laser-cut drawings" 가 여기 있어야 그 검색에 걸린다.
// 🔴설명은 낱말을 앞에, 하고 싶은 말을 뒤에 둔다. 뒤가 잘려도 검색어는 남는다.
//   원문(2026-08-29 사용자): "대지조사부터 설계마감까지. 건축 설계를 한 사이트에서.
//   당신의 시간을 효율적으로 사용하세요."
export const HOME_TITLE = "MassLabs | Site analysis, model making & laser-cut drawings";
export const HOME_DESC =
  "Site analysis, 3D site models, color palettes and laser-cut drawings — every step of architectural design in one place. Spend your time on design.";

// 🔴화면마다 안 바뀌는 openGraph 값들. **반드시 펴서(...) 쓴다.**
//   ⚠️Next 는 metadata 를 **얕게** 합친다 — 자식이 openGraph 를 적는 순간 부모의
//     openGraph 는 **통째로 버려진다**(한 칸씩 섞이지 않는다). 그래서 아래 pageMeta 가
//     제목만 바꾸려고 openGraph 를 적었더니 /price 에서 og:image·og:type·og:site_name 이
//     전부 사라져 있었다. Next 문서가 권하는 해법이 이 "공통 값을 빼서 펴 쓰기"다.
//   🔴images 를 여기서 적는 이유 — 그림 자체는 app/opengraph-image.tsx 가 그리지만,
//     Next 가 그걸 자동으로 물려 주는 것은 **openGraph 를 안 덮어썼을 때뿐**이다.
//     ⚠️그래서 주소를 손으로 적는다. app/opengraph-image.tsx 의 size 를 바꾸면
//       아래 width·height 도 함께 고칠 것 — 안 맞으면 카톡이 카드를 잘라 낸다.
export const OG_SHARED = {
  type: "website" as const,
  siteName: SITE_NAME,
  locale: "en_US",
  images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MassLabs" }],
};

// ── 페이지 한 장의 제목·설명을 짓는다 ────────────────────────────────────
//    ⚠️canonical(정본 주소)을 반드시 함께 낸다. 같은 화면이 여러 주소로 열릴 때
//      (물음표 뒤에 값이 붙거나, www 가 붙거나) 구글이 그것들을 서로 다른 페이지로
//      세지 않게 하는 표다. 안 적으면 한 화면의 힘이 여러 주소로 흩어진다.
export function pageMeta(o: { title: string; desc: string; path: string }): Metadata {
  const full = `${o.title} | ${SITE_NAME}`;
  return {
    title: o.title,
    description: o.desc,
    alternates: { canonical: o.path },
    openGraph: { ...OG_SHARED, title: full, description: o.desc, url: o.path },
    twitter: { card: "summary_large_image", title: full, description: o.desc },
  };
}
