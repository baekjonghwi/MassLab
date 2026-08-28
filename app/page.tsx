"use client";
import LandingView from "@/components/LandingView";

// ==========================================================================
//  홈. 본체는 components/LandingView.tsx 에 있다.
//
//  홈은 제품 전체(archiMap · Colorgram · LaserFish)를 소개하는 어두운 랜딩이다.
//  🔴2026-08-28 — **홈이 하나로 돌아왔다.** 전에는 구독을 팔던 시절의 홈을 얼려 둔
//    /main(components/HomeView)이 PG 심사용으로 따로 있었지만, 심사 주소를 이
//    화면으로 바꾸기로 하면서 /main · HomeView · AuthNavLink · ?preview 배선을
//    통째로 지웠다. 이제 홈은 여기 하나뿐이다.
//
//  ⚠️LanguageBar 와 LayoutFooter(둘 다 밝은 화면)는 이 주소에서만 안 그려진다.
//    LandingView 가 어두운 상단 막대와 바닥글을 제 안에 갖고 있기 때문이다.
//    판정은 각 컴포넌트가 usePathname 으로 한다.
// ==========================================================================

export default function Home() {
  return <LandingView />;
}
