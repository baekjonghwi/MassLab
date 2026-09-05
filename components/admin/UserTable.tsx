"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PRODUCT_COLOR, PRODUCT_LABEL, type UserPage, type UserRow } from "@/lib/admin-data";
import { countryName, flagOf } from "@/lib/admin-geo";

// ==========================================================================
//  사용자 표 — 검색·거르기·정렬·쪽나눔.
//
//  🔴세는 일은 전부 DB 가 한다(/api/admin/users → admin_user_rows). 825행을
//    통째로 받아 브라우저에서 거르면 지금은 되지만 나중에 안 된다.
//  🔴첫 쪽은 서버가 이미 그려서 넘겨준다(initial) — 화면이 빈 채로 뜨지 않게.
//    그 뒤로 조건이 바뀔 때만 부른다.
//  🔴이메일은 서버에서 이미 가려져 온다. 여기서 되돌릴 방법이 없다(그게 맞다).
// ==========================================================================

const PAGE = 25;
const KO = (n: number) => n.toLocaleString("ko-KR");

const ACTIVE_OPTS: [string, string][] = [
  ["", "활동 전체"],
  ["d1", "24시간 안"],
  ["d7", "7일 안"],
  ["d30", "30일 안"],
  ["never", "활동 없음"],
];

const COLS: { key: string; label: string; sortable: boolean; num?: boolean }[] = [
  { key: "name", label: "사용자", sortable: true },
  { key: "country", label: "국가", sortable: true },
  { key: "last_active", label: "최근 활동", sortable: true },
  { key: "product", label: "쓰는 프로그램", sortable: false },
  { key: "events", label: "활동", sortable: true, num: true },
  { key: "credits", label: "크레딧", sortable: true, num: true },
  { key: "created_at", label: "가입일", sortable: true },
  { key: "plan", label: "등급", sortable: true },
];

function since(iso: string | null): string {
  if (!iso) return "—";
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "방금";
  if (m < 60) return `${m}분 전`;
  if (m < 1440) return `${Math.floor(m / 60)}시간 전`;
  const d = Math.floor(m / 1440);
  return d < 30 ? `${d}일 전` : `${Math.floor(d / 30)}개월 전`;
}

export default function UserTable({
  initial,
  countries,
  plans,
}: {
  initial: UserPage;
  countries: { code: string; n: number }[];
  plans: { plan: string; n: number }[];
}) {
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [plan, setPlan] = useState("");
  const [product, setProduct] = useState("");
  const [active, setActive] = useState("");
  const [sort, setSort] = useState("created_at");
  const [dir, setDir] = useState("desc");
  const [page, setPage] = useState(0);

  const [data, setData] = useState<UserPage>(initial);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  // 첫 그림에서는 서버가 준 것을 그대로 쓴다 — 같은 것을 두 번 불러오지 않게.
  const first = useRef(true);
  // 늦게 도착한 옛 응답이 새 응답을 덮어쓰는 것을 막는다.
  const seq = useRef(0);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (country) p.set("country", country);
    if (plan) p.set("plan", plan);
    if (product) p.set("product", product);
    if (active) p.set("active", active);
    p.set("sort", sort);
    p.set("dir", dir);
    return p;
  }, [q, country, plan, product, active, sort, dir]);

  const load = useCallback(async () => {
    const mine = ++seq.current;
    setBusy(true);
    setFailed(false);
    try {
      const p = new URLSearchParams(params);
      p.set("limit", String(PAGE));
      p.set("offset", String(page * PAGE));
      const r = await fetch(`/api/admin/users?${p}`, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const j = (await r.json()) as UserPage;
      if (mine === seq.current) setData(j);
    } catch {
      if (mine === seq.current) setFailed(true);
    } finally {
      if (mine === seq.current) setBusy(false);
    }
  }, [params, page]);

  // 검색어는 한 글자마다 부르지 않는다 — 250ms 쉬면 그때 간다.
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [load]);

  // 조건이 바뀌면 첫 쪽으로. 3쪽을 보다가 거르면 빈 화면이 뜬다.
  useEffect(() => setPage(0), [q, country, plan, product, active, sort, dir]);

  const pages = Math.max(1, Math.ceil(data.total / PAGE));

  function toggleSort(key: string) {
    if (sort === key) setDir((d) => (d === "desc" ? "asc" : "desc"));
    else {
      setSort(key);
      setDir("desc");
    }
  }

  return (
    <div className="adm-card">
      <header>
        <h3 className="t-title" style={{ margin: 0 }}>사용자</h3>
        <span className="adm-chip tnum">{KO(data.total)}명</span>
        <div className="spacer" />
        <a className="adm-btn ghost" href={`/api/admin/users?${params}&format=csv`}
           style={{ textDecoration: "none", display: "inline-block" }}>
          CSV 내려받기
        </a>
      </header>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--s-xs)", marginBottom: "var(--s-md)" }}>
        <input
          className="adm-field"
          style={{ flex: "1 1 240px", minWidth: 180 }}
          placeholder="닉네임 · 이메일 · 국가코드로 찾기"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="사용자 검색"
        />
        <select className="adm-field" value={active} onChange={(e) => setActive(e.target.value)} aria-label="활동 시점">
          {ACTIVE_OPTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <select className="adm-field" value={product} onChange={(e) => setProduct(e.target.value)} aria-label="프로그램">
          <option value="">프로그램 전체</option>
          {Object.entries(PRODUCT_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
        <select className="adm-field" value={country} onChange={(e) => setCountry(e.target.value)} aria-label="국가">
          <option value="">국가 전체</option>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>{countryName(c.code)} ({c.n})</option>
          ))}
        </select>
        <select className="adm-field" value={plan} onChange={(e) => setPlan(e.target.value)} aria-label="등급">
          <option value="">등급 전체</option>
          {plans.map((p) => <option key={p.plan} value={p.plan}>{p.plan} ({p.n})</option>)}
        </select>
      </div>

      <div className="adm-tablewrap" style={{ opacity: busy ? 0.55 : 1, transition: "opacity .15s" }}>
        <table className="adm-table">
          <thead>
            <tr>
              {COLS.map((c) => (
                <th key={c.key} style={c.num ? { textAlign: "right" } : undefined}>
                  {c.sortable ? (
                    <button onClick={() => toggleSort(c.key)} data-on={sort === c.key ? "1" : "0"}
                            aria-label={`${c.label} 기준 정렬`}>
                      {c.label}{sort === c.key ? (dir === "desc" ? " ↓" : " ↑") : " ↕"}
                    </button>
                  ) : c.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r: UserRow) => (
              <tr key={r.id}>
                <td>
                  <div className="strong">{r.name || <span className="muted">이름 없음</span>}</div>
                  <div className="t-micro">{r.email}</div>
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  {r.country
                    ? <><span aria-hidden>{flagOf(r.country)}</span> {countryName(r.country)}</>
                    : <span className="muted">—</span>}
                </td>
                <td style={{ whiteSpace: "nowrap" }} className={r.last_active ? "" : "muted"}>{since(r.last_active)}</td>
                <td>
                  <span style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {r.products.length === 0 && <span className="muted">—</span>}
                    {r.products.map((p) => (
                      <span key={p} className="adm-chip">
                        <span className="adm-dot" style={{ background: PRODUCT_COLOR[p] ?? "var(--ink-48)" }} aria-hidden />
                        {PRODUCT_LABEL[p] ?? p}
                      </span>
                    ))}
                  </span>
                </td>
                <td className="num" style={{ textAlign: "right" }}>{KO(r.events)}</td>
                <td className="num" style={{ textAlign: "right" }}>{KO(r.credits_used)}</td>
                <td className="num" style={{ whiteSpace: "nowrap" }}>{r.created_at.slice(0, 10)}</td>
                <td><span className="adm-chip">{r.plan}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {failed && <p className="adm-empty" style={{ marginTop: "var(--s-md)" }}>불러오지 못했다. 조건을 바꾸거나 새로고침할 것.</p>}
        {!failed && data.rows.length === 0 && <p className="adm-empty" style={{ marginTop: "var(--s-md)" }}>조건에 맞는 사람이 없다.</p>}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "var(--s-sm)", marginTop: "var(--s-md)" }}>
        <span className="t-cap tnum">
          {KO(data.total === 0 ? 0 : page * PAGE + 1)}–{KO(Math.min((page + 1) * PAGE, data.total))} / {KO(data.total)}
        </span>
        <div className="spacer" style={{ flex: 1 }} />
        <button className="adm-btn ghost" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0 || busy}>이전</button>
        <span className="t-cap tnum">{page + 1} / {pages}</span>
        <button className="adm-btn ghost" onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1 || busy}>다음</button>
      </div>
    </div>
  );
}
