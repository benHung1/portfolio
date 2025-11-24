<script setup lang="ts">
import { ref, watch } from "vue";
import { gsap } from "gsap";
import type { PlanetContent } from "../types/planetContent";

const props = defineProps<{
  content: PlanetContent | null;
  visible: boolean;
  position?: { x: number; y: number };
}>();

const emit = defineEmits<{
  close: [];
  prev: [];
  next: [];
  navigateTo: [planetId: string];
}>();

const panelRef = ref<HTMLElement | null>(null);

// 當內容變化時，播放動畫
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && panelRef.value) {
      gsap.fromTo(
        panelRef.value,
        {
          opacity: 0,
          y: 50,
          scale: 0.9,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          ease: "power3.out",
        }
      );
    }
  }
);

// 當內容變化時，淡出再淡入
watch(
  () => props.content,
  (newContent, oldContent) => {
    if (panelRef.value && newContent && oldContent) {
      gsap.to(panelRef.value, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => {
          if (panelRef.value) {
            gsap.to(panelRef.value, {
              opacity: 1,
              duration: 0.3,
            });
          }
        },
      });
    }
  }
);

const handleClose = () => {
  emit("close");
};

// 處理連結點擊
const handleLinkClick = (
  link: { label: string; url: string },
  event: MouseEvent
) => {
  // 如果是「查看更多」按鈕，切換到下一個面板
  if (link.label === "查看更多") {
    event.preventDefault();
    emit("next");
  }
  // 如果是「查看工作經歷」按鈕，導航到工作經驗（mars）
  else if (link.label === "查看工作經歷") {
    event.preventDefault();
    emit("navigateTo", "mars");
  }
  // 如果是「查看作品集」或「查看所有作品」按鈕，導航到作品展示（saturn）
  else if (link.label === "查看作品集" || link.label === "查看所有作品") {
    event.preventDefault();
    emit("navigateTo", "saturn");
  }
  // 其他連結保持原有行為（跳轉）
};
</script>

<template>
  <Transition name="panel">
    <div
      v-if="visible && content"
      ref="panelRef"
      class="planet-info-panel fixed w-[420px] max-w-[calc(100vw-2rem)] bg-gradient-to-b from-black/40 via-black/30 to-black/40 backdrop-blur-xl border rounded-3xl shadow-2xl z-50 overflow-visible"
      :style="{
        borderColor: content.color
          ? `${content.color}60`
          : 'rgba(255,255,255,0.2)',
        left: props.position ? `${props.position.x}px` : 'auto',
        top: props.position ? `${props.position.y}px` : 'auto',
        transform: props.position ? 'translate(-50%, -50%)' : 'none',
        right: props.position ? 'auto' : '2rem',
        marginTop: props.position ? '0' : '2rem',
        boxShadow: content.color
          ? `0 20px 60px ${content.color}30, 0 0 40px ${content.color}20`
          : '0 20px 60px rgba(0,0,0,0.5)',
      }"
      @click.stop>
      <!-- 頂部裝飾條 -->
      <div
        class="h-1 w-full"
        :style="{
          background: content.color
            ? `linear-gradient(90deg, transparent, ${content.color}, transparent)`
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }"></div>

      <!-- 關閉按鈕 -->
      <button
        @click="handleClose"
        class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 z-10 group">
        <svg
          class="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-200"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- 內容區域 -->
      <div class="p-8">
        <!-- 頭像（如果有） -->
        <div v-if="content.avatar" class="flex justify-center mb-6">
          <div
            class="relative w-24 h-24 rounded-full overflow-hidden border-4"
            :style="{
              borderColor: content.color || 'rgba(255,255,255,0.3)',
              boxShadow: content.color
                ? `0 0 30px ${content.color}50, inset 0 0 20px ${content.color}20`
                : '0 0 30px rgba(255,255,255,0.2)',
            }">
            <img
              :src="content.avatar"
              :alt="content.title"
              class="w-full h-full object-cover" />
            <!-- 發光效果 -->
            <div
              class="absolute inset-0 rounded-full pointer-events-none"
              :style="{
                boxShadow: content.color
                  ? `inset 0 0 20px ${content.color}30`
                  : 'inset 0 0 20px rgba(255,255,255,0.1)',
              }"></div>
          </div>
        </div>

        <!-- 標題區域 -->
        <div class="text-center mb-6">
          <h2
            class="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            :style="{
              backgroundImage: content.color
                ? `linear-gradient(135deg, ${content.color}, ${content.color}cc)`
                : 'linear-gradient(135deg, #fff, #ccc)',
            }">
            {{ content.title }}
          </h2>
          <p
            v-if="content.subtitle"
            class="text-gray-400 text-sm uppercase tracking-wider">
            {{ content.subtitle }}
          </p>
        </div>

        <!-- 描述 -->
        <p class="text-gray-300 mb-6 leading-relaxed text-sm">
          {{ content.description }}
        </p>

        <!-- 勵志名言（如果有） -->
        <div
          v-if="content.quote"
          class="mb-6 p-4 rounded-xl border-l-4"
          :style="{
            borderColor: content.color || 'rgba(255,255,255,0.3)',
            backgroundColor: content.color
              ? `${content.color}10`
              : 'rgba(255,255,255,0.05)',
          }">
          <p class="text-white/90 italic text-center text-sm">
            "{{ content.quote }}"
          </p>
        </div>

        <!-- 詳細資訊 -->
        <div
          v-if="content.details && content.details.length > 0"
          class="mb-6 space-y-3">
          <div
            v-for="(detail, index) in content.details"
            :key="index"
            class="flex justify-between items-center py-2 px-3 rounded-lg border"
            :style="{
              borderColor: content.color
                ? `${content.color}30`
                : 'rgba(255,255,255,0.1)',
              backgroundColor: content.color
                ? `${content.color}05`
                : 'rgba(255,255,255,0.02)',
            }">
            <span class="text-gray-400 text-xs">{{ detail.label }}</span>
            <span class="text-white font-medium text-sm">{{
              detail.value
            }}</span>
          </div>
        </div>

        <!-- 連結按鈕 -->
        <div
          v-if="content.links && content.links.length > 0"
          class="flex flex-col gap-3 mb-6">
          <a
            v-for="(link, index) in content.links"
            :key="index"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg text-center cursor-pointer"
            :style="{
              backgroundColor: content.color
                ? `${content.color}20`
                : 'rgba(255,255,255,0.1)',
              color: content.color || '#fff',
              border: `1px solid ${
                content.color ? content.color + '40' : 'rgba(255,255,255,0.2)'
              }`,
              boxShadow: content.color
                ? `0 4px 15px ${content.color}20`
                : '0 4px 15px rgba(0,0,0,0.2)',
            }"
            @click="handleLinkClick(link, $event)">
            {{ link.label }}
          </a>
        </div>

        <!-- 中間導航箭頭（超出卡片範圍） -->
        <div class="arrow-content">
          <!-- 左箭頭（在卡片左側外面） -->
          <button
            @click.stop="emit('prev')"
            class="arrow-button arrow-left w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 group"
            :style="{
              backgroundColor: content.color
                ? `${content.color}30`
                : 'rgba(255,255,255,0.15)',
              border: `2px solid ${
                content.color ? content.color + '60' : 'rgba(255,255,255,0.3)'
              }`,
              boxShadow: content.color
                ? `0 4px 20px ${content.color}40`
                : '0 4px 20px rgba(255,255,255,0.1)',
            }">
            <svg
              class="w-6 h-6 text-white group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- 右箭頭（在卡片右側外面） -->
          <button
            @click.stop="emit('next')"
            class="arrow-button arrow-right w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 group"
            :style="{
              backgroundColor: content.color
                ? `${content.color}30`
                : 'rgba(255,255,255,0.15)',
              border: `2px solid ${
                content.color ? content.color + '60' : 'rgba(255,255,255,0.3)'
              }`,
              boxShadow: content.color
                ? `0 4px 20px ${content.color}40`
                : '0 4px 20px rgba(255,255,255,0.1)',
            }">
            <svg
              class="w-6 h-6 text-white group-hover:translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 底部裝飾 -->
      <div
        class="h-1 w-full"
        :style="{
          background: content.color
            ? `linear-gradient(90deg, transparent, ${content.color}, transparent)`
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        }"></div>
    </div>
  </Transition>
</template>

<style scoped>
.panel-enter-active,
.panel-leave-active {
  transition: all 0.3s ease;
}

.panel-enter-from {
  opacity: 0;
  transform: translate(-50%, -60%) scale(0.9);
}

.panel-leave-to {
  opacity: 0;
  transform: translate(-50%, -60%) scale(0.9);
}

/* 當沒有 position 時，使用不同的動畫 */
.planet-info-panel:not([style*="translate(-50%, -50%)"]) .panel-enter-from {
  transform: translateY(20px) scale(0.95);
}

.planet-info-panel:not([style*="translate(-50%, -50%)"]) .panel-leave-to {
  transform: translateY(20px) scale(0.95);
}

.arrow-content {
  position: absolute;
  left: 0;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
  pointer-events: none;
}

.arrow-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: auto;
  z-index: 10;
}

.arrow-left {
  left: -50px; /* 超出卡片左側 10px（按鈕寬度40px + 10px間距） */
}

.arrow-right {
  right: -50px; /* 超出卡片右側 10px（按鈕寬度40px + 10px間距） */
}
</style>
