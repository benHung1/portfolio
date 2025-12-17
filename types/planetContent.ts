// 行星內容數據結構
export interface PlanetContent {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  icon?: string;
  avatar?: string; // 頭像圖片 URL
  quote?: string; // 勵志名言
  details?: {
    label: string;
    value: string;
  }[];
  strengths?: string[]; // 擅長項目列表
  advantages?: string[]; // 我的優勢
  coreValues?: string[]; // 我的核心價值
  links?: {
    id: string; // 唯一的連結 ID，用於導航邏輯
    label: string;
    url: string;
    icon?: string;
  }[];
  projects?: {
    title: string;
    description?: string;
    url?: string;
    tags?: string[];
    image?: string; // 專案示意圖
  }[];
  color?: string; // 主題顏色
}
