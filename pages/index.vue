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
  // 立即在背景開始加載 MenuScene（但先隱藏）
  showScene.value = true;
};

const handleSceneReady = () => {
  // 當 MenuScene 準備好後，等待至少 3 秒讓動畫執行
  // 然後才隱藏 LandingPage，確保動畫有足夠時間展示
  setTimeout(() => {
    showLanding.value = false;
  }, 3000);
};
</script>

<template>
  <div class="page-container">
    <!-- 入口畫面 -->
    <Transition name="fade">
      <LandingPage v-if="showLanding" @start="handleStart" />
    </Transition>

    <!-- 3D Scene - Full Screen -->
    <div
      v-if="showScene"
      class="scene-container"
      :class="{ 'opacity-0': showLanding, 'opacity-100': !showLanding }"
      style="transition: opacity 0.3s ease-in">
      <client-only>
        <MenuScene
          :menu-items="menuItems"
          :auto-open-earth="true"
          @select="handleSelect"
          @ready="handleSceneReady" />
      </client-only>
    </div>
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
