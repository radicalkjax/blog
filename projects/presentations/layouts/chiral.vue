<script setup>
import { useSlideContext } from '@slidev/client'
import '../styles/chiral.css'
defineProps({ chapter: { default: 'REKINDLE' }, class: String })
const { $page, $slidev } = useSlideContext()
</script>

<template>
  <div class="slidev-layout chiral" :class="class">
    <header class="chiral-header"><span>REKINDLE</span><span>{{ chapter }}</span></header>
    <main class="chiral-content"><slot /></main>
    <footer class="chiral-footer"><span>KALI JACKSON · @RADICALKJAX</span><span>{{ $page }} / {{ $slidev.nav.total }}</span></footer>
  </div>
</template>
