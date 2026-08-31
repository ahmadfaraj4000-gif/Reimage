-- Restore the dynamic QR code used by reimagework.png.
-- The existing PNG encodes:
-- https://uybcjtigyujoyrunecto.supabase.co/functions/v1/qr-redirect/reimagework

insert into public.dynamic_qr_codes (
  title,
  slug,
  destination_url,
  is_active
)
values (
  'Our Work',
  'reimagework',
  'https://reimagebs.com/our-work.html',
  true
)
on conflict (slug) do update
set
  title = excluded.title,
  destination_url = excluded.destination_url,
  is_active = excluded.is_active,
  updated_at = now();
