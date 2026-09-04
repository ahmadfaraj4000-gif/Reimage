(() => {
  const navigation = document.querySelector('.navbar');
  if (navigation) {
    navigation.classList.remove('scrolled');
    navigation.querySelectorAll('.active').forEach((item) => {
      item.classList.remove('active');
      item.removeAttribute('aria-current');
    });
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

    const closeMenu = () => {
      navLinks.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
    };

    const toggleMenu = () => {
      const isOpen = navLinks.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(isOpen));
      menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
    };

    menuButton.setAttribute('aria-expanded', String(navLinks.classList.contains('open')));
    menuButton.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      toggleMenu();
    });

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

  let footer = document.querySelector('footer');
  if (!footer) {
    footer = document.createElement('footer');
    document.body.appendChild(footer);
  }

  footer.className = 'minimal-footer public-site-footer';
  footer.innerHTML = `
    <a class="new-brand" href="index.html#home" aria-label="RE IMAGE homepage">
      <img src="assets/reimage-logo-2026-transparent.png" alt="RE IMAGE">
    </a>
    <p>Custom business operating systems, built around you.</p>
    <div>
      <a href="website-development.html">Systems</a>
      <a href="products.html">Products</a>
      <a href="marketplace.html">Discover</a>
      <a href="our-work.html">Portfolio</a>
      <a href="start-with-us.html">Contact</a>
      <a href="https://login.reimagebs.com">Client Login</a>
    </div>
    <small>© <span data-public-year></span> RE IMAGE Business Solutions. All rights reserved.</small>
  `;

  const year = footer.querySelector('[data-public-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
