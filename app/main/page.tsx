"use client";
import HomeView from "@/components/HomeView";

// ==========================================================================
//  /main — **구독을 팔던 시절의 홈 그대로.** PG 가맹점 심사에 내는 주소다.
//
//  🔴왜 필요한가 —
//    홈(/)은 지금 임시로 LaserFish 건당결제만 싣고 있다(lib/interim.ts 의
//    SUBSCRIPTION_LIVE=false, 2026-08-21 결정). 그 화면만 심사에 내면 심사가
//    "건당결제"만 대상으로 통과되고, 구독을 여는 날 재심사·변경신청을 다시
//    해야 한다 — 갤럭시아에서 서비스명이 LaserFish 단일로 신고돼 겪었던 일이다.
//
//  🔴화면을 새로 그리지 않는다. HomeView 에 subscriptionLive=true 를 넘겨
//    **분리 이전의 홈을 그대로** 되살린다. 심사에 낸 화면과 구독을 여는 날
//    실제로 열릴 화면이 같은 파일이어야 둘이 어긋나지 않는다.
//
//  ⚠️이 화면은 그림만 되살린다. **파는 것은 여전히 없다** — /subscribe 는
//    next.config.ts 가 홈으로 돌리고 있고, 표의 [구독하기]는 /price 로 간다.
//
//  ⚠️구독을 실제로 열면(SUBSCRIPTION_LIVE=true) 홈이 이 화면과 같아진다.
//    그때 이 파일을 지우면 된다.
// ==========================================================================

export default function MainPage() {
  return <HomeView subscriptionLive />;
}
