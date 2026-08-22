-- ==========================================================================
--  005. Colorgram 저장(하트) 기능.
--
--  ⚠️Colorgram은 "저장"과 "좋아요"를 나누지 않는다 — 하트 하나가 곧
--    '내 팔레트에 담기'다. 그래서 표도 한 벌이다.
--
--  🔴표는 colorgram 스키마에 두되 **RLS 정책을 하나도 만들지 않는다**(= REST 직접
--    접근 불가). 클라이언트는 아래 public.colorgram_* 함수로만 드나든다.
--    → Supabase 대시보드의 Exposed schemas를 건드릴 필요가 없다.
--      (archimap은 표를 직접 열어서 그 설정이 필요했다. 같은 실수를 반복하지 않는다.)
--
--  🔴팔레트의 신원 = 색 배열을 정규화한 문자열 "1a2b3c-4d5e6f-..."
--    Colorgram lib/color.ts의 encodePalette()와 **같은 규칙**이다.
--    한쪽만 고치면 저장본이 조용히 갈라진다.
--    ⚠️순서를 유지한다(정렬하지 않는다) — 공유 링크 ?p= 가 순서를 싣기 때문에
--      같은 색을 다른 순서로 배치한 건 다른 팔레트로 센다.
-- ==========================================================================

create schema if not exists colorgram;
grant usage on schema colorgram to service_role;


-- ── 팔레트(공개) — 좋아요 수를 여기 모은다 ────────────────────────────────
create table colorgram.palettes (
  key        text primary key,
  colors     text[] not null check (array_length(colors, 1) between 2 and 10),
  like_count integer not null default 0 check (like_count >= 0),
  created_at timestamptz not null default now()
);

-- ── 누가 무엇을 담았나 ────────────────────────────────────────────────────
-- 🔴colors를 여기에도 복사해 둔다(스냅샷). palettes를 조인하지 않아도 내 목록이
--   서고, 나중에 큐레이션 목록이 바뀌어도 내가 담아 둔 색은 그대로 남는다.
create table colorgram.likes (
  key        text not null references colorgram.palettes(key) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  colors     text[] not null,
  source     text not null default 'curated' check (source in ('curated', 'generated')),
  created_at timestamptz not null default now(),
  primary key (key, user_id)
);
create index colorgram_likes_user_idx on colorgram.likes (user_id, created_at desc);

-- 🔴정책 없음 = 아무도 표를 직접 못 만진다. 통로는 아래 함수뿐.
alter table colorgram.palettes enable row level security;
alter table colorgram.likes    enable row level security;


-- ── 하트 토글 ─────────────────────────────────────────────────────────────
-- 색 배열을 그대로 받아서 정규화까지 서버가 한다. 클라이언트가 보낸 key를
-- 믿지 않는다 — 믿으면 아무 문자열이나 팔레트로 등록할 수 있다.
create or replace function public.colorgram_toggle_like(
  p_colors text[],
  p_source text default 'curated'
)
returns table (palette_key text, liked boolean, likes integer)
language plpgsql security definer set search_path to ''
as $$
declare
  v_uid    uuid := auth.uid();
  v_colors text[];
  v_key    text;
  v_liked  boolean;
begin
  if v_uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;
  if p_colors is null or array_length(p_colors, 1) is null
     or array_length(p_colors, 1) < 2 or array_length(p_colors, 1) > 10 then
    raise exception 'palette must have 2..10 colors' using errcode = '22023';
  end if;
  if p_source is null or p_source not in ('curated', 'generated') then
    p_source := 'curated';
  end if;

  -- '#FF0000' → 'ff0000', 순서 유지
  select array_agg(s.x order by s.ord) into v_colors
  from (
    select lower(replace(c, '#', '')) as x, ord
    from unnest(p_colors) with ordinality as t(c, ord)
  ) s;

  if exists (select 1 from unnest(v_colors) as c where c !~ '^[0-9a-f]{6}$') then
    raise exception 'colors must be 6-digit hex' using errcode = '22023';
  end if;

  v_key := array_to_string(v_colors, '-');

  insert into colorgram.palettes (key, colors) values (v_key, v_colors)
    on conflict (key) do nothing;

  delete from colorgram.likes l where l.key = v_key and l.user_id = v_uid;
  if found then
    v_liked := false;
    update colorgram.palettes p
       set like_count = greatest(p.like_count - 1, 0)
     where p.key = v_key;
  else
    v_liked := true;
    insert into colorgram.likes (key, user_id, colors, source)
      values (v_key, v_uid, v_colors, p_source);
    update colorgram.palettes p
       set like_count = p.like_count + 1
     where p.key = v_key;
  end if;

  return query
    select p.key, v_liked, p.like_count
      from colorgram.palettes p
     where p.key = v_key;
end;
$$;


-- ── 내가 담은 목록 ────────────────────────────────────────────────────────
create or replace function public.colorgram_my_saved()
returns table (palette_key text, colors text[], source text, saved_at timestamptz, likes integer)
language sql security definer stable set search_path to ''
as $$
  select l.key, l.colors, l.source, l.created_at, p.like_count
    from colorgram.likes l
    join colorgram.palettes p on p.key = l.key
   where l.user_id = auth.uid()
   order by l.created_at desc;
$$;


-- ── 화면에 보이는 팔레트들의 좋아요 수 + 내가 눌렀는지 ────────────────────
-- 비로그인도 부를 수 있다(liked는 전부 false로 나온다).
create or replace function public.colorgram_like_counts(p_keys text[])
returns table (palette_key text, likes integer, liked boolean)
language sql security definer stable set search_path to ''
as $$
  select k.key,
         coalesce(p.like_count, 0),
         auth.uid() is not null
           and exists (select 1 from colorgram.likes l
                        where l.key = k.key and l.user_id = auth.uid())
    from unnest(p_keys) as k(key)
    left join colorgram.palettes p on p.key = k.key;
$$;


revoke all on function public.colorgram_toggle_like(text[], text) from public;
revoke all on function public.colorgram_my_saved()               from public;
revoke all on function public.colorgram_like_counts(text[])      from public;

grant execute on function public.colorgram_toggle_like(text[], text) to authenticated;
grant execute on function public.colorgram_my_saved()               to authenticated;
grant execute on function public.colorgram_like_counts(text[])      to anon, authenticated;
