"use client";
import { useMemo, useState } from "react";
import type { UsePoint } from "@/lib/admin-data";
import { PRODUCT_COLOR } from "@/lib/admin-data";
import { useMeasure } from "./useMeasure";

// ==========================================================================
//  프로그램별 활동 추이 — 작은 그래프 넷을 같은 x축 위에 쌓는다.
//
//  🔴⛔한 그림에 네 줄을 겹치지 않는다. archiMap 은 하루 200~300건인데
//    Colorgram 은 1~4건이다. 같은 자에 그리면 Colorgram 은 바닥에 붙은 직선이
//    되어 "아무 일도 없다"로 읽힌다 — 실제로는 오르내리는데.
//    ⇒ 줄마다 **제 눈금**을 갖는 작은 그래프로 쪼갠다(small multiples).
//  🔴대신 줄마다 **최댓값을 글자로 적는다.** 눈금이 다르다는 사실을 안 적으면
//    높이를 서로 견주게 되고, 그게 이 방식의 유일한 함정이다.
//
//  🔴크레딧은 archiMap 과 **같은 파랑에 점선**이다. 넷째 색을 새로 들이지 않는
//    이유가 둘이다: ①크레딧은 archiMap 의 일이라 같은 색이 맞다 ②점선은 색이
//    아닌 신호라 색맹에게도 갈린다(제품 색 셋은 이미 검증을 통과한 조합이다).
//
//  🔴archimap 값에는 크레딧이 안 들어 있다(DB 에서 kind <> 'credit' 로 뺐다).
//    안 빼면 같은 사건을 두 줄에서 두 번 세게 된다.
// ==========================================================================

type Span = "daily" | "monthly";

const ROWS: { key: keyof Omit<UsePoint, "d">; label: string; note: string; color: string; dash?: string }[] = [
  { key: "archimap",  label: "archiMap",     note: "파일 저장 · 레퍼런스 · 좋아요", color: PRODUCT_COLOR.archimap },
  { key: "credit",    label: "archiMap 크레딧", note: "생성 1회 = 1건",            color: PRODUCT_COLOR.archimap, dash: "5 4" },
  { key: "colorgram", label: "Colorgram",    note: "팔레트 좋아요",               color: PRODUCT_COLOR.colorgram },
  { key: "laserfish", label: "LaserFish",    note: "플러그인 권한 확인",           color: PRODUCT_COLOR.laserfish },
];

const PAD_L = 132;   // 왼쪽 이름 자리
const PAD_R = 12;
const ROW_H = 44;
const ROW_GAP = 14;
const H_AXIS = 18;

const KO = (n: number) => n.toLocaleString("ko-KR");

function fmt(iso: string, span: Span): string {
  const [y, m, d] = iso.split("-");
  return span === "monthly" ? `${y.slice(2)}.${m}` : `${m}.${d}`;
}

export default function UseTrend({
  daily,
  monthly,
}: {
  daily: UsePoint[];
  monthly: UsePoint[];
}) {
  const [span, setSpan] = useState<Span>("daily");
  const [hover, setHover] = useState<number | null>(null);
  const [box, w] = useMeasure<HTMLDivElement>();

  const pts = span === "daily" ? daily : monthly;

  const geo = useMemo(() => {
    const iw = Math.max(0, w - PAD_L - PAD_R);
    const n = pts.length;
    if (iw <= 0 || n === 0) return null;
    const band = iw / n;
    const x = (i: number) => PAD_L + band * (i + 0.5);
    const max: Record<string, number> = {};
    for (const r of ROWS) max[r.key] = Math.max(1, ...pts.map((p) => p[r.key]));
    const every = Math.max(1, Math.ceil((n * 46) / Math.max(1, iw)));
    return { n, band, x, max, every };
  }, [pts, w]);

  const totalH = ROWS.length * (ROW_H + ROW_GAP) + H_AXIS;
  const hp = hover !== null ? pts[hover] : null;

  return (
    <div className="adm-card adm-chart">
      <header>
        <h3 className="t-title" style={{ margin: 0 }}>프로그램별 활동 추이</h3>
        <div className="spacer" />
        <div className="adm-seg" role="group" aria-label="기간 단위">
          {(["daily", "monthly"] as Span[]).map((s) => (
            <button key={s} aria-pressed={span === s} onClick={() => { setSpan(s); setHover(null); }}>
              {s === "daily" ? "일별" : "월별"}
            </button>
          ))}
        </div>
      </header>

      <p className="t-cap" style={{ margin: "0 0 var(--s-sm)" }}>
        줄마다 눈금이 다르다 — 이름 아래 <span className="strong" style={{ color: "var(--ink-80)" }}>최댓값</span>을 적어 뒀다.
        높이끼리 견주지 말 것.
      </p>

      <div className="adm-relative" ref={box}>
        {geo && (
          <svg
            width={w}
            height={totalH}
            role="img"
            aria-label={`${span === "daily" ? "일별" : "월별"} 프로그램 활동 추이`}
            onMouseLeave={() => setHover(null)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const i = Math.floor((e.clientX - r.left - PAD_L) / geo.band);
              setHover(i >= 0 && i < geo.n ? i : null);
            }}
          >
            {ROWS.map((row, ri) => {
              const top = ri * (ROW_H + ROW_GAP);
              const max = geo.max[row.key];
              const y = (v: number) => top + ROW_H - (v / max) * (ROW_H - 4);
              const line = pts
                .map((p, i) => `${i ? "L" : "M"}${geo.x(i).toFixed(1)},${y(p[row.key]).toFixed(1)}`)
                .join("");
              const area = `${line}L${geo.x(geo.n - 1).toFixed(1)},${top + ROW_H}L${geo.x(0).toFixed(1)},${top + ROW_H}Z`;
              const sum = pts.reduce((s, p) => s + p[row.key], 0);
              const empty = sum === 0;

              return (
                <g key={row.key}>
                  {/* 이름 · 최댓값 — 눈금이 줄마다 다르다는 사실을 여기서 알린다 */}
                  <circle cx={7} cy={top + 8} r="4" fill={row.color} />
                  <text x={18} y={top + 12} style={{ fill: "var(--ink)", fontSize: 12, fontWeight: 600 }}>
                    {row.label}
                  </text>
                  <text x={18} y={top + 26} className="axis">
                    {empty ? "아직 없음" : `최대 ${KO(max)} · 합 ${KO(sum)}`}
                  </text>
                  <text x={18} y={top + 39} className="axis" style={{ fontSize: 9 }}>
                    {row.note}
                  </text>

                  <line className="grid" x1={PAD_L} x2={w - PAD_R} y1={top + ROW_H} y2={top + ROW_H} />
                  {!empty && (
                    <>
                      <path d={area} fill={row.color} opacity="0.1" />
                      <path d={line} fill="none" stroke={row.color} strokeWidth="2"
                            strokeDasharray={row.dash} strokeLinejoin="round" strokeLinecap="round" />
                    </>
                  )}
                  {hover !== null && !empty && (
                    <circle cx={geo.x(hover)} cy={y(pts[hover][row.key])} r="3.5"
                            fill={row.color} stroke="#fff" strokeWidth="1.5" />
                  )}
                </g>
              );
            })}

            {/* x축 */}
            {pts.map((p, i) =>
              i % geo.every === 0 || i === geo.n - 1 ? (
                <text key={p.d} className="axis" x={geo.x(i)} y={totalH - 4} textAnchor="middle">
                  {fmt(p.d, span)}
                </text>
              ) : null,
            )}

            {hover !== null && (
              <line x1={geo.x(hover)} x2={geo.x(hover)} y1={0}
                    y2={ROWS.length * (ROW_H + ROW_GAP) - ROW_GAP}
                    stroke="var(--ink)" strokeWidth="1" opacity="0.25" />
            )}
          </svg>
        )}

        {hp && geo && (
          <div className="adm-tip" style={{ left: geo.x(hover!), top: 0 }}>
            <div className="strong">{hp.d}</div>
            {ROWS.map((r) => (
              <div key={r.key}><span className="k">{r.label} </span>{KO(hp[r.key])}건</div>
            ))}
          </div>
        )}
      </div>

      {/* 🔴크레딧 줄이 짧은 이유를 안 적으면 "아무도 안 쓴다"로 읽힌다.
          자세한 숫자는 아래 크레딧 판이 말한다. */}
      <p className="t-cap" style={{ margin: "var(--s-md) 0 0", paddingTop: "var(--s-sm)", borderTop: "1px solid var(--divider)" }}>
        크레딧 줄은 <span className="strong">2026-09-06부터</span>다 — 그 전 사용에는 시각이 없어
        날짜에 못 붙인다(횟수는 아래 크레딧 판에 그대로 있다).
      </p>
    </div>
  );
}
