"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";
import { AuthCard, AuthShell } from "@/components/AuthCard";

// ==========================================================================
//  새 비밀번호를 정하는 자리 — 비밀번호 재설정 메일의 링크가 여기로 떨어진다.
//
//  🔴링크는 /auth/callback 을 먼저 거친다(거기서 일회용 code가 세션이 된다).
//    그래서 이 화면은 "이미 로그인된 상태"로 열리고, 하는 일은 updateUser 하나뿐이다.
//  🔴세션이 없으면 폼을 아예 안 보여준다 — 링크가 만료됐거나 주소만 직접 친 경우인데,
//    폼을 띄워 두면 눌러도 아무 일이 안 일어나서 사람이 원인을 못 찾는다.
//  ⚠️이 화면이 없으면 재설정 메일은 그냥 "로그인 링크"가 된다(옛 비밀번호가 그대로
//    살아 있다). 지우지 말 것 — 지우려면 login 페이지의 resetPasswordForEmail
//    redirectTo도 같이 되돌려야 한다.
// ==========================================================================

const TX = {
  ko: {
    title: "새 비밀번호",
    lead: "앞으로 쓸 비밀번호를 정해 주세요.",
    password: "새 비밀번호", password2: "새 비밀번호 확인",
    submit: "비밀번호 바꾸기", busy: "처리 중…",
    done: "비밀번호를 바꿨습니다. 잠시 후 이동합니다.",
    mismatch: "비밀번호가 일치하지 않습니다.",
    shortPw: "비밀번호는 6자 이상이어야 합니다.",
    samePw: "지금 쓰는 것과 다른 비밀번호로 정해 주세요.",
    expired: "재설정 링크가 만료됐거나 올바르지 않습니다. 다시 요청해 주세요.",
    toReset: "재설정 메일 다시 받기",
    failed: "처리에 실패했습니다.",
    checking: "확인 중…",
  },
  en: {
    title: "New password",
    lead: "Choose the password you'll use from now on.",
    password: "New password", password2: "Confirm new password",
    submit: "Change password", busy: "Working…",
    done: "Your password has been changed. Taking you back…",
    mismatch: "Those passwords don't match.",
    shortPw: "Password must be at least 6 characters.",
    samePw: "Please choose a password different from your current one.",
    expired: "That reset link has expired or isn't valid. Please request a new one.",
    toReset: "Send a new reset email",
    failed: "Something went wrong.",
    checking: "Checking…",
  },
} as const;

function ResetContent() {
  const sp = useSearchParams();
  // 🔴비밀번호를 바꾼 뒤 돌아갈 곳도 검증한다(오픈 리디렉트 방지).
  const next = safeNext(sp.get("next"));
  const { lang } = useLanguage();
  const x = lang === "ko" ? TX.ko : TX.en;

  const [ready, setReady] = useState<"checking" | "ok" | "nosession">("checking");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    supabase().auth.getSession().then(({ data }) => {
      setReady(data.session ? "ok" : "nosession");
    });
  }, []);

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
      const msg = err instanceof Error ? err.message : "";
      setError(
        /different from the old|should be different/i.test(msg) ? x.samePw
        : /Password should be|at least/i.test(msg) ? x.shortPw
        : msg || x.failed);
      setBusy(false);
    }
  };

  return (
    <AuthCard>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        MassLabs {x.title}
      </h1>
      <div style={{ marginBottom: 22 }} />

      {ready === "checking" && <p className="hint">{x.checking}</p>}

      {ready === "nosession" && (
        <>
          <div className="msg err">{x.expired}</div>
          <div className="links">
            <a href="/login?mode=reset" style={{ fontSize: "0.76rem", color: "#888" }}>{x.toReset}</a>
          </div>
        </>
      )}

      {ready === "ok" && (
        <form onSubmit={submit}>
          <p className="hint" style={{ marginTop: 0, marginBottom: 14 }}>{x.lead}</p>

          <label className="fld-label">{x.password}</label>
          <input
            className="fld" type="password" value={password} required minLength={6}
            autoComplete="new-password" onChange={(e) => setPassword(e.target.value)}
          />

          <label className="fld-label">{x.password2}</label>
          <input
            className="fld" type="password" value={password2} required minLength={6}
            autoComplete="new-password" onChange={(e) => setPassword2(e.target.value)}
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
