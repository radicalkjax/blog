<script setup>
import { route } from '../setup/route.js'

// The agenda as a delivery route: contour lines, waypoints, destination.
const stops = route.slice(1)
const points = stops.map((_, i) => [70 + i * 112, 210 + Math.sin(i * 1.15) * 70])
const path = points.map(([x, y], i) => `${i ? 'L' : 'M'}${x} ${y}`).join(' ')
const contours = Array.from({ length: 7 }, (_, k) =>
  `M-20 ${70 + k * 52} C 220 ${20 + k * 60}, 420 ${150 + k * 40}, 640 ${80 + k * 50} S 1000 ${40 + k * 58}, 1180 ${110 + k * 46}`)
</script>

<template>
  <svg class="route-map" viewBox="0 0 1148 420" role="img" aria-label="Talk agenda drawn as a delivery route">
    <path v-for="(d, k) in contours" :key="k" :d="d" class="contour" />
    <path :d="path" class="route" />
    <g v-for="(stop, i) in stops" :key="stop.key">
      <circle :cx="points[i][0]" :cy="points[i][1]" r="7" :class="i === stops.length - 1 ? 'goal' : 'waypoint'" />
      <text :x="points[i][0]" :y="points[i][1] + (i % 2 ? 38 : -22)" text-anchor="middle" class="num">{{ String(i + 1).padStart(2, '0') }}</text>
      <text :x="points[i][0]" :y="points[i][1] + (i % 2 ? 62 : -46)" text-anchor="middle" class="name">{{ stop.label }}</text>
    </g>
    <g :transform="`translate(${points[0][0] - 60} ${points[0][1]})`">
      <rect x="-7" y="-7" width="14" height="14" transform="rotate(45)" class="porter" />
      <text y="34" text-anchor="middle" class="num">YOU ARE HERE</text>
    </g>
  </svg>
</template>

<style>
.route-map { width: 100%; height: auto; overflow: visible; }
.route-map .contour { fill: none; stroke: var(--moss); stroke-width: 1; opacity: .22; }
.route-map .route { fill: none; stroke: var(--bridges); stroke-width: 2; stroke-dasharray: 2 8; stroke-linecap: round; }
.route-map .waypoint { fill: var(--void); stroke: var(--bridges); stroke-width: 2; }
.route-map .goal { fill: var(--chiral); stroke: var(--chiral); stroke-width: 6; stroke-opacity: .3; }
.route-map .porter { fill: var(--chiral); }
.route-map .num { font: 12px 'DM Mono', monospace; letter-spacing: .16em; fill: var(--bridges); }
.route-map .name { font: 21px Jost, sans-serif; fill: var(--text); }
</style>
