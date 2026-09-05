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
  🔴**2026-09-05 — LaserFish도 구독 안으로 들어왔다**(사용자 결정). 건당결제를 폐기하고
  `lib/plans.ts`의 `MIN_PLAN.laserfish`를 `pro`→**`plus`**로 내렸다. 이제 두 프로그램이
  같은 규칙 아래 선다: **로그인하면 PLUS, 당분간 공짜(할인 기간).**
  판정은 **한 함수**다 — `lib/interim.ts`의 `effectivePlan(real)`이 `PLUS_FREE_PROMO`
  (=`!SUBSCRIPTION_LIVE`)를 보고 free를 plus로 올린다. ⛔화면마다 다시 판정하지 말 것.
  서버(`lib/plugin-auth.ts`의 `entitlementOf`)도, DB 값을 직접 읽는 화면들
  (`/account`·`/price`·홈의 `lib/use-my-plan.ts`)도 전부 그 함수를 부른다.
  🔴2026-09-05 — 전에는 이 규칙이 `entitlementOf` 안에만 있었다. 화면들이 `my_plan`
  RPC를 날로 읽으면서 같은 사람이 서버에선 PLUS, `/account`에선 미구독으로 갈렸다.
  ⚠️DB(`profiles.plan`)는 안 건드린다 — 적으면 행사가 끝난 뒤에도 전원이 PLUS로 남는다.
  스위치 두 개가 한 벌이다: `lib/interim.ts`의 `SUBSCRIPTION_LIVE` ·
  archiMap `public/app.js`의 `SOLO_PLUS_FREE`. 한쪽만 뒤집으면 두 사이트 말이 어긋난다.
  ⚠️LaserFish 소개 사이트에도 베낀 값이 있다(그쪽 `lib/site.ts`의 `PLUS_FREE_PROMO`) — 셋을 함께 볼 것.
  🔴🔴**2026-09-05부터 넷이다 — 네 번째는 DB에 있다**: `app_flags.plus_free_promo`
  (`supabase/migrations/012_credit_promo_flag.sql`). archiMap 크레딧 한도를 서버가
  판정하게 만들면서 생겼다 — 판정하는 자리가 SQL 함수(`consume_credit`)라 코드 상수를 볼 수 없다.
  ⛔이 한 줄을 잊고 코드 셋만 내리면, 행사가 끝난 뒤에도 전원이 크레딧 10회를 받는다
  (등급은 안 오른다 — 크레딧 한도만 어긋나 조용하다). 내리는 법:
  `update public.app_flags set value=false where key='plus_free_promo';`
  🔴**"(할인 기간)" 표시가 화면 셋에 있다** — MassLabs `PlanTable`·`LandingView`,
  archiMap PLAN 창(`renderSubscription`), LaserFish 홈 비용 구역. 스위치를 내리면 함께 사라진다.
  구독 코드(`/account`·`/subscribe`·`PlanTable`·`/api/subscribe/*`)는 **하나도 안 지웠다** — 되돌리면 그대로 산다.
  🔴**2026-08-29 — 값 이야기를 홈 한 곳으로 모았다**(사용자 결정).
  홈의 건당표는 감췄고(`PER_PIECE_ON_HOME`), 건당결제 안내의 정본은 LaserFish 소개 사이트다.
  `/price`는 구독을 안 파는 동안 홈 가격 구역(`/#pricing`)으로 넘어간다(307, 화면 파일은 살아 있다).
  ⛔`/price`를 화면에 직접 적지 말 것 — 메뉴·단추가 보는 주소는 `lib/interim.ts`의 `PRICING_HREF` 한 곳이다.
  archiMap의 [구독 해지]는 `/account`로, LaserFish의 [자세히 보기]는 껐다(그쪽 `BUY_LIVE`).
  🔴**해지는 `/account` 한 곳에서만 한다** — 다른 화면에 해지 단추를 만들지 말 것.
- ⛔**건당결제는 폐기됐다**(2026-09-05 사용자 결정). 스위치는 `lib/interim.ts`의 `PER_PIECE_LIVE`.
  `/payment`는 결제창 대신 "이제 구독에 포함된다"는 안내문을 띄운다 — 화면을 지우지 않은 이유는
  **배포된 옛 플러그인(2.2.3)이 그 주소를 직접 열기 때문**이다.
  `/api/verify-payment`는 **살려 뒀다** — 스위치를 내린 순간 결제창을 이미 띄워 둔 사람의
  폴링이 끝나야 한다. `/api/submit-review`(paymentId로 신원을 삼던 후기 저장)는 **지웠다.**
  플러그인 쪽(`LaserCuttingDrawings`)에서도 `PaymentHandler` 호출을 걷어냈다 — 구독이 없으면 굽지 않는다.
- 🔴**후기(review)는 화면은 제품마다 따로, 글은 한 곳에 모은다**(2026-09-05 사용자 결정).
  · 쓰는 자리 — archiMap 상단 **[REVIEW]** 모달(HELP 오른쪽) · LaserFish **`/review`** 화면.
  · 모이는 곳 — MassLabs **`/api/reviews`** 하나. 표는 `public.reviews`(product 칸으로 가른다,
    `supabase/migrations/010_reviews.sql`). 표에 **쓰기 정책이 없다** — 브라우저가 직접 못 쓴다.
  · MassLabs `/review`는 **읽기 전용 모음 화면**이다(제품 탭). 여기서는 후기를 안 쓴다.
  ⛔제품 저장소에서 Supabase에 후기를 직접 쓰지 말 것 — 신원·길이·중복 판정이 저장소 수만큼 갈라진다.
  🔴신원은 `.masslabs-archi.com` 쿠키(또는 Bearer)다. 로그인만 하면 쓴다(구독 여부는 안 본다).
  한 계정에 후기 하나 — 두 번째로 쓰면 새로 쌓이지 않고 고쳐 쓴다.
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
- 🔴**운영 현황판은 `/admin` 하나다**(2026-09-05 사용자 결정 — MassLabs 안에 넣는다).
  들어갈 수 있는 사람은 `profiles.plan = 'admin'`. 거절하는 방식이 **둘로 갈린다**
  (2026-09-06): 로그인을 안 했으면 `/login?next=/admin`으로 보내고(새 기기·시크릿창에서
  들어온 운영자가 길을 잃지 않게), 로그인했는데 관리자가 아니면 **404**다
  (403은 "권한만 있으면 되는 곳"이라고 알려 주는 꼴이다). ⛔`/api/admin/*`은 둘 다 404 —
  통로가 리다이렉트를 내면 `fetch`가 따라가 HTML을 JSON으로 읽으려 든다.
  ⛔`robots.txt`에 `/admin`을 적지 말 것(적었다가 뺐다) — 누구나 읽는 파일이라
  감추려던 줄이 오히려 주소를 광고한다. 화면의 `noindex`와 위 규칙이면 검색에 안 뜬다.
  문이 둘이다: 화면·API가 `lib/admin-auth.ts`로 먼저 걸르고, DB 함수 쪽에도
  anon·authenticated 실행 권한이 아예 없다(`supabase/migrations/011_admin_dashboard.sql`
  + `013_admin_credits_as_activity.sql`).
  집계는 **DB 함수 둘**이 전부 한다 — `admin_overview()`(카드·추이·지도·제품·등급·후기),
  `admin_user_rows()`(사용자 표. 검색·정렬·쪽나눔·**이메일 마스킹**까지 여기서).
  ⛔행을 긁어다 자바스크립트로 세지 말 것. ⛔이메일 원문을 화면으로 내리지 말 것(2026-09-05 결정).
  🔴**세션·체류시간 계측이 없다.** 그래서 "실시간 접속자"·"평균 체류"를 **안 만든다** —
  대신 DB에 남은 흔적으로 잰다. 활동의 정의가 **두 층**이다(013):
  · `public.admin_activity` — 시각이 붙은 흔적 하나하나(제품이 붙는다): archiMap
    `style_files`·`style_refs`·`ref_likes`, Colorgram `likes`, LaserFish `plugin_tokens.last_seen_at`.
  · `public.admin_user_activity` — **사람 단위 집계. 화면·API는 언제나 이쪽을 본다.**
    위 흔적에 **크레딧 사용**(`profiles.credits_used`)을 합친다.
  🔴🔴크레딧을 빠뜨렸다가 큰 거짓말을 했다(2026-09-06 발견) — archiMap의 주된 쓰임인
  크레딧 소비는 **아무 행도 남기지 않고** 숫자만 올린다. 그래서 크레딧을 쓴 450명 중
  **282명이 "한 번도 안 쓴 사람"으로 세어졌고**, 화면이 76%라고 말했다(실제 42%).
  ⛔활동을 세는 코드를 새로 쓸 때 `admin_activity`만 보지 말 것.
  🔴🔴**크레딧은 이제 건별로 남는다** — `public.credit_events`(014, 2026-09-06).
  `consume_credit`이 한도 검사를 통과한 뒤 행 하나를 넣는다. ⛔`profiles.credits_used`는
  **달마다 0으로 리셋되는 카운터**라 "며칟날 몇 번"을 영영 대답 못 한다 — 그래서 표를 만들었다.
  ⚠️두 값이 겹친다: `admin_user_activity`가 `credits_used - (이번 달 credit_events 수)`로
  **기록 전에 쓴 몫만** 더한다. 그 뺄셈을 빼먹으면 오늘 쓴 사람이 두 번 세어진다.
  🔴활동 뷰에 `kind` 칸이 생겼다(file·ref·like·seen·credit). 추이 그래프가 archiMap의
  파일 저장과 크레딧 소비를 갈라 그린다 — `products`의 archimap 건수에는 크레딧이 안 들어간다.
  🔴전에 만든 `profiles.credits_last_at`은 그대로 둔다(사용자 표가 사람마다 바로 읽는다).
  🔴🔴**옛 크레딧 649회는 사라질 값이었다**(2026-09-06 발견, 015로 막았다).
  `consume_credit`은 `credit_period`가 다르면 카운터를 0으로 되돌리는데, 크레딧을 쓴
  452명 중 그 칸이 채워진 사람이 **3명뿐**이었다(옛 경로가 브라우저에서 직접 쓰던 값이라).
  즉 그 사람들이 한 번 더 쓰는 순간 과거 횟수가 증발할 참이었다.
  ⇒ `profiles.credits_legacy`로 옮겨 얼렸다. ⛔그 칸은 아무도 리셋하지 않는다 —
  총 사용량 = `credits_legacy` + `credit_events` 행 수. 백필은 `app_flags.credits_legacy_frozen`
  으로 한 번만 돈다(두 번 돌면 옛 횟수가 두 번 더해진다).
  ⚠️그래도 **시각은 없다.** 649회 중 648회는 "언젠가 썼다"까지만 말한다 — 날짜 그래프에는
  2026-09-06 이후분만 오른다. ⛔가입일 따위로 시각을 지어내지 말 것.
  🔴크레딧 판은 `admin_credit_stats()` **별도 RPC**다(총계·사람수·분포). 시각이 없는 값이라
  다른 지표와 읽는 법이 달라서 `admin_overview`에 안 섞었다.
  ⚠️**지난 사용은 되살릴 수 없다**(근거가 없다). 그 사람들은 누적엔 들지만 "최근 7일"엔
  안 든다 — 다시 쓰는 순간부터 든다. 그 인원수는 `admin_overview()` 의
  `active.undated` 로 내려온다(2026-09-06 현재 화면에는 안 그린다 — 캡션을 한 줄로 줄였다).
  ⚠️나중에 진짜 ping을 붙이면 **`admin_activity`에 한 줄** 더하면 된다(화면은 안 바뀐다).
  다만 그 일은 제품 저장소 셋을 함께 고치는 일이다 — 오늘부터의 데이터만 쌓인다.
  🔴지도의 나라 도형은 **archiMap 것을 가져왔다**(2026-09-06 사용자 지시).
  원본은 그쪽 `public/land/<cc>.json` 237개(Natural Earth 1:50m, 생성기는 `land_build.js`).
  그걸 등장방형으로 미리 투영·재단순화해 `lib/admin-worldmap.ts`에 넣었다(199개국·90KB).
  런타임에 아무것도 안 받아 온다. ⛔날짜변경선을 넘는 나라는 링을 펴서 ±360 사본을 함께
  두어야 한다 — 안 그러면 지도를 가로지르는 줄이 생긴다.
  ⛔격자(경위도 선)는 육지 **위에** 그린다. 아래에 그리면 육지가 덮어 선이 끊긴다.
  ⚠️도법을 바꾸면 `lib/admin-geo.ts`의 나라 중심 좌표와 **함께** 바꿀 것 —
  한쪽만 바꾸면 점이 바다에 뜬다.
  🔴화면 규칙은 여기만 **다르다** — `app/admin/DESIGN.md`(getdesign "apple")를 따르고,
  토큰은 `app/admin/admin.css`의 `.adm` 아래에 갇혀 있다. ⛔제품 화면에 끌어다 쓰지 말 것
  (그쪽 원본은 archiMap = 스킬 `masslabs-ui`). 차트 색만은 예외로 `lib/admin-data.ts`의
  `PRODUCT_COLOR`가 원본이다(제품이 셋이라 범주색이 필요하고, 색각 검증을 통과한 값이다).
  ⚠️번역하지 않는다(i18n 사전에 넣지 말 것).

- 제품 저장소는 **기능만** 갖는다. 권한 판정이 필요하면 MassLabs의 `/api/entitlement`에 묻는다.
- 세션은 `.masslabs-archi.com` 쿠키(앞에 점) 한 벌을 전 제품이 공유한다.
  🔴쿠키 형식은 archiMap의 `ckStore`(`public/app.js`)와 **한 벌로 움직이는 규약**이다 —
  한쪽만 고치면 다른 제품 로그인이 조용히 깨진다.
  🔴🔴**제품 화면은 로그인 상태를 스스로 읽어 [로그인]과 [내 계정]을 갈라야 한다**
  (2026-09-06 — LaserFish가 안 읽어서 "제품마다 따로 로그인해야 한다"는 버그가 났다).
  쿠키는 HttpOnly가 아니라 브라우저가 읽는다 — Supabase 클라이언트를 새로 달 필요가 없다.
  넷 다 답이 있다: archiMap `onAuth` · Colorgram `SiteHeader` · LaserFish `lib/session.ts` ·
  MassLabs `lib/use-signed-in.ts`. ⛔새 제품에서 이 자리를 비워 두지 말 것.
  🔴그물이 하나 더 있다 — **`/login`은 이미 로그인한 사람을 `next`로 곧장 돌려보낸다.**
  ⚠️`?mode=reset`·`signup`은 예외다(로그인한 채로 비밀번호를 바꾸러 오는 길이다).

🔴**파일을 열기 전에 어느 폴더인지부터 확인할 것.** `MassLabs`와 `archiMap`은 오가다 섞이기 쉽다.
