"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";

function PaymentContent() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalCount = Number(searchParams.get("count") || 10);
  const paymentId = searchParams.get("paymentId") || `payment-${Date.now()}`;
  const baseAmountUSD = Math.max(5.0, totalCount * 0.15);
  const vatUSD = baseAmountUSD * 0.1;
  const totalAmountUSD = baseAmountUSD + vatUSD;
  const exchangeRate = 1350;
  const totalAmountKRW = Math.round(totalAmountUSD * exchangeRate);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await PortOne.requestPayment({
        storeId: "store-ad54a018-057e-4d48-b98f-920b6d0fa05c",
        channelKey: "channel-key-921d3c16-446e-4129-8f84-7fd884b1eb21",
        paymentId,
        orderName: `LaserFish Drawing`,
        totalAmount: totalAmountKRW,
        currency: "KRW",
        payMethod: "CARD",
        customer: { email },
        redirectUrl: `${window.location.origin}/payment/complete?paymentId=${paymentId}&email=${encodeURIComponent(email)}&count=${totalCount}`,
      });

      if (response?.code) {
        setError("Payment was cancelled or failed. Please try again.");
        setLoading(false);
      } else {
        router.push(`/payment/complete?paymentId=${paymentId}&email=${encodeURIComponent(email)}&count=${totalCount}`);
      }
    } catch (err) {
      setError("An error occurred during payment. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .payment-box {
          background: #fff;
          border-radius: 16px;
          padding: 28px 28px 24px;
          width: 100%;
          max-width: 360px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        }

        .input-field {
          width: 100%;
          padding: 9px 12px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 0.85rem;
          font-family: inherit;
          color: #1a1a1a;
          background: #ffffff;
          outline: none;
          transition: border-color 0.2s;
          margin-top: 6px;
        }
        .input-field:focus { border-color: #aaa; }
        .input-field::placeholder { color: #bbb; }

        .pay-btn {
          width: 100%;
          padding: 11px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 12px;
        }
        .pay-btn:hover { background: #333; }
        .pay-btn:disabled { background: #ccc; cursor: not-allowed; }

        .terms-link {
          color: #4a90e2;
          text-decoration: underline;
          cursor: pointer;
          background: none;
          border: none;
          font-family: inherit;
          font-size: inherit;
          padding: 0;
        }
        .terms-link:hover { opacity: 0.7; }

        .agree-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          background: #f8f8f8;
          border-radius: 8px;
          margin-top: 14px;
          cursor: pointer;
        }
        .agree-row:hover { background: #f0f0f0; }

        /* 모달 */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 100;
          padding: 24px;
        }
        .modal-box {
          background: #fff;
          border-radius: 14px;
          padding: 28px;
          max-width: 440px;
          width: 100%;
          max-height: 75vh;
          overflow-y: auto;
          position: relative;
        }
        .modal-close {
          position: absolute;
          top: 14px;
          right: 18px;
          background: none;
          border: none;
          font-size: 1.3rem;
          cursor: pointer;
          color: #aaa;
          line-height: 1;
        }
        .modal-close:hover { color: #1a1a1a; }
        .modal-section { margin-bottom: 20px; }
        .modal-section h3 {
          font-size: 0.88rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: #1a1a1a;
        }
        .modal-section p, .modal-section li {
          font-size: 0.78rem;
          color: #666;
          line-height: 1.7;
        }
        .modal-section ul { padding-left: 14px; }
        .modal-section li { margin-bottom: 3px; }
      `}</style>

      {/* 약관 모달 */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTerms(false)}>×</button>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>
              Privacy Policy
            </h2>

            <div className="modal-section">
              <p>Basic payment records are retained to process your transaction and provide support if needed. In the event of a refund request, payment records will be used to verify and process the refund.</p>
            </div>

            <div className="modal-section">
              <p>Anonymized geometry output data may be collected to improve the tool's accuracy and performance. This data contains no personal information.</p>
            </div>

            <button
              style={{
                width: "100%",
                padding: "10px",
                background: "#1a1a1a",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.85rem",
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
                marginTop: "8px",
              }}
              onClick={() => setShowTerms(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="payment-box">
        {/* 헤더 */}
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            Complete Your Drawing
          </h1>
        </div>

        {/* 금액 */}
        <div style={{
          background: "#f8f8f8",
          borderRadius: "10px",
          padding: "14px",
          marginBottom: "20px",
        }}>
          {/* 조각 개수 */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.78rem", color: "#666" }}>Pieces</span>
            <span style={{ fontSize: "0.78rem", color: "#1a1a1a" }}>{totalCount}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.78rem", color: "#666" }}>Cost</span>
            <span style={{ fontSize: "0.78rem" }}>${baseAmountUSD.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.78rem", color: "#666" }}>VAT (10%)</span>
            <span style={{ fontSize: "0.78rem" }}>${vatUSD.toFixed(2)}</span>
          </div>
          <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>Total</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>${totalAmountUSD.toFixed(2)}</span>
          </div>
        </div>

        {/* 폼 */}
        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: "4px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 500 }}>
              Email address
            </label>
            <p style={{ fontSize: "0.72rem", color: "#aaa", margin: "3px 0 0" }}>
              Enter your email to receive your receipt.
            </p>
            <input
              className="input-field"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* terms & policy 체크박스 */}
          <label className="agree-row" onClick={() => setAgreed(!agreed)}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "14px", height: "14px", cursor: "pointer", flexShrink: 0 }}
            />
            <span style={{ fontSize: "0.78rem", color: "#555" }}>
              I agree to the{" "}
              <button
                className="terms-link"
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}
              >
                terms & policy
              </button>
            </span>
          </label>

          {error && (
            <div style={{ fontSize: "0.78rem", color: "#e53e3e", marginTop: "10px" }}>{error}</div>
          )}

          {/* Pay 버튼 */}
          <button className="pay-btn" type="submit" disabled={loading || !agreed}>
            {loading ? "Processing..." : `Pay $${totalAmountUSD.toFixed(2)}`}
          </button>
        </form>
      </div>
    </>
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
      <Suspense fallback={
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "#888" }}>Loading...</p>
        </div>
      }>
        <PaymentContent />
      </Suspense>
    </main>
  );
}
