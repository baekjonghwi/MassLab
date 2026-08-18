import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🔴/plan 은 /price 로 이름이 바뀌었다(2026-08-19). 그런데 이미 배포된
  //   라이노 플러그인이 https://masslabs-archi.com/plan 을 하드코딩해 물고 있고
  //   (LaserCuttingDrawings/laserfish_rhino/laserfish_rhino.cs), 쓰는 사람이
  //   플러그인을 새로 받기 전까지는 그 주소가 유일한 통로다.
  //   ⛔이 리다이렉트를 지우지 말 것 — 지우면 옛 플러그인 사용자는 요금제 화면을
  //     영영 못 연다. 물음표 뒤 값(?next=…)은 Next가 알아서 넘겨 준다.
  async redirects() {
    return [{ source: "/plan", destination: "/price", permanent: true }];
  },
};

export default nextConfig;
