import { CENTRAL, sbFetch, PORTONE_API } from "@/lib/subscription";

// ==========================================================================
//  POST /api/account/delete   (Authorization: Bearer <supabase access token>)
//
//  회원 탈퇴 — 계정을 지운다. /account 의 [회원 탈퇴]가 부르는 자리.
//
//  🔴돌이킬 수 없다. 그래서 신원 확인은 "로그인한 본인의 액세스 토큰" 하나로만
//    하고(sid·이메일 같은 건 안 받는다), 화면에서 두 번 물어본 뒤에 온다.
//
//  🔴같은 출처(/account)에서만 부른다 — CORS를 열지 않는다. 해지(cancel)와 달리
//    제품 쪽에서 남의 계정을 지우게 할 이유가 없다.
//
//  지우는 순서가 곧 안전장치다:
//    ① 포트원 빌링키 삭제 — 계정이 사라진 뒤엔 카드가 남아도 손댈 수가 없다.
//    ② 스토리지 파일 삭제 — DB 행은 FK가 데려가지만 파일은 안 따라온다.
//    ③ auth.users 삭제 — profiles·subscriptions·device_links·plugin_tokens·
//      checkout_sessions·archimap.* 는 on delete cascade 로 함께 사라진다.
//      ⚠️billing_events 만 on delete set null 이다 — 결제 기록은
//        전자상거래법상 5년 보관 의무가 있어 일부러 남긴다(신원은 끊긴다).
// ==========================================================================

// uid 폴더 밑에 사용자 파일이 들어가는 버킷들. 🔴버킷을 늘리면 여기도 늘릴 것 —
//   안 그러면 탈퇴해도 그림이 공개 URL로 그대로 남는다.
const USER_BUCKETS = ["style-thumbs"];

async function purgeBucket(bucket: string, uid: string) {
  const head = { Authorization: `Bearer ${CENTRAL.serviceKey}`, apikey: CENTRAL.serviceKey,
                 "Content-Type": "application/json" };
  const listRes = await fetch(`${CENTRAL.supabaseUrl}/storage/v1/object/list/${bucket}`, {
    method: "POST", headers: head, cache: "no-store",
    body: JSON.stringify({ prefix: `${uid}/`, limit: 1000 }),
  });
  if (!listRes.ok) throw new Error(`list ${bucket}: ${listRes.status}`);
  const files = (await listRes.json()) as { name: string }[];
  if (!files.length) return 0;

  const del = await fetch(`${CENTRAL.supabaseUrl}/storage/v1/object/${bucket}`, {
    method: "DELETE", headers: head, cache: "no-store",
    body: JSON.stringify({ prefixes: files.map((f) => `${uid}/${f.name}`) }),
  });
  if (!del.ok) throw new Error(`delete ${bucket}: ${del.status}`);
  return files.length;
}

export async function POST(request: Request) {
  if (!CENTRAL.serviceKey) {
    return Response.json({ error: "not_configured" }, { status: 500 });
  }

  // --- 토큰으로 본인 확인 -------------------------------------------------
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return Response.json({ error: "no_token" }, { status: 401 });

  const meRes = await fetch(`${CENTRAL.supabaseUrl}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: CENTRAL.serviceKey },
    cache: "no-store",
  });
  if (!meRes.ok) return Response.json({ error: "bad_token" }, { status: 401 });
  const uid = ((await meRes.json()) as { id?: string }).id;
  if (!uid) return Response.json({ error: "bad_token" }, { status: 401 });

  // --- ① 빌링키부터 없앤다 -------------------------------------------------
  // 🔴여기서 실패하면 탈퇴를 진행하지 않는다. 계정이 사라진 뒤엔 어느 빌링키가
  //   누구 것이었는지 알 길이 없어, 카드가 포트원에 영영 남는다.
  const sRes = await sbFetch(`subscriptions?user_id=eq.${uid}&select=product,status,billing_key`);
  if (!sRes.ok) return Response.json({ error: "lookup_failed" }, { status: 500 });
  const subs = (await sRes.json()) as { product: string; status: string; billing_key: string | null }[];

  const secret = process.env.PORTONE_SECRET_KEY?.trim();
  for (const s of subs) {
    if (!s.billing_key) continue;
    if (!secret) return Response.json({ error: "not_configured" }, { status: 500 });
    const del = await fetch(
      `${PORTONE_API}/billing-keys/${encodeURIComponent(s.billing_key)}`,
      { method: "DELETE", headers: { Authorization: `PortOne ${secret}` }, cache: "no-store" },
    );
    // 이미 지워진 키(404)는 목적이 달성된 것이므로 통과시킨다.
    if (!del.ok && del.status !== 404) {
      console.error("[account/delete] 빌링키 삭제 실패:", del.status, await del.text());
      return Response.json({ error: "billing_key_failed" }, { status: 502 });
    }
  }

  // --- ② 남긴 파일 ---------------------------------------------------------
  // 파일이 남는 건 개인정보 파기 의무에 걸리지만, 여기서 막으면 계정을 못 지운다.
  // 실패는 로그로만 남기고 계속 간다 — 사람이 나중에 지울 수 있는 종류의 잔해다.
  for (const b of USER_BUCKETS) {
    try { await purgeBucket(b, uid); }
    catch (e) { console.error("[account/delete] 스토리지 정리 실패:", b, e); }
  }

  // --- ③ 장부에 한 줄 -------------------------------------------------------
  // 🔴user_id 는 곧 null 이 된다(set null). 그래서 raw 에 uid 를 한 번 더 적어
  //   둔다 — 이메일은 적지 않는다(탈퇴하면 지체 없이 파기가 원칙이다).
  await sbFetch("billing_events", {
    method: "POST",
    body: JSON.stringify({
      user_id: uid, payment_id: `delete-${uid}-${Date.now()}`,
      kind: "account_delete", status: "deleted",
      raw: { uid, subscriptions: subs.map((s) => ({ product: s.product, status: s.status })) },
    }),
    prefer: "return=minimal",
  });

  // --- ④ 계정 삭제 ---------------------------------------------------------
  const gone = await fetch(`${CENTRAL.supabaseUrl}/auth/v1/admin/users/${uid}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${CENTRAL.serviceKey}`, apikey: CENTRAL.serviceKey },
    cache: "no-store",
  });
  if (!gone.ok) {
    console.error("[account/delete] 계정 삭제 실패:", gone.status, await gone.text());
    return Response.json({ error: "delete_failed" }, { status: 500 });
  }

  return Response.json({ ok: true });
}
