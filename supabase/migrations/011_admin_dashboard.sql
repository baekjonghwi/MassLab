-- ==========================================================================
--  관리자 대시보드(/admin)가 읽는 집계 함수 둘.
--
--  🔴왜 RPC 인가 — 이 화면이 보는 것은 public 한 곳이 아니다. 가입자는 public
--    ·auth 에, 활동은 archimap·colorgram·laserfish 스키마에 흩어져 있다.
--    PostgREST 로 긁으면 스키마마다 노출 설정을 열어야 하고(= 공격면이 늘고),
--    왕복도 열 번이 넘는다. 함수 하나가 DB 안에서 조인하고 JSON 한 덩이를 준다.
--
--  🔴SECURITY DEFINER 다 — 소유자(postgres) 권한으로 남의 스키마와 auth.users 를
--    읽는다. 그래서 **아무나 못 부르게** 아래에서 anon·authenticated 의 실행
--    권한을 걷고 service_role 에게만 준다. "관리자인가"는 DB 가 아니라
--    lib/admin-auth.ts 가 먼저 판정하고, 통과한 요청만 서버 키로 여기 온다.
--    ⛔브라우저에서 직접 부를 수 없다(publishable 키로는 실행 권한이 없다).
--
--  🔴이메일은 함수 안에서 가린다(2026-09-05 사용자 결정). 원문이 DB 밖으로
--    나가지 않는다 — 화면 코드가 실수로 흘릴 자리를 아예 없앴다.
--
--  ⚠️읽기 전용이다. INSERT·UPDATE·DELETE 가 한 줄도 없다.
-- ==========================================================================

-- --------------------------------------------------------------------------
--  활동(activity) 이란 무엇인가 — 이 화면의 유일한 정의
--
--  🔴세션·체류시간 계측이 없다(2026-09-05). 그래서 "실시간 접속자"·"평균 체류
--    시간" 대신 **남은 흔적**으로 활성도를 잰다. 제품이 DB 에 무언가를 적는
--    순간이 곧 그 사람이 그 프로그램을 쓴 순간이다.
--    · archiMap  — 스타일 파일 저장/수정 · 레퍼런스 등록 · 좋아요
--    · Colorgram — 팔레트 좋아요
--    · LaserFish — 플러그인 토큰의 last_seen_at (라이노가 권한을 물어본 시각)
--  ⚠️콜로그램 palettes 와 laserfish.LaserCut 은 user_id 가 없어 사람 수에 못
--    센다 — 건수로만 따로 보여 준다.
--  🔴나중에 진짜 ping 계측을 붙이면 이 뷰에 한 줄 더하면 된다. 화면은 안 바뀐다.
-- --------------------------------------------------------------------------
create or replace view public.admin_activity
with (security_invoker = true) as
  select user_id, 'archimap'::text as product, coalesce(updated_at, created_at) as at
    from archimap.style_files where user_id is not null
  union all
  select user_id, 'archimap', created_at from archimap.style_refs where user_id is not null
  union all
  select user_id, 'archimap', created_at from archimap.ref_likes where user_id is not null
  union all
  select user_id, 'colorgram', created_at from colorgram.likes where user_id is not null
  union all
  select user_id, 'laserfish', last_seen_at from public.plugin_tokens where last_seen_at is not null;

comment on view public.admin_activity is
  '관리자 대시보드용 활동 흔적. security_invoker 라 스스로는 권한을 안 준다 — '
  '이걸 읽는 admin_overview()/admin_user_rows() 가 SECURITY DEFINER 다.';

revoke all on public.admin_activity from public, anon, authenticated;


-- --------------------------------------------------------------------------
--  admin_overview() — 화면 위쪽 전부(카드·추이·지도·제품·플랜·후기)를 한 덩이로
-- --------------------------------------------------------------------------
create or replace function public.admin_overview()
returns jsonb
language sql
stable
security definer
set search_path = public, archimap, colorgram, laserfish, pg_temp
as $$
with
  act as (select * from public.admin_activity),

  -- 가입자 하루치. 없는 날도 0 으로 채운다 — 안 그러면 선이 빈 날을 건너뛰어
  -- 실제보다 가팔라 보인다.
  days as (
    select d::date from generate_series(
      (select min(created_at)::date from public.profiles),
      current_date, interval '1 day') d
  ),
  by_day as (
    select d, coalesce(c.n, 0) as n,
           sum(coalesce(c.n, 0)) over (order by d) as cum
    from days
    left join (select created_at::date d, count(*) n from public.profiles group by 1) c using (d)
  ),

  -- 제품별
  prod as (
    select product,
           count(distinct user_id)                                                    as users,
           count(distinct user_id) filter (where at > now() - interval '7 days')      as users7,
           count(*)                                                                    as events,
           count(*) filter (where at > now() - interval '7 days')                     as events7,
           max(at)                                                                     as last_at
    from act group by product
  ),

  -- 사람별 활동량 — 구간 히스토그램과 "활성 사용자" 카드가 함께 쓴다
  per_user as (
    select user_id,
           count(*) as events,
           max(at)  as last_at
    from act group by user_id
  )

select jsonb_build_object(
  'generated_at', now(),

  'totals', jsonb_build_object(
    'users',       (select count(*) from public.profiles),
    'with_country',(select count(*) from public.profiles where country is not null),
    'countries',   (select count(distinct country) from public.profiles where country is not null),
    'reviews',     (select count(*) from public.reviews where status = 'visible'),
    'devices',     (select count(*) from public.plugin_tokens where revoked_at is null),
    'subs',        (select count(*) from public.subscriptions where status in ('active','trialing')),
    'first_signup',(select min(created_at) from public.profiles),
    'last_signup', (select max(created_at) from public.profiles)
  ),

  -- 카드 ①②③④ 가 쓰는 값
  'signups', jsonb_build_object(
    'today',      (select count(*) from public.profiles where created_at >= date_trunc('day',   now())),
    'this_month', (select count(*) from public.profiles where created_at >= date_trunc('month', now())),
    'last_month', (select count(*) from public.profiles
                    where created_at >= date_trunc('month', now()) - interval '1 month'
                      and created_at <  date_trunc('month', now())),
    'last7',      (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'prev7',      (select count(*) from public.profiles
                    where created_at > now() - interval '14 days'
                      and created_at <= now() - interval '7 days')
  ),

  -- 🔴"실시간 접속자"의 대체물. 접속이 아니라 **흔적을 남긴 사람 수**다.
  'active', jsonb_build_object(
    'd1',  (select count(*) from per_user where last_at > now() - interval '1 day'),
    'd7',  (select count(*) from per_user where last_at > now() - interval '7 days'),
    'd30', (select count(*) from per_user where last_at > now() - interval '30 days'),
    'ever',(select count(*) from per_user),
    'events_today', (select count(*) from act where at >= date_trunc('day', now())),
    'events7',      (select count(*) from act where at > now() - interval '7 days')
  ),

  'daily',   (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n, 'cum', cum) order by d), '[]'::jsonb)
                from by_day where d > current_date - 60),
  'weekly',  (select coalesce(jsonb_agg(x order by x->>'d'), '[]'::jsonb) from (
                select jsonb_build_object(
                         'd', date_trunc('week', d)::date,
                         'n', sum(n),
                         'cum', max(cum)) as x
                from by_day group by date_trunc('week', d)) w),
  'monthly', (select coalesce(jsonb_agg(x order by x->>'d'), '[]'::jsonb) from (
                select jsonb_build_object(
                         'd', date_trunc('month', d)::date,
                         'n', sum(n),
                         'cum', max(cum)) as x
                from by_day group by date_trunc('month', d)) m),

  -- 지도 + TOP 목록. 활성 사용자 수를 함께 붙여 "많이 가입한 나라"와
  -- "실제로 쓰는 나라"를 나란히 볼 수 있게 한다.
  'countries', (select coalesce(jsonb_agg(jsonb_build_object(
                    'code', country, 'n', n, 'active7', active7) order by n desc), '[]'::jsonb)
                from (
                  select p.country,
                         count(*) as n,
                         count(*) filter (where pu.last_at > now() - interval '7 days') as active7
                  from public.profiles p
                  left join per_user pu on pu.user_id = p.id
                  where p.country is not null
                  group by p.country) c),

  'products', (select coalesce(jsonb_agg(jsonb_build_object(
                    'key', product, 'users', users, 'users7', users7,
                    'events', events, 'events7', events7, 'last_at', last_at) order by users7 desc, users desc), '[]'::jsonb)
               from prod),

  -- user_id 가 없어 사람 수를 못 세는 것들. 건수만 정직하게.
  'anon_activity', jsonb_build_object(
    'colorgram_palettes', (select count(*) from colorgram.palettes),
    'laserfish_cuts',     (select count(*) from laserfish."LaserCut"),
    'laserfish_cuts7',    (select count(*) from laserfish."LaserCut" where created_at > now() - interval '7 days')
  ),

  'plans', (select coalesce(jsonb_agg(jsonb_build_object('plan', plan, 'n', n) order by n desc), '[]'::jsonb)
            from (select plan, count(*) n from public.profiles group by plan) p),

  -- 🔴"체류시간 히스토그램"의 대체물 — 사람당 활동 건수 구간.
  --   활동이 아예 없는 사람(한 번도 안 쓴 가입자)을 첫 칸에 세는 것이 핵심이다.
  'activity_buckets', (select coalesce(jsonb_agg(jsonb_build_object('label', label, 'n', n) order by ord), '[]'::jsonb)
    from (
      select b.label, b.ord, count(p.id) n
      from (values ('0건', 0), ('1~4건', 1), ('5~19건', 2), ('20건 이상', 3)) b(label, ord)
      left join (
        select p.id, coalesce(pu.events, 0) e
        from public.profiles p left join per_user pu on pu.user_id = p.id
      ) p on b.ord = case when p.e = 0 then 0 when p.e < 5 then 1 when p.e < 20 then 2 else 3 end
      group by b.label, b.ord) z),

  'reviews', (select coalesce(jsonb_agg(jsonb_build_object(
                  'id', id, 'product', product, 'nickname', nickname, 'rating', rating,
                  'body', left(body, 400), 'lang', lang, 'status', status,
                  'created_at', created_at) order by created_at desc), '[]'::jsonb)
              from public.reviews)
);
$$;

comment on function public.admin_overview() is
  '/admin 화면 상단 전부. service_role 전용 — 호출자가 관리자인지는 앱이 먼저 본다.';


-- --------------------------------------------------------------------------
--  admin_user_rows() — 아래쪽 사용자 표. 검색·필터·정렬·쪽나눔을 DB 가 한다
--  (824명이 지금은 통째로 보내도 되지만, 늘어난 뒤에 고치면 늦다).
-- --------------------------------------------------------------------------
create or replace function public.admin_user_rows(
  q         text default null,
  f_country text default null,
  f_plan    text default null,
  f_product text default null,
  f_active  text default null,   -- 'd1' | 'd7' | 'd30' | 'never'
  sort      text default 'created_at',
  dir       text default 'desc',
  lim       int  default 25,
  off       int  default 0
) returns jsonb
language plpgsql
stable
security definer
set search_path = public, archimap, colorgram, laserfish, pg_temp
as $$
declare
  -- 🔴정렬 칸은 **목록에 있는 이름만** 받는다. 밖에서 온 글자를 SQL 에 그대로
  --   이어 붙이면 주입 구멍이 된다(이 함수는 service_role 권한으로 돈다).
  col  text := case sort
                 when 'created_at'  then 'created_at'
                 when 'last_active' then 'last_active'
                 when 'events'      then 'events'
                 when 'name'        then 'lower(name)'
                 when 'country'     then 'country'
                 when 'plan'        then 'plan'
                 when 'credits'     then 'credits_used'
                 else 'created_at' end;
  ord  text := case when lower(coalesce(dir, '')) = 'asc' then 'asc' else 'desc' end;
  out  jsonb;
begin
  execute format($f$
    with per_user as (
      select user_id,
             count(*)                          as events,
             max(at)                           as last_at,
             (array_agg(product order by at desc))[1] as recent_product,
             array_agg(distinct product)       as products
      from public.admin_activity group by user_id
    ),
    base as (
      select p.id,
             nullif(p.display_name, '')                                      as name,
             regexp_replace(u.email, '^(.)[^@]*(@.*)$', '\1***\2')           as email,
             p.country, p.plan, p.created_at, p.credits_used, p.trial_used_at,
             coalesce(pu.events, 0)                                          as events,
             pu.last_at                                                      as last_active,
             pu.recent_product,
             coalesce(pu.products, '{}'::text[])                             as products
      from public.profiles p
      join auth.users u on u.id = p.id
      left join per_user pu on pu.user_id = p.id
    ),
    filtered as (
      select * from base
      where ($1 is null or $1 = ''
             or name  ilike '%%' || $1 || '%%'
             or email ilike '%%' || $1 || '%%'
             or country = upper($1))
        and ($2 is null or $2 = '' or country = $2)
        and ($3 is null or $3 = '' or plan = $3)
        and ($4 is null or $4 = '' or $4 = any(products))
        and ($5 is null or $5 = '' or case $5
               when 'd1'    then last_active > now() - interval '1 day'
               when 'd7'    then last_active > now() - interval '7 days'
               when 'd30'   then last_active > now() - interval '30 days'
               when 'never' then last_active is null
               else true end)
    )
    select jsonb_build_object(
      'total', (select count(*) from filtered),
      'rows',  coalesce((
        select jsonb_agg(to_jsonb(r)) from (
          select * from filtered order by %s %s nulls last, id limit $6 offset $7
        ) r), '[]'::jsonb))
  $f$, col, ord)
  into out
  using q, f_country, f_plan, f_product, f_active, least(greatest(lim, 1), 1000), greatest(off, 0);

  return out;
end;
$$;

comment on function public.admin_user_rows is
  '/admin 사용자 표. 이메일은 여기서 가려 나간다(원문은 DB 를 안 떠난다).';


-- --------------------------------------------------------------------------
--  🔴문. 브라우저(anon·authenticated)는 이 둘을 못 부른다.
-- --------------------------------------------------------------------------
revoke all on function public.admin_overview()      from public, anon, authenticated;
revoke all on function public.admin_user_rows(text, text, text, text, text, text, text, int, int)
  from public, anon, authenticated;
grant execute on function public.admin_overview()   to service_role;
grant execute on function public.admin_user_rows(text, text, text, text, text, text, text, int, int)
  to service_role;
