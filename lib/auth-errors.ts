// ==========================================================================
//  Supabase 가 비밀번호를 거절한 까닭을 화면 문구의 열쇠로 옮긴다.
//
//  🔴Supabase 오류는 영어 한 줄이다. 그대로 띄우면 한국어 화면에 영어가 섞이고,
//    무엇을 고쳐야 하는지도 안 보인다("AuthApiError: New password should be
//    different from the old password.").
//  🔴판정을 화면마다 따로 적으면 반드시 갈라진다 — /reset-password 와
//    /account/security 는 같은 updateUser 를 부르므로 같은 답을 해야 한다.
//    ⚠️2026-08-26 현재 이 파일을 쓰는 곳은 /account/security 뿐이다.
//      app/reset-password/page.tsx 가 같은 정규식을 제 안에 들고 있다 —
//      그쪽도 이 함수로 갈아 끼울 것(문구는 각 화면의 TX 에 그대로 둔다).
//  🔴문구는 여기서 만들지 않는다. 이 파일은 **까닭만** 답하고, 한국어·영어
//    문장은 화면이 고른다 — 여기에 문장을 넣으면 언어 하나가 코드에 박힌다.
// ==========================================================================

export type PasswordErrorKind =
  | "samePw"    // 지금 쓰는 것과 같은 비밀번호
  | "shortPw"   // 너무 짧다(기본 6자)
  | "weakPw"    // 흔하거나 규칙에 못 미친다
  | "reauth"    // 최근 로그인이 아니라 다시 확인이 필요하다
  | "expired"   // 세션이 끊겼다
  | null;       // 못 알아본 오류 — 화면의 "실패했습니다"로 떨어진다

export function passwordErrorKind(err: unknown): PasswordErrorKind {
  if (!err) return null;
  const e = err as { code?: unknown; message?: unknown };
  // 🔴code 를 먼저 본다 — 문장은 Supabase 판이 올라가면 바뀌지만 code 는 남는다.
  //   ⚠️그래도 정규식을 지우지 말 것: code 는 비교적 최근에 붙은 값이라
  //     오래된 배포·프록시를 거친 응답에는 message 만 오는 경우가 있다.
  const code = typeof e.code === "string" ? e.code : "";
  const msg = typeof e.message === "string" ? e.message : "";

  if (code === "same_password" || /different from the old|should be different/i.test(msg))
    return "samePw";
  if (code === "weak_password" || /known to be weak|too weak|easy to guess|should contain/i.test(msg))
    return "weakPw";
  if (code === "reauthentication_needed" || code === "reauthentication_not_valid" || /reauthentication/i.test(msg))
    return "reauth";
  if (code === "session_not_found" || code === "session_expired"
      || /session (missing|expired|not found)|JWT expired/i.test(msg))
    return "expired";
  // 🔴길이는 맨 뒤에 본다 — "Password should be at least 6 characters" 와
  //   "Password should contain at least one…"(=약한 비밀번호)가 같은 문장 틀을
  //   쓴다. 순서를 뒤집으면 약한 비밀번호가 "6자 이상" 이라고 안내된다.
  if (/at least \d+ characters|Password should be/i.test(msg))
    return "shortPw";
  return null;
}
