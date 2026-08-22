"use client";

import { Fragment } from "react";
import { TIER_KEYS, planAllows } from "@/lib/plans";

// ==========================================================================
//  요금제 표 — MassLabs가 유일한 출처다.
//
//  🔴프로그램마다 요금제 화면을 만들지 않는다. archiMap이든 앞으로 생길 프로그램이든
//    전부 masslabs-archi.com/price 로 보낸다. 구독이 프로그램별이 아니라 계정
//    단위라, 표가 여러 벌이면 반드시 서로 어긋난다.
//    → 홈(app/page.tsx) · /price · /account 세 화면이 이 파일 하나를 함께 본다.
//
//  🔴프로그램이 늘면 PROGRAMS에 항목 하나를 더한다. 행이 저절로 하나 늘어난다.
//
//  🔴2026-08-18 개편 — 표 선을 걷어내고 칸마다 카드로 띄웠다. 다만 격자는 지킨다
//    (등급이 열, 프로그램이 행). 카드를 각자 흐르게 두면 등급끼리 사양을 나란히
//    비교할 수 없어져, 요금제 표의 존재 이유가 사라진다.
//
//  🔴FREE는 싣지 않는다(2026-08-18 결정). 파는 것만 보여준다.
//    ⚠️PROGRAMS의 cells 배열은 여전히 TIER_KEYS(free 포함) 순서다. 화면에서만
//      빼는 것이므로 자리를 손으로 세지 말고 TIER_KEYS.indexOf로 찾을 것.
// ==========================================================================

export type Lang = "ko" | "en";

// 표 스타일. 세 화면이 같은 것을 써야 하므로 컴포넌트와 함께 둔다.
export const PLAN_CSS = `
  /* 🔴좁은 화면에서는 가로로 민다. 등급을 세로로 쌓으면 나란히 비교가 안 되는데,
       그게 이 표의 전부다. */
  .plan-wrap { max-width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .plan-grid {
    display: grid;
    grid-template-columns: 124px repeat(var(--pg-cols), minmax(138px, 1fr));
    gap: 10px;
    min-width: 620px;
    text-align: left;
    align-items: stretch;
  }

  /* 맨 윗줄 — 등급 이름 */
  .pg-corner { }
  .pg-tier {
    background: #111; color: #fff; border-radius: 14px; padding: 13px 12px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 3px;
  }
  .pg-tier b { font-size: 0.92rem; font-weight: 800; letter-spacing: 0.06em; }
  .pg-tier .cur { font-size: 0.62rem; font-weight: 600; color: #b9b9b9; }

  /* 왼쪽 — 프로그램 이름 */
  .pg-prog {
    display: flex; flex-direction: column; justify-content: center; gap: 8px;
    background: #fff; border: 1px solid #ececec; border-radius: 14px; padding: 14px;
  }
  .pg-prog-name { font-size: 0.92rem; font-weight: 800; letter-spacing: -0.01em; color: #111; }

  /* 칸 */
  .pg-cell {
    background: #fff; border: 1px solid #ececec; border-radius: 14px;
    padding: 13px 14px; display: flex; flex-direction: column; justify-content: center; gap: 7px;
  }
  .pg-cell.off {
    align-items: center; justify-content: center; gap: 3px;
    background: #fafafa; border-style: dashed;
  }
  .pg-off-mark { font-size: 1.1rem; line-height: 1; color: #cfcfcf; }

  .pg-line { display: flex; flex-direction: column; gap: 2px; }
  .pg-line span { font-size: 0.68rem; color: #a0a0a0; }
  .pg-line b { font-size: 0.82rem; font-weight: 700; color: #1a1a1a; letter-spacing: -0.01em; }
  .pg-line b.mark { font-size: 1.05rem; text-align: center; color: #111; }

  /* 아래 두 줄 — 가격, 구독 버튼 */
  .pg-price {
    background: #fff; border: 1px solid #ececec; border-radius: 14px; padding: 13px 12px;
    display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px;
  }
  .pg-amt { font-size: 1.3rem; font-weight: 900; letter-spacing: -0.03em; color: #111; }
  /* 원래 가격은 그어서 남긴다 — 지우면 7일 뒤 얼마가 빠져나가는지 알 수 없다 */
  .pg-per { font-size: 0.72rem; font-weight: 600; color: #999; letter-spacing: 0; margin-left: 3px; }

  .pg-cta { display: flex; align-items: center; justify-content: center; }
  .pg-cta button, .pg-cta a {
    width: 100%; text-align: center;
    background: #111; color: #fff; text-decoration: none; border: none;
    padding: 10px 12px; border-radius: 11px;
    font-family: inherit; font-size: 0.8rem; font-weight: 700; cursor: pointer;
    transition: background .15s;
  }
  .pg-cta button:hover, .pg-cta a:hover { background: #333; }
  .pg-cta button:disabled { background: #ccc; cursor: not-allowed; }
  .pg-cta .using { font-size: 0.78rem; font-weight: 700; color: #2f855a; }

  /* 내 구독 화면 — 쓰고 있는 등급만 또렷하게 남기고 나머지는 물린다 */
  .pg-tier.dim, .pg-cell.dim, .pg-prog.dim { opacity: 0.38; }
  .pg-cell.on { border-color: #111; }

  .plan-fine {
    font-size: 0.75rem; color: #aaa; line-height: 1.8; margin-top: 18px;
    max-width: 620px; margin-left: auto; margin-right: auto;
  }

  @media (max-width: 620px) {
    .plan-grid { grid-template-columns: 96px repeat(var(--pg-cols), minmax(126px, 1fr)); min-width: 540px; gap: 8px; }
  }
`;

type Cell = string | null;                 // null = 제공 안 함(×)
type Feature = { label: { ko: string; en: string }; cells: [Cell, Cell, Cell, Cell] };
type Program = {
  name: string;
  features: Feature[];
};

// 🔴"열리냐 안 열리냐"뿐인 프로그램은 칸을 손으로 적지 않는다 — MIN_PLAN에서
//   그대로 끌어온다. 손으로 맞추면 표와 실제 권한이 언젠가 반드시 어긋난다.
const gate = (product: string): [Cell, Cell, Cell, Cell] =>
  TIER_KEYS.map((t) => (planAllows(t, product) ? "○" : null)) as [Cell, Cell, Cell, Cell];

export const PROGRAMS: Program[] = [
  {
    name: "archiMap",
    features: [
      {
        label: { ko: "최대 직경", en: "Max diameter" },
        cells: ["200m", "1km", "2km", "3km"],
      },
      {
        label: { ko: "크레딧", en: "Credits" },
        cells: ["3 / 달", "10 / 달", "15 / 달", "20 / 달"],
      },
      {
        label: { ko: "내보내기 (2D)", en: "Export (2D)" },
        cells: [null, "PNG · SVG · DXF · PDF", "PNG · SVG · DXF · PDF", "PNG · SVG · DXF · PDF"],
      },
      {
        label: { ko: "3D 모델링", en: "3D modeling" },
        cells: [null, "3DM · SKP(DXF)", "3DM · SKP(DXF)", "3DM · SKP(DXF)"],
      },
    ],
  },
  {
    name: "LaserFish",
    features: [
      // PRO부터 열린다(2026-08-18 결정) — 원본은 lib/plans의 MIN_PLAN.
      // 🔴이름표를 비워 둔다 — 열리냐 마느냐뿐이라 "전 기능 이용: 사용가능"은
      //   같은 말을 두 번 하는 것이다. 빈 이름표는 렌더가 알아서 건너뛴다.
      {
        label: { ko: "", en: "" },
        cells: gate("laserfish"),
      },
    ],
  },
];

// 🔴열 순서는 TIER_KEYS가 정한다 — cells 배열이 이 순서에 그대로 대응하므로,
//   여기서 순서를 따로 적으면 언젠가 한 칸씩 밀린다.
const TIER_PRICE: Record<(typeof TIER_KEYS)[number], string | null> = {
  free: null, plus: "$4.99", pro: "$9.90", max: "$14.90",
};

export const TIERS = TIER_KEYS.map((k) => ({
  key: k,
  label: k.toUpperCase(),
  price: TIER_PRICE[k],
}));

type Props = {
  lang: Lang;
  /**
   * sell(기본) = 파는 표. 가격·구독 버튼이 붙는다(홈 · /price).
   * status = 내 구독 상태를 보여주는 표. 가격도 버튼도 없고, 쓰고 있는 등급만
   *   또렷하다(/account). 🔴여기서 결제를 시작하지 않는다 — 구독은 /price 한 곳에서.
   */
  variant?: "sell" | "status";
  /** 지금 쓰고 있는 등급. 그 열에 "이용 중"이 뜬다. */
  currentPlan?: string;
  /** 없으면 버튼이 /price 링크가 된다(홍보용). 있으면 실제 결제로 간다. */
  onSubscribe?: (plan: string) => void;
  /**
   * onSubscribe 가 없을 때 [구독하기]가 향할 곳. 기본은 /price.
   * 🔴/main(심사용 미리보기)은 /price 로 보내면 안 된다 — 거기는 지금
   *   건당결제를 보여줘서, 구독표를 보다 누른 사람이 딴 상품으로 떨어진다.
   */
  ctaHref?: string;
  busy?: string;
};

export default function PlanTable({ lang, currentPlan, onSubscribe, busy, variant = "sell", ctaHref = "/price" }: Props) {
  const L = (t: { ko: string; en: string }) => t[lang] ?? t.ko;
  const live = !!onSubscribe;
  const isKo = lang === "ko";

  // 🔴파는 등급만 싣는다. cells 배열은 free를 포함한 순서라 자리를 따로 찾는다.
  const tiers = TIERS.filter((t) => t.key !== "free");

  // 🔴구독 중일 때만 나머지를 물린다. 아직 구독이 없으면 전부 또렷하게 둔다 —
  //   고를 것이 남아 있는데 다 흐려 놓으면 고장 난 화면으로 보인다.
  const focus = variant === "status" && tiers.some((t) => t.key === currentPlan);
  const faded = (key: string) => (focus && key !== currentPlan ? " dim" : "");
  const at = (cells: readonly Cell[], key: string): Cell =>
    cells[TIER_KEYS.indexOf(key as (typeof TIER_KEYS)[number])] ?? null;

  return (
    <div className="plan-wrap">
      <div
        className="plan-grid"
        style={{ "--pg-cols": tiers.length } as React.CSSProperties}
      >
        {/* 1줄 — 등급 이름 */}
        <div className="pg-corner" />
        {tiers.map((t) => (
          <div className={`pg-tier${faded(t.key)}`} key={t.key}>
            <b>{t.label}</b>
            {currentPlan === t.key && <span className="cur">{isKo ? "이용 중" : "Current"}</span>}
          </div>
        ))}

        {/* 프로그램마다 한 줄 */}
        {PROGRAMS.map((p) => (
          <Fragment key={p.name}>
            <div className="pg-prog">
              <div className="pg-prog-name">{p.name}</div>
            </div>

            {tiers.map((t) => {
              const lines = p.features
                .map((f) => ({ label: L(f.label), value: at(f.cells, t.key) }))
                .filter((l) => l.value != null);

              // 한 줄도 없으면 그 등급에서는 안 열리는 프로그램이다.
              if (lines.length === 0) {
                return (
                  <div className={`pg-cell off${faded(t.key)}`} key={t.key}>
                    <span className="pg-off-mark">–</span>
                  </div>
                );
              }

              return (
                <div className={`pg-cell${focus && t.key === currentPlan ? " on" : ""}${faded(t.key)}`} key={t.key}>
                  {lines.map((l, i) => (
                    <div className="pg-line" key={i}>
                      {l.label && <span>{l.label}</span>}
                      <b className={l.value === "○" ? "mark" : undefined}>
                        {l.value === "○" ? (isKo ? "사용가능" : "Available") : l.value}
                      </b>
                    </div>
                  ))}
                </div>
              );
            })}
          </Fragment>
        ))}

        {/* 가격 줄. 🔴할인·무료 배지를 여기 붙이지 않는다 — 표에 적힌 값과
            결제창에 뜨는 값이 어긋나는 순간 화면이 거짓말을 한 셈이 된다.
            공짜로 써보는 길은 FREE 등급 하나로만 안내한다. */}
        {variant === "sell" && (
          <>
            <div className="pg-corner" />
            {tiers.map((t) => (
              <div className="pg-price" key={t.key}>
                <div className="pg-amt">
                  {t.price}
                  <span className="pg-per">/mon</span>
                </div>
              </div>
            ))}

            {/* 구독 버튼 줄 */}
            <div className="pg-corner" />
            {tiers.map((t) => (
              <div className="pg-cta" key={t.key}>
                {currentPlan === t.key ? (
                  <span className="using">{isKo ? "이용 중" : "Current"}</span>
                ) : live ? (
                  <button disabled={busy === t.key} onClick={() => onSubscribe!(t.key)}>
                    {busy === t.key ? "…" : isKo ? "구독하기" : "Subscribe"}
                  </button>
                ) : (
                  <a href={ctaHref}>{isKo ? "구독하기" : "Subscribe"}</a>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
