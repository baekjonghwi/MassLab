import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { fetchCreditStats, fetchOverview, fetchUsers, PRODUCT_LABEL } from "@/lib/admin-data";
import GrowthChart from "@/components/admin/GrowthChart";
import UseTrend from "@/components/admin/UseTrend";
import CreditPanel from "@/components/admin/CreditPanel";
import WorldPanel from "@/components/admin/WorldPanel";
import UserTable from "@/components/admin/UserTable";
import { ActivityPanel, PlanPanel, ProductPanel, ReviewsPanel } from "@/components/admin/Panels";

// ==========================================================================
//  /admin — 운영 현황.
//
//  🔴이 화면의 규칙 하나: **없는 것을 지어내지 않는다.**
//    목업에 있던 "실시간 접속자 26명"·"세션 평균 체류 63.6분"은 우리 DB 에
//    근거가 없다(세션 계측이 없다). 그 자리를 그럴듯한 숫자로 채우면 화면이
//    아니라 소설이 된다 — 대신 **남은 흔적**으로 잴 수 있는 것만 잰다:
//    · 실시간 접속 → 최근 24시간·7일에 흔적을 남긴 사람 수
//    · 체류시간   → 사람당 활동 건수
//    무엇을 활동으로 치는지는 supabase/migrations/011_admin_dashboard.sql 의
//    admin_activity 뷰 한 곳에 적혀 있다.
//    🔴나중에 진짜 ping 계측을 붙이면 그 뷰에 한 줄 더하면 된다 — 이 화면은 그대로다.
//
//  🔴들어올 수 있는 사람: profiles.plan = 'admin'. 아니면 **404** 다
//    (403 은 "여기 뭔가 있다"고 알려 주는 꼴이다).
//
//  ⚠️번역하지 않는다. 보는 사람이 우리뿐이라 i18n 을 안 태운다.
// ==========================================================================

export const dynamic = "force-dynamic";

const KO = (n: number) => n.toLocaleString("ko-KR");

function pct(a: number, b: number): string {
  if (!b) return "—";
  const v = Math.round(((a - b) / b) * 100);
  return `${v >= 0 ? "+" : ""}${v}%`;
}

function Kpi({
  label, value, unit, foot, chip,
}: {
  label: string; value: string; unit?: string; foot: React.ReactNode; chip?: string;
}) {
  return (
    <div className="adm-card adm-kpi">
      <div className="label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span>{label}</span>
        {chip && <><span style={{ flex: 1 }} /><span className="adm-chip">{chip}</span></>}
      </div>
      <div className="value">
        <span className="t-num tnum">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      <div className="foot">{foot}</div>
    </div>
  );
}

export default async function AdminPage() {
  const gate = await requireAdmin();
  // 🔴로그인만 안 한 사람은 되돌릴 수 있다 — 로그인 화면으로 보내고 next 로 다시 데려온다.
  //   ⚠️404 로 뭉뚱그리면 새 기기·시크릿창에서 들어온 운영자가 길을 잃는다.
  if (!gate.ok && !gate.signedIn) redirect("/login?next=/admin");
  // 🔴로그인은 했는데 관리자가 아니면 **404** 다. 여기서 403 을 주면 "권한만
  //   있으면 되는 곳"이라고 알려 주는 꼴이라, 남에게는 없는 화면으로 둔다.
  if (!gate.ok) notFound();
  const who = gate;

  let o, users, credits;
  try {
    [o, users, credits] = await Promise.all([
      fetchOverview(),
      fetchUsers({ limit: 25 }),
      fetchCreditStats(),
    ]);
  } catch {
    return (
      <>
        <nav className="adm-nav"><span className="strong">MassLabs 운영</span></nav>
        <div className="adm-page">
          <p className="adm-empty">
            데이터를 불러오지 못했다. <code>SUPABASE_SERVICE_ROLE_KEY</code> 가 있는지,
            <code>supabase/migrations/011_admin_dashboard.sql</code> 이 적용됐는지 볼 것.
          </p>
        </div>
      </>
    );
  }

  const top = o.products[0];
  const activeShare = o.totals.users ? Math.round((o.active.d7 / o.totals.users) * 100) : 0;
  const prodShare =
    top && o.active.d7 ? Math.round((top.users7 / o.active.d7) * 100) : 0;

  return (
    <>
      <nav className="adm-nav">
        <span className="strong">MassLabs 운영</span>
        <Link href="/">홈</Link>
        <Link href="/review">후기</Link>
        <span className="spacer" />
        <span className="who">{who.email}</span>
      </nav>

      <div className="adm-page">
        <div className="adm-head">
          <h1 className="t-hero" style={{ margin: 0 }}>운영 현황</h1>
          <span className="sub">
            {new Date(o.generated_at).toLocaleString("ko-KR", { dateStyle: "long", timeStyle: "short" })} 기준
          </span>
        </div>

        {/* ── 지표 넷 ─────────────────────────────────────────────── */}
        <div className="adm-grid k4">
          <Kpi
            label="가입자"
            value={KO(o.totals.users)}
            unit="명"
            chip={`오늘 +${KO(o.signups.today)}`}
            foot={<>최근 7일 <span className="strong tnum">+{KO(o.signups.last7)}명</span> · 그 전 7일 대비 {pct(o.signups.last7, o.signups.prev7)}</>}
          />
          <Kpi
            label="활성 사용자(7일 이내 접속자)"
            value={KO(o.active.d7)}
            unit="명"
            chip={`전체의 ${activeShare}%`}
            foot={<>24시간 안 <span className="strong tnum">{KO(o.active.d1)}명</span> · 30일 안 {KO(o.active.d30)}명</>}
          />
          <Kpi
            label="오늘 활동"
            value={KO(o.active.events_today)}
            unit="건"
            foot={<>최근 7일 <span className="strong tnum">{KO(o.active.events7)}건</span> · 한 번이라도 쓴 사람 {KO(o.active.ever)}명</>}
          />
          <Kpi
            label="주력 프로그램"
            value={top ? (PRODUCT_LABEL[top.key] ?? top.key) : "—"}
            chip={top ? `점유 ${prodShare}%` : undefined}
            foot={top ? <>7일 활성 <span className="strong tnum">{KO(top.users7)}명</span> · 활동 {KO(top.events7)}건</> : "활동 기록 없음"}
          />
        </div>

        {/* ── 지도 ────────────────────────────────────────────────── */}
        <section className="adm-sec">
          <h2>국가별 분포</h2>
          <div className="adm-grid">
            <WorldPanel
              countries={o.countries}
              unknown={o.totals.users - o.totals.with_country}
            />
          </div>
        </section>

        {/* ── 성장 ────────────────────────────────────────────────── */}
        <section className="adm-sec">
          <h2>이용자수</h2>
          <div className="adm-grid k2">
            <GrowthChart daily={o.daily} weekly={o.weekly} monthly={o.monthly} signups={o.signups} />
            <ProductPanel o={o} />
          </div>
          <div className="adm-grid" style={{ marginTop: "var(--s-md)" }}>
            <UseTrend daily={o.use_daily} monthly={o.use_monthly} />
          </div>
        </section>

        {/* ── 쓰임새 ──────────────────────────────────────────────── */}
        <section className="adm-sec">
          <h2>분포</h2>
          <div className="adm-grid k3">
            <CreditPanel c={credits} />
            <ActivityPanel o={o} />
            <PlanPanel o={o} />
          </div>
        </section>

        {/* ── 사람 ────────────────────────────────────────────────── */}
        <section className="adm-sec">
          <h2>사용자</h2>
          <UserTable
            initial={users}
            countries={o.countries.map(({ code, n }) => ({ code, n }))}
            plans={o.plans}
          />
        </section>

        {/* ── 후기 · 기기 ─────────────────────────────────────────── */}
        <section className="adm-sec">
          <h2>리뷰</h2>
          <ReviewsPanel o={o} />
        </section>
      </div>
    </>
  );
}
