"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";

export default function ContactPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = t[lang].contact;

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

      <section style={{ marginBottom: "32px" }}>
        <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
          {tr.inquiryText} <strong>masslabs.archi@gmail.com</strong>
        </p>
      </section>
    </main>
  );
}
