alter table public.sales_applications
  alter column user_id drop not null;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email') in ('reimagbs@gmail.com', 'reimagebs@gmail.com'), false);
$$;

drop policy if exists "sales applications owner read" on public.sales_applications;
drop policy if exists "sales applications owner insert" on public.sales_applications;
drop policy if exists "sales applications admin update" on public.sales_applications;
drop policy if exists "sales applications public insert" on public.sales_applications;
drop policy if exists "sales applications admin or claimant update" on public.sales_applications;

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

alter table public.sales_exam_attempts enable row level security;

drop policy if exists "exam attempts owner read" on public.sales_exam_attempts;
drop policy if exists "exam attempts owner insert" on public.sales_exam_attempts;
drop policy if exists "exam attempts owner update" on public.sales_exam_attempts;

create policy "exam attempts owner read" on public.sales_exam_attempts for select using (user_id = auth.uid() or public.is_admin());
create policy "exam attempts owner insert" on public.sales_exam_attempts for insert with check (
  public.is_admin() or (user_id = auth.uid() and status = 'in_progress')
);
create policy "exam attempts owner update" on public.sales_exam_attempts for update using (
  user_id = auth.uid() or public.is_admin()
) with check (
  public.is_admin() or (user_id = auth.uid() and status in ('submitted','timed_out'))
);
