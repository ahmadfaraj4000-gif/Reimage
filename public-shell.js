(() => {
  const initializePublicShell = () => {
  const menuIcon = '<svg aria-hidden="true" fill="none" height="24" viewBox="0 0 24 24" width="24"><rect fill="currentColor" height="2" rx="1" width="24" y="4"></rect><rect fill="currentColor" height="2" rx="1" width="24" y="11"></rect><rect fill="currentColor" height="2" rx="1" width="24" y="18"></rect></svg>';
  const navigation = document.querySelector('.navbar');
  if (navigation) {
    navigation.classList.remove('scrolled');
  }

  const currentMenuButton = document.getElementById('menuBtn');
  const navLinks = document.getElementById('navLinks');

  if (navLinks && !navLinks.querySelector('a[href$="marketplace.html"]')) {
    const marketplaceItem = document.createElement('li');
    marketplaceItem.innerHTML = '<a href="marketplace.html">Discover</a>';
    const portfolioLink = navLinks.querySelector('a[href$="our-work.html"]');
    navLinks.insertBefore(marketplaceItem, portfolioLink?.closest('li') || navLinks.lastElementChild);
  }

  if (currentMenuButton && navLinks) {
    // Replace the button so older page-specific click handlers cannot toggle the
    // menu a second time. The public shell is the single mobile-nav controller.
    const menuButton = currentMenuButton.cloneNode(true);
    currentMenuButton.replaceWith(menuButton);
    menuButton.type = 'button';
    menuButton.innerHTML = menuIcon;
    menuButton.setAttribute('aria-controls', navLinks.id || 'navLinks');

    const closeMenu = () => {
      navLinks.classList.remove('open');
      document.body.classList.remove('public-menu-open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    };

    const toggleMenu = () => {
      const isOpen = navLinks.classList.toggle('open');
      document.body.classList.toggle('public-menu-open', isOpen);
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    };

    menuButton.setAttribute('aria-expanded', String(navLinks.classList.contains('open')));
    menuButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      event.stopPropagation();
      toggleMenu();
    }, { capture: true });

    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

    document.addEventListener('click', (event) => {
      if (!navigation.contains(event.target)) closeMenu();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navLinks.classList.contains('open')) {
        closeMenu();
        menuButton.focus();
      }
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 980) closeMenu();
    });
  }

  if (navigation) {
    const currentPath = window.location.pathname.replace(/\/index\.html$/, '/');
    navigation.querySelectorAll('.nav-links a').forEach((link) => {
      const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/index\.html$/, '/');
      const isCurrent = linkPath === currentPath || (currentPath === '/' && linkPath === '/');
      link.classList.toggle('active', isCurrent);
      if (isCurrent) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  let footer = document.querySelector('footer');
  if (!footer) {
    footer = document.createElement('footer');
    document.body.appendChild(footer);
  }

  footer.className = 'minimal-footer public-site-footer';
  footer.innerHTML = `
    <a class="new-brand" href="/index.html#home" aria-label="RE IMAGE homepage">
      <img src="/assets/reimage-logo-2026-transparent.png" alt="RE IMAGE">
    </a>
    <p>Custom business operating systems, built around you.</p>
    <div>
      <a href="/website-development.html">Systems</a>
      <a href="/products.html">Products</a>
      <a href="/marketplace.html">Discover</a>
      <a href="/our-work.html">Portfolio</a>
      <a href="/start-with-us.html">Contact</a>
      <a href="https://login.reimagebs.com">Client Login</a>
    </div>
    <small>© <span data-public-year></span> RE IMAGE Business Solutions. All rights reserved.</small>
  `;

  const year = footer.querySelector('[data-public-year]');
  if (year) year.textContent = new Date().getFullYear();
  };

  // Some older pages attach their own menu handlers during DOMContentLoaded or
  // from deferred scripts. Initialize last, then replace the button once so
  // those handlers cannot double-toggle the shared menu.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePublicShell, { once: true });
  } else {
    initializePublicShell();
  }
})();
