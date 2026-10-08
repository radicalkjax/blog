<script setup>
import { computed, reactive } from 'vue'

// Mirrors MediaReadyInputs::block_reason (rekindle-voice/src/media_ready.rs): checked in this order.
const flags = reactive({ handshake: false, roster: false, caps: false, config: false })
const checks = [
  ['handshake', 'Join handshake connected', 'handshake-seen'],
  ['roster', 'Another member in the channel roster', 'roster-empty'],
  ['caps', 'WebCodecs caps reported', 'caps-unreported'],
  ['config', 'Negotiated session config emitted', 'config-pending'],
]
const reason = computed(() => checks.find(([key]) => !flags[key])?.[2] || 'ready')
// The first failing row is the one block_reason reports.
const firstFail = computed(() => checks.find(([key]) => !flags[key])?.[0])
function reset() {
  for (const key of Object.keys(flags)) flags[key] = false
}
</script>

<template>
  <div class="ready-demo panel" @click.stop @keydown.stop>
    <p class="demo-caption">Bring the session up · then break it</p>
    <label v-for="[key, label, code] in checks" :key="key" :class="{ blocking: firstFail === key }">
      <input v-model="flags[key]" type="checkbox">
      <span>{{ label }}</span>
      <em>{{ flags[key] ? '✓' : code }}</em>
    </label>
    <output :data-ready-state="reason" :class="{ ready: reason === 'ready' }">{{ reason }}</output>
    <p class="demo-footnote">Illustration of the gate’s logic — no live media. <a href="#" @click.prevent="reset">Reset</a></p>
  </div>
</template>

<style>
.chiral .ready-demo label em { margin-left: auto; font: normal 14px 'DM Mono', monospace; color: var(--fog); white-space: nowrap; }
.chiral .ready-demo label:has(input:checked) em { color: #9be3a4; }
.chiral .ready-demo label.blocking em { color: var(--danger); }
</style>
