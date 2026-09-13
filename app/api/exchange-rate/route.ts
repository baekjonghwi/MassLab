import { NextResponse } from "next/server";
import { ipCountry } from "@/lib/countries";

// ==========================================================================
//  GET /api/exchange-rate → { rate, country }
//
//  rate    — 1 USD 가 몇 원인가(정수). 한 시간 캐시.
//  country — 이 요청의 접속 국가(ISO2, 모르면 null).
//
//  🔴country 를 함께 내주는 이유(2026-09-11) — 요금표가 "원화로 보여 줄 사람인가"를
//    결제창과 **같은 기준**으로 정하려고. 결제 채널은 체크아웃 요청의 접속 국가가
//    가른다(/api/subscribe/session). 표가 화면 언어로 따로 정하면 한국어로 보는 해외
//    사람에게 표는 원화, 결제창은 달러가 뜬다.
//  ⚠️서버 라우트끼리 부를 때(session·confirm 등)는 헤더가 없어 country 가 null 이다.
//    그쪽은 rate 만 읽는다.
// ==========================================================================
export async function GET(request: Request) {
  const country = ipCountry(request.headers);
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 }, // 1시간 캐시
    });
    const data = await res.json();
    const rate = data?.rates?.KRW;
    if (!rate) throw new Error("KRW rate not found");
    return NextResponse.json({ rate: Math.round(rate), country });
  } catch {
    return NextResponse.json({ rate: 1500, country }); // 실패 시 기본값
  }
}
