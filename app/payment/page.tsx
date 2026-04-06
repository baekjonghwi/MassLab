"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";

export default function PaymentPage() {
  const [email, setEmail] = useState("");
  const [consentGeometry, setConsentGeometry] = useState(false);
  const [consentLocation, setConsentLocation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  // GHA에서 넘겨주는 파라미터
  const totalCount = Number(searchParams.get("count") || 10);
  const baseAmountUSD = Math.max(5.0, totalCount * 0.15);
  const vatUSD = baseAmountUSD * 0.1;
  const totalAmountUSD = baseAmountUSD + vatUSD;
  // 원화 환산 (1달러 = 1350원 고정, 나중에 실시간 환율로 교체 가능)
  const exchangeRate = 1350;
  const totalAmountKRW = Math.round(totalAmountUSD * exchangeRate);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const paymentId = `payment-${Date.now()}`;

      const response = await PortOne.requestPayment({
        storeId: "store-ad54a018-057e-4d48-b98f-920b6d0fa05c",
        channelKey: "channel-key-921d3c16-446e-4129-8f84-7fd884b1eb21",
        paymentId,
        orderName: `LaserFish - ${totalCount} surfaces`,
        totalAmount: totalAmountKRW,
        currency: "KRW",
        payMethod: "CARD",
        customer: {
          email,
        },
        redirectUrl: `${window.location.origin}/payment/complete?paymentId=${paymentId}&email=${encodeURIComponent(email)}`,
      });

      if (response?.code) {
        setError("결제가 취소되었거나 오류가 발생했습니다.");
        setLoading(false);
      }
    } catch (err) {
      setError("결제 중 오류가 발생했습니다. 다시 시도해주세요.");
      setLoading(false);
    }
  };

  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#ffffff",
      color: "#1a1a1a",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .input-field {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.88rem;
          font-family: inherit;
          color: #1a1a1a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus { border-color: #aaa; }
        .input-field::placeholder { color: #bbb; }

        .pay-btn {
          width: 100%;
          padding: 12px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
        }
        .pay-btn:hover { background: #333; }
        .pay-btn:disabled { background: #ccc; cursor: not-allowed; }

        .back-btn {
          background: none;
          border: none;
          font-size: 0.82rem;
          color: #888;
          cursor: pointer;
          font-family: inherit;
          padding: 0;
          transition: color 0.2s;
        }
        .back-btn:hover { color: #1a1a1a; }

        .consent-row {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: #f8f8f8;
          border-radius: 8px;
          cursor: pointer;
        }
        .consent-row:hover { background: #f0f0f0; }
      `}</style>

      <div style={{ width: "100%", maxWidth: "420px", padding: "0 24px" }}>

        {/* 뒤로가기 */}
        <button className="back-btn" onClick={() => router.back()} style={{ marginBottom: "28px" }}>
          ← Back
        </button>

        {/* 헤더 */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "6px" }}>
            Checkout
          </h1>
          <p style={{ fontSize: "0.82rem", color: "#888" }}>
            Enter your email to receive your receipt.
          </p>
        </div>

        {/* 금액 요약 */}
        <div style={{
          background: "#f8f8f8",
          borderRadius: "10px",
          padding: "16px",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "#666" }}>Surfaces</span>
            <span style={{ fontSize: "0.82rem", color: "#1a1a1a" }}>{totalCount} × $0.15</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
            <span style={{ fontSize: "0.82rem", color: "#666" }}>Subtotal</span>
            <span style={{ fontSize: "0.82rem", color: "#1a1a1a" }}>${baseAmountUSD.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
            <span style={{ fontSize: "0.82rem", color: "#666" }}>VAT (10%)</span>
            <span style={{ fontSize: "0.82rem", color: "#1a1a1a" }}>${vatUSD.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: "12px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>Total</span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 700 }}>${totalAmountUSD.toFixed(2)}</div>
              <div style={{ fontSize: "0.72rem", color: "#aaa" }}>≈ ₩{totalAmountKRW.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handlePayment}>

          {/* 이메일 */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 500, display: "block", marginBottom: "6px" }}>
              Email address
            </label>
            <input
              className="input-field"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* 데이터 수집 동의 */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "0.82rem", fontWeight: 500, marginBottom: "10px" }}>
              Data Collection (Optional)
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label className="consent-row">
                <input
                  type="checkbox"
                  checked={consentGeometry}
                  onChange={(e) => setConsentGeometry(e.target.checked)}
                  style={{ marginTop: "1px", cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 500, marginBottom: "2px" }}>
                    Geometry data
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#888", lineHeight: 1.5 }}>
                    Share anonymized geometry data to help improve the tool.
                  </div>
                </div>
              </label>

              <label className="consent-row">
                <input
                  type="checkbox"
                  checked={consentLocation}
                  onChange={(e) => setConsentLocation(e.target.checked)}
                  style={{ marginTop: "1px", cursor: "pointer" }}
                />
                <div>
                  <div style={{ fontSize: "0.82rem", fontWeight: 500, marginBottom: "2px" }}>
                    Country / Location
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#888", lineHeight: 1.5 }}>
                    Share your country to help us understand our users better.
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* 오류 메시지 */}
          {error && (
            <div style={{ fontSize: "0.8rem", color: "#e53e3e", marginBottom: "12px" }}>
              {error}
            </div>
          )}

          {/* 결제 버튼 */}
          <button className="pay-btn" type="submit" disabled={loading}>
            {loading ? "Processing..." : `Pay $${totalAmountUSD.toFixed(2)}`}
          </button>

          <p style={{ fontSize: "0.72rem", color: "#bbb", textAlign: "center", marginTop: "12px", lineHeight: 1.6 }}>
            By completing payment, you agree to our terms & policy.
            Receipts will be sent to your email.
          </p>
        </form>
      </div>
    </main>
  );
}
