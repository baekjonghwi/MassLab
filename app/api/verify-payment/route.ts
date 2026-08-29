// 원화 검증에 쓸 환율. 청구액은 결제 페이지가 실시간 환율로 이미 계산했고,
// 여기서는 "그보다 적게 냈는가"만 본다.
//  🔴허용폭이 필요한 이유 — 결제 시점과 검증 시점의 환율이 다를 수 있고, 환율 API가
//    죽으면 양쪽 기본값이 어긋난다. 정확히 일치를 요구하면 정상 결제가 막힌다.
const KRW_TOLERANCE = 0.9;
//  🔴검증용 기본값은 결제 화면(1500)과 달리 낮게 잡는다. 높게 잡으면 환율이 내려갔을 때
//    정상 결제를 튕겨낸다 — 막아야 할 건 100원짜리 조작 결제지 환율 오차가 아니다.
const KRW_FALLBACK_RATE = 1200;

async function krwRate(origin: string): Promise<number> {
  try {
    const r = await fetch(`${origin}/api/exchange-rate`, { cache: "no-store" });
    if (r.ok) {
      const rate = ((await r.json()) as { rate?: number }).rate;
      if (rate && rate > 0) return rate;
    }
  } catch { /* 아래 기본값 유지 */ }
  return KRW_FALLBACK_RATE;
}

function calcExpectedCents(count: number, type: string): number {
  const unitPrice = type === "Terrain" ? 0.05 : 0.1;
  // 비용(VAT 전) 최소 $9.9, 최대 $50 — 결제 페이지와 동일하게 맞춰야 검증이 통과한다.
  const base = Math.min(50, Math.max(9.9, count * unitPrice));
  return Math.round(base * 1.1 * 100);
}

// 🔴paymentId는 포트원 URL 경로에 그대로 들어간다 — 형식을 좁히지 않으면 `../billing-keys/…`
//   같은 값으로 상점 시크릿을 실은 채 다른 포트원 엔드포인트를 부를 수 있다(경로 traversal).
//   결제 ID는 우리가 만드는 값이라 이 문자셋이면 충분하다.
const isPaymentId = (v: unknown): v is string =>
  typeof v === "string" && /^[A-Za-z0-9_-]{1,80}$/.test(v);

export async function POST(request: Request) {
  try {
    const { paymentId, count, type } = await request.json();

    if (!isPaymentId(paymentId)) {
      return Response.json({ success: false }, { status: 400 });
    }

    const secret = process.env.PORTONE_SECRET_KEY?.trim();
    const response = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: {
        "Authorization": `PortOne ${secret}`,
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("포트원 API 실패:", response.status, errorBody);
      return Response.json({ success: false }, { status: 400 });
    }

    const payment = await response.json();

    if (payment.status !== "PAID") {
      return Response.json({ success: false, status: payment.status }, { status: 400 });
    }

    // 🔴결제 금액은 브라우저가 requestPayment에 담아 보낸 값이다. 그대로 믿으면
    //   개발자도구로 금액만 100원으로 바꿔 결제해도 승인은 정상으로 떨어진다.
    if (count != null) {
      const n = Number(count);
      if (!Number.isFinite(n) || n < 0) {
        return Response.json({ success: false, error: "Bad count" }, { status: 400 });
      }
      const expectedCents = calcExpectedCents(n, type ?? "WallAndSlab");
      const actual = payment.amount?.total ?? 0;

      if (payment.currency === "USD") {
        if (actual < expectedCents) {
          console.error(`금액 불일치: 실제 ${actual}¢ < 기대 ${expectedCents}¢ (count=${count}, type=${type})`);
          return Response.json({ success: false, error: "Amount mismatch" }, { status: 400 });
        }
      } else if (payment.currency === "KRW") {
        const rate = await krwRate(new URL(request.url).origin);
        const expectedKrw = Math.round((expectedCents / 100) * rate * KRW_TOLERANCE);
        if (actual < expectedKrw) {
          console.error(`금액 불일치: 실제 ${actual}원 < 기대 ${expectedKrw}원 (환율 ${rate}, count=${count}, type=${type})`);
          return Response.json({ success: false, error: "Amount mismatch" }, { status: 400 });
        }
      } else {
        // 🔴USD도 KRW도 아니면 기대금액과 대조할 길이 없다 — 통과시키면 금액검증이 무의미해진다.
        console.error(`알 수 없는 통화: ${payment.currency} (count=${count}, type=${type})`);
        return Response.json({ success: false, error: "Unsupported currency" }, { status: 400 });
      }
    }

    return Response.json({
      success: true,
      amount: payment.amount?.total ?? 0,
      currency: payment.currency,
    });

  } catch (err) {
    return Response.json({ success: false }, { status: 500 });
  }
}