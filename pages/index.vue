<script setup lang="ts">
import { ref } from "vue";
import MenuScene from "@/components/MenuScene.vue";
import LandingPage from "@/components/LandingPage.vue";

const menuItems = [
  { id: "home", label: "Home", path: "/" },
  { id: "about", label: "About", path: "/about" },
  { id: "projects", label: "Projects", path: "/projects" },
  { id: "contact", label: "Contact", path: "/contact" },
] as const;

const selectedItem = ref<string | null>(null);
const showLanding = ref(true);
const showScene = ref(false);

const handleSelect = (item: string) => {
  selectedItem.value = item;
};

const handleStart = () => {
  showScene.value = true;
};

const handleSceneReady = () => {
  setTimeout(() => {
    showLanding.value = false;
  }, 3000);
};
</script>

<template>
  <div class="page-container">
    <Transition name="fade">
      <LandingPage v-if="showLanding" @start="handleStart" />
    </Transition>

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
