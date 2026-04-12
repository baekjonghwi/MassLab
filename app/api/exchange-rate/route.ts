import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 }, // 1시간 캐시
    });
    const data = await res.json();
    const rate = data?.rates?.KRW;
    if (!rate) throw new Error("KRW rate not found");
    return NextResponse.json({ rate: Math.round(rate) });
  } catch {
    return NextResponse.json({ rate: 1500 }); // 실패 시 기본값
  }
}
