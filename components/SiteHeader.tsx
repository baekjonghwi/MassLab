"use client";
import { useLanguage } from "@/lib/i18n";
import { SUBSCRIPTION_LIVE, PRICING_HREF } from "@/lib/interim";
import { useSignedIn } from "@/lib/use-signed-in";
import { LASERFISH_DOWNLOAD, LASERFISH_GUIDE } from "@/lib/products";

// ==========================================================================
//  모든 화면이 함께 쓰는 상단 막대.
//
//  🔴이게 없는 화면은 "돌아갈 곳이 없는 화면"이 된다 — /account가 그랬다
//    (2026-08-18, 메일 확인 후 떨어진 사람이 홈으로 갈 길이 없었다).
//    새 화면을 만들면 이걸 먼저 얹는다.
//  ⚠️홈(app/page.tsx)과 안내 화면들은 아직 각자 복사본을 쓴다 — 메뉴를 하나 더할
//    일이 생기면 그 화면들도 같이 고쳐야 한다.
// ==========================================================================

// 🔴[사용방법]과 [다운로드]는 **밖으로 나간다** — 정본이 LaserFish 소개 사이트다
//   (다운로드 2026-08-28, 사용방법 2026-08-29). MassLabs 안쪽 화면 둘은 지웠다.
//   ⚠️주소는 lib/products.ts 한 곳에서 온다. 여기 직접 적지 말 것.
const LINKS = [
  { href: LASERFISH_GUIDE, ko: "사용방법", en: "How to Use" },
  { href: LASERFISH_DOWNLOAD, ko: "다운로드", en: "Download" },
  // 🔴주소는 lib/interim.ts 의 PRICING_HREF 다 — 구독을 안 파는 동안에는
  //   /price 가 아니라 홈의 가격 구역(/#pricing)이 값을 말한다(2026-08-29).
  { href: PRICING_HREF, ko: "비용", en: "Pricing" },
  { href: "/contact", ko: "문의하기", en: "Contact" },
];

// 🔴[내 구독]이 붙는 조건은 두 가지다 —
//   1) 구독을 파는 동안에만(lib/interim.ts, 임시). 안 파는 동안에는 /account 자체가
//      next.config.ts 에서 홈으로 돌아가므로, 메뉴에 두면 죽은 링크가 된다.
//   2) **로그인한 사람에게만.** 로그아웃한 사람에게는 남의 구독 화면으로 가는
//      문일 뿐이고, 눌러도 /login 으로 튕긴다.
//   ⚠️조건 2 를 빠뜨리면 로그아웃한 사람 눈에 [My Plan]과 [Sign in]이 나란히 뜬다
//     — 지운 HomeView 의 막대가 실제로 그랬다(2026-08-26).
const MY_PLAN = { href: "/account", ko: "내 구독", en: "My Plan" };

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
  // null(아직 모른다)이면 [내 구독]을 그리지 않는다 — 먼저 띄웠다 지우면 깜빡인다.
  const signedIn = useSignedIn();

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
          <a href="/" className="hnav-brand">MassLabs</a>

          <div className="hnav-links" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {[...LINKS, ...(SUBSCRIPTION_LIVE && signedIn === true ? [MY_PLAN] : [])].map((l) => (
              <a
                key={l.href}
                href={l.href}
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
