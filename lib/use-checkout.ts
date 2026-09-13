"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

// ==========================================================================
//  구독 결제를 시작한다 — 홈 가격 구역과 /price 가 함께 쓴다.
//
//  하는 일: 로그인 확인 → /api/subscribe/start 로 체크아웃 세션을 연다 →
//  /subscribe?sid=… 로 넘어간다. 금액·채널은 거기서 서버가 정한다.
//
//  🔴로그인이 없으면 로그인부터 — 끝나면 next 로 돌아온다.
//  🔴화면은 error 코드만 받는다. 문구는 부르는 화면이 제 언어로 옮긴다
//    (bundle_active = 이미 구독 중 · failed = 그 밖의 모든 실패).
// ==========================================================================

export type CheckoutError = "" | "bundle_active" | "failed";

export const SUBSCRIPTION_PRODUCT = "all";

export function useStartCheckout() {
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<CheckoutError>("");

  const start = async (plan: string, next: string) => {
    const token = (await supabase().auth.getSession()).data.session?.access_token;
    if (!token) {
      window.location.href = `/login?next=${encodeURIComponent(next)}`;
      return;
    }
    setBusy(plan);
    setError("");
    try {
      const r = await fetch("/api/subscribe/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ product: SUBSCRIPTION_PRODUCT, plan }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok || !d.url) {
        setError(d.error === "bundle_active" ? "bundle_active" : "failed");
        setBusy("");
        return;
      }
      // ⚠️busy 를 풀지 않는다 — 곧 페이지가 바뀐다. 풀면 그 사이 두 번 눌린다.
      window.location.href = d.url;
    } catch {
      setError("failed");
      setBusy("");
    }
  };

  return { start, busy, error };
}
