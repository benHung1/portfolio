// 行星內容數據結構
export interface PlanetContent {
  id: string
  title: string
  subtitle?: string
  description: string
  icon?: string
  avatar?: string // 頭像圖片 URL
  quote?: string // 勵志名言
  details?: {
    label: string
    value: string
  }[]
  links?: {
    label: string
    url: string
    icon?: string
  }[]
  color?: string // 主題顏色
}

