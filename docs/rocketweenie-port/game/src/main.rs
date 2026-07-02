// Rocket Weenie — web (WASM) build.
//
// Faithful reimplementation of the 2013 Unity 4.3.2f1 game (RocketWeenieFree.apk).
// Physics, the asteroid sequence, scene layout and art are extracted from the
// original APK (docs/rocketweenie-port/artifacts/) — this matches the original,
// it does not reinterpret it.
//
// Original scripts -> here:
//   WeenieThrust  : forward = continuous AddForce(right*6) each FixedUpdate;
//                   thrust  = one-shot AddForce(up*500) on the FixedUpdate after
//                   a tap (didThrust); real 2D gravity*0.6 + linear drag 1;
//                   collision -> dead, freeze, 0.8s, reload.
//   WeenieTracker : camera follows player X (offset +2.46), Y fixed at 0.
//   Booper        : recycles formations forward when they pass behind the player,
//                   re-randomizing Y in [0.6146, 6.4204].
//   title         : Time.timeScale = 0 until first tap.

use macroquad::prelude::*;

const ASSET_BASE: &str = "/assets/games/rocket-weenie/sprites";
// Music (AudioSource, PlayOnAwake) is played by the host page via an HTML5 <audio>
// element started on the first user gesture — reliable across browser autoplay
// policies, unlike the Web Audio context macroquad would use.

// --- Extracted physics (serialized/authoritative) --------------------------
const FIXED_DT: f32 = 0.02; // TimeManager fixed timestep (50 Hz)
const GRAVITY_Y: f32 = -30.0; // Physics2DSettings.m_Gravity.y
const GRAVITY_SCALE: f32 = 0.6; // Weenie Rigidbody2D.m_GravityScale
const MASS: f32 = 1.0; // Weenie Rigidbody2D.m_Mass
const LINEAR_DRAG: f32 = 1.0; // Weenie Rigidbody2D.m_LinearDrag
const THRUST_FORCE: f32 = 500.0; // WeenieThrust.thrustSpeed (serialized) -> +10 u/s/tap
const FORWARD_FORCE: f32 = 6.0; // WeenieThrust.fowardSpeed (serialized) -> vx→6 u/s
const DEATH_COOLDOWN: f32 = 0.8; // WeenieThrust.deathCoolDown

const CAM_ORTHO_H: f32 = 7.168411; // camera half-height (world units)
const CAM_OFFSET_X: f32 = 2.46; // camera.x - player.x

const WEENIE_START: Vec2 = vec2(-2.67, -0.05);
const WEENIE_BOX: Vec2 = vec2(2.8366222, 1.389061); // BoxCollider2D size

// Kill walls (OutofBounds), from extracted world positions + collider extents.
const CEILING_Y: f32 = 10.68; // weenie center dies above this
const FLOOR_Y: f32 = -11.88; // ...or below this (both a few units off-screen)

// --- Extracted asteroid sequence -------------------------------------------
// The scene has 4 formations under "Asteroids" at world X 4.75/16.75/28.75/40.75
// (12u spacing), in order Double, Single, Double, Single. Booper recycles each by
// box.x(6)*numBGpanels(8) = 48 when it passes behind, keeping the 12u spacing and
// the D,S,D,S order forever. Only the doubles are tagged "Asteroids", so only
// their Y is randomized (at Start and each recycle); singles keep a fixed Y.
const ASTEROID_R: f32 = 1.695 * 1.52; // circle collider r * transform scale ≈ 2.576
const ASTEROID_MIN_Y: f32 = 0.6145836; // Booper.asteroidMin (recycle Y range)
const ASTEROID_MAX_Y: f32 = 6.420372; // Booper.asteroidMax
const LOOP_LEN: f32 = 48.0; // 4 formations × 12u spacing
// Double: two asteroids at these Y offsets from the formation's (randomized) Y
// (extracted child local offsets → 8.46 apart, ~3.3u gap to fly through).
const DBL_UP: f32 = -0.11;
const DBL_DOWN: f32 = -8.57;
const SCORE_MARKER_DX: f32 = 2.1; // score trigger sits this far right of the asteroid

const PANEL_W: f32 = 10.7; // background panel width (SpaceSlow-scrolled starfield)
const SPACE_SLOW_SPEED: f32 = 2.0; // SpaceSlow.speed — background drifts right (parallax)

#[derive(PartialEq, Clone, Copy)]
enum State {
    Title,
    Playing,
    Dead,
}

struct Weenie {
    pos: Vec2,
    vel: Vec2,
    did_thrust: bool,
    dead: bool,
    death_cd: f32,
    flame: f32,
}
impl Weenie {
    fn new() -> Weenie {
        Weenie { pos: WEENIE_START, vel: Vec2::ZERO, did_thrust: false, dead: false, death_cd: 0.0, flame: 0.0 }
    }
}

#[derive(Clone, Copy)]
struct Formation {
    x: f32,
    y: f32, // double: randomized parent Y; single: fixed Y
    double: bool,
    variant: usize,
    scored: bool,
}
impl Formation {
    // World centers of this formation's asteroid(s).
    fn asteroids(&self) -> [(Vec2, bool); 2] {
        if self.double {
            [(vec2(self.x, self.y + DBL_UP), true), (vec2(self.x, self.y + DBL_DOWN), true)]
        } else {
            [(vec2(self.x, self.y), true), (Vec2::ZERO, false)]
        }
    }
    fn points(&self) -> i32 {
        if self.double {
            2
        } else {
            1
        } // each asteroid carries its own score marker
    }
}

// The original scene order (Double, Single, Double, Single) at 12u spacing.
// Doubles' Y is randomized at Start (Booper.Start) below; singles are fixed.
fn initial_formations() -> Vec<Formation> {
    vec![
        Formation { x: 4.75, y: 4.63, double: true, variant: 0, scored: false },
        Formation { x: 16.75, y: -1.76, double: false, variant: 2, scored: false },
        Formation { x: 28.75, y: 1.34, double: true, variant: 1, scored: false },
        Formation { x: 40.75, y: -1.29, double: false, variant: 0, scored: false },
    ]
}

// Booper.Start(): randomize the Y of every "Asteroids"-tagged object (the doubles).
fn booped(mut forms: Vec<Formation>) -> Vec<Formation> {
    for f in forms.iter_mut() {
        if f.double {
            f.y = rand_y();
        }
    }
    forms
}

struct Art {
    weenie_thrust: [Texture2D; 3],
    weenie_wreck: [Texture2D; 2],
    explosion: Texture2D,
    asteroid: [Texture2D; 3],
    background: Texture2D,
    title: Texture2D,
}

async fn load_all() -> Art {
    async fn t(name: &str) -> Texture2D {
        let tex = load_texture(&format!("{ASSET_BASE}/{name}.png")).await.unwrap();
        tex.set_filter(FilterMode::Nearest);
        tex
    }
    Art {
        weenie_thrust: [t("weenie_thrust_0").await, t("weenie_thrust_1").await, t("weenie_thrust_2").await],
        weenie_wreck: [t("weenie_wreck_0").await, t("weenie_wreck_1").await],
        explosion: t("explosion").await,
        asteroid: [t("asteroid_0").await, t("asteroid_1").await, t("asteroid_2").await],
        background: t("background").await,
        title: t("title").await,
    }
}

fn window_conf() -> Conf {
    Conf { window_title: "Rocket Weenie".to_owned(), window_width: 900, window_height: 540, high_dpi: true, ..Default::default() }
}

fn tap_pressed() -> bool {
    is_mouse_button_pressed(MouseButton::Left)
        || is_key_pressed(KeyCode::Space)
        || touches().iter().any(|t| t.phase == TouchPhase::Started)
}

fn rand_y() -> f32 {
    rand::gen_range(ASTEROID_MIN_Y, ASTEROID_MAX_Y)
}

#[macroquad::main(window_conf)]
async fn main() {
    rand::srand(0xC0FFEE);
    let art = load_all().await;

    let mut state = State::Title; // title.sawOnce -> shown only at launch
    let mut w = Weenie::new();
    let mut forms = booped(initial_formations()); // Booper.Start randomizes double Ys
    let mut bg_scroll = 0.0f32; // SpaceSlow parallax offset (resets each new game)
    let mut score: i32 = 0;
    let mut high_score: i32 = 0;
    let mut acc = 0.0f32;

    loop {
        let frame_dt = get_frame_time().min(0.1);
        let tapped = tap_pressed();

        match state {
            State::Title => {
                if tapped {
                    state = State::Playing;
                }
            }
            State::Playing => {
                if tapped {
                    w.did_thrust = true; // consumed next FixedUpdate
                    w.flame = 0.18;
                }
                // Fixed-step physics (Time.timeScale=1 only while playing).
                acc += frame_dt;
                while acc >= FIXED_DT {
                    fixed_update(&mut w);
                    bg_scroll += SPACE_SLOW_SPEED * FIXED_DT; // SpaceSlow drift
                    acc -= FIXED_DT;
                }
                w.flame -= frame_dt;

                // Booper: recycle each formation once it passes off the left of the
                // view. Doubles (tagged "Asteroids") get a fresh random Y; singles
                // keep their Y.
                let cam_x = w.pos.x + CAM_OFFSET_X;
                let off_left = cam_x - (screen_width() / screen_height()) * CAM_ORTHO_H - 6.0;
                for f in forms.iter_mut() {
                    if f.x < off_left {
                        f.x += LOOP_LEN;
                        if f.double {
                            f.y = rand_y();
                        }
                        f.scored = false;
                    }
                }

                // Score: passing each asteroid's full-height marker (meter_score);
                // a double carries two markers -> 2 points, a single -> 1.
                for f in forms.iter_mut() {
                    if !f.scored && w.pos.x >= f.x + SCORE_MARKER_DX {
                        f.scored = true;
                        score += f.points();
                        high_score = high_score.max(score);
                    }
                }

                // Death: asteroid collision or out-of-bounds wall.
                let hit = forms.iter().any(|f| {
                    f.asteroids().iter().any(|(c, on)| *on && circle_hits_box(*c, ASTEROID_R, w.pos, WEENIE_BOX))
                }) || w.pos.y > CEILING_Y
                    || w.pos.y < FLOOR_Y;
                if hit {
                    w.dead = true;
                    w.vel = Vec2::ZERO; // rigidbody set kinematic
                    w.death_cd = DEATH_COOLDOWN;
                    state = State::Dead;
                }
            }
            State::Dead => {
                w.death_cd -= frame_dt;
                if w.death_cd <= 0.0 {
                    // Application.LoadLevel reload; sawOnce persists -> straight to play.
                    w = Weenie::new();
                    forms = booped(initial_formations());
                    bg_scroll = 0.0; // reset parallax so the starfield is never blank
                    score = 0;
                    state = State::Playing;
                }
            }
        }

        draw_world(&w, &forms, bg_scroll, &art, state, score, high_score);
        next_frame().await
    }
}

// Unity 2D (Box2D) semi-implicit Euler with linear damping, dt = 0.02.
fn fixed_update(w: &mut Weenie) {
    if w.dead {
        return;
    }
    let mut force = vec2(FORWARD_FORCE, 0.0); // AddForce(right*fowardSpeed) every step
    if w.did_thrust {
        force.y += THRUST_FORCE; // AddForce(up*thrustSpeed) once
        w.did_thrust = false;
    }
    let accel = vec2(0.0, GRAVITY_Y * GRAVITY_SCALE) + force / MASS;
    w.vel += accel * FIXED_DT;
    w.vel *= 1.0 / (1.0 + LINEAR_DRAG * FIXED_DT);
    w.pos += w.vel * FIXED_DT;
}

fn circle_hits_box(c: Vec2, r: f32, box_center: Vec2, box_size: Vec2) -> bool {
    let half = box_size * 0.5;
    let closest = vec2(
        c.x.clamp(box_center.x - half.x, box_center.x + half.x),
        c.y.clamp(box_center.y - half.y, box_center.y + half.y),
    );
    (c - closest).length_squared() < r * r
}

struct Cam {
    ppu: f32,
    cx: f32,
    sw: f32,
    sh: f32,
}
impl Cam {
    fn new(player_x: f32) -> Cam {
        let sh = screen_height();
        Cam { ppu: sh / (2.0 * CAM_ORTHO_H), cx: player_x + CAM_OFFSET_X, sw: screen_width(), sh }
    }
    fn to_screen(&self, w: Vec2) -> Vec2 {
        vec2((w.x - self.cx) * self.ppu + self.sw * 0.5, self.sh * 0.5 - w.y * self.ppu)
    }
    fn sprite(&self, tex: &Texture2D, world_pos: Vec2, ww: f32, wh: f32) {
        let (sw, sh) = (ww * self.ppu, wh * self.ppu);
        let tl = self.to_screen(world_pos) - vec2(sw * 0.5, sh * 0.5);
        draw_texture_ex(tex, tl.x, tl.y, WHITE, DrawTextureParams { dest_size: Some(vec2(sw, sh)), ..Default::default() });
    }
}

fn h_over_w(t: &Texture2D) -> f32 {
    t.height() / t.width()
}

fn draw_world(w: &Weenie, forms: &[Formation], bg_scroll: f32, art: &Art, state: State, score: i32, high_score: i32) {
    clear_background(BLACK);
    let cam = Cam::new(w.pos.x);

    // Background starfield: the same panel tiled seamlessly across the view,
    // drifting right by bg_scroll (SpaceSlow parallax). Tiling by camera makes
    // it gap-proof — no blank frames after a respawn.
    let panel_h = PANEL_W * h_over_w(&art.background);
    let half_view_w = (cam.sw / cam.sh) * CAM_ORTHO_H;
    let first = ((cam.cx - bg_scroll - half_view_w) / PANEL_W).floor() as i32 - 1;
    let last = ((cam.cx - bg_scroll + half_view_w) / PANEL_W).ceil() as i32 + 1;
    for k in first..=last {
        cam.sprite(&art.background, vec2(k as f32 * PANEL_W + bg_scroll, 0.0), PANEL_W, panel_h);
    }

    // Asteroids, per formation (draw at collider diameter).
    let d = ASTEROID_R * 2.0;
    for f in forms {
        for (c, on) in f.asteroids() {
            if on {
                cam.sprite(&art.asteroid[f.variant], c, d, d);
            }
        }
    }

    // Weenie.
    let ww = WEENIE_BOX.x;
    let wh = ww * h_over_w(&art.weenie_thrust[0]);
    if w.dead {
        let t = DEATH_COOLDOWN - w.death_cd;
        if t < 0.25 {
            cam.sprite(&art.explosion, w.pos, ww * 1.3, ww * 1.3 * h_over_w(&art.explosion));
        } else {
            let f = (t * 8.0) as i32 as usize % 2;
            cam.sprite(&art.weenie_wreck[f], w.pos, ww, ww * h_over_w(&art.weenie_wreck[0]));
        }
    } else {
        let frame = if w.flame > 0.0 { 1 + (get_time() * 22.0) as usize % 2 } else { 0 };
        cam.sprite(&art.weenie_thrust[frame], w.pos, ww, wh);
    }

    // HUD (original GUIText: "Score: N\nHigh Score: M").
    draw_text(&format!("Score: {score}"), 18.0, 34.0, 30.0, WHITE);
    draw_text(&format!("High Score: {high_score}"), 18.0, 62.0, 24.0, Color::from_rgba(200, 205, 230, 255));

    if state == State::Title {
        let th = CAM_ORTHO_H * 2.0 * 0.8;
        let tw = th * (art.title.width() / art.title.height());
        cam.sprite(&art.title, vec2(cam.cx, 0.0), tw, th);
    }
}
