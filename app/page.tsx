"use client";
import HomeView from "@/components/HomeView";
import { SUBSCRIPTION_LIVE } from "@/lib/interim";

// ==========================================================================
//  홈. 본체는 components/HomeView.tsx 에 있다.
//
//  🔴여기서 화면을 그리지 않는 이유 — 같은 홈을 /main 도 그린다(구독을 팔던
//    시절의 모습 그대로, PG 심사에 내는 주소다). 두 곳이 각자 그리면 언젠가
//    반드시 어긋난다.
// ==========================================================================

export default function Home() {
  return <HomeView subscriptionLive={SUBSCRIPTION_LIVE} />;
}
