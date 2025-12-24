<script setup lang="ts">
// Imports
import { ref, onMounted, onUnmounted, nextTick, watch } from "vue";
import { gsap } from "gsap";
import * as THREE from "three";
import { useI18n } from "@/composables/useI18n";
import CutieCharacter from "@/components/CutieCharacter.vue";

// SSR 安全檢查
const isClient = typeof window !== "undefined";

// Emits & Props
const emit = defineEmits<{
  start: [];
}>();

// Constants
const { t, setLocale, locale } = useI18n();
const containerRef = ref<HTMLElement | null>(null);
const starfieldRef = ref<HTMLElement | null>(null);
const isAnimating = ref(false);
const showLanguageDropdown = ref(false);
const languageDropdownRef = ref<HTMLElement | null>(null);

// Three.js constants
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

// Three.js variables
let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let starfield: THREE.Points;
let animationId: number | null = null;
let handleResize: (() => void) | null = null;
const targetRotation = ref({ x: 0, y: 0 });
const currentRotation = ref({ x: 0, y: 0 });

// 打字機效果
const typingText = ref("");
const currentLineIndex = ref(0);
const isTyping = ref(false);
let typingTimer: number | null = null;

// Functions
const handleClickOutside = (event: MouseEvent) => {
  if (
    languageDropdownRef.value &&
    !languageDropdownRef.value.contains(event.target as Node)
  ) {
    showLanguageDropdown.value = false;
  }
};

const handleStart = () => {
  if (isAnimating.value) return;

  isAnimating.value = true;

  if (containerRef.value) {
    // 淡出動畫
    gsap.to(containerRef.value, {
      opacity: 0,
      scale: 0.9,
      duration: 0.8,
      ease: "power2.in",
      onComplete: () => {
        emit("start");
      },
    });
  } else {
    emit("start");
  }
};

// 打字機效果（循環播放，包含刪除效果）
const startTyping = () => {
  if (!isClient) return;

  const lines = [
    t.value.landing.typing.line1,
    t.value.landing.typing.line2,
    t.value.landing.typing.line3,
  ];

  currentLineIndex.value = 0;
  // 預設顯示第一行
  typingText.value = lines[0];
  isTyping.value = true;

  const typeNextLine = () => {
    const currentLine = lines[currentLineIndex.value];
    let charIndex = currentLine.length; // 從完整文字開始（因為已經顯示了）

    // 先刪除當前行
    const deleteChar = () => {
      if (charIndex > 0) {
        typingText.value = currentLine.substring(0, charIndex - 1);
        charIndex--;
        typingTimer = window.setTimeout(deleteChar, 30); // 刪除速度（比打字快）
      } else {
        // 刪除完成，切換到下一行
        currentLineIndex.value++;

        // 如果已經打完所有行，重置到第一行（循環）
        if (currentLineIndex.value >= lines.length) {
          currentLineIndex.value = 0;
        }

        typingText.value = ""; // 清空準備下一行
        const nextLine = lines[currentLineIndex.value];
        let nextCharIndex = 0;

        // 開始打下一行
        const typeChar = () => {
          if (nextCharIndex < nextLine.length) {
            typingText.value = nextLine.substring(0, nextCharIndex + 1);
            nextCharIndex++;
            typingTimer = window.setTimeout(typeChar, 50); // 打字速度
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
    // 3% 的較亮星星
    const whiteBrightness = 0.7 + Math.random() * 0.2;
    return new THREE.Color(
      whiteBrightness,
      whiteBrightness,
      whiteBrightness + 0.1
    );
  }
  if (brightness > 0.9) {
    // 5% 的彩色星星
    const hue = 0.5 + Math.random() * 0.2;
    return new THREE.Color().setHSL(hue, 0.6, 0.7 + Math.random() * 0.3);
  }
  // 90% 的普通星星
  const starBrightness = 0.4 + Math.random() * 0.5;
  return new THREE.Color(starBrightness, starBrightness, starBrightness + 0.1);
};

// 創建星空背景
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

// 處理滑鼠移動（使用節流優化性能）
let mouseMoveTimer: number | null = null;
const handleMouseMove = (event: MouseEvent) => {
  if (!isClient || mouseMoveTimer) return;

  mouseMoveTimer = window.requestAnimationFrame(() => {
    const { innerWidth, innerHeight } = window;
    const centerX = innerWidth / 2;
    const centerY = innerHeight / 2;

    // 計算滑鼠相對於視窗中心的位置（-1 到 1）
    const mouseX = (event.clientX - centerX) / centerX;
    const mouseY = (event.clientY - centerY) / centerY;

    // 計算目標旋轉角度
    targetRotation.value.x = -mouseY * STARFIELD_CONFIG.MAX_ROTATION;
    targetRotation.value.y = mouseX * STARFIELD_CONFIG.MAX_ROTATION;

    mouseMoveTimer = null;
  });
};

// 動畫循環
const animate = () => {
  if (!isClient) return;
  animationId = window.requestAnimationFrame(animate);

  if (!starfield || !renderer || !scene || !camera) return;

  // 平滑插值旋轉
  const { ROTATION_SMOOTHING, AUTO_ROTATION_SPEED } = STARFIELD_CONFIG;
  currentRotation.value.x +=
    (targetRotation.value.x - currentRotation.value.x) * ROTATION_SMOOTHING;
  currentRotation.value.y +=
    (targetRotation.value.y - currentRotation.value.y) * ROTATION_SMOOTHING;

  // 應用旋轉到星空
  starfield.rotation.x = THREE.MathUtils.degToRad(currentRotation.value.x);
  starfield.rotation.y =
    THREE.MathUtils.degToRad(currentRotation.value.y) + AUTO_ROTATION_SPEED;

  renderer.render(scene, camera);
};

// 初始化 Three.js
const initializeThreeJS = () => {
  if (!isClient || !starfieldRef.value) return;

  const container = starfieldRef.value;
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // Scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(BACKGROUND_COLOR);

  // Camera
  camera = new THREE.PerspectiveCamera(
    CAMERA_CONFIG.FOV,
    width / height,
    CAMERA_CONFIG.NEAR,
    CAMERA_CONFIG.FAR
  );
  camera.position.set(0, 0, 0);

  // Renderer
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 設置渲染器樣式
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

  // 創建星空
  starfield = createStarfield();
  scene.add(starfield);

  // 處理窗口大小變化
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

  // 啟動動畫
  animate();
};

// Vue Lifecycle
onMounted(() => {
  document.addEventListener("click", handleClickOutside);

  // 使用 nextTick 確保 client-only 組件已渲染
  nextTick(() => {
    initializeThreeJS();
    // 開始打字機效果
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

  // 清理 Three.js 資源
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

// 監聽語言變化，重新開始打字機效果
watch(
  () => locale.value,
  () => {
    if (!isClient) return;
    if (typingTimer !== null) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    startTyping();
  }
);

// 監聽語言變化，重新開始打字機效果
watch(
  () => locale.value,
  () => {
    if (typingTimer !== null) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    startTyping();
  }
);
</script>

<template>
  <div
    ref="containerRef"
    class="landing-page fixed inset-0 w-full h-full flex items-center justify-center z-50">
    <!-- 星空背景 - Three.js -->
    <client-only>
      <div
        ref="starfieldRef"
        class="starfield absolute inset-0 overflow-hidden"></div>
    </client-only>

    <!-- 語言下拉選單（左上角） -->
    <div class="language-selector absolute top-6 left-6 z-10">
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

        <!-- 下拉選單 -->
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

    <!-- 主要內容 -->
    <div
      class="content relative z-10 text-center px-4 flex flex-col items-center gap-2">
      <CutieCharacter />
      <!-- 問候語 - 簍空字效果 -->
      <div class="greeting mb-4">
        <h2
          class="outline-text text-2xl sm:text-3xl md:text-4xl font-bold mb-2 tracking-wide">
          {{ t.landing.greeting }}
        </h2>
      </div>

      <!-- 打字機效果文字 -->
      <div class="typing-text mb-8">
        <p class="text-lg sm:text-xl md:text-2xl text-white/80 leading-relaxed">
          {{ typingText }}<span v-if="isTyping" class="typing-cursor">|</span>
        </p>
      </div>

      <!-- 開始按鈕 -->
      <div class="button-container">
        <button
          @click="handleStart"
          :disabled="isAnimating"
          class="start-button group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-medium text-lg sm:text-xl shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
          <span class="flex items-center gap-3">
            <span class="dot w-2 h-2 bg-white rounded-full"></span>
            {{ t.landing.startButton }}
          </span>
          <!-- 發光效果 -->
          <div
            class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300 -z-10"></div>
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
  display: inline-block;
  width: 2px;
  margin-left: 2px;
  background-color: rgba(255, 255, 255, 0.9);
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
