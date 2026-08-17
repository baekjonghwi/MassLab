-- ==========================================================================
--  003. MassLabs 중앙(public)에 빠져 있던 표를 채운다.
--
--  ① checkout_sessions — 🔴지금 이게 없어서 구독 결제가 아예 동작하지 않는다.
--     /api/subscribe/session 과 confirm 이 이 표를 읽는다.
--  ② device_links / plugin_tokens — 라이노 플러그인 로그인.
-- ==========================================================================

-- ── ① 결제 세션 ───────────────────────────────────────────────────────────
-- 앱이 자기 로그인 세션으로 행을 만들고 랜덤 sid만 결제 페이지에 넘긴다.
-- 🔴신원(user_id)은 URL에 절대 싣지 않는다 — 서버가 sid로 조회한다.
create table public.checkout_sessions (
  id         text primary key default gen_random_uuid()::text,
  user_id    uuid not null references auth.users(id) on delete cascade,
  product    text not null,
  plan       text not null check (plan in ('plus','pro','max','all')),
  status     text not null default 'pending' check (status in ('pending','done','failed')),
  note       text,
  expires_at timestamptz not null default now() + interval '30 minutes',
  created_at timestamptz not null default now()
);
create index checkout_sessions_user_idx on public.checkout_sessions (user_id, created_at desc);

alter table public.checkout_sessions enable row level security;

-- 🔴사용자는 자기 행을 만들고 볼 수만 있다. status·plan을 고치는 건 서버(service_role)뿐이다.
--   UPDATE를 열어 주면 결제도 안 하고 status='done'으로 바꿔 버릴 수 있다.
create policy "own insert" on public.checkout_sessions
  for insert to authenticated with check (auth.uid() = user_id);
create policy "own select" on public.checkout_sessions
  for select to authenticated using (auth.uid() = user_id);


-- ── ② 라이노 ↔ 브라우저 연결 (1회용) ──────────────────────────────────────
-- 플러그인이 랜덤 device_id를 만들어 브라우저를 열고, 웹이 로그인 후 user_id를
-- 채운다. 플러그인이 [연결 확인]을 누를 때 토큰으로 교환하고 이 행은 소각된다.
-- 🔴폴링하지 않는다. 사용자가 버튼을 누를 때만 요청이 간다.
create table public.device_links (
  device_id  text primary key,
  user_id    uuid references auth.users(id) on delete cascade,
  linked_at  timestamptz,
  expires_at timestamptz not null default now() + interval '10 minutes',
  created_at timestamptz not null default now()
);

-- 🔴정책을 하나도 만들지 않는다 = service_role만 만질 수 있다.
--   anon에 열면 device_id를 찍어 보며 남의 연결을 가로챌 수 있다.
alter table public.device_links enable row level security;


-- ── ③ 플러그인 장기 토큰 ──────────────────────────────────────────────────
-- 🔴원문을 저장하지 않는다 — DB가 새도 토큰이 그대로 새지는 않게.
--   좌석 제한(계정당 동시 N대)은 revoked_at is null 인 행을 세어 건다.
create table public.plugin_tokens (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  token_hash   text not null unique,
  device_name  text,
  last_seen_at timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);
create index plugin_tokens_active_idx
  on public.plugin_tokens (user_id) where revoked_at is null;

alter table public.plugin_tokens enable row level security;   -- 정책 없음 = 서버 전용


-- ── 만료 청소 ─────────────────────────────────────────────────────────────
-- 🔴안 지우면 device_links가 영원히 쌓인다. /api/cron/billing이 매일 도니
--   거기서 같이 부르면 된다(별도 크론 불필요).
create or replace function public.purge_expired_links()
returns void language sql security definer set search_path to 'public' as $$
  delete from public.device_links where expires_at < now();
$$;
