<script setup>
import { useSlideContext } from '@slidev/client'

// Slide sets `clicks: 3`: one click per intent.
const { $clicks } = useSlideContext()
const steps = [
  { y: 110, from: 'a', label: '1 · A proposes', note: 'pending — nothing changes yet' },
  { y: 220, from: 'b', label: '2 · B accepts', note: 'B consents to the exact proposal' },
  { y: 330, from: 'a', label: '3 · A authorizes completion', note: 'A + B: both people chose this' },
]
</script>

<template>
  <svg class="intent-steps" viewBox="0 0 1148 400" role="img" aria-label="Three step intent: A proposes, B accepts, A authorizes completion">
    <text x="190" y="40" text-anchor="middle" class="who">PERSON A</text>
    <text x="958" y="40" text-anchor="middle" class="who">PERSON B</text>
    <line x1="190" x2="190" y1="60" y2="380" class="lane" />
    <line x1="958" x2="958" y1="60" y2="380" class="lane" />
    <g v-for="(step, i) in steps" :key="i" class="step" :class="{ on: $clicks > i }">
      <line :x1="step.from === 'a' ? 200 : 948" :x2="step.from === 'a' ? 940 : 208" :y1="step.y" :y2="step.y" class="arrow" />
      <path :d="step.from === 'a' ? `M928 ${step.y - 8} L942 ${step.y} L928 ${step.y + 8}` : `M220 ${step.y - 8} L206 ${step.y} L220 ${step.y + 8}`" class="head" />
      <circle :cx="step.from === 'a' ? 190 : 958" :cy="step.y" r="9" class="dot" />
      <text x="574" :y="step.y - 16" text-anchor="middle" class="label">{{ step.label }}</text>
      <text x="574" :y="step.y + 30" text-anchor="middle" class="note">{{ step.note }}</text>
    </g>
  </svg>
</template>

<style>
.intent-steps { width: 100%; height: auto; font-family: 'DM Mono', monospace; }
.intent-steps .who { fill: var(--text); font-size: 16px; letter-spacing: .2em; }
.intent-steps .lane { stroke: var(--line); stroke-width: 1.5; stroke-dasharray: 4 8; }
.intent-steps .step { opacity: 0; transition: opacity .5s; }
.intent-steps .step.on { opacity: 1; }
.intent-steps .arrow { stroke: var(--bridges); stroke-width: 2.5; stroke-dasharray: 740; stroke-dashoffset: 740; transition: stroke-dashoffset .9s ease-out; }
.intent-steps .step.on .arrow { stroke-dashoffset: 0; }
.intent-steps .head { fill: none; stroke: var(--bridges); stroke-width: 2.5; }
.intent-steps .dot { fill: var(--chiral); }
.intent-steps .label { fill: var(--text); font-family: Jost, sans-serif; font-size: 25px; }
.intent-steps .note { fill: var(--fog); font-size: 15px; letter-spacing: .04em; }
</style>
