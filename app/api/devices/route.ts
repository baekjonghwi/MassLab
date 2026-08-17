import { CENTRAL, sbFetch } from "@/lib/subscription";
import { bearerOf, uidFromAccessToken } from "@/lib/plugin-auth";

// ==========================================================================
//  GET    /api/devices        연결된 기기 목록
//  DELETE /api/devices?id=…   그 기기 연결 해제
//  Authorization: Bearer <Supabase 로그인 토큰>
//
//  🔴토큰 원문은 저장하지도, 돌려주지도 않는다. 목록에는 이름과 마지막 사용
//    시각만 있다. 해제는 revoked_at을 적는 것으로 끝난다 — 그 기기가 다음에
//    /api/entitlement를 부르면 401을 받고 로그인 화면으로 돌아간다.
// ==========================================================================

export const dynamic = "force-dynamic";

type Row = {
  id: string; device_name: string | null;
  last_seen_at: string | null; created_at: string;
};

export async function GET(request: Request) {
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  const uid = await uidFromAccessToken(bearerOf(request));
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });

  const r = await sbFetch(
    `plugin_tokens?user_id=eq.${uid}&revoked_at=is.null` +
    `&select=id,device_name,last_seen_at,created_at&order=last_seen_at.desc.nullslast`,
  );
  if (!r.ok) return Response.json({ error: "lookup_failed" }, { status: 500 });

  return Response.json({ devices: (await r.json()) as Row[] });
}

export async function DELETE(request: Request) {
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  const uid = await uidFromAccessToken(bearerOf(request));
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return Response.json({ error: "bad_request" }, { status: 400 });

  // 🔴user_id 조건을 반드시 함께 건다. 없으면 남의 기기 id를 넣어 끊을 수 있다.
  const r = await sbFetch(`plugin_tokens?id=eq.${encodeURIComponent(id)}&user_id=eq.${uid}`, {
    method: "PATCH",
    body: JSON.stringify({ revoked_at: new Date().toISOString() }),
    prefer: "return=minimal",
  });
  if (!r.ok) return Response.json({ error: "revoke_failed" }, { status: 500 });

  return Response.json({ ok: true });
}
