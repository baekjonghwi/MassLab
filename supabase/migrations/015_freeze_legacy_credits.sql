-- ==========================================================================
--  015. 옛 크레딧 사용량을 얼려 둔다 (2026-09-06)
--
--  🔴🔴발견 — `profiles.credits_used` 에 담긴 649회(452명)는 **곧 사라진다.**
--    consume_credit 은 달이 바뀌면 카운터를 0으로 되돌린다:
--        credits_used = case when credit_period is distinct from v_period then 0 ... end
--    그런데 452명 중 **credit_period 가 채워진 사람이 3명뿐**이다. 나머지는
--    NULL 이라 `NULL is distinct from '2026-09'` = true — 즉 그 사람이 크레딧을
--    한 번 더 쓰는 순간 카운터가 **0으로 리셋되고 과거 횟수가 증발한다.**
--    (옛 경로가 브라우저에서 직접 쓰던 값이라 credit_period 를 안 남겼다.
--     archiMap `public/app.js` 의 옛 pushAccount — 지금은 consume_credit 하나다.)
--
--  ⇒ 지금 값을 **credits_legacy 로 옮겨 얼린다.** 이 칸은 아무도 리셋하지 않는다.
--    이제 "총 사용량 = credits_legacy + credit_events 행 수" 이고, 앞의 항은
--    다시는 안 변하고 뒤의 항만 자란다.
--
--  ⚠️여전히 **시각은 없다.** 얼린 649회는 "언젠가 썼다"까지만 말한다 —
--    날짜별 그래프에는 못 올린다(014 부터의 사용분만 날짜를 갖는다).
--    ⛔없는 시각을 가입일 따위로 지어내지 말 것.
--
--  🔴백필은 **한 번만** 돈다. app_flags 에 표시를 남겨 두 번 더해지는 것을 막는다.
-- ==========================================================================

alter table public.profiles add column if not exists credits_legacy int not null default 0;

comment on column public.profiles.credits_legacy is
  '건별 기록(credit_events) 이전에 쓴 크레딧 횟수. 2026-09-06에 credits_used 에서 옮겨 얼렸다. '
  '⛔아무도 리셋하지 않는다 — credits_used 는 이번 달 카운터라 리셋되지만 이 칸은 남는다.';

-- ── 한 번만 도는 백필 ────────────────────────────────────────────────────
--  🔴이미 credit_events 로 남은 몫은 빼고 옮긴다. 안 빼면 오늘 쓴 사람이 두 번 세어진다.
do $$
begin
  if not exists (select 1 from public.app_flags where key = 'credits_legacy_frozen' and value) then
    update public.profiles p
       set credits_legacy = greatest(
             0,
             p.credits_used - coalesce((select count(*) from public.credit_events e where e.user_id = p.id), 0))
     where p.credits_used > 0;

    insert into public.app_flags (key, value, note)
    values ('credits_legacy_frozen', true,
            '015 백필 완료 표시. ⛔이 줄을 지우거나 false 로 두면 마이그레이션을 다시 돌릴 때 옛 횟수가 두 번 더해진다.')
    on conflict (key) do update set value = true;
  end if;
end $$;


-- ── 사람 단위 집계 — 이제 얼린 값을 본다 ────────────────────────────────
drop view if exists public.admin_user_activity;

create view public.admin_user_activity
with (security_invoker = true) as
with a as (
  select user_id, count(*) as events, max(at) as last_at, array_agg(distinct product) as products
  from public.admin_activity group by user_id
)
select
  p.id as user_id,
  -- 흔적(credit_events 포함) + 얼린 옛 크레딧. 이제 겹치지 않는다.
  coalesce(a.events, 0) + p.credits_legacy as events,
  greatest(a.last_at, p.credits_last_at)   as last_at,
  (select coalesce(array_agg(distinct x), '{}'::text[])
     from unnest(coalesce(a.products, '{}'::text[])
                 || case when p.credits_legacy > 0 then array['archimap'] else '{}'::text[] end) x) as products
from public.profiles p
left join a on a.user_id = p.id;

comment on view public.admin_user_activity is
  '사람 단위 활동 집계 - 흔적 + 얼린 옛 크레딧(credits_legacy). /admin 의 활성·활성계정이 여기서 나온다.';

revoke all on public.admin_user_activity from public, anon, authenticated;


-- ── 크레딧 판 전용 통계 ─────────────────────────────────────────────────
--  🔴admin_overview 에 욱여넣지 않고 따로 뺐다. 크레딧은 "언제"가 없는 값이라
--    다른 지표들과 읽는 법이 다르다 — 화면에서도 제 칸을 갖는다.
create or replace function public.admin_credit_stats()
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
with per as (
  select p.id,
         p.credits_legacy                       as legacy,
         coalesce(e.n, 0)                       as logged,
         p.credits_legacy + coalesce(e.n, 0)    as tot
  from public.profiles p
  left join (select user_id, count(*) n from public.credit_events group by user_id) e on e.user_id = p.id
)
select jsonb_build_object(
  'total',        (select coalesce(sum(tot), 0)                from per),
  'people',       (select count(*)                             from per where tot > 0),
  'max',          (select coalesce(max(tot), 0)                from per),
  'legacy_total', (select coalesce(sum(legacy), 0)             from per),
  'logged_total', (select count(*)                             from public.credit_events),
  'logged_today', (select count(*) from public.credit_events where created_at >= date_trunc('day', now())),
  'logged7',      (select count(*) from public.credit_events where created_at > now() - interval '7 days'),
  'since',        (select min(created_at)                      from public.credit_events),
  -- 몇 번 쓴 사람이 몇 명인가. 시각이 없어도 이건 정확하다.
  'dist',         (select coalesce(jsonb_agg(jsonb_build_object('used', tot, 'people', n) order by tot), '[]'::jsonb)
                   from (select tot, count(*) n from per where tot > 0 group by tot) d)
);
$$;

comment on function public.admin_credit_stats() is
  '/admin 의 크레딧 판. 시각이 없는 값이라 총계·사람수·분포만 답한다.';

revoke all on function public.admin_credit_stats() from public, anon, authenticated;
grant execute on function public.admin_credit_stats() to service_role;
