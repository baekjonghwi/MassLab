"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

type Tab = "wall" | "terrain";

const content = {
  en: {
    wallAndSlab: {
      features: [
        "Wall thickness adjustment and spacing",
        "Curved surface engraving",
        "Engraving where wall meets slab",
        "Layer and index matching",
      ],
      params: [
        { label: "SCALE", desc: "Your desired scale" },
        { label: "CURVED LINE SPACING", desc: "Engraving interval for curved surfaces (if no curved surfaces, leave as is)" },
        { label: "LASER TOLERANCE", desc: "Laser kerf gap (typically 0.1 mm)" },
        { label: "WALL", desc: "Must be perpendicular to the XY plane. Open Brep not allowed" },
        { label: "SLAB", desc: "Must be horizontal to the XY plane. Open Brep not allowed" },
        { label: "ROOF", desc: "Open Brep not allowed" },
        { label: "WINDOW", desc: "Must be perpendicular to the XY plane. Open Brep not allowed" },
        { label: "length × width × thickness", desc: "Material size you want to cut" },
      ],
      tutorialLabel: "Tutorial",
    },
    terrain: {
      features: [
        "Works even if terrain is split — place in the same layer",
        "Automatically clips building parts that protrude above terrain",
        "Layer index matching",
      ],
      params: [
        { label: "SCALE", desc: "Your desired scale" },
        { label: "LASER TOLERANCE", desc: "Laser kerf gap (typically 0.1mm)" },
        { label: "TERRAIN", desc: "Surfaces only" },
        { label: "BUILDINGS", desc: "Surrounding buildings" },
        { label: "STACKING", desc: "Stack BUILDING" },
        { label: "FOLDING", desc: "Folding BUILDING" },
        { label: "ASSEMBLY", desc: "Assemble BUILDING" },
        { label: "Engrave building positions on terrain", desc: "Engrave building positions onto terrain" },
        { label: "Engrave upper terrain layer position on terrain", desc: "Engrave upper terrain positions onto lower terrain" },
        { label: "length × width × thickness", desc: "Material size you want to cut" },
      ],
      tutorialLabel: "Tutorial",
    },
  },
  ko: {
    wallAndSlab: {
      features: [
        "벽 두께 조정 및 이격",
        "곡면 각인 생성",
        "벽과 슬라브가 만나는 위치 각인",
        "레이어와 인덱스 매치",
      ],
      params: [
        { label: "SCALE", desc: "원하는 축척 입력" },
        { label: "CURVED LINE SPACING", desc: "곡면의 각인 간격 (곡면이 없으면 그대로 유지)" },
        { label: "LASER TOLERANCE", desc: "레이저의 간극 (일반적으로 0.1mm)" },
        { label: "WALL", desc: "XY 평면에 수직이어야 함. Open Brep 불가" },
        { label: "SLAB", desc: "XY 평면에 수평이어야 함. Open Brep 불가" },
        { label: "ROOF", desc: "Open Brep 불가" },
        { label: "WINDOW", desc: "XY 평면에 수직이어야 함. Open Brep 불가" },
        { label: "length × width × thickness", desc: "자르고자 하는 재질의 크기" },
      ],
      tutorialLabel: "튜토리얼",
    },
    terrain: {
      features: [
        "지형이 나눠져 있어도 같은 레이어에 넣으면 작동",
        "건물이 지형 위로 튀어나와도 튀어나온 부분 자동으로 잘라내기",
        "레이어 인덱스 매칭",
      ],
      params: [
        { label: "SCALE", desc: "원하는 축척 입력" },
        { label: "LASER TOLERANCE", desc: "레이저의 간극 (일반적으로 0.1mm)" },
        { label: "TERRAIN", desc: "서피스만 가능" },
        { label: "BUILDINGS", desc: "주변 건물" },
        { label: "STACKING", desc: "BUILDING 쌓아올리기" },
        { label: "FOLDING", desc: "BUILDING 접기" },
        { label: "ASSEMBLY", desc: "BUILDING 조립하기" },
        { label: "Engrave building positions on terrain", desc: "빌딩들의 위치를 지형 위에 각인하기" },
        { label: "Engrave upper terrain layer position on terrain", desc: "윗지형 위치를 아랫지형에 각인하기" },
        { label: "length × width × thickness", desc: "자르고자 하는 재질의 크기" },
      ],
      tutorialLabel: "튜토리얼",
    },
  },
} as const;

function WallAndSlabWindow() {
  return (
    <div className="htu-window" style={{ border: "1px solid #c8c8c8", borderRadius: "4px", background: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif", fontSize: "12px", maxWidth: "560px", userSelect: "none" }}>
      <div style={{ background: "#e0e0e0", borderBottom: "1px solid #c0c0c0", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
          <div style={{ width: 14, height: 14, background: "#ccc", borderRadius: 2 }} />
          LaserFish - WallAndSlab
        </span>
        <div style={{ display: "flex", gap: "10px", color: "#777", fontSize: "11px" }}>
          <span>─</span><span>□</span><span style={{ color: "#c00" }}>✕</span>
        </div>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 700, fontSize: "11px" }}>SCALE :</span>
            <input readOnly value="1/100" style={{ width: 58, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 700, fontSize: "11px" }}>CURVED LINE SPACING :</span>
            <input readOnly value="10" style={{ width: 38, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
            <span style={{ fontSize: "11px" }}>mm</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 700, fontSize: "11px" }}>LASER TOLERANCE :</span>
            <input readOnly value="0.1" style={{ width: 34, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
            <span style={{ fontSize: "11px" }}>mm</span>
          </label>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "5px" }}>WALL</div>
          <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "3px" }}>
            <button className="panel-btn">-</button>
            <select style={{ border: "1px solid #bbb", padding: "2px 4px", fontSize: "11px", minWidth: 90, cursor: "pointer" }}><option></option></select>
            <input placeholder="length" style={{ width: 68, border: "1px solid #bbb", padding: "2px 8px", fontSize: "11px", background: "#fff" }} />
            <span style={{ color: "#999", fontSize: "11px" }}>mm x</span>
            <input placeholder="width" style={{ width: 62, border: "1px solid #bbb", padding: "2px 8px", fontSize: "11px", background: "#fff" }} />
            <span style={{ color: "#999", fontSize: "11px" }}>mm x</span>
            <input placeholder="thickness" style={{ width: 76, border: "1px solid #bbb", padding: "2px 8px", fontSize: "11px", background: "#fff" }} />
            <span style={{ color: "#999", fontSize: "11px" }}>mm</span>
          </div>
          <button className="panel-btn">+</button>
        </div>
        {["SLAB", "ROOF", "WINDOW"].map(group => (
          <div key={group}>
            <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "5px" }}>{group}</div>
            <button className="panel-btn">+</button>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button style={{ padding: "5px 22px", border: "1px solid #bbb", background: "#e8e8e8", cursor: "default", fontSize: "12px", fontWeight: 600 }}>START</button>
        </div>
      </div>
    </div>
  );
}

function TerrainWindow() {
  return (
    <div className="htu-window" style={{ border: "1px solid #c8c8c8", borderRadius: "4px", background: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif", fontSize: "12px", maxWidth: "560px", userSelect: "none" }}>
      <div style={{ background: "#e0e0e0", borderBottom: "1px solid #c0c0c0", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
          <div style={{ width: 14, height: 14, background: "#ccc", borderRadius: 2 }} />
          LaserFish - Terrain
        </span>
        <div style={{ display: "flex", gap: "10px", color: "#777", fontSize: "11px" }}>
          <span>─</span><span>□</span><span style={{ color: "#c00" }}>✕</span>
        </div>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 700, fontSize: "11px" }}>SCALE :</span>
            <input readOnly value="1/100" style={{ width: 58, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 700, fontSize: "11px" }}>LASER TOLERANCE :</span>
            <input readOnly value="0.1" style={{ width: 34, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
            <span style={{ fontSize: "11px" }}>mm</span>
          </label>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "5px" }}>TERRAIN</div>
          <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "3px" }}>
            <button className="panel-btn">-</button>
            <select style={{ border: "1px solid #bbb", padding: "2px 4px", fontSize: "11px", minWidth: 90, cursor: "pointer" }}><option></option></select>
            <input placeholder="length" style={{ width: 68, border: "1px solid #bbb", padding: "2px 8px", fontSize: "11px", background: "#fff" }} />
            <span style={{ color: "#999", fontSize: "11px" }}>mm x</span>
            <input placeholder="width" style={{ width: 62, border: "1px solid #bbb", padding: "2px 8px", fontSize: "11px", background: "#fff" }} />
            <span style={{ color: "#999", fontSize: "11px" }}>mm x</span>
            <input placeholder="thickness" style={{ width: 76, border: "1px solid #bbb", padding: "2px 8px", fontSize: "11px", background: "#fff" }} />
            <span style={{ color: "#999", fontSize: "11px" }}>mm</span>
          </div>
          <button className="panel-btn">+</button>
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "5px" }}>BUILDINGS</div>
          <button className="panel-btn">+</button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 600, fontSize: "11px" }}>MODE :</span>
          <button className="panel-mode-btn">STACKING</button>
          <button className="panel-mode-btn">FOLDING</button>
          <button className="panel-mode-btn">ASSEMBLY</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {["Engrave building positions on terrain", "Engrave upper terrain layer positions on terrain"].map(label => (
            <label key={label} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
              <input type="checkbox" readOnly style={{ cursor: "default" }} />
              {label}
            </label>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button style={{ padding: "5px 22px", border: "1px solid #bbb", background: "#e8e8e8", cursor: "default", fontSize: "12px", fontWeight: 600 }}>START</button>
        </div>
      </div>
    </div>
  );
}

export default function HowToUsePage() {
  const [activeTab, setActiveTab] = useState<Tab>("wall");
  const router = useRouter();
  const { lang } = useLanguage();

  const c = content[lang];
  const tabContent = activeTab === "wall" ? c.wallAndSlab : c.terrain;

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

        .panel-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          padding: 0;
          border: 1px solid #bbb;
          background: #fff;
          cursor: pointer;
          font-size: 11px;
          flex-shrink: 0;
          font-family: 'Segoe UI', sans-serif;
          transition: background 0.1s, border-color 0.1s;
        }
        .panel-btn:hover {
          background: #e0e0e0;
          border-color: #999;
        }
        .panel-btn:active {
          background: #ccc;
        }

        .panel-mode-btn {
          padding: 3px 14px;
          border: 1px solid #999;
          background: #fff;
          font-weight: 600;
          cursor: pointer;
          font-size: 11px;
          font-family: 'Segoe UI', sans-serif;
          transition: background 0.1s, border-color 0.1s;
        }
        .panel-mode-btn:hover {
          background: #e0e0e0;
          border-color: #777;
        }
        .panel-mode-btn:active {
          background: #ccc;
        }

        .htu-tab-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 26px;
          border-radius: 14px;
          border: 2px solid #e8e8e8;
          background: #fff;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.92rem;
          font-weight: 600;
          color: #888;
          transition: all 0.2s;
        }
        .htu-tab-btn:hover { border-color: #ccc; color: #444; }
        .htu-tab-btn.active {
          border-color: #111;
          color: #111;
          box-shadow: 0 2px 10px rgba(0,0,0,0.08);
        }

        .param-row {
          display: flex;
          gap: 14px;
          padding: 13px 0;
          border-bottom: 1px solid #f2f2f2;
        }
        .param-row:last-child { border-bottom: none; }

        .section-divider {
          border: none;
          border-top: 1px solid #ebebeb;
          margin: 48px 0;
        }

        .section-label {
          font-size: 0.72rem;
          font-weight: 700;
          color: #bbb;
          letter-spacing: 0.09em;
          text-transform: uppercase;
          margin-bottom: 16px;
        }

        @media (max-width: 640px) {
          .htu-nav-inner {
            flex-direction: column !important;
            height: auto !important;
            gap: 6px;
            padding: 10px 16px !important;
          }
          .hnav-links { flex-wrap: wrap; justify-content: center; gap: 0 !important; }
          .hnav-link { padding: 6px 9px; font-size: 0.8rem; }
          .htu-content { padding: 40px 20px 80px !important; }
          .htu-tabs { flex-wrap: wrap !important; }
          .htu-tab-btn { padding: 9px 16px !important; font-size: 0.82rem !important; }
          .htu-window-wrap { overflow: hidden; }
          .htu-window { zoom: 0.6; }
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
        <div className="htu-nav-inner" style={{
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
            <a href="/howtouse" className="hnav-link" style={{ color: "#111", fontWeight: 700 }}>
              {lang === "ko" ? "사용방법" : "How to Use"}
            </a>
            <a href="/download" className="hnav-link">
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
      <div className="htu-content" style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 48px 100px" }}>

        {/* Header */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#bbb", letterSpacing: "0.09em", textTransform: "uppercase", marginBottom: "14px" }}>
            LaserFish
          </div>
          <h1 style={{
            fontSize: "clamp(2rem, 4vw, 3rem)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}>
            {lang === "ko" ? "사용 방법" : "How to Use"}
          </h1>
        </div>

        {/* ── Tab selector ── */}
        <div className="htu-tabs" style={{ display: "flex", gap: "10px", marginBottom: "52px" }}>
          <button
            className={`htu-tab-btn${activeTab === "wall" ? " active" : ""}`}
            onClick={() => setActiveTab("wall")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon/WallAndSlab.svg" width="24" height="24" alt="" style={{ display: "block" }} />
            Wall &amp; Slab
          </button>
          <button
            className={`htu-tab-btn${activeTab === "terrain" ? " active" : ""}`}
            onClick={() => setActiveTab("terrain")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/icon/Terrain.svg" width="24" height="24" alt="" style={{ display: "block" }} />
            Terrain
          </button>
        </div>

        <hr className="section-divider" />

        {/* ── UI Window ── */}
        <div style={{ marginBottom: "40px" }}>
          <div className="section-label">{lang === "ko" ? "패널 구성" : "Panel"}</div>
          <div className="htu-window-wrap">
            {activeTab === "wall" ? <WallAndSlabWindow /> : <TerrainWindow />}
          </div>
        </div>

        <hr className="section-divider" />

        {/* ── Parameters ── */}
        <div style={{ marginBottom: "8px" }}>
          <div className="section-label">{lang === "ko" ? "파라미터" : "Parameters"}</div>
          <div>
            {tabContent.params.map((p, i) => (
              <div key={i} className="param-row">
                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#ccc", minWidth: "22px", paddingTop: "1px" }}>
                  {i + 1}.
                </span>
                <div>
                  <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#111" }}>{p.label}</span>
                  {(p.desc as string).split("\n").map((line, j) =>
                    j === 0
                      ? <span key={j} style={{ fontSize: "0.875rem", color: "#666" }}> — {line}</span>
                      : j === 1
                      ? <div key={j} style={{ fontSize: "0.875rem", color: "#666", marginTop: "3px", paddingLeft: "4em" }}>{line}</div>
                      : <div key={j} style={{ fontSize: "0.82rem", color: "#888", marginTop: "3px", paddingLeft: "4.3em" }}>{line}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <hr className="section-divider" />

        {/* ── Tutorial ── */}
        <div>
          <div className="section-label">{tabContent.tutorialLabel}</div>
          <div style={{
            width: "100%",
            aspectRatio: "16/9",
            borderRadius: "14px",
            overflow: "hidden",
            border: "1px solid #ebebeb",
          }}>
            <iframe
              src={`https://www.youtube.com/embed/${activeTab === "wall" ? "RQQAtJwJRVA" : "RffClyQUCuo"}?vq=hd1440`}
              title={tabContent.tutorialLabel}
              style={{ width: "100%", height: "100%", border: "none", display: "block" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        </div>

      </div>
    </main>
  );
}
