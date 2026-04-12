"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const slides = [
  {
    title: "LaserFish",
    subtitle: "Wall & Slab",
    src: "/images/laserFish_mainslide_1.jpg"
  },
  {
    title: "LaserFish",
    subtitle: "Wall & Slab",
    src: "/images/laserFish_slide_1.jpg"
  },
  {
    title: "LaserFish",
    subtitle: "Wall",
    src: "/images/laserFish_slide_4.jpg"
  },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [fading, setFading] = useState(false);
  const router = useRouter();

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

        .tool-card {
          background: #f0f0f0;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
          width: 220px;
        }
        .tool-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.1);
        }

        .login-btn {
          background: none;
          border: none;
          font-size: 0.85rem;
          color: #1a1a1a;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
        }
        .login-btn:hover { opacity: 0.5; }

        .social-btn {
          width: 26px;
          height: 26px;
          border-radius: 6px;
          background: #f0f0f0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: none;
          padding: 0;
          transition: background 0.15s;
        }
        .social-btn:hover { background: #e0e0e0; }
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
        <span style={{ fontSize: "1.2rem", fontWeight: 700, letterSpacing: "-0.01em" }}>
          MassLabs
        </span>
      </nav>

      {/* 컨텐츠 영역 */}
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 48px" }}>

        {/* HERO SLIDER */}
        <section style={{ marginBottom: "48px" }}>
          <div style={{
            width: "100%",
            borderRadius: "12px",
            overflow: "hidden",
            position: "relative",
            background: "#e8e8e8",
            aspectRatio: "21/9",
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
              }}
            />

            {/* 슬라이드 텍스트 오버레이 */}
            <div
              className={`fade ${fading ? "out" : "in"}`}
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                padding: "48px 28px 20px",
                background: "linear-gradient(transparent, rgba(0,0,0,0.12))",
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
        </section>

        {/* TOOLS */}
        <section style={{ marginBottom: "64px" }}>
          <h2 style={{
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "20px",
          }}>
            Tools
          </h2>

          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div className="tool-card" onClick={() => router.push("/tools/laserfish")}>
              <div style={{
                width: "100%",
                aspectRatio: "4/3",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: "url(/images/LaserFish_Main.png)",
                backgroundSize: "cover",
              }}>

              </div>
              <div style={{ padding: "11px 13px 13px" }}>
                <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "3px" }}>
                  LaserFish
                </div>
                <div style={{ fontSize: "0.72rem", color: "#888", lineHeight: 1.4 }}>
                  architecture laser cut drawing
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer style={{
          borderTop: "1px solid #ebebeb",
          paddingTop: "24px",
          paddingBottom: "40px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 700, marginBottom: "8px" }}>
                MassLabs
              </div>
              <div style={{ fontSize: "0.72rem", color: "#bbb", lineHeight: 2 }}>
                <div>Instagram : masslab_arch</div>
                <div>Youtube : @MassLab-d8c</div>
              </div>
            </div>

            {/* 소셜 아이콘 */}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <a href="https://www.instagram.com/masslab_arch/" target="_blank" className="social-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5"/>
                  <circle cx="12" cy="12" r="4"/>
                  <circle cx="17.5" cy="6.5" r="0.8" fill="#333" stroke="none"/>
                </svg>
              </a>
              <a href="https://www.youtube.com/@MassLab-d8c" target="_blank" className="social-btn">
                <svg width="13" height="13" viewBox="0 0 24 24">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.4a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" fill="#FF0000"/>
                  <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
                </svg>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
