-- ==========================================================================
--  가입 메타데이터에 남은 country 를 걷어낸다 (2026-09-05)
--
--  🔴008 에서 국가의 주인을 "로그인할 때의 접속 국가" 하나로 줄이면서 가입 화면이
--    그 값을 더는 보내지 않는다 ⇒ 트리거가 읽을 것도, 남겨 둘 것도 없다.
--    · handle_new_user 의 country 읽기를 뺀다(display_name 만 받는다).
--    · 3일치(2026-09-02~09-04) 이메일 가입 17건의 죽은 키를 지운다.
--
--  ⚠️버려도 되는 이유 = 그 17개는 이미 profiles.country 에 반영돼 있고, 그 값도
--    각자 다음 로그인 때 접속 국가로 덮인다. 메타데이터 쪽은 아무도 읽지 않는다.
--  ⚠️UPDATE 는 on_auth_user_created(AFTER INSERT)를 깨우지 않는다 — 확인했다.
--  ⚠️JWT 의 user_metadata 클레임은 다음 갱신 때까지 옛 값을 물고 있다. 읽는 데가
--    없어서 무해하다.
-- ==========================================================================

create or replace function public.handle_new_user()
 returns trigger
 language plpgsql
 security definer
 set search_path to ''
as $function$
begin
  -- ⛔country 는 여기서 받지 않는다. 로그인이 접속 국가로 적는다
  --   (/auth/callback · /api/account/country → set_country).
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'display_name',''), split_part(coalesce(new.email,''),'@',1))
  )
  on conflict (id) do nothing;
  return new;
end $function$;

-- 🔴키 하나만 뺀다 — 같은 칸의 GoTrue 값(sub·email·email_verified·phone_verified)은
--   건드리지 않는다. 통째로 덮어쓰면 그것들이 함께 날아간다.
update auth.users
   set raw_user_meta_data = raw_user_meta_data - 'country'
 where raw_user_meta_data ? 'country';
