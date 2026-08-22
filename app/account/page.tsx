"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import PlanTable, { PLAN_CSS } from "@/components/PlanTable";
import SiteHeader from "@/components/SiteHeader";

// ==========================================================================
//  /account — 내 구독.
//
//  🔴구독 상태는 my_plan RPC로 묻는다. subscriptions를 직접 세면 'all' 번들
//    구독자가 free로 보인다(번들은 product='all' 행 하나뿐이라서).
// ==========================================================================

type Sub = {
  product: string; plan: string; status: string;
  currency: string; amount: number;
  next_billing_at: string | null; canceled_at: string | null;
};

// 🔴구독 상품은 하나뿐이다. 등급(plus/pro/max)이 모든 프로그램에 함께 적용된다.
const PRODUCT = "all";

const money = (n: number, cur: string) =>
  cur === "KRW" ? `${n.toLocaleString()}원` : `$${(n / 100).toFixed(2)}`;
const day = (s: string | null, isKo: boolean) =>
  s ? new Date(s).toLocaleDateString(isKo ? "ko-KR" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }) : "—";

// ==========================================================================
//  화면 문구
//
//  🔴/login·/link과 같은 기준 — **홈페이지에서 고른 언어**를 따른다.
//    구독 통화(subscriptions.currency)를 기준으로 삼을 수도 있었지만, 이 화면은
//    구독이 없는 사람도 들어오는 자리라 그때 기준이 사라진다. 계정 화면은 계정
//    주인의 언어를 따르는 게 맞다.
// ==========================================================================
const TX = {
  ko: {
    loading: "불러오는 중…",
    title: "내 구독", logout: "로그아웃",
    toPrice: "요금제 보러 가기 →",
    none: "미구독",
    nextBilling: "다음 결제일", amount: "결제 금액",
    cancelBtn: "구독 해지", working: "처리 중…",
    endsOn: "이용 종료일",
    canceledNote: "해지되었습니다. 위 날짜까지는 그대로 사용하실 수 있습니다.",
    pastDue: "결제에 실패해 이용이 중지되었습니다. 다시 구독해 주세요.",
    adminNote: "운영자 권한으로 모든 프로그램을 이용 중입니다.",
    cancelFail: "해지에 실패했습니다.",
    // 🔴체험 중이면 "결제하신 기간"이라는 말이 거짓이 된다 — 낸 돈이 없다.
    confirmPaid: "구독을 해지하시겠습니까?\n이미 결제하신 기간까지는 그대로 사용하실 수 있습니다.",
  },
  en: {
    loading: "Loading…",
    title: "My subscription", logout: "Sign out",
    toPrice: "See the plans →",
    none: "Not subscribed",
    nextBilling: "Next billing date", amount: "Amount",
    cancelBtn: "Cancel subscription", working: "Working…",
    endsOn: "Access ends",
    canceledNote: "Canceled. You can keep using it until the date above.",
    pastDue: "Payment failed, so access is paused. Please subscribe again.",
    adminNote: "You have admin access to every program.",
    cancelFail: "Couldn't cancel the subscription.",
    confirmPaid: "Cancel your subscription?\nYou can keep using it through the period you've already paid for.",
  },
} as const;

export default function AccountPage() {
  const { lang } = useLanguage();
  const isKo = lang === "ko";
  const x = isKo ? TX.ko : TX.en;
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) { window.location.href = `/login?next=${encodeURIComponent("/account")}`; return; }
    setEmail(u.user.email ?? "");

    const [{ data: p }, { data: rows }] = await Promise.all([
      sb.rpc("my_plan", { p_product: PRODUCT }),
      sb.from("subscriptions").select("*"),
    ]);
    setPlan(typeof p === "string" ? p : "free");
    setSubs((rows ?? []) as Sub[]);
    setReady(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const token = async () => (await supabase().auth.getSession()).data.session?.access_token ?? "";


  const cancel = async (product: string) => {
    if (!confirm(x.confirmPaid)) return;
    setBusy(product); setError("");
    const r = await fetch("/api/subscribe/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ product }),
    });
    setBusy("");
    if (!r.ok) { setError(x.cancelFail); return; }
    load();
  };

  if (!ready) return <Shell><p className="dim">{x.loading}</p></Shell>;

  const sub = subs.find((s) => s.product === PRODUCT);
  const entitled = plan !== "free";

  return (
    <Shell>
      <div className="hd">
        <div>
          <h1 className="ttl">{x.title}</h1>
          <p className="sub">{email}</p>
        </div>
        <button className="ghost" onClick={async () => {
          await supabase().auth.signOut();
          window.location.href = "/";
        }}>{x.logout}</button>
      </div>

      {error && <div className="err">{error}</div>}

      {/* ── MassLabs 구독 (모든 프로그램 공통) ── */}
      <section className="card">
        <div className="badge-row">
          <span className={`badge${entitled ? " on" : ""}`}>
            {entitled ? plan.toUpperCase() : x.none}
          </span>
        </div>

        {sub?.status === "active" && (
          <>
            <Line k={x.nextBilling} v={day(sub.next_billing_at, isKo)} />
            <Line k={x.amount} v={money(sub.amount, sub.currency)} />
            <button className="ghost wide" disabled={busy === PRODUCT} onClick={() => cancel(PRODUCT)}>
              {busy === PRODUCT ? x.working : x.cancelBtn}
            </button>
          </>
        )}

        {sub?.status === "canceled" && (
          <>
            <Line k={x.endsOn} v={day(sub.canceled_at, isKo)} />
            <p className="note">{x.canceledNote}</p>
          </>
        )}

        {sub?.status === "past_due" && (
          <p className="note warn">{x.pastDue}</p>
        )}

        {/* 🔴표는 홈·/price와 같은 것을 쓴다. 등급 설명이 화면마다 따로 있으면
            반드시 어긋나고, 그때 어느 쪽이 맞는지 아무도 모른다(2026-08-18 UI 통일).
            ⚠️여기서는 가격도 구독 버튼도 걷어낸 status 모양이다 — 구독을 시작하는
              자리는 /price 한 곳뿐이다. */}
        <div className="plan-here">
          <PlanTable lang={lang} currentPlan={plan} variant="status" />
        </div>

        {!entitled && (
          <p className="note">
            <a href="/price" style={{ color: "#555", textDecoration: "underline" }}>{x.toPrice}</a>
          </p>
        )}

        {entitled && !sub && (
          <p className="note">{x.adminNote}</p>
        )}
      </section>
    </Shell>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return <div className="ln"><span>{k}</span><span>{v}</span></div>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      fontFamily: "var(--font-geist-sans), -apple-system, 'Helvetica Neue', sans-serif",
      background: "#f5f5f5", color: "#1a1a1a", minHeight: "100vh",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .wrap { max-width: 960px; margin: 0 auto; padding: 40px 20px; }
        .hd { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22px; }
        .ttl { font-size:1.5rem; font-weight:800; letter-spacing:-0.03em; }
        .sub { font-size:0.8rem; color:#888; margin-top:4px; }
        .dim { font-size:0.88rem; color:#888; }
        .card { background:#fff; border-radius:14px; padding:22px; margin-bottom:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
        .row { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:14px; }
        .badge-row { display:flex; justify-content:flex-end; margin-bottom:14px; }
        .pname { font-size:1rem; font-weight:700; }
        .pdesc { font-size:0.78rem; color:#999; margin-top:3px; line-height:1.5; }
        .badge { font-size:0.7rem; font-weight:700; padding:4px 10px; border-radius:100px; background:#f0f0f0; color:#999; white-space:nowrap; }
        .badge.on { background:#e6f4ec; color:#2f855a; }
        .ln { display:flex; justify-content:space-between; padding:9px 0; border-top:1px solid #f2f2f2; font-size:0.82rem; }
        .ln span:first-child { color:#777; }
        .plan-here { padding-top:16px; border-top:1px solid #f2f2f2; }
        ${PLAN_CSS}
        .note { font-size:0.75rem; color:#999; line-height:1.6; margin-top:8px; }
        .note.warn { color:#c05621; }
        .primary { padding:11px; background:#1a1a1a; color:#fff; border:none; border-radius:8px; font-size:0.88rem; font-weight:600; font-family:inherit; cursor:pointer; }
        .primary:hover { background:#333; }
        .ghost { padding:8px 14px; background:#fff; color:#555; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.8rem; font-family:inherit; cursor:pointer; }
        .ghost:hover { border-color:#bbb; }
        .ghost.sm { padding:6px 10px; font-size:0.74rem; }
        .wide { width:100%; margin-top:14px; }
        button:disabled { opacity:0.5; cursor:not-allowed; }
        .err { background:#fff5f5; color:#c53030; font-size:0.8rem; padding:11px 14px; border-radius:8px; margin-bottom:14px; }
        code { background:#f2f2f2; padding:1px 5px; border-radius:4px; font-size:0.92em; }
      `}</style>
      <SiteHeader active="/account" />
      <div className="wrap">{children}</div>
    </main>
  );
}
