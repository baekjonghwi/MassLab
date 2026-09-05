"use client";
import { useCallback, useEffect, useState } from "react";
import { useLanguage, useT } from "@/lib/i18n";
import { REVIEW_PRODUCTS, type ReviewOut } from "@/lib/reviews";
import { ARCHIMAP, COLORGRAM, LASERFISH, withLang } from "@/lib/products";

// ==========================================================================
//  /review — 제품 전부의 후기를 한 줄로 보는 자리 (2026-09-05 다시 지음)
//
//  🔴전에는 **결제 뒤에만 열리는 화면**이었다. 건당결제가 끝나면 3초 뒤 여기로
//    넘어와 후기를 물었고, sessionStorage 의 paymentId 가 없으면 홈으로 튕겼다.
//    "LaserFish 만들 때마다 뜨는 후기 창"이 그것이었다 — 건당결제를 폐기하면서
//    그 문(app/payment/complete)을 막았고, 이 화면도 결제에서 떼어냈다.
//
//  🔴여기서는 **안 쓴다, 읽기만 한다.** 쓰는 자리는 제품 안이다(2026-09-05 결정):
//    · archiMap  — 상단 [REVIEW] 모달
//    · LaserFish — laserfish.masslabs-archi.com/review
//    도구를 쓰던 손으로 그 자리에서 쓰는 것이 자연스럽고, 여기까지 건너오게
//    하면 대부분 안 쓴다. 이 화면은 "무슨 말들이 있었나"를 모아 보여 주는 곳이다.
//
//  🔴글은 /api/reviews 한 곳에서 온다. 제품 사이트들도 같은 문을 쓴다.
// ==========================================================================

type Tab = "all" | (typeof REVIEW_PRODUCTS)[number];

// 제품 이름표와 나가는 문. 🔴제품이 늘면 lib/reviews 의 REVIEW_PRODUCTS 와
//   여기에 한 줄씩. 주소는 lib/products 가 원본이라 여기서 새로 적지 않는다.
const PRODUCT_META: Record<string, { name: string; site: string }> = {
  archimap: { name: "archiMap", site: ARCHIMAP },
  laserfish: { name: "LaserFish", site: LASERFISH },
  colorgram: { name: "Colorgram", site: COLORGRAM },
};

const TABS: Tab[] = ["all", ...REVIEW_PRODUCTS];

export default function ReviewPage() {
  const { lang } = useLanguage();
  const T = useT();

  const [tab, setTab] = useState<Tab>("all");
  // 🔴받아 온 것을 **어느 칸의 것인지와 함께** 든다. 목록만 따로 들면 칸을 바꾼
  //   순간 "앞 칸의 목록 + 새 칸의 제목"이 한 프레임 동안 나란히 선다.
  //   ⚠️칸을 바꿀 때 목록을 null 로 되돌리는 방법도 있지만, 그러면 불러오기를
  //     시작하기도 전에 렌더가 한 번 더 돈다. 여기서는 답이 왔을 때만 한 번 적는다.
  const [data, setData] = useState<{ tab: Tab; rows: ReviewOut[]; failed: boolean } | null>(null);
  const ready = data && data.tab === tab;

  // 🔴"전부"는 제품마다 한 번씩 부른다. 표가 하나라 한 번에 읽을 수도 있지만,
  //   API 가 product 를 반드시 받도록 좁혀 두었다 — 아무 조건 없이 표 전체를
  //   긁는 문을 열어 두지 않기 위해서다. 제품이 셋이라 요청 셋이면 충분하다.
  const load = useCallback(async (which: Tab) => {
    const want = which === "all" ? [...REVIEW_PRODUCTS] : [which];
    try {
      const lists = await Promise.all(
        want.map((p) =>
          fetch(`/api/reviews?product=${p}&limit=30`, { cache: "no-store" })
            .then((r) => (r.ok ? r.json() : { reviews: [] }))
            .then((d) => (d.reviews ?? []) as ReviewOut[])
            .catch(() => [] as ReviewOut[]),
        ),
      );
      const all = lists.flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      setData({ tab: which, rows: all, failed: false });
    } catch {
      setData({ tab: which, rows: [], failed: true });
    }
  }, []);

  useEffect(() => { load(tab); }, [tab, load]);

  return (
    <main style={S.main}>
      <style>{CSS}</style>

      <header style={{ textAlign: "center", marginBottom: "34px" }}>
        <h1 style={S.h1}>{T("사용 후기", "Reviews")}</h1>
        <p style={S.lede}>
          {T(
            "MassLabs 도구를 쓴 사람들이 남긴 말입니다.",
            "What people say after using MassLabs tools.",
          )}
        </p>
        {/* 🔴쓰는 자리는 제품 안이라고 분명히 말해 준다. 안 그러면 이 화면에서
              [후기 쓰기]를 찾다가 없어서 그냥 나간다. */}
        <p style={S.hint}>
          {T(
            "후기는 각 프로그램 안에서 남길 수 있습니다.",
            "You can leave a review from inside each program.",
          )}
        </p>
      </header>

      <div className="rv-tabs">
        {TABS.map((k) => (
          <button
            key={k}
            className={`rv-tab${tab === k ? " on" : ""}`}
            onClick={() => setTab(k)}
          >
            {k === "all" ? T("전체", "All") : PRODUCT_META[k].name}
          </button>
        ))}
      </div>

      {!ready ? (
        <p style={S.quiet}>{T("불러오는 중…", "Loading…")}</p>
      ) : data.failed ? (
        <p style={S.quiet}>{T("후기를 불러오지 못했습니다.", "Could not load reviews.")}</p>
      ) : data.rows.length === 0 ? (
        <p style={S.quiet}>{T("아직 후기가 없습니다.", "No reviews yet.")}</p>
      ) : (
        <div className="rv-list">
          {data.rows.map((r) => (
            <article className="rv-card" key={r.id}>
              {/* 🔴사진은 next/image 가 아니라 <img> 다 — Supabase Storage 주소라
                    next.config 의 remotePatterns 에 등록해야 하는데, 후기 사진은
                    손님이 올리는 것이라 도메인이 늘 우리 것이라는 보장이 없다. */}
              {r.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img className="rv-photo" src={r.photoUrl} alt="" loading="lazy" />
              )}
              <div className="rv-body">
                <div className="rv-top">
                  <b>{r.nickname}</b>
                  {r.rating != null && (
                    <span className="rv-stars" aria-label={`${r.rating}/5`}>
                      {"★".repeat(r.rating)}
                      <i>{"★".repeat(5 - r.rating)}</i>
                    </span>
                  )}
                </div>
                <p className="rv-text">{r.body}</p>
                <div className="rv-foot">
                  <a
                    className="rv-prod"
                    href={withLang(PRODUCT_META[r.product]?.site ?? "/", lang)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {PRODUCT_META[r.product]?.name ?? r.product}
                  </a>
                  <time>{r.createdAt.slice(0, 10)}</time>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

const S: Record<string, React.CSSProperties> = {
  main: {
    fontFamily: "-apple-system, 'Helvetica Neue', sans-serif",
    color: "#1a1a1a",
    maxWidth: "980px",
    margin: "0 auto",
    padding: "56px 24px 88px",
    width: "100%",
  },
  h1: { fontSize: "1.6rem", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: "10px" },
  lede: { fontSize: "0.88rem", color: "#666", lineHeight: 1.75 },
  hint: { fontSize: "0.8rem", color: "#a0a0a0", lineHeight: 1.75, marginTop: "6px" },
  quiet: { fontSize: "0.86rem", color: "#999", textAlign: "center", padding: "48px 0" },
};

const CSS = `
  .rv-tabs { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 28px; }
  .rv-tab {
    border: 1px solid #e3e3e3; background: #fff; color: #666; border-radius: 999px;
    padding: 8px 16px; font-family: inherit; font-size: 0.8rem; font-weight: 600; cursor: pointer;
    transition: background .15s, color .15s, border-color .15s;
  }
  .rv-tab:hover { border-color: #c8c8c8; color: #222; }
  .rv-tab.on { background: #111; border-color: #111; color: #fff; }

  /* 🔴벽돌쌓기(masonry)가 아니라 격자다. 후기마다 글 길이가 달라 masonry 가
       예뻐 보이지만, 세로로 흐르면 최신순이 눈으로 안 읽힌다. */
  .rv-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(276px, 1fr)); gap: 14px; }
  .rv-card {
    border: 1px solid #ececec; border-radius: 14px; background: #fff; overflow: hidden;
    display: flex; flex-direction: column;
  }
  .rv-photo { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; display: block; background: #f3f3f3; }
  .rv-body { padding: 16px 16px 14px; display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .rv-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .rv-top b { font-size: 0.88rem; font-weight: 700; letter-spacing: -0.01em; }
  .rv-stars { font-size: 0.78rem; color: #f0a500; letter-spacing: 0.06em; white-space: nowrap; }
  .rv-stars i { color: #e0e0e0; font-style: normal; }
  /* 줄바꿈을 그대로 살린다 — 사람이 문단을 나눠 쓴 것을 한 덩이로 뭉개지 않는다. */
  .rv-text { font-size: 0.84rem; color: #444; line-height: 1.8; white-space: pre-wrap; word-break: break-word; flex: 1; }
  .rv-foot {
    display: flex; align-items: center; justify-content: space-between; gap: 10px;
    border-top: 1px solid #f2f2f2; padding-top: 10px; font-size: 0.72rem; color: #aaa;
  }
  .rv-prod { color: #666; font-weight: 700; text-decoration: none; }
  .rv-prod:hover { color: #111; }
`;
