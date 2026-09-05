"use client";
import { useMemo, useState } from "react";
import type { Point } from "@/lib/admin-data";
import { useMeasure } from "./useMeasure";

// ==========================================================================
//  가입자 추이 — 누적(면)과 신규(막대).
//
//  🔴⛔축 두 개를 겹치지 않는다. 목업은 누적 선과 신규 막대를 한 그림에 넣고
//    좌·우로 y축을 둘 뒀는데, 그러면 두 선이 만나는 지점이 **눈금을 어떻게
//    잡느냐에 따라 마음대로 움직인다** — 없는 상관관계가 보이게 된다.
//    같은 x축을 공유하는 **그림 두 개**로 쌓는다. 읽는 법은 그대로고 거짓말이 없다.
//
//  🔴빈 날도 0 으로 그린다(DB 가 채워 준다). 없는 날을 건너뛰면 선이 실제보다
//    가팔라 보인다.
// ==========================================================================

type Span = "daily" | "weekly" | "monthly";

const SPAN_LABEL: Record<Span, string> = { daily: "일별", weekly: "주별", monthly: "월별" };
const PAD_L = 44;
const PAD_R = 12;
const H_CUM = 168; // 누적(면)
const H_NEW = 64; // 신규(막대)
const GAP = 26; // 두 그림 사이 — 축 글자가 들어간다
const H_AXIS = 18;

function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? mag * 10;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(Math.round(v));
  return out;
}

function fmtDate(iso: string, span: Span): string {
  const [y, m, d] = iso.split("-");
  if (span === "monthly") return `${y.slice(2)}.${m}`;
  return `${m}.${d}`;
}

export default function GrowthChart({
  daily,
  weekly,
  monthly,
}: {
  daily: Point[];
  weekly: Point[];
  monthly: Point[];
}) {
  const [span, setSpan] = useState<Span>("weekly");
  const [hover, setHover] = useState<number | null>(null);
  const [box, w] = useMeasure<HTMLDivElement>();

  const pts = span === "daily" ? daily : span === "weekly" ? weekly : monthly;

  const geo = useMemo(() => {
    const iw = Math.max(0, w - PAD_L - PAD_R);
    const n = pts.length;
    if (iw <= 0 || n === 0) return null;

    const maxCum = Math.max(1, ...pts.map((p) => p.cum));
    const maxNew = Math.max(1, ...pts.map((p) => p.n));
    const cumTicks = niceTicks(maxCum);
    const cumTop = Math.max(maxCum, cumTicks[cumTicks.length - 1]);

    // 막대 중심 = 칸의 가운데. 면 그래프도 같은 x 를 쓴다 → 두 그림이 정확히 겹친다.
    const band = iw / n;
    const x = (i: number) => PAD_L + band * (i + 0.5);
    const yCum = (v: number) => H_CUM - (v / cumTop) * (H_CUM - 6);
    const yNew = (v: number) => H_NEW - (v / maxNew) * (H_NEW - 4);
    const barW = Math.max(2, Math.min(26, band - (span === "daily" ? 2 : 8)));

    const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${yCum(p.cum).toFixed(1)}`).join("");
    const area = `${line}L${x(n - 1).toFixed(1)},${H_CUM}L${x(0).toFixed(1)},${H_CUM}Z`;

    // 축 글자는 겹치면 못 읽는다 — 칸이 좁으면 건너뛴다.
    const every = Math.max(1, Math.ceil((n * 46) / Math.max(1, iw)));

    return { iw, n, band, x, yCum, yNew, barW, line, area, cumTicks, cumTop, maxNew, every };
  }, [pts, w, span]);

  const totalH = H_CUM + GAP + H_NEW + H_AXIS;
  const hp = hover !== null ? pts[hover] : null;

  return (
    <div className="adm-card adm-chart">
      <header>
        <h3 className="t-title" style={{ margin: 0 }}>가입자 추이</h3>
        <div className="spacer" />
        <div className="adm-seg" role="group" aria-label="기간 단위">
          {(["daily", "weekly", "monthly"] as Span[]).map((s) => (
            <button key={s} aria-pressed={span === s} onClick={() => { setSpan(s); setHover(null); }}>
              {SPAN_LABEL[s]}
            </button>
          ))}
        </div>
      </header>

      <div className="adm-relative" ref={box}>
        {geo && (
          <svg
            width={w}
            height={totalH}
            role="img"
            aria-label={`${SPAN_LABEL[span]} 누적 및 신규 가입자 추이`}
            onMouseLeave={() => setHover(null)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              const i = Math.floor((e.clientX - r.left - PAD_L) / geo.band);
              setHover(i >= 0 && i < geo.n ? i : null);
            }}
          >
            {/* ── 누적 ─────────────────────────────────────────────── */}
            {geo.cumTicks.map((t) => (
              <g key={t}>
                <line className="grid" x1={PAD_L} x2={w - PAD_R} y1={geo.yCum(t)} y2={geo.yCum(t)} />
                <text className="axis" x={PAD_L - 8} y={geo.yCum(t) + 3} textAnchor="end">
                  {t.toLocaleString("ko-KR")}
                </text>
              </g>
            ))}
            <path d={geo.area} fill="var(--primary)" opacity="0.08" />
            <path d={geo.line} fill="none" stroke="var(--primary)" strokeWidth="2"
                  strokeLinejoin="round" strokeLinecap="round" />
            {/* 마지막 값만 직접 적는다 — 모든 점에 숫자를 붙이면 그림이 아니라 표가 된다 */}
            {geo.n > 0 && (
              <>
                <circle cx={geo.x(geo.n - 1)} cy={geo.yCum(pts[geo.n - 1].cum)} r="4"
                        fill="var(--primary)" stroke="#fff" strokeWidth="2" />
                <text className="axis" x={geo.x(geo.n - 1)} y={geo.yCum(pts[geo.n - 1].cum) - 12}
                      textAnchor="end" style={{ fill: "var(--ink)", fontSize: 12, fontWeight: 600 }}>
                  {pts[geo.n - 1].cum.toLocaleString("ko-KR")}명
                </text>
              </>
            )}

            {/* ── 신규 ─────────────────────────────────────────────── */}
            <g transform={`translate(0, ${H_CUM + GAP})`}>
              <text className="axis" x={PAD_L - 8} y={9} textAnchor="end">{geo.maxNew.toLocaleString("ko-KR")}</text>
              <line className="grid" x1={PAD_L} x2={w - PAD_R} y1={H_NEW} y2={H_NEW} />
              {pts.map((p, i) => {
                const h = H_NEW - geo.yNew(p.n);
                return (
                  <rect
                    key={p.d}
                    x={geo.x(i) - geo.barW / 2}
                    y={geo.yNew(p.n)}
                    width={geo.barW}
                    height={Math.max(p.n > 0 ? 1.5 : 0, h)}
                    rx={Math.min(4, geo.barW / 2)}
                    fill="var(--primary)"
                    opacity={hover === null || hover === i ? 0.9 : 0.35}
                  />
                );
              })}
            </g>

            {/* ── x축 ─────────────────────────────────────────────── */}
            {pts.map((p, i) =>
              i % geo.every === 0 || i === geo.n - 1 ? (
                <text key={p.d} className="axis" x={geo.x(i)} y={totalH - 4} textAnchor="middle">
                  {fmtDate(p.d, span)}
                </text>
              ) : null,
            )}

            {/* 십자선 — 두 그림을 함께 가로지른다. 같은 x 라는 것이 눈에 보이게 */}
            {hover !== null && (
              <line x1={geo.x(hover)} x2={geo.x(hover)} y1={0} y2={H_CUM + GAP + H_NEW}
                    stroke="var(--ink)" strokeWidth="1" opacity="0.25" />
            )}
          </svg>
        )}

        {hp && geo && (
          <div className="adm-tip" style={{ left: geo.x(hover!), top: geo.yCum(hp.cum) }}>
            <div className="strong">{hp.d}</div>
            <div><span className="k">신규 </span>{hp.n.toLocaleString("ko-KR")}명</div>
            <div><span className="k">누적 </span>{hp.cum.toLocaleString("ko-KR")}명</div>
          </div>
        )}
      </div>
    </div>
  );
}
