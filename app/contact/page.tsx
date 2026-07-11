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
        .contact-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px 22px;
          border: 1px solid #ebebeb;
          border-radius: 14px;
          background: #fff;
          text-decoration: none;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
        }
        .contact-card:hover {
          border-color: #d8d8d8;
          box-shadow: 0 6px 20px rgba(0,0,0,0.06);
          transform: translateY(-1px);
        }
        .contact-card:hover .contact-card-arrow { transform: translateX(3px); color: #111; }
        .contact-card-icon {
          width: 46px; height: 46px; flex-shrink: 0;
          border-radius: 12px; background: #f5f5f5;
          display: flex; align-items: center; justify-content: center;
        }
        @media (max-width: 640px) {
          .contact-nav-inner {
            flex-direction: column !important;
            height: auto !important;
            gap: 6px;
            padding: 10px 16px !important;
          }
          .hnav-links { flex-wrap: wrap; justify-content: center; gap: 0 !important; }
          .hnav-link { padding: 6px 9px; font-size: 0.8rem; }
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
          <p style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9, marginBottom: "28px" }}>
            {tr.inquiryText}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "460px" }}>
            {/* Gmail */}
            <a
              className="contact-card"
              href="https://mail.google.com/mail/?view=cm&to=masslabs.archi@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" fill="#fff" stroke="#ddd" strokeWidth="1.2"/>
                  <path d="M2 6l10 7L22 6" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "0.92rem", fontWeight: 600, color: "#111" }}>{tr.gmailLabel}</span>
                <span style={{ display: "block", fontSize: "0.8rem", color: "#888", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>masslabs.archi@gmail.com</span>
              </span>
              <span className="contact-card-arrow" style={{ color: "#ccc", fontSize: "1.1rem", transition: "transform 0.15s, color 0.15s" }}>→</span>
            </a>

            {/* Instagram */}
            <a
              className="contact-card"
              href="https://www.instagram.com/masslabs_archi/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="contact-card-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.8" fill="#333" stroke="none"/>
                </svg>
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontSize: "0.92rem", fontWeight: 600, color: "#111" }}>{tr.instaLabel}</span>
                <span style={{ display: "block", fontSize: "0.8rem", color: "#888", marginTop: "2px" }}>@masslabs_archi</span>
              </span>
              <span className="contact-card-arrow" style={{ color: "#ccc", fontSize: "1.1rem", transition: "transform 0.15s, color 0.15s" }}>→</span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
