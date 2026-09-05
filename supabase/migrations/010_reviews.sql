-- ==========================================================================
--  후기(reviews) — 제품이 여럿이어도 **한 곳에 모은다** (2026-09-05 사용자 결정)
--
--  🔴화면은 제품마다 따로 있다(archiMap 의 REVIEW 모달 · LaserFish 의 /review).
--    모이는 곳만 하나다 — 그래야 "우리 도구를 쓴 사람들이 무슨 말을 했나"를
--    한 번에 셀 수 있고, 제품이 늘어도 후기 배선을 새로 깔지 않는다.
--
--  🔴왜 `reviews` 스키마가 아니라 public 인가.
--    이 프로젝트는 제품마다 스키마가 하나씩 있다(archimap · laserfish · colorgram).
--    그 결을 따르면 `reviews` 스키마에 제품별 표를 두는 것이 맞지만, **새 스키마는
--    PostgREST 에 노출(Exposed schemas)로 등록하기 전까지 REST 로 안 보인다** —
--    그건 SQL 이 아니라 대시보드 설정이라 이 파일로 끝나지 않고, 등록 전까지는
--    404 가 조용히 난다. public 은 언제나 노출되어 있어 그 사고가 없다.
--    ⇒ 한 표에 모으고 product 칸으로 가른다. "모으되 나눈다"는 같은 값이다.
--  🔴제품을 늘리는 일 = 아래 CHECK 에 이름 하나. 표도 API 도 그대로다.
--
--  ⚠️옛 `laserfish.reviews`(건당결제 시절, payment_id 로 신원을 삼던 표)는
--    **안 지웠다.** 여섯 줄을 이리로 복사만 한다 — 건당결제를 폐기하면서
--    payment_id 가 더는 발급되지 않으므로 그 표는 새로 자라지 않는다.
-- ==========================================================================

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  -- 어느 프로그램에 대한 후기인가. 🔴제품을 늘리면 여기 이름 하나를 더한다.
  product     text not null check (product in ('archimap', 'laserfish', 'colorgram')),
  -- 🔴누가 썼나. 계정을 지우면 후기는 남고 주인만 사라진다(on delete set null) —
  --   남의 글이 아니라 자기 글이라, 탈퇴했다고 남들이 읽던 후기가 증발하면 곤란하다.
  --   ⚠️null 인 행 = 옛 laserfish.reviews 에서 옮겨 온 것(그때는 계정이 없었다).
  user_id     uuid references auth.users(id) on delete set null,
  nickname    text not null,
  rating      smallint check (rating between 1 and 5),
  body        text not null,
  photo_url   text,
  -- 쓴 사람이 보고 있던 화면 언어(ko·en·ja…). 나중에 언어별로 골라 보여 줄 때 쓴다.
  lang        text,
  -- 🔴숨김은 지움이 아니다. 신고·욕설을 내릴 때 행을 지우면 무엇을 왜 내렸는지가
  --   남지 않는다. 화면은 visible 만 읽는다.
  status      text not null default 'visible' check (status in ('visible', 'hidden')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 🔴한 사람이 한 프로그램에 후기 하나. 고쳐 쓰는 것은 되고, 쌓는 것은 안 된다.
--   ⚠️user_id 가 null 인 옛 행들은 이 제약 밖이다(부분 인덱스) — 안 그러면
--     옮겨 온 여섯 줄 중 하나만 남고 나머지가 거부된다.
create unique index if not exists reviews_one_per_user
  on public.reviews (product, user_id) where user_id is not null;

-- 목록은 언제나 "그 제품의, 최신순"이다.
create index if not exists reviews_product_created
  on public.reviews (product, created_at desc);

alter table public.reviews enable row level security;

-- 🔴읽기는 누구나. 후기는 손님을 설득하려고 쓰는 글이라 로그인 벽 뒤에 두면 뜻이 없다.
--   ⚠️숨긴 글은 안 내려간다.
drop policy if exists reviews_read_visible on public.reviews;
create policy reviews_read_visible on public.reviews
  for select using (status = 'visible');

-- ⛔쓰기 정책은 **일부러 없다.** 브라우저가 표에 직접 쓰지 않는다 —
--   MassLabs 의 /api/reviews 가 서비스 키로 쓴다(거기서 신원·길이·빈도를 본다).
--   정책이 없으면 anon·authenticated 는 insert/update 가 전부 막힌다.

-- 옛 후기 여섯 줄을 옮겨 온다(복사다 — 원본은 그대로 둔다).
--  ⚠️두 번 돌려도 안 겹치게 payment_id 를 열쇠로 삼는다. 옮겨 온 행에는 계정이
--    없으므로 user_id 는 null 이고, 그래서 위 부분 인덱스에 안 걸린다.
insert into public.reviews (product, user_id, nickname, body, photo_url, created_at)
select 'laserfish', null, r.nickname, r.review, r.photo_url, r.created_at
from laserfish.reviews r
where not exists (
  select 1 from public.reviews p
  where p.product = 'laserfish' and p.nickname = r.nickname and p.body = r.review
);
