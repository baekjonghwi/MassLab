"use client";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import DarkTopBar, { DARK_TOPBAR_CSS, type DarkLink } from "@/components/DarkTopBar";

// ==========================================================================
//  약관 · 방침 화면의 껍데기 — /policy/terms-and-policy 와 /policy/privacy 가
//  이 하나를 함께 쓴다.
//
//  🔴2026-08-27 어두운 화면으로 갈아입혔다 — 홈(components/LandingView)과 같은 결.
//    ⚠️값 이름과 색을 저쪽에서 베껴 온 셈이다. 홈의 --acc(주황)를 바꾸면
//      여기와 app/account/page.tsx · components/AuthCard 도 함께 바꿀 것.
//    ⚠️어두운 화면이므로 lib/dark-pages.ts 의 DARK_PAGES 에 두 주소가 들어 있어야
//      한다 — 빠지면 위에 흰 띠(LanguageBar)와 밝은 바닥글이 덧붙는다.
//
//  🔴글은 하나도 여기 적지 않는다. lib/translations 의 t[lang].terms / .privacy 가
//    유일한 출처다 — PG 가맹점 심사에 낸 문서라 두 벌이 되면 안 된다.
//
//  🔴두 문서가 서로를 가리킨다(위 막대의 링크 둘). 약관을 읽던 사람이 방침으로
//    건너갈 길이 없으면 홈까지 되돌아갔다 와야 한다.
// ==========================================================================

const POLICY_LINKS: DarkLink[] = [
  { href: "/policy/terms-and-policy", ko: "이용약관", en: "Terms" },
  { href: "/policy/privacy", ko: "개인정보", en: "Privacy" },
];

// 조 하나. 어느 문서든 body · list · body2 가 있을 수도 없을 수도 있다.
export type PolicySection = {
  title: string;
  body?: string;
  list?: readonly string[];
  body2?: string;
};

export default function PolicyView({
  eyebrow,
  doc,
}: {
  eyebrow: { ko: string; en: string };
  doc: {
    back: string;
    title: string;
    effectiveDate: string;
    sections: readonly PolicySection[];
  };
}) {
  const router = useRouter();
  const { lang } = useLanguage();

  return (
    <main className="pol">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .pol {
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
        }
        .pol ::selection { background: var(--acc); color: var(--accx); }
        ${DARK_TOPBAR_CSS}

        .pol-wrap { max-width: 900px; margin: 0 auto; padding: 108px 20px 96px; }

        /* 홈의 lp-eyebrow 와 같은 모양 — 주황 짧은 선 + 대문자 작은 글씨 */
        .pol-eyebrow {
          display: flex; align-items: center; gap: 12px;
          font-family: var(--mono); font-size: 0.66rem; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--acc); margin-bottom: 20px;
        }
        .pol-eyebrow::before { content: ""; width: 40px; height: 1px; background: var(--acc); }

        .pol-title { font-size: clamp(1.8rem, 4.4vw, 2.9rem); font-weight: 800; letter-spacing: -0.04em; line-height: 1.08; }
        .pol-date {
          font-family: var(--mono); font-size: 0.68rem; letter-spacing: 0.04em; line-height: 1.8;
          color: var(--dim); margin-top: 18px; padding-bottom: 34px; border-bottom: 1px solid var(--line);
        }

        /* 🔴조는 왼쪽에 번호·제목, 오른쪽에 본문을 두는 두 칸이다. 조가 스물 몇
             개라 제목이 본문 위에 얹히면 어디까지가 한 조인지 눈으로 안 잡힌다.
             ⚠️왼쪽 칸은 sticky 다 — 긴 조를 읽는 동안 제목이 따라 붙어 있어야 한다. */
        .pol-sec {
          display: grid; grid-template-columns: 220px minmax(0,1fr); gap: 28px;
          padding: 34px 0; border-bottom: 1px solid var(--line);
        }
        .pol-sec-head { position: sticky; top: 84px; align-self: start; }
        .pol-no { font-family: var(--mono); font-size: 0.64rem; letter-spacing: 0.18em; color: var(--acc); }
        .pol-sec-head h2 { font-size: 0.98rem; font-weight: 700; letter-spacing: -0.02em; line-height: 1.5; margin-top: 8px; }

        .pol-body { color: var(--mut); font-size: 0.88rem; line-height: 1.95; white-space: pre-line; }
        .pol-body + .pol-body, .pol-list + .pol-body { margin-top: 12px; }
        .pol-list { list-style: none; margin-top: 14px; display: flex; flex-direction: column; gap: 9px; }
        .pol-list li {
          position: relative; padding-left: 18px;
          color: var(--mut); font-size: 0.86rem; line-height: 1.85;
        }
        .pol-list li::before {
          content: ""; position: absolute; left: 0; top: 0.78em;
          width: 6px; height: 1px; background: var(--acc);
        }
        .pol-body + .pol-list { margin-top: 12px; }

        .pol-foot { display: flex; justify-content: center; margin-top: 46px; }
        .pol-back {
          background: var(--bg2); border: 1px solid var(--line); border-radius: var(--r);
          color: var(--mut); font-family: inherit; font-size: 0.79rem; cursor: pointer;
          padding: 11px 20px; transition: border-color .15s, color .15s;
        }
        .pol-back:hover { border-color: var(--line2); color: var(--tx); }

        @media (max-width: 720px) {
          .pol-wrap { padding-top: 128px; }
          .pol-sec { grid-template-columns: minmax(0,1fr); gap: 12px; }
          .pol-sec-head { position: static; }
        }
      `}</style>

      <DarkTopBar links={POLICY_LINKS} />

      <div className="pol-wrap">
        <div className="pol-eyebrow">{lang === "ko" ? eyebrow.ko : eyebrow.en}</div>
        <h1 className="pol-title">{doc.title}</h1>
        <p className="pol-date">{doc.effectiveDate}</p>

        {doc.sections.map((section, i) => (
          <section className="pol-sec" key={i}>
            <div className="pol-sec-head">
              <div className="pol-no">{String(i + 1).padStart(2, "0")}</div>
              <h2>{section.title}</h2>
            </div>
            <div>
              {section.body && <p className="pol-body">{section.body}</p>}
              {section.list && (
                <ul className="pol-list">
                  {section.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
              {section.body2 && <p className="pol-body">{section.body2}</p>}
            </div>
          </section>
        ))}

        <div className="pol-foot">
          <button className="pol-back" onClick={() => router.back()}>{doc.back}</button>
        </div>
      </div>
    </main>
  );
}
