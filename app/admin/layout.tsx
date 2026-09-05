import type { Metadata } from "next";
import "./admin.css";

// ==========================================================================
//  /admin 의 껍데기.
//
//  🔴검색엔진에서 완전히 뺀다. robots.ts 의 Disallow 는 "훑지 말라"일 뿐이고,
//    남이 링크를 걸면 주소가 결과에 뜰 수 있다 — noindex 가 진짜 방어다.
//  🔴전역 언어 띠·바닥글은 안 붙는다(lib/dark-pages.ts 에 "/admin" 을 넣어 뒀다).
//    관리자 화면은 제 상단 막대를 스스로 갖는다.
//  🔴여기는 번역하지 않는다. 보는 사람이 우리뿐이다 — i18n 사전에 넣지 말 것.
// ==========================================================================

export const metadata: Metadata = {
  title: "운영 현황",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="adm">{children}</div>;
}
