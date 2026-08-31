create table if not exists public.salesman_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  full_name text,
  email text,
  phone text,
  city_state text,
  status text not null default 'applicant',
  commission_rate numeric not null default 20,
  preferred_industries text,
  availability text,
  profile_photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null,
  phone text,
  city_state text,
  sales_experience text,
  industries text,
  availability text,
  why_join text,
  resume_link text,
  referral_source text,
  status text not null default 'pending_review',
  admin_notes text,
  test_score numeric,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create table if not exists public.onboarding_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  section_id text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  unique(user_id, section_id)
);

create table if not exists public.sales_tests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  attempt_number integer not null default 1,
  answers jsonb not null default '{}'::jsonb,
  score numeric not null,
  passed boolean not null default false,
  submitted_at timestamptz not null default now()
);

create table if not exists public.sales_exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'in_progress',
  started_at timestamptz not null default now(),
  expires_at timestamptz not null,
  submitted_at timestamptz,
  answers jsonb not null default '{}'::jsonb,
  score numeric,
  passed boolean not null default false,
  locked_reason text,
  reset_by text,
  reset_at timestamptz
);

create table if not exists public.sales_leads (
  id uuid primary key default gen_random_uuid(),
  assigned_salesman_id uuid references public.salesman_profiles(id) on delete set null,
  business_name text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  industry text,
  service_interest text,
  estimated_value numeric default 0,
  status text not null default 'new',
  next_follow_up date,
  admin_notes text,
  created_by_admin text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sales_lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.sales_leads(id) on delete cascade,
  salesman_id uuid not null references public.salesman_profiles(id) on delete cascade,
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.sales_tasks (
  id uuid primary key default gen_random_uuid(),
  salesman_id uuid not null references public.salesman_profiles(id) on delete cascade,
  lead_id uuid references public.sales_leads(id) on delete set null,
  title text not null,
  description text,
  due_date date,
  status text not null default 'open',
  created_by_admin text,
  created_at timestamptz not null default now()
);

create table if not exists public.qr_code_requests (
  id uuid primary key default gen_random_uuid(),
  salesman_id uuid not null references public.salesman_profiles(id) on delete cascade,
  client_name text not null,
  destination_url text not null,
  purpose text,
  preferred_label text,
  needed_by date,
  notes text,
  status text not null default 'pending',
  admin_response text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.invoice_requests (
  id uuid primary key default gen_random_uuid(),
  salesman_id uuid not null references public.salesman_profiles(id) on delete cascade,
  client_name text not null,
  client_email text,
  client_phone text,
  service_package text,
  price numeric default 0,
  deposit_required boolean default false,
  special_terms text,
  due_date date,
  notes text,
  status text not null default 'pending',
  admin_response text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  salesman_id uuid not null references public.salesman_profiles(id) on delete cascade,
  lead_id uuid references public.sales_leads(id) on delete set null,
  deal_value numeric not null default 0,
  commission_rate numeric not null default 20,
  commission_amount numeric generated always as (deal_value * commission_rate / 100) stored,
  status text not null default 'unpaid',
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.salesman_profiles enable row level security;
alter table public.sales_applications enable row level security;
alter table public.onboarding_progress enable row level security;
alter table public.sales_tests enable row level security;
alter table public.sales_exam_attempts enable row level security;
alter table public.sales_leads enable row level security;
alter table public.sales_lead_notes enable row level security;
alter table public.sales_tasks enable row level security;
alter table public.qr_code_requests enable row level security;
alter table public.invoice_requests enable row level security;
alter table public.commissions enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email') in ('reimagbs@gmail.com', 'reimagebs@gmail.com'), false);
$$;

drop policy if exists "sales profiles owner read" on public.salesman_profiles;
drop policy if exists "sales profiles owner insert" on public.salesman_profiles;
drop policy if exists "sales profiles owner update" on public.salesman_profiles;
drop policy if exists "sales applications owner read" on public.sales_applications;
drop policy if exists "sales applications owner insert" on public.sales_applications;
drop policy if exists "sales applications admin update" on public.sales_applications;
drop policy if exists "sales applications public insert" on public.sales_applications;
drop policy if exists "sales applications admin or claimant update" on public.sales_applications;
drop policy if exists "onboarding owner read" on public.onboarding_progress;
drop policy if exists "onboarding owner insert" on public.onboarding_progress;
drop policy if exists "onboarding owner update" on public.onboarding_progress;
drop policy if exists "tests owner read" on public.sales_tests;
drop policy if exists "tests owner insert" on public.sales_tests;
drop policy if exists "exam attempts owner read" on public.sales_exam_attempts;
drop policy if exists "exam attempts owner insert" on public.sales_exam_attempts;
drop policy if exists "exam attempts owner update" on public.sales_exam_attempts;
drop policy if exists "sales leads owner read" on public.sales_leads;
drop policy if exists "sales leads admin insert" on public.sales_leads;
drop policy if exists "sales leads admin update" on public.sales_leads;
drop policy if exists "lead notes owner read" on public.sales_lead_notes;
drop policy if exists "lead notes owner insert" on public.sales_lead_notes;
drop policy if exists "tasks owner read" on public.sales_tasks;
drop policy if exists "tasks admin write" on public.sales_tasks;
drop policy if exists "qr owner read" on public.qr_code_requests;
drop policy if exists "qr owner insert" on public.qr_code_requests;
drop policy if exists "qr admin update" on public.qr_code_requests;
drop policy if exists "invoice owner read" on public.invoice_requests;
drop policy if exists "invoice owner insert" on public.invoice_requests;
drop policy if exists "invoice admin update" on public.invoice_requests;
drop policy if exists "commissions owner read" on public.commissions;
drop policy if exists "commissions admin write" on public.commissions;

create policy "sales profiles owner read" on public.salesman_profiles for select using (user_id = auth.uid() or public.is_admin());
create policy "sales profiles owner insert" on public.salesman_profiles for insert with check (user_id = auth.uid() or public.is_admin());
create policy "sales profiles owner update" on public.salesman_profiles for update using (user_id = auth.uid() or public.is_admin());

create policy "sales applications owner read" on public.sales_applications for select using (
  user_id = auth.uid()
  or lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  or public.is_admin()
);
create policy "sales applications public insert" on public.sales_applications for insert with check (
  user_id is null or user_id = auth.uid() or public.is_admin()
);
create policy "sales applications admin or claimant update" on public.sales_applications for update using (
  public.is_admin()
  or (user_id is null and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
) with check (
  public.is_admin()
  or user_id = auth.uid()
);

create policy "onboarding owner read" on public.onboarding_progress for select using (user_id = auth.uid() or public.is_admin());
create policy "onboarding owner insert" on public.onboarding_progress for insert with check (user_id = auth.uid() or public.is_admin());
create policy "onboarding owner update" on public.onboarding_progress for update using (user_id = auth.uid() or public.is_admin());

create policy "tests owner read" on public.sales_tests for select using (user_id = auth.uid() or public.is_admin());
create policy "tests owner insert" on public.sales_tests for insert with check (user_id = auth.uid() or public.is_admin());

create policy "exam attempts owner read" on public.sales_exam_attempts for select using (user_id = auth.uid() or public.is_admin());
create policy "exam attempts owner insert" on public.sales_exam_attempts for insert with check (
  public.is_admin() or (user_id = auth.uid() and status = 'in_progress')
);
create policy "exam attempts owner update" on public.sales_exam_attempts for update using (
  user_id = auth.uid() or public.is_admin()
) with check (
  public.is_admin() or (user_id = auth.uid() and status in ('submitted','timed_out'))
);

create policy "sales leads owner read" on public.sales_leads for select using (
  public.is_admin() or assigned_salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);
create policy "sales leads admin insert" on public.sales_leads for insert with check (public.is_admin());
create policy "sales leads admin update" on public.sales_leads for update using (public.is_admin());

create policy "lead notes owner read" on public.sales_lead_notes for select using (
  public.is_admin() or salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);
create policy "lead notes owner insert" on public.sales_lead_notes for insert with check (
  public.is_admin() or salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);

create policy "tasks owner read" on public.sales_tasks for select using (
  public.is_admin() or salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);
create policy "tasks admin write" on public.sales_tasks for all using (public.is_admin()) with check (public.is_admin());

create policy "qr owner read" on public.qr_code_requests for select using (
  public.is_admin() or salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);
create policy "qr owner insert" on public.qr_code_requests for insert with check (
  public.is_admin() or salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);
create policy "qr admin update" on public.qr_code_requests for update using (public.is_admin());

create policy "invoice owner read" on public.invoice_requests for select using (
  public.is_admin() or salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);
create policy "invoice owner insert" on public.invoice_requests for insert with check (
  public.is_admin() or salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);
create policy "invoice admin update" on public.invoice_requests for update using (public.is_admin());

create policy "commissions owner read" on public.commissions for select using (
  public.is_admin() or salesman_id in (select id from public.salesman_profiles where user_id = auth.uid())
);
create policy "commissions admin write" on public.commissions for all using (public.is_admin()) with check (public.is_admin());
