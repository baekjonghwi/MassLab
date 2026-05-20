"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";

export default function PrivacyPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = t[lang].privacy;

  return (
    <main style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", maxWidth: "800px", margin: "0 auto", padding: "60px 48px 80px" }}>

      <button
        onClick={() => router.back()}
        style={{
          background: "none",
          border: "none",
          fontSize: "0.82rem",
          color: "#888",
          cursor: "pointer",
          fontFamily: "inherit",
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "0",
          marginBottom: "40px",
        }}
      >
        {tr.back}
      </button>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>{tr.title}</h1>

      {tr.sections.map((section, i) => (
        <section key={i} style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 600, marginBottom: "12px" }}>{section.title}</h2>
          {"body" in section && section.body && (
            <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9, whiteSpace: "pre-line" }}>
              {section.body}
            </p>
          )}
          {"list" in section && section.list && (
            <ul style={{ fontSize: "0.88rem", color: "#555", lineHeight: 2, marginTop: "8px", paddingLeft: "20px" }}>
              {section.list.map((item, j) => <li key={j}>{item}</li>)}
            </ul>
          )}
          {"body2" in section && section.body2 && (
            <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9, marginTop: "8px" }}>
              {section.body2}
            </p>
          )}
        </section>
      ))}

      <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "48px" }}>{tr.effectiveDate}</p>
    </main>
  );
}
