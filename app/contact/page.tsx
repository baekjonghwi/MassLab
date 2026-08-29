"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";
import { LASERFISH_DOWNLOAD, LASERFISH_GUIDE } from "@/lib/products";
import { PRICING_HREF } from "@/lib/interim";

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
        /* 🔴문의는 메일 주소 한 줄이 전부다(2026-08-24 결정).
             카드도, 폼도, 링크도 두지 않는다 — 눌러야 열리는 것을 두면 그
             프로그램을 안 쓰는 사람이 거기서 막힌다. 읽고 복사하면 된다. */
        .contact-mail {
          display: inline-block;
          font-size: 1.05rem;
          font-weight: 600;
          color: #111;
          letter-spacing: -0.01em;
          /* 한 번 집으면 주소만 잡힌다 — 앞뒤 글이 같이 끌려오지 않는다 */
          user-select: all;
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
            {/* 🔴밖으로 나간다(2026-08-29) — 사용방법의 정본은 LaserFish 소개 사이트다 */}
            <a href={LASERFISH_GUIDE} className="hnav-link">
              {lang === "ko" ? "사용방법" : "How to Use"}
            </a>
            {/* 🔴밖으로 나간다(2026-08-28) — 설치 안내의 정본은 LaserFish 소개 사이트다 */}
            <a href={LASERFISH_DOWNLOAD} className="hnav-link">
              {lang === "ko" ? "다운로드" : "Download"}
            </a>
            {/* 🔴구독을 안 파는 동안에는 홈의 가격 구역으로 간다(lib/interim.ts) */}
            <a href={PRICING_HREF} className="hnav-link">
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

          <span className="contact-mail">masslabs.archi@gmail.com</span>
        </section>
      </div>
    </main>
  );
}
