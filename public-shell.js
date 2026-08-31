(() => {
  const navigation = document.querySelector('.navbar');
  if (navigation) {
    navigation.classList.remove('scrolled');
    navigation.querySelectorAll('.active').forEach((item) => {
      item.classList.remove('active');
      item.removeAttribute('aria-current');
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
      <a href="our-work.html">Portfolio</a>
      <a href="start-with-us.html">Contact</a>
      <a href="https://login.reimagebs.com">Client Login</a>
    </div>
    <small>© <span data-public-year></span> RE IMAGE Business Solutions. All rights reserved.</small>
  `;

  const year = footer.querySelector('[data-public-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
