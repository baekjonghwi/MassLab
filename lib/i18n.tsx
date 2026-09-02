"use client";
import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from "react";
import { DICT } from "./i18n-dict";

// ==========================================================================
//  화면 언어 — 여덟이다(2026-09-03, archiMap 과 같은 벌).
//
//  🔴글은 여전히 **한국어·영어 두 벌만** 코드에 적는다. 나머지 여섯은
//    lib/i18n-dict.ts 가 **영어 문장을 열쇠로** 들고 있다. 그래서 화면 파일은
//    예전 그대로 { ko, en } 짝을 쓰면 되고, 언어가 늘어도 화면은 안 건드린다.
//    ⚠️영어 문장을 고치면 그게 곧 열쇠가 바뀌는 것이다 — 사전의 열쇠도 함께
//      고칠 것. 안 고치면 그 줄만 조용히 영어로 돌아간다(빈칸은 안 난다).
//
//  🔴언어 목록·판정 순서는 archiMap(public/app.js 의 LANGS·pickInitialLang)과
//    한 벌이다. 한쪽만 늘리면 두 사이트가 서로 다른 말을 하게 된다.
// ==========================================================================

export type Lang = "en" | "ko" | "ja" | "zh" | "es" | "pt" | "fr" | "de";

export const LANGS: { code: Lang; flag: string; name: string }[] = [
  { code: "ko", flag: "🇰🇷", name: "한국어" },
  { code: "en", flag: "🇺🇸", name: "English" },
  { code: "ja", flag: "🇯🇵", name: "日本語" },
  { code: "zh", flag: "🇨🇳", name: "中文（简体）" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "pt", flag: "🇵🇹", name: "Português" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
];

const LANG_CODES = new Set<string>(LANGS.map((l) => l.code));

// 'ko-KR'·'zh-Hant-TW' 같은 BCP-47 태그 → 우리 언어 코드.
//   중국어는 번체도 간체 사전으로 떨어뜨린다(번체 사전이 없다 — archiMap 과 같다).
function langOf(tag: string | null | undefined): Lang | "" {
  const base = String(tag || "").toLowerCase().split("-")[0];
  if (base === "zh") return "zh";
  return LANG_CODES.has(base) ? (base as Lang) : "";
}

const LANG_KEY = "lang";

// 🔴차례 = ①주소의 ?lang= ②지난번 고른 값 ③브라우저 언어 ④영어.
//   ①이 맨 앞인 이유 = 제품 사이트와 언어를 주고받기 위해서다(archiMap 도 같다).
export function pickInitialLang(): Lang {
  try { const q = langOf(new URLSearchParams(location.search).get("lang")); if (q) return q; } catch {}
  try { const s = localStorage.getItem(LANG_KEY); if (s && LANG_CODES.has(s)) return s as Lang; } catch {}
  try {
    const list = navigator.languages?.length ? navigator.languages : [navigator.language];
    for (const tag of list) { const c = langOf(tag); if (c) return c; }
  } catch {}
  return "en";
}

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
}>({ lang: "en", setLang: () => {} });

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 🔴서버가 그리는 첫 판은 늘 영어다. 여기서 브라우저 값을 바로 읽으면
  //   서버·브라우저의 첫 그림이 어긋나 하이드레이션이 깨진다 — 아래 effect 가
  //   그린 뒤에 갈아 끼운다.
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    setLang(pickInitialLang());
  }, []);

  // 🔴<html lang> 도 함께 갱신한다. app/layout.tsx 는 서버 컴포넌트라 lang="en" 으로
  //   고정돼 있는데, 그대로 두면 다른 언어 본문을 스크린리더·번역기·검색엔진이 영어로 읽는다.
  //   여기서 처리해야 초기 자동판정(저장값·브라우저 언어)과 언어 선택이 한 곳에서 끝난다 —
  //   layout 쪽에 따로 심으면 판정 로직이 두 벌이 되어 반드시 어긋난다.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const handleSetLang = (l: Lang) => {
    setLang(l);
    try { localStorage.setItem(LANG_KEY, l); } catch {}
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

// ==========================================================================
//  번역 — 여기 셋이 전부다.
//    · trs(lang, ko, en)   문장 하나
//    · trPick(lang, {ko,en}) 짝으로 적어 둔 덩어리(글 묶음·표·목록)
//    · useT() / useTx()    화면 안에서 쓰는 같은 것
// ==========================================================================

/** 문장 하나. ko/en 은 코드에 적힌 원문이고, 나머지 여섯은 영어를 열쇠로 사전에서 찾는다. */
export function trs(lang: Lang, ko: string, en: string): string {
  if (lang === "ko") return ko;
  if (lang === "en") return en;
  return DICT[lang]?.[en] ?? en;
}

/** 사전에 없으면 영어 그대로 — 빈칸이 나는 일은 없다. */
function trOne(lang: Lang, en: string): string {
  return DICT[lang]?.[en] ?? en;
}

// 글 묶음은 화면마다 모듈 상수라, 언어별로 딱 한 번만 짓고 재사용한다.
//   (매 렌더마다 새 객체를 만들면 그걸 받는 쪽의 memo 가 전부 헛돈다.)
const deepCache = new WeakMap<object, Partial<Record<Lang, unknown>>>();

function deepTr<T>(lang: Lang, v: T): T {
  if (typeof v === "string") return trOne(lang, v) as unknown as T;
  if (v === null || typeof v !== "object") return v;

  const box = deepCache.get(v as object) ?? {};
  const hit = box[lang];
  if (hit !== undefined) return hit as T;

  let out: unknown;
  if (Array.isArray(v)) {
    out = v.map((x) => deepTr(lang, x));
  } else {
    const o: Record<string, unknown> = {};
    for (const [k, val] of Object.entries(v as Record<string, unknown>)) o[k] = deepTr(lang, val);
    out = o;
  }
  box[lang] = out;
  deepCache.set(v as object, box);
  return out as T;
}

/**
 * { ko, en } 짝에서 지금 언어의 것을 고른다.
 * 🔴한국어면 ko, 영어면 en, 나머지는 **en 을 통째로 사전에 통과시킨 것**이다 —
 *   문자열·배열·객체 어디까지든 따라 들어간다(함수는 그대로 지나간다).
 */
export function trPick<T>(lang: Lang, pair: { ko: T; en: T }): T {
  if (lang === "ko") return pair.ko;
  if (lang === "en") return pair.en;
  return deepTr(lang, pair.en);
}

/**
 * 문장 안의 자리표시자를 채운다 — `fmt(T(…), { min: 9.9 })`.
 * 🔴숫자·금액을 문장에 이어 붙이지 말 것. 붙여 쓰면 언어마다 어순이 달라 문장이
 *   깨지고, 사전의 열쇠도 값에 따라 달라져 영영 안 맞는다.
 */
export function fmt(s: string, vars: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** 화면 안에서 문장 하나를 옮길 때: `const T = useT(); T("한국어", "English")` */
export function useT() {
  const { lang } = useLanguage();
  return useMemo(() => (ko: string, en: string) => trs(lang, ko, en), [lang]);
}

/** 화면 안에서 글 묶음(TX)을 고를 때: `const x = useTx(TX)` */
export function useTx<T>(pair: { ko: T; en: T }): T {
  const { lang } = useLanguage();
  return useMemo(() => trPick(lang, pair), [lang, pair]);
}

// ==========================================================================
//  🔴제목 한 줄에 들어가는 표시 둘 — 여덟 언어를 쓰면서 JSX 를 언어마다 적을
//    수는 없다. 그래서 문장 안에 표시를 넣고 여기서 푼다.
//      *…*  → <em> (제목의 뒷동강. 색이 아니라 자리로만 구실한다)
//      \n   → <br>
//    사전의 열쇠도 이 표시가 든 영어 문장 그대로다.
// ==========================================================================
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((p, i) => {
        const em = p.startsWith("*") && p.endsWith("*") && p.length > 2;
        const body = em ? p.slice(1, -1) : p;
        const lines = body.split("\n");
        const inner = lines.map((ln, j) => (
          <span key={j}>
            {j > 0 && <br />}
            {ln}
          </span>
        ));
        return em ? <em key={i}>{inner}</em> : <span key={i}>{inner}</span>;
      })}
    </>
  );
}

/** `Rich` 를 쓸 때의 짝 — `<T2 ko="…" en="…" />` 한 줄로 끝낸다. */
export function TRich({ ko, en }: { ko: string; en: string }) {
  const { lang } = useLanguage();
  return <Rich text={trs(lang, ko, en)} />;
}
