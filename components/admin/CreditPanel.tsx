import type { CreditStats } from "@/lib/admin-data";
import { PRODUCT_COLOR } from "@/lib/admin-data";

// ==========================================================================
//  크레딧 사용량.
//
//  🔴이 판이 따로 있는 이유 — 크레딧은 **횟수는 있는데 시각이 없다.**
//    다른 지표는 전부 "언제"를 갖고 있어 추이로 그릴 수 있지만, 2026-09-06
//    이전 크레딧은 `profiles.credits_used` 라는 카운터 하나로만 남아 있었다.
//    그래서 여기서는 시각이 없어도 정확한 것만 말한다: 총계 · 사람 수 · 분포.
//
//  🔴🔴그 카운터는 **사라질 값이었다.** consume_credit 이 달이 바뀌면 0으로
//    되돌리는데, 452명 중 credit_period 가 채워진 사람이 3명뿐이라 다음 사용
//    때 통째로 리셋될 판이었다. 2026-09-06에 `profiles.credits_legacy` 로
//    옮겨 얼렸다(supabase/migrations/015). ⛔그 칸을 다시 건드리지 말 것.
//
//  ⚠️분포는 "몇 번 쓴 사람이 몇 명"이다. 시각이 없어도 이건 정확하다.
// ==========================================================================

const KO = (n: number) => n.toLocaleString("ko-KR");

export default function CreditPanel({ c }: { c: CreditStats }) {
  const maxPeople = Math.max(1, ...c.dist.map((d) => d.people));
  const avg = c.people ? (c.total / c.people).toFixed(1) : "0";

  return (
    <div className="adm-card">
      <header>
        <h3 className="t-title" style={{ margin: 0 }}>크레딧 사용량</h3>
        <div className="spacer" />
        <span className="adm-chip">
          <span className="adm-dot" style={{ background: PRODUCT_COLOR.archimap }} aria-hidden />
          archiMap
        </span>
      </header>

      <div className="adm-kpi" style={{ marginBottom: "var(--s-md)" }}>
        <div className="value">
          <span className="t-num tnum">{KO(c.total)}</span>
          <span className="unit">회</span>
        </div>
        <p className="t-cap" style={{ margin: "6px 0 0" }}>
          <span className="strong tnum">{KO(c.people)}명</span>이 사용 · 사람당 평균{" "}
          <span className="tnum">{avg}회</span> · 최다 <span className="tnum">{KO(c.max)}회</span>
        </p>
      </div>

      <div className="t-cap" style={{ marginBottom: 6 }}>몇 번 썼나</div>
      <div style={{ display: "grid", gap: 5 }}>
        {c.dist.map((d) => (
          <div key={d.used} style={{ display: "grid", gridTemplateColumns: "34px 1fr auto", gap: "var(--s-xs)", alignItems: "center" }}>
            <span className="t-cap tnum" style={{ textAlign: "right" }}>{d.used}회</span>
            <span style={{ height: 8, borderRadius: 4, background: "var(--divider)" }}>
              <span style={{
                display: "block", height: 8, borderRadius: 4,
                width: `${(d.people / maxPeople) * 100}%`,
                background: PRODUCT_COLOR.archimap,
              }} />
            </span>
            <span className="tnum" style={{ fontSize: 13 }}>{KO(d.people)}명</span>
          </div>
        ))}
      </div>

      {/* 🔴총계가 두 조각이라는 것을 밝힌다. 앞 조각은 날짜 그래프에 못 오른다. */}
      <p className="t-cap" style={{ margin: "var(--s-md) 0 0", paddingTop: "var(--s-sm)", borderTop: "1px solid var(--divider)" }}>
        이 중 <span className="strong tnum">{KO(c.legacy_total)}회</span>는 시각이 없다 —
        건별 기록을 <span className="strong">2026-09-06</span>에 시작했고, 그 전에는 사람마다
        횟수 카운터 하나뿐이었다. 기록 이후는{" "}
        <span className="strong tnum">{KO(c.logged_total)}회</span>
        (오늘 {KO(c.logged_today)} · 7일 {KO(c.logged7)})이고, 이 몫만 위 추이 그래프에 오른다.
      </p>
    </div>
  );
}
