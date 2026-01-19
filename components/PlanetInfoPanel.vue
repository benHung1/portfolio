<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { gsap } from "gsap";
import type { PlanetContent } from "@/types/planetContent";
import {
  LINK_IDS,
  PLANET_IDS,
  ANIMATION_CONFIG,
  PREVIEW_CONFIG,
} from "@/utils/constants";
import { getFileNameFromUrl, getLinkTarget, getLinkRel } from "@/utils/helpers";
import { useI18n } from "@/composables/useI18n";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

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

const { t } = useI18n();
const panelRef = ref<HTMLElement | null>(null);
const previewRef = ref<HTMLElement | null>(null);

const previewState = ref<{
  visible: boolean;
  x: number;
  y: number;
  project: {
    title: string;
    description?: string;
    image?: string;
  } | null;
}>({
  visible: false,
  x: 0,
  y: 0,
  project: null,
});

const linkIdToPlanetIdMap: Record<string, string> = {
  [LINK_IDS.VIEW_SKILLS]: PLANET_IDS.MERCURY,
  [LINK_IDS.VIEW_EXPERIENCE]: PLANET_IDS.MARS,
  [LINK_IDS.VIEW_PORTFOLIO]: PLANET_IDS.SATURN,
  [LINK_IDS.VIEW_CONTACT]: PLANET_IDS.CONTACT,
  [LINK_IDS.VIEW_REVIEWS]: PLANET_IDS.REVIEWS,
};

const isSupervisorColleagueReviews = computed(() => {
  if (!props.content?.advantages) return false;
  return (
    typeof props.content.advantages === "object" &&
    !Array.isArray(props.content.advantages) &&
    "supervisors" in props.content.advantages &&
    "colleagues" in props.content.advantages
  );
});

const supervisorReviews = computed(() => {
  if (!isSupervisorColleagueReviews.value || !props.content?.advantages) return [];
  const advantages = props.content.advantages as { supervisors: Array<{ name: string; role: string; avatar?: string; content: string }>; colleagues: Array<{ name: string; role: string; avatar?: string; content: string }> };
  return advantages.supervisors || [];
});

const colleagueReviews = computed(() => {
  if (!isSupervisorColleagueReviews.value || !props.content?.advantages) return [];
  const advantages = props.content.advantages as { supervisors: Array<{ name: string; role: string; avatar?: string; content: string }>; colleagues: Array<{ name: string; role: string; avatar?: string; content: string }> };
  return advantages.colleagues || [];
});

const swiperModules = [Autoplay];
const supervisorSwiperRef = ref<{ swiper: SwiperType } | null>(null);
const colleagueSwiperRef = ref<{ swiper: SwiperType } | null>(null);
const earthColor = '#4db2ff';

const pauseAutoplay = (type: 'supervisor' | 'colleague') => {
  const swiper = type === 'supervisor' 
    ? supervisorSwiperRef.value?.swiper 
    : colleagueSwiperRef.value?.swiper;
  if (swiper?.autoplay) {
    swiper.autoplay.pause();
  }
};

const resumeAutoplay = (type: 'supervisor' | 'colleague') => {
  const swiper = type === 'supervisor' 
    ? supervisorSwiperRef.value?.swiper 
    : colleagueSwiperRef.value?.swiper;
  if (swiper?.autoplay) {
    swiper.autoplay.resume();
  }
};

const coreValuesTitle = computed(() => {
  return props.content?.id === PLANET_IDS.CONTACT
    ? t.value.panel.expectations
    : t.value.panel.coreValues;
});

const featuredProjectsTitle = computed(() => t.value.panel.featuredProjects);

const handleClose = () => {
  emit("close");
};

const handleLinkClick = (
  link: { id?: string; label: string; url: string },
  event: MouseEvent
) => {
  if (!link.id) return;

  if (link.id === LINK_IDS.VIEW_SKILLS) {
    event.preventDefault();
    emit("next");
    return;
  }

  const planetId = linkIdToPlanetIdMap[link.id];
  if (planetId) {
    event.preventDefault();
    emit("navigateTo", planetId);
  }
};
const handleProjectHover = (event: MouseEvent, index: number) => {
  if (!props.content?.projects) return;

  const project = props.content.projects[index];
  if (!project) return;

  const targetX = event.clientX + PREVIEW_CONFIG.OFFSET_X;
  const targetY = event.clientY + PREVIEW_CONFIG.OFFSET_Y;

  previewState.value = {
    visible: true,
    x: targetX,
    y: targetY,
    project: {
      title: project.title,
      description: project.description,
      image: project.image,
    },
  };

  if (previewRef.value) {
    gsap.set(previewRef.value, {
      left: targetX,
      top: targetY,
      xPercent: -50,
      yPercent: -50,
    });

    gsap.fromTo(
      previewRef.value,
      { opacity: 0, scale: 0.8 },
      ANIMATION_CONFIG.PREVIEW_SHOW
    );
  }
};

const handleProjectLeave = (event: MouseEvent) => {
  if (previewRef.value) {
    const card = previewRef.value.querySelector(".preview-card") as HTMLElement;
    if (card) {
      const rect = card.getBoundingClientRect();
      if (
        event.clientX >= rect.left &&
        event.clientX <= rect.right &&
        event.clientY >= rect.top &&
        event.clientY <= rect.bottom
      ) {
        return;
      }
    }
  }
  hidePreview();
};

const hidePreview = () => {
  if (previewRef.value) {
    const card = previewRef.value.querySelector(".preview-card") as HTMLElement;
    if (card) {
      gsap.to(card, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.2,
        ease: "power2.out",
      });
    }

    gsap.to(previewRef.value, {
      ...ANIMATION_CONFIG.PREVIEW_HIDE,
      onComplete: () => {
        previewState.value.visible = false;
        previewState.value.project = null;
      },
    });
  } else {
    previewState.value.visible = false;
    previewState.value.project = null;
  }
};

const handleProjectMove = (event: MouseEvent) => {
  if (!previewState.value.visible || !previewRef.value) return;

  const card = previewRef.value.querySelector(".preview-card") as HTMLElement;
  if (card) {
    const cardRect = card.getBoundingClientRect();
    if (
      event.clientX >= cardRect.left &&
      event.clientX <= cardRect.right &&
      event.clientY >= cardRect.top &&
      event.clientY <= cardRect.bottom
    ) {
      return;
    }
  }

  let targetX = event.clientX + PREVIEW_CONFIG.OFFSET_X;
  let targetY = event.clientY + PREVIEW_CONFIG.OFFSET_Y;
  const { WIDTH: previewWidth, HEIGHT: previewHeight, OFFSET_X, OFFSET_Y } = PREVIEW_CONFIG;

  if (targetX + previewWidth / 2 > window.innerWidth) {
    targetX = event.clientX - OFFSET_X - previewWidth / 2;
  }
  if (targetY + previewHeight / 2 > window.innerHeight) {
    targetY = event.clientY - OFFSET_Y - previewHeight / 2;
  }
  if (targetX - previewWidth / 2 < 0) {
    targetX = previewWidth / 2;
  }
  if (targetY - previewHeight / 2 < 0) {
    targetY = previewHeight / 2;
  }

  previewState.value.x = targetX;
  previewState.value.y = targetY;

  gsap.to(previewRef.value, {
    left: targetX,
    top: targetY,
    duration: 0.2,
    ease: "power1.out",
  });
};

const handlePreviewLeave = () => {
  hidePreview();
};

const handlePreviewMove = (event: MouseEvent) => {
  if (!previewRef.value) return;

  const card = previewRef.value.querySelector(".preview-card") as HTMLElement;
  if (!card) return;

  const rect = card.getBoundingClientRect();
  const cardCenterX = rect.left + rect.width / 2;
  const cardCenterY = rect.top + rect.height / 2;

  const mouseX = event.clientX - cardCenterX;
  const mouseY = event.clientY - cardCenterY;
  const relativeX = mouseX / (rect.width / 2);
  const relativeY = mouseY / (rect.height / 2);

  const maxMove = 15;
  const maxRotate = 5;

  gsap.to(card, {
    x: relativeX * maxMove,
    y: relativeY * maxMove,
    rotateX: -relativeY * maxRotate,
    rotateY: relativeX * maxRotate,
    duration: 0.3,
    ease: "power1.out",
    transformPerspective: 1000,
  });
};
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && panelRef.value) {
      gsap.fromTo(
        panelRef.value,
        ANIMATION_CONFIG.PANEL_ENTER,
        ANIMATION_CONFIG.PANEL_ENTER_TO
      );
    }
  }
);

watch(
  () => props.content,
  (newContent, oldContent) => {
    if (panelRef.value && newContent && oldContent) {
      gsap.to(panelRef.value, {
        ...ANIMATION_CONFIG.PANEL_FADE_OUT,
        onComplete: () => {
          if (panelRef.value) {
            gsap.to(panelRef.value, ANIMATION_CONFIG.PANEL_FADE_IN);
          }
        },
      });
    }
    hidePreview();
  }
);

watch(
  () => props.visible,
  (newVal) => {
    if (!newVal) {
      hidePreview();
    }
  }
);
</script>

<template>
  <Transition name="panel">
    <div
      v-if="visible && content"
      ref="panelRef"
      class="planet-info-panel fixed w-[calc(100vw-1rem)] sm:w-[420px] max-w-[calc(100vw-2rem)] h-[90vh] max-h-[90vh] bg-gradient-to-b from-black/40 via-black/30 to-black/40 backdrop-blur-xl border rounded-2xl sm:rounded-3xl shadow-2xl z-50 overflow-visible flex flex-col"
      :style="{
        borderColor: content.color
          ? `${content.color}60`
          : 'rgba(255,255,255,0.2)',
        left: props.position ? `${props.position.x}px` : 'auto',
        top: props.position ? `${props.position.y}px` : 'auto',
        transform: props.position ? 'translate(-50%, -50%)' : 'none',
        right: props.position ? 'auto' : 'clamp(0.5rem, 2rem, 2rem)',
        marginTop: props.position ? '0' : 'clamp(0.5rem, 2rem, 2rem)',
        boxShadow: content.color
          ? `0 20px 60px ${content.color}30, 0 0 40px ${content.color}20`
          : '0 20px 60px rgba(0,0,0,0.5)',
      }"
      @click.stop
      @touchstart.stop.passive
      @touchmove.stop.passive
      @touchend.stop.passive>
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
        class="absolute top-3 right-3 sm:top-4 sm:right-4 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-all duration-200 z-10 group">
        <svg
          class="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:rotate-90 transition-transform duration-200"
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
      <div class="flex-1 min-h-0 overflow-hidden relative" style="height: 0">
        <div
          class="p-4 sm:p-6 md:p-8 scroll-container"
          style="
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow-y: auto;
            -webkit-overflow-scrolling: touch;
            touch-action: pan-y;
            overscroll-behavior: contain;
          "
          @touchstart.stop.passive
          @touchmove.stop.passive
          @touchend.stop.passive>
          <!-- 頭像（如果有） -->
          <div v-if="content.avatar" class="flex justify-center mb-4 sm:mb-6">
            <div
              class="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4"
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
          <div class="text-center mb-4 sm:mb-6">
            <h2
              class="text-2xl sm:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
              :style="{
                backgroundImage: content.color
                  ? `linear-gradient(135deg, ${content.color}, ${content.color}cc)`
                  : 'linear-gradient(135deg, #fff, #ccc)',
              }">
              {{ content.title }}
            </h2>
            <p
              v-if="content.subtitle"
              class="text-gray-400 text-xs sm:text-sm uppercase tracking-wider">
              {{ content.subtitle }}
            </p>
          </div>

          <!-- 描述 -->
          <p
            class="text-gray-300 mb-4 sm:mb-6 leading-relaxed text-xs sm:text-sm whitespace-pre-line">
            {{ content.description }}
          </p>

          <!-- 勵志名言（如果有） -->
          <div
            v-if="content.quote"
            class="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl border-l-4"
            :style="{
              borderColor: content.color || 'rgba(255,255,255,0.3)',
              backgroundColor: content.color
                ? `${content.color}10`
                : 'rgba(255,255,255,0.05)',
            }">
            <p class="text-white/90 italic text-center text-xs sm:text-sm">
              "{{ content.quote }}"
            </p>
          </div>

          <!-- 詳細資訊 -->
          <div
            v-if="content.details && content.details.length > 0"
            class="mb-4 sm:mb-6 space-y-2 sm:space-y-3">
            <div
              v-for="(detail, index) in content.details"
              :key="index"
              class="flex justify-between items-center py-2 px-2 sm:px-3 rounded-lg border"
              :style="{
                borderColor: content.color
                  ? `${content.color}30`
                  : 'rgba(255,255,255,0.1)',
                backgroundColor: content.color
                  ? `${content.color}05`
                  : 'rgba(255,255,255,0.02)',
              }">
              <span class="text-gray-400 text-[10px] sm:text-xs">{{
                detail.label
              }}</span>
              <span class="text-white font-medium text-xs sm:text-sm">{{
                detail.value
              }}</span>
            </div>
          </div>

          <!-- 我的優勢 -->
          <div
            v-if="content.advantages && (isSupervisorColleagueReviews || (Array.isArray(content.advantages) && content.advantages.length > 0))"
            class="mb-4 sm:mb-6">
            <h3
              class="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white"
              :style="{
                color: content.color || '#fff',
              }">
            </h3>

            <!-- 主管和同事評價（新格式） -->
            <div v-if="isSupervisorColleagueReviews" class="space-y-4 sm:space-y-6">
              <!-- 主管評價 -->
              <div class="relative">
                <h4 class="text-sm sm:text-base font-medium mb-2 text-white/80" :style="{ color: content.color || '#fff' }">
                  {{ t.panel.supervisorReviews }}
                </h4>
                <div
                  class="review-card-container relative overflow-hidden rounded-xl border"
                  @mouseenter="pauseAutoplay('supervisor')"
                  @mouseleave="resumeAutoplay('supervisor')"
                  :style="{
                    borderColor: content.color
                      ? `${content.color}40`
                      : 'rgba(255,255,255,0.2)',
                    backgroundColor: content.color
                      ? `${content.color}10`
                      : 'rgba(255,255,255,0.05)',
                    minHeight: 'auto',
                  }">
                  <div class="overflow-hidden w-full">
                  <client-only>
                    <template #default>
                      <Swiper
                        ref="supervisorSwiperRef"
                        :modules="swiperModules"
                        :slides-per-view="1"
                        :space-between="0"
                        :loop="supervisorReviews.length > 1"
                        :autoplay="supervisorReviews.length > 1 ? {
                          delay: 3000,
                          disableOnInteraction: false,
                          reverseDirection: false,
                          pauseOnMouseEnter: true,
                        } : false"
                        :allow-touch-move="true"
                        :grab-cursor="true"
                        :simulate-touch="true"
                        class="review-swiper">
                        <SwiperSlide
                          v-for="(review, index) in supervisorReviews"
                          :key="index"
                          class="p-4 sm:p-6">
                          <div class="flex items-center gap-3 sm:gap-4 mb-4">
                            <div
                              class="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 flex-shrink-0"
                              :style="{
                                borderColor: content.color || 'rgba(255,255,255,0.3)',
                              }">
                              <img
                                :src="review.avatar || '/cutie.png'"
                                :alt="review.name"
                                class="w-full h-full object-cover" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <h4 class="text-white font-semibold text-sm sm:text-base mb-1">
                                {{ review.name }}
                              </h4>
                              <p
                                class="text-gray-400 text-xs sm:text-sm truncate"
                                :style="{
                                  color: content.color
                                    ? `${content.color}cc`
                                    : 'rgba(255,255,255,0.6)',
                                }">
                                {{ review.role }}
                              </p>
                            </div>
                          </div>
                          <div class="relative flex flex-col justify-end gap-4">
                            <p
                              class="text-white text-xs sm:text-sm leading-relaxed"
                            >
                              {{ review.content }}
                            </p>
                          </div>
                        </SwiperSlide>
                      </Swiper>
                    </template>
                    <template #fallback>
                      <div class="p-4 sm:p-6">
                        <div class="flex items-center gap-3 sm:gap-4 mb-4">
                          <div
                            class="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 flex-shrink-0"
                            :style="{
                              borderColor: content.color || 'rgba(255,255,255,0.3)',
                            }">
                            <img
                              :src="supervisorReviews[0]?.avatar || '/cutie.png'"
                              :alt="supervisorReviews[0]?.name"
                              class="w-full h-full object-cover" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <h4 class="text-white font-semibold text-sm sm:text-base mb-1">
                              {{ supervisorReviews[0]?.name }}
                            </h4>
                            <p
                              class="text-gray-400 text-xs sm:text-sm truncate"
                              :style="{
                                color: content.color
                                  ? `${content.color}cc`
                                  : 'rgba(255,255,255,0.6)',
                              }">
                              {{ supervisorReviews[0]?.role }}
                            </p>
                          </div>
                        </div>
                        <p
                          class="text-gray-300 text-xs sm:text-sm leading-relaxed"
                          :style="{
                            color: content.color
                              ? `${content.color}ee`
                              : 'rgba(255,255,255,1)',
                          }">
                          {{ supervisorReviews[0]?.content }}
                        </p>
                      </div>
                    </template>
                  </client-only>
                  </div>
                </div>
              </div>

              <!-- 同事評價 -->
              <div class="relative">
                <h4 class="text-sm sm:text-base font-medium mb-2 text-white/80" :style="{ color: content.color || '#fff' }">
                  {{ t.panel.colleagueReviews }}
                </h4>
                <div
                  class="review-card-container relative overflow-hidden rounded-xl border"
                  @mouseenter="pauseAutoplay('colleague')"
                  @mouseleave="resumeAutoplay('colleague')"
                  :style="{
                    borderColor: content.color
                      ? `${content.color}40`
                      : 'rgba(255,255,255,0.2)',
                    backgroundColor: content.color
                      ? `${content.color}10`
                      : 'rgba(255,255,255,0.05)',
                    minHeight: 'auto',
                  }">
                  <div class="overflow-hidden w-full">
                  <client-only>
                    <template #default>
                      <Swiper
                        ref="colleagueSwiperRef"
                        :modules="swiperModules"
                        :slides-per-view="1"
                        :space-between="0"
                        :loop="colleagueReviews.length > 1"
                        :autoplay="colleagueReviews.length > 1 ? {
                          delay: 3000,
                          disableOnInteraction: false,
                          reverseDirection: true,
                          pauseOnMouseEnter: true,
                        } : false"
                        :allow-touch-move="true"
                        :grab-cursor="true"
                        :simulate-touch="true"
                        class="review-swiper">
                        <SwiperSlide
                          v-for="(review, index) in colleagueReviews"
                          :key="index"
                          class="p-4 sm:p-6">
                          <div class="flex items-center gap-3 sm:gap-4 mb-4">
                            <div
                              class="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 flex-shrink-0"
                              :style="{
                                borderColor: content.color || 'rgba(255,255,255,0.3)',
                              }">
                              <img
                                :src="review.avatar || '/cutie.png'"
                                :alt="review.name"
                                class="w-full h-full object-cover" />
                            </div>
                            <div class="flex-1 min-w-0">
                              <h4 class="text-white font-semibold text-sm sm:text-base mb-1">
                                {{ review.name }}
                              </h4>
                              <p
                                class="text-gray-400 text-xs sm:text-sm truncate"
                                :style="{
                                  color: content.color
                                    ? `${content.color}cc`
                                    : 'rgba(255,255,255,0.6)',
                                }">
                                {{ review.role }}
                              </p>
                            </div>
                          </div>
                          <div class="relative flex flex-col justify-end gap-4">
                            <p
                              class="text-white text-xs sm:text-sm leading-relaxed"
                            >
                              {{ review.content }}
                            </p>
                          </div>
                        </SwiperSlide>
                      </Swiper>
                    </template>
                    <template #fallback>
                      <div class="p-4 sm:p-6">
                        <div class="flex items-center gap-3 sm:gap-4 mb-4">
                          <div
                            class="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 flex-shrink-0"
                            :style="{
                              borderColor: content.color || 'rgba(255,255,255,0.3)',
                            }">
                            <img
                              :src="colleagueReviews[0]?.avatar || '/cutie.png'"
                              :alt="colleagueReviews[0]?.name"
                              class="w-full h-full object-cover" />
                          </div>
                          <div class="flex-1 min-w-0">
                            <h4 class="text-white font-semibold text-sm sm:text-base mb-1">
                              {{ colleagueReviews[0]?.name }}
                            </h4>
                            <p
                              class="text-gray-400 text-xs sm:text-sm truncate"
                              :style="{
                                color: content.color
                                  ? `${content.color}cc`
                                  : 'rgba(255,255,255,0.6)',
                              }">
                              {{ colleagueReviews[0]?.role }}
                            </p>
                          </div>
                        </div>
                        <p
                          class="text-gray-300 text-xs sm:text-sm leading-relaxed"
                          :style="{
                            color: content.color
                              ? `${content.color}ee`
                              : 'rgba(255,255,255,1)',
                          }">
                          {{ colleagueReviews[0]?.content }}
                        </p>
                      </div>
                    </template>
                  </client-only>
                  </div>
                </div>
              </div>
            </div>


          </div>

          <!-- 我的核心價值 / 期望條件 -->
          <div
            v-if="content.coreValues && content.coreValues.length > 0"
            class="mb-4 sm:mb-6">
            <h3
              class="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white"
              :style="{
                color: content.color || '#fff',
              }">
              {{ coreValuesTitle }}
            </h3>
            <div class="space-y-2">
              <div
                v-for="(value, index) in content.coreValues"
                :key="index"
                class="relative pl-2 sm:pl-3 py-2 rounded-lg border-l-2"
                :style="{
                  borderColor: content.color || 'rgba(255,255,255,0.3)',
                  backgroundColor: content.color
                    ? `${content.color}08`
                    : 'rgba(255,255,255,0.03)',
                }">
                <p
                  class="text-gray-300 text-xs sm:text-sm leading-relaxed break-words">
                  {{ value }}
                </p>
              </div>
            </div>
          </div>

          <!-- 保留原有的 strengths 顯示（向後兼容） -->
          <div
            v-if="
              content.strengths &&
              content.strengths.length > 0 &&
              !content.advantages &&
              !content.coreValues
            "
            class="mb-4 sm:mb-6">
            <h3
              class="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-white"
              :style="{
                color: content.color || '#fff',
              }">
              核心價值與擅長
            </h3>
            <div class="space-y-2">
              <div
                v-for="(strength, index) in content.strengths"
                :key="index"
                class="relative pl-2 sm:pl-3 py-2 rounded-lg border-l-2"
                :style="{
                  borderColor: content.color || 'rgba(255,255,255,0.3)',
                  backgroundColor: content.color
                    ? `${content.color}08`
                    : 'rgba(255,255,255,0.03)',
                }">
                <p
                  class="text-gray-300 text-xs sm:text-sm leading-relaxed break-words">
                  {{ strength }}
                </p>
              </div>
            </div>
          </div>

          <!-- 作品列表 -->
          <div
            v-if="content.projects && content.projects.length > 0"
            class="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
            <h3
              class="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-white"
              :style="{
                color: content.color || '#fff',
              }">
              {{ featuredProjectsTitle }}
            </h3>
            <div
              v-for="(project, index) in content.projects"
              :key="index"
              class="project-item relative group cursor-grab active:cursor-grabbing"
              @mouseenter="handleProjectHover($event, index)"
              @mouseleave="handleProjectLeave"
              @mousemove="handleProjectMove">
              <div
                class="project-card relative p-4 sm:p-5 rounded-xl border transition-all duration-300"
                :style="{
                  borderColor: content.color
                    ? `${content.color}30`
                    : 'rgba(255,255,255,0.1)',
                  backgroundColor: content.color
                    ? `${content.color}05`
                    : 'rgba(255,255,255,0.02)',
                }">
                <!-- 內容 -->
                <div class="relative z-10">
                  <h4
                    class="text-sm sm:text-base font-semibold mb-2 text-white"
                    :style="{
                      color: content.color || '#fff',
                    }">
                    {{ project.title }}
                  </h4>
                  <p
                    v-if="project.description"
                    class="text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed">
                    {{ project.description }}
                  </p>
                  <div
                    v-if="project.tags && project.tags.length > 0"
                    class="flex flex-wrap gap-2">
                    <span
                      v-for="(tag, tagIndex) in project.tags"
                      :key="tagIndex"
                      class="px-2 py-1 text-[10px] sm:text-xs rounded-md"
                      :style="{
                        backgroundColor: content.color
                          ? `${content.color}20`
                          : 'rgba(255,255,255,0.1)',
                        color: content.color || '#fff',
                        border: `1px solid ${
                          content.color
                            ? content.color + '40'
                            : 'rgba(255,255,255,0.2)'
                        }`,
                      }">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 連結按鈕 -->
          <div
            v-if="content.links && content.links.length > 0"
            class="flex flex-col gap-2 sm:gap-3 mb-4 sm:mb-6">
            <a
              v-for="(link, index) in content.links"
              :key="index"
              :href="link.url"
              :download="getFileNameFromUrl(link.url)"
              :target="getLinkTarget(link.url)"
              :rel="getLinkRel(link.url)"
              class="px-4 py-2.5 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 hover:shadow-lg text-center cursor-pointer"
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
        </div>
      </div>

      <!-- 中間導航箭頭（超出卡片範圍） -->
      <div class="arrow-content">
        <!-- 左箭頭（在卡片左側外面） -->
        <button
          @click.stop="emit('prev')"
          class="arrow-button arrow-left w-10 h-10 flex items-center justify-center rounded-full"
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
          class="arrow-button arrow-right w-10 h-10 flex items-center justify-center rounded-full"
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

  <!-- 浮動預覽框 -->
  <div
    v-if="previewState.visible && previewState.project"
    ref="previewRef"
    class="project-preview fixed pointer-events-none z-[9999]"
    :style="{
      left: `${previewState.x}px`,
      top: `${previewState.y}px`,
      transform: 'translate(-50%, -50%)',
    }">
    <div
      class="preview-card w-64 sm:w-80 rounded-lg overflow-hidden border shadow-2xl pointer-events-auto"
      style="transform-style: preserve-3d; will-change: transform"
      :style="{
        borderColor: props.content?.color
          ? `${props.content.color}50`
          : 'rgba(255,255,255,0.2)',
        backgroundColor: 'rgba(10, 10, 15, 0.95)',
        backdropFilter: 'blur(20px)',
        boxShadow: props.content?.color
          ? `0 25px 80px ${props.content.color}30, 0 0 50px ${props.content.color}20, inset 0 0 30px ${props.content.color}10`
          : '0 25px 80px rgba(0,0,0,0.9), 0 0 50px rgba(255,255,255,0.15)',
      }"
      @click.stop
      @mouseleave="handlePreviewLeave"
      @mousemove="handlePreviewMove">
      <!-- 圖片 -->
      <div
        v-if="previewState.project.image"
        class="w-full h-48 sm:h-56 overflow-hidden bg-gray-900 relative">
        <img
          :src="previewState.project.image"
          :alt="previewState.project.title"
          class="w-full h-full object-cover" />
        <!-- 圖片遮罩 -->
        <div
          class="absolute inset-0"
          :style="{
            background: props.content?.color
              ? `linear-gradient(to bottom, transparent, ${props.content.color}20)`
              : 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.3))',
          }"></div>
      </div>
      <!-- 內容 -->
      <div class="p-4 sm:p-5 bg-gradient-to-b from-transparent to-black/20">
        <h4
          class="text-base sm:text-lg font-semibold mb-2 text-white"
          :style="{
            color: props.content?.color || '#fff',
          }">
          {{ previewState.project.title }}
        </h4>
        <p
          v-if="previewState.project.description"
          class="text-gray-300 text-xs sm:text-sm leading-relaxed">
          {{ previewState.project.description }}
        </p>
      </div>
    </div>
  </div>
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
  height: 100%;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 100;
}

.arrow-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: auto;
  z-index: 100;
}

.arrow-left {
  left: -50px; /* 超出卡片左側 10px（按鈕寬度40px + 10px間距） */
}

.arrow-right {
  right: -50px; /* 超出卡片右側 10px（按鈕寬度40px + 10px間距） */
}

/* 滾動容器優化 */
.scroll-container {
  -webkit-overflow-scrolling: touch !important;
  touch-action: pan-y !important;
  overscroll-behavior: contain !important;
}

/* 自訂滾動條樣式 */
.scroll-container::-webkit-scrollbar {
  width: 6px;
}

.scroll-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.5);
}

.scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

/* 作品項目樣式 */
.project-item {
  transition: all 0.2s ease;
}

.project-card {
  transition: all 0.2s ease;
}

.project-item:hover .project-card {
  transform: translateX(4px);
  border-color: rgba(255, 255, 255, 0.2);
}

/* 浮動預覽框樣式 */
.project-preview {
  will-change: transform, opacity;
}

.preview-card {
  transform-origin: center center;
  will-change: transform, opacity;
}

/* 手機版箭頭調整 */
@media (max-width: 640px) {
  .arrow-left {
    left: -18px;
  }

  .arrow-right {
    right: -18px;
  }

  .arrow-button {
    width: 2rem;
    height: 2rem;
    background-color: rgba(0, 0, 0, 0.5) !important;
    backdrop-filter: blur(8px);
  }

  .arrow-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

/* 評價卡片輪播動畫 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.review-card-container {
  position: relative;
}

/* Swiper 樣式覆蓋 */
.review-swiper {
  width: 100%;
  overflow: hidden;
}

.review-swiper :deep(.swiper-wrapper) {
  display: flex;
}

.review-swiper :deep(.swiper-slide) {
  width: 100%;
  flex-shrink: 0;
  height: auto !important;
  display: flex;
  flex-direction: column;
}

.review-swiper :deep(.swiper-wrapper) {
  align-items: stretch;
  height: auto !important;
}

.review-swiper :deep(.swiper) {
  height: auto !important;
}

/* 限制文字行數並顯示省略號 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
