"use client";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { useLanguage, useT, trPick, TRich, fmt, type Lang } from "@/lib/i18n";
import LanguageMenu from "@/components/LanguageMenu";
import { t } from "@/lib/translations";
import { useSignedIn } from "@/lib/use-signed-in";
import { useMyPlan } from "@/lib/use-my-plan";
import { SUBSCRIPTION_LIVE, PER_PIECE_ON_HOME, PLUS_FREE_PROMO } from "@/lib/interim";
import { TIER_KEYS } from "@/lib/plans";
import { ARCHIMAP, COLORGRAM, LASERFISH, withLang } from "@/lib/products";
import { TIERS, PROGRAMS } from "@/components/PlanTable";
import { PIECE_PRICES, PIECE_MIN_USD, PIECE_MAX_USD } from "@/components/PerPiecePricing";

// ==========================================================================
//  홈(/) — MassLabs 제품 전체를 소개하는 어두운 랜딩.
//
//  🔴2026-08-28 부터 **홈은 이 화면 하나뿐이다.** 그 전에는 구독을 팔던 시절의
//    홈을 얼려 둔 /main(HomeView)이 PG 심사용으로 따로 있었는데, 심사 주소를 이
//    화면으로 바꾸면서 지웠다. 짝을 맞춰야 할 다른 홈은 이제 없다.
//
//  🔴가격은 여기서 짓지 않는다. 세 곳에서 그대로 읽어 온다 —
//    · 구독 등급·가격 = components/PlanTable 의 TIERS
//    · 프로그램별 사양 = components/PlanTable 의 PROGRAMS
//    · LaserFish 단가  = components/PerPiecePricing 의 PIECE_PRICES (폐기된 건당결제)
//
//  🔴2026-09-05 — 가격 구역이 **구독 한 칸**이 되었다(사용자 결정).
//    · 왼쪽 표가 archiMap 한 줄이 아니라 **PROGRAMS 전부**를 싣는다. LaserFish 가
//      건당결제를 떠나 구독 안으로 들어왔으므로(lib/plans 의 MIN_PLAN → plus),
//      "구독 하나로 전부"라는 말과 표가 이제 같은 것을 말한다.
//      ⚠️프로그램이 늘면 여기는 손대지 않는다 — PROGRAMS 에 한 덩이를 더하면
//        이 표에 구역 하나가 저절로 생긴다.
//    · PLUS 에 동그라미와 "(할인 기간)"이 붙는다 — 판정은 lib/interim 의
//      PLUS_FREE_PROMO 한 곳이고, 그 값이 false 가 되면 표시가 통째로 사라진다.
//    🔴2026-08-29 부터 **오른쪽 건당표는 안 나온다** — lib/interim.ts 의
//      PER_PIECE_ON_HOME 뒤에 숨어 있다. 2026-09-05 에 건당결제 자체가 폐기되어
//      이제 되살릴 일이 없지만, 값과 그림은 지우지 않았다.
//
//  🔴사진 — 아직 없는 자리는 자리표시자가 대신 선다. 아래 데이터의 img 에 경로만
//    적으면 그 자리가 저절로 채워진다. 지금 진짜 사진이 있는 건 LaserFish 뿐이다.
// ==========================================================================

const YOUTUBE = "https://www.youtube.com/@MassLab-d8c";
// 🔴제품 사이트 주소는 lib/products.ts 한 곳에 모아 두었다(2026-08-28) —
//   /account · /contact · /price 도 같은 것을 본다. 여기 직접 적지 말 것.
//   LaserFish 는 전에 "/download"(MassLabs 안쪽)를 가리켰다.

// 2구역 제품 칸에 쓰는 사진들 — public/images/PRODUCTS 한 폴더에 모아 뒀다
//   (2026-08-27 지시). 셋 다 정사각형이다.
//   🔴첫 화면 배경(HERO_IMGS)과 **따로**다. 한때 값을 나눠 썼는데, 배경을
//     archiMap 사진으로 갈아 끼우자 LaserFish 칸에 지도가 떴다.
//   🔴Colorgram.svg 는 사진이 아니라 우리가 그린 색 띠다. 색 자체가 그 제품의
//     결과물이라 화면을 찍어 봐야 할 말을 못 한다 — 그 파일 안의 설명을 볼 것.
const PRODUCT_SHOTS = {
  archiMap:  "/images/PRODUCTS/archiMap.png",
  Colorgram: "/images/PRODUCTS/Colorgram.svg",
  LaserFish: "/images/PRODUCTS/LaserFish.jpg",
} as const;

// 🔴첫 화면 뒤에서 3초마다 갈아 끼우는 사진들(2026-08-27 사용자 지시).
//   장수는 몇이든 된다 — 줄에 한 줄 더하면 순서에 저절로 낀다.
//   🔴HeroArt 는 **한 장 앞까지만** 얹는다. 넷을 한꺼번에 받으면 첫 화면이
//     너무 무겁다 — 다음 장은 지금 것이 떠 있는 3초 동안 받으면 된다.
//
//   ⚠️원본이 1.1~7.1MB 다(public/images/MAINPAGE). 그대로 내보내면 넷이
//     14MB 라, HeroArt 는 **next/image 로 그린다** — Next 가 화면 크기에 맞춰
//     줄이고 WebP/AVIF 로 바꿔 내보낸다. 그래서 여기 원본을 손대지 않는다.
//     ⛔ <img> 로 되돌리지 말 것. 되돌리면 첫 화면이 원본 그대로 나간다.
//
//   🔴순서는 **어두운 것이 앞**이다. 첫 장이 글 뒤에 가장 오래 서 있는데,
//     흰 사진이 먼저 오면 흰 제목이 묻힌다.
const HERO_IMGS = [
  "/images/MAINPAGE/archimap_4041x2640.png",        // archiMap — 어두운 지도
  "/images/MAINPAGE/ViewCapture20260827_222056.jpg", // 도시 3D 모델
  "/images/MAINPAGE/ViewCapture20260827_225005.jpg", // LaserFish — 펼쳐 놓은 도면
  "/images/MAINPAGE/archiMap_20260827_2304.png",     // archiMap — 교통소음 분석
];
const HERO_MS = 3000;

type Txt = { en: string; ko: string };

// ── 2구역: 제품 넷 ──────────────────────────────────────────────────────
//  🔴칸은 **누르는 것이 아니다**(2026-08-27 사용자 지시). 커서를 올리면 왼쪽 글이
//    그 제품 것으로 바뀔 뿐이고, 제품으로 가는 길은 4구역(도구 다섯)이 맡는다.
const PRODUCTS: { name: string; img: string | null; head: Txt; body: Txt }[] = [
  {
    name: "archiMap",
    img: PRODUCT_SHOTS.archiMap,
    head: { en: "Read the site\nin one click.", ko: "대지를\n한 번에 읽는다." },
    body: {
      en: "Drop a pin anywhere on Earth. archiMap pulls live urban data and renders analysis diagrams — zoning, green, traffic noise, solar — then hands you a 3D site model.",
      ko: "지구 어디든 한 점만 찍으면 됩니다. archiMap 이 도시 데이터를 불러와 용도·녹지·교통소음·일조 분석도를 그리고, 3D 대지 모델까지 만들어 줍니다.",
    },
  },
  {
    name: "Colorgram",
    img: PRODUCT_SHOTS.Colorgram,
    head: { en: "Colors that\nhold together.", ko: "따로 놀지 않는\n색 조합." },
    body: {
      en: "Build palettes for drawings and boards, check them against each other, and carry the exact values into your renders.",
      ko: "도면과 패널에 쓸 색을 고르고, 서로 잘 어울리는지 확인한 뒤, 그 값 그대로 렌더까지 가져갑니다.",
    },
  },
  {
    name: "LaserFish",
    img: PRODUCT_SHOTS.LaserFish,
    head: { en: "Laser-cut drawings,\nfrom one plug-in.", ko: "레이저 커팅 도면을\n플러그인 하나로." },
    body: {
      en: "A Rhino plug-in that unfolds walls, slabs and terrain into cut-ready drawings. Walls of differing thickness and curved walls are no trouble at all.",
      ko: "벽·슬래브·지형을 바로 자를 수 있는 도면으로 펼쳐 주는 라이노 플러그인입니다. 두께가 다른 벽체나 곡면형상의 벽체도 문제없습니다.",
    },
  },
  {
    name: "Coming soon",
    img: null,
    // 🔴넷째 칸은 "Coming soon" 한 마디뿐이다(2026-08-27 지시). 설명은 비워 둔다 —
    //   아직 이름도 없는 것을 두 줄로 설명하면 나머지 셋의 말이 흐려진다.
    head: { en: "Coming soon.", ko: "Coming soon." },
    body: { en: "", ko: "" },
  },
];

// ── 3구역: 결과물 표본 ─────────────────────────────────────────────────
//  설명 자리에는 **그걸 만든 프로그램 이름**을 적는다(2026-08-27 사용자 지시).
//  🔴줄은 스스로 오른쪽에서 왼쪽으로 흐른다. 스크롤 막대는 없앴다.
//  🔴사진은 public/images/CAPABILITIES 한 폴더에 모아 뒀다(2026-08-28 지시).
//    ⚠️받은 파일 이름에 띄어쓰기가 있어 전부 소문자 하이픈으로 바꿨다
//      ("Cadastral map.png" → cadastral-map.png). 주소에 띄어쓰기가 들어가면
//      %20 으로 새어 나가 캐시·CDN 마다 다르게 다뤄진다.
//    🔴여덟 칸 전부 사진이 찼다(녹지·3D 대지 모델링 2026-08-28 도착).
//      자리표시자는 img: null 일 때만 선다 — 새 표본을 사진 없이 끼워 넣어도 줄은 안 깨진다.
const SAMPLES: { title: Txt; by: string; img: string | null }[] = [
  { title: { en: "Wind Path", ko: "바람길" }, by: "archiMap", img: "/images/CAPABILITIES/wind-path.png" },
  { title: { en: "Cadastral Map", ko: "지적도" }, by: "archiMap", img: "/images/CAPABILITIES/cadastral-map.png" },
  { title: { en: "LaserCutting Model", ko: "레이저커팅 모델" }, by: "LaserFish", img: "/images/CAPABILITIES/lasercutting-model.png" },
  { title: { en: "Building Use", ko: "건물 용도" }, by: "archiMap", img: "/images/CAPABILITIES/building-use.png" },
  { title: { en: "Green Space", ko: "녹지" }, by: "archiMap", img: "/images/CAPABILITIES/green-space.png" },
  { title: { en: "Site Model LaserCut", ko: "대지 모델 레이저커팅" }, by: "LaserFish", img: "/images/CAPABILITIES/site-model-lasercut.png" },
  { title: { en: "Traffic Noise Information", ko: "교통 소음 정보" }, by: "archiMap", img: "/images/CAPABILITIES/traffic-noise-information.png" },
  { title: { en: "3D Site Modeling", ko: "3D 대지 모델링" }, by: "archiMap", img: "/images/CAPABILITIES/3d-site-modeling.png" },
];

// ── 4구역: 도구 다섯 ───────────────────────────────────────────────────
//  [Start project] 가 여기로 내려온다. 제품으로 가는 길은 **여기 하나뿐이다.**
//  🔴사진은 public/images/TOOLS 한 폴더에 모아 뒀다(2026-08-28 지시).
//    ⚠️받은 이름의 띄어쓰기를 전부 소문자 하이픈으로 바꿨다
//      ("Map Analysis.png" → map-analysis.png). 주소에 띄어쓰기가 들어가면
//      %20 으로 새어 나가 캐시·CDN 마다 다르게 다뤄진다.
//    ⚠️color-combination.svg 는 PRODUCTS/Colorgram.svg 와 **같은 그림이 두 벌**이다.
//      한쪽만 고치면 제품 칸과 도구 칸의 색이 갈린다 — 색을 손볼 일이 생기면
//      반드시 둘 다 고치거나, 한쪽을 지우고 나머지 하나를 함께 가리킬 것.
const TOOLS: { title: Txt; body: Txt; by: string; href: string | null; img: string | null }[] = [
  {
    title: { en: "Map Analysis", ko: "지도 분석" },
    body: { en: "Live urban data turned into clean, editorial 2D analyses.", ko: "도시 데이터를 바로 쓸 수 있는 2D 분석도로 바꿉니다." },
    by: "archiMap", href: ARCHIMAP, img: "/images/TOOLS/map-analysis.png",
  },
  {
    title: { en: "Site Modeling", ko: "대지 모델링" },
    body: { en: "Buildings, terrain and context exported as a 3D site model.", ko: "건물·지형·주변을 3D 대지 모델로 내보냅니다." },
    by: "archiMap", href: ARCHIMAP, img: "/images/TOOLS/site-modeling.png",
  },
  {
    title: { en: "Color Combination", ko: "색 조합" },
    body: { en: "Pick the colors for your drawings and boards.", ko: "도면과 패널에 쓸 색을 고르세요." },
    by: "Colorgram", href: COLORGRAM, img: "/images/TOOLS/color-combination.svg",
  },
  {
    title: { en: "Laser Cutting", ko: "레이저 커팅" },
    body: { en: "Walls, slabs and terrain unfolded into cut-ready sheets.", ko: "벽·슬래브·지형을 바로 자를 수 있는 도면으로 펼쳐 줍니다." },
    by: "LaserFish", href: LASERFISH, img: "/images/TOOLS/laser-cutting.png",
  },
  {
    title: { en: "Coming soon", ko: "준비 중" },
    body: { en: "The next tool in the suite.", ko: "다음 도구를 만들고 있습니다." },
    by: "MassLabs", href: null, img: null,
  },
];

// 🔴상단 메뉴는 이 화면 안을 짚는 것만 남긴다(2026-08-27 지시). 다운로드는
//   4구역 [Laser Cutting] 이, 문의는 바닥글의 [Contact] 창이 맡는다.
//   ⚠️LOGIN 은 주소가 상황에 따라 달라져서 여기 못 적는다 — 아래에서 따로 붙인다.
const NAV: { label: Txt; href: string }[] = [
  { label: { en: "Products", ko: "제품" }, href: "#products" },
  { label: { en: "Tools", ko: "도구" }, href: "#tools" },
  { label: { en: "Pricing", ko: "가격" }, href: "#pricing" },
];

// 오른쪽 점 표시가 짚는 구역들. 순서가 곧 점의 순서다.
const SECTIONS: { id: string; label: Txt }[] = [
  { id: "top", label: { en: "Top", ko: "처음" } },
  { id: "products", label: { en: "Products", ko: "제품" } },
  { id: "samples", label: { en: "Output", ko: "결과물" } },
  { id: "tools", label: { en: "Tools", ko: "도구" } },
  { id: "pricing", label: { en: "Pricing", ko: "가격" } },
  { id: "contact", label: { en: "Contact", ko: "문의" } },
];

// ==========================================================================
//  화면 규칙 — 모노크롬 콘크리트 + **주황 한 톤**(2026-08-27).
//
//  🔴위계는 먼저 밝기·크기·여백으로 준다(--dim → --mut → --tx). 색은 그 위에
//    얹는 한 겹일 뿐이다 — 처음엔 색을 아예 안 썼는데 너무 밋밋해서 --acc 를
//    들였다. ⚠️쓰는 자리는 정해져 있다: 구역 머리말 · 프로그램 이름표 · 금액 ·
//    주 버튼 · 지금 보는 표시. **여기 말고 늘리지 말 것** — 늘리는 순간 색이
//    화면을 끌고 가고, easymap 과 같은 얼굴로 돌아간다.
//  🔴모서리는 --r(2px) 하나뿐이다. 알약도 둥근 카드도 쓰지 않는다.
// ==========================================================================
const LANDING_CSS = `
  html {
    scroll-behavior: smooth;
    /* 🔴proximity 다, mandatory 가 아니다. 도구·가격 구역은 화면보다 길어서
         mandatory 로 물리면 중간 내용이 아예 닿지 않는 자리가 생긴다.
         가까이 가면 딱 붙고, 긴 구역 안에서는 자유롭게 읽힌다. */
    scroll-snap-type: y proximity;
    scroll-padding-top: 61px;
  }

  .lp {
    --bg:   #0e0e0f;
    --bg2:  #131315;
    --card: #17171a;
    --line: rgba(255,255,255,0.10);
    --line2:rgba(255,255,255,0.22);
    --tx:   #eceae6;
    --mut:  #8a8a86;
    --dim:  #555552;
    /* 🔴톤은 이 하나뿐이다(2026-08-27 추가). 회색조가 너무 밋밋해서 주황을 들였다.
         ⚠️쓰는 자리를 늘리지 말 것 — 꼬리표·가격·주 버튼까지다. 여기저기 칠하면
           다시 easymap 처럼 색이 화면을 끌고 가는 얼굴이 된다. */
    --acc:  #e8802e;
    --accx: #140f0a;   /* 주황 위에 얹는 글자색 */
    /* 🔴할인 기간의 등급 기둥을 칠하는 색.
       🔴테두리는 투명도를 안 쓴다(2026-09-05 사용자 지시) — 통색이다. 알파로 두면
         뒤에 뭐가 깔리느냐에 따라 진하기가 달라지고, 어두운 바탕 위에서 흐리게
         뜬다. 바탕색만 옅게 깔아 칸을 물들인다.
       ⚠️--acc 를 바꾸면 이 둘도 손으로 함께 바꿀 것 — 저절로 안 따라온다. */
    --accw: rgba(232,128,46,0.09);   /* 칸 바탕 — 여기는 옅게 깔아야 글자가 산다 */
    --accw2:#8a5227;                 /* 칸 테두리 — 통색 */
    /* 🔴커서를 올린 칸이 "떠오르는" 값 한 벌(2026-08-27).
         ⚠️translateY 만으로는 떠오른 게 안 보인다 — 바닥에 지는 그림자가 있어야
           눈이 높이를 읽는다. 뒤의 옅은 주황 무리는 테두리 색과 이어져
           빛을 받아 뜬 것처럼 보이게 한다. */
    --lift: 0 20px 44px rgba(0,0,0,0.62), 0 0 30px rgba(232,128,46,0.15);
    --r:    2px;
    --mono: var(--font-geist-mono), ui-monospace, monospace;
    --pad:  clamp(20px, 3.6vw, 60px);

    background: var(--bg);
    color: var(--tx);
    font-family: var(--font-geist-sans), -apple-system, 'Helvetica Neue', sans-serif;
    letter-spacing: -0.01em;
    /* 🔴clip 이다, hidden 이 아니다(2026-08-27 고침). hidden 은 .lp 를 "스크롤
         상자"로 만들어 버려서, 그 안의 position:sticky 가 붙잡을 스크롤이
         없어진다 — 상단 막대가 위에 안 붙고 그냥 따라 올라가 사라졌다.
         clip 은 넘치는 것만 자르고 스크롤 상자를 만들지 않는다. */
    overflow-x: clip;
  }
  .lp ::selection { background: var(--acc); color: var(--accx); }
  .lp a { color: inherit; text-decoration: none; }
  .lp section { position: relative; }
  /* 구역마다 화면이 딱 맞게 선다. 상단 막대(60px) 밑으로 숨지 않게 한 칸 띄운다. */
  .lp [data-sec] { scroll-snap-align: start; scroll-margin-top: 60px; }

  /* 🔴가장자리까지 쓰는 건 **첫 화면과 상단 막대뿐이다**(2026-08-27 정정).
       글이 왼쪽 끝, 메뉴가 오른쪽 끝에 붙는 건 거기서만. 나머지 구역은
       가운데 틀(1240px)로 돌아왔다 — 넓은 화면에서 글줄이 끝없이 길어졌었다. */
  .lp-wrap { width: 100%; max-width: 1240px; margin: 0 auto; padding: 0 var(--pad); }
  .lp-bleed { width: 100%; padding: 0 var(--pad); }
  .lp-read { max-width: 62ch; }   /* 문장만 따로 폭을 묶는다 — 안 그러면 한 줄이 너무 길다 */

  /* ── 구역 머리말 ── */
  .lp-eyebrow {
    display: flex; align-items: center; gap: 12px;
    font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.26em;
    text-transform: uppercase; color: var(--acc); margin-bottom: 22px;
  }
  .lp-eyebrow::before { content: ""; width: 40px; height: 1px; background: var(--acc); }

  /* 🔴큰 글의 위계 = 밝기다. 앞머리는 물리고, 요점만 밝힌다. */
  /* 🔴큰 제목은 전부 흰색이다(2026-08-27 지시). 한때 앞머리를 회색으로 물리고
       요점만 밝혔는데, 물린 쪽이 배경에 먹혀 문장이 반토막으로 읽혔다.
       ⚠️그래서 em 은 이제 색이 아니라 **줄바꿈과 자리**로만 구실한다. */
  .lp-h1, .lp-h2 { font-weight: 800; letter-spacing: -0.04em; line-height: 1.02; color: var(--tx); }
  .lp-h1 { font-size: clamp(2.8rem, 6.6vw, 5.4rem); }
  .lp-h2 { font-size: clamp(1.9rem, 4.2vw, 3.3rem); line-height: 1.08; }
  .lp-h1 em, .lp-h2 em { font-style: normal; color: var(--tx); }
  .lp-lede { color: var(--mut); font-size: 0.98rem; line-height: 1.85; margin-top: 20px; }

  /* ── 커서를 따라다니는 빛 ──
       🔴바탕 전체에 깔리는 한 겹(.lp-spot)과, 칸 안에서만 번지는 한 겹(.glow)이
         따로 논다. 앞엣것은 화면 좌표(--cx/--cy), 뒤엣것은 칸 안 좌표(--mx/--my)다 —
         한 벌로 묶으려면 칸마다 제 위치를 CSS 가 알아야 하는데 그건 안 된다. */
  .lp-spot {
    position: fixed; inset: 0; z-index: 1; pointer-events: none; mix-blend-mode: screen;
    background: radial-gradient(620px circle at var(--cx, 50%) var(--cy, 15%), rgba(232,128,46,0.11), transparent 66%);
  }
  .glow { position: relative; }
  .glow::before {
    content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none;
    opacity: 0; transition: opacity .3s;
    background: radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgba(232,128,46,0.17), transparent 62%);
  }
  .glow:hover::before { opacity: 1; }
  .glow > * { position: relative; z-index: 1; }

  /* ── 오른쪽 점 표시 ── */
  .lp-dots {
    position: fixed; right: 16px; top: 50%; transform: translateY(-50%); z-index: 70;
    display: flex; flex-direction: column; gap: 14px;
  }
  .lp-dots button {
    width: 22px; height: 10px; padding: 0; border: none; background: none; cursor: pointer;
    display: flex; align-items: center; justify-content: flex-end;
  }
  .lp-dots button::after {
    content: ""; height: 1px; width: 10px; background: var(--dim);
    transition: width .25s, background .25s;
  }
  .lp-dots button:hover::after { background: var(--mut); }
  .lp-dots button.on::after { width: 22px; background: var(--acc); }

  /* ── 상단 막대 ── */
  .lp-nav {
    position: sticky; top: 0; z-index: 60;
    background: rgba(14,14,15,0.78); backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--line);
  }
  .lp-nav-in { display: flex; align-items: center; justify-content: space-between; height: 60px; gap: 20px; }
  .lp-brand { font-size: 1rem; font-weight: 800; letter-spacing: -0.03em; }
  .lp-brand span { color: var(--dim); }
  .lp-nav-links { display: flex; align-items: center; gap: 4px; }
  .lp-nav-links a {
    font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--mut); padding: 8px 11px; transition: color .15s;
  }
  .lp-nav-links a:hover { color: var(--tx); }
  /* 언어 단추는 components/LanguageMenu 가 제 모양을 갖고 온다 — 여기서는 자리만 띄운다 */
  .lp-nav-links .mlang { margin-left: 10px; }

  /* ── 1구역 · 첫 화면 ── */
  .lp-hero { min-height: calc(100vh - 61px); display: flex; align-items: center; padding: 84px 0; }
  /* 🔴사진이 첫 화면 전체를 덮고, 글은 그 **한가운데**에 선다(2026-08-27 지시).
       글이 사진 위에 얹히므로 그늘(::after)이 가운데까지 와야 읽힌다. */
  .lp-hero-art { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
  /* 🔴사진을 전부 겹쳐 놓고 지금 것만 띄운다. 자리를 비웠다 채우면 한 번 껌뻑인다.
       ⚠️겹치느라 사진이 전부 절대배치라 .shot 안에 흐름에 남는 것이 없다 —
         높이를 직접 주지 않으면 0 이 되어 **아무것도 안 보인다**(2026-08-27 고침). */
  .lp-hero-art .shot { height: 100%; }
  .lp-hero-art .shot > img { position: absolute; inset: 0; opacity: 0; transition: opacity 1.1s ease; }
  .lp-hero-art .shot > img.on { opacity: 1; }
  .lp-hero-in { position: relative; z-index: 1; width: 100%; }
  .lp-hero-col { max-width: 880px; margin: 0 auto; text-align: center; }

  /* 사진 위에 얹히므로 본문은 --mut 보다 밝아야 읽힌다 */
  .lp-hero-sub { color: #bcbab6; font-size: 1.05rem; line-height: 1.8; margin: 28px auto 40px; max-width: 560px; }

  /* 시작 단추 둘 — 왼쪽이 주(주황), 오른쪽이 보조. 군더더기 문구는 없다. */
  .lp-hero-cta { display: flex; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .lp-btn {
    position: relative; display: flex; align-items: center; justify-content: space-between; gap: 18px;
    border-radius: var(--r); padding: 19px 24px; font-size: 1.05rem; font-weight: 800;
    letter-spacing: -0.025em; overflow: hidden;
    transition: transform .22s cubic-bezier(.22,.61,.36,1), filter .2s, border-color .2s,
                color .2s, box-shadow .22s;
  }
  .lp-btn:hover { transform: translateY(-6px); box-shadow: var(--lift); }
  .lp-btn i { font-style: normal; font-size: 1.1rem; line-height: 1; }
  /* 🔴[프로젝트 시작하기] 글자만 흰색이다(2026-08-27 지시). 주황 위에 얹는 글자색은
       원래 --accx(거의 검정)인데, 첫 화면의 이 단추 하나만 흰 글자로 간다.
       ⛔--accx 자체를 흰색으로 바꾸지 말 것 — 요금표 단추·[플러그인 받기]·
         글자 선택 배경까지 그 값을 함께 보고 있어서, 저기까지 흰 글자가 된다. */
  .lp-btn.pri { background: var(--acc); color: #fff; min-width: 262px; }
  .lp-btn.pri:hover { filter: brightness(1.08); }
  .lp-btn.sec {
    min-width: 214px; color: var(--tx);
    background: rgba(18,18,20,0.62); backdrop-filter: blur(8px); border: 1px solid var(--line2);
  }
  .lp-btn.sec:hover { border-color: var(--acc); color: var(--acc); }

  /* ── 사진 틀 — 가장자리를 어둡게 먹인다 ── */
  .shot { position: relative; overflow: hidden; background: var(--bg2); }
  /* 🔴사진에 색 손을 대지 않는다(2026-08-27 지시). 한때 흑백으로 빨아들였는데,
       결과물 자체가 보여 줄 것이라 원래 색 그대로 나가야 한다.
       어두운 바닥에 얹히는 일은 아래 ::after 의 가장자리 그늘이 맡는다. */
  .shot > img { display: block; width: 100%; height: 100%; object-fit: cover; }
  /* 🔴가장자리 그늘은 **모든 사진 칸**에 건다(2026-08-28 지시). 다만 세기가 두 벌이다.
       · 여기(.shot::after)   — 2~4구역. 칸 안에 담긴 **보여 줄 것**이라 옅게.
                                가운데는 거의 손대지 않고(0.04) 가장자리만 0.55 로 눌러
                                사진이 칸 테두리에 맞닿아 붕 뜨는 것을 잡아 준다.
       · 아래(.lp-hero-art)   — 첫 화면. 거긴 사진이 배경이고 그 위에 글이 서므로 훨씬 짙다.
       ⛔여기 값을 첫 화면만큼 올리지 말 것 — 결과물 사진이 안 보인다. */
  /* ⚠️가장자리를 0.26 → 0.55 → 0.78 로 두 번 올렸다(2026-08-28). 사진 위에 얹는
       그늘은 0.3 밑으로 내려가면 사실상 없는 것과 같다 — 처음 두 값은 넣어도
       넣은 티가 안 났다. 세기를 만질 일이 있으면 아래 100% 값 하나만 만진다. */
  .shot::after {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(96% 90% at 50% 42%,
      rgba(14,14,15,0.06) 0%, rgba(14,14,15,0.34) 56%, rgba(14,14,15,0.78) 100%);
  }
  /* 🔴그늘은 **가운데만** 옅게, 가장자리는 그대로 짙게(2026-08-27 지시로 두 번 낮췄다:
       0.46 → 0.34 → 0.20). 사진을 보여 주려고 거는 게 아니라 글을 읽히려고 거는 것이라,
       낮출 곳은 글이 서는 한가운데뿐이다.
       ⛔가장자리(radial 100% = 0.99, linear 0% = 0.86, 100% = 1)는 낮추지 말 것 —
         위는 상단 막대 글씨가, 아래는 다음 구역과 이어지는 경계가 거기에 얹혀 있다.
       ⚠️두 겹이 겹쳐 앉는다. 한가운데의 실제 어둡기는 radial 과 linear 를 곱한 값이라
         (1-0.20)×(1-0.18) ≈ 0.34 다 — 한쪽만 보고 고치면 생각보다 크게 움직인다. */
  .lp-hero-art .shot::after {
    content: ""; position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(82% 74% at 50% 46%, rgba(14,14,15,0.20) 0%, rgba(14,14,15,0.62) 54%, rgba(14,14,15,0.99) 100%),
      linear-gradient(to bottom, rgba(14,14,15,0.86) 0%, rgba(14,14,15,0.14) 26%, rgba(14,14,15,0.24) 68%, rgba(14,14,15,1) 100%);
  }
  .shot-ph {
    position: absolute; inset: 0;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    background:
      linear-gradient(140deg, #1a1a1d 0%, #101012 100%),
      repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 10px);
    text-align: center; padding: 16px;
  }
  .shot-ph b { font-size: 0.76rem; font-weight: 600; color: #5d5d5a; }
  .shot-ph i {
    font-style: normal; font-family: var(--mono); font-size: 0.55rem; letter-spacing: 0.24em;
    text-transform: uppercase; color: #3c3c3a;
    border: 1px solid rgba(255,255,255,0.07); border-radius: var(--r); padding: 4px 9px;
  }

  /* ── 2구역 · 제품 넷 ── */
  .lp-sec { padding: 128px 0; }
  .lp-prod { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 68px; align-items: center; }
  .lp-prod-head { font-size: clamp(1.9rem, 3.8vw, 3.1rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.06; white-space: pre-line; }
  .lp-prod-body { color: var(--mut); font-size: 0.96rem; line-height: 1.9; margin-top: 22px; min-height: 122px; max-width: 54ch; }
  .lp-prod-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  /* 🔴칸은 링크가 아니다. 커서를 올리면 왼쪽 글만 바뀐다. */
  .lp-tile {
    border: 1px solid var(--line); border-radius: var(--r); overflow: hidden;
    background: var(--card); cursor: default;
    transition: border-color .2s, transform .22s cubic-bezier(.22,.61,.36,1), box-shadow .22s;
  }
  .lp-tile.on { border-color: var(--acc); transform: translateY(-6px); box-shadow: var(--lift); }
  .lp-tile .shot { aspect-ratio: 4 / 3; transition: opacity .25s; opacity: 0.6; }
  .lp-tile.on .shot { opacity: 1; }
  .lp-card .shot > img, .lp-tool .shot > img { transition: transform .4s cubic-bezier(.22,.61,.36,1); }
  .lp-card:hover .shot > img, .lp-tool:not(.soon):hover .shot > img { transform: scale(1.04); }
  .lp-tile-name {
    display: flex; align-items: baseline; gap: 9px;
    padding: 14px 16px; border-top: 1px solid var(--line);
    font-size: 0.86rem; font-weight: 700; color: var(--mut); transition: color .2s;
  }
  .lp-tile.on .lp-tile-name { color: var(--tx); }
  .lp-tile-name em { font-style: normal; font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.16em; color: var(--dim); transition: color .2s; }
  .lp-tile.on .lp-tile-name em { color: var(--acc); }

  /* ── 3구역 · 표본. 스스로 오른쪽에서 왼쪽으로 흐른다 ── */
  .lp-rail-mask {
    /* 🔴막대가 보이면 안 된다(2026-08-27 지시). overflow:hidden 에 더해 막대 자체를
         감춘다 — 어떤 이유로든 넘칠 때 밑에 회색 띠가 그어지는 걸 막는다. */
    /* 🔴위아래 여백은 장식이 아니다. overflow 는 padding box 에서 자르므로,
         이 여백이 없으면 커서를 올려 떠오른 칸의 **윗부분과 그림자가 잘린다**
         (2026-08-27 고침). 가로만 자르고 세로는 남기는 CSS 는 없다 —
         한쪽을 hidden 으로 두면 다른 쪽 visible 은 auto 가 되어 막대가 생긴다. */
    overflow: hidden; padding: 32px 0 56px; scrollbar-width: none; -ms-overflow-style: none;
    /* 양 끝을 흐리게 지워 줄이 화면 밖에서 시작하고 끝나는 것처럼 보이게 */
    -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
    mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
  }
  /* 🔴gap 이 아니라 margin-right 다. gap 을 쓰면 두 벌을 이어 붙였을 때
       -50% 자리가 반 칸 어긋나서 한 바퀴마다 눈에 띄게 튄다. */
  .lp-rail-mask::-webkit-scrollbar { display: none; width: 0; height: 0; }
  .lp-rail { display: flex; width: max-content; animation: lp-rail 39s linear infinite; }
  .lp-rail:hover { animation-play-state: paused; }
  @keyframes lp-rail { from { transform: translate3d(0,0,0); } to { transform: translate3d(-50%,0,0); } }

  .lp-card {
    width: 328px; flex: none; margin-right: 14px;
    border: 1px solid var(--line); border-radius: var(--r); overflow: hidden; background: var(--card);
    transition: border-color .2s, transform .22s cubic-bezier(.22,.61,.36,1), box-shadow .22s;
  }
  .lp-card:hover { border-color: var(--acc); transform: translateY(-6px); box-shadow: var(--lift); }
  .lp-card .shot { aspect-ratio: 16 / 11; }
  .lp-card-txt { padding: 17px 19px 20px; }
  .lp-card-no { font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.2em; color: var(--dim); }
  .lp-card-txt b { display: block; font-size: 0.98rem; font-weight: 700; margin: 10px 0 9px; }
  .lp-by { font-family: var(--mono); font-size: 0.63rem; letter-spacing: 0.16em; text-transform: uppercase; color: var(--acc); }

  /* ── 4구역 · 도구 다섯 ── */
  .lp-tools { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; margin-top: 52px; }
  .lp-tool {
    display: flex; flex-direction: column;
    border: 1px solid var(--line); border-radius: var(--r); background: var(--card);
    padding: 24px 24px 0; min-height: 400px; overflow: hidden;
    transition: border-color .2s, background .2s, transform .22s cubic-bezier(.22,.61,.36,1), box-shadow .22s;
  }
  .lp-tool:not(.soon):hover {
    border-color: var(--acc); background: #1b1b1e;
    transform: translateY(-6px); box-shadow: var(--lift);
  }
  .lp-tool.soon { opacity: 0.5; cursor: default; }
  /* 🔴제목 위의 가로줄을 뺐다(2026-08-27 지시) — 칸이 이미 테두리로 갈려 있어
       줄이 하나 더 그이면 같은 말을 두 번 하는 것이다. */
  .lp-tool-top {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim);
  }
  .lp-tool:not(.soon):hover .lp-tool-top { color: var(--mut); }
  .lp-tool:not(.soon) .lp-tool-top span:last-child { color: var(--acc); }
  .lp-tool h3 { font-size: 1.28rem; font-weight: 800; letter-spacing: -0.035em; margin: 20px 0 10px; }
  /* 🔴설명은 **두 줄 자리**를 늘 차지한다(2026-08-27 지시). 영어는 두 줄, 한국어는
       한 줄로 끝나는 칸이 많은데, 칸 높이가 줄 수를 따라가면 언어를 바꿀 때마다
       격자 한 줄이 통째로 오르내리고 그 아래 사진 칸까지 같이 줄어든다.
       ⚠️0.85rem × 1.8 × 2줄 = 3.06rem. 글자 크기를 고치면 이 값도 함께 고칠 것. */
  .lp-tool p { color: var(--mut); font-size: 0.85rem; line-height: 1.8; min-height: 3.06rem; }
  .lp-tool .shot { margin: 22px -24px 0; border-top: 1px solid var(--line); flex: 1; min-height: 176px; }

  /* ── 5구역 · 가격 ── */
  .lp-prices { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(0,1fr); gap: 14px; margin-top: 52px; align-items: start; }
  /* 건당 칸을 감췄을 때(PER_PIECE_ON_HOME=false) — 구독표 한 칸만 남는다.
     자리를 통째로 물려받아 1240px 를 다 쓴다(2026-08-29 지시). */
  .lp-prices.one { grid-template-columns: minmax(0,1fr); }
  .lp-price-box { border: 1px solid var(--line); border-radius: var(--r); background: var(--card); padding: 26px; }
  .lp-price-top {
    display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
    padding-bottom: 14px; border-bottom: 1px solid var(--line);
    /* 🔴카드 설명 한 줄을 뺐다(2026-08-27 지시). 머리와 표 사이를 벌려 주던 것이
         그 문단의 아래 여백이었으므로, 그 몫을 머리 쪽으로 옮겨 둔다. */
    margin-bottom: 22px;
  }
  .lp-price-top b { font-size: 1.12rem; font-weight: 800; letter-spacing: -0.03em; }
  .lp-price-kind { font-family: var(--mono); font-size: 0.61rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--acc); }

  .lp-tier-scroll { overflow-x: auto; }
  .lp-tier-grid { display: grid; grid-template-columns: 100px repeat(3, minmax(108px, 1fr)); gap: 6px; min-width: 452px; }
  .lp-tier-head {
    background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r); padding: 12px 10px;
    display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .lp-tier-head b { font-family: var(--mono); font-size: 0.7rem; letter-spacing: 0.16em; color: var(--mut); }
  .lp-tier-head span { font-size: 1rem; font-weight: 800; letter-spacing: -0.03em; color: var(--acc); }
  /* 🔴2026-09-05 — 프로그램 하나가 **줄 하나**다(사용자 지시, /account 의 짜임).
       전에는 사양마다 줄이 하나씩이고 프로그램 이름이 구분선으로 끼어 있었는데,
       그러면 프로그램이 늘 때마다 표가 세로로 길어지고 "어느 사양이 어느
       프로그램의 것인가"를 이름줄 하나에 기대야 했다. 이제 왼쪽에 프로그램
       이름 카드가 서고, 그 프로그램의 사양은 등급 칸 **안에** 쌓인다.
     🔴디자인은 홈 그대로다 — /account 는 흰 표, 여기는 어두운 결이다. */
  .lp-tier-prog {
    background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r);
    display: flex; align-items: center; justify-content: center; padding: 12px 10px;
    font-size: 0.78rem; font-weight: 800; letter-spacing: -0.02em; color: var(--acc);
    text-align: center;
  }
  /* 칸 안의 사양 한 줄 — 이름표는 흐리게, 값은 또렷하게. 위아래로 쌓인다. */
  .lp-tier-line { display: flex; flex-direction: column; gap: 2px; text-align: left; width: 100%; }
  .lp-tier-line span { font-size: 0.63rem; font-weight: 600; color: var(--dim); letter-spacing: 0; }
  .lp-tier-line b { font-size: 0.75rem; font-weight: 700; color: var(--tx); letter-spacing: -0.01em; }
  /* 이름표가 없는 사양(LaserFish — 열리냐 마느냐뿐이다)은 값을 가운데 세운다. */
  .lp-tier-line.solo { text-align: center; }
  .lp-tier-line.solo b { font-size: 0.78rem; }
  /* ○ 는 글자가 아니라 표시다 — 크게 띄워야 옆 칸의 말과 같은 무게로 읽힌다.
     ⚠️동그라미만 키운다. 뒤에 붙는 괄호("○(한시적)")까지 키우면 칸이 꽉 찬다. */
  .lp-tier-line b.mark { text-align: center; }
  .lp-tier-line b.mark em { font-style: normal; font-size: 1.6em; line-height: 1; vertical-align: -0.1em; }
  /* 🔴**이 사람이 쓰는 등급**의 기둥을 통째로 칠한다 — 2026-09-05 사용자 지시.
       머리 카드에만 표시하면 "값만 다르다"로 읽힌다. 그 등급이 덮는 것은 사양
       전부라, 그 말을 하려면 기둥이 통째로 달라 보여야 한다.
     🔴테두리를 두르지 않는다(먼저 그렇게 해 봤다). 격자 칸들은 각자 서 있고 사이에
       gap 이 있어 한 덩이로 묶으려면 칸 위에 줄을 따로 얹어야 하는데, 그 줄은
       제 자리를 넘기 쉽고(절대배치의 auto 끝선) 머리 카드의 테두리와 겹쳐
       이중선이 된다. 칸이 제 몫만 칠하면 그 사고가 아예 안 난다.
     ⚠️바탕만으로는 .off(점선 칸)와 헷갈릴 만큼 옅어서 테두리도 함께 물들이고
       2px 로 굵힌다. 배경을 진하게 칠하지는 않는다 — 값을 읽는 글자가 묻힌다.
     ⚠️굵혀도 칸 크기는 그대로다(테일윈드 preflight 의 box-sizing:border-box).
       그게 없으면 이 기둥만 2px 씩 커져 옆 기둥과 줄이 어긋난다. */
  .lp-tier-head.mine, .lp-tier-cell.mine {
    background: var(--accw); border-color: var(--accw2); border-width: 2px;
  }
  /* 왼쪽 프로그램 이름 카드는 등급이 없는 칸이라 안 칠한다. */
  .lp-tier-head.promo span { color: var(--dim); text-decoration: line-through; text-decoration-thickness: 1.5px; }
  .lp-tier-promo { font-family: var(--mono); font-size: 0.56rem; letter-spacing: 0.12em; color: #ffd76a; }
  /* ⚠️사양이 여러 줄 쌓이므로 세로로 늘어난다 — align-items 를 stretch 로 두고
       (격자 기본값) 줄들을 가운데로 모은다. min-height 는 사양 하나짜리
       프로그램(LaserFish)이 너무 납작해지지 않게 잡아 준다. */
  .lp-tier-cell {
    background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r);
    padding: 11px 9px; font-size: 0.72rem; font-weight: 600; text-align: center;
    display: flex; flex-direction: column; justify-content: center; gap: 7px; min-height: 44px;
  }
  .lp-tier-cell.off { color: #3f3f3d; border-style: dashed; align-items: center; }
  .lp-tier-cta { display: flex; }
  .lp-tier-cta a, .lp-tier-cta span {
    width: 100%; text-align: center; border-radius: var(--r); padding: 11px 8px;
    font-size: 0.72rem; font-weight: 700; line-height: 1.35;
    display: flex; align-items: center; justify-content: center;
  }
  .lp-tier-cta a { background: var(--acc); color: var(--accx); transition: filter .15s; }
  .lp-tier-cta a:hover { filter: brightness(1.08); }
  .lp-tier-cta span { border: 1px dashed var(--line); color: var(--dim); }

  .lp-piece { display: flex; flex-direction: column; gap: 6px; }
  .lp-piece-row {
    display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
    background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r); padding: 15px 16px;
  }
  .lp-piece-row b { font-size: 0.85rem; font-weight: 700; }
  .lp-piece-row span { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.03em; }
  .lp-piece-row span i { font-style: normal; font-family: var(--mono); font-size: 0.62rem; font-weight: 500; letter-spacing: 0.1em; color: var(--dim); margin-left: 6px; }
  .lp-fine { color: var(--dim); font-size: 0.74rem; line-height: 1.85; margin-top: 16px; }
  .lp-buy {
    display: block; text-align: center; margin-top: 16px; border-radius: var(--r);
    background: var(--acc); color: var(--accx); padding: 13px; font-size: 0.84rem; font-weight: 700;
    transition: filter .15s;
  }
  .lp-buy:hover { filter: brightness(1.08); }

  /* 홀로 남은 구독표를 키운다 — 넓은 화면에서만.
     🔴min-width 로 감싼 이유: 좁은 화면에서 같이 커지면 등급 칸(min 108px)이
       늘어나 표가 가로로 넘치고, .lp-tier-scroll 이 손가락으로 미는 표가 된다.
       ⇒ 1081px 아래에서는 위의 기본 크기가 그대로 산다.
     ⚠️두 칸(PER_PIECE_ON_HOME=true)으로 돌아가면 .one 이 안 붙어 저절로 꺼진다. */
  @media (min-width: 1081px) {
    .lp-prices.one .lp-price-box { padding: 34px 38px; }
    .lp-prices.one .lp-price-top { padding-bottom: 18px; margin-bottom: 28px; }
    .lp-prices.one .lp-price-top b { font-size: 1.34rem; }
    .lp-prices.one .lp-price-kind { font-size: 0.66rem; }
    .lp-prices.one .lp-tier-grid { grid-template-columns: 190px repeat(3, minmax(150px,1fr)); gap: 8px; }
    .lp-prices.one .lp-tier-head { padding: 17px 12px; gap: 6px; }
    .lp-prices.one .lp-tier-head b { font-size: 0.78rem; }
    .lp-prices.one .lp-tier-head span { font-size: 1.32rem; }
    .lp-prices.one .lp-tier-prog { font-size: 0.92rem; padding: 16px 14px; }
    .lp-prices.one .lp-tier-cell { font-size: 0.83rem; padding: 15px 14px; min-height: 56px; gap: 9px; }
    .lp-prices.one .lp-tier-line span { font-size: 0.7rem; }
    .lp-prices.one .lp-tier-line b { font-size: 0.85rem; }
    .lp-prices.one .lp-tier-cta a,
    .lp-prices.one .lp-tier-cta span { font-size: 0.83rem; padding: 15px 10px; }
  }

  /* ── 6구역 · 바닥글 ── */
  .lp-foot { border-top: 1px solid var(--line); background: var(--bg2); padding: 76px 0 44px; }
  .lp-foot-top { display: flex; justify-content: space-between; gap: 44px; flex-wrap: wrap; margin-bottom: 44px; }
  .lp-foot-brand b { font-size: 1rem; font-weight: 800; letter-spacing: -0.03em; }
  .lp-foot-brand p { color: var(--mut); font-size: 0.79rem; line-height: 1.95; margin-top: 12px; }
  .lp-foot-cols { display: flex; gap: 54px; flex-wrap: wrap; }
  .lp-foot-col h4 { font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); margin-bottom: 14px; }
  .lp-foot-col a { display: block; font-size: 0.8rem; color: var(--mut); line-height: 2.15; transition: color .15s; }
  .lp-foot-col a:hover { color: var(--acc); }
  .lp-biz { border-top: 1px solid var(--line); padding-top: 26px; color: #5a5a57; font-size: 0.71rem; line-height: 2; }

  /* ── 문의 창 ──
       🔴이 창은 .lp 밖(document.body)에 붙는다 — createPortal. 안에 두었을 때
         안 떴다(2026-08-27). .lp 는 overflow-x:clip 이고 그 안에 sticky 막대와
         mix-blend-mode 를 쓰는 겹(.lp-spot)이 있어서, position:fixed 한 장이
         어디서 잘리거나 묻히는지 짚기 어려웠다. 밖으로 빼면 그 전부와 무관해진다.
       ⚠️밖으로 나가면 .lp 의 값들(--acc/--tx …)을 못 물려받는다. 그래서 여기서
         제 몫으로 다시 적는다. 홈의 --acc 를 바꾸면 이 줄도 함께 바꿀 것. */
  .lp-modal {
    --bg2:  #131315;
    --line: rgba(255,255,255,0.10);
    --tx:   #eceae6;
    --mut:  #8a8a86;
    --dim:  #555552;
    --acc:  #e8802e;
    --r:    2px;
    --mono: var(--font-geist-mono), ui-monospace, monospace;
    font-family: var(--font-geist-sans), -apple-system, 'Helvetica Neue', sans-serif;
    letter-spacing: -0.01em; color: var(--tx);

    position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center;
    padding: 24px; background: rgba(8,8,9,0.72); backdrop-filter: blur(6px);
    animation: lp-fade .2s ease;
  }
  @keyframes lp-fade { from { opacity: 0; } to { opacity: 1; } }
  .lp-modal-box {
    position: relative; width: 100%; max-width: 424px; text-align: center;
    background: #1a1c21; border: 1px solid var(--line); border-radius: var(--r); padding: 40px 34px 34px;
    box-shadow: 0 24px 70px rgba(0,0,0,0.55);
  }
  .lp-modal-x {
    position: absolute; top: 14px; right: 14px; width: 28px; height: 28px;
    background: none; border: none; color: var(--dim); font-size: 1.05rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center; border-radius: var(--r);
    transition: color .15s, background .15s;
  }
  .lp-modal-x:hover { color: var(--tx); background: rgba(255,255,255,0.06); }
  .lp-modal-box h3 { font-size: 1.4rem; font-weight: 800; letter-spacing: -0.035em; }
  .lp-modal-mail {
    display: flex; align-items: center; gap: 14px; text-align: left; margin-top: 24px;
    border: 1px solid var(--line); border-radius: var(--r); padding: 15px 17px;
    transition: border-color .18s, background .18s;
  }
  .lp-modal-mail:hover { border-color: var(--acc); background: rgba(232,128,46,0.06); }
  .lp-modal-mail .m-ico { color: var(--acc); display: flex; }
  .lp-modal-mail .m-txt { flex: 1; min-width: 0; }
  .lp-modal-mail .m-lab { display: block; font-family: var(--mono); font-size: 0.58rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--dim); }
  .lp-modal-mail b { display: block; font-size: 0.92rem; font-weight: 700; margin-top: 4px; overflow-wrap: anywhere; }
  .lp-modal-mail .m-go { color: var(--acc); font-size: 1rem; }

  /* 🔴CONTACT 열의 [Email]은 링크가 아니라 창을 여는 단추다. 옆 열의 링크들과
       한 줄로 읽혀야 하므로 생김새를 .lp-foot-col a 와 똑같이 맞춘다. */
  .lp-foot-col button {
    display: block; background: none; border: none; padding: 0; text-align: left;
    font-family: inherit; font-size: 0.8rem; color: var(--mut); line-height: 2.15;
    cursor: pointer; transition: color .15s;
  }
  .lp-foot-col button:hover { color: var(--acc); }

  /* ── 들어올 때 떠오르는 움직임 ──
       🔴transform 이 아니라 **translate** 를 쓴다(2026-08-27 고침).
         전에는 둘 다 transform 이라, 화면에 들어온 뒤 걸리는 transform:none 이
         커서를 올렸을 때의 translateY(-6px) 를 눌러 버렸다 — 그래서 첫 화면
         단추(등장 규칙이 안 걸린)는 떠오르고 칸들은 안 떠올랐다.
         ⛔이 덩어리는 template literal 안이다. 주석에도 백틱을 쓰지 말 것 —
           문자열이 그 자리에서 끊긴다.
         translate 는 transform 과 **따로 쌓이는** 속성이라 둘이 안 부딪힌다. */
  .reveal { opacity: 0; translate: 0 18px; }
  .lp .in .reveal, .lp .reveal.in {
    opacity: 1; translate: none;
    /* 🔴뒤의 넷은 커서 반응용이다(2026-08-27 고침). 이 규칙은 명시도가 높아
         .lp-tile / .lp-tool 이 제 몫으로 적어 둔 transition 을 **통째로 덮는다** —
         여기 같이 안 적으면 그 칸들만 부드럽게 안 뜨고 툭 튀어 오른다.
         (등장 규칙이 안 걸린 표본 카드만 멀쩡했던 이유가 이것이다.)
       ⚠️늦춤(delay)은 앞의 둘에만 붙인다. 통째로 transition-delay 를 걸면
         커서를 올린 뒤 한참 있다 떠오른다. */
    transition:
      opacity .7s cubic-bezier(.22,.61,.36,1) calc(var(--i, 0) * 70ms),
      translate .7s cubic-bezier(.22,.61,.36,1) calc(var(--i, 0) * 70ms),
      transform .22s cubic-bezier(.22,.61,.36,1),
      box-shadow .22s,
      border-color .2s,
      background .2s;
  }

  /* ── 좁은 화면 ── */
  @media (max-width: 1080px) {
    .lp-tools { grid-template-columns: repeat(2, minmax(0,1fr)); }
    .lp-prices { grid-template-columns: minmax(0,1fr); }
  }
  @media (max-width: 900px) {
    html { scroll-snap-type: none; }   /* 좁은 화면에서는 물리지 않는다 */
    .lp-dots { display: none; }
    .lp-prod { grid-template-columns: minmax(0,1fr); gap: 36px; }
    .lp-prod-body { min-height: 0; }
    /* 사진을 뒤로 물린다 — 글 위에 겹치면 첫 화면이 안 읽힌다 */
    .lp-hero-art { opacity: 0.42; }
    .lp-hero-cta { flex-direction: column; }
    .lp-btn { width: 100%; min-width: 0; }
    .lp-hero { min-height: 0; padding: 56px 0 76px; }
    .lp-sec { padding: 86px 0; }
    /* 메뉴를 지우지 않는다 — 감추면 이 화면 말고는 갈 곳이 없어진다 */
    .lp-nav-in { height: auto; flex-direction: column; gap: 4px; padding: 9px 0; }
    .lp-nav-links { flex-wrap: wrap; justify-content: center; gap: 0; }
    .lp-nav-links a { font-size: 0.65rem; padding: 6px 8px; }
  }
  @media (max-width: 620px) {
    /* 🔴clamp 의 아래 끝(2.8rem)이 좁은 화면엔 여전히 크다 — 세 줄로 흘러
         첫 화면이 제목만으로 꽉 찬다. 여기서 한 번 더 내린다. */
    .lp-h1 { font-size: clamp(1.9rem, 9vw, 2.7rem); }
    .lp-hero-sub { font-size: 0.95rem; margin: 22px auto 30px; }
    .lp-tools { grid-template-columns: minmax(0,1fr); }
    .lp-tool { min-height: 0; }
    .lp-duo { grid-template-columns: 1fr; }
    .lp-card { width: 76vw; }
  }

  /* 🔴움직임을 싫다고 해 둔 사람에게는 전부 멈춘다 */
  @media (prefers-reduced-motion: reduce) {
    html { scroll-behavior: auto; scroll-snap-type: none; }
    /* ⚠️흐르는 줄은 여기서 멈추지 않는다(2026-08-27 결정). 전에는 멈추고
         가로 스크롤로 바꿨는데, 윈도우에서 애니메이션을 꺼 둔 사람 화면에
         **회색 스크롤 막대가 그어졌다.** 화면 구성 자체가 흐름을 전제로 한다.
         대신 떠오르는 움직임과 부드러운 스크롤은 그대로 끈다. */
    .lp-rail { animation-duration: 70s; }
    .reveal { opacity: 1; translate: none; }
  }
`;

// 사진 한 장 — 없으면 자리표시자가 대신 선다.
//  🔴next/image 로 그린다(2026-08-28). 전에는 <img> 로 원본을 그대로 내보내고
//    줄이는 일을 브라우저에 맡겼는데, 원본이 800~1600px 인 도면을 300px 칸에
//    욱여넣으니 얇은 선이 뭉개졌다(사용자 지적). Next 는 sharp 로 미리 줄여
//    칸 크기에 맞는 판을 내보내므로 같은 그림이 훨씬 곱게 선다.
//  ⚠️sizes 는 부르는 쪽이 **반드시** 제 칸 폭으로 준다. 안 주면 100vw 로 보고
//    300px 칸에 화면 폭짜리 판을 내려보낸다 — 느려지기만 하고 더 곱지도 않다.
//  ⚠️quality 90 — 여기 들어가는 것은 사진이 아니라 **도면과 지도**다. 얇은 선과
//    글자가 많아서 기본값 75 로는 선 둘레에 티가 낀다. next.config.ts 의
//    images.qualities 에 90 이 올라 있어야 쓸 수 있다(Next 16 부터 허용목록제).
function Shot({ src, alt, sizes }: { src: string | null; alt: string; sizes: string }) {
  return (
    <div className="shot">
      {src ? (
        <Image src={src} alt={alt} fill sizes={sizes} quality={90} />
      ) : (
        <div className="shot-ph">
          <b>{alt}</b>
          <i>image</i>
        </div>
      )}
    </div>
  );
}

// 첫 화면 뒤 사진. 전부 겹쳐 놓고 지금 것만 띄운다(HERO_MS 마다 다음 장).
//  🔴Shot 과 따로 두는 이유 — 저쪽은 한 장짜리라 여러 장을 얹으면 자리표시자
//    판정이 얽힌다. 여기는 사진이 반드시 있는 자리다.
function HeroArt({ now, upto }: { now: number; upto: number }) {
  return (
    <div className="shot">
      {HERO_IMGS.slice(0, upto + 1).map((src, i) => (
        // 🔴fill — 원본이 저마다 크기가 달라서(2048×1536 ~ 5634×2640) 가로세로를
        //   적을 수가 없다. 부모 .shot 이 position:relative 라 그대로 채운다.
        //   sizes="100vw" 를 빼면 Next 가 좁은 화면에도 큰 판을 내보낸다.
        //   ⚠️preload 는 첫 장에만. Next 16 에서 priority 는 이 이름으로 바뀌었다.
        //   ⚠️opacity 로 겹쳐 넘기는 일은 CSS(.lp-hero-art .shot > img)가 맡는다 —
        //     next/image 는 그 값을 건드리지 않으므로 그대로 산다.
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          preload={i === 0}
          loading="eager"
          className={i === now ? "on" : ""}
        />
      ))}
    </div>
  );
}

// PlanTable 의 칸 값 — 글자 하나이거나 {ko,en} 이거나 없음(×).
type Cell = string | { ko: string; en: string } | null;
const cellText = (c: Cell, lang: Lang) => (c == null ? null : typeof c === "string" ? c : trPick(lang, c));

// 🔴칸 안에서 번지는 빛의 자리를 그 칸에만 적어 준다(--mx/--my).
//   CSS 는 "이 칸 안에서 커서가 어디인가"를 스스로 알 수 없어서, 지나가는
//   칸이 제 좌표를 직접 적는다. 지금 커서가 얹힌 칸 하나만 적히므로 싸다.
const onGlow = (e: React.MouseEvent<HTMLElement>) => {
  const el = e.currentTarget;
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
};

const MailIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <rect x="2" y="4.5" width="20" height="15" rx="2" />
    <path d="m2.6 6 9.4 6.6L21.4 6" />
  </svg>
);

// 떠오르는 순서를 매기는 데만 쓴다.
const rv = (i: number) => ({ style: { "--i": i } as React.CSSProperties });

export default function LandingView() {
  const { lang } = useLanguage();
  const T = useT();
  const L = (o: Txt) => trPick(lang, o);
  // null(아직 모른다) 이면 글자를 바꾸지 않는다 — 먼저 띄웠다 바꾸면 깜빡인다.
  const signedIn = useSignedIn();
  const [active, setActive] = useState(0);
  const [dot, setDot] = useState(0);
  const [contact, setContact] = useState(false);
  // 🔴at(지금 장)과 upto(어디까지 얹었나)를 **한 덩이로** 든다. 둘로 쪼개면
  //   한쪽을 다른 쪽의 갱신 안에서 건드리게 되고, 그건 렌더가 꼬이는 길이다.
  //   upto 는 지금 장 + 한 장까지만 간다 — 넷을 한꺼번에 받으면 첫 화면이 무겁다.
  const [hero, setHero] = useState({ at: 0, upto: 1 });

  // 첫 화면 사진을 HERO_MS 마다 다음 장으로. 겹쳐 둔 것들끼리 서서히 바뀐다.
  useEffect(() => {
    const id = setInterval(() => {
      setHero(({ at, upto }) => {
        const next = (at + 1) % HERO_IMGS.length;
        return { at: next, upto: Math.max(upto, Math.min(next + 1, HERO_IMGS.length - 1)) };
      });
    }, HERO_MS);
    return () => clearInterval(id);
  }, []);

  // 커서 자리를 뿌리에 적어 둔다 — 바탕에 깔린 빛(.lp-spot)이 이걸 따라온다.
  //  🔴rAF 로 한 프레임에 한 번만 적는다. mousemove 마다 적으면 스타일 재계산이
  //    초당 수백 번 일어나 스크롤이 끊긴다.
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    let x = 0;
    let y = 0;
    const move = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        root.style.setProperty("--cx", `${x}px`);
        root.style.setProperty("--cy", `${y}px`);
      });
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // 문의 창은 Esc 로도 닫힌다 — 창을 띄웠으면 나갈 길을 하나로 두지 않는다.
  useEffect(() => {
    if (!contact) return;
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setContact(false); };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [contact]);

  // ==========================================================================
  //  구역이 화면에 들어오면 (1) 안의 것들이 떠오르고 (2) 오른쪽 점이 옮겨간다.
  //  🔴setState 는 관찰자 콜백 안에서만 부른다 — effect 본문에서 부르면 붙자마자
  //    한 번 더 그려진다.
  // ==========================================================================
  useEffect(() => {
    const secs = Array.from(document.querySelectorAll<HTMLElement>("[data-sec]"));

    // 안의 것들을 떠오르게 — 한 번 떠오르면 다시 관찰하지 않는다.
    const show = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("in");
          show.unobserve(e.target);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    secs.forEach((s) => show.observe(s));

    // 지금 보고 있는 구역이 어디인가 — 점 표시가 이걸 짚는다.
    const track = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = secs.indexOf(e.target as HTMLElement);
          if (i >= 0) setDot(i);
        }
      },
      { threshold: 0.5 },
    );
    secs.forEach((s) => track.observe(s));

    return () => { show.disconnect(); track.disconnect(); };
  }, []);

  const prod = PRODUCTS[active];
  const foot = trPick(lang, t).footer;

  // 🔴가격표는 PROGRAMS 전부를 싣는다(2026-09-05) — 구독 하나가 모든 프로그램을
  //   덮으므로, 표에 한 프로그램만 서 있으면 그 말이 거짓이 된다.
  const tiers = TIERS.filter((tier) => tier.key !== "free");
  // 할인 기간에 동그라미가 쳐지는 등급. 판정은 lib/interim 한 곳이다.
  // 🔴"(할인 기간)" 배지와 그은 값. 보는 사람과 무관하다 — 값 이야기라 PLUS 에 붙는다.
  const isPromo = (key: string) => PLUS_FREE_PROMO && key === "plus";
  // 🔴칠하는 기둥은 **이 사람이 쓰는 등급**이다(2026-09-05 사용자 지시).
  //   ⛔등급을 손으로 못박지 말 것. 전에는 단추가 tier.key === "plus" 로 박혀 있어
  //     MAX 를 쓰는 사람에게도 PLUS 칸에 "이용 중"이 떴다. 지금 free 인 사람에게
  //     PLUS 가 켜지는 것은 PLUS 를 골라서가 아니라 **할인 기간이라 free 가 plus 로
  //     올라가서**다 — 그 판정은 lib/interim 의 effectivePlan 한 곳이 한다.
  //   ⚠️ready 전에는 아무 칸도 안 켠다. 먼저 켰다가 옮겨 붙으면 깜빡인다.
  const { ready: planReady, plan: myPlan } = useMyPlan();
  const isMine = (key: string) => planReady && myPlan === key;

  return (
    <main className="lp" id="top">
      <style>{LANDING_CSS}</style>
      <div className="lp-spot" aria-hidden />

      {/* ── 오른쪽 점 표시 ─────────────────────────────────────────── */}
      <nav className="lp-dots" aria-label={T("구역 이동", "Sections")}>
        {SECTIONS.map((s, i) => (
          <button
            key={s.id}
            className={i === dot ? "on" : ""}
            title={L(s.label)}
            aria-label={L(s.label)}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
          />
        ))}
      </nav>

      {/* ── 상단 막대 ─────────────────────────────────────────────── */}
      <nav className="lp-nav">
        <div className="lp-bleed lp-nav-in">
          <Link href="/" className="lp-brand">Mass<span>Labs</span></Link>
          <div className="lp-nav-links">
            {NAV.map((n) => (
              <a key={n.href} href={n.href}>{L(n.label)}</a>
            ))}
            {/* 🔴로그인 — 이미 들어와 있으면 내 계정 화면으로 보낸다.
                 ⚠️전에는 구독을 안 파는 동안 /account 가 홈으로 되돌려져서 여기서
                   archiMap 으로 비껴 보냈다. 2026-08-27 그 되돌림을 걷어냈다
                   (next.config.ts) — /account 는 보여 주기만 하는 화면이라 안전하다. */}
            <a href={signedIn ? "/account" : "/login"}>
              {signedIn
                ? (T("내 계정", "My account"))
                : (T("로그인", "Login"))}
            </a>
            {/* 🔴[내 계정] 바로 옆이다(2026-09-03 사용자 지시) — 여덟 언어라 토글이 아니라 목록이다 */}
            <LanguageMenu />
          </div>
        </div>
      </nav>

      {/* ── 1구역 · 첫 화면 ────────────────────────────────────────── */}
      <section className="lp-hero" data-sec>
        <div className="lp-hero-art">
          <HeroArt now={hero.at} upto={hero.upto} />
        </div>

        <div className="lp-bleed lp-hero-in">
          <div className="lp-hero-col">
            <h1 className="lp-h1 reveal" {...rv(0)}>
              <TRich
                ko={"건축 프로젝트를\n*한 곳에서.*"}
                en={"Every architecture project,\n*in one place.*"}
              />
            </h1>

            <p className="lp-hero-sub reveal" {...rv(1)}>
              {T("대지 분석, 모델 제작, 색 조합 — 건축가를 위한 도구를 한 계정에 모았습니다.", "Site analysis, model making, color palettes — a suite for architects, under one account.")}
            </p>

            {/* 🔴글자는 이름뿐이다(2026-08-27 지시). 무엇을 하는 단추인지는
                 이름이 이미 말하고 있어서, 밑에 설명을 붙이면 군더더기다. */}
            <div className="lp-hero-cta reveal" {...rv(2)}>
              {/* 누르면 4구역(도구 다섯)으로 내려간다 */}
              <a className="lp-btn pri glow" href="#tools" onMouseMove={onGlow}>
                <span>{T("프로젝트 시작하기", "Start project")}</span>
                <i>&rarr;</i>
              </a>
              <a
                className="lp-btn sec glow"
                href={YOUTUBE}
                target="_blank"
                rel="noreferrer"
                onMouseMove={onGlow}
              >
                <span>{T("영상 보기", "Watch video")}</span>
                <i>&#9654;</i>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2구역 · 제품 넷 (누르는 것이 아니다 — 올려 보는 것이다) ── */}
      <section className="lp-sec" id="products" data-sec>
        <div className="lp-wrap lp-prod">
          <div>
            <div className="lp-eyebrow reveal" {...rv(0)}>{T("제품", "Products")}</div>
            {/* 🔴오른쪽 칸에 커서를 올리면 이 두 덩이가 그 제품 것으로 바뀐다 */}
            <h2 className="lp-prod-head reveal" {...rv(1)}>{L(prod.head)}</h2>
            <p className="lp-prod-body reveal" {...rv(2)}>{L(prod.body)}</p>
          </div>

          <div className="lp-prod-grid">
            {PRODUCTS.map((p, i) => (
              <div
                key={p.name}
                className={`lp-tile glow reveal${i === active ? " on" : ""}`}
                onMouseEnter={() => setActive(i)}
                onMouseMove={onGlow}
                {...rv(i + 1)}
              >
                {/* 칸 폭 ≈ (1240 - 68) / 2 / 2 = 286px. 좁아지면 화면의 절반 */}
                <Shot src={p.img} alt={p.name} sizes="(max-width: 980px) 46vw, 300px" />
                <div className="lp-tile-name">
                  {p.name}
                  <em>{String(i + 1).padStart(2, "0")}</em>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3구역 · 결과물 표본 (스스로 흐른다) ────────────────────── */}
      <section className="lp-sec" id="samples" data-sec style={{ paddingBottom: "62px" }}>
        <div className="lp-wrap" style={{ marginBottom: "16px" }}>
          <div className="lp-eyebrow reveal" {...rv(0)}>{T("기능", "Capabilities")}</div>
          <h2 className="lp-h2 reveal" {...rv(1)}>
            <TRich
              ko={"짧은 시간 안에 *완성도 높은 결과물.*"}
              en={"Finished quality, *in a fraction of the time.*"}
            />
          </h2>
          <p className="lp-lede lp-read reveal" {...rv(2)}>
            {T("MassLabs 는 건축가들이 불필요하게 낭비되는 시간을 없애 줍니다. 당신의 시간을 효율적으로 쓰세요.", "MassLabs takes the wasted hours out of an architect's day. Spend your time where it counts.")}
          </p>
        </div>

        {/* 🔴같은 목록을 두 벌 이어 붙인다. 한 벌만 두면 끝에서 빈자리가 생긴다. */}
        <div className="lp-rail-mask reveal" {...rv(3)}>
          <div className="lp-rail">
            {[0, 1].map((copy) =>
              SAMPLES.map((s, i) => (
                <div
                  className="lp-card glow"
                  key={`${copy}-${s.by}-${L(s.title)}`}
                  aria-hidden={copy === 1}
                  onMouseMove={onGlow}
                >
                  {/* .lp-card 가 328px 고정, 좁은 화면에서만 76vw */}
                  <Shot src={s.img} alt={L(s.title)} sizes="(max-width: 760px) 76vw, 328px" />
                  <div className="lp-card-txt">
                    <div className="lp-card-no">{String(i + 1).padStart(2, "0")}</div>
                    <b>{L(s.title)}</b>
                    <div className="lp-by">{s.by}</div>
                  </div>
                </div>
              )),
            )}
          </div>
        </div>
      </section>

      {/* ── 4구역 · 도구 다섯 ([Start project] 가 여기로 내려온다) ──── */}
      <section
        className="lp-sec"
        id="tools"
        data-sec
        style={{ background: "var(--bg2)", borderTop: "1px solid var(--line)", borderBottom: "1px solid var(--line)" }}
      >
        <div className="lp-wrap">
          <div className="lp-eyebrow reveal" {...rv(0)}>{T("도구", "Tools")}</div>
          <h2 className="lp-h2 reveal" {...rv(1)}>
            <TRich ko={"대지 분석부터, *레이저 커팅까지.*"} en={"From site analysis *to laser cutting.*"} />
          </h2>
          <p className="lp-lede lp-read reveal" {...rv(2)}>
            {T("필요한 도구를 고르면 그 자리에서 바로 시작됩니다. 계정도 요금제도 하나입니다.", "Pick a tool and start right there. One account, one plan.")}
          </p>

          <div className="lp-tools">
            {TOOLS.map((tool, i) => {
              const inner = (
                <>
                  <div className="lp-tool-top">
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    <span>{tool.href ? tool.by : (T("준비 중", "soon"))}</span>
                  </div>
                  <h3>{L(tool.title)}</h3>
                  <p>{L(tool.body)}</p>
                  {/* 3열 → 약 390px, 2열 → 화면의 절반, 1열 → 화면 폭 */}
                  <Shot src={tool.img} alt={L(tool.title)} sizes="(max-width: 640px) 92vw, (max-width: 1080px) 46vw, 400px" />
                </>
              );
              const key = tool.by + L(tool.title);
              return tool.href ? (
                <a
                  key={key}
                  className="lp-tool glow reveal"
                  onMouseMove={onGlow}
                  href={withLang(tool.href, lang)}
                  target={tool.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  {...rv(i + 3)}
                >
                  {inner}
                </a>
              ) : (
                <div key={key} className="lp-tool soon reveal" {...rv(i + 3)}>{inner}</div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 5구역 · 가격 ───────────────────────────────────────────── */}
      <section className="lp-sec" id="pricing" data-sec>
        <div className="lp-wrap">
          <div className="lp-eyebrow reveal" {...rv(0)}>{T("가격", "Pricing")}</div>
          {/* 🔴머리말도 건당 칸을 따라간다 — 칸을 감춘 채로 "그리고 건당 결제"라고
                말하면 없는 것을 가리키는 문장이 된다. */}
          <h2 className="lp-h2 reveal" {...rv(1)}>
            {PER_PIECE_ON_HOME
              ? <TRich ko={"구독 하나, *그리고 건당 결제.*"} en={"One subscription, *plus pay-per-piece.*"} />
              : <TRich ko={"구독 하나로 *전부.*"} en={"One subscription, *everything.*"} />}
          </h2>
          <p className="lp-lede lp-read reveal" {...rv(2)}>
            {PER_PIECE_ON_HOME
              ? (T("archiMap 과 LaserFish 는 당분간 분리해서 운영됩니다.", "For now, archiMap and LaserFish are run separately."))
              : SUBSCRIPTION_LIVE
                ? (T("구독 하나로 MassLabs 의 모든 프로그램을 사용합니다.", "One subscription covers every MassLabs program."))
                /* 🔴2026-09-05 — "archiMap PLUS"가 아니라 그냥 PLUS 다. LaserFish 도
                     같은 문턱 안으로 들어와서(lib/plans 의 MIN_PLAN), 로그인 하나로
                     두 프로그램이 함께 열린다. */
                : (T("할인 기간입니다. 지금은 로그인만 하면 PLUS 를 무료로 사용합니다.", "Promotional period — just log in and PLUS is free."))}
          </p>

          <div className={PER_PIECE_ON_HOME ? "lp-prices" : "lp-prices one"}>
            {/* ── 왼쪽 · archiMap 구독 ── */}
            <div className="lp-price-box reveal" {...rv(3)}>
              {/* 🔴카드 이름이 프로그램이 아니라 **구독**이다(2026-09-05). 표가
                    프로그램 여럿을 싣게 되었으므로, 머리에 archiMap 이 남아 있으면
                    그 아래 LaserFish 줄이 archiMap 의 사양처럼 읽힌다. */}
              <div className="lp-price-top">
                <b>MassLabs</b>
                <span className="lp-price-kind">{T("구독 · 월", "subscription · monthly")}</span>
              </div>
              <div className="lp-tier-scroll">
                <div className="lp-tier-grid">
                  <div />
                  {tiers.map((tier) => (
                    <div className={`lp-tier-head${isPromo(tier.key) ? " promo" : ""}${isMine(tier.key) ? " mine" : ""}`} key={tier.key}>
                      <b>{tier.label}</b>
                      <span>{tier.price}</span>
                      {isPromo(tier.key) && (
                        <em className="lp-tier-promo">{T("할인 기간", "PROMO")}</em>
                      )}
                    </div>
                  ))}

                  {/* 🔴프로그램 하나가 줄 하나다 — 왼쪽에 이름 카드, 등급 칸마다
                        그 프로그램의 사양이 통째로 쌓인다(2026-09-05, /account 의 짜임).
                        PROGRAMS 를 그대로 훑으므로 프로그램이 늘어도 손댈 게 없다.
                      ⚠️값이 없는 사양(null)은 줄째로 뺀다. 한 줄도 안 남으면 그 등급에서
                        아예 안 열리는 프로그램이라 – 하나만 세운다.
                      ⚠️LaserFish 는 이름표가 비어 있다(열리냐 마느냐뿐이라 PlanTable 이
                        일부러 비워 뒀다) — 여기서 "전 기능 이용" 같은 말을 새로 지으면
                        저쪽 표와 갈라진다. 이름표가 없으면 값을 가운데 세운다. */}
                  {PROGRAMS.map((p) => (
                    <div style={{ display: "contents" }} key={p.name}>
                      <div className="lp-tier-prog">{p.name}</div>
                      {tiers.map((tier) => {
                        const lines = p.features
                          .map((f) => ({
                            label: trPick(lang, f.label),
                            txt: cellText(f.cells[TIER_KEYS.indexOf(tier.key)], lang),
                          }))
                          .filter((l) => l.txt != null);

                        if (lines.length === 0) {
                          return (
                            <div
                              className={`lp-tier-cell off${isMine(tier.key) ? " mine" : ""}`}
                              key={tier.key}
                            >
                              –
                            </div>
                          );
                        }

                        return (
                          <div
                            className={`lp-tier-cell${isMine(tier.key) ? " mine" : ""}`}
                            key={tier.key}
                          >
                            {lines.map((l, i) => (
                              <div className={`lp-tier-line${l.label ? "" : " solo"}`} key={i}>
                                {l.label && <span>{l.label}</span>}
                                {/* 🔴○ 는 말로 풀지 않는다(2026-09-05 사용자 지시) —
                                      "열린다/안 열린다" 하나를 말하는 자리다.
                                    ⚠️뒤에 괄호가 붙는 칸이 있다("○(한시적)"). "○ 인가"가
                                      아니라 "○ 로 시작하는가"로 본다. */}
                                <b className={l.txt!.startsWith("○") ? "mark" : undefined}>
                                  {l.txt!.startsWith("○")
                                    ? <><em>○</em>{l.txt!.slice(1)}</>
                                    : l.txt}
                                </b>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  <div />
                  {tiers.map((tier) => (
                    <div className="lp-tier-cta" key={tier.key}>
                      {/* 🔴정기결제가 열리면(SUBSCRIPTION_LIVE=true) 세 칸 모두 /price 로 가는
                            진짜 구독 버튼이 된다. 그 전까지는 아래 세 갈래다.
                          🔴"이용 중"은 **이 사람이 실제로 쓰는 등급** 칸에만 뜬다
                            (2026-09-05 사용자 지시). 전에는 tier.key === "plus" 로
                            박혀 있어서, MAX 를 쓰는 사람에게도 PLUS 칸에 떴다.
                            지금 free 인 사람에게 PLUS 가 켜지는 것은 PLUS 를 골라서가
                            아니라 할인 기간이라 free 가 plus 로 올라가서다 —
                            그 판정은 lib/interim 의 effectivePlan 이 한다.
                          ⚠️아직 모르는 동안(planReady=false)에는 단추 글자를 안 바꾼다.
                            먼저 띄웠다 옮겨 붙으면 깜빡인다. 로그아웃한 사람에게는
                            PLUS 칸이 "지금은 무료"로 로그인을 권한다. */}
                      {SUBSCRIPTION_LIVE ? (
                        <a href="/price">{T("구독하기", "Subscribe")}</a>
                      ) : isMine(tier.key) ? (
                        <span>{T("이용 중", "Active")}</span>
                      ) : tier.key === "plus" && planReady && !myPlan ? (
                        <a href="/login">{T("지금은 무료", "Free for now")}</a>
                      ) : (
                        <span>{T("준비 중", "Coming soon")}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 오른쪽 · LaserFish 건당 ──
                 🔴2026-08-29 부터 감춰져 있다(lib/interim.ts 의 PER_PIECE_ON_HOME).
                   건당결제 안내의 정본은 LaserFish 소개 사이트다. 지우지 않았다 —
                   그 값을 true 로 되돌리면 이 칸이 그대로 다시 선다. */}
            {PER_PIECE_ON_HOME && (
            <div className="lp-price-box reveal" {...rv(4)}>
              <div className="lp-price-top">
                <b>LaserFish</b>
                <span className="lp-price-kind">{T("건당 결제", "pay per piece")}</span>
              </div>
              <div className="lp-piece">
                {PIECE_PRICES.map((p) => (
                  <div className="lp-piece-row" key={p.kind}>
                    <b>{p.kind}</b>
                    <span>
                      ${p.usd}
                      <i>{T("/ 조각", "/ piece")}</i>
                    </span>
                  </div>
                ))}
              </div>

              <p className="lp-fine">
                {fmt(T("최소 주문 ${min} · 최대 주문 ${max}", "Minimum order ${min} · Maximum order ${max}"),
                  { min: PIECE_MIN_USD, max: PIECE_MAX_USD })}
              </p>

              <a className="lp-buy" href={withLang(LASERFISH, lang)}>
                {T("플러그인 받기", "Get the plug-in")}
              </a>
            </div>
            )}
          </div>
        </div>
      </section>

      {/* ── 6구역 · 바닥글 ─────────────────────────────────────────── */}
      <footer className="lp-foot" id="contact" data-sec>
        <div className="lp-wrap">
          <div className="lp-foot-top">
            <div className="lp-foot-brand reveal" {...rv(0)}>
              <b>MassLabs</b>
              {/* ⚠️메일 주소를 여기 다시 적지 않는다 — 오른쪽 CONTACT 열의
                   [Email]이 그 자리다. 두 군데에 적으면 한쪽만 고쳐져 갈린다. */}
              <p>{T("건축가를 위한 도구.", "Tools for architects.")}</p>
            </div>

            <div className="lp-foot-cols">
              <div className="lp-foot-col reveal" {...rv(1)}>
                <h4>{T("제품", "Products")}</h4>
                <a href={withLang(ARCHIMAP, lang)} target="_blank" rel="noreferrer">archiMap</a>
                <a href={withLang(COLORGRAM, lang)} target="_blank" rel="noreferrer">Colorgram</a>
                <a href={withLang(LASERFISH, lang)} target="_blank" rel="noreferrer">LaserFish</a>
              </div>
              <div className="lp-foot-col reveal" {...rv(2)}>
                <h4>{T("약관", "Legal")}</h4>
                <a href="/policy/terms-and-policy">{foot.termsAndPolicy}</a>
                <a href="/policy/privacy">{foot.privacy}</a>
              </div>
              {/* 🔴Email 은 여기 없다 — 메일로 연락하는 길은 [Contact] 창 하나로
                   모았다. 두 군데에 두면 한쪽만 고쳐져 주소가 갈린다. */}
              <div className="lp-foot-col reveal" {...rv(3)}>
                <h4>{T("채널", "Follow")}</h4>
                <a href={YOUTUBE} target="_blank" rel="noreferrer">YouTube</a>
                <a href="https://www.instagram.com/masslabs_archi/" target="_blank" rel="noreferrer">Instagram</a>
              </div>
              {/* 🔴[Email]을 누르면 창이 뜬다(2026-08-27 지시). /contact 화면은 그대로
                   살아 있고 라이노 플러그인 등이 그 주소를 쓰지만, 이 화면에서는
                   보던 자리를 잃지 않도록 겹쳐 띄운다. */}
              <div className="lp-foot-col reveal" {...rv(4)}>
                <h4>{T("문의", "Contact")}</h4>
                <button type="button" onClick={() => setContact(true)}>
                  {T("이메일", "Email")}
                </button>
              </div>
            </div>
          </div>

          {/* 🔴사업자 정보 — 글은 lib/translations 의 footer 가 유일한 출처다.
              PG 가맹점 심사 필수 항목이라 여기서 새로 적지 않는다. */}
          <div className="lp-biz reveal" {...rv(5)}>
            <div>{foot.businessInfo1}</div>
            <div>{foot.businessInfo2}</div>
          </div>
        </div>
      </footer>

      {/* ── 문의 창 — .lp 밖(body)에 붙인다. 위 CSS 주석 참고. ────────── */}
      {contact && createPortal(
        (
        <div
          className="lp-modal"
          role="dialog"
          aria-modal="true"
          aria-label={T("문의하기", "Contact Us")}
          onClick={() => setContact(false)}
        >
          {/* 안쪽을 눌렀을 때는 닫히지 않는다 — 메일 주소를 긁어 가는 사람이 있다 */}
          <div className="lp-modal-box" onClick={(e) => e.stopPropagation()}>
            <button
              className="lp-modal-x"
              onClick={() => setContact(false)}
              aria-label={T("닫기", "Close")}
            >
              &times;
            </button>
            <h3>{T("문의하기", "Contact Us")}</h3>
            <a
              className="lp-modal-mail"
              href="https://mail.google.com/mail/?view=cm&to=masslabs.archi@gmail.com"
              target="_blank"
              rel="noreferrer"
            >
              <span className="m-ico"><MailIcon size={18} /></span>
              <span className="m-txt">
                <span className="m-lab">{T("이메일", "Email")}</span>
                <b>masslabs.archi@gmail.com</b>
              </span>
              <span className="m-go">&rarr;</span>
            </a>
          </div>
        </div>
        ),
        document.body,
      )}
    </main>
  );
}
