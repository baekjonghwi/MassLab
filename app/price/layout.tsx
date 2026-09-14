// ==========================================================================
//  요금제 — 검색결과에 뜰 제목·설명만 얹는 껍데기.
//
//  🔴화면(page.tsx)이 "use client" 라 거기서는 metadata 를 낼 수 없다(클라이언트
//    컴포넌트는 서버가 <head> 를 짓는 시점에 아직 없다). 그래서 이 자리에 서버
//    컴포넌트 한 겹을 두고 글만 붙인다 — 화면에 보이는 것은 아무것도 안 바꾼다.
//  🔴글은 lib/seo.ts 한 곳에서 짓는다. 여기 직접 적지 말 것.
// ==========================================================================

import { pageMeta } from "@/lib/seo";

// 🔴설명은 **구독**을 말한다 — 이 화면이 그리는 것이 구독표 하나다(2026-09-14, 건당결제
//   코드를 걷어내면서 함께 고쳤다. 전에는 "조각 수로 값을 매긴다"는 건당결제 문구였다).
export const metadata = pageMeta({
  title: "Pricing",
  desc: "One MassLabs subscription covers every program, including archiMap and LaserFish. Compare the PLUS, PRO and MAX plans.",
  path: "/price",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
