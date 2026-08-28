"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import PlanTable, { PLAN_CSS } from "@/components/PlanTable";
import DarkTopBar, { DARK_TOPBAR_CSS, type DarkLink } from "@/components/DarkTopBar";
import { LASERFISH_DOWNLOAD } from "@/lib/products";

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

// 어두운 상단 막대에 걸 링크 — 이 화면에서 갈 만한 곳들.
// 🔴[다운로드]는 **밖으로 나간다**(2026-08-28) — 설치 안내의 정본이 LaserFish
//   소개 사이트로 옮겨 갔다. 나머지 둘은 MassLabs 안쪽 그대로다.
const ACCOUNT_LINKS: DarkLink[] = [
  { href: LASERFISH_DOWNLOAD, ko: "다운로드", en: "Download" },
  { href: "/howtouse", ko: "사용방법", en: "How to use" },
  { href: "/price", ko: "비용", en: "Pricing" },
];

// 🔴구독 상품은 하나뿐이다. 등급(plus/pro/max)이 모든 프로그램에 함께 적용된다.
const PRODUCT = "all";

// ==========================================================================
//  통화 표기 — 🔴기호만 쓴다(2026-08-26 결정).
//
//  이 화면은 **홈페이지에서 고른 언어**를 따른다. 한글 "원"을 붙이면 원화
//  구독자가 영어 화면에서 "12,000원"을 보게 된다. 기호는 어느 말에서도 읽힌다.
//
//  🔴금액에는 손대지 않는다 — 여기는 **실제로 청구된 금액**을 적는 자리다.
//    환산하지 않고, 자릿수 처리도 통화마다 그대로 둔다(KRW는 정수 원 단위,
//    USD는 센트 단위로 저장돼 있어 나누는 방식이 다르다).
//  🔴이 함수는 app/subscribe/page.tsx 에도 **똑같은 것**이 복제돼 있다.
//    한쪽만 고치면 /account 와 /subscribe 가 다른 말을 한다 — 반드시 함께 고칠 것.
// ==========================================================================
const money = (n: number, cur: string) =>
  cur === "KRW" ? `₩${n.toLocaleString()}` : `$${(n / 100).toFixed(2)}`;
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
    // ── 비밀번호 — 여기는 길만 낸다. 바꾸는 자리는 /account/security 다.
    //   🔴"변경"이라고만 쓰지 않는다. [로그아웃] 옆에 홀로 서는 버튼이라,
    //     무엇을 변경하는지 붙어 있지 않으면 그 자리에서는 알 길이 없다.
    pwChange: "비밀번호 변경",
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
    // ── Password — this screen only links out; /account/security does the work ──
    pwChange: "Change password",
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

  // [구독하기]가 갈 곳. 🔴2026-08-28 이전에는 ?preview=1 로 들어온 사람을 /main
  //   (구독을 팔던 시절의 홈, PG 심사용)으로 돌려보냈다. /main 을 지우면서 없앴다.
  const toPrice = () => { window.location.href = "/price"; };

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
        {/* 🔴두 버튼은 **같은 .ghost** 다 — 나란히 서니 크기·테두리가 조금만
               달라도 바로 티가 난다. 새 규칙을 만들지 말 것.
            ⚠️줄은 .nick-btns 로 묶는다(display:flex; gap; flex-shrink:0) —
              버튼 두 개를 붙여 세우는 규칙이 이미 있는데 또 만들 이유가 없다.
            ⚠️눌러 들어가는 곳은 /account/security 한 곳뿐이다. 중간에 묻는
              창을 끼우지 않는다 — 비밀번호 변경은 되돌릴 수 없는 일이 아니다. */}
        <div className="nick-btns">
          <Link className="ghost" href="/account/security">{x.pwChange}</Link>
          <button className="ghost" onClick={async () => {
            await supabase().auth.signOut();
            window.location.href = "/";
          }}>{x.logout}</button>
        </div>
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
    <main className="acc">
      {/* ==================================================================
          🔴2026-08-27 어두운 화면으로 갈아입혔다 — 홈·로그인과 같은 결이다.
            값 이름도 저쪽과 맞춰 뒀다(--bg/--card/--acc …).
            ⚠️값을 또 한 벌 적는 셈이다. 홈(components/LandingView)의 --acc 를
              바꾸면 여기와 components/AuthCard 도 함께 바꿀 것.

          🔴PLAN_CSS 는 밝은 화면용이라 흰 칸·검은 글자가 박혀 있다. 저 파일을
            어둡게 고치면 /price 가 같이 깨진다 — 그래서 **여기서만** 뒤에
            덮어쓴다. 순서가 전부다: PLAN_CSS 뒤에.
      ================================================================== */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .acc {
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
        .acc ::selection { background: var(--acc); color: var(--accx); }
        ${DARK_TOPBAR_CSS}

        .wrap { max-width: 960px; margin: 0 auto; padding: 96px 20px 56px; }
        /* 🔴wrap — 오른쪽에 버튼이 둘이라 좁은 화면에서는 접혀 내려가야 한다.
             안 접으면 긴 메일 주소와 맞물려 화면 밖으로 삐져나간다. */
        .hd { display:flex; flex-wrap:wrap; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:22px; }
        .ttl { font-size:1.6rem; font-weight:800; letter-spacing:-0.035em; }
        .sub { font-size:0.78rem; color:var(--mut); margin-top:5px; }
        .dim { font-size:0.86rem; color:var(--mut); }
        .card { background:var(--card); border:1px solid var(--line); border-radius:var(--r); padding:22px; margin-bottom:14px; }
        .row { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:14px; }
        .badge-row { display:flex; justify-content:flex-end; margin-bottom:14px; }
        .pname { font-size:1rem; font-weight:700; }
        .pdesc { font-size:0.77rem; color:var(--mut); margin-top:4px; line-height:1.6; }
        .badge { font-family:var(--mono); font-size:0.62rem; letter-spacing:0.14em; text-transform:uppercase;
                 font-weight:600; padding:5px 10px; border-radius:var(--r);
                 background:var(--bg2); border:1px solid var(--line); color:var(--dim); white-space:nowrap; }
        .badge.on { border-color:var(--acc); color:var(--acc); }
        .ln { display:flex; justify-content:space-between; gap:12px; padding:10px 0; border-top:1px solid var(--line); font-size:0.81rem; }
        .ln span:first-child { color:var(--mut); }
        .plan-here { padding-top:16px; border-top:1px solid var(--line); }
        ${PLAN_CSS}
        /* ── 여기부터 PLAN_CSS 를 어둡게 덮는다(위 주석 참고) ── */
        .pg-tier { background:var(--bg2); border:1px solid var(--line); color:var(--tx); }
        .pg-tier .cur { color:var(--dim); }
        .pg-prog, .pg-cell, .pg-price { background:var(--bg2); border-color:var(--line); }
        .pg-prog-name { color:var(--tx); }
        .pg-cell.off { background:transparent; }
        .pg-off-mark { color:var(--dim); }
        .pg-line span { color:var(--dim); }
        .pg-line b { color:var(--tx); }
        .pg-amt { color:var(--acc); }
        .pg-per { color:var(--mut); }
        .pg-cta button, .pg-cta a { background:var(--acc); color:var(--accx); border-radius:var(--r); }
        .pg-cta button:hover, .pg-cta a:hover { background:var(--acc); filter:brightness(1.08); }
        .pg-cta button:disabled { background:#2a2a2d; color:var(--dim); }
        .pg-cta .using { color:var(--acc); }
        .plan-fine { color:var(--dim); }

        .note { font-size:0.74rem; color:var(--dim); line-height:1.7; margin-top:8px; }
        .note.warn { color:var(--acc); }
        .primary { padding:12px; background:var(--acc); color:var(--accx); border:none; border-radius:var(--r);
                   font-size:0.86rem; font-weight:700; font-family:inherit; cursor:pointer;
                   transition:filter .18s, transform .18s; }
        .primary:hover:not(:disabled) { filter:brightness(1.08); transform:translateY(-2px); }
        /* ⚠️a(Link)도 이 클래스를 쓴다 — <a> 는 inline 이라 그대로 두면 padding 이
             줄 높이에 안 잡혀 옆의 <button> 보다 납작해진다. inline-flex 로 세운다. */
        .ghost { display:inline-flex; align-items:center; padding:8px 14px; background:var(--bg2); color:var(--mut);
                 border:1px solid var(--line); border-radius:var(--r); font-size:0.79rem; font-family:inherit;
                 line-height:1.2; text-decoration:none; white-space:nowrap; cursor:pointer;
                 transition:border-color .15s, color .15s; }
        .ghost:hover { border-color:var(--line2); color:var(--tx); }
        .ghost.sm { padding:6px 10px; font-size:0.73rem; }
        .wide { width:100%; margin-top:14px; }
        button:disabled { opacity:0.45; cursor:not-allowed; }
        .danger-zone { display:flex; justify-content:flex-end; align-items:center; gap:14px; padding:6px 2px 8px; }
        .link-danger { background:none; border:none; padding:4px 2px; font-family:inherit;
                       font-size:0.74rem; color:var(--dim); cursor:pointer; text-decoration:underline;
                       text-underline-offset:3px; transition:color .15s; }
        .link-danger:hover { color:#ff6f60; }
        /* 🔴[구독하기]만 처음부터 도드라진다 — 회색 두 개 사이에서 유일하게 '하는' 동작이다 */
        .link-danger.go { color:var(--acc); font-weight:700; }
        .link-danger.go:hover { color:var(--acc); filter:brightness(1.15); }
        .nick-row { display:flex; justify-content:space-between; align-items:center; gap:12px; }
        .nick-l { min-width:0; flex:1; }
        .nick-k { font-family:var(--mono); font-size:0.6rem; letter-spacing:0.2em; text-transform:uppercase; color:var(--dim); }
        .nick-v { font-size:1rem; font-weight:700; margin-top:6px; word-break:break-all; }
        .nick-in { width:100%; max-width:280px; margin-top:5px; padding:8px 10px;
                   border:1px solid var(--line); border-radius:var(--r); background:var(--bg2);
                   font-family:inherit; font-size:0.95rem; font-weight:700; color:var(--tx); }
        .nick-in:focus { outline:none; border-color:var(--acc); }
        .nick-btns { display:flex; gap:6px; flex-shrink:0; }
        .dark { padding:8px 14px; background:var(--acc); color:var(--accx); border:1px solid var(--acc);
                border-radius:var(--r); font-size:0.79rem; font-weight:700; font-family:inherit; cursor:pointer;
                transition:filter .15s; }
        .dark:hover { filter:brightness(1.08); }
        .dark.sm { padding:6px 12px; font-size:0.73rem; }
        .err { background:rgba(255,111,96,0.10); border:1px solid rgba(255,111,96,0.32); color:#ff8d80;
               font-size:0.79rem; padding:11px 14px; border-radius:var(--r); margin-bottom:14px; }
        code { background:var(--bg2); border:1px solid var(--line); padding:1px 5px; border-radius:var(--r); font-size:0.92em; }
      `}</style>

      {/* 🔴SiteHeader(밝은 막대) 대신 어두운 막대를 쓴다 — SiteHeader 는
           /price · /download 등 밝은 화면들이 함께 쓰므로 건드리지 않는다. */}
      <DarkTopBar links={ACCOUNT_LINKS} />
      <div className="wrap">{children}</div>
    </main>
  );
}
