<script setup lang="ts">
import { pageMotionCopy } from '~/data/pageMotion';
const state = usePagePreparation();
const { locale } = usePortfolio();
const copy = computed(() => pageMotionCopy[locale.value]);
const app = useNuxtApp();
const skip = () => app.$pagePreparation?.skip();
</script>
<template>
  <div
    v-if="state.active"
    :key="state.run"
    class="brand-intro route-intro"
    :class="{ 'is-leaving': state.phase === 'leaving' }"
    :data-run="state.run"
    :data-progress="state.progress"
    role="dialog"
    aria-modal="true"
    :aria-label="copy.preparing"
    @keydown.esc="skip"
  >
    <div class="intro-geometry" aria-hidden="true">
      <span v-for="n in 3" :key="n" class="intro-shape"></span>
    </div>
    <span class="intro-word" aria-hidden="true">LOADING</span>
    <div class="intro-progress" :aria-label="copy.progress">
      <span aria-hidden="true">{{
        String(state.progress).padStart(3, '0')
      }}</span
      ><small> / 100</small>
    </div>
    <span class="intro-caption">{{ copy.preparing }}</span>
    <button class="intro-skip" @click="skip">
      {{ copy.skip }}<UiIcon name="right" />
    </button>
  </div>
</template>
