"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/i18n";

// ==========================================================================
//  상단 막대의 로그인/로그아웃 자리.
//
//  🔴이게 없어서 사이트 어디에도 **로그인으로 들어가는 문이 없었다**(2026-08-22).
//    /login 은 /account · /link · /price 가 리다이렉트로 보낼 때만 열렸다.
//    구독을 파는 화면(/main)에서 로그인 없이 구독을 누를 수는 없다.
//
//  🔴판정이 끝나기 전에는 아무것도 그리지 않는다. "로그인"을 먼저 띄웠다가
//    "로그아웃"으로 바꾸면, 이미 로그인한 사람 눈에는 로그아웃된 것처럼 보인다.
//
//  ⚠️세션은 .masslabs-archi.com 쿠키 한 벌이라(lib/supabase.ts) 여기서 로그아웃하면
//    archimap 등 다른 하위 도메인도 함께 풀린다. 그게 통합 로그인의 취지다.
// ==========================================================================

export default function AuthNavLink({ className = "hnav-link" }: { className?: string }) {
  const { lang } = useLanguage();
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    // 다른 탭에서 로그인/로그아웃해도 따라 바뀐다.
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSignedIn(!!s?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  if (signedIn === null) return null;

  if (!signedIn) {
    // 로그인 뒤에는 보던 자리로 돌아온다(/main 에서 눌렀으면 /main 으로).
    const here =
      typeof window === "undefined" ? "/" : window.location.pathname + window.location.search;
    return (
      <a href={`/login?next=${encodeURIComponent(here)}`} className={className}>
        {lang === "ko" ? "로그인" : "Sign in"}
      </a>
    );
  }

  return (
    <a
      href="/login"
      className={className}
      onClick={async (e) => {
        e.preventDefault();
        await supabase().auth.signOut();
        window.location.reload();
      }}
    >
      {lang === "ko" ? "로그아웃" : "Sign out"}
    </a>
  );
}
