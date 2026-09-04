import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataPath = process.env.MARKETPLACE_DATA_PATH || path.join(root, 'marketplace-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const siteUrl = 'https://reimagebs.com';
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

const logoSources = {
  'fusion-health-juice-bar': { src: 'assets/fusion-health-home.png', width: 1672, height: 941, viewBox: '350 8 110 66' },
  '881-grab-and-go': { src: 'assets/881-grab-go-home-2026.png', width: 1920, height: 989, viewBox: '375 9 188 58' },
  'the-patio': { src: 'assets/patio-home-2026.jpg', width: 1672, height: 941, viewBox: '110 7 130 73' },
  'lunch-box': { src: 'assets/lunch-box-home-2026.png', width: 1920, height: 989, viewBox: '100 5 92 66' },
  'car-craft-auto-body-towing': { src: 'assets/carcraft-home-new.png', width: 1672, height: 941, viewBox: '202 10 104 58' },
  'rent-me-ct': { src: 'assets/rentme-home-2026.png', width: 1920, height: 989, viewBox: '388 40 150 55' },
  'cr8-autos': { src: 'assets/cr8-book-appointment-2026.png', width: 1920, height: 989, viewBox: '45 9 150 75' },
  'empire-elite-rides': { src: 'assets/empire-elite-pricing-2026.png', width: 1920, height: 989, viewBox: '88 23 225 58' },
  'techniq-skin-beauty': { src: 'assets/techniq-home.png', width: 1920, height: 989, viewBox: '398 14 310 65' },
  'living-word-imprints': { src: 'assets/living-word-status-page.png', width: 2938, height: 1667, viewBox: '1205 475 530 205' },
  'andaleeb-enterprises': { src: 'assets/andaleeb-home-2026.png', width: 1920, height: 989, viewBox: '58 20 245 51' },
  'the-anchor-collective': { src: 'assets/anchor-home.png', width: 1672, height: 941, viewBox: '308 11 305 48' },
  'faraj-software-solutions': { src: 'assets/faraj-home.png', width: 1920, height: 989, viewBox: '388 7 286 65' }
};

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
    <a class="nav-logo" href="/index.html" aria-label="RE IMAGE homepage"><img src="/assets/reimage-logo-2026-transparent.png" alt="RE IMAGE"></a>
    <button class="menu-btn" id="menuBtn" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>
    <ul class="nav-links" id="navLinks">
      <li><a href="/website-development.html">Systems</a></li>
      <li><a href="/products.html">Products</a></li>
      <li><a href="/marketplace.html"${active === 'marketplace' ? ' class="active" aria-current="page"' : ''}>Marketplace</a></li>
      <li><a href="/our-work.html">Portfolio</a></li>
      <li><a href="/careers.html">Careers</a></li>
      <li><a class="nav-cta" href="/start-with-us.html">Start With Us</a></li>
    </ul>
  </nav>`;
}

function footer() {
  return `<footer class="marketplace-footer">
    <div class="marketplace-footer__top">
      <div class="marketplace-footer__brand"><a href="/index.html" aria-label="RE IMAGE homepage"><img src="/assets/reimage-logo-2026-transparent.png" alt="RE IMAGE"></a><p>Helping people discover the businesses that keep Hartford moving.</p></div>
      <div><h2>Explore</h2><a href="/marketplace.html">All businesses</a>${data.categories.slice(0, 6).map((category) => `<a href="${categoryUrl(category.slug)}">${escapeHtml(category.shortName)}</a>`).join('')}</div>
      <div><h2>More services</h2>${data.categories.slice(6).map((category) => `<a href="${categoryUrl(category.slug)}">${escapeHtml(category.shortName)}</a>`).join('')}<a href="/our-work.html">RE IMAGE portfolio</a></div>
      <div><h2>For business owners</h2><a href="/start-with-us.html?service=Marketplace%20Listing">Get listed</a><a href="/start-with-us.html?service=Featured%20Marketplace%20Placement">Feature your business</a><a href="/start-with-us.html">Contact RE IMAGE</a></div>
    </div>
    <div class="marketplace-footer__bottom"><span>© ${new Date().getFullYear()} RE IMAGE Business Solutions.</span><span>Hartford, Connecticut</span></div>
  </footer>`;
}

function head({ title, description, canonical, image = `${siteUrl}/assets/reimage-logo-2026-transparent.png`, schema = [] }) {
  return `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="author" content="RE IMAGE Business Solutions">
  <meta name="theme-color" content="#0877e8">
  <meta name="marketplace-events-endpoint" content="https://uybcjtigyujoyrunecto.supabase.co/functions/v1/record-marketplace-event">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/assets/reimage-logo-2026-transparent.png">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Hartford Marketplace by RE IMAGE">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${image.startsWith('http') ? image : `${siteUrl}/${image.replace(/^\//, '')}`}">
  <meta property="og:image:alt" content="Hartford Marketplace by RE IMAGE">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/public-shell.css?v=20260904-4">
  <link rel="stylesheet" href="/marketplace.css?v=20260904-4">
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

function businessLogo(business) {
  const logo = logoSources[business.slug];
  const title = `${business.name} logo`;
  if (logo) {
    return `<svg class="business-logo" viewBox="${logo.viewBox}" role="img" aria-label="${escapeHtml(title)}" preserveAspectRatio="xMidYMid meet"><image href="/${logo.src}" width="${logo.width}" height="${logo.height}" decoding="async"></image></svg>`;
  }
  const initials = business.name.split(/\s+/).filter(Boolean).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
  return `<span class="business-wordmark" role="img" aria-label="${escapeHtml(title)}"><span aria-hidden="true">${escapeHtml(initials)}</span><strong>${escapeHtml(business.name)}</strong></span>`;
}

function card(business, options = {}) {
  const primary = categoryMap.get(business.categories[0]);
  const isBeyond = business.regionRank === 4;
  const featured = options.featured;
  const searchText = [business.name, business.locationLabel, business.shortBio, ...business.specialties, ...business.tags, ...business.categories.map(categoryName)].join(' ').toLowerCase();
  return `<article class="business-card${featured ? ' business-card--featured' : ''}" data-business-card data-slug="${business.slug}" data-primary-category="${business.categories[0]}" data-categories="${business.categories.join(' ')}" data-location="${(business.locations || [business.locationKey]).join(' ')}" data-rank="${business.regionRank}" data-search="${escapeHtml(searchText)}">
    <a class="business-card__media business-card__logo" href="${profileUrl(business.slug)}" aria-label="View ${escapeHtml(business.name)} profile">
      <span class="business-logo-stage">${businessLogo(business)}</span>
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

function shell({ title, description, canonical, image, schema, body, pageClass = '' }) {
  return `<!doctype html>
<html lang="en">
${head({ title, description, canonical, image, schema })}
<body class="marketplace-page ${pageClass}">
  <a class="skip-link" href="#main-content">Skip to marketplace content</a>
  ${navigation()}
  ${body}
  ${footer()}
  <script src="/marketplace.js?v=20260904-1" defer></script>
</body>
</html>\n`;
}

function hubSchema() {
  return [{
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Hartford Marketplace by RE IMAGE',
    url: `${siteUrl}/marketplace.html`,
    description: 'Discover restaurants, rental cars, auto body shops, skincare, hair braiding, printing, property rentals, and local services in Hartford and Greater Hartford.',
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: data.businesses.length,
      itemListElement: data.businesses.map((business, index) => ({ '@type': 'ListItem', position: index + 1, name: business.name, url: `${siteUrl}${profileUrl(business.slug)}` }))
    }
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
        <div class="section-heading"><div><p class="eyebrow">Featured around Hartford</p><h2 id="featuredTitle">Local standouts, one per category.</h2></div><p>Featured placement is clearly labeled. Organic listings stay independent.</p></div>
        <div class="featured-rail" id="featuredRail">${featured.map((business) => card(business, { featured: true })).join('')}</div>
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

  return shell({ title: 'Hartford Business Marketplace | Restaurants, Rentals, Auto Body, Beauty & More | RE IMAGE', description: 'Find Hartford restaurants, rental cars, auto body shops, skincare, African hair braiding, printing, property rentals, and local services with direct links.', canonical: `${siteUrl}/marketplace.html`, schema: hubSchema(), body, pageClass: 'marketplace-hub' });
}

function generateCategory(category) {
  const businesses = data.businesses.filter((business) => business.categories.includes(category.slug)).sort((a, b) => a.regionRank - b.regionRank || a.name.localeCompare(b.name));
  const featured = businessMap.get(category.featured);
  const categoryLocation = businesses.some((business) => business.regionRank < 4) ? 'in Hartford, CT' : 'beyond Greater Hartford';
  const schema = [{
    '@context': 'https://schema.org', '@type': 'CollectionPage', name: `${category.name} ${categoryLocation}`, url: `${siteUrl}${categoryUrl(category.slug)}`, description: category.description,
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Marketplace', item: `${siteUrl}/marketplace.html` }, { '@type': 'ListItem', position: 2, name: category.name, item: `${siteUrl}${categoryUrl(category.slug)}` }] },
    mainEntity: { '@type': 'ItemList', numberOfItems: businesses.length, itemListElement: businesses.map((business, index) => ({ '@type': 'ListItem', position: index + 1, name: business.name, url: `${siteUrl}${profileUrl(business.slug)}` })) }
  }];
  const body = `<main id="main-content">
    <section class="category-hero"><div class="market-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/marketplace.html">Marketplace</a><span>/</span><span aria-current="page">${escapeHtml(category.name)}</span></nav><p class="eyebrow">${businesses.some((business) => business.regionRank < 4) ? 'Hartford local guide' : 'Beyond Greater Hartford'}</p><h1>${escapeHtml(category.name)}<br><em>${escapeHtml(categoryLocation)}.</em></h1><p>${escapeHtml(category.description)}</p><a class="back-link" href="/marketplace.html">← Search all Hartford businesses</a></div></section>
    <section class="market-section category-feature"><div class="market-wrap"><div class="section-heading"><div><p class="eyebrow">Featured ${escapeHtml(category.shortName)}</p><h2>Start with a local standout.</h2></div><p>Featured placement is disclosed and does not change the directory’s organic ordering.</p></div><div class="featured-single">${card(featured, { featured: true })}</div></div></section>
    <section class="market-section"><div class="market-wrap"><div class="directory-heading"><div><p class="eyebrow">Browse the category</p><h2>${businesses.length} ${businesses.length === 1 ? 'business' : 'businesses'} to explore</h2></div><a class="text-link" href="/marketplace.html?category=${category.slug}">Open filtered marketplace →</a></div><div class="business-grid">${businesses.map((business) => card(business)).join('')}</div></div></section>
    <section class="category-copy"><div class="market-wrap category-copy__inner"><div><p class="eyebrow">Find the right fit</p><h2>Clear details. Direct local connections.</h2></div><p>Every profile includes specialties, verified location or service-area information, and a direct path to the business. RE IMAGE does not add fabricated ratings or hide paid placements inside organic results.</p></div></section>
  </main>`;
  return shell({ title: `${category.name} ${categoryLocation} | RE IMAGE Marketplace`, description: `${category.description} Browse verified local profiles, specialties, locations, and direct business links.`, canonical: `${siteUrl}${categoryUrl(category.slug)}`, image: featured.image, schema, body, pageClass: 'marketplace-category' });
}

function profileSchema(business) {
  const object = {
    '@context': 'https://schema.org', '@type': business.schemaType || 'LocalBusiness', name: business.name, url: business.website, image: business.image.startsWith('http') ? business.image : `${siteUrl}/${business.image}`, description: business.longBio, telephone: business.phone,
    areaServed: business.serviceArea,
    address: business.address ? { '@type': 'PostalAddress', streetAddress: business.address.street, addressLocality: business.address.city, addressRegion: business.address.state, postalCode: business.address.postalCode, addressCountry: 'US' } : undefined,
    sameAs: [business.website]
  };
  Object.keys(object).forEach((key) => object[key] === undefined && delete object[key]);
  return [object, {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Marketplace', item: `${siteUrl}/marketplace.html` },
      { '@type': 'ListItem', position: 2, name: categoryName(business.categories[0]), item: `${siteUrl}${categoryUrl(business.categories[0])}` },
      { '@type': 'ListItem', position: 3, name: business.name, item: `${siteUrl}${profileUrl(business.slug)}` }
    ]
  }, {
    '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: business.faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } }))
  }];
}

function generateProfile(business) {
  const primary = categoryMap.get(business.categories[0]);
  const related = data.businesses.filter((item) => item.slug !== business.slug && item.categories.some((slug) => business.categories.includes(slug))).sort((a, b) => a.regionRank - b.regionRank).slice(0, 3);
  const address = addressText(business);
  const body = `<main id="main-content" data-profile-business="${business.slug}" data-profile-category="${business.categories[0]}">
    <section class="profile-hero"><div class="market-wrap"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="/marketplace.html">Marketplace</a><span>/</span><a href="${categoryUrl(primary.slug)}">${escapeHtml(primary.shortName)}</a><span>/</span><span aria-current="page">${escapeHtml(business.name)}</span></nav><div class="profile-hero__grid"><div class="profile-hero__media profile-hero__logo"><span class="business-logo-stage">${businessLogo(business)}</span><span class="profile-location">${escapeHtml(business.locationLabel)}</span></div><div class="profile-hero__copy"><p class="eyebrow">${escapeHtml(primary.name)}</p><h1>${escapeHtml(business.name)}</h1><p class="profile-lead">${escapeHtml(business.longBio)}</p><ul class="specialty-list specialty-list--large">${business.specialties.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul><div class="profile-actions"><a class="button button--primary" href="${business.ctaUrl}" target="_blank" rel="noopener">${escapeHtml(business.ctaLabel)} ↗</a>${business.address ? `<a class="button button--outline" href="${directionsUrl(business)}" target="_blank" rel="noopener">Get directions</a>` : ''}</div></div></div></div></section>
    <section class="profile-details"><div class="market-wrap profile-details__grid"><div class="profile-story"><p class="eyebrow">What they do</p><h2>A closer look at ${escapeHtml(business.name)}.</h2><p>${escapeHtml(business.longBio)}</p><h3>Specialties and services</h3><div class="tag-cloud">${[...business.specialties, ...business.tags].map((item) => `<span>${escapeHtml(item)}</span>`).join('')}</div></div><aside class="profile-info"><p class="profile-info__label">Business information</p><dl><div><dt>${business.address ? 'Address' : 'Service area'}</dt><dd>${escapeHtml(address)}</dd></div>${business.secondaryAddress ? `<div><dt>Second location</dt><dd>${escapeHtml(business.secondaryAddress)}</dd></div>` : ''}${business.phone ? `<div><dt>Phone</dt><dd><a href="tel:${business.phone.replace(/[^\d+]/g, '')}">${escapeHtml(business.phone)}</a></dd></div>` : ''}<div><dt>Official website</dt><dd><a href="${business.website}" target="_blank" rel="noopener">Visit ${escapeHtml(business.name)} ↗</a></dd></div><div><dt>Information verified</dt><dd><time datetime="${data.verifiedAt}">${formatDate(data.verifiedAt)}</time></dd></div></dl>${business.secondaryCtaUrl ? `<a class="button button--outline button--full" href="${business.secondaryCtaUrl}" target="_blank" rel="noopener">${escapeHtml(business.secondaryCtaLabel)}</a>` : ''}</aside></div></section>
    <section class="profile-faq"><div class="market-wrap"><div class="section-heading"><div><p class="eyebrow">Quick answers</p><h2>Know before you go.</h2></div></div><div class="faq-grid">${business.faq.map(([question, answer]) => `<details><summary>${escapeHtml(question)}<span aria-hidden="true">+</span></summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></div></section>
    ${related.length ? `<section class="market-section related-section"><div class="market-wrap"><div class="directory-heading"><div><p class="eyebrow">Keep exploring</p><h2>More ${escapeHtml(primary.shortName)}</h2></div><a class="text-link" href="${categoryUrl(primary.slug)}">View category →</a></div><div class="business-grid">${related.map((item) => card(item)).join('')}</div></div></section>` : ''}
    <section class="profile-owner-note"><div class="market-wrap"><p>Own or manage this business? <a href="/start-with-us.html?service=Marketplace%20Listing">Request an information update</a>.</p></div></section>
  </main>`;
  return shell({ title: `${business.name} | ${business.specialties[0]} in ${business.locationLabel} | RE IMAGE`, description: `${business.shortBio} Find location details, specialties, and direct booking or ordering links.`, canonical: `${siteUrl}${profileUrl(business.slug)}`, image: business.image, schema: profileSchema(business), body, pageClass: 'marketplace-profile' });
}

function write(relativePath, contents) {
  const destination = path.join(root, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, contents.replace(/[ \t]+$/gm, ''));
}

function generateSitemap() {
  const urls = [
    { loc: `${siteUrl}/`, priority: '1.0' },
    { loc: `${siteUrl}/marketplace.html`, priority: '1.0' },
    ...data.categories.map((category) => ({ loc: `${siteUrl}${categoryUrl(category.slug)}`, priority: '0.8' })),
    ...data.businesses.map((business) => ({ loc: `${siteUrl}${profileUrl(business.slug)}`, priority: '0.8' })),
    ...['website-development.html', 'products.html', 'our-work.html', 'careers.html', 'start-with-us.html'].map((page) => ({ loc: `${siteUrl}/${page}`, priority: '0.6' }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(({ loc, priority }) => `  <url><loc>${escapeHtml(loc)}</loc><lastmod>${data.verifiedAt}</lastmod><changefreq>weekly</changefreq><priority>${priority}</priority></url>`).join('\n')}\n</urlset>\n`;
}

validateData();
write('marketplace.html', generateHub());
data.categories.forEach((category) => write(`marketplace/categories/${category.slug}/index.html`, generateCategory(category)));
data.businesses.forEach((business) => write(`marketplace/businesses/${business.slug}/index.html`, generateProfile(business)));
write('sitemap.xml', generateSitemap());
write('robots.txt', `User-agent: *\nAllow: /\nDisallow: /reimage-admin-portal/\nDisallow: /reimage-login-portal/\nDisallow: /reimage-salesman-portal/\nSitemap: ${siteUrl}/sitemap.xml\n`);

console.log(`Generated marketplace hub, ${data.categories.length} category pages, ${data.businesses.length} business profiles, sitemap.xml, and robots.txt.`);
