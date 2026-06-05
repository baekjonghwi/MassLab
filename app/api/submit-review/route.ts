const SUPABASE_URL = "https://arymzgsayptprrbdnzwd.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get("paymentId") as string;
    const nickname = formData.get("nickname") as string;
    const review = formData.get("review") as string;
    const bank = formData.get("bank") as string;
    const account = formData.get("account") as string;
    const photo = formData.get("photo") as File | null;

    if (!paymentId || !nickname || !review || !bank || !account) {
      return Response.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const secret = process.env.PORTONE_SECRET_KEY?.trim();
    const portoneRes = await fetch(`https://api.portone.io/payments/${paymentId}`, {
      headers: { "Authorization": `PortOne ${secret}` },
    });
    if (!portoneRes.ok) {
      return Response.json({ success: false, error: "Invalid payment" }, { status: 400 });
    }
    const payment = await portoneRes.json();
    if (payment.status !== "PAID") {
      return Response.json({ success: false, error: "Payment not completed" }, { status: 400 });
    }

    let photoUrl: string | null = null;

    if (photo) {
      const rawExt = photo.name.split(".").pop() ?? "";
      const ext = /^[a-zA-Z0-9]+$/.test(rawExt) ? rawExt.toLowerCase() : "jpg";
      const fileName = `${paymentId}-${Date.now()}.${ext}`;
      const arrayBuffer = await photo.arrayBuffer();

      const uploadRes = await fetch(
        `${SUPABASE_URL}/storage/v1/object/reviews/${fileName}`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
            "Content-Type": photo.type,
            "x-upsert": "true",
          },
          body: arrayBuffer,
        }
      );

      if (uploadRes.ok) {
        photoUrl = `${SUPABASE_URL}/storage/v1/object/public/reviews/${fileName}`;
      } else {
        const upErr = await uploadRes.text();
        console.error("Storage upload failed:", uploadRes.status, upErr);
      }
    }

    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/reviews`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "apikey": SUPABASE_SERVICE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        payment_id: paymentId,
        nickname,
        review,
        bank,
        account,
        photo_url: photoUrl,
        // refund_rate: 100  — 나중에 5로 조정
        refund_rate: 100,
        refund_status: "pending",
      }),
    });

    if (!insertRes.ok) {
      const errText = await insertRes.text();
      console.error("Supabase insert error:", errText);
      return Response.json({ success: false }, { status: 500 });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("submit-review error:", err);
    return Response.json({ success: false }, { status: 500 });
  }
}
