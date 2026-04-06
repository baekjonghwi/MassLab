"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const router = useRouter();

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // 나중에 실제 회원가입 로직 추가
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
        .input-field:focus { border-color: #aaa; }
        .input-field::placeholder { color: #bbb; }

        .signup-submit {
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
        .signup-submit:hover { background: #333; }
        .signup-submit:disabled { background: #ccc; cursor: not-allowed; }

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

        .terms-link {
          color: #1a1a1a;
          font-weight: 500;
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
        }
        .terms-link:hover { opacity: 0.6; }

        .login-link {
          color: #4a90e2;
          font-size: 0.82rem;
          text-decoration: none;
          cursor: pointer;
        }
        .login-link:hover { text-decoration: underline; }

        /* 모달 */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 24px;
        }
        .modal-box {
          background: #fff;
          border-radius: 14px;
          padding: 32px;
          max-width: 520px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          position: relative;
        }
        .modal-close {
          position: absolute;
          top: 16px;
          right: 20px;
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #aaa;
          line-height: 1;
        }
        .modal-close:hover { color: #1a1a1a; }
        .modal-section { margin-bottom: 24px; }
        .modal-section h3 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 10px;
          color: #1a1a1a;
        }
        .modal-section p, .modal-section li {
          font-size: 0.82rem;
          color: #666;
          line-height: 1.7;
        }
        .modal-section ul {
          padding-left: 16px;
        }
        .modal-section li { margin-bottom: 4px; }
        .modal-agree-btn {
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
          margin-top: 8px;
          transition: background 0.2s;
        }
        .modal-agree-btn:hover { background: #333; }
      `}</style>

      {/* 모달 */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTerms(false)}>×</button>

            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "24px", letterSpacing: "-0.01em" }}>
              Terms & Privacy Policy
            </h2>

            <div className="modal-section">
              <h3>1. 서비스 이용약관</h3>
              <ul>
                <li>MassLab은 건축 레이저 커팅 도면 자동화 툴을 제공합니다.</li>
                <li>본 서비스는 개인 및 상업적 용도로 사용할 수 있습니다.</li>
                <li>생성된 도면의 저작권은 사용자에게 귀속됩니다.</li>
                <li>툴의 무단 재배포 및 역공학은 금지됩니다.</li>
                <li>서비스는 사전 고지 없이 변경되거나 종료될 수 있습니다.</li>
              </ul>
            </div>

            <div className="modal-section">
              <h3>2. 결제 및 환불 정책</h3>
              <ul>
                <li>결제는 사용량 기준으로 부과됩니다 (면당 $0.15, 최소 $5).</li>
                <li>결제 완료 후 도면이 생성된 경우 환불이 불가합니다.</li>
                <li>기술적 오류로 인한 미생성 시 전액 환불됩니다.</li>
              </ul>
            </div>

            <div className="modal-section">
              <h3>3. 개인정보 수집 및 이용</h3>
              <ul>
                <li>수집 항목: 이메일, 이름, 결제 정보</li>
                <li>수집 목적: 회원 관리, 결제 처리, 서비스 개선</li>
                <li>보관 기간: 회원 탈퇴 후 30일까지</li>
                <li>제3자 제공: 결제 처리 목적 외 제3자에게 제공하지 않습니다.</li>
              </ul>
            </div>

            <div className="modal-section">
              <h3>4. 기하학 데이터 수집 (선택)</h3>
              <p>서비스 개선을 위해 익명화된 형상 데이터를 수집할 수 있습니다. 이는 선택 사항이며 거부해도 서비스 이용에 영향이 없습니다.</p>
            </div>

            <div className="modal-section">
              <h3>5. 사용자 권리</h3>
              <ul>
                <li>언제든지 개인정보 열람, 수정, 삭제를 요청할 수 있습니다.</li>
                <li>문의: g_mail 주소로 연락 바랍니다.</li>
              </ul>
            </div>

            <button
              className="modal-agree-btn"
              onClick={() => {
                setAgree(true);
                setShowTerms(false);
              }}
            >
              동의하고 닫기
            </button>
          </div>
        </div>
      )}

      <div style={{ width: "100%", maxWidth: "380px", padding: "0 24px" }}>

        {/* 헤더 */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Get Started Now
          </h1>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSignup}>

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: "6px" }}>
              Name
            </label>
            <input
              className="input-field"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

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

          <div style={{ marginBottom: "14px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <input
              className="input-field"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* 약관 동의 */}
          <div style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "20px" }}>
            <input
              type="checkbox"
              id="agree"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              style={{ width: "13px", height: "13px", cursor: "pointer" }}
            />
            <label htmlFor="agree" style={{ fontSize: "0.78rem", color: "#555", cursor: "pointer" }}>
              I agree to the{" "}
              <button
                className="terms-link"
                type="button"
                onClick={() => setShowTerms(true)}
              >
                terms & policy
              </button>
            </label>
          </div>

          <button className="signup-submit" type="submit" disabled={!agree}>
            Signup
          </button>
        </form>

        {/* 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", margin: "24px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }} />
          <span style={{ fontSize: "0.72rem", color: "#ccc" }}>or</span>
          <div style={{ flex: 1, height: "1px", background: "#f0f0f0" }} />
        </div>

        <button className="google-btn">
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "0.82rem", color: "#888" }}>
          Have an account?{" "}
          <a className="login-link" onClick={() => router.push("/login")}>
            Login
          </a>
        </p>

      </div>
    </main>
  );
}
