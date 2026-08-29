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
