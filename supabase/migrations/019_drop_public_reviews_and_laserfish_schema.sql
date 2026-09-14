-- ==========================================================================
--  옛 후기 표와 빈 laserfish 스키마를 지운다 (2026-09-14, 018 다음)
--
--  🔴018 이 끝난 뒤라 아무것도 이 둘을 안 읽는다:
--    · public.reviews — /api/reviews(c0a1d87 배포)와 admin_overview(018) 모두 review.* 를 본다.
--      글 셋은 017·018 이 review.laserfish·review.archimap 으로 옮겼다(id 그대로).
--    · laserfish — 017 이 표를 다 지웠고, Exposed schemas 에서도 뺐다.
--  ⚠️되돌릴 수 없다. 돌리기 전에 위 두 줄이 아직 참인지 볼 것.
--  ✅2026-09-14 적용 — 운영자가 대시보드 SQL Editor 에서 직접 돌렸다.
-- ==========================================================================

drop table public.reviews;

-- restrict — 뭔가 남아 있으면 지우지 않고 멈춘다.
drop schema laserfish restrict;
