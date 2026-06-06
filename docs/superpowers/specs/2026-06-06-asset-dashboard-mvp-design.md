# 个人资产仪表盘 MVP — 设计文档

**日期**：2026-06-06  
**状态**：待审阅  
**关联计划**：待创建

---

## 1. 目标

做一个个人资产仪表盘，练 Next.js + TypeScript + Tailwind + Recharts 技术栈，同时作为日常使用的记账工具。MVP 只做核心功能，能跑、能用、代码清晰。

## 2. 决策记录

| 决策项 | 选择 | 理由 |
|--------|------|------|
| 布局 | 仪表盘式（A） | 信息密度高，看板布局模式可复用 |
| 视觉风格 | 暗色科技风（B） | 与现有主页统一，暗色下数字对比度高 |
| 图表库 | Recharts（A） | 底层库，学会后任何项目都能用 |
| 录入方式 | 逐笔记账式（B） | 数据有分析价值，数据模型练习价值大 |
| 资产类别 | 可扩展枚举 | 现在只用现金，以后可加基金/股票/黄金等 |

## 3. 技术栈

| 层 | 选型 | 说明 |
|----|------|------|
| 框架 | Next.js (App Router) | React 全栈框架 |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS | 原子化 CSS，暗色模式内置 |
| 图表 | Recharts | 饼图 + 折线图 |
| 存储 | LocalStorage | 零配置，数据在浏览器本地 |
| 部署 | Vercel | Next.js 原生部署平台 |

## 4. 项目结构

```
asset-dashboard/              ← 独立子目录
├── app/
│   ├── layout.tsx            ← 根布局 + 暗色主题注入
│   ├── page.tsx              ← 仪表盘主页面（组合所有组件）
│   └── globals.css           ← Tailwind + 自定义暗色变量
├── components/
│   ├── KpiCards.tsx           ← 顶部 4 个概览数字卡片
│   ├── AssetPieChart.tsx      ← 资产配置饼图 (Recharts)
│   ├── MonthlyTrend.tsx       ← 月度净值变化折线图 (Recharts)
│   ├── TransactionList.tsx    ← 交易记录列表（含删除）
│   └── TransactionForm.tsx    ← 录入表单（收入/支出）
├── lib/
│   ├── storage.ts            ← LocalStorage CRUD 封装
│   ├── types.ts              ← TypeScript 类型定义
│   └── utils.ts              ← 格式化金额、CSV 导出
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

## 5. 数据模型

```typescript
// 资产类别 — 可扩展枚举
type AssetCategory = '现金' | '基金' | '股票' | '黄金' | '加密货币' | '房产' | '负债';

interface Transaction {
  id: string;            // crypto.randomUUID()
  type: 'income' | 'expense';
  amount: number;
  category: AssetCategory;
  note: string;
  date: string;          // "2026-06-06"
  createdAt: string;     // ISO 时间戳
}

// 派生数据 — 不存 LocalStorage，实时计算
interface AssetSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyChange: number;
  byCategory: Record<AssetCategory, number>;
  monthlySnapshots: MonthSnapshot[];
}

interface MonthSnapshot {
  month: string;   // "2026-05"
  netWorth: number;
}
```

**核心原则**：所有聚合数据从 `Transaction[]` 实时派生，不存冗余。

## 6. 页面布局

```
┌──────────────────────────────────────────────┐
│  💰 资产仪表盘                       ☀️/🌙  │  顶栏
├──────────────────────────────────────────────┤
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ │
│  │ 净资产  │ │ 总资产  │ │ 总负债  │ │ 月变化 │ │  KpiCards（4列）
│  │ 52,800 │ │ 68,000 │ │ 15,200 │ │+3,200 │ │
│  └────────┘ └────────┘ └────────┘ └───────┘ │
│                                              │
│  ┌───────────┐ ┌──────────────────────┐     │
│  │    🥧     │ │    📈               │     │  图表区（左饼图右折线）
│  │  资产配置  │ │  月度净值变化        │     │
│  └───────────┘ └──────────────────────┘     │
│                                              │
│  [+ 记一笔]           [📥 导出 CSV]          │  操作栏
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │ 📋 交易记录                          │   │  TransactionList
│  │ 6/6  +8,000  工资到账   💰现金  🗑  │   │
│  │ 6/5  -1,000  基金定投   📊基金  🗑  │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

**响应式**：桌面端图表并排 → 移动端上下堆叠；KPI 4列 → 2×2网格。

## 7. 组件职责

| 组件 | 输入 | 职责 |
|------|------|------|
| `KpiCards` | `AssetSummary` | 渲染 4 个数字卡片（净值/资产/负债/月变化），正数绿色负数红色 |
| `AssetPieChart` | `byCategory: Record<string, number>` | Recharts 饼图，显示各资产类别占比，暗色配色 |
| `MonthlyTrend` | `monthlySnapshots: MonthSnapshot[]` | Recharts 折线图，X轴月份 Y轴净值，暗色配色 |
| `TransactionList` | `transactions: Transaction[]`, `onDelete` | 按日期倒序列出交易，支持删除（确认后） |
| `TransactionForm` | `onSubmit` | 表单：收入/支出切换 → 金额 → 类别 → 日期 → 备注 → 提交 |

## 8. 数据流

```
[TransactionForm] ──提交──→ localStorage ←──读取──→ page.tsx
                                                        │
                                          ┌─────────────┤
                                          │             │
                                      KpiCards      AssetPieChart
                                 (派生计算净值)    (按类别聚合)

                                      MonthlyTrend     TransactionList
                                    (按月聚合净值)    (原始列表直传)
```

- 所有组件只读 props，不直接操作 localStorage
- `page.tsx` 是唯一的数据读写入口（"单一数据源"模式）
- 提交新交易 → 更新 state → 自动重渲染所有组件

## 9. 边界情况

| 场景 | 处理 |
|------|------|
| 首次打开（无数据） | 空状态引导 + 醒目 [+ 记一笔] 按钮 |
| 只有一笔交易 | 饼图显示单一扇区，折线图显示一个点 |
| 金额非法输入 | 表单校验拦截，非数字/负数红色提示 |
| 删除交易 | 点 🗑 → 弹出确认 → 确认后删除 |
| 图表无数据 | 显示"暂无数据"占位文字 |
| CSV 导出 | `资产记录_2026-06-06.csv`，UTF-8 BOM 中文兼容 |
| 暗色主题保持 | 存入 localStorage，刷新不丢 |

## 10. 不做（MVP 范围外）

- 编辑已有交易（录入后只能删不能改）
- 用户登录 / 云同步
- 预算设置 / 超支提醒
- AI 分析集成
- 数据备份到云端

## 11. 验收标准

1. `npm run dev` 启动，浏览器打开看到仪表盘
2. 点 [+ 记一笔] → 填金额选类别 → 提交 → 四个 KPI 数字实时更新
3. 饼图正确反映各资产占比
4. 折线图正确显示月度净值变化
5. 删除一条交易，所有数据重新计算正确
6. 导出 CSV，用 Excel 能正确打开（中文不乱码）
7. 暗色主题正确显示，刷新后保持
8. `npm run build` 无错误
9. 部署到 Vercel 可公开访问
