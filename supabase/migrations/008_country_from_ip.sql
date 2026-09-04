-- ==========================================================================
--  거주 국가의 주인을 하나로 못박는다 — 로그인할 때의 접속 국가 (2026-09-05)
--
--  🔴profiles.country 를 적는 곳은 이제 둘뿐이고, 둘 다 같은 값을 쓴다:
--    · /auth/callback            구글 · 메일 링크
--    · /api/account/country      이메일+비밀번호 로그인
--    둘 다 x-vercel-ip-country 를 읽어 set_country(c, false) 로 **덮는다**.
--
--  ⛔없어진 주인 둘:
--    · 가입 화면의 국가 드롭다운(2026-09-02~09-05) — 물어 봐야 첫 로그인에 덮였다.
--      그래서 handle_new_user 가 읽던 raw_user_meta_data->>'country' 도 이제 늘 비어
--      온다(트리거는 그대로 둔다 — coalesce 로 null 을 받게 되어 있어 무해하고,
--      옛 가입자 메타데이터는 그대로 남는다).
--    · /api/subscribe/confirm 의 카드 발급국 쓰기 — 주인이 둘이면 카드 발급국과
--      사는 곳이 다른 사람마다 값이 로그인·결제 사이를 오갔다.
--
--  ⇒ 출처가 하나뿐이 되었으므로 출처를 적던 country_src 칸을 없앤다.
--    ✅지우기 전 확인: 뷰·인덱스·제약·RLS 정책 어디에도 참조가 없고, 제품군
--      전 저장소(D:\CODE)를 통틀어 읽는 코드가 없다. 유일한 참조가 set_country 였다.
--    ⚠️버리는 값 = 365행의 출처 딱지(ip 254 · signup 92 · payment 1 · null 18).
--      country 값 자체는 그대로 두고 딱지만 버린다 — 그 365개도 각자 다음 로그인
--      때 접속 국가로 덮인다.
--
--  🔴set_country 재작성과 DROP 을 **한 트랜잭션에** 묶는다. 컬럼을 먼저 떨어뜨리면
--    그 사이에 들어온 모든 로그인의 국가 기록이 예외로 터진다.
-- ==========================================================================

create or replace function public.set_country(p_country text, p_only_if_empty boolean default false)
 returns text
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_c   text;
  v_out text;
begin
  -- 대상은 언제나 부른 사람 자신이다(auth.uid()). 남의 칸은 건드릴 수 없다.
  if v_uid is null then
    raise exception 'not signed in' using errcode = '42501';
  end if;

  -- 🔴모양은 여기서 최종 검사한다. 화면·라우트의 검사는 앞단일 뿐이다.
  v_c := upper(btrim(coalesce(p_country, '')));
  if v_c !~ '^[A-Z]{2}$' then
    raise exception 'country must be an ISO 3166-1 alpha-2 code' using errcode = '22023';
  end if;

  -- p_only_if_empty=false(기본) → 덮는다. 로그인은 늘 이쪽으로 부른다.
  insert into public.profiles (id, country)
       values (v_uid, v_c)
  on conflict (id) do update
     set country = case
                     when p_only_if_empty and profiles.country is not null
                       then profiles.country
                     else excluded.country
                   end
  returning country into v_out;

  return v_out;
end
$function$;

alter table public.profiles drop column country_src;
