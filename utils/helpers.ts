export const isPdfUrl = (url: string): boolean => {
  return url.endsWith(".pdf");
};

export const getFileNameFromUrl = (url: string): string | undefined => {
  if (!isPdfUrl(url)) return undefined;
  return url.split("/").pop();
};

export const getColorWithOpacity = (
  color: string | undefined,
  opacity: number
): string => {
  if (!color) return `rgba(255,255,255,${opacity})`;
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`;
};

export const getLinkTarget = (url: string): string | undefined => {
  return isPdfUrl(url) ? undefined : "_blank";
};

export const getLinkRel = (url: string): string | undefined => {
  return isPdfUrl(url) ? undefined : "noopener noreferrer";
};

















