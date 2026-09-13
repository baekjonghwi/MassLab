import { callerUid } from "@/lib/caller-uid";
import { CENTRAL, sbFetch } from "@/lib/subscription";

// ==========================================================================
//  POST /api/subscribe/buyer   { sid, name, phone }
//
//  국내(KG이니시스) 결제창을 열기 **직전에** 구매자 이름·휴대폰을 세션 행에 적는다.
//
//  🔴왜 필요한가 — KG이니시스는 빌링키 발급(PC)과 **매달 빌링키 청구** 모두 구매자
//    이름·연락처·이메일을 필수로 받는다(포트원 문서, 2026-09-11 확인). 이메일은 계정에
//    있지만 이름·연락처는 여기서 받는다. confirm 이 subscriptions 로 옮겨 적고,
//    크론이 매달 그 값으로 긁는다.
//  🔴왜 세션 행에 두나 — 모바일은 PG 창에서 우리 주소로 되돌아오며 화면 상태가 다
//    날아간다. 값을 되돌아오는 주소에 실으면 연락처가 브라우저 기록·서버 로그에 남는다.
//
//  🔴주인만 쓴다. confirm 과 달리 **신원이 없으면 거절한다** — 여기는 결제 전이라
//    거절해도 돈이 걸린 사고가 안 난다. 개인정보를 적는 자리라 더 엄하게 둔다.
//  ⛔이 값을 다시 내려주는 API 는 만들지 않는다. session 라우트는 sid 만으로 열리므로
//    거기에 연락처를 실으면 sid 를 아는 누구나 읽는다.
// ==========================================================================

type SessionRow = { id: string; user_id: string; status: string; expires_at: string };

// 국내 휴대폰(010·011·016·017·018·019). 하이픈·공백은 떼고 숫자로만 적는다.
const PHONE_RE = /^01[016789]\d{7,8}$/;

export async function POST(request: Request) {
  let body: { sid?: string; name?: string; phone?: string };
  try { body = await request.json(); } catch { return Response.json({ error: "bad_json" }, { status: 400 }); }

  const sid = body.sid ?? "";
  const name = (body.name ?? "").trim().replace(/\s+/g, " ");
  const phone = (body.phone ?? "").replace(/[\s-]/g, "");

  if (!sid) return Response.json({ error: "bad_request" }, { status: 400 });
  if (!name || name.length > 40) return Response.json({ error: "bad_name" }, { status: 400 });
  if (!PHONE_RE.test(phone)) return Response.json({ error: "bad_phone" }, { status: 400 });
  if (!CENTRAL.serviceKey) return Response.json({ error: "server_misconfigured" }, { status: 500 });

  const uid = await callerUid(request);
  if (!uid) return Response.json({ error: "unauthorized" }, { status: 401 });

  const sRes = await sbFetch(
    `checkout_sessions?id=eq.${encodeURIComponent(sid)}&select=id,user_id,status,expires_at`);
  if (!sRes.ok) return Response.json({ error: "lookup_failed" }, { status: 500 });
  const s = ((await sRes.json()) as SessionRow[])[0];
  if (!s) return Response.json({ error: "not_found" }, { status: 404 });
  if (s.user_id !== uid) {
    console.error("[subscribe] 남의 세션에 구매자 정보를 적으려 함:", sid, "부른이", uid);
    return Response.json({ error: "forbidden" }, { status: 403 });
  }
  if (s.status !== "pending") return Response.json({ error: "already_used" }, { status: 409 });
  if (new Date(s.expires_at).getTime() < Date.now()) {
    return Response.json({ error: "expired" }, { status: 410 });
  }

  const up = await sbFetch(`checkout_sessions?id=eq.${encodeURIComponent(sid)}&status=eq.pending`, {
    method: "PATCH",
    body: JSON.stringify({ buyer_name: name, buyer_phone: phone }),
    prefer: "return=minimal",
  });
  if (!up.ok) return Response.json({ error: "save_failed" }, { status: 500 });

  return Response.json({ ok: true });
}
