"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";

const steps: {
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  img: string | null;
}[] = [
  {
    title: { ko: 'Rhino에서 "PackageManager" 명령어 실행', en: 'Run "PackageManager" command in Rhino' },
    desc: {
      ko: 'Rhino 커맨드 창에 PackageManager를 입력하고 실행합니다.',
      en: 'Type PackageManager in the Rhino command bar and press Enter.',
    },
    img: null,
  },
  {
    title: { ko: 'Online 탭에서 LaserFish 검색 후 Install', en: 'Search for LaserFish in the Online tab and Install' },
    desc: {
      ko: 'Package Manager의 Online 탭에서 LaserFish를 검색한 뒤 Install 버튼을 클릭합니다.',
      en: 'In the Package Manager, go to the Online tab, search for LaserFish, and click Install.',
    },
    img: "/images/download/slide_2.png",
  },
  {
    title: { ko: '"Toolbar" 명령어 실행', en: 'Run the "Toolbar" command' },
    desc: {
      ko: '설치 완료 후 Rhino를 재시작하고, Toolbar 명령어를 실행합니다.',
      en: 'After installation, restart Rhino and run the Toolbar command.',
    },
    img: "/images/download/slide_3.png",
  },
  {
    title: { ko: 'Default 파일을 LaserFish로 변경', en: 'Set the default file to LaserFish' },
    desc: {
      ko: 'Toolbar 창에서 Default 파일을 LaserFish로 변경합니다.',
      en: 'In the Toolbar dialog, change the default file to LaserFish.',
    },
    img: "/images/download/slide_4.png",
  },
  {
    title: { ko: '체크박스 체크', en: 'Check the checkbox' },
    desc: {
      ko: 'LaserFish 항목 옆의 체크박스를 체크하면 설치가 완료됩니다.',
      en: 'Check the checkbox next to LaserFish to complete the installation.',
    },
    img: "/images/download/slide_5.png",
  },
];

export default function DownloadPage() {
  const router = useRouter();
  const { lang } = useLanguage();
  const L = (t: { ko: string; en: string }) => t[lang] ?? t.ko;

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

        .step-img-box {
          width: 100%;
          aspect-ratio: 16/9;
          border-radius: 14px;
          overflow: hidden;
          background: #f4f4f4;
          margin-top: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ccc;
          font-size: 0.8rem;
          letter-spacing: 0.04em;
        }
        .step-img-box img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        @media (max-width: 640px) {
          .hnav-links { display: none; }
          .dl-nav-inner { padding-left: 16px !important; padding-right: 16px !important; }
          .dl-content { padding: 40px 20px 80px !important; }
          .dl-downloads { flex-direction: column !important; }
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
      <div className="dl-content" style={{ maxWidth: "760px", margin: "0 auto", padding: "60px 48px 100px" }}>

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
            marginBottom: "0",
          }}>
            {lang === "ko" ? "다운로드" : "Download"}
          </h1>
        </div>

        {/* Installation guide */}
        <div>
          <div className="label-cap">
            {lang === "ko" ? "설치 방법" : "Installation"}
          </div>

          <div>
            {steps.map((step, i) => (
              <div
                key={i}
                style={{
                  paddingBottom: "52px",
                  marginBottom: "52px",
                  borderBottom: i < steps.length - 1 ? "1px solid #f0f0f0" : "none",
                }}
              >
                {/* Step number + title + desc */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#111",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    flexShrink: 0,
                    marginTop: "2px",
                  }}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: "1.15rem",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      lineHeight: 1.3,
                      marginBottom: "8px",
                      color: "#111",
                    }}>
                      {L(step.title)}
                    </h3>
                    <p style={{ fontSize: "0.9rem", color: "#666", lineHeight: 1.7, margin: 0 }}>
                      {L(step.desc)}
                    </p>
                  </div>
                </div>

                {/* Photo (steps 2–5) */}
                {i > 0 && (
                  <div className="step-img-box">
                    {step.img
                      ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={step.img} alt={L(step.title)} />
                      : <span>{lang === "ko" ? "이미지 준비 중" : "Image coming soon"}</span>
                    }
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{
            marginTop: "8px",
            padding: "16px 18px",
            background: "#f7f7f7",
            border: "1px solid #ececec",
            borderRadius: "12px",
            fontSize: "0.875rem",
            color: "#555",
            lineHeight: 1.7,
          }}>
            {lang === "ko"
              ? "v2.0.3 이전 버전을 다운받으신 분들은 Package Manager → Installed로 들어가서 LaserFish를 삭제 후 다시 설치해주세요."
              : "If you downloaded a version earlier than v2.0.3, go to Package Manager → Installed, uninstall LaserFish, and reinstall it."}
          </div>
        </div>

      </div>
    </main>
  );
}
