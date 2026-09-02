"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";
import { useTx } from "@/lib/i18n";
import { passwordErrorKind } from "@/lib/auth-errors";
import { AuthCard, AuthShell, PasswordField } from "@/components/AuthCard";

// ==========================================================================
//  새 비밀번호를 정하는 자리 — 비밀번호 재설정 메일의 링크가 여기로 떨어진다.
//
//  🔴링크는 /auth/callback 을 먼저 거친다(거기서 일회용 code가 세션이 된다).
//    그래서 이 화면은 "이미 로그인된 상태"로 열리고, 하는 일은 updateUser 하나뿐이다.
//  🔴세션이 없으면 폼을 아예 안 보여준다 — 링크가 만료됐거나 주소만 직접 친 경우인데,
//    폼을 띄워 두면 눌러도 아무 일이 안 일어나서 사람이 원인을 못 찾는다.
//  🔴콜백이 ?error=… 로 실패 이유를 달아 보낸다(otp_expired · other_device · missing_code …).
//    그걸 읽어 원인별로 다른 안내를 낸다 — "만료"와 "잘못된 링크"는 할 일이 다르다.
//  ⚠️이 화면이 없으면 재설정 메일은 그냥 "로그인 링크"가 된다(옛 비밀번호가 그대로
//    살아 있다). 지우지 말 것 — 지우려면 login 페이지의 resetPasswordForEmail
//    redirectTo도 같이 되돌려야 한다.
// ==========================================================================

const TX = {
  ko: {
    title: "새 비밀번호",
    lead: "앞으로 쓸 비밀번호를 정해 주세요.",
    password: "새 비밀번호", password2: "새 비밀번호 확인",
    showPw: "비밀번호 보기", hidePw: "비밀번호 가리기",
    submit: "비밀번호 바꾸기", busy: "처리 중…",
    done: "비밀번호를 바꿨습니다. 잠시 후 이동합니다.",
    mismatch: "비밀번호가 일치하지 않습니다.",
    shortPw: "비밀번호는 6자 이상이어야 합니다.",
    samePw: "지금 쓰는 것과 다른 비밀번호로 정해 주세요.",
    weakPw: "너무 쉬운 비밀번호입니다. 다른 것으로 정해 주세요.",
    reauth: "안전을 위해 다시 로그인한 뒤에 바꿀 수 있습니다.",
    expired: "재설정 링크가 만료됐거나 올바르지 않습니다. 다시 요청해 주세요.",
    linkExpired: "재설정 링크의 유효 기간이 지났습니다. 메일을 다시 받아 주세요.",
    badLink: "재설정 링크가 올바르지 않습니다. 메일에 있는 버튼을 직접 눌러 주세요.",
    otherDevice: "링크를 요청한 기기·브라우저에서 열어야 합니다. 지금 이 브라우저에서 다시 받아 주세요.",
    toReset: "재설정 메일 다시 받기",
    failed: "처리에 실패했습니다.",
    checking: "확인 중…",
  },
  en: {
    title: "New password",
    lead: "Choose the password you'll use from now on.",
    password: "New password", password2: "Confirm new password",
    showPw: "Show password", hidePw: "Hide password",
    submit: "Change password", busy: "Working…",
    done: "Your password has been changed. Taking you back…",
    mismatch: "Those passwords don't match.",
    shortPw: "Password must be at least 6 characters.",
    samePw: "Please choose a password different from your current one.",
    weakPw: "That password is too easy to guess. Please choose another.",
    reauth: "For safety, please sign in again before changing your password.",
    expired: "That reset link has expired or isn't valid. Please request a new one.",
    linkExpired: "That reset link has expired. Please request a new email.",
    badLink: "That reset link isn't valid. Please use the button in the email itself.",
    otherDevice: "Open the link on the device and browser you requested it from. Request a new email here instead.",
    toReset: "Send a new reset email",
    failed: "Something went wrong.",
    checking: "Checking…",
  },
};

function ResetContent() {
  const sp = useSearchParams();
  // 🔴비밀번호를 바꾼 뒤 돌아갈 곳도 검증한다(오픈 리디렉트 방지).
  const next = safeNext(sp.get("next"));
  // /auth/callback 이 실패했을 때 달아 보내는 이유(otp_expired · other_device · missing_code …).
  const failure = sp.get("error");
  const x = useTx(TX);

  const [ready, setReady] = useState<"checking" | "ok" | "nosession">("checking");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    // 🔴콜백이 이유를 달아 보냈으면 세션은 볼 것도 없다 — 교환 자체가 실패한 것이라
    //   남아 있는 옛 세션으로 폼을 띄우면 엉뚱한 계정의 비밀번호를 바꾸게 된다.
    if (failure) { setReady("nosession"); return; }
    supabase().auth.getSession().then(({ data }) => {
      setReady(data.session ? "ok" : "nosession");
    });
  }, [failure]);

  // 원인별 안내 — 최소한 "만료됐다"(다시 받으면 됨)와 "잘못됐다"는 구분해 준다.
  // ⚠️모르는 값은 "링크가 잘못됐다"로 받는다. 나중에 코드가 늘어도 화면은 안 깨진다.
  const failMsg =
    !failure ? x.expired
    : failure === "otp_expired" ? x.linkExpired
    : failure === "other_device" ? x.otherDevice
    : x.badLink;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) { setError(x.mismatch); return; }
    setBusy(true); setError(""); setNotice("");

    try {
      const { error } = await supabase().auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      setNotice(x.done);
      // 바뀐 걸 읽을 틈을 주고 넘긴다 — 곧바로 이동하면 뭐가 됐는지 모른 채 화면이 사라진다.
      setTimeout(() => { window.location.href = next; }, 1200);
    } catch (err) {
      // 🔴원인은 로그에만 남긴다. Supabase 오류는 영어 한 줄이라 그대로 띄우면
      //   한국어 화면에 영어가 섞인다(예전엔 msg 를 그대로 setError 했다).
      console.error("비밀번호 변경 실패:", err);
      // 판정은 lib/auth-errors 한 곳에서 한다 — /account/security 와 같은 updateUser 를
      //   부르므로 같은 답을 해야 한다. 문구만 이 화면의 TX 에서 고른다.
      const kind = passwordErrorKind(err);
      setError(
        kind === "samePw" ? x.samePw
        : kind === "shortPw" ? x.shortPw
        : kind === "weakPw" ? x.weakPw
        : kind === "reauth" ? x.reauth
        : kind === "expired" ? x.expired
        : x.failed);
      setBusy(false);
    }
  };

  return (
    <AuthCard>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        {x.title}
      </h1>
      <div style={{ marginBottom: 22 }} />

      {ready === "checking" && <p className="hint">{x.checking}</p>}

      {ready === "nosession" && (
        <>
          <div className="msg err">{failMsg}</div>
          <div className="links">
            <a href="/login?mode=reset" style={{ fontSize: "0.76rem", color: "#888" }}>{x.toReset}</a>
          </div>
        </>
      )}

      {ready === "ok" && (
        <form onSubmit={submit}>
          <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>{x.lead}</p>

          <PasswordField
            label={x.password} value={password} onChange={setPassword}
            autoComplete="new-password" showLabel={x.showPw} hideLabel={x.hidePw}
          />

          <PasswordField
            label={x.password2} value={password2} onChange={setPassword2}
            autoComplete="new-password" showLabel={x.showPw} hideLabel={x.hidePw}
          />

          {error && <div className="msg err">{error}</div>}
          {notice && <div className="msg ok">{notice}</div>}

          <button className="main-btn" type="submit" disabled={busy || done}>
            {busy ? x.busy : x.submit}
          </button>
        </form>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <Suspense fallback={<p style={{ fontSize: "0.88rem", color: "#888" }}>Loading...</p>}>
        <ResetContent />
      </Suspense>
    </AuthShell>
  );
}
