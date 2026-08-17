"use client";

// ==========================================================================
//  요금제 비교표 — MassLabs가 유일한 출처다.
//
//  🔴프로그램마다 PLAN 화면을 만들지 않는다. Archimap이든 앞으로 생길 프로그램이든
//    전부 masslabs-archi.com/plan 으로 보낸다. 구독이 프로그램별이 아니라 계정
//    단위라, 표가 여러 벌이면 반드시 서로 어긋난다.
//
//  🔴프로그램이 늘면 PROGRAMS에 항목 하나를 더한다. 등급 열은 그대로다.
// ==========================================================================

export type Lang = "ko" | "en";

// 표 스타일. 홈과 /plan이 같은 것을 써야 하므로 컴포넌트와 함께 둔다.
export const PLAN_CSS = `
  .plan-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .plan {
    border-collapse: separate; border-spacing: 0;
    width: 100%; min-width: 720px;
    background: #fff; border: 1px solid #e8e8e8; border-radius: 16px;
    overflow: hidden; font-size: 0.85rem; text-align: center;
  }
  .plan th, .plan td {
    padding: 13px 12px;
    border-bottom: 1px solid #f0f0f0; border-right: 1px solid #f4f4f4;
    vertical-align: middle; color: #444;
  }
  .plan thead th {
    background: #fafafa; font-size: 0.78rem; font-weight: 800;
    letter-spacing: 0.06em; color: #888; padding: 15px 12px;
  }
  .plan thead th.pl-hi { background: #111; color: #fff; }
  .plan tbody + tbody tr:first-child th,
  .plan tbody + tbody tr:first-child td { border-top: 2px solid #ececec; }

  .pl-lead { width: 210px; }
  .pl-prod {
    background: #fafafa; font-weight: 800; font-size: 0.9rem; color: #111;
    text-align: left; width: 108px; letter-spacing: -0.01em;
  }
  .pl-row {
    background: #fcfcfc; font-weight: 500; font-size: 0.8rem; color: #777;
    text-align: left; white-space: nowrap;
  }
  .plan td.ok { color: #1a1a1a; font-weight: 600; font-size: 0.78rem; }
  .plan td.ok.mark { font-size: 1.05rem; }
  .plan td.no { color: #ccc; }

  .pl-extra { background: #fffdf3; border-left: 1px solid #f0e9d2; width: 116px; }
  .plan thead th.pl-extra { background: #fdf8e6; color: #9a8544; }
  .pl-buy { line-height: 1.5; }
  .buy-amt { font-size: 1rem; font-weight: 800; color: #111; }
  .buy-price { font-size: 0.75rem; color: #999; margin-bottom: 9px; }
  .buy-btn {
    display: inline-block; background: #111; color: #fff; text-decoration: none;
    padding: 6px 14px; border-radius: 7px; border: none;
    font-family: inherit; font-size: 0.75rem; font-weight: 700; cursor: pointer;
  }
  .buy-btn:hover { opacity: 0.85; }
  .buy-btn:disabled { background: #ccc; cursor: not-allowed; }
  .plan .dash { color: #ccc; }

  .pl-price td b { font-size: 1.35rem; font-weight: 900; letter-spacing: -0.03em; color: #111; }
  .pl-price td span { font-size: 0.72rem; color: #999; }
  .pl-cta th, .pl-cta td { border-bottom: none; padding-top: 4px; padding-bottom: 16px; }
  .pl-cta a, .pl-cta button {
    display: block; width: 100%;
    background: #111; color: #fff; text-decoration: none;
    padding: 10px 8px; border-radius: 9px; border: none;
    font-family: inherit; font-size: 0.82rem; font-weight: 700;
    cursor: pointer; transition: opacity 0.15s;
  }
  .pl-cta a:hover, .pl-cta button:hover { opacity: 0.85; }
  .pl-cta button:disabled { background: #ccc; cursor: not-allowed; }
  .pl-cta .cur { font-size: 0.78rem; color: #999; font-weight: 600; }

  .plan-fine {
    font-size: 0.75rem; color: #aaa; line-height: 1.8; margin-top: 18px;
    max-width: 620px; margin-left: auto; margin-right: auto;
  }
`;

type Cell = string | null;                 // null = 제공 안 함(×)
type Feature = { label: { ko: string; en: string }; cells: [Cell, Cell, Cell, Cell] };
type Program = {
  name: string;
  features: Feature[];
  // 크레딧 추가 — 되는 프로그램만 값이 있다. 행 전체를 한 칸으로 합친다.
  credits: { amount: string; price: string } | null;
};

export const PROGRAMS: Program[] = [
  {
    name: "Archimap",
    credits: { amount: "+3", price: "$1" },
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
        label: { ko: "내보내기 (3D)", en: "Export (3D)" },
        cells: [null, "3DM · SKP(DXF)", "3DM · SKP(DXF)", "3DM · SKP(DXF)"],
      },
    ],
  },
  {
    name: "LaserFish",
    credits: null,
    features: [
      {
        label: { ko: "전 기능 이용", en: "All tools" },
        cells: [null, "○", "○", "○"],
      },
    ],
  },
];

export const TIERS = [
  { key: "free", label: "FREE", price: null },
  { key: "plus", label: "PLUS", price: "$4.99" },
  { key: "pro", label: "PRO", price: "$6.99" },
  { key: "max", label: "MAX", price: "$9.99" },
] as const;

type Props = {
  lang: Lang;
  /** 지금 쓰고 있는 등급. 그 열에 "이용 중"이 뜬다. */
  currentPlan?: string;
  /** 없으면 버튼이 /plan 링크가 된다(홍보용). 있으면 실제 결제로 간다. */
  onSubscribe?: (plan: string) => void;
  onBuyCredits?: () => void;
  busy?: string;
};

export default function PlanTable({ lang, currentPlan, onSubscribe, onBuyCredits, busy }: Props) {
  const L = (t: { ko: string; en: string }) => t[lang] ?? t.ko;
  const live = !!onSubscribe;

  return (
    <div className="plan-scroll">
      <table className="plan">
        <thead>
          <tr>
            <th className="pl-lead" colSpan={2} />
            {TIERS.map((t) => (
              <th key={t.key} className={t.key === "free" ? "" : "pl-hi"}>{t.label}</th>
            ))}
            <th className="pl-extra">{lang === "ko" ? "크레딧 추가" : "Extra credits"}</th>
          </tr>
        </thead>

        {PROGRAMS.map((p) => (
          <tbody key={p.name}>
            {p.features.map((f, i) => (
              <tr key={f.label.ko}>
                {i === 0 && (
                  <th className="pl-prod" rowSpan={p.features.length}>{p.name}</th>
                )}
                <th className="pl-row">{L(f.label)}</th>
                {f.cells.map((c, k) => (
                  <td key={k} className={c == null ? "no" : `ok${c === "○" ? " mark" : ""}`}>
                    {c ?? "×"}
                  </td>
                ))}
                {/* 🔴크레딧 추가는 프로그램마다 한 칸으로 합친다 */}
                {i === 0 && (
                  <td className="pl-extra pl-buy" rowSpan={p.features.length}>
                    {p.credits ? (
                      <>
                        <div className="buy-amt">{p.credits.amount}</div>
                        <div className="buy-price">{p.credits.price}</div>
                        {live ? (
                          <button className="buy-btn" disabled={busy === "credits"} onClick={onBuyCredits}>
                            {busy === "credits" ? "…" : lang === "ko" ? "구매하기" : "Buy"}
                          </button>
                        ) : (
                          <a className="buy-btn" href="/plan">{lang === "ko" ? "구매하기" : "Buy"}</a>
                        )}
                      </>
                    ) : (
                      <span className="dash">—</span>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        ))}

        <tbody>
          <tr className="pl-price">
            <th className="pl-row" colSpan={2}>{lang === "ko" ? "가격" : "Price"}</th>
            {TIERS.map((t) => (
              <td key={t.key}>
                {t.price
                  ? <><b>{t.price}</b><span> / {lang === "ko" ? "월" : "mo"}</span></>
                  : (lang === "ko" ? "무료" : "Free")}
              </td>
            ))}
            <td className="pl-extra" />
          </tr>
          <tr className="pl-cta">
            <th colSpan={2} />
            {TIERS.map((t) => {
              const now = (currentPlan ?? "free") === t.key;
              return (
                <td key={t.key}>
                  {now ? (
                    <span className="cur">{lang === "ko" ? "이용 중" : "Current"}</span>
                  ) : t.key === "free" ? null : live ? (
                    <button disabled={busy === t.key} onClick={() => onSubscribe!(t.key)}>
                      {busy === t.key ? "…" : lang === "ko" ? "구독하기" : "Subscribe"}
                    </button>
                  ) : (
                    <a href="/plan">{lang === "ko" ? "구독하기" : "Subscribe"}</a>
                  )}
                </td>
              );
            })}
            <td className="pl-extra" />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
