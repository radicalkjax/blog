<script setup>
import { useSlideContext } from '@slidev/client'

// Slide sets `clicks: 4`. 1: Discord sees every IP · 2: verify bots get it too ·
// 3: Veilid's routes (cDc's design) · 4: what Rekindle sets on top.
// Veilid parts are drawn in --veilid, Rekindle's choices in --bridges.
const { $clicks } = useSlideContext()
const B = 'https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/'
const DC31 = 'https://media.defcon.org/DEF%20CON%2031/DEF%20CON%2031%20presentations/Christien%20DilDog%20Rioux%20Katelyn%20Medus4%20Bowden%20-%20The%20Internals%20of%20Veilid%20a%20New%20Decentralized%20Application%20Framework.pdf'
const BOOK = 'https://veilid.gitlab.io/developer-book/print.html'
const users = [[50, 62], [50, 117], [50, 172]]
const safety = [230, 370, 510]
const Y = 360
</script>

<template>
  <svg class="who-sees" viewBox="0 0 1148 500" role="img" aria-label="Discord's servers see every user's IP and verify bots record it too. On Veilid, the sender's safety route and the receiver's private route compile into one path where each hop knows only the next; Rekindle raises the safety route to 3 hops and sends DHT reads and writes over it.">
    <!-- ── Discord ─────────────────────────────────────────── -->
    <text x="0" y="20" class="title">DISCORD</text>
    <g v-for="([x, y], i) in users" :key="`u${i}`">
      <line :x1="x + 24" :y1="y" x2="240" y2="112" class="wire" :class="{ hot: $clicks >= 1 }" />
      <circle :cx="x" :cy="y" r="24" class="user" />
      <text :x="x" :y="y + 4" text-anchor="middle" class="ip">{{ ['you', 'friend', 'rando'][i] }}</text>
    </g>
    <rect x="240" y="72" width="180" height="80" rx="2" class="relay" :class="{ hot: $clicks >= 1 }" />
    <text x="330" y="106" text-anchor="middle" class="label">Discord servers</text>
    <text x="330" y="132" text-anchor="middle" class="sub" :class="{ show: $clicks >= 1 }">see every IP</text>

    <g class="leak" :class="{ show: $clicks >= 2 }">
      <path d="M68 50 Q 300 6 480 90" class="wire leaky" />
      <rect x="480" y="72" width="180" height="80" rx="2" />
      <text x="570" y="106" text-anchor="middle" class="label">verify bot site</text>
      <text x="570" y="132" text-anchor="middle" class="sub show">records your IP</text>
    </g>

    <g class="notes">
      <a class="cite" href="https://discord.com/privacy#:~:text=this%20includes%20information%20like%20your%20IP%20address" target="_blank" rel="noopener"><text x="700" y="100" class="fact" :class="{ show: $clicks >= 1 }">Discord: “information like your IP address”</text></a>
      <a class="cite" href="https://www.dexerto.com/gaming/discord-bot-built-to-stop-alt-accounts-leaks-millions-of-users-ip-addresses-3416371/#:~:text=it%20records%20the%20IP%20address%20of%20every%20member%20who%20verifies" target="_blank" rel="noopener"><text x="700" y="128" class="fact danger" :class="{ show: $clicks >= 2 }">bots: “records the IP address of every member”</text></a>
    </g>

    <line x1="0" x2="1148" y1="205" y2="205" class="divider" />

    <!-- ── Veilid: safety route + private route = compiled route ── -->
    <g class="veilid" :class="{ show: $clicks >= 3 }">
      <text x="0" y="234" class="title">REKINDLE ON VEILID</text>

      <!-- brackets -->
      <path :d="`M${safety[0]} 300 v-8 H${safety[2]} v8`" class="bracket" />
      <a class="cite" :href="`${BOOK}#:~:text=designed%20to%20protect%20the%20sender`" target="_blank" rel="noopener"><text x="370" y="280" text-anchor="middle" class="route-t">SAFETY ROUTE · you pick it · hides you</text></a>
      <path d="M650 300 v-8 H790 v8" class="bracket" />
      <a class="cite" :href="`${BOOK}#:~:text=designed%20to%20protect%20the%20receiver`" target="_blank" rel="noopener"><text x="720" y="280" text-anchor="middle" class="route-t">PRIVATE ROUTE · friend picks it</text></a>

      <!-- path -->
      <path :d="`M72 ${Y} H${safety[2]}`" class="route safety" />
      <path :d="`M${safety[2]} ${Y} H834`" class="route private" />
      <circle cx="50" :cy="Y" r="22" class="user" /><text x="50" :y="Y + 4" text-anchor="middle" class="ip">you</text>
      <circle v-for="x in safety" :key="x" :cx="x" :cy="Y" r="13" class="hop" />
      <circle cx="720" :cy="Y" r="13" class="hop priv" />
      <circle cx="860" :cy="Y" r="26" class="user" /><text x="860" :y="Y + 4" text-anchor="middle" class="ip">friend</text>

      <a class="cite" :href="`${DC31}#page=30`" target="_blank" rel="noopener"><text x="370" :y="Y + 30" text-anchor="middle" class="edge">each hop knows only the next one</text></a>
      <a class="cite" :href="`${DC31}#page=29`" target="_blank" rel="noopener"><text x="615" :y="Y - 14" text-anchor="middle" class="edge">compiled route</text></a>
      <a class="cite" :href="`${B}docs/security/privacy-properties.md#L64-L69`" target="_blank" rel="noopener"><text x="895" :y="Y - 34" class="edge">only your friend’s node</text><text x="895" :y="Y - 16" class="edge">knows its own IP</text></a>
      <a class="cite" :href="`${DC31}#page=31`" target="_blank" rel="noopener"><text x="895" :y="Y + 26" class="edge">Veilid default:</text><text x="895" :y="Y + 44" class="edge">1 hop + 1 hop</text></a>

      <a class="cite" :href="`${B}docs/security/privacy-properties.md#L283-L288`" target="_blank" rel="noopener"><text x="0" y="494" class="leak-t">still visible: that your IP is talking to Veilid nodes</text></a>
    </g>

    <!-- ── Rekindle's choices on top ───────────────────────── -->
    <g class="rk" :class="{ show: $clicks >= 4 }">
      <a class="cite" :href="`${B}crates/rekindle-types/src/config/mod.rs#L13-L19`" target="_blank" rel="noopener"><text x="150" :y="Y + 64" class="rk-t">Rekindle: safety route never under 3 hops</text></a>
      <a class="cite" :href="`${B}crates/rekindle-protocol/src/dht/pool/safety.rs#L9-L25`" target="_blank" rel="noopener"><text x="150" :y="Y + 86" class="rk-t">messages, DHT reads/writes, voice frames</text></a>
      <a class="cite" :href="`${B}crates/rekindle-types/src/config/mod.rs#L130-L144`" target="_blank" rel="noopener"><text x="650" :y="Y + 64" class="rk-t">inbound: 1 hop today,</text><text x="650" :y="Y + 86" class="rk-t">3 being retested</text></a>
      <a class="cite" :href="`${B}docs/security/privacy-properties.md#L77-L80`" target="_blank" rel="noopener"><text x="895" :y="Y + 76" class="rk-t">no Rekindle STUN,</text><text x="895" :y="Y + 98" class="rk-t">TURN or relay servers</text></a>
    </g>
  </svg>
</template>

<style>
.who-sees { width: 100%; height: auto; font-family: 'DM Mono', monospace; overflow: visible; }
.who-sees .title { fill: var(--fog); font-size: 14px; letter-spacing: .22em; }
.who-sees .user { fill: var(--panel-solid); stroke: var(--text); stroke-width: 1.5; }
.who-sees .ip { fill: var(--text); font-size: 11px; }
.who-sees .wire { stroke: var(--line); stroke-width: 2; fill: none; transition: stroke .5s; }
.who-sees .wire.hot { stroke: var(--chiral); }
.who-sees .relay { fill: var(--panel-solid); stroke: var(--line); stroke-width: 1.5; transition: stroke .5s; }
.who-sees .relay.hot { stroke: var(--chiral); }
.who-sees .label { fill: var(--text); font-family: Barlow, sans-serif; font-size: 19px; }
.who-sees .sub { fill: var(--chiral); font-size: 13px; opacity: 0; transition: opacity .5s; }
.who-sees .sub.show { opacity: 1; }
.who-sees .fact { fill: var(--chiral); font-size: 15px; opacity: 0; transition: opacity .5s; }
.who-sees .fact.danger { fill: var(--danger); }
.who-sees .fact.show { opacity: 1; }
.who-sees .leak { opacity: 0; transition: opacity .5s; }
.who-sees .leak.show { opacity: 1; }
.who-sees .leak rect { fill: rgb(232 80 30 / 12%); stroke: var(--danger); stroke-width: 1.5; }
.who-sees .leak .sub { fill: var(--danger); }
.who-sees .wire.leaky { stroke: var(--danger); stroke-dasharray: 5 6; }
.who-sees .divider { stroke: var(--line); stroke-dasharray: 2 8; }
.who-sees .veilid, .who-sees .rk { opacity: 0; transition: opacity .7s; }
.who-sees .veilid.show, .who-sees .rk.show { opacity: 1; }
.who-sees .route { fill: none; stroke-width: 2.5; animation: who-pulse 1.4s linear infinite; stroke: var(--veilid); }
.who-sees .route.safety { stroke-dasharray: 7 6; }
.who-sees .route.private { stroke-dasharray: 2 6; }
.who-sees .hop { fill: var(--panel-solid); stroke: var(--veilid); stroke-width: 2; }
.who-sees .bracket { fill: none; stroke: var(--veilid); stroke-width: 1.5; }
.who-sees .route-t { fill: var(--veilid); font-size: 14px; letter-spacing: .06em; }
.who-sees .edge { fill: var(--veilid); font-size: 14px; }
.who-sees .rk-t { fill: var(--bridges); font-size: 15px; }
.who-sees .leak-t { fill: var(--danger); font-size: 14px; }
@keyframes who-pulse { to { stroke-dashoffset: -26; } }
</style>
