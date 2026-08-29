// ==========================================================================
//  문의 — 검색결과에 뜰 제목·설명만 얹는 껍데기.
//
//  🔴화면(page.tsx)이 "use client" 라 거기서는 metadata 를 낼 수 없다(클라이언트
//    컴포넌트는 서버가 <head> 를 짓는 시점에 아직 없다). 그래서 이 자리에 서버
//    컴포넌트 한 겹을 두고 글만 붙인다 — 화면에 보이는 것은 아무것도 안 바꾼다.
//  🔴글은 lib/seo.ts 한 곳에서 짓는다. 여기 직접 적지 말 것.
// ==========================================================================

import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Contact",
  desc: "Questions about getting started, and technical support. Leave a message and we will get back to you.",
  path: "/contact",
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
