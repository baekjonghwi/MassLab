"use client";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { DARK_PAGES } from "@/lib/dark-pages";

export default function LanguageBar() {
  const { lang, setLang } = useLanguage();
  const pathname = usePathname();

  // 🔴이 밝은 띠를 안 그리는 화면들 — 저마다 어두운 상단 막대와 EN/한국어
  //   토글을 제 안에 갖고 있다. 그리면 두 벌이 겹치고, 어두운 화면 위에
  //   흰 띠 하나가 얹혀 남의 사이트처럼 보인다.
  //   · /               홈 (components/LandingView)
  //   · /login          로그인 (components/AuthCard 의 AuthShell)
  //   · /reset-password 비밀번호 재설정 (같은 AuthShell)
  //   · /account · /price · /policy/*  (판정은 lib/dark-pages.ts 한 곳에서 한다)
  if (DARK_PAGES.includes(pathname)) return null;

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "6px 48px",
      background: "#fff",
      borderBottom: "1px solid #f0f0f0",
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      gap: "4px",
    }}>
      <button
        onClick={() => setLang("en")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "0.75rem",
          fontFamily: "inherit",
          fontWeight: lang === "en" ? 700 : 400,
          color: lang === "en" ? "#1a1a1a" : "#bbb",
          padding: "2px 6px",
          borderRadius: "4px",
          transition: "color 0.15s",
        }}
      >
        EN
      </button>
      <span style={{ color: "#ddd", fontSize: "0.7rem" }}>|</span>
      <button
        onClick={() => setLang("ko")}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "0.75rem",
          fontFamily: "inherit",
          fontWeight: lang === "ko" ? 700 : 400,
          color: lang === "ko" ? "#1a1a1a" : "#bbb",
          padding: "2px 6px",
          borderRadius: "4px",
          transition: "color 0.15s",
        }}
      >
        한국어
      </button>
    </div>
  );
}
