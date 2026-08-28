"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { passwordErrorKind } from "@/lib/auth-errors";
import SiteHeader from "@/components/SiteHeader";
import { PwEyeIcon } from "@/components/AuthCard";

// ==========================================================================
//  /account/security — 로그인한 사람이 제 비밀번호를 바꾸는 자리.
//
//  🔴/account 가 아니라 그 아래 주소여야 한다. 구독을 안 파는 동안
//    next.config.ts 가 /account 를 홈으로 돌려보내는데(307), 그 규칙의
//    source 는 "/account" **정확히 그 경로만** 잡는다 — /account/security 는
//    안 걸린다. 비밀번호는 구독과 아무 상관이 없으니 지금도 열려 있어야 맞다.
//    ⛔이 화면 때문에 next.config.ts · lib/interim.ts 를 건드리지 말 것.
//
//  🔴updateUser 는 옛 비밀번호를 묻지 않는다 — Supabase 의 비밀번호 변경은
//    **세션이 곧 신분증**이라 옛 비밀번호를 받을 자리가 없다. 그래서 이 화면이
//    먼저 signInWithPassword 로 **재인증**한 뒤에야 updateUser 를 부른다
//    (자리를 뜬 사이 남의 손이 비밀번호를 갈아치우는 것을 막는다).
//    ✅틀려도 로그아웃되지 않는다 — node_modules/@supabase/auth-js/dist/main/
//      GoTrueClient.js 의 signInWithPassword 는 오류면 _saveSession 을 부르지 않고
//      곧장 반환한다. 지금 세션은 그대로 있고, 성공하면 같은 사람의 새 세션이 된다.
//    (프로젝트 설정에서 secure password change 를 켜면 서버가 최근 로그인을
//     요구하고, 그때는 reauthentication 오류로 떨어진다 — 아래 x.reauth.)
//
//  🔴폼은 처음부터 열려 있다. /account 에서 [비밀번호 변경]을 눌러 온 사람에게
//    카드 안에서 한 번 더 [변경]을 누르게 하면 같은 말을 두 번 시키는 것이다.
//
//  ⚠️생김새는 /account 의 "닉네임" 카드를 그대로 본떴다. 클래스 이름·값도
//    같은 것을 쓴다 — 두 화면이 나란히 서는 자리라 여기서만 다른 상자를
//    쓰면 딴 사이트처럼 보인다. 상자 모양을 고칠 일이 생기면 두 파일을 함께
//    고칠 것(언젠가 공용 Shell 로 뽑는 게 맞다).
// ==========================================================================

const TX = {
  ko: {
    loading: "불러오는 중…",
    // 🔴구글로만 가입한 사람에게는 "변경"이 거짓말이다 — 바꿀 옛 비밀번호가 없다.
    titleChange: "비밀번호 변경",
    titleSet: "비밀번호 설정",
    leadSet: "지금은 구글 로그인만 쓸 수 있습니다. 비밀번호를 정하면 메일 주소로도 들어올 수 있습니다.",
    btnChange: "변경", btnSet: "설정",
    cancel: "취소", working: "처리 중…",
    pwCur: "현재 비밀번호",
    pwNew: "새 비밀번호", pwFirst: "비밀번호",
    pwAgain: "한 번 더 입력",
    showPw: "비밀번호 보기", hidePw: "비밀번호 가리기",
    // 🔴어느 칸이 틀렸는지 못 박는다 — "실패했습니다"면 사람은 새 비밀번호를 의심한다.
    curPwWrong: "현재 비밀번호가 올바르지 않습니다.",
    tooMany: "현재 비밀번호를 여러 번 틀렸습니다. {n}초 뒤에 다시 시도해 주세요.",
    mismatch: "두 칸이 서로 다릅니다. 같게 입력해 주세요.",
    shortPw: "비밀번호는 6자 이상이어야 합니다.",
    samePw: "지금 쓰는 것과 다른 비밀번호로 정해 주세요.",
    weakPw: "너무 쉬운 비밀번호입니다. 다른 것으로 정해 주세요.",
    reauth: "안전을 위해 다시 로그인한 뒤에 바꿀 수 있습니다.",
    expired: "로그인이 만료됐습니다. 다시 로그인해 주세요.",
    failed: "비밀번호를 바꾸지 못했습니다. 잠시 후 다시 시도해 주세요.",
    // 🔴조용히 끝내지 않는다 — 무엇이 어떻게 달라졌는지 주소까지 넣어 말한다.
    doneChange: "비밀번호를 바꿨습니다. 다음 로그인부터 {email} 과 새 비밀번호를 쓰세요.",
    doneSet: "비밀번호를 정했습니다. 이제 구글 로그인 말고도 {email} 과 이 비밀번호로 들어올 수 있습니다.",
    relogin: "다시 로그인하기",
  },
  en: {
    loading: "Loading…",
    titleChange: "Change password",
    titleSet: "Set a password",
    leadSet: "Right now you can only sign in with Google. Set a password and you can sign in with your email address too.",
    btnChange: "Change", btnSet: "Set",
    cancel: "Cancel", working: "Working…",
    pwCur: "Current password",
    pwNew: "New password", pwFirst: "Password",
    pwAgain: "Enter it again",
    showPw: "Show password", hidePw: "Hide password",
    curPwWrong: "That current password isn't right.",
    tooMany: "That current password was wrong too many times. Try again in {n}s.",
    mismatch: "The two boxes don't match. Please type the same password twice.",
    shortPw: "Password must be at least 6 characters.",
    samePw: "Please choose a password different from your current one.",
    weakPw: "That password is too easy to guess. Please choose another.",
    reauth: "For safety, please sign in again before changing your password.",
    expired: "Your sign-in has expired. Please sign in again.",
    failed: "Couldn't change the password. Please try again in a moment.",
    doneChange: "Your password has been changed. From your next sign-in, use {email} and the new password.",
    doneSet: "Your password is set. You can now sign in with {email} and this password, as well as with Google.",
    relogin: "Sign in again",
  },
} as const;

// ==========================================================================
//  비밀번호 칸 — 오른쪽 눈 버튼으로 가린 글자를 잠깐 볼 수 있다.
//
//  ⚠️로그인 화면(components/AuthCard 의 PasswordField)과 **같은 짓을 하지만 같은
//    물건은 아니다** — 저쪽은 .fld, 여기는 .nick-in 이라 칸 모양이 다르다.
//    한 벌로 묶으려면 두 화면의 칸 CSS 를 먼저 합쳐야 한다(카드 껍데기부터).
//  🔴보이기/가리기는 칸마다 따로 논다. 세 칸을 한 스위치로 묶으면 "한 번 더 입력"을
//    눈으로 맞춰 보려고 열었을 때 현재 비밀번호까지 같이 드러난다.
// ==========================================================================
function PwBox({
  id, value, onChange, autoComplete, showLabel, hideLabel, minLength, autoFocus,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  showLabel: string;
  hideLabel: string;
  minLength?: number;
  autoFocus?: boolean;
}) {
  const [shown, setShown] = useState(false);
  return (
    <div className="pw-wrap">
      <input
        id={id} className="nick-in" type={shown ? "text" : "password"} value={value}
        required minLength={minLength} autoFocus={autoFocus} autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button" className="pw-eye" onClick={() => setShown(!shown)}
        aria-label={shown ? hideLabel : showLabel} title={shown ? hideLabel : showLabel}
      >
        <PwEyeIcon shown={shown} />
      </button>
    </div>
  );
}

const HERE = "/account/security";

export default function SecurityPage() {
  const { lang } = useLanguage();
  const x = lang === "ko" ? TX.ko : TX.en;

  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  // hasPw = 이 계정에 비밀번호가 있는가(= 메일+비밀번호로도 들어올 수 있는가).
  const [hasPw, setHasPw] = useState(true);

  const [curPw, setCurPw] = useState("");        // 재인증용 — 비밀번호가 있는 사람만 쓴다
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [pwErr, setPwErr] = useState("");
  const [done, setDone] = useState("");
  const [relogin, setRelogin] = useState(false); // 다시 로그인해야 풀리는 오류인가

  // ==========================================================================
  //  ⚠️현재 비밀번호를 계속 틀리면 Supabase 가 잠시 요청을 막는다(429). 그때
  //    나오는 말은 "실패했습니다"뿐이라, 사람은 까닭을 모른 채 계속 눌러 댄다.
  //    그래서 화면이 먼저 손을 멈춘다 — 다섯 번 틀리면 30초 동안 잠근다.
  //    (서버가 먼저 429 로 막았을 때도 같은 잠금으로 받는다.)
  // ==========================================================================
  const [wrong, setWrong] = useState(0);         // 연달아 틀린 횟수
  const [cool, setCool] = useState(0);           // 남은 잠금 시간(초)
  useEffect(() => {
    if (cool <= 0) return;
    const t = setTimeout(() => setCool((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [cool]);

  // ==========================================================================
  //  로그인 확인 — /account 와 같은 방식이다(getUser 로 묻고, 없으면 /login).
  //
  //  🔴로그인 안 한 사람에게 폼을 보여 주면 안 된다. 눌러도 아무 일이 안 일어나고
  //    왜 안 되는지도 안 보인다. ?next 로 돌려보낼 곳을 들려 보낸다.
  // ==========================================================================
  const load = useCallback(async () => {
    const { data: u } = await supabase().auth.getUser();
    if (!u.user) { window.location.href = `/login?next=${encodeURIComponent(HERE)}`; return; }
    setEmail(u.user.email ?? "");

    // ======================================================================
    //  🔴구글로만 가입한 사람은 비밀번호가 아예 없다 — 그 사람에게 "변경"은
    //    바꿀 것이 없는 말이다. 그래서 제목·버튼이 "설정"으로 갈린다.
    //
    //  판정 근거 = user.identities. 이 배열은 **계정에 붙어 있는 로그인 수단**의
    //  목록이다(구글로 들어오면 provider:"google", 메일+비밀번호로 가입하면
    //  provider:"email"). 그러므로 email 항목이 하나도 없으면 비밀번호가 없다.
    //  ⚠️같은 배열을 app/login/page.tsx 도 쓴다(거기선 길이 0 = 이미 가입된 메일).
    //  ⚠️identities 가 아예 안 실려 오면(옛 세션·응답 축약) 판정을 포기하고
    //    "있다"로 본다 — 흔한 쪽으로 틀리는 게 낫다. 틀려도 문구만 어긋나고,
    //    updateUser 는 어느 쪽이든 똑같이 동작한다.
    // ======================================================================
    const ids = u.user.identities;
    setHasPw(ids === undefined ? true : ids.some((i) => i.provider === "email"));
    setReady(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  // ==========================================================================
  //  [취소] — 폼을 닫을 자리가 없어졌으니(폼이 곧 이 화면이다) 왔던 곳으로 돌아간다.
  //
  //  🔴href="/account" 를 박지 않는다. 뒤로 가기면 **방금 있던 그 화면** 그대로
  //    돌아간다. 히스토리가 없을 때만(주소를 직접 치고 들어온 경우) /account 로 보낸다.
  // ==========================================================================
  const back = () => {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/account";
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cool > 0) return;               // 잠긴 동안에는 아무 일도 하지 않는다
    // 🔴먼저 길이, 그다음 일치. 둘 다 어긋났을 때 "6자 이상"이 더 쓸모 있는
    //   말이다(짧은 걸 고치면 다시 칠 테니까).
    if (pw.length < 6) { setPwErr(x.shortPw); return; }
    if (pw !== pw2) { setPwErr(x.mismatch); return; }

    const wasSet = hasPw;               // 성공 문구가 갈리는 기준을 미리 잡아 둔다
    setBusy(true); setPwErr(""); setRelogin(false); setDone("");

    // ======================================================================
    //  🔴재인증 — 현재 비밀번호가 맞아야만 다음 줄로 간다.
    //    ⚠️비밀번호가 없는 사람(구글 전용)은 댈 것이 없으므로 건너뛴다.
    // ======================================================================
    if (hasPw) {
      const { error: reauthErr } =
        await supabase().auth.signInWithPassword({ email, password: curPw });
      if (reauthErr) {
        // 🔴원문(영어 한 줄)은 화면에 흘리지 않는다 — 콘솔에만 남긴다.
        console.error("[security] reauth failed", reauthErr);
        setBusy(false);
        const status = (reauthErr as { status?: number }).status;
        const kind = passwordErrorKind(reauthErr);
        // ⚠️잠금 문구는 pwErr 에 담지 않는다 — 초가 줄어드는 말이라 화면이 cool
        //   을 보고 직접 짓는다(아래 렌더). 여기서는 남은 말만 지운다.
        if (status === 429) {           // 서버가 먼저 막았다 — 화면도 같이 멈춘다
          setWrong(0); setCool(30); setPwErr("");
        } else if (kind === "expired") {
          setPwErr(x.expired); setRelogin(true);
        } else {
          const n = wrong + 1;
          setWrong(n >= 5 ? 0 : n);
          if (n >= 5) { setCool(30); setPwErr(""); }
          else setPwErr(x.curPwWrong);
        }
        return;
      }
      setWrong(0);                      // 맞았다 — 세어 둔 것을 지운다
    }

    const { error } = await supabase().auth.updateUser({ password: pw });
    setBusy(false);

    if (error) {
      // 🔴왜 거절됐는지 그대로 옮긴다. "실패했습니다"만 뜨면 사람은 같은 비밀번호를
      //   몇 번이고 다시 넣어 본다(판정은 lib/auth-errors.ts 한 곳에 있다).
      const kind = passwordErrorKind(error);
      setPwErr(kind === "samePw"  ? x.samePw
             : kind === "shortPw" ? x.shortPw
             : kind === "weakPw"  ? x.weakPw
             : kind === "reauth"  ? x.reauth
             : kind === "expired" ? x.expired
             : x.failed);
      setRelogin(kind === "reauth" || kind === "expired");
      return;
    }

    // 🔴이제 이 계정에는 비밀번호가 있다 — 다음 번에는 현재 비밀번호 칸이 뜨고
    //   재인증도 걸린다(구글 전용이던 사람이 방금 비밀번호를 얹은 경우).
    //   (서버가 email identity 를 언제 붙여 주는지는 판마다 다르다. 화면은
    //    방금 한 일을 믿는다.)
    setHasPw(true);
    // 폼은 그대로 두고 칸만 비운다 — 닫을 곳이 없다(폼이 곧 이 화면이다).
    setCurPw(""); setPw(""); setPw2(""); setPwErr("");
    setDone((wasSet ? x.doneChange : x.doneSet).replace("{email}", email));
  };

  if (!ready) return <Shell><p className="dim">{x.loading}</p></Shell>;

  const title = hasPw ? x.titleChange : x.titleSet;
  const actionLabel = hasPw ? x.btnChange : x.btnSet;
  const locked = cool > 0;

  return (
    <Shell>
      <div className="hd">
        <div>
          <h1 className="ttl">{title}</h1>
          <p className="sub">{email}</p>
        </div>
      </div>

      {/* 🔴성공은 폼 위에 크게 남긴다 — 칸이 비워지고 나면 이 줄이 유일한 증거다 */}
      {done && <div className="ok">{done}</div>}

      <section className="card">
        <form className="pw-form" onSubmit={submit}>
          {/* 🔴비밀번호가 없는 사람에게는 왜 현재 비밀번호 칸이 없는지를 설명하는
              유일한 안내다. 비밀번호가 있는 사람에게는 붙일 말이 없다 — 제목이
              이미 "비밀번호 변경"이다. */}
          {!hasPw && <p className="note">{x.leadSet}</p>}

          {/* 🔴숨은 아이디 칸 — 비밀번호 관리자에게 "어느 계정의 비밀번호인가"를
              알려 준다. 없으면 저장 제안이 엉뚱한 계정에 붙거나 아예 안 뜬다. */}
          <input type="text" name="username" autoComplete="username"
                 value={email} readOnly hidden />

          {/* ⚠️구글로만 가입한 사람에게는 그리지 않는다 — 댈 것이 없다 */}
          {hasPw && (
            <>
              <label className="nick-k" htmlFor="pw0">{x.pwCur}</label>
              <PwBox id="pw0" value={curPw} onChange={setCurPw}
                     autoFocus autoComplete="current-password"
                     showLabel={x.showPw} hideLabel={x.hidePw} />
            </>
          )}

          <label className="nick-k" htmlFor="pw1">{hasPw ? x.pwNew : x.pwFirst}</label>
          <PwBox id="pw1" value={pw} onChange={setPw} minLength={6}
                 autoFocus={!hasPw} autoComplete="new-password"
                 showLabel={x.showPw} hideLabel={x.hidePw} />

          <label className="nick-k" htmlFor="pw2">{x.pwAgain}</label>
          <PwBox id="pw2" value={pw2} onChange={setPw2} minLength={6}
                 autoComplete="new-password"
                 showLabel={x.showPw} hideLabel={x.hidePw} />

          <div className="nick-btns pw-btns">
            <button className="ghost sm" type="button" disabled={busy} onClick={back}>
              {x.cancel}
            </button>
            <button className="dark sm" type="submit" disabled={busy || locked}>
              {busy ? x.working : actionLabel}
            </button>
          </div>
        </form>

        {/* 🔴아무 말도 미리 붙이지 않는다 — 걸렸을 때 그 까닭만 말한다.
            잠긴 동안에는 남은 초를 세어 보여 준다(그래야 언제 다시 눌러야 할지 안다). */}
        {locked
          ? <p className="note warn">{x.tooMany.replace("{n}", String(cool))}</p>
          : pwErr && <p className="note warn">{pwErr}</p>}
        {/* 다시 로그인해야 풀리는 오류에는 갈 길을 함께 준다 */}
        {relogin && (
          <p className="note">
            <a href={`/login?next=${encodeURIComponent(HERE)}`} className="relink">{x.relogin}</a>
          </p>
        )}
      </section>
    </Shell>
  );
}

// ==========================================================================
//  ⚠️/account 의 Shell 과 같은 상자다(app/account/page.tsx 아래쪽).
//    클래스 이름과 값을 일부러 그대로 옮겼다 — 두 화면이 오가는 자리라
//    한쪽만 다른 모양이면 딴 사이트로 보인다. 구독표(PLAN_CSS)와 이 화면이
//    안 쓰는 규칙만 덜어 냈다.
//    🔴상자 모양을 고칠 일이 생기면 **두 파일을 함께** 고칠 것.
// ==========================================================================
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
        .note { font-size:0.75rem; color:#999; line-height:1.6; margin-top:8px; }
        .note.warn { color:#c05621; }
        /* ⚠️/account 의 .ghost 와 한 벌이다(app/account/page.tsx) — 두 화면이 오가는
             자리라 값이 어긋나면 버튼이 딴 모양으로 보인다. 한쪽만 고치지 말 것.
             inline-flex·line-height·text-decoration 은 저쪽에서 <Link>(=<a>)를
             버튼과 같은 높이로 세우려고 넣은 값이다. 여기는 <button>뿐이라
             당장 필요하진 않지만, 두 표를 같은 값으로 두는 편이 안전하다. */
        .ghost { display:inline-flex; align-items:center; padding:8px 14px; background:#fff; color:#555; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.8rem; font-family:inherit; line-height:1.2; text-decoration:none; white-space:nowrap; cursor:pointer; }
        .ghost:hover { border-color:#bbb; }
        .ghost.sm { padding:6px 10px; font-size:0.74rem; }
        button:disabled { opacity:0.5; cursor:not-allowed; }
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
        /* ── 이 화면에만 있는 세 줄. 값은 위 규칙들에서 그대로 가져왔다 ──
             ⚠️폼이 카드의 첫 줄이 된 뒤로 윗선(border-top)을 뺐다 — 위에 아무것도
               없는데 선만 그으면 무언가 지워진 자리처럼 보인다. */
        .pw-form .nick-in { display:block; max-width:320px; margin-bottom:12px; }
        .pw-form label { display:block; margin-top:2px; }
        /* ── 눈 버튼 ──
             🔴여백(margin)을 감싸개가 가져가고 칸은 0 으로 만든다. 안 그러면
               감싸개 높이에 아래 여백까지 들어가서 버튼이 칸 밑으로 처진다.
               → 그래서 .nick-in 의 margin-top(4px) · margin-bottom(12px)이
                 그대로 .pw-wrap 으로 옮겨 와 있다. 한쪽만 고치지 말 것.
             ⚠️아이콘 그림은 components/AuthCard 의 PwEyeIcon 을 함께 쓴다.
               자리·크기는 .nick-in 에 맞춰야 해서 CSS 만 여기 따로 둔다. */
        .pw-wrap { position:relative; display:block; max-width:320px; margin-top:4px; margin-bottom:12px; }
        .pw-form .pw-wrap .nick-in { max-width:none; margin:0; padding-right:38px; }
        .pw-eye { position:absolute; top:0; right:0; height:100%; width:36px;
                  display:flex; align-items:center; justify-content:center;
                  background:none; border:none; padding:0; color:#aaa; cursor:pointer; }
        .pw-eye:hover { color:#555; }
        .pw-eye:focus-visible { outline:2px solid #1a1a1a; outline-offset:-2px; border-radius:6px; }
        .pw-btns { justify-content:flex-end; }
        .relink { font-size:0.75rem; color:#888; text-underline-offset:3px; }
        .relink:hover { color:#333; }
        /* 🔴성공 상자 — /account 의 .err 와 같은 틀에 색만 초록이다
             (초록값은 AuthCard 의 .msg.ok · /account 의 .badge.on 과 같은 #2f855a) */
        .ok { background:#f0f8f3; color:#2f855a; font-size:0.8rem; padding:11px 14px; border-radius:8px; margin-bottom:14px; line-height:1.6; }
      `}</style>
      <SiteHeader />
      <div className="wrap">{children}</div>
    </main>
  );
}
