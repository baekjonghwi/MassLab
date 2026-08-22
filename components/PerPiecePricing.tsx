"use client";
import { useState, useEffect } from "react";

// ==========================================================================
//  LaserFish 건당결제 안내 — 홈(#pricing)과 /price 가 같이 쓴다.
//
//  🔴2026-08-21 되살림. 원본은 구독 개편 전(commit e38fa17^)의 홈 PRICING 구역이고,
//    출처가 둘이면 값이 어긋나므로 그때부터 이 한 곳으로 합쳤다.
//  🔴이 화면이 보이냐 마느냐는 lib/interim.ts 의 SUBSCRIPTION_LIVE 하나가 정한다 —
//    정기결제가 열리면 false→true, 구독표가 도로 이 자리에 온다.
//  ⚠️원화는 **안내일 뿐** 실제 청구 통화가 아니다(청구는 /payment가 정한다).
//    환율 API가 죽으면 1370원 고정값으로 조용히 떨어진다.
// ==========================================================================

export const PIECE_CSS = `
  .price-cards { display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; }
  .price-card {
    background: #fff; border: 1px solid #e8e8e8; border-radius: 24px;
    padding: 48px 40px; max-width: 440px; margin: 0 auto;
    box-shadow: 0 4px 32px rgba(0,0,0,0.07); text-align: center;
  }
  .price-amount { font-size: 3.5rem; font-weight: 900; letter-spacing: -0.05em; color: #111; line-height: 1; }
  .price-unit { font-size: 0.9rem; color: #999; margin-top: 8px; }
  .price-detail {
    border-top: 1px solid #f0f0f0; margin-top: 28px; padding-top: 20px;
    font-size: 0.875rem; color: #777; line-height: 2;
  }
  .price-kind {
    font-size: 0.8rem; font-weight: 600; color: #888; margin-bottom: 8px;
    text-transform: uppercase; letter-spacing: 0.05em;
  }
  @media (max-width: 640px) {
    .price-cards { flex-wrap: nowrap !important; gap: 12px !important; }
    .price-card { padding: 24px 14px; flex: 1; min-width: 0; }
    .price-amount { font-size: 2rem; }
    .price-unit { font-size: 0.72rem; }
    .price-detail { font-size: 0.72rem; line-height: 1.7; margin-top: 18px; padding-top: 14px; }
  }
`;

export default function PerPiecePricing({ lang }: { lang: string }) {
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

  const isKo = lang === "ko";
  const cards = [
    { kind: "Wall & Slab", usd: "$0.1", krw: Math.round(0.1 * usdToKrw) },
    { kind: "Terrain", usd: "$0.05", krw: Math.round(0.05 * usdToKrw) },
  ];

  return (
    <>
      <style>{PIECE_CSS}</style>
      <div className="price-cards">
        {cards.map((c) => (
          <div className="price-card" key={c.kind}>
            <div className="price-kind">{c.kind}</div>
            <div className="price-amount">{c.usd}</div>
            <div className="price-unit">
              {`${isKo ? "조각당" : "per piece"} (₩${c.krw.toLocaleString()})`}
            </div>
            <div className="price-detail">
              <div>{isKo ? "최소 주문 금액 $9.9" : "Minimum order $9.9"}</div>
              <div>{isKo ? "최대 주문 금액 $50" : "Maximum order $50"}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
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
