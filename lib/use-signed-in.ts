"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

// ==========================================================================
//  지금 로그인돼 있는가 — 상단 막대가 [내 구독]과 [로그인]을 가르는 기준.
//
//  🔴판정을 두 곳에 적으면 반드시 어긋난다. 예전에 [내 구독]은 아무 조건 없이
//    늘 그려지고 [로그인]만 로그아웃일 때 붙어서, 로그아웃한 사람 눈에 **둘이
//    나란히** 떴다(2026-08-26 발견). 이제 한 곳에서만 답한다.
//
//  🔴답은 세 가지다 — null(아직 모른다) · true · false.
//    ⚠️"모른다"를 false 로 뭉개면 안 된다. 이미 로그인한 사람에게 [로그인]이
//      먼저 번쩍했다가 사라진다. 부르는 쪽은 null 이면 **아무것도 안 그린다**.
//
//  🔴다른 탭에서 로그인·로그아웃해도 따라 바뀐다(onAuthStateChange).
// ==========================================================================
export function useSignedIn(): boolean | null {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const sb = supabase();
    sb.auth.getUser().then(({ data }) => setSignedIn(!!data.user));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSignedIn(!!s?.user));
    return () => data.subscription.unsubscribe();
  }, []);

  return signedIn;
}
