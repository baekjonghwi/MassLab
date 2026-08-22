"use client";
import { useLanguage } from "@/lib/i18n";
import SiteHeader from "@/components/SiteHeader";
import PlanTable, { PLAN_CSS } from "@/components/PlanTable";
import PerPiecePricing, { PerPieceNote } from "@/components/PerPiecePricing";

// ==========================================================================
//  /main — MassLabs 전체 소개. **PG 가맹점 심사에 제출하는 주소**다.
//
//  🔴왜 홈(/)이 아니라 따로 있나 —
//    홈은 지금 임시로 LaserFish 건당결제만 싣고 있다(lib/interim.ts의
//    SUBSCRIPTION_LIVE=false). 그 화면만 보여주면 심사가 "건당결제"만 대상으로
//    통과되고, 나중에 구독을 열 때 **재심사·변경신청**을 다시 해야 한다.
//    갤럭시아에서 서비스명이 LaserFish 단일로 신고돼 구독 오픈 전에 변경신청이
//    필요했던 것과 똑같은 일이다. 그래서 파는 것과 팔 것을 **한 화면에** 둔다.
//
//  🔴심사용이라고 감춘 화면을 만들지 않는다. 심사는 사이트 전체를 보고, 통과
//    뒤에도 모니터링한다. 그래서 이 화면은 상단 막대(SiteHeader)와 하단
//    사업자정보(app/layout.tsx의 LayoutFooter)를 그대로 달고 있는 정상 화면이다.
//
//  🔴구독표는 **"출시 예정"이라고 못 박는다.** 못 파는 것을 살 수 있는 것처럼
//    두면 심사원이 눌러 보다 막힌다 — /subscribe는 지금 next.config.ts가 홈으로
//    돌리고 있다. 화면이 거짓말을 하는 순간 심사는 거기서 끝난다.
//
//  🔴값을 여기서 새로 적지 않는다. 요금·조각단가·등급은 PlanTable ·
//    PerPiecePricing 에서 그대로 끌어온다. 심사에 낸 숫자와 실제 결제창의 숫자가
//    어긋나면 그게 제일 큰 사고다.
//
//  ⚠️구독을 실제로 열면(SUBSCRIPTION_LIVE=true) 홈이 이 화면과 같은 말을 하게
//    되므로, 그때 이 화면을 지울지 홈으로 승격할지 정하면 된다.
// ==========================================================================

type Lang = "ko" | "en";

// 🔴제품 목록의 출처는 여기 하나다. 프로그램이 늘면 PlanTable의 PROGRAMS와
//   **함께** 늘려야 한다 — 한쪽만 고치면 소개와 요금표가 어긋난다.
//
// 🔴tag는 제품마다 따로 적는다. "판매 중"으로 뭉뚱그리면 거짓말이 된다 —
//   지금 돈을 받는 것은 LaserFish 건당결제 하나뿐이고, Archi Map은 열려는
//   있지만 파는 것이 없다. 심사는 "무엇을 파느냐"를 보는 자리다.
const PRODUCTS: {
  name: string;
  site?: string;
  status: "live" | "soon";
  tag: { ko: string; en: string };
  ko: string;
  en: string;
}[] = [
  {
    name: "LaserFish",
    status: "live",
    tag: { ko: "판매 중 · 건당 결제", en: "On sale · pay per piece" },
    ko: "라이노(Rhino) 플러그인. 건축 모델에서 레이저 커팅용 도면을 자동으로 만듭니다. 벽·슬래브와 지형을 조각으로 펼쳐 배치까지 끝냅니다.",
    en: "A Rhino plug-in. Turns an architectural model into laser-cutting drawings — walls, slabs and terrain unfolded and nested automatically.",
  },
  {
    name: "Archi Map",
    site: "https://archimap.masslabs-archi.com",
    status: "live",
    tag: { ko: "이용 가능", en: "Available" },
    ko: "웹 서비스. 지도에서 대지를 골라 주변 건물과 지형을 내려받습니다. 2D 도면(PNG·SVG·DXF·PDF)과 3D 모델(3DM·SKP)로 내보냅니다.",
    en: "A web service. Pick a site on the map and pull down the surrounding buildings and terrain. Exports 2D drawings (PNG, SVG, DXF, PDF) and 3D models (3DM, SKP).",
  },
  {
    name: "Archi Render",
    status: "soon",
    tag: { ko: "준비 중", en: "In development" },
    ko: "건축 모델을 이미지로 만드는 웹 서비스입니다. 준비 중입니다.",
    en: "A web service that turns architectural models into renderings. In development.",
  },
];

// 약관 제10조(환불)를 줄여 옮긴 것. 🔴문구를 여기서 새로 쓰지 않는다 —
//   전문은 /policy/terms-and-policy 한 곳에만 있고, 여기는 요약과 링크뿐이다.
const REFUND: Record<Lang, { title: string; lines: string[]; foot: string; link: string }> = {
  ko: {
    title: "환불 정책",
    lines: [
      "결제 후 서비스를 전혀 이용하지 않았고, 결제일로부터 7일 이내에 요청한 경우",
      "회사의 귀책 사유로 서비스를 정상적으로 이용할 수 없었던 경우",
      "중복 결제 또는 오결제가 확인된 경우",
    ],
    foot: "환불 요청은 masslabs.archi@gmail.com 으로 결제일·결제 금액·환불 사유를 적어 접수해 주세요. 확인 후 영업일 기준 3~5일 이내에 처리됩니다.",
    link: "이용약관 및 환불정책 전문 보기",
  },
  en: {
    title: "Refund Policy",
    lines: [
      "The service was not used at all after payment and a refund is requested within 7 days of the payment date",
      "The service could not be used normally due to reasons attributable to the Company",
      "A duplicate or erroneous payment is confirmed",
    ],
    foot: "Send refund requests to masslabs.archi@gmail.com with the payment date, amount, and reason. Confirmed requests are processed within 3 to 5 business days.",
    link: "Read the full Terms and Refund Policy",
  },
};

const CSS = `
  .mn-wrap { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
  .mn-hero {
    background: linear-gradient(150deg, #0c0c0c 0%, #1c1c2e 60%, #0c0c0c 100%);
    color: #fff; padding: 92px 20px 96px; text-align: center;
  }
  .mn-hero h1 { font-size: 2.9rem; font-weight: 900; letter-spacing: -0.04em; }
  .mn-hero p { margin-top: 16px; color: #b6b6c4; font-size: 1.05rem; line-height: 1.75; }

  .mn-sec { padding: 76px 0; }
  .mn-sec.alt { background: #f7f7f7; }
  .mn-sec > .mn-wrap > h2 {
    font-size: 1.9rem; font-weight: 900; letter-spacing: -0.03em; color: #111; text-align: center;
  }
  .mn-sec > .mn-wrap > .mn-lead {
    text-align: center; color: #888; font-size: 0.98rem; line-height: 1.75; margin-top: 12px;
  }

  /* 제품 카드 */
  .mn-prods { display: grid; grid-template-columns: repeat(auto-fit, minmax(270px, 1fr)); gap: 18px; margin-top: 38px; }
  .mn-prod { background: #fff; border: 1px solid #ececec; border-radius: 18px; padding: 26px 24px; }
  .mn-prod-top { display: flex; align-items: center; gap: 9px; }
  .mn-prod h3 { font-size: 1.08rem; font-weight: 800; letter-spacing: -0.02em; color: #111; }
  .mn-prod p { margin-top: 12px; font-size: 0.88rem; color: #777; line-height: 1.8; }
  .mn-prod a { display: inline-block; margin-top: 14px; font-size: 0.8rem; color: #666; text-decoration: underline; }
  .mn-prod a:hover { color: #111; }

  .mn-tag { font-size: 0.66rem; font-weight: 700; letter-spacing: 0.05em; padding: 3px 8px; border-radius: 999px; white-space: nowrap; }
  .mn-tag.live { background: #eef7f0; color: #2f855a; }
  .mn-tag.soon { background: #f3f3f3; color: #999; }

  /* 판매 상태 머리말 — "지금 파는 것"과 "곧 파는 것"을 눈으로 갈라 놓는다 */
  .mn-status { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; }

  /* 🔴출시 예정 안내. 구독표 바로 위에 붙어야 의미가 있다 */
  .mn-notice {
    max-width: 620px; margin: 0 auto 30px; background: #fffdf3; border: 1px solid #f0e6c8;
    border-radius: 12px; padding: 14px 18px; font-size: 0.84rem; color: #8a7433; line-height: 1.75; text-align: center;
  }

  /* 환불·고객센터 */
  .mn-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; margin-top: 38px; }
  .mn-box { background: #fff; border: 1px solid #ececec; border-radius: 18px; padding: 26px 24px; }
  .mn-box h3 { font-size: 1rem; font-weight: 800; color: #111; margin-bottom: 14px; }
  .mn-box ul { margin: 0; padding-left: 18px; }
  .mn-box li { font-size: 0.85rem; color: #777; line-height: 1.9; }
  .mn-box p { font-size: 0.85rem; color: #777; line-height: 1.9; }
  .mn-box a { color: #666; text-decoration: underline; }
  .mn-box a:hover { color: #111; }
  .mn-dl { display: grid; grid-template-columns: 92px 1fr; gap: 6px 12px; font-size: 0.85rem; }
  .mn-dl dt { color: #a0a0a0; }
  .mn-dl dd { color: #444; margin: 0; }

  @media (max-width: 640px) {
    .mn-hero { padding: 64px 20px 68px; }
    .mn-hero h1 { font-size: 2rem; }
    .mn-hero p { font-size: 0.92rem; }
    .mn-sec { padding: 54px 0; }
    .mn-sec > .mn-wrap > h2 { font-size: 1.45rem; }
  }
`;

export default function MainOverviewPage() {
  const { lang } = useLanguage();
  const isKo = lang === "ko";
  const rf = REFUND[(lang as Lang) ?? "ko"] ?? REFUND.ko;

  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#fff", color: "#111",
    }}>
      <style>{CSS}</style>
      <style>{PLAN_CSS}</style>

      <SiteHeader />

      {/* ── 소개 ── */}
      <section className="mn-hero">
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <h1>MassLabs</h1>
          <p>
            {isKo
              ? "건축 설계에 쓰는 도구를 만듭니다. 라이노 플러그인과 웹 서비스를 하나의 계정으로 함께 씁니다."
              : "We build tools for architectural design — Rhino plug-ins and web services, all under one account."}
          </p>
        </div>
      </section>

      {/* ── 제품 ── */}
      <section className="mn-sec">
        <div className="mn-wrap">
          <h2>{isKo ? "제품" : "Products"}</h2>
          <p className="mn-lead">
            {isKo
              ? "계정 하나로 아래 프로그램을 함께 씁니다."
              : "One account covers every program below."}
          </p>

          <div className="mn-prods">
            {PRODUCTS.map((p) => (
              <div className="mn-prod" key={p.name}>
                <div className="mn-prod-top">
                  <h3>{p.name}</h3>
                  <span className={`mn-tag ${p.status}`}>{isKo ? p.tag.ko : p.tag.en}</span>
                </div>
                <p>{isKo ? p.ko : p.en}</p>
                {p.site && (
                  <a href={p.site} target="_blank" rel="noreferrer">
                    {p.site.replace("https://", "")}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 지금 파는 것: LaserFish 건당결제 ──
          🔴홈·/price와 같은 컴포넌트를 쓴다. 값을 여기 따로 적으면 어긋난다. */}
      <section className="mn-sec alt">
        <div className="mn-wrap">
          <div className="mn-status">
            <h2 style={{ margin: 0 }}>{isKo ? "건당 결제" : "Pay Per Piece"}</h2>
            <span className="mn-tag live">{isKo ? "판매 중" : "Available"}</span>
          </div>
          <p className="mn-lead" style={{ marginBottom: "34px" }}>
            <PerPieceNote lang={lang} />
          </p>

          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <PerPiecePricing lang={lang} />
          </div>
        </div>
      </section>

      {/* ── 곧 파는 것: 통합 구독 ──
          🔴onSubscribe를 넘기지 않는다 → 버튼이 결제가 아니라 /price 링크가 된다.
            여기서 결제를 시작하면 안 된다(정기결제가 아직 열리지 않았다). */}
      <section className="mn-sec">
        <div className="mn-wrap">
          <div className="mn-status">
            <h2 style={{ margin: 0 }}>{isKo ? "통합 구독" : "Subscription"}</h2>
            <span className="mn-tag soon">{isKo ? "출시 예정" : "Coming soon"}</span>
          </div>
          <p className="mn-lead" style={{ marginBottom: "26px" }}>
            {isKo
              ? "구독 하나로 MassLabs의 모든 프로그램을 씁니다."
              : "One subscription covers every MassLabs program."}
          </p>

          <div className="mn-notice">
            {isKo
              ? "정기결제 개통을 준비하고 있습니다. 아직 구독을 판매하지 않으며, 아래 표는 출시 예정 요금입니다. 지금 이용하실 수 있는 것은 위의 LaserFish 건당 결제입니다."
              : "Recurring billing is not open yet. Subscriptions are not on sale, and the table below shows planned pricing. What you can buy today is the per-piece LaserFish payment above."}
          </div>

          <div style={{ maxWidth: "920px", margin: "0 auto" }}>
            <PlanTable lang={lang} />
          </div>
        </div>
      </section>

      {/* ── 환불 정책 · 고객센터 ──
          🔴PG 심사 필수 항목이다. 사업자정보는 app/layout.tsx의 LayoutFooter가
            모든 화면 하단에 이미 싣고 있으므로 여기서 되풀이하지 않는다. */}
      <section className="mn-sec alt">
        <div className="mn-wrap">
          <h2>{isKo ? "환불 · 고객센터" : "Refunds & Support"}</h2>

          <div className="mn-info">
            <div className="mn-box">
              <h3>{rf.title}</h3>
              <p style={{ marginBottom: "10px" }}>
                {isKo
                  ? "다음의 경우 환불해 드립니다."
                  : "We issue refunds in the following cases."}
              </p>
              <ul>
                {rf.lines.map((l, i) => <li key={i}>{l}</li>)}
              </ul>
              <p style={{ marginTop: "12px" }}>{rf.foot}</p>
              <p style={{ marginTop: "12px" }}>
                <a href="/policy/terms-and-policy">{rf.link}</a>
              </p>
            </div>

            <div className="mn-box">
              <h3>{isKo ? "고객센터" : "Customer Support"}</h3>
              <dl className="mn-dl">
                <dt>{isKo ? "전화" : "Phone"}</dt>
                <dd>070-8144-5867</dd>
                <dt>{isKo ? "이메일" : "Email"}</dt>
                <dd><a href="mailto:masslabs.archi@gmail.com">masslabs.archi@gmail.com</a></dd>
                {/* ⚠️운영시간은 아직 정한 값이 없어 싣지 않는다. 지어낸 시간을
                    올리면 그 시간에 안 받는 순간 화면이 거짓말을 한 셈이 된다. */}
              </dl>
              <p style={{ marginTop: "14px" }}>
                <a href="/contact">{isKo ? "문의 남기기" : "Send an enquiry"}</a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
