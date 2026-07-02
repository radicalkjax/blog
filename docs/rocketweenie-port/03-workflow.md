# 03 — Workflow: APK → WASM on GitHub Pages

Concrete steps for the recommended path (Route C in `02-approaches.md`):
**extract original assets + exact tuning → reimplement in Rust/macroquad →
build to WASM → embed in Jekyll.**

Local toolchain status (checked 2026-07-01): `cargo`/`rustc` ✅, `node` ✅,
`python3` ✅. Missing and to be installed as needed: AssetRipper, a .NET
decompiler (ILSpy), Rust's `wasm32` target.

---

## Step 1 — Unpack the APK (done)

```bash
mkdir apk && cd apk
unzip -o ../assets/executables/RocketWeenieFree.apk
# reassemble the split scene assets:
cat bin/Data/sharedassets0.assets.split{0..11} > bin/Data/sharedassets0.assets
```
An APK is just a ZIP; `unzip` is enough. Keep this out of the repo (work in a
scratch dir) — we only commit the recovered *assets* and *notes*, not the whole
decompiled tree.

## Step 2 — Extract the original sprites & audio (AssetRipper)

The art/audio are Unity-serialized inside `sharedassets0.assets` + `mainData`,
not loose files. Use **AssetRipper** (supports Unity 3.5 → 6000.x, so 4.3 is
fine).

1. Download AssetRipper (GUI) from <https://assetripper.org/>.
2. `File → Open Folder` → point at `apk/assets/bin/Data/`.
3. Export → **Export all files** (or export selected textures/audio).
   - For sprites: set *Sprite Export Format → Texture* to get PNGs.
   - Audio exports as WAV/OGG.
4. Copy the recovered PNGs/audio into `docs/rocketweenie-port/artifacts/assets/`
   (small, fine to commit) — these become the game's art in Step 4.

What we need out of this: the weenie sprite(s) + flap animation frames, the
asteroid sprite(s), the background panel image(s), the score font/UI, and any
SFX/music.

> Alternative if AssetRipper struggles with this old format:
> [AssetStudio](https://github.com/Perfare/AssetStudio) or
> [UtinyRipper](https://github.com/mafaca/UtinyRipper).

## Step 3 — Get exact tuning values (ILSpy decompile)

We already have the full class/method/field *structure* (`artifacts/`), but the
numeric constants (`thrustSpeed`, `fowardSpeed`, `speed`, `numBGpanels`,
`asteroidMin/Max`, `deathCoolDown`) and the exact control flow need a real C#
decompile of `Assembly-CSharp.dll`.

Any of these opens it and shows readable C#:

- **ILSpy** (cross-platform): install the CLI with
  `dotnet tool install -g ilspycmd`, then
  `ilspycmd apk/assets/bin/Data/Managed/Assembly-CSharp.dll -o artifacts/decompiled/`
- **dnSpy** (Windows) or **dotPeek** (JetBrains) — GUI equivalents.

Save the decompiled C# to `artifacts/decompiled/` for reference while porting.
(These files reference `PlayHaven`/`Upsight` ad code — ignore it.)

## Step 4 — Reimplement in Rust + macroquad

```bash
rustup target add wasm32-unknown-unknown
cargo new rocket-weenie && cd rocket-weenie
cargo add macroquad
```

Port the mechanics 1:1 from the decompiled source. Mapping from the Unity
scripts to a single `main.rs` game loop:

| Unity script | macroquad equivalent |
|---|---|
| `WeenieThrust` (forward vel + tap `AddForce`, death) | player struct: `vel.y += gravity*dt`; on tap `vel.y = thrust`; constant `x` scroll; AABB death check |
| `SpaceSlow` (N recycled BG panels) | draw `numBGpanels` background textures, wrap X by panel width |
| `WeenieTracker` (camera offset) | offset all draws by `-player.x + offsetX`, or use `set_camera` |
| `Booper` / asteroid spawner (`asteroidMin/Max`) | spawn asteroids at randomized intervals; recycle off-screen |
| `meter_score` + `Score` (singleton, PlayerPrefs highscore) | `score` counter; persist high score via `quad-storage`/localStorage |
| `title` (`sawOnce`) | title state → tap to start |
| `PlayHaven` | omit |

Load the assets extracted in Step 2 with `load_texture` / `load_sound`.
`macroquad::rand` covers `Random.Range`. Input: `is_mouse_button_pressed` +
`touches()` for mobile.

Keep it deterministic on `get_frame_time()` so it feels the same as the fixed
50 Hz `FixedUpdate` original.

## Step 5 — Build to WASM

```bash
cargo build --release --target wasm32-unknown-unknown
# output: target/wasm32-unknown-unknown/release/rocket-weenie.wasm
```

macroquad needs one JS glue file + an HTML host with a `<canvas>`. Grab the
current loader from the macroquad web guide
(<https://mq.agical.se/release-web.html>) — minimal template:

```html
<canvas id="glcanvas" tabindex="1"></canvas>
<script src="https://not-fl3.github.io/miniquad-samples/mq_js_bundle.js"></script>
<script>load("rocket-weenie.wasm");</script>
```

Pin/vendor `mq_js_bundle.js` locally rather than hot-linking, so the game keeps
working offline (this site has a service worker) and isn't at the mercy of an
external host.

## Step 6 — Embed in the Jekyll site

Publish the built artifacts under a served path (NOT `docs/`, which is excluded
from the build). Suggested:

```
assets/games/rocket-weenie/
  rocket-weenie.wasm
  mq_js_bundle.js
```

Give this build its own served page (`projects/rocket-weenie.html`) — a
`<canvas>` sized responsively, the two `<script>`s above, and a mobile-friendly
note.

Add the `.wasm` + JS to `service-worker.js`'s precache list if you want offline
play, and confirm `.wasm` is served as `application/wasm` (GitHub Pages does
this by default).

## Step 7 — Verify

- Loads and runs in desktop + mobile browsers (tap/touch thrust works).
- Score + high score persist across reloads (localStorage).
- Bundle size sane (target < 2 MB total); first load acceptable on mobile.
- No console errors about missing headers/SharedArrayBuffer (there shouldn't be
  any — that's why we picked macroquad).

---

### Legal / authorship note

This is the author's own game being reverse-engineered from their own APK for a
personal remake — fully legitimate. The extracted assets are the author's own
art. The bundled ad SDKs (PlayHaven/Upsight) are third-party and are dropped, not
reused.
