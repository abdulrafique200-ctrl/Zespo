-- ============================================================
-- ZESPO — production schema
-- Run this in the Supabase SQL editor (or `supabase db push`).
-- Assumes Supabase Auth is handling actual login/password storage —
-- nothing in this file ever stores a plaintext password.
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- profiles ----------
-- One row per auth.users row. role starts 'unset' until the user
-- picks one on the RoleSelect screen.
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  username      text unique not null,
  real_name     text not null,
  role          text not null default 'unset',
  pfp_url       text,
  banner        jsonb default '{"type":"static","value":"linear-gradient(135deg,#333,#111)"}'::jsonb,
  song          text default '',
  playing       text default '',
  created_at    timestamptz not null default now()
);

-- Only admin/developer roles may see other users' emails; app code
-- should read email from auth.users via a server-side function if
-- ever needed, not from this table.
alter table profiles enable row level security;

create policy "profiles are readable by any authenticated user"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- ---------- invite codes ----------
-- Replaces the hardcoded "2025" register code. Admins manage rows here.
create table if not exists invite_codes (
  code        text primary key,
  active      boolean not null default true,
  created_by  uuid references profiles(id),
  created_at  timestamptz not null default now()
);

alter table invite_codes enable row level security;

create policy "invite codes readable by authenticated (to validate at signup via RPC only)"
  on invite_codes for select
  using (false); -- no direct client reads; validated via the RPC below

create policy "only admins manage invite codes"
  on invite_codes for all
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','admin+developer'))
  );

-- RPC: validate + (optionally) redeem a code without exposing the table to clients.
create or replace function redeem_invite_code(p_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  ok boolean;
begin
  select active into ok from invite_codes where code = p_code;
  return coalesce(ok, false);
end;
$$;

-- Seed one starter code — change/rotate this after launch.
insert into invite_codes (code) values ('WELCOME-2026')
  on conflict do nothing;

-- ---------- connections (mutual, accepted message requests) ----------
create table if not exists connections (
  id          uuid primary key default uuid_generate_v4(),
  user_a      uuid not null references profiles(id) on delete cascade,
  user_b      uuid not null references profiles(id) on delete cascade,
  created_at  timestamptz not null default now(),
  constraint ordered_pair check (user_a < user_b),
  unique (user_a, user_b)
);

alter table connections enable row level security;

create policy "users see their own connections"
  on connections for select
  using (auth.uid() in (user_a, user_b));

create policy "users can create connections they're part of"
  on connections for insert
  with check (auth.uid() in (user_a, user_b));

-- ---------- message requests ----------
create table if not exists message_requests (
  id          uuid primary key default uuid_generate_v4(),
  from_id     uuid not null references profiles(id) on delete cascade,
  to_id       uuid not null references profiles(id) on delete cascade,
  status      text not null default 'pending', -- pending | accepted | declined
  created_at  timestamptz not null default now(),
  unique (from_id, to_id)
);

alter table message_requests enable row level security;

create policy "users see requests they sent or received"
  on message_requests for select
  using (auth.uid() in (from_id, to_id));

create policy "users can send requests"
  on message_requests for insert
  with check (auth.uid() = from_id);

create policy "recipient can update status"
  on message_requests for update
  using (auth.uid() = to_id);

-- ---------- messages ----------
create table if not exists messages (
  id          uuid primary key default uuid_generate_v4(),
  from_id     uuid not null references profiles(id) on delete cascade,
  to_id       uuid not null references profiles(id) on delete cascade,
  text        text not null,
  created_at  timestamptz not null default now()
);

create index if not exists messages_pair_idx on messages (least(from_id, to_id), greatest(from_id, to_id), created_at);

alter table messages enable row level security;

create policy "users see messages they sent or received"
  on messages for select
  using (auth.uid() in (from_id, to_id));

create policy "users can send messages as themselves"
  on messages for insert
  with check (auth.uid() = from_id);

-- ---------- stories ----------
create table if not exists stories (
  id          uuid primary key default uuid_generate_v4(),
  owner_id    uuid not null references profiles(id) on delete cascade,
  image_url   text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default (now() + interval '24 hours')
);

alter table stories enable row level security;

create policy "stories readable by any authenticated user"
  on stories for select
  using (auth.role() = 'authenticated');

create policy "users can post their own stories"
  on stories for insert
  with check (auth.uid() = owner_id);

create policy "users can delete their own stories"
  on stories for delete
  using (auth.uid() = owner_id);

-- ---------- announcements (admin/system feed) ----------
create table if not exists announcements (
  id          uuid primary key default uuid_generate_v4(),
  text        text not null,
  kind        text default 'info',
  created_at  timestamptz not null default now()
);

alter table announcements enable row level security;

create policy "announcements readable by authenticated"
  on announcements for select
  using (auth.role() = 'authenticated');

create policy "only privileged roles can post announcements"
  on announcements for insert
  with check (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','developer','admin+developer'))
  );

-- ---------- reports (support tickets to moderator) ----------
create table if not exists reports (
  id          uuid primary key default uuid_generate_v4(),
  from_id     uuid not null references profiles(id) on delete cascade,
  issue       text not null,
  summary     text,
  created_at  timestamptz not null default now()
);

alter table reports enable row level security;

create policy "author can read their own report"
  on reports for select
  using (
    auth.uid() = from_id
    or exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','developer','admin+developer'))
  );

create policy "users can file reports"
  on reports for insert
  with check (auth.uid() = from_id);

-- ---------- suggestions (public feed) ----------
create table if not exists suggestions (
  id          uuid primary key default uuid_generate_v4(),
  from_id     uuid not null references profiles(id) on delete cascade,
  text        text not null,
  created_at  timestamptz not null default now()
);

alter table suggestions enable row level security;

create policy "suggestions readable by authenticated"
  on suggestions for select
  using (auth.role() = 'authenticated');

create policy "users can post suggestions"
  on suggestions for insert
  with check (auth.uid() = from_id);

-- ---------- realtime ----------
alter publication supabase_realtime add table messages, announcements, message_requests, stories;
