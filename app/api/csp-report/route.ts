// ==========================================================================
//  POST /api/csp-report — CSP 위반 보고를 받는 자리.
//
//  🔴지금 CSP 는 **Report-Only** 다(next.config.ts). 아무것도 차단하지 않고,
//    "정식으로 켰다면 막혔을 것"만 여기로 보고한다. 결제창이 여러 PG 도메인으로
//    튀는 탓에 script-src·frame-src 를 미리 다 열거할 수 없어서, 실제 트래픽이
//    무엇을 부르는지 이 보고로 모은 뒤 허용목록을 굳히고 강제로 전환한다.
//
//  🔴보는 법: Vercel 로그에서 "[csp-report]" 를 찾는다. 홈·로그인·결제를 한 번씩
//    돌려 보며 어떤 도메인이 막히는지 모은다. 목록이 안정되면 next.config 의
//    Report-Only 를 Content-Security-Policy(강제)로 바꾼다.
//
//  ⚠️브라우저는 report-uri 로 `application/csp-report`, report-to 로
//    `application/reports+json` 를 보낸다. 둘 다 JSON 이라 그대로 읽는다.
//  ⚠️응답은 204 로 짧게 끊는다 — 본문을 되돌려 줄 이유가 없다.
// ==========================================================================

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    // report-uri 는 { "csp-report": {...} }, report-to 는 [{ body: {...} }] 로 온다.
    const report = (body as { "csp-report"?: unknown })?.["csp-report"] ?? body;
    console.warn("[csp-report]", JSON.stringify(report)?.slice(0, 2000));
  } catch {
    /* 보고를 못 읽어도 페이지 동작과는 무관하다 — 조용히 넘긴다. */
  }
  return new Response(null, { status: 204 });
}
