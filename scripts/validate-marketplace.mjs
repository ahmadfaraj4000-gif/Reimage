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
const expectedPageCount = 1 + data.categories.length + data.businesses.length;
if (pages.length !== expectedPageCount) errors.push(`Expected ${expectedPageCount} marketplace pages, found ${pages.length}`);

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  const relative = path.relative(root, file);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${relative}: missing title`);
  if (!/<meta name="description" content="[^"]+">/.test(html)) errors.push(`${relative}: missing description`);
  if (!/<link rel="canonical" href="https:\/\/reimagebs\.com\//.test(html)) errors.push(`${relative}: missing canonical`);
  if (!/<h1>/.test(html)) errors.push(`${relative}: missing H1`);

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

if (errors.length) {
  console.error(errors.map((error) => `- ${error}`).join('\n'));
  process.exit(1);
}

console.log(`Validated ${pages.length} marketplace pages, ${data.businesses.length} listings, internal links, images, metadata, and JSON-LD.`);
