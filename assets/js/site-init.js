/**
 * Site-wide initialization: FOUC reveal, navigation dropdowns, and
 * service worker registration. Loaded on every page via the default layout.
 */
(function () {
  // Reveal navigation and social icons once styles are loaded
  window.addEventListener('load', function () {
    document.querySelectorAll('.social-icons, nav').forEach(function (el) {
      el.classList.add('is-revealed');
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    initDropdowns();
  });

  function initDropdowns() {
    document.querySelectorAll('.dropdown').forEach(function (dropdown) {
      dropdown.addEventListener('mouseenter', function () {
        if (window.innerWidth > 768) {
          const menu = this.querySelector('.dropdown-menu');
          if (menu) menu.classList.add('is-open');
        }
      });

      dropdown.addEventListener('mouseleave', function () {
        if (window.innerWidth > 768) {
          const menu = this.querySelector('.dropdown-menu');
          if (menu) menu.classList.remove('is-open');
        }
      });

      const toggle = dropdown.querySelector('.dropdown-toggle');
      if (toggle) {
        toggle.addEventListener('click', function (e) {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();

            const menu = this.nextElementSibling;
            if (menu.classList.contains('is-open')) {
              menu.classList.remove('is-open');
            } else {
              document.querySelectorAll('.dropdown-menu').forEach(function (m) {
                if (m !== menu) m.classList.remove('is-open');
              });
              menu.classList.add('is-open');
            }
          }
        });
      }
    });

    // Close dropdowns when clicking outside (mobile)
    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 768 && !e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(function (menu) {
          menu.classList.remove('is-open');
        });
      }
    });
  }

  // Floating logo requires three clicks to return to the portal
  const logoLink = document.querySelector('.site-logo-link');
  if (logoLink) {
    let logoClicks = 0;
    logoLink.addEventListener('click', function (e) {
      logoClicks += 1;
      if (logoClicks < 3) e.preventDefault();
    });
  }

  // Register service worker for offline support (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/service-worker.js');
    });
  }
})();
