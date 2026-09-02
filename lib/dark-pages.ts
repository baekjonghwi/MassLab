// ==========================================================================
//  어두운 화면 목록 — 전역 상단 띠(components/LanguageBar)와 밝은 바닥글
//  (components/LayoutFooter)을 **안 붙이는** 주소들.
//
//  🔴목록이 두 곳에 있으면 반드시 어긋난다. 전에 홈 하나뿐일 때는 두 파일이
//    각자 `pathname === "/"` 를 적고 있었는데, 로그인 화면이 어두워지면서
//    한쪽만 고치면 흰 띠가 남는 상태가 됐다 — 그래서 여기로 뺐다.
//
//  🔴어두운 화면을 새로 만들면 **주소를 여기에 한 줄 더한다.** 그 화면은 제
//    안에 상단 막대(돌아갈 길)와 언어 토글을 갖고 있어야 한다 — 안 그러면
//    막다른 길이 된다.
//    · /               홈            components/LandingView
//    · /login          로그인        components/AuthCard 의 AuthShell
//    · /reset-password 비밀번호 재설정 같은 AuthShell
//    · /account        내 계정      app/account/page.tsx 의 Shell (components/DarkTopBar)
//    · /policy/*       약관·방침    components/PolicyView (같은 DarkTopBar)
//    · /price          비용        app/price/page.tsx (같은 DarkTopBar, 2026-08-28)
//    · /welcome        가입 직후 국가 묻기  같은 AuthShell (2026-09-02)
//
//  🔴여기 없는 화면(/contact · /link · /payment · /review 등)은
//    아직 밝은 화면이라 저 띠와 바닥글이 붙는다.
// ==========================================================================
export const DARK_PAGES: string[] = [
  "/", "/login", "/welcome", "/reset-password", "/account", "/price",
  "/policy/terms-and-policy", "/policy/privacy",
];
