import type { PlanetContent } from "../types/planetContent";
import type { Locale } from "../composables/useI18n";
import { translations } from "../composables/useI18n";
import { PLANET_IDS } from "../utils/constants";

// 行星內容數據
export const planetContents: Record<string, PlanetContent> = {
  earth: {
    id: "earth",
    title: "關於我",
    subtitle: "About Me",
    description:
      "嗨！我是鈺堂，一位熱愛打造好產品的前端工程師。入職半年就晉升前端主管，平常除了把老闆的想法落地實現、重構公司的後台系統、開發活動/專區相關之專案，也面試新夥伴，輔助幫忙同事解決較為複雜的問題。目前已與團隊完成數十個專案，上線後持續維護優化。\n\n" +
      "我深信技術不只是寫程式碼，更是解決問題、創造價值的工具。在團隊協作中，我注重溝通與效率，喜歡分享知識與經驗，幫助團隊成員成長。面對挑戰時，我總是以積極正面的態度尋找解決方案，並持續學習新技術來提升自己的專業能力。\n\n" +
      "希望您看完後，願意給彼此一個了解的機會，一起打造更好的產品。如果有任何問題，歡迎與我聯繫！",
    color: "#4db2ff",
    quote: "今天的你要比昨天的你更強大",
    avatar: "/portfolio.jpg",
    details: [
      { label: "職位", value: "前端主管" },
      { label: "經驗", value: "4+ 年" },
    ],
    links: [{ id: "view-skills", label: "看看他會什麼！", url: "/about" }],
  },
  mercury: {
    id: "mercury",
    title: "技能專長",
    subtitle: "Skills & Technologies",
    description:
      "持續學習新技術，保持對程式設計的熱情。專注於現代 Web 開發技術棧。",
    color: "#8c7853",
    quote: "持續學習，保持熱情",
    details: [
      {
        label: "前端框架",
        value: "Vue 3, Nuxt.js, Tailwind, Bootstrap",
      },
      { label: "前端語言", value: "Typescript, Javascript" },
      { label: "3D 開發", value: "Three.js, WebGL" },
      { label: "工具", value: "Git, Docker, CI/CD, NPM, GitLab, GitHub" },
    ],
    advantages: [
      "協助公司招募前端人才，負責面試與評估候選人，為團隊注入新血並建立完善的人才庫，確保團隊持續成長",
      "帶領前端團隊完成多個大型專案，從需求分析、技術規劃到上線部署全程參與，確保專案品質與時程",
      "負責前端架構規劃、技術選型與部署流程設計，建立標準化開發流程，確保專案穩定運行與後續維護",
    ],
    links: [
      {
        id: "view-experience",
        label: "看看他的工作經歷！",
        url: "/WorkExperience",
      },
    ],
  },
  mars: {
    id: "mars",
    title: "工作經歷",
    subtitle: "Work Experience",
    description:
      "在三立電視與全球華人媒體的工作經驗中，負責開發與維護多個重要專案。從後台系統重構到活動專區開發及舊專案維護，持續優化使用者體驗並提升系統效能。",
    color: "#cd5c5c",
    quote: "技術是解決現實問題和創造持久價值的工具",
    details: [
      { label: "三立電視", value: "前端工程師" },
      { label: "全球華人", value: "前端主管" },
    ],
    coreValues: [
      "入職半年即升任主任，展現快速學習與適應能力，持續追求個人與團隊成長，建立團隊開發規範並提升整體效能",
      "獨立打造高可擴展的活動專案模板與模組基底，讓公司能快速複製並建立新專案，已成功應用於超過 200 家合作客戶",
      "建立跨專案共用的 Web Components 組件庫，讓多個獨立活動網站共用同一套組件，顯著降低開發與維護成本",
      "成功導入 Nuxt 3 技術棧（由 Vite 起手），主導並參與所有大中小型活動重構與開發，大幅提升專案維護性、效能與開發效率",
    ],
    links: [
      { id: "view-portfolio", label: "看看他的作品集！", url: "/projects" },
    ],
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
    links: [{ id: "view-reviews", label: "看看他的評價！", url: "/reviews" }],
    projects: [
      {
        title: "各子專區",
        description: "各專區相關專案開發與維護",
        tags: ["Vue 3", "Nuxt 3", "TypeScript"],
        image: "/events-project.png",
      },
      {
        title: "Web Components 組件庫",
        description: "跨專案共用的組件庫，顯著降低開發與維護成本",
        tags: ["Web Components", "Vue 3", "TypeScript"],
        image: "/web-components.png",
      },
      {
        title: "後台重構",
        description: "重構公司後台系統，提升效能與維護性",
        tags: ["Vue 3", "Nuxt 3", "TypeScript"],
        image: "/admin.png",
      },
      {
        title: "活動專案模板系統",
        description: "高可擴展的活動專案模板，已成功應用於超過 200 家合作客戶",
        tags: ["Vue 3", "Nuxt 3", "TypeScript"],
        image: "/insight.png",
      },
      {
        title: "婚戀聊天室",
        description: "AI 配對聊天室系統",
        tags: ["Vue 3", "Nuxt 3", "TypeScript", "AI"],
        image: "/ai-match.png",
      },
    ],
  },

  contact: {
    id: "contact",
    title: "聯絡資訊",
    subtitle: "Contact Information",
    description:
      "感謝您看到這裡\n\n" + "歡迎與我聯繫，讓我們一起創造更多可能性。",
    color: "#9b59b6",
    details: [
      { label: "信箱", value: "ga2006206521@gmail.com" },
      { label: "手機", value: "0971-826-616" },
    ],
    advantages: [
      "具備豐富的前端開發經驗與團隊領導能力，能夠快速理解業務需求並轉化為技術方案",
      "擁有重構大型系統與建立組件庫的經驗，能夠提升團隊開發效率與程式碼品質",
      "熟悉現代前端技術棧，能夠導入新技術並建立標準化開發流程，確保專案穩定運行",
      "具備面試與人才招募經驗，能夠協助建立優秀的技術團隊，為公司注入新血",
    ],
    coreValues: [
      "薪資期望：月薪 90,000+ 以上，年薪 120 萬以上",
      "工作模式：全遠端或者一週至少有一天遠端或彈性上班",
      "上下班時間：彈性上下班",
    ],
    links: [
      {
        id: "resume-1111",
        label: "1111 履歷",
        url: "/resume-1111.pdf",
      },
      {
        id: "resume-104",
        label: "104 履歷",
        url: "/resume-104.pdf",
      },

      {
        id: "resume-cakeresume",
        label: "cakeresume 履歷",
        url: "/resume-cake.pdf",
      },
    ],
  },
  reviews: {
    id: "reviews",
    title: "主管＆同事評價",
    subtitle: "Reviews & Feedback",
    description:
      "來自主管與同事的真實評價，展現我在團隊中的表現與價值。",
    color: "#90ee90",
    quote: "團隊合作，共同成長",
    advantages: {
      supervisors: [
        {
          name: "林啟軒",
          role: "數位商務部 專案經理",
          avatar: "/cutie.png",
          content: "從整天面對程式碼的工程師，跨足到瞬息萬變的零售業，啟軒坦言初期在門市歷練時曾面臨不小的文化衝擊與適應期。",
        },
        {
          name: "陳大華",
          role: "技術總監",
          avatar: "/cutie.png",
          content: "責任感強，對專案品質要求高，能夠確保專案按時交付且品質優良。是團隊中值得信賴的夥伴。",
        },
      ],
      colleagues: [
        {
          name: "張小明",
          role: "前端團隊 Lead",
          avatar: "/cutie.png",
          content: "技術能力強，能夠快速解決複雜問題，並提供優雅的解決方案。在團隊中總是能提出創新的想法。",
        },
        {
          name: "王美麗",
          role: "產品經理",
          avatar: "/cutie.png",
          content: "溝通能力佳，能夠清楚表達技術概念，協助團隊成員理解與學習。與產品團隊的協作非常順暢。",
        },
      ],
    },
    links: [
      { id: "view-contact", label: "我想要了解更多！", url: "/contact" },
    ],
  },
};

// 根據 menuItem id 獲取內容
export const getPlanetContent = (
  id: string,
  locale: Locale = "zh"
): PlanetContent | null => {
  // 映射 menuItem id 到行星 id
  // 如果 id 已經是 planetId（如 "earth", "mercury" 等），直接使用
  // 否則通過 idMap 映射
  const idMap: Record<string, string> = {
    home: PLANET_IDS.EARTH,
    about: PLANET_IDS.MERCURY, // about 對應技能專長 (mercury)
    projects: PLANET_IDS.MARS, // projects 對應工作經歷 (mars)
    contact: PLANET_IDS.SATURN, // contact menuItem 對應作品展示 (saturn)
    reviews: PLANET_IDS.REVIEWS, // reviews 對應主管＆同事評價
  };

  // 如果 id 已經是有效的 planetId（在 planetContents 中存在），直接使用
  // 否則通過 idMap 映射
  // 注意：PLANET_IDS.CONTACT 是單獨的聯絡資訊星球，應該直接使用，不要映射
  let planetId: string;
  if (planetContents[id]) {
    // 如果 id 已經是有效的 planetId，直接使用（包括 PLANET_IDS.CONTACT）
    planetId = id;
  } else {
    // 否則通過 idMap 映射
    planetId = idMap[id] || id;
  }
  const t =
    translations[locale].planets[
      planetId as keyof typeof translations.zh.planets
    ];

  if (!t) {
    // 如果沒有翻譯，返回原始內容
    return planetContents[planetId] || null;
  }

  // 根據語言構建內容
  const baseContent = planetContents[planetId];
  if (!baseContent) return null;

  // 構建多語言內容
  const content: PlanetContent = {
    ...baseContent,
    title: t.title,
    subtitle: t.subtitle,
    description: t.description,
  };

  // quote 是可選的
  if ("quote" in t && t.quote) {
    content.quote = t.quote;
  }

  // 構建 details
  if (t.details && "details" in baseContent && baseContent.details) {
    const baseContentWithDetails = baseContent as PlanetContent & {
      details: NonNullable<PlanetContent["details"]>;
    };
    switch (planetId) {
      case "earth":
        if ("position" in t.details) {
          content.details = [
            { label: t.details.position, value: t.details.positionValue },
            { label: t.details.experience, value: t.details.experienceValue },
          ];
        }
        break;
      case "mercury":
        if ("framework" in t.details) {
          content.details = [
            { label: t.details.framework, value: t.details.frameworkValue },
            { label: t.details.language, value: t.details.languageValue },
            { label: t.details.threeD, value: t.details.threeDValue },
            { label: t.details.tools, value: t.details.toolsValue },
          ];
        }
        break;
      case "mars":
        if ("company1" in t.details) {
          content.details = [
            { label: t.details.company1, value: t.details.role1 },
            { label: t.details.company2, value: t.details.role2 },
          ];
        }
        break;
      case "saturn":
        if ("count" in t.details) {
          content.details = [
            { label: t.details.count, value: t.details.countValue },
            { label: t.details.type, value: t.details.typeValue },
            { label: t.details.status, value: t.details.statusValue },
          ];
        }
        break;
      case "contact":
        if ("email" in t.details) {
          content.details = [
            { label: t.details.email, value: t.details.emailValue },
            { label: t.details.phone, value: t.details.phoneValue },
          ];
        }
        break;
    }
  }

  // 構建 advantages
  if ("advantages" in t && t.advantages) {
    // 如果是數組，直接複製
    if (Array.isArray(t.advantages)) {
      content.advantages = [...t.advantages];
    } else if (typeof t.advantages === "object" && "supervisors" in t.advantages && "colleagues" in t.advantages) {
      // 如果是主管/同事評價對象，直接複製
      content.advantages = { ...t.advantages };
    }
  }

  // 構建 coreValues
  if ("coreValues" in t && t.coreValues) {
    content.coreValues = [...t.coreValues];
  }

  // 構建 links
  if ("links" in t && t.links && baseContent.links) {
    const linkKeys = Object.keys(t.links) as Array<keyof typeof t.links>;
    content.links = baseContent.links.map((link, index) => {
      const linkKey = linkKeys[index];
      if (linkKey && linkKey in t.links) {
        return {
          ...link,
          label: t.links[linkKey] as string,
        };
      }
      return link;
    });
  }

  // 構建 projects (僅 saturn)
  if (
    planetId === "saturn" &&
    "projects" in t &&
    t.projects &&
    baseContent.projects
  ) {
    const projectKeys = Object.keys(t.projects) as Array<
      keyof typeof t.projects
    >;
    content.projects = baseContent.projects.map((project, index) => {
      const projectKey = projectKeys[index];
      if (projectKey && projectKey in t.projects && t.projects[projectKey]) {
        const projectTranslation = t.projects[projectKey] as {
          title: string;
          description: string;
        };
        return {
          ...project,
          title: projectTranslation.title,
          description: projectTranslation.description,
        };
      }
      return project;
    });
  }

  return content;
};
