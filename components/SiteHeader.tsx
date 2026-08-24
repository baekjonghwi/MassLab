"use client";
import { useState, useEffect } from "react";
import { useLanguage } from "@/lib/i18n";
import { SUBSCRIPTION_LIVE } from "@/lib/interim";

// ==========================================================================
//  모든 화면이 함께 쓰는 상단 막대.
//
//  🔴이게 없는 화면은 "돌아갈 곳이 없는 화면"이 된다 — /account가 그랬다
//    (2026-08-18, 메일 확인 후 떨어진 사람이 홈으로 갈 길이 없었다).
//    새 화면을 만들면 이걸 먼저 얹는다.
//  ⚠️홈(app/page.tsx)과 안내 화면들은 아직 각자 복사본을 쓴다 — 메뉴를 하나 더할
//    일이 생기면 그 화면들도 같이 고쳐야 한다.
// ==========================================================================

// 🔴[내 구독]은 구독을 파는 동안에만 있다(lib/interim.ts, 임시) — 구독을 안 파는 동안
//   /account 자체가 next.config.ts에서 홈으로 돌아가므로, 메뉴에 두면 죽은 링크가 된다.
const LINKS = [
  { href: "/howtouse", ko: "사용방법", en: "How to Use" },
  { href: "/download", ko: "다운로드", en: "Download" },
  { href: "/price", ko: "비용", en: "Pricing" },
  { href: "/contact", ko: "문의하기", en: "Contact" },
  ...(SUBSCRIPTION_LIVE ? [{ href: "/account", ko: "내 구독", en: "My Plan" }] : []),
];

export const HEADER_CSS = `
  .hnav-link {
    font-size: 0.875rem; color: #444; text-decoration: none;
    padding: 7px 14px; border-radius: 8px; font-weight: 500;
    transition: background 0.15s, color 0.15s; cursor: pointer; white-space: nowrap;
  }
  .hnav-link:hover { background: #f2f2f2; color: #111; }
  .hnav-brand { font-size: 1.1rem; font-weight: 800; letter-spacing: -0.03em; color: #111; text-decoration: none; }
  @media (max-width: 640px) {
    .hnav-inner { flex-direction: column !important; height: auto !important; gap: 6px; padding: 10px 16px !important; }
    .hnav-links { flex-wrap: wrap; justify-content: center; gap: 0 !important; }
    .hnav-link { padding: 6px 9px; font-size: 0.8rem; }
  }
`;

export default function SiteHeader({ active }: { active?: string }) {
  const { lang } = useLanguage();

  // 🔴/main(구독을 팔던 시절의 홈, PG 심사용)에서 넘어온 화면인가.
  //   그렇다면 이 막대의 링크들도 그쪽으로 돌려보내야 한다 — 안 그러면
  //   [MassLabs]나 [비용] 한 번에 건당결제 화면으로 갈아타 버린다.
  //   ⚠️서버에서는 판정할 수 없으므로(주소 뒤 ?preview 는 브라우저만 안다)
  //     첫 그림은 항상 평소 링크이고, 붙은 뒤에 바뀐다.
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    setPreview(new URLSearchParams(window.location.search).has("preview"));
  }, []);

  return (
    <>
      <style>{HEADER_CSS}</style>
      <nav style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid #ebebeb",
      }}>
        <div className="hnav-inner" style={{
          maxWidth: "1200px", margin: "0 auto", padding: "0 48px", height: "58px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <a href={preview ? "/main" : "/"} className="hnav-brand">MassLabs</a>

          <div className="hnav-links" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {LINKS.map((l) => (
              <a
                key={l.href}
                // 🔴미리보기로 들어온 화면(/account?preview=1)에서는 구독을 팔던
                //   쪽으로 돌려보낸다. /price 로 내보내면 지금은 건당결제가 떠서,
                //   구독을 보던 사람이 딴 상품에 떨어진다.
                href={preview && l.href === "/price" ? "/main#pricing" : l.href}
                className="hnav-link"
                style={l.href === active ? { color: "#111", fontWeight: 700 } : undefined}
              >
                {lang === "ko" ? l.ko : l.en}
              </a>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}
