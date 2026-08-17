"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import PlanTable, { PLAN_CSS } from "@/components/PlanTable";

// ==========================================================================
//  /plan — 모든 프로그램이 공유하는 요금제 화면.
//
//  🔴Archimap을 비롯한 각 프로그램은 자기 PLAN 화면을 만들지 않고 여기로 보낸다.
//    구독이 계정 단위라, 표가 여러 벌이면 반드시 어긋난다.
//    호출 예: https://masslabs-archi.com/plan?next=<돌아올 주소>
//
//  🔴로그인은 필수가 아니다. 안 한 사람도 표는 봐야 하고, 구독을 누를 때만
//    로그인으로 보낸다.
// ==========================================================================

const PRODUCT = "all";

function PlanContent() {
  const sp = useSearchParams();
  const { lang } = useLanguage();
  const next = safeNext(sp.get("next"));

  const [plan, setPlan] = useState("free");
  const [signedIn, setSignedIn] = useState(false);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
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
    setBusy(tier); setError(""); setMsg("");
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

  const buyCredits = async () => {
    if (!signedIn) return requireLogin();
    setBusy("credits"); setError(""); setMsg("");
    const r = await fetch("/api/credits/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: "{}",
    });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) {
      setError(
        d.error === "no_billing_key" ? "크레딧 추가 구매는 구독 중일 때만 가능합니다."
        : d.error === "nothing_to_restore" ? "이번 달에 쓰신 크레딧이 3회 미만이라 구매하실 수 없습니다."
        : d.error === "charge_failed" ? "결제에 실패했습니다. 카드를 확인해 주세요."
        : "구매에 실패했습니다.");
      return;
    }
    setMsg("크레딧 3회가 추가되었습니다.");
  };

  return (
    <>
      <style>{PLAN_CSS}</style>
      <div className="plan-head">
        <h1>{lang === "ko" ? "요금제" : "Plans"}</h1>
        <p>
          {lang === "ko"
            ? "구독 하나로 MassLabs의 모든 프로그램을 사용합니다."
            : "One subscription covers every MassLabs program."}
        </p>
      </div>

      {error && <div className="pmsg err">{error}</div>}
      {msg && <div className="pmsg ok">{msg}</div>}

      <PlanTable
        lang={lang}
        currentPlan={signedIn ? plan : undefined}
        onSubscribe={subscribe}
        onBuyCredits={buyCredits}
        busy={busy}
      />

      <div className="plan-fine">
        {lang === "ko"
          ? "가격은 부가세 별도이며 매월 자동 결제됩니다. 해외 결제는 부가세가 붙지 않습니다. 언제든 해지할 수 있고, 결제하신 기간까지는 그대로 사용하실 수 있습니다."
          : "Prices exclude VAT and renew monthly. Cancel anytime — you keep access through the period you paid for."}
      </div>

      <div className="plan-foot">
        {next !== "/" && <a href={next}>{lang === "ko" ? "← 돌아가기" : "← Back"}</a>}
        <a href="/account">{lang === "ko" ? "내 구독 관리" : "Manage subscription"}</a>
      </div>
    </>
  );
}

export default function PlanPage() {
  return (
    <main style={{
      fontFamily: "var(--font-geist-sans), -apple-system, 'Helvetica Neue', sans-serif",
      background: "#f7f7f7", color: "#111", minHeight: "100vh", padding: "56px 20px",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .plan-wrap { max-width: 920px; margin: 0 auto; }
        .plan-head { text-align: center; margin-bottom: 32px; }
        .plan-head h1 { font-size: 2rem; font-weight: 900; letter-spacing: -0.03em; }
        .plan-head p { font-size: 0.95rem; color: #888; margin-top: 10px; }
        .pmsg { font-size: 0.82rem; padding: 11px 14px; border-radius: 8px; margin-bottom: 14px; text-align: center; }
        .pmsg.err { background: #fff5f5; color: #c53030; }
        .pmsg.ok { background: #f0fff4; color: #2f855a; }
        .plan-foot { display: flex; gap: 18px; justify-content: center; margin-top: 26px; }
        .plan-foot a { font-size: 0.8rem; color: #888; text-decoration: underline; }
        .plan-foot a:hover { color: #111; }
        @media (max-width: 640px) {
          .plan-head h1 { font-size: 1.5rem; }
        }
      `}</style>
      <div className="plan-wrap">
        <Suspense fallback={<p style={{ textAlign: "center", color: "#888" }}>Loading...</p>}>
          <PlanContent />
        </Suspense>
      </div>
    </main>
  );
}
