export async function POST(request: Request) {
  try {
    const { paymentId } = await request.json();

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

    return Response.json({ success: true });

  } catch (err) {
    return Response.json({ success: false }, { status: 500 });
  }
}