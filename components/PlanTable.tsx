"use client";

import { Fragment } from "react";
import { TIER_KEYS, planAllows } from "@/lib/plans";
import { PLUS_FREE_PROMO } from "@/lib/interim";
import { trs, trPick, type Lang } from "@/lib/i18n";

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

// 🔴화면 언어는 lib/i18n 한 곳에서 온다(2026-09-03, 여덟 언어). 전에는 여기
//   "ko"|"en" 을 따로 적었는데, 언어가 늘자 이 표만 두 값에 갇혔다.
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

  /* 🔴**이 사람이 쓰는 등급**의 기둥을 통째로 칠한다 — 2026-09-05 사용자 지시.
       머리 카드에만 표시하면 "값만 다르다"로 읽힌다. 그 등급이 덮는 것은 사양
       전부라, 그 말을 하려면 기둥이 통째로 달라 보여야 한다.
     🔴테두리를 두르지 않는다(먼저 그렇게 해 봤다) — 격자의 gap 때문에 칸 위에 줄을
       따로 얹어야 하는데, 그 줄이 제 자리를 넘고 머리 카드 테두리와 겹쳐 이중선이
       된다. 칸이 제 몫만 칠하면 그 사고가 아예 안 난다.
     ⚠️이 표는 흰 바탕이라 회색으로 칠하면 .off(제공 안 함)와 같은 말이 된다.
       그래서 홈과 같은 주황을 아주 옅게 쓴다.
     ⚠️.pg-price.promo 는 다른 이야기다 — 값에 그은 줄이라 보는 사람과 무관하게
       PLUS 에 붙는다. 칠하기(.mine)와 헷갈리지 말 것.
     ⚠️테두리를 2px 로 굵혀도 칸 크기는 그대로다(box-sizing:border-box).
       그게 없으면 이 기둥만 2px 씩 커져 옆 기둥과 줄이 어긋난다. */
  .pg-tier.mine, .pg-cell.mine {
    background: #fdf4ec; border-color: #f0d7bf; border-width: 2px;
  }
  .pg-price.promo { background: #fdf4ec; border-color: #f0d7bf; border-width: 2px; }
  .pg-tier .promo-tag {
    font-size: 0.6rem; font-weight: 700; letter-spacing: 0.02em; color: #ffd76a;
  }
  /* 값에 그은 줄 — 원래 얼마인지를 지우지 않는다. 행사가 끝나면 이 값이 청구된다. */
  .pg-price.promo .pg-amt { color: #b0b0b0; text-decoration: line-through; text-decoration-thickness: 1.5px; }
  .pg-promo-now { font-size: 0.72rem; font-weight: 800; color: #111; letter-spacing: -0.01em; }

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
  .pg-line b.mark { font-size: 0.82rem; text-align: center; color: #111; }
  /* 동그라미만 크게. 뒤에 붙는 괄호까지 키우면 칸이 글자로 꽉 찬다. */
  .pg-line b.mark em { font-style: normal; font-size: 1.6em; line-height: 1; vertical-align: -0.1em; }

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
  /* ⛔"내가 쓰는 등급"을 여기서 또 표시하지 말 것 — .mine 하나가 그 일을 한다.
       2026-08-21 에 .pg-cell.on 이 같은 자리에 검은 테두리를 두르고 있었는데,
       .mine 과 조건도 같고 건드리는 것도 border-color 라 순서로만 안 겹쳤다.
       어두운 화면(/account)에서 순서가 뒤집히면 검은 테두리가 조용히 돌아온다. */

  .plan-fine {
    font-size: 0.75rem; color: #aaa; line-height: 1.8; margin-top: 18px;
    max-width: 620px; margin-left: auto; margin-right: auto;
  }

  @media (max-width: 620px) {
    .plan-grid { grid-template-columns: 96px repeat(var(--pg-cols), minmax(126px, 1fr)); min-width: 540px; gap: 8px; }
  }
`;

// 🔴칸 안에 말이 들어가면 {ko,en}으로 적는다. 단위가 붙은 숫자("10 / 달")를
//   글자열 하나로 두면 영어 화면에 한국어가 그대로 선다(2026-08-23 고침).
//   "1km"처럼 말이 아닌 칸은 그냥 글자열로 둔다.
type Cell = string | { ko: string; en: string } | null;   // null = 제공 안 함(×)
type Feature = { label: { ko: string; en: string }; cells: [Cell, Cell, Cell, Cell] };
type Program = {
  name: string;
  features: Feature[];
};

// 🔴"열리냐 안 열리냐"뿐인 프로그램은 칸을 손으로 적지 않는다 — MIN_PLAN에서
//   그대로 끌어온다. 손으로 맞추면 표와 실제 권한이 언젠가 반드시 어긋난다.
const gate = (product: string): [Cell, Cell, Cell, Cell] =>
  TIER_KEYS.map((t) => (planAllows(t, product) ? "○" : null)) as [Cell, Cell, Cell, Cell];

// 🔴한 칸만 다른 말을 하게 한다 — 2026-09-05 사용자 지시.
//   gate() 가 낸 ○("사용가능")를 그 자리에서만 딴 글로 바꾼다. 원본은 여전히
//   MIN_PLAN 이라, 그 등급에서 아예 안 열리게 되면 이 글도 함께 사라진다
//   (null 은 안 덮는다).
//   ⚠️홈(LandingView)도 같은 PROGRAMS 를 읽는다 — 그래서 말을 여기 데이터에
//     심는다. 화면 쪽에서 갈아 끼우면 두 표가 갈라진다.
const say = (
  cells: [Cell, Cell, Cell, Cell],
  tier: (typeof TIER_KEYS)[number],
  text: { ko: string; en: string },
): [Cell, Cell, Cell, Cell] => {
  const out = [...cells] as [Cell, Cell, Cell, Cell];
  const i = TIER_KEYS.indexOf(tier);
  if (out[i] != null) out[i] = text;
  return out;
};

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
        cells: [
          { ko: "3 / 달",  en: "3 / mo" },
          { ko: "10 / 달", en: "10 / mo" },
          { ko: "15 / 달", en: "15 / mo" },
          { ko: "20 / 달", en: "20 / mo" },
        ],
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
      // 🔴PLUS부터 열린다(2026-09-05 결정 — 2026-08-18 의 PRO 에서 내렸다).
      //   원본은 lib/plans 의 MIN_PLAN 이고, 이 칸은 gate() 가 거기서 그대로
      //   끌어온다 — 손으로 ○ 를 적지 않는다.
      // 🔴이름표를 비워 둔다 — 열리냐 마느냐뿐이라 "전 기능 이용: 사용가능"은
      //   같은 말을 두 번 하는 것이다. 빈 이름표는 렌더가 알아서 건너뛴다.
      // 🔴PLUS 칸만 "한시적"이라고 적는다(2026-09-05 사용자 지시). 지금 PLUS 에서
      //   LaserFish 가 열리는 것은 할인 기간에 얹힌 일이라, 그냥 "사용가능"이라고
      //   적으면 값을 받기 시작한 뒤에도 같은 약속으로 읽힌다.
      //   ⚠️PLUS_FREE_PROMO 가 꺼지면 이 말은 저절로 사라지고 "사용가능"으로 돌아간다.
      {
        label: { ko: "", en: "" },
        cells: PLUS_FREE_PROMO
          ? say(gate("laserfish"), "plus", { ko: "○(한시적)", en: "○(Promotion)" })
          : gate("laserfish"),
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
  busy?: string;
};

export default function PlanTable({ lang, currentPlan, onSubscribe, busy, variant = "sell" }: Props) {
  const L = (t: { ko: string; en: string }) => trPick(lang, t);
  const live = !!onSubscribe;
  const T = (ko: string, en: string) => trs(lang, ko, en);

  // 🔴파는 등급만 싣는다. cells 배열은 free를 포함한 순서라 자리를 따로 찾는다.
  const tiers = TIERS.filter((t) => t.key !== "free");

  // 🔴내 구독 화면(status)에서는 **쓰고 있는 등급만** 또렷하다.
  //   구독이 없으면 또렷한 등급이 하나도 없으므로 전부 물린다(2026-08-23 결정) —
  //   MAX만 새까맣게 남아 있으면 "MAX를 쓰는 중"으로 읽힌다.
  //   ⚠️파는 표(sell)는 이 규칙 밖이다. 고르라고 내놓은 표를 흐려 놓으면
  //     고장 난 화면으로 보인다.
  const focus = variant === "status" && tiers.some((t) => t.key === currentPlan);
  const none  = variant === "status" && !focus;             // 미구독
  const faded = (key: string) => (none || (focus && key !== currentPlan) ? " dim" : "");
  // 🔴칠하는 기둥은 **이 사람이 쓰고 있는 등급**이다(2026-09-05 사용자 지시).
  //   ⛔등급을 손으로 못박지 말 것. 전에는 "plus" 로 박아 두어, MAX 를 쓰는
  //     사람에게도 PLUS 칸에 불이 켜졌다. 지금 free 인 사람에게 PLUS 가 켜지는
  //     것은 PLUS 를 골라서가 아니라 할인 기간이라 free 가 plus 로 올라가서다 —
  //     그 판정은 이 파일이 아니라 lib/interim 의 effectivePlan 이 하고, 부르는
  //     화면이 currentPlan 에 담아 넘긴다.
  const mine = (key: string) => !!currentPlan && key === currentPlan;
  // 🔴"(할인 기간)" 배지와 그은 값. 파는 표(sell)에서만 — 내 등급이 무엇인지를
  //   말하는 화면에 광고 문구까지 섞으면 두 말이 겹쳐 읽힌다.
  //   ⚠️이건 보는 사람과 무관하다. 값 이야기라 PLUS 에 그대로 붙는다.
  const promoTag = (key: string) => variant === "sell" && PLUS_FREE_PROMO && key === "plus";
  // 🔴"○" · "○(한시적)" 처럼 동그라미로 시작하는 칸은 글이 아니라 **표시**다.
  //   동그라미만 크게 띄우고 뒤따르는 괄호는 제 크기로 둔다(.mark em).
  const mark = (v: string) => v.startsWith("○");
  const circled = (v: string) =>
    mark(v) ? <><em>○</em>{v.slice(1)}</> : v;
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
          // 🔴할인 기간에는 PLUS 에 동그라미를 치고 "(할인 기간)"을 적는다
          //   (2026-09-05 사용자 지시). 어느 등급이 공짜인지는 lib/plans 의
          //   DEFAULT_MIN_PLAN 이 아니라 **행사 대상**이라, 여기서만 plus 를 짚는다.
          <div className={`pg-tier${mine(t.key) ? " mine" : ""}${faded(t.key)}`} key={t.key}>
            <b>{t.label}</b>
            {currentPlan === t.key && <span className="cur">{T("이용 중", "Current")}</span>}
            {promoTag(t.key) && <span className="promo-tag">{T("(할인 기간)", "(Promo)")}</span>}
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
                  <div className={`pg-cell off${mine(t.key) ? " mine" : ""}${faded(t.key)}`} key={t.key}>
                    <span className="pg-off-mark">–</span>
                  </div>
                );
              }

              return (
                <div className={`pg-cell${mine(t.key) ? " mine" : ""}${faded(t.key)}`} key={t.key}>
                  {lines.map((l, i) => {
                    const v = typeof l.value === "string" ? l.value : L(l.value!);
                    return (
                      <div className="pg-line" key={i}>
                        {l.label && <span>{l.label}</span>}
                        {/* 🔴○ 는 말로 풀지 않는다(2026-09-05 사용자 지시). "사용가능"
                              이라고 적으면 칸마다 글이 서서 표가 글자로 꽉 차는데,
                              여기서 말하려는 건 "열린다/안 열린다" 하나뿐이다.
                            ⚠️뒤에 괄호가 붙는 칸이 있다("○(한시적)"). 그래서 "○ 인가"가
                              아니라 "○ 로 시작하는가"로 본다 — 동그라미만 크게 띄우고
                              괄호는 제 크기로 둔다. */}
                        <b className={mark(v) ? "mark" : undefined}>{circled(v)}</b>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </Fragment>
        ))}

        {/* 가격 줄.
            🔴원래 규칙: 할인·무료 배지를 붙이지 않는다 — 표에 적힌 값과 결제창에
              뜨는 값이 어긋나는 순간 화면이 거짓말을 한 셈이 되기 때문이다.
            🔴2026-09-05 예외(사용자 지시): **아무것도 안 파는 동안에만** PLUS 에
              줄을 긋고 "지금은 무료"라고 적는다. 어긋날 결제창 자체가 없으므로
              위 규칙이 막으려던 사고가 성립하지 않는다. 원래 값은 그어서 남긴다 —
              지우면 행사가 끝난 뒤 얼마가 청구되는지 알 수 없다.
            ⚠️PLUS_FREE_PROMO 가 false 가 되면(=구독을 팔기 시작하면) 저절로
              원래 규칙으로 돌아간다. */}
        {variant === "sell" && (
          <>
            <div className="pg-corner" />
            {tiers.map((t) => (
              <div className={`pg-price${promoTag(t.key) ? " promo" : ""}`} key={t.key}>
                <div className="pg-amt">
                  {t.price}
                  <span className="pg-per">/mon</span>
                </div>
                {promoTag(t.key) && (
                  <div className="pg-promo-now">{T("지금은 무료", "Free for now")}</div>
                )}
              </div>
            ))}

            {/* 구독 버튼 줄 */}
            <div className="pg-corner" />
            {tiers.map((t) => (
              <div className="pg-cta" key={t.key}>
                {currentPlan === t.key ? (
                  <span className="using">{T("이용 중", "Current")}</span>
                ) : live ? (
                  <button disabled={busy === t.key} onClick={() => onSubscribe!(t.key)}>
                    {busy === t.key ? "…" : T("구독하기", "Subscribe")}
                  </button>
                ) : (
                  <a href="/price">{T("구독하기", "Subscribe")}</a>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
