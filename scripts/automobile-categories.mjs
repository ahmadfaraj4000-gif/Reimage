// Normalize older CMS categories on every build so scheduled syncs retain the public taxonomy.
export const retiredBusinessSlugs = new Set(['sals-tire-shop']);
export const automobileAliases = ['auto-body-towing', 'car-audio-detailing'];
export function normalizeAutomobileCategories(catalog) {
  const data = structuredClone(catalog);
  data.businesses = data.businesses.filter(business => !retiredBusinessSlugs.has(business.slug));
  const slugs = new Set([...automobileAliases, 'automobile-services']);
  const existing = data.categories.filter(category => slugs.has(category.slug));
  if (!existing.length) return data;
  const category = {
    slug: 'automobile-services', name: 'Automobile services', shortName: 'Automobile services',
    description: 'Mechanic services, auto repair, vehicle maintenance, auto body repair, towing, detailing, car audio, and vehicle electronics.',
    featured: existing.find(item => item.featured === 'car-craft-auto-body-towing')?.featured || existing[0].featured
  };
  let inserted = false;
  data.categories = data.categories.flatMap(item => {
    if (!slugs.has(item.slug)) return [item];
    if (inserted) return [];
    inserted = true;
    return [category];
  });
  data.businesses = data.businesses.map(business => ({ ...business,
    categories: [...new Set(business.categories.map(slug => slugs.has(slug) ? category.slug : slug))]
  }));
  return data;
}
