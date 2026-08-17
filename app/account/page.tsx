"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

// ==========================================================================
//  /account — 내 구독.
//
//  🔴구독 상태는 my_plan RPC로 묻는다. subscriptions를 직접 세면 'all' 번들
//    구독자가 free로 보인다(번들은 product='all' 행 하나뿐이라서).
// ==========================================================================

type Sub = {
  product: string; plan: string; status: string;
  currency: string; amount: number;
  next_billing_at: string | null; canceled_at: string | null;
};
type Device = {
  id: string; device_name: string | null;
  last_seen_at: string | null; created_at: string;
};

// 🔴구독 상품은 하나뿐이다. 등급(plus/pro/max)이 모든 프로그램에 함께 적용된다.
const PRODUCT = "all";
const TIERS = [
  { key: "plus", label: "PLUS", price: "$4.99", note: "Archimap 1km · 10회/달" },
  { key: "pro",  label: "PRO",  price: "$6.99", note: "Archimap 2km · 15회/달" },
  { key: "max",  label: "MAX",  price: "$9.99", note: "Archimap 3km · 20회/달" },
];

const money = (n: number, cur: string) =>
  cur === "KRW" ? `${n.toLocaleString()}원` : `$${(n / 100).toFixed(2)}`;
const day = (s: string | null) =>
  s ? new Date(s).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" }) : "—";

export default function AccountPage() {
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [subs, setSubs] = useState<Sub[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const sb = supabase();
    const { data: u } = await sb.auth.getUser();
    if (!u.user) { window.location.href = `/login?next=${encodeURIComponent("/account")}`; return; }
    setEmail(u.user.email ?? "");

    const [{ data: p }, { data: rows }, { data: sess }] = await Promise.all([
      sb.rpc("my_plan", { p_product: PRODUCT }),
      sb.from("subscriptions").select("*"),
      sb.auth.getSession(),
    ]);
    setPlan(typeof p === "string" ? p : "free");
    setSubs((rows ?? []) as Sub[]);

    const token = sess.session?.access_token;
    if (token) {
      const r = await fetch("/api/devices", { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) setDevices(((await r.json()) as { devices: Device[] }).devices);
    }
    setReady(true);
  }, []);

  useEffect(() => { load(); }, [load]);

  const token = async () => (await supabase().auth.getSession()).data.session?.access_token ?? "";

  const startSub = async (plan: string) => {
    setBusy(plan); setError("");
    const r = await fetch("/api/subscribe/start", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ product: PRODUCT, plan }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) {
      setError(d.error === "bundle_active"
        ? "이미 전체 구독 중이라 따로 결제하실 필요가 없습니다."
        : "결제 창을 열지 못했습니다.");
      return;
    }
    window.location.href = d.url;
  };

  const cancel = async (product: string) => {
    if (!confirm("구독을 해지하시겠습니까?\n이미 결제하신 기간까지는 그대로 사용하실 수 있습니다.")) return;
    setBusy(product); setError("");
    const r = await fetch("/api/subscribe/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${await token()}` },
      body: JSON.stringify({ product }),
    });
    setBusy("");
    if (!r.ok) { setError("해지에 실패했습니다."); return; }
    load();
  };

  const unlink = async (id: string) => {
    setBusy(id);
    await fetch(`/api/devices?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${await token()}` },
    });
    setBusy("");
    load();
  };

  if (!ready) return <Shell><p className="dim">불러오는 중…</p></Shell>;

  const sub = subs.find((s) => s.product === PRODUCT);
  const entitled = plan !== "free";

  return (
    <Shell>
      <div className="hd">
        <div>
          <h1 className="ttl">내 구독</h1>
          <p className="sub">{email}</p>
        </div>
        <button className="ghost" onClick={async () => {
          await supabase().auth.signOut();
          window.location.href = "/";
        }}>로그아웃</button>
      </div>

      {error && <div className="err">{error}</div>}

      {/* ── MassLabs 구독 (모든 프로그램 공통) ── */}
      <section className="card">
        <div className="row">
          <div>
            <div className="pname">MassLabs 구독</div>
            <div className="pdesc">Archimap · LaserFish 등 모든 프로그램에 함께 적용됩니다</div>
          </div>
          <span className={`badge${entitled ? " on" : ""}`}>
            {entitled ? plan.toUpperCase() : "미구독"}
          </span>
        </div>

        {sub?.status === "active" && (
          <>
            <Line k="다음 결제일" v={day(sub.next_billing_at)} />
            <Line k="결제 금액" v={money(sub.amount, sub.currency)} />
            <button className="ghost wide" disabled={busy === PRODUCT} onClick={() => cancel(PRODUCT)}>
              {busy === PRODUCT ? "처리 중…" : "구독 해지"}
            </button>
          </>
        )}

        {sub?.status === "canceled" && (
          <>
            <Line k="이용 종료일" v={day(sub.canceled_at)} />
            <p className="note">해지되었습니다. 위 날짜까지는 그대로 사용하실 수 있습니다.</p>
          </>
        )}

        {sub?.status === "past_due" && (
          <p className="note warn">결제에 실패해 이용이 중지되었습니다. 다시 구독해 주세요.</p>
        )}

        {(!sub || sub.status === "past_due" || sub.status === "canceled") && (
          <>
            <div className="tiers">
              {TIERS.map((t) => (
                <button
                  key={t.key}
                  className="tier"
                  disabled={busy === t.key}
                  onClick={() => startSub(t.key)}
                >
                  <span className="tier-name">{t.label}</span>
                  <span className="tier-price">{busy === t.key ? "여는 중…" : t.price}</span>
                  <span className="tier-note">{t.note}</span>
                </button>
              ))}
            </div>
            <p className="note">
              부가세 별도이며 매월 자동 결제됩니다. 해외 결제는 부가세가 붙지 않습니다.
            </p>
          </>
        )}

        {entitled && !sub && (
          <p className="note">운영자 권한으로 모든 프로그램을 이용 중입니다.</p>
        )}
      </section>

      {/* ── 연결된 기기 ── */}
      <section className="card">
        <div className="pname" style={{ marginBottom: 4 }}>연결된 기기</div>
        <p className="pdesc" style={{ marginBottom: 14 }}>
          라이노에서 <code>LaserFishLogin</code> 으로 연결한 기기입니다. 동시 2대까지 사용할 수 있습니다.
        </p>

        {devices.length === 0 && <p className="note">연결된 기기가 없습니다.</p>}

        {devices.map((d) => (
          <div className="dev" key={d.id}>
            <div>
              <div className="dname">{d.device_name || "이름 없는 기기"}</div>
              <div className="dmeta">마지막 사용 {day(d.last_seen_at)}</div>
            </div>
            <button className="ghost sm" disabled={busy === d.id} onClick={() => unlink(d.id)}>
              {busy === d.id ? "…" : "연결 해제"}
            </button>
          </div>
        ))}
      </section>
    </Shell>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return <div className="ln"><span>{k}</span><span>{v}</span></div>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main style={{
      fontFamily: "var(--font-geist-sans), -apple-system, 'Helvetica Neue', sans-serif",
      background: "#f5f5f5", color: "#1a1a1a", minHeight: "100vh", padding: "40px 20px",
    }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .wrap { max-width: 520px; margin: 0 auto; }
        .hd { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:22px; }
        .ttl { font-size:1.5rem; font-weight:800; letter-spacing:-0.03em; }
        .sub { font-size:0.8rem; color:#888; margin-top:4px; }
        .dim { font-size:0.88rem; color:#888; }
        .card { background:#fff; border-radius:14px; padding:22px; margin-bottom:16px; box-shadow:0 2px 12px rgba(0,0,0,0.06); }
        .row { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; margin-bottom:14px; }
        .pname { font-size:1rem; font-weight:700; }
        .pdesc { font-size:0.78rem; color:#999; margin-top:3px; line-height:1.5; }
        .badge { font-size:0.7rem; font-weight:700; padding:4px 10px; border-radius:100px; background:#f0f0f0; color:#999; white-space:nowrap; }
        .badge.on { background:#e6f4ec; color:#2f855a; }
        .ln { display:flex; justify-content:space-between; padding:9px 0; border-top:1px solid #f2f2f2; font-size:0.82rem; }
        .ln span:first-child { color:#777; }
        .tiers { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; padding-top:14px; border-top:1px solid #f2f2f2; }
        .tier { display:flex; flex-direction:column; align-items:center; gap:3px; padding:14px 6px; border:1.5px solid #e0e0e0; border-radius:10px; background:#fff; font-family:inherit; cursor:pointer; transition:all .15s; }
        .tier:hover { border-color:#111; box-shadow:0 2px 10px rgba(0,0,0,0.08); }
        .tier-name { font-size:0.7rem; font-weight:800; letter-spacing:0.06em; color:#888; }
        .tier-price { font-size:1.1rem; font-weight:900; letter-spacing:-0.03em; color:#111; }
        .tier-note { font-size:0.64rem; color:#aaa; text-align:center; line-height:1.4; }
        .note { font-size:0.75rem; color:#999; line-height:1.6; margin-top:8px; }
        .note.warn { color:#c05621; }
        .primary { padding:11px; background:#1a1a1a; color:#fff; border:none; border-radius:8px; font-size:0.88rem; font-weight:600; font-family:inherit; cursor:pointer; }
        .primary:hover { background:#333; }
        .ghost { padding:8px 14px; background:#fff; color:#555; border:1.5px solid #e0e0e0; border-radius:8px; font-size:0.8rem; font-family:inherit; cursor:pointer; }
        .ghost:hover { border-color:#bbb; }
        .ghost.sm { padding:6px 10px; font-size:0.74rem; }
        .wide { width:100%; margin-top:14px; }
        button:disabled { opacity:0.5; cursor:not-allowed; }
        .dev { display:flex; justify-content:space-between; align-items:center; gap:12px; padding:11px 0; border-top:1px solid #f2f2f2; }
        .dname { font-size:0.85rem; font-weight:600; }
        .dmeta { font-size:0.72rem; color:#aaa; margin-top:2px; }
        .err { background:#fff5f5; color:#c53030; font-size:0.8rem; padding:11px 14px; border-radius:8px; margin-bottom:14px; }
        code { background:#f2f2f2; padding:1px 5px; border-radius:4px; font-size:0.92em; }
      `}</style>
      <div className="wrap">{children}</div>
    </main>
  );
}
