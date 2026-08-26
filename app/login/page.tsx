"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";
import { AuthCard, AuthShell, PasswordField } from "@/components/AuthCard";
import { useLanguage } from "@/lib/i18n";

// ==========================================================================
//  MassLabs 통합 로그인 — 모든 프로그램이 여기로 온다.
//
//  🔴세션은 .masslabs-archi.com 쿠키에 담기므로, 여기서 한 번 로그인하면
//    archimap 등 모든 하위 도메인이 로그인된 상태가 된다(lib/supabase.ts 참고).
//  🔴next는 반드시 safeNext로 거른다 — 안 그러면 ?next=악성사이트 링크에
//    사람들이 로그인해 버린다.
// ==========================================================================

// 🔴이메일 가입·재설정은 확인 메일을 보내야 하는데, Supabase 기본 발송은
//   프로덕션에서 못 쓴다(시간당 2~3통 제한 → signup이 500 "Error sending
//   confirmation email"로 죽는다).
//   → 2026-08-18 Supabase Auth에 Gmail SMTP를 붙여서 열었다. 발신은
//     masslabs.archi@gmail.com(앱 비밀번호), 하루 500통까지.
//   ⚠️임시 방편이다 — 회사 도메인(no-reply@masslabs-archi.com)으로 보내야 하거나
//     발송량이 늘면 Resend로 갈아탄다. 그때도 Supabase의 SMTP 칸만 바꾸면 되고
//     이 파일은 그대로다.
const EMAIL_AUTH_ENABLED = true;

type Mode = "login" | "signup" | "reset";

// ==========================================================================
//  화면 문구
//
//  🔴여기는 **홈페이지에서 고른 언어**를 따른다(결제 페이지와 기준이 다르다).
//    로그인 시점엔 결제 채널도 가입 국가도 아직 없어서 지역으로 가를 수가 없다.
//  🔴라이노 플러그인이 보낸 사람은 언어를 고른 적이 없어 기본값(영어)이 된다 —
//    플러그인 안내창이 영어이므로 그게 맞다. 여기서 한글이 나오면 흐름이 끊긴다.
// ==========================================================================
const TX = {
  ko: {
    login: "로그인", signup: "회원가입", reset: "비밀번호 재설정",
    google: "구글로 계속하기",
    firstTime: "처음이시면 구글 계정으로 바로 시작됩니다.",
    googleFail: "구글 로그인을 사용할 수 없습니다.",
    email: "이메일", password: "비밀번호", password2: "비밀번호 확인",
    showPw: "비밀번호 보기", hidePw: "비밀번호 가리기",
    mismatch: "비밀번호가 일치하지 않습니다.",
    or: "또는",
    busy: "처리 중…",
    forgot: "비밀번호를 잊으셨나요?",
    backToLogin: "로그인으로 돌아가기",
    sentSignup: "가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 주세요.",
    sentReset: "비밀번호 재설정 메일을 보냈습니다.",
    badLogin: "이메일 또는 비밀번호가 올바르지 않습니다.",
    already: "이미 가입된 이메일입니다.",
    shortPw: "비밀번호는 6자 이상이어야 합니다.",
    unconfirmed: "메일의 확인 링크를 먼저 눌러 주세요.",
    failed: "처리에 실패했습니다.",
  },
  en: {
    login: "Sign in", signup: "Create account", reset: "Reset password",
    google: "Continue with Google",
    firstTime: "New here? Your Google account gets you started right away.",
    googleFail: "Google sign-in isn't available right now.",
    email: "Email", password: "Password", password2: "Confirm password",
    showPw: "Show password", hidePw: "Hide password",
    mismatch: "Those passwords don't match.",
    or: "or",
    busy: "Working…",
    forgot: "Forgot your password?",
    backToLogin: "Back to sign in",
    sentSignup: "We've sent a confirmation email. Please click the link inside.",
    sentReset: "We've sent a password reset email.",
    badLogin: "That email or password isn't right.",
    already: "That email is already registered.",
    shortPw: "Password must be at least 6 characters.",
    unconfirmed: "Please click the confirmation link in your email first.",
    failed: "Something went wrong.",
  },
} as const;

function LoginContent() {
  const sp = useSearchParams();
  // 🔴로그인을 마치면 갈 곳. next 가 없으면 /main 이다(2026-08-26 사용자 결정).
  //   ⚠️next 를 무시하고 늘 /main 으로 보내면 안 된다 — /link(라이노 기기연결)와
  //     /price(결제)는 로그인한 뒤 **그 자리로 돌아가야** 하던 일이 끝난다.
  //     거기서 /main 으로 끌고 오면 기기연결이 중간에 끊긴다.
  const next = safeNext(sp.get("next") ?? "/main");
  const { lang } = useLanguage();
  const x = lang === "ko" ? TX.ko : TX.en;

  // 🔴mode 는 세 값을 다 받는다. "reset"을 빠뜨리면 /reset-password 의
  //   "재설정 메일 다시 받기"(→ /login?mode=reset)가 그냥 로그인 폼으로 떨어져,
  //   링크가 만료된 사람이 다시 [비밀번호를 잊으셨나요?]를 찾아 눌러야 한다.
  const mode0 = sp.get("mode");
  const [mode, setMode] = useState<Mode>(
    mode0 === "signup" ? "signup" : mode0 === "reset" ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const go = () => { window.location.href = next; };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(""); setNotice("");
    const sb = supabase();

    try {
      if (mode === "login") {
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if (error) throw error;
        go();
        return;
      }

      if (mode === "signup") {
        if (password !== password2) { setError(x.mismatch); return; }
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            // 🔴가입 때 거주 지역을 묻지 않는다(2026-08-18 결정). profiles.country는
            //   비워 두고 결제 채널은 결제 화면이 화면 언어로 정한다(app/subscribe/page.tsx).
            //   → 구글 로그인으로 들어온 사람과 같은 길을 타므로 분기가 하나로 줄어든다.
            // 🔴가입 확인 메일의 링크는 next를 따르지 않고 항상 홈으로 보낸다
            //   (2026-08-18 결정). 메일을 여는 건 가입하던 화면을 떠난 뒤라,
            //   원래 가려던 곳으로 곧장 떨어뜨리면 처음 온 사람이 사이트를 못 보고
            //   구독 관리 화면부터 만난다.
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        if (error) throw error;
        // 🔴이미 가입된 메일이면 Supabase는 오류를 주지 않는다 — 이메일 열거 방지 때문에
        //   HTTP 200에 "가짜 사용자"(무작위 id, confirmation_sent_at까지 채워서)를 돌려주고
        //   메일은 실제로 안 보낸다. 그래서 "메일 보냈습니다"만 뜨고 아무것도 안 오는
        //   막다른 길이 생긴다(2026-08-26 실제 응답으로 확인).
        //   구별되는 자리는 identities 하나뿐이다 — 새 메일이면 1개, 이미 있으면 빈 배열.
        if (data.user && data.user.identities?.length === 0) { setError(x.already); return; }
        // 이메일 확인이 켜져 있으면 세션 없이 돌아온다.
        if (data.session) go();
        else setNotice(x.sentSignup);
        return;
      }

      // 🔴재설정 링크는 /reset-password 로 보낸다. /auth/callback 은 세션만 만들고
      //   끝나므로, 곧장 홈으로 보내면 새 비밀번호를 영영 안 묻게 된다.
      //   원래 가려던 곳(next)은 비밀번호를 바꾼 다음에 이어서 간다.
      const after = next === "/" ? "/reset-password" : `/reset-password?next=${encodeURIComponent(next)}`;
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(after)}`,
      });
      if (error) throw error;
      setNotice(x.sentReset);
    } catch (err) {
      // 🔴Supabase 오류 원문은 로그에만 남긴다. 영어 한 줄이라 그대로 띄우면
      //   한국어 화면에 "AuthApiError: …"가 그대로 뜬다(예전엔 msg 를 흘렸다).
      console.error("로그인/가입 실패:", err);
      const msg = err instanceof Error ? err.message : "";
      setError(
        /Invalid login/i.test(msg) ? x.badLogin
        : /already registered|already been/i.test(msg) ? x.already
        : /Password should be/i.test(msg) ? x.shortPw
        : /Email not confirmed/i.test(msg) ? x.unconfirmed
        : x.failed);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true); setError("");
    const { error } = await supabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setError(x.googleFail); setBusy(false); }
  };

  const title = mode === "login" ? x.login : mode === "signup" ? x.signup : x.reset;

  return (
    <AuthCard>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        {title}
      </h1>
      <div style={{ marginBottom: 22 }} />
      {!EMAIL_AUTH_ENABLED && (
        <>
          <button className="g-btn" onClick={google} disabled={busy}>
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
              <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-4H24v7.5h12c-.2 2-1.5 5-4.4 7l6.7 5.2C42.2 36 45 30.6 45 24z"/>
              <path fill="#34A853" d="M24 46c5.9 0 10.8-2 14.4-5.3l-6.7-5.2c-1.8 1.3-4.3 2.2-7.7 2.2-5.9 0-10.9-3.9-12.7-9.3l-7 5.4C7.9 41 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.3 28.4c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4l-7-5.4C2.9 17.1 2 20.4 2 24s.9 6.9 2.3 9.8l7-5.4z"/>
              <path fill="#EA4335" d="M24 10.6c3.3 0 5.5 1.4 6.8 2.6l5.9-5.8C33.1 4 28.9 2 24 2 15.4 2 7.9 7 4.3 14.2l7 5.4C13.1 14.5 18.1 10.6 24 10.6z"/>
            </svg>
            {x.google}
          </button>
          {error && <div className="msg err">{error}</div>}
          <p className="hint" style={{ marginTop: 14, textAlign: "center" }}>
            {x.firstTime}
          </p>
        </>
      )}

      {EMAIL_AUTH_ENABLED && (
      <form onSubmit={submit}>
        <label className="fld-label">{x.email}</label>
        <input
          className="fld" type="email" value={email} required autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        {mode !== "reset" && (
          <>
            <PasswordField
              label={x.password} value={password} onChange={setPassword}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              showLabel={x.showPw} hideLabel={x.hidePw}
            />
          </>
        )}

        {mode === "signup" && (
          <>
            <PasswordField
              label={x.password2} value={password2} onChange={setPassword2}
              autoComplete="new-password"
              showLabel={x.showPw} hideLabel={x.hidePw}
            />
          </>
        )}

        {error && <div className="msg err">{error}</div>}
        {notice && <div className="msg ok">{notice}</div>}

        <button className="main-btn" type="submit" disabled={busy}>
          {busy ? x.busy : title}
        </button>
      </form>
      )}

      {EMAIL_AUTH_ENABLED && mode !== "reset" && (
        <>
          <div className="divider"><span>{x.or}</span></div>
          <button className="g-btn" onClick={google} disabled={busy}>
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
              <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-4H24v7.5h12c-.2 2-1.5 5-4.4 7l6.7 5.2C42.2 36 45 30.6 45 24z"/>
              <path fill="#34A853" d="M24 46c5.9 0 10.8-2 14.4-5.3l-6.7-5.2c-1.8 1.3-4.3 2.2-7.7 2.2-5.9 0-10.9-3.9-12.7-9.3l-7 5.4C7.9 41 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.3 28.4c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4l-7-5.4C2.9 17.1 2 20.4 2 24s.9 6.9 2.3 9.8l7-5.4z"/>
              <path fill="#EA4335" d="M24 10.6c3.3 0 5.5 1.4 6.8 2.6l5.9-5.8C33.1 4 28.9 2 24 2 15.4 2 7.9 7 4.3 14.2l7 5.4C13.1 14.5 18.1 10.6 24 10.6z"/>
            </svg>
            {x.google}
          </button>
        </>
      )}

      <div className="links" style={{ display: EMAIL_AUTH_ENABLED ? undefined : "none" }}>
        {mode === "login" && (
          <>
            <button type="button" onClick={() => { setMode("signup"); setError(""); setNotice(""); }}>{x.signup}</button>
            <button type="button" onClick={() => { setMode("reset"); setError(""); setNotice(""); }}>{x.forgot}</button>
          </>
        )}
        {mode !== "login" && (
          <button type="button" onClick={() => { setMode("login"); setError(""); setNotice(""); }}>{x.backToLogin}</button>
        )}
      </div>
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<p style={{ fontSize: "0.88rem", color: "#888" }}>Loading...</p>}>
        <LoginContent />
      </Suspense>
    </AuthShell>
  );
}
