/**
 * Portal title separators.
 * Each role item is followed by a separator span. A separator is shown only when
 * the items on either side of it sit on the same line — so dots appear only
 * BETWEEN titles, never trailing a line end or leading a line start.
 * Uses visibility (not display) so toggling never changes layout (no wrap feedback loop).
 */
(function () {
  function placeSeparators() {
    const seps = document.querySelectorAll('.card__role .role-sep');
    seps.forEach(function (sep) {
      const prev = sep.previousElementSibling;
      const next = sep.nextElementSibling;
      if (prev && next && prev.offsetTop === next.offsetTop) {
        sep.classList.remove('is-hidden');
      } else {
        sep.classList.add('is-hidden');
      }
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(placeSeparators);
  }
  window.addEventListener('load', placeSeparators);
  window.addEventListener('resize', placeSeparators);
})();
