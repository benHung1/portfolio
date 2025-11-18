<script setup lang="ts">
import { ref } from 'vue'
import MenuScene from '~/components/MenuScene.vue'

const menuItems = [
  { id: 'home', label: 'Home', path: '/' },
  { id: 'about', label: 'About', path: '/about' },
  { id: 'projects', label: 'Projects', path: '/projects' },
  { id: 'contact', label: 'Contact', path: '/contact' },
]

const selectedItem = ref<string | null>(null)

function handleSelect(item: string) {
  selectedItem.value = item
}
</script>

<template>
  <div class="min-h-screen bg-black text-white relative overflow-hidden">
    <!-- 3D Scene - Full Screen -->
    <div class="fixed inset-0 w-full h-full">
      <client-only>
        <MenuScene :menu-items="menuItems" @select="handleSelect" />
      </client-only>
    </div>
  </div>
</template>

<style>
html {
  scroll-behavior: smooth;
}
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}
</style>
