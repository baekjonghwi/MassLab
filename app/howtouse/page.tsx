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
        { label: "SLAB", desc: "The ratio of SLAB thickness to the original SLAB thickness should match the SCALE\n(e.g. original SLAB thickness = 300mm, SCALE = 1/100 → SLAB thickness = 3mm)\nOpen Brep not allowed" },
        { label: "WINDOW", desc: "Must be perpendicular to the XY plane. Open Brep not allowed" },
        { label: "Length × Width × Thickness", desc: "Material size you want to cut" },
      ],
      tutorialLabel: "Tutorial",
      youtubeId: "RfkjPYsBHcc",
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
        { label: "ASSEMBLY", desc: "Assemble BUILDING" },
        { label: "STACKING", desc: "Stack BUILDING" },
        { label: "Engrave building positions on terrain", desc: "Engrave building positions onto terrain" },
        { label: "Engrave upper terrain layer position on terrain", desc: "Engrave upper terrain positions onto lower terrain" },
      ],
      tutorialLabel: "Tutorial",
      noVideo: "Tutorial video coming soon.",
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
        { label: "SLAB", desc: "SLAB의 thickness와 원본 SLAB의 두께의 비율은 SCALE과 비슷해야 한다\n(예시: 원본 SLAB 두께 = 300mm, SCALE = 1/100 → SLAB thickness = 3mm)\nOpen Brep 불가" },
        { label: "WINDOW", desc: "XY 평면에 수직이어야 함. Open Brep 불가" },
        { label: "Length × Width × Thickness", desc: "자르고자 하는 재질의 크기" },
      ],
      tutorialLabel: "튜토리얼",
      youtubeId: "RfkjPYsBHcc",
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
        { label: "ASSEMBLY", desc: "BUILDING 조립하기" },
        { label: "STACKING", desc: "BUILDING 쌓아올리기" },
        { label: "Engrave building positions on terrain", desc: "빌딩들의 위치를 지형 위에 각인하기" },
        { label: "Engrave upper terrain layer position on terrain", desc: "윗지형 위치를 아랫지형에 각인하기" },
      ],
      tutorialLabel: "튜토리얼",
      noVideo: "튜토리얼 영상 준비 중입니다.",
    },
  },
} as const;

function WallAndSlabWindow() {
  return (
    <div style={{ border: "1px solid #c8c8c8", borderRadius: "4px", background: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif", fontSize: "12px", maxWidth: "540px", userSelect: "none" }}>
      <div style={{ background: "#e0e0e0", borderBottom: "1px solid #c0c0c0", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
          <div style={{ width: 14, height: 14, background: "#ccc", borderRadius: 2 }} />
          LaserFish
        </span>
        <div style={{ display: "flex", gap: "10px", color: "#777", fontSize: "11px" }}>
          <span>─</span><span>□</span><span style={{ color: "#c00" }}>✕</span>
        </div>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 600, fontSize: "11px" }}>SCALE :</span>
            <input readOnly value="1/100" style={{ width: 58, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 600, fontSize: "11px" }}>CURVED LINE SPACING :</span>
            <input readOnly value="10" style={{ width: 38, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
            <span style={{ fontSize: "11px" }}>mm</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 600, fontSize: "11px" }}>LASER TOLERANCE :</span>
            <input readOnly value="0.1" style={{ width: 34, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
            <span style={{ fontSize: "11px" }}>mm</span>
          </label>
        </div>
        {["WALL", "SLAB", "WINDOW"].map(group => (
          <div key={group}>
            <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "5px" }}>{group}</div>
            <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "3px" }}>
              <button style={{ padding: "1px 7px", border: "1px solid #bbb", background: "#fff", cursor: "default", fontSize: "11px" }}>-</button>
              <select style={{ border: "1px solid #bbb", padding: "2px 4px", fontSize: "11px", minWidth: 90 }}><option></option></select>
              <input readOnly placeholder="L" style={{ width: 44, border: "1px solid #bbb", padding: "2px 4px", fontSize: "11px" }} />
              <span style={{ color: "#999", fontSize: "11px" }}>×</span>
              <input readOnly placeholder="W" style={{ width: 40, border: "1px solid #bbb", padding: "2px 4px", fontSize: "11px" }} />
              <span style={{ color: "#999", fontSize: "11px" }}>×</span>
              <input readOnly placeholder="T" style={{ width: 40, border: "1px solid #bbb", padding: "2px 4px", fontSize: "11px" }} />
              <span style={{ color: "#999", fontSize: "11px" }}>mm</span>
            </div>
            <button style={{ padding: "1px 7px", border: "1px solid #bbb", background: "#fff", cursor: "default", fontSize: "11px" }}>+</button>
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
    <div style={{ border: "1px solid #c8c8c8", borderRadius: "4px", background: "#f0f0f0", fontFamily: "'Segoe UI', sans-serif", fontSize: "12px", maxWidth: "540px", userSelect: "none" }}>
      <div style={{ background: "#e0e0e0", borderBottom: "1px solid #c0c0c0", padding: "6px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 500 }}>
          <div style={{ width: 14, height: 14, background: "#ccc", borderRadius: 2 }} />
          LaserFish — Terrain
        </span>
        <div style={{ display: "flex", gap: "10px", color: "#777", fontSize: "11px" }}>
          <span>─</span><span>□</span><span style={{ color: "#c00" }}>✕</span>
        </div>
      </div>
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 600, fontSize: "11px" }}>SCALE :</span>
            <input readOnly value="1/100" style={{ width: 58, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontWeight: 600, fontSize: "11px" }}>LASER TOLERANCE :</span>
            <input readOnly value="0.1" style={{ width: 34, padding: "2px 5px", border: "1px solid #bbb", background: "#fff", fontSize: "12px" }} />
            <span style={{ fontSize: "11px" }}>mm</span>
          </label>
        </div>
        {["TERRAIN", "BUILDINGS"].map(group => (
          <div key={group}>
            <div style={{ fontWeight: 700, fontSize: "11px", marginBottom: "5px" }}>{group}</div>
            <button style={{ padding: "1px 7px", border: "1px solid #bbb", background: "#fff", cursor: "default", fontSize: "11px" }}>+</button>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontWeight: 600, fontSize: "11px" }}>MODE :</span>
          <button style={{ padding: "3px 14px", border: "1px solid #999", background: "#fff", fontWeight: 600, cursor: "default", fontSize: "11px" }}>ASSEMBLY</button>
          <button style={{ padding: "3px 14px", border: "1px solid #999", background: "#fff", fontWeight: 600, cursor: "default", fontSize: "11px" }}>STACKING</button>
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

        .htu-back-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          cursor: pointer;
          font-family: inherit;
          font-size: 0.875rem;
          color: #777;
          padding: 0;
          transition: color 0.15s;
        }
        .htu-back-btn:hover { color: #111; }

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
        <div style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "0 48px",
          height: "56px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <button className="htu-back-btn" onClick={() => router.push("/")}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            MassLabs
          </button>
          <button
            onClick={() => router.push("/download")}
            style={{
              background: "#111",
              color: "#fff",
              border: "none",
              padding: "8px 18px",
              borderRadius: "9px",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {lang === "ko" ? "다운로드" : "Download"}
          </button>
        </div>
      </nav>

      {/* ── CONTENT ── */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "60px 48px 100px" }}>

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
        <div style={{ display: "flex", gap: "10px", marginBottom: "52px" }}>
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
          {activeTab === "wall" ? <WallAndSlabWindow /> : <TerrainWindow />}
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
                      : <div key={j} style={{ fontSize: "0.82rem", color: "#888", marginTop: "3px", paddingLeft: "1em" }}>{line}</div>
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
          {activeTab === "wall" ? (
            <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "14px", overflow: "hidden", background: "#f0f0f0" }}>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${c.wallAndSlab.youtubeId}`}
                title="LaserFish WallAndSlab Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div style={{
              width: "100%",
              aspectRatio: "16/9",
              borderRadius: "14px",
              background: "#f7f7f7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid #ebebeb",
            }}>
              <p style={{ fontSize: "0.875rem", color: "#bbb" }}>
                {"noVideo" in c.terrain ? c.terrain.noVideo : ""}
              </p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
