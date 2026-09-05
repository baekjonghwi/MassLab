import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from "./supabase";
import { CENTRAL, sbFetch } from "./subscription";

// ==========================================================================
//  /admin 의 문지기 — **서버 전용**.
//
//  🔴관리자 표시는 profiles.plan = 'admin' 하나다. 별도의 역할 표를 만들지
//    않았다 — 이미 plan 이 'free|plus|pro|max|admin' 을 갖고 있고, 그 값을
//    lib/subscription.ts 가 "덮어쓰지 않는 계정"으로 이미 특별 취급한다.
//    ⛔환경변수에 이메일을 적어 두는 식으로 하지 말 것. 사람이 바뀌면 재배포다.
//
//  🔴판정은 **서버 키로** 한다. 브라우저가 제 등급을 스스로 주장하게 두면
//    개발자도구에서 admin 이라고 말하면 그만이다. 여기서는 쿠키로 신원(uid)만
//    받고, 그 uid 의 plan 은 service_role 로 DB 에서 직접 읽는다.
//
//  🔴DB 함수(admin_overview·admin_user_rows)에는 anon·authenticated 실행 권한이
//    없다. 그래서 이 문을 우회해도 데이터에 닿지 못한다 — 문이 둘이다.
//    supabase/migrations/011_admin_dashboard.sql 과 한 벌로 볼 것.
//
//  ⛔"use client" 파일에서 import 하지 말 것(next/headers 가 들어 있다).
// ==========================================================================

// 🔴"못 들어온다"를 한 덩이로 뭉치지 않는다 — 로그인을 안 한 것과 관리자가
//   아닌 것은 **다음에 할 일이 다르다.** 앞엣것은 로그인하면 되고, 뒤엣것은
//   할 수 있는 게 없다. 부르는 쪽이 그 둘을 갈라 쓸 수 있어야 한다.
export type AdminGate =
  | { ok: true; uid: string; email: string }
  | { ok: false; signedIn: boolean };

/** 로그인한 사람의 uid. 없으면 null. */
async function uidFromCookies(): Promise<string | null> {
  try {
    const jar = await cookies();
    const client = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      cookies: {
        getAll: () => jar.getAll(),
        // 서버 컴포넌트에서는 쿠키를 못 쓴다(Next 규칙). 갱신은 화면 쪽 몫이다.
        setAll: () => {},
      },
    });
    const { data } = await client.auth.getUser();
    return data.user?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * 지금 요청이 관리자인가.
 * 🔴화면과 API 가 **같은 함수**를 부른다 — 판정이 두 곳으로 갈리지 않게.
 *   다만 거절하는 **방식**은 부르는 쪽이 정한다:
 *   · 화면 — 로그인 안 했으면 /login 으로 보내고, 관리자가 아니면 404.
 *   · API  — 둘 다 404. 통로가 로그인 화면을 띄울 일은 없다.
 */
export async function requireAdmin(): Promise<AdminGate> {
  // 서버 키가 없으면 아무것도 판정할 수 없다. 로그인 화면으로 보내 봐야
  // 돌아와서 또 막히므로 "로그인은 된 것"으로 쳐서 404 로 끝낸다.
  if (!CENTRAL.serviceKey) return { ok: false, signedIn: true };

  const uid = await uidFromCookies();
  if (!uid) return { ok: false, signedIn: false };

  const r = await sbFetch(`profiles?id=eq.${uid}&select=plan`);
  if (!r.ok) return { ok: false, signedIn: true };
  const rows = (await r.json()) as { plan?: string }[];
  if (rows[0]?.plan !== "admin") return { ok: false, signedIn: true };

  // 화면 오른쪽 위에 "누구로 보고 있는지"를 적어 준다. 계정을 두 개 쓰다가
  // 엉뚱한 쪽에서 보고 있는 것을 눈치채지 못하는 일이 잦다.
  const u = await fetch(`${CENTRAL.supabaseUrl}/auth/v1/admin/users/${uid}`, {
    headers: { Authorization: `Bearer ${CENTRAL.serviceKey}`, apikey: CENTRAL.serviceKey },
    cache: "no-store",
  });
  const email = u.ok ? (((await u.json()) as { email?: string }).email ?? "") : "";
  return { ok: true, uid, email };
}
