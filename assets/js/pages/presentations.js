document.addEventListener('DOMContentLoaded', () => {
  const fullscreenButton = document.querySelector('[data-presentation-fullscreen]');
  const frame = document.querySelector('.presentation-frame');
  if (!fullscreenButton || !frame) return;
  if (!frame.requestFullscreen && !frame.webkitRequestFullscreen) {
    fullscreenButton.hidden = true;
    return;
  }
  fullscreenButton.addEventListener('click', async () => {
    try {
      if (frame.requestFullscreen) await frame.requestFullscreen();
      else frame.webkitRequestFullscreen();
      frame.focus();
    } catch (error) {
      const status = document.querySelector('[data-presentation-status]');
      if (status) status.textContent = 'Fullscreen is unavailable. Use Open slides to view the presentation.';
    }
  });
});
