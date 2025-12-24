/**
 * 檢查 URL 是否為 PDF 檔案
 */
export const isPdfUrl = (url: string): boolean => {
  return url.endsWith(".pdf");
};

/**
 * 從 URL 中提取檔案名稱
 */
export const getFileNameFromUrl = (url: string): string | undefined => {
  if (!isPdfUrl(url)) return undefined;
  return url.split("/").pop();
};

/**
 * 計算顏色透明度
 */
export const getColorWithOpacity = (
  color: string | undefined,
  opacity: number
): string => {
  if (!color) return `rgba(255,255,255,${opacity})`;
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;
};

/**
 * 獲取連結的目標屬性
 */
export const getLinkTarget = (url: string): string | undefined => {
  return isPdfUrl(url) ? undefined : "_blank";
};

/**
 * 獲取連結的 rel 屬性
 */
export const getLinkRel = (url: string): string | undefined => {
  return isPdfUrl(url) ? undefined : "noopener noreferrer";
};









