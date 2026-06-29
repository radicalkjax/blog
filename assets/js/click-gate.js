/**
 * Generic click gate. Any element with a data-click-gate="N" attribute must be
 * clicked N times before its default action (e.g. following its href) fires;
 * the first N-1 clicks are swallowed. Used by the portal pi link and the
 * floating site logo.
 */
(function () {
  document.querySelectorAll('[data-click-gate]').forEach(function (el) {
    const needed = parseInt(el.getAttribute('data-click-gate'), 10) || 1;
    let clicks = 0;
    el.addEventListener('click', function (e) {
      clicks += 1;
      if (clicks < needed) e.preventDefault();
    });
  });
})();
