-- ==========================================================================
--  001. Archimap 전용 데이터를 public에서 걷어낸다.
--
--  public은 MassLabs 중앙(계정·구독)만 남기고, 앱 데이터는 앱 스키마로 간다.
--  🔴ALTER ... SET SCHEMA는 인덱스·제약·RLS 정책·트리거를 그대로 데리고 간다.
--    auth.users를 향한 FK도 유지된다 — 같은 프로젝트 안이라 끊길 게 없다.
--
--  ⚠️이 파일을 실행하는 순간 Archimap이 즉시 깨진다. 클라이언트가
--    .schema('archimap')을 붙여 재배포되기 전까지 테이블을 못 찾는다.
--    D:\CODE\Archi_map 배포와 시점을 맞출 것.
-- ==========================================================================

create schema if not exists archimap;

alter table public.style_folders set schema archimap;
alter table public.style_files   set schema archimap;
alter table public.style_refs    set schema archimap;

-- PostgREST 역할이 새 스키마를 쓰려면 USAGE가 필요하다(public에는 기본으로 있다).
-- 🔴grant는 문을 여는 것이지 통과시키는 게 아니다 — 실제 행 접근은 그대로 RLS가 막는다.
grant usage on schema archimap to anon, authenticated, service_role;
grant all on all tables    in schema archimap to anon, authenticated, service_role;
grant all on all sequences in schema archimap to anon, authenticated, service_role;
alter default privileges in schema archimap grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema archimap grant all on sequences to anon, authenticated, service_role;

-- ⚠️실행 후 Supabase 대시보드에서
--   Settings > API > Exposed schemas 에 archimap 을 추가해야 REST로 보인다.
