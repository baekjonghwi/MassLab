// ==========================================================================
//  요금제 — 검색결과에 뜰 제목·설명만 얹는 껍데기.
//
//  🔴화면(page.tsx)이 "use client" 라 거기서는 metadata 를 낼 수 없다(클라이언트
//    컴포넌트는 서버가 <head> 를 짓는 시점에 아직 없다). 그래서 이 자리에 서버
//    컴포넌트 한 겹을 두고 글만 붙인다 — 화면에 보이는 것은 아무것도 안 바꾼다.
//  🔴글은 lib/seo.ts 한 곳에서 짓는다. 여기 직접 적지 말 것.
// ==========================================================================

import { pageMeta } from "@/lib/seo";

// 🔴🔴설명이 **건당결제**를 말한다 — 지금 이 화면이 실제로 보여 주는 것이 그것이다
//   (lib/interim.ts 의 SUBSCRIPTION_LIVE 가 false 라 page.tsx 가 PerPieceContent 를 그린다).
//   ⛔구독(PLUS·PRO·MAX)을 여는 날 **이 글도 함께 바꿀 것.** 안 바꾸면 구독표가 뜨는
//     화면인데 검색결과는 건당결제라고 말하는, 눈에 안 보이는 거짓말이 남는다.
export const metadata = pageMeta({
  title: "Pricing",
  desc: "LaserFish is priced by the number of pieces. Pay only for what you need and get your cut-ready drawings right away.",
  path: "/price",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
