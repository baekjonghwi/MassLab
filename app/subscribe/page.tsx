"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";
import { useLanguage } from "@/lib/i18n";

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
  // 무료체험 — 서버가 판정한다(계정당 1회). 화면은 결과만 보여준다.
  trial: boolean;
  trialDays: number;
  firstChargeAt: string;
};

// 첫 청구일 고지에 쓴다.
// 🔴날짜를 반드시 적는다. "7일 뒤"만 쓰면 사용자가 언제 돈이 빠지는지 계산해야 한다.
function fmtDate(iso: string, isKo: boolean): string {
  const d = new Date(iso);
  return isKo
    ? `${d.getMonth() + 1}월 ${d.getDate()}일`
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ==========================================================================
//  화면 문구
//
//  🔴언어는 **결제 채널이 정한다** — 국내(갤럭시아)는 한글, 해외(엑심베이)는 영어.
//    건당 결제 페이지(/payment)와 같은 규칙이다. 결제수단·통화·세금이 지역으로
//    갈리는데 문구만 따로 놀면 "내가 얼마를 어떤 카드로 내는가"가 흐려진다.
//  ⚠️채널을 아직 모르는 동안(세션 조회 실패 등)에는 홈페이지에서 고른 언어를 쓴다.
// ==========================================================================
const TX = {
  ko: {
    badUrl: "주소가 올바르지 않습니다.",
    expired: "결제 요청이 만료되었습니다. 앱에서 다시 시도해 주세요.",
    alreadyUsed: "이미 처리된 요청입니다.",
    notFound: "결제 요청을 찾을 수 없습니다.",
    notForSale: "현재 판매하지 않는 상품입니다.",
    bundleActive: "이미 전체 구독 중이라 이 프로그램은 따로 결제하실 필요가 없습니다.",
    loadFail: "결제 정보를 불러오지 못했습니다.",
    chargeFail: (m: string) => `결제에 실패했습니다. ${m}`,
    saveFail: "결제는 완료됐지만 구독 등록에 실패했습니다. 고객센터로 문의해 주세요.",
    processFail: "처리에 실패했습니다.",
    canceled: "결제창에서 취소되었습니다.",
    payError: "결제 처리 중 오류가 발생했습니다.",
    fatalTitle: "결제를 진행할 수 없습니다",
    loading: "불러오는 중…",
    doneTitle: "구독이 시작되었습니다",
    doneBody: "이 창을 닫고 앱으로 돌아가시면 플랜이 적용되어 있습니다.",
    close: "창 닫기",
    subMonthly: "매월 자동 결제",
    subTrial: (d: number) => `${d}일 무료 체험 후 매월 자동 결제`,
    fee: "구독료",
    vat: "부가세 (10%)",
    dueToday: "지금 결제",
    dueMonthly: "매월 청구",
    fromEveryMonth: (date: string) => `${date}부터 매월`,
    account: "계정",
    region: "결제 지역",
    overseas: "해외 (USD)",
    domestic: "국내 (KRW)",
    card: "신용카드",
    agreeTrial: (date: string, amt: string) =>
      `${date}부터 매월 ${amt}이(가) 자동 결제되며, 언제든 해지할 수 있다는 데 동의합니다.`,
    agreeMonthly: "매월 자동으로 결제되며 언제든 해지할 수 있다는 데 동의합니다.",
    processing: "처리 중…",
    startTrial: (d: number) => `${d}일 무료로 시작하기`,
    payNow: (amt: string) => `${amt} 결제하고 구독 시작`,
    issueName: (plan: string) => `${plan} 구독`,
  },
  en: {
    badUrl: "This link isn't valid.",
    expired: "This checkout request has expired. Please try again from the app.",
    alreadyUsed: "This request has already been processed.",
    notFound: "Checkout request not found.",
    notForSale: "This plan isn't available right now.",
    bundleActive: "You already have the all-access subscription, so no separate purchase is needed.",
    loadFail: "Couldn't load your checkout details.",
    chargeFail: (m: string) => `Payment failed. ${m}`,
    saveFail: "Your payment went through, but we couldn't activate the subscription. Please contact support.",
    processFail: "Something went wrong.",
    canceled: "Payment was canceled.",
    payError: "Something went wrong while processing your payment.",
    fatalTitle: "Can't continue to checkout",
    loading: "Loading…",
    doneTitle: "Your subscription is active",
    doneBody: "Close this window and return to the app — your plan is already applied.",
    close: "Close window",
    subMonthly: "Billed monthly",
    subTrial: (d: number) => `${d}-day free trial, then billed monthly`,
    fee: "Subscription",
    vat: "VAT (10%)",
    dueToday: "Due today",
    dueMonthly: "Billed monthly",
    fromEveryMonth: (date: string) => `Monthly from ${date}`,
    account: "Account",
    region: "Billing region",
    overseas: "International (USD)",
    domestic: "Korea (KRW)",
    card: "Credit card",
    agreeTrial: (date: string, amt: string) =>
      `I agree to be charged ${amt} monthly starting ${date}, and understand I can cancel anytime.`,
    agreeMonthly: "I agree to be billed monthly and understand I can cancel anytime.",
    processing: "Processing…",
    startTrial: (d: number) => `Start ${d} days free`,
    payNow: (amt: string) => `Pay ${amt} and subscribe`,
    issueName: (plan: string) => `${plan} subscription`,
  },
} as const;

function SubscribeContent() {
  const sp = useSearchParams();
  const sid = sp.get("sid") ?? "";
  const product = sp.get("product") ?? "archimap";

  const { lang } = useLanguage();
  const [info, setInfo] = useState<SessionInfo | null>(null);
  const [fatal, setFatal] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [done, setDone] = useState(false);
  // 국내/해외 채널. 기본은 가입 국가가 정하고, 국가를 모를 때만 사용자가 고른다.
  const [channel, setChannel] = useState<"eximbay" | "galaxia">("eximbay");
  const [method, setMethod] = useState<"CARD" | "PAYPAL">("CARD");

  // 결제 채널(금액·수단·PG를 가른다)과 화면 언어를 이름부터 나눠 둔다.
  // 세션을 읽고 나면 둘이 같은 값이지만, 읽기 전에는 언어만 홈페이지 설정을 따른다.
  const isKrw = channel === "galaxia";
  const isKo = info ? isKrw : lang === "ko";
  const x = isKo ? TX.ko : TX.en;

  // --- 세션 조회 ---------------------------------------------------------
  useEffect(() => {
    // 🔴이 시점엔 채널을 모른다 — 홈페이지 언어로 말한다.
    const m = lang === "ko" ? TX.ko : TX.en;
    if (!sid) { setFatal(m.badUrl); return; }
    // 🔴제품·등급은 쿼리가 아니라 세션 행에서 읽는다(쿼리면 사용자가 바꿔 넣을 수 있다).
    fetch(`/api/subscribe/session?sid=${encodeURIComponent(sid)}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) {
          setFatal(
            d.error === "expired" ? m.expired
            : d.error === "already_used" ? m.alreadyUsed
            : d.error === "not_found" ? m.notFound
            : d.error === "not_for_sale" ? m.notForSale
            : d.error === "bundle_active" ? m.bundleActive
            : m.loadFail);
          return;
        }
        setInfo(d as SessionInfo);
        // 🔴국가를 아는 사람만 서버 판정을 따른다. 모르면 화면 언어로 정한다
        //   (2026-08-18 결정 — 가입 때 거주 지역을 묻지 않기로 했다).
        //   한국어로 보고 있으면 원화(갤럭시아), 영어면 달러(엑심베이).
        //   ⚠️추정일 뿐이라 아래 결제 지역 토글은 그대로 남겨 둔다 — 사람이 뒤집을 수 있어야 한다.
        const sess = d as SessionInfo;
        setChannel(sess.countryKnown ? sess.channel : (lang === "ko" ? "galaxia" : "eximbay"));
      })
      .catch(() => setFatal(m.loadFail));
  }, [sid, product, lang]);

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
          d.error === "charge_failed" ? x.chargeFail(d.message ?? "")
          : d.error === "save_failed" ? x.saveFail
          : x.processFail);
        return;
      }
      window.fbq?.("track", "Subscribe", { value: d.amount, currency: d.currency });
      setDone(true);
    },
    [sid, product, x],
  );

  // 🔴모바일 리디렉션 복귀 처리. 주소에 billingKey가 있으면 그대로 이어 간다.
  useEffect(() => {
    const bk = sp.get("billingKey");
    const code = sp.get("code");
    if (code) { setError(sp.get("message") || x.canceled); return; }
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

    // 🔴DB(method_label)에 남는 값이라 화면 언어가 아니라 채널을 따른다.
    const methodLabel = isKrw ? "국내 신용카드" : method === "PAYPAL" ? "PayPal" : "해외 신용카드";
    const issueId = `${product}-bk-${sid.slice(0, 8)}-${Date.now()}`;
    // 복귀 주소에 채널·수단을 실어 둔다(리디렉션으로 돌아오면 상태가 다 날아간다).
    const back = `${window.location.origin}/subscribe?sid=${encodeURIComponent(sid)}`
      + `&product=${encodeURIComponent(product)}&ch=${channel}&ml=${encodeURIComponent(methodLabel)}`;

    try {
      const res = await PortOne.requestIssueBillingKey({
        storeId: STORE_ID,
        channelKey: isKrw ? CHANNEL_GALAXIA : CHANNEL_EXIMBAY,
        // 🔴갤럭시아 빌링키는 카드만 된다. 해외는 카드 또는 PayPal.
        billingKeyMethod: isKrw ? "CARD" : method,
        issueId,
        issueName: x.issueName(info.planLabel),
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
        setError(res?.message || x.canceled);
        setLoading(false);
        return;
      }
      await confirm(res.billingKey, channel, methodLabel);
    } catch {
      setError(x.payError);
      setLoading(false);
    }
  };

  const money = (n: number, cur: string) =>
    cur === "KRW" ? `${n.toLocaleString()}원` : `$${(n / 100).toFixed(2)}`;

  if (fatal) return <Card><p style={{ fontWeight: 600, marginBottom: 8 }}>{x.fatalTitle}</p><p style={{ fontSize: "0.82rem", color: "#888", lineHeight: 1.6 }}>{fatal}</p></Card>;
  if (done)
    return (
      <Card>
        <p style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10 }}>{x.doneTitle}</p>
        <p style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.7, marginBottom: 18 }}>
          {x.doneBody}
        </p>
        <button className="pay-btn" onClick={() => window.close()}>{x.close}</button>
      </Card>
    );
  if (!info) return <Card><p style={{ fontSize: "0.88rem", color: "#888" }}>{x.loading}</p></Card>;

  return (
    <Card>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        {info.product === "all" ? info.productLabel : `${info.productLabel} ${info.planLabel}`}
      </h1>
      <p style={{ fontSize: "0.78rem", color: "#aaa", marginBottom: 20 }}>
        {info.trial ? x.subTrial(info.trialDays) : x.subMonthly}
      </p>

      {/* 금액 */}
      <div style={{ background: "#f8f8f8", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <Row label={x.fee} value={`$${info.baseUsd.toFixed(2)}`} />
        {/* 🔴해외는 영세율(0%)이라 부가세가 없다. 0원짜리 줄을 보여주면 오해를 산다. */}
        {info.vatUsd > 0 && <Row label={x.vat} value={`$${info.vatUsd.toFixed(2)}`} />}
        <div style={{ borderTop: "1px solid #e8e8e8", paddingTop: 10, marginTop: 8, display: "flex", justifyContent: "space-between" }}>
          {/* 🔴체험이면 "지금 낼 돈"을 0으로 못박아 보여준다. 총액만 크게 띄우면
              당장 결제되는 줄 알고 이탈한다. */}
          <span style={{ fontSize: "0.9rem", fontWeight: 600 }}>
            {info.trial ? x.dueToday : x.dueMonthly}
          </span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
            {info.trial ? money(0, info.currency) : money(info.amount, info.currency)}
          </span>
        </div>
        {info.trial && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
            <span style={{ fontSize: "0.78rem", color: "#666" }}>{x.fromEveryMonth(fmtDate(info.firstChargeAt, isKo))}</span>
            <span style={{ fontSize: "0.78rem", color: "#666" }}>{money(info.amount, info.currency)}</span>
          </div>
        )}
      </div>

      {/* 🔴무료체험 후 자동결제는 전자상거래법상 사전 고지 의무다. 지우지 말 것. */}
      {info.trial && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px",
          background: "#eef6ff", borderRadius: 8, marginBottom: 16,
        }}>
          <span style={{ fontSize: "0.82rem" }}>ℹ️</span>
          <p style={{ fontSize: "0.75rem", color: "#2c4a6b", lineHeight: 1.6, margin: 0 }}>
            {isKo ? (
              <>
                오늘부터 {info.trialDays}일간 무료입니다. <b>{fmtDate(info.firstChargeAt, true)}</b>에
                첫 결제 {money(info.amount, info.currency)}가 청구되고, 이후 매월 같은 날 자동 결제됩니다.
                그 전에 해지하시면 <b>한 푼도 청구되지 않습니다.</b><br />
                무료 체험은 계정당 한 번만 제공되며, 다른 요금제로 바꾸셔도 다시 받으실 수 없습니다.
              </>
            ) : (
              <>
                Free for {info.trialDays} days starting today. On <b>{fmtDate(info.firstChargeAt, false)}</b> you&apos;ll
                be charged {money(info.amount, info.currency)}, and on the same day every month after that.
                Cancel before then and <b>you won&apos;t be charged anything.</b><br />
                The free trial is available once per account — switching plans won&apos;t give you another one.
              </>
            )}
          </p>
        </div>
      )}

      {/* 🔴번들은 기존 개별 구독을 즉시 끊는다 — 결제 전에 반드시 밝힌다(일할 환불 없음) */}
      {info.product === "all" && (
        <div style={{
          display: "flex", alignItems: "flex-start", gap: 8, padding: "10px 12px",
          background: "#fff8e6", borderRadius: 8, marginBottom: 16,
        }}>
          <span style={{ fontSize: "0.82rem" }}>⚠️</span>
          <p style={{ fontSize: "0.75rem", color: "#6b5a2e", lineHeight: 1.6, margin: 0 }}>
            {isKo
              ? "이용 중인 개별 구독이 있으면 지금 해지되고 전체 구독으로 합쳐집니다. 모든 프로그램이 최상위 등급으로 열리며, 이미 결제된 개별 구독료는 일할 환불되지 않습니다."
              : "Any individual subscriptions you have will be canceled now and merged into all-access. Every program opens at the top tier, and individual fees already paid are not refunded pro rata."}
          </p>
        </div>
      )}

      {/* 계정 — 보여주기만 한다(로그인 계정과 어긋나면 안 되므로 입력받지 않는다) */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#f8f8f8", borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: "0.78rem", color: "#666" }}>{x.account}</span>
        <span style={{ fontSize: "0.78rem", color: "#1a1a1a" }}>{info.email || "—"}</span>
      </div>

      {/* 국가를 모를 때만 결제 지역을 고르게 한다.
          🔴이 버튼을 누르면 채널이 바뀌고, 채널이 언어를 정하므로 화면 말이 통째로 바뀐다.
            그래서 두 버튼의 글자만은 항상 양쪽 말로 같이 적어 둔다 — 안 그러면 영어 화면에서
            한국을 고르려는 사람이 자기가 뭘 누르는지 못 읽는다. */}
      {!info.countryKnown && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: 6 }}>{x.region}</p>
          <div className="method-row" style={{ marginBottom: 0 }}>
            <button type="button" className={`method-btn${!isKrw ? " active" : ""}`} onClick={() => setChannel("eximbay")}>International (USD)</button>
            <button type="button" className={`method-btn${isKrw ? " active" : ""}`} onClick={() => setChannel("galaxia")}>국내 (KRW)</button>
          </div>
        </div>
      )}

      {/* 해외 결제수단 — PayPal 개통 전에는 카드 하나뿐이라 숨긴다 */}
      {!isKrw && PAYPAL_BILLING_ENABLED && (
        <div className="method-row">
          <button type="button" className={`method-btn${method === "CARD" ? " active" : ""}`} onClick={() => setMethod("CARD")}>{x.card}</button>
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
            {info.trial
              ? x.agreeTrial(fmtDate(info.firstChargeAt, isKo), money(info.amount, info.currency))
              : x.agreeMonthly}
          </span>
        </label>

        {error && <div style={{ fontSize: "0.78rem", color: "#e53e3e", marginTop: 10 }}>{error}</div>}

        <button className="pay-btn" type="submit" disabled={loading || !agreed}>
          {loading ? x.processing
            : info.trial ? x.startTrial(info.trialDays)
            : x.payNow(money(info.amount, info.currency))}
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
