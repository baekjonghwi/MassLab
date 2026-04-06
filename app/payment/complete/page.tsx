"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function PaymentCompleteContent() {
  const [status, setStatus] = useState<"loading" | "success" | "fail">("loading");
  const searchParams = useSearchParams();
  const router = useRouter();

  const paymentId = searchParams.get("paymentId");
  const email = searchParams.get("email");

  useEffect(() => {
    if (!paymentId) {
      setStatus("fail");
      return;
    }
    setStatus("success");
  }, [paymentId]);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>⏳</div>
        <p style={{ fontSize: "0.88rem", color: "#888" }}>Verifying payment...</p>
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div style={{ textAlign: "center", maxWidth: "360px", padding: "0 24px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✕</div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "10px", letterSpacing: "-0.02em" }}>
          Payment Failed
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.7, marginBottom: "28px" }}>
          Something went wrong during payment. Please try again.
        </p>
        <button
          onClick={() => router.back()}
          style={{
            padding: "11px 28px",
            background: "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.88rem",
            fontWeight: 500,
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", maxWidth: "400px", padding: "0 24px" }}>
      <style>{`
        @keyframes checkmark {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .checkmark { animation: checkmark 0.4s ease forwards; }
        .home-btn {
          padding: 11px 28px;
          background: #1a1a1a;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.88rem;
          font-weight: 500;
          font-family: inherit;
          cursor: pointer;
          transition: background 0.2s;
        }
        .home-btn:hover { background: #333; }
      `}</style>

      <div className="checkmark" style={{
        width: "64px",
        height: "64px",
        background: "#1a1a1a",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 24px",
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
      </div>

      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "10px" }}>
        Payment Complete!
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.7, marginBottom: "8px" }}>
        Thank you for your purchase.
      </p>
      {email && (
        <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.7, marginBottom: "28px" }}>
          A receipt has been sent to{" "}
          <span style={{ color: "#1a1a1a", fontWeight: 500 }}>{email}</span>.
        </p>
      )}

      <div style={{
        background: "#f8f8f8",
        borderRadius: "10px",
        padding: "16px",
        marginBottom: "28px",
        textAlign: "left",
      }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: "8px" }}>Next steps</div>
        <div style={{ fontSize: "0.78rem", color: "#666", lineHeight: 1.8 }}>
          <div>1. Return to Grasshopper</div>
          <div>2. The drawing will generate automatically</div>
          <div>3. Check your Rhino viewport for results</div>
        </div>
      </div>

      <button className="home-btn" onClick={() => router.push("/")}>
        Back to MassLab
      </button>
    </div>
  );
}

export default function PaymentCompletePage() {
  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#1a1a1a",
    }}>
      <Suspense fallback={
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "0.88rem", color: "#888" }}>Loading...</p>
        </div>
      }>
        <PaymentCompleteContent />
      </Suspense>
    </main>
  );
}
