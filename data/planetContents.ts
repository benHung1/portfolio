import type { PlanetContent } from "../types/planetContent";

// 行星內容數據
export const planetContents: Record<string, PlanetContent> = {
  earth: {
    id: "earth",
    title: "關於我",
    subtitle: "About Me",
    description:
      "嗨！我是鈺堂，一位熱愛打造好產品的前端工程師。入職半年就升到前端主任，平常除了把老闆的想法落地實現、重構公司的後台系統、開發活動/專區相關之專案，也面試新夥伴，輔助幫忙同事解決較為複雜的問題。目前已與團隊完成數十個專案，上線後持續維護優化。",
    color: "#4db2ff",
    quote: "今天的你要比昨天的你更強大",
    avatar: "/portfolio.jpg",
    details: [
      { label: "職位", value: "前端工程師 - 主任" },
      { label: "經驗", value: "4+ 年" },
    ],
    links: [{ label: "查看更多", url: "/about" }],
  },
  mercury: {
    id: "mercury",
    title: "技能專長",
    subtitle: "Skills & Technologies",
    description:
      "持續學習新技術，保持對程式設計的熱情。專注於現代 Web 開發技術棧。",
    color: "#8c7853",
    details: [
      {
        label: "前端框架",
        value: "Vue 3, Nuxt.js, Tailwind, Bootstrap",
      },
      { label: "前端語言", value: "Typescript, Javascript" },
      { label: "3D 開發", value: "Three.js, WebGL" },
      { label: "工具", value: "Git, Docker, CI/CD, NPM, GitLab, GitHub" },
    ],
    links: [{ label: "查看工作經歷", url: "/WorkExperience" }],
  },
  mars: {
    id: "mars",
    title: "工作經驗",
    subtitle: "Work Experience",
    description:
      "在三立電視與全球華人媒體的工作經驗中，負責開發與維護多個重要專案。從後台系統重構到活動專區開發及舊專案維護，持續優化使用者體驗並提升系統效能。",
    color: "#cd5c5c",
    quote: "技術是解決現實問題和創造持久價值的工具",
    details: [
      { label: "三立電視", value: "前端工程師" },
      { label: "全球華人", value: "前端主任" },
    ],
    links: [{ label: "查看作品集", url: "/projects" }],
  },

  saturn: {
    id: "saturn",
    title: "作品展示",
    subtitle: "Portfolio",
    description: "探索我的專案作品，從 Web 應用程式到互動式 3D 體驗。",
    color: "#fad5a5",
    details: [
      { label: "專案數量", value: "10+ 個" },
      { label: "類型", value: "Web App, 3D, Mobile" },
      { label: "狀態", value: "持續更新中" },
    ],
    links: [
      { label: "查看所有作品", url: "/projects" },
      { label: "GitHub", url: "https://github.com" },
    ],
  },
};

// 根據 menuItem id 獲取內容
export const getPlanetContent = (id: string): PlanetContent | null => {
  // 映射 menuItem id 到行星 id
  const idMap: Record<string, string> = {
    home: "earth",
    earth: "earth", // 地球的直接 id
    about: "mars",
    mars: "mars",
    projects: "saturn",
    saturn: "saturn",
    contact: "mercury",
    mercury: "mercury",
  };

  const planetId = idMap[id] || id;
  return planetContents[planetId] || null;
};
