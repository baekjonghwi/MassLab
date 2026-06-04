"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const downloads = [
  { href: "/downloads/LaserFish_Rh8.zip", label: "Rhino 8", sub: "Windows" },
  { href: "/downloads/LaserFish_Rh8_mac.zip", label: "Rhino 8", sub: "macOS" },
  { href: "/downloads/LaserFish_Rh7.zip", label: "Rhino 7", sub: "Windows" },
];

const components = [
  { icon: "/images/icon/WallAndSlab.svg", name: "WallAndSlab", desc: { ko: "벽·슬라브·창문·지붕", en: "Wall & Slab & Window & Roof" } },
  { icon: "/images/icon/Terrain.svg", name: "Terrain", desc: { ko: "지형·주변 건물", en: "Terrain & Buildings" } },
];

export default function DownloadPage() {
  const router = useRouter();
  const { lang } = useLanguage();

  return (
    <main style={{
      fontFamily: "var(--font-geist-sans), -apple-system, sans-serif",
      background: "#fff",
      color: "#111",
      minHeight: "100vh",
    }}>
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

        .dl-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border: 1.5px solid #e4e4e4;
          border-radius: 12px;
          background: #fff;
          text-decoration: none;
          color: #111;
          transition: border-color 0.15s, box-shadow 0.15s, transform 0.1s;
        }
        .dl-row:hover {
          border-color: #111;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }

        .label-cap {
          font-size: 0.7rem;
          font-weight: 700;
          color: #c0c0c0;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        @media (max-width: 640px) {
          .hnav-links { display: none; }
          .dl-nav-inner { padding-left: 16px !important; padding-right: 16px !important; }
          .dl-content { padding: 40px 20px 80px !important; }
          .dl-components-grid { flex-direction: column !important; }
          .dl-banner { flex-direction: column !important; align-items: flex-start !important; }
          .dl-banner button { width: 100% !important; margin-left: 0 !important; }
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
        <div className="dl-nav-inner" style={{
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
            <a href="/download" className="hnav-link" style={{ color: "#111", fontWeight: 700 }}>
              {lang === "ko" ? "다운로드" : "Download"}
            </a>
            <a href="/#pricing" className="hnav-link">
              {lang === "ko" ? "비용" : "Pricing"}
            </a>
            <a href="/contact" className="hnav-link">
              {lang === "ko" ? "문의하기" : "Contact"}
            </a>
          </div>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div className="dl-content" style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 48px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: "56px" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#bbb", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "14px" }}>
            LaserFish
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
            marginBottom: "16px",
          }}>
            {lang === "ko" ? "다운로드" : "Download"}
          </h1>
        </div>

        {/* Includes */}
        <div style={{ marginBottom: "52px" }}>
          <div className="label-cap">
            {lang === "ko" ? "포함된 컴포넌트" : "Included components"}
          </div>
          <div className="dl-components-grid" style={{ display: "flex", gap: "12px" }}>
            {components.map(c => (
              <div key={c.name} style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "16px 20px",
                border: "1.5px solid #ebebeb",
                borderRadius: "14px",
                background: "#fafafa",
              }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.icon} width="30" height="30" alt="" style={{ display: "block", flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "3px" }}>{c.name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#999" }}>{c.desc[lang]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Downloads */}
        <div style={{ maxWidth: "480px" }}>
          <div>
            <div className="label-cap">{lang === "ko" ? "다운로드" : "Download"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {downloads.map(({ href, label, sub }) => (
                <a key={href} href={href} download className="dl-row">
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div style={{
                      width: "38px",
                      height: "38px",
                      borderRadius: "10px",
                      background: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.92rem", fontWeight: 700 }}>{label}</div>
                      <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "2px" }}>{sub}</div>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M5 3l4 4-4 4" stroke="#ccc" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              ))}
            </div>

            <p style={{
              fontSize: "0.75rem",
              color: "#bbb",
              marginTop: "16px",
              lineHeight: 1.6,
            }}>
              {lang === "ko"
                ? "Rhino 7 이상, Windows / macOS 지원"
                : "Requires Rhino 7 or above · Windows & macOS"}
            </p>
          </div>
        </div>

        {/* How to Use link */}
        <div className="dl-banner" style={{
          marginTop: "60px",
          padding: "24px 28px",
          background: "#f7f7f7",
          borderRadius: "14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: "0.92rem", fontWeight: 700, marginBottom: "4px" }}>
              {lang === "ko" ? "사용 방법이 궁금하신가요?" : "Want to learn how to use it?"}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#888" }}>
              {lang === "ko"
                ? "파라미터 설명과 튜토리얼 영상을 확인하세요"
                : "Check the parameter guide and tutorial videos"}
            </div>
          </div>
          <button
            onClick={() => router.push("/howtouse")}
            style={{
              background: "#111",
              color: "#fff",
              border: "none",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              flexShrink: 0,
              marginLeft: "16px",
            }}
          >
            {lang === "ko" ? "사용방법 보기" : "View Guide"}
          </button>
        </div>

      </div>
    </main>
  );
}
