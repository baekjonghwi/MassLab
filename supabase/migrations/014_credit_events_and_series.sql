-- ==========================================================================
--  014. 크레딧을 건별로 남기고, /admin 에 추이를 붙인다 (2026-09-06)
--
--  🔴배경 — "archiMap 크레딧을 일별·월별로 보고 싶다"는데 볼 근거가 없었다.
--    `profiles.credits_used` 는 **달마다 0으로 리셋되는 카운터 하나**다
--    (consume_credit 이 credit_period 가 바뀌면 0으로 되돌린다).
--    그래서 "지난달 며칟날 몇 번 썼나"는 원리적으로 대답이 안 된다.
--  ⇒ 쓸 때마다 **행 하나**를 남긴다. 오늘부터 쌓인다.
--  ⚠️지난 사용은 못 되살린다. 카운터에는 시각이 없었다 — 지어내지 않는다.
--
--  🔴013 에서 만든 profiles.credits_last_at 은 **그대로 둔다.** 이 표가 생기기
--    전에 찍힌 값이 있을 수 있고, "마지막 사용 시각"은 행을 세지 않고 바로
--    읽히는 편이 싸다(사용자 표가 사람마다 그것을 본다).
--
--  🔴활동 뷰가 kind 를 갖게 된다 — 같은 archiMap 안에서도 "크레딧 소비"와
--    "파일 저장"은 다른 일이다. 추이 그래프가 그 둘을 갈라 그린다.
-- ==========================================================================

-- ── ① 크레딧 사용 기록 ───────────────────────────────────────────────────
--  RLS 는 켜고 정책은 하나도 안 만든다 ⇒ 브라우저는 읽지도 쓰지도 못한다.
--  쓰는 것은 security definer 함수(consume_credit), 읽는 것은 service_role 뿐이다.
create table if not exists public.credit_events (
  id         bigserial   primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  product    text        not null default 'archimap',
  created_at timestamptz not null default now()
);

alter table public.credit_events enable row level security;

comment on table public.credit_events is
  '크레딧을 쓴 순간 하나에 행 하나. 2026-09-06부터 쌓인다 — 그 전 사용은 시각이 없어 없다.';

create index if not exists credit_events_at_idx   on public.credit_events (created_at desc);
create index if not exists credit_events_user_idx on public.credit_events (user_id, created_at desc);


-- ── ② consume_credit — 세는 김에 행도 남긴다 ────────────────────────────
--  🔴013 의 몸통 그대로다. 바뀐 곳은 마지막의 insert 한 줄뿐.
create or replace function public.consume_credit(p_product text default 'archimap')
 returns json
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_uid    uuid := auth.uid();
  v_plan   text;
  v_promo  boolean;
  v_limit  int;
  v_period text := to_char(now() at time zone 'UTC', 'YYYY-MM');
  v_used   int;
begin
  if v_uid is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  perform set_config('app.credit_rpc', 'on', true);   -- true = 이 트랜잭션에서만

  -- 🔴등급은 plan_for 한 곳에서만 판정한다(구독·번들·admin이 전부 여기로 모인다).
  v_plan := public.plan_for(v_uid, p_product);

  -- 🔴할인 기간 — 로그인만 하면 PLUS 다.
  v_promo := coalesce((select value from app_flags where key = 'plus_free_promo'), false);
  if v_promo and v_plan = 'free' then
    v_plan := 'plus';
  end if;

  v_limit := case v_plan
               when 'plus' then 10
               when 'pro'  then 15
               when 'max'  then 20
               else 3
             end;

  -- 🔴리셋 판정은 서버 시계로 한다. 달이 바뀌었으면 0으로 되돌린다.
  update profiles
     set credits_used  = case when credit_period is distinct from v_period then 0 else credits_used end,
         credit_period = v_period
   where id = v_uid
   returning credits_used into v_used;

  if v_used is null then
    raise exception 'profile_missing' using errcode = 'P0002';
  end if;

  if v_used >= v_limit then
    return json_build_object('ok', false, 'error', 'limit_reached',
                             'used', v_used, 'limit', v_limit, 'plan', v_plan);
  end if;

  update profiles
     set credits_used    = credits_used + 1,
         credits_last_at = now()
   where id = v_uid returning credits_used into v_used;

  -- 🔴여기가 014 다. 카운터는 달마다 지워지지만 이 행은 남는다.
  --   ⛔한도 검사(위)를 통과한 뒤에만 적는다 — 막힌 시도는 사용이 아니다.
  insert into public.credit_events (user_id, product) values (v_uid, coalesce(p_product, 'archimap'));

  return json_build_object('ok', true, 'used', v_used, 'limit', v_limit,
                           'plan', v_plan, 'remaining', v_limit - v_used);
end $function$;


-- ── ③ 활동 흔적 — kind 가 붙는다 ────────────────────────────────────────
-- 🔴갈아 끼우는 게 아니라 **내렸다 다시 세운다.** create or replace 로는 칸을
--   중간에 못 끼운다("cannot change name of view column at to kind").
--   ⚠️차례가 중요하다 — 기대는 쪽(admin_user_activity)을 먼저 내린다.
drop view if exists public.admin_user_activity;
drop view if exists public.admin_activity;

create view public.admin_activity
with (security_invoker = true) as
  select user_id, 'archimap'::text  as product, 'file'::text   as kind, coalesce(updated_at, created_at) as at
    from archimap.style_files where user_id is not null
  union all
  select user_id, 'archimap', 'ref',    created_at from archimap.style_refs where user_id is not null
  union all
  select user_id, 'archimap', 'like',   created_at from archimap.ref_likes  where user_id is not null
  union all
  select user_id, 'colorgram','like',   created_at from colorgram.likes     where user_id is not null
  union all
  select user_id, 'laserfish','seen',   last_seen_at from public.plugin_tokens where last_seen_at is not null
  union all
  -- 🔴크레딧이 드디어 시각을 갖는다. 이 줄이 생기면서 크레딧만 쓰는 사람도
  --   "최근 7일 활성"에 잡히기 시작한다(2026-09-06 이후 사용분부터).
  select user_id, coalesce(product, 'archimap'), 'credit', created_at from public.credit_events;

comment on view public.admin_activity is
  '시각이 붙은 활동 흔적 하나하나. product = 어느 프로그램, kind = 무슨 일.';

revoke all on public.admin_activity from public, anon, authenticated;


-- ── ④ 사람 단위 집계 — 옛 카운터와 새 행이 겹치지 않게 ──────────────────
create view public.admin_user_activity
with (security_invoker = true) as
with ce as (
  select user_id, count(*) filter (where created_at >= date_trunc('month', now())) as n_month
  from public.credit_events group by user_id
),
a as (
  select user_id, count(*) as events, max(at) as last_at, array_agg(distinct product) as products
  from public.admin_activity group by user_id
)
select
  p.id as user_id,
  -- 🔴credits_used 는 **이번 달** 카운터다. 그중 행으로 남은 몫(n_month)은 이미
  --   a.events 에 들어 있으니 빼야 한다. 남는 차이가 "기록 전에 쓴 몫"이다.
  --   ⛔이 뺄셈을 빼먹으면 오늘 크레딧을 쓴 사람이 두 번 세어진다.
  coalesce(a.events, 0) + greatest(0, coalesce(p.credits_used, 0) - coalesce(ce.n_month, 0)) as events,
  greatest(a.last_at, p.credits_last_at) as last_at,
  (select coalesce(array_agg(distinct x), '{}'::text[])
     from unnest(coalesce(a.products, '{}'::text[])
                 || case when coalesce(p.credits_used, 0) > 0
                         then array['archimap'] else '{}'::text[] end) x) as products
from public.profiles p
left join a  on a.user_id  = p.id
left join ce on ce.user_id = p.id;

comment on view public.admin_user_activity is
  '사람 단위 활동 집계 — 흔적 + 기록 전 크레딧. /admin 의 활성·활성계정은 전부 여기서 나온다.';

revoke all on public.admin_user_activity from public, anon, authenticated;

-- ── ⑤ admin_overview — 증감률과 추이를 더한다 ───────────────────────────
--  🔴증감률은 **굴러가는 창**으로 잰다(최근 24시간 vs 직전 24시간, 7일 vs 7일,
--    30일 vs 30일). 달력으로 자르면 "오늘 반나절"과 "어제 하루"를 견주게 되어
--    아침마다 -50% 가 뜬다 — 없는 하락이 보인다.
--  🔴추이는 kind 로 가른다. 같은 archiMap 안에서도 크레딧 소비와 파일 저장은
--    다른 일이라, 한 줄로 합치면 무엇이 늘었는지 알 수 없다.
create or replace function public.admin_overview()
returns jsonb
language sql
stable
security definer
set search_path = public, archimap, colorgram, laserfish, pg_temp
as $$
with
  act      as (select * from public.admin_activity),
  per_user as (select * from public.admin_user_activity where events > 0),
  days as (
    select d::date from generate_series(
      (select min(created_at)::date from public.profiles), current_date, interval '1 day') d
  ),
  by_day as (
    select d, coalesce(c.n, 0) as n, sum(coalesce(c.n, 0)) over (order by d) as cum
    from days
    left join (select created_at::date d, count(*) n from public.profiles group by 1) c using (d)
  ),
  prod_users as (
    select x.product,
           count(*)                                                      as users,
           count(*) filter (where u.last_at > now() - interval '7 days') as users7
    from per_user u cross join lateral unnest(u.products) x(product)
    group by x.product
  ),
  prod_events as (
    select product,
           count(*)                                               as events,
           count(*) filter (where at > now() - interval '7 days') as events7,
           max(at)                                                as last_at
    from act group by product
  ),
  sd as (select d::date from generate_series(current_date - 59, current_date, interval '1 day') d),
  sday as (
    select sd.d,
           count(a.*) filter (where a.product = 'archimap'  and a.kind <> 'credit') as archimap,
           count(a.*) filter (where a.product = 'colorgram')                        as colorgram,
           count(a.*) filter (where a.product = 'laserfish')                        as laserfish,
           count(a.*) filter (where a.kind = 'credit')                              as credit
    from sd left join act a on a.at::date = sd.d
    group by sd.d
  ),
  sm as (
    select d::date from generate_series(
      coalesce(date_trunc('month', (select min(at) from act)), date_trunc('month', now())),
      date_trunc('month', now()), interval '1 month') d
  ),
  smon as (
    select sm.d,
           count(a.*) filter (where a.product = 'archimap'  and a.kind <> 'credit') as archimap,
           count(a.*) filter (where a.product = 'colorgram')                        as colorgram,
           count(a.*) filter (where a.product = 'laserfish')                        as laserfish,
           count(a.*) filter (where a.kind = 'credit')                              as credit
    from sm left join act a on date_trunc('month', a.at)::date = sm.d
    group by sm.d
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
  'signups', jsonb_build_object(
    'today',      (select count(*) from public.profiles where created_at >= date_trunc('day', now())),
    'this_month', (select count(*) from public.profiles where created_at >= date_trunc('month', now())),
    'last_month', (select count(*) from public.profiles
                    where created_at >= date_trunc('month', now()) - interval '1 month'
                      and created_at <  date_trunc('month', now())),
    'd1',      (select count(*) from public.profiles where created_at > now() - interval '1 day'),
    'prev_d1', (select count(*) from public.profiles
                 where created_at > now() - interval '2 days' and created_at <= now() - interval '1 day'),
    'last7',   (select count(*) from public.profiles where created_at > now() - interval '7 days'),
    'prev7',   (select count(*) from public.profiles
                 where created_at > now() - interval '14 days' and created_at <= now() - interval '7 days'),
    'd30',      (select count(*) from public.profiles where created_at > now() - interval '30 days'),
    'prev_d30', (select count(*) from public.profiles
                  where created_at > now() - interval '60 days' and created_at <= now() - interval '30 days')
  ),
  'active', jsonb_build_object(
    'd1',  (select count(*) from per_user where last_at > now() - interval '1 day'),
    'd7',  (select count(*) from per_user where last_at > now() - interval '7 days'),
    'd30', (select count(*) from per_user where last_at > now() - interval '30 days'),
    'ever',(select count(*) from per_user),
    'undated', (select count(*) from public.profiles where credits_used > 0 and credits_last_at is null),
    'events_today', (select count(*) from act where at >= date_trunc('day', now())),
    'events7',      (select count(*) from act where at > now() - interval '7 days')
  ),
  'daily',   (select coalesce(jsonb_agg(jsonb_build_object('d', d, 'n', n, 'cum', cum) order by d), '[]'::jsonb)
                from by_day where d > current_date - 60),
  'weekly',  (select coalesce(jsonb_agg(x order by x->>'d'), '[]'::jsonb) from (
                select jsonb_build_object('d', date_trunc('week', d)::date, 'n', sum(n), 'cum', max(cum)) as x
                from by_day group by date_trunc('week', d)) w),
  'monthly', (select coalesce(jsonb_agg(x order by x->>'d'), '[]'::jsonb) from (
                select jsonb_build_object('d', date_trunc('month', d)::date, 'n', sum(n), 'cum', max(cum)) as x
                from by_day group by date_trunc('month', d)) m),
  'use_daily',   (select coalesce(jsonb_agg(jsonb_build_object(
                     'd', d, 'archimap', archimap, 'colorgram', colorgram,
                     'laserfish', laserfish, 'credit', credit) order by d), '[]'::jsonb) from sday),
  'use_monthly', (select coalesce(jsonb_agg(jsonb_build_object(
                     'd', d, 'archimap', archimap, 'colorgram', colorgram,
                     'laserfish', laserfish, 'credit', credit) order by d), '[]'::jsonb) from smon),
  'credits', jsonb_build_object(
    'logged_total', (select count(*) from public.credit_events),
    'logged_today', (select count(*) from public.credit_events where created_at >= date_trunc('day', now())),
    'logged7',      (select count(*) from public.credit_events where created_at > now() - interval '7 days'),
    'counter_month',(select coalesce(sum(credits_used), 0) from public.profiles),
    'since',        (select min(created_at) from public.credit_events)
  ),
  'countries', (select coalesce(jsonb_agg(jsonb_build_object(
                    'code', country, 'n', n, 'active7', active7) order by n desc), '[]'::jsonb)
                from (
                  select p.country, count(*) as n,
                         count(*) filter (where pu.last_at > now() - interval '7 days') as active7
                  from public.profiles p
                  left join per_user pu on pu.user_id = p.id
                  where p.country is not null group by p.country) c),
  'products', (select coalesce(jsonb_agg(jsonb_build_object(
                    'key', u.product, 'users', u.users, 'users7', u.users7,
                    'events', coalesce(e.events, 0), 'events7', coalesce(e.events7, 0),
                    'last_at', e.last_at) order by u.users7 desc, u.users desc), '[]'::jsonb)
               from prod_users u left join prod_events e on e.product = u.product),
  'anon_activity', jsonb_build_object(
    'colorgram_palettes', (select count(*) from colorgram.palettes),
    'laserfish_cuts',     (select count(*) from laserfish."LaserCut"),
    'laserfish_cuts7',    (select count(*) from laserfish."LaserCut" where created_at > now() - interval '7 days')
  ),
  'plans', (select coalesce(jsonb_agg(jsonb_build_object('plan', plan, 'n', n) order by n desc), '[]'::jsonb)
            from (select plan, count(*) n from public.profiles group by plan) p),
  'activity_buckets', (select coalesce(jsonb_agg(jsonb_build_object('label', label, 'n', n) order by ord), '[]'::jsonb)
    from (
      select b.label, b.ord, count(z.user_id) n
      from (values ('0건', 0), ('1~4건', 1), ('5~19건', 2), ('20건 이상', 3)) b(label, ord)
      left join public.admin_user_activity z
        on b.ord = case when z.events = 0 then 0 when z.events < 5 then 1 when z.events < 20 then 2 else 3 end
      group by b.label, b.ord) z),
  'reviews', (select coalesce(jsonb_agg(jsonb_build_object(
                  'id', id, 'product', product, 'nickname', nickname, 'rating', rating,
                  'body', left(body, 400), 'lang', lang, 'status', status,
                  'created_at', created_at) order by created_at desc), '[]'::jsonb)
              from public.reviews)
);
$$;

revoke all on function public.admin_overview() from public, anon, authenticated;
grant execute on function public.admin_overview() to service_role;
