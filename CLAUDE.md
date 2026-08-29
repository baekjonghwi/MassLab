@AGENTS.md

# MassLabs — 제품들의 허브

이 저장소가 **홈페이지이자 중심**이다. 제품들은 `D:\CODE` 아래 **형제 폴더**로 따로 있다 —
각자 독립 git 저장소이고 각자 Vercel 프로젝트다. 🔴여기 안으로 옮기지 않는다:
MassLabs는 배포되는 프로젝트라 하위 폴더가 빌드 컨텍스트에 딸려 올라간다.

| 폴더 | 무엇 | 배포 |
|---|---|---|
| `D:\CODE\MassLabs` ← 여기 | 홈페이지 · 로그인 · 요금제 · 결제 · 구독 · 기기연결 | `masslabs-archi.com` |
| `D:\CODE\archiMap` | archiMap — 정적 사이트(`public/*.js`), 빌드 단계 없음 | `archimap.masslabs-archi.com` |
| `D:\CODE\Colorgram` | Colorgram — 색 조합 도구. Next.js. 🔴제품군에서 **유일하게 다크모드를 안 쓴다**(색이 곧 내용물이라) | `colorgram.masslabs-archi.com` |
| `D:\CODE\Archi_render` | Archi Render — Next.js, 제작중(M0). 기획 원본은 그쪽 `PLAN.md` | `render.masslabs-archi.com` |
| `D:\CODE\LaserCuttingDrawings` | **LaserFish 본체** — C# 라이노 플러그인 + Grasshopper | 플러그인 직접 배포 |
| `D:\CODE\LaserFish` | **LaserFish 소개 사이트** — Next.js, 제작중(2026-08-28 시작). ⚠️그 전까지 이미지·`.3dm` 에셋 창고였다. 플러그인 **본체 코드는 여기가 아니다**(윗줄) | `laserfish.masslabs-archi.com` |
| `D:\CODE\Rhino_ai` | Rhino MCP(McNeel 저장소 포크), 제작중 | — |
| `D:\CODE\masslabs-pay` | ⛔**폐기됨**(2026-08-18, Vercel 프로젝트 삭제) — 결제는 MassLabs가 흡수했다. 새 코드를 넣지 말 것 | — |

## 경계 — 누가 무엇을 소유하는가

- **계정 · 로그인 · 요금제 · 결제 · 구독은 전부 MassLabs가 답한다.**
  ⛔제품 쪽에 로그인 폼, `/account`, 결제 화면을 만들지 말 것 (2026-08-17 통합 로그인 결정).
  제품은 `masslabs-archi.com/price`으로 내보내기만 한다.
- 🔴**임시(2026-08-21 ~ 국내·해외 정기결제가 동시에 열릴 때까지)** — 구독을 안 판다.
  MassLabs는 LaserFish **건당결제**만, archiMap은 **로그인하면 PLUS 무료**로 **따로** 굴린다.
  스위치 두 개가 한 벌이다: `lib/interim.ts`의 `SUBSCRIPTION_LIVE` ·
  archiMap `public/app.js`의 `SOLO_PLUS_FREE`. 한쪽만 뒤집으면 두 사이트 말이 어긋난다.
  구독 코드(`/account`·`/subscribe`·`PlanTable`·`/api/subscribe/*`)는 **하나도 안 지웠다** — 되돌리면 그대로 산다.
  🔴단, **홈(`/`)의 건당표는 2026-08-29 부터 감춰 뒀다** — 건당결제 안내의 정본은
  LaserFish 소개 사이트다(`lib/interim.ts`의 `PER_PIECE_ON_HOME`). `/price`는 아직 건당표를 그린다.
- 🔴**설치 안내(`/download`)와 사용방법(`/howtouse`)은 LaserFish 소개 사이트가 정본이다**
  (`/download` 2026-08-28, `/howtouse` 2026-08-29 — 둘 다 사용자 결정).
  같은 글이 두 저장소에 살면서 갈라지던 것을 끝냈다 — MassLabs 안쪽 화면 둘은 지웠고,
  `next.config.ts`의 리다이렉트만 남아 옛 링크를 넘긴다(307, 되돌릴 여지를 남겼다).
  `/howtouse` 는 LaserFish 의 **`/guide`** 로 간다(이름이 다르다).
  ⛔MassLabs에 그 화면들을 다시 만들지 말 것. 나가는 주소는 `lib/products.ts` 한 곳이다.

- 🔴**검색 문구(제목·설명)의 원본은 각 저장소의 `lib/seo.ts` 한 곳이다**(2026-08-29).
  화면 파일에 적지 말 것 — 눈에 안 보이는 글이라 흩어지면 갈라진 줄도 모른다.
  MassLabs·LaserFish 가 같은 짜임을 쓴다: `lib/seo.ts` + `app/robots.ts` + `app/sitemap.ts`
  + `app/opengraph-image.tsx`, 화면별 제목은 그 구역의 `layout.tsx`.
  archiMap 은 정적 사이트라 `public/index.html` 의 `<head>` 와 `public/robots.txt`·`sitemap.xml` 이다.
  ⚠️화면을 새로 만들면 **`sitemap.ts` 에 한 줄 더할 것.** 잊으면 검색에 영영 안 뜬다.
  🔴**문구는 영어로 쓴다**(2026-08-29 사용자 결정 — 국제시장). 한/영 전환이 브라우저에서
  도는 탓에 검색 로봇은 세 사이트 모두 **영어 화면**을 본다(archiMap 도 `pickInitialLang()`
  최종 폴백이 `en` 이다). 제목·설명만 한국어면 구글이 그걸 버리고 영어 본문에서 새로 짓는다.
  ⚠️그 대가로 **네이버·국내 한국어 검색어에는 안 걸린다.** 되찾으려면 번역이 아니라
  `/ko`·`/en` 로 **주소를 나눠야** 한다(그래야 로봇이 한국어 화면을 본다). 그날은 세 사이트를 함께 볼 것.
- 제품 저장소는 **기능만** 갖는다. 권한 판정이 필요하면 MassLabs의 `/api/entitlement`에 묻는다.
- 세션은 `.masslabs-archi.com` 쿠키(앞에 점) 한 벌을 전 제품이 공유한다.
  🔴쿠키 형식은 archiMap의 `ckStore`(`public/app.js`)와 **한 벌로 움직이는 규약**이다 —
  한쪽만 고치면 다른 제품 로그인이 조용히 깨진다.

🔴**파일을 열기 전에 어느 폴더인지부터 확인할 것.** `MassLabs`와 `archiMap`은 오가다 섞이기 쉽다.
