# Rocket Weenie → WASM port

Workspace for reverse-engineering the original 2013 Android game
(`assets/executables/RocketWeenieFree.apk`, **Rocket Weenie**) and rebuilding it
as a lightweight WebAssembly game playable on this GitHub Pages / Jekyll site.

This folder lives under `docs/`, which is excluded from the Jekyll build
(`_config.yml`), so it's a safe dev workspace — nothing here is published.

## The game (recovered from the APK)

Flappy-bird-style arcade game: the weenie auto-scrolls forward, you tap to
thrust upward, dodge asteroids, and cover distance toward a finish line.
Score + saved high score. Built in **Unity 4.3.2f1** (Dec 2013), Mono
scripting backend, ARMv7. Full teardown in [`01-apk-analysis.md`](01-apk-analysis.md).

## Documents

| File | What it covers |
|---|---|
| [`01-apk-analysis.md`](01-apk-analysis.md) | What the APK contains, engine/version, the decompiled game logic (classes, fields, mechanics), where the art/audio live |
| [`02-approaches.md`](02-approaches.md) | The three researched routes to WASM, trade-offs, and the recommendation |
| [`03-workflow.md`](03-workflow.md) | Concrete step-by-step: extract assets → decompile logic → build WASM → embed in Jekyll |
| [`artifacts/`](artifacts/) | Decompiled structure dump and other recovered metadata |

## Recommendation (short version)

**Rewrite the game in Rust + [macroquad](https://github.com/not-fl3/macroquad),
compile to `wasm32-unknown-unknown`, and embed it as a `<canvas>` in a Jekyll
page.** Reuse the *original sprites and audio* extracted from the APK so it
looks/sounds identical; reimplement the ~8 tiny scripts (the whole logic is
7.7 KB of IL) from the decompiled source. This produces a sub-2 MB WASM bundle
that works on plain static hosting with no special server headers — unlike the
Unity WebGL and Godot 4 routes, which are heavier and (for Godot 4) need
cross-origin-isolation headers GitHub Pages can't set. Full reasoning and
sources in [`02-approaches.md`](02-approaches.md).

## Status

- [x] APK identified, engine + version pinned
- [x] Full C# decompile of the game logic (`artifacts/decompiled/`, via ilspycmd)
- [x] Approaches researched + decision recorded
- [x] **Real assets extracted** — all 11 sprites recovered from the 1024×1024
      atlas (`artifacts/extracted/sprites/`), via UnityPy + alpha component slicing
- [x] **Exact physics & scene layout extracted** — gravity, drag, forces, camera,
      colliders, recycling (`artifacts/extracted-physics-and-layout.md`)
- [x] **Faithful reimplementation** in Rust/macroquad using the real sprites and
      the exact extracted constants (`game/`, ~500 KB WASM); embedded in
      `projects/rocket-weenie.html`, served from `assets/games/rocket-weenie/`;
      verified running in-browser
- [ ] Audio clip extraction (UnityPy can't decode this old format — needs
      AssetRipper / FMOD FSB tooling)
- [ ] Optional polish: cycle all 3 thrust/flame frames; exact death animation

The reimplementation matches the original's mechanics and numbers, not a
re-invention: constant forward *force* (accelerating), one-shot thrust force,
real 2D gravity × 0.6 with linear drag, camera-follow, asteroid/background
recycling, marker scoring, title-screen pause, and death→reload.

## Build

```bash
cd game
cargo build --release --target wasm32-unknown-unknown
cp target/wasm32-unknown-unknown/release/rocket-weenie.wasm \
   ../../../assets/games/rocket-weenie/rocket-weenie.wasm
```

Play locally: `python3 -m http.server` from the repo root, then open
`/assets/games/rocket-weenie/` (or the Jekyll page `/projects/rocket-weenie/`).
