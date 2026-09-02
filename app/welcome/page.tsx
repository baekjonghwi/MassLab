"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { supabase, safeNext } from "@/lib/supabase";
import { AuthCard, AuthShell, CountryField } from "@/components/AuthCard";
import { isCountryCode } from "@/lib/countries";
import { useTx } from "@/lib/i18n";

// ==========================================================================
//  /welcome — 가입 직후 딱 한 번, 거주 국가만 묻는다(2026-09-02).
//
//  🔴이 화면이 있는 이유는 **구글 하나** 때문이다. 이메일 가입은 폼에서 이미
//    받았고(그 값은 DB 가입 트리거가 적는다), 구글은 우리에게 거주지를 알려
//    주지 않는다. 가입 탭에서 구글을 누른 사람은 /login 이 국가를 먼저 받지만,
//    **로그인 탭에서 구글을 눌러 계정이 새로 만들어진 사람**은 폼을 한 번도
//    안 지난다 — 그 한 갈래를 여기서 메운다.
//
//  🔴여기로 보내는 판정은 /auth/callback 이 한다(방금 만들어진 계정 + country 없음).
//    그러니 이 화면은 "이미 값이 있으면 즉시 지나간다"만 지키면 된다.
//
//  🔴막다른 길이 아니다 — 세션은 이미 살아 있고, 창을 닫아도 로그인은 끝나 있다.
//    그 경우 국가는 예전처럼 첫 결제가 채운다. 그래서 여기서 겁주지 않는다.
//
//  ⚠️이 주소는 archiMap 앱 안 iframe·구글 팝업 안에서도 뜬다(로그인 화면과 같은
//    자리다). AuthShell 을 쓰는 이유가 그것이다 — 방금 지나온 화면과 같은 상자여야
//    "딴 데로 튕겼다"로 안 읽힌다.
// ==========================================================================

const TX = {
  ko: {
    title: "어디에 살고 계신가요?",
    // 🔴왜 묻는지 한 줄로 말한다. 이유 없이 개인정보를 물으면 사람은 멈춘다.
    why: "결제 통화와 세금 처리를 정하는 데 씁니다. 나중에 바꿀 수 있습니다.",
    country: "거주 국가", countryPick: "국가를 선택하세요",
    need: "국가를 선택하세요.",
    save: "계속", busy: "처리 중…",
    later: "나중에 하기",
    failed: "저장하지 못했습니다. 잠시 후 다시 시도해 주세요.",
  },
  en: {
    title: "Where do you live?",
    why: "We use it to set your billing currency and tax handling. You can change it later.",
    country: "Country", countryPick: "Select your country",
    need: "Please select your country.",
    save: "Continue", busy: "Working…",
    later: "Skip for now",
    failed: "Couldn't save that. Please try again in a moment.",
  },
};

function WelcomeContent() {
  const sp = useSearchParams();
  const next = safeNext(sp.get("next") ?? "/");
  const x = useTx(TX);

  const [country, setCountry] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  const go = () => { window.location.href = next; };

  // 🔴들어오자마자 두 가지를 확인한다.
  //   ① 로그인이 아니면 여기 있을 이유가 없다 → 로그인으로.
  //   ② 이미 국가를 아는 사람이면 묻지 않고 지나간다(뒤로가기로 다시 들어온 경우).
  useEffect(() => {
    let alive = true;
    (async () => {
      const sb = supabase();
      const { data: { user } } = await sb.auth.getUser();
      if (!alive) return;
      if (!user) { window.location.href = `/login?next=${encodeURIComponent(next)}`; return; }
      const { data: prof } = await sb
        .from("profiles").select("country").eq("id", user.id).maybeSingle();
      if (!alive) return;
      if (prof?.country) { go(); return; }
      setReady(true);
    })().catch(() => { if (alive) setReady(true); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCountryCode(country)) { setError(x.need); return; }
    setBusy(true); setError("");
    // 🔴쓰기는 set_country RPC 한 곳으로만 한다(supabase/2026-09-02_signup_country.sql).
    //   표를 직접 update 하면 모양 검사가 화면마다 따로 있게 된다.
    const { error: err } = await supabase().rpc("set_country", {
      p_country: country, p_only_if_empty: true,
    });
    if (err) {
      console.error("국가 저장 실패:", err);
      setError(x.failed); setBusy(false); return;
    }
    go();
  };

  return (
    <AuthShell>
      <AuthCard>
        {!ready ? (
          <p style={{ fontSize: "0.88rem", color: "#888", margin: 0 }}>Loading...</p>
        ) : (
          <>
            <h1 style={{ fontSize: "1.3rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6 }}>
              {x.title}
            </h1>
            <p className="hint" style={{ marginTop: 0, marginBottom: 20 }}>{x.why}</p>

            <form onSubmit={submit}>
              <CountryField
                label={x.country} placeholder={x.countryPick}
                value={country} onChange={(v) => { setCountry(v); setError(""); }}
                disabled={busy}
              />
              {error && <div className="msg err">{error}</div>}
              <button className="main-btn" type="submit" disabled={busy}>
                {busy ? x.busy : x.save}
              </button>
            </form>

            {/* 🔴빠져나갈 길을 둔다 — 로그인은 이미 끝났는데 여기서 붙잡으면 갇힌 화면이 된다.
                안 고르고 지나가면 예전처럼 첫 결제가 국가를 채운다. */}
            <div style={{ textAlign: "center", marginTop: 16 }}>
              <button
                type="button" onClick={go} disabled={busy}
                style={{
                  background: "none", border: "none", padding: 0, cursor: "pointer",
                  font: "inherit", fontSize: "0.76rem", color: "#8a8a86",
                }}
              >
                {x.later}
              </button>
            </div>
          </>
        )}
      </AuthCard>
    </AuthShell>
  );
}

// useSearchParams 는 Suspense 안에서만 읽을 수 있다(/login 과 같은 짜임).
export default function WelcomePage() {
  return (
    <Suspense fallback={
      <AuthShell>
        <AuthCard><p style={{ fontSize: "0.88rem", color: "#888", margin: 0 }}>Loading...</p></AuthCard>
      </AuthShell>
    }>
      <WelcomeContent />
    </Suspense>
  );
}
