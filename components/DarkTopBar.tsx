"use client";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";

// ==========================================================================
//  어두운 화면들이 함께 쓰는 상단 막대 — 로고(홈으로) · 링크 몇 개 · 언어.
//
//  🔴어두운 화면에는 전역 상단 띠(components/LanguageBar)가 안 붙는다
//    (lib/dark-pages.ts). 그래서 화면마다 **제 손으로** 돌아갈 길과 언어 토글을
//    가져야 하는데, 그걸 화면마다 베껴 두면 셋이 조금씩 다르게 자란다.
//    → 로그인(AuthShell)과 /account 가 이 하나를 함께 쓴다.
//
//  🔴색은 여기서 정하지 않는다. 감싸는 화면의 --tx/--mut/--line 을 그대로 쓴다 —
//    화면마다 바탕이 조금씩 다른데 여기서 값을 박으면 한 곳에서 어긋난다.
//    ⚠️쓰는 쪽은 DARK_TOPBAR_CSS 를 제 <style> 안에 반드시 넣어야 한다.
// ==========================================================================

export type DarkLink = { href: string; ko: string; en: string };

export const DARK_TOPBAR_CSS = `
  .dtb {
    position: fixed; top: 0; left: 0; right: 0; z-index: 40;
    display: flex; align-items: center; justify-content: space-between; gap: 16px;
    height: 60px; padding: 0 clamp(20px, 3.6vw, 60px);
    border-bottom: 1px solid var(--line);
    background: rgba(14,14,15,0.82); backdrop-filter: blur(14px);
  }
  .dtb-brand { font-size: 1rem; font-weight: 800; letter-spacing: -0.03em; color: var(--tx); text-decoration: none; }
  .dtb-brand span { color: var(--dim); }
  .dtb-right { display: flex; align-items: center; gap: 4px; }
  .dtb-right a {
    font-family: var(--mono); font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--mut); text-decoration: none; padding: 8px 11px; transition: color .15s;
  }
  .dtb-right a:hover { color: var(--tx); }
  /* 지금 보고 있는 화면 — 강조 톤을 쓰는 정해진 자리 중 하나다 */
  .dtb-right a.on { color: var(--acc); }
  .dtb-lang { display: flex; margin-left: 8px; border: 1px solid var(--line); border-radius: var(--r); }
  .dtb-lang button {
    background: none; border: none; cursor: pointer; font-family: var(--mono);
    font-size: 0.66rem; letter-spacing: 0.08em; color: var(--mut);
    padding: 7px 11px; transition: background .15s, color .15s;
  }
  .dtb-lang button.on { background: var(--tx); color: var(--bg); }

  @media (max-width: 720px) {
    .dtb { height: auto; flex-direction: column; gap: 4px; padding-top: 9px; padding-bottom: 9px; }
    .dtb-right { flex-wrap: wrap; justify-content: center; gap: 0; }
    .dtb-right a { font-size: 0.65rem; padding: 6px 8px; }
  }
`;

export default function DarkTopBar({
  links = [],
  active,
}: {
  links?: DarkLink[];
  /** 지금 보고 있는 주소. 그 링크만 밝게 남는다. */
  active?: string;
}) {
  const { lang, setLang } = useLanguage();

  return (
    <div className="dtb">
      <Link href="/" className="dtb-brand">Mass<span>Labs</span></Link>
      <div className="dtb-right">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className={l.href === active ? "on" : ""}>
            {lang === "ko" ? l.ko : l.en}
          </Link>
        ))}
        <div className="dtb-lang">
          <button className={lang === "en" ? "on" : ""} onClick={() => setLang("en")}>EN</button>
          <button className={lang === "ko" ? "on" : ""} onClick={() => setLang("ko")}>한국어</button>
        </div>
      </div>
    </div>
  );
}
