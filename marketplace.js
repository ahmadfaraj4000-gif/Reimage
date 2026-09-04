(() => {
  document.querySelectorAll('.business-card img, .profile-hero__media img').forEach((image) => {
    image.addEventListener('error', () => {
      if (image.dataset.fallbackApplied) return;
      image.dataset.fallbackApplied = 'true';
      image.src = '/assets/reimage-logo-2026-transparent.png';
      image.style.objectFit = 'contain';
      image.style.padding = '14%';
    });
  });

  const metricsEndpoint = document.querySelector('meta[name="marketplace-events-endpoint"]')?.content;
  const sendMetric = (business, category, event) => {
    if (!metricsEndpoint || !business) return;
    fetch(metricsEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ business, category, event }),
      keepalive: true
    }).catch(() => {});
  };

  const profile = document.querySelector('[data-profile-business]');
  if (profile) sendMetric(profile.dataset.profileBusiness, profile.dataset.profileCategory, 'profile_view');

  document.querySelectorAll('a.button[href^="http"]').forEach((link) => {
    link.addEventListener('click', () => {
      const card = link.closest('[data-business-card]');
      sendMetric(card?.dataset.slug || profile?.dataset.profileBusiness, card?.dataset.primaryCategory || profile?.dataset.profileCategory, 'outbound_click');
    });
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const card = entry.target;
        const key = `marketplace-feature:${card.dataset.primaryCategory}:${card.dataset.slug}`;
        try {
          if (!sessionStorage.getItem(key)) {
            sendMetric(card.dataset.slug, card.dataset.primaryCategory, 'featured_impression');
            sessionStorage.setItem(key, '1');
          }
        } catch {
          sendMetric(card.dataset.slug, card.dataset.primaryCategory, 'featured_impression');
        }
        observer.unobserve(card);
      });
    }, { threshold: .5 });
    document.querySelectorAll('.business-card--featured').forEach((card) => observer.observe(card));
  }

  const searchInput = document.getElementById('marketSearch');
  const searchForm = document.getElementById('marketSearchForm');
  const categoryFilters = document.getElementById('categoryFilters');
  const locationFilter = document.getElementById('locationFilter');
  const businessGrid = document.getElementById('businessGrid');
  const beyondGrid = document.getElementById('beyondGrid');
  const featuredRail = document.getElementById('featuredRail');
  const resultsCount = document.getElementById('resultsCount');
  const emptyState = document.getElementById('emptyState');
  const activeFilters = document.getElementById('activeFilters');
  const beyondSection = document.getElementById('beyond');

  if (!searchInput || !categoryFilters || !locationFilter || !businessGrid) return;

  const normalize = (value) => String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

  const params = new URLSearchParams(window.location.search);
  const validCategory = [...categoryFilters.querySelectorAll('[data-category]')].some((button) => button.dataset.category === params.get('category'));
  const validLocation = [...locationFilter.options].some((option) => option.value === params.get('location'));
  const state = {
    query: params.get('q') || '',
    category: validCategory ? params.get('category') : 'all',
    location: validLocation ? params.get('location') : 'all'
  };

  searchInput.value = state.query;
  locationFilter.value = state.location;

  function cardMatches(card) {
    const terms = normalize(state.query).split(/\s+/).filter(Boolean);
    const haystack = normalize(card.dataset.search);
    const categoryMatch = state.category === 'all' || card.dataset.categories.split(' ').includes(state.category);
    const locations = card.dataset.location.split(' ');
    const locationMatch = state.location === 'all' || locations.includes(state.location);
    const searchMatch = !terms.length || terms.every((term) => haystack.includes(term));
    return categoryMatch && locationMatch && searchMatch;
  }

  function syncUrl() {
    const next = new URLSearchParams();
    if (state.query) next.set('q', state.query);
    if (state.category !== 'all') next.set('category', state.category);
    if (state.location !== 'all') next.set('location', state.location);
    const query = next.toString();
    window.history.replaceState({}, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  }

  function renderFilters() {
    categoryFilters.querySelectorAll('[data-category]').forEach((button) => {
      const active = button.dataset.category === state.category;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const organicCards = [...businessGrid.querySelectorAll('[data-business-card]'), ...(beyondGrid ? [...beyondGrid.querySelectorAll('[data-business-card]')] : [])];
    let visible = 0;
    let visibleBeyond = 0;
    organicCards.forEach((card) => {
      const matches = cardMatches(card);
      card.hidden = !matches;
      if (matches) {
        visible += 1;
        if (card.closest('#beyondGrid')) visibleBeyond += 1;
      }
    });

    if (featuredRail) {
      featuredRail.querySelectorAll('[data-business-card]').forEach((card) => {
        const categoryMatch = state.category === 'all' || card.dataset.categories.split(' ').includes(state.category);
        const locationMatch = state.location === 'all' || card.dataset.location.split(' ').includes(state.location);
        card.hidden = !(categoryMatch && locationMatch);
      });
    }

    if (beyondSection) beyondSection.hidden = visibleBeyond === 0;
    if (resultsCount) resultsCount.textContent = `${visible} ${visible === 1 ? 'business' : 'businesses'}`;
    if (emptyState) emptyState.hidden = visible !== 0;
    if (businessGrid) businessGrid.hidden = visible === 0 || !businessGrid.querySelector('[data-business-card]:not([hidden])');

    const labels = [];
    if (state.query) labels.push(`Search: “${state.query}”`);
    if (state.category !== 'all') labels.push(categoryFilters.querySelector(`[data-category="${state.category}"]`)?.textContent.trim());
    if (state.location !== 'all') labels.push(locationFilter.selectedOptions[0]?.textContent.trim());
    if (activeFilters) {
      activeFilters.hidden = labels.length === 0;
      activeFilters.innerHTML = labels.length ? `<span>Showing ${labels.join(' · ')}</span><button type="button" data-clear-all>Clear all</button>` : '';
      activeFilters.querySelector('[data-clear-all]')?.addEventListener('click', clearAll);
    }

    syncUrl();
  }

  function clearAll() {
    state.query = '';
    state.category = 'all';
    state.location = 'all';
    searchInput.value = '';
    locationFilter.value = 'all';
    renderFilters();
    searchInput.focus();
  }

  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.query = searchInput.value.trim();
    renderFilters();
    document.querySelector('.directory-section')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
  });

  searchInput.addEventListener('input', () => {
    state.query = searchInput.value.trim();
    renderFilters();
  });

  categoryFilters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-category]');
    if (!button) return;
    state.category = button.dataset.category;
    renderFilters();
  });

  locationFilter.addEventListener('change', () => {
    state.location = locationFilter.value;
    renderFilters();
  });

  document.querySelectorAll('[data-quick-search]').forEach((button) => {
    button.addEventListener('click', () => {
      state.query = button.dataset.quickSearch;
      searchInput.value = state.query;
      renderFilters();
      document.querySelector('.directory-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  document.getElementById('clearFilters')?.addEventListener('click', clearAll);
  renderFilters();
})();
