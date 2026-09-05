-- ==========================================================================
--  012. 크레딧 한도가 할인 행사를 알게 한다 (2026-09-05)
--
--  🔴배경 — `consume_credit` 은 등급을 `plan_for` 에 묻는다. 그런데 지금 도는
--    "로그인하면 PLUS, 당분간 공짜" 행사는 **코드에만** 있다(MassLabs
--    `lib/interim.ts` SUBSCRIPTION_LIVE · archiMap `app.js` SOLO_PLUS_FREE ·
--    LaserFish `lib/site.ts` PLUS_FREE_PROMO). 그래서 서버는 구독 안 산 사람을
--    free 로 보고 크레딧 3회에서 끊는데, 화면은 PLUS 라며 10회를 그린다.
--
--  ⇒ 행사 스위치의 **네 번째 사본**을 DB 에 둔다. 판정하는 자리가 서버라서
--    코드 상수를 볼 수 없으니 어쩔 수 없다.
--  🔴🔴**끄는 날 넷을 함께 내린다.** 이 한 줄을 잊으면 행사가 끝난 뒤에도
--    전원이 크레딧 10회를 받는다(등급은 안 오른다 — 크레딧 한도만 어긋난다).
--    끄는 법: update public.app_flags set value=false where key='plus_free_promo';
--
--  ⛔`profiles.plan` 은 여전히 안 건드린다. 여기 깃발은 **판정에 쓰는 값**이지
--    사람에게 붙는 등급이 아니다 — 내리면 그 순간 원래대로 돌아온다.
-- ==========================================================================

-- ── ① 깃발 표 ────────────────────────────────────────────────────────────
--  RLS 는 켜 두고 정책을 하나도 안 만든다 ⇒ 브라우저는 읽지도 쓰지도 못한다.
--  읽는 것은 security definer 함수(consume_credit)와 service_role 뿐이다.
create table if not exists public.app_flags (
  key        text primary key,
  value      boolean     not null default false,
  note       text,
  updated_at timestamptz not null default now()
);

alter table public.app_flags enable row level security;

comment on table public.app_flags is
  '서버 판정이 보는 운영 스위치. 브라우저는 접근 못 한다(정책 없음).';

insert into public.app_flags (key, value, note)
values ('plus_free_promo', true,
        '할인 기간 — 로그인만 하면 PLUS. 코드 스위치 셋(SUBSCRIPTION_LIVE·SOLO_PLUS_FREE·PLUS_FREE_PROMO)과 한 벌이다. 끝나는 날 함께 false 로.')
on conflict (key) do nothing;

-- ── ② 크레딧 소비 — 행사 중이면 free 를 plus 로 보고 한도를 매긴다 ────────
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

  update profiles set credits_used = credits_used + 1
   where id = v_uid returning credits_used into v_used;

  return json_build_object('ok', true, 'used', v_used, 'limit', v_limit,
                           'plan', v_plan, 'remaining', v_limit - v_used);
end $function$;
