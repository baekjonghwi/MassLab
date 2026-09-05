#!/usr/bin/env node
/* ==========================================================================
   spec(JSON) → PNG. 인스타에 그대로 올릴 수 있는 크기로 뽑는다.

     node render.mjs spec.json [--out DIR] [--only 2,3]

   🔴그림은 헤드리스 크롬이 그린다. 판 한 장을 정확한 픽셀 크기의 HTML 로 만들고
     스크린샷을 찍는 방식이다 — 브라우저로 열어 본 것과 나오는 파일이 어긋나지 않는다.
   ⚠️글꼴을 인터넷에서 받아 온다(Geist=구글, 에스코어드림=jsdelivr). 오프라인이면
     대체 글꼴로 떨어져 글자 폭이 달라진다 — 뽑은 그림을 한 번은 눈으로 볼 것.
   ========================================================================== */

import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { dirname, resolve, join } from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(HERE, "../../..");          // .claude/skills/insta-card → 저장소 뿌리

/* 인스타가 쓰는 판 크기. post 는 4:5 — 피드에서 세로로 가장 크게 잡히는 비율이다. */
const SIZE = { post: [1080, 1350], story: [1080, 1920], square: [1080, 1080] };

/* 🔴브랜드 마크는 색을 그대로 둔다(masslabs-ui: UI 는 흑백이되 로고만 예외). */
const MARK = {
  MassLabs:  "public/images/icon/MassLabs-rounded.svg",
  LaserFish: "public/images/icon/LaserFish.svg",
  archiMap:  "public/images/icon/archiMap.svg",
  Colorgram: "public/images/icon/Colorgram.svg",
};

const SITE = {
  MassLabs:  "masslabs-archi.com",
  LaserFish: "laserfish.masslabs-archi.com",
  archiMap:  "archimap.masslabs-archi.com",
  Colorgram: "colorgram.masslabs-archi.com",
};

// ── 크롬 찾기 ─────────────────────────────────────────────────────────────
function findBrowser() {
  const env = process.env.MASSLABS_CHROME;
  if (env && existsSync(env)) return env;
  const la = process.env.LOCALAPPDATA || "";
  const cands = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    la ? la + "/Google/Chrome/Application/chrome.exe" : "",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
  ].filter(Boolean);
  for (const c of cands) if (existsSync(c)) return c;
  throw new Error("크롬(또는 엣지)을 못 찾았다. 설치 경로를 MASSLABS_CHROME 환경변수로 알려줄 것.");
}

// ── 글꼴을 파일째 심는다 ──────────────────────────────────────────────────
/* 🔴그림으로 굳는 경로라서 원격 url 을 안 쓴다. 헤드리스 크롬의 --screenshot 은
     글꼴이 다 오기를 기다려 주지 않아서, 늦게 도착한 한 벌이 조용히 빠진 채 찍힌다
     (2026-09-05 실측 — 에스코어드림 Medium 이 늦어 제목이 Regular 로 나왔다).
   한 번 받아 .fonts/ 에 두고, 그 다음부터는 인터넷 없이도 같은 그림이 나온다. */
const FONTDIR = join(HERE, ".fonts");

const SCORE = [
  ["S-CoreDream-4Regular.woff", "100 500"],
  ["S-CoreDream-5Medium.woff",  "501 700"],
  ["S-CoreDream-6Bold.woff",    "701 900"],
];
const SCORE_BASE = "https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_six@1.2/";
const GEIST_CSS =
  "https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700;800;900&display=swap";
/* woff2 를 받으려면 최신 브라우저인 척해야 한다 — 구글이 UA 로 판을 갈라 준다. */
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

async function grab(url, name) {
  const cached = join(FONTDIR, name);
  if (existsSync(cached)) return readFileSync(cached);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) throw new Error(`글꼴을 못 받았다(${res.status}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  mkdirSync(FONTDIR, { recursive: true });
  writeFileSync(cached, buf);
  console.log(`  · 글꼴 받음 ${name} (${Math.round(buf.length / 1024)}KB)`);
  return buf;
}

const dataURI = (buf, type) => `data:font/${type};base64,${buf.toString("base64")}`;

async function fontCSS() {
  let out = "";

  for (const [file, range] of SCORE) {
    const buf = await grab(SCORE_BASE + file, file);
    out += `@font-face{font-family:'S-Core Dream';font-style:normal;font-weight:${range};` +
           `src:url('${dataURI(buf, "woff")}') format('woff');}\n`;
  }

  /* 구글이 내주는 CSS 를 그대로 쓰되 url 만 갈아 끼운다 —
     unicode-range 로 잘게 쪼갠 구간 정의를 우리가 다시 짜지 않아도 된다. */
  const css = await (async () => {
    const cached = join(FONTDIR, "geist.css");
    if (existsSync(cached)) return readFileSync(cached, "utf8");
    const res = await fetch(GEIST_CSS, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`Geist CSS 를 못 받았다(${res.status})`);
    const t = await res.text();
    mkdirSync(FONTDIR, { recursive: true });
    writeFileSync(cached, t, "utf8");
    return t;
  })();

  const urls = [...new Set(css.match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g) || [])];
  const map = new Map();
  for (const u of urls) {
    const name = "geist-" + u.split("/").pop();
    map.set(u, dataURI(await grab(u, name), "woff2"));
  }
  out += css.replace(/https:\/\/fonts\.gstatic\.com\/[^)]+/g, (u) => map.get(u) || u);

  return out;
}

// ── 글 다듬기 ─────────────────────────────────────────────────────────────
const esc = (s) => String(s ?? "")
  .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* **굵게** 와 줄바꿈만 알아듣는다. 그 이상은 카드에 안 쓴다 —
   판이 작아서 서식이 많아지는 순간 읽히지 않는다. */
const tx = (s) => esc(s)
  .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
  .replace(/\n/g, "<br>");

/* 로컬 그림은 file:// 로 바꿔 준다. 이미 http(s)·data 면 그대로 둔다. */
function asset(p, specDir) {
  if (!p) return null;
  if (/^(https?:|data:|file:)/i.test(p)) return p;
  const near = resolve(specDir, p);
  const abs = existsSync(near) ? near : resolve(REPO, p);
  if (!existsSync(abs)) { console.warn("  ⚠️그림을 못 찾았다: " + p); return null; }
  return pathToFileURL(abs).href;
}

// ── 판 한 장 ──────────────────────────────────────────────────────────────
function cardHTML(card, i, spec, specDir, css) {
  const fmt = spec.format || "post";
  const [w, h] = SIZE[fmt] || SIZE.post;
  const theme = card.theme || spec.theme || "light";
  const product = card.product || spec.product || "MassLabs";
  const markSrc = MARK[product] ? asset(MARK[product], specDir) : null;
  const total = spec.cards.length;

  const brand = spec.brand === false ? "" : `
    <div class="brand">
      ${markSrc ? `<img src="${markSrc}" alt="">` : ""}
      <span class="nm">${esc(product)}</span>
    </div>`;

  const foot = spec.brand === false ? "" : `
    <div class="foot">
      <span>${esc(card.foot ?? spec.foot ?? SITE[product] ?? "")}</span>
      ${total > 1 && fmt !== "story" ? `<span class="pg">${i + 1} / ${total}</span>` : ""}
    </div>`;

  let body = "";
  switch (card.type) {
    case "cover":
      body = `
        ${card.eyebrow ? `<div class="eyebrow">${esc(card.eyebrow)}</div>` : ""}
        <div class="title">${tx(card.title)}</div>
        ${card.sub ? `<div class="sub">${tx(card.sub)}</div>` : ""}`;
      break;

    case "point":
      body = `
        <div class="num">${String(card.n ?? i + 1).padStart(2, "0")}</div>
        <div class="ptitle">${tx(card.title)}</div>
        ${card.body ? `<div class="bodytx">${tx(card.body)}</div>` : ""}`;
      break;

    case "shot": {
      const src = asset(card.image, specDir);
      body = `
        ${src ? `<div class="box"><img class="shot" src="${src}" alt=""></div>` : ""}
        ${card.title || card.body ? `<div class="cap">
          ${card.title ? `<span class="k">${tx(card.title)}</span>` : ""}
          ${card.body ? tx(card.body) : ""}
        </div>` : ""}`;
      break;
    }

    case "quote":
      body = `<div class="quote"><span class="qmark">&ldquo;</span>${tx(card.text)}</div>`;
      break;

    case "list":
      body = `
        ${card.eyebrow ? `<div class="eyebrow">${esc(card.eyebrow)}</div>` : ""}
        ${card.title ? `<div class="ptitle">${tx(card.title)}</div>` : ""}
        <div class="list">${(card.items || [])
          .map((it) => `<div class="li"><span class="dot"></span><span>${tx(it)}</span></div>`)
          .join("")}</div>`;
      break;

    case "cta":
      body = `
        <div class="title">${tx(card.title)}</div>
        ${card.body ? `<div class="sub">${tx(card.body)}</div>` : ""}
        ${card.action ? `<div class="pill">${esc(card.action)}</div>` : ""}
        ${card.url ? `<div class="url">${esc(card.url)}</div>` : ""}`;
      break;

    default:
      throw new Error(`모르는 카드 종류: ${card.type} (${i + 1}번째)`);
  }

  return `<!doctype html><html><head><meta charset="utf-8">
<style>${css}
  html,body{width:${w}px;height:${h}px;}
  .canvas{width:${w}px;height:${h}px;}
</style></head>
<body><div class="canvas ${fmt} t-${theme}">
  ${brand}
  <div class="body">${body}</div>
  ${foot}
</div></body></html>`;
}

// ── 실행 ──────────────────────────────────────────────────────────────────
const args = process.argv.slice(2);
const specPath = resolve(args.find((a) => !a.startsWith("--")) || "spec.json");
const outFlag = args.indexOf("--out");
const onlyFlag = args.indexOf("--only");
const only = onlyFlag > -1 ? new Set(args[onlyFlag + 1].split(",").map(Number)) : null;

if (!existsSync(specPath)) { console.error("spec 을 못 찾았다: " + specPath); process.exit(1); }

const spec = JSON.parse(readFileSync(specPath, "utf8"));
const specDir = dirname(specPath);
const css = readFileSync(join(HERE, "card.css"), "utf8").replace("/*@FONTS@*/", await fontCSS());
const browser = findBrowser();

const slug = (spec.slug || "cards").replace(/[^\w.-]+/g, "-");
const outDir = resolve(outFlag > -1 ? args[outFlag + 1] : join(specDir, slug));
mkdirSync(outDir, { recursive: true });

const work = join(tmpdir(), "insta-card-" + process.pid);
mkdirSync(work, { recursive: true });

const [W, H] = SIZE[spec.format || "post"] || SIZE.post;
console.log(`${spec.format || "post"} ${W}×${H} · ${spec.cards.length}장 → ${outDir}\n`);

const made = [];
spec.cards.forEach((card, i) => {
  if (only && !only.has(i + 1)) return;
  const name = `${String(i + 1).padStart(2, "0")}-${card.type}.png`;
  const htmlPath = join(work, i + ".html");
  const pngPath = join(outDir, name);
  writeFileSync(htmlPath, cardHTML(card, i, spec, specDir, css), "utf8");

  const r = spawnSync(browser, [
    "--headless",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--force-device-scale-factor=1",
    "--run-all-compositor-stages-before-draw",
    /* 🔴글꼴을 받아 올 시간을 준다. 이게 없으면 대체 글꼴 상태로 찍힐 때가 있다. */
    "--virtual-time-budget=6000",
    `--window-size=${W},${H}`,
    `--screenshot=${pngPath}`,
    pathToFileURL(htmlPath).href,
  ], { encoding: "utf8", timeout: 60000 });

  if (!existsSync(pngPath)) {
    console.error(`  ✗ ${name} — 실패\n${(r.stderr || "").slice(0, 600)}`);
    return;
  }
  made.push(pngPath);
  console.log("  ✓ " + name);
});

/* --keep 은 그린 HTML 을 안 지운다. 판이 이상하게 나왔을 때 브라우저로 열어 보는 용도다. */
if (args.includes("--keep")) console.log(`\n  (HTML 남김: ${work})`);
else rmSync(work, { recursive: true, force: true });

/* 글(캡션·해시태그·영상 소개글)은 spec 에 있는 그대로 옆에 떨궈 둔다 —
   그림만 있고 글이 없으면 올릴 때 또 찾아 헤매게 된다. */
if (spec.caption || spec.hashtags) {
  writeFileSync(join(outDir, "caption.txt"),
    [spec.caption, (spec.hashtags || []).join(" ")].filter(Boolean).join("\n\n") + "\n", "utf8");
  console.log("  ✓ caption.txt");
}

console.log(`\n${made.length}장 완료 · ${outDir}`);
