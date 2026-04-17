"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    title: "LaserFish",
    subtitle: "Output",
    src: "/images/laserFish_slide_1.jpg"
  },
  {
    title: "LaserFish",
    subtitle: "Curved Geometry",
    src: "/images/laserFish_mainslide_2.jpg"
  },
  {
    title: "LaserFish",
    subtitle: "Linear + Curved Geometry",
    src: "/images/laserFish_mainslide_3.jpg"
  },
  {
    title: "LaserFish",
    subtitle: "Before & After",
    src: "/images/laserFish_slide_4.jpg"
  }
];

export default function LaserFishPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const [krwPrice, setKrwPrice] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((res) => res.json())
      .then((data) => {
        if (data?.rates?.KRW) {
          setKrwPrice(Math.round(data.rates.KRW * 0.1));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setFading(false);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = (i: number) => {
    if (i === current) return;
    setFading(true);
    setTimeout(() => {
      setCurrent(i);
      setFading(false);
    }, 400);
  };

  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#ffffff",
      color: "#1a1a1a",
      minHeight: "100vh",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .fade {
          transition: opacity 0.4s ease;
        }
        .fade.out { opacity: 0; }
        .fade.in { opacity: 1; }

        .dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(0,0,0,0.25);
          cursor: pointer;
          transition: background 0.2s;
          border: none;
          padding: 0;
        }
        .dot.active { background: #1a1a1a; }

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
          ← MassLabs
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

        {/* 메인 슬라이더 */}
        <div style={{
          width: "100%",
          paddingTop: "56.25%",
          borderRadius: "14px",
          marginBottom: "64px",
          position: "relative",
          background: "#f0f0f0",
        }}>
          {/* 배경 */}
          <div
            className={`fade ${fading ? "out" : "in"}`}
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url(${slides[current].src})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderRadius: "14px",
              overflow: "hidden",
            }}
          />

          {/* 텍스트 오버레이 */}
          <div
            className={`fade ${fading ? "out" : "in"}`}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "48px 28px 20px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.15))",
            }}
          >
            <div style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a1a" }}>
              {slides[current].title}
            </div>
            <div style={{ fontSize: "0.82rem", color: "#555" }}>
              {slides[current].subtitle}
            </div>
          </div>

          {/* 왼쪽 화살표 */}
          <button
            onClick={() => goTo((current - 1 + slides.length) % slides.length)}
            style={{
              position: "absolute",
              left: "16px",
              top: "calc(50% - 18px)",
              zIndex: 2,
              background: "rgba(255,255,255,0.7)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.95)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.7)")}
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none"><polyline points="8,2 2,8 8,14" stroke="#333" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* 오른쪽 화살표 */}
          <button
            onClick={() => goTo((current + 1) % slides.length)}
            style={{
              position: "absolute",
              right: "16px",
              top: "calc(50% - 18px)",
              zIndex: 2,
              background: "rgba(255,255,255,0.7)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              padding: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(4px)",
              transition: "background 0.2s",
            }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.95)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.7)")}
          >
            <svg width="10" height="16" viewBox="0 0 10 16" fill="none"><polyline points="2,2 8,8 2,14" stroke="#333" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* 도트 인디케이터 */}
          <div style={{
            position: "absolute",
            bottom: "14px",
            right: "18px",
            display: "flex",
            gap: "5px",
            zIndex: 2,
          }}>
            {slides.map((_, i) => (
              <button
                key={i}
                className={`dot${i === current ? " active" : ""}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </div>

        {/* 2단 레이아웃 - Tutorial + Download */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "64px",
          marginBottom: "80px",
          alignItems: "start",
        }}>

          {/* 왼쪽: 유튜브 */}
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
              Tutorial
            </h2>
            <div className="youtube-embed">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/RfkjPYsBHcc"
                title="LaserFish Tutorial"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>

          {/* 오른쪽: 다운로드 */}
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "16px", letterSpacing: "-0.01em" }}>
              Download
            </h2>
            <div style={{ marginBottom: "20px", padding: "16px 20px", background: "#f8f8f8", borderRadius: "10px" }}>
              <p style={{ fontSize: "0.82rem", color: "#888", marginBottom: "4px" }}>Pricing</p>
              <p style={{ fontSize: "1.2rem", fontWeight: 700, color: "#1a1a1a" }}>$0.10 <span style={{ fontSize: "0.82rem", fontWeight: 400, color: "#888" }}>/ piece</span></p>
              <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "2px" }}>{krwPrice != null ? `${krwPrice.toLocaleString()}원 / 조각당` : "...원 / 조각당"}</p>
              <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "4px" }}>Minimum $5.00 per order</p>
              <p style={{ fontSize: "0.78rem", color: "#aaa", marginTop: "8px" }}>Available immediately after purchase</p>
              <p style={{ fontSize: "0.78rem", color: "#aaa"}}>구매 후 즉시 사용 가능</p>

            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a className="download-btn active" href="/downloads/LaserFish_Rh8.zip" download>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Rhino 8 (win)
              </a>
              <a className="download-btn active" href="/downloads/LaserFish_Rh8_mac.zip" download>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Rhino 8 (mac)
              </a>
              <a className="download-btn active" href="/downloads/LaserFish_Rh7.zip" download>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Rhino 7 (win)
              </a>
            </div>
          </div>
        </div>

        {/* How to Use 섹션 */}
        <div style={{ marginBottom: "80px" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "32px", letterSpacing: "-0.01em" }}>
            How to Use
          </h2>

          {/* 사진 */}
          <img
            src="/images/laserFish_wall&slab.png"
            alt="LaserFish Wall & Slab"
            style={{
              width: "100%",
              aspectRatio: "16/9",
              borderRadius: "12px",
              marginBottom: "28px",
              objectFit: "cover",
            }}
          />

          {/* 설명 */}
          <div style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
            <p style={{ }}>
              <strong style={{ color: "#1a1a1a" }}>1.</strong> Connect your Brep geometry to the input.
            </p>
            <p style={{ color: "#888", fontSize: "0.85rem" }}>
              ** wall_1, wall_2, and window must be vertical to the XY plane. Slab must be horizontal to the XY plane **
            </p>
            <p style={{ marginBottom: "10px", color: "#888", fontSize: "0.85rem" }}>
              ** If curved surfaces with different curvatures are continuously connected, separate them **
            </p>
            <p style={{ }}>
              <strong style={{ color: "#1a1a1a" }}>2.</strong> Enter the scale and curve distance, material size in the panel.
            </p>
            <p style={{ color: "#888", fontSize: "0.85rem" }}>
              ** Please set the slab thickness to the same ratio as the original **
            </p>
            <p style={{ marginBottom: "10px", color: "#888", fontSize: "0.85rem" }}>
              ** Curve Distance is the interval angle of curved surfaces. If there are no curved surfaces in your model, you can leave it as is **
            </p>
            <p style={{ marginBottom: "10px" }}>
              <strong style={{ color: "#1a1a1a" }}>3.</strong> Double-click the toggle to set it to true.
            </p>
            <p>
              <strong style={{ color: "#1a1a1a" }}>4.</strong> Wait a few minutes for the drawings to generate.
            </p>
          </div>
        </div>

        {/* Be Careful 섹션 */}
        <div style={{
          borderTop: "1px solid #eee",
          paddingTop: "48px",
          marginBottom: "80px",
        }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "20px", letterSpacing: "-0.01em" }}>
            Be Careful
          </h2>
          <div style={{ fontSize: "0.88rem", color: "#555", lineHeight: 1.9 }}>
            <p style={{ marginBottom: "10px" }}>
              • Fields marked with ** in the add-on are required inputs.
            </p>
            <p style={{ marginBottom: "10px" }}>
              • Breps must be joined together to be recognized as a single connected geometry. If they are touching but not boolean-unioned, they will be treated as separate objects.
            </p>
            <p>
              • Results may not be perfect due to the condition of your model or geometry errors in Rhino. Please keep this in mind when reviewing the output.
            </p>
          </div>
        </div>

      </div>
    </main>
  );
}