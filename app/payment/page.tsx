"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";

function PaymentContent() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [isKorea, setIsKorea] = useState<boolean | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const totalCount = Number(searchParams.get("count") || 10);
  const paymentId = searchParams.get("paymentId") || `payment-${Date.now()}`;
  const baseAmountUSD = Math.max(5.0, totalCount * 0.1);
  const vatUSD = baseAmountUSD * 0.1;
  const totalAmountUSD = baseAmountUSD + vatUSD;
  const totalAmountKRW = exchangeRate ? Math.round(totalAmountUSD * exchangeRate) : null;

useEffect(() => {
  fetch("https://ipapi.co/json/")
    .then((r) => r.json())
    .then((d) => setIsKorea(d.country_code === "KR"))
    .catch(() => setIsKorea(false));
}, []);

useEffect(() => {
  fetch("/api/exchange-rate")
    .then((r) => r.json())
    .then((d) => setExchangeRate(d.rate))
    .catch(() => setExchangeRate(1500));
}, []);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    setError("");

    const isKorean = isKorea === true;
    const finalAmount = isKorean 
      ? totalAmountKRW! 
      : Math.round(totalAmountUSD * 100); // USD → 센트 단위 정수로 변환
    const finalCurrency = isKorean ? "KRW" : "USD";

    try {
      const response = await PortOne.requestPayment({
        storeId: "store-ad54a018-057e-4d48-b98f-920b6d0fa05c",
        channelKey: isKorean
          ? "channel-key-b5054294-344b-4833-8f5a-7f3a445d4b40"   // 갤럭시아머니트리
          : "channel-key-6e915a7e-6083-4af1-a301-6eeb7fa4ce72",  // 엑심베이
        paymentId,
        orderName: "LaserFish Drawing",
        totalAmount: finalAmount,
        currency: finalCurrency,
        payMethod: "CARD",
        customer: { email, fullName: email.split("@")[0] },    // 이메일 앞부분을 이름으로 사용
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
              Terms &  Policy
            </h2>

            {/* Terms and Policy */}
            <div className="modal-section">
              <h3>Terms and Policy</h3>
              <p>This agreement governs the use of LaserFish, a laser cutting drawing automation plugin provided by MassLabs.</p>
            </div>

            <div className="modal-section">
              <h3>Service</h3>
              <p>LaserFish is provided as a digital download for Rhino and Grasshopper environments. The download becomes available immediately upon payment completion.</p>
            </div>

            <div className="modal-section">
              <h3>Compatibility</h3>
              <p>LaserFish operates under the system requirements specified on the product page. MassLabs is not responsible for malfunctions caused by unsupported software environments.</p>
            </div>

            <div className="modal-section">
              <h3>User Obligations</h3>
              <p>Users must not engage in any of the following:</p>
              <ul>
                <li>Transferring, reselling, or distributing the purchased software to third parties</li>
                <li>Reverse engineering, decompiling, or extracting the source code</li>
                <li>Any illegal or unauthorized use of the service</li>
              </ul>
            </div>

            <div className="modal-section">
              <h3>Pricing</h3>
              <p>The payment amount is calculated based on the number of pieces actually generated by LaserFish. If part of the input geometry is not included in the output, that portion will not be counted toward the total price.</p>
            </div>

            <div className="modal-section">
              <h3>Refund Policy</h3>
              <p>As LaserFish is a digital product, refunds are not available after download. However, refunds are available in the following cases:</p>
              <ul>
                <li>Download is unavailable due to a technical error after payment</li>
                <li>The output is not generated correctly due to a program error</li>
                <li>A refund is requested for geometry that was excluded from the output per the Pricing policy above</li>

              </ul>
              <p style={{ marginTop: "8px" }}>Refund requests must be submitted within 7 days of payment to <strong>masslabs.archi@gmail.com</strong>, along with a receipt, reason, error screenshots, and original/output model files.</p>
            </div>

            {/* Privacy Policy */}
            <div className="modal-section">
              <h3>Privacy Policy</h3>
              <p>MassLabs collects and processes the following information:</p>
              <ul>
                <li>Payment information: Processed securely through PortOne. Card details are handled by the payment provider and never stored by MassLabs.</li>
                <li>Country information: Used for service analytics and improvement.</li>
                <li>Output data: Collected for refund verification and product improvement — includes samples of flat-arranged pieces and material thickness data. This data contains no personal information.</li>
              </ul>
            </div>

            <div className="modal-section">
              <h3>Data Retention</h3>
              <ul>
                <li>Payment records: Retained for 5 years in accordance with e-commerce regulations.</li>
                <li>Country data: Retained in anonymized form after statistical processing.</li>
                <li>Output data: Retained until the user withdraws consent, after which it is immediately deleted.</li>
              </ul>
            </div>

            <div className="modal-section">
              <h3>User Rights</h3>
              <p>Users may request access, correction, deletion, or suspension of their personal data at any time. Consent to output data collection may also be withdrawn at any time by contacting <strong>masslabs.archi@gmail.com</strong>.</p>
            </div>

            <div className="modal-section">
              <p style={{ color: "#aaa", fontSize: "0.72rem" }}>Effective date: April 13, 2026</p>
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

        {/* 안내 문구 */}
        <div style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          padding: "10px 12px",
          background: "#f0f7ff",
          borderRadius: "8px",
          marginBottom: "16px",
        }}>
          <span style={{ fontSize: "0.82rem" }}>💡</span>
          <p style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.6, margin: 0 }}>
            You only pay for what&apos;s generated.<br />
            If any part fails, it won&apos;t be charged.
          </p>
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
        <button 
          className="pay-btn" 
          type="submit" 
            disabled={loading || !agreed || isKorea === null || (isKorea === true && !totalAmountKRW)}>
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
