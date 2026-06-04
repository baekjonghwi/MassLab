"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";

export default function LayoutFooter() {
  const { lang } = useLanguage();
  const tr = t[lang].footer;

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
