// SomaFM Player JavaScript
(function () {
  function initSomaFmPlayer() {
    const player = document.getElementById('somafm-player');
    if (!player) return;

    const audio = document.getElementById('defcon-audio');
    const playBtn = document.querySelector('.play-icon');
    const pauseBtn = document.querySelector('.pause-icon');
    const volumeIcon = document.querySelector('.volume-icon');
    const muteIcon = document.querySelector('.mute-icon');
    const volumeSlider = document.querySelector('.volume-slider');
    const playerBody = document.querySelector('.player-body');
    const playerHeader = document.querySelector('.player-header');
    const playerMinimized = document.querySelector('.player-minimized');

    // Initialize volume at 25% to avoid blowing out speakers
    audio.volume = 0.25;

    function minimize() {
      playerBody.classList.add('is-hidden');
      playerHeader.classList.add('is-hidden');
      playerMinimized.classList.remove('is-hidden');
    }

    function expand() {
      playerBody.classList.remove('is-hidden');
      playerHeader.classList.remove('is-hidden');
      playerMinimized.classList.add('is-hidden');
    }

    // Start minimized on mobile devices
    if (window.innerWidth <= 768) {
      minimize();
    }

    function togglePlayPause() {
      if (audio.paused) {
        audio.play().then(() => {
          playBtn.classList.add('is-hidden');
          pauseBtn.classList.remove('is-hidden');
          updateNowPlaying();
          // Update song info every 30 seconds while playing
          songUpdateInterval = setInterval(updateNowPlaying, 30000);
        }).catch(error => {
          console.error('Error playing audio:', error);
        });
      } else {
        audio.pause();
        playBtn.classList.remove('is-hidden');
        pauseBtn.classList.add('is-hidden');
        // Clear the update interval when paused
        if (songUpdateInterval) {
          clearInterval(songUpdateInterval);
          songUpdateInterval = null;
        }
        document.querySelector('.np-text').textContent = 'Click play to start streaming';
      }
    }

    function toggleMute() {
      if (audio.muted) {
        audio.muted = false;
        volumeIcon.classList.remove('is-hidden');
        muteIcon.classList.add('is-hidden');
        volumeSlider.value = audio.volume * 100;
      } else {
        audio.muted = true;
        volumeIcon.classList.add('is-hidden');
        muteIcon.classList.remove('is-hidden');
      }
    }

    function changeVolume(value) {
      audio.volume = value / 100;
      if (value == 0) {
        volumeIcon.classList.add('is-hidden');
        muteIcon.classList.remove('is-hidden');
      } else {
        volumeIcon.classList.remove('is-hidden');
        muteIcon.classList.add('is-hidden');
        audio.muted = false;
      }
    }

    function togglePlayer() {
      if (playerBody.classList.contains('is-hidden')) {
        expand();
      } else {
        minimize();
      }
    }

    // Fetch and update currently playing song
    function updateNowPlaying() {
      const npText = document.querySelector('.np-text');

      // Try the CORS-friendly API endpoint first
      fetch('https://api.somafm.com/songs/defcon.json')
        .then(response => {
          if (!response.ok) {
            throw new Error('API endpoint not available');
          }
          return response.json();
        })
        .then(data => {
          if (data.songs && data.songs.length > 0) {
            const currentSong = data.songs[0]; // Most recent song
            npText.textContent = `${currentSong.artist} - ${currentSong.title}`;
          } else {
            npText.textContent = 'Streaming DEF CON Radio';
          }
        })
        .catch(error => {
          // Fallback to the regular endpoint (may be blocked by CORS)
          fetch('https://somafm.com/songs/defcon.json')
            .then(response => response.json())
            .then(data => {
              if (data.songs && data.songs.length > 0) {
                const currentSong = data.songs[0];
                npText.textContent = `${currentSong.artist} - ${currentSong.title}`;
              } else {
                npText.textContent = 'Streaming DEF CON Radio';
              }
            })
            .catch(fallbackError => {
              console.error('Error fetching song data:', fallbackError);
              npText.textContent = 'Streaming DEF CON Radio';
            });
        });
    }

    // Update song info every 30 seconds
    let songUpdateInterval;

    // Bind control event handlers
    const closeBtn = document.querySelector('.player-close');
    if (closeBtn) closeBtn.addEventListener('click', togglePlayer);

    const playPauseBtn = document.querySelector('.play-pause-btn');
    if (playPauseBtn) playPauseBtn.addEventListener('click', togglePlayPause);

    const muteBtn = document.querySelector('.mute-btn');
    if (muteBtn) muteBtn.addEventListener('click', toggleMute);

    if (volumeSlider) {
      volumeSlider.addEventListener('change', function () {
        changeVolume(this.value);
      });
    }

    const expandBtn = playerMinimized ? playerMinimized.querySelector('button') : null;
    if (expandBtn) expandBtn.addEventListener('click', togglePlayer);

    // Handle audio errors by trying next source
    audio.addEventListener('error', function() {
      const sources = audio.querySelectorAll('source');
      const currentSrc = audio.currentSrc;

      sources.forEach((source, index) => {
        if (source.src === currentSrc && index < sources.length - 1) {
          audio.src = sources[index + 1].src;
          audio.load();
          if (!audio.paused) {
            audio.play();
          }
        }
      });
    });

    // Collision detection to move player to bottom when overlapping with content
    let wasAtBottom = false;

    function checkCollision() {
      const mainContent = document.querySelector('.content-wrapper') || document.querySelector('.post-content') || document.querySelector('article') || document.querySelector('main');

      if (!player || !mainContent) return;

      // Measure in the default (sidebar) position
      player.classList.remove('somafm-player--bottom');

      const playerRect = player.getBoundingClientRect();
      const contentRect = mainContent.getBoundingClientRect();

      // Check if player overlaps with main content
      const isOverlapping = !(
        playerRect.right < contentRect.left ||
        playerRect.left > contentRect.right ||
        playerRect.bottom < contentRect.top ||
        playerRect.top > contentRect.bottom
      );

      if (isOverlapping || window.innerWidth <= 768) {
        // Move player to the bottom and minimize it
        player.classList.add('somafm-player--bottom');
        if (!wasAtBottom) {
          minimize();
          wasAtBottom = true;
        }
      } else {
        // Keep in sidebar position when no collision
        wasAtBottom = false;
      }
    }

    // Check collision on load, resize, and scroll
    window.addEventListener('load', checkCollision);
    window.addEventListener('resize', checkCollision);
    window.addEventListener('scroll', checkCollision);

    // Also check when content changes (for dynamic content)
    const observer = new MutationObserver(checkCollision);
    const observerConfig = { childList: true, subtree: true };
    const targetNode = document.body;
    observer.observe(targetNode, observerConfig);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSomaFmPlayer);
  } else {
    initSomaFmPlayer();
  }
})();
