<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";

const isMobile = ref(false);

const updateIsMobile = () => {
  if (typeof window !== "undefined") {
    isMobile.value = window.innerWidth < 768;
  }
};

onMounted(() => {
  updateIsMobile();
  window.addEventListener("resize", updateIsMobile);
});

onUnmounted(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("resize", updateIsMobile);
  }
});

const shouldShow = computed(() => isMobile.value);
</script>

<template>
  <client-only>
    <Transition
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform opacity-0 -translate-y-4"
      enter-to-class="transform opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform opacity-100 translate-y-0"
      leave-to-class="transform opacity-0 -translate-y-4">
      <div
        v-if="shouldShow"
        class="fixed z-[999] top-0 left-0 right-0 bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm border-b border-white/20 shadow-lg">
        <div class="p-[4px] text-center">
          <p class="text-white text-sm font-medium">
            建議使用電腦版體驗感較優！
          </p>
        </div>
      </div>
    </Transition>
  </client-only>
</template>

