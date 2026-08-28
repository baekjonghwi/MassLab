"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";
import { DARK_PAGES } from "@/lib/dark-pages";

export default function LayoutFooter() {
  const { lang } = useLanguage();
  const tr = t[lang].footer;
  const pathname = usePathname();

  // 🔴어두운 화면들에는 이 밝은 바닥글을 붙이지 않는다(LanguageBar 와 같은 목록).
  //   홈은 제 안에 어두운 바닥글을 갖고 있고 — 글의 출처는 여전히 여기와 같은
  //   lib/translations 의 footer 하나뿐이다 — 로그인·재설정 화면은 바닥글 자체가
  //   필요 없다(막다른 길이 되지 않게 AuthShell 이 [홈으로]를 갖고 있다).
  if (DARK_PAGES.includes(pathname)) return null;

  return (
    <footer style={{
      borderTop: "1px solid #eee",
      padding: "40px 48px",
      marginTop: "auto",
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ fontSize: "0.72rem", color: "#999", lineHeight: 1.7, marginBottom: "20px" }}>
          <p>{tr.businessInfo1}</p>
          <p>{tr.businessInfo2}</p>
        </div>
        <div style={{ display: "flex", gap: "24px", fontSize: "0.78rem" }}>
          <Link href="/policy/terms-and-policy" style={{ color: "#666", textDecoration: "none" }}>{tr.termsAndPolicy}</Link>
          <Link href="/policy/privacy" style={{ color: "#666", textDecoration: "none" }}>{tr.privacy}</Link>
        </div>
      </div>
    </footer>
  );
}
