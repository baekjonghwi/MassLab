"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import PlanTable, { PLAN_CSS } from "@/components/PlanTable";

type Tab = "wall" | "terrain" | "centerline";
type Product = "laserfish" | "archimap";

interface Feature {
  title: { ko: string; en: string };
  desc: { ko: string; en: string };
  img: string | null;
  imgs?: string[];
  video?: string;
}

interface Slide {
  badge: string;
  title: { ko: React.ReactNode; en: React.ReactNode };
  desc: { ko: string; en: string };
  cta: { ko: string; en: string };
  href: string;
  external?: boolean;
  icon: "download" | "arrow";
}

const heroSlides: Slide[] = [
  {
    badge: "Rhino Plugin",
    title: {
      ko: <>레이저 커팅 도면을<br />3분 이내로</>,
      en: <>Laser cutting drawings<br />in under 3 minutes</>,
    },
    desc: {
      ko: "복잡한 건축 형상을 자동으로 분해하고, 즉시 커팅 가능한 도면을 생성합니다",
      en: "Automatically decompose complex architectural geometry into ready-to-cut drawings",
    },
    cta: { ko: "다운로드", en: "Download" },
    href: "/download",
    icon: "download",
  },
  {
    badge: "Web Service",
    title: {
      ko: <>사이트 다이어그램을<br />3분 이내로</>,
      en: <>Site diagrams<br />in under 3 minutes</>,
    },
    desc: {
      ko: "QGIS, 포토샵, 일러스트 필요없이 완성본의 사이트 다이어그램 제작",
      en: "Produce finished site diagrams without QGIS, Photoshop, or Illustrator",
    },
    cta: { ko: "바로가기", en: "Go to Archimap" },
    href: "https://archimap.masslabs-archi.com/",
    external: true,
    icon: "arrow",
  },
];

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
      ko: "쌓기, 접기, 조립 방식의 건물 유형 선택",
      en: "Choose stacking, folding, or assembly building types",
    },
    desc: {
      ko: "재질의 성질, 두께 등을 고려하여 어울리는 건물 표현 방식을 선택할 수 있습니다.",
      en: "Select a building representation method that suits the material's properties and thickness.",
    },
    img: null,
    imgs: [
      "/images/Terrain/slide_4(1).jpg",
      "/images/Terrain/slide_4(2).jpg",
      "/images/Terrain/slide_4(3).jpg",
    ],
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

const archimapFeatures: Feature[] = [
  {
    title: {
      ko: "QGIS·포토샵·일러스트 없이, 완성본 그대로",
      en: "No QGIS, Photoshop, or Illustrator — just the finished diagram",
    },
    desc: {
      ko: "지도 데이터를 내려받고, 정리하고, 다시 그리는 과정을 모두 건너뜁니다. 대지 위치만 지정하면 바로 발표에 쓸 수 있는 완성된 사이트 다이어그램이 만들어집니다.",
      en: "Skip downloading, cleaning, and redrawing map data. Pick your site and get a presentation-ready diagram right away.",
    },
    img: null,
  },
  {
    title: {
      ko: "건물·도로·녹지·수계를 레이어별로 자동 분리",
      en: "Buildings, roads, greenery & water split into layers automatically",
    },
    desc: {
      ko: "실제 지형·지물 데이터를 바탕으로 건물, 도로, 녹지, 수계가 각각의 레이어로 정리되어 출력됩니다. 필요한 레이어만 켜고 끄면서 원하는 다이어그램을 구성할 수 있습니다.",
      en: "Real geospatial data is organized into separate building, road, greenery, and water layers. Toggle only the layers you need.",
    },
    img: null,
  },
  {
    title: {
      ko: "선 두께·색상·스타일을 그대로 반영한 출력",
      en: "Line weights, colors, and styles applied on export",
    },
    desc: {
      ko: "다이어그램의 선 두께와 색상, 스타일을 화면에서 바로 조정하고 그 결과 그대로 내려받습니다. 후보정 없이 판넬과 포트폴리오에 바로 배치할 수 있습니다.",
      en: "Adjust line weights, colors, and styles on screen and download exactly what you see — ready to place on a panel or portfolio.",
    },
    img: null,
  },
  {
    title: {
      ko: "벡터와 이미지, 필요한 형식으로 내보내기",
      en: "Export as vector or image, whichever you need",
    },
    desc: {
      ko: "벡터 형식으로 내보내면 캐드나 일러스트에서 추가 편집이 가능하고, 이미지 형식으로 내보내면 곧바로 문서에 삽입할 수 있습니다.",
      en: "Export vectors for further editing in CAD or Illustrator, or images to drop straight into a document.",
    },
    img: null,
  },
];

export default function Home() {
  const [product, setProduct] = useState<Product>("laserfish");
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("wall");
  const router = useRouter();
  const { lang } = useLanguage();

  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setSlide((s) => (s + 1) % heroSlides.length),
      2000
    );
    return () => clearInterval(id);
  }, [paused]);

  // 정지 버튼: 5초간 슬라이드 자동 전환을 멈춘다
  const pauseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
  }, []);

  const pauseSlides = () => {
    if (pauseTimer.current) clearTimeout(pauseTimer.current);
    setPaused(true);
    pauseTimer.current = setTimeout(() => setPaused(false), 5000);
  };


  const features =
    product === "archimap"
      ? archimapFeatures
      : activeTab === "wall"
      ? wallFeatures
      : activeTab === "terrain"
      ? terrainFeatures
      : centerlineFeatures;
  const showCenterline = product === "laserfish" && activeTab === "centerline";
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

        .hero-stack { display: grid; }
        .hero-slide {
          grid-area: 1 / 1;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: opacity 0.6s ease, transform 0.6s ease, visibility 0.6s;
        }
        .hero-slide.active {
          opacity: 1;
          visibility: visible;
          transform: none;
        }

        .hero-dots {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 48px;
        }
        .hero-dot {
          width: 8px;
          height: 8px;
          padding: 0;
          border: none;
          border-radius: 100px;
          background: rgba(255,255,255,0.25);
          cursor: pointer;
          transition: background 0.25s, width 0.25s;
        }
        .hero-dot:hover { background: rgba(255,255,255,0.45); }
        .hero-dot.active { width: 24px; background: #ffffff; }

        .hero-pause {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          margin-left: 6px;
          padding: 0;
          border: none;
          border-radius: 100px;
          background: rgba(255,255,255,0.12);
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .hero-pause:hover { background: rgba(255,255,255,0.24); color: #fff; }
        .hero-pause.paused { background: #ffffff; color: #111; }

        .product-cards {
          display: flex;
          gap: 20px;
          justify-content: center;
          margin-bottom: 44px;
        }
        .product-card {
          width: 168px;
          padding: 0;
          border: 2px solid #e8e8e8;
          border-radius: 20px;
          background: #fff;
          overflow: hidden;
          transition: all 0.2s;
        }
        .product-card:hover { border-color: #ccc; transform: translateY(-2px); }
        .product-card.active {
          border-color: #111;
          box-shadow: 0 4px 20px rgba(0,0,0,0.12);
        }

        /* 이미지와 제품명이 한 칸. 제목은 칸 하단에 겹쳐 놓는다 */
        .product-card-main {
          position: relative;
          display: block;
          width: 100%;
          aspect-ratio: 1 / 1;
          padding: 0;
          border: none;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
          font-family: inherit;
          cursor: pointer;
        }
        .product-card-img {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 30px;          /* 제목 자리를 남긴다 */
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .product-card-img img {
          width: 64%;
          height: 64%;
          object-fit: contain;
          display: block;
        }
        .product-card-placeholder {
          font-size: 0.78rem;
          color: #c4c4c4;
          letter-spacing: 0.04em;
        }
        .product-card-name {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 11px;
          font-size: 0.95rem;
          font-weight: 700;
          color: #888;
          transition: color 0.2s;
        }
        .product-card.active .product-card-name { color: #111; }

        /* 원래 제목이 있던 칸 = 사이트 접속 버튼 */
        .product-card-go {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          width: 100%;
          padding: 12px 8px;
          border: none;
          background: #fff;
          color: #111;
          font-family: inherit;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.15s;
        }
        .product-card-go:hover { background: #f2f2f2; }
        /* 준비 중 — 클릭해도 아무 데도 가지 않는다 */
        .product-card-go.soon {
          background: #fafafa;
          color: #bbb;
          cursor: default;
          font-weight: 600;
          letter-spacing: 0.01em;
        }
        .product-card-go.soon:hover { background: #fafafa; }

        .archimap-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #111;
          color: #fff;
          text-decoration: none;
          padding: 16px 34px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
          letter-spacing: -0.01em;
          box-shadow: 0 4px 20px rgba(0,0,0,0.14);
          transition: opacity 0.15s, transform 0.1s;
        }
        .archimap-cta:hover { opacity: 0.88; transform: translateY(-1px); }
        /* 준비 중 — 링크가 아니라 표시일 뿐이다 */
        .archimap-cta.soon {
          background: #e6e6e6;
          color: #999;
          box-shadow: none;
          cursor: default;
        }
        .archimap-cta.soon:hover { opacity: 1; transform: none; }

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
          white-space: nowrap;
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
        .feature-img-multi {
          display: flex;
          width: 100%;
          height: 100%;
          gap: 2px;
        }
        .feature-img-multi img {
          flex: 1;
          min-width: 0;
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

        ${PLAN_CSS}


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
          .main-nav-inner {
            flex-direction: column !important;
            height: auto !important;
            gap: 6px;
            padding: 10px 16px !important;
          }
          .hnav-links { flex-wrap: wrap; justify-content: center; gap: 0 !important; }
          .hnav-link { padding: 6px 9px; font-size: 0.8rem; }
          .main-hero { padding: 72px 20px 80px !important; }
          .main-features { padding-left: 20px !important; padding-right: 20px !important; }
          .main-pricing { padding-left: 20px !important; padding-right: 20px !important; }
          .main-contact { padding-left: 20px !important; padding-right: 20px !important; }
          .tab-btn { padding: 10px 14px; font-size: 0.8rem; }
          .hero-dots { margin-top: 36px; }
          .product-cards { gap: 12px; margin-bottom: 32px; }
          .product-card { width: 132px; border-radius: 16px; }
          .product-card-img { bottom: 26px; }
          .product-card-name { bottom: 9px; font-size: 0.85rem; }
          .product-card-go { padding: 10px 6px; font-size: 0.74rem; }
          .feature-title { font-size: 1.2rem; }
          .feature-desc { font-size: 0.9rem; }
          .price-cards { flex-wrap: nowrap !important; gap: 12px !important; }
          .price-card { padding: 24px 14px; flex: 1; min-width: 0; }
          .price-amount { font-size: 2rem; }
          .price-unit { font-size: 0.72rem; }
          .price-detail { font-size: 0.72rem; line-height: 1.7; margin-top: 18px; padding-top: 14px; }
          .sub-card { padding: 30px 22px 24px; border-radius: 18px; }
          .sub-amount { font-size: 2.6rem; }
          .sub-list li { font-size: 0.84rem; }
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
            <a href="/price" className="hnav-link">
              {lang === "ko" ? "비용" : "Pricing"}
            </a>
            <a href="/contact" className="hnav-link">
              {lang === "ko" ? "문의하기" : "Contact"}
            </a>
            <a href="/account" className="hnav-link">
              {lang === "ko" ? "내 구독" : "My Plan"}
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO SLIDESHOW ── */}
      <section className="main-hero" style={{
        position: "relative",
        background: "linear-gradient(150deg, #0c0c0c 0%, #1c1c2e 60%, #0c0c0c 100%)",
        color: "#fff",
        padding: "120px 48px 130px",
        textAlign: "center",
        overflow: "hidden",
      }}>
        <div className="hero-stack" style={{ maxWidth: "720px", margin: "0 auto" }}>
          {heroSlides.map((s, i) => (
            <div
              key={i}
              className={`hero-slide${i === slide ? " active" : ""}`}
              aria-hidden={i !== slide}
            >
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
                {s.badge}
              </div>

              <h1 style={{
                fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                letterSpacing: "-0.035em",
                marginBottom: "24px",
                color: "#ffffff",
              }}>
                {s.title[lang] ?? s.title.ko}
              </h1>

              <p style={{
                fontSize: "1.125rem",
                color: "rgba(255,255,255,0.5)",
                lineHeight: 1.7,
                maxWidth: "520px",
                margin: "0 auto 44px",
              }}>
                {L(s.desc)}
              </p>

              <button
                className="hero-dl-btn"
                tabIndex={i === slide ? 0 : -1}
                onClick={() => {
                  if (s.external) window.open(s.href, "_blank", "noopener");
                  else router.push(s.href);
                }}
              >
                {s.icon === "download" ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v8M5 7l3 3 3-3" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M2 13h12" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M9 4l4 4-4 4" stroke="#111" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {L(s.cta)}
              </button>
            </div>
          ))}
        </div>

        {/* Slide dots + 정지 버튼 */}
        <div className="hero-dots">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === slide ? " active" : ""}`}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setSlide(i)}
            />
          ))}
          <button
            className={`hero-pause${paused ? " paused" : ""}`}
            aria-label={lang === "ko" ? "슬라이드 5초 멈춤" : "Pause slides for 5s"}
            title={lang === "ko" ? "5초 멈춤" : "Pause 5s"}
            onClick={pauseSlides}
          >
            {paused ? (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M2 1.2l6.2 3.8L2 8.8z" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <rect x="1.8" y="1.5" width="2.4" height="7" rx="0.6" />
                <rect x="5.8" y="1.5" width="2.4" height="7" rx="0.6" />
              </svg>
            )}
          </button>
        </div>
      </section>

      {/* ── PRODUCT TABS + FEATURES ── */}
      <section id="features" className="main-features" style={{ maxWidth: "1200px", margin: "0 auto", padding: "88px 48px 80px" }}>

        {/* Product selector */}
        <div className="product-cards">
          <div className={`product-card${product === "laserfish" ? " active" : ""}`}>
            <button className="product-card-main" onClick={() => setProduct("laserfish")}>
              <span className="product-card-img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/images/icon/LaserFish.svg" alt="" />
              </span>
              <span className="product-card-name">LaserFish</span>
            </button>
            <a className="product-card-go" href="/download">
              {lang === "ko" ? "다운로드" : "Download"}
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </a>
          </div>
          <div className={`product-card${product === "archimap" ? " active" : ""}`}>
            <button className="product-card-main" onClick={() => setProduct("archimap")}>
              <span className="product-card-img">
                {/* Archimap 이미지 준비되면 /images/icon/Archimap.svg 로 교체 */}
                <span className="product-card-placeholder">Archimap</span>
              </span>
              <span className="product-card-name">Archimap</span>
            </button>
            {/* 🔴준비 중이라 링크가 아니다 — a 태그로 두면 눌러서 들어가진다 */}
            <span className="product-card-go soon" aria-disabled="true">Coming soon</span>
          </div>
        </div>

        {/* Tab selector (LaserFish 전용) */}
        <div style={{
          display: product === "laserfish" ? "flex" : "none",
          gap: "12px",
          justifyContent: "center",
          flexWrap: "wrap",
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
          {showCenterline
            ? features.map((f, i) => (
                <div key={`${product}-${activeTab}-${i}`} className="centerline-block">
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
                  key={`${product}-${activeTab}-${i}`}
                  className={`feature-row${i % 2 === 1 ? " rev" : ""}`}
                >
                  <div className="feature-img-box">
                    {f.imgs
                      ? (
                          <div className="feature-img-multi">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {f.imgs.map((src, k) => <img key={k} src={src} alt={L(f.title)} />)}
                          </div>
                        )
                      : f.img
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

      {/* ── PRICING (LaserFish) / 바로가기 (Archimap) ── */}
      {product === "laserfish" ? (
      <section id="pricing" className="main-pricing" style={{
        background: "#f7f7f7",
        padding: "88px 48px",
        textAlign: "center",
      }}>
        {/* 표가 넓어 600px로는 좁다 */}
        <div style={{ maxWidth: "920px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.25rem",
            fontWeight: 900,
            letterSpacing: "-0.03em",
            marginBottom: "14px",
            color: "#111",
          }}>
            {lang === "ko" ? "구독" : "Subscription"}
          </h2>
          <p style={{ color: "#888", marginBottom: "40px", lineHeight: 1.7, fontSize: "1rem" }}>
            {lang === "ko"
              ? "구독 하나로 MassLabs의 모든 프로그램 사용이 가능합니다."
              : "One subscription covers every MassLabs program."}
          </p>

          {/* 표는 /price와 같은 것을 쓴다(출처가 둘이면 어긋난다) */}
          <PlanTable lang={lang} />

          <div className="plan-fine">
            {lang === "ko" ? "부가세 별도" : "VAT not included"}
          </div>

        </div>
      </section>
      ) : (
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
            {lang === "ko" ? "곧 만나보실 수 있습니다" : "Coming soon"}
          </h2>
          <p style={{ color: "#888", marginBottom: "40px", lineHeight: 1.7, fontSize: "1rem" }}>
            {lang === "ko"
              ? "설치 없이 웹에서 바로 사이트 다이어그램을 만들 수 있도록 준비하고 있습니다."
              : "We're getting it ready — site diagrams in the browser, no installation needed."}
          </p>

          {/* 🔴준비 중이라 링크가 아니다 */}
          <span className="archimap-cta soon" aria-disabled="true">
            Coming soon
          </span>
        </div>
      </section>
      )}

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
