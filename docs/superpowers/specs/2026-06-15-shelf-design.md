# Shelf — AI 驱动的知识管理工具 · 设计文档

## 1. 项目定位

**Shelf**（书架）是一站式知识管理工具，用于收藏网络内容并管理个人笔记，在笔记中通过 AI 提供语义搜索、智能写作辅助和内容关联。

**目标**：一个项目涵盖全栈、AI 集成、开源发布三条技术路线，作为个人简历的核心展示项目。

## 2. 核心功能

### Phase 1 — MVP（单用户收藏 + 笔记）

| 功能 | 描述 |
|------|------|
| 链接收藏 | 粘贴 URL → 自动拉取标题/摘要/封面图，手动添加标签和备注 |
| 笔记管理 | Markdown 编辑器，支持标签、搜索、与收藏关联 |
| 关键词搜索 | 对收藏标题、标签、笔记内容做全文搜索 |
| 标签系统 | 自由创建标签，关联到收藏和笔记 |

### Phase 2 — AI 加持

| 功能 | 描述 |
|------|------|
| 语义搜索 | 自然语言搜索收藏和笔记，基于向量相似度 |
| AI 写作助手 | 笔记编辑时一键扩写/总结/翻译/关联推荐 |
| 收藏摘要 | AI 自动为长文收藏生成摘要 |
| 流式输出 | AI 回复逐字渲染 |

### Phase 3 — 多用户 + 开源发布

| 功能 | 描述 |
|------|------|
| 用户注册/登录 | GitHub / Google OAuth 登录 |
| 数据隔离 | 每个用户有独立数据空间 |
| 开源发布 | README / LICENSE / Docker / Vercel Deploy Button |

## 3. 技术栈

| 层面 | Phase 1 | Phase 2 | Phase 3 |
|------|---------|---------|---------|
| 框架 | Next.js 15 App Router + TypeScript | → | → |
| 样式 | Tailwind CSS + shadcn/ui | → | → |
| 数据库 | SQLite (libsql) | → PostgreSQL + pgvector | → |
| ORM | Drizzle ORM | → | → |
| 编辑器 | TipTap (WYSIWYG + Markdown) | → | → |
| 元数据抓取 | open-graph-scraper | → | → |
| AI SDK | — | Vercel AI SDK + Claude API | → |
| 向量搜索 | — | pgvector / 嵌入式方案 | → |
| 认证 | — | — | Auth.js v5 |
| 部署 | Vercel | Vercel + PostgreSQL | Vercel + Docker |

## 4. 项目结构

```
shelf/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根布局
│   ├── page.tsx            # 首页（收藏列表）
│   ├── notes/              # 笔记路由
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── api/                # API Routes
│   │   ├── links/          # CRUD 链接
│   │   │   └── route.ts
│   │   ├── notes/          # CRUD 笔记
│   │   ├── search/         # 搜索
│   │   └── ai/             # AI 接口（Phase 2）
│   │       ├── chat/
│   │       ├── summary/
│   │       └── embed/
│   └── (auth)/             # 登录页面（Phase 3）
├── components/
│   ├── ui/                 # shadcn/ui 组件
│   ├── LinkCard.tsx        # 收藏卡片
│   ├── LinkForm.tsx        # 添加收藏
│   ├── NoteEditor.tsx      # 笔记编辑器
│   ├── NoteList.tsx        # 笔记列表
│   ├── SearchBar.tsx       # 搜索栏
│   ├── TagManager.tsx      # 标签管理
│   └── AIAssistant/        # AI 助手组件（Phase 2）
│       ├── ChatPanel.tsx
│       └── ActionBar.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts        # 数据库连接
│   │   └── schema.ts       # Drizzle Schema
│   ├── ai/                 # AI 相关（Phase 2）
│   │   ├── client.ts       # AI SDK 配置
│   │   ├── embed.ts        # Embedding 生成
│   │   └── prompts.ts      # Prompt 模板
│   ├── metadata.ts         # URL 元数据抓取
│   └── utils.ts
├── drizzle/                # Drizzle 迁移文件
├── public/
├── package.json
├── tailwind.config.ts
├── tsconfig.json
├── drizzle.config.ts
├── .env.example
├── LICENSE                 # MIT（Phase 3）
├── README.md               # 开源文档（Phase 3）
└── Dockerfile              # Phase 3
```

## 5. 数据模型

```sql
-- links: 收藏的链接
CREATE TABLE links (
  id          TEXT PRIMARY KEY,
  url         TEXT NOT NULL,
  title       TEXT NOT NULL,
  description TEXT,
  image_url   TEXT,          -- 从 OG 抓取的封面图
  site_name   TEXT,          -- 来源站点名
  note        TEXT,          -- 用户手动备注
  tags        TEXT,          -- JSON array: ["前端","Next.js"]
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- notes: 笔记
CREATE TABLE notes (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  content     TEXT,          -- Markdown
  tags        TEXT,          -- JSON array
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- tags: 标签（可选——如果不用 JSON array，用关联表）
CREATE TABLE tags (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  color       TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

-- link_tags / note_tags: 多对多关联
CREATE TABLE link_tags (
  link_id TEXT REFERENCES links(id) ON DELETE CASCADE,
  tag_id  TEXT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (link_id, tag_id)
);

CREATE TABLE note_tags (
  note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
  tag_id  TEXT REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (note_id, tag_id)
);
```

**Phase 2 扩展：**
```sql
-- embeddings: 向量存储
CREATE TABLE embeddings (
  id        TEXT PRIMARY KEY,
  content   TEXT NOT NULL,         -- 被向量化的原文
  source_type TEXT NOT NULL,       -- 'link' | 'note'
  source_id TEXT NOT NULL,         -- links.id 或 notes.id
  embedding vector(1536) NOT NULL, -- OpenAI text-embedding-3-small 维度
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_embedding ON embeddings USING ivfflat (embedding vector_cosine_ops);
```

**Phase 3 扩展：**
```sql
-- users: 用户表
CREATE TABLE users (
  id            TEXT PRIMARY KEY,
  name          TEXT,
  email         TEXT UNIQUE,
  avatar_url    TEXT,
  provider      TEXT,              -- 'github' | 'google'
  provider_id   TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 所有数据表加 user_id 外键
ALTER TABLE links ADD COLUMN user_id TEXT REFERENCES users(id);
ALTER TABLE notes ADD COLUMN user_id TEXT REFERENCES users(id);
```

## 6. API 设计

### Phase 1

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/links` | 获取收藏列表（支持 ?tag= & ?q= 筛选） |
| POST | `/api/links` | 添加收藏（自动抓取 OG 元数据） |
| GET | `/api/links/:id` | 获取单个收藏详情 |
| DELETE | `/api/links/:id` | 删除收藏 |
| GET | `/api/notes` | 获取笔记列表 |
| POST | `/api/notes` | 创建笔记 |
| GET | `/api/notes/:id` | 获取笔记 |
| PUT | `/api/notes/:id` | 更新笔记 |
| DELETE | `/api/notes/:id` | 删除笔记 |
| GET | `/api/tags` | 获取所有标签 |

### Phase 2

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/search/semantic` | 语义搜索（body: { query }） |
| POST | `/api/ai/chat` | AI 对话，流式 SSE 响应 |
| POST | `/api/ai/summary` | 生成收藏摘要 |
| POST | `/api/ai/embed` | 重新生成 Embedding（管理用） |

### Phase 3

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/auth/session` | 获取当前会话 |
| POST | `/api/auth/login` | OAuth 登录回调 |

## 7. AI 交互流程（Phase 2 核心）

```
用户 → 笔记编辑器 → 点「总结」按钮
  ↓
前端 POST /api/ai/summary { content: "..." }
  ↓
Server Action:
  1. 调用 AI SDK 的 streamText()
  2. 用 Server-Sent Events 逐 token 推送
  3. 前端 React Suspense + useChat() 逐字渲染
  ↓
用户看到 AI 回复一个字一个字出来
```

**语义搜索流程：**
```
用户输入短语 → 前端 POST /api/search/semantic
  ↓
服务端：
  1. 用 Embedding API 把用户短语转成向量
  2. 在 embeddings 表中做余弦相似度搜索
  3. 返回前 10 个最匹配的收藏/笔记
```

## 8. 风险与应对

| 风险 | 应对 |
|------|------|
| AI API 费用 | Key 由用户提供并本地存储，不硬编码 |
| Phase 2 向量搜索需要 PostgreSQL | 先用 SQLite 存 embedding 数组，内存中做相似度计算（数据量小时完全够用） |
| 开源后没人用 | License 选 MIT，文档写足，写一篇博客推广 |
| 工期拉太长 | 每个 Phase 设硬截止，Phase 1 必须 3 周内出 MVP |

## 9. 验收标准

**Phase 1 验收：**
- ✅ 粘贴 URL 自动抓取标题/摘要/封面
- ✅ Markdown 编辑器可用，支持实时预览
- ✅ 标签筛选生效
- ✅ 全文关键词搜索正常工作
- ✅ 部署到 Vercel，公网可访问

**Phase 2 验收：**
- ✅ 自然语言搜索返回语义匹配的结果
- ✅ AI 总结、扩写、翻译功能可用
- ✅ 流式输出逐字渲染

**Phase 3 验收：**
- ✅ GitHub OAuth 登录正常
- ✅ 每个用户数据隔离
- ✅ README 含截图/GIF、快速开始指南
- ✅ 另一开发者能在 10 分钟内跑起来
