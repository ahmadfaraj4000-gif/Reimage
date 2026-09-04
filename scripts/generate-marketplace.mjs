import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = process.env.MARKETPLACE_DATA_PATH || path.join(root, 'marketplace-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const siteUrl = 'https://reimagebs.com';
const guidePath = '/marketplace/guides/new-britain-avenue-hartford/';
const editorialPath = '/marketplace/about/';
const categoryMap = new Map(data.categories.map((category) => [category.slug, category]));
const businessMap = new Map(data.businesses.map((business) => [business.slug, business]));

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
}[character]));

const escapeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const formatDate = (iso) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
const categoryName = (slug) => categoryMap.get(slug)?.name || slug;
const categoryUrl = (slug) => `/marketplace/categories/${slug}/`;
const profileUrl = (slug) => `/marketplace/businesses/${slug}/`;

const logoAssets = {
  'fusion-health-juice-bar': 'assets/marketplace/logos/fusion-health-juice-bar.png',
  '881-grab-and-go': 'assets/marketplace/logos/881-grab-and-go.png',
  'the-patio': 'assets/marketplace/logos/the-patio.webp',
  'lunch-box': 'assets/marketplace/logos/lunch-box.png',
  'mi-buen-pastor-mexican-fusion': 'assets/marketplace/logos/mi-buen-pastor-mexican-fusion-transparent.png',
  'car-craft-auto-body-towing': 'assets/marketplace/logos/car-craft-auto-body-towing.png',
  'rent-me-ct': 'assets/marketplace/logos/rent-me-ct.png',
  'cr8-autos': 'assets/marketplace/logos/cr8-autos.png',
  'empire-elite-rides': 'assets/marketplace/logos/empire-elite-rides.png',
  'techniq-skin-beauty': 'assets/marketplace/logos/techniq-skin-beauty.png',
  'lories-african-hair-braiding': 'assets/marketplace/logos/lories-african-hair-braiding.png',
  'living-word-imprints': 'assets/marketplace/logos/living-word-imprints.png',
  'andaleeb-enterprises': 'assets/marketplace/logos/andaleeb-enterprises.webp',
  'the-anchor-collective': 'assets/marketplace/logos/the-anchor-collective.png'
};

const cuisineBySlug = {
  'fusion-health-juice-bar': ['Jamaican', 'Juice bar', 'Smoothies'],
  '881-grab-and-go': ['Caribbean', 'Jamaican', 'American'],
  'the-patio': ['American', 'Cocktails'],
  'lunch-box': ['Caribbean', 'Jamaican'],
  'mi-buen-pastor-mexican-fusion': ['Mexican', 'Mexican fusion']
};

const corridorSlugs = new Set([
  'lories-african-hair-braiding',
  'fusion-health-juice-bar',
  '881-grab-and-go',
  'mi-buen-pastor-mexican-fusion'
]);

function validateData() {
  const categorySlugs = new Set();
  const businessSlugs = new Set();
  for (const category of data.categories) {
    if (!category.slug || !category.name || !category.description) throw new Error(`Incomplete category: ${category.slug || 'unknown'}`);
    if (categorySlugs.has(category.slug)) throw new Error(`Duplicate category slug: ${category.slug}`);
    categorySlugs.add(category.slug);
  }
  for (const business of data.businesses) {
    const required = ['slug', 'name', 'website', 'ctaLabel', 'ctaUrl', 'image', 'imageAlt', 'shortBio', 'longBio'];
    for (const field of required) if (!business[field]) throw new Error(`${business.slug || business.name || 'Business'} is missing ${field}`);
    if (businessSlugs.has(business.slug)) throw new Error(`Duplicate business slug: ${business.slug}`);
    businessSlugs.add(business.slug);
    if (!business.categories?.length) throw new Error(`${business.slug} needs a category`);
    business.categories.forEach((slug) => {
      if (!categorySlugs.has(slug)) throw new Error(`${business.slug} references unknown category ${slug}`);
    });
    if (!business.address && !business.serviceArea) throw new Error(`${business.slug} needs an address or service area`);
    if (!business.specialties?.length || !business.faq?.length) throw new Error(`${business.slug} needs specialties and FAQs`);
  }
  for (const category of data.categories) {
    if (!businessMap.has(category.featured)) throw new Error(`${category.slug} has an invalid featured business`);
  }
}

function navigation(active = 'marketplace') {
  return `<nav class="navbar" id="navbar" aria-label="Main navigation">
    <a class="nav-logo new-brand" href="/index.html" aria-label="RE IMAGE homepage"><img src="/assets/reimage-logo-2026-transparent.png" alt="RE IMAGE"></a>
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>
    <ul class="nav-links" id="navLinks">
      <li><a href="/website-development.html">Systems</a></li>
      <li><a href="/products.html">Products</a></li>
      <li><a href="/marketplace.html"${active === 'marketplace' ? ' class="active" aria-current="page"' : ''}>Discover</a></li>
      <li><a href="/our-work.html">Portfolio</a></li>
      <li><a href="/careers.html">Careers</a></li>
      <li><a class="nav-cta" href="/start-with-us.html">Start With Us</a></li>
    </ul>
  </nav>`;
}

function footer() {
  return `<footer class="minimal-footer public-site-footer">
    <a class="new-brand" href="/index.html#home" aria-label="RE IMAGE homepage"><img src="/assets/reimage-logo-2026-transparent.png" alt="RE IMAGE"></a>
    <p>Custom business operating systems, built around you.</p>
    <div><a href="/website-development.html">Systems</a><a href="/products.html">Products</a><a href="/marketplace.html">Discover</a><a href="/our-work.html">Portfolio</a><a href="/start-with-us.html">Contact</a><a href="https://login.reimagebs.com">Client Login</a></div>
    <small>© ${new Date().getFullYear()} RE IMAGE Business Solutions. All rights reserved.</small>
  </footer>`;
}

function categoryDirectory() {
  return `<nav class="marketplace-category-directory" aria-label="Hartford business categories"><div class="market-wrap"><strong>Browse local businesses</strong><div><a href="/marketplace.html">All businesses</a>${data.categories.map((category) => `<a href="${categoryUrl(category.slug)}">${escapeHtml(category.shortName)}</a>`).join('')}<a href="${guidePath}">New Britain Avenue guide</a><a href="${editorialPath}">About this directory</a></div></div></nav>`;
}

function absoluteAsset(value) {
  return value.startsWith('http') ? value : `${siteUrl}/${value.replace(/^\//, '')}`;
}

function head({ title, description, canonical, image = `${siteUrl}/assets/reimage-logo-2026-transparent.png`, imageAlt = 'RE IMAGE Hartford local business guide', schema = [] }) {
  const absoluteImage = absoluteAsset(image);
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="RE IMAGE Business Solutions">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="bingbot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta name="theme-color" content="#0877e8">
  <meta name="marketplace-events-endpoint" content="https://uybcjtigyujoyrunecto.supabase.co/functions/v1/record-marketplace-event">
  <link rel="canonical" href="${canonical}">
  <link rel="alternate" hreflang="en-US" href="${canonical}">
  <link rel="alternate" hreflang="x-default" href="${canonical}">
  <link rel="alternate" type="text/plain" href="${siteUrl}/llms.txt" title="RE IMAGE site overview">
  <link rel="icon" href="/assets/reimage-logo-2026-transparent.png">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="en_US">
  <meta property="og:site_name" content="Hartford Marketplace by RE IMAGE">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${absoluteImage}">
  <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${absoluteImage}">
  <meta name="twitter:image:alt" content="${escapeHtml(imageAlt)}">
  <link rel="stylesheet" href="/public-shell.css?v=20260904-4">
  <link rel="stylesheet" href="/marketplace.css?v=20260904-7">
  ${schema.map((item) => `<script type="application/ld+json">${escapeJson(item)}</script>`).join('\n  ')}
</head>`;
}

function addressText(business) {
  if (!business.address) return business.serviceArea;
  return `${business.address.street}, ${business.address.city}, ${business.address.state} ${business.address.postalCode}`;
}

function directionsUrl(business) {
  return business.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText(business))}` : '';
}

function profileFaqs(business) {
  return business.faq.filter(([question]) => !/\bwhere\b|pick up|in connecticut|where does .* operate/i.test(question));
}

function businessLogo(business) {
  const logo = logoAssets[business.slug];
  const title = `${business.name} logo`;
  if (logo) {
    return `<img class="business-logo" src="/${logo}" alt="${escapeHtml(title)}" loading="lazy" decoding="async">`;
  }
  const initials = business.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return `<span class="business-wordmark" role="img" aria-label="${escapeHtml(title)}"><span aria-hidden="true">${escapeHtml(initials)}</span><strong>${escapeHtml(business.name)}</strong></span>`;
}

function card(business, options = {}) {
  const primary = categoryMap.get(business.categories[0]);
  const isBeyond = business.regionRank === 4;
  const featured = options.featured;
  const searchText = [business.name, business.locationLabel, addressText(business), business.shortBio, ...business.specialties, ...business.tags, ...business.categories.map(categoryName)].join(' ').toLowerCase();
  return `<article class="business-card${featured ? ' business-card--featured' : ''}" data-business-card data-slug="${business.slug}" data-primary-category="${business.categories[0]}" data-categories="${business.categories.join(' ')}" data-location="${(business.locations || [business.locationKey]).join(' ')}" data-rank="${business.regionRank}" data-search="${escapeHtml(searchText)}">
    <a class="business-card__media business-card__logo" href="${profileUrl(business.slug)}" aria-label="View ${escapeHtml(business.name)} profile">
      <span class="business-logo-stage business-logo-stage--${business.slug}">${businessLogo(business)}</span>
      ${featured ? `<span class="feature-badge">${escapeHtml(business.featuredLabel || 'Featured')}</span>` : ''}
      ${isBeyond ? '<span class="area-badge">Beyond Greater Hartford</span>' : ''}
    </a>
    <div class="business-card__body">
      <div class="business-card__meta"><a href="${categoryUrl(primary.slug)}">${escapeHtml(primary.shortName)}</a><span>${escapeHtml(business.locationLabel)}</span></div>
      <h3><a href="${profileUrl(business.slug)}">${escapeHtml(business.name)}</a></h3>
      <p>${escapeHtml(business.shortBio)}</p>
      <ul class="specialty-list" aria-label="Specialties">${business.specialties.slice(0, 3).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      <div class="business-card__actions"><a class="button button--primary" href="${business.ctaUrl}" target="_blank" rel="noopener">${escapeHtml(business.ctaLabel)}</a><a class="text-link" href="${profileUrl(business.slug)}">View profile <span aria-hidden="true">→</span></a></div>
    </div>
  </article>`;
}

function shell({ title, description, canonical, image, imageAlt, schema, body, pageClass = '' }) {
  return `<!doctype html>
<html lang="en">
  ${head({ title, description, canonical, image, imageAlt, schema })}
<body class="marketplace-page ${pageClass}">
  <a class="skip-link" href="#main-content">Skip to marketplace content</a>
  ${navigation()}
  ${body}
  ${categoryDirectory()}
  ${footer()}
  <script src="/marketplace.js?v=20260904-2" defer></script>
</body>
</html>\n`;
}

function hubSchema() {
  return [{
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization', '@id': `${siteUrl}/#organization`, name: 'RE IMAGE Business Solutions', alternateName: 'RE IMAGE', url: `${siteUrl}/`,
        logo: { '@type': 'ImageObject', url: `${siteUrl}/assets/reimage-logo-2026-transparent.png` },
        email: 'reimagebs@gmail.com', telephone: '+1-860-718-5928',
        areaServed: [{ '@type': 'City', name: 'Hartford', containedInPlace: { '@type': 'State', name: 'Connecticut' } }, { '@type': 'AdministrativeArea', name: 'Greater Hartford' }]
      },
      {
        '@type': 'WebSite', '@id': `${siteUrl}/#website`, name: 'RE IMAGE Business Solutions', url: `${siteUrl}/`, publisher: { '@id': `${siteUrl}/#organization` }, inLanguage: 'en-US',
        potentialAction: { '@type': 'SearchAction', target: `${siteUrl}/marketplace.html?q={search_term_string}`, 'query-input': 'required name=search_term_string' }
      },
      {
        '@type': 'CollectionPage', '@id': `${siteUrl}/marketplace.html#webpage`, name: 'Hartford Local Business Directory by RE IMAGE', url: `${siteUrl}/marketplace.html`,
        description: 'Discover restaurants, rental cars, auto body shops, skincare, hair braiding, printing, property rentals, and local services in Hartford and Greater Hartford.',
        isPartOf: { '@id': `${siteUrl}/#website` }, publisher: { '@id': `${siteUrl}/#organization` }, dateModified: data.verifiedAt, inLanguage: 'en-US',
        about: { '@type': 'City', name: 'Hartford', containedInPlace: { '@type': 'State', name: 'Connecticut' } },
        mainEntity: {
          '@type': 'ItemList', name: 'Businesses in Hartford and Greater Hartford', numberOfItems: data.businesses.length,
          itemListElement: data.businesses.map((business, index) => ({ '@type': 'ListItem', position: index + 1, name: business.name, url: `${siteUrl}${profileUrl(business.slug)}` }))
        }
      }
    ]
  }];
}

function generateHub() {
  const hartfordBusinesses = data.businesses.filter((business) => business.regionRank < 4);
  const beyondBusinesses = data.businesses.filter((business) => business.regionRank === 4);
  const featured = data.categories.map((category) => businessMap.get(category.featured)).filter(Boolean);
  const embedded = escapeJson({ categories: data.categories, businesses: data.businesses.map((business) => ({ slug: business.slug, name: business.name, categories: business.categories, locationKey: business.locationKey, regionRank: business.regionRank, specialties: business.specialties, tags: business.tags, shortBio: business.shortBio })) });
  const body = `<main id="main-content">
    <section class="market-hero">
      <div class="market-wrap market-hero__inner">
        <h1>Find Hartford’s best <em>local businesses.</em></h1>
        <p class="market-hero__copy">From restaurants and fresh juices to rental cars, auto body repair, skincare, braiding, printing, and more—start here.</p>
        <form class="market-search" id="marketSearchForm" role="search">
          <svg aria-hidden="true" viewBox="0 0 24 24"><path d="m21 21-4.35-4.35m1.35-5.65a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
          <label class="visually-hidden" for="marketSearch">Search Hartford businesses</label>
          <input id="marketSearch" name="q" type="search" autocomplete="off" placeholder="Search food, cars, skincare, printing…">
          <button type="submit">Search</button>
        </form>
      </div>
    </section>

    <section class="discovery-bar" aria-label="Marketplace filters">
      <div class="market-wrap">
        <div class="filter-block"><span class="visually-hidden">Explore by service</span><div class="chip-row" id="categoryFilters"><button class="filter-chip active" type="button" data-category="all" aria-pressed="true">All businesses</button>${data.categories.map((category) => `<button class="filter-chip" type="button" data-category="${category.slug}" aria-pressed="false">${escapeHtml(category.shortName)}</button>`).join('')}</div></div>
        <div class="filter-block filter-block--locations"><label class="location-select"><span class="visually-hidden">Filter by area</span><select id="locationFilter"><option value="all">All locations</option><option value="hartford">Hartford</option><option value="west-hartford">West Hartford</option><option value="east-hartford">East Hartford</option><option value="manchester">Manchester</option><option value="farmington">Farmington</option><option value="other-connecticut">Other Connecticut</option><option value="beyond">Beyond Greater Hartford</option></select></label></div>
      </div>
    </section>

    <section class="market-section featured-section" aria-labelledby="featuredTitle">
      <div class="market-wrap">
        <div class="section-heading"><div><p class="eyebrow">Featured around Hartford</p><h2 id="featuredTitle">Local standouts, one per category.</h2></div></div>
        <div class="featured-rail" id="featuredRail">${featured.map((business) => card(business, { featured: true })).join('')}</div>
      </div>
    </section>

    <section class="market-section corridor-promo" aria-labelledby="corridorPromoTitle">
      <div class="market-wrap corridor-promo__inner">
        <div><p class="eyebrow">Hartford street guide</p><h2 id="corridorPromoTitle">Three storefronts. Six street numbers.</h2><p>Lorie’s at 875, Fusion Health Juice Bar at 879, and 881 Grab &amp; Go at 881 sit together on New Britain Avenue. See what each spot is known for, plus Mexican fusion nearby.</p></div>
        <a class="button button--primary" href="${guidePath}">Explore New Britain Avenue</a>
      </div>
    </section>

    <section class="market-section directory-section" aria-labelledby="directoryTitle">
      <div class="market-wrap">
        <div class="directory-heading"><div><p class="eyebrow">The local directory</p><h2 id="directoryTitle">Businesses in and around Hartford</h2></div><p class="results-count" id="resultsCount" aria-live="polite">${hartfordBusinesses.length} businesses</p></div>
        <div class="active-filters" id="activeFilters" hidden></div>
        <div class="business-grid" id="businessGrid">${hartfordBusinesses.map((business) => card(business)).join('')}</div>
        <div class="empty-state" id="emptyState" hidden><span>0 results</span><h3>No exact matches yet.</h3><p>Try a broader service, clear the town filter, or tell RE IMAGE which Hartford business should be added.</p><button class="button button--primary" id="clearFilters" type="button">Clear filters</button></div>
      </div>
    </section>

    <section class="market-section beyond-section" id="beyond" aria-labelledby="beyondTitle">
      <div class="market-wrap"><div class="section-heading"><div><p class="eyebrow">Beyond Greater Hartford</p><h2 id="beyondTitle">Trusted businesses farther out.</h2></div><p>These RE IMAGE clients serve New York and other markets outside Connecticut’s capital region.</p></div><div class="business-grid business-grid--two" id="beyondGrid">${beyondBusinesses.map((business) => card(business)).join('')}</div></div>
    </section>

    <section class="owner-cta"><div class="market-wrap owner-cta__inner"><div><p class="eyebrow">Built for local business</p><h2>Own a business Hartford should know?</h2><p>Join the directory or ask about the one featured placement available in your category.</p></div><div class="owner-cta__actions"><a class="button button--light" href="/start-with-us.html?service=Marketplace%20Listing">Get listed</a><a class="button button--gold" href="/start-with-us.html?service=Featured%20Marketplace%20Placement">Feature your business</a></div></div></section>
    <script id="marketplaceData" type="application/json">${embedded}</script>
  </main>`;

  return shell({ title: 'Hartford Local Business Directory | Food, Cars, Beauty & More | RE IMAGE', description: 'Find Hartford restaurants, rental cars, auto body shops, skincare, African hair braiding, printing, property rentals, and local services with verified details and direct links.', canonical: `${siteUrl}/marketplace.html`, imageAlt: 'RE IMAGE Hartford local business directory', schema: hubSchema(), body, pageClass: 'marketplace-hub' });
}

function generateCategory(category) {
  const businesses = data.businesses.filter((business) => business.categories.includes(category.slug)).sort((a, b) => a.regionRank - b.regionRank || a.name.localeCompare(b.name));
  const featured = businessMap.get(category.featured);
  const categoryLocation = businesses.some((business) => business.regionRank < 4) ? 'in Hartford, CT' : 'beyond Greater Hartford';
  const breadcrumb = { '@type': 'BreadcrumbList', '@id': `${siteUrl}${categoryUrl(category.slug)}#breadcrumb`, itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Discover', item: `${siteUrl}/marketplace.html` }, { '@type': 'ListItem', position: 2, name: category.name, item: `${siteUrl}${categoryUrl(category.slug)}` }] };
  const schema = [{
    '@context': 'https://schema.org', '@graph': [{
      '@type': 'CollectionPage', '@id': `${siteUrl}${categoryUrl(category.slug)}#webpage`, name: `${category.name} ${categoryLocation}`, url: `${siteUrl}${categoryUrl(category.slug)}`, description: category.description,
      isPartOf: { '@id': `${siteUrl}/#website` }, publisher: { '@id': `${siteUrl}/#organization` }, dateModified: data.verifiedAt, inLanguage: 'en-US',
      about: [{ '@type': 'Thing', name: category.name }, { '@type': 'City', name: 'Hartford', containedInPlace: { '@type': 'State', name: 'Connecticut' } }], breadcrumb: { '@id': breadcrumb['@id'] },
      mainEntity: { '@type': 'ItemList', name: `${category.name} near Hartford`, numberOfItems: businesses.length, itemListElement: businesses.map((business, index) => ({ '@type': 'ListItem', position: index + 1, name: business.name, item: { '@type': business.schemaType || 'Organization', '@id': `${siteUrl}${profileUrl(business.slug)}#business`, name: business.name, url: `${siteUrl}${profileUrl(business.slug)}` } })) }
    }, breadcrumb]
  }];
  const body = `<main id="main-content">
    <section class="category-hero"><div class="market-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/marketplace.html">Discover</a><span>/</span><span aria-current="page">${escapeHtml(category.name)}</span></nav><p class="eyebrow">${businesses.some((business) => business.regionRank < 4) ? 'Hartford local guide' : 'Beyond Greater Hartford'}</p><h1>${escapeHtml(category.name)}<br><em>${escapeHtml(categoryLocation)}.</em></h1><p>${escapeHtml(category.description)}</p><a class="back-link" href="/marketplace.html">← Search all Hartford businesses</a></div></section>
    <section class="market-section category-feature"><div class="market-wrap"><div class="section-heading"><div><p class="eyebrow">Featured ${escapeHtml(category.shortName)}</p><h2>Start with a local standout.</h2></div></div><div class="featured-single">${card(featured, { featured: true })}</div></div></section>
    <section class="market-section"><div class="market-wrap"><div class="directory-heading"><div><p class="eyebrow">Browse the category</p><h2>${businesses.length} ${businesses.length === 1 ? 'business' : 'businesses'} to explore</h2></div><a class="text-link" href="/marketplace.html?category=${category.slug}">Open filtered marketplace →</a></div><div class="business-grid">${businesses.map((business) => card(business)).join('')}</div></div></section>
    <section class="category-copy"><div class="market-wrap category-copy__inner"><div><p class="eyebrow">Find the right fit</p><h2>Clear details. Direct local connections.</h2></div><p>Every profile includes specialties, verified location or service-area information, and a direct path to the business. RE IMAGE does not add fabricated ratings or hide paid placements inside organic results.</p></div></section>
  </main>`;
  return shell({ title: `${category.name} ${categoryLocation} | RE IMAGE Local Guide`, description: `${category.description} Browse verified local profiles, specialties, locations, and direct business links.`, canonical: `${siteUrl}${categoryUrl(category.slug)}`, image: logoAssets[featured.slug] || featured.image, imageAlt: `${featured.name} logo — featured ${category.shortName} business`, schema, body, pageClass: 'marketplace-category' });
}

function profileSchema(business) {
  const pageUrl = `${siteUrl}${profileUrl(business.slug)}`;
  const logo = absoluteAsset(logoAssets[business.slug] || business.image);
  const image = absoluteAsset(business.image);
  const breadcrumb = {
    '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Discover', item: `${siteUrl}/marketplace.html` },
      { '@type': 'ListItem', position: 2, name: categoryName(business.categories[0]), item: `${siteUrl}${categoryUrl(business.categories[0])}` },
      { '@type': 'ListItem', position: 3, name: business.name, item: pageUrl }
    ]
  };
  const object = {
    '@type': business.schemaType || 'LocalBusiness', '@id': `${pageUrl}#business`, name: business.name, url: business.website,
    mainEntityOfPage: { '@id': `${pageUrl}#webpage` }, image: [{ '@type': 'ImageObject', url: logo, caption: `${business.name} logo` }, { '@type': 'ImageObject', url: image, caption: business.imageAlt }], logo: { '@type': 'ImageObject', url: logo, caption: `${business.name} logo` },
    description: business.longBio, telephone: business.phone, areaServed: business.serviceArea || business.address?.city,
    address: business.address ? { '@type': 'PostalAddress', streetAddress: business.address.street, addressLocality: business.address.city, addressRegion: business.address.state, postalCode: business.address.postalCode, addressCountry: 'US' } : undefined,
    hasMap: business.address ? directionsUrl(business) : undefined,
    knowsAbout: [...business.specialties, ...business.tags],
    servesCuisine: business.cuisine || cuisineBySlug[business.slug],
    menu: ['Restaurant', 'BarOrPub'].includes(business.schemaType) ? business.website : undefined,
    sameAs: [business.website],
    potentialAction: { '@type': 'ViewAction', name: business.ctaLabel, target: business.ctaUrl }
  };
  Object.keys(object).forEach((key) => object[key] === undefined && delete object[key]);
  const faqs = profileFaqs(business);
  return [{
    '@context': 'https://schema.org', '@graph': [
      {
        '@type': 'WebPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: `${business.name} — ${business.specialties[0]} in ${business.locationLabel}`,
        description: business.shortBio, dateModified: data.verifiedAt, inLanguage: 'en-US', isPartOf: { '@id': `${siteUrl}/#website` },
        publisher: { '@id': `${siteUrl}/#organization` }, breadcrumb: { '@id': breadcrumb['@id'] }, mainEntity: { '@id': object['@id'] }
      },
      object,
      breadcrumb,
      ...(faqs.length ? [{ '@type': 'FAQPage', '@id': `${pageUrl}#faq`, mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }] : [])
    ]
  }];
}

function generateProfile(business) {
  const primary = categoryMap.get(business.categories[0]);
  const related = data.businesses.filter((item) => item.slug !== business.slug && item.categories.some((slug) => business.categories.includes(slug))).sort((a, b) => a.regionRank - b.regionRank).slice(0, 3);
  const address = addressText(business);
  const faqs = profileFaqs(business);
  const body = `<main id="main-content" data-profile-business="${business.slug}" data-profile-category="${business.categories[0]}">
    <section class="profile-hero"><div class="market-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/marketplace.html">Discover</a><span>/</span><a href="${categoryUrl(primary.slug)}">${escapeHtml(primary.shortName)}</a><span>/</span><span aria-current="page">${escapeHtml(business.name)}</span></nav><div class="profile-hero__grid"><div class="profile-hero__media profile-hero__logo"><span class="business-logo-stage business-logo-stage--${business.slug}">${businessLogo(business)}</span></div><div class="profile-hero__copy"><p class="eyebrow">${escapeHtml(primary.name)}</p><h1>${escapeHtml(business.name)}</h1><p class="profile-lead">${escapeHtml(business.shortBio)}</p><div class="profile-actions"><a class="button button--primary" href="${business.ctaUrl}" target="_blank" rel="noopener">${escapeHtml(business.ctaLabel)} ↗</a>${business.address ? `<a class="button button--outline" href="${directionsUrl(business)}" target="_blank" rel="noopener">Get directions</a>` : ''}</div></div></div></div></section>
    <section class="profile-details"><div class="market-wrap profile-details__grid"><div class="profile-story"><p class="eyebrow">Services and specialties</p><h2>What ${escapeHtml(business.name)} offers.</h2><p>${escapeHtml(business.longBio)}</p><div class="tag-cloud">${[...business.specialties, ...business.tags].map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div></div><aside class="profile-info"><p class="profile-info__label">Business information</p><dl><div><dt>${business.address ? 'Address' : 'Service area'}</dt><dd>${escapeHtml(address)}</dd></div>${business.secondaryAddress ? `<div><dt>Second location</dt><dd>${escapeHtml(business.secondaryAddress)}</dd></div>` : ''}${business.phone ? `<div><dt>Phone</dt><dd><a href="tel:${business.phone.replace(/[^\d+]/g, '')}">${escapeHtml(business.phone)}</a></dd></div>` : ''}<div><dt>Official website</dt><dd><a href="${business.website}" target="_blank" rel="noopener">Visit ${escapeHtml(business.name)} ↗</a></dd></div><div><dt>Information verified</dt><dd><time datetime="${data.verifiedAt}">${formatDate(data.verifiedAt)}</time></dd></div></dl>${business.secondaryCtaUrl ? `<a class="button button--outline button--full" href="${business.secondaryCtaUrl}" target="_blank" rel="noopener">${escapeHtml(business.secondaryCtaLabel)}</a>` : ''}</aside></div></section>
    ${faqs.length ? `<section class="profile-faq"><div class="market-wrap"><div class="section-heading"><div><p class="eyebrow">Quick answers</p><h2>Know before you go.</h2></div></div><div class="faq-grid">${faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}<span aria-hidden="true">+</span></summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></div></section>` : ''}
    ${related.length ? `<section class="market-section related-section"><div class="market-wrap"><div class="directory-heading"><div><p class="eyebrow">Keep exploring</p><h2>More ${escapeHtml(primary.shortName)}</h2></div><a class="text-link" href="${categoryUrl(primary.slug)}">View category →</a></div><div class="business-grid">${related.map((item) => card(item)).join('')}</div></div></section>` : ''}
    ${corridorSlugs.has(business.slug) ? `<aside class="profile-guide-link"><div class="market-wrap"><p><strong>Planning a New Britain Avenue stop?</strong> Use the <a href="${guidePath}">New Britain Avenue Hartford business guide</a> to explore nearby food, drinks, and braiding.</p></div></aside>` : ''}
    <section class="profile-owner-note"><div class="market-wrap"><p>Own or manage this business? <a href="/start-with-us.html?service=Marketplace%20Listing">Request an information update</a>.</p></div></section>
  </main>`;
  return shell({ title: `${business.name} | ${business.specialties[0]} in ${business.locationLabel} | RE IMAGE`, description: `${business.shortBio} Find verified location details, specialties, and direct booking or ordering links.`, canonical: `${siteUrl}${profileUrl(business.slug)}`, image: logoAssets[business.slug] || business.image, imageAlt: `${business.name} logo`, schema: profileSchema(business), body, pageClass: 'marketplace-profile' });
}

function guideListing(business, note = '') {
  return `<li class="guide-business">
    <div class="guide-business__logo"><span class="business-logo-stage business-logo-stage--${business.slug}">${businessLogo(business)}</span></div>
    <div><p class="business-card__meta"><a href="${categoryUrl(business.categories[0])}">${escapeHtml(categoryName(business.categories[0]))}</a></p><h2><a href="${profileUrl(business.slug)}">${escapeHtml(business.name)}</a></h2><address>${escapeHtml(addressText(business))}</address><p>${escapeHtml(business.shortBio)}</p>${note ? `<p class="guide-note">${escapeHtml(note)}</p>` : ''}<ul class="specialty-list" aria-label="${escapeHtml(business.name)} specialties">${business.specialties.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><div class="business-card__actions"><a class="button button--primary" href="${business.ctaUrl}" target="_blank" rel="noopener">${escapeHtml(business.ctaLabel)}</a><a class="text-link" href="${profileUrl(business.slug)}">View full profile →</a></div></div>
  </li>`;
}

function generateCorridorGuide() {
  const orderedSlugs = ['lories-african-hair-braiding', 'fusion-health-juice-bar', '881-grab-and-go', 'mi-buen-pastor-mexican-fusion'];
  const businesses = orderedSlugs.map((slug) => businessMap.get(slug)).filter(Boolean);
  const faqs = [
    ['What businesses are located between 875 and 881 New Britain Avenue in Hartford?', 'Lorie’s African Hair Braiding is at 875, Fusion Health Juice Bar is at 879, and 881 Grab & Go is at 881 New Britain Avenue.'],
    ['Where can I get Peanut Punch on New Britain Avenue?', 'Fusion Health Juice Bar serves its signature Jamaican-inspired Peanut Punch at 879 New Britain Avenue in Hartford.'],
    ['Where can I get the Cheyney Fish Sandwich in Hartford?', '881 Grab & Go serves the Cheyney Fish Sandwich at 881 New Britain Avenue. It features fried whiting, 881 aioli, pickled cabbage, and cheese.'],
    ['Where can I get African hair braiding near New Britain Avenue?', 'Lorie’s African Hair Braiding at 875 New Britain Avenue offers box braids, feed-in braids, Fulani styles, twists, cornrows, extensions, and locs.'],
    ['Is there Mexican food nearby?', 'Mi Buen Pastor Mexican Fusion is nearby at 265 Newfield Avenue, serving handmade tortillas, quesabirria tacos, burritos, churros, and aguas frescas.']
  ];
  const pageUrl = `${siteUrl}${guidePath}`;
  const breadcrumb = { '@type': 'BreadcrumbList', '@id': `${pageUrl}#breadcrumb`, itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Discover', item: `${siteUrl}/marketplace.html` },
    { '@type': 'ListItem', position: 2, name: 'New Britain Avenue Hartford Business Guide', item: pageUrl }
  ] };
  const schema = [{ '@context': 'https://schema.org', '@graph': [
    {
      '@type': 'CollectionPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: 'New Britain Avenue Hartford Business Guide',
      description: 'A block-by-block guide to food, fresh drinks, and African hair braiding on New Britain Avenue in Hartford, plus Mexican fusion nearby.',
      dateModified: data.verifiedAt, inLanguage: 'en-US', isPartOf: { '@id': `${siteUrl}/#website` }, publisher: { '@id': `${siteUrl}/#organization` },
      about: { '@type': 'Place', name: 'New Britain Avenue, Hartford, Connecticut' }, breadcrumb: { '@id': breadcrumb['@id'] },
      mainEntity: { '@type': 'ItemList', name: 'Businesses on and near New Britain Avenue in Hartford', numberOfItems: businesses.length, itemListElement: businesses.map((business, index) => ({ '@type': 'ListItem', position: index + 1, name: business.name, url: `${siteUrl}${profileUrl(business.slug)}` })) }
    },
    breadcrumb,
    { '@type': 'FAQPage', '@id': `${pageUrl}#faq`, mainEntity: faqs.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }
  ] }];
  const body = `<main id="main-content">
    <section class="category-hero corridor-hero"><div class="market-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/marketplace.html">Discover</a><span>/</span><span aria-current="page">New Britain Avenue</span></nav><p class="eyebrow">Hartford street guide</p><h1>New Britain Avenue<br><em>business guide.</em></h1><p>Find signature food, fresh drinks, and African hair braiding in one compact Hartford block—with Mexican fusion nearby on Newfield Avenue.</p><a class="back-link" href="/marketplace.html">← Search all Hartford businesses</a></div></section>
    <section class="corridor-answer"><div class="market-wrap corridor-answer__inner"><p class="eyebrow">The quick answer</p><h2>Three storefronts sit within six street numbers.</h2><p>Lorie’s African Hair Braiding is at <strong>875</strong>, Fusion Health Juice Bar is at <strong>879</strong>, and 881 Grab &amp; Go is at <strong>881 New Britain Avenue</strong>. That makes this small stretch a useful stop for braiding, Peanut Punch, Caribbean food, and the Cheyney Fish Sandwich.</p><p class="guide-verified">Business details last verified <time datetime="${data.verifiedAt}">${formatDate(data.verifiedAt)}</time>.</p></div></section>
    <section class="market-section guide-directory" aria-labelledby="guideDirectoryTitle"><div class="market-wrap"><div class="section-heading"><div><p class="eyebrow">Block by block</p><h2 id="guideDirectoryTitle">What to find and where.</h2></div></div><ol class="guide-business-list">${businesses.map((business) => guideListing(business, business.slug === 'mi-buen-pastor-mexican-fusion' ? 'Nearby on Newfield Avenue.' : 'On New Britain Avenue.')).join('')}</ol></div></section>
    <section class="profile-faq"><div class="market-wrap"><div class="section-heading"><div><p class="eyebrow">New Britain Avenue FAQ</p><h2>Answers before you go.</h2></div></div><div class="faq-grid">${faqs.map(([question, answer]) => `<details><summary>${escapeHtml(question)}<span aria-hidden="true">+</span></summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></div></section>
    <section class="profile-owner-note"><div class="market-wrap"><p>See something that needs updating? Read <a href="${editorialPath}">how RE IMAGE verifies this Hartford guide</a> or request a correction.</p></div></section>
  </main>`;
  return shell({ title: 'New Britain Avenue Hartford Business Guide | RE IMAGE', description: 'Explore businesses on New Britain Avenue in Hartford: Peanut Punch, the Cheyney Fish Sandwich, African hair braiding, Caribbean food, and nearby Mexican fusion.', canonical: pageUrl, image: logoAssets['fusion-health-juice-bar'], imageAlt: 'Fusion Health Juice Bar logo, one of the businesses on New Britain Avenue in Hartford', schema, body, pageClass: 'marketplace-guide' });
}

function generateEditorialPage() {
  const pageUrl = `${siteUrl}${editorialPath}`;
  const schema = [{ '@context': 'https://schema.org', '@graph': [
    { '@type': 'AboutPage', '@id': `${pageUrl}#webpage`, url: pageUrl, name: 'About the RE IMAGE Hartford Local Business Directory', description: 'How RE IMAGE researches, verifies, updates, and labels businesses in its Hartford local guide.', dateModified: data.verifiedAt, inLanguage: 'en-US', isPartOf: { '@id': `${siteUrl}/#website` }, publisher: { '@id': `${siteUrl}/#organization` } },
    { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Discover', item: `${siteUrl}/marketplace.html` }, { '@type': 'ListItem', position: 2, name: 'About this directory', item: pageUrl }] }
  ] }];
  const body = `<main id="main-content">
    <section class="category-hero editorial-hero"><div class="market-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/marketplace.html">Discover</a><span>/</span><span aria-current="page">About this directory</span></nav><p class="eyebrow">How the guide works</p><h1>Local information<br><em>people can verify.</em></h1><p>RE IMAGE publishes concise Hartford-area business profiles built from official business sources and owner-supplied information.</p><a class="back-link" href="/marketplace.html">← Browse Hartford businesses</a></div></section>
    <section class="editorial-content"><div class="market-wrap editorial-grid"><article><p class="eyebrow">Our process</p><h2>What gets checked.</h2><p>Before a listing is published, we check the business name, official website, physical address or truthful service area, direct customer action, core specialties, and image attribution. Each profile shows the date its information was last verified.</p><h3>Corrections and updates</h3><p>Business owners can request a correction through RE IMAGE. We update factual details when a current official source or owner confirmation supports the change.</p><p class="guide-verified">Directory information last reviewed <time datetime="${data.verifiedAt}">${formatDate(data.verifiedAt)}</time>.</p></article><article><p class="eyebrow">What you will not find</p><h2>No invented trust signals.</h2><p>We do not publish fabricated ratings, copied reviews, unsupported “best” claims, or fake storefront addresses. Paid placements are labeled <strong>Sponsored</strong>; editorial selections are labeled <strong>RE IMAGE Pick</strong>.</p><h3>How listings are organized</h3><p>Hartford storefronts appear first, followed by nearby Greater Hartford businesses, other Connecticut services, and a separate section for businesses beyond Greater Hartford.</p></article></div></section>
    <section class="owner-cta"><div class="market-wrap owner-cta__inner"><div><p class="eyebrow">Keep it accurate</p><h2>Own or manage a listed business?</h2><p>Send RE IMAGE a correction, new official link, updated service area, or current business image.</p></div><div class="owner-cta__actions"><a class="button button--light" href="/start-with-us.html?service=Marketplace%20Listing">Request an update</a></div></div></section>
  </main>`;
  return shell({ title: 'About the Hartford Local Business Directory | RE IMAGE', description: 'Learn how RE IMAGE researches, verifies, updates, and labels businesses in its Hartford local business directory.', canonical: pageUrl, imageAlt: 'RE IMAGE Business Solutions logo', schema, body, pageClass: 'marketplace-editorial' });
}

function generateMarketplaceFeed() {
  return `${JSON.stringify({
    schemaVersion: '1.0', name: 'RE IMAGE Hartford Local Business Directory', url: `${siteUrl}/marketplace.html`, focusArea: 'Hartford and Greater Hartford, Connecticut', informationLastVerified: data.verifiedAt,
    editorialPolicy: `${siteUrl}${editorialPath}`, featuredGuide: `${siteUrl}${guidePath}`,
    categories: data.categories.map(({ slug, name, description }) => ({ slug, name, description, url: `${siteUrl}${categoryUrl(slug)}` })),
    businesses: data.businesses.map((business) => ({
      name: business.name, profile: `${siteUrl}${profileUrl(business.slug)}`, officialWebsite: business.website, category: business.categories.map(categoryName),
      location: business.address ? addressText(business) : business.serviceArea, specialties: business.specialties, description: business.shortBio, primaryAction: { label: business.ctaLabel, url: business.ctaUrl }, informationLastVerified: data.verifiedAt
    }))
  }, null, 2)}\n`;
}

function generateLlmsSummary() {
  return `# RE IMAGE Business Solutions\n\n> Hartford-based business systems company and publisher of a verified Hartford local business directory.\n\n## Primary URLs\n\n- [Homepage](${siteUrl}/): Custom websites, customer portals, payment systems, automation, and connected business operating systems.\n- [Hartford Local Business Directory](${siteUrl}/marketplace.html): Search verified Hartford-area businesses by service, specialty, and town.\n- [New Britain Avenue Hartford Business Guide](${siteUrl}${guidePath}): Block-by-block guide to food, fresh drinks, and African hair braiding.\n- [Directory methodology](${siteUrl}${editorialPath}): Verification, corrections, ranking, and placement-label policy.\n- [Complete machine-readable directory](${siteUrl}/llms-full.txt): Full verified listing summaries and direct links.\n- [Marketplace JSON feed](${siteUrl}/marketplace-feed.json): Structured public listing data.\n- [XML sitemap](${siteUrl}/sitemap.xml): Canonical public URLs and image discovery.\n\n## Hartford directory categories\n\n${data.categories.map((category) => `- [${category.name}](${siteUrl}${categoryUrl(category.slug)}): ${category.description}`).join('\n')}\n\n## Key facts\n\n- Geographic focus: Hartford and Greater Hartford, Connecticut.\n- Listings use official business links and verified storefront addresses or truthful service areas.\n- Profiles include specialties, direct actions, factual FAQs, and the information verification date.\n- Businesses outside Greater Hartford are separated from Hartford-area listings.\n- No fabricated ratings, copied reviews, or unsupported ranking claims are published.\n\n## Contact\n\n- Email: reimagebs@gmail.com\n- Phone: +1-860-718-5928\n- Project inquiry: ${siteUrl}/start-with-us.html\n`;
}

function generateLlmsFull() {
  const listings = data.businesses.map((business) => `## ${business.name}\n\n- RE IMAGE profile: ${siteUrl}${profileUrl(business.slug)}\n- Official website: ${business.website}\n- Category: ${business.categories.map(categoryName).join(', ')}\n- Location or service area: ${business.address ? addressText(business) : business.serviceArea}\n- Specialties: ${business.specialties.join(', ')}\n- Summary: ${business.shortBio}\n- Primary action: ${business.ctaLabel} — ${business.ctaUrl}\n- Information last verified: ${data.verifiedAt}`).join('\n\n');
  return `# RE IMAGE Hartford Local Business Directory — Full Listing Reference\n\n> Public facts for citation and discovery. Prefer each RE IMAGE profile for complete visible context and the official business link for transactions.\n\nDirectory: ${siteUrl}/marketplace.html\nEditorial policy: ${siteUrl}${editorialPath}\nInformation last verified: ${data.verifiedAt}\n\n${listings}\n`;
}

function write(relativePath, contents) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, contents.replace(/[ \t]+$/gm, ''));
}

function generateSitemap() {
  const urls = [
    { loc: `${siteUrl}/`, priority: '1.0', image: `${siteUrl}/assets/reimage-logo-2026-transparent.png` },
    { loc: `${siteUrl}/marketplace.html`, priority: '1.0', image: `${siteUrl}/assets/reimage-logo-2026-transparent.png` },
    { loc: `${siteUrl}${guidePath}`, priority: '0.9', image: absoluteAsset(logoAssets['fusion-health-juice-bar']) },
    { loc: `${siteUrl}${editorialPath}`, priority: '0.6', image: `${siteUrl}/assets/reimage-logo-2026-transparent.png` },
    ...data.categories.map((category) => ({ loc: `${siteUrl}${categoryUrl(category.slug)}`, priority: '0.8', image: absoluteAsset(logoAssets[category.featured] || businessMap.get(category.featured).image) })),
    ...data.businesses.map((business) => ({ loc: `${siteUrl}${profileUrl(business.slug)}`, priority: '0.8', image: absoluteAsset(logoAssets[business.slug] || business.image) })),
    ...['website-development.html', 'products.html', 'our-work.html', 'careers.html', 'start-with-us.html', 'ai-receptionists.html', 'ai-automation.html', 'business-funding.html', 'growth-foundation.html', 'full-scale-system.html', 'social-media-management.html', 'map.html'].map((page) => ({ loc: `${siteUrl}/${page}`, priority: '0.6', image: `${siteUrl}/assets/reimage-logo-2026-transparent.png` }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urls.map(({ loc, priority, image }) => `  <url><loc>${escapeHtml(loc)}</loc><lastmod>${data.verifiedAt}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority>${image ? `<image:image><image:loc>${escapeHtml(image)}</image:loc></image:image>` : ''}</url>`).join('\n')}\n</urlset>\n`;
}

validateData();
write('marketplace.html', generateHub());
data.categories.forEach((category) => write(`marketplace/categories/${category.slug}/index.html`, generateCategory(category)));
data.businesses.forEach((business) => write(`marketplace/businesses/${business.slug}/index.html`, generateProfile(business)));
write('marketplace/guides/new-britain-avenue-hartford/index.html', generateCorridorGuide());
write('marketplace/about/index.html', generateEditorialPage());
write('marketplace-feed.json', generateMarketplaceFeed());
write('llms.txt', generateLlmsSummary());
write('llms-full.txt', generateLlmsFull());
write('sitemap.xml', generateSitemap());
write('robots.txt', `User-agent: OAI-SearchBot\nAllow: /\nDisallow: /reimage-admin-portal/\nDisallow: /reimage-login-portal/\nDisallow: /reimage-salesman-portal/\n\nUser-agent: ChatGPT-User\nAllow: /\nDisallow: /reimage-admin-portal/\nDisallow: /reimage-login-portal/\nDisallow: /reimage-salesman-portal/\n\nUser-agent: *\nAllow: /\nDisallow: /reimage-admin-portal/\nDisallow: /reimage-login-portal/\nDisallow: /reimage-salesman-portal/\n\nSitemap: ${siteUrl}/sitemap.xml\n`);

console.log(`Generated marketplace hub, ${data.categories.length} category pages, ${data.businesses.length} business profiles, two trust/guide pages, AI feeds, sitemap.xml, and robots.txt.`);
