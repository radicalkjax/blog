<script setup>
import { useSlideContext } from '@slidev/client'

// Slide sets `clicks: 3`. 1: shared slot keys · 2: someone writes your slot at MAX · 3: genesis locked, nobody joins.
const { $clicks } = useSlideContext()
const cols = 24
const size = 22
const gap = 6
const count = 72
const pos = i => ({ x: (i % cols) * (size + gap), y: Math.floor(i / cols) * (size + gap) })
const mine = 29
</script>

<template>
  <div class="slot-lock">
    <svg :viewBox="`0 0 ${cols * (size + gap)} ${3 * (size + gap)}`">
      <rect v-for="i in count" :key="i" v-bind="pos(i - 1)" :width="size" :height="size" class="slot"
        :class="{
          filled: i % 3 !== 0,
          shared: $clicks >= 1,
          mine: i - 1 === mine,
          locked: ($clicks >= 2 && i - 1 === mine) || ($clicks >= 3 && i === 1),
        }" />
    </svg>
    <div class="lock-readout">
      <span v-if="$clicks < 1">one record · one subkey per member</span>
      <a v-else-if="$clicks < 2" class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0011-member-sovereign-records.md#L15-L20" target="_blank" rel="noopener"><span>every member can derive <b>every</b> slot’s write key</span></a>
      <a v-else-if="$clicks < 3" class="cite" href="https://veilid.gitlab.io/developer-book/print.html#:~:text=a%20subkey%20written%20there%20is%20closed" target="_blank" rel="noopener"><span>write your slot at <code>seq = u32::MAX − 1</code> → it can never be written again</span></a>
      <a v-else class="cite" href="https://github.com/ScopeCreep-zip/Rekindle/blob/82292f54170c4ecab7bdc394703c00ca48acb5ac/docs/decisions/0011-member-sovereign-records.md#L21-L28" target="_blank" rel="noopener"><span>do it to slot 0, the genesis → <b>nobody can ever join</b></span></a>
    </div>
  </div>
</template>

<style>
.slot-lock svg { width: 100%; height: auto; display: block; overflow: visible; }
.slot-lock .slot { fill: transparent; stroke: var(--fog-dim); stroke-width: 1.5; transition: fill .5s, stroke .5s; }
.slot-lock .slot.filled { fill: var(--bridges-deep); stroke: var(--bridges); }
.slot-lock .slot.shared { stroke-dasharray: 3 3; }
.slot-lock .slot.mine { fill: var(--chiral); stroke: var(--chiral); stroke-dasharray: none; }
.slot-lock .slot.locked { fill: var(--danger); stroke: var(--danger); stroke-dasharray: none; }
.slot-lock .lock-readout { margin-top: 22px; font: 21px 'DM Mono', monospace; color: var(--fog); min-height: 1.5em; }
.slot-lock .lock-readout b { color: var(--danger); font-weight: 500; }
.slot-lock .lock-readout code { color: var(--danger); background: rgb(232 80 30 / 12%); }
</style>
