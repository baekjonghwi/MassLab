-- ==========================================================================
--  004. 7일 무료체험 (2026-08-18)
--
--  체험은 FREE 등급이 아니라 **구독 안에** 붙는다. 유료 3단계(plus·pro·max)를
--  처음 고르면 카드(빌링키)는 등록하되 청구는 7일 뒤 첫 회부터 시작한다.
--
--  🔴체험권은 **플랜별이 아니라 계정당 1회**다. pro로 7일 쓰고 plus로 갈아타서
--    또 7일을 받는 것을 막아야 하므로, 소진 기록을 subscriptions(제품·플랜 단위)가
--    아니라 profiles(계정 단위)에 남긴다.
-- ==========================================================================

-- ── ① 체험권 소진 기록 ────────────────────────────────────────────────────
-- null = 아직 안 씀. 값이 있으면 두 번째부터는 즉시 청구다.
-- 🔴해지하고 다시 가입해도 이 값은 지우지 않는다 — 지우면 무한 체험이 된다.
alter table public.profiles
  add column if not exists trial_used_at timestamptz;

comment on column public.profiles.trial_used_at is
  '7일 무료체험을 소진한 시각. 계정당 1회. null이면 미사용.';

-- ── ② 결제 세션에 체험 여부를 박아둔다 ────────────────────────────────────
-- 🔴판정은 /api/subscribe/start 에서 **서버가** 하고 그 결과를 여기 저장한다.
--   confirm 은 이 값만 읽는다. 브라우저가 보낸 값을 믿으면 위조해서 영원히 공짜다.
alter table public.checkout_sessions
  add column if not exists trial boolean not null default false;

comment on column public.checkout_sessions.trial is
  '이 결제로 7일 체험이 시작되는가. 서버가 start에서 판정해 기록한다(클라이언트 입력 금지).';

-- ── ③ 구독 상태에 trialing 추가 ───────────────────────────────────────────
-- 체험 중 = 돈은 안 냈지만 쓸 수 있는 상태. active와 구분해야
-- "첫 청구가 아직 없었다"를 알 수 있다(해지 시 환불 대상이 없다는 뜻이기도 하다).
alter table public.subscriptions
  drop constraint if exists subscriptions_status_check;
alter table public.subscriptions
  add constraint subscriptions_status_check
  check (status in ('trialing','active','canceled','past_due'));

-- ── ④ 권한 판정에 trialing 을 포함시킨다 ──────────────────────────────────
-- 🔴이걸 빠뜨리면 체험 중인 사람이 결제까지 다 해놓고 프로그램을 못 쓴다.
--   플러그인·Archimap 은 이 함수만 보므로, 체험 개념을 각자 알 필요가 없다.
create or replace function public.plan_for(p_user uuid, p_product text)
 returns text
 language sql
 stable security definer
 set search_path to 'public'
as $function$
  select coalesce(
    (select 'max' from profiles
      where id = p_user and plan = 'admin'),
    (select plan
       from subscriptions
      where user_id = p_user and product = 'all'
        and (status in ('active','trialing') or (status = 'canceled' and canceled_at > now()))
      limit 1),
    (select plan
       from subscriptions
      where user_id = p_user and product = p_product
        and (status in ('active','trialing') or (status = 'canceled' and canceled_at > now()))
      limit 1),
    'free');
$function$;
