<script setup>
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import logo from '../svgfiles/sitelogo.png'
const props = defineProps({ class: String, footer: { default: true }, paginate: { default: true } })
const { $slidev, $page } = useSlideContext()
const showLogo = computed(() => (props.class || '').split(' ').includes('with-logo'))
</script>

<template>
  <div class="slidev-layout radicalkjax" :class="props.class">
    <img v-if="showLogo" class="deck-logo" :src="logo" alt="">
    <div class="deck-content"><slot /></div>
    <footer v-if="footer !== false" class="deck-footer">Made with ❤️ by Kali</footer>
    <div v-if="paginate !== false" class="deck-pagination">{{ $page }} / {{ $slidev.nav.total }}</div>
  </div>
</template>
