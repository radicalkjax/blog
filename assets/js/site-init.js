/**
 * Site-wide initialization: FOUC reveal, navigation dropdowns, and
 * service worker registration. Loaded on every page via the default layout.
 */
(function () {
  // Reveal navigation and social icons once styles are loaded
  window.addEventListener('load', function () {
    document.querySelectorAll('.social-icons, nav').forEach(function (el) {
      el.style.opacity = '1';
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
          if (menu) menu.style.display = 'flex';
        }
      });

      dropdown.addEventListener('mouseleave', function () {
        if (window.innerWidth > 768) {
          const menu = this.querySelector('.dropdown-menu');
          if (menu) menu.style.display = 'none';
        }
      });

      const toggle = dropdown.querySelector('.dropdown-toggle');
      if (toggle) {
        toggle.addEventListener('click', function (e) {
          if (window.innerWidth <= 768) {
            e.preventDefault();
            e.stopPropagation();

            const menu = this.nextElementSibling;
            if (menu.style.display === 'flex') {
              menu.style.display = 'none';
            } else {
              document.querySelectorAll('.dropdown-menu').forEach(function (m) {
                if (m !== menu) m.style.display = 'none';
              });
              menu.style.display = 'flex';
            }
          }
        });
      }
    });

    // Close dropdowns when clicking outside (mobile)
    document.addEventListener('click', function (e) {
      if (window.innerWidth <= 768 && !e.target.closest('.dropdown')) {
        document.querySelectorAll('.dropdown-menu').forEach(function (menu) {
          menu.style.display = 'none';
        });
      }
    });
  }

  // Register service worker for offline support (PWA)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/service-worker.js');
    });
  }
})();
