# Shelf Phase 1 — MVP 实现计划

> **For agentic workers:** 用 superpowers:subagent-driven-development 或 superpowers:executing-plans 按任务逐步实现。步骤使用 `- [ ]` 复选框语法追踪。

**目标:** 构建 Shelf MVP——单用户收藏链接管理 + Markdown 笔记编辑 + 标签系统 + 关键词搜索的 Next.js 全栈应用。

**架构:** Next.js 15 App Router + Server Actions 处理 CRUD，SQLite (libsql) + Drizzle ORM 持久化，Tailwind + shadcn/ui 做界面，TipTap 做编辑器。所有数据操作通过 Server Actions 完成，无需独立的 API Routes。

**技术栈:** Next.js 15 · TypeScript 5 · Tailwind CSS · shadcn/ui · Drizzle ORM · SQLite (libsql) · TipTap · open-graph-scraper

---

## 文件结构

```
shelf/
├── .env.local                   # DATABASE_URL / AI_API_KEY(Phase2)
├── .env.example
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── drizzle.config.ts            # Drizzle Kit 配置
├── docker-compose.yml           # Phase 2 用，Phase 1 可跳过
├── app/
│   ├── layout.tsx               # 根布局（导航 + 主题 + 字体）
│   ├── page.tsx                 # 首页 —— 收藏列表
│   ├── globals.css              # Tailwind 导入
│   ├── notes/
│   │   ├── page.tsx             # 笔记列表
│   │   └── [id]/
│   │       └── page.tsx         # 笔记详情/编辑
│   └── page.module.css          # 可复用的页面样式
├── components/
│   ├── ui/                      # shadcn/ui 自动生成的组件
│   ├── layout/
│   │   ├── NavBar.tsx           # 顶部导航
│   │   └── Sidebar.tsx          # 侧边栏（标签/统计）
│   ├── links/
│   │   ├── LinkCard.tsx         # 收藏卡片
│   │   ├── LinkForm.tsx         # 添加收藏表单
│   │   └── LinkGrid.tsx         # 收藏卡片网格
│   ├── notes/
│   │   ├── NoteEditor.tsx       # TipTap 编辑器（Markdown 模式）
│   │   ├── NoteList.tsx         # 笔记列表项
│   │   └── NoteCard.tsx         # 笔记卡片
│   ├── tags/
│   │   ├── TagBadge.tsx         # 标签徽章
│   │   ├── TagPicker.tsx        # 标签选择器（输入+建议）
│   │   └── TagFilter.tsx        # 按标签筛选
│   └── search/
│       └── SearchBar.tsx        # 搜索输入框
├── lib/
│   ├── db/
│   │   ├── index.ts             # 数据库连接 + 单例
│   │   └── schema.ts            # Drizzle Schema 定义
│   ├── metadata.ts              # open-graph-scraper 抓取
│   ├── utils.ts                 # 工具函数（cn, slug 等）
│   └── seed.ts                  # 可选：种子数据脚本
├── drizzle/                     # Drizzle Kit 生成的迁移文件
├── types/
│   └── index.ts                 # 共享 TypeScript 类型
├── public/
│   └── favicon.ico
├── README.md
└── LICENSE                      # MIT（Phase 3，Phase 1 先占位）
```

---

### Task 1: 脚手架 Next.js 项目

**文件:**
- 创建: `shelf/` 整个项目目录

- [ ] **Step 1: 初始化 Next.js 项目**

```bash
cd "d:\邓杰鹏个人主页"
npx create-next-app@latest shelf --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --no-turbopack
```

选择:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- `src/` directory: No
- App Router: Yes (默认)
- Import alias: `@/*` (默认)
- Turbopack: No (不勾选)

- [ ] **Step 2: 进入项目安装基础依赖**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npm install
```

- [ ] **Step 3: 验证 dev server 启动**

```bash
npm run dev
```

打开 http://localhost:3000 看到 Next.js 默认页面。

- [ ] **Step 4: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git init
git add -A
git commit -m "chore: scaffold Next.js 15 with TypeScript and Tailwind"
```

---

### Task 2: 安装核心依赖

**文件:**
- Modify: `shelf/package.json`

- [ ] **Step 1: 安装数据库和后端依赖**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npm install drizzle-orm @libsql/client uuid
npm install -D drizzle-kit @types/uuid
```

- [ ] **Step 2: 安装 UI 依赖**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-toast class-variance-authority clsx lucide-react tailwind-merge
npx shadcn@latest init -d
```

init 时选:
- Style: Default
- Base color: Slate (或随便)
- CSS variables: Yes

- [ ] **Step 3: 安装编辑器 + 元数据抓取**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder open-graph-scraper react-markdown
```

- [ ] **Step 4: 确认 package.json 依赖完整后 Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add package.json package-lock.json
git commit -m "chore: install dependencies — drizzle, shadcn, tiptap, og-scraper"
```

---

### Task 3: 数据库 Schema + 连接

**文件:**
- 创建: `shelf/lib/db/schema.ts`
- 创建: `shelf/lib/db/index.ts`
- 创建: `shelf/drizzle.config.ts`
- 创建: `shelf/.env.local`

- [ ] **Step 1: 编写 Drizzle Schema**

`shelf/lib/db/schema.ts`:

```typescript
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
  content: text("content"), // Markdown
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
```

- [ ] **Step 2: 编写数据库连接**

`shelf/lib/db/index.ts`:

```typescript
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL || "file:./data.db",
});

export const db = drizzle(client, { schema });
```

- [ ] **Step 3: 编写 Drizzle 配置**

`shelf/drizzle.config.ts`:

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: ".data/data.db",
  },
});
```

- [ ] **Step 4: 创建 .env.local 和 .env.example**

`shelf/.env.local`:
```
DATABASE_URL=file:.data/data.db
```

`shelf/.env.example`:
```
DATABASE_URL=file:.data/data.db
# Phase 2:
# AI_API_KEY=sk-...
# AI_MODEL=claude-sonnet-4-6
```

- [ ] **Step 5: 生成迁移并 push 到数据库**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npx drizzle-kit generate
npx drizzle-kit migrate
```

- [ ] **Step 6: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add lib/db/ drizzle/ drizzle.config.ts .env.example
git commit -m "feat: add database schema — links, notes, tags with SQLite + Drizzle"
```

---

### Task 4: 共享类型 + 工具函数

**文件:**
- 创建: `shelf/types/index.ts`
- 创建: `shelf/lib/utils.ts`

- [ ] **Step 1: 定义 TypeScript 类型**

`shelf/types/index.ts`:

```typescript
// === 收藏链接 ===
export interface Link {
  id: string;
  url: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  siteName: string | null;
  note: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LinkFormData {
  url: string;
  note?: string;
  tags?: string[];
}

// === 笔记 ===
export interface Note {
  id: string;
  title: string;
  content: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteFormData {
  title: string;
  content?: string;
  tags?: string[];
}

// === 标签 ===
export interface Tag {
  id: string;
  name: string;
  color: string | null;
  createdAt: string;
}

// === OG 元数据 ===
export interface OgMetadata {
  title: string;
  description: string | null;
  image: string | null;
  siteName: string | null;
}
```

- [ ] **Step 2: 编写工具函数**

`shelf/lib/utils.ts`:

```typescript
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from "uuid";

/** 合并 Tailwind 类名 */
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
```

- [ ] **Step 3: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add types/ lib/utils.ts
git commit -m "feat: add shared types and utility functions"
```

---

### Task 5: URL 元数据抓取

**文件:**
- 创建: `shelf/lib/metadata.ts`

- [ ] **Step 1: 编写元数据抓取函数**

`shelf/lib/metadata.ts`:

```typescript
"use server";

import og from "open-graph-scraper";
import type { OgMetadata } from "@/types";

export async function fetchMetadata(url: string): Promise<OgMetadata> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Shelf-Bot/1.0",
      },
      signal: AbortSignal.timeout(8000),
    });
    const html = await response.text();

    const { result } = await og({ html });

    return {
      title: result.ogTitle || result.title || getTitleFromHtml(html) || url,
      description: result.ogDescription || null,
      image: extractImageUrl(result.ogImage) || null,
      siteName: result.ogSiteName || null,
    };
  } catch {
    // 抓取失败返回基础信息
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
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add lib/metadata.ts
git commit -m "feat: add URL metadata scraper with OG tags"
```

---

### Task 6: Server Actions — 链接 CRUD

**文件:**
- 创建: `shelf/app/actions/links.ts`

- [ ] **Step 1: 创建 actions 目录和链接操作文件**

`shelf/app/actions/links.ts`:

```typescript
"use server";

import { revalidatePath } from "next/cache";
import { eq, like, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { links, linkTags, tags as tagsTable } from "@/lib/db/schema";
import { generateId, now, serializeTags, deserializeTags } from "@/lib/utils";
import { fetchMetadata } from "@/lib/metadata";
import type { Link, LinkFormData } from "@/types";

/** 获取所有收藏 */
export async function getLinks(query?: string): Promise<Link[]> {
  let rows;
  if (query) {
    rows = await db
      .select()
      .from(links)
      .where(
        sql`${links.title} LIKE ${"%" + query + "%"} OR ${links.note} LIKE ${"%" + query + "%"} OR ${links.tags} LIKE ${"%" + query + "%"}`
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

  // 先存 URL，后异步更新元数据
  await db.insert(links).values({
    id,
    url: data.url,
    title: data.url, // 临时标题
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
  const rows = await db
    .select()
    .from(links)
    .where(sql`${links.tags} LIKE ${"%" + tag + "%"}`)
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
```

- [ ] **Step 2: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/actions/links.ts
git commit -m "feat: add link CRUD server actions"
```

---

### Task 7: Server Actions — 笔记 CRUD

**文件:**
- 创建: `shelf/app/actions/notes.ts`

> **设计说明:** NoteEditor 组件的 onSave 签名是 `(title: string, content: string) => Promise<void>`。为匹配这个签名，除基础 CRUD 外额外导出两个 wrapper：`createNoteSimple(title, content)` 和 `updateNoteSimple(id, title, content)`，它们内部调用基础 CRUD 函数。

- [ ] **Step 1: 编写笔记操作**

`shelf/app/actions/notes.ts`:

```typescript
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
    rows = await db
      .select()
      .from(notes)
      .where(
        sql`${notes.title} LIKE ${"%" + query + "%"} OR ${notes.content} LIKE ${"%" + query + "%"} OR ${notes.tags} LIKE ${"%" + query + "%"}`
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

// ===== 编辑器适配 wrapper（匹配 NoteEditor onSave 签名） =====

export async function createNoteSimple(title: string, content: string) {
  return createNote({ title, content });
}

export async function updateNoteSimple(id: string, title: string, content: string) {
  return updateNote(id, { title, content });
}
```

- [ ] **Step 2: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/actions/notes.ts
git commit -m "feat: add note CRUD server actions"
```

---

### Task 8: Server Actions — 标签 CRUD

**文件:**
- 创建: `shelf/app/actions/tags.ts`

- [ ] **Step 1: 编写标签操作**

`shelf/app/actions/tags.ts`:

```typescript
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
```

- [ ] **Step 2: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/actions/tags.ts
git commit -m "feat: add tag CRUD server actions"
```

---

### Task 9: 全局布局 + 导航栏

**文件:**
- Modify: `shelf/app/layout.tsx`
- Modify: `shelf/app/globals.css`
- 创建: `shelf/components/layout/NavBar.tsx`
- 创建: `shelf/components/layout/Sidebar.tsx`
- 创建: `shelf/components/search/SearchBar.tsx`

- [ ] **Step 1: 修改根布局**

`shelf/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Shelf — 知识管理",
  description: "收藏链接、写笔记、AI 加持的知识管理工具",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen`}>
        <NavBar />
        <main className="max-w-6xl mx-auto px-4 py-20">
          {children}
        </main>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: 修改 globals.css**

`shelf/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
  }
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
  }
}

/* TipTap 编辑器样式 */
.tiptap {
  outline: none;
  min-height: 200px;
  padding: 12px 0;
}
.tiptap h1 { font-size: 1.8em; font-weight: 700; margin-top: 1em; }
.tiptap h2 { font-size: 1.4em; font-weight: 600; margin-top: 0.8em; }
.tiptap h3 { font-size: 1.1em; font-weight: 600; margin-top: 0.6em; }
.tiptap p { margin: 0.4em 0; line-height: 1.7; }
.tiptap ul, .tiptap ol { padding-left: 1.5em; margin: 0.4em 0; }
.tiptap blockquote {
  border-left: 3px solid #3b82f6;
  padding-left: 1em;
  margin: 0.6em 0;
  opacity: 0.8;
  font-style: italic;
}
.tiptap code {
  background: rgba(255,255,255,0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}
.tiptap pre {
  background: rgba(0,0,0,0.3);
  padding: 12px 16px;
  border-radius: 8px;
  overflow-x: auto;
  margin: 0.6em 0;
}
.tiptap a {
  color: #60a5fa;
  text-decoration: underline;
}
```

- [ ] **Step 3: 创建导航栏组件**

`shelf/components/layout/NavBar.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bookmark, FileText, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "收藏", icon: Bookmark },
  { href: "/notes", label: "笔记", icon: FileText },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <span className="text-blue-400">📦</span>
          <span>Shelf</span>
        </Link>
        <div className="flex items-center gap-1">
          {navItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                pathname === href
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
```

- [ ] **Step 4: 验证布局**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npm run dev
```

打开 http://localhost:3000，看到顶部导航栏，有「收藏」和「笔记」两个入口。

- [ ] **Step 5: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/layout.tsx app/globals.css components/layout/
git commit -m "feat: add global layout with navbar"
```

---

### Task 10: 添加收藏表单 + 收藏列表页

**文件:**
- 创建: `shelf/components/links/LinkCard.tsx`
- 创建: `shelf/components/links/LinkForm.tsx`
- 创建: `shelf/components/links/LinkGrid.tsx`
- Modify: `shelf/app/page.tsx`
- 创建: `shelf/components/tags/TagBadge.tsx`

- [ ] **Step 1: 创建标签徽章组件**

`shelf/components/tags/TagBadge.tsx`:

```tsx
interface TagBadgeProps {
  tag: string;
  onClick?: () => void;
}

export function TagBadge({ tag, onClick }: TagBadgeProps) {
  return (
    <span
      onClick={onClick}
      className="inline-block px-2 py-0.5 text-xs rounded-full bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 cursor-pointer transition-colors"
    >
      {tag}
    </span>
  );
}
```

- [ ] **Step 2: 创建收藏卡片组件**

`shelf/components/links/LinkCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ExternalLink, Trash2, Pencil } from "lucide-react";
import { TagBadge } from "@/components/tags/TagBadge";
import { deleteLink, updateLinkNote, updateLinkTags } from "@/app/actions/links";
import { formatDate, getDomain } from "@/lib/utils";
import type { Link } from "@/types";

interface LinkCardProps {
  link: Link;
}

export function LinkCard({ link }: LinkCardProps) {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(link.note || "");

  const handleDelete = async () => {
    await deleteLink(link.id);
  };

  const handleSaveNote = async () => {
    await updateLinkNote(link.id, note);
    setEditing(false);
  };

  return (
    <div className="group relative bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-all">
      <div className="flex">
        {link.imageUrl && (
          <div className="relative w-32 h-32 flex-shrink-0">
            <Image
              src={link.imageUrl}
              alt={link.title}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>
        )}
        <div className="flex-1 p-4 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-100 hover:text-blue-400 transition-colors line-clamp-1"
            >
              {link.title}
              <ExternalLink className="inline w-3 h-3 ml-1 opacity-40" />
            </a>
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all flex-shrink-0"
              aria-label="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {link.description && (
            <p className="text-sm text-zinc-400 mt-1 line-clamp-2">
              {link.description}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            <span className="text-xs text-zinc-500">{getDomain(link.url)}</span>
            <span className="text-xs text-zinc-600">{formatDate(link.createdAt)}</span>
          </div>

          {link.tags.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {link.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}

          {editing ? (
            <div className="mt-2">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-blue-500"
                rows={2}
                placeholder="添加备注..."
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleSaveNote}
                  className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded text-white"
                >
                  保存
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs bg-zinc-700 hover:bg-zinc-600 px-3 py-1 rounded text-zinc-300"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            link.note && (
              <p className="text-sm text-zinc-400 mt-2 italic">"{link.note}"</p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 创建添加收藏表单**

`shelf/components/links/LinkForm.tsx`:

```tsx
"use client";

import { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { addLink } from "@/app/actions/links";

export function LinkForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await addLink({ url: url.trim(), tags: tagList });
    setUrl("");
    setTags("");
    setLoading(false);
    setOpen(false);
  };

  return (
    <div className="mb-8">
      {!open ? (
        <button
          onClick={() => {
            setOpen(true);
            setTimeout(() => inputRef.current?.focus(), 100);
          }}
          className="flex items-center gap-2 px-4 py-3 w-full border-2 border-dashed border-zinc-700 rounded-lg text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>添加新链接...</span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="粘贴 URL，自动抓取标题和摘要..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 text-zinc-200"
            required
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="标签（逗号分隔，如：前端, Next.js）"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-sm focus:outline-none focus:border-blue-500 text-zinc-200"
          />
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 text-sm text-zinc-400 hover:text-zinc-200 bg-zinc-800 rounded-md"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-md text-white font-medium"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              收藏
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
```

- [ ] **Step 4: 创建收藏网格组件**

`shelf/components/links/LinkGrid.tsx`:

```tsx
import { LinkCard } from "./LinkCard";
import type { Link } from "@/types";

interface LinkGridProps {
  links: Link[];
}

export function LinkGrid({ links }: LinkGridProps) {
  if (links.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p className="text-4xl mb-4">📭</p>
        <p>还没有收藏任何链接</p>
        <p className="text-sm mt-1">粘贴一个 URL 开始吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => (
        <LinkCard key={link.id} link={link} />
      ))}
    </div>
  );
}
```

- [ ] **Step 5: 创建首页**

`shelf/app/page.tsx`:

```tsx
import { getLinks } from "@/app/actions/links";
import { LinkForm } from "@/components/links/LinkForm";
import { LinkGrid } from "@/components/links/LinkGrid";

export default async function HomePage() {
  const links = await getLinks();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">收藏</h1>
        <span className="text-sm text-zinc-500">{links.length} 个链接</span>
      </div>
      <LinkForm />
      <LinkGrid links={links} />
    </div>
  );
}
```

- [ ] **Step 6: 验证功能**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npm run dev
```

打开 http://localhost:3000 → 看到空收藏页面 → 添加链接 → 显示卡片。

- [ ] **Step 7: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/page.tsx components/links/ components/tags/
git commit -m "feat: add link collection page with add form and cards"
```

---

### Task 11: 笔记列表 + 编辑页面

**文件:**
- 创建: `shelf/components/notes/NoteList.tsx`
- 创建: `shelf/components/notes/NoteEditor.tsx`
- 创建: `shelf/app/notes/page.tsx`
- 创建: `shelf/app/notes/[id]/page.tsx`

- [ ] **Step 1: 创建笔记列表组件**

`shelf/components/notes/NoteList.tsx`:

```tsx
"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { TagBadge } from "@/components/tags/TagBadge";
import { deleteNote } from "@/app/actions/notes";
import { formatDate, truncate } from "@/lib/utils";
import type { Note } from "@/types";

interface NoteListProps {
  notes: Note[];
}

export function NoteList({ notes }: NoteListProps) {
  if (notes.length === 0) {
    return (
      <div className="text-center py-16 text-zinc-500">
        <p className="text-4xl mb-4">📝</p>
        <p>还没有笔记</p>
        <p className="text-sm mt-1">创建你的第一篇笔记吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => (
        <div key={note.id} className="group flex items-center gap-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900 hover:border-zinc-700 transition-colors">
          <Link href={`/notes/${note.id}`} className="flex-1 min-w-0">
            <h3 className="font-medium text-zinc-100 truncate">{note.title}</h3>
            {note.content && (
              <p className="text-sm text-zinc-500 mt-0.5 line-clamp-1">
                {truncate(note.content.replace(/[#*`]/g, ""), 100)}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-zinc-600">{formatDate(note.updatedAt)}</span>
              {note.tags.map((tag) => (
                <TagBadge key={tag} tag={tag} />
              ))}
            </div>
          </Link>
          <button
            onClick={async () => {
              await deleteNote(note.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all flex-shrink-0"
            aria-label="删除笔记"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 创建 TipTap 笔记编辑器**

`shelf/components/notes/NoteEditor.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Save } from "lucide-react";

interface NoteEditorProps {
  initialTitle: string;
  initialContent: string;
  onSave: (title: string, content: string) => Promise<void>;
  isNew?: boolean;
}

export function NoteEditor({ initialTitle, initialContent, onSave, isNew }: NoteEditorProps) {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "开始写点什么..." }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "tiptap",
      },
    },
  });

  const handleSave = useCallback(async () => {
    if (!editor) return;
    setSaving(true);
    await onSave(title, editor.getHTML());
    setSaving(false);
  }, [editor, title, onSave]);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="笔记标题..."
          className="flex-1 text-3xl font-bold bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600"
        />
        <button
          onClick={handleSave}
          disabled={saving || !title.trim()}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "保存中..." : "保存"}
        </button>
      </div>
      <EditorContent editor={editor} className="min-h-[60vh]" />
    </div>
  );
}
```

- [ ] **Step 3: 创建笔记列表页**

`shelf/app/notes/page.tsx`:

```tsx
import Link from "next/link";
import { Plus } from "lucide-react";
import { getNotes } from "@/app/actions/notes";
import { NoteList } from "@/components/notes/NoteList";

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">笔记</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500">{notes.length} 篇</span>
          <Link
            href="/notes/new"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建
          </Link>
        </div>
      </div>
      <NoteList notes={notes} />
    </div>
  );
}
```

- [ ] **Step 4: 创建笔记详情/编辑页**

`shelf/app/notes/[id]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { getNote, updateNoteSimple } from "@/app/actions/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NotePage({ params }: Props) {
  const { id } = await params;
  const note = await getNote(id);

  if (!note) notFound();

  const handleSave = async (title: string, content: string) => {
    "use server";
    await updateNoteSimple(id, title, content);
  };

  return (
    <NoteEditor
      initialTitle={note.title}
      initialContent={note.content || ""}
      onSave={handleSave}
    />
  );
}
```

- [ ] **Step 5: 验证功能**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npm run dev
```

打开 http://localhost:3000/notes → 创建笔记 → 编辑 → 保存。

- [ ] **Step 6: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/notes/ components/notes/
git commit -m "feat: add note list, editor and detail pages"
```

---

### Task 12: 搜索功能

**文件:**
- 创建: `shelf/components/search/SearchBar.tsx`
- Modify: `shelf/app/page.tsx`

- [ ] **Step 1: 创建搜索栏组件**

`shelf/components/search/SearchBar.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useEffect } from "react";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      router.push(`/?q=${encodeURIComponent(value.trim())}`);
    } else {
      router.push("/");
    }
  };

  const clear = () => {
    setValue("");
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索收藏和笔记..."
        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:border-zinc-600 text-zinc-200"
      />
      {value && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </form>
  );
}
```

- [ ] **Step 2: 更新首页支持搜索参数**

`shelf/app/page.tsx`（替换整个文件）:

```tsx
import { Suspense } from "react";
import { getLinks } from "@/app/actions/links";
import { LinkForm } from "@/components/links/LinkForm";
import { LinkGrid } from "@/components/links/LinkGrid";
import { SearchBar } from "@/components/search/SearchBar";

interface Props {
  searchParams: Promise<{ q?: string }>;
}

async function LinkList({ query }: { query?: string }) {
  const links = await getLinks(query);
  return <LinkGrid links={links} />;
}

export default async function HomePage({ searchParams }: Props) {
  const { q } = await searchParams;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">收藏</h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
      <LinkForm />
      <Suspense fallback={<div className="text-center py-8 text-zinc-500">加载中...</div>}>
        <LinkList query={q} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: 验证搜索**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npm run dev
```

添加几条收藏 → 搜索关键词 → 结果过滤正常。

- [ ] **Step 4: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/page.tsx components/search/
git commit -m "feat: add keyword search for links"
```

---

### Task 13: 根据实际路由修正页面引用 + 补建笔记新建页

**文件:**
- 创建: `shelf/app/notes/new/page.tsx`
- Modify: `shelf/app/notes/[id]/page.tsx`（新建不应该走数据库查询）

- [ ] **Step 1: 创建新建笔记路由**

`shelf/app/notes/new/page.tsx`:

```tsx
import { createNoteSimple } from "@/app/actions/notes";
import { NoteEditor } from "@/components/notes/NoteEditor";

export default function NewNotePage() {
  const handleSave = async (title: string, content: string) => {
    "use server";
    await createNoteSimple(title, content);
  };

  return (
    <NoteEditor
      initialTitle=""
      initialContent=""
      onSave={handleSave}
    />
  );
}
```

- [ ] **Step 2: 简化笔记详情页（去掉新建逻辑）**

`shelf/app/notes/[id]/page.tsx`（已在 Task 11 Step 4 中完成，此处不再重复修改）:

- [ ] **Step 3: 验证流程**

```bash
npm run dev
```

测试：点击笔记列表「新建」→ 写标题+内容 → 保存 → 跳转回列表 → 刷新可看到新笔记。

- [ ] **Step 4: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/notes/
git commit -m "fix: separate new note route and edit route"
```

---

### Task 14: 标签筛选 + 侧边栏

**文件:**
- 创建: `shelf/components/tags/TagFilter.tsx`
- 创建: `shelf/components/layout/Sidebar.tsx`
- Modify: `shelf/app/layout.tsx`（不引入侧边栏，保持简洁）

标签筛选通过搜索参数处理，不在 Phase 1 加侧边栏。改为在首页直接展示标签筛选条。

- [ ] **Step 1: 创建标签筛选条**

`shelf/components/tags/TagFilter.tsx`:

```tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { getTags } from "@/app/actions/tags";
import { useEffect, useState } from "react";
import type { Tag } from "@/types";
import { cn } from "@/lib/utils";

export function TagFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get("tag");
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    getTags().then(setTags);
  }, []);

  const handleClick = (tag: string) => {
    if (activeTag === tag) {
      router.push("/");
    } else {
      router.push(`/?tag=${encodeURIComponent(tag)}`);
    }
  };

  if (tags.length === 0) return null;

  return (
    <div className="flex gap-1.5 mb-6 flex-wrap">
      {activeTag && (
        <button
          onClick={() => router.push("/")}
          className="px-2 py-0.5 text-xs rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30"
        >
          ✕ 清除
        </button>
      )}
      {tags.map((tag) => (
        <button
          key={tag.id}
          onClick={() => handleClick(tag.name)}
          className={cn(
            "px-2.5 py-0.5 text-xs rounded-full transition-colors",
            activeTag === tag.name
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-700"
          )}
        >
          {tag.name}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 更新首页支持 tag 参数**

`shelf/app/page.tsx`（更新 LinkList 支持 tag）:

```tsx
import { Suspense } from "react";
import { getLinks, getLinksByTag } from "@/app/actions/links";
import { LinkForm } from "@/components/links/LinkForm";
import { LinkGrid } from "@/components/links/LinkGrid";
import { SearchBar } from "@/components/search/SearchBar";
import { TagFilter } from "@/components/tags/TagFilter";

async function LinkList({ query, tag }: { query?: string; tag?: string }) {
  const links = tag ? await getLinksByTag(tag) : await getLinks(query);
  return <LinkGrid links={links} />;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">收藏</h1>
        <Suspense>
          <SearchBar />
        </Suspense>
      </div>
      <Suspense>
        <TagFilter />
      </Suspense>
      <LinkForm />
      <Suspense fallback={<div className="text-center py-8 text-zinc-500">加载中...</div>}>
        <LinkList query={q} tag={tag} />
      </Suspense>
    </div>
  );
}
```

- [ ] **Step 3: 验证标签筛选**

```bash
npm run dev
```

测试：给链接加标签 → 点标签筛选 → 结果过滤正常。

- [ ] **Step 4: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add app/page.tsx components/tags/TagFilter.tsx
git commit -m "feat: add tag filtering"
```

---

### Task 15: 部署到 Vercel

**文件:**
- 创建: `shelf/.gitignore`
- Modify: `shelf/package.json`（确保 script 正确）
- 创建: `shelf/vercel.json`（可选）

- [ ] **Step 1: 确保 .gitignore 忽略 .data 目录**

`shelf/.gitignore`:
```
node_modules/
.next/
.data/
.env.local
*.db
```

- [ ] **Step 2: 部署到 Vercel**

```bash
cd "d:\邓杰鹏个人主页\shelf"
npx vercel --prod
```

按提示选择:
- Scope: 选你的账号
- Link to existing? No
- Project name: shelf
- Directory: ./
- Override settings? No

- [ ] **Step 3: 设置环境变量**

在 Vercel Dashboard → shelf → Settings → Environment Variables:
```
DATABASE_URL = file:.data/data.db
```

> 注意：SQLite 文件在 Vercel 的 serverless 环境中不持久化（每次部署重置）。MVP 阶段先接受这个限制，Phase 2 切换 PostgreSQL 后解决。

- [ ] **Step 4: 验证线上可用**

打开 Vercel 给的 URL（如 shelf.vercel.app），确认所有功能正常。

- [ ] **Step 5: 加 README 初步内容**

`shelf/README.md`:

```markdown
# Shelf

收藏链接、写笔记，AI 加持的知识管理工具。

🚧 **Phase 1 MVP** — 单用户收藏 + 笔记 + 标签系统

## 快速开始

\`\`\`bash
npm install
cp .env.example .env.local
npx drizzle-kit migrate
npm run dev
\`\`\`

打开 [http://localhost:3000](http://localhost:3000)

## 技术栈

- Next.js 15 + TypeScript
- SQLite + Drizzle ORM
- Tailwind CSS + shadcn/ui
- TipTap 编辑器
```

- [ ] **Step 6: Commit**

```bash
cd "d:\邓杰鹏个人主页\shelf"
git add .gitignore README.md
git commit -m "docs: add README and gitignore"
```

---

## 验收 Checklist

- [ ] 粘贴 URL 自动抓取标题/摘要/封面图
- [ ] 收藏卡片展示正常，hover 有删除按钮
- [ ] 笔记列表 + 新建 + 编辑 + 保存完整流程可用
- [ ] TipTap 编辑器支持 Markdown 格式（粗体/标题/列表/引用/链接）
- [ ] 标签筛选生效
- [ ] 关键词搜索过滤收藏正常
- [ ] 暗色主题 UI 一致
- [ ] Vercel 部署成功，公网可访问
- [ ] 所有改动已提交到 git

---

## 总工作量估算

| Task | 内容 | 预估时间 |
|------|------|---------|
| 1 | 脚手架 | 10 min |
| 2 | 安装依赖 | 5 min |
| 3 | 数据库 Schema | 15 min |
| 4 | 类型 + 工具 | 10 min |
| 5 | 元数据抓取 | 10 min |
| 6 | 链接 CRUD | 20 min |
| 7 | 笔记 CRUD | 15 min |
| 8 | 标签 CRUD | 10 min |
| 9 | 布局 + 导航 | 15 min |
| 10 | 收藏页 UI | 30 min |
| 11 | 笔记页 UI | 30 min |
| 12 | 搜索 | 15 min |
| 13 | 路由修正 | 10 min |
| 14 | 标签筛选 | 15 min |
| 15 | 部署 | 15 min |
| **合计** | | **约 4 小时** |
