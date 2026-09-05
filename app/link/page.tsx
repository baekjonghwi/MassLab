"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useTx } from "@/lib/i18n";

// ==========================================================================
//  /link — 라이노를 내 계정에 붙이는 화면.
//
//  라이노가 6자리 코드를 띄우고 이 페이지를 연다. 사용자는 로그인한 뒤 그 코드를
//  입력한다. 붙고 나면 라이노로 돌아가 [연결 확인]을 누르면 끝이다.
//
//  🔴폴링하지 않는다. 이 페이지도, 라이노도, 사용자가 누를 때만 요청을 보낸다.
// ==========================================================================

// ==========================================================================
//  화면 문구
//
//  🔴로그인 페이지와 같은 기준 — **홈페이지에서 고른 언어**를 따른다.
//    여기도 결제 채널이나 가입 국가를 알기 전이라 지역으로 가를 수가 없다.
//  🔴라이노에서 온 사람은 대개 언어를 고른 적이 없어 기본값(영어)이 된다.
//    플러그인 안내창이 영어이므로 그래야 말이 이어진다.
// ==========================================================================
const TX = {
  ko: {
    checking: "확인 중…",
    doneTitle: "연결되었습니다",
    // 🔴라이노 창의 실제 버튼 이름과 같아야 한다. [연결 확인] 같은 없는 이름을 적으면
    //   사용자가 그 버튼을 찾느라 멈춘다(Windows가 붙이는 이름이라 [확인]/[OK]다).
    doneSub: ["라이노로 돌아가 ", "[확인]", " 버튼을 눌러 주세요."],
    title: "라이노 연결",
    sub: "라이노 화면에 표시된 6자리 코드를 입력해 주세요.",
    account: "계정",
    linking: "연결 중…",
    link: "연결하기",
    foot: "라이노에서 로그인을 시작하지 않으셨다면 이 창을 닫아 주세요.",
    notFound: "코드를 찾을 수 없습니다. 라이노 화면의 코드를 다시 확인해 주세요.",
    badCode: "6자리 코드를 입력해 주세요.",
    ambiguous: "잠시 후 라이노에서 다시 시작해 주세요.",
    unauthorized: "로그인이 만료되었습니다. 새로고침 후 다시 시도해 주세요.",
    failed: "연결에 실패했습니다.",
  },
  en: {
    checking: "Checking…",
    doneTitle: "Device connected",
    doneSub: ["Go back to Rhino and click ", "OK", " to finish."],
    title: "Connect Rhino",
    sub: "Enter the code shown in Rhino.",
    account: "Account",
    linking: "Connecting…",
    link: "Connect",
    foot: "If you didn't start this from Rhino, please close this window.",
    notFound: "We couldn't find that code. Please double-check the code shown in Rhino.",
    badCode: "Please enter the 6-character code.",
    ambiguous: "Please start the login again from Rhino in a moment.",
    unauthorized: "Your session expired. Please refresh and try again.",
    failed: "Couldn't connect this device.",
  },
};

export default function LinkPage() {
  const x = useTx(TX);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // 로그인 확인. 안 돼 있으면 통합 로그인으로 보내고 여기로 돌아오게 한다.
  useEffect(() => {
    supabase().auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = `/login?next=${encodeURIComponent("/link")}`;
        return;
      }
      setEmail(data.user.email ?? "");
      setReady(true);
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError("");

    const { data } = await supabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) { window.location.href = `/login?next=${encodeURIComponent("/link")}`; return; }

    const r = await fetch("/api/device/link", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userCode: code }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy(false);

    if (!r.ok) {
      setError(
        d.error === "not_found" ? x.notFound
        : d.error === "bad_code" ? x.badCode
        : d.error === "ambiguous" ? x.ambiguous
        : d.error === "unauthorized" ? x.unauthorized
        : x.failed);
      return;
    }
    setDone(true);
  };

  if (!ready) return <Shell><p className="dim">{x.checking}</p></Shell>;

  if (done)
    return (
      <Shell>
        <div className="tick">✓</div>
        <h1 className="ttl">{x.doneTitle}</h1>
        <p className="sub">
          {x.doneSub[0]}<b>{x.doneSub[1]}</b>{x.doneSub[2]}
        </p>
      </Shell>
    );

  return (
    <Shell>
      <h1 className="ttl">{x.title}</h1>
      <p className="sub">{x.sub}</p>

      <div className="who">
        <span>{x.account}</span><span>{email}</span>
      </div>

      <form onSubmit={submit}>
        <input
          className="code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ABC-123"
          maxLength={7}
          autoFocus
          spellCheck={false}
          autoComplete="off"
        />
        {error && <div className="err">{error}</div>}
        <button className="main-btn" type="submit" disabled={busy}>
          {busy ? x.linking : x.link}
        </button>
      </form>

      <p className="foot">
        {x.foot}
      </p>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#f5f5f5", color: "#1a1a1a", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .box { background:#fff; border-radius:16px; padding:30px 28px 24px; width:100%; max-width:380px; box-shadow:0 8px 32px rgba(0,0,0,0.12); text-align:center; }
        .ttl { font-size:1.3rem; font-weight:700; letter-spacing:-0.02em; margin-bottom:6px; }
        .sub { font-size:0.82rem; color:#888; line-height:1.6; margin-bottom:20px; }
        .dim { font-size:0.88rem; color:#888; }
        .who { display:flex; justify-content:space-between; padding:10px 12px; background:#f8f8f8; border-radius:8px; margin-bottom:16px; font-size:0.78rem; }
        .who span:first-child { color:#666; }
        .code { width:100%; padding:14px; border:1.5px solid #e0e0e0; border-radius:10px; font-size:1.5rem; font-weight:700; font-family:ui-monospace,'SF Mono',monospace; text-align:center; letter-spacing:0.15em; }
        .code:focus { outline:none; border-color:#1a1a1a; }
        .main-btn { width:100%; padding:11px; background:#1a1a1a; color:#fff; border:none; border-radius:8px; font-size:0.88rem; font-weight:600; font-family:inherit; cursor:pointer; margin-top:14px; transition:background .2s; }
        .main-btn:hover { background:#333; }
        .main-btn:disabled { background:#ccc; cursor:not-allowed; }
        .err { font-size:0.78rem; color:#e53e3e; margin-top:12px; line-height:1.5; }
        .foot { font-size:0.7rem; color:#bbb; margin-top:18px; line-height:1.6; }
        .tick { width:44px; height:44px; margin:0 auto 14px; border-radius:100px; background:#2f855a; color:#fff; font-size:1.4rem; display:flex; align-items:center; justify-content:center; }
      `}</style>
      <div className="box">{children}</div>
    </main>
  );
}
