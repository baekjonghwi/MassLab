"use client";
import { useT } from "@/lib/i18n";
import { LASERFISH_DOWNLOAD } from "@/lib/products";

// ==========================================================================
//  /payment — ⛔건당결제는 끝났다. 이 주소에는 **안내문 하나만** 남는다.
//
//  🔴2026-09-05 건당결제 폐기(사용자 결정) — LaserFish 는 MassLabs 구독(PLUS) 안으로
//    들어왔다. 그날은 PER_PIECE_LIVE 스위치 뒤에 결제창을 숨겨 두기만 했다.
//  🔴2026-09-14 결제 코드를 걷어냈다(사용자 결정: "결제 코드 없애죠. 이제 필요없어").
//    결제창(PaymentContent)·단가·채널 키·포트원 호출·약관 창·Meta Pixel,
//    그리고 /payment/complete · /api/verify-payment · components/PerPiecePricing ·
//    lib/interim 의 PER_PIECE_LIVE 가 함께 사라졌다.
//
//  🔴화면을 지우지 않는 이유: **배포된 옛 플러그인(≤2.2.5)이 이 주소를 직접 연다.**
//    조각 수를 세고 나면 브라우저로 `/payment?wall=84&paymentId=…` 를 띄우도록 박혀
//    있어서, 404 를 만나면 사람이 무슨 일이 난 건지 알 길이 없다.
//    ⇒ 물음표 뒤 값은 **읽지 않는다.** 누가 와도 같은 말을 하고 새 플러그인으로 보낸다.
//  ⚠️옛 플러그인이 폴링하던 /api/verify-payment 는 이제 404 다 — 그쪽은 그걸
//    "안 냈다"로 읽고 굽지 않는다. 받아들인 결과다(2026-09-14).
//  ⛔여기에 결제창을 다시 만들지 말 것 — 파는 방법은 구독 하나다(/subscribe).
// ==========================================================================
function PerPieceRetired() {
  const T = useT();
  return (
    <div style={{ textAlign: "center", maxWidth: "420px", padding: "0 24px" }}>
      <h1 style={{ fontSize: "1.35rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
        {T("건당 결제는 종료되었습니다", "Pay-per-piece has ended")}
      </h1>
      <p style={{ fontSize: "0.86rem", color: "#666", lineHeight: 1.8, marginBottom: "10px" }}>
        {T(
          "이제 LaserFish 는 MassLabs 구독에 포함됩니다. 할인 기간 동안에는 로그인만 하면 무료입니다.",
          "LaserFish is now part of the MassLabs subscription. During the promotional period it is free once you log in.",
        )}
      </p>
      <p style={{ fontSize: "0.86rem", color: "#666", lineHeight: 1.8, marginBottom: "28px" }}>
        {T(
          "플러그인을 최신 버전으로 새로 받은 뒤 라이노에서 로그인해 주세요.",
          "Please update the plug-in to the latest version and log in from Rhino.",
        )}
      </p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
        <a
          href={LASERFISH_DOWNLOAD}
          style={{
            padding: "11px 22px", background: "#1a1a1a", color: "#fff", borderRadius: "8px",
            fontSize: "0.86rem", fontWeight: 600, textDecoration: "none",
          }}
        >
          {T("플러그인 받기", "Get the plug-in")}
        </a>
        <a
          href="/login"
          style={{
            padding: "11px 22px", background: "#fff", color: "#333", border: "1px solid #ddd",
            borderRadius: "8px", fontSize: "0.86rem", fontWeight: 600, textDecoration: "none",
          }}
        >
          {T("로그인", "Login")}
        </a>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#f5f5f5",
      color: "#1a1a1a",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <PerPieceRetired />
    </main>
  );
}
