"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import PlanTable, { PLAN_CSS } from "@/components/PlanTable";
import PerPiecePricing, { PerPieceNote } from "@/components/PerPiecePricing";
import SiteHeader from "@/components/SiteHeader";
import { SUBSCRIPTION_LIVE } from "@/lib/interim";

// ==========================================================================
//  /price — 모든 프로그램이 공유하는 요금제 화면. 상단 메뉴의 "비용"이 여기다.
//
//  🔴Archimap을 비롯한 각 프로그램은 자기 요금제 화면을 만들지 않고 여기로 보낸다.
//    구독이 계정 단위라, 표가 여러 벌이면 반드시 어긋난다.
//    호출 예: https://masslabs-archi.com/price?next=<돌아올 주소>
//    ⚠️옛 주소 /plan 은 next.config.ts 가 여기로 넘긴다(배포된 라이노 플러그인용).
//
//  🔴로그인은 필수가 아니다. 안 한 사람도 표는 봐야 하고, 구독을 누를 때만
//    로그인으로 보낸다.
//
//  🔴🔴임시(2026-08-21) — 정기결제가 열릴 때까지 이 화면은 **LaserFish 건당결제
//    안내**로 되돌아가 있다(PriceContent 대신 PerPieceContent). 구독 코드는 아래에
//    그대로 살아 있고, lib/interim.ts 의 SUBSCRIPTION_LIVE 하나로 돌아온다.
// ==========================================================================

const PRODUCT = "all";

function PriceContent() {
  const sp = useSearchParams();
  const { lang } = useLanguage();
  const next = safeNext(sp.get("next"));

  const [plan, setPlan] = useState("free");
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) return;
    setSignedIn(true);
    const { data } = await sb.rpc("my_plan", { p_product: PRODUCT });
    if (typeof data === "string") setPlan(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const token = async () => (await supabase().auth.getSession()).data.session?.access_token ?? "";

  // 로그인 안 했으면 로그인부터. 끝나면 이 화면으로 돌아온다.
  const requireLogin = () => {
    const here = `/plan${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`;
    window.location.href = `/login?next=${encodeURIComponent(here)}`;
  };

  const subscribe = async (tier: string) => {
    if (!signedIn) return requireLogin();
    setBusy(tier); setError("");
    const r = await fetch("/api/subscribe/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ product: PRODUCT, plan: tier }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) {
      setError(d.error === "bundle_active"
        ? "이미 구독 중입니다."
        : "결제 창을 열지 못했습니다.");
      return;
    }
    window.location.href = d.url;
  };

  return (
    <>
      <style>{PLAN_CSS}</style>
      <div className="price-head">
        <h1>{lang === "ko" ? "요금제" : "Plans"}</h1>
        <p>
          {lang === "ko"
            ? "구독 하나로 MassLabs의 모든 프로그램을 사용합니다."
            : "One subscription covers every MassLabs program."}
        </p>
      </div>

      {error && <div className="pmsg err">{error}</div>}

      <PlanTable
        lang={lang}
        currentPlan={signedIn ? plan : undefined}
        onSubscribe={subscribe}
        busy={busy}
      />

      <div className="plan-fine">
        {lang === "ko"
          ? "부가세 별도"
          : "VAT not included"}
      </div>

      <div className="price-foot">
        {next !== "/" && <a href={next}>{lang === "ko" ? "← 돌아가기" : "← Back"}</a>}
        <a href="/account">{lang === "ko" ? "내 구독 관리" : "Manage subscription"}</a>
      </div>
    </>
  );
}

// --------------------------------------------------------------------------
//  건당결제 안내(임시) — 로그인도 구독 상태도 묻지 않는다. 볼 것은 값뿐이다.
//  ⚠️`next`는 그대로 받는다 — 라이노 플러그인이 /plan?next=… 로 들어온다.
// --------------------------------------------------------------------------
function PerPieceContent() {
  const sp = useSearchParams();
  const { lang } = useLanguage();
  const next = safeNext(sp.get("next"));

  return (
    <>
      <div className="price-head">
        <h1>{lang === "ko" ? "저렴한 금액대" : "Affordable Pricing"}</h1>
        <p><PerPieceNote lang={lang} /></p>
      </div>

      <PerPiecePricing lang={lang} />

      <div className="price-foot">
        {next !== "/" && <a href={next}>{lang === "ko" ? "← 돌아가기" : "← Back"}</a>}
        <a href="/download">{lang === "ko" ? "다운로드" : "Download"}</a>
      </div>
    </>
  );
}

export default function PricePage() {
  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#f7f7f7", color: "#111", minHeight: "100vh",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .price-wrap { max-width: 980px; margin: 0 auto; padding: 56px 20px 80px; }
        .price-head { text-align: center; margin-bottom: 32px; }
        .price-head h1 { font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; }
        .price-head p { font-size: 0.95rem; color: #888; margin-top: 10px; }
        .pmsg { font-size: 0.82rem; padding: 11px 14px; border-radius: 8px; margin-bottom: 14px; text-align: center; }
        .pmsg.err { background: #fff5f5; color: #c53030; }
        .pmsg.ok { background: #f0fff4; color: #2f855a; }
        .price-foot { display: flex; gap: 18px; justify-content: center; margin-top: 26px; }
        .price-foot a { font-size: 0.8rem; color: #888; text-decoration: underline; }
        .price-foot a:hover { color: #111; }
        @media (max-width: 640px) {
          .price-head h1 { font-size: 1.5rem; }
        }
      `}</style>
      <SiteHeader active="/price" />
      <div className="price-wrap">
        <Suspense fallback={<p style={{ textAlign: "center", color: "#888" }}>Loading...</p>}>
          {SUBSCRIPTION_LIVE ? <PriceContent /> : <PerPieceContent />}
        </Suspense>
      </div>
    </main>
  );
}
