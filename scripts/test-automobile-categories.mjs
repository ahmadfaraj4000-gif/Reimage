import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { normalizeAutomobileCategories } from './automobile-categories.mjs';
test('legacy CMS categories combine without losing businesses or other categories', () => {
 const source={categories:[{slug:'auto-body-towing',featured:'car-craft-auto-body-towing'},{slug:'restaurants-drinks',featured:'food'},{slug:'car-audio-detailing',featured:'action-audio'}],businesses:[{slug:'car-craft-auto-body-towing',categories:['auto-body-towing']},{slug:'action-audio',categories:['car-audio-detailing','auto-body-towing']},{slug:'food',categories:['restaurants-drinks']}]};
 const result=normalizeAutomobileCategories(source);
 assert.deepEqual(result.categories.map(c=>c.slug),['automobile-services','restaurants-drinks']);
 assert.deepEqual(result.businesses[0].categories,['automobile-services']);
 assert.deepEqual(result.businesses[1].categories,['automobile-services']);
 assert.deepEqual(result.businesses[2],source.businesses[2]);
 assert.deepEqual(normalizeAutomobileCategories(result),result);
 assert.equal(source.categories.length,3);
});
test('published guide includes Action Audio and Car Craft under the broad filter',()=>{
 const data=JSON.parse(fs.readFileSync(new URL('../marketplace-data.json',import.meta.url)));
 for(const slug of ['action-audio','car-craft-auto-body-towing'])assert(data.businesses.find(b=>b.slug===slug).categories.includes('automobile-services'));
 const html=fs.readFileSync(new URL('../marketplace/categories/automobile-services/index.html',import.meta.url),'utf8');
 for(const slug of ['action-audio','car-craft-auto-body-towing'])assert(html.includes(`data-slug="${slug}"`));
});


test('retired listings cannot return through a CMS snapshot', () => {
 const input = {
  categories: [{slug:'auto-body-towing',name:'Auto Body',featured:'car-craft-auto-body-towing'}],
  businesses: [
   {slug:'sals-tire-shop',categories:['auto-body-towing']},
   {slug:'car-craft-auto-body-towing',categories:['auto-body-towing']}
  ]
 };
 const result = normalizeAutomobileCategories(input);
 assert.deepEqual(result.businesses.map(b=>b.slug), ['car-craft-auto-body-towing']);
 assert.equal(input.businesses.length, 2);
});
