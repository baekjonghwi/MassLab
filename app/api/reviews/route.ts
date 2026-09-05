import { CENTRAL, sbFetch } from "@/lib/subscription";
import {
  BODY_MAX, LIST_MAX, NICKNAME_MAX, PHOTO_MAX_BYTES, PHOTO_TYPES,
  corsHeaders, isReviewProduct, toReviewOut,
  type ReviewRow,
} from "@/lib/reviews";
import { uidFromReviewRequest } from "@/lib/reviews-auth";

// ==========================================================================
//  /api/reviews — 후기의 유일한 문 (2026-09-05)
//
//    GET    ?product=laserfish&limit=20   목록. 로그인 없이도 읽힌다.
//    POST   multipart/form-data           내 후기 쓰기·고쳐쓰기. 로그인 필수.
//    DELETE ?product=laserfish            내 후기 지우기. 로그인 필수.
//
//  🔴제품 하위도메인(archiMap · LaserFish)이 직접 부른다. 그래서 답마다 CORS
//    머리가 붙는다(lib/reviews 의 corsHeaders) — 목록을 만드는 곳은 거기 하나다.
//
//  🔴신원은 본문에서 받지 않는다. 쿠키 세션이거나 Bearer 토큰이다 — 화면이
//    "나는 아무개다"라고 말할 수 있으면 남의 이름으로 쓰는 길이 열린다.
//
//  🔴한 사람이 한 프로그램에 후기 하나다(DB의 reviews_one_per_user). 두 번째로
//    쓰면 새로 쌓지 않고 **고쳐 쓴다** — 그래서 POST 하나로 등록과 수정을 다 한다.
//
//  ⚠️옛 /api/submit-review 와는 다른 자리다. 그쪽은 건당결제 paymentId 로 신원을
//    삼던 배선이라 결제가 폐기되면서 함께 죽었다(그 파일의 주석 참고).
// ==========================================================================

export const dynamic = "force-dynamic";

const json = (body: unknown, status: number, origin: string | null) =>
  Response.json(body, { status, headers: corsHeaders(origin) });

// 브라우저의 사전 확인(preflight). POST 가 multipart 라 반드시 한 번 들어온다.
export async function OPTIONS(request: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(request.headers.get("origin")) });
}

// --------------------------------------------------------------------------
//  GET — 목록
// --------------------------------------------------------------------------
export async function GET(request: Request) {
  const origin = request.headers.get("origin");
  if (!CENTRAL.serviceKey) return json({ error: "server_misconfigured" }, 500, origin);

  const url = new URL(request.url);
  const product = url.searchParams.get("product");
  if (!isReviewProduct(product)) return json({ error: "bad_product" }, 400, origin);

  // 🔴화면이 부르는 수를 그대로 믿지 않는다. 큰 수를 넣어 표를 통째로 긁어 가는
  //   길을 여기서 막는다.
  const asked = Number(url.searchParams.get("limit") ?? 20);
  const limit = Math.min(LIST_MAX, Math.max(1, Number.isFinite(asked) ? asked : 20));

  // 로그인했으면 "내 후기"를 표시해 준다. 안 했으면 null 이고, 목록은 그대로 내려간다.
  const uid = await uidFromReviewRequest(request);

  const r = await sbFetch(
    `reviews?product=eq.${product}&status=eq.visible&select=id,product,user_id,nickname,rating,body,photo_url,created_at&order=created_at.desc&limit=${limit}`,
  );
  if (!r.ok) {
    console.error("[reviews] 목록 실패:", r.status, await r.text());
    return json({ error: "read_failed" }, 500, origin);
  }
  const rows = (await r.json()) as ReviewRow[];

  // 🔴"내 후기"를 따로 뽑아 준다. 화면이 목록에서 찾아 쓰면, 내 후기가 최신
  //   20개 밖으로 밀려난 순간 [고쳐쓰기]가 [새로쓰기]로 바뀌고 저장에서 튕긴다.
  //   목록 안에 있으면 그걸 쓰고(요청 한 번), 없을 때만 한 줄을 더 읽는다.
  const inList = uid ? rows.find((x) => x.user_id === uid) : undefined;
  const mine = inList ? toReviewOut(inList, uid) : await fetchMine(product, uid);

  return json(
    { signedIn: !!uid, mine, reviews: rows.map((x) => toReviewOut(x, uid)) },
    200,
    origin,
  );
}

// 목록 밖으로 밀려난 내 후기를 한 줄만 따로 읽는다. 로그인 안 했으면 안 부른다.
async function fetchMine(product: string, uid: string | null) {
  if (!uid) return null;
  const r = await sbFetch(
    `reviews?product=eq.${product}&user_id=eq.${uid}&select=id,product,user_id,nickname,rating,body,photo_url,created_at&limit=1`,
  );
  if (!r.ok) return null;
  const rows = (await r.json()) as ReviewRow[];
  return rows[0] ? toReviewOut(rows[0], uid) : null;
}

// --------------------------------------------------------------------------
//  POST — 쓰기·고쳐쓰기
// --------------------------------------------------------------------------
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!CENTRAL.serviceKey) return json({ error: "server_misconfigured" }, 500, origin);

  const uid = await uidFromReviewRequest(request);
  // 🔴로그인만 하면 쓸 수 있다(2026-09-05 사용자 결정) — 구독 여부는 안 본다.
  //   후기는 많을수록 좋고, 지금은 구독 자체를 안 팔고 있다.
  if (!uid) return json({ error: "unauthorized" }, 401, origin);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ error: "bad_body" }, 400, origin);
  }

  const product = form.get("product");
  if (!isReviewProduct(product)) return json({ error: "bad_product" }, 400, origin);

  const nickname = String(form.get("nickname") ?? "").trim().slice(0, NICKNAME_MAX);
  const body = String(form.get("body") ?? "").trim().slice(0, BODY_MAX);
  if (!nickname || !body) return json({ error: "missing_fields" }, 400, origin);

  const rawRating = Number(form.get("rating"));
  const rating = Number.isInteger(rawRating) && rawRating >= 1 && rawRating <= 5 ? rawRating : null;

  const lang = String(form.get("lang") ?? "").slice(0, 8) || null;

  // 이미 쓴 것이 있나. 있으면 고쳐 쓴다(새로 쌓지 않는다).
  const prev = await fetchMine(product, uid);

  // ── 사진 ────────────────────────────────────────────────────────────
  //  🔴사진이 없으면 **손대지 않는다**. 고쳐쓰기에서 사진을 안 올렸다는 것은
  //    "사진을 지워라"가 아니라 "글만 고친다"는 뜻이다.
  //    ⇒ 지우려면 removePhoto=1 을 따로 보낸다.
  let photoUrl: string | null | undefined =
    form.get("removePhoto") === "1" ? null : undefined;

  const photo = form.get("photo");
  if (photo instanceof File && photo.size > 0) {
    if (!PHOTO_TYPES.includes(photo.type)) return json({ error: "bad_photo_type" }, 400, origin);
    if (photo.size > PHOTO_MAX_BYTES) return json({ error: "photo_too_large" }, 413, origin);
    const uploaded = await uploadPhoto(product, uid, photo);
    if (uploaded) photoUrl = uploaded;
    // 올리기가 실패해도 후기는 저장한다 — 글이 사진 때문에 통째로 날아가면 안 된다.
    else console.error("[reviews] 사진 업로드 실패 — 글만 저장한다");
  }

  const now = new Date().toISOString();
  const payload: Record<string, unknown> = {
    product, user_id: uid, nickname, rating, body, lang, updated_at: now,
  };
  if (photoUrl !== undefined) payload.photo_url = photoUrl;

  const r = prev
    ? await sbFetch(`reviews?id=eq.${prev.id}`, {
        method: "PATCH", body: JSON.stringify(payload), prefer: "return=minimal",
      })
    : await sbFetch("reviews", {
        method: "POST", body: JSON.stringify(payload), prefer: "return=minimal",
      });

  if (!r.ok) {
    console.error("[reviews] 저장 실패:", r.status, await r.text());
    return json({ error: "write_failed" }, 500, origin);
  }
  return json({ ok: true, updated: !!prev }, 200, origin);
}

// --------------------------------------------------------------------------
//  DELETE — 내 후기 지우기
//  🔴제 글만 지운다. 조건에 user_id 를 넣었으므로 id 를 알아도 남의 글은 안 지워진다.
// --------------------------------------------------------------------------
export async function DELETE(request: Request) {
  const origin = request.headers.get("origin");
  if (!CENTRAL.serviceKey) return json({ error: "server_misconfigured" }, 500, origin);

  const uid = await uidFromReviewRequest(request);
  if (!uid) return json({ error: "unauthorized" }, 401, origin);

  const product = new URL(request.url).searchParams.get("product");
  if (!isReviewProduct(product)) return json({ error: "bad_product" }, 400, origin);

  const r = await sbFetch(`reviews?product=eq.${product}&user_id=eq.${uid}`, {
    method: "DELETE", prefer: "return=minimal",
  });
  if (!r.ok) {
    console.error("[reviews] 삭제 실패:", r.status, await r.text());
    return json({ error: "delete_failed" }, 500, origin);
  }
  return json({ ok: true }, 200, origin);
}

// --------------------------------------------------------------------------
//  사진을 Storage(reviews 버킷)에 올리고 공개 주소를 돌려준다.
//
//  🔴apikey 헤더가 없으면 sb_secret_ 키를 Storage 가 JWT 로 읽으려다
//    "Invalid Compact JWS" 로 거절한다(2026-09-03 에 잡은 버그 — 그동안 사진만
//    조용히 빠지고 후기는 저장됐다). Authorization 만으로는 부족하다.
//  🔴파일 이름에 uid 를 쓴다. 한 사람이 한 후기라 덮어쓰면 되고, 옛 사진이
//    버킷에 쌓이지 않는다(x-upsert).
//    ⚠️uid 가 파일 이름으로 공개 주소에 드러난다 — 그래도 계정 식별자일 뿐
//      로그인에 쓸 수 있는 값이 아니다(토큰이 아니다).
// --------------------------------------------------------------------------
async function uploadPhoto(product: string, uid: string, photo: File): Promise<string | null> {
  const ext = (PHOTO_TYPES.indexOf(photo.type) >= 0 ? photo.type.split("/")[1] : "jpg")
    .replace("jpeg", "jpg");
  // 꼬리의 시간은 캐시 무효화용이다 — 같은 이름으로 덮어쓰면 CDN 이 옛 사진을 계속 준다.
  const name = `${product}/${uid}-${Date.now()}.${ext}`;
  try {
    const res = await fetch(`${CENTRAL.supabaseUrl}/storage/v1/object/reviews/${name}`, {
      method: "POST",
      headers: {
        apikey: CENTRAL.serviceKey,
        Authorization: `Bearer ${CENTRAL.serviceKey}`,
        "Content-Type": photo.type,
        "x-upsert": "true",
      },
      body: await photo.arrayBuffer(),
    });
    if (!res.ok) {
      console.error("[reviews] Storage 실패:", res.status, await res.text());
      return null;
    }
    return `${CENTRAL.supabaseUrl}/storage/v1/object/public/reviews/${name}`;
  } catch (e) {
    console.error("[reviews] Storage 예외:", e);
    return null;
  }
}
