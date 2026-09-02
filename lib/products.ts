// ==========================================================================
//  형제 제품 사이트로 나가는 주소.
//
//  🔴제품은 각자 독립 저장소 · 독립 Vercel 프로젝트다(CLAUDE.md 표 참고).
//    import 를 나눠 쓸 수 없으니, 주소만이라도 여기 한 곳에 모은다.
//    ⛔화면 파일에 주소를 직접 적지 말 것 — 하나가 바뀌면 그 화면만 조용히 어긋난다.
//
//  🔴2026-08-28 — LaserFish 소개 사이트가 제 하위도메인에 섰고, **설치 안내의
//    정본이 그쪽이 되었다**(사용자 결정). 전에는 MassLabs 안쪽 /download 가
//    같은 글을 한 벌 더 갖고 있었는데, 그 화면은 지웠다.
//    남은 /download 는 next.config.ts 의 리다이렉트뿐이다 — 옛 링크·즐겨찾기를
//    받아 이 주소로 넘긴다. ⚠️그러니 이 주소를 지우려면 그 리다이렉트도 함께 볼 것.
// ==========================================================================

export const LASERFISH = "https://laserfish.masslabs-archi.com/";
export const LASERFISH_DOWNLOAD = "https://laserfish.masslabs-archi.com/download";
// 🔴2026-08-29 — 사용방법도 같은 길을 갔다(사용자 결정). MassLabs 안쪽
//   /howtouse 화면은 지웠다. 같은 글(탭·파라미터 설명·튜토리얼 영상)이 두 저장소에
//   살면서 갈라지던 것을 끝냈다 — LaserFish 의 app/guide 가 정본이다.
//   ⚠️/download 와 마찬가지로 next.config.ts 에 307 리다이렉트만 남아 옛 링크를 넘긴다.
export const LASERFISH_GUIDE = "https://laserfish.masslabs-archi.com/guide";

export const ARCHIMAP = "https://archimap.masslabs-archi.com/";
export const COLORGRAM = "https://colorgram.masslabs-archi.com/";

// ==========================================================================
//  나가는 링크에 지금 보고 있는 언어를 실어 보낸다(2026-09-03 사용자 결정).
//
//  🔴받는 쪽 사정이 셋 다 다르다 — 그래도 붙이는 건 한 곳에서 한다.
//    · archiMap  — 여덟 언어, `?lang=` 을 **맨 먼저** 읽는다(그쪽 pickInitialLang).
//                  지금 값이 실제로 통하는 곳은 여기뿐이다.
//    · LaserFish — 아직 ko·en 둘이고 `?lang=` 을 안 읽는다(그쪽 lib/i18n.tsx).
//                  지금은 조용히 무시되지만, 그쪽이 읽기 시작하는 날 이 코드는 이미 서 있다.
//    · Colorgram — 언어가 아예 없다(영어 전용). 늘 무시된다.
//
//  🔴영어일 때는 **안 붙인다.** 두 가지 이유다 —
//    ① 영어는 어차피 세 사이트 모두의 마지막 폴백이라 붙여도 달라지는 게 없다.
//    ② 서버가 그리는 판은 늘 영어다(lib/i18n 의 LanguageProvider). 그러니 검색
//       로봇이 보는 href 도 깨끗한 주소로 남는다 — `?lang=` 이 붙은 주소가
//       따로 색인되어 제품 사이트의 검색 결과가 갈라지는 일이 없다.
//
//  ⛔우리 안쪽 주소(`/contact`·`/#pricing`)에는 붙이지 않는다. 같은 창 안에서는
//    언어가 이미 이어지고, 무엇보다 `/#pricing` 에 붙이면 물음표가 우물정 뒤로
//    가서 주소가 깨진다. 그래서 http(s) 로 시작하는 것만 손댄다.
// ==========================================================================
export function withLang(url: string, lang: string): string {
  if (!lang || lang === "en") return url;
  if (!/^https?:\/\//i.test(url)) return url;
  const [base, hash] = url.split("#");
  const q = `${base}${base.includes("?") ? "&" : "?"}lang=${encodeURIComponent(lang)}`;
  return hash ? `${q}#${hash}` : q;
}
