"use client";
import { useEffect, useRef, useState } from "react";
import { useLanguage, LANGS, type Lang } from "@/lib/i18n";

// ==========================================================================
//  LANGUAGE — 화면 언어를 고르는 단추 하나(2026-09-03 사용자 지시).
//
//  🔴전에는 [EN | 한국어] 토글이 화면마다 네 벌 있었다(홈·어두운 막대·로그인
//    상자·밝은 띠). 언어가 여덟이 되면서 토글은 더 못 쓴다 — 이 하나로 모았다.
//    ⛔다른 화면에 언어 단추를 새로 만들지 말 것. 여기 하나를 가져다 쓴다.
//
//  🔴색을 여기서 정하지 않는다. 감싸는 화면의 --tx/--mut/--line/--card 를 그대로
//    쓰고, 그 값이 없는 밝은 화면에서는 var() 의 뒤값(밝은 색)이 선다. 그래서
//    어두운 랜딩과 흰 띠가 같은 부품 하나를 쓴다.
//
//  🔴목록의 차례·이름·깃발은 lib/i18n.ts 의 LANGS 한 곳에서 온다
//    (archiMap 과 같은 벌이다). 여기 직접 적지 말 것.
// ==========================================================================

const CSS = `
  .mlang { position: relative; display: inline-flex; }
  .mlang-btn {
    display: inline-flex; align-items: center; gap: 7px;
    background: none; cursor: pointer;
    border: 1px solid var(--line, #e6e6e6); border-radius: var(--r, 2px);
    font-family: var(--mono, ui-monospace, monospace);
    font-size: 0.66rem; letter-spacing: 0.08em; text-transform: uppercase;
    color: var(--mut, #8a8a86); padding: 7px 11px;
    transition: color .15s, border-color .15s;
  }
  .mlang-btn:hover, .mlang-btn[aria-expanded="true"] { color: var(--tx, #1a1a1a); border-color: var(--line2, #cfcfcf); }
  .mlang-btn i { font-style: normal; font-size: 0.9em; opacity: 0.75; }

  .mlang-pop {
    position: absolute; top: calc(100% + 6px); right: 0; z-index: 60;
    min-width: 178px; padding: 5px;
    background: var(--card, #fff); border: 1px solid var(--line, #e6e6e6);
    border-radius: var(--r, 2px); box-shadow: 0 18px 40px rgba(0,0,0,0.34);
  }
  .mlang-pop button {
    display: flex; align-items: center; gap: 9px; width: 100%;
    background: none; border: none; cursor: pointer; text-align: left;
    font-family: inherit; font-size: 0.8rem; letter-spacing: -0.01em;
    color: var(--mut, #666); padding: 8px 10px; border-radius: var(--r, 2px);
    transition: background .12s, color .12s;
  }
  .mlang-pop button:hover { background: var(--line, rgba(0,0,0,0.05)); color: var(--tx, #111); }
  .mlang-pop button.on { color: var(--acc, #b4560f); font-weight: 700; }
  .mlang-pop button span.f { font-size: 1rem; line-height: 1; }

  @media (max-width: 640px) {
    .mlang-btn { padding: 6px 9px; font-size: 0.62rem; }
  }
`;

export default function LanguageMenu({ className }: { className?: string }) {
  const { lang, setLang } = useLanguage();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // 바깥을 누르거나 Esc 를 누르면 닫힌다 — 열어 놓은 채로 화면을 떠나면
  //   다음 화면 위에 목록이 남는다.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (code: Lang) => { setLang(code); setOpen(false); };

  return (
    <div className={`mlang${className ? " " + className : ""}`} ref={box}>
      <style>{CSS}</style>
      <button
        type="button"
        className="mlang-btn"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        onClick={() => setOpen((v) => !v)}
      >
        Language<i>▾</i>
      </button>

      {open && (
        <div className="mlang-pop" role="listbox">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              role="option"
              aria-selected={l.code === lang}
              className={l.code === lang ? "on" : ""}
              onClick={() => pick(l.code)}
            >
              <span className="f">{l.flag}</span>
              {l.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
