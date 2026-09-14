import { NextResponse } from "next/server";
import { ipCountry } from "@/lib/countries";
import { PLAN_USD, krwTotal } from "@/lib/plans";

// ==========================================================================
//  GET /api/exchange-rate → { rate, country, krw }
//
//  rate    — 1 USD 가 몇 원인가(정수). 한 시간 캐시.
//  country — 이 요청의 접속 국가(ISO2, 모르면 null).
//  krw     — 등급별 국내 청구액(부가세 포함, 원). { plus, pro, max }
//
//  🔴country 를 함께 내주는 이유(2026-09-11) — 요금표가 "원화로 보여 줄 사람인가"를
//    결제창과 **같은 기준**으로 정하려고. 결제 채널은 체크아웃 요청의 접속 국가가
//    가른다(/api/subscribe/session). 표가 화면 언어로 따로 정하면 한국어로 보는 해외
//    사람에게 표는 원화, 결제창은 달러가 뜬다.
//  🔴krw 를 계산해서 내주는 이유(2026-09-14) — archiMap PLAN 창·LaserFish 홈도 원화를
//    그린다. 저장소가 달라 lib/plans 의 krwTotal 을 못 부르는데, 식을 저마다 베끼면
//    언젠가 결제창과 1원씩 갈린다. 그래서 **계산은 여기서만** 하고 저쪽은 받아 적는다.
//  🔴CORS — 하위 도메인(archimap·laserfish.masslabs-archi.com)이 브라우저에서 읽는다.
//    ⚠️접속 국가는 **요청을 보낸 브라우저**의 것이라 다른 도메인에서 불러도 맞는 값이 나온다.
//  ⚠️서버 라우트끼리 부를 때(session·confirm 등)는 헤더가 없어 country 가 null 이다.
//    그쪽은 rate 만 읽는다.
// ==========================================================================

function cors(origin: string | null): HeadersInit {
  const ok = origin && /^https:\/\/([a-z0-9-]+\.)?masslabs-archi\.com$/.test(origin);
  return ok ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : { Vary: "Origin" };
}

function body(rate: number, country: string | null) {
  return {
    rate,
    country,
    krw: {
      plus: krwTotal(PLAN_USD.plus, rate),
      pro: krwTotal(PLAN_USD.pro, rate),
      max: krwTotal(PLAN_USD.max, rate),
    },
  };
}

export async function GET(request: Request) {
  const country = ipCountry(request.headers);
  const h = cors(request.headers.get("origin"));
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 }, // 1시간 캐시
    });
    const data = await res.json();
    const rate = data?.rates?.KRW;
    if (!rate) throw new Error("KRW rate not found");
    return NextResponse.json(body(Math.round(rate), country), { headers: h });
  } catch {
    return NextResponse.json(body(1500, country), { headers: h }); // 실패 시 기본값
  }
}
