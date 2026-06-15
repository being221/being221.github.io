"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { tags as tagsTable } from "@/lib/db/schema";
import { generateId, now } from "@/lib/utils";
import type { Tag } from "@/types";

/** 获取所有标签 */
export async function getTags(): Promise<Tag[]> {
  const rows = await db
    .select()
    .from(tagsTable)
    .orderBy(sql`${tagsTable.createdAt} DESC`);

  return rows.map((row) => ({
    ...row,
    color: row.color ?? null,
  }));
}

/** 创建标签 */
export async function createTag(name: string, color?: string) {
  const id = generateId();
  const timestamp = now();

  await db.insert(tagsTable).values({
    id,
    name: name.trim(),
    color: color ?? null,
    createdAt: timestamp,
  });

  revalidatePath("/");
  return { success: true, id };
}

/** 删除标签 */
export async function deleteTag(id: string) {
  await db.delete(tagsTable).where(eq(tagsTable.id, id));
  revalidatePath("/");
  return { success: true };
}

/** 更新标签 */
export async function updateTag(id: string, name: string, color?: string) {
  await db
    .update(tagsTable)
    .set({ name: name.trim(), color: color ?? null })
    .where(eq(tagsTable.id, id));

  revalidatePath("/");
  return { success: true };
}
