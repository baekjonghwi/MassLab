"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";

export default function ContactPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = t[lang].contact;

  return (
    <main style={{ fontFamily: "-apple-system, 'Helvetica Neue', sans-serif", background: "#fff", color: "#111", minHeight: "100vh" }}>
      <style>{`
        * { box-sizing: border-box; }
        .hnav-link {
          font-size: 0.875rem;
          color: #444;
          text-decoration: none;
          padding: 7px 14px;
          border-radius: 8px;
          font-weight: 500;
          transition: background 0.15s, color 0.15s;
          cursor: pointer;
          white-space: nowrap;
        }
        .hnav-link:hover { background: #f2f2f2; color: #111; }
        @media (max-width: 640px) {
          .hnav-links { display: none; }
          .contact-nav-inner { padding-left: 16px !important; padding-right: 16px !important; }
          .contact-content { padding-left: 20px !important; padding-right: 20px !important; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky",
        top: 0,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ebebeb",
        zIndex: 100,
      }}>
        <div className="contact-nav-inner" style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "0 48px",
          height: "58px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <button
            onClick={() => router.push("/")}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.03em", color: "#111" }}>
              MassLabs
            </span>
          </button>

          <div className="hnav-links" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            <a href="/howtouse" className="hnav-link">
              {lang === "ko" ? "사용방법" : "How to Use"}
            </a>
            <a href="/download" className="hnav-link">
              {lang === "ko" ? "다운로드" : "Download"}
            </a>
            <a href="/#pricing" className="hnav-link">
              {lang === "ko" ? "비용" : "Pricing"}
            </a>
            <a href="/contact" className="hnav-link" style={{ color: "#111", fontWeight: 700 }}>
              {lang === "ko" ? "문의하기" : "Contact"}
            </a>
          </div>
        </div>
      </nav>

      <div className="contact-content" style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 48px 80px" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "40px" }}>{tr.title}</h1>

        <section style={{ marginBottom: "32px" }}>
          <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
            {tr.inquiryText} <strong>masslabs.archi@gmail.com</strong>
          </p>
        </section>
      </div>
    </main>
  );
}
