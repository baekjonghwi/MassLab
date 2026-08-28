"use client";
import { useState, useEffect } from "react";

// ==========================================================================
//  LaserFish 건당결제의 **값과 규칙**이 사는 곳 — 홈(components/LandingView)과
//  /price 가 같이 읽는다. 🔴여기에 화면은 없다. 카드는 두 화면이 각자 그린다.
//
//  🔴2026-08-21 되살림. 원본은 구독 개편 전(commit e38fa17^)의 홈 PRICING 구역이고,
//    출처가 둘이면 값이 어긋나므로 그때부터 이 한 곳으로 합쳤다.
//  🔴2026-08-28 — 밝은 카드(기본 export 였던 PerPiecePricing 과 PIECE_CSS)를 지웠다.
//    /main(HomeView)이 유일한 사용처였고 그 화면을 지우면서 같이 죽었다.
//    ⛔여기에 화면을 다시 만들지 말 것 — 두 화면의 그림이 또 갈라진다.
//  ⚠️원화는 **안내일 뿐** 실제 청구 통화가 아니다(청구는 /payment가 정한다).
//    환율 API가 죽으면 1370원 고정값으로 조용히 떨어진다.
// ==========================================================================

// ==========================================================================
//  🔴건당 단가의 유일한 출처. 새 홈(components/LandingView.tsx)의 오른쪽
//    가격표도 여기서 읽는다 — 값을 두 곳에 적으면 언젠가 반드시 어긋난다.
//  ⚠️실제 청구 금액을 세는 곳은 /payment 다. 여기 값을 고치면 그쪽도 확인할 것.
// ==========================================================================
export const PIECE_PRICES = [
  { kind: "Wall & Slab", usd: 0.1 },
  { kind: "Terrain", usd: 0.05 },
] as const;
export const PIECE_MIN_USD = 9.9;
export const PIECE_MAX_USD = 50;

// ==========================================================================
//  🔴환율 규칙의 유일한 출처. 홈과 /price 가 함께 쓴다 —
//    fetch 를 두 벌 적으면 한쪽만 폴백 값이 달라지거나 API 주소가 갈린다.
//  ⚠️원화는 **안내일 뿐** 실제 청구 통화가 아니다(청구는 /payment 가 정한다).
//    API 가 죽으면 1370원 고정값으로 조용히 떨어진다.
// ==========================================================================
export function useUsdToKrw() {
  const [usdToKrw, setUsdToKrw] = useState(1370);

  useEffect(() => {
    fetch("https://open.er-api.com/v6/latest/USD")
      .then((r) => r.json())
      .then((data) => {
        const rate: number = data?.rates?.KRW;
        if (rate) setUsdToKrw(rate);
      })
      .catch(() => {});
  }, []);

  return usdToKrw;
}

// 카드 위에 붙는 설명 두 줄 — 홈과 /price가 같은 말을 해야 한다.
export function PerPieceNote({ lang }: { lang: string }) {
  return lang === "ko" ? (
    <>
      생성된 조각에 대해서만 결제됩니다. 오류가 발생한 부분은 청구되지 않습니다.
      <br />
      아래 컴포넌트를 제외한 다른 컴포넌트는 무료입니다.
    </>
  ) : (
    <>
      You only pay for successfully generated pieces. Failed pieces are never charged.
      <br />
      All components other than the ones listed below are free.
    </>
  );
}
