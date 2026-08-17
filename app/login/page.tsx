"use client";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";

// ==========================================================================
//  MassLabs 통합 로그인 — 모든 프로그램이 여기로 온다.
//
//  🔴세션은 .masslabs-archi.com 쿠키에 담기므로, 여기서 한 번 로그인하면
//    archimap 등 모든 하위 도메인이 로그인된 상태가 된다(lib/supabase.ts 참고).
//  🔴next는 반드시 safeNext로 거른다 — 안 그러면 ?next=악성사이트 링크에
//    사람들이 로그인해 버린다.
// ==========================================================================

type Mode = "login" | "signup" | "reset";

function LoginContent() {
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));

  const [mode, setMode] = useState<Mode>(sp.get("mode") === "signup" ? "signup" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [korea, setKorea] = useState(true);
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
        const { data, error } = await sb.auth.signUp({
          email,
          password,
          options: {
            // 🔴country가 결제 채널을 정한다(한국이면 원화, 아니면 달러).
            //   handle_new_user 트리거가 이 값을 profiles로 옮긴다.
            data: { country: korea ? "South Korea" : "" },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
          },
        });
        if (error) throw error;
        // 이메일 확인이 켜져 있으면 세션 없이 돌아온다.
        if (data.session) go();
        else setNotice("가입 확인 메일을 보냈습니다. 메일의 링크를 눌러 주세요.");
        return;
      }

      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      });
      if (error) throw error;
      setNotice("비밀번호 재설정 메일을 보냈습니다.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        /Invalid login/i.test(msg) ? "이메일 또는 비밀번호가 올바르지 않습니다."
        : /already registered|already been/i.test(msg) ? "이미 가입된 이메일입니다."
        : /Password should be/i.test(msg) ? "비밀번호는 6자 이상이어야 합니다."
        : /Email not confirmed/i.test(msg) ? "메일의 확인 링크를 먼저 눌러 주세요."
        : msg || "처리에 실패했습니다.");
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
    if (error) { setError("구글 로그인을 사용할 수 없습니다."); setBusy(false); }
  };

  const title = mode === "login" ? "로그인" : mode === "signup" ? "회원가입" : "비밀번호 재설정";

  return (
    <Card>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        MassLabs {title}
      </h1>
      <p style={{ fontSize: "0.78rem", color: "#aaa", marginBottom: 22 }}>
        계정 하나로 모든 MassLabs 프로그램을 사용합니다.
      </p>

      <form onSubmit={submit}>
        <label className="fld-label">이메일</label>
        <input
          className="fld" type="email" value={email} required autoComplete="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        {mode !== "reset" && (
          <>
            <label className="fld-label">비밀번호</label>
            <input
              className="fld" type="password" value={password} required minLength={6}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}

        {mode === "signup" && (
          <>
            <label className="fld-label">거주 지역</label>
            <div className="seg">
              <button type="button" className={`seg-btn${korea ? " on" : ""}`} onClick={() => setKorea(true)}>국내</button>
              <button type="button" className={`seg-btn${!korea ? " on" : ""}`} onClick={() => setKorea(false)}>해외</button>
            </div>
            <p className="hint">결제 통화를 정하는 데 쓰입니다. 나중에 바꿀 수 있습니다.</p>
          </>
        )}

        {error && <div className="msg err">{error}</div>}
        {notice && <div className="msg ok">{notice}</div>}

        <button className="main-btn" type="submit" disabled={busy}>
          {busy ? "처리 중…" : title}
        </button>
      </form>

      {mode !== "reset" && (
        <>
          <div className="divider"><span>또는</span></div>
          <button className="g-btn" onClick={google} disabled={busy}>
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden>
              <path fill="#4285F4" d="M45 24c0-1.6-.1-2.7-.4-4H24v7.5h12c-.2 2-1.5 5-4.4 7l6.7 5.2C42.2 36 45 30.6 45 24z"/>
              <path fill="#34A853" d="M24 46c5.9 0 10.8-2 14.4-5.3l-6.7-5.2c-1.8 1.3-4.3 2.2-7.7 2.2-5.9 0-10.9-3.9-12.7-9.3l-7 5.4C7.9 41 15.4 46 24 46z"/>
              <path fill="#FBBC05" d="M11.3 28.4c-.5-1.4-.7-2.9-.7-4.4s.3-3 .7-4.4l-7-5.4C2.9 17.1 2 20.4 2 24s.9 6.9 2.3 9.8l7-5.4z"/>
              <path fill="#EA4335" d="M24 10.6c3.3 0 5.5 1.4 6.8 2.6l5.9-5.8C33.1 4 28.9 2 24 2 15.4 2 7.9 7 4.3 14.2l7 5.4C13.1 14.5 18.1 10.6 24 10.6z"/>
            </svg>
            구글로 계속하기
          </button>
        </>
      )}

      <div className="links">
        {mode === "login" && (
          <>
            <button type="button" onClick={() => { setMode("signup"); setError(""); setNotice(""); }}>회원가입</button>
            <button type="button" onClick={() => { setMode("reset"); setError(""); setNotice(""); }}>비밀번호를 잊으셨나요?</button>
          </>
        )}
        {mode !== "login" && (
          <button type="button" onClick={() => { setMode("login"); setError(""); setNotice(""); }}>로그인으로 돌아가기</button>
        )}
      </div>
    </Card>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-box { background:#fff; border-radius:16px; padding:30px 28px 24px; width:100%; max-width:380px; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
        .fld-label { display:block; font-size:0.75rem; color:#666; margin-bottom:5px; }
        .fld { width:100%; padding:10px 12px; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.88rem; font-family:inherit; margin-bottom:14px; }
        .fld:focus { outline:none; border-color:#1a1a1a; }
        .seg { display:flex; gap:8px; }
        .seg-btn { flex:1; padding:10px 8px; border:1.5px solid #e0e0e0; border-radius:8px; background:#fff; font-size:0.82rem; font-family:inherit; color:#555; cursor:pointer; transition:all .15s; }
        .seg-btn:hover { border-color:#bbb; }
        .seg-btn.on { border-color:#1a1a1a; background:#1a1a1a; color:#fff; }
        .hint { font-size:0.7rem; color:#aaa; margin-top:6px; }
        .main-btn { width:100%; padding:11px; background:#1a1a1a; color:#fff; border:none; border-radius:8px; font-size:0.88rem; font-weight:600; font-family:inherit; cursor:pointer; margin-top:16px; transition:background .2s; }
        .main-btn:hover { background:#333; }
        .main-btn:disabled { background:#ccc; cursor:not-allowed; }
        .g-btn { width:100%; display:flex; align-items:center; justify-content:center; gap:8px; padding:10px; background:#fff; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.85rem; font-weight:500; font-family:inherit; color:#333; cursor:pointer; transition:border-color .15s; }
        .g-btn:hover { border-color:#bbb; }
        .g-btn:disabled { opacity:0.5; cursor:not-allowed; }
        .divider { display:flex; align-items:center; gap:10px; margin:18px 0 14px; }
        .divider::before, .divider::after { content:""; flex:1; height:1px; background:#eee; }
        .divider span { font-size:0.72rem; color:#bbb; }
        .msg { font-size:0.78rem; margin-top:12px; line-height:1.5; }
        .msg.err { color:#e53e3e; }
        .msg.ok { color:#2f855a; }
        .links { display:flex; justify-content:space-between; gap:12px; margin-top:18px; padding-top:16px; border-top:1px solid #f0f0f0; }
        .links button { background:none; border:none; padding:0; font-size:0.76rem; color:#888; font-family:inherit; cursor:pointer; text-decoration:underline; }
        .links button:hover { color:#333; }
      `}</style>
      <div className="auth-box">{children}</div>
    </>
  );
}

export default function LoginPage() {
  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#f5f5f5", color: "#1a1a1a", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <Suspense fallback={<p style={{ fontSize: "0.88rem", color: "#888" }}>Loading...</p>}>
        <LoginContent />
      </Suspense>
    </main>
  );
}
