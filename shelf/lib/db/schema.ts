import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";

// ===== 链接收藏 =====
export const links = sqliteTable("links", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  siteName: text("site_name"),
  note: text("note"),
  tags: text("tags"), // JSON array string: '["前端","Next.js"]'
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ===== 笔记 =====
export const notes = sqliteTable("notes", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"), // Markdown / HTML
  tags: text("tags"), // JSON array string
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

// ===== 标签 =====
export const tags = sqliteTable("tags", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color"),
  createdAt: text("created_at").notNull(),
});

// ===== 链接-标签关联 =====
export const linkTags = sqliteTable("link_tags", {
  linkId: text("link_id").references(() => links.id, { onDelete: "cascade" }),
  tagId: text("tag_id").references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.linkId, table.tagId] }),
}));

// ===== 笔记-标签关联 =====
export const noteTags = sqliteTable("note_tags", {
  noteId: text("note_id").references(() => notes.id, { onDelete: "cascade" }),
  tagId: text("tag_id").references(() => tags.id, { onDelete: "cascade" }),
}, (table) => ({
  pk: primaryKey({ columns: [table.noteId, table.tagId] }),
}));
