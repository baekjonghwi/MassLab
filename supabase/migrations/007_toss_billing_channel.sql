-- ==========================================================================
--  구독 결제 채널을 갤럭시아 → 토스페이먼츠로 옮긴다 (2026-09-01)
--
--  🔴subscriptions.channel 에는 lib/subscription.ts 의 Channel 타입 값이 그대로
--    적힌다. 코드만 'toss' 로 바꾸고 이 제약을 그대로 두면, 국내 첫 구독이
--    **결제가 끝난 뒤** 저장 단계에서 터진다(돈은 빠지고 구독은 안 생긴다).
--
--  ⚠️'galaxia' 는 뺀다 — 단건결제(/payment)는 여전히 갤럭시아지만 그쪽은 이 표를
--    쓰지 않는다. 남겨 두면 죽은 코드가 조용히 그 값을 쓸 수 있다.
--  ✅옛 데이터 걱정은 없다: subscriptions 는 0행이다(2026-09-01 확인).
-- ==========================================================================
alter table public.subscriptions
  drop constraint if exists subscriptions_channel_check;

alter table public.subscriptions
  add constraint subscriptions_channel_check
  check (channel = any (array['eximbay'::text, 'toss'::text]));
