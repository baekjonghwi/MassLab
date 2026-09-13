"use client";

import { useEffect, useState } from "react";
import { PLAN_USD, krwTotal } from "@/lib/plans";
import type { Lang } from "@/lib/i18n";

// ==========================================================================
//  요금표가 값을 어느 통화로 보여 줄지 — 홈 가격 구역과 PlanTable 이 함께 쓴다.
//
//  🔴한국 손님에게는 원화로 보여 준다(2026-09-11 PG 심사 지적). 전에는 표가
//    "$4.99"만 들고 있었고 결제창은 원화였다 — 화면 값과 결제 값이 달랐다.
//  🔴원화 금액의 식은 lib/plans 의 krwTotal 한 곳이다. 서버(/api/subscribe/session·
//    confirm)가 같은 함수로 청구액을 계산한다. 부가세 10% 가 들어간 값이다.
//  🔴"한국 손님인가"는 결제창과 같은 기준이다 — **접속 국가**가 먼저, 그걸 모를 때만
//    화면 언어(ko). /api/subscribe/session 의 판정과 한 벌이다. 한쪽만 바꾸지 말 것.
//  ⚠️환율은 결제 시점 값이라 표의 원화는 매일 조금씩 움직인다(원화 고정가 없음 —
//    2026-09-11 사용자 결정으로 환산 유지). 실제 청구액은 결제 화면이 고정해 보여 준다.
//  ⚠️읽기 전(ready=false)에는 달러로 그린다. 검색 로봇도 이 값을 본다.
// ==========================================================================

export type PriceView = { ready: boolean; krw: boolean; rate: number };

type Plan = keyof typeof PLAN_USD;

export function usePriceView(lang: Lang): PriceView {
  const [v, setV] = useState<{ country: string | null; rate: number } | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/exchange-rate")
      .then((r) => r.json())
      .then((d: { rate?: number; country?: string | null }) => {
        if (alive) setV({ country: d.country ?? null, rate: d.rate ?? 1500 });
      })
      .catch(() => { if (alive) setV({ country: null, rate: 1500 }); });
    return () => { alive = false; };
  }, []);

  if (!v) return { ready: false, krw: false, rate: 0 };
  const krw = v.country ? v.country === "KR" : lang === "ko";
  return { ready: true, krw, rate: v.rate };
}

/** 등급 하나의 표시 가격. 원화면 부가세 포함 청구액, 아니면 달러 표시가. */
export function priceText(plan: string, view: PriceView): string | null {
  const usd = PLAN_USD[plan as Plan];
  if (usd == null) return null;
  return view.krw ? `₩${krwTotal(usd, view.rate).toLocaleString("ko-KR")}` : `$${usd.toFixed(2)}`;
}
