import { ref, computed, onMounted, onUnmounted } from "vue";

export interface DeviceInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const width = ref<number>(typeof window !== "undefined" ? window.innerWidth : 1024);
const height = ref<number>(typeof window !== "undefined" ? window.innerHeight : 768);

const updateSize = () => {
  if (typeof window !== "undefined") {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }
};

export const useDevice = () => {
  // 確保在客戶端立即初始化
  if (typeof window !== "undefined") {
    updateSize();
  }

  const isMobile = computed(() => width.value < 768);
  const isTablet = computed(() => width.value >= 768 && width.value < 1024);
  const isDesktop = computed(() => width.value >= 1024);

  const deviceInfo = computed<DeviceInfo>(() => ({
    width: width.value,
    height: height.value,
    isMobile: isMobile.value,
    isTablet: isTablet.value,
    isDesktop: isDesktop.value,
  }));

  onMounted(() => {
    updateSize();
    window.addEventListener("resize", updateSize);
  });

  onUnmounted(() => {
    window.removeEventListener("resize", updateSize);
  });

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    deviceInfo,
  };
};

