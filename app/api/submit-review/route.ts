import { CENTRAL } from "@/lib/subscription";

// 🔴2026-08-17: 별도 프로젝트(arymzgsayptprrbdnzwd)에서 masslabs로 통합했다.
//   reviews는 이제 laserfish 스키마에 있으므로 Content-Profile 헤더가 필요하다.
const SUPABASE_URL = CENTRAL.supabaseUrl;
const SUPABASE_SERVICE_KEY = CENTRAL.serviceKey;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const paymentId = formData.get("paymentId") as string;
    const nickname = formData.get("nickname") as string;
    const review = formData.get("review") as string;
    const photo = formData.get("photo") as File | null;

    if (!paymentId || !nickname || !review) {
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
        // 🔴이게 없으면 public 스키마를 찾다가 404가 난다.
        "Content-Profile": "laserfish",
        "Prefer": "return=minimal",
      },
      body: JSON.stringify({
        payment_id: paymentId,
        nickname,
        review,
        photo_url: photoUrl,
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
