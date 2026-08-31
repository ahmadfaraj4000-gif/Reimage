create table if not exists public.dynamic_qr_codes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  destination_url text not null,
  is_active boolean not null default true,
  scan_count integer not null default 0,
  last_scanned_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint dynamic_qr_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint dynamic_qr_destination_url_format check (destination_url ~* '^https?://')
);

create index if not exists dynamic_qr_codes_slug_idx
  on public.dynamic_qr_codes (slug);

create or replace function public.set_dynamic_qr_codes_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists dynamic_qr_codes_set_updated_at on public.dynamic_qr_codes;

create trigger dynamic_qr_codes_set_updated_at
before update on public.dynamic_qr_codes
for each row
execute function public.set_dynamic_qr_codes_updated_at();

alter table public.dynamic_qr_codes enable row level security;

drop policy if exists "Authenticated admins can read dynamic QR codes" on public.dynamic_qr_codes;
drop policy if exists "Authenticated admins can create dynamic QR codes" on public.dynamic_qr_codes;
drop policy if exists "Authenticated admins can update dynamic QR codes" on public.dynamic_qr_codes;
drop policy if exists "Authenticated admins can delete dynamic QR codes" on public.dynamic_qr_codes;

create policy "Authenticated admins can read dynamic QR codes"
on public.dynamic_qr_codes
for select
to authenticated
using (true);

create policy "Authenticated admins can create dynamic QR codes"
on public.dynamic_qr_codes
for insert
to authenticated
with check (auth.uid() = created_by);

create policy "Authenticated admins can update dynamic QR codes"
on public.dynamic_qr_codes
for update
to authenticated
using (true)
with check (true);

create policy "Authenticated admins can delete dynamic QR codes"
on public.dynamic_qr_codes
for delete
to authenticated
using (true);
