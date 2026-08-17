import { CENTRAL, sbFetch } from "@/lib/subscription";
import { bearerOf, uidFromAccessToken } from "@/lib/plugin-auth";

// ==========================================================================
//  POST /api/device/link   { userCode }
//  Authorization: Bearer <Supabase 로그인 토큰>
//
//  /link 페이지가 부른다. 사용자가 라이노 화면의 코드를 직접 입력해야 통과한다.
//
//  🔴기기 ID를 주소로 받지 않는 이유가 여기 있다. 주소로 받으면 공격자가 자기
//    기기 ID를 담은 링크를 피해자에게 열게 하는 것만으로 피해자 계정의 토큰을
//    가져갈 수 있다. 코드를 "입력"하게 하면, 피해자는 자기 라이노에 없는 코드를
//    적을 수 없으므로 그 공격이 원천적으로 막힌다.
// ==========================================================================

export const dynamic = "force-dynamic";

const norm = (s: string) => s.replace(/[^A-Za-z0-9]/g, "").toUpperCase();

export async function POST(request: Request) {
  let body: { userCode?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "bad_json" }, { status: 400 }); }

  const code = norm(body.userCode ?? "");
  if (code.length !== 6) return Response.json({ error: "bad_code" }, { status: 400 });
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  const uid = await uidFromAccessToken(bearerOf(request));
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });

  // 아직 안 붙었고 안 만료된 것만 본다. 저장형은 'ABC-123', 입력형은 'abc 123'일
  // 수 있어 코드 비교는 SQL이 아니라 여기서 한다(대기 행은 많아야 몇 개다).
  const r = await sbFetch(
    `device_links?user_id=is.null&expires_at=gt.${new Date().toISOString()}` +
    `&select=device_id,user_code`,
  );
  if (!r.ok) return Response.json({ error: "lookup_failed" }, { status: 500 });

  const hit = ((await r.json()) as { device_id: string; user_code: string }[])
    .filter((x) => norm(x.user_code) === code);

  if (hit.length === 0) return Response.json({ error: "not_found" }, { status: 404 });
  // 🔴같은 코드가 둘이면 어느 기기에 붙일지 알 수 없다. 붙이지 않는다.
  if (hit.length > 1) return Response.json({ error: "ambiguous" }, { status: 409 });

  const up = await sbFetch(`device_links?device_id=eq.${encodeURIComponent(hit[0].device_id)}`, {
    method: "PATCH",
    body: JSON.stringify({ user_id: uid, linked_at: new Date().toISOString() }),
    prefer: "return=minimal",
  });
  if (!up.ok) return Response.json({ error: "link_failed" }, { status: 500 });

  return Response.json({ ok: true });
}
