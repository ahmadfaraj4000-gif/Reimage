import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const siteUrl = 'https://reimagebs.com';
const logo = `${siteUrl}/assets/reimage-logo-2026-transparent.png`;

const pages = {
  'index.html': {
    title: 'Hartford Business Systems & Web Development | RE IMAGE',
    description: 'RE IMAGE builds Hartford businesses custom websites, customer portals, payment systems, AI automation, and connected operating systems.',
    type: 'WebPage'
  },
  'website-development.html': {
    title: 'Hartford Web Design & Business Systems | RE IMAGE',
    description: 'Custom Hartford web design, client portals, admin tools, payments, booking, lead capture, and connected business systems from RE IMAGE.',
    type: 'Service', serviceType: 'Custom website development and business operating systems'
  },
  'ai-receptionists.html': {
    title: 'AI Receptionist Services in Hartford, CT | RE IMAGE',
    description: 'AI receptionist systems for Hartford businesses that answer questions, capture leads, route requests, and reduce missed opportunities.',
    type: 'Service', serviceType: 'AI receptionist systems'
  },
  'ai-automation.html': {
    title: 'AI Automation for Connecticut Businesses | RE IMAGE',
    description: 'Practical AI automation for Connecticut businesses, including lead intake, follow-up, reminders, notifications, and connected workflows.',
    type: 'Service', serviceType: 'Small-business AI automation'
  },
  'business-funding.html': {
    title: 'Business Funding Guidance in Connecticut | RE IMAGE',
    description: 'Funding-readiness guidance for Connecticut business owners planning working capital, equipment, marketing, stabilization, or expansion.',
    type: 'Service', serviceType: 'Business funding readiness guidance'
  },
  'growth-foundation.html': {
    title: 'Small Business Growth Foundation | Hartford, CT | RE IMAGE',
    description: 'A professional website, clear positioning, cleaner lead intake, and funding guidance for Hartford-area businesses preparing to grow.',
    type: 'Service', serviceType: 'Small business growth foundation package'
  },
  'full-scale-system.html': {
    title: 'Full-Scale Business System Development | RE IMAGE',
    description: 'Connected websites, portals, payments, automation, lead capture, and internal workflows built as one full-scale business system.',
    type: 'Service', serviceType: 'Full-scale business operating system development'
  },
  'social-media-management.html': {
    title: 'Social Media Management in Hartford, CT | RE IMAGE',
    description: 'Social media planning, content systems, and conversion-focused support for Hartford and Connecticut small businesses.',
    type: 'Service', serviceType: 'Social media management'
  },
  'products.html': {
    title: 'Employee Time Clock & Business Software | RE IMAGE',
    description: 'Explore RE IMAGE business tools, including an employee clock-in system with secure codes, QR access, geofencing, live hours, and alerts.',
    type: 'CollectionPage'
  },
  'our-work.html': {
    title: 'Hartford Web Design Portfolio & Business Systems | RE IMAGE',
    description: 'Explore websites, customer portals, booking tools, estimates, payments, and business systems RE IMAGE built for Connecticut and New York clients.',
    type: 'CollectionPage'
  },
  'careers.html': {
    title: 'Careers at RE IMAGE Business Solutions | Hartford, CT',
    description: 'Explore opportunities to work with RE IMAGE Business Solutions on websites, business systems, automation, sales, and client growth.',
    type: 'WebPage'
  },
  'start-with-us.html': {
    title: 'Start a Business Systems Project | RE IMAGE Hartford',
    description: 'Tell RE IMAGE what your business needs and start a Hartford website, portal, automation, marketing, or connected business systems project.',
    type: 'ContactPage'
  },
  'map.html': {
    title: 'Hartford Business Map & Local Guide | RE IMAGE',
    description: 'Explore Hartford through RE IMAGE with local businesses, neighborhood destinations, and direct links to places around Connecticut’s capital.',
    type: 'CollectionPage'
  }
};

const organization = {
  '@type': 'Organization',
  '@id': `${siteUrl}/#organization`,
  name: 'RE IMAGE Business Solutions',
  alternateName: 'RE IMAGE',
  url: `${siteUrl}/`,
  logo: { '@type': 'ImageObject', url: logo },
  email: 'reimagebs@gmail.com',
  telephone: '+1-860-718-5928',
  areaServed: [
    { '@type': 'City', name: 'Hartford', containedInPlace: { '@type': 'State', name: 'Connecticut' } },
    { '@type': 'AdministrativeArea', name: 'Greater Hartford' },
    { '@type': 'State', name: 'Connecticut' }
  ],
  knowsAbout: ['Custom websites', 'Business operating systems', 'Client portals', 'AI receptionists', 'Workflow automation', 'Local business discovery']
};

function escapeAttribute(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

for (const [file, config] of Object.entries(pages)) {
  const absolute = path.join(root, file);
  if (!fs.existsSync(absolute)) continue;
  const canonical = `${siteUrl}/${file === 'index.html' ? '' : file}`;
  const pageId = `${canonical}#webpage`;
  const graph = [
    organization,
    { '@type': 'WebSite', '@id': `${siteUrl}/#website`, url: `${siteUrl}/`, name: 'RE IMAGE Business Solutions', publisher: { '@id': `${siteUrl}/#organization` }, inLanguage: 'en-US' },
    {
      '@type': config.type === 'Service' ? 'WebPage' : config.type,
      '@id': pageId,
      url: canonical,
      name: config.title,
      description: config.description,
      isPartOf: { '@id': `${siteUrl}/#website` },
      about: { '@id': `${siteUrl}/#organization` },
      primaryImageOfPage: { '@type': 'ImageObject', url: logo },
      inLanguage: 'en-US'
    }
  ];
  if (config.type === 'Service') {
    graph.push({
      '@type': 'Service',
      '@id': `${canonical}#service`,
      name: config.serviceType,
      description: config.description,
      url: canonical,
      provider: { '@id': `${siteUrl}/#organization` },
      areaServed: [{ '@type': 'City', name: 'Hartford' }, { '@type': 'State', name: 'Connecticut' }]
    });
  }

  let html = fs.readFileSync(absolute, 'utf8');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${config.title}</title>`);
  html = html.replace(/<!-- REIMAGE-SEO:START -->[\s\S]*?<!-- REIMAGE-SEO:END -->\s*/gi, '');
  html = html.replace(/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>\s*/gi, '');
  html = html.replace(/<meta\b(?=[^>]*(?:name|property)=["'](?:description|keywords|author|robots|googlebot|bingbot|theme-color|og:[^"']+|twitter:[^"']+)["'])[^>]*>\s*/gi, '');
  html = html.replace(/<script\b[^>]*id=["']reimage-seo-schema["'][^>]*>[\s\S]*?<\/script>\s*/gi, '');

  const seo = `<!-- REIMAGE-SEO:START -->
  <meta name="description" content="${escapeAttribute(config.description)}">
  <meta name="author" content="RE IMAGE Business Solutions">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="theme-color" content="#0877e8">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en-US" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <link rel="alternate" type="text/plain" href="${siteUrl}/llms.txt" title="RE IMAGE site overview">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="RE IMAGE Business Solutions">
  <meta property="og:title" content="${escapeAttribute(config.title)}">
  <meta property="og:description" content="${escapeAttribute(config.description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${logo}">
  <meta property="og:image:alt" content="RE IMAGE Business Solutions logo">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeAttribute(config.title)}">
  <meta name="twitter:description" content="${escapeAttribute(config.description)}">
  <meta name="twitter:image" content="${logo}">
  <meta name="twitter:image:alt" content="RE IMAGE Business Solutions logo">
  <script id="reimage-seo-schema" type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(/</g, '\\u003c')}</script>
  <!-- REIMAGE-SEO:END -->
`;
  html = html.replace(/<\/head>/i, `${seo}</head>`);
  fs.writeFileSync(absolute, html);
}

console.log(`Enhanced SEO metadata and entity schema on ${Object.keys(pages).length} public pages.`);
