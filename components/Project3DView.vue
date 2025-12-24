<script setup lang="ts">
// Imports
import { onMounted, onUnmounted, ref, watch, nextTick } from "vue";
import * as THREE from "three";
import {
  CSS3DRenderer,
  CSS3DObject,
} from "three/addons/renderers/CSS3DRenderer.js";
import { gsap } from "gsap";
import type { PlanetContent } from "@/types/planetContent";

// Props
const props = defineProps<{
  projects: PlanetContent["projects"];
  color?: string;
}>();

// Constants
const containerRef = ref<HTMLElement | null>(null);
const previewRef = ref<HTMLElement | null>(null);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: CSS3DRenderer;
let projectCards: CSS3DObject[] = [];
let projectGroup: THREE.Group;
let animationId: number | null = null;
let mouse = new THREE.Vector2();
let hoveredCard: CSS3DObject | null = null;
let mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
let rotationSpeed = 0.005;
let targetRotation = 0;
let currentRotation = 0;

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

// Functions
const createProjectCard = (
  project: NonNullable<PlanetContent["projects"]>[0],
  index: number,
  total: number
): CSS3DObject => {
  // 創建 HTML 元素
  const element = document.createElement("div");
  element.className = "project-card-3d";
  element.style.width = "300px";
  element.style.height = "400px";
  element.style.padding = "20px";
  element.style.backgroundColor = "rgba(10, 10, 15, 0.95)";
  element.style.border = `2px solid ${props.color || "#fad5a5"}`;
  element.style.borderRadius = "12px";
  element.style.overflow = "hidden";
  element.style.backfaceVisibility = "hidden";
  element.style.webkitBackfaceVisibility = "hidden";
  element.style.boxShadow = `0 20px 60px ${props.color || "#fad5a5"}30`;

  // 圖片
  if (project.image) {
    const img = document.createElement("img");
    img.src = project.image;
    img.style.width = "100%";
    img.style.height = "200px";
    img.style.objectFit = "cover";
    img.style.borderRadius = "8px";
    img.style.marginBottom = "16px";
    element.appendChild(img);
  }

  // 標題
  const title = document.createElement("h4");
  title.textContent = project.title;
  title.style.color = props.color || "#fad5a5";
  title.style.fontSize = "20px";
  title.style.fontWeight = "bold";
  title.style.marginBottom = "12px";
  title.style.marginTop = "0";
  element.appendChild(title);

  // 描述
  if (project.description) {
    const desc = document.createElement("p");
    desc.textContent = project.description;
    desc.style.color = "#cccccc";
    desc.style.fontSize = "14px";
    desc.style.lineHeight = "1.6";
    desc.style.margin = "0";
    element.appendChild(desc);
  }

  // 標籤
  if (project.tags && project.tags.length > 0) {
    const tagsContainer = document.createElement("div");
    tagsContainer.style.display = "flex";
    tagsContainer.style.flexWrap = "wrap";
    tagsContainer.style.gap = "8px";
    tagsContainer.style.marginTop = "16px";

    project.tags.forEach((tag) => {
      const tagEl = document.createElement("span");
      tagEl.textContent = tag;
      tagEl.style.padding = "4px 8px";
      tagEl.style.fontSize = "12px";
      tagEl.style.borderRadius = "4px";
      tagEl.style.backgroundColor = `${props.color || "#fad5a5"}20`;
      tagEl.style.color = props.color || "#fad5a5";
      tagEl.style.border = `1px solid ${props.color || "#fad5a5"}40`;
      tagsContainer.appendChild(tagEl);
    });

    element.appendChild(tagsContainer);
  }

  // 創建 CSS3D 物件
  const object = new CSS3DObject(element);
  object.scale.set(0.01, 0.01, 0.01); // CSS3D 使用米為單位，需要縮放

  // 計算位置（圓形排列）
  const radius = 6;
  const angle = (index / total) * Math.PI * 2;
  object.position.x = Math.sin(angle) * radius;
  object.position.z = Math.cos(angle) * radius;
  object.position.y = 0;

  // 讓卡片面向中心
  object.lookAt(0, 0, 0);

  // 存儲項目資訊
  object.userData = {
    project,
    index,
    element,
  };

  return object;
};

const initScene = () => {
  if (!containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  // 創建場景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0f);

  // 創建相機
  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(0, 2, 10);
  camera.lookAt(0, 0, 0);

  // 創建 CSS3D 渲染器
  renderer = new CSS3DRenderer();
  renderer.setSize(width, height);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.pointerEvents = "none";
  containerRef.value.appendChild(renderer.domElement);

  // CSS3D 不需要燈光

  // 創建項目組
  projectGroup = new THREE.Group();
  scene.add(projectGroup);

  // 創建卡片
  if (props.projects) {
    props.projects.forEach((project, index) => {
      const card = createProjectCard(project, index, props.projects!.length);
      // 設置初始透明度
      if (card.userData.element) {
        card.userData.element.style.opacity = "0.7";
      }
      projectCards.push(card);
      projectGroup.add(card);
    });
  }

  // CSS3D 不需要 Raycaster

  // 滑鼠移動事件
  mouseMoveHandler = (e: MouseEvent) => {
    if (!containerRef.value) return;
    const rect = containerRef.value.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // 控制旋轉
    targetRotation = (e.clientX / window.innerWidth - 0.5) * 0.5;

    // 更新預覽框位置
    if (previewState.value.visible && previewRef.value) {
      previewState.value.x = e.clientX + 30;
      previewState.value.y = e.clientY + 30;
      gsap.to(previewRef.value, {
        x: previewState.value.x,
        y: previewState.value.y,
        duration: 0.3,
        ease: "power1.out",
      });
    }
  };

  containerRef.value.addEventListener("mousemove", mouseMoveHandler);

  // 動畫循環
  const animate = () => {
    animationId = requestAnimationFrame(animate);

    // 平滑旋轉
    currentRotation += (targetRotation - currentRotation) * 0.05;
    projectGroup.rotation.y = currentRotation;

    // 簡單的 hover 檢測（基於滑鼠位置）
    // 計算滑鼠在圓形上的角度
    const mouseAngle = Math.atan2(mouse.x, -mouse.y);
    const normalizedAngle = ((mouseAngle + Math.PI) / (Math.PI * 2)) % 1;

    // 找到最接近的卡片
    let closestCard: CSS3DObject | null = null;
    let minDistance = Infinity;

    for (let i = 0; i < projectCards.length; i++) {
      const card = projectCards[i];
      const cardAngle = (card.userData.index / projectCards.length) % 1;
      let distance = Math.abs(normalizedAngle - cardAngle);
      if (distance > 0.5) distance = 1 - distance;

      if (distance < minDistance && distance < 0.15) {
        minDistance = distance;
        closestCard = card;
      }
    }

    if (closestCard && hoveredCard !== closestCard) {
      // 新的 hover 卡片
      if (hoveredCard) {
        const prevHovered = hoveredCard;
        gsap.to(prevHovered.scale, {
          x: 0.01,
          y: 0.01,
          z: 0.01,
          duration: 0.3,
        });
        if (prevHovered.userData && prevHovered.userData.element) {
          gsap.to(prevHovered.userData.element, {
            opacity: 0.7,
            duration: 0.3,
          });
        }
      }

      hoveredCard = closestCard;
      const currentCard = closestCard;
      gsap.to(currentCard.scale, {
        x: 0.012,
        y: 0.012,
        z: 0.012,
        duration: 0.3,
      });
      if (currentCard.userData && currentCard.userData.element) {
        gsap.to(currentCard.userData.element, {
          opacity: 1,
          duration: 0.3,
        });
      }

      // 顯示預覽框
      const project = currentCard.userData?.project;
      if (project) {
        const rect = containerRef.value!.getBoundingClientRect();
        previewState.value = {
          visible: true,
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          project: {
            title: project.title,
            description: project.description,
            image: project.image,
          },
        };

        if (previewRef.value) {
          gsap.fromTo(
            previewRef.value,
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.3 }
          );
        }
      }
    } else if (!closestCard && hoveredCard) {
      // 沒有 hover
      const currentHovered = hoveredCard;
      gsap.to(currentHovered.scale, {
        x: 0.01,
        y: 0.01,
        z: 0.01,
        duration: 0.3,
      });
      if (currentHovered.userData && currentHovered.userData.element) {
        gsap.to(currentHovered.userData.element, {
          opacity: 0.7,
          duration: 0.3,
        });
      }
      hoveredCard = null;

      // 隱藏預覽框
      if (previewRef.value) {
        gsap.to(previewRef.value, {
          opacity: 0,
          scale: 0.8,
          duration: 0.2,
          onComplete: () => {
            previewState.value.visible = false;
          },
        });
      }
    }

    renderer.render(scene, camera);
  };

  animate();

  // 視窗大小調整
  const handleResize = () => {
    if (!containerRef.value) return;
    const width = containerRef.value.clientWidth;
    const height = containerRef.value.clientHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  };

  window.addEventListener("resize", handleResize);

  // 清理函數
  return () => {
    window.removeEventListener("resize", handleResize);
    if (containerRef.value && mouseMoveHandler) {
      containerRef.value.removeEventListener("mousemove", mouseMoveHandler);
    }
  };
};

// Vue Lifecycle
onMounted(() => {
  if (props.projects && props.projects.length > 0) {
    initScene();
  }
});

onUnmounted(() => {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
  }
  projectCards.forEach((card) => {
    if (card.userData.element && card.userData.element.parentNode) {
      card.userData.element.parentNode.removeChild(card.userData.element);
    }
  });
  if (containerRef.value && containerRef.value.firstChild) {
    containerRef.value.removeChild(containerRef.value.firstChild);
  }
});

// Watch
watch(
  () => props.projects,
  () => {
    if (props.projects && props.projects.length > 0) {
      // 清理舊的卡片
      projectCards.forEach((card) => {
        if (card.userData.element && card.userData.element.parentNode) {
          card.userData.element.parentNode.removeChild(card.userData.element);
        }
      });
      projectCards = [];

      // 重新初始化場景
      if (containerRef.value && containerRef.value.firstChild) {
        containerRef.value.removeChild(containerRef.value.firstChild);
      }
      nextTick(() => {
        initScene();
      });
    }
  }
);
</script>

<template>
  <div class="project-3d-view w-full h-full relative">
    <div ref="containerRef" class="w-full h-full"></div>

    <!-- 浮動預覽框 -->
    <div
      v-if="previewState.visible && previewState.project"
      ref="previewRef"
      class="project-preview fixed pointer-events-none z-[9999]"
      style="transform: translate(-50%, -50%)">
      <div
        class="preview-card w-64 sm:w-80 rounded-lg overflow-hidden border shadow-2xl"
        :style="{
          borderColor: color ? `${color}50` : 'rgba(255,255,255,0.2)',
          backgroundColor: 'rgba(10, 10, 15, 0.95)',
          backdropFilter: 'blur(20px)',
          boxShadow: color
            ? `0 25px 80px ${color}30, 0 0 50px ${color}20`
            : '0 25px 80px rgba(0,0,0,0.9)',
        }">
        <!-- 圖片 -->
        <div
          v-if="previewState.project.image"
          class="w-full h-48 sm:h-56 overflow-hidden bg-gray-900 relative">
          <img
            :src="previewState.project.image"
            :alt="previewState.project.title"
            class="w-full h-full object-cover" />
        </div>
        <!-- 內容 -->
        <div class="p-4 sm:p-5">
          <h4
            class="text-base sm:text-lg font-semibold mb-2 text-white"
            :style="{ color: color || '#fff' }">
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
  </div>
</template>

<style scoped>
.project-3d-view {
  min-height: 500px;
}
</style>
