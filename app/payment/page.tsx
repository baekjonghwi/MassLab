"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";
import { useLanguage, useT, trPick } from "@/lib/i18n";
import { t } from "@/lib/translations";
import { PER_PIECE_LIVE } from "@/lib/interim";
import { LASERFISH_DOWNLOAD } from "@/lib/products";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

// 카테고리별 단가(USD). WallAndSlab 계열은 0.1, Terrain 계열은 0.05.
const CATEGORY_PRICES: Record<string, number> = {
  wall: 0.1, slab: 0.1, stair: 0.1, window: 0.1, roof: 0.1,
  terrain: 0.05, building: 0.05,
};
// Terrain 명령을 구분하는 키. 이 중 하나라도 있으면 Terrain, 아니면 WallAndSlab.
const TERRAIN_KEYS = ["terrain", "building"];
// 결제 채널 키. 통화/결제수단별로 PortOne 콘솔에 등록된 채널이 다르다.
//  - 해외(USD): 엑심베이. payMethod 생략 시 카드/Alipay/WeChat 선택창이 뜬다.
//  - 국내(KRW) 카드: 갤럭시아머니트리(빌게이트). payMethod "CARD".
//  - 국내(KRW) 카카오페이: 카카오 직계약. payMethod "EASY_PAY".
const CHANNEL_EXIMBAY = "channel-key-796e8cff-cddb-4731-a364-910163f64bcb";
const CHANNEL_GALAXIA = "channel-key-d725a6f3-ff5a-40ab-8f01-9f6b363f15db";
const CHANNEL_KAKAO = "channel-key-8e27fe1b-4078-4d48-a84d-6124aa150f29";
// 결제 화면에 카테고리별로 표시할 라벨(영/한).
const CATEGORY_LABELS: Record<string, { en: string; ko: string }> = {
  wall: { en: "Wall", ko: "벽" },
  slab: { en: "Slab", ko: "슬랩" },
  stair: { en: "Stair", ko: "계단" },
  window: { en: "Window", ko: "창문" },
  roof: { en: "Roof", ko: "지붕" },
  terrain: { en: "Terrain", ko: "지형" },
  building: { en: "Building", ko: "건물" },
};

function PaymentContent() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  // 국내 결제수단 선택. 갤럭시아 카드 vs 카카오페이 간편결제.
  const [koMethod, setKoMethod] = useState<"CARD" | "KAKAO">("CARD");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lang } = useLanguage();
  const tr = trPick(lang, t).payment;
  const T = useT();
  // 🔴이 값은 **결제 통화**를 가른다(원화 ↔ 달러). 화면 언어가 여덟이 되어도
  //   원화로 물리는 건 한국어 화면뿐이다 — 문구 번역과 섞지 말 것.
  const isKo = lang === "ko";

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (isKo) {
      fetch("/api/exchange-rate")
        .then((r) => r.json())
        .then((d) => setExchangeRate(d.rate))
        .catch(() => setExchangeRate(1500));
    }
  }, [isKo]);

  // 카테고리별 면 개수를 파싱한다. (없는 카테고리는 0으로 간주)
  const counts: Record<string, number> = {};
  for (const key of Object.keys(CATEGORY_PRICES)) {
    const v = searchParams.get(key);
    if (v != null) counts[key] = Number(v) || 0;
  }
  // 어떤 명령인지(WallAndSlab vs Terrain)는 존재하는 파라미터 키로 구분한다.
  const type: "WallAndSlab" | "Terrain" =
    TERRAIN_KEYS.some((k) => searchParams.get(k) != null) ? "Terrain" : "WallAndSlab";

  const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
  // 가격 = Σ(각 카테고리 개수 × 해당 단가). 카테고리 단가로 계산해야 정확하다.
  const rawAmountUSD = Object.entries(counts).reduce(
    (sum, [key, c]) => sum + c * CATEGORY_PRICES[key], 0);

  const paymentId = searchParams.get("paymentId") || `payment-${Date.now()}`;
  // 비용(VAT 전)은 최소 $9.9, 최대 $50로 제한. (VAT 포함 최종 $10.89 ~ $55)
  const baseAmountUSD = Math.min(50.0, Math.max(9.9, rawAmountUSD));
  const vatUSD = baseAmountUSD * 0.1;
  const totalAmountUSD = baseAmountUSD + vatUSD;
  const totalAmountKRW = exchangeRate ? Math.round(totalAmountUSD * exchangeRate) : null;
  const baseAmountKRW = exchangeRate ? Math.round(baseAmountUSD * exchangeRate) : null;
  const vatKRW = exchangeRate ? Math.round(vatUSD * exchangeRate) : null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError(tr.emailError);
      return;
    }
    setLoading(true);
    setError("");

    const finalAmount = isKo ? totalAmountKRW! : Math.round(totalAmountUSD * 100);
    const finalCurrency = isKo ? "KRW" : "USD";

    // Meta Pixel — 결제창 열기 직전. value는 사람이 읽는 단위(KRW=원, USD=달러).
    window.fbq?.("track", "InitiateCheckout", {
      value: isKo ? totalAmountKRW! : totalAmountUSD,
      currency: finalCurrency,
    });

    // 통화/결제수단에 따라 채널과 payMethod를 고른다.
    //  - 해외(USD): 엑심베이, payMethod 생략(카드/Alipay/WeChat 선택창).
    //  - 국내 카카오페이: 카카오 채널, EASY_PAY 필수.
    //  - 국내 카드: 갤럭시아 채널, CARD.
    let channelKey: string;
    let methodParam: { payMethod?: string };
    // 🔴엑심베이는 products가 있어야 한다 — 해외카드만 선택이고 Alipay+·UnionPay·
    //   WeChat Pay는 **필수**다. 안 넘기면 손님이 그 수단을 고르는 순간 실패하고,
    //   결제창의 Product name도 빈칸으로 뜬다(그 값은 orderName이 아니라 여기서 온다).
    //   ⚠️link도 엑심베이 필수 항목이다. 빼면 요청 자체가 거절된다.
    //   상품명이 비어 있으면 chargeback RFI(추가정보 요청)에 댈 근거가 약해진다 —
    //   해외카드 취소 기한이 1년이라 노출 기간도 길다.
    let extraParam: Record<string, unknown> = {};
    if (!isKo) {
      channelKey = CHANNEL_EXIMBAY;
      methodParam = {};
      extraParam = {
        products: [{
          id: type,
          name: "LaserFish Drawing",
          amount: finalAmount,
          quantity: 1,
          link: window.location.origin,
        }],
      };
    } else if (koMethod === "KAKAO") {
      channelKey = CHANNEL_KAKAO;
      methodParam = { payMethod: "EASY_PAY" };
    } else {
      channelKey = CHANNEL_GALAXIA;
      methodParam = { payMethod: "CARD" };
    }

    try {
      const response = await PortOne.requestPayment({
        storeId: "store-ad54a018-057e-4d48-b98f-920b6d0fa05c",
        channelKey,
        paymentId,
        orderName: "LaserFish Drawing",
        totalAmount: finalAmount,
        currency: finalCurrency,
        ...methodParam,
        ...extraParam,
        locale: isKo ? "KO_KR" : "EN_US",
        customer: { email, fullName: email.split("@")[0], customerId: email.split("@")[0].slice(0, 20) },
        redirectUrl: `${window.location.origin}/payment/complete?paymentId=${paymentId}&email=${encodeURIComponent(email)}&count=${totalCount}&type=${type}`,
      } as unknown as Parameters<typeof PortOne.requestPayment>[0]);

      if (response?.code) {
        setError(tr.payError);
        setLoading(false);
      } else {
        router.push(`/payment/complete?paymentId=${paymentId}&email=${encodeURIComponent(email)}&count=${totalCount}&type=${type}`);
      }
    } catch {
      setError(tr.sysError);
      setLoading(false);
    }
  };

  const formatKRW = (n: number | null) => n != null ? `${n.toLocaleString()}원` : "...";

  const termsModal = trPick(lang, t).terms;

  if (totalCount === 0) {
    return (
      <div style={{
        background: "#fff",
        borderRadius: "16px",
        padding: "40px 32px",
        width: "100%",
        maxWidth: "360px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        textAlign: "center",
      }}>
        <div style={{
          width: "48px", height: "48px", borderRadius: "50%", background: "#f2f2f2",
          display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px",
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 4l12 12M16 4L4 16" stroke="#888" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </div>
        <p style={{ fontSize: "1rem", fontWeight: 600, color: "#1a1a1a", marginBottom: "8px" }}>
          {T("아무것도 만들어지지 않았습니다", "Nothing was generated.")}
        </p>
        <p style={{ fontSize: "0.82rem", color: "#888", lineHeight: 1.6 }}>
          {T("생성된 조각이 없어 결제할 항목이 없습니다.", "There are no pieces to pay for.")}
        </p>
      </div>
    );
  }

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
        .method-row {
          display: flex;
          gap: 8px;
          margin-bottom: 16px;
        }
        .method-btn {
          flex: 1;
          padding: 11px 8px;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          background: #fff;
          font-size: 0.82rem;
          font-weight: 500;
          font-family: inherit;
          color: #555;
          cursor: pointer;
          transition: all 0.15s;
        }
        .method-btn:hover { border-color: #bbb; }
        .method-btn.active {
          border-color: #1a1a1a;
          background: #1a1a1a;
          color: #fff;
        }
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
        .modal-section h3 { font-size: 0.88rem; font-weight: 600; margin-bottom: 8px; color: #1a1a1a; }
        .modal-section p, .modal-section li { font-size: 0.78rem; color: #666; line-height: 1.7; }
        .modal-section ul { padding-left: 14px; }
        .modal-section li { margin-bottom: 3px; }
      `}</style>

      {/* 약관 모달 */}
      {showTerms && (
        <div className="modal-overlay" onClick={() => setShowTerms(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowTerms(false)}>×</button>
            <h2 style={{ fontSize: "1rem", fontWeight: 700, marginBottom: "20px" }}>{termsModal.title}</h2>
            {termsModal.sections.map((section, i) => (
              <div key={i} className="modal-section">
                <h3>{section.title}</h3>
                {"body" in section && section.body && (
                  <p style={{ whiteSpace: "pre-line" }}>{section.body}</p>
                )}
                {"list" in section && section.list && (
                  <ul>{section.list.map((item, j) => <li key={j}>{item}</li>)}</ul>
                )}
                {"body2" in section && section.body2 && (
                  <p style={{ marginTop: "6px", whiteSpace: "pre-line" }}>{section.body2}</p>
                )}
              </div>
            ))}
            <p style={{ fontSize: "0.72rem", color: "#aaa", marginBottom: "12px" }}>{termsModal.effectiveDate}</p>
            <button
              style={{
                width: "100%", padding: "10px", background: "#1a1a1a", color: "#fff",
                border: "none", borderRadius: "8px", fontSize: "0.85rem", fontWeight: 500,
                fontFamily: "inherit", cursor: "pointer",
              }}
              onClick={() => setShowTerms(false)}
            >
              {T("닫기", "Close")}
            </button>
          </div>
        </div>
      )}

      <div className="payment-box">
        <div style={{ marginBottom: "20px" }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em" }}>
            {tr.title}
          </h1>
        </div>

        {/* 금액 */}
        <div style={{ background: "#f8f8f8", borderRadius: "10px", padding: "14px", marginBottom: "20px" }}>
          {/* 카테고리별 개수 (0인 항목은 생략) */}
          {Object.entries(counts)
            .filter(([, c]) => c > 0)
            .map(([key, c]) => (
              <div key={key} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.78rem", color: "#666" }}>
                  {trPick(lang, CATEGORY_LABELS[key])}
                </span>
                <span style={{ fontSize: "0.78rem", color: "#1a1a1a" }}>{c}</span>
              </div>
            ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px", borderTop: "1px solid #ececec", paddingTop: "8px" }}>
            <span style={{ fontSize: "0.78rem", color: "#666" }}>{tr.cost}</span>
            <span style={{ fontSize: "0.78rem" }}>
              {isKo ? formatKRW(baseAmountKRW) : `$${baseAmountUSD.toFixed(2)}`}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
            <span style={{ fontSize: "0.78rem", color: "#666" }}>{tr.vat}</span>
            <span style={{ fontSize: "0.78rem" }}>
              {isKo ? formatKRW(vatKRW) : `$${vatUSD.toFixed(2)}`}
            </span>
          </div>
          <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: "10px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>{tr.total}</span>
            <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
              {isKo ? formatKRW(totalAmountKRW) : `$${totalAmountUSD.toFixed(2)}`}
            </span>
          </div>
        </div>

        {/* 안내 문구 */}
        <div style={{
          display: "flex", alignItems: "flex-start", gap: "8px",
          padding: "10px 12px", background: "#f0f7ff", borderRadius: "8px", marginBottom: "16px",
        }}>
          <span style={{ fontSize: "0.82rem" }}>💡</span>
          <p style={{ fontSize: "0.78rem", color: "#555", lineHeight: 1.6, margin: 0 }}>
            {tr.info1}<br />{tr.info2}
          </p>
        </div>

        {/* 국내 결제수단 선택 (카드 / 카카오페이). 해외는 엑심베이 단일 채널이라 숨김. */}
        {isKo && (
          <div className="method-row">
            <button
              type="button"
              className={`method-btn${koMethod === "CARD" ? " active" : ""}`}
              onClick={() => setKoMethod("CARD")}
            >
              신용카드
            </button>
            <button
              type="button"
              className={`method-btn${koMethod === "KAKAO" ? " active" : ""}`}
              onClick={() => setKoMethod("KAKAO")}
            >
              카카오페이
            </button>
          </div>
        )}

        {/* 폼 */}
        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: "4px" }}>
            <label style={{ fontSize: "0.82rem", fontWeight: 500 }}>{tr.emailLabel}</label>
            <p style={{ fontSize: "0.72rem", color: "#aaa", margin: "3px 0 0" }}>{tr.emailHint}</p>
            <input
              className="input-field"
              type="email"
              placeholder={tr.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <label className="agree-row" onClick={() => setAgreed(!agreed)}>
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "14px", height: "14px", cursor: "pointer", flexShrink: 0 }}
            />
            <span style={{ fontSize: "0.78rem", color: "#555" }}>
              {tr.agreeText}{" "}
              <button
                className="terms-link"
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowTerms(true); }}
              >
                {tr.termsLink}
              </button>
            </span>
          </label>

          {error && (
            <div style={{ fontSize: "0.78rem", color: "#e53e3e", marginTop: "10px" }}>{error}</div>
          )}

          <button
            className="pay-btn"
            type="submit"
            disabled={loading || !agreed || (isKo && !totalAmountKRW)}
          >
            {loading
              ? tr.processing
              : isKo
                ? `${tr.payBtn} ${formatKRW(totalAmountKRW)}`
                : `${tr.payBtn} $${totalAmountUSD.toFixed(2)}`}
          </button>
        </form>
      </div>
    </>
  );
}

// ==========================================================================
//  ⛔건당결제가 끝난 뒤의 이 화면 — 안내문 (2026-09-05)
//
//  🔴화면을 지우지 않는 이유: **배포된 옛 플러그인(2.2.3)이 이 주소를 직접 연다.**
//    조각 수를 세고 나면 브라우저로 `/payment?wall=84&...` 를 띄우도록 박혀 있어서,
//    404 를 만나면 사람이 무슨 일이 난 건지 알 길이 없다.
//  🔴그래서 결제창 대신 "이제 공짜다"라고 말하고 새 플러그인으로 보낸다.
//    ⚠️`/api/verify-payment` 는 살아 있다 — 스위치를 내린 순간 이미 결제창을
//      띄워 둔 사람의 폴링이 끝나야 하기 때문이다(lib/interim 의 PER_PIECE_LIVE).
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
      {/* 🔴스위치 하나로 갈린다. PER_PIECE_LIVE 를 true 로 되돌리면 아래 결제
          화면이 그대로 다시 선다 — 지운 것이 하나도 없다. */}
      {PER_PIECE_LIVE ? (
        <Suspense fallback={
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.88rem", color: "#888" }}>Loading...</p>
          </div>
        }>
          <PaymentContent />
        </Suspense>
      ) : (
        <PerPieceRetired />
      )}
    </main>
  );
}
