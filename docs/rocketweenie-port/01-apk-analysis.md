# 01 — APK analysis

Source file: `assets/executables/RocketWeenieFree.apk` (19 MB).
Extracted and inspected 2026-07-01.

## Engine & build

| Property | Value |
|---|---|
| Engine | **Unity** |
| Unity version | **4.3.2f1** (released Dec 2013) |
| Scripting backend | **Mono** (managed .NET DLLs — fully decompilable) |
| Native ABI | `armeabi-v7a` only (`libunity.so`, `libmono.so`, `libmain.so`) |
| Build date | 2014-07-30 (file timestamps) |
| Manifest | `hide_status_bar=true`, `gles_mode=0`, no OBB |

The Mono backend is the important part: unlike IL2CPP builds, all game code is
sitting in readable managed assemblies. Nothing is obfuscated.

## Layout inside the APK

```
AndroidManifest.xml
classes.dex                     Android/Java glue (Unity player activity, ad SDKs)
lib/armeabi-v7a/*.so            Unity engine + Mono runtime (native, ARMv7)
assets/bin/Data/
  mainData                      global game managers, build settings
  sharedassets0.assets.split0..11   the scene assets, SPLIT into 12 parts (reassemble by concatenation)
  Managed/
    Assembly-CSharp.dll         ← YOUR GAME LOGIC (7.7 KB)
    Assembly-CSharp-firstpass.dll  (29 KB — mostly bundled ad-SDK glue)
    UnityEngine.dll, mscorlib.dll, System.Core.dll   (stock runtime)
  Resources/unity_builtin_extra, unity default resources
  splash.png
resources.arsc, res/            Android resources
```

**Split assets:** `sharedassets0.assets` was stored as 12 numbered chunks.
Reassemble with a simple concatenation in version order before feeding to an
extractor:

```bash
cat sharedassets0.assets.split{0..11} > sharedassets0.assets   # ~12 MB
```

(zsh: `cat sharedassets0.assets.split*(n)` or `ls | sort -V` to keep 0..11 in order.)

## Game logic (decompiled structure)

`Assembly-CSharp.dll` is only 7,680 bytes. The full class/method/field structure
was recovered with `dnfile` (dump saved in
[`artifacts/assembly-csharp-structure.txt`](artifacts/assembly-csharp-structure.txt)).
This is the entire game:

### `WeenieThrust` — the player (the weenie)
Fields: `speed`, `thrustSpeed`, `fowardSpeed` *(sic)*, `didThrust`, `animator`,
`dead`, `deathCoolDown`.
Methods: `Start`, `Update`, `FixedUpdate`, `OnCollisionEnter2D`.
→ Constant forward velocity; tap (`Input.GetMouseButtonDown` / touch) sets
`didThrust`, applying an upward `Rigidbody2D.AddForce` in `FixedUpdate`.
`animator.SetTrigger` drives the flap animation. `OnCollisionEnter2D` sets
`dead` and starts `deathCoolDown` before reloading the level.

### `SpaceSlow` — scrolling background
Fields: `numBGpanels`, `speed`. Method: `FixedUpdate`.
→ Infinite parallax: N background panels recycled leftward at `speed`.

### `WeenieTracker` — camera
Fields: `player`, `offsetX`. Methods: `Start`, `Update`.
→ Camera follows the player with a fixed X offset.

### `Booper` — obstacle / pass trigger
Methods: `Start`, `OnTriggerEnter2D`.
→ Asteroid or gap trigger. Spawn bounds live in `asteroidMax` / `asteroidMin`.

### `meter_score` — distance / finish trigger
Method: `OnTriggerEnter2D`. → Advances the distance meter / finish line.

### `Score` — scoring (singleton)
Fields: `score`, `highScore`, `instance`.
Methods: `AddPoint`, `Start`, `Update`, `OnDestroy`, `.cctor`.
→ Singleton. `AddPoint` bumps score; high score persisted via
`PlayerPrefs.GetInt/SetInt` (confirmed by string refs in the DLL). Rendered via
`GUIText`.

### `title` — title screen
Fields: `sawOnce`. Methods: `Start`, `Update`. → Tap-to-start / splash logic.

### `PlayHaven` — ad SDK glue *(drop for web)*
Fields: `androidAppToken`, `androidAppSecret`, `iosAppToken`, `iosAppSecret`.
→ PlayHaven / Upsight mobile ads. Not part of gameplay; omit entirely in the
web port.

## Where the art & audio are

Sprites (the weenie, asteroids, background panels, UI/score font), audio clips, and
the animation controller are serialized inside `sharedassets0.assets` (+
`mainData`). These are **not** loose PNG/WAV files — they're Unity's binary
serialized format and must be extracted with a Unity asset ripper (see
`03-workflow.md`). `splash.png` is the only loose image.

## Takeaway

Tiny, unobfuscated, well-understood 2D physics game. Every mechanic is accounted
for. The only things still needed for a faithful rebuild are (a) the original
image/audio assets and (b) the exact numeric tuning values (`thrustSpeed`,
`fowardSpeed`, spawn rates, `deathCoolDown`) — both recoverable per
`03-workflow.md`.
