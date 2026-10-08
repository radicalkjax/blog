<script setup>
import { computed, reactive } from 'vue'
const flags = reactive({ handshake: false, roster: false, mek: false, caps: false, config: false })
const checks = [
  ['handshake', 'Join handshake complete', 'handshake-announced'],
  ['roster', 'Another member in the roster', 'roster-empty'],
  ['mek', 'Media encryption key available', 'mek-missing'],
  ['caps', 'Local codec capabilities reported', 'caps-unreported'],
  ['config', 'Session configuration emitted', 'config-pending'],
]
const reason = computed(() => checks.find(([key]) => !flags[key])?.[2] || 'ready')
function reset() { for (const key of Object.keys(flags)) flags[key] = false }
</script>

<template>
  <div class="ready-demo" @click.stop>
    <p class="demo-caption">Try removing one prerequisite.</p>
    <label v-for="[key, label] in checks" :key="key">
      <input v-model="flags[key]" type="checkbox">
      <span>{{ label }}</span>
    </label>
    <output :data-ready-state="reason" :class="{ ready: reason === 'ready' }">{{ reason }}</output>
    <button type="button" @click="reset">Reset</button>
    <p class="demo-footnote">Interactive illustration of the checks; no live media connection.</p>
  </div>
</template>
