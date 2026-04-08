"use client";
import { useRouter } from "next/navigation";

export default function LaserFishPage() {
  const router = useRouter();

  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#ffffff",
      color: "#1a1a1a",
      minHeight: "100vh",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .download-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          text-decoration: none;
        }
        .download-btn.active {
          background: #1a1a1a;
          color: #fff;
          border: 1px solid #1a1a1a;
        }
        .download-btn.active:hover {
          background: #333;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .download-btn.disabled {
          background: #f5f5f5;
          color: #bbb;
          border: 1px solid #eee;
          cursor: not-allowed;
        }

        .back-btn {
          background: none;
          border: none;
          font-size: 0.82rem;
          color: #888;
          cursor: pointer;
          font-family: inherit;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #1a1a1a; }

        .youtube-embed {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>

      {/* NAV */}
      <nav style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 48px",
        maxWidth: "1100px",
        margin: "0 auto",
      }}>
        <button className="back-btn" onClick={() => router.push("/")}>
          ← MassLab
        </button>
        <span style={{ fontSize: "0.88rem", color: "#bbb" }}>LaserFish</span>
      </nav>

      {/* 컨텐츠 */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 48px 80px" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: "48px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <h1 style={{
              fontSize: "2rem",
              fontWeight: 700,
              letterSpacing: "-0.03em",
            }}>
              LaserFish
            </h1>
          </div>
          <p style={{ fontSize: "0.95rem", color: "#666", lineHeight: 1.7, maxWidth: "560px" }}>
            Grasshopper add-on for Rhino that automatically generates laser cutting drawings from architectural geometry. 
            Breaks down complex geometry into flat pieces, arranges them within material boundaries, and outputs cut-ready drawings instantly.
          </p>
        </div>

        {/* 메인 이미지 */}
        <div style={{
          width: "100%",
          aspectRatio: "16/7",
          background: "#f0f0f0",
          borderRadius: "14px",
          marginBottom: "64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          // 이미지 준비되면:
          backgroundImage: "url(/images/LaserFish_Main.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}>
          <span style={{ opacity: 0.2, fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
            image
          </span>
        </div>

        {/* 2단 레이아웃 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "64px",
          marginBottom: "64px",
          alignItems: "start",
        }}>

          {/* 왼쪽: 유튜브 */}
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
              Tutorial
            </h2>
            <div className="youtube-embed">
              {/* 유튜브 링크 준비되면 아래 주석 해제 */}
              {/* <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
                title="LaserFish Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              /> */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", marginBottom: "8px" }}>▶</div>
                <div style={{ fontSize: "0.78rem", color: "#aaa" }}>유튜브 링크 준비 중</div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 소개 + 다운로드 */}
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
              How to Use
            </h2>
            <div style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.8, marginBottom: "32px" }}>
            <p style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#1a1a1a" }}>1.</strong> Connect your Brep geometry to the input.
            </p>
            <p style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#1a1a1a" }}>2.</strong> Enter the scale and material size in the panel.
            </p>
            <p style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#1a1a1a" }}>3.</strong> Double-click the toggle to set it to true.
            </p>
            <p>
                <strong style={{ color: "#1a1a1a" }}>4.</strong> Wait 30 seconds to 1 minute for the drawings to generate.
            </p>
            </div>

            {/* 다운로드 */}
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
              Download
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* Rhino 8 - 활성 */}
              <a
                className="download-btn active"
                href="/downloads/LaserFish_Rh8.gha"
                download
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Rhino 8 version
              </a>

              {/* Rhino 7 - 비활성 */}
              <div className="download-btn disabled">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Rhino 7 version - preparing
              </div>

              {/* SketchUp - 비활성 */}
              <div className="download-btn disabled">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                SketchUp version - preparing
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
