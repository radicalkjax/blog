<script setup>
import { useSlideContext } from '@slidev/client'

// Threat-model data flow diagram of the desktop app at 82292f54.
// Conventions: dashed box = trust boundary, two-line box = data store,
// rounded box = process, plain box = external entity, [V] = Veilid's code.
// Slide sets `clicks: 4`: each click lights one boundary and lists its controls.
const { $clicks } = useSlideContext()
const B = 'https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/'
const DC31 = 'https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf'

const boundaries = [
  {
    n: 1, name: 'WEBVIEW → RUST',
    controls: [
      ['CSP: app scripts only, no frames', B + 'src-tauri/tauri.conf.json#L18-L21'],
      ['per-window allowlists, test-enforced', B + 'src-tauri/tests/capability_policy.rs#L106-L135'],
      ['can’t leave the app; mic for calls only', B + 'src-tauri/src/windows/navigation.rs#L1-L9'],
      ['events only to windows that need them', B + 'src-tauri/src/event_dispatch.rs#L1-L8'],
    ],
  },
  {
    n: 2, name: 'KEYS',
    controls: [
      ['raw keys in one crate, zeroized', B + 'crates/rekindle-secrets/src/lib.rs#L1-L14'],
      ['vault: SQLCipher + Argon2id', B + 'crates/rekindle-vault/src/store.rs#L29-L49'],
      ['not yet: chat DB plaintext at rest', B + 'docs/research/2026-10-04-standards-audit.md#L45', true],
      ['not yet: Argon2id at library defaults', B + 'docs/research/2026-10-04-standards-audit.md#L59', true],
    ],
  },
  {
    n: 3, name: 'VEILID LINK',
    controls: [
      ['only 5 of 43 crates link veilid-core', B + 'xtask/src/veilid_boundary.rs#L1-L29'],
      ['all DHT calls via one record pool', B + 'xtask/src/veilid_dht_calls.rs#L1-L15'],
      ['content is E2E before it gets here', B + 'docs/security/overview.md#L1-L33'],
    ],
  },
  {
    n: 4, name: 'DEVICE → NETWORK',
    controls: [
      ['Rekindle: safety route ≥3 hops', B + 'crates/rekindle-types/src/config/mod.rs#L13-L19'],
      ['[V] XChaCha20-Poly1305 on the wire', DC31 + '#page=15'],
      ['[V] routes, DHT, relays are Veilid’s', DC31 + '#page=28'],
    ],
  },
]
const lit = n => $clicks.value === n
</script>

<template>
  <svg class="dfd" viewBox="0 0 1148 492" role="img" aria-label="Data flow diagram of Rekindle's desktop app: the webview sandbox talks to the Rust host only through allowlisted commands; keys stay in the secrets crate; only five crates can reach veilid-core; everything leaves the device as ciphertext over a safety route of at least three hops.">
    <defs>
      <marker id="dfd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M0 0 L10 5 L0 10 z" class="ah" />
      </marker>
    </defs>

    <!-- device -->
    <rect x="0" y="0" width="800" height="414" class="device" />
    <text x="12" y="18" class="cap">YOUR DEVICE · ONE OS USER</text>

    <!-- ① webview sandbox -->
    <rect x="16" y="30" width="768" height="62" class="tb" :class="{ lit: lit(1) }" />
    <text x="28" y="48" class="tb-t" :class="{ lit: lit(1) }">① WEBVIEW SANDBOX</text>
    <rect x="28" y="56" width="744" height="28" rx="14" class="proc" />
    <a class="cite" :href="B + 'src-tauri/tests/capability_policy.rs#L259-L266'" target="_blank" rel="noopener"><text x="400" y="75" text-anchor="middle" class="p-t">SolidJS windows: login · buddy list · chat · DM · community · settings · call</text></a>

    <!-- flows across ① -->
    <line x1="170" y1="94" x2="170" y2="148" class="flow" marker-end="url(#dfd-arrow)" />
    <a class="cite" :href="B + 'src-tauri/src/invoke.rs#L9-L10'" target="_blank" rel="noopener"><text x="180" y="125" class="f-t">invoke: 265 commands, allowlisted per window</text></a>
    <line x1="560" y1="148" x2="560" y2="94" class="flow" marker-end="url(#dfd-arrow)" />
    <text x="570" y="125" class="f-t">typed events, per window</text>

    <!-- rust host -->
    <rect x="16" y="150" width="768" height="252" class="host" />
    <text x="28" y="168" class="cap">RUST HOST · rekindle-desktop</text>

    <rect x="28" y="178" width="240" height="40" rx="20" class="proc" />
    <text x="148" y="203" text-anchor="middle" class="p-t">commands · services</text>
    <line x1="268" y1="198" x2="318" y2="198" class="flow" marker-end="url(#dfd-arrow)" />
    <rect x="320" y="178" width="250" height="40" rx="20" class="proc" />
    <text x="445" y="196" text-anchor="middle" class="p-t">governance · channels</text>
    <text x="445" y="212" text-anchor="middle" class="p-t sm">gossip · voice (SFrame)</text>

    <!-- data stores -->
    <line x1="596" y1="180" x2="776" y2="180" class="store" /><line x1="596" y1="206" x2="776" y2="206" class="store" />
    <text x="604" y="198" class="s-t">vault.db · SQLCipher</text>
    <line x1="596" y1="220" x2="776" y2="220" class="store bad" /><line x1="596" y1="246" x2="776" y2="246" class="store bad" />
    <a class="cite" :href="B + 'crates/rekindle-db/src/open.rs#L123-L125'" target="_blank" rel="noopener"><text x="604" y="238" class="s-t bad">rekindle.db · plaintext</text></a>
    <line x1="570" y1="204" x2="594" y2="226" class="flow thin" marker-end="url(#dfd-arrow)" />

    <!-- ② key boundary -->
    <rect x="24" y="240" width="270" height="70" class="tb" :class="{ lit: lit(2) }" />
    <text x="38" y="257" class="tb-t" :class="{ lit: lit(2) }">② KEYS</text>
    <rect x="32" y="264" width="254" height="38" rx="19" class="proc" />
    <text x="159" y="280" text-anchor="middle" class="p-t sm">rekindle-secrets · crypto</text>
    <text x="159" y="295" text-anchor="middle" class="p-t sm">PQXDH · ratchet · channel keys</text>
    <line x1="350" y1="218" x2="288" y2="262" class="flow thin" marker-end="url(#dfd-arrow)" />
    <text x="318" y="252" class="f-t sm">sign / seal</text>

    <!-- ③ veilid link boundary -->
    <rect x="300" y="282" width="476" height="112" class="tb" :class="{ lit: lit(3) }" />
    <text x="312" y="299" class="tb-t" :class="{ lit: lit(3) }">③ VEILID LINK · 5 of 43 crates</text>
    <line x1="445" y1="218" x2="445" y2="314" class="flow" marker-end="url(#dfd-arrow)" />
    <text x="453" y="272" class="f-t">ciphertext only</text>
    <rect x="308" y="316" width="244" height="40" rx="20" class="proc" />
    <text x="430" y="341" text-anchor="middle" class="p-t sm">rekindle-protocol · record pool</text>
    <line x1="552" y1="336" x2="570" y2="336" class="flow" marker-end="url(#dfd-arrow)" />
    <rect x="572" y="316" width="194" height="40" rx="20" class="proc veilid" />
    <text x="669" y="341" text-anchor="middle" class="p-t sm v">veilid-core [V]</text>
    <line x1="572" y1="368" x2="720" y2="368" class="store v" /><line x1="572" y1="388" x2="720" y2="388" class="store v" />
    <text x="580" y="383" class="s-t v sm">Veilid storage [V]</text>

    <!-- ④ device ↔ network -->
    <line x1="0" y1="428" x2="800" y2="428" class="tb-line" :class="{ lit: lit(4) }" />
    <text x="12" y="446" class="tb-t" :class="{ lit: lit(4) }">④ DEVICE → NETWORK</text>
    <line x1="745" y1="356" x2="745" y2="454" class="flow" marker-end="url(#dfd-arrow)" />
    <a class="cite" :href="B + 'crates/rekindle-protocol/src/dht/pool/mod.rs#L192-L197'" target="_blank" rel="noopener"><text x="150" y="472" class="f-t">messages, DHT, voice: ≥3-hop safety route</text></a>
    <rect x="540" y="456" width="260" height="34" class="ext veilid" />
    <text x="670" y="478" text-anchor="middle" class="p-t sm v">Veilid network · friends [V]</text>

    <!-- controls panel -->
    <g v-for="b in boundaries" :key="b.n" class="ctl" :class="{ on: $clicks >= b.n, lit: lit(b.n) }">
      <text x="826" :y="b.n * 116 - 92" class="ctl-h">{{ ['', '①', '②', '③', '④'][b.n] }} {{ b.name }}</text>
      <a v-for="([c, href, bad], j) in b.controls" :key="c" class="cite" :href="href" target="_blank" rel="noopener">
        <text x="826" :y="b.n * 116 - 72 + j * 20" class="ctl-t" :class="{ bad }">{{ c }}</text>
      </a>
    </g>
    <text x="826" y="16" class="cap" :class="{ hide: $clicks >= 1 }">dashed = trust boundary</text>
    <text x="826" y="36" class="cap" :class="{ hide: $clicks >= 1 }">══ = data store · [V] = Veilid’s code</text>
    <a class="cite" href="https://owasp.org/www-community/Threat_Modeling_Process#:~:text=Boundaries%20show%20any%20location%20where%20the%20level%20of%20trust%20changes" target="_blank" rel="noopener"><text x="826" y="466" class="cap">drawn as a threat-model DFD</text></a>
    <a class="cite" href="https://v2.tauri.app/security/#:~:text=The%20IPC%20layer%20is%20the%20bridge%20for%20communication%20between%20these%20two%20trust%20groups" target="_blank" rel="noopener"><text x="826" y="486" class="cap">Tauri: “two trust groups”</text></a>
  </svg>
</template>

<style>
.dfd { width: 100%; height: auto; overflow: visible; font-family: 'DM Mono', monospace; }
.dfd .device { fill: none; stroke: var(--line); stroke-width: 1.5; }
.dfd .host { fill: rgb(255 255 255 / 2%); stroke: var(--fog-dim, #777); stroke-width: 1.2; }
.dfd .cap { fill: var(--fog); font-size: 12px; letter-spacing: .16em; transition: opacity .4s; }
.dfd .cap.hide { opacity: 0; }
.dfd .tb { fill: none; stroke: var(--chiral); stroke-width: 1.5; stroke-dasharray: 7 5; opacity: .55; transition: opacity .4s, stroke-width .4s; }
.dfd .tb-line { stroke: var(--chiral); stroke-width: 1.5; stroke-dasharray: 7 5; opacity: .55; transition: opacity .4s; }
.dfd .tb.lit, .dfd .tb-line.lit { opacity: 1; stroke-width: 3; }
.dfd .tb-t { fill: var(--chiral); font-size: 13px; letter-spacing: .12em; opacity: .7; }
.dfd .tb-t.lit { opacity: 1; }
.dfd .proc { fill: var(--panel-solid); stroke: var(--bridges); stroke-width: 1.4; }
.dfd .proc.veilid, .dfd .ext.veilid { stroke: var(--veilid); }
.dfd .ext { fill: var(--panel-solid); stroke-width: 1.4; }
.dfd .p-t { fill: var(--text); font-size: 14px; }
.dfd .p-t.sm, .dfd .f-t.sm, .dfd .s-t.sm { font-size: 12.5px; }
.dfd .v { fill: var(--veilid); }
.dfd .store { stroke: var(--text); stroke-width: 1.5; }
.dfd .store.bad { stroke: var(--danger); }
.dfd .store.v { stroke: var(--veilid); }
.dfd .s-t { fill: var(--text); font-size: 13.5px; }
.dfd .s-t.bad { fill: var(--danger); }
.dfd .flow { stroke: var(--fog); stroke-width: 1.6; fill: none; }
.dfd .flow.thin { stroke-width: 1.2; stroke-dasharray: 3 4; }
.dfd .ah { fill: var(--fog); }
.dfd .f-t { fill: var(--fog); font-size: 13px; }
.dfd .ctl { opacity: 0; transition: opacity .4s; }
.dfd .ctl.on { opacity: .45; }
.dfd .ctl.on.lit { opacity: 1; }
.dfd .ctl-h { fill: var(--chiral); font-size: 14px; letter-spacing: .12em; }
.dfd .ctl-t { fill: var(--text); font-size: 13.5px; }
.dfd .ctl-t.bad { fill: var(--danger); }
</style>
