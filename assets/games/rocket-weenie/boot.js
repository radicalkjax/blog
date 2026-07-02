// Rocket Weenie web bootstrap — shared by the standalone page and the Jekyll
// project page. Loads the WASM and starts the original background music on the
// first user gesture (so it complies with browser autoplay policies).
//
// Requires mq_js_bundle.js (which defines the global `load`) to be included first.
(function () {
  "use strict";
  var BASE = "/assets/games/rocket-weenie/";
  // Bump on each asset change to bypass the browser HTTP cache + service worker.
  var V = "?v=3";

  var music = new Audio(BASE + "music.ogg" + V);
  music.loop = true;
  music.volume = 0.749; // original AudioSource m_Volume

  var started = false;
  function startMusic() {
    if (started) return;
    started = true;
    var p = music.play();
    if (p && p.catch) p.catch(function () { started = false; }); // retry on next gesture
  }
  // The tap/click/key that starts the game also unlocks + starts the music.
  ["pointerdown", "touchstart", "keydown"].forEach(function (ev) {
    window.addEventListener(ev, startMusic, { passive: true });
  });

  load(BASE + "rocket-weenie.wasm" + V);
})();
