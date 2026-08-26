"use client";
import { useState, type ReactNode } from "react";

// ==========================================================================
//  로그인·비밀번호 재설정 화면이 함께 쓰는 껍데기.
//
//  🔴두 화면이 같은 상자를 쓴다(app/login, app/reset-password). 스타일을 한쪽에
//    복사해 두면 나중에 한쪽만 고쳐져서 재설정 화면만 옛날 모양으로 남는다.
//    → 고칠 일이 생기면 여기 한 곳만 고친다.
// ==========================================================================

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#f5f5f5", color: "#1a1a1a", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      {children}
    </main>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .auth-box { background:#fff; border-radius:16px; padding:30px 28px 24px; width:100%; max-width:380px; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
        .fld-label { display:block; font-size:0.75rem; color:#666; margin-bottom:5px; }
        .fld { width:100%; padding:10px 12px; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.88rem; font-family:inherit; margin-bottom:14px; }
        .fld:focus { outline:none; border-color:#1a1a1a; }
        .pw-wrap { position:relative; }
        .pw-wrap .fld { padding-right:40px; }
        /* 🔴height 는 .fld 의 margin-bottom(14px)을 뺀 값 — 감싸개 높이엔 그 여백이 포함된다. */
        .pw-eye { position:absolute; top:0; right:0; height:calc(100% - 14px); width:38px; display:flex; align-items:center; justify-content:center; background:none; border:none; padding:0; color:#aaa; cursor:pointer; }
        .pw-eye:hover { color:#555; }
        .pw-eye:focus-visible { outline:2px solid #1a1a1a; outline-offset:-2px; border-radius:6px; }
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

// ==========================================================================
//  눈 아이콘 — 그림만 여기서 갖는다.
//
//  ⚠️/account/security 의 비밀번호 폼도 이 아이콘을 쓴다. 다만 **버튼과 CSS 는
//    그쪽이 따로 갖는다** — 칸 스타일(.nick-in)이 여기 .fld 와 달라서
//    자리·높이를 그쪽 값으로 잡아야 한다. 공유되는 건 그림뿐이다.
// ==========================================================================
export function PwEyeIcon({ shown }: { shown: boolean }) {
  return shown ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
         strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

// ==========================================================================
//  비밀번호 칸 — 오른쪽 눈 버튼으로 가린 글자를 잠깐 볼 수 있다.
//
//  🔴보이기/가리기는 이 칸 하나에만 걸린다(칸마다 따로 논다). 가입 화면의
//    "비밀번호"와 "비밀번호 확인"을 한 스위치로 묶으면, 확인 칸을 눈으로
//    맞춰 보려고 열었을 때 위 칸까지 같이 드러난다.
//  🔴type 을 바꾸면 브라우저가 칸을 새 것으로 볼 때가 있어 자동완성이 흔들린다 —
//    autoComplete 를 항상 넘겨서 무엇을 채울 칸인지 알려 준다.
// ==========================================================================
export function PasswordField({
  label, value, onChange, autoComplete, showLabel, hideLabel,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  showLabel: string;
  hideLabel: string;
}) {
  const [shown, setShown] = useState(false);
  return (
    <>
      <label className="fld-label">{label}</label>
      <div className="pw-wrap">
        <input
          className="fld" type={shown ? "text" : "password"} value={value}
          required minLength={6} autoComplete={autoComplete}
          onChange={(e) => onChange(e.target.value)}
        />
        <button
          type="button" className="pw-eye" onClick={() => setShown(!shown)}
          aria-label={shown ? hideLabel : showLabel} title={shown ? hideLabel : showLabel}
        >
          <PwEyeIcon shown={shown} />
        </button>
      </div>
    </>
  );
}
