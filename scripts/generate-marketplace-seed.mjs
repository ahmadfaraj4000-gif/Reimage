import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'marketplace-data.json'), 'utf8'));
const json = JSON.stringify(data).replace(/\$marketplace\$/g, '');

const sql = `-- Generated from marketplace-data.json. Re-run: node scripts/generate-marketplace-seed.mjs
do $marketplace$
declare
  catalog jsonb := $catalog$${json}$catalog$::jsonb;
  category_item jsonb;
  business_item jsonb;
  category_slug text;
  category_uuid uuid;
  business_uuid uuid;
  image_url text;
begin
  for category_item in select * from jsonb_array_elements(catalog -> 'categories') loop
    insert into public.marketplace_categories (slug, name, short_name, description, display_order, is_active)
    values (
      category_item ->> 'slug', category_item ->> 'name', category_item ->> 'shortName',
      category_item ->> 'description',
      (select ordinality::integer from jsonb_array_elements(catalog -> 'categories') with ordinality c(value, ordinality) where c.value ->> 'slug' = category_item ->> 'slug'),
      true
    )
    on conflict (slug) do update set
      name = excluded.name, short_name = excluded.short_name, description = excluded.description,
      display_order = excluded.display_order, is_active = true;
  end loop;

  for business_item in select * from jsonb_array_elements(catalog -> 'businesses') loop
    insert into public.marketplace_businesses (
      slug, name, status, location_type, location_label, location_keys, region_rank,
      street, city, state, postal_code, secondary_address, service_area, phone,
      website_url, primary_cta_label, primary_cta_url, secondary_cta_label, secondary_cta_url,
      short_bio, long_bio, cuisine, specialties, tags, faq, schema_type, verified_at, published_at
    ) values (
      business_item ->> 'slug', business_item ->> 'name', 'published',
      case when business_item ? 'address' then 'storefront' else 'service_area' end,
      business_item ->> 'locationLabel',
      case when business_item ? 'locations' then array(select jsonb_array_elements_text(business_item -> 'locations')) else array[business_item ->> 'locationKey'] end,
      (business_item ->> 'regionRank')::integer,
      business_item #>> '{address,street}', business_item #>> '{address,city}', business_item #>> '{address,state}', business_item #>> '{address,postalCode}',
      business_item ->> 'secondaryAddress', business_item ->> 'serviceArea', business_item ->> 'phone',
      business_item ->> 'website', business_item ->> 'ctaLabel', business_item ->> 'ctaUrl',
      business_item ->> 'secondaryCtaLabel', business_item ->> 'secondaryCtaUrl',
      business_item ->> 'shortBio', business_item ->> 'longBio',
      case when business_item ? 'cuisine' then array(select jsonb_array_elements_text(business_item -> 'cuisine')) else '{}'::text[] end,
      array(select jsonb_array_elements_text(business_item -> 'specialties')),
      array(select jsonb_array_elements_text(business_item -> 'tags')),
      business_item -> 'faq', business_item ->> 'schemaType', (catalog ->> 'verifiedAt')::date, now()
    )
    on conflict (slug) do update set
      name = excluded.name, status = excluded.status, location_type = excluded.location_type,
      location_label = excluded.location_label, location_keys = excluded.location_keys, region_rank = excluded.region_rank,
      street = excluded.street, city = excluded.city, state = excluded.state, postal_code = excluded.postal_code,
      secondary_address = excluded.secondary_address, service_area = excluded.service_area, phone = excluded.phone,
      website_url = excluded.website_url, primary_cta_label = excluded.primary_cta_label, primary_cta_url = excluded.primary_cta_url,
      secondary_cta_label = excluded.secondary_cta_label, secondary_cta_url = excluded.secondary_cta_url,
      short_bio = excluded.short_bio, long_bio = excluded.long_bio, cuisine = excluded.cuisine, specialties = excluded.specialties,
      tags = excluded.tags, faq = excluded.faq, schema_type = excluded.schema_type, verified_at = excluded.verified_at;

    select id into business_uuid from public.marketplace_businesses where slug = business_item ->> 'slug';
    delete from public.marketplace_business_categories where business_id = business_uuid;
    for category_slug in select jsonb_array_elements_text(business_item -> 'categories') loop
      select id into category_uuid from public.marketplace_categories where slug = category_slug;
      insert into public.marketplace_business_categories (business_id, category_id, is_primary)
      values (business_uuid, category_uuid, category_slug = business_item #>> '{categories,0}');
    end loop;

    image_url := business_item ->> 'image';
    if image_url !~* '^https?://' then image_url := 'https://reimagebs.com/' || ltrim(image_url, '/'); end if;
    insert into public.marketplace_media (business_id, url, alt_text, width, height, is_primary, display_order)
    values (business_uuid, image_url, business_item ->> 'imageAlt', 1200, 750, true, 0)
    on conflict (business_id) where is_primary do update set url = excluded.url, alt_text = excluded.alt_text;
  end loop;

  for category_item in select * from jsonb_array_elements(catalog -> 'categories') loop
    select id into category_uuid from public.marketplace_categories where slug = category_item ->> 'slug';
    select id into business_uuid from public.marketplace_businesses where slug = category_item ->> 'featured';
    if not exists (
      select 1 from public.marketplace_feature_slots
      where category_id = category_uuid and business_id = business_uuid and placement_type = 'editorial'
    ) then
      insert into public.marketplace_feature_slots (
        category_id, business_id, placement_type, public_label, status, starts_at, ends_at, internal_notes
      ) values (
        category_uuid, business_uuid, 'editorial', 'RE IMAGE Pick', 'active',
        '2026-09-01T00:00:00-04:00', '2030-01-01T00:00:00-05:00', 'Initial marketplace launch placement'
      );
    end if;
  end loop;
end
$marketplace$;
`;

fs.writeFileSync(path.join(root, 'supabase/sql/marketplace_seed.sql'), sql);
console.log('Generated supabase/sql/marketplace_seed.sql');
