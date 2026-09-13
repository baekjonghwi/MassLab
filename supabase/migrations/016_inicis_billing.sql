-- ==========================================================================
--  국내 정기결제를 KG이니시스로 붙인다 (2026-09-11)
--
--  1) subscriptions.channel 제약 — eximbay · inicis.
--     ⚠️'toss'(007)를 뺀다. 토스는 심사 중 해지했고(2026-09-02) 그 값으로 적힌 행은
--       한 번도 없었다(2026-09-11 확인: subscriptions 0행).
--     🔴lib/subscription.ts 의 Channel 타입과 한 벌이다. 한쪽만 고치면 결제가
--       **돈이 빠진 뒤** 저장 단계에서 터진다.
--
--  2) 구매자 이름·휴대폰 — KG이니시스는 빌링키 발급(PC)과 **매달 빌링키 청구** 모두
--     구매자 이름·연락처·이메일을 필수로 받는다(포트원 문서). 이메일은 계정에 있고,
--     이름·연락처는 결제 화면에서 받아 여기 둔다.
--     · checkout_sessions — 결제창을 열기 **전에** 적는다(/api/subscribe/buyer).
--       모바일은 PG 창에서 우리 주소로 되돌아오며 화면 상태가 다 날아가므로, 값을
--       주소창에 싣는 대신 세션 행에 둔다(연락처가 브라우저 기록에 남지 않는다).
--     · subscriptions — confirm 이 세션에서 옮겨 적는다. 크론이 매달 이 값으로 긁는다.
--     🔴개인정보처리방침의 수집 항목에 함께 올렸다(lib/translations 의 privacy).
--     ⚠️행을 볼 수 있는 사람은 본인뿐이다(기존 RLS: auth.uid() = user_id).
--
--  3) is_test — 테스트 채널(lib/interim 의 USE_TEST_CHANNELS)로 생긴 구독 표시.
--     PG 심사 기간에 사이트를 띄운 채 테스트 결제를 열어 두었으므로, 아무나 테스트
--     카드로 PRO·MAX 를 얻을 수 있다. 실연동으로 넘어가는 날 지운다:
--
--       -- 지울 사람부터 적어 둔다(등급 캐시를 다시 계산해야 한다)
--       select user_id from public.subscriptions where is_test;
--       delete from public.subscriptions where is_test;
--       -- 그 다음 각 user_id 에 대해 lib/subscription 의 syncPlanCache 를 돌린다
--       -- (profiles.plan 이 PRO·MAX 로 남지 않게).
-- ==========================================================================

alter table public.subscriptions
  drop constraint if exists subscriptions_channel_check;

alter table public.subscriptions
  add constraint subscriptions_channel_check
  check (channel = any (array['eximbay'::text, 'inicis'::text]));

alter table public.subscriptions
  add column if not exists buyer_name  text,
  add column if not exists buyer_phone text,
  add column if not exists is_test     boolean not null default false;

alter table public.checkout_sessions
  add column if not exists buyer_name  text,
  add column if not exists buyer_phone text;

-- 4) krw_rate — 결제 화면이 손님에게 보여 준 환율을 고정한다.
--    /api/subscribe/session 이 처음 불릴 때 한 번 적고, confirm 이 그 값으로 청구한다.
--    전에는 두 라우트가 환율을 따로 읽어, 결제 화면을 연 뒤 정각(환율 캐시 1시간)을
--    넘기면 화면의 원화와 실제 청구액이 갈렸다. PG 심사가 보는 "화면 값 = 결제 값".
alter table public.checkout_sessions
  add column if not exists krw_rate numeric;
