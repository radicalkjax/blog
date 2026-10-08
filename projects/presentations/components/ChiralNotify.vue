<script setup>
import { useSlideContext } from '@slidev/client'

// Slide sets `clicks: 3`. 1: write the record · 2: gossip the notice · 3: fetch, check, decrypt.
// Field names are the real ones: ChannelMessage (channel_record/types.rs) and
// CommunityEnvelope::MessageNotification (rekindle-channel/src/pipeline.rs).
const { $clicks } = useSlideContext()
const lanes = [
  { x: 100, title: 'ALICE’S DEVICE', by: 'REKINDLE', cls: 'rk' },
  { x: 420, title: 'CHANNEL DHT RECORD', by: 'VEILID', cls: 'veilid' },
  { x: 760, title: 'MEMBERS ONLINE', by: 'REKINDLE GOSSIP', cls: 'rk' },
  { x: 1060, title: 'BOB’S DEVICE', by: 'REKINDLE', cls: 'rk' },
]
</script>

<template>
  <svg class="msg-seq" viewBox="0 0 1148 478" role="img" aria-label="Alice encrypts a message and writes it to her subkey of the channel's Veilid DHT record; Rekindle gossips a small notice with the ciphertext hash to online members; Bob fetches the ciphertext from the record, checks the hash, validates the author and decrypts.">
    <g v-for="lane in lanes" :key="lane.x">
      <text :x="lane.x" y="22" text-anchor="middle" class="lane-title">{{ lane.title }}</text>
      <text :x="lane.x" y="46" text-anchor="middle" class="lane-by" :class="lane.cls">{{ lane.by }}</text>
      <line :x1="lane.x" :x2="lane.x" y1="60" y2="430" class="lane" />
    </g>

    <!-- 1 · Alice encrypts and writes her subkey -->
    <g class="step" :class="{ on: $clicks >= 1 }">
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/security/overview.md#L19-L22" target="_blank" rel="noopener"><text x="118" y="92" class="note"><tspan class="num">① </tspan>encrypt: AES-256-GCM, channel key gen N</text></a>
      <line x1="100" x2="410" y1="114" y2="114" class="arrow write" />
      <path d="M398 105 L412 114 L398 123" class="head write" />
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L87-L113" target="_blank" rel="noopener"><text x="118" y="146" class="payload">set_dht_value(her subkey) ←</text></a>
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-codec/src/community/channel_record/types.rs#L8-L28" target="_blank" rel="noopener"><text x="118" y="170" class="payload">{ ciphertext, sender_pseudonym, sequence, lamport_ts }</text></a>
    </g>

    <!-- 2 · gossip the notice -->
    <g class="step" :class="{ on: $clicks >= 2 }">
      <text x="118" y="214" class="note"><tspan class="num">② </tspan>gossip a notice, not the message</text>
      <line x1="100" x2="1050" y1="234" y2="234" class="arrow gossip" />
      <path d="M1038 225 L1052 234 L1038 243" class="head gossip" />
      <circle cx="760" cy="234" r="7" class="hop" />
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-channel/src/pipeline.rs#L56-L75" target="_blank" rel="noopener"><text x="118" y="264" class="payload cyan">MessageNotification { channel_id, message_id,</text></a>
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-channel/src/pipeline.rs#L56-L75" target="_blank" rel="noopener"><text x="118" y="288" class="payload cyan">subkey_index, sequence, content_hash = blake3(ciphertext) }</text></a>
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-gossip/src/mesh.rs#L11-L25" target="_blank" rel="noopener"><text x="778" y="264" class="note">fan-out ≤ 6 peers · TTL 5 hops</text></a>
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-gossip/src/broadcast.rs#L1-L12" target="_blank" rel="noopener"><text x="778" y="288" class="note">dedup cache · no message body</text></a>
    </g>

    <!-- 3 · Bob fetches, checks, decrypts -->
    <g class="step" :class="{ on: $clicks >= 3 }">
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/architecture/communities-overview.md#L87-L113" target="_blank" rel="noopener"><text x="440" y="324" class="note"><tspan class="num">③ </tspan>get_dht_value(subkey_index) → ciphertext</text></a>
      <line x1="1060" x2="430" y1="344" y2="344" class="arrow fetch" />
      <path d="M442 335 L428 344 L442 353" class="head fetch" />
      <text x="1140" y="378" text-anchor="end" class="check">✓ blake3(ciphertext) == content_hash</text>
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-channel/src/pipeline.rs#L116-L132" target="_blank" rel="noopener"><text x="1140" y="402" text-anchor="end" class="check">✓ author allowed to post (governance)</text></a>
      <a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-codec/src/community/channel_record/types.rs#L16-L20" target="_blank" rel="noopener"><text x="1140" y="426" text-anchor="end" class="check">✓ decrypt with channel key gen N</text></a>
    </g>

    <text x="0" y="470" class="backstop" :class="{ on: $clicks >= 3 }"><a class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/crates/rekindle-sync/src/inspect.rs#L1-L14" target="_blank" rel="noopener">missed the notice? a Veilid watch on the record, plus a 60 s inspect poll, still finds it</a></text>
  </svg>
</template>

<style>
.msg-seq { width: 100%; height: auto; overflow: visible; font-family: 'DM Mono', monospace; }
.msg-seq .lane-title { fill: var(--text); font-size: 17px; letter-spacing: .12em; }
.msg-seq .lane-by { font-size: 13px; letter-spacing: .16em; }
.msg-seq .lane-by.rk { fill: var(--bridges); }
.msg-seq .lane-by.veilid { fill: var(--veilid); }
.msg-seq .lane { stroke: var(--line); stroke-width: 1.5; stroke-dasharray: 3 7; }
.msg-seq .step { opacity: 0; transition: opacity .5s; }
.msg-seq .step.on { opacity: 1; }
.msg-seq .num { fill: var(--chiral); }
.msg-seq .hop { fill: var(--panel-solid); stroke: var(--bridges); stroke-width: 2; }
.msg-seq .note { fill: var(--fog); font-size: 16px; }
.msg-seq .payload { fill: var(--text); font-size: 17px; }
.msg-seq .payload.cyan { fill: var(--bridges); }
.msg-seq .check { fill: var(--moss, #9fc28a); font-size: 17px; }
.msg-seq .arrow { fill: none; stroke-width: 2.5; }
.msg-seq .head { fill: none; stroke-width: 2.5; }
.msg-seq .write { stroke: var(--chiral); }
.msg-seq .fetch { stroke: var(--chiral); stroke-dasharray: 8 6; }
.msg-seq .gossip { stroke: var(--bridges); stroke-dasharray: 6 8; }
.msg-seq .arrow.gossip { animation: msg-pulse 1.2s linear infinite; }
.msg-seq .backstop { fill: var(--fog); font-size: 16px; opacity: 0; transition: opacity .5s; }
.msg-seq .backstop.on { opacity: 1; }
@keyframes msg-pulse { to { stroke-dashoffset: -28; } }
</style>
