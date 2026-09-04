import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !anonKey) throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY are required to sync marketplace content.');

const headers = { apikey: anonKey, Authorization: `Bearer ${anonKey}` };
async function get(table, query = '') {
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, { headers });
  if (!response.ok) throw new Error(`${table} sync failed (${response.status}): ${await response.text()}`);
  return response.json();
}

const [categories, businesses, links, media, features] = await Promise.all([
  get('marketplace_categories', 'select=*&is_active=eq.true&order=display_order.asc'),
  get('marketplace_businesses', 'select=*&status=eq.published&order=region_rank.asc,name.asc'),
  get('marketplace_business_categories', 'select=business_id,category_id,is_primary'),
  get('marketplace_media', 'select=*&is_primary=eq.true&order=display_order.asc'),
  get('marketplace_active_features', 'select=category_id,business_id,placement_type,public_label,status,starts_at,ends_at')
]);

const categoryById = new Map(categories.map((category) => [category.id, category]));
const primaryMedia = new Map(media.map((item) => [item.business_id, item]));
const categoriesByBusiness = new Map();
for (const link of links) {
  const list = categoriesByBusiness.get(link.business_id) || [];
  list.push(link);
  categoriesByBusiness.set(link.business_id, list);
}
const featureByCategory = new Map(features.map((feature) => [feature.category_id, feature]));

const snapshot = {
  verifiedAt: businesses.map((business) => business.verified_at).filter(Boolean).sort().at(-1) || new Date().toISOString().slice(0, 10),
  categories: categories.map((category) => {
    const feature = featureByCategory.get(category.id);
    const featuredBusiness = businesses.find((business) => business.id === feature?.business_id);
    return {
      slug: category.slug,
      name: category.name,
      shortName: category.short_name,
      description: category.description,
      featured: featuredBusiness?.slug || businesses.find((business) => (categoriesByBusiness.get(business.id) || []).some((link) => link.category_id === category.id))?.slug
    };
  }),
  businesses: businesses.map((business) => {
    const categoryLinks = (categoriesByBusiness.get(business.id) || []).sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
    const image = primaryMedia.get(business.id);
    const businessFeature = features.find((feature) => feature.business_id === business.id);
    return {
      slug: business.slug,
      name: business.name,
      categories: categoryLinks.map((link) => categoryById.get(link.category_id)?.slug).filter(Boolean),
      featuredLabel: businessFeature?.public_label,
      locationKey: business.location_keys?.[0] || 'other-connecticut',
      locations: business.location_keys || [],
      locationLabel: business.location_label,
      regionRank: business.region_rank,
      address: business.street ? { street: business.street, city: business.city, state: business.state, postalCode: business.postal_code } : undefined,
      secondaryAddress: business.secondary_address || undefined,
      serviceArea: business.service_area || undefined,
      phone: business.phone || undefined,
      website: business.website_url,
      ctaLabel: business.primary_cta_label,
      ctaUrl: business.primary_cta_url,
      secondaryCtaLabel: business.secondary_cta_label || undefined,
      secondaryCtaUrl: business.secondary_cta_url || undefined,
      image: image?.url,
      imageAlt: image?.alt_text,
      schemaType: business.schema_type,
      specialties: business.specialties || [],
      tags: business.tags || [],
      shortBio: business.short_bio,
      longBio: business.long_bio,
      faq: business.faq || []
    };
  })
};

const destination = process.env.MARKETPLACE_DATA_PATH || path.join(root, '.marketplace-data.generated.json');
fs.writeFileSync(destination, `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Synced ${snapshot.businesses.length} published businesses from Supabase to ${destination}.`);
