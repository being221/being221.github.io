"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { links } from "@/lib/db/schema";
import { generateId, now, serializeTags, deserializeTags } from "@/lib/utils";
import { fetchMetadata } from "@/lib/metadata";
import type { Link, LinkFormData } from "@/types";

/** 获取所有收藏 */
export async function getLinks(query?: string): Promise<Link[]> {
  let rows;
  if (query) {
    const pattern = `%${query}%`;
    rows = await db
      .select()
      .from(links)
      .where(
        sql`${links.title} LIKE ${pattern} OR ${links.description} LIKE ${pattern} OR ${links.note} LIKE ${pattern} OR ${links.tags} LIKE ${pattern}`
      )
      .orderBy(sql`${links.createdAt} DESC`);
  } else {
    rows = await db.select().from(links).orderBy(sql`${links.createdAt} DESC`);
  }

  return rows.map((row) => ({
    ...row,
    description: row.description ?? null,
    imageUrl: row.imageUrl ?? null,
    siteName: row.siteName ?? null,
    note: row.note ?? null,
    tags: deserializeTags(row.tags),
  }));
}

/** 添加收藏 */
export async function addLink(data: LinkFormData) {
  const id = generateId();
  const timestamp = now();

  await db.insert(links).values({
    id,
    url: data.url,
    title: data.url,
    description: null,
    imageUrl: null,
    siteName: null,
    note: data.note ?? null,
    tags: data.tags ? serializeTags(data.tags) : "[]",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  // 异步抓取元数据
  fetchMetadata(data.url).then(async (meta) => {
    await db
      .update(links)
      .set({
        title: meta.title || data.url,
        description: meta.description,
        imageUrl: meta.image,
        siteName: meta.siteName,
        updatedAt: now(),
      })
      .where(eq(links.id, id));
  });

  revalidatePath("/");
  return { success: true, id };
}

/** 删除收藏 */
export async function deleteLink(id: string) {
  await db.delete(links).where(eq(links.id, id));
  revalidatePath("/");
  return { success: true };
}

/** 更新收藏备注 */
export async function updateLinkNote(id: string, note: string) {
  await db
    .update(links)
    .set({ note, updatedAt: now() })
    .where(eq(links.id, id));
  revalidatePath("/");
  return { success: true };
}

/** 更新收藏标签 */
export async function updateLinkTags(id: string, tags: string[]) {
  await db
    .update(links)
    .set({ tags: serializeTags(tags), updatedAt: now() })
    .where(eq(links.id, id));
  revalidatePath("/");
  return { success: true };
}

/** 按标签筛选链接 */
export async function getLinksByTag(tag: string): Promise<Link[]> {
  const pattern = `%${tag}%`;
  const rows = await db
    .select()
    .from(links)
    .where(sql`${links.tags} LIKE ${pattern}`)
    .orderBy(sql`${links.createdAt} DESC`);

  return rows.map((row) => ({
    ...row,
    description: row.description ?? null,
    imageUrl: row.imageUrl ?? null,
    siteName: row.siteName ?? null,
    note: row.note ?? null,
    tags: deserializeTags(row.tags),
  }));
}
