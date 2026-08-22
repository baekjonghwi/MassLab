import type { NextConfig } from "next";
import { SUBSCRIPTION_LIVE } from "./lib/interim";

const nextConfig: NextConfig = {
  // 🔴/plan 은 /price 로 이름이 바뀌었다(2026-08-19). 그런데 이미 배포된
  //   라이노 플러그인이 https://masslabs-archi.com/plan 을 하드코딩해 물고 있고
  //   (LaserCuttingDrawings/laserfish_rhino/laserfish_rhino.cs), 쓰는 사람이
  //   플러그인을 새로 받기 전까지는 그 주소가 유일한 통로다.
  //   ⛔이 리다이렉트를 지우지 말 것 — 지우면 옛 플러그인 사용자는 요금제 화면을
  //     영영 못 연다. 물음표 뒤 값(?next=…)은 Next가 알아서 넘겨 준다.
  async redirects() {
    return [
      { source: "/plan", destination: "/price", permanent: true },
      // 🔴🔴임시(2026-08-21) — 구독을 안 파는 동안 구독 화면 두 곳을 홈으로 돌린다.
      //   화면 파일은 그대로 두고 길만 막는다(lib/interim.ts의 SUBSCRIPTION_LIVE로 복귀).
      //   ⚠️permanent:false(307)여야 한다 — 308로 캐시되면 정기결제를 열어도
      //     브라우저가 기억한 리다이렉트 때문에 /subscribe가 안 열린다.
      //   🔴?preview 가 붙어 있으면 비껴간다. /main(심사용, 구독을 팔던 시절의 홈)
      //     에서 [내 구독]을 누른 사람이 홈으로 튕기면, 구독표를 보다 건당결제
      //     화면에 떨어져 "왜 옛날 걸로 돌아갔지"가 된다.
      //     ⚠️/account 는 보여 주기만 하는 화면이라 열어도 안전하다(결제를
      //       시작하지 않는다 — components/PlanTable 의 variant="status").
      //       /subscribe 는 **실제 결제 화면**이라 preview 로도 열지 않는다.
      ...(SUBSCRIPTION_LIVE ? [] : [
        {
          source: "/account",
          missing: [{ type: "query" as const, key: "preview" }],
          destination: "/",
          permanent: false,
        },
        { source: "/subscribe", destination: "/", permanent: false },
      ]),
    ];
  },
};

export default nextConfig;
