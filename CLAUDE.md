@AGENTS.md

# MassLabs — 제품들의 허브

이 저장소가 **홈페이지이자 중심**이다. 제품들은 `D:\CODE` 아래 **형제 폴더**로 따로 있다 —
각자 독립 git 저장소이고 각자 Vercel 프로젝트다. 🔴여기 안으로 옮기지 않는다:
MassLabs는 배포되는 프로젝트라 하위 폴더가 빌드 컨텍스트에 딸려 올라간다.

| 폴더 | 무엇 | 배포 |
|---|---|---|
| `D:\CODE\MassLabs` ← 여기 | 홈페이지 · 로그인 · 요금제 · 결제 · 구독 · 기기연결 · 다운로드 | `masslabs-archi.com` |
| `D:\CODE\archiMap` | archiMap — 정적 사이트(`public/*.js`), 빌드 단계 없음 | `archimap.masslabs-archi.com` |
| `D:\CODE\Colorgram` | Colorgram — 색 조합 도구. Next.js. 🔴제품군에서 **유일하게 다크모드를 안 쓴다**(색이 곧 내용물이라) | `colorgram.masslabs-archi.com` |
| `D:\CODE\Archi_render` | Archi Render — Next.js, 제작중(M0). 기획 원본은 그쪽 `PLAN.md` | `render.masslabs-archi.com` |
| `D:\CODE\LaserCuttingDrawings` | **LaserFish 본체** — C# 라이노 플러그인 + Grasshopper | 플러그인 직접 배포 |
| `D:\CODE\LaserFish` | ⚠️코드 아님 — 이미지·`.3dm` 에셋 창고. LaserFish 코드를 여기서 찾지 말 것 | — |
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
- 제품 저장소는 **기능만** 갖는다. 권한 판정이 필요하면 MassLabs의 `/api/entitlement`에 묻는다.
- 세션은 `.masslabs-archi.com` 쿠키(앞에 점) 한 벌을 전 제품이 공유한다.
  🔴쿠키 형식은 archiMap의 `ckStore`(`public/app.js`)와 **한 벌로 움직이는 규약**이다 —
  한쪽만 고치면 다른 제품 로그인이 조용히 깨진다.

🔴**파일을 열기 전에 어느 폴더인지부터 확인할 것.** `MassLabs`와 `archiMap`은 오가다 섞이기 쉽다.
