# Ben Hung — Portfolio

洪鈺堂 Ben Hung 的個人作品集。使用 Nuxt 4、Vue 3、TypeScript、SCSS 與 GSAP，支援繁體中文／英文及深淺模式。

## 功能

- 八件作品、分類、案例詳情、正式網站連結及安全返回導覽。
- GSAP ScrollTrigger 捲動場景、雨雪 Canvas 背景、自訂游標及聯絡人物翻牌。
- 可拖曳、碰撞、重新排列的技能遊樂場，附鍵盤入口與中英文用途。
- 幾何 Loading 與頁面準備進度；支援失敗退場及 reduced-motion。
- 聯絡區提供 104、Cake 與 LinkedIn 個人檔案入口。

## 開發與驗證

Node.js 22.12+（22.x）、24.11+（24.x），或 26+。

```sh
npm ci
npm run dev
npm run typecheck
npm run verify
```

開發伺服器預設為 http://127.0.0.1:3000。

## 建置

```sh
# Sites / Cloudflare Worker：dist/server/index.js 與 dist/client
npm run build

# 一般 Node.js SSR：.output/server/index.mjs
npm run build:local
node .output/server/index.mjs
```

網站使用 SSR，透過 `bh-language` cookie 輸出正確語系；HTML 回應為 private / no-cache。請使用支援 SSR 的執行環境，不直接以靜態匯出替換。

`.openai/hosting.json` 保存 Sites 站點識別，不包含憑證。部署 token 只在受支援的發布流程中暫時使用，不寫入專案。

## 內容與互動

| 位置 | 用途 |
| --- | --- |
| `app/data/messages.ts` | 雙語介面、經歷與聯絡內容 |
| `app/data/projectCatalog.ts` | 作品、明確排序、圖片、上線與登入狀態 |
| `app/data/playground.ts` | 技能及中英文實務用途 |
| `app/data/profiles.ts` | 履歷與個人檔案連結 |
| `app/utils/portfolioScrollScenes.ts` | 首頁捲動場景與聯絡翻牌 |
| `app/utils/pagePreparation.ts` | 統一 Loading 與進度控制 |
| `app/components/BrandIntro.vue` | 幾何 Loading 視覺 |
| `public/covers/` | 對應作品的實際封面素材 |

## 公開資料邊界

原始履歷 PDF、內部盤點、`.env`、金鑰、快取及建置產物不納入原始碼版本控制。`npm run build` 會執行公開產物檢查，拒絕將私有文件、原始碼對照表或常見憑證內容打包。

圖片用於識別實際參與的作品，不代表現行網站的所有後續改版皆由作者完成。人物照片與作品素材不授予第三方再利用權利。
