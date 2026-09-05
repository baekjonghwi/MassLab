-- ==========================================================================
--  013. 크레딧 사용을 '활동'으로 인정한다 (2026-09-06)
--
--  🔴배경 — /admin 이 "한 번도 안 쓴 계정 76%"라고 말했는데 거짓이었다.
--    활동 판정(admin_activity)이 **남는 물건**만 봤기 때문이다: archiMap 스타일
--    파일·레퍼런스·좋아요, Colorgram 좋아요, 플러그인 last_seen.
--    그런데 archiMap 의 주된 쓰임인 **크레딧 소비는 아무것도 남기지 않는다** —
--    profiles.credits_used 숫자만 하나 올라간다.
--    ⇒ 크레딧을 쓴 450명 중 **282명이 통째로 "안 쓴 사람"으로 세어졌다.**
--
--  🔴그런데 크레딧에는 **시각이 없다.** credit_period 는 'YYYY-MM' 인 데다
--    826명 중 2명만 채워져 있다(옛 경로가 안 적었다). 시각이 없으면 "최근 7일"
--    같은 창에 넣을 방법이 아예 없다.
--  ⇒ ① 시각 칸을 새로 만들고 consume_credit 이 적게 한다(아래 ②).
--    ② **지난 사용은 되살릴 수 없다** — 근거가 없는 것을 지어내지 않는다.
--       그래서 옛 크레딧 사용자는 "한 번이라도 쓴 사람"에는 들어가지만
--       "최근 7일"에는 안 들어간다. 다시 한 번 쓰는 순간부터 들어간다.
--
--  🔴활동의 정의가 두 층이 됐다. 헷갈리지 말 것:
--    · public.admin_activity      — **시각이 붙은 흔적** 하나하나(제품 붙임)
--    · public.admin_user_activity — **사람 단위 집계**(크레딧까지 합친 것)
--    화면·API 는 언제나 **뒤엣것**을 본다. 앞엣것은 제품별 건수에만 쓴다.
-- ==========================================================================

-- ── ① 크레딧을 마지막으로 쓴 시각 ────────────────────────────────────────
alter table public.profiles add column if not exists credits_last_at timestamptz;

comment on column public.profiles.credits_last_at is
  '크레딧을 마지막으로 쓴 시각. consume_credit 이 적는다. '
  '🔴2026-09-06 이전 사용에는 시각이 없어 null 이다(되살릴 근거가 없다) — '
  'credits_used > 0 인데 이 칸이 null 이면 "옛날에 썼다"는 뜻이다.';


-- ── ② consume_credit — 세는 김에 시각도 남긴다 ──────────────────────────
--  🔴012 의 몸통 그대로다. 바뀐 곳은 마지막 update 의 credits_last_at 한 줄뿐.
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

  -- 🔴할인 기간 — 로그인만 하면 PLUS 다. 등급을 올려 적는 것이 아니라
  --   **이 판정 안에서만** 올려 본다(깃발을 내리면 그날로 3회로 돌아온다).
  v_promo := coalesce((select value from app_flags where key = 'plus_free_promo'), false);
  if v_promo and v_plan = 'free' then
    v_plan := 'plus';
  end if;

  v_limit := case v_plan
               when 'plus' then 10
               when 'pro'  then 15
               when 'max'  then 20
               else 3                                  -- free
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

  -- 🔴credits_last_at 이 여기서 붙는다(013). 이 한 줄이 없으면 크레딧 사용이
  --   /admin 의 "최근 7일 활성"에 영영 안 잡힌다 — 숫자가 아니라 시각이 필요하다.
  update profiles
     set credits_used   = credits_used + 1,
         credits_last_at = now()
   where id = v_uid returning credits_used into v_used;

  return json_build_object('ok', true, 'used', v_used, 'limit', v_limit,
                           'plan', v_plan, 'remaining', v_limit - v_used);
end $function$;


-- ── ③ 사람 단위 활동 — 화면·API 가 보는 **유일한** 자리 ──────────────────
create or replace view public.admin_user_activity
with (security_invoker = true) as
select
  p.id                                              as user_id,
  -- 🔴흔적 건수 + 크레딧 사용 횟수. 크레딧은 건별 행이 없어 숫자를 그대로 더한다.
  coalesce(a.events, 0) + coalesce(p.credits_used, 0) as events,
  -- greatest 는 null 을 무시한다 — 둘 중 있는 쪽, 둘 다 있으면 나중 것.
  greatest(a.last_at, p.credits_last_at)             as last_at,
  -- 크레딧은 archiMap 것이다(consume_credit 을 부르는 곳이 거기뿐이다).
  (select coalesce(array_agg(distinct x), '{}'::text[])
     from unnest(coalesce(a.products, '{}'::text[])
                 || case when coalesce(p.credits_used, 0) > 0
                         then array['archimap'] else '{}'::text[] end) x) as products
from public.profiles p
left join (
  select user_id, count(*) as events, max(at) as last_at, array_agg(distinct product) as products
  from public.admin_activity group by user_id
) a on a.user_id = p.id;

comment on view public.admin_user_activity is
  '사람 단위 활동 집계 — 흔적(admin_activity) + 크레딧(profiles.credits_used). '
  '/admin 의 활성·사용건수는 전부 여기서 나온다.';

revoke all on public.admin_user_activity from public, anon, authenticated;


-- ── ④ admin_overview — 위 뷰를 보도록 갈아끼운다 ────────────────────────
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
      (select min(created_at)::date from public.profiles),
      current_date, interval '1 day') d
  ),
  by_day as (
    select d, coalesce(c.n, 0) as n,
           sum(coalesce(c.n, 0)) over (order by d) as cum
    from days
    left join (select created_at::date d, count(*) n from public.profiles group by 1) c using (d)
  ),
  -- 🔴제품별 **사람 수**는 크레딧까지 셈한 뒤엣것에서, **건수**는 시각이 붙은
  --   앞엣것에서 온다. 크레딧은 건별 시각이 없어 7일 건수에 못 들어간다.
  prod_users as (
    select x.product,
           count(*)                                                        as users,
           count(*) filter (where u.last_at > now() - interval '7 days')   as users7
    from per_user u cross join lateral unnest(u.products) x(product)
    group by x.product
  ),
  prod_events as (
    select product,
           count(*)                                               as events,
           count(*) filter (where at > now() - interval '7 days') as events7,
           max(at)                                                as last_at
    from act group by product
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
  'active', jsonb_build_object(
    'd1',  (select count(*) from per_user where last_at > now() - interval '1 day'),
    'd7',  (select count(*) from per_user where last_at > now() - interval '7 days'),
    'd30', (select count(*) from per_user where last_at > now() - interval '30 days'),
    'ever',(select count(*) from per_user),
    -- 🔴시각 없는 옛 크레딧 사용자. "한 번은 썼는데 언제인지 모르는" 사람 수다.
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


-- ── ⑤ admin_user_rows — 같은 뷰를 보게 한다 ─────────────────────────────
create or replace function public.admin_user_rows(
  q         text default null,
  f_country text default null,
  f_plan    text default null,
  f_product text default null,
  f_active  text default null,
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
    with base as (
      select p.id,
             nullif(p.display_name, '')                            as name,
             regexp_replace(u.email, '^(.)[^@]*(@.*)$', '\1***\2') as email,
             p.country, p.plan, p.created_at, p.credits_used, p.trial_used_at,
             ua.events,
             ua.last_at    as last_active,
             ua.products,
             (ua.products)[1] as recent_product
      from public.profiles p
      join auth.users u on u.id = p.id
      join public.admin_user_activity ua on ua.user_id = p.id
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
               when 'never' then events = 0
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

revoke all on function public.admin_overview()      from public, anon, authenticated;
revoke all on function public.admin_user_rows(text, text, text, text, text, text, text, int, int)
  from public, anon, authenticated;
grant execute on function public.admin_overview()   to service_role;
grant execute on function public.admin_user_rows(text, text, text, text, text, text, text, int, int)
  to service_role;
