document.addEventListener('DOMContentLoaded', function() {
    const iframe = document.querySelector('.presentation-frame');

    // Add event listener to handle fullscreen mode
    document.addEventListener('keydown', function(e) {
        if (e.key === 'f' && iframe.contains(document.activeElement)) {
            if (iframe.requestFullscreen) {
                iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) {
                iframe.webkitRequestFullscreen();
            }
        }
    });
});
