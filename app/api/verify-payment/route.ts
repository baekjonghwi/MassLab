function calcExpectedCents(count: number, type: string): number {
  const unitPrice = type === "Terrain" ? 0.03 : 0.1;
  return Math.round(Math.max(5, count * unitPrice) * 1.1 * 100);
}

export async function POST(request: Request) {
  try {
    const { paymentId, count, type } = await request.json();

    if (!paymentId) {
      return Response.json({ success: false }, { status: 400 });
    }

    const secret = process.env.PORTONE_SECRET_KEY?.trim();
    const response = await fetch(`https://api.portone.io/payments/${paymentId}`, {
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

    if (payment.currency === "USD" && count != null) {
      const expectedCents = calcExpectedCents(Number(count), type ?? "WallAndSlab");
      const actualCents = payment.amount?.total ?? 0;
      if (actualCents < expectedCents) {
        console.error(`금액 불일치: 실제 ${actualCents}¢ < 기대 ${expectedCents}¢ (count=${count}, type=${type})`);
        return Response.json({ success: false, error: "Amount mismatch" }, { status: 400 });
      }
    }

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false }, { status: 500 });
  }
}