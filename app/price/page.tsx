"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";
import { useLanguage, useT, TRich } from "@/lib/i18n";
import PlanTable, { PLAN_CSS } from "@/components/PlanTable";
import DarkTopBar, { DARK_TOPBAR_CSS, type DarkLink } from "@/components/DarkTopBar";
import { effectivePlan } from "@/lib/interim";
import { useStartCheckout } from "@/lib/use-checkout";
import { usePriceView } from "@/lib/use-price-view";
import { LASERFISH_DOWNLOAD, LASERFISH_GUIDE } from "@/lib/products";

// ==========================================================================
//  /price — 모든 프로그램이 공유하는 요금제 화면. 상단 메뉴의 "비용"이 여기다.
//
//  🔴archiMap을 비롯한 각 프로그램은 자기 요금제 화면을 만들지 않고 여기로 보낸다.
//    구독이 계정 단위라, 표가 여러 벌이면 반드시 어긋난다.
//    호출 예: https://masslabs-archi.com/price?next=<돌아올 주소>
//    ⚠️옛 주소 /plan 은 next.config.ts 가 여기로 넘긴다(배포된 라이노 플러그인용).
//
//  🔴로그인은 필수가 아니다. 안 한 사람도 표는 봐야 하고, 구독을 누를 때만
//    로그인으로 보낸다.
//
//  🔴🔴🔴2026-08-29 — **지금 이 주소는 아무도 못 연다.** lib/interim.ts 의
//    SUBSCRIPTION_LIVE 가 false 인 동안 next.config.ts 가 /price 를 홈의 가격
//    구역(`/#pricing`)으로 넘긴다(307). 구독표는 홈에 한 벌이면 된다.
//    ⚠️그 사이 이 자리에 서던 LaserFish 건당표(PerPieceContent)는 2026-09-14 에
//      건당결제 코드와 함께 지웠다. 이제 이 화면이 그리는 것은 구독표 하나다.
//    ⛔이 파일을 지우지 말 것 — 스위치를 켜는 순간 리다이렉트가 사라지고 아래
//      PriceContent(구독표)가 이 자리에 선다. 그날 함께 볼 것:
//        · lib/interim.ts 의 PRICING_HREF (메뉴·단추가 보는 주소)
//        · app/sitemap.ts 의 /price 줄 · 아래 밝은 PlanTable 의 어두운 변형
//
//  🔴2026-08-28 어두운 화면으로 갈아입혔다 — 홈(components/LandingView) · /account ·
//    /policy 와 같은 결이다. 값과 흐름은 하나도 안 바꿨다.
//    ⚠️어두운 화면이므로 lib/dark-pages.ts 의 DARK_PAGES 에 "/price" 가 들어 있어야
//      한다 — 빠지면 위에 흰 띠(LanguageBar)와 밝은 바닥글이 덧붙는다.
//    ⚠️⚠️**구독표(PlanTable)는 아직 밝다.** 지금은 안 보이지만 SUBSCRIPTION_LIVE
//      를 켜는 날 어두운 바탕에 흰 표가 뜬다. 그 표는 /account 도 함께 쓴다 —
//      ⇒ 구독을 여는 날 PlanTable 에 어두운 변형을 **더하는** 식으로 풀 것
//        (지금 것을 갈아엎으면 /account 가 같이 깨진다).
// ==========================================================================

const PRODUCT = "all";

// 🔴[사용방법]과 [다운로드]는 **밖으로 나간다** — 정본이 LaserFish 소개 사이트다
//   (다운로드 2026-08-28, 사용방법 2026-08-29).
const LINKS: DarkLink[] = [
  { href: LASERFISH_GUIDE, ko: "사용방법", en: "How to Use" },
  { href: LASERFISH_DOWNLOAD, ko: "다운로드", en: "Download" },
  { href: "/price", ko: "비용", en: "Pricing" },
  { href: "/contact", ko: "문의하기", en: "Contact" },
];

function PriceContent() {
  const sp = useSearchParams();
  const { lang } = useLanguage();
  const T = useT();
  const next = safeNext(sp.get("next"));

  const [plan, setPlan] = useState("free");
  const [signedIn, setSignedIn] = useState(false);
  const priceView = usePriceView(lang);
  // 🔴결제 시작은 lib/use-checkout 한 곳이다(홈 가격 구역과 한 벌, 2026-09-11).
  const checkout = useStartCheckout();
  const busy = checkout.busy;
  const error = checkout.error === "bundle_active"
    ? T("이미 구독 중입니다.", "You already have an active subscription.")
    : checkout.error ? T("결제 창을 열지 못했습니다.", "Couldn't open the checkout window.") : "";

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return;
    setSignedIn(true);
    const { data } = await sb.rpc("my_plan", { p_product: PRODUCT });
    // 🔴할인 기간에는 free 가 PLUS 다 — 판정은 lib/interim 의 effectivePlan 한 곳.
    setPlan(effectivePlan(typeof data === "string" ? data : "free"));
  }, []);

  useEffect(() => { load(); }, [load]);

  // 로그인 안 했으면 로그인부터(훅이 본다). 끝나면 이 화면으로 돌아온다.
  const here = `/plan${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;
  const subscribe = (tier: string) => checkout.start(tier, here);

  return (
    <>
      <style>{PLAN_CSS}</style>
      <div className="prc-eyebrow">{T("요금제", "Plans")}</div>
      <h1 className="prc-title">
        <TRich ko={"구독 하나로 *전부.*"} en={"One subscription, *everything.*"} />
      </h1>
      <p className="prc-lede">
        {T("구독 하나로 MassLabs의 모든 프로그램을 사용합니다.", "One subscription covers every MassLabs program.")}
      </p>

      {error && <div className="prc-err">{error}</div>}

      <PlanTable
        lang={lang}
        currentPlan={signedIn ? plan : undefined}
        onSubscribe={subscribe}
        busy={busy}
      />

      {/* 🔴원화로 보이는 값은 부가세 포함 청구액이다(lib/plans 의 krwTotal) — "별도"라고
            적으면 값이 두 번 붙는 것처럼 읽힌다(2026-09-11). */}
      <div className="plan-fine">
        {priceView.krw
          ? T("원화 가격은 부가세 10% 포함이며, 결제 시점 환율로 환산됩니다.",
              "KRW prices include 10% VAT and are converted at the exchange rate on the day of payment.")
          : T("부가세 별도", "VAT not included")}
      </div>

      <div className="prc-foot">
        {next !== "/" && <a href={next}>{T("← 돌아가기", "← Back")}</a>}
        <a href="/account">{T("내 구독 관리", "Manage subscription")}</a>
      </div>
    </>
  );
}

// 🔴2026-08-28 이전에는 ?preview=1 로 들어온 사람의 로고와 [비용]을 /main
//   (구독을 팔던 시절의 홈, PG 심사용)으로 돌려보냈다. /main 을 지우면서 없앴다.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="prc">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .prc {
          --bg:   #0e0e0f;
          --bg2:  #131315;
          --card: #17171a;
          --line: rgba(255,255,255,0.10);
          --line2:rgba(255,255,255,0.22);
          --tx:   #eceae6;
          --mut:  #8a8a86;
          --dim:  #555552;
          --acc:  #e8802e;
          --accx: #140f0a;
          --r:    2px;
          --mono: var(--font-geist-mono), ui-monospace, monospace;

          font-family: var(--font-geist-sans), -apple-system, 'Helvetica Neue', sans-serif;
          letter-spacing: -0.01em;
          background: var(--bg); color: var(--tx); min-height: 100vh;
        }
        .prc ::selection { background: var(--acc); color: var(--accx); }
        ${DARK_TOPBAR_CSS}

        .prc-wrap { max-width: 980px; margin: 0 auto; padding: 128px 20px 96px; }

        /* 홈의 구역 머리말과 같은 모양 — 주황 짧은 선 + 대문자 작은 글씨 */
        .prc-eyebrow {
          display: flex; align-items: center; gap: 12px;
          font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.24em;
          text-transform: uppercase; color: var(--acc); margin-bottom: 20px;
        }
        .prc-eyebrow::before { content: ""; width: 40px; height: 1px; background: var(--acc); }

        /* 🔴제목은 통째로 흰색이다. em 은 색이 아니라 자리로만 구실한다 —
             앞머리를 회색으로 물렸더니 문장이 반토막으로 읽혔다(2026-08-27). */
        .prc-title { font-size: clamp(1.9rem, 4.4vw, 3.1rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.06; }
        .prc-title em { font-style: normal; color: var(--tx); }
        .prc-lede { color: var(--mut); font-size: 0.95rem; line-height: 1.9; margin-top: 18px; max-width: 62ch; }

        .prc-err {
          font-size: 0.82rem; padding: 12px 15px; margin-top: 24px; border-radius: var(--r);
          border: 1px solid rgba(232,80,60,0.35); background: rgba(232,80,60,0.10); color: #f0a79c;
        }

        .prc-foot { display: flex; gap: 20px; justify-content: center; margin-top: 40px; }
        .prc-foot a {
          font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.12em; text-transform: uppercase;
          color: var(--dim); text-decoration: none; transition: color .15s;
        }
        .prc-foot a:hover { color: var(--acc); }

        @media (max-width: 720px) {
          .prc-wrap { padding-top: 148px; }
        }
      `}</style>

      <DarkTopBar links={LINKS} active="/price" />
      <div className="prc-wrap">{children}</div>
    </main>
  );
}

export default function PricePage() {
  return (
    <Shell>
      <Suspense fallback={<p style={{ textAlign: "center", color: "#8a8a86" }}>Loading...</p>}>
        {/* 🔴SUBSCRIPTION_LIVE 로 가르지 않는다 — 꺼져 있는 동안은 next.config.ts 가
              이 주소를 통째로 넘기므로 여기까지 오지 않는다(2026-09-14). */}
        <PriceContent />
      </Suspense>
    </Shell>
  );
}
