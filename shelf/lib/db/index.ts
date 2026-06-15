import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import * as schema from "./schema";

const isServerless = !!(process.env.VERCEL || process.env.NEXT_PUBLIC_VERCEL_ENV);
const dbUrl = isServerless ? ":memory:" : (process.env.DATABASE_URL || "file:.data/data.db");

const client = createClient({ url: dbUrl });
export const db = drizzle(client, { schema });

// 内存模式下自动建表
if (isServerless) {
  const createTables = [
    `CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY, url TEXT NOT NULL, title TEXT NOT NULL,
      description TEXT, image_url TEXT, site_name TEXT, note TEXT,
      tags TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, content TEXT,
      tags TEXT, created_at TEXT NOT NULL, updated_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY, name TEXT NOT NULL UNIQUE, color TEXT, created_at TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS link_tags (
      link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
      tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (link_id, tag_id)
    )`,
    `CREATE TABLE IF NOT EXISTS note_tags (
      note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
      tag_id TEXT REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (note_id, tag_id)
    )`,
  ];
  createTables.forEach((stmt) => client.execute(stmt).catch(() => {}));
}
