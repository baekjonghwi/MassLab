-- ==========================================================================
--  후기 바꿔 끼우기 — 현황판이 review.* 를 읽는다 (2026-09-14, 017 의 뒷걸음)
--
--  🔴차례 — 이 파일은 아래 셋이 끝난 **뒤에** 돌렸다.
--    ① 대시보드 › Data API › Exposed schemas: `review` 넣고 `laserfish` 뺐다(SQL 로는 못 바꾼다).
--       ⚠️review 가 없으면 /api/reviews 가 406(PGRST106). laserfish 를 목록에 둔 채
--         스키마를 지우면 PostgREST 가 스키마 캐시를 못 읽어 전 제품의 REST 가 멈출 수 있다.
--    ② MassLabs 배포 — /api/reviews 가 review.<제품> 을 읽고 쓰는 판(c0a1d87).
--    ③ 이 파일.
--
--  하는 일:
--    · 017 뒤에 옛 API 로 들어온 후기를 review.* 로 한 번 더 옮긴다(id 가 같으면 새 것으로 덮는다).
--    · admin_overview 가 후기를 review.* 에서 세고, 017 이 0 으로 남겨 둔 LaserFish 도면 수 키를 뗀다.
--    · (지우기는 019.)
-- ==========================================================================

-- ── 옮기기(마지막 한 번) ───────────────────────────────────────────────────
do $$
declare
  p text;
begin
  foreach p in array array['laserfish', 'archimap', 'colorgram'] loop
    execute format($f$
      insert into review.%1$I as t (id, user_id, nickname, rating, body, photo_url, lang, status, created_at, updated_at)
      select id, user_id, nickname, rating, body, photo_url, lang, status, created_at, updated_at
      from public.reviews where product = %1$L
      on conflict (id) do update set
        nickname = excluded.nickname, rating = excluded.rating, body = excluded.body,
        photo_url = excluded.photo_url, lang = excluded.lang, status = excluded.status,
        updated_at = excluded.updated_at
      where excluded.updated_at > t.updated_at$f$, p);
  end loop;
end $$;

-- ── admin_overview ─────────────────────────────────────────────────────────
--  🔴017 과 같은 방식으로 **지금 정의를 고쳐 쓴다**(014 판을 통째로 옮겨 적으면 그 사이에
--    고친 줄을 되돌릴 수 있다). 고칠 자리가 안 보이면 멈춘다.
do $$
declare
  d text;
  n text;
begin
  d := pg_get_functiondef('public.admin_overview'::regproc);

  -- 후기 수(visible) — 제품별 표를 더한다.
  n := replace(d,
    $x$(select count(*) from public.reviews where status = 'visible')$x$,
    $x$((select count(*) from review.laserfish where status = 'visible')
                 + (select count(*) from review.archimap  where status = 'visible')
                 + (select count(*) from review.colorgram where status = 'visible'))$x$);
  if n = d then raise exception 'admin_overview: 후기 수 자리를 못 찾았다'; end if;
  d := n;

  -- 후기 목록 — 표 이름을 product 칸으로 되살려 한 줄로 잇는다(대시보드가 product 로 칠한다).
  n := replace(d,
    $x$from public.reviews)$x$,
    $x$from (
                select 'laserfish'::text as product, id, nickname, rating, body, lang, status, created_at from review.laserfish
                union all
                select 'archimap', id, nickname, rating, body, lang, status, created_at from review.archimap
                union all
                select 'colorgram', id, nickname, rating, body, lang, status, created_at from review.colorgram
              ) r)$x$);
  if n = d then raise exception 'admin_overview: 후기 목록 자리를 못 찾았다'; end if;
  d := n;

  -- 017 이 0 으로 남겨 둔 LaserFish 도면 수 키를 뗀다(새 대시보드는 안 읽는다).
  n := regexp_replace(d, $x$,\s*'laserfish_cuts',\s*0,\s*'laserfish_cuts7',\s*0$x$, '');
  if n = d then raise exception 'admin_overview: laserfish_cuts 자리를 못 찾았다'; end if;
  d := n;

  if position('public.reviews' in d) > 0 or position('laserfish_cuts' in d) > 0 then
    raise exception 'admin_overview: 옛 참조가 남았다';
  end if;
  execute d;
end $$;

-- ⚠️지우기(public.reviews · 빈 laserfish 스키마)는 019 로 나눴다 — 되돌릴 수 없는 일이라
--   따로 확인받고 돌린다. 이 파일이 끝난 뒤로는 아무것도 public.reviews 를 안 읽는다.
