-- ==========================================================================
--  후기를 `review` 스키마로 모으고, LaserFish 사용 기록 수집을 끝낸다 (2026-09-14 사용자 결정)
--
--  ① 후기 — 스키마 하나(`review`)에 **제품마다 표 하나**(review.laserfish · review.archimap ·
--     review.colorgram). 010 에서 public.reviews 한 표에 product 칸으로 가르던 것을 나눈다.
--     "제품마다 스키마 하나"(archimap · colorgram) 결을 따르면 이쪽이 맞다고 010 이 이미 적어
--     두었고, 그때 미룬 까닭(Exposed schemas 는 대시보드 설정이다)은 이번에 손으로 푼다.
--     ⚠️이 파일은 **옮겨 적기만 한다.** public.reviews 는 그대로 둔다 — 배포된 /api/reviews 가
--       아직 그 표에 쓴다. 표를 지우는 것은 018(바꿔 끼우기)이다.
--
--  ② LaserFish — 플러그인이 laserfish 스키마의 LaserCut* 표에 보내던 사용 기록을 끝낸다.
--     2.2.8 다음 판부터 플러그인은 아무것도 안 보낸다(LaserCuttingDrawings 에서 코드를 지웠다). 옛 판이 보내는 것은 표가 없어 조용히 실패한다
--     (보내고 기다리지 않는 Task.Run 이라 도면에는 영향이 없다).
--     ⚠️**스키마는 아직 안 지운다 — 표만 지운다.** laserfish 가 대시보드의 Exposed schemas
--       목록에 올라 있다. 목록에 있는 스키마를 먼저 지우면 PostgREST 가 스키마 캐시를 못 읽어
--       전 제품의 REST 가 멈출 수 있다. 목록에서 뺀 뒤 018 이 빈 스키마를 지운다.
-- ==========================================================================

-- ── ① review 스키마 ────────────────────────────────────────────────────────
create schema if not exists review;

-- 🔴서비스 키(MassLabs 의 /api/reviews)만 들어온다. 브라우저가 표를 직접 읽지도 쓰지도 않는다.
--   ⚠️010 은 visible 행을 누구나 읽게 열어 두었는데(reviews_read_visible), 그러면 REST 로
--     user_id 까지 내려간다. 읽기는 /api/reviews 의 GET 이 이미 누구에게나 열려 있으므로
--     여기서는 anon·authenticated 에 아무것도 안 준다.
grant usage on schema review to service_role;

do $$
declare
  p text;
begin
  -- 🔴제품을 늘리는 일 = 이 목록에 이름 하나(+ MassLabs lib/reviews.ts 의 REVIEW_PRODUCTS).
  --   ⚠️colorgram 은 아직 쓰는 화면이 없다. 빈 표로 둔다 — 010 의 CHECK 에 있던 셋과 맞춘다.
  foreach p in array array['laserfish', 'archimap', 'colorgram'] loop
    execute format($f$
      create table if not exists review.%1$I (
        id          uuid primary key default gen_random_uuid(),
        -- 계정을 지우면 후기는 남고 주인만 사라진다(010 과 같다).
        user_id     uuid references auth.users(id) on delete set null,
        nickname    text not null,
        rating      smallint check (rating between 1 and 5),
        body        text not null,
        photo_url   text,
        lang        text,
        -- 숨김은 지움이 아니다(010 과 같다). 화면은 visible 만 읽는다.
        status      text not null default 'visible' check (status in ('visible', 'hidden')),
        created_at  timestamptz not null default now(),
        updated_at  timestamptz not null default now()
      )$f$, p);

    -- 🔴한 사람이 한 프로그램에 후기 하나 — 표가 제품이므로 열쇠는 user_id 하나다.
    execute format('create unique index if not exists %I on review.%I (user_id) where user_id is not null',
                   p || '_one_per_user', p);
    execute format('create index if not exists %I on review.%I (created_at desc)', p || '_created', p);

    -- RLS 를 켜고 정책은 두지 않는다 — anon·authenticated 는 권한부터 없고, 서비스 키는 RLS 를 건너뛴다.
    execute format('alter table review.%I enable row level security', p);
    execute format('revoke all on review.%I from anon, authenticated', p);
    execute format('grant all on review.%I to service_role', p);

    -- 옮겨 적기. id 를 그대로 가져오므로 두 번 돌려도 안 겹친다(018 이 한 번 더 돌린다).
    execute format($f$
      insert into review.%1$I (id, user_id, nickname, rating, body, photo_url, lang, status, created_at, updated_at)
      select id, user_id, nickname, rating, body, photo_url, lang, status, created_at, updated_at
      from public.reviews where product = %1$L
      on conflict (id) do nothing$f$, p);
  end loop;
end $$;

-- ── ② laserfish 표 지우기 ──────────────────────────────────────────────────
--  🔴admin_overview 가 laserfish."LaserCut" 을 센다. 표를 지우기 **전에** 그 줄을 떼어야 한다 —
--    language sql 함수라 표를 지워도 함수는 남고, 부르는 순간 터진다(/admin 전체가 못 열린다).
--  ⚠️키(laserfish_cuts · laserfish_cuts7)는 **0 으로 남긴다.** 배포된 대시보드가 그 값에
--    toLocaleString 을 부른다 — 키를 빼면 새 코드가 나가기 전까지 /admin 이 깨진다.
--    키를 없애는 것은 018 이다(대시보드 코드와 함께).
do $$
declare
  d text;
begin
  d := pg_get_functiondef('public.admin_overview'::regproc);
  d := replace(d, $x$(select count(*) from laserfish."LaserCut" where created_at > now() - interval '7 days')$x$, '0');
  d := replace(d, $x$(select count(*) from laserfish."LaserCut")$x$, '0');
  d := replace(d, $x$'colorgram', 'laserfish', 'pg_temp'$x$, $x$'colorgram', 'pg_temp'$x$);
  if position('laserfish.' in d) > 0 or position($x$'laserfish', 'pg_temp'$x$ in d) > 0 then
    raise exception 'admin_overview 에 laserfish 참조가 남았다 — 014 이후 함수가 바뀌었는지 볼 것';
  end if;
  execute d;
end $$;

alter function public.admin_user_rows(text, text, text, text, text, text, text, integer, integer)
  set search_path = public, archimap, colorgram, pg_temp;

-- 표 전부(LaserCut* 18 개 + 건당결제 시절의 laserfish.reviews).
--  ⚠️laserfish.reviews 의 여섯 줄 가운데 진짜 후기는 한 줄(Mishti)이고 010 이 이미 옮겼다.
--    나머지 다섯은 운영자가 남긴 시험 글이다.
do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'laserfish' loop
    execute format('drop table laserfish.%I cascade', t);
  end loop;
end $$;
