<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { gsap } from "gsap";
import * as THREE from "three";
import { useI18n } from "@/composables/useI18n";
import CutieCharacter from "@/components/CutieCharacter.vue";
import MobileWarning from "@/components/MobileWarning.vue";

const isClient = typeof window !== "undefined";

const emit = defineEmits<{
  start: [];
}>();

const { t, setLocale, locale } = useI18n();
const containerRef = ref<HTMLElement | null>(null);
const starfieldRef = ref<HTMLElement | null>(null);
const isAnimating = ref(false);
const showLanguageDropdown = ref(false);
const languageDropdownRef = ref<HTMLElement | null>(null);

const STARFIELD_CONFIG = {
  PARTICLE_COUNT: 500000,
  SPREAD: 5000,
  SIZE: 2,
  AUTO_ROTATION_SPEED: 0.0001,
  ROTATION_SMOOTHING: 0.1,
  MAX_ROTATION: 15,
} as const;

const CAMERA_CONFIG = {
  FOV: 75,
  NEAR: 0.1,
  FAR: 10000,
} as const;

const BACKGROUND_COLOR = 0x0a0a0f;

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let starfield: THREE.Points;
let animationId: number | null = null;
let handleResize: (() => void) | null = null;
const targetRotation = ref({ x: 0, y: 0 });
const currentRotation = ref({ x: 0, y: 0 });

const typingText = ref<string>(t.value.landing.typing.line1);
const currentLineIndex = ref(0);
const isTyping = ref(true);
let typingTimer: number | null = null;

const handleClickOutside = (event: MouseEvent) => {
  if (
    languageDropdownRef.value &&
    !languageDropdownRef.value.contains(event.target as Node)
  ) {
    showLanguageDropdown.value = false;
  }
};

const warpSpaceRef = ref<HTMLElement | null>(null);
const starCount = 300;
let starAnimations: (gsap.core.Tween | gsap.core.Timeline)[] = [];
const isLoading = ref(false);

const updateButtonState = async () => {
  if (isAnimating.value) return;
  isLoading.value = true;
  isAnimating.value = true;
  requestAnimationFrame(() => {
    setTimeout(handleStart, 1000);
  });
};

const handleStart = () => {
  if (!isAnimating.value) return;

  if (warpSpaceRef.value) {
    gsap.set(warpSpaceRef.value, { opacity: 1, display: "block", zIndex: 50 });
  }

  const tl = gsap.timeline();

  if (containerRef.value) {
    const contentElement = containerRef.value.querySelector(".content");
    const languageSelector =
      containerRef.value.querySelector(".language-selector");

    if (contentElement) {
      tl.to(
        contentElement,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        0
      );
    }

    if (languageSelector) {
      tl.to(
        languageSelector,
        {
          opacity: 0,
          duration: 0.3,
          ease: "power2.in",
        },
        0
      );
    }
  }

  if (starfieldRef.value) {
    tl.to(
      starfieldRef.value,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
      },
      0
    );
  }

  emit("start");

  if (warpSpaceRef.value) {
    const stars = warpSpaceRef.value.querySelectorAll(".warp-star");

    starAnimations.forEach((anim) => anim.kill());
    starAnimations = [];

    stars.forEach((star) => {
      const size = Math.random() * 2 + 1;
      const duration = Math.random() * 1.5 + 1.5;
      const delay = Math.random() * 0.3;

      const angle = Math.random() * Math.PI * 2;
      const distance =
        Math.random() * Math.min(window.innerWidth, window.innerHeight) * 0.8;
      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      gsap.set(star, {
        x: 0,
        y: 0,
        width: size,
        height: size,
        scale: 0.2,
        opacity: 0,
        rotation: Math.random() * 360,
      });

      const starTl = gsap.timeline({ repeat: -1, delay: delay });
      starTl.set(star, {
        x: 0,
        y: 0,
        scale: 0.2,
        opacity: 0,
      });
      starTl.to(star, {
        x: x * 3,
        y: y * 3,
        scale: 5 + Math.random() * 3,
        opacity: 0.8,
        duration: duration,
        ease: "power2.in",
      });

      const anim = starTl;

      starAnimations.push(anim);
    });

    gsap.to(warpSpaceRef.value, {
      filter: "blur(10px) brightness(1.3)",
      duration: 2,
      ease: "none",
      repeat: -1,
      yoyo: true,
    });
  }
};

const startTyping = () => {
  if (!isClient) return;

  const lines = [
    t.value.landing.typing.line1,
    t.value.landing.typing.line2,
    t.value.landing.typing.line3,
  ];

  currentLineIndex.value = 0;
  if (!typingText.value) {
    typingText.value = lines[0];
  }
  isTyping.value = true;

  const typeNextLine = () => {
    const currentLine = lines[currentLineIndex.value];
    let charIndex = currentLine.length;

    const deleteChar = () => {
      if (charIndex > 0) {
        requestAnimationFrame(() => {
          typingText.value = currentLine.substring(0, charIndex - 1);
          charIndex--;
          typingTimer = window.setTimeout(deleteChar, 30);
        });
      } else {
        currentLineIndex.value++;

        if (currentLineIndex.value >= lines.length) {
          currentLineIndex.value = 0;
        }

        typingText.value = "";
        const nextLine = lines[currentLineIndex.value];
        let nextCharIndex = 0;

        const typeChar = () => {
          if (nextCharIndex < nextLine.length) {
            requestAnimationFrame(() => {
              typingText.value = nextLine.substring(0, nextCharIndex + 1);
              nextCharIndex++;
              typingTimer = window.setTimeout(typeChar, 50);
            });
          } else {
            // 這一行打完，等待一下再刪除
            typingTimer = window.setTimeout(() => {
              typeNextLine(); // 繼續下一行（循環）
            }, 1500); // 行間等待時間（顯示完整文字的時間）
          }
        };

        // 延遲一下再開始打字
        typingTimer = window.setTimeout(typeChar, 300);
      }
    };

    // 等待一下再開始刪除
    typingTimer = window.setTimeout(deleteChar, 1500);
  };

  // 延遲開始刪除第一行（讓用戶先看到第一行）
  typingTimer = window.setTimeout(typeNextLine, 2000);
};

// 創建星星顏色
const createStarColor = (brightness: number): THREE.Color => {
  if (brightness > 0.98) {
    // 2% 的亮星
    const whiteBrightness = 0.9 + Math.random() * 0.1;
    return new THREE.Color(
      whiteBrightness,
      whiteBrightness,
      whiteBrightness + 0.1
    );
  }
  if (brightness > 0.95) {
    const whiteBrightness = 0.7 + Math.random() * 0.2;
    return new THREE.Color(
      whiteBrightness,
      whiteBrightness,
      whiteBrightness + 0.1
    );
  }
  if (brightness > 0.9) {
    const hue = 0.5 + Math.random() * 0.2;
    return new THREE.Color().setHSL(hue, 0.6, 0.7 + Math.random() * 0.3);
  }
  const starBrightness = 0.4 + Math.random() * 0.5;
  return new THREE.Color(starBrightness, starBrightness, starBrightness + 0.1);
};

const createStarfield = (): THREE.Points => {
  const { PARTICLE_COUNT, SPREAD } = STARFIELD_CONFIG;
  const positions: number[] = [];
  const colors: number[] = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    positions.push(
      (Math.random() - 0.5) * SPREAD,
      (Math.random() - 0.5) * SPREAD,
      (Math.random() - 0.5) * SPREAD
    );

    const color = createStarColor(Math.random());
    colors.push(color.r, color.g, color.b);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

  if (!isClient) {
    throw new Error("createStarfield 只能在客戶端執行");
  }

  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("無法獲取 canvas 2d context");
  }

  const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.5, "rgba(255,255,255,0.5)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");

  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);

  const material = new THREE.PointsMaterial({
    size: STARFIELD_CONFIG.SIZE,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    sizeAttenuation: true,
    map: texture,
    alphaTest: 0.01,
  });

  return new THREE.Points(geometry, material);
};

let mouseMoveTimer: number | null = null;
const handleMouseMove = (event: MouseEvent) => {
  if (!isClient || mouseMoveTimer) return;

  mouseMoveTimer = window.requestAnimationFrame(() => {
    const { innerWidth, innerHeight } = window;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;

    const mouseX = (event.clientX - centerX) / centerX;
    const mouseY = (event.clientY - centerY) / centerY;

    targetRotation.value.x = -mouseY * STARFIELD_CONFIG.MAX_ROTATION;
    targetRotation.value.y = mouseX * STARFIELD_CONFIG.MAX_ROTATION;

    mouseMoveTimer = null;
  });
};

const animate = () => {
  if (!isClient) return;
  animationId = window.requestAnimationFrame(animate);

  if (!starfield || !renderer || !scene || !camera) return;

  const { ROTATION_SMOOTHING, AUTO_ROTATION_SPEED } = STARFIELD_CONFIG;
  currentRotation.value.x +=
    (targetRotation.value.x - currentRotation.value.x) * ROTATION_SMOOTHING;
  currentRotation.value.y +=
    (targetRotation.value.y - currentRotation.value.y) * ROTATION_SMOOTHING;

  starfield.rotation.x = THREE.MathUtils.degToRad(currentRotation.value.x);
  starfield.rotation.y =
    THREE.MathUtils.degToRad(currentRotation.value.y) + AUTO_ROTATION_SPEED;

  renderer.render(scene, camera);
};

const initializeThreeJS = () => {
  if (!isClient || !starfieldRef.value) return;

  const container = starfieldRef.value;
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND_COLOR);

  camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.FOV,
    width / height,
    CAMERA_CONFIG.NEAR,
    CAMERA_CONFIG.FAR
  );
  camera.position.set(0, 0, 0);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const canvas = renderer.domElement;
  Object.assign(canvas.style, {
    display: "block",
    width: "100%",
    height: "100%",
    position: "absolute",
    top: "0",
    left: "0",
  });

  container.appendChild(canvas);

  starfield = createStarfield();
  scene.add(starfield);

  handleResize = () => {
    if (!isClient || !container || !renderer || !camera) return;
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("mousemove", handleMouseMove);

  animate();
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  nextTick(() => {
    initializeThreeJS();
    startTyping();
  });
});

onUnmounted(() => {
  if (!isClient) return;

  document.removeEventListener("click", handleClickOutside);
  window.removeEventListener("mousemove", handleMouseMove);

  if (handleResize) {
    window.removeEventListener("resize", handleResize);
  }

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  if (mouseMoveTimer !== null) {
    cancelAnimationFrame(mouseMoveTimer);
    mouseMoveTimer = null;
  }

  if (typingTimer !== null) {
    clearTimeout(typingTimer);
    typingTimer = null;
  }

  starAnimations.forEach((anim) => anim.kill());
  starAnimations = [];

  if (starfieldRef.value && renderer?.domElement) {
    starfieldRef.value.removeChild(renderer.domElement);
  }

  if (renderer) {
    renderer.dispose();
  }

  if (starfield?.geometry) {
    starfield.geometry.dispose();
  }

  if (starfield?.material) {
    if (Array.isArray(starfield.material)) {
      starfield.material.forEach((mat) => mat.dispose());
    } else {
      starfield.material.dispose();
    }
  }

  if (scene) {
    scene.clear();
  }
});

watch(
  () => locale.value,
  () => {
    if (!isClient) return;
    if (typingTimer !== null) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    typingText.value = t.value.landing.typing.line1;
    startTyping();
  }
);
</script>

<template>
  <div
    ref="containerRef"
    class="landing-page fixed inset-0 w-full h-full flex items-center justify-center z-50">
    <!-- 手機版提醒 -->
    <MobileWarning />

    <client-only>
      <div
        ref="starfieldRef"
        class="starfield absolute inset-0 overflow-hidden"></div>
    </client-only>

    <div
      ref="warpSpaceRef"
      class="warp-space fixed inset-0 overflow-hidden pointer-events-none z-40"
      style="opacity: 0">
      <div v-for="n in starCount" :key="n" class="warp-star"></div>
    </div>

    <div class="language-selector absolute top-[40px] right-[6px] z-10">
      <div ref="languageDropdownRef" class="relative">
        <button
          @click="showLanguageDropdown = !showLanguageDropdown"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-200">
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
          </svg>
          <span class="text-sm font-medium">{{ t.landing.language }}</span>
          <span class="text-xs opacity-70 ml-auto">{{
            locale === "zh" ? "中文" : "English"
          }}</span>
          <svg
            class="w-4 h-4 transition-transform duration-200"
            :class="{ 'rotate-180': showLanguageDropdown }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition ease-out duration-100"
          enter-from-class="transform opacity-0 scale-95"
          enter-to-class="transform opacity-100 scale-100"
          leave-active-class="transition ease-in duration-75"
          leave-from-class="transform opacity-100 scale-100"
          leave-to-class="transform opacity-0 scale-95">
          <div
            v-if="showLanguageDropdown"
            class="absolute top-full left-0 mt-2 w-full bg-white/10 backdrop-blur-md rounded-lg border border-white/20 shadow-lg overflow-hidden z-50 min-w-[120px]">
            <button
              @click="
                setLocale('zh');
                showLanguageDropdown = false;
              "
              :class="[
                'w-full px-4 py-2 text-sm text-left transition-all duration-200',
                locale === 'zh'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              ]">
              中文
            </button>
            <button
              @click="
                setLocale('en');
                showLanguageDropdown = false;
              "
              :class="[
                'w-full px-4 py-2 text-sm text-left transition-all duration-200',
                locale === 'en'
                  ? 'bg-white/20 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              ]">
              English
            </button>
          </div>
        </Transition>
      </div>
    </div>

    <div
      class="content relative z-10 text-center px-4 flex flex-col items-center gap-2">
      <CutieCharacter />
      <div class="greeting mb-4">
        <h2
          class="outline-text text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-wide">
          {{ t.landing.greeting }}
        </h2>
      </div>

      <div class="typing-text mb-8">
        <p class="text-lg sm:text-xl md:text-2xl text-white/80 leading-relaxed">
          {{ typingText }}<span v-if="isTyping" class="typing-cursor">|</span>
        </p>
      </div>

      <div class="button-container">
        <button
          @click="updateButtonState"
          :disabled="isAnimating"
          class="start-button group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white font-medium text-lg sm:text-xl shadow-lg shadow-orange-500/40 hover:shadow-xl hover:shadow-orange-500/60 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="!isLoading" class="flex items-center gap-3">
            <span class="dot w-2 h-2 bg-white rounded-full"></span>
            {{ t.landing.startButton }}
          </span>
          <span v-else class="flex items-center gap-3">
            <svg
              class="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ t.landing.loading }}</span>
          </span>
          <div
            class="absolute inset-0 rounded-full bg-gradient-to-r from-orange-400 to-red-400 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10"></div>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.landing-page {
  background: #0a0a0f;
}

.starfield {
  background: #0a0a0f;
  pointer-events: none;
}

/* 墜入星空動畫 */
.warp-space {
  background: #0a0a0f;
}

.warp-star {
  position: absolute;
  width: 2px;
  height: 2px;
  background: white;
  border-radius: 50%;
  top: 50%;
  left: 50%;
  transform-origin: center center;
  box-shadow: 0 0 2px rgba(255, 255, 255, 0.8);
}

.start-button {
  position: relative;
  overflow: hidden;
}

.start-button::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.start-button:hover::before {
  width: 300px;
  height: 300px;
}

.dot {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(0.8);
  }
}

/* 發光字型效果 - 白色文字（稍微暗一點） */
.outline-text {
  color: #ffffff;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, sans-serif;
  text-shadow: 0 0 5px rgba(255, 255, 255, 0.4),
    0 0 10px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.4),
    0 0 20px rgba(255, 255, 255, 0.25), 0 0 30px rgba(255, 255, 255, 0.2),
    0 0 40px rgba(255, 255, 255, 0.15);
  letter-spacing: 0.03em;
  filter: brightness(1.02) drop-shadow(0 0 15px rgba(255, 255, 255, 0.25));
  animation: glow-pulse 4s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%,
  100% {
    text-shadow: 0 0 5px rgba(255, 255, 255, 0.4),
      0 0 10px rgba(255, 255, 255, 0.3), 0 0 15px rgba(255, 255, 255, 0.4),
      0 0 20px rgba(255, 255, 255, 0.25), 0 0 30px rgba(255, 255, 255, 0.2),
      0 0 40px rgba(255, 255, 255, 0.15);
    filter: brightness(1.02) drop-shadow(0 0 15px rgba(255, 255, 255, 0.25));
  }
  50% {
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5),
      0 0 12px rgba(255, 255, 255, 0.4), 0 0 18px rgba(255, 255, 255, 0.5),
      0 0 25px rgba(255, 255, 255, 0.35), 0 0 35px rgba(255, 255, 255, 0.3),
      0 0 45px rgba(255, 255, 255, 0.25);
    filter: brightness(1.05) drop-shadow(0 0 20px rgba(255, 255, 255, 0.35));
  }
}

/* 打字機游標 */
.typing-cursor {
  margin-left: 4px;
  display: inline-block;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 100;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%,
  50% {
    opacity: 1;
  }
  51%,
  100% {
    opacity: 0;
  }
}
</style>
