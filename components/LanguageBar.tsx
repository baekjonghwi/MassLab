"use client";
import { useLanguage } from "@/lib/i18n";

export default function LanguageBar() {
  const { lang, setLang } = useLanguage();

  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      alignItems: "center",
      padding: "6px 48px",
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
