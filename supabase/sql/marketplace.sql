-- Hartford Marketplace by RE IMAGE
-- Run after the existing salesman_portal.sql so public.is_admin() is available.

create extension if not exists pgcrypto;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(lower(auth.jwt() ->> 'email') in ('reimagbs@gmail.com', 'reimagebs@gmail.com'), false);
$$;

create table if not exists public.marketplace_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  short_name text not null,
  description text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'paused', 'verification_needed')),
  location_type text not null default 'storefront' check (location_type in ('storefront', 'service_area', 'online')),
  location_label text not null,
  location_keys text[] not null default '{}',
  region_rank integer not null default 3 check (region_rank between 1 and 4),
  street text,
  city text,
  state text,
  postal_code text,
  secondary_address text,
  service_area text,
  phone text,
  website_url text not null check (website_url ~* '^https?://'),
  primary_cta_label text not null,
  primary_cta_url text not null check (primary_cta_url ~* '^https?://'),
  secondary_cta_label text,
  secondary_cta_url text check (secondary_cta_url is null or secondary_cta_url ~* '^https?://'),
  short_bio text not null,
  long_bio text not null,
  specialties text[] not null default '{}',
  tags text[] not null default '{}',
  faq jsonb not null default '[]'::jsonb check (jsonb_typeof(faq) = 'array'),
  schema_type text not null default 'LocalBusiness',
  verified_at date,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint marketplace_business_location check (
    (location_type = 'storefront' and street is not null and city is not null and state is not null)
    or (location_type in ('service_area', 'online') and service_area is not null)
  )
);

create table if not exists public.marketplace_business_categories (
  business_id uuid not null references public.marketplace_businesses(id) on delete cascade,
  category_id uuid not null references public.marketplace_categories(id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (business_id, category_id)
);

create unique index if not exists marketplace_one_primary_category_per_business
  on public.marketplace_business_categories (business_id)
  where is_primary;

create table if not exists public.marketplace_media (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.marketplace_businesses(id) on delete cascade,
  url text not null,
  alt_text text not null check (length(trim(alt_text)) >= 8),
  width integer,
  height integer,
  is_primary boolean not null default false,
  display_order integer not null default 0,
  created_at timestamptz not null default now()
);

create unique index if not exists marketplace_one_primary_image_per_business
  on public.marketplace_media (business_id)
  where is_primary;

create table if not exists public.marketplace_feature_slots (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.marketplace_categories(id) on delete cascade,
  business_id uuid not null references public.marketplace_businesses(id) on delete cascade,
  placement_type text not null default 'editorial' check (placement_type in ('editorial', 'sponsored')),
  public_label text not null default 'RE IMAGE Pick',
  status text not null default 'scheduled' check (status in ('draft', 'scheduled', 'active', 'expired', 'cancelled')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  invoice_reference text,
  internal_notes text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (placement_type <> 'sponsored' or public_label = 'Sponsored')
);

create index if not exists marketplace_feature_slots_category_dates
  on public.marketplace_feature_slots (category_id, starts_at, ends_at);

create table if not exists public.marketplace_daily_metrics (
  metric_date date not null default current_date,
  business_id uuid not null references public.marketplace_businesses(id) on delete cascade,
  category_id uuid references public.marketplace_categories(id) on delete set null,
  event_type text not null check (event_type in ('featured_impression', 'profile_view', 'outbound_click')),
  event_count bigint not null default 0 check (event_count >= 0),
  primary key (metric_date, business_id, category_id, event_type)
);

create or replace function public.set_marketplace_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists marketplace_categories_updated_at on public.marketplace_categories;
create trigger marketplace_categories_updated_at before update on public.marketplace_categories
for each row execute function public.set_marketplace_updated_at();

drop trigger if exists marketplace_businesses_updated_at on public.marketplace_businesses;
create trigger marketplace_businesses_updated_at before update on public.marketplace_businesses
for each row execute function public.set_marketplace_updated_at();

drop trigger if exists marketplace_feature_slots_updated_at on public.marketplace_feature_slots;
create trigger marketplace_feature_slots_updated_at before update on public.marketplace_feature_slots
for each row execute function public.set_marketplace_updated_at();

alter table public.marketplace_categories enable row level security;
alter table public.marketplace_businesses enable row level security;
alter table public.marketplace_business_categories enable row level security;
alter table public.marketplace_media enable row level security;
alter table public.marketplace_feature_slots enable row level security;
alter table public.marketplace_daily_metrics enable row level security;

drop policy if exists "Marketplace categories are publicly readable" on public.marketplace_categories;
create policy "Marketplace categories are publicly readable" on public.marketplace_categories
for select using (is_active or public.is_admin());

drop policy if exists "Admins manage marketplace categories" on public.marketplace_categories;
create policy "Admins manage marketplace categories" on public.marketplace_categories
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published marketplace businesses are publicly readable" on public.marketplace_businesses;
create policy "Published marketplace businesses are publicly readable" on public.marketplace_businesses
for select using (status = 'published' or public.is_admin());

drop policy if exists "Admins manage marketplace businesses" on public.marketplace_businesses;
create policy "Admins manage marketplace businesses" on public.marketplace_businesses
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published marketplace category links are publicly readable" on public.marketplace_business_categories;
create policy "Published marketplace category links are publicly readable" on public.marketplace_business_categories
for select using (
  public.is_admin()
  or (
    exists (select 1 from public.marketplace_businesses b where b.id = business_id and b.status = 'published')
    and exists (select 1 from public.marketplace_categories c where c.id = category_id and c.is_active)
  )
);

drop policy if exists "Admins manage marketplace category links" on public.marketplace_business_categories;
create policy "Admins manage marketplace category links" on public.marketplace_business_categories
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Published marketplace media is publicly readable" on public.marketplace_media;
create policy "Published marketplace media is publicly readable" on public.marketplace_media
for select using (
  public.is_admin()
  or exists (select 1 from public.marketplace_businesses b where b.id = business_id and b.status = 'published')
);

drop policy if exists "Admins manage marketplace media" on public.marketplace_media;
create policy "Admins manage marketplace media" on public.marketplace_media
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Active marketplace features are publicly readable" on public.marketplace_feature_slots;

drop policy if exists "Admins manage marketplace features" on public.marketplace_feature_slots;
create policy "Admins manage marketplace features" on public.marketplace_feature_slots
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read marketplace metrics" on public.marketplace_daily_metrics;
create policy "Admins read marketplace metrics" on public.marketplace_daily_metrics
for select using (public.is_admin());

drop policy if exists "Admins manage marketplace metrics" on public.marketplace_daily_metrics;
create policy "Admins manage marketplace metrics" on public.marketplace_daily_metrics
for all using (public.is_admin()) with check (public.is_admin());

grant select on public.marketplace_categories to anon;
grant select on public.marketplace_businesses to anon;
grant select on public.marketplace_business_categories to anon;
grant select on public.marketplace_media to anon;
grant all on public.marketplace_categories to authenticated;
grant all on public.marketplace_businesses to authenticated;
grant all on public.marketplace_business_categories to authenticated;
grant all on public.marketplace_media to authenticated;
grant all on public.marketplace_feature_slots to authenticated;
grant all on public.marketplace_daily_metrics to authenticated;

drop view if exists public.marketplace_active_features;
create view public.marketplace_active_features
with (security_barrier = true)
as
select id, category_id, business_id, placement_type, public_label, status, starts_at, ends_at
from public.marketplace_feature_slots
where status in ('scheduled', 'active') and starts_at <= now() and ends_at > now();

revoke all on public.marketplace_active_features from public;
grant select on public.marketplace_active_features to anon, authenticated;

create or replace function public.schedule_marketplace_feature(
  feature_category_id uuid,
  feature_business_id uuid,
  feature_placement_type text,
  feature_starts_at timestamptz,
  feature_ends_at timestamptz,
  feature_invoice_reference text default null,
  feature_internal_notes text default null
)
returns public.marketplace_feature_slots
language plpgsql
security definer
set search_path = public
as $$
declare
  created_slot public.marketplace_feature_slots;
begin
  if not public.is_admin() then
    raise exception 'Admin access required';
  end if;
  if feature_ends_at <= feature_starts_at then
    raise exception 'The end date must be after the start date';
  end if;
  if feature_placement_type not in ('editorial', 'sponsored') then
    raise exception 'Invalid placement type';
  end if;
  if not exists (
    select 1 from public.marketplace_business_categories
    where business_id = feature_business_id and category_id = feature_category_id
  ) then
    raise exception 'The business must belong to the selected category';
  end if;
  if exists (
    select 1 from public.marketplace_feature_slots
    where category_id = feature_category_id
      and status in ('scheduled', 'active')
      and tstzrange(starts_at, ends_at, '[)') && tstzrange(feature_starts_at, feature_ends_at, '[)')
  ) then
    raise exception 'This category already has a featured placement in that date range';
  end if;

  insert into public.marketplace_feature_slots (
    category_id, business_id, placement_type, public_label, status,
    starts_at, ends_at, invoice_reference, internal_notes, created_by
  ) values (
    feature_category_id, feature_business_id, feature_placement_type,
    case when feature_placement_type = 'sponsored' then 'Sponsored' else 'RE IMAGE Pick' end,
    'scheduled', feature_starts_at, feature_ends_at,
    feature_invoice_reference, feature_internal_notes, auth.uid()
  ) returning * into created_slot;

  return created_slot;
end;
$$;

revoke all on function public.schedule_marketplace_feature(uuid, uuid, text, timestamptz, timestamptz, text, text) from public;
grant execute on function public.schedule_marketplace_feature(uuid, uuid, text, timestamptz, timestamptz, text, text) to authenticated;

comment on table public.marketplace_daily_metrics is
  'Anonymous marketplace analytics must be written through a rate-limited Edge Function; clients have no direct insert policy.';

create or replace function public.increment_marketplace_metric(
  metric_business_slug text,
  metric_category_slug text,
  metric_event_type text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  metric_business_id uuid;
  metric_category_id uuid;
begin
  if metric_event_type not in ('featured_impression', 'profile_view', 'outbound_click') then
    raise exception 'Invalid marketplace metric';
  end if;
  select id into metric_business_id from public.marketplace_businesses where slug = metric_business_slug and status = 'published';
  if metric_business_id is null then raise exception 'Published business not found'; end if;
  if metric_category_slug is not null then
    select id into metric_category_id from public.marketplace_categories where slug = metric_category_slug and is_active;
  end if;
  insert into public.marketplace_daily_metrics (metric_date, business_id, category_id, event_type, event_count)
  values (current_date, metric_business_id, metric_category_id, metric_event_type, 1)
  on conflict (metric_date, business_id, category_id, event_type)
  do update set event_count = public.marketplace_daily_metrics.event_count + 1;
end;
$$;

revoke all on function public.increment_marketplace_metric(text, text, text) from public, anon, authenticated;
grant execute on function public.increment_marketplace_metric(text, text, text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('marketplace-media', 'marketplace-media', true, 10485760, array['image/jpeg','image/png','image/webp','image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public reads marketplace media files" on storage.objects;
create policy "Public reads marketplace media files" on storage.objects
for select using (bucket_id = 'marketplace-media');

drop policy if exists "Admins upload marketplace media files" on storage.objects;
create policy "Admins upload marketplace media files" on storage.objects
for insert to authenticated with check (bucket_id = 'marketplace-media' and public.is_admin());

drop policy if exists "Admins update marketplace media files" on storage.objects;
create policy "Admins update marketplace media files" on storage.objects
for update to authenticated using (bucket_id = 'marketplace-media' and public.is_admin())
with check (bucket_id = 'marketplace-media' and public.is_admin());

drop policy if exists "Admins delete marketplace media files" on storage.objects;
create policy "Admins delete marketplace media files" on storage.objects
for delete to authenticated using (bucket_id = 'marketplace-media' and public.is_admin());
