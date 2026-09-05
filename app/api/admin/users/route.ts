import { requireAdmin } from "@/lib/admin-auth";
import { fetchUsers, PRODUCT_LABEL, type UserRow } from "@/lib/admin-data";

// ==========================================================================
//  GET /api/admin/users — /admin 아래 사용자 표가 부르는 곳.
//
//  🔴관리자가 아니면 **404** 다. 403 이면 "여기 뭔가 있다"고 알려 주는 꼴이라,
//    주소를 찍어 본 사람에게 존재 자체를 감춘다(화면 쪽도 같은 규칙).
//
//  🔴검색·정렬·쪽나눔은 전부 DB 가 한다(admin_user_rows). 여기서는 물음표 뒤의
//    글자를 그대로 넘긴다 — 정렬 칸 이름은 DB 함수가 **목록에 있는 것만** 받는다.
//
//  🔴이메일은 이미 가려진 채로 온다. 이 파일이 원문을 볼 일이 없다.
//
//  ⚠️format=csv 는 걸린 사람 전부를 한 번에 내린다(최대 5000). 표의 쪽나눔과
//    무관하다 — "지금 보이는 것"이 아니라 "지금 걸러진 것"을 받는 게 맞다.
// ==========================================================================

export const dynamic = "force-dynamic";

const CSV_MAX = 5000;

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  // 🔴맨 앞의 =+-@ 는 스프레드시트가 수식으로 읽는다(CSV 주입). 작은따옴표로 막는다.
  const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

function toCsv(rows: UserRow[]): string {
  const head = ["닉네임", "이메일(가림)", "국가", "등급", "가입일", "활동건수", "최근활동", "프로그램", "크레딧"];
  const body = rows.map((r) =>
    [
      r.name ?? "",
      r.email,
      r.country ?? "",
      r.plan,
      r.created_at.slice(0, 10),
      r.events,
      r.last_active ? r.last_active.slice(0, 19).replace("T", " ") : "",
      r.products.map((p) => PRODUCT_LABEL[p] ?? p).join(" "),
      r.credits_used,
    ].map(csvCell).join(","),
  );
  // 🔴BOM 을 붙인다. 없으면 엑셀이 한글을 깨뜨린다.
  return "﻿" + [head.map(csvCell).join(","), ...body].join("\r\n");
}

export async function GET(request: Request) {
  // 🔴통로는 로그인 화면으로 안 보낸다 — 부르는 쪽이 fetch 라 리다이렉트를 따라가
  //   HTML 을 JSON 으로 읽으려 든다. 로그인 여부와 무관하게 404 하나로 끝낸다.
  if (!(await requireAdmin()).ok) return new Response("Not found", { status: 404 });

  const p = new URL(request.url).searchParams;
  const wantCsv = p.get("format") === "csv";

  const query = {
    q: p.get("q") ?? undefined,
    country: p.get("country") ?? undefined,
    plan: p.get("plan") ?? undefined,
    product: p.get("product") ?? undefined,
    active: p.get("active") ?? undefined,
    sort: p.get("sort") ?? undefined,
    dir: p.get("dir") ?? undefined,
    limit: wantCsv ? CSV_MAX : Math.min(Math.max(Number(p.get("limit")) || 25, 1), 200),
    offset: wantCsv ? 0 : Math.max(Number(p.get("offset")) || 0, 0),
  };

  try {
    const page = await fetchUsers(query);
    if (!wantCsv) return Response.json(page);

    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(toCsv(page.rows), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="masslabs-users-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return Response.json({ error: "query_failed" }, { status: 500 });
  }
}
