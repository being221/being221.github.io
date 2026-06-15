import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 生成唯一 ID */
export function generateId(): string {
  return uuidv4();
}

/** 获取当前 ISO 时间戳 */
export function now(): string {
  return new Date().toISOString();
}

/** 序列化 tags 数组为 JSON 字符串 */
export function serializeTags(tags: string[]): string {
  return JSON.stringify(tags.filter(Boolean));
}

/** 反序列化 tags JSON 字符串为数组 */
export function deserializeTags(tagsStr: string | null): string[] {
  if (!tagsStr) return [];
  try {
    const parsed = JSON.parse(tagsStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** 截断文本 */
export function truncate(text: string, maxLength: number = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "…";
}

/** 提取域名 */
export function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return url;
  }
}

/** 格式化日期 */
export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
