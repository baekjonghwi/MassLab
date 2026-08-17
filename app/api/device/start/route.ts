import { CENTRAL, sbFetch } from "@/lib/subscription";
import { DEVICE_TTL_MIN, isDeviceId, newUserCode } from "@/lib/plugin-auth";

// ==========================================================================
//  POST /api/device/start   { deviceId }
//
//  라이노가 로그인을 시작할 때 한 번 부른다. 확인 코드를 받아 화면에 띄우고,
//  브라우저로 linkUrl을 연다. 그 뒤로는 사용자가 [연결 확인]을 누를 때까지
//  아무 요청도 보내지 않는다.
// ==========================================================================

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: { deviceId?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "bad_json" }, { status: 400 }); }

  if (!isDeviceId(body.deviceId)) return Response.json({ error: "bad_device" }, { status: 400 });
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  const userCode = newUserCode();
  const expiresAt = new Date(Date.now() + DEVICE_TTL_MIN * 60_000).toISOString();

  // 🔴같은 기기가 다시 시작하면 덮어쓴다. 새 코드가 나오고 이전 코드는 죽는다
  //   — 사용자가 창을 닫았다 다시 열었을 때 옛 코드가 살아 있으면 헷갈린다.
  const r = await sbFetch("device_links?on_conflict=device_id", {
    method: "POST",
    body: JSON.stringify({
      device_id: body.deviceId,
      user_code: userCode,
      user_id: null,
      linked_at: null,
      expires_at: expiresAt,
    }),
    prefer: "resolution=merge-duplicates,return=minimal",
  });
  if (!r.ok) {
    console.error("[device] 연결 시작 실패:", r.status, await r.text());
    return Response.json({ error: "start_failed" }, { status: 500 });
  }

  // 🔴주소에 기기 ID를 싣지 않는다. 사용자가 코드를 입력해야 붙는다
  //   (/api/device/link 주석 참고 — 링크만 열게 만드는 공격을 막는다).
  const origin = new URL(request.url).origin;
  return Response.json({ userCode, linkUrl: `${origin}/link`, expiresAt });
}
