"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 나중에 실제 로그인 로직 추가
    router.push("/");
  };

  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#ffffff",
      color: "#1a1a1a",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .input-field {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: inherit;
          color: #1a1a1a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: #aaa;
        }
        .input-field::placeholder {
          color: #bbb;
        }

        .login-submit {
          width: 100%;
          padding: 11px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
        }
        .login-submit:hover { background: #333; }

        .google-btn {
          width: 100%;
          padding: 10px;
          background: #fff;
          color: #1a1a1a;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: background 0.2s;
        }
        .google-btn:hover { background: #f8f8f8; }

        .forgot-link {
          font-size: 0.78rem;
          color: #4a90e2;
          text-decoration: none;
          cursor: pointer;
        }
        .forgot-link:hover { text-decoration: underline; }

        .signup-link {
          color: #4a90e2;
          font-size: 0.82rem;
          text-decoration: none;
          cursor: pointer;
        }
        .signup-link:hover { text-decoration: underline; }
      `}</style>

      <div style={{ width: "100%", maxWidth: "380px", padding: "0 24px" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{
            fontSize: "1.6rem",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            marginBottom: "6px",
          }}>
            Welcome back!
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#888" }}>
            Enter your credentials to access your account
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleLogin}>

          {/* 이메일 */}
          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: "6px" }}>
              Email address
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 비밀번호 */}
          <div style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: 500 }}>
                Password
              </label>
              <a className="forgot-link">forgot password</a>
            </div>
            <input
              className="input-field"
              type="password"
              placeholder="Name"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Remember me */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "20px" }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ width: "13px", height: "13px", cursor: "pointer" }}
            />
            <label htmlFor="remember" style={{ fontSize: "0.78rem", color: "#555", cursor: "pointer" }}>
              Remember for 30 days
            </label>
          </div>

          {/* 로그인 버튼 */}
          <button className="login-submit" type="submit">
            Login
          </button>
        </form>

        {/* 구분선 */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          margin: "24px 0",
        }}>
          <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }} />
          <span style={{ fontSize: "0.72rem", color: "#ccc" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }} />
        </div>

        {/* Google 로그인 */}
        <button className="google-btn">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        {/* 회원가입 링크 */}
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.82rem", color: "#888" }}>
          Don't have an account?{" "}
          <a className="signup-link" onClick={() => router.push("/signup")}>
            Sign Up
          </a>
        </p>

      </div>
    </main>
  );
}
