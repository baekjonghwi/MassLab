import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ success: false, message: "paymentId is required" }, { status: 400 });
    }

    const response = await fetch(`https://api.portone.io/payments/${paymentId}`, {
      headers: {
        "Authorization": `PortOne ${process.env.PORTONE_SECRET_KEY}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Payment not found" }, { status: 404 });
    }

    const payment = await response.json();

    if (payment.status !== "PAID") {
      return NextResponse.json({ success: false, message: "Payment not completed" }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}