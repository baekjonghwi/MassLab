"use client";
import { useMemo, useState } from "react";
import { centroidOf, countryName, flagOf } from "@/lib/admin-geo";
import { COUNTRY_PATHS, MAP_H, MAP_W, mapX, mapY } from "@/lib/admin-worldmap";

// ==========================================================================
//  국가별 분포 — 세계 지도 + 아래의 순위 목록.
//
//  🔴나라 도형은 archiMap 이 깎아 둔 것을 이어 붙인 것이다(lib/admin-worldmap.ts).
//    런타임에 아무것도 받아 오지 않는다.
//
//  🔴그리는 차례가 중요하다 — 아래에서 위로:
//    ① 사람이 없는 나라(한 덩이) → ② 사람이 있는 나라(하나씩, 짚을 수 있게)
//    → ③ 경위도 격자 → ④ 점.
//    ⛔격자를 육지보다 **먼저** 그리면 안 된다. 육지가 위에서 덮어 선이 뚝뚝
//      끊긴다(2026-09-06에 그렇게 보였다). 격자는 육지 **위에** 아주 흐리게.
//
//  🔴크기가 곧 값이다. **넓이**를 값에 비례시킨다(반지름은 √n) — 반지름을 값에
//    비례시키면 두 배가 네 배로 보인다.
//  🔴점 하나가 두 가지를 말한다: 테두리 원 = 가입자, 안쪽 채운 원 = 7일 활성.
//  ⚠️나라 색은 **있다/없다**만 말한다(숫자는 점이 맡는다). 같은 값을 두 가지
//    방법으로 칠하면 어느 쪽을 읽어야 할지 알 수 없게 된다.
//
//  🔴viewBox 로 그린다(재지 않는다). 지도 안에 글자가 하나도 없어서 통째로
//    늘려도 뭉개질 것이 없다. 선 굵기만 vectorEffect 로 고정한다.
// ==========================================================================

type Row = { code: string; n: number; active7: number };

const OCEAN = "#08080a";
const LAND = "#1c1c21";
const LAND_EDGE = "#31313a";
const LAND_ON = "#1d3550";      // 사람이 있는 나라
const LAND_ON_EDGE = "#33587e";
const LAND_HOT = "#2b5c8c";     // 짚은 나라
const DOT = "#2997ff";

export default function WorldPanel({
  countries,
  unknown,
}: {
  countries: Row[];
  unknown: number;
}) {
  const [hot, setHot] = useState<string | null>(null);
  const maxN = Math.max(1, ...countries.map((c) => c.n));

  // 사람이 없는 나라는 한 덩이로 합친다 — 199개를 따로 둘 이유가 없다.
  const quiet = useMemo(() => {
    const has = new Set(countries.map((c) => c.code));
    return Object.entries(COUNTRY_PATHS)
      .filter(([cc]) => !has.has(cc))
      .map(([, d]) => d)
      .join("");
  }, [countries]);

  const dots = useMemo(
    () =>
      countries
        .map((c) => {
          const g = centroidOf(c.code);
          if (!g) return null;
          return {
            ...c,
            x: mapX(g.lon),
            y: mapY(g.lat),
            r: 7 + Math.sqrt(c.n / maxN) * 44,
            ra: c.active7 > 0 ? 4 + Math.sqrt(c.active7 / maxN) * 40 : 0,
          };
        })
        .filter((d): d is NonNullable<typeof d> => d !== null)
        // 큰 점을 먼저 깔고 작은 점을 위에 — 안 가리게
        .sort((a, b) => b.r - a.r),
    [countries, maxN],
  );

  const hotRow = hot ? dots.find((d) => d.code === hot) : null;

  return (
    <>
      <div style={{ display: "grid", gap: "var(--s-sm)" }}>
        <div className="adm-map adm-relative" style={{ background: OCEAN }}>
          <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} role="img" aria-label="국가별 가입자 분포 지도">
            {/* ① 사람이 없는 나라 */}
            <path d={quiet} fill={LAND} stroke={LAND_EDGE} strokeWidth="1"
                  vectorEffect="non-scaling-stroke" fillRule="evenodd" />

            {/* ② 사람이 있는 나라 — 하나씩 둬야 짚을 수 있다 */}
            {countries.map((c) =>
              COUNTRY_PATHS[c.code] ? (
                <path
                  key={c.code}
                  d={COUNTRY_PATHS[c.code]}
                  fill={hot === c.code ? LAND_HOT : LAND_ON}
                  stroke={hot === c.code ? DOT : LAND_ON_EDGE}
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  fillRule="evenodd"
                  onMouseEnter={() => setHot(c.code)}
                  onMouseLeave={() => setHot(null)}
                />
              ) : null,
            )}

            {/* ③ 경위도 격자 — 육지 위에 그려야 안 끊긴다 */}
            {Array.from({ length: 11 }, (_, i) => -150 + i * 30).map((lon) => (
              <line key={`v${lon}`} x1={mapX(lon)} x2={mapX(lon)} y1={0} y2={MAP_H}
                    stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1"
                    vectorEffect="non-scaling-stroke" />
            ))}
            {[60, 40, 20, 0, -20, -40].map((lat) => (
              <line key={`h${lat}`} x1={0} x2={MAP_W} y1={mapY(lat)} y2={mapY(lat)}
                    stroke="#ffffff" strokeOpacity={lat === 0 ? 0.14 : 0.06} strokeWidth="1"
                    vectorEffect="non-scaling-stroke" />
            ))}

            {/* ④ 점 */}
            {dots.map((d) => {
              const on = hot === null || hot === d.code;
              return (
                <g key={d.code} opacity={on ? 1 : 0.28}
                   onMouseEnter={() => setHot(d.code)} onMouseLeave={() => setHot(null)}>
                  <circle cx={d.x} cy={d.y} r={d.r} fill={DOT} fillOpacity="0.16"
                          stroke={DOT} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  {d.ra > 0 && <circle cx={d.x} cy={d.y} r={d.ra} fill={DOT} fillOpacity="0.92" />}
                  {/* 잡기 쉬우라고 실제 점보다 큰 투명 과녁을 얹는다 */}
                  <circle cx={d.x} cy={d.y} r={Math.max(d.r, 18)} fill="transparent" />
                </g>
              );
            })}
          </svg>

          {hotRow && (
            <div
              className="adm-tip"
              style={{
                left: `${(hotRow.x / MAP_W) * 100}%`,
                top: `${((hotRow.y - hotRow.r) / MAP_H) * 100}%`,
              }}
            >
              <div className="strong">{flagOf(hotRow.code)} {countryName(hotRow.code)}</div>
              <div><span className="k">가입 </span>{hotRow.n.toLocaleString("ko-KR")}명</div>
              <div><span className="k">7일 활성 </span>{hotRow.active7.toLocaleString("ko-KR")}명</div>
            </div>
          )}
        </div>

        <div className="adm-legend" style={{ padding: "0 2px" }}>
          <span>
            <svg width="16" height="16" aria-hidden><circle cx="8" cy="8" r="6.5" fill={DOT} fillOpacity="0.16" stroke={DOT} strokeWidth="1.5" /></svg>
            테두리 = 가입자 (넓이가 값에 비례)
          </span>
          <span>
            <svg width="16" height="16" aria-hidden><circle cx="8" cy="8" r="4" fill={DOT} /></svg>
            채움 = 최근 7일 활성
          </span>
          <span>
            <svg width="16" height="16" aria-hidden><rect x="2" y="4" width="12" height="8" rx="2" fill={LAND_ON} stroke={LAND_ON_EDGE} /></svg>
            사람이 있는 나라
          </span>
          <span className="spacer" style={{ flex: 1 }} />
          <span>미기록 {unknown.toLocaleString("ko-KR")}명</span>
        </div>
      </div>

      <div className="adm-card">
        <header>
          <h3 className="t-title" style={{ margin: 0 }}>국가 순위</h3>
          <div className="spacer" />
          <span className="t-cap">{countries.length}개국</span>
        </header>

        <ol style={{ listStyle: "none", margin: 0, padding: 0, columns: "3 240px", columnGap: "var(--s-xl)" }}>
          {countries.slice(0, 30).map((c, i) => (
            <li
              key={c.code}
              onMouseEnter={() => setHot(c.code)}
              onMouseLeave={() => setHot(null)}
              style={{
                display: "grid",
                gridTemplateColumns: "18px 1fr auto",
                gap: "var(--s-xs)",
                alignItems: "center",
                padding: "7px 6px",
                borderRadius: "var(--r-sm)",
                background: hot === c.code ? "var(--pearl)" : "transparent",
                breakInside: "avoid",
              }}
            >
              <span className="t-cap tnum" style={{ textAlign: "right" }}>{i + 1}</span>
              <span>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
                  <span aria-hidden>{flagOf(c.code)}</span>
                  {countryName(c.code)}
                  <span className="t-micro">{c.code}</span>
                </span>
                {/* 막대는 가입자, 진한 부분은 7일 활성. 위 지도와 같은 이야기다 */}
                <span style={{ display: "block", height: 4, marginTop: 4, borderRadius: 2, background: "var(--divider)" }}>
                  <span style={{ display: "block", height: 4, borderRadius: 2, background: "var(--primary)", opacity: 0.35, width: `${(c.n / maxN) * 100}%` }}>
                    <span style={{ display: "block", height: 4, borderRadius: 2, background: "var(--primary)", width: c.n ? `${(c.active7 / c.n) * 100}%` : 0 }} />
                  </span>
                </span>
              </span>
              <span className="tnum" style={{ fontSize: 13, textAlign: "right" }}>
                {c.n.toLocaleString("ko-KR")}
                <span className="t-micro" style={{ display: "block" }}>활성 {c.active7}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </>
  );
}
