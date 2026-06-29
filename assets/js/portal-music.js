/**
 * Portal music toggle — plays/pauses the SomaFM Groove Salad stream
 * from the play button in the card's upper-left corner.
 */
(function () {
  const btn = document.querySelector('.portal-play');
  const audio = document.querySelector('.portal-audio');
  if (!btn || !audio) return;

  const PLAY = '▶';        // ▶
  const PAUSE = '❚❚'; // ❚❚

  btn.addEventListener('click', function () {
    if (audio.paused) {
      audio.play().then(function () {
        btn.textContent = PAUSE;
        btn.setAttribute('aria-pressed', 'true');
        btn.setAttribute('aria-label', 'Pause SomaFM Groove Salad');
      }).catch(function () {
        // Autoplay/stream blocked — leave button in the play state.
      });
    } else {
      audio.pause();
      btn.textContent = PLAY;
      btn.setAttribute('aria-pressed', 'false');
      btn.setAttribute('aria-label', 'Play SomaFM Groove Salad');
    }
  });
})();
