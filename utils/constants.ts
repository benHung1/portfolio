// 連結 ID 常數
export const LINK_IDS = {
  VIEW_SKILLS: "view-skills",
  VIEW_EXPERIENCE: "view-experience",
  VIEW_PORTFOLIO: "view-portfolio",
  VIEW_CONTACT: "view-contact",
  RESUME_1111: "resume-1111",
  RESUME_104: "resume-104",
  RESUME_CAKERESUME: "resume-cakeresume",
} as const;

// 行星 ID 常數
export const PLANET_IDS = {
  EARTH: "earth",
  MERCURY: "mercury",
  MARS: "mars",
  SATURN: "saturn",
  CONTACT: "contact",
} as const;

// 動畫常數
export const ANIMATION_CONFIG = {
  PANEL_ENTER: {
    opacity: 0,
    y: 50,
    scale: 0.9,
  },
  PANEL_ENTER_TO: {
    opacity: 1,
    y: 0,
    scale: 1,
    duration: 0.5,
    ease: "power3.out",
  },
  PANEL_FADE_OUT: {
    opacity: 0,
    duration: 0.2,
  },
  PANEL_FADE_IN: {
    opacity: 1,
    duration: 0.3,
  },
  PREVIEW_HIDE: {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: "power2.in",
  },
  PREVIEW_SHOW: {
    opacity: 1,
    scale: 1,
    duration: 0.3,
    ease: "power2.out",
  },
} as const;

// 預覽框配置
export const PREVIEW_CONFIG = {
  OFFSET_X: 30,
  OFFSET_Y: 30,
  WIDTH: 320, // w-80
  HEIGHT: 300, // 估算高度
} as const;









