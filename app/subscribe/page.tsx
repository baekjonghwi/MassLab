"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";

// ==========================================================================
//  구독 결제(빌링키 발급) — 로그인이 있는 제품 전용.
//
//  ⚠️/payment(단건)와 별개 페이지다. 그쪽은 로그인이 없어 이메일을 입력받지만
//    여기서는 sid로 서버가 신원을 알아내므로 이메일을 "보여주기만" 한다.
//
//  🔴한 페이지에서 모바일 리디렉션까지 받는다 — 포트원이 redirectUrl로 돌아올 때
//    같은 주소에 billingKey를 붙여 주므로, 마운트 시 그걸 보고 이어서 확정한다.
//    완료 페이지를 따로 두면 sid 맥락이 끊긴다.
// ==========================================================================

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

const STORE_ID = "store-ad54a018-057e-4d48-b98f-920b6d0fa05c";
const CHANNEL_EXIMBAY = "channel-key-796e8cff-cddb-4731-a364-910163f64bcb";
const CHANNEL_GALAXIA = "channel-key-d725a6f3-ff5a-40ab-8f01-9f6b363f15db";

// 🔴PayPal 빌링키는 엑심베이에 PayPal이 개통된 뒤에야 실제로 발급된다.
//   개통 확인 후 이 값만 true로 바꾸면 해외 결제수단에 PayPal이 뜬다.
const PAYPAL_BILLING_ENABLED = false;

type SessionInfo = {
  product: string;
  productLabel: string;
  plan: string;
  planLabel: string;
  email: string;
  country: string | null;
  countryKnown: boolean;
  channel: "eximbay" | "galaxia";
  baseUsd: number;
  vatUsd: number;
  amount: number;
  currency: "USD" | "KRW";
};

function SubscribeContent() {
  const sp = useSearchParams();
  const sid = sp.get("sid") ?? "";
  const product = sp.get("product") ?? "archimap";

  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [fatal, setFatal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);
  // 국내/해외 채널. 기본은 가입 국가가 정하고, 국가를 모를 때만 사용자가 고른다.
  const [channel, setChannel] = useState<"eximbay" | "galaxia">("eximbay");
  const [method, setMethod] = useState<"CARD" | "PAYPAL">("CARD");

  const isKo = channel === "galaxia";

  // --- 세션 조회 ---------------------------------------------------------
  useEffect(() => {
    if (!sid) { setFatal("주소가 올바르지 않습니다."); return; }
    // 🔴제품·등급은 쿼리가 아니라 세션 행에서 읽는다(쿼리면 사용자가 바꿔 넣을 수 있다).
    fetch(`/api/subscribe/session?sid=${encodeURIComponent(sid)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setFatal(
            d.error === "expired" ? "결제 요청이 만료되었습니다. 앱에서 다시 시도해 주세요."
            : d.error === "already_used" ? "이미 처리된 요청입니다."
            : d.error === "not_found" ? "결제 요청을 찾을 수 없습니다."
            : d.error === "not_for_sale" ? "현재 판매하지 않는 상품입니다."
            : d.error === "bundle_active" ? "이미 전체 구독 중이라 이 프로그램은 따로 결제하실 필요가 없습니다."
            : "결제 정보를 불러오지 못했습니다.");
          return;
        }
        setInfo(d as SessionInfo);
        setChannel((d as SessionInfo).channel);
      })
      .catch(() => setFatal("결제 정보를 불러오지 못했습니다."));
  }, [sid, product]);

  // --- 빌링키 → 확정 -----------------------------------------------------
  const confirm = useCallback(
    async (billingKey: string, ch: "eximbay" | "galaxia", methodLabel: string) => {
      setLoading(true);
      const r = await fetch("/api/subscribe/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sid, billingKey, channel: ch, methodLabel }),
      });
      const d = await r.json().catch(() => ({}));
      setLoading(false);
      if (!r.ok) {
        setError(
          d.error === "charge_failed" ? `결제에 실패했습니다. ${d.message ?? ""}`
          : d.error === "save_failed" ? "결제는 완료됐지만 구독 등록에 실패했습니다. 고객센터로 문의해 주세요."
          : "처리에 실패했습니다.");
        return;
      }
      window.fbq?.("track", "Subscribe", { value: d.amount, currency: d.currency });
      setDone(true);
    },
    [sid, product],
  );

  // 🔴모바일 리디렉션 복귀 처리. 주소에 billingKey가 있으면 그대로 이어 간다.
  useEffect(() => {
    const bk = sp.get("billingKey");
    const code = sp.get("code");
    if (code) { setError(sp.get("message") || "결제창에서 취소되었습니다."); return; }
    if (bk && sid && !done) {
      const ch = (sp.get("ch") as "eximbay" | "galaxia") ?? "eximbay";
      confirm(bk, ch, sp.get("ml") ?? "");
    }
    // sp는 매 렌더 새 객체라 의존성에 넣지 않는다(무한 루프).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info) return;
    setLoading(true);
    setError("");

    const methodLabel = isKo ? "국내 신용카드" : method === "PAYPAL" ? "PayPal" : "해외 신용카드";
    const issueId = `${product}-bk-${sid.slice(0, 8)}-${Date.now()}`;
    // 복귀 주소에 채널·수단을 실어 둔다(리디렉션으로 돌아오면 상태가 다 날아간다).
    const back = `${window.location.origin}/subscribe?sid=${encodeURIComponent(sid)}`
      + `&product=${encodeURIComponent(product)}&ch=${channel}&ml=${encodeURIComponent(methodLabel)}`;

    try {
      const res = await PortOne.requestIssueBillingKey({
        storeId: STORE_ID,
        channelKey: isKo ? CHANNEL_GALAXIA : CHANNEL_EXIMBAY,
        // 🔴갤럭시아 빌링키는 카드만 된다. 해외는 카드 또는 PayPal.
        billingKeyMethod: isKo ? "CARD" : method,
        issueId,
        issueName: `${info.planLabel} 구독`,
        // 표시용 금액. 실제 청구는 서버가 다시 계산해서 한다.
        displayAmount: info.amount,
        currency: info.currency,
        customer: {
          customerId: sid.replace(/-/g, "").slice(0, 20),
          email: info.email,
        },
        redirectUrl: back,
      } as unknown as Parameters<typeof PortOne.requestIssueBillingKey>[0]);

      if (!res || res.code) {
        setError(res?.message || "결제창에서 취소되었습니다.");
        setLoading(false);
        return;
      }
      await confirm(res.billingKey, channel, methodLabel);
    } catch {
      setError("결제 처리 중 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const money = (n: number, cur: string) =>
    cur === "KRW" ? `${n.toLocaleString()}원` : `$${(n / 100).toFixed(2)}`;

  if (fatal) return <Card><p style={{ fontWeight: 600, marginBottom: 8 }}>결제를 진행할 수 없습니다</p><p style={{ fontSize: "0.82rem", color: "#888", lineHeight: 1.6 }}>{fatal}</p></Card>;
  if (done)
    return (
      <Card>
        <p style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10 }}>구독이 시작되었습니다</p>
        <p style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.7, marginBottom: 18 }}>
          이 창을 닫고 앱으로 돌아가시면 플랜이 적용되어 있습니다.
        </p>
        <button className="pay-btn" onClick={() => window.close()}>창 닫기</button>
      </Card>
    );
  if (!info) return <Card><p style={{ fontSize: "0.88rem", color: "#888" }}>불러오는 중…</p></Card>;

  return (
    <Card>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        {info.product === "all" ? info.productLabel : `${info.productLabel} ${info.planLabel}`}
      </h1>
      <p style={{ fontSize: "0.78rem", color: "#aaa", marginBottom: 20 }}>매월 자동 결제</p>

      {/* 금액 */}
      <div style={{ background: "#f8f8f8", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <Row label="구독료" value={`$${info.baseUsd.toFixed(2)}`} />
        {/* 🔴해외는 영세율(0%)이라 부가세가 없다. 0원짜리 줄을 보여주면 오해를 산다. */}
        {info.vatUsd > 0 && <Row label="부가세 (10%)" value={`$${info.vatUsd.toFixed(2)}`} />}
        <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: 10, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>매월 청구</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>{money(info.amount, info.currency)}</span>
        </div>
      </div>

      {/* 🔴번들은 기존 개별 구독을 즉시 끊는다 — 결제 전에 반드시 밝힌다(일할 환불 없음) */}
      {info.product === "all" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px",
          background: "#fff8e6", borderRadius: 8, marginBottom: 16,
        }}>
          <span style={{ fontSize: "0.82rem" }}>⚠️</span>
          <p style={{ fontSize: "0.75rem", color: "#6b5a2e", lineHeight: 1.6, margin: 0 }}>
            이용 중인 개별 구독이 있으면 지금 해지되고 전체 구독으로 합쳐집니다.
            모든 프로그램이 최상위 등급으로 열리며, 이미 결제된 개별 구독료는 일할 환불되지 않습니다.
          </p>
        </div>
      )}

      {/* 계정 — 보여주기만 한다(로그인 계정과 어긋나면 안 되므로 입력받지 않는다) */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#f8f8f8", borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: "0.78rem", color: "#666" }}>계정</span>
        <span style={{ fontSize: "0.78rem", color: "#1a1a1a" }}>{info.email || "—"}</span>
      </div>

      {/* 국가를 모를 때만 결제 지역을 고르게 한다 */}
      {!info.countryKnown && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: 6 }}>결제 지역</p>
          <div className="method-row" style={{ marginBottom: 0 }}>
            <button type="button" className={`method-btn${!isKo ? " active" : ""}`} onClick={() => setChannel("eximbay")}>해외 (USD)</button>
            <button type="button" className={`method-btn${isKo ? " active" : ""}`} onClick={() => setChannel("galaxia")}>국내 (KRW)</button>
          </div>
        </div>
      )}

      {/* 해외 결제수단 — PayPal 개통 전에는 카드 하나뿐이라 숨긴다 */}
      {!isKo && PAYPAL_BILLING_ENABLED && (
        <div className="method-row">
          <button type="button" className={`method-btn${method === "CARD" ? " active" : ""}`} onClick={() => setMethod("CARD")}>신용카드</button>
          <button type="button" className={`method-btn${method === "PAYPAL" ? " active" : ""}`} onClick={() => setMethod("PAYPAL")}>PayPal</button>
        </div>
      )}

      <form onSubmit={submit}>
        <label className="agree-row" onClick={() => setAgreed(!agreed)}>
          <input
            type="checkbox" checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            style={{ width: 14, height: 14, cursor: "pointer", flexShrink: 0 }}
          />
          <span style={{ fontSize: "0.78rem", color: "#555" }}>
            매월 자동으로 결제되며 언제든 해지할 수 있다는 데 동의합니다.
          </span>
        </label>

        {error && <div style={{ fontSize: "0.78rem", color: "#e53e3e", marginTop: 10 }}>{error}</div>}

        <button className="pay-btn" type="submit" disabled={loading || !agreed}>
          {loading ? "처리 중…" : `${money(info.amount, info.currency)} 결제하고 구독 시작`}
        </button>
      </form>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: "0.78rem", color: "#666" }}>{label}</span>
      <span style={{ fontSize: "0.78rem" }}>{value}</span>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .sub-box { background:#fff; border-radius:16px; padding:28px 28px 24px; width:100%; max-width:360px; box-shadow:0 8px 32px rgba(0,0,0,0.12); }
        .pay-btn { width:100%; padding:11px; background:#1a1a1a; color:#fff; border:none; border-radius:8px; font-size:0.88rem; font-weight:600; font-family:inherit; cursor:pointer; transition:background .2s; margin-top:12px; }
        .pay-btn:hover { background:#333; }
        .pay-btn:disabled { background:#ccc; cursor:not-allowed; }
        .method-row { display:flex; gap:8px; margin-bottom:16px; }
        .method-btn { flex:1; padding:11px 8px; border:1.5px solid #e0e0e0; border-radius:8px; background:#fff; font-size:0.82rem; font-weight:500; font-family:inherit; color:#555; cursor:pointer; transition:all .15s; }
        .method-btn:hover { border-color:#bbb; }
        .method-btn.active { border-color:#1a1a1a; background:#1a1a1a; color:#fff; }
        .agree-row { display:flex; align-items:center; gap:8px; padding:10px 12px; background:#f8f8f8; border-radius:8px; margin-top:14px; cursor:pointer; }
        .agree-row:hover { background:#f0f0f0; }
      `}</style>
      <div className="sub-box">{children}</div>
    </>
  );
}

export default function SubscribePage() {
  return (
    <main style={{
      fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
      background: "#f5f5f5", color: "#1a1a1a", minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <Suspense fallback={<p style={{ fontSize: "0.88rem", color: "#888" }}>Loading...</p>}>
        <SubscribeContent />
      </Suspense>
    </main>
  );
}
