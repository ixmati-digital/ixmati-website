create table if not exists public.webvision_leads (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  origin text,
  utm jsonb default '{}'::jsonb,
  business_name text not null,
  business_type text not null,
  whatsapp text,
  email text,
  progress text not null default 'started',
  action_final text,
  consent boolean not null default false
);

create table if not exists public.webvision_sessions (
  id uuid primary key default gen_random_uuid(),
  session_id text not null unique,
  lead_id uuid references public.webvision_leads(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  attribution jsonb default '{}'::jsonb,
  progress text not null default 'started',
  abandoned_at timestamptz
);

create table if not exists public.webvision_answers (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  created_at timestamptz not null default now(),
  answers jsonb not null default '{}'::jsonb
);

create table if not exists public.webvision_recommendations (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  created_at timestamptz not null default now(),
  base_plan_id text,
  solution_type text,
  custom_name text,
  estimated_price numeric,
  range_low numeric,
  range_high numeric,
  complexity_level text,
  time_label text,
  selected_features jsonb default '[]'::jsonb,
  recommendation jsonb not null default '{}'::jsonb
);

create table if not exists public.webvision_appointments (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  created_at timestamptz not null default now(),
  requested_date date,
  requested_time text,
  name text,
  whatsapp text,
  email text,
  summary jsonb default '{}'::jsonb,
  status text not null default 'requested'
);

create table if not exists public.webvision_purchase_intents (
  id uuid primary key default gen_random_uuid(),
  session_id text not null,
  created_at timestamptz not null default now(),
  estimated_price numeric,
  deposit_suggested numeric,
  selected_features jsonb default '[]'::jsonb,
  summary jsonb default '{}'::jsonb,
  status text not null default 'new'
);

alter table public.webvision_leads enable row level security;
alter table public.webvision_sessions enable row level security;
alter table public.webvision_answers enable row level security;
alter table public.webvision_recommendations enable row level security;
alter table public.webvision_appointments enable row level security;
alter table public.webvision_purchase_intents enable row level security;

create policy "webvision anon lead insert"
  on public.webvision_leads for insert
  to anon
  with check (true);

create policy "webvision anon session insert"
  on public.webvision_sessions for insert
  to anon
  with check (true);

create policy "webvision anon answers insert"
  on public.webvision_answers for insert
  to anon
  with check (true);

create policy "webvision anon recommendations insert"
  on public.webvision_recommendations for insert
  to anon
  with check (true);

create policy "webvision anon appointments insert"
  on public.webvision_appointments for insert
  to anon
  with check (true);

create policy "webvision anon purchase intents insert"
  on public.webvision_purchase_intents for insert
  to anon
  with check (true);

create index if not exists webvision_leads_session_idx on public.webvision_leads(session_id);
create index if not exists webvision_sessions_session_idx on public.webvision_sessions(session_id);
create index if not exists webvision_recommendations_session_idx on public.webvision_recommendations(session_id);
