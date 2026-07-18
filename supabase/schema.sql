-- 모디(Modi) 프로토타입 스키마
-- Supabase 프로젝트 > SQL Editor 에 통째로 붙여넣고 Run 하세요.

-- 1) 이벤트(초대장)
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  theme text not null default 'birthday',
  starts_at timestamptz,
  place text,
  description text,
  created_at timestamptz not null default now()
);

-- 2) RSVP(참석 응답)
create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  guest_name text not null,
  status text not null check (status in ('going','maybe','no')),
  guest_token text,
  created_at timestamptz not null default now()
);

create index if not exists rsvps_event_id_idx on public.rsvps(event_id);

-- 3) RLS: 프로토타입이라 익명(anon) 사용자에게 읽기/쓰기 허용
alter table public.events enable row level security;
alter table public.rsvps enable row level security;

-- 이벤트: 누구나 읽기/생성 (프로토타입용)
drop policy if exists "events_read" on public.events;
create policy "events_read" on public.events for select using (true);
drop policy if exists "events_insert" on public.events;
create policy "events_insert" on public.events for insert with check (true);

-- RSVP: 누구나 읽기/생성/수정 (본인 응답 수정 위해 update 허용)
drop policy if exists "rsvps_read" on public.rsvps;
create policy "rsvps_read" on public.rsvps for select using (true);
drop policy if exists "rsvps_insert" on public.rsvps;
create policy "rsvps_insert" on public.rsvps for insert with check (true);
drop policy if exists "rsvps_update" on public.rsvps;
create policy "rsvps_update" on public.rsvps for update using (true);

-- 4) (선택) 실시간 명단 스노볼: rsvps 테이블 realtime 켜기
alter publication supabase_realtime add table public.rsvps;

-- [마이그레이션 2026-07-16] 꾸미기 에디터 + 호스트 식별
alter table public.events
  add column if not exists cover text,
  add column if not exists stickers jsonb not null default '[]',
  add column if not exists effect boolean not null default true,
  add column if not exists host_token text;

-- [마이그레이션 2026-07-16 #2] 이펙트 종류화 (boolean → text)
alter table public.events drop column if exists effect;
alter table public.events add column effect text not null default 'float';

-- 커버 이미지 저장소 (public 버킷 + 익명 업로드/읽기)
insert into storage.buckets (id, name, public) values ('covers','covers',true)
on conflict (id) do nothing;
drop policy if exists "covers_upload" on storage.objects;
create policy "covers_upload" on storage.objects for insert with check (bucket_id = 'covers');
drop policy if exists "covers_read" on storage.objects;
create policy "covers_read" on storage.objects for select using (bucket_id = 'covers');

-- [마이그레이션 2026-07-17] RSVP 한마디 필드
alter table public.rsvps add column if not exists comment text;
