"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

type Tab = "wall" | "terrain" | "centerline";

interface Feature {
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  img: string | null;
  video?: string;
}

const wallFeatures: Feature[] = [
  {
    title: {
      ko: "하루가 걸리던 도면 작업, 이제 3분이면 충분합니다",
      en: "Drawings that took a full day — done in 3 minutes",
    },
    desc: {
      ko: "레이저커팅 도면을 짜시는데 하루 이상이 소모된다고요? LaserFish는 3분 이내로 도면을 짜드립니다.",
      en: "Spending over a day on laser cutting drawings? LaserFish generates them in under 3 minutes.",
    },
    img: "/images/WallAndSlab/slide_1_수정.png",
  },
  {
    title: {
      ko: "번호 매겨진 3D 모델로 조립 가이드 제공",
      en: "Numbered 3D model for guided assembly",
    },
    desc: {
      ko: "모형 사이즈의 모델링이 제공되어 따라 조립하면 됩니다. 모델링과 레이저 커팅 도면에 번호가 적혀져 있습니다.",
      en: "A scale 3D model is provided to guide assembly. Both the model and the cutting drawings share the same numbering.",
    },
    img: "/images/WallAndSlab/slide_2.png",
  },
  {
    title: {
      ko: "연결된 벽체를 재질 두께 기반으로 자동 재생성",
      en: "Auto-regenerate walls based on material thickness",
    },
    desc: {
      ko: "서로 연결되어 있는 벽체를 재질 두께를 바탕으로 재생성합니다.",
      en: "Connected walls are automatically regenerated based on the material thickness you specify.",
    },
    img: "/images/WallAndSlab/slide_3_수정.jpg",
  },
  {
    title: {
      ko: "곡면 형상도 자유자재로",
      en: "Curved surfaces handled with precision",
    },
    desc: {
      ko: "곡면이 구부러질 수 있도록 결에 따라 각인이 새겨집니다. 변곡점을 기준으로 오목·볼록한 부분을 분리합니다.",
      en: "Engravings are added along the grain so surfaces can bend. Concave and convex sections are split at inflection points.",
    },
    img: "/images/WallAndSlab/slide_4_수정.jpg",
  },
  {
    title: {
      ko: "외곽선·내부선·각인선 자동화",
      en: "Outline, inner line & engraving automation",
    },
    desc: {
      ko: "외곽선(핑크색), 내부선(빨간색), 선각인(파란색)이 구분됩니다. 슬라브 위에 있는 벽을 감지해 선이 각인됩니다.",
      en: "Outline (pink), inner line (red), and engraving (blue) lines are automated. Walls above slabs are detected and engraved automatically.",
    },
    img: "/images/WallAndSlab/slide_5.png",
  },
];

const terrainFeatures: Feature[] = [
  {
    title: {
      ko: "하루가 걸리던 도면 작업, 이제 3분이면 충분합니다",
      en: "Drawings that took a full day — done in 3 minutes",
    },
    desc: {
      ko: "레이저커팅 도면을 짜시는데 하루 이상이 소모된다고요? LaserFish는 3분 이내로 도면을 짜드립니다.",
      en: "Spending over a day on laser cutting drawings? LaserFish generates them in under 3 minutes.",
    },
    img: "/images/Terrain/slide_1_수정.png",
  },
  {
    title: {
      ko: "지형 서피스로 재질 두께에 맞춘 계단형 지형 생성",
      en: "Terrain auto-generated from surface with material thickness",
    },
    desc: {
      ko: "지형 서피스를 넣으면 재질두께에 맞춰 지형을 생성합니다. 건물이 서피스 아래로 튀어나와 있어도 그에 맞게 지형을 생성합니다.",
      en: "Input a terrain surface and get a model cut to your material thickness. Handles buildings that protrude below the surface.",
    },
    img: "/images/Terrain/slide_2.png",
  },
  {
    title: {
      ko: "번호 매겨진 3D 모델로 조립 가이드 제공",
      en: "Numbered 3D model for guided assembly",
    },
    desc: {
      ko: "모형 사이즈의 모델링이 제공되어 따라 조립하면 됩니다. 모델링과 레이저 커팅 도면에 번호가 적혀져 있습니다.",
      en: "A scale 3D model is provided to guide assembly. Both the model and the cutting drawings share the same numbering.",
    },
    img: "/images/Terrain/slide_3.png",
  },
  {
    title: {
      ko: "쌓기 방식·접기 방식으로 건물조립방식 선택",
      en: "Choose stacking or folding method for buildings",
    },
    desc: {
      ko: "쌓기 방식 또는 접기 방식으로 원하는 건물 표현 방식을 선택할 수 있습니다.",
      en: "Select the stacking or folding approach for building representation in your terrain model.",
    },
    img: "/images/Terrain/slide_4.png",
  },
  {
    title: {
      ko: "외곽선·내부선·각인선 자동화",
      en: "Outline, inner line & engraving automation",
    },
    desc: {
      ko: "외곽선(핑크색), 내부선(빨간색), 선각인(파란색) 자동화! 건물위치각인 및 지형위치 각인을 체크하시면 위치가 각인됩니다.",
      en: "Outline (pink), inner line (red), and engraving (blue) lines are automated. Enable building and terrain position engravings with a checkbox.",
    },
    img: "/images/Terrain/slide_5.png",
  },
];

const centerlineFeatures: Feature[] = [
  {
    title: {
      ko: "건축 전용 벽체 중심선 자동 추출",
      en: "Architecture-tuned wall centerline extraction",
    },
    desc: {
      ko: "두께를 가진 벽체 형상에서 건축 도면에 최적화된 중심선을 자동으로 추출합니다. 복잡하게 얽힌 벽체와 교차부도 끊김 없이 하나의 깔끔한 중심선으로 정리되어, 도면 정리와 모델링 작업 시간을 크게 줄여줍니다.",
      en: "Automatically extracts architecture-optimized centerlines from walls with thickness. Even tangled walls and intersections are resolved into clean, continuous single lines — dramatically reducing drawing cleanup and modeling time.",
    },
    img: null,
    video: "/video/centerline.mp4",
  },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("wall");
  const [usdToKrw, setUsdToKrw] = useState<number>(1500);
  const router = useRouter();
  const { lang } = useLanguage();

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        const rate: number = data?.rates?.KRW;
        if (rate) setUsdToKrw(rate);
      })
      .catch(() => {});
  }, []);

  const krwWallAndSlab = Math.round(0.1 * usdToKrw);
  const krwTerrain = Math.round(0.05 * usdToKrw);

  const features =
    activeTab === "wall"
      ? wallFeatures
      : activeTab === "terrain"
      ? terrainFeatures
      : centerlineFeatures;
  const L = (t: { ko: string; en: string }) => t[lang] ?? t.ko;

  return (
    <main style={{
      fontFamily: "var(--font-geist-sans), -apple-system, 'Helvetica Neue', sans-serif",
      background: "#ffffff",
      color: "#111111",
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

        .hero-dl-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #ffffff;
          color: #111;
          border: none;
          padding: 14px 32px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          letter-spacing: -0.01em;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 2px 16px rgba(0,0,0,0.15);
        }
        .hero-dl-btn:hover { opacity: 0.9; transform: translateY(-1px); }

        .tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 28px;
          border-radius: 14px;
          border: 2px solid #e8e8e8;
          background: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.95rem;
          font-weight: 600;
          color: #888;
          transition: all 0.2s;
        }
        .tab-btn:hover { border-color: #ccc; color: #444; }
        .tab-btn.active {
          border-color: #111;
          color: #111;
          background: #fff;
          box-shadow: 0 2px 12px rgba(0,0,0,0.1);
        }

        .feature-row {
          display: flex;
          align-items: center;
          gap: 72px;
          padding: 80px 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .feature-row:last-child { border-bottom: none; }
        .feature-row.rev { flex-direction: row-reverse; }

        .feature-img-box {
          width: 52%;
          flex-shrink: 0;
          aspect-ratio: 16/10;
          border-radius: 18px;
          overflow: hidden;
          background: #f0f0f0;
        }
        .feature-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .feature-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #bbb;
          font-size: 0.8rem;
          letter-spacing: 0.04em;
        }

        .centerline-block {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
          padding: 24px 0 64px;
        }
        .centerline-video-box {
          width: 85%;
          max-width: 1000px;
          aspect-ratio: 16/10;
          border-radius: 18px;
          overflow: hidden;
          background: #f0f0f0;
        }
        .centerline-video-box video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }
        .centerline-text {
          text-align: center;
          max-width: 680px;
        }
        .centerline-text .feature-desc {
          margin: 0 auto;
        }

        .feature-num {
          font-size: 0.72rem;
          font-weight: 700;
          color: #bbb;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .feature-title {
          font-size: 1.8rem;
          font-weight: 800;
          line-height: 1.25;
          margin-bottom: 18px;
          letter-spacing: -0.025em;
          color: #111;
        }
        .feature-desc {
          font-size: 1rem;
          line-height: 1.75;
          color: #666;
        }

        .price-card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 24px;
          padding: 48px 40px;
          max-width: 440px;
          margin: 0 auto;
          box-shadow: 0 4px 32px rgba(0,0,0,0.07);
          text-align: center;
        }
        .price-amount {
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          color: #111;
          line-height: 1;
        }
        .price-unit {
          font-size: 0.9rem;
          color: #999;
          margin-top: 8px;
        }
        .price-detail {
          border-top: 1px solid #f0f0f0;
          margin-top: 28px;
          padding-top: 20px;
          font-size: 0.875rem;
          color: #777;
          line-height: 2;
        }

        @media (max-width: 800px) {
          .feature-row, .feature-row.rev {
            flex-direction: column;
            gap: 32px;
            padding: 48px 0;
          }
          .feature-img-box { width: 100%; }
          .centerline-video-box { width: 100%; }
          .feature-title { font-size: 1.4rem; }
        }

        @media (max-width: 640px) {
          .hnav-links { display: none; }
          .main-nav-inner { padding-left: 16px !important; padding-right: 16px !important; }
          .main-hero { padding: 72px 20px 80px !important; }
          .main-features { padding-left: 20px !important; padding-right: 20px !important; }
          .main-pricing { padding-left: 20px !important; padding-right: 20px !important; }
          .main-contact { padding-left: 20px !important; padding-right: 20px !important; }
          .tab-btn { padding: 10px 16px; font-size: 0.82rem; }
          .feature-title { font-size: 1.2rem; }
          .feature-desc { font-size: 0.9rem; }
          .price-card { padding: 36px 24px; }
        }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ebebeb",
      }}>
        <div className="main-nav-inner" style={{
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
            <a href="#pricing" className="hnav-link">
              {lang === "ko" ? "비용" : "Pricing"}
            </a>
            <a href="/contact" className="hnav-link">
              {lang === "ko" ? "문의하기" : "Contact"}
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="main-hero" style={{
        background: "linear-gradient(150deg, #0c0c0c 0%, #1c1c2e 60%, #0c0c0c 100%)",
        color: "#fff",
        padding: "120px 48px 130px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "100px",
            padding: "6px 18px",
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: "32px",
          }}>
            Rhino Plugin
          </div>

          <h1 style={{
            fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.035em",
            marginBottom: "24px",
            color: "#ffffff",
          }}>
            {lang === "ko" ? (
              <>레이저 커팅 도면을<br />3분 이내로</>
            ) : (
              <>Laser cutting drawings<br />in under 3 minutes</>
            )}
          </h1>

          <p style={{
            fontSize: "1.125rem",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.7,
            marginBottom: "44px",
            maxWidth: "520px",
            margin: "0 auto 44px",
          }}>
            {lang === "ko"
              ? "복잡한 건축 형상을 자동으로 분해하고, 즉시 커팅 가능한 도면을 생성합니다"
              : "Automatically decompose complex architectural geometry into ready-to-cut drawings"
            }
          </p>

          <button
            className="hero-dl-btn"
            onClick={() => router.push("/download")}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2v8M5 7l3 3 3-3" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 13h12" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {lang === "ko" ? "다운로드" : "Download"}
          </button>
        </div>
      </section>

      {/* ── PRODUCT TABS + FEATURES ── */}
      <section id="features" className="main-features" style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 48px 80px" }}>

        {/* Tab selector */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center",
          marginBottom: "72px",
        }}>
          <button
            className={`tab-btn${activeTab === "wall" ? " active" : ""}`}
            onClick={() => setActiveTab("wall")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon/WallAndSlab.svg" width="26" height="26" alt="" style={{ display: "block" }} />
            Wall &amp; Slab
          </button>
          <button
            className={`tab-btn${activeTab === "terrain" ? " active" : ""}`}
            onClick={() => setActiveTab("terrain")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon/Terrain.svg" width="26" height="26" alt="" style={{ display: "block" }} />
            Terrain
          </button>
          <button
            className={`tab-btn${activeTab === "centerline" ? " active" : ""}`}
            onClick={() => setActiveTab("centerline")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon/Centerline.svg" width="26" height="26" alt="" style={{ display: "block" }} />
            Centerline
          </button>
        </div>

        {/* Feature sections */}
        <div>
          {activeTab === "centerline"
            ? features.map((f, i) => (
                <div key={`${activeTab}-${i}`} className="centerline-block">
                  <div className="centerline-video-box">
                    {f.video
                      ? <video src={f.video} autoPlay loop muted playsInline />
                      : <div className="feature-placeholder">영상 준비 중</div>
                    }
                  </div>
                  <div className="centerline-text">
                    <h3 className="feature-title">{L(f.title)}</h3>
                    <p className="feature-desc">{L(f.desc)}</p>
                  </div>
                </div>
              ))
            : features.map((f, i) => (
                <div
                  key={`${activeTab}-${i}`}
                  className={`feature-row${i % 2 === 1 ? " rev" : ""}`}
                >
                  <div className="feature-img-box">
                    {f.img
                      ? <img src={f.img} alt={L(f.title)} />
                      : <div className="feature-placeholder">이미지 준비 중</div>
                    }
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="feature-num">0{i + 1}</div>
                    <h3 className="feature-title">{L(f.title)}</h3>
                    <p className="feature-desc">{L(f.desc)}</p>
                  </div>
                </div>
              ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="main-pricing" style={{
        background: "#f7f7f7",
        padding: "88px 48px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.25rem",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            marginBottom: "14px",
            color: "#111",
          }}>
            {lang === "ko" ? "저렴한 금액대" : "Affordable Pricing"}
          </h2>
          <p style={{ color: "#888", marginBottom: "44px", lineHeight: 1.7, fontSize: "1rem" }}>
            {lang === "ko" ? (
              <>
                생성된 조각에 대해서만 결제됩니다. 오류가 발생한 부분은 청구되지 않습니다.
                <br />
                아래 컴포넌트를 제외한 다른 컴포넌트는 무료입니다.
              </>
            ) : (
              <>
                You only pay for successfully generated pieces. Failed pieces are never charged.
                <br />
                All components other than the ones listed below are free.
              </>
            )}
          </p>

          <div style={{ display: "flex", gap: "20px", justifyContent: "center", flexWrap: "wrap" }}>
            <div className="price-card">
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#888", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Wall &amp; Slab
              </div>
              <div className="price-amount">$0.1</div>
              <div className="price-unit">
                {`${lang === "ko" ? "조각당" : "per piece"} (₩${krwWallAndSlab.toLocaleString()})`}
              </div>
              <div className="price-detail">
                <div>{lang === "ko" ? "최소 주문 금액 $5" : "Minimum order $5"}</div>
                <div>{lang === "ko" ? "최대 주문 금액 $50" : "Maximum order $50"}</div>
              </div>
            </div>
            <div className="price-card">
              <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "#888", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Terrain
              </div>
              <div className="price-amount">$0.05</div>
              <div className="price-unit">
                {`${lang === "ko" ? "조각당" : "per piece"} (₩${krwTerrain.toLocaleString()})`}
              </div>
              <div className="price-detail">
                <div>{lang === "ko" ? "최소 주문 금액 $5" : "Minimum order $5"}</div>
                <div>{lang === "ko" ? "최대 주문 금액 $50" : "Maximum order $50"}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT / SOCIAL ── */}
      <section className="main-contact" style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "64px 48px",
        borderTop: "1px solid #ebebeb",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "24px",
      }}>
        <div>
          <div style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "6px" }}>MassLabs</div>
          <div style={{ fontSize: "0.75rem", color: "#bbb", lineHeight: 1.8 }}>
            <div>masslabs.archi@gmail.com</div>
            <div>Instagram: masslabs_archi</div>
            <div>Youtube: @MassLab-d8c</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px" }}>
          {/* Gmail */}
          <a
            href="https://mail.google.com/mail/?view=cm&to=masslabs.archi@gmail.com"
            target="_blank"
            style={{
              width: "36px", height: "36px", borderRadius: "10px", background: "#f2f2f2",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e6e6e6")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f2f2f2")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6z" fill="#fff" stroke="#ddd" strokeWidth="1.2"/>
              <path d="M2 6l10 7L22 6" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
          {/* Instagram */}
          <a
            href="https://www.instagram.com/masslabs_archi/"
            target="_blank"
            style={{
              width: "36px", height: "36px", borderRadius: "10px", background: "#f2f2f2",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e6e6e6")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f2f2f2")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5"/>
              <circle cx="12" cy="12" r="4"/>
              <circle cx="17.5" cy="6.5" r="0.8" fill="#333" stroke="none"/>
            </svg>
          </a>
          {/* YouTube */}
          <a
            href="https://www.youtube.com/@MassLab-d8c"
            target="_blank"
            style={{
              width: "36px", height: "36px", borderRadius: "10px", background: "#f2f2f2",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "#e6e6e6")}
            onMouseLeave={e => (e.currentTarget.style.background = "#f2f2f2")}
          >
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="#FF0000"/>
              <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
            </svg>
          </a>
        </div>
      </section>
    </main>
  );
}
