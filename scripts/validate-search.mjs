import fs from 'node:fs';
import assert from 'node:assert/strict';
import { categoryTopics, locationFilters, marketSearch } from './search-content.mjs';

const read = file => fs.readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const data = JSON.parse(read('marketplace-data.json'));
const hub = read('marketplace.html');
const market = read('market-signals.html');
const sitemap = read('sitemap.xml');
const summary = read('llms.txt');
const full = read('llms-full.txt');
const feed = JSON.parse(read('marketplace-feed.json'));
const decode = text => text.replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#0?39;/g,"'");
const graphs = html => [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap(match => { const item=JSON.parse(match[1]);return item['@graph'] || [item]; });
const visible = html => decode(html.replace(/<script\b[\s\S]*?<\/script>/g,'').replace(/<[^>]*>/g,' '));
const verifyFaq = html => {
  const text=visible(html);
  for(const entity of graphs(html).filter(item=>item['@type']==='FAQPage')) {
    for(const faq of entity.mainEntity) {
      assert(text.includes(faq.name), `FAQ question absent from HTML: ${faq.name}`);
      assert(text.includes(faq.acceptedAnswer.text), `FAQ answer absent from HTML: ${faq.name}`);
    }
  }
};

for(const category of data.categories) {
  const path=`/marketplace/categories/${category.slug}/`;
  assert(hub.includes(`href="${path}" data-category="${category.slug}"`),`Filter needs a crawlable link: ${category.slug}`);
  const html=read(`${path.slice(1)}index.html`);
  assert(html.includes(`rel="canonical" href="https://reimagebs.com${path}"`));
  assert(sitemap.includes(`https://reimagebs.com${path}`));
  assert(summary.includes(path) && full.includes(path));
  const topic=categoryTopics[category.slug];
  if(topic) assert(visible(html).includes(topic.copy));
  assert(feed.categories.some(item=>item.slug===category.slug && item.topics.length));
  verifyFaq(html);
}
let locationCount=0;
for(const location of locationFilters) {
  const businesses=data.businesses.filter(b=>(b.locations||[b.locationKey]).includes(location.slug));
  if(!businesses.length)continue;
  locationCount++;
  const path=`/marketplace/locations/${location.slug}/`;
  const html=read(`${path.slice(1)}index.html`);
  assert(hub.includes(`href="${path}"`));
  assert(sitemap.includes(`https://reimagebs.com${path}`));
  assert(summary.includes(path) && full.includes(path));
  assert.equal(feed.locations.find(item=>item.slug===location.slug).businesses.length,businesses.length);
  const page=graphs(html).find(item=>item['@type']==='CollectionPage');
  assert.equal(page.mainEntity.numberOfItems,businesses.length);
  for(const business of businesses)assert(html.includes(`data-slug="${business.slug}"`));
  verifyFaq(html);
}
for(const decision of marketSearch.decisions) {
  assert(market.includes(`id="${decision.id}"`));
  assert(visible(market).includes(decision.answer));
}
assert.equal((market.match(/<!-- MARKET-SEARCH:START -->/g)||[]).length,1);
assert(visible(market).includes('Published small-business economic indicators'));
const snapshot=JSON.parse(read('data/market/latest.json'));
assert(market.includes(`datetime="${snapshot.updated_at}"`));
for(const item of snapshot.indicators)assert(market.includes(`href="${item.source_url}"`));
assert(graphs(market).some(item=>item['@type']==='Dataset' && item.variableMeasured.length===7));
assert(summary.includes('/market-signals.html') && full.includes('/market-signals.html'));
verifyFaq(market);
const robots=read('robots.txt');
assert(robots.includes('User-agent: OAI-SearchBot\nAllow: /'));
assert(robots.includes('User-agent: *\nAllow: /'));
assert(hub.includes('rel="canonical" href="https://reimagebs.com/marketplace.html"'));
console.log(`Validated crawlable filters, ${data.categories.length} category guides, ${locationCount} area guides, visible FAQs, economic data, schema, sitemap, and AI feeds.`);
