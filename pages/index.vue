<script setup lang="ts">
// Imports
import { ref } from "vue";
import MenuScene from "@/components/MenuScene.vue";
import LandingPage from "@/components/LandingPage.vue";

// Constants
const menuItems = [
  { id: "home", label: "Home", path: "/" },
  { id: "about", label: "About", path: "/about" },
  { id: "projects", label: "Projects", path: "/projects" },
  { id: "contact", label: "Contact", path: "/contact" },
] as const;

const selectedItem = ref<string | null>(null);
const showLanding = ref(true);
const showScene = ref(false);

// Functions
const handleSelect = (item: string) => {
  selectedItem.value = item;
};

const handleStart = () => {
  showLanding.value = false;
  // 稍微延遲後顯示場景，讓過場動畫完成
  setTimeout(() => {
    showScene.value = true;
  }, 100);
};
</script>

<template>
  <div class="page-container">
    <!-- 入口畫面 -->
    <Transition name="fade">
      <LandingPage v-if="showLanding" @start="handleStart" />
    </Transition>

    <!-- 3D Scene - Full Screen -->
    <Transition name="fade">
      <div v-if="showScene" class="scene-container">
        <client-only>
          <MenuScene
            :menu-items="menuItems"
            :auto-open-earth="true"
            @select="handleSelect" />
        </client-only>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.page-container {
  @apply min-h-screen bg-black text-white relative overflow-hidden;
}

.scene-container {
  @apply fixed inset-0 w-full h-full;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
