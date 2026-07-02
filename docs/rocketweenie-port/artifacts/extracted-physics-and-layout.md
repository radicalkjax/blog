# Extracted physics & scene layout (authoritative)

Pulled from `RocketWeenieFree.apk` (Unity 4.3.2f1) via UnityPy (asset/scene data)
and ilspycmd (code). These are the real values the game shipped with — the
faithful reimplementation must match them.

## Global physics (from serialized managers)

| Setting | Value | Source |
|---|---|---|
| Global 2D gravity | `(0, -30.0)` | `Physics2DSettings.m_Gravity` |
| Fixed timestep | `0.02` s (50 Hz) | `TimeManager.Fixed Timestep` |
| Velocity/position iters | 8 / 3 | `Physics2DSettings` |

## Player (Weenie) Rigidbody2D

| Field | Value |
|---|---|
| Mass | `1.0` |
| Linear drag | `1.0` |
| Gravity scale | `0.6` |
| → effective gravity accel | `0.6 × -30 = -18 u/s²` |

Box2D integration per FixedUpdate (dt=0.02):
`v += (gravity·gravityScale + ΣF/mass)·dt;  v ·= 1/(1+drag·dt);  pos += v·dt`

## Script constants (from decompiled C#, all private/default-initialized)

`thrustSpeed`/`fowardSpeed` are **public** fields — their *serialized* (Inspector)
values differ from the code defaults (100/1). Read from the 40-byte WeenieThrust
MonoBehaviour: **thrustSpeed = 500, fowardSpeed = 6**. The rest are private, so the
code initializers are authoritative.

| Script | Field | Value |
|---|---|---|
| `WeenieThrust` | `thrustSpeed` (up force, one-shot per tap) | **`500`** → Δv = 500·0.02 = **+10 u/s per tap** |
| `WeenieThrust` | `fowardSpeed` (right force, every FixedUpdate) | **`6`** → a = 6 u/s², terminal vx = a/drag = **6 u/s** |
| `WeenieThrust` | `deathCoolDown` | `0.8` s, then `Application.LoadLevel` (reload) |
| `SpaceSlow` | `speed` | `2` — background panels drift **right** at 2 u/s (parallax) |
| `Booper` | `numBGpanels` | `8` |
| `Booper` | `asteroidMin` / `asteroidMax` | `0.6145836` / `6.420372` (asteroid Y range) |

## Camera

| Field | Value |
|---|---|
| Orthographic | true |
| Ortho size (half-height) | `7.168411` → view ≈ **14.34 world units tall** |
| Follows | player X only (`WeenieTracker`), Y fixed at 0 |
| Offset X | `camera.x − player.x = -0.21 − (-2.67) =` **`+2.46`** |

## Scene layout (Transforms / colliders)

| Object | Position | Collider |
|---|---|---|
| Weenie (player) | `(-2.67, -0.05)` | Box `2.84 × 1.39` (non-trigger) |
| Main Camera | `(-0.21, 0)` | — |
| Booper (recycler, trails player) | `(-17.74, 0.24)` | Box trigger |
| Background panels ×8 (`UnityAsset1`) | x = 5, 15.7, 26.4, 37.1, 47.8, 58.5, 69.2, 79.9 (Δ = **10.7**), y ≈ 9.56 | Box `10.7 × 19.24` trigger |
| Asteroids ×6 (`UnityAsset_6/_7`) | around parent x≈42.75, scale **1.52** | Circle `r = 1.695` → world r = 1.695×1.52 ≈ **2.576** |
| OutofBounds ×2 (kill walls) | ceiling y≈`11.17`, floor y≈`-13.59` (+ collider center y 0.606) | Box `100.5 × 2.2` non-trigger, kinematic |
| meter/score triggers (`score`) | one per asteroid, child of it | thin `1 × ~19.98` full-height Box trigger → `Score.AddPoint()` |

## Asteroid sequence (the important part)

Under the `Asteroids` root (world x 42.75) there are exactly **4 formations** in a
fixed order, at world x `4.75, 16.75, 28.75, 40.75` (**12u spacing**):

1. **Double** ("Asteroids Double W & S", tag `Asteroids`) — two asteroids at
   parent-Y `-0.11` and `-8.57` (8.46 apart → ~3.3u gap to thread).
2. **Single** (untagged) at a fixed Y.
3. **Double** (tag `Asteroids`).
4. **Single** (untagged).

`Booper` is a **child of Main Camera** (trails at camera − 17.74, box `5×22`). When
a formation's trigger enters it, the formation moves `+ box.x(6) × numBGpanels(8)
= +48` in X — so with 4 formations at 12u spacing the D,S,D,S order repeats forever.

**Height fluctuation:** `Booper.Start()` and each recycle call
`Random.Range(0.6146, 6.4204)` on the Y of every **`Asteroids`-tagged** object —
i.e. only the two **doubles**. So the doubles' gap bobs up/down each cycle, while
the **singles keep a fixed Y**. (Scoring: each asteroid carries its own full-height
marker, so a double = 2 points, a single = 1.)

Background panels are a separate loop: 8 panels, box.x `10.7`, recycle `+85.6`,
plus the `SpaceSlow` +2 u/s drift (parallax).

## Sprites (extracted from the 1024×1024 atlas, `Texture2D` "UnityAsset")

11 sprites, recovered via alpha connected-components (UnityPy's Sprite typetree
reader fails on this Unity 4.3 format):

`background` 443×787 · `title` 332×620 · `asteroid_0/1/2` 138×126 ·
`weenie_thrust_0/1/2` 117×61 (flame/flap frames) · `explosion` 132×61 ·
`weenie_wreck_0/1` 117×34 (smoking death frames).

## Audio

1 `AudioClip` (pathID 9) at file offset 2109184 (size 10228656) in
`sharedassets0.assets`, referenced by the Main Camera's `AudioSource`
(`PlayOnAwake=true`, `m_Volume=0.749`). UnityPy can't parse its typetree, so it was
extracted by hand: the clip's data is an FMOD container of **raw MPEG-1 Layer 3**
(320 kbps, 44.1 kHz stereo) with **two subsounds** back-to-back — found by
validating MP3 frame chains in the file rather than trusting byte offsets:

- **Subsound 0** — the background track — starts at +1027 into the clip: a clean
  **46-second** loop (1760 frames). → `music.ogg` (832 KB, q4 Vorbis).
- **Subsound 1** — a longer **3:29** track. → `music-alt-long.ogg` (alternate).

> A first attempt force-demuxed the whole misaligned 10 MB blob and produced
> noise ("sounds made up"). The fix was to locate the exact start of a clean,
> continuous MP3 frame chain and cut precisely there.

`music.ogg` is deployed to `assets/games/rocket-weenie/` and played by the host
page (`boot.js`) via an HTML5 `<audio>` element on the first tap (autoplay
gesture), looped, at volume 0.749.
