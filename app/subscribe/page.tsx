"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";
import { supabase } from "@/lib/supabase";
import { useLanguage, trPick, fmt } from "@/lib/i18n";
import { t } from "@/lib/translations";
import { USE_TEST_CHANNELS, TEST_CHANNEL_INTL, TEST_CHANNEL_INICIS } from "@/lib/interim";

// ==========================================================================
//  구독 결제(빌링키 발급) — 로그인이 있는 제품 전용.
//
//  ⚠️sid로 서버가 신원을 알아내므로 이메일을 "보여주기만" 한다. (이메일을 입력받던
//    단건 결제 /payment 는 2026-09-14 에 걷어냈다 — 지금은 종료 안내뿐이다.)
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
// 🔴🔴정기결제 채널은 단건 채널과 **다른 것**이다. PG가 정기결제에 MID를 따로
//   발급하고 포트원 채널도 새로 만들어야 한다(2026-08-21 포트원 확인).
//   🔴lib/subscription.ts 에 같은 값이 있다(서버가 매달 청구할 때 쓴다) — 한쪽만
//     고치면 발급과 청구가 다른 채널로 갈린다. 반드시 함께 바꿀 것.
//
//   🔴🔴2026-09-11 — 국내는 KG이니시스다. 지금은 **테스트 채널**이 돈다(PG 심사 기간).
//     아래 두 값은 실연동 자리다 — 이니시스는 비었고, 해외는 엑심베이 단건 키다.
//     자세한 사정은 lib/subscription.ts 의 같은 자리에 적어 두었다.
const REAL_CHANNEL_INTL = "channel-key-796e8cff-cddb-4731-a364-910163f64bcb";
const REAL_CHANNEL_INICIS = "";
// 🔴테스트 채널로 돌릴 때는 lib/interim.ts의 USE_TEST_CHANNELS 하나만 뒤집는다.
//   서버(lib/subscription.ts의 BILLING_CHANNEL)도 같은 스위치를 보므로 발급과
//   청구가 따로 놀지 않는다.
const CHANNEL_BILLING_INTL = USE_TEST_CHANNELS ? TEST_CHANNEL_INTL : REAL_CHANNEL_INTL;
const CHANNEL_BILLING_INICIS = USE_TEST_CHANNELS ? TEST_CHANNEL_INICIS : REAL_CHANNEL_INICIS;

// 국내 휴대폰. 서버(/api/subscribe/buyer)와 같은 규칙이다 — 여기서 먼저 걸러 왕복을 줄인다.
const PHONE_RE = /^01[016789]\d{7,8}$/;
type Ch = "eximbay" | "inicis";

// 🔴PayPal 빌링키는 엑심베이에 PayPal이 개통된 뒤에야 실제로 발급된다.
//   개통 확인 후 이 값만 true로 바꾸면 해외 결제수단에 PayPal이 뜬다.
const PAYPAL_BILLING_ENABLED = false;

// ==========================================================================
//  결제수단 — DB(subscriptions.method_label)에 그대로 남는 값.
//
//  🔴여기에는 **사람이 읽는 말을 넣지 않는다.** 예전엔 "국내 신용카드"처럼
//    한글을 그대로 넣었는데, 그 값은 영어 화면에서도 한글로 새어 나온다.
//    저장은 **언어중립 코드**로 하고, 번역은 그것을 **그리는 화면**이 제
//    TX.ko / TX.en 으로 한다(이 화면의 TX.*.method 가 그 표다).
//  ✅옛 데이터 걱정은 없다 — subscriptions 는 0행이다(2026-08-26 확인).
//    하위호환 매핑을 만들지 말 것.
// ==========================================================================
type MethodCode = "card_kr" | "card_intl" | "paypal";

type SessionInfo = {
  product: string;
  productLabel: string;
  plan: string;
  planLabel: string;
  email: string;
  country: string | null;
  countryKnown: boolean;
  channel: Ch;
  baseUsd: number;
  vat: number;
  vatCurrency: "USD" | "KRW";
  amount: number;
  currency: "USD" | "KRW";
  // 🔴해외(엑심베이)는 빌링키 발급과 동시에 첫 결제가 일어난다. 그 결제 ID를
  //   서버가 정해 내려준다 — 화면이 만들면 위조할 수 있다.
  paymentId: string;
  // 🔴PG에 넘길 고객 식별자. 발급과 청구가 같은 값을 써야 해서 서버가 내려준다.
  customerId: string;
};


// ==========================================================================
//  화면 문구
//
//  🔴언어는 **사람이 고른 언어**다(2026-09-11 사용자 결정). 전에는 결제 채널이 정했다
//    (국내=한글, 해외=영어) — 로컬에서 언어를 바꿔도 결제 화면이 늘 한국어로 남는 걸
//    보고 바꿨다. 한국어·영어 밖의 여섯 언어는 en 문장을 lib/i18n-dict 가 옮긴다.
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
    chargeFail: "결제에 실패했습니다. {m}",
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
    // 🔴method_label 코드를 사람이 읽는 말로 옮기는 표. 저장은 코드로만 한다.
    method: { card_kr: "국내 신용카드", card_intl: "해외 신용카드", paypal: "PayPal" },
    termsTitle: "이용약관",
    agree: "에 동의합니다.",
    termsMore: "전체 이용약관 · 개인정보 처리방침 보기",
    processing: "처리 중…",
    payNow: "{amt} 결제하고 구독 시작",
    issueName: "{plan} 구독",
    // 🔴KG이니시스는 결제창(PC)과 매달 청구 모두 구매자 이름·연락처가 필수다(2026-09-11).
    buyerName: "이름",
    buyerPhone: "휴대폰 번호",
    // 🔴"수집하지 않습니다"라고 쓰지 말 것(2026-09-14 확인) — 매달 자동결제 요청에 포트원이
    //   이름·연락처를 필수로 받는다(없으면 "customer.phoneNumber violated the rule REQUIRED").
    //   그래서 저장할 수밖에 없고, 쓰는 곳은 그 요청 하나뿐이다. 그 사실만 적는다.
    buyerHint: "결제 이외에는 다른 용도로 절대 사용하지 않습니다.",
    badName: "이름을 입력해 주세요.",
    badPhone: "휴대폰 번호를 확인해 주세요. (예: 010-1234-5678)",
    buyerFail: "구매자 정보를 저장하지 못했습니다. 다시 시도해 주세요.",
    notReady: "국내 결제를 준비하고 있습니다. 잠시 후 다시 시도해 주세요.",
    testNotice: "테스트 결제입니다 — 실제로 돈이 빠져나가지 않습니다.",
    toAccount: "내 구독 보기",
  },
  en: {
    badUrl: "This link isn't valid.",
    expired: "This checkout request has expired. Please try again from the app.",
    alreadyUsed: "This request has already been processed.",
    notFound: "Checkout request not found.",
    notForSale: "This plan isn't available right now.",
    bundleActive: "You already have the all-access subscription, so no separate purchase is needed.",
    loadFail: "Couldn't load your checkout details.",
    chargeFail: "Payment failed. {m}",
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
    method: { card_kr: "Credit card (Korea)", card_intl: "Credit card", paypal: "PayPal" },
    termsTitle: "Terms of Service",
    agree: " — I agree.",
    termsMore: "Read the full terms & privacy policy",
    processing: "Processing…",
    payNow: "Pay {amt} and subscribe",
    issueName: "{plan} subscription",
    buyerName: "Name",
    buyerPhone: "Mobile number",
    buyerHint: "It is never used for anything other than payment.",
    badName: "Please enter your name.",
    badPhone: "Please check your mobile number (e.g. 010-1234-5678).",
    buyerFail: "Couldn't save your details. Please try again.",
    notReady: "Domestic payment isn't ready yet. Please try again shortly.",
    testNotice: "Test payment — no real money is charged.",
    toAccount: "View my subscription",
  },
};

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
  const [channel, setChannel] = useState<Ch>("eximbay");
  const [method, setMethod] = useState<"CARD" | "PAYPAL">("CARD");
  // 국내(이니시스) 구매자 정보. 저장은 서버 세션 행에만 한다 — 주소창에 싣지 않는다.
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");

  // 결제 채널(금액·수단·PG를 가른다)과 화면 언어는 **따로 논다**(2026-09-11).
  const isKrw = channel === "inicis";
  // 🔴화면 언어는 사람이 고른 언어 그대로다(2026-09-11 사용자 결정). 전에는 채널이
  //   원화면 한국어로, 달러면 영어로 강제했다 — 한국에서 영어를 고른 사람도, 해외에서
  //   한국어를 고른 사람도 제 언어를 못 봤다. 금액·통화는 여전히 채널이 정한다.
  //   ⚠️PG 결제창 자체의 언어는 우리가 못 바꾼다(이니시스 창은 한국어로 뜬다).
  const x = trPick(lang, TX);

  // --- 세션 조회 ---------------------------------------------------------
  useEffect(() => {
    // 🔴이 시점엔 채널을 모른다 — 홈페이지 언어로 말한다.
    const m = trPick(lang, TX);
    if (!sid) { setFatal(m.badUrl); return; }
    // 🔴제품·등급은 쿼리가 아니라 세션 행에서 읽는다(쿼리면 사용자가 바꿔 넣을 수 있다).
    // 🔴lang 을 함께 보낸다 — 서버가 국가를 끝내 모를 때만 쓰는 힌트다. 채널과 금액을
    //   서버가 한 자리에서 정해야 화면 값과 결제 값이 안 갈린다(2026-09-11).
    fetch(`/api/subscribe/session?sid=${encodeURIComponent(sid)}&lang=${encodeURIComponent(lang)}`)
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
        // 🔴채널은 **서버가 정한 그대로** 쓴다(2026-09-11). 전에는 국가를 모르면 여기서
        //   화면 언어로 채널만 바꿨는데, 금액은 서버가 다른 채널로 계산한 것이라 원화
        //   결제창에 달러 금액이 실릴 수 있었다. 언어 힌트는 위 요청에 실어 보낸다.
        setChannel((d as SessionInfo).channel);
      })
      .catch(() => setFatal(m.loadFail));
  }, [sid, product, lang]);

  // --- 빌링키 → 확정 -----------------------------------------------------
  const confirm = useCallback(
    async (billingKey: string, ch: Ch, methodLabel: string) => {
      setLoading(true);
      const r = await fetch("/api/subscribe/confirm", {
        method: "POST",
        // 🔴Authorization 을 함께 보낸다 — 서버가 "이 체크아웃의 주인이 맞는가"를
        //   대조한다(2026-09-05). 쿠키가 먼저지만, 쿠키를 못 읽는 브라우저에서도
        //   주인 확인이 살아 있게 하는 두 번째 줄이다.
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase().auth.getSession()).data.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ sid, billingKey, channel: ch, methodLabel }),
      });
      const d = await r.json().catch(() => ({}));
      setLoading(false);
      if (!r.ok) {
        setError(
          d.error === "charge_failed" ? fmt(x.chargeFail, { m: d.message ?? "" })
          : d.error === "save_failed" ? x.saveFail
          : d.error === "buyer_missing" ? x.buyerFail
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
      const ch: Ch = sp.get("ch") === "inicis" ? "inicis" : "eximbay";
      confirm(bk, ch, sp.get("ml") ?? "");
    }
    // sp는 매 렌더 새 객체라 의존성에 넣지 않는다(무한 루프).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!info) return;
    setError("");

    // 🔴국내(이니시스)는 결제창을 열기 **전에** 구매자 이름·연락처를 서버 세션에 적는다.
    //   confirm 과 매달 크론이 그 값으로 긁는다. 모바일은 PG 창을 거쳐 돌아오며 이 화면
    //   상태가 날아가므로, 여기서 먼저 적어 두는 것이 유일한 길이다.
    const phoneDigits = buyerPhone.replace(/[\s-]/g, "");
    const nameTrim = buyerName.trim();
    if (isKrw) {
      if (!CHANNEL_BILLING_INICIS) { setError(x.notReady); return; }
      if (!nameTrim) { setError(x.badName); return; }
      if (!PHONE_RE.test(phoneDigits)) { setError(x.badPhone); return; }
    }
    setLoading(true);
    if (isKrw) {
      const br = await fetch("/api/subscribe/buyer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(await supabase().auth.getSession()).data.session?.access_token ?? ""}`,
        },
        body: JSON.stringify({ sid, name: nameTrim, phone: phoneDigits }),
      });
      if (!br.ok) {
        const bd = await br.json().catch(() => ({}));
        setError(bd.error === "bad_phone" ? x.badPhone : bd.error === "bad_name" ? x.badName : x.buyerFail);
        setLoading(false);
        return;
      }
    }

    // 🔴DB(subscriptions.method_label)에 남는 값이라 **언어중립 코드**로 적는다.
    //   화면 언어로도 채널 언어로도 적지 않는다 — 어느 쪽으로 적어도 반대편
    //   화면에서 그대로 새어 나온다. 그리는 쪽에서 TX.*.method 로 옮긴다.
    const methodLabel: MethodCode =
      isKrw ? "card_kr" : method === "PAYPAL" ? "paypal" : "card_intl";
    const issueId = `${product}-bk-${sid.slice(0, 8)}-${Date.now()}`;
    // 복귀 주소에 채널·수단을 실어 둔다(리디렉션으로 돌아오면 상태가 다 날아간다).
    const back = `${window.location.origin}/subscribe?sid=${encodeURIComponent(sid)}`
      + `&product=${encodeURIComponent(product)}&ch=${channel}&ml=${encodeURIComponent(methodLabel)}`;

    const customer = {
      // 🔴서버가 내려준 값 그대로 쓴다. 여기서 sid로 만들면 매달 청구하는
      //   서버(customerIdOf(uid))와 값이 갈려, PG가 빌링키 주인을 못 맞춘다.
      customerId: info.customerId,
      // 🔴이니시스는 이름·연락처·이메일이 필수다(PC). 해외는 이름이 없어 이메일 앞부분을 쓴다.
      fullName: isKrw ? nameTrim : info.email.split("@")[0],
      email: info.email,
      ...(isKrw ? { phoneNumber: phoneDigits } : {}),
    };

    try {
      // 🔴국내와 해외는 **호출하는 함수가 다르다.** PG 정책이 정반대라서다.
      //   - KG이니시스: 카드 빌링키를 **발급만** 한다. 첫 달 청구는 발급이 끝난 뒤
      //     서버(/api/subscribe/confirm)가 그 빌링키로 따로 한다.
      //     ⚠️issueId 는 ASCII 만 받는다(이니시스). issueName·issueId 둘 다 필수다.
      //   - 엑심베이: 발급만 하는 호출을 아예 지원하지 않는다. 실제로 부르면
      //     포트원이 "EXIMBAY_V2 에 대해 지원하지 않는 기능입니다"로 막는다.
      //     발급과 첫 결제가 한 번에 일어나야 한다.
      //   ⚠️그래서 해외는 이 시점에 **돈이 실제로 빠진다.** confirm이 또 청구하면
      //     이중 청구가 되므로, 서버는 채널을 보고 청구를 건너뛴다.
      const res = isKrw
        ? await PortOne.requestIssueBillingKey({
            storeId: STORE_ID,
            channelKey: CHANNEL_BILLING_INICIS,
            billingKeyMethod: "CARD",
            issueId,
            issueName: fmt(x.issueName, { plan: info.planLabel }),
            // 표시용 금액. 실제 청구는 서버가 같은 환율(세션에 고정)로 다시 계산한다.
            displayAmount: info.amount,
            currency: info.currency,
            customer,
            // 🔴이니시스 **모바일** 빌링키 발급은 제공 기간이 필수다(PC 는 선택). 월 구독이다.
            offerPeriod: { interval: "1m" },
            redirectUrl: back,
          } as unknown as Parameters<typeof PortOne.requestIssueBillingKey>[0])
        : await PortOne.requestIssueBillingKeyAndPay({
            storeId: STORE_ID,
            channelKey: CHANNEL_BILLING_INTL,
            billingKeyAndPayMethod: method,
            // 🔴결제 ID를 화면에서 만들지 않는다 — 서버가 세션에서 내려준 값을 그대로
            //   쓴다. 브라우저가 정하면 남의 결제 ID를 넣어 구독을 가로챌 수 있다.
            paymentId: info.paymentId,
            orderName: fmt(x.issueName, { plan: info.planLabel }),
            totalAmount: info.amount,
            currency: info.currency,
            customer,
            // 🔴엑심베이는 products가 없으면 결제창 상품명이 비고, 해외카드 외
            //   수단에서는 아예 필수다. link도 엑심베이 필수 항목이다.
            products: [{
              id: product,
              name: fmt(x.issueName, { plan: info.planLabel }),
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

  // ========================================================================
  //  통화 표기 — 🔴기호만 쓴다(2026-08-26 결정).
  //
  //  채널을 알기 전에는 홈페이지에서 고른 언어로 말하는 화면이다. 한글 "원"을
  //  붙이면 원화로 결제하는데 영어로 보는 사람이 "12,000원"을 보게 된다.
  //
  //  🔴금액에는 손대지 않는다 — **실제로 청구되는 금액**이다. 환산하지 않고,
  //    자릿수 처리도 통화마다 그대로 둔다(KRW는 정수 원 단위, USD는 센트 단위로
  //    저장돼 있어 나누는 방식이 다르다).
  //  🔴이 함수는 app/account/page.tsx 에도 **똑같은 것**이 복제돼 있다.
  //    한쪽만 고치면 /account 와 /subscribe 가 다른 말을 한다 — 반드시 함께 고칠 것.
  // ========================================================================
  const money = (n: number, cur: string) =>
    cur === "KRW" ? `₩${n.toLocaleString()}` : `$${(n / 100).toFixed(2)}`;

  if (fatal) return <Card><p style={{ fontWeight: 600, marginBottom: 8 }}>{x.fatalTitle}</p><p style={{ fontSize: "0.82rem", color: "#888", lineHeight: 1.6 }}>{fatal}</p></Card>;
  if (done)
    return (
      <Card>
        <p style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: 10 }}>{x.doneTitle}</p>
        <p style={{ fontSize: "0.82rem", color: "#666", lineHeight: 1.7, marginBottom: 18 }}>
          {x.doneBody}
        </p>
        {/* 🔴홈 가격표에서 들어온 사람은 팝업이 아니라 같은 탭이다(2026-09-11) — 그때
              window.close() 는 아무 일도 안 한다. 창을 연 쪽이 있을 때만 닫고, 아니면
              내 구독 화면으로 보낸다(해지 단추도 거기 있다). */}
        <button
          className="pay-btn"
          onClick={() => { if (window.opener) window.close(); else window.location.href = "/account"; }}
        >
          {typeof window !== "undefined" && window.opener ? x.close : x.toAccount}
        </button>
      </Card>
    );
  if (!info) return <Card><p style={{ fontSize: "0.88rem", color: "#888" }}>{x.loading}</p></Card>;

  return (
    <Card>
      <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 4 }}>
        {info.product === "all" ? info.productLabel : `${info.productLabel} ${info.planLabel}`}
      </h1>

      {/* 🔴테스트 채널이 도는 동안에는 반드시 밝힌다(2026-09-11, PG 심사 기간).
            숨기면 테스트 카드로 "결제"한 사람이 돈을 냈다고 믿는다. */}
      {USE_TEST_CHANNELS && <div className="test-note">{x.testNotice}</div>}

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
        {/* 🔴부가세도 구독료와 같은 통화로 그린다(2026-08-26). 예전엔 이 줄만
              달러였고 기호조차 없어서, 원화 결제자에게 "₩8,234 / 0.50"으로 떴다. */}
        {info.vat > 0 && <Row label={x.vat} value={money(info.vat, info.vatCurrency)} />}

      </div>


      {/* 계정 — 보여주기만 한다(로그인 계정과 어긋나면 안 되므로 입력받지 않는다) */}
      <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 12px", background: "#f8f8f8", borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: "0.78rem", color: "#666" }}>{x.account}</span>
        <span style={{ fontSize: "0.78rem", color: "#1a1a1a" }}>{info.email || "—"}</span>
      </div>


      {/* 국내(KG이니시스) 구매자 정보 — 🔴이니시스가 결제창(PC)과 매달 청구 모두 필수로
            받는다. 해외(엑심베이)는 받지 않는다 — 필요 없는 개인정보를 모으지 않는다. */}
      {isKrw && (
        <div className="buyer">
          <label>
            <span>{x.buyerName}</span>
            <input
              className="buyer-input" type="text" autoComplete="name" maxLength={40}
              value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
            />
          </label>
          <label>
            <span>{x.buyerPhone}</span>
            <input
              className="buyer-input" type="tel" inputMode="numeric" autoComplete="tel"
              placeholder="010-1234-5678" maxLength={13}
              value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value)}
            />
          </label>
          <p className="buyer-hint">{x.buyerHint}</p>
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
            {trPick(lang, t).terms.sections.map((sec, i) => (
              <section key={i}>
                <h4>{sec.title}</h4>
                {"body" in sec && sec.body && <p>{sec.body}</p>}
                {"list" in sec && sec.list && (
                  <ul>{sec.list.map((li, j) => <li key={j}>{li}</li>)}</ul>
                )}
                {"body2" in sec && sec.body2 && <p>{sec.body2}</p>}
              </section>
            ))}
            <p className="terms-eff">{trPick(lang, t).terms.effectiveDate}</p>
          </div>
        )}
        {termsOpen && (
          <a className="terms-more" href="/policy/terms-and-policy" target="_blank" rel="noreferrer">
            {x.termsMore}
          </a>
        )}

        {error && <div style={{ fontSize: "0.78rem", color: "#e53e3e", marginTop: 10 }}>{error}</div>}

        <button className="pay-btn" type="submit" disabled={loading || !agreed}>
          {loading ? x.processing : fmt(x.payNow, { amt: money(info.amount, info.currency) })}
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
        .test-note { font-size:0.74rem; font-weight:600; color:#8a5810; background:#fbf1de; border-radius:8px; padding:9px 12px; margin:10px 0 14px; }
        .buyer { display:flex; flex-direction:column; gap:8px; margin-bottom:16px; }
        .buyer label { display:flex; flex-direction:column; gap:4px; }
        .buyer label span { font-size:0.74rem; color:#666; }
        .buyer-input { width:100%; padding:10px 12px; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.86rem; font-family:inherit; color:#1a1a1a; background:#fff; }
        .buyer-input:focus { outline:none; border-color:#1a1a1a; }
        .buyer-hint { font-size:0.7rem; color:#999; line-height:1.6; }
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
