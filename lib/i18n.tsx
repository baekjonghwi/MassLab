"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "en" | "ko";

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const saved = localStorage.getItem("lang") as Lang;
    if (saved === "en" || saved === "ko") {
      setLang(saved);
    } else if (navigator.language?.toLowerCase().startsWith("ko")) {
      // 저장된 선택이 없으면 브라우저 언어로 자동 결정 (한국어 브라우저 → 한국어)
      setLang("ko");
    }
  }, []);

  // 🔴<html lang> 도 함께 갱신한다. app/layout.tsx 는 서버 컴포넌트라 lang="en" 으로
  //   고정돼 있는데, 그대로 두면 한국어 본문을 스크린리더·번역기·검색엔진이 영어로 읽는다.
  //   여기서 처리해야 초기 자동판정(저장값·브라우저 언어)과 언어 토글이 한 곳에서 끝난다 —
  //   layout 쪽에 따로 심으면 판정 로직이 두 벌이 되어 반드시 어긋난다.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
