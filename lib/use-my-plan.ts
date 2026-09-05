"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { effectivePlan } from "@/lib/interim";

// ==========================================================================
//  지금 이 사람의 등급 — 요금제 표에서 **어느 기둥에 불을 켤지**를 정한다.
//
//  🔴등급을 손으로 못박지 말 것. 2026-09-05 까지 홈 가격표는 단추가
//    `tier.key === "plus"` 로 박혀 있어서, MAX 를 쓰는 사람에게도 PLUS 칸에
//    "이용 중"이 떴다. 지금 PLUS 가 켜지는 건 그 사람이 PLUS 라서가 아니라
//    **할인 기간이라 free 가 plus 로 올라가서**다 — 그 판정은 effectivePlan
//    한 곳에서만 한다.
//
//  🔴답은 세 가지다 — ready=false(아직 모른다) · plan=null(로그아웃) · 등급.
//    ⚠️"모른다"를 로그아웃으로 뭉개면 안 된다. 이미 로그인한 사람에게 남의
//      칸이 먼저 켜졌다가 옮겨 붙는다. 부르는 쪽은 ready 전에는 아무 칸도
//      안 켠다(useSignedIn 과 같은 규칙이다).
//
//  🔴다른 탭에서 로그인·로그아웃해도 따라 바뀐다(onAuthStateChange).
//  ⚠️p_product 는 "all" 이다 — 구독이 프로그램별이 아니라 계정 단위라서,
//    /account · /price 가 쓰는 것과 같은 값이어야 세 화면의 답이 같다.
// ==========================================================================
export function useMyPlan(): { ready: boolean; plan: string | null } {
  const [state, setState] = useState<{ ready: boolean; plan: string | null }>({
    ready: false,
    plan: null,
  });

  useEffect(() => {
    let alive = true;
    const sb = supabase();

    const read = async () => {
      const { data: u } = await sb.auth.getUser();
      if (!alive) return;
      if (!u.user) { setState({ ready: true, plan: null }); return; }
      const { data } = await sb.rpc("my_plan", { p_product: "all" });
      if (!alive) return;
      setState({ ready: true, plan: effectivePlan(typeof data === "string" ? data : "free") });
    };

    read();
    const { data } = sb.auth.onAuthStateChange(() => { read(); });
    return () => { alive = false; data.subscription.unsubscribe(); };
  }, []);

  return state;
}
