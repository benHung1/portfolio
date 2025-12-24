import { ref, computed, onMounted, onUnmounted } from "vue";

export interface DeviceInfo {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

const width = ref<number>(0);
const height = ref<number>(0);

const updateSize = () => {
  if (typeof window !== "undefined") {
    width.value = window.innerWidth;
    height.value = window.innerHeight;
  }
};

export const useDevice = () => {
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

