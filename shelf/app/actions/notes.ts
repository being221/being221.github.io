"use server";

import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { generateId, now, serializeTags, deserializeTags } from "@/lib/utils";
import type { Note, NoteFormData } from "@/types";

/** 获取所有笔记 */
export async function getNotes(query?: string): Promise<Note[]> {
  let rows;
  if (query) {
    const pattern = `%${query}%`;
    rows = await db
      .select()
      .from(notes)
      .where(
        sql`${notes.title} LIKE ${pattern} OR ${notes.content} LIKE ${pattern} OR ${notes.tags} LIKE ${pattern}`
      )
      .orderBy(sql`${notes.updatedAt} DESC`);
  } else {
    rows = await db.select().from(notes).orderBy(sql`${notes.updatedAt} DESC`);
  }

  return rows.map((row) => ({
    ...row,
    content: row.content ?? null,
    tags: deserializeTags(row.tags),
  }));
}

/** 获取单篇笔记 */
export async function getNote(id: string): Promise<Note | null> {
  const row = await db.select().from(notes).where(eq(notes.id, id)).get();
  if (!row) return null;

  return {
    ...row,
    content: row.content ?? null,
    tags: deserializeTags(row.tags),
  };
}

/** 创建笔记 */
export async function createNote(data: NoteFormData) {
  const id = generateId();
  const timestamp = now();

  await db.insert(notes).values({
    id,
    title: data.title,
    content: data.content ?? "",
    tags: data.tags ? serializeTags(data.tags) : "[]",
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  revalidatePath("/notes");
  return { success: true, id };
}

/** 更新笔记 */
export async function updateNote(id: string, data: Partial<NoteFormData>) {
  const updates: Record<string, unknown> = { updatedAt: now() };
  if (data.title !== undefined) updates.title = data.title;
  if (data.content !== undefined) updates.content = data.content;
  if (data.tags !== undefined) updates.tags = serializeTags(data.tags);

  await db.update(notes).set(updates).where(eq(notes.id, id));

  revalidatePath("/notes");
  revalidatePath(`/notes/${id}`);
  return { success: true };
}

/** 删除笔记 */
export async function deleteNote(id: string) {
  await db.delete(notes).where(eq(notes.id, id));
  revalidatePath("/notes");
  return { success: true };
}

// ===== 编辑器适配 wrapper =====
export async function createNoteSimple(title: string, content: string) {
  return createNote({ title, content });
}

export async function updateNoteSimple(id: string, title: string, content: string) {
  return updateNote(id, { title, content });
}
