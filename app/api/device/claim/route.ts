import { CENTRAL, sbFetch } from "@/lib/subscription";
import {
  SEAT_LIMIT, entitlementOf, hashToken, isDeviceId, newToken,
} from "@/lib/plugin-auth";

// ==========================================================================
//  POST /api/device/claim   { deviceId, deviceName? }
//
//  라이노에서 [연결 확인]을 누를 때 부른다. 요청은 이 한 번뿐이다 — 폴링 없음.
//  아직 로그인이 안 끝났으면 not_linked를 돌려주고, 사용자가 다시 누르면 된다.
//
//  🔴교환에 성공하면 device_links 행을 지운다(1회용). 남겨 두면 같은 deviceId로
//    토큰을 몇 번이고 더 받아갈 수 있다.
// ==========================================================================

export const dynamic = "force-dynamic";

type Row = { user_id: string | null; expires_at: string };

export async function POST(request: Request) {
  let body: { deviceId?: string; deviceName?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "bad_json" }, { status: 400 }); }

  if (!isDeviceId(body.deviceId)) return Response.json({ error: "bad_device" }, { status: 400 });
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  const key = encodeURIComponent(body.deviceId);
  const r = await sbFetch(`device_links?device_id=eq.${key}&select=user_id,expires_at`);
  if (!r.ok) return Response.json({ error: "lookup_failed" }, { status: 500 });

  const row = ((await r.json()) as Row[])[0];
  if (!row) return Response.json({ error: "not_found" }, { status: 404 });
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return Response.json({ error: "expired" }, { status: 410 });
  }
  // 브라우저에서 아직 로그인을 안 끝냈다. 실패가 아니라 "아직"이다.
  if (!row.user_id) return Response.json({ error: "not_linked" }, { status: 409 });

  const uid = row.user_id;

  // --- 좌석 정리 ---------------------------------------------------------
  // 🔴안 막으면 계정 하나를 과 전체가 돌려쓴다. 한도를 넘으면 가장 오래 안 쓴
  //   기기를 끊는다 — 거절하면 기기를 바꾼 사용자가 영영 못 들어온다.
  let replaced = false;
  const seats = await sbFetch(
    `plugin_tokens?user_id=eq.${uid}&revoked_at=is.null` +
    `&select=id,last_seen_at,created_at&order=last_seen_at.asc.nullsfirst,created_at.asc`,
  );
  if (seats.ok) {
    const rows = (await seats.json()) as { id: string }[];
    const over = rows.length - (SEAT_LIMIT - 1);   // 이번에 하나 새로 발급하므로
    for (const old of rows.slice(0, Math.max(0, over))) {
      await sbFetch(`plugin_tokens?id=eq.${old.id}`, {
        method: "PATCH",
        body: JSON.stringify({ revoked_at: new Date().toISOString() }),
        prefer: "return=minimal",
      });
      replaced = true;
    }
  }

  // --- 토큰 발급 ---------------------------------------------------------
  const token = newToken();
  const ins = await sbFetch("plugin_tokens", {
    method: "POST",
    body: JSON.stringify({
      user_id: uid,
      token_hash: hashToken(token),
      device_name: body.deviceName ?? null,
      last_seen_at: new Date().toISOString(),
    }),
    prefer: "return=minimal",
  });
  if (!ins.ok) {
    console.error("[device] 토큰 저장 실패:", ins.status, await ins.text());
    return Response.json({ error: "issue_failed" }, { status: 500 });
  }

  // 1회용 연결 행을 소각한다.
  await sbFetch(`device_links?device_id=eq.${key}`, { method: "DELETE", prefer: "return=minimal" });

  const ent = await entitlementOf(uid, "laserfish");
  return Response.json({ token, replaced, ...ent });
}
