-- ==========================================================================
--  006. 닉네임 — 계정 하나에 이름 하나. 모든 프로그램이 이걸 함께 본다.
--
--  🔴새 칸을 만들지 않는다. 닉네임 = **이미 있는 public.profiles.display_name**이다.
--    archiMap 이 진작부터 이 칸을 읽고 쓰고 있다(public/app.js — onAuth1 에서
--    select, setUserName 에서 update). 새 칸을 파면 두 이름이 갈라진다.
--    → MassLabs /account 는 archiMap·Colorgram 과 **같은 칸**을 고치는 것뿐이다.
--
--  🔴읽기는 지금처럼 표를 그대로 본다(profiles 는 select 가 열려 있다).
--    쓰기만 이 함수로 모은다 — 규칙(길이·공백)이 프로그램마다 따로 있으면
--    한쪽에서 20자, 다른 쪽에서 200자가 들어와 목록이 깨진다.
--
--  ⛔display_name 에 CHECK 제약을 걸지 않는다. 가입 트리거(handle_new_user)가
--    이메일 앞부분을 그대로 넣기 때문에, 제약을 걸면 이름이 긴 사람은
--    **가입 자체가 실패한다**. 규칙은 이 함수 안에만 둔다.
-- ==========================================================================

create or replace function public.set_display_name(p_name text)
returns text
language plpgsql security definer set search_path to ''
as $$
declare
  v_uid  uuid := auth.uid();
  v_name text;
begin
  if v_uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  -- 앞뒤 공백은 떼고, 가운데 이어진 공백은 한 칸으로 줄인다.
  -- 🔴이걸 안 하면 "김  철수"와 "김 철수"가 다른 이름이 되고, 공백만 스무 칸인
  --   이름이 목록에서 빈 줄로 보인다.
  v_name := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));

  -- 🔴글자 수로 센다(바이트가 아니라). 한글·한자·이모지 한 글자는 여기서 1이다 —
  --   바이트로 세면 한글 이름만 6자에서 잘린다.
  --   ⚠️문자 종류는 막지 않는다. 한글·한자·가나·키릴·이모지 다 된다.
  if char_length(v_name) < 2 or char_length(v_name) > 20 then
    raise exception 'nickname must be 2..20 characters' using errcode = '22023';
  end if;
  -- 줄바꿈·탭은 위에서 공백이 됐고, 남은 제어문자만 막는다.
  if v_name ~ '[[:cntrl:]]' then
    raise exception 'nickname must not contain control characters' using errcode = '22023';
  end if;
  -- 🔴눈에 보이는 글자가 하나는 있어야 한다. 폭 없는 문자(U+200B 따위)는 길이로는
  --   세어지지만 화면에는 아무것도 없다 — 목록에 빈 줄로 선 이름이 생긴다.
  --   ⚠️그 문자들을 통째로 금지하지는 않는다. U+200D(ZWJ)는 가족 이모지처럼
  --     여러 글자를 하나로 잇는 데 쓰여서, 막으면 멀쩡한 이름이 거절된다.
  --     "보이는 글자가 하나도 없는 이름"만 막는다.
  if regexp_replace(v_name, '[\u00ad\u200b-\u200f\u202a-\u202e\u2060-\u2064\ufeff ]', '', 'g') = '' then
    raise exception 'nickname must contain a visible character' using errcode = '22023';
  end if;

  -- ⚠️같은 이름을 막지 않는다(중복 허용). 유일하게 만들려면 부분 유니크 인덱스가
  --   필요한데, 그 순간 이메일 앞부분이 겹치는 두 사람의 **가입이 깨진다**
  --   (info@a.com · info@b.com → 둘 다 'info'). 이름은 표시용이고, 신원은 id다.
  insert into public.profiles (id, display_name)
       values (v_uid, v_name)
  on conflict (id) do update set display_name = excluded.display_name;

  return v_name;
end $$;

revoke all    on function public.set_display_name(text) from public;
grant execute on function public.set_display_name(text) to authenticated;

comment on column public.profiles.display_name is
  '닉네임. 계정 하나에 하나이고 MassLabs·archiMap·Colorgram 이 함께 본다. 쓰기는 public.set_display_name() 로.';
