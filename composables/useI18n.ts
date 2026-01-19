import { ref, computed } from "vue";

export type Locale = "zh" | "en";

const currentLocale = ref<Locale>("zh");

// 翻譯內容
export const translations = {
  zh: {
    landing: {
      greeting: "您好，我是鈺堂",
      title: "歡迎，很高興認識您",
      startButton: "讓我看看！",
      loading: "載入中...",
      language: "語言",
      typing: {
        line1: "歡迎來到我的作品集，我是一名前端開發者",
        line2: "擁有四年以上的開發經驗，熱愛技術，持續學習與成長",
        line3:
          "接下來，將耽誤您一些時間，請點擊下面的按鈕，立即開始探索我的作品集",
      },
    },
    nav: {
      about: "關於我",
      skills: "技能專長",
      experience: "工作經歷",
      portfolio: "作品展示",
      contact: "聯絡資訊",
      reviews: "主管＆同事評價",
      navigation: "導航",
    },
    panel: {
      advantages: "我的優勢",
      valueToCompany: "我能帶給公司的價值",
      coreValues: "我的核心價值",
      expectations: "期望條件",
      featuredProjects: "精選作品",
      supervisorReviews: "主管評價",
      colleagueReviews: "同事評價",
      expand: "展開",
      collapse: "收起",
    },
    planets: {
      earth: {
        title: "關於我",
        subtitle: "About Me",
        description:
          "嗨！我是鈺堂，一位熱愛打造好產品的前端工程師。入職半年就晉升前端主管，平常除了把老闆的想法落地實現、重構公司的後台系統、開發活動/專區相關之專案，也面試新夥伴，輔助幫忙同事解決較為複雜的問題。目前已與團隊完成數十個專案，上線後持續維護優化。\n\n" +
          "我深信技術不只是寫程式碼，更是解決問題、創造價值的工具。在團隊協作中，我注重溝通與效率，喜歡分享知識與經驗，幫助團隊成員成長。面對挑戰時，我總是以積極正面的態度尋找解決方案，並持續學習新技術來提升自己的專業能力。\n\n" +
          "您好，希望您看完後，願意給彼此一個了解的機會，一起打造更好的產品！如果有任何問題，歡迎與我聯繫！",
        quote: "今天的你要比昨天的你更強大",
        details: {
          position: "職位",
          experience: "經驗",
          positionValue: "前端主管",
          experienceValue: "4+ 年",
        },
        links: {
          viewSkills: "看看他會什麼！",
        },
      },
      mercury: {
        title: "技能專長",
        subtitle: "Skills & Technologies",
        description:
          "持續學習新技術，保持對程式設計的熱情。專注於現代 Web 開發技術棧。",
        quote: "持續學習，保持熱情",
        details: {
          framework: "前端框架",
          language: "前端語言",
          threeD: "3D 開發",
          tools: "工具",
          frameworkValue: "Vue 3, Nuxt.js, Tailwind, Bootstrap",
          languageValue: "Typescript, Javascript",
          threeDValue: "Three.js, WebGL",
          toolsValue: "Git, Docker, CI/CD, NPM, GitLab, GitHub",
        },
        advantages: [
          "協助公司招募前端人才，負責面試與評估候選人，為團隊注入新血並建立完善的人才庫，確保團隊持續成長",
          "帶領前端團隊完成多個大型專案，從需求分析、技術規劃到上線部署全程參與，確保專案品質與時程",
          "負責前端架構規劃、技術選型與部署流程設計，建立標準化開發流程，確保專案穩定運行與後續維護",
        ],
        links: {
          viewExperience: "看看他的工作經歷！",
        },
      },
      mars: {
        title: "工作經歷",
        subtitle: "Work Experience",
        description:
          "在三立電視與全球華人媒體的工作經驗中，負責開發與維護多個重要專案。從後台系統重構到活動專區開發及舊專案維護，持續優化使用者體驗並提升系統效能。",
        quote: "技術是解決現實問題和創造持久價值的工具",
        details: {
          company1: "三立電視",
          company2: "全球華人",
          role1: "前端工程師",
          role2: "前端主管",
        },
        coreValues: [
          "入職半年即升任主任，展現快速學習與適應能力，持續追求個人與團隊成長，建立團隊開發規範並提升整體效能",
          "獨立打造高可擴展的活動專案模板與模組基底，讓公司能快速複製並建立新專案，已成功應用於超過 200 家合作客戶",
          "建立跨專案共用的 Web Components 組件庫，讓多個獨立活動網站共用同一套組件，顯著降低開發與維護成本",
          "成功導入 Nuxt 3 技術棧（由 Vite 起手），主導並參與所有大中小型活動重構與開發，大幅提升專案維護性、效能與開發效率",
        ],
        links: {
          viewPortfolio: "看看他的作品集！",
        },
      },
      saturn: {
        title: "作品展示",
        subtitle: "Portfolio",
        description: "探索我的專案作品，從 Web 應用程式到互動式 3D 體驗。",
        details: {
          count: "專案數量",
          type: "類型",
          status: "狀態",
          countValue: "10+ 個",
          typeValue: "Web App, 3D, Mobile",
          statusValue: "持續更新中",
        },
        links: {
          viewReviews: "看看他的評價！",
        },
        projects: {
          events: {
            title: "各子專區",
            description: "各專區相關專案開發與維護",
          },
          webComponents: {
            title: "Web Components 組件庫",
            description: "跨專案共用的組件庫，顯著降低開發與維護成本",
          },
          admin: {
            title: "後台重構",
            description: "重構公司後台系統，提升效能與維護性",
          },
          template: {
            title: "活動專案模板系統",
            description:
              "高可擴展的活動專案模板，已成功應用於超過 200 家合作客戶",
          },
          aiMatch: {
            title: "婚戀聊天室",
            description: "AI 配對聊天室系統",
          },
        },
      },
      contact: {
        title: "聯絡資訊",
        subtitle: "Contact Information",
        description:
          "感謝您看到這裡\n\n歡迎與我聯繫，讓我們一起創造更多可能性。",
        details: {
          email: "信箱",
          phone: "手機",
          emailValue: "ga2006206521@gmail.com",
          phoneValue: "0971-826-616",
        },
        advantages: [
          "具備豐富的前端開發經驗與團隊領導能力，能夠快速理解業務需求並轉化為技術方案",
          "擁有重構大型系統與建立組件庫的經驗，能夠提升團隊開發效率與程式碼品質",
          "熟悉現代前端技術棧，能夠導入新技術並建立標準化開發流程，確保專案穩定運行",
          "具備面試與人才招募經驗，能夠協助建立優秀的技術團隊，為公司注入新血",
        ],
        coreValues: [
          "薪資期望：月薪 100,000+ 以上，年薪 130 萬以上",
          "工作模式：全遠端或者一週至少有一天遠端或彈性上班",
          "上下班時間：彈性上下班",
        ],
        links: {
          resume1111: "1111 履歷",
          resume104: "104 履歷",
          resumeCake: "cakeresume 履歷",
        },
      },
      reviews: {
        title: "主管＆同事評價",
        subtitle: "Reviews & Feedback",
        description:
          "來自主管與同事的真實評價，展現我在團隊中的表現與價值。",
        quote: "團隊合作，共同成長",
        advantages: {
          supervisors: [
            {
              name: "yao",
              role: "工程部 協理",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-01m.webp",
              content: "阿班在技術能力上表現優秀，能夠快速理解複雜的業務需求並轉化為可行的技術方案。他在團隊協作中展現出良好的溝通能力，總能清楚地傳達技術概念。唯一的小缺點是出勤時間比較固定，每天穩定九點上班，表定是八點半，這點確實沒有彈性，但至少很準時！",
            },
            {
              name: "jason",
              role: "工程部 總經理",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-03m.webp",
              content: "阿班是個很有責任感的工程師，對專案品質要求高，能夠確保專案按時交付且品質優良。他在技術選型和架構設計上有獨到的見解，是團隊中值得信賴的夥伴。不過他的上班時間真的很穩定，九點準時到，表定八點半對他來說可能只是參考值，這點倒是挺有個人風格的。",
            },
            {
              name: "james",
              role: "工程部 經理",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-07m.webp",
              content: "阿班的技術能力強，能夠快速解決複雜問題，並提供優雅的解決方案。在團隊中總是能提出創新的想法，幫助團隊成員成長。他的工作態度積極，對專案投入度高。唯一可以改進的是出勤時間，每天九點準時到，表定八點半對他來說似乎只是個建議，但至少他從不遲到，這也算是一種穩定吧！",
            },
            {
              name: "宇",
              role: "工程部 經理",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-08m.webp",
              content: "阿班是個優秀的前端工程師，技術能力全面，從 Vue、Nuxt 到 Three.js 都能熟練運用。他在團隊中扮演重要的技術顧問角色，總能協助解決技術難題。溝通能力佳，能夠清楚表達技術概念。唯一的小問題是出勤時間，每天穩定九點到，表定八點半對他來說可能太早了，但至少他從不遲到，這也算是一種另類的準時吧！",
            },
          ],
          colleagues: [
            {
              name: "ryder",
              role: "前端主任",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-04m.webp",
              content: "班班是個很棒的技術夥伴，技術能力強，能夠快速解決複雜問題。在團隊協作中總是能提出創新的想法，幫助大家成長。他的程式碼品質很高，寫出來的東西總是既優雅又實用。唯一的小缺點是出勤時間，每天穩定九點到，表定八點半對他來說可能只是個參考，但至少他從不遲到，這點倒是挺有個人特色的！",
            },
            {
              name: "elis",
              role: "member",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-05w.webp",
              content: "班班是個很熱心的同事，技術能力強，遇到問題時總是很樂意幫忙。他的溝通能力很好，能夠清楚解釋技術概念，讓團隊成員更容易理解。在專案開發中總是能提供優雅的解決方案。唯一可以改進的是出勤時間，每天九點準時到，表定八點半對他來說可能太早了，但至少他從不遲到，這也算是一種另類的準時吧！",
            },
            {
              name: "yichia",
              role: "member",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-04w.webp",
              content: "班班是個很可靠的同事，技術能力全面，從前端框架到 3D 開發都能熟練運用。他在團隊中總是能提出創新的想法，幫助大家解決技術難題。溝通能力佳，能夠清楚表達技術概念。唯一的小問題是出勤時間，每天穩定九點到，表定八點半對他來說可能只是個建議，但至少他從不遲到，這點倒是挺有個人風格的！",
            },
            {
              name: "小楊",
              role: "member",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-05m.webp",
              content: "班班是個很棒的技術夥伴，技術能力強，能夠快速解決複雜問題並提供優雅的解決方案。在團隊協作中總是能提出創新的想法，幫助大家成長。他的程式碼品質很高，寫出來的東西總是既優雅又實用。唯一的小缺點是出勤時間，每天穩定九點到，表定八點半對他來說可能只是個參考值，但至少他從不遲到，這也算是一種穩定吧！",
            },
          ],
        },
        links: {
          viewContact: "我想要了解更多！",
        },
      },
    },
  },
  en: {
    landing: {
      greeting: "Hello, I am Ben Hung",
      title: "greetings, its a pleasure to meet you",
      startButton: "Let me see!",
      loading: "Loading...",
      language: "Language",
      typing: {
        line1: "Welcome to my portfolio. I'm a frontend developer",
        line2:
          "With over four years of experience, passionate about technology, always learning and growing",
        line3:
          "Next, I'll take some of your time. Please click the button below to start exploring my portfolio",
      },
    },
    nav: {
      about: "About Me",
      skills: "Skills & Technologies",
      experience: "Work Experience",
      portfolio: "Portfolio",
      contact: "Contact Information",
      reviews: "Reviews & Feedback",
      navigation: "Navigation",
    },
    panel: {
      advantages: "My Advantages",
      valueToCompany: "Value I Can Bring to the Company",
      coreValues: "My Core Values",
      expectations: "Expectations",
      featuredProjects: "Featured Projects",
      supervisorReviews: "Supervisor Reviews",
      colleagueReviews: "Colleague Reviews",
      expand: "Expand",
      collapse: "Collapse",
    },
    planets: {
      earth: {
        title: "About Me",
        subtitle: "About Me",
        description:
          "Hi! I'm Yutang, a frontend engineer who loves building great products. I was promoted to frontend lead within six months of joining. In addition to implementing the boss's ideas, refactoring the company's backend system, and developing event/zone-related projects, I also interview new team members and help colleagues solve complex problems. I have completed dozens of projects with the team and continue to maintain and optimize them after launch.\n\n" +
          "I firmly believe that technology is not just about writing code, but a tool for solving problems and creating value. In team collaboration, I focus on communication and efficiency, enjoy sharing knowledge and experience, and help team members grow. When facing challenges, I always seek solutions with a positive attitude and continuously learn new technologies to improve my professional capabilities.\n\n" +
          "Hello, I hope after reading this, you're willing to give us a chance to understand each other and build better products together! If you have any questions, please feel free to contact me!",
        quote: "Today you should be stronger than yesterday",
        details: {
          position: "Position",
          experience: "Experience",
          positionValue: "Frontend Lead",
          experienceValue: "4+ Years",
        },
        links: {
          viewSkills: "See What I Can Do!",
        },
      },
      mercury: {
        title: "Skills & Technologies",
        subtitle: "Skills & Technologies",
        description:
          "Continuously learning new technologies and maintaining passion for programming. Focused on modern web development technology stack.",
        quote: "Keep learning, stay passionate",
        details: {
          framework: "Frontend Framework",
          language: "Frontend Language",
          threeD: "3D Development",
          tools: "Tools",
          frameworkValue: "Vue 3, Nuxt.js, Tailwind, Bootstrap",
          languageValue: "Typescript, Javascript",
          threeDValue: "Three.js, WebGL",
          toolsValue: "Git, Docker, CI/CD, NPM, GitLab, GitHub",
        },
        advantages: [
          "Assist the company in recruiting frontend talent, responsible for interviewing and evaluating candidates, injecting new blood into the team and building a comprehensive talent pool to ensure continuous team growth",
          "Lead the frontend team to complete multiple large-scale projects, participating in the entire process from requirements analysis, technical planning to deployment, ensuring project quality and schedule",
          "Responsible for frontend architecture planning, technology selection and deployment process design, establishing standardized development processes to ensure stable project operation and subsequent maintenance",
        ],
        links: {
          viewExperience: "See My Work Experience!",
        },
      },
      mars: {
        title: "Work Experience",
        subtitle: "Work Experience",
        description:
          "In my work experience at SET TV and Global Chinese Media, I was responsible for developing and maintaining multiple important projects. From backend system refactoring to event zone development and legacy project maintenance, I continuously optimize user experience and improve system performance.",
        quote:
          "Technology is a tool for solving real-world problems and creating lasting value",
        details: {
          company1: "SET TV",
          company2: "Global Chinese Media",
          role1: "Frontend Engineer",
          role2: "Frontend Lead",
        },
        coreValues: [
          "Promoted to lead within six months of joining, demonstrating rapid learning and adaptability, continuously pursuing personal and team growth, establishing team development standards and improving overall efficiency",
          "Independently built highly scalable event project templates and module bases, enabling the company to quickly replicate and establish new projects, successfully applied to over 200 partner clients",
          "Established a cross-project shared Web Components library, allowing multiple independent event websites to share the same set of components, significantly reducing development and maintenance costs",
          "Successfully introduced Nuxt 3 technology stack (starting with Vite), leading and participating in all large, medium and small event refactoring and development, greatly improving project maintainability, performance and development efficiency",
        ],
        links: {
          viewPortfolio: "See My Portfolio!",
        },
      },
      saturn: {
        title: "Portfolio",
        subtitle: "Portfolio",
        description:
          "Explore my project works, from web applications to interactive 3D experiences.",
        details: {
          count: "Project Count",
          type: "Type",
          status: "Status",
          countValue: "10+ Projects",
          typeValue: "Web App, 3D, Mobile",
          statusValue: "Continuously Updated",
        },
        links: {
          viewContact: "I Want to Know More!",
        },
        projects: {
          events: {
            title: "Sub-zones",
            description: "Development and maintenance of zone-related projects",
          },
          webComponents: {
            title: "Web Components Library",
            description:
              "Cross-project shared component library, significantly reducing development and maintenance costs",
          },
          admin: {
            title: "Backend Refactoring",
            description:
              "Refactored company backend system, improving performance and maintainability",
          },
          template: {
            title: "Event Project Template System",
            description:
              "Highly scalable event project template, successfully applied to over 200 partner clients",
          },
          aiMatch: {
            title: "Dating Chatroom",
            description: "AI matching chatroom system",
          },
        },
      },
      contact: {
        title: "Contact Information",
        subtitle: "Contact Information",
        description:
          "Thank you for reading this far\n\nPlease feel free to contact me, let us create more possibilities together.",
        details: {
          email: "Email",
          phone: "Phone",
          emailValue: "ga2006206521@gmail.com",
          phoneValue: "0971-826-616",
        },
        advantages: [
          "Rich frontend development experience and team leadership skills, able to quickly understand business requirements and transform them into technical solutions",
          "Experience in refactoring large systems and building component libraries, able to improve team development efficiency and code quality",
          "Familiar with modern frontend technology stack, able to introduce new technologies and establish standardized development processes to ensure stable project operation",
          "Experience in interviewing and talent recruitment, able to help build excellent technical teams and inject new blood into the company",
        ],
        coreValues: [
          "Salary Expectation: Monthly salary 100,000+ NTD, Annual salary 1.3M+ NTD",
          "Work Mode: At least one remote or flexible work day per month",
          "Working Hours: Flexible working hours",
        ],
        links: {
          resume1111: "1111 Resume",
          resume104: "104 Resume",
          resumeCake: "CakeResume Resume",
        },
      },
      reviews: {
        title: "Reviews & Feedback",
        subtitle: "Reviews & Feedback",
        description:
          "Real feedback from supervisors and colleagues, showcasing my performance and value in the team.",
        quote: "Team collaboration, grow together",
        advantages: {
          supervisors: [
            {
              name: "Yao",
              role: "Engineering Department VP",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-01m.webp",
              content: "Ben is excellent in technical capabilities, able to quickly understand complex business requirements and transform them into feasible technical solutions. He demonstrates good communication skills in team collaboration and can always clearly convey technical concepts. The only minor drawback is his attendance time - he consistently arrives at 9 AM, while the scheduled time is 8:30 AM. There's no flexibility there, but at least he's always on time!",
            },
            {
              name: "Jason",
              role: "Engineering Department General Manager",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-03m.webp",
              content: "Ben is a very responsible engineer with high standards for project quality, able to ensure projects are delivered on time with excellent quality. He has unique insights in technology selection and architecture design, making him a trusted partner in the team. However, his work hours are really consistent - he arrives at 9 AM sharp, while the scheduled time of 8:30 AM might just be a reference for him. This is quite characteristic of his personal style!",
            },
            {
              name: "James",
              role: "Engineering Department Manager",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-07m.webp",
              content: "Ben has strong technical skills and can quickly solve complex problems while providing elegant solutions. He always brings innovative ideas to the team and helps team members grow. His work attitude is positive and he's highly committed to projects. The only area for improvement is attendance time - he arrives at 9 AM sharp every day, while the scheduled 8:30 AM seems to be just a suggestion for him. But at least he's never late, which is a kind of stability!",
            },
            {
              name: "Yu",
              role: "Engineering Department Manager",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-08m.webp",
              content: "Ben is an excellent frontend engineer with comprehensive technical skills, proficient in everything from Vue, Nuxt to Three.js. He plays an important role as a technical advisor in the team and can always help solve technical challenges. He has good communication skills and can clearly express technical concepts. The only minor issue is attendance time - he consistently arrives at 9 AM, while the scheduled 8:30 AM might be too early for him. But at least he's never late, which is a kind of alternative punctuality!",
            },
          ],
          colleagues: [
            {
              name: "Ryder",
              role: "Frontend Lead",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-04m.webp",
              content: "Benben is a great technical partner with strong technical skills who can quickly solve complex problems. In team collaboration, he always brings innovative ideas and helps everyone grow. His code quality is high, and what he writes is always both elegant and practical. The only minor drawback is attendance time - he consistently arrives at 9 AM, while the scheduled 8:30 AM might just be a reference for him. But at least he's never late, which is quite characteristic!",
            },
            {
              name: "Elis",
              role: "Member",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-05w.webp",
              content: "Benben is a very helpful colleague with strong technical skills who's always willing to help when problems arise. He has good communication skills and can clearly explain technical concepts, making it easier for team members to understand. In project development, he can always provide elegant solutions. The only area for improvement is attendance time - he arrives at 9 AM sharp, while the scheduled 8:30 AM might be too early for him. But at least he's never late, which is a kind of alternative punctuality!",
            },
            {
              name: "Yichia",
              role: "Member",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-04w.webp",
              content: "Benben is a very reliable colleague with comprehensive technical skills, proficient in everything from frontend frameworks to 3D development. In the team, he always brings innovative ideas and helps everyone solve technical challenges. He has good communication skills and can clearly express technical concepts. The only minor issue is attendance time - he consistently arrives at 9 AM, while the scheduled 8:30 AM might just be a suggestion for him. But at least he's never late, which is quite characteristic!",
            },
            {
              name: "Xiao Yang",
              role: "Member",
              avatar: "https://images.1111.com.tw/event/img/event25/aiMatch/avatars/personality-avatar-05m.webp",
              content: "Benben is a great technical partner with strong technical skills who can quickly solve complex problems and provide elegant solutions. In team collaboration, he always brings innovative ideas and helps everyone grow. His code quality is high, and what he writes is always both elegant and practical. The only minor drawback is attendance time - he consistently arrives at 9 AM, while the scheduled 8:30 AM might just be a reference value for him. But at least he's never late, which is a kind of stability!",
            },
          ],
        },
        links: {
          viewContact: "I want to know more!",
        },
      },
    },
  },
} as const;

export const useI18n = () => {
  const locale = computed(() => currentLocale.value);
  const t = computed(() => translations[currentLocale.value]);

  const setLocale = (newLocale: Locale) => {
    currentLocale.value = newLocale;
  };

  const toggleLocale = () => {
    currentLocale.value = currentLocale.value === "zh" ? "en" : "zh";
  };

  return {
    locale,
    t,
    setLocale,
    toggleLocale,
  };
};
