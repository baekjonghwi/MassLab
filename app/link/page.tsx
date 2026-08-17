"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// ==========================================================================
//  /link — 라이노를 내 계정에 붙이는 화면.
//
//  라이노가 6자리 코드를 띄우고 이 페이지를 연다. 사용자는 로그인한 뒤 그 코드를
//  입력한다. 붙고 나면 라이노로 돌아가 [연결 확인]을 누르면 끝이다.
//
//  🔴폴링하지 않는다. 이 페이지도, 라이노도, 사용자가 누를 때만 요청을 보낸다.
// ==========================================================================

export default function LinkPage() {
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
        d.error === "not_found" ? "코드를 찾을 수 없습니다. 라이노 화면의 코드를 다시 확인해 주세요."
        : d.error === "bad_code" ? "6자리 코드를 입력해 주세요."
        : d.error === "ambiguous" ? "잠시 후 라이노에서 다시 시작해 주세요."
        : d.error === "unauthorized" ? "로그인이 만료되었습니다. 새로고침 후 다시 시도해 주세요."
        : "연결에 실패했습니다.");
      return;
    }
    setDone(true);
  };

  if (!ready) return <Shell><p className="dim">확인 중…</p></Shell>;

  if (done)
    return (
      <Shell>
        <div className="tick">✓</div>
        <h1 className="ttl">연결되었습니다</h1>
        <p className="sub">
          라이노로 돌아가 <b>[연결 확인]</b> 버튼을 눌러 주세요.
        </p>
      </Shell>
    );

  return (
    <Shell>
      <h1 className="ttl">라이노 연결</h1>
      <p className="sub">라이노 화면에 표시된 6자리 코드를 입력해 주세요.</p>

      <div className="who">
        <span>계정</span><span>{email}</span>
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
          {busy ? "연결 중…" : "연결하기"}
        </button>
      </form>

      <p className="foot">
        라이노에서 로그인을 시작하지 않으셨다면 이 창을 닫아 주세요.
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
