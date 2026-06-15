"use server";

import og from "open-graph-scraper";
import type { OgMetadata } from "@/types";

export async function fetchMetadata(url: string): Promise<OgMetadata> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: { "User-Agent": "Shelf-Bot/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const html = await response.text();
    const { result } = await og({ html });

    return {
      title: result.ogTitle || getTitleFromHtml(html) || url,
      description: result.ogDescription || null,
      image: extractImageUrl(result.ogImage) || null,
      siteName: result.ogSiteName || null,
    };
  } catch {
    return {
      title: url,
      description: null,
      image: null,
      siteName: null,
    };
  }
}

function getTitleFromHtml(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

function extractImageUrl(image: unknown): string | null {
  if (typeof image === "string") return image;
  if (image && typeof image === "object" && "url" in image) {
    return (image as { url: string }).url;
  }
  if (Array.isArray(image) && image.length > 0) {
    const first = image[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object" && "url" in first) {
      return (first as { url: string }).url;
    }
  }
  return null;
}
