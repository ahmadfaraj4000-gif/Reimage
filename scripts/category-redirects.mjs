import { automobileAliases } from './automobile-categories.mjs';

export const hairAliases = ['barbershops', 'hair-braiding'];
export const categoryRedirects = new Map([
  ...automobileAliases.map(slug => [slug, 'automobile-services']),
  ...hairAliases.map(slug => [slug, 'hair-services'])
]);
