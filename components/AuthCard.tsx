"use client";
import type { ReactNode } from "react";

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
