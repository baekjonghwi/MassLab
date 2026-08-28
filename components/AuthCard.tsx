"use client";
import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

// ==========================================================================
//  로그인·비밀번호 재설정 화면이 함께 쓰는 껍데기.
//
//  🔴두 화면이 같은 상자를 쓴다(app/login, app/reset-password). 스타일을 한쪽에
//    복사해 두면 나중에 한쪽만 고쳐져서 재설정 화면만 옛날 모양으로 남는다.
//    → 고칠 일이 생기면 여기 한 곳만 고친다.
//
//  🔴2026-08-27 어두운 화면으로 갈아입혔다 — 홈(components/LandingView)과 같은
//    결이어야 로그인이 "딴 사이트로 튕긴 것"처럼 안 느껴진다. 값도 저쪽과 같은
//    이름으로 맞춰 뒀다(--bg/--card/--acc …).
//    ⚠️값을 두 벌 적는 셈이라 완전히 안전하진 않다. 홈의 --acc 를 바꾸면 여기
//      --acc 도 함께 바꿀 것. (한 파일로 묶기엔 홈 CSS 가 이 화면에 안 온다.)
//
//  ⚠️/account/security 는 이 파일에서 **PwEyeIcon 그림만** 가져다 쓴다. 저 화면은
//    아직 밝은 화면이라 여기 색을 따라오지 않는다 — 같이 어둡게 만들지 말 것.
// ==========================================================================

const AUTH_CSS = `
  .auth-shell {
    --bg:   #0e0e0f;
    --bg2:  #131315;
    --card: #17171a;
    --line: rgba(255,255,255,0.10);
    --line2:rgba(255,255,255,0.22);
    --tx:   #eceae6;
    --mut:  #8a8a86;
    --dim:  #555552;
    --acc:  #e8802e;
    --accx: #140f0a;
    --r:    2px;
    --mono: var(--font-geist-mono), ui-monospace, monospace;

    font-family: var(--font-geist-sans), -apple-system, 'Helvetica Neue', sans-serif;
    letter-spacing: -0.01em;
    background: var(--bg); color: var(--tx); min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 92px 24px 40px;
  }
  .auth-shell *, .auth-shell *::before, .auth-shell *::after { box-sizing: border-box; }
  .auth-shell ::selection { background: var(--acc); color: var(--accx); }
  .auth-shell a { color: inherit; text-decoration: none; }

  /* 위 줄 — 돌아갈 길과 언어. 🔴이게 없으면 로그인 화면이 막다른 길이 된다. */
  .auth-top {
    position: fixed; top: 0; left: 0; right: 0; z-index: 5;
    display: flex; align-items: center; justify-content: space-between;
    height: 60px; padding: 0 clamp(20px, 3.6vw, 60px);
    border-bottom: 1px solid var(--line); background: rgba(14,14,15,0.82); backdrop-filter: blur(14px);
  }
  .auth-brand { font-size: 1rem; font-weight: 800; letter-spacing: -0.03em; }
  .auth-brand span { color: var(--dim); }
  .auth-lang { display: flex; border: 1px solid var(--line); border-radius: var(--r); }
  .auth-lang button {
    background: none; border: none; cursor: pointer; font-family: var(--mono);
    font-size: 0.66rem; letter-spacing: 0.08em; color: var(--mut);
    padding: 7px 11px; transition: background .15s, color .15s;
  }
  .auth-lang button.on { background: var(--tx); color: var(--bg); }

  .auth-box {
    background: var(--card); border: 1px solid var(--line); border-radius: var(--r);
    padding: 34px 30px 26px; width: 100%; max-width: 392px;
    box-shadow: 0 22px 60px rgba(0,0,0,0.45);
  }

  .fld-label {
    display: block; font-family: var(--mono); font-size: 0.6rem; letter-spacing: 0.2em;
    text-transform: uppercase; color: var(--dim); margin-bottom: 7px;
  }
  .fld {
    width: 100%; padding: 11px 12px; background: var(--bg2); color: var(--tx);
    border: 1px solid var(--line); border-radius: var(--r);
    font-size: 0.9rem; font-family: inherit; margin-bottom: 15px;
    transition: border-color .15s;
  }
  .fld::placeholder { color: var(--dim); }
  .fld:focus { outline: none; border-color: var(--acc); }
  /* 🔴크롬 자동완성은 제 흰 바닥을 강제로 칠한다. 안 막으면 어두운 화면에
       흰 칸 하나만 덩그러니 남고 글자가 안 보인다. */
  .fld:-webkit-autofill, .fld:-webkit-autofill:focus {
    -webkit-text-fill-color: var(--tx);
    -webkit-box-shadow: inset 0 0 0 1000px #131315;
    caret-color: var(--tx);
  }

  .pw-wrap { position: relative; }
  .pw-wrap .fld { padding-right: 40px; }
  /* 🔴height 는 .fld 의 margin-bottom(15px)을 뺀 값 — 감싸개 높이엔 그 여백이 포함된다. */
  .pw-eye {
    position: absolute; top: 0; right: 0; height: calc(100% - 15px); width: 38px;
    display: flex; align-items: center; justify-content: center;
    background: none; border: none; padding: 0; color: var(--dim); cursor: pointer;
    transition: color .15s;
  }
  .pw-eye:hover { color: var(--tx); }
  .pw-eye:focus-visible { outline: 2px solid var(--acc); outline-offset: -2px; border-radius: var(--r); }

  .seg { display: flex; gap: 8px; }
  .seg-btn {
    flex: 1; padding: 10px 8px; border: 1px solid var(--line); border-radius: var(--r);
    background: var(--bg2); font-size: 0.82rem; font-family: inherit; color: var(--mut);
    cursor: pointer; transition: border-color .15s, color .15s, background .15s;
  }
  .seg-btn:hover { border-color: var(--line2); color: var(--tx); }
  .seg-btn.on { border-color: var(--acc); background: var(--acc); color: var(--accx); }

  .hint { font-size: 0.72rem; color: var(--dim); margin-top: 7px; line-height: 1.6; }

  .main-btn {
    width: 100%; padding: 12px; background: var(--acc); color: var(--accx);
    border: none; border-radius: var(--r);
    font-size: 0.88rem; font-weight: 700; font-family: inherit; cursor: pointer;
    margin-top: 18px; transition: filter .18s, transform .18s;
  }
  .main-btn:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-2px); }
  .main-btn:disabled { background: #2a2a2d; color: var(--dim); cursor: not-allowed; }

  .g-btn {
    width: 100%; display: flex; align-items: center; justify-content: center; gap: 9px;
    padding: 11px; background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r);
    font-size: 0.86rem; font-weight: 600; font-family: inherit; color: var(--tx);
    cursor: pointer; transition: border-color .15s, transform .18s;
  }
  .g-btn:hover:not(:disabled) { border-color: var(--line2); transform: translateY(-2px); }
  .g-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  .divider { display: flex; align-items: center; gap: 10px; margin: 20px 0 15px; }
  .divider::before, .divider::after { content: ""; flex: 1; height: 1px; background: var(--line); }
  .divider span { font-family: var(--mono); font-size: 0.62rem; letter-spacing: 0.18em; text-transform: uppercase; color: var(--dim); }

  .msg { font-size: 0.78rem; margin-top: 13px; line-height: 1.6; }
  /* ⚠️밝은 화면에서 쓰던 #e53e3e · #2f855a 는 어두운 바닥에서 안 읽힌다. */
  .msg.err { color: #ff6f60; }
  .msg.ok { color: #62d191; }

  .links {
    display: flex; justify-content: space-between; gap: 12px;
    margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--line);
  }
  .links button {
    background: none; border: none; padding: 0; font-size: 0.76rem; color: var(--mut);
    font-family: inherit; cursor: pointer; transition: color .15s;
  }
  .links button:hover { color: var(--acc); }

  .auth-back {
    margin-top: 22px; font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--dim); transition: color .15s;
  }
  .auth-back:hover { color: var(--acc); }

  /* 상자 아래 줄 — 화면이 스스로 넣는 길(로그인이면 가입·비밀번호 찾기, 그 밖이면 로그인으로).
     글자 규격은 위 .auth-back 과 같다: 같은 자리를 대신 쓰는 것이라 결이 갈리면 안 된다.
     ⚠️이 문자열은 템플릿 리터럴이다 — 주석에도 백틱을 쓰지 말 것(그 자리에서 CSS가 끝나 버린다).
     ⚠️자간을 .14em으로 두면 'FORGOT YOUR PASSWORD?'가 상자 폭을 넘는다 → .1em.
     ⚠️그래도 좁은 화면에서는 접힐 수 있어 wrap을 허용한다. */
  .auth-foot {
    margin-top: 22px; width: 100%; max-width: 392px;
    display: flex; flex-wrap: wrap; justify-content: space-between; gap: 10px 18px;
  }
  /* 색은 흰 글자(--tx)다 — 옛 '홈으로'가 쓰던 --dim(#555552)은 돌아갈 길이 눈에 안 띄어도 되는
     보조 링크였기 때문인데, 이 자리는 이제 가입·비밀번호 찾기라 본문과 같은 무게로 읽혀야 한다
     (2026-08-29 사용자 지시). */
  .auth-foot button {
    background: none; border: none; padding: 0; cursor: pointer;
    font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--tx); transition: color .15s;
  }
  /* 하나뿐일 때는 가운데로 — 옛 '← 홈으로'가 있던 자리라 그 균형을 지킨다
     (둘일 때는 space-between이 양쪽 끝으로 벌린다). */
  .auth-foot button:only-child { margin: 0 auto; }
  .auth-foot button:hover { color: var(--acc); }

  @media (max-width: 560px) {
    .auth-shell { padding: 84px 18px 36px; }
    .auth-box { padding: 26px 20px 22px; }
  }
`;

// `footer` = 상자 아래 줄. 안 주면 예전처럼 '홈으로'가 뜬다(/reset-password가 그 경우다).
//   로그인 화면은 여기에 제 길(가입·비밀번호 찾기·로그인으로 돌아가기)을 넣고 '홈으로'를 대신한다
//   — 2026-08-29 사용자 지시. 상자 안이 아니라 이 자리인 이유 = 그게 원래 '돌아갈 길'의 자리다.
export function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  const { lang, setLang } = useLanguage();

  return (
    <main className="auth-shell">
      <style>{AUTH_CSS}</style>

      <div className="auth-top">
        <Link href="/" className="auth-brand">Mass<span>Labs</span></Link>
        <div className="auth-lang">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "ko" ? "on" : ""} onClick={() => setLang("ko")}>한국어</button>
        </div>
      </div>

      {children}

      {footer ? <div className="auth-foot">{footer}</div> : (
        <Link href="/" className="auth-back">
          {lang === "ko" ? "← 홈으로" : "← Back to home"}
        </Link>
      )}
    </main>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <div className="auth-box">{children}</div>;
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
