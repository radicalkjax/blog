<script setup>
import { computed } from 'vue'
import '../styles/chiral.css'
import { route, chapterIndex } from '../setup/route.js'

// Landscape backgrounds live in assets/bg; slides pick one with `bg: <name>`.
const backgrounds = import.meta.glob('../assets/bg/*.jpg', { eager: true, import: 'default' })

const props = defineProps({
  chapter: { default: 'intro' },
  bg: String,
  bgPosition: { default: 'center' },
  // left: text on a dark left side · full: even darkening · divider: light grade · none
  scrim: { default: 'full' },
  class: String,
})

const bgUrl = computed(() => props.bg && backgrounds[`../assets/bg/${props.bg}.jpg`])
const stop = computed(() => route[chapterIndex(props.chapter)])
const order = computed(() => String(chapterIndex(props.chapter)).padStart(2, '0'))
</script>

<template>
  <div class="slidev-layout chiral" :class="[props.class, { 'has-bg': bgUrl }]">
    <div v-if="bgUrl" class="chiral-bg" :style="{ backgroundImage: `url(${bgUrl})`, backgroundPosition: props.bgPosition }" />
    <div v-if="bgUrl" class="chiral-scrim" :class="`scrim-${props.scrim}`" />
    <div class="chiral-grain" />
    <header class="chiral-header">
      <span class="chiral-order">{{ order }}</span>
      <span class="chiral-rule" />
      <span>{{ stop.label.toUpperCase() }}</span>
    </header>
    <main class="chiral-content"><slot /></main>
  </div>
</template>
