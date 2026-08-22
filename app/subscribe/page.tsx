"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";
import { useLanguage } from "@/lib/i18n";
import { t } from "@/lib/translations";
import { USE_TEST_CHANNELS, TEST_CHANNEL_INTL, TEST_CHANNEL_KRW } from "@/lib/interim";

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
// 🔴🔴정기결제 채널은 단건(/payment)과 **다른 것**이다. PG가 정기결제에 MID를 따로
//   발급하고 포트원 채널도 새로 만들어야 한다(2026-08-21 포트원 확인).
//   ⚠️아래 두 값은 아직 단건 채널 키다 — 이 값으로는 빌링키가 발급되지 않는다.
//     정기결제 채널이 열리면 여기와 lib/subscription.ts 두 곳을 함께 바꿀 것.
const REAL_CHANNEL_INTL = "channel-key-796e8cff-cddb-4731-a364-910163f64bcb";
const REAL_CHANNEL_KRW = "channel-key-d725a6f3-ff5a-40ab-8f01-9f6b363f15db";
// 🔴테스트 채널로 돌릴 때는 lib/interim.ts의 USE_TEST_CHANNELS 하나만 뒤집는다.
//   서버(lib/subscription.ts의 BILLING_CHANNEL)도 같은 스위치를 보므로 발급과
//   청구가 따로 놀지 않는다.
const CHANNEL_BILLING_INTL = USE_TEST_CHANNELS ? TEST_CHANNEL_INTL : REAL_CHANNEL_INTL;
const CHANNEL_BILLING_KRW = USE_TEST_CHANNELS ? TEST_CHANNEL_KRW : REAL_CHANNEL_KRW;

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
  // 🔴해외(엑심베이)는 빌링키 발급과 동시에 첫 결제가 일어난다. 그 결제 ID를
  //   서버가 정해 내려준다 — 화면이 만들면 위조할 수 있다.
  paymentId: string;
};


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
    recurring: "정기결제",
    fee: "구독료",
    vat: "부가세 (10%)",
    account: "계정",
    card: "신용카드",
    termsTitle: "이용약관",
    agree: "에 동의합니다.",
    termsMore: "전체 이용약관 · 개인정보 처리방침 보기",
    processing: "처리 중…",
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
    recurring: "Recurring payment",
    fee: "Subscription",
    vat: "VAT (10%)",
    account: "Account",
    card: "Credit card",
    termsTitle: "Terms of Service",
    agree: " — I agree.",
    termsMore: "Read the full terms & privacy policy",
    processing: "Processing…",
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
  const [termsOpen, setTermsOpen] = useState(false);
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

    const customer = {
      customerId: sid.replace(/-/g, "").slice(0, 20),
      fullName: info.email.split("@")[0],
      email: info.email,
    };

    try {
      // 🔴국내와 해외는 **호출하는 함수가 다르다.** PG 정책이 정반대라서다.
      //   - 갤럭시아: 카드 빌링키는 발급만 된다(동시 결제는 휴대폰 전용).
      //   - 엑심베이: 발급만 하는 호출을 아예 지원하지 않는다. 실제로 부르면
      //     포트원이 "EXIMBAY_V2 에 대해 지원하지 않는 기능입니다"로 막는다.
      //     발급과 첫 결제가 한 번에 일어나야 한다.
      //   ⚠️그래서 해외는 이 시점에 **돈이 실제로 빠진다.** confirm이 또 청구하면
      //     이중 청구가 되므로, 서버는 채널을 보고 청구를 건너뛴다.
      const res = isKrw
        ? await PortOne.requestIssueBillingKey({
            storeId: STORE_ID,
            channelKey: CHANNEL_BILLING_KRW,
            billingKeyMethod: "CARD",
            issueId,
            issueName: x.issueName(info.planLabel),
            // 표시용 금액. 실제 청구는 서버가 다시 계산해서 한다.
            displayAmount: info.amount,
            currency: info.currency,
            customer,
            redirectUrl: back,
          } as unknown as Parameters<typeof PortOne.requestIssueBillingKey>[0])
        : await PortOne.requestIssueBillingKeyAndPay({
            storeId: STORE_ID,
            channelKey: CHANNEL_BILLING_INTL,
            billingKeyAndPayMethod: method,
            // 🔴결제 ID를 화면에서 만들지 않는다 — 서버가 세션에서 내려준 값을 그대로
            //   쓴다. 브라우저가 정하면 남의 결제 ID를 넣어 구독을 가로챌 수 있다.
            paymentId: info.paymentId,
            orderName: x.issueName(info.planLabel),
            totalAmount: info.amount,
            currency: info.currency,
            customer,
            // 🔴엑심베이는 products가 없으면 결제창 상품명이 비고, 해외카드 외
            //   수단에서는 아예 필수다. link도 엑심베이 필수 항목이다.
            products: [{
              id: product,
              name: x.issueName(info.planLabel),
              amount: info.amount,
              quantity: 1,
              link: window.location.origin,
            }],
            redirectUrl: back,
          } as unknown as Parameters<typeof PortOne.requestIssueBillingKeyAndPay>[0]);

      if (!res || res.code) {
        setError(res?.message || x.canceled);
        setLoading(false);
        return;
      }
      await confirm(res.billingKey, channel, methodLabel);
    } catch (e) {
      // 🔴예외를 삼키지 않는다. PG가 지원하지 않는 호출이면 SDK는 code를 돌려주는
      //   대신 여기로 던지는데, 그 메시지가 원인을 말해 주는 유일한 단서다.
      //   (화면에는 그대로 띄우지 않는다 — 손님에게는 내부 오류 문구가 무의미하다.)
      // 🔴객체로 넘기면 Next 오버레이가 {}로 뭉개 버린다. 문자열로 펼쳐서 남긴다.
      const detail = e instanceof Error
        ? `${e.name}: ${e.message}`
        : (() => { try { return JSON.stringify(e); } catch { return String(e); } })();
      console.error(
        `[subscribe] 빌링키 발급 예외 | channel=${channel} method=${method} | ${detail}`);
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

      {/* 정기결제 — 🔴체험이면 "지금 낼 돈"이 0이라는 것과 "언제 얼마가 빠지는지"를
          한 칸 안에서 같이 보여준다. 0원만 크게 띄우면 자동결제를 못 보고 지나간다. */}
      <div style={{ background: "#f8f8f8", borderRadius: 10, padding: 14, marginBottom: 16 }}>
        <div style={{ fontSize: "0.82rem", fontWeight: 700, marginBottom: 10 }}>{x.recurring}</div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
          <span style={{ fontSize: "0.78rem", color: "#666" }}>{x.fee}</span>
          <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>
            {money(info.amount, info.currency)}
          </span>
        </div>

        {/* 🔴해외는 영세율(0%)이라 부가세가 없다. 0원짜리 줄을 보여주면 오해를 산다. */}
        {info.vatUsd > 0 && <Row label={x.vat} value={`${info.vatUsd.toFixed(2)}`} />}

      </div>


      {/* 계정 — 보여주기만 한다(로그인 계정과 어긋나면 안 되므로 입력받지 않는다) */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#f8f8f8", borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: "0.78rem", color: "#666" }}>{x.account}</span>
        <span style={{ fontSize: "0.78rem", color: "#1a1a1a" }}>{info.email || "—"}</span>
      </div>


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
            <button
              type="button"
              className="terms-link"
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); setTermsOpen((v) => !v); }}
            >
              {x.termsTitle}
            </button>
            {x.agree}
          </span>
        </label>

        {/* 🔴결제 전에 약관을 화면에 둔다. 접혀 있어도 화면에 있는 것이라
            지우면 안 된다 — 동의를 받으려면 볼 수 있어야 한다. */}
        {termsOpen && (
          <div className="terms">
            {/* 🔴약관 원문은 lib/translations 한 곳에만 둔다. 여기에 따로 적으면
                /policy/terms-and-policy 와 어긋나고, 그때 어느 쪽이 유효한
                약관인지 다투게 된다. */}
            {t[lang].terms.sections.map((sec, i) => (
              <section key={i}>
                <h4>{sec.title}</h4>
                {"body" in sec && sec.body && <p>{sec.body}</p>}
                {"list" in sec && sec.list && (
                  <ul>{sec.list.map((li, j) => <li key={j}>{li}</li>)}</ul>
                )}
                {"body2" in sec && sec.body2 && <p>{sec.body2}</p>}
              </section>
            ))}
            <p className="terms-eff">{t[lang].terms.effectiveDate}</p>
          </div>
        )}
        {termsOpen && (
          <a className="terms-more" href="/policy/terms-and-policy" target="_blank" rel="noreferrer">
            {x.termsMore}
          </a>
        )}

        {error && <div style={{ fontSize: "0.78rem", color: "#e53e3e", marginTop: 10 }}>{error}</div>}

        <button className="pay-btn" type="submit" disabled={loading || !agreed}>
          {loading ? x.processing : x.payNow(money(info.amount, info.currency))}
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
        .terms-link { background:none; border:none; padding:0; font-family:inherit; font-size:0.78rem; font-weight:700; color:#1a1a1a; text-decoration:underline; cursor:pointer; }
        /* 🔴약관 전문을 상자 안에서 스크롤시킨다 — 결제 화면이 약관 길이만큼
           늘어나면 결제 버튼이 화면 밖으로 밀려난다. */
        .terms { margin-top:10px; padding:14px 16px; background:#fafafa; border:1px solid #ececec; border-radius:8px; max-height:260px; overflow-y:auto; }
        .terms section { margin-bottom:12px; }
        .terms h4 { font-size:0.74rem; font-weight:700; color:#333; margin-bottom:4px; }
        .terms p { font-size:0.71rem; color:#666; line-height:1.7; white-space:pre-line; }
        .terms ul { margin:4px 0 0; padding-left:15px; }
        .terms li { font-size:0.71rem; color:#666; line-height:1.7; margin-bottom:3px; }
        .terms-eff { font-size:0.68rem; color:#aaa; margin-top:14px; }
        .terms-more { display:inline-block; margin-top:8px; font-size:0.72rem; color:#888; }
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
