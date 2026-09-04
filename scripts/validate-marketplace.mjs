import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'marketplace-data.json'), 'utf8'));
const errors = [];

function collectHtml(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const location = path.join(directory, entry.name);
    return entry.isDirectory() ? collectHtml(location) : entry.name.endsWith('.html') ? [location] : [];
  });
}

const pages = [path.join(root, 'marketplace.html'), ...collectHtml(path.join(root, 'marketplace'))];
const expectedPageCount = 1 + data.categories.length + data.businesses.length + 2;
if (pages.length !== expectedPageCount) errors.push(`Expected ${expectedPageCount} marketplace pages, found ${pages.length}`);

const titles = new Map();
const descriptions = new Map();
const canonicals = new Map();

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${relative}: missing title`);
  if (!/<meta name="description" content="[^"]+">/.test(html)) errors.push(`${relative}: missing description`);
  if (!/<link rel="canonical" href="https:\/\/reimagebs\.com\//.test(html)) errors.push(`${relative}: missing canonical`);
  if (!/<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">/.test(html)) errors.push(`${relative}: missing full preview robots directives`);
  if (!/<meta name="twitter:title"/.test(html) || !/<meta name="twitter:image"/.test(html)) errors.push(`${relative}: incomplete Twitter metadata`);
  if (!html.includes('/public-shell.js?v=20260904-8')) errors.push(`${relative}: missing canonical public navigation controller`);
  if (!html.includes('aria-controls="navLinks"')) errors.push(`${relative}: missing canonical mobile menu button`);
  if ((html.match(/<h1\b/g) || []).length !== 1) errors.push(`${relative}: expected exactly one H1`);

  const title = html.match(/<title>([^<]+)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)">/)?.[1];
  for (const [label, value, seen] of [['title', title, titles], ['description', description, descriptions], ['canonical', canonical, canonicals]]) {
    if (!value) continue;
    if (seen.has(value)) errors.push(`${relative}: duplicate ${label} also used by ${seen.get(value)}`);
    else seen.set(value, relative);
  }

  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicateIds.length) errors.push(`${relative}: duplicate ids ${[...new Set(duplicateIds)].join(', ')}`);

  for (const image of html.matchAll(/<img\s+[^>]*>/g)) {
    if (!/\salt="[^"]+"/.test(image[0])) errors.push(`${relative}: image missing descriptive alt text`);
    const source = image[0].match(/\ssrc="([^"]+)"/)?.[1];
    if (source?.startsWith('/')) {
      const target = path.join(root, source.replace(/^\//, ''));
      if (!fs.existsSync(target)) errors.push(`${relative}: missing image ${source}`);
    }
  }

  for (const script of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(script[1]); } catch (error) { errors.push(`${relative}: invalid JSON-LD (${error.message})`); }
  }

  for (const link of html.matchAll(/\shref="(\/[^"]+)"/g)) {
    const href = link[1].split(/[?#]/)[0];
    if (!href || href === '/') continue;
    const target = href.endsWith('/') ? path.join(root, href, 'index.html') : path.join(root, href);
    if (!fs.existsSync(target)) errors.push(`${relative}: broken internal link ${href}`);
  }
}

const hub = fs.readFileSync(path.join(root, 'marketplace.html'), 'utf8');
for (const phrase of ['Peanut Punch', 'Cheyney Fish Sandwich', 'hyperpigmentation', 'Online photo estimates', 'Custom apparel']) {
  if (!hub.toLowerCase().includes(phrase.toLowerCase())) errors.push(`Hub search content is missing ${phrase}`);
}
if (!hub.includes('class="button button--primary market-hero__featured-cta"') || !hub.includes('service=Featured%20Marketplace%20Placement">Get Featured</a>')) {
  errors.push('Discover hero is missing the Get Featured CTA below search');
}

const homepage = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pricingPosition = homepage.indexOf('class="pricing-section"');
const guidePosition = homepage.indexOf('class="marketplace-home-teaser"');
const finalCtaPosition = homepage.indexOf('class="final-cta"');
if (!(pricingPosition < guidePosition && guidePosition < finalCtaPosition)) errors.push('Homepage Hartford Local Guide must sit between pricing and the final CTA');
const shellCss = fs.readFileSync(path.join(root, 'public-shell.css'), 'utf8').toLowerCase();
for (const forbiddenColor of ['#0d8f8a', '#eef9f7', '#fff8e9']) {
  if (shellCss.includes(forbiddenColor)) errors.push(`public-shell.css still contains retired teal/gold accent ${forbiddenColor}`);
}

const corridor = fs.readFileSync(path.join(root, 'marketplace/guides/new-britain-avenue-hartford/index.html'), 'utf8');
for (const phrase of ['875 New Britain Avenue', '879 New Britain Avenue', '881 New Britain Avenue', 'Peanut Punch', 'Cheyney Fish Sandwich']) {
  if (!corridor.includes(phrase)) errors.push(`New Britain Avenue guide is missing ${phrase}`);
}

const robots = fs.readFileSync(path.join(root, 'robots.txt'), 'utf8');
if (!robots.includes('User-agent: OAI-SearchBot') || !robots.includes('Sitemap: https://reimagebs.com/sitemap.xml')) errors.push('robots.txt is missing AI search or sitemap discovery rules');
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes('xmlns:image=') || !sitemap.includes('/marketplace/guides/new-britain-avenue-hartford/')) errors.push('sitemap.xml is missing image or corridor guide discovery');
for (const file of ['llms.txt', 'llms-full.txt', 'marketplace-feed.json']) if (!fs.existsSync(path.join(root, file))) errors.push(`Missing ${file}`);
try { JSON.parse(fs.readFileSync(path.join(root, 'marketplace-feed.json'), 'utf8')); } catch (error) { errors.push(`marketplace-feed.json is invalid (${error.message})`); }

const transparentLogo = fs.readFileSync(path.join(root, 'assets/marketplace/logos/mi-buen-pastor-mexican-fusion-transparent.png'));
if (transparentLogo[25] !== 6 && transparentLogo[25] !== 4) errors.push('Mi Buen Pastor logo does not contain an alpha channel');

const publicPageFiles = ['index.html', 'website-development.html', 'ai-receptionists.html', 'ai-automation.html', 'business-funding.html', 'growth-foundation.html', 'full-scale-system.html', 'social-media-management.html', 'products.html', 'our-work.html', 'careers.html', 'start-with-us.html', 'map.html'];
for (const file of publicPageFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  if ((html.match(/<title>/gi) || []).length !== 1) errors.push(`${file}: expected one title`);
  if ((html.match(/\brel=["']canonical["']/gi) || []).length !== 1) errors.push(`${file}: expected one canonical`);
  if ((html.match(/\bname=["']description["']/gi) || []).length !== 1) errors.push(`${file}: expected one meta description`);
  if (!/max-image-preview:large/.test(html)) errors.push(`${file}: missing large image preview directive`);
  if (!/id=["']reimage-seo-schema["']/.test(html)) errors.push(`${file}: missing site entity schema`);
  if (!/name=["']twitter:title["']/.test(html) || !/name=["']twitter:image["']/.test(html)) errors.push(`${file}: incomplete social metadata`);
  if (/name=["']keywords["']/i.test(html)) errors.push(`${file}: obsolete meta keywords tag should not be present`);
  if (!html.includes('public-shell.css?v=20260904-6')) errors.push(`${file}: missing canonical public navigation styles`);
  if (!html.includes('public-shell.js?v=20260904-8')) errors.push(`${file}: missing canonical public navigation controller`);
  if (!html.includes('aria-controls="navLinks"')) errors.push(`${file}: missing canonical mobile menu button`);
  for (const image of html.matchAll(/<img\s+[^>]*>/gi)) if (!/\balt=["'][^"']*["']/i.test(image[0])) errors.push(`${file}: image missing alt attribute`);
  const schemaScripts = [...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  if (!schemaScripts.length) errors.push(`${file}: missing JSON-LD`);
  for (const script of schemaScripts) try { JSON.parse(script[1]); } catch (error) { errors.push(`${file}: invalid JSON-LD (${error.message})`); }
}

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Validated ${pages.length} marketplace pages, ${data.businesses.length} listings, internal links, images, metadata, and JSON-LD.`);
