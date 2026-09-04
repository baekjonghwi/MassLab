"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";
import { AuthCard, AuthShell, PasswordField, CountryField } from "@/components/AuthCard";
import { isCountryCode } from "@/lib/countries";
import { useTx } from "@/lib/i18n";

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
    country: "거주 국가", countryPick: "국가를 선택하세요",
    countryNeed: "국가를 선택하세요.",
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
    country: "Country", countryPick: "Select your country",
    countryNeed: "Please select your country.",
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
};

function LoginContent() {
  const sp = useSearchParams();
  // 🔴로그인을 마치면 갈 곳. next 가 없으면 **홈(/)** 이다.
  //   ⚠️2026-08-27 /main 에서 홈으로 바꿨다(그 /main 은 2026-08-28 에 지웠다).
  //   ⚠️next 를 무시하고 늘 홈으로 보내면 안 된다 — /link(라이노 기기연결)와
  //     /price(결제)는 로그인한 뒤 **그 자리로 돌아가야** 하던 일이 끝난다.
  //     거기서 홈으로 끌고 오면 기기연결이 중간에 끊긴다.
  const next = safeNext(sp.get("next") ?? "/");
  const x = useTx(TX);

  // 🔴mode 는 세 값을 다 받는다. "reset"을 빠뜨리면 /reset-password 의
  //   "재설정 메일 다시 받기"(→ /login?mode=reset)가 그냥 로그인 폼으로 떨어져,
  //   링크가 만료된 사람이 다시 [비밀번호를 잊으셨나요?]를 찾아 눌러야 한다.
  const mode0 = sp.get("mode");
  const [mode, setMode] = useState<Mode>(
    mode0 === "signup" ? "signup" : mode0 === "reset" ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  // 🔴거주 국가 — 가입할 때만 묻는다(2026-09-02). 로그인은 이미 있는 계정이라 묻지 않는다.
  //   담기는 자리는 profiles.country 이고, 결제 채널·통화를 여기서 가른다.
  const [country, setCountry] = useState("");
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
        if (!isCountryCode(country)) { setError(x.countryNeed); return; }
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            // 🔴거주 국가는 **가입할 때** 받는다(2026-09-02 결정 — 그전 2026-08-18 결정을
            //   뒤집었다). 그때는 결제가 끝나야 profiles.country 가 채워져서, 결제한 적
            //   없는 계정은 이 칸이 영영 비어 있었다(실측 623명 중 0명).
            // 🔴여기서 따로 쓰지 않는다 — DB 가입 트리거(handle_new_user)가
            //   raw_user_meta_data->>'country' 를 읽어 프로필 행을 만들 때 같이 적는다.
            //   ⇒ 메일 확인을 아직 안 한(세션이 없는) 사람도 값이 남는다. 여기서
            //     update 를 부르면 세션이 없어 RLS 에 막힌다.
            //   ⚠️모양(ISO2)은 서버가 다시 검사한다 — 아니면 조용히 null 이 된다
            //     (supabase/2026-09-02_signup_country.sql 의 profiles_norm_country).
            data: { country },
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

  // 🔴이 로그인 화면은 archiMap 앱 안에 iframe으로도 뜬다(2026-08-29). 그때 구글만 프레임에서
  //   못 돈다 — accounts.google.com이 X-Frame-Options: DENY 라 프레임을 거부해 빈 화면이 된다.
  //   그래서 프레임 안일 때만 리디렉션을 우리가 가로채(skipBrowserRedirect) 창으로 연다.
  //   ⚠️PKCE verifier는 이 브라우저의 쿠키라 창과 프레임이 같은 쿠키통을 쓴다 — /auth/callback이
  //     서버에서 그대로 읽는다(창을 따로 띄운다고 흐름이 갈라지지 않는다).
  //   ⚠️창이 막히면 최후로 최상위 창을 그리로 보낸다(사용자 조작 중이라 top 이동이 허용된다).
  //   ⛔프레임 밖(평소 로그인 페이지)에서는 예전 그대로다 — 여기서 창을 띄우면 평소 로그인이
  //     팝업 차단에 걸린다.
  const google = async () => {
    // 🔴가입 탭에서 누른 구글은 국가를 먼저 고르게 한다(2026-09-02). 구글은 우리에게
    //   거주지를 알려 주지 않아서, 여기서 안 받으면 결제할 때까지 영영 모른다.
    //   ⚠️로그인 탭에서 누른 구글은 안 막는다 — 이미 있는 계정일 수도 있어서다.
    //     그 길로 새로 만들어진 계정은 국가를 모른 채 지나간다(첫 결제가 채운다).
    if (mode === "signup" && !isCountryCode(country)) { setError(x.countryNeed); return; }
    setBusy(true); setError("");
    const framed = window.top !== window.self;
    // 🔴고른 국가를 주소에 실어 보낸다 — signInWithOAuth 에는 사용자 메타데이터를
    //   실을 자리가 없다. 받는 쪽(/auth/callback)이 세션을 만든 직후 적는다.
    //   ⚠️돌아오는 주소는 물음표 뒤까지 통째로 검사되므로 Supabase 의 Redirect URLs 가
    //     와일드카드여야 한다(이미 그렇다 — lib/supabase.ts 주석 참고).
    const cq = mode === "signup" && isCountryCode(country) ? `&country=${country}` : "";
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}${cq}`;
    if (framed) {
      const { data, error } = await supabase().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data?.url) { setError(x.googleFail); setBusy(false); return; }
      const w = window.open(data.url, "masslabs-google", "width=480,height=680");
      if (!w) {
        try { window.top!.location.href = data.url; }
        catch { window.location.href = data.url; }
      }
      setBusy(false);
      return;
    }
    const { error } = await supabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (error) { setError(x.googleFail); setBusy(false); }
  };

  const title = mode === "login" ? x.login : mode === "signup" ? x.signup : x.reset;

  // 상자 아래 줄 = 옛 '← 홈으로' 자리(2026-08-29 사용자 지시로 갈아 끼웠다).
  //   로그인이면 양쪽 끝에 [가입]·[비밀번호 찾기], 그 밖이면 [로그인으로 돌아가기] 하나.
  //   ⚠️이메일 인증을 끄면(EMAIL_AUTH_ENABLED=false) 갈 곳이 없으므로 넣지 않는다 — 그때는
  //     AuthShell이 예전처럼 '홈으로'를 그린다(막다른 길이 되지 않게).
  const footer = !EMAIL_AUTH_ENABLED ? undefined : mode === "login" ? (
    <>
      <button type="button" onClick={() => { setMode("signup"); setError(""); setNotice(""); }}>{x.signup}</button>
      <button type="button" onClick={() => { setMode("reset"); setError(""); setNotice(""); }}>{x.forgot}</button>
    </>
  ) : (
    // 화살표는 옛 '← 홈으로'가 달고 있던 것이다 — 자리를 물려받았으니 '돌아간다'는 표시도 같이 온다.
    <button type="button" onClick={() => { setMode("login"); setError(""); setNotice(""); }}>{"← "}{x.backToLogin}</button>
  );

  return (
    <AuthShell footer={footer}>
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
            {/* 🔴맨 아래에 둔다 — 바로 밑의 구글 단추도 이 값을 쓰기 때문에
                (가입 탭에서는 국가를 고른 뒤에야 구글이 열린다) 두 길이 한자리에 모인다. */}
            <CountryField
              label={x.country} placeholder={x.countryPick}
              value={country} onChange={(v) => { setCountry(v); setError(""); }}
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

    </AuthCard>
    </AuthShell>
  );
}

// 🔴껍데기(AuthShell)를 LoginContent 안으로 옮겼다 — 상자 아래 줄이 `mode`를 알아야 하는데
//   그 값은 `useSearchParams`에서 나오고, 그건 Suspense 안에서만 읽을 수 있다(위로 못 끌어올린다).
//   그래서 로딩 표시도 제 껍데기를 하나 두른다(안 그러면 그 순간만 검은 화면이 벗겨진다).
export default function LoginPage() {
  return (
    <Suspense fallback={
      <AuthShell>
        <AuthCard><p style={{ fontSize: "0.88rem", color: "#888", margin: 0 }}>Loading...</p></AuthCard>
      </AuthShell>
    }>
      <LoginContent />
    </Suspense>
  );
}
