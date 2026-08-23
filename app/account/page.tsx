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
//
//  🔴닉네임도 여기서 고친다(2026-08-23). 저장소는 profiles.display_name —
//    archiMap이 진작부터 읽고 쓰던 **바로 그 칸**이라, 여기서 바꾸면 archiMap ·
//    Colorgram 에 그대로 따라간다. 새 칸을 만들면 이름이 두 개로 갈라진다.
//    ⚠️쓰기는 set_display_name RPC 한 곳으로만 한다(supabase/migrations/006) —
//      길이·공백 규칙이 화면마다 따로 있으면 프로그램별로 다른 이름이 들어온다.
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
    none: "미구독",
    subscribeBtn: "구독하기",
    // ── 닉네임(계정 하나에 하나, 모든 프로그램 공용) ──
    nickTitle: "닉네임",
    nickEdit: "수정", nickSave: "저장", nickCancel: "취소",
    nickNone: "아직 없음",
    // 🔴글자 종류는 안 막는다 — 한글·한자·가나·키릴·아랍 문자·이모지 다 된다.
    //   ⚠️평소엔 규칙을 미리 늘어놓지 않는다(사용자 지시). 걸렸을 때만 말한다.
    nickLen: "2~20자로 지어 주세요.",
    nickBad: "쓸 수 없는 문자가 들어 있습니다. 다른 이름을 써 주세요.",
    nickFail: "닉네임을 바꾸지 못했습니다.",
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
    none: "Not subscribed",
    subscribeBtn: "Subscribe",
    // ── Nickname (one per account, shared by every program) ──
    nickTitle: "Nickname",
    nickEdit: "Edit", nickSave: "Save", nickCancel: "Cancel",
    nickNone: "Not set",
    nickLen: "Please use 2–20 characters.",
    nickBad: "That name contains characters we can't use. Please try another.",
    nickFail: "Couldn't change the nickname.",
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

  // 닉네임 — name은 저장된 값, draft는 고치는 중인 값.
  const [name, setName] = useState("");
  const [draft, setDraft] = useState<string | null>(null);   // null = 편집 중 아님
  const [nickErr, setNickErr] = useState("");

  // ==========================================================================
  //  [구독하기]가 갈 곳.
  //
  //  🔴미리보기로 들어온 화면(/account?preview=1)에서는 구독을 팔던 쪽으로 보낸다.
  //    지금 /price 는 건당결제라, 구독표를 보던 사람이 딴 상품에 떨어진다
  //    (components/SiteHeader 와 같은 판정 — 한쪽만 고치면 화면 안에서 길이 갈린다).
  //  ⚠️링크가 아니라 버튼인 이유 — ?preview 는 브라우저만 아는 값이라 서버가 그린
  //    첫 그림에는 없다. href 에 넣으면 붙기 전후로 주소가 달라진다(hydration).
  //    누를 때 정하면 그런 일이 없다.
  // ==========================================================================
  const toPrice = () => {
    const preview = new URLSearchParams(window.location.search).has("preview");
    window.location.href = preview ? "/main#pricing" : "/price";
  };

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) { window.location.href = `/login?next=${encodeURIComponent("/account")}`; return; }
    setEmail(u.user.email ?? "");

    const [{ data: p }, { data: rows }, { data: prof }] = await Promise.all([
      sb.rpc("my_plan", { p_product: PRODUCT }),
      sb.from("subscriptions").select("*"),
      sb.from("profiles").select("display_name").eq("id", u.user.id).maybeSingle(),
    ]);
    setPlan(typeof p === "string" ? p : "free");
    setSubs((rows ?? []) as Sub[]);
    setName(prof?.display_name ?? "");
    setReady(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const token = async () => (await supabase().auth.getSession()).data.session?.access_token ?? "";


  // ==========================================================================
  //  닉네임 저장 — 규칙의 원본은 서버(set_display_name)다.
  //
  //  🔴여기서도 같은 규칙으로 한 번 걸러 준다. 서버만 믿으면 화면에는
  //    "닉네임을 바꾸지 못했습니다"라는 말만 뜨고 **왜 안 되는지**가 안 나온다.
  //  🔴돌려받은 값을 그대로 쓴다 — 공백을 서버가 다듬으므로, 내가 보낸 값을
  //    화면에 쓰면 저장된 이름과 보이는 이름이 어긋난다.
  // ==========================================================================
  const saveNick = async () => {
    const v = (draft ?? "").trim().replace(/\s+/g, " ");
    // 🔴폭 없는 문자만으로 지은 이름은 길이는 차지만 화면에는 빈 줄로 선다.
    //   서버(set_display_name)도 같은 것을 막는다 — 여기서 먼저 걸러 말을 해 준다.
    const visible = v.replace(/[\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff]/g, "").trim();
    // 🔴글자 수는 Array.from 으로 센다 — 서버(char_length)와 세는 단위를 맞춘다.
    //   "🙂".length 는 2라, 그대로 세면 이모지 이름만 절반에서 잘린다.
    const len = Array.from(v).length;
    if (len < 2 || len > 20) { setNickErr(x.nickLen); return; }
    if (visible === "") { setNickErr(x.nickBad); return; }
    if (v === name) { setDraft(null); setNickErr(""); return; }
    setBusy("nick"); setNickErr("");
    const { data, error: e } = await supabase().rpc("set_display_name", { p_name: v });
    setBusy("");
    // 🔴서버가 왜 거절했는지 그대로 옮긴다. "바꾸지 못했습니다"만 뜨면 사람은
    //   같은 이름을 몇 번이고 다시 넣어 본다.
    if (e) {
      const m = e.message ?? "";
      setNickErr(/visible|control/.test(m) ? x.nickBad
               : /2\.\.20/.test(m)       ? x.nickLen
               : x.nickFail);
      return;
    }
    setName(typeof data === "string" ? data : v);
    setDraft(null);
  };

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

      {/* ── 닉네임 — 계정 하나에 하나. 구독보다 위에 둔다(구독이 없어도 있는 것이라).
             🔴여기서 바꾼 이름이 archiMap · Colorgram 에 그대로 간다. */}
      <section className="card">
        <div className="nick-row">
          <div className="nick-l">
            <div className="nick-k">{x.nickTitle}</div>
            {draft === null ? (
              <div className="nick-v">{name || x.nickNone}</div>
            ) : (
              <input
                className="nick-in"
                autoFocus
                value={draft}
                maxLength={20}
                placeholder={x.nickTitle}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveNick();
                  if (e.key === "Escape") { setDraft(null); setNickErr(""); }
                }}
              />
            )}
          </div>

          {draft === null ? (
            <button className="ghost sm" onClick={() => { setDraft(name); setNickErr(""); }}>
              {x.nickEdit}
            </button>
          ) : (
            <div className="nick-btns">
              <button className="ghost sm" disabled={busy === "nick"}
                      onClick={() => { setDraft(null); setNickErr(""); }}>
                {x.nickCancel}
              </button>
              <button className="dark sm" disabled={busy === "nick"} onClick={saveNick}>
                {busy === "nick" ? x.working : x.nickSave}
              </button>
            </div>
          )}
        </div>

        {/* 🔴아무 말도 미리 붙이지 않는다 — 걸렸을 때 그 까닭만 말한다 */}
        {nickErr && <p className="note warn">{nickErr}</p>}
      </section>

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

        {/* 🔴여기 있던 [요금제 보러 가기 →]는 걷어냈다(2026-08-23) — 아래
            [구독하기]와 같은 곳으로 가는 링크가 두 개였다. 구독을 시작하는
            문은 화면에 하나만 둔다. */}

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
          🔴이 자리는 비워 두지 않는다. 해지할 구독이 없으면 대신 [구독하기]가
            선다(2026-08-23) — 예전엔 흐린 [구독 해지]가 그대로 있었는데,
            구독이 없는 사람에게는 누를 수 없는 버튼 하나가 전부였다.
            ⚠️해지·탈퇴와 나란히 서지만 [구독하기]만 붉다. 되돌릴 수 없는 두
              동작이 회색이고 시작하는 동작이 붉은 것이 뒤집힌 것처럼 보여도,
              여기서 색은 위험이 아니라 **지금 할 수 있는 일**을 가리킨다. */}
      <div className="danger-zone">
        {cancelable ? (
          <button className="link-danger" disabled={busy === PRODUCT}
                  onClick={() => cancel(PRODUCT)}>
            {busy === PRODUCT ? x.working : x.cancelBtn}
          </button>
        ) : (
          <button className="link-danger go" onClick={toPrice}>{x.subscribeBtn}</button>
        )}
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
        /* 🔴[구독하기]만 처음부터 붉다 — 회색 두 개 사이에서 유일하게 '하는' 동작이다 */
        .link-danger.go { color:#c53030; font-weight:700; }
        .link-danger.go:hover { color:#9b2c2c; }
        .nick-row { display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .nick-l { min-width:0; flex:1; }
        .nick-k { font-size:0.7rem; font-weight:700; color:#999; letter-spacing:0.02em; }
        .nick-v { font-size:1rem; font-weight:700; margin-top:5px; word-break:break-all; }
        .nick-in { width:100%; max-width:280px; margin-top:4px; padding:7px 10px;
                   border:1.5px solid #e0e0e0; border-radius:8px; background:#fff;
                   font-family:inherit; font-size:0.95rem; font-weight:700; color:#1a1a1a; }
        .nick-in:focus { outline:none; border-color:#1a1a1a; }
        .nick-btns { display:flex; gap:6px; flex-shrink:0; }
        .dark { padding:8px 14px; background:#1a1a1a; color:#fff; border:1.5px solid #1a1a1a;
                border-radius:8px; font-size:0.8rem; font-weight:600; font-family:inherit; cursor:pointer; }
        .dark:hover { background:#333; }
        .dark.sm { padding:6px 12px; font-size:0.74rem; }
        .err { background:#fff5f5; color:#c53030; font-size:0.8rem; padding:11px 14px; border-radius:8px; margin-bottom:14px; }
        code { background:#f2f2f2; padding:1px 5px; border-radius:4px; font-size:0.92em; }
      `}</style>
      <SiteHeader active="/account" />
      <div className="wrap">{children}</div>
    </main>
  );
}
