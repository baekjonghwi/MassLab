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
    nextBilling: "다음 결제일", firstBilling: "첫 결제일", amount: "결제 금액",
    cancelBtn: "구독 해지", working: "처리 중…",
    endsOn: "이용 종료일",
    canceledNote: "해지되었습니다. 위 날짜까지는 그대로 사용하실 수 있습니다.",
    pastDue: "결제에 실패해 이용이 중지되었습니다. 다시 구독해 주세요.",
    adminNote: "운영자 권한으로 모든 프로그램을 이용 중입니다.",
    cancelFail: "해지에 실패했습니다.",
    // ── 회원 탈퇴 ──
    deleteBtn: "회원 탈퇴",
    deleting: "탈퇴 처리 중…",
    deleteFail: "탈퇴에 실패했습니다. 잠시 후 다시 시도해 주세요.",
    // 🔴두 번 묻는다. 되돌릴 수 없는 일이라 한 번은 부족하다.
    confirmDelete1: `회원 탈퇴를 하면 계정과 함께 아래가 모두 사라지며, 되돌릴 수 없습니다.

· 이용 등급과 남은 크레딧
· archiMap 에 저장한 스타일과 참고 이미지
· 연결해 둔 기기와 플러그인 로그인

이용 중인 구독이 있으면 즉시 끝나고, 남은 기간은 환불되지 않습니다.
계속하시겠습니까?`,
    confirmDelete2: "정말 탈퇴하시겠습니까? 이 창을 확인하면 계정이 바로 삭제됩니다.",
    // 🔴체험 중이면 "결제하신 기간"이라는 말이 거짓이 된다 — 낸 돈이 없다.
    confirmPaid: "구독을 해지하시겠습니까?\n이미 결제하신 기간까지는 그대로 사용하실 수 있습니다.",
  },
  en: {
    loading: "Loading…",
    title: "My subscription", logout: "Sign out",
    toPrice: "See the plans →",
    none: "Not subscribed",
    nextBilling: "Next billing date", firstBilling: "First billing date", amount: "Amount",
    cancelBtn: "Cancel subscription", working: "Working…",
    endsOn: "Access ends",
    canceledNote: "Canceled. You can keep using it until the date above.",
    pastDue: "Payment failed, so access is paused. Please subscribe again.",
    adminNote: "You have admin access to every program.",
    cancelFail: "Couldn't cancel the subscription.",
    // ── Close account ──
    deleteBtn: "Close account",
    deleting: "Closing…",
    deleteFail: "Couldn't close the account. Please try again in a moment.",
    confirmDelete1: `Closing your account permanently deletes it, along with:

· your plan and any remaining credits
· the styles and reference images saved in archiMap
· your linked devices and plugin sign-ins

Any running subscription ends immediately and the remaining time is not refunded.
Continue?`,
    confirmDelete2: "Are you sure? Confirming this deletes your account right away.",
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

  // ==========================================================================
  //  회원 탈퇴 — 되돌릴 수 없다.
  //
  //  🔴두 번 묻는다. 첫 창은 "무엇이 사라지는가", 둘째 창은 "정말인가".
  //  성공하면 서버에 계정이 없으므로 signOut 이 실패할 수 있다 — 그래도 무시하고
  //  홈으로 보낸다. 남은 건 이 브라우저의 죽은 쿠키뿐이다.
  // ==========================================================================
  const closeAccount = async () => {
    if (!confirm(x.confirmDelete1)) return;
    if (!confirm(x.confirmDelete2)) return;
    setBusy("account"); setError("");
    const r = await fetch("/api/account/delete", {
      method: "POST",
      headers: { Authorization: `Bearer ${await token()}` },
    });
    if (!r.ok) { setBusy(""); setError(x.deleteFail); return; }
    try { await supabase().auth.signOut(); } catch { /* 계정이 이미 없다 */ }
    window.location.href = "/";
  };

  if (!ready) return <Shell><p className="dim">{x.loading}</p></Shell>;

  const sub = subs.find((s) => s.product === PRODUCT);
  const entitled = plan !== "free";
  // 🔴체험 중(trialing)도 해지할 수 있어야 한다. active만 보면 체험자가 카드를
  //   등록해 두고 끊을 방법이 없어진다.
  const cancelable = sub?.status === "active" || sub?.status === "trialing";

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

        {cancelable && sub && (
          <>
            <Line
              k={sub.status === "trialing" ? x.firstBilling : x.nextBilling}
              v={day(sub.next_billing_at, isKo)}
            />
            <Line k={x.amount} v={money(sub.amount, sub.currency)} />
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

      {/* 🔴해지와 탈퇴를 같은 모양으로 한 줄에 둔다(2026-08-22 사용자 결정).
          ⚠️원래 코드는 일부러 떼어 놓았고 이유가 이랬다 — "나란히 두면 둘을
            헷갈려 누른다. 하나는 되돌릴 수 있고 하나는 아니다."
            생김새까지 같아졌으니 **오조작을 막는 것은 이제 확인 창뿐이다.**
            해지는 한 번, 탈퇴는 두 번 묻는다(closeAccount 참고) — 그 차이를
            줄이지 말 것.
          🔴[구독 해지]는 구독이 없어도 자리를 지킨다(비활성). 버튼째 사라지면
            "해지할 방법이 없는 화면"으로 보인다. */}
      <div className="danger-zone">
        <button className="link-danger" disabled={!cancelable || busy === PRODUCT}
                onClick={() => cancel(PRODUCT)}>
          {busy === PRODUCT ? x.working : x.cancelBtn}
        </button>
        <button className="link-danger" disabled={busy === "account"} onClick={closeAccount}>
          {busy === "account" ? x.deleting : x.deleteBtn}
        </button>
      </div>
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
        .danger-zone { display:flex; justify-content:flex-end; align-items:center; gap:14px; padding:4px 2px 8px; }
        .link-danger { background:none; border:none; padding:4px 2px; font-family:inherit;
                       font-size:0.75rem; color:#a0a0a0; cursor:pointer; text-decoration:underline;
                       text-underline-offset:3px; }
        .link-danger:hover { color:#c53030; }
        .err { background:#fff5f5; color:#c53030; font-size:0.8rem; padding:11px 14px; border-radius:8px; margin-bottom:14px; }
        code { background:#f2f2f2; padding:1px 5px; border-radius:4px; font-size:0.92em; }
      `}</style>
      <SiteHeader active="/account" />
      <div className="wrap">{children}</div>
    </main>
  );
}
