<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { route, chapterIndex } from './setup/route.js'

// Per-slide (not global) so PDF export draws the right route state on every page.
// Only decks whose slides set `chapter` (the chiral deck) get the route.
const { $frontmatter, $page, $slidev } = useSlideContext()
const show = computed(() => Boolean($frontmatter?.chapter) && $frontmatter?.hud !== false)
const here = computed(() => chapterIndex($frontmatter?.chapter))

const left = 66
const right = 1100
const x = i => left + (right - left) * (i / (route.length - 1))
</script>

<template>
  <svg v-if="show" class="route-hud" viewBox="0 0 1280 48" aria-hidden="true">
    <line :x1="left" :x2="x(here)" y1="22" y2="22" class="route-done" />
    <line :x1="x(here)" :x2="right" y1="22" y2="22" class="route-ahead" />
    <g v-for="(stop, i) in route" :key="stop.key">
      <circle v-if="i < here" :cx="x(i)" cy="22" r="4" class="node-done" />
      <circle v-else-if="i > here" :cx="x(i)" cy="22" r="4" class="node-ahead" />
      <text v-if="i !== here" :x="x(i)" y="42" text-anchor="middle" class="node-label">{{ stop.short }}</text>
    </g>
    <g :transform="`translate(${x(here)} 22)`">
      <circle r="11" class="porter-ring" />
      <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" class="porter" />
      <text y="20" text-anchor="middle" class="node-label here">{{ route[here].short }}</text>
    </g>
    <text x="1214" y="27" text-anchor="end" class="hud-page">{{ String($page).padStart(2, '0') }} / {{ $slidev.nav.total }}</text>
  </svg>
</template>

<style>
.route-hud { position: absolute; left: 0; bottom: 6px; width: 1280px; height: 48px; pointer-events: none; z-index: 10; font-family: 'DM Mono', monospace; }
.route-hud .route-done { stroke: var(--bridges); stroke-width: 2; }
.route-hud .route-ahead { stroke: var(--fog-dim); stroke-width: 1.5; stroke-dasharray: 3 7; }
.route-hud .node-done { fill: var(--bridges); }
.route-hud .node-ahead { fill: var(--void); stroke: var(--fog-dim); stroke-width: 1.5; }
.route-hud .porter { fill: var(--chiral); }
.route-hud .porter-ring { fill: none; stroke: var(--chiral); stroke-width: 1; opacity: .6; }
.route-hud .node-label { font-size: 9px; letter-spacing: .14em; fill: var(--fog-dim); }
.route-hud .node-label.here { fill: var(--chiral); font-size: 10px; }
.route-hud .hud-page { font-size: 13px; letter-spacing: .1em; fill: var(--fog); }
</style>
