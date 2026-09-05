import type { NextConfig } from "next";
import { SUBSCRIPTION_LIVE } from "./lib/interim";

// 🔴CSP 는 **Report-Only** 로 시작한다 — 아무것도 차단하지 않고 위반만 /api/csp-report
//   로 보고한다. 결제창(PortOne)이 여러 PG 도메인으로 튀어 script-src·frame-src 를
//   미리 다 적을 수 없어서, 실제 트래픽이 무엇을 부르는지 모은 뒤 목록을 굳히고
//   강제(Content-Security-Policy)로 전환한다. 지금 값은 "알려진 출처"의 첫 추정이다.
//   ⚠️강제로 바꾸기 전엔 홈·로그인·결제·후기를 돌려 보며 보고를 반드시 확인할 것 —
//     빠뜨린 도메인이 있으면 강제 순간 그 기능이 죽는다.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  // 'unsafe-inline' 은 Next 의 부트스트랩·fb-pixel 인라인 때문에 아직 필요하다.
  // 다음 단계에서 nonce 로 좁힌다(그래야 인라인 주입 XSS 까지 막힌다).
  "script-src 'self' 'unsafe-inline' https://connect.facebook.net",
  "connect-src 'self' https://api.portone.io https://tnadzbzvqwoxdghnesrl.supabase.co https://connect.facebook.net https://www.facebook.com https://open.er-api.com",
  "img-src 'self' data: blob: https://tnadzbzvqwoxdghnesrl.supabase.co https://www.facebook.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self' data:",
  "frame-src 'self' https://api.portone.io",
  "frame-ancestors 'self' https://*.masslabs-archi.com",
  "base-uri 'self'",
  "object-src 'none'",
  "report-uri /api/csp-report",
].join("; ");

const nextConfig: NextConfig = {
  // 🔴Next 16 부터 quality 는 **허용목록제**다. 여기 없는 값을 <Image quality={…}>
  //   에 적으면 그 사진이 통째로 안 나온다(빌드가 아니라 요청 때 막힌다).
  //   90 은 홈(components/LandingView)의 Shot 이 쓴다 — 거기 들어가는 것이 사진이
  //   아니라 얇은 선이 많은 도면·지도라, 기본값 75 로는 선 둘레에 티가 낀다.
  //   ⚠️75 를 빼지 말 것 — 값을 안 적은 모든 <Image> 가 그걸 쓴다.
  images: { qualities: [75, 90] },

  // 🔴보안 헤더 — 정상 동작엔 영향 없고 브라우저 방어막만 얹는다(2026-09-05).
  //   frame-ancestors 는 DENY 가 아니다: archiMap 이 /login 을 의도적으로 iframe 으로
  //   품으므로 가족 도메인은 허용하고 바깥만 막는다(클릭재킹). CSP script-src 는
  //   사이트를 하얗게 죽일 수 있어 여기 넣지 않는다 — 별도로 report-only 부터.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=5184000; includeSubDomains" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self' https://*.masslabs-archi.com" },
          // 🔴전체 정책은 아직 보고만 한다(차단 안 함). 위 frame-ancestors 만 강제다.
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
    ];
  },

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

  // 🔴/plan 은 /price 로 이름이 바뀌었다(2026-08-19). 옛 이름을 받아 넘긴다.
  //   ⚠️2026-08-29 확인 — **배포된 라이노 플러그인은 /plan 을 안 쓴다.** 그 주소를
  //     문 PLAN_URL·Gate 는 LaserCuttingDrawings 의 **커밋 안 된 작업본**에만 있다
  //     (릴리스된 2.2.3 은 /payment · /api/verify-payment 뿐인 건당결제다).
  //     그러니 "옛 플러그인이 이 길로 들어온다"는 말은 사실이 아니다.
  //   ⛔그래도 지우지 말 것 — 그 작업본을 배포하는 날 이 길이 필요하고, LaserFish
  //     소개 사이트(lib/site.ts)도 /plan 을 옛 이름으로 적어 두고 있다.
  //     물음표 뒤 값(?next=…)은 Next가 알아서 넘겨 준다.
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
      // 🔴/howtouse 도 2026-08-29 부터 **LaserFish 소개 사이트가 정본**이다(사용자 결정).
      //   /download 와 똑같은 이유다 — 탭·파라미터 설명·튜토리얼 영상이 두 저장소에
      //   한 벌씩 살면서 조용히 갈라지고 있었다. MassLabs 안쪽 화면은 지웠다.
      //   ⚠️307 로 둔다. 308 로 캐시되면 되돌리기로 마음을 바꿔도 브라우저가 기억한
      //     리다이렉트 때문에 안쪽 /howtouse 를 영영 못 연다.
      //   주소는 lib/products.ts 의 LASERFISH_GUIDE 와 한 벌이다 — 한쪽만 고치지 말 것.
      {
        source: "/howtouse",
        destination: "https://laserfish.masslabs-archi.com/guide",
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
        // 🔴/price 도 접는다(2026-08-29 사용자 결정) — 구독을 안 파는 동안 그 화면이
        //   그리는 것은 건당표인데, 건당결제 안내의 정본은 LaserFish 소개 사이트로
        //   갔고 구독표는 홈 가격 구역 한 벌뿐이다. 값 이야기를 한 곳으로 모은다.
        //   ⚠️307 이다. 308 로 캐시되면 구독을 다시 여는 날 /price 를 영영 못 연다.
        //   ⚠️화면 파일(app/price/page.tsx)은 그대로 있다 — 스위치를 켜면 산다.
        //   ⚠️/plan → /price → /#pricing 으로 두 번 튄다(옛 이름은 그대로 살아 있다).
        //   메뉴·단추가 보는 주소는 lib/interim.ts 의 PRICING_HREF 한 곳이다.
        { source: "/price", destination: "/#pricing", permanent: false },
      ]),
    ];
  },
};

export default nextConfig;
