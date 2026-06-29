// Offline page reload button behavior
document.addEventListener('DOMContentLoaded', function () {
  var reloadBtn = document.getElementById('offline-reload');
  if (reloadBtn) {
    reloadBtn.addEventListener('click', function () {
      window.location.reload();
    });
  }
});
