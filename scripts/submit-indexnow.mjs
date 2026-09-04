import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const host = 'reimagebs.com';
const key = process.env.INDEXNOW_KEY || '4d8f8e2f47e34922a4c0ee4288069a57';
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const urlList = [...sitemap.matchAll(/<loc>(https:\/\/reimagebs\.com\/[^<]*)<\/loc>/g)]
  .map((match) => match[1].replace(/&amp;/g, '&'));

if (!urlList.length) throw new Error('No canonical RE IMAGE URLs found in sitemap.xml.');

if (process.env.INDEXNOW_DRY_RUN === '1') {
  console.log(`Validated an IndexNow payload containing ${urlList.length} canonical URLs.`);
  process.exit(0);
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify({
    host,
    key,
    keyLocation: `https://${host}/${key}.txt`,
    urlList
  })
});

if (!response.ok && response.status !== 202) {
  throw new Error(`IndexNow submission failed (${response.status}): ${await response.text()}`);
}

console.log(`Submitted ${urlList.length} canonical URLs to IndexNow (${response.status}).`);
