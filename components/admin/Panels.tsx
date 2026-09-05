import type { Overview } from "@/lib/admin-data";
import { PRODUCT_COLOR, PRODUCT_LABEL } from "@/lib/admin-data";

// ==========================================================================
//  /admin 의 작은 판들 — 제품별 활동 · 활동량 분포 · 등급 분포 · 후기.
//  모두 서버에서 그린다(움직이는 곳이 없다).
//
//  🔴막대에는 **언제나 숫자와 이름을 함께** 적는다. 제품 색 중 aqua(LaserFish)는
//    흰 바닥 대비 2.82:1 이라 색만으로는 구분이 안 서는 사람이 있다.
// ==========================================================================

const KO = (n: number) => n.toLocaleString("ko-KR");

function since(iso: string | null): string {
  if (!iso) return "기록 없음";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return d < 30 ? `${d}일 전` : `${Math.floor(d / 30)}개월 전`;
}

// --------------------------------------------------------------------------
//  제품별 활동
// --------------------------------------------------------------------------
export function ProductPanel({ o }: { o: Overview }) {
  const max = Math.max(1, ...o.products.map((p) => p.users));

  return (
    <div className="adm-card">
      <header>
        <h3 className="t-title" style={{ margin: 0 }}>프로그램별 활동</h3>
        <div className="spacer" />
        <span className="t-cap">최근 7일 / 전체</span>
      </header>

      <div style={{ display: "grid", gap: "var(--s-md)" }}>
        {o.products.map((p) => {
          const color = PRODUCT_COLOR[p.key] ?? "var(--ink-48)";
          return (
            <div key={p.key}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                <span className="adm-dot" style={{ background: color }} aria-hidden />
                <span className="strong" style={{ fontSize: 14 }}>{PRODUCT_LABEL[p.key] ?? p.key}</span>
                <span className="spacer" style={{ flex: 1 }} />
                <span className="tnum strong" style={{ fontSize: 16 }}>{KO(p.users7)}명</span>
                <span className="t-cap tnum">/ 누적 {KO(p.users)}명</span>
              </div>

              {/* 진한 부분 = 7일 활성, 연한 부분 = 누적. 같은 자에 겹쳐 잰다 */}
              <div style={{ height: 10, borderRadius: 5, background: "var(--divider)", overflow: "hidden" }}>
                <div style={{ height: 10, borderRadius: 5, width: `${(p.users / max) * 100}%`, background: color, opacity: 0.28 }}>
                  <div style={{ height: 10, borderRadius: 5, width: p.users ? `${(p.users7 / p.users) * 100}%` : 0, background: color }} />
                </div>
              </div>

              <p className="t-cap" style={{ margin: "6px 0 0" }}>
                7일 활동 {KO(p.events7)}건 · 누적 {KO(p.events)}건 · 마지막 {since(p.last_at)}
              </p>
            </div>
          );
        })}
      </div>

      {/* 🔴사람에 못 붙는 활동 — 숨기지 않고 따로 적는다. 위 숫자에 안 섞였다. */}
      <p className="t-cap" style={{ margin: "var(--s-md) 0 0", paddingTop: "var(--s-sm)", borderTop: "1px solid var(--divider)" }}>
        계정에 안 붙는 흔적(위 수치에 포함되지 않음) — LaserFish 도면{" "}
        {KO(o.anon_activity.laserfish_cuts)}건(7일 {KO(o.anon_activity.laserfish_cuts7)}) ·
        Colorgram 공개 팔레트 {KO(o.anon_activity.colorgram_palettes)}개
      </p>
    </div>
  );
}

// --------------------------------------------------------------------------
//  활동량 분포 — 목업의 "체류시간 히스토그램" 자리
// --------------------------------------------------------------------------
export function ActivityPanel({ o }: { o: Overview }) {
  const max = Math.max(1, ...o.activity_buckets.map((b) => b.n));
  const total = o.activity_buckets.reduce((s, b) => s + b.n, 0);
  const idle = o.activity_buckets[0]?.n ?? 0;

  return (
    <div className="adm-card">
      <header>
        <h3 className="t-title" style={{ margin: 0 }}>사용건수</h3>
        <div className="spacer" />
        <span className="adm-chip">한 번도 안 쓴 계정 {total ? Math.round((idle / total) * 100) : 0}%</span>
      </header>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "var(--s-sm)", height: 150 }}>
        {o.activity_buckets.map((b) => (
          <div key={b.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
            <span className="tnum strong" style={{ fontSize: 13 }}>{KO(b.n)}</span>
            <div
              style={{
                width: "100%",
                height: `${Math.max(b.n > 0 ? 2 : 0, (b.n / max) * 100)}%`,
                background: "var(--primary)",
                opacity: b.label === "0건" ? 0.3 : 0.9,
                borderRadius: "4px 4px 0 0",
              }}
            />
            <span className="t-cap" style={{ whiteSpace: "nowrap" }}>{b.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------
//  등급 분포
// --------------------------------------------------------------------------
const PLAN_LABEL: Record<string, string> = {
  free: "FREE", plus: "PLUS", pro: "PRO", max: "MAX", admin: "운영자",
};

export function PlanPanel({ o }: { o: Overview }) {
  const total = Math.max(1, o.totals.users);

  return (
    <div className="adm-card">
      <header>
        <h3 className="t-title" style={{ margin: 0 }}>등급 분포</h3>
        <div className="spacer" />
        <span className="t-cap">DB 에 적힌 값</span>
      </header>

      <div style={{ display: "grid", gap: "var(--s-sm)" }}>
        {o.plans.map((p) => (
          <div key={p.plan} style={{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: "var(--s-xs)", alignItems: "center" }}>
            <span className="t-cap strong">{PLAN_LABEL[p.plan] ?? p.plan}</span>
            <span style={{ height: 8, borderRadius: 4, background: "var(--divider)" }}>
              <span style={{ display: "block", height: 8, borderRadius: 4, width: `${(p.n / total) * 100}%`, background: "var(--primary)" }} />
            </span>
            <span className="tnum" style={{ fontSize: 13 }}>{KO(p.n)}명</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// --------------------------------------------------------------------------
//  후기
// --------------------------------------------------------------------------
export function ReviewsPanel({ o }: { o: Overview }) {
  return (
    <div className="adm-card">
      <header>
        <h3 className="t-title" style={{ margin: 0 }}>후기</h3>
        <div className="spacer" />
        <a href="/review" className="t-cap" style={{ color: "var(--primary)" }}>공개 화면 →</a>
      </header>

      {o.reviews.length === 0 ? (
        <p className="adm-empty">아직 없다.</p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--s-sm)", maxHeight: 300, overflowY: "auto" }}>
          {o.reviews.map((r) => (
            <li key={r.id} style={{ padding: "var(--s-sm)", background: "var(--pearl)", borderRadius: "var(--r-md)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span className="adm-dot" style={{ background: PRODUCT_COLOR[r.product] ?? "var(--ink-48)" }} aria-hidden />
                <span className="t-cap strong" style={{ color: "var(--ink-80)" }}>{PRODUCT_LABEL[r.product] ?? r.product}</span>
                {r.rating != null && <span className="t-cap">{"★".repeat(r.rating)}<span style={{ opacity: 0.3 }}>{"★".repeat(5 - r.rating)}</span></span>}
                <span className="spacer" style={{ flex: 1 }} />
                {r.status !== "visible" && <span className="adm-chip">숨김</span>}
                <span className="t-micro">{r.created_at.slice(0, 10)}</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, lineHeight: 1.5 }}>{r.body}</p>
              <p className="t-micro" style={{ margin: "4px 0 0" }}>{r.nickname}{r.lang ? ` · ${r.lang}` : ""}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
