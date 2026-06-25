"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const SUPABASE_URL = "https://arymzgsayptprrbdnzwd.supabase.co";
const SUPABASE_KEY = "sb_publishable_47O2B2PfD3X_5yOX-P-cTA_wGcpaeU6";

function PaymentCompleteContent() {
  const [status, setStatus] = useState<"loading" | "success" | "fail">("loading");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { lang } = useLanguage();
  const tr = t[lang].paymentComplete;

  const paymentId = searchParams.get("paymentId");
  const count = Number(searchParams.get("count") || 0);
  const type = searchParams.get("type") || "WallAndSlab";

  useEffect(() => {
    if (!paymentId) {
      setStatus("fail");
      return;
    }

    const savePayment = async () => {
      try {
        const verifyRes = await fetch("/api/verify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ paymentId, count, type }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyData.success) {
          setStatus("fail");
          return;
        }

        // Meta Pixel Purchase 이벤트 — 새로고침 중복 발사 방지를 위해 paymentId로 한 번만.
        const firedKey = `fbqPurchase:${paymentId}`;
        if (!sessionStorage.getItem(firedKey)) {
          // PortOne amount.total은 최소 단위(USD=센트, KRW=원). KRW는 그대로, USD는 100으로 나눈다.
          const value =
            verifyData.currency === "USD"
              ? (verifyData.amount ?? 0) / 100
              : (verifyData.amount ?? 0);
          window.fbq?.("track", "Purchase", {
            value,
            currency: verifyData.currency,
          });
          sessionStorage.setItem(firedKey, "1");
        }

        setStatus("success");
      } catch (err) {
        console.error("Failed to verify payment:", err);
        setStatus("fail");
      }
    };

    savePayment();
  }, [paymentId]);

  useEffect(() => {
    if (status !== "success") return;
    const timer = setTimeout(() => {
      sessionStorage.setItem("reviewPaymentId", paymentId!);
      router.push("/review");
    }, 3000);
    return () => clearTimeout(timer);
  }, [status, paymentId, router]);

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "1.5rem", marginBottom: "12px" }}>⏳</div>
        <p style={{ fontSize: "0.88rem", color: "#888" }}>{tr.verifying}</p>
      </div>
    );
  }

  if (status === "fail") {
    return (
      <div style={{ textAlign: "center", maxWidth: "360px", padding: "0 24px" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px" }}>✕</div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 700, marginBottom: "10px", letterSpacing: "-0.02em" }}>
          {tr.failTitle}
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.7 }}>
          {tr.failDesc}
        </p>
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
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid #ddd;
          border-top-color: #1a1a1a;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto;
        }
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

      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "12px" }}>
        {tr.successTitle}
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#888", lineHeight: 1.7, marginBottom: "8px" }}>
        {tr.thankYou}
      </p>
      <p style={{ fontSize: "0.9rem", color: "#555", lineHeight: 1.7, marginBottom: "32px" }}>
        {tr.generating}
      </p>

      <div className="spinner" />
    </div>
  );
}

export default function PaymentCompletePage() {
  const { lang } = useLanguage();
  const tr = t[lang].paymentComplete;

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
          <p style={{ fontSize: "0.88rem", color: "#888" }}>{tr.loading}</p>
        </div>
      }>
        <PaymentCompleteContent />
      </Suspense>
    </main>
  );
}
