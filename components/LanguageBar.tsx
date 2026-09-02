"use client";
import { usePathname } from "next/navigation";
import { DARK_PAGES } from "@/lib/dark-pages";
import LanguageMenu from "@/components/LanguageMenu";

export default function LanguageBar() {
  const pathname = usePathname();

  // 🔴이 밝은 띠를 안 그리는 화면들 — 저마다 어두운 상단 막대와 언어 단추를
  //   제 안에 갖고 있다. 그리면 두 벌이 겹치고, 어두운 화면 위에
  //   흰 띠 하나가 얹혀 남의 사이트처럼 보인다.
  //   · /               홈 (components/LandingView)
  //   · /login          로그인 (components/AuthCard 의 AuthShell)
  //   · /reset-password 비밀번호 재설정 (같은 AuthShell)
  //   · /account · /price · /policy/*  (판정은 lib/dark-pages.ts 한 곳에서 한다)
  if (DARK_PAGES.includes(pathname)) return null;

  // 🔴단추의 모양·목록은 components/LanguageMenu 한 곳에서 온다(2026-09-03).
  //   여기 색을 따로 적지 말 것 — 그 부품이 밝은 바탕에서는 밝은 뒤값을 쓴다.
  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "6px 48px",
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
    }}>
      <LanguageMenu />
    </div>
  );
}
