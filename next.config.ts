import type { NextConfig } from "next";
import { SUBSCRIPTION_LIVE } from "./lib/interim";

const nextConfig: NextConfig = {
  // 🔴Next 16 부터 quality 는 **허용목록제**다. 여기 없는 값을 <Image quality={…}>
  //   에 적으면 그 사진이 통째로 안 나온다(빌드가 아니라 요청 때 막힌다).
  //   90 은 홈(components/LandingView)의 Shot 이 쓴다 — 거기 들어가는 것이 사진이
  //   아니라 얇은 선이 많은 도면·지도라, 기본값 75 로는 선 둘레에 티가 낀다.
  //   ⚠️75 를 빼지 말 것 — 값을 안 적은 모든 <Image> 가 그걸 쓴다.
  images: { qualities: [75, 90] },

  // 🔴맨 주소 /favicon.ico 를 이 폴더로 넘긴다.
  //   app/favicon.ico(Next 파일 규약)를 지웠기 때문에 필요하다 — 브랜드 그림의
  //   원본을 public/images/icon/ 한 곳으로 모으면서 그 사본을 걷어냈다.
  //   ⚠️redirect 가 아니라 rewrite 다. 주소를 바꾸지 않고 내용만 바꿔치기한다 —
  //     아이콘을 훑는 옛 크롤러 중에는 302 를 안 따라가는 것이 있다.
  //   ⚠️<head> 의 <link rel="icon"> 은 app/layout.tsx 가 따로 적는다.
  //     여기는 **링크를 안 읽고 /favicon.ico 부터 찔러 보는 쪽**을 위한 그물이다.
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/images/icon/MassLabs-favicon.ico" },
    ];
  },

  // 🔴/plan 은 /price 로 이름이 바뀌었다(2026-08-19). 그런데 이미 배포된
  //   라이노 플러그인이 https://masslabs-archi.com/plan 을 하드코딩해 물고 있고
  //   (LaserCuttingDrawings/laserfish_rhino/laserfish_rhino.cs), 쓰는 사람이
  //   플러그인을 새로 받기 전까지는 그 주소가 유일한 통로다.
  //   ⛔이 리다이렉트를 지우지 말 것 — 지우면 옛 플러그인 사용자는 요금제 화면을
  //     영영 못 연다. 물음표 뒤 값(?next=…)은 Next가 알아서 넘겨 준다.
  async redirects() {
    return [
      { source: "/plan", destination: "/price", permanent: true },
      // 🔴/download 는 2026-08-28 부터 **LaserFish 소개 사이트가 정본**이다(사용자 결정).
      //   같은 설치 안내가 두 저장소에 살면서 조용히 갈라지는 것을 끝내려고 화면을 지웠다.
      //   여기 남은 것은 옛 링크·즐겨찾기를 받아 넘기는 통로뿐이다.
      //   ⚠️permanent:false(307)로 둔다 — 308 로 캐시되면 되돌리기로 마음을 바꿔도
      //     브라우저가 기억한 리다이렉트 때문에 안쪽 /download 를 영영 못 연다.
      //     정말 굳었다 싶으면 그때 true 로 올릴 것(/plan 처럼).
      //   주소는 lib/products.ts 와 한 벌이다 — 한쪽만 고치지 말 것.
      {
        source: "/download",
        destination: "https://laserfish.masslabs-archi.com/download",
        permanent: false,
      },
      // 🔴🔴임시(2026-08-21) — 구독을 안 파는 동안 구독 화면 두 곳을 홈으로 돌린다.
      //   화면 파일은 그대로 두고 길만 막는다(lib/interim.ts의 SUBSCRIPTION_LIVE로 복귀).
      //   ⚠️permanent:false(307)여야 한다 — 308로 캐시되면 정기결제를 열어도
      //     브라우저가 기억한 리다이렉트 때문에 /subscribe가 안 열린다.
      //   🔴2026-08-27 — /account 의 되돌림을 걷어냈다. 새 홈 상단 막대의
      //     [My account]가 그리로 가야 하는데, 되돌려지면 누른 자리로 되튕겨
      //     "눌러도 아무 일이 없는 메뉴"가 된다.
      //     ⚠️열어도 안전한 이유 — /account 는 **보여 주기만** 하는 화면이다.
      //       결제를 시작하지 않는다(components/PlanTable 의 variant="status").
      //       /subscribe 는 **실제 결제 화면**이라 계속 막아 둔다.
      ...(SUBSCRIPTION_LIVE ? [] : [
        { source: "/subscribe", destination: "/", permanent: false },
      ]),
    ];
  },
};

export default nextConfig;
