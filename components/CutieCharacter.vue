<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const imageWrapperRef = ref<HTMLElement | null>(null);
const eyePosition = ref({ x: 0, y: 0 });

const handleMouseMove = (event: MouseEvent) => {
  if (!imageWrapperRef.value) return;

  const rect = imageWrapperRef.value.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  const mouseX = event.clientX - centerX;
  const mouseY = event.clientY - centerY;

  const maxMove = 2.5;
  const distance = Math.sqrt(mouseX * mouseX + mouseY * mouseY);
  const moveX =
    distance > 0 ? (mouseX / distance) * Math.min(distance * 0.15, maxMove) : 0;
  const moveY =
    distance > 0 ? (mouseY / distance) * Math.min(distance * 0.15, maxMove) : 0;

  eyePosition.value.x += (moveX - eyePosition.value.x) * 0.3;
  eyePosition.value.y += (moveY - eyePosition.value.y) * 0.3;
};

onMounted(() => {
  window.addEventListener("mousemove", handleMouseMove);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", handleMouseMove);
});
</script>

<template>
  <div
    ref="imageWrapperRef"
    class="image-wrapper w-[200px] h-[200px] m-auto relative">
    <img
      src="/cutie.png"
      alt="image"
      srcset="/cutie.png 1x"
      class="w-full h-full cutie-image rounded-full object-cover" />

    <div
      class="left-eye absolute top-[66px] left-[55px] w-[15px] h-[15px] rounded-full overflow-hidden"
      :style="{
        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
        willChange: 'transform',
        background:
          'radial-gradient(circle at 30% 30%, #87CEEB 0%, #4682B4 40%, #1E3A5F 70%, #0A1929 100%)',
        boxShadow:
          'inset 0 0 8px rgba(0, 0, 0, 0.5), 0 0 4px rgba(135, 206, 235, 0.3)',
      }">
      <!-- 高光點 -->
      <div
        class="absolute top-[3px] left-[4px] w-[4px] h-[4px] rounded-full bg-white opacity-80 eye-highlight"
        style="filter: blur(0.5px)"></div>
    </div>

    <div
      class="right-eye absolute top-[58px] right-[60px] w-[15px] h-[15px] rounded-full overflow-hidden"
      :style="{
        transform: `translate(${eyePosition.x}px, ${eyePosition.y}px)`,
        willChange: 'transform',
        background:
          'radial-gradient(circle at 30% 30%, #87CEEB 0%, #4682B4 40%, #1E3A5F 70%, #0A1929 100%)',
        boxShadow:
          'inset 0 0 8px rgba(0, 0, 0, 0.5), 0 0 4px rgba(135, 206, 235, 0.3)',
      }">
      <!-- 高光點 -->
      <div
        class="absolute top-[3px] left-[4px] w-[4px] h-[4px] rounded-full bg-white opacity-80 eye-highlight"
        style="filter: blur(0.5px)"></div>
    </div>
  </div>
</template>

<style scoped>
.image-wrapper {
  position: relative;
}

.cutie-image {
  animation: cutieGlow 3s ease-in-out infinite;
  opacity: 0.8;
}

.left-eye,
.right-eye {
  animation: eyeFade 1s ease-in-out infinite;
}

.eye-highlight {
  animation: eyeHighlightFade 1s ease-in-out infinite;
}

@keyframes cutieGlow {
  0%,
  100% {
    filter: brightness(1) drop-shadow(20px 20px 40px rgba(135, 206, 235, 0));
  }
  50% {
    filter: brightness(1.05)
      drop-shadow(10px 10px 20px rgba(135, 206, 235, 0.4));
  }
}

@keyframes cutieFade {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes eyeFade {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

@keyframes eyeHighlightFade {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 0.2;
  }
}
</style>
