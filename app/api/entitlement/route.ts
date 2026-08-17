import { CENTRAL } from "@/lib/subscription";
import { bearerOf, entitlementOf, uidFromPluginToken } from "@/lib/plugin-auth";

// ==========================================================================
//  GET /api/entitlement?product=laserfish
//  Authorization: Bearer <플러그인 토큰>
//
//  "이 사람이 지금 쓸 수 있나"에 답한다. 로그인 여부와는 별개의 질문이다 —
//  로그인은 됐지만 구독을 안 한 상태(plan='free')가 정상적인 상태이고,
//  그때는 allowed=false로 내려간다.
//
//  🔴플러그인은 응답의 until까지 캐시하고 그때까지 다시 묻지 않는다.
//    권한 있음은 하루, free는 60초다(결제 직후 바로 풀려야 하므로 비대칭).
// ==========================================================================

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  const uid = await uidFromPluginToken(bearerOf(request));
  // 토큰이 없거나 폐기됐다. 플러그인은 이걸 보고 로그인 화면으로 돌아간다.
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });

  const product = new URL(request.url).searchParams.get("product") ?? "laserfish";
  return Response.json(await entitlementOf(uid, product));
}
