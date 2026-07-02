# 02 — Approaches to a WASM rebuild

Goal: the game, rebuilt as WebAssembly, playable in-browser on this **free
GitHub Pages / Jekyll** site — ideally small and mobile-friendly.

Two facts from the analysis drive the decision:

1. The game logic is trivially small (7.7 KB IL, ~8 tiny classes) and fully
   decompilable — a rewrite is cheap.
2. GitHub Pages is plain static hosting: **it cannot set custom HTTP response
   headers.** That rules out (or complicates) engines whose web builds require
   cross-origin-isolation headers.

## The three routes

### Route A — Faithful: AssetRipper → modern Unity → WebGL/WASM

Use [AssetRipper](https://assetripper.org/) to reconstruct a real Unity project
from the APK, open it in a current Unity, and build for WebGL (Unity's WebGL
target compiles to WASM via Emscripten).

- ➕ Highest fidelity; reuses assets *and* logic with least reimplementation.
- ➖ **Heavy output.** Even an empty modern Unity web build is ~2–11 MB
  compressed depending on render pipeline
  ([Unity build-size notes](https://gist.github.com/aras-p/740c2d4f9977ce92b7de72b1394dd365)).
- ➖ Upgrading a **Unity 4.3** project to Unity 6 is a large version jump —
  the 2D physics API, animation, and GUIText are all deprecated/changed; expect
  significant fix-up.
- ➖ Requires installing the Unity editor + a big toolchain; clunky to embed in
  a blog; poor first-load experience on mobile.

Fine if the goal were a pixel-perfect archive. Overkill for a blog widget.

### Route B — Godot rewrite → HTML5/WASM export

Rebuild the flappy mechanics in Godot and use its Web export (also WASM).

- ➕ Fast to build a simple 2D game; visual editor.
- ➖ **GitHub Pages gotcha:** Godot **4** web exports use `SharedArrayBuffer`,
  which requires `Cross-Origin-Opener-Policy` + `Cross-Origin-Embedder-Policy`
  headers. **GitHub Pages can't set headers**, so the build fails to start
  unless you either (a) ship a service-worker hack like
  [`coi-serviceworker`](https://github.com/nisovin/godot-coi-serviceworker) to
  fake the headers client-side, or (b) use Godot 4.3+'s "no-threads" export.
  See [Rafael Epplée's write-up](https://www.rafa.ee/articles/deploying-godot-4-html-exports/).
- ➖ Godot web bundles are still fairly chunky (engine WASM is multi-MB), and
  the service-worker hack adds fragility (and interacts with this site's
  existing `service-worker.js`).

Viable, but the header workaround is exactly the kind of fragile thing you don't
want on a personal site that already has a service worker.

### Route C — ✅ Recommended: Rust + macroquad rewrite → WASM

Reimplement the game in Rust with [macroquad](https://github.com/not-fl3/macroquad)
(a lightweight raylib-inspired 2D engine) and compile to
`wasm32-unknown-unknown`. Reuse the *original sprites/audio* extracted from the
APK so it looks and sounds identical.

- ➕ **Tiny + fast.** A macroquad game is a single small `.wasm` (typically a
  few hundred KB to ~2 MB with assets) plus one JS loader — well under GitHub
  Pages' 100 MB/file, 1 GB/site limits
  ([Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)).
- ➕ **No special headers.** macroquad's web build runs on plain static hosting
  — no SharedArrayBuffer, no COOP/COEP, no service-worker hack. This is the
  decisive advantage on GitHub Pages.
- ➕ Embeds as a plain `<canvas>` + `<script>` — drops cleanly into a Jekyll
  page ([macroquad web guide](https://mq.agical.se/release-web.html)).
- ➕ Rust toolchain is **already installed** locally (`cargo`, `rustc`); the
  logic is small enough to port faithfully from the decompiled source.
- ➖ It's a reimplementation, not a 1:1 binary port — behavior must be matched
  by reading the decompiled logic (we already have the full structure; exact
  tuning constants come from the ILSpy decompile in `03-workflow.md`).

## Decision

**Route C (Rust + macroquad → WASM).** It's the only route that is both small
and header-free on GitHub Pages, the rewrite cost is low because the game is
tiny and already fully mapped, and the toolchain is already on this machine. We
still lean on Route A's *tooling* for one thing: AssetRipper to extract the
original sprites/audio so the remake is visually faithful.

If exact fidelity ever matters more than size/simplicity, Route A (AssetRipper →
Unity WebGL) remains the fallback.

This is a standalone, website-specific WASM build with its own served page (see
`03-workflow.md`, Step 6).

## Sources

- [AssetRipper — assetripper.org](https://assetripper.org/) ·
  [How to use AssetRipper](https://assetripper.org/how-to-use-assetripper/) ·
  [GitHub](https://github.com/assetripper/assetripper)
- [Unity WebGL build sizes (aras-p gist)](https://gist.github.com/aras-p/740c2d4f9977ce92b7de72b1394dd365) ·
  [Serving Unity WebGL from GitHub Pages](https://ericranstrom.github.io/ericranstrom/general/unity_github_pages/)
- [macroquad](https://github.com/not-fl3/macroquad) ·
  [Build for the web](https://mq.agical.se/release-web.html) ·
  [Rust WASM starfield walkthrough](https://dev.to/desmo/a-rust-powered-starfield-in-the-browser-with-macroquad-wasm-4hh3)
- [Godot 4 HTML export + cross-origin isolation (Rafael Epplée)](https://www.rafa.ee/articles/deploying-godot-4-html-exports/) ·
  [godot-coi-serviceworker](https://github.com/nisovin/godot-coi-serviceworker)
- [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) ·
  [About large files on GitHub](https://docs.github.com/en/repositories/working-with-files/managing-large-files/about-large-files-on-github)
- [Reverse-engineering Unity games (Kodeco)](https://www.kodeco.com/36285673-how-to-reverse-engineer-a-unity-game) ·
  [Reversing C#/.NET/Unity (Practical CTF)](https://book.jorianwoltjer.com/reverse-engineering/reversing-c-.net-unity)
