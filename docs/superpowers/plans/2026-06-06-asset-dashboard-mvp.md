# 个人资产仪表盘 MVP 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个暗色科技风、可记账的个人资产仪表盘，部署到 Vercel

**Architecture:** Next.js App Router 单页面应用，5 个客户端组件组合成仪表盘，所有数据存 LocalStorage，聚合数据从 Transaction[] 实时派生

**Tech Stack:** Next.js 15 + TypeScript + Tailwind CSS + Recharts

---

### Task 1: 脚手架搭建

**Files:**
- Create: `asset-dashboard/` (整个目录)

- [ ] **Step 1: 用 create-next-app 创建项目**

```bash
cd "d:/邓杰鹏个人主页"
npx create-next-app@latest asset-dashboard --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --no-turbopack
```

Expected: 创建成功，显示 "Success! Created asset-dashboard"

- [ ] **Step 2: 安装 Recharts**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npm install recharts
```

Expected: 安装成功无报错

- [ ] **Step 3: 清理脚手架默认文件**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
rm -f app/page.tsx app/layout.tsx app/globals.css
```

Expected: 文件删除成功

- [ ] **Step 4: 创建目录结构**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
mkdir -p components lib
```

Expected: 目录创建成功

- [ ] **Step 5: 验证项目能跑**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
echo "export default function Page() { return <div>ok</div>; }" > app/page.tsx
echo "export default function Layout({ children }: { children: React.ReactNode }) { return <html lang=\"zh-CN\"><body>{children}</body></html>; }" > app/layout.tsx
npm run dev
```

启动后在浏览器访问 `http://localhost:3000`，显示 "ok" 后 Ctrl+C 停掉。

- [ ] **Step 6: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/
git commit -m "feat: scaffold asset-dashboard with Next.js + Recharts"
```

---

### Task 2: 类型定义

**Files:**
- Create: `asset-dashboard/lib/types.ts`

- [ ] **Step 1: 写入类型定义**

```typescript
// asset-dashboard/lib/types.ts

export type AssetCategory =
  | '现金'
  | '基金'
  | '股票'
  | '黄金'
  | '加密货币'
  | '房产'
  | '负债';

export interface Transaction {
  id: string;            // crypto.randomUUID()
  type: 'income' | 'expense';
  amount: number;
  category: AssetCategory;
  note: string;
  date: string;          // "2026-06-06"
  createdAt: string;     // ISO 时间戳
}

export interface AssetSummary {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  monthlyChange: number;
  byCategory: Record<string, number>;
  monthlySnapshots: MonthSnapshot[];
}

export interface MonthSnapshot {
  month: string;   // "2026-05"
  netWorth: number;
}
```

- [ ] **Step 2: 验证 TypeScript 编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无类型错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/lib/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 3: LocalStorage 存储层

**Files:**
- Create: `asset-dashboard/lib/storage.ts`

- [ ] **Step 1: 写入存储层代码**

```typescript
// asset-dashboard/lib/storage.ts
import { Transaction } from './types';

const STORAGE_KEY = 'asset-dashboard-transactions';

export function loadTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Transaction[];
  } catch {
    return [];
  }
}

export function saveTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addTransaction(tx: Transaction): Transaction[] {
  const txs = loadTransactions();
  txs.push(tx);
  saveTransactions(txs);
  return txs;
}

export function deleteTransaction(id: string): Transaction[] {
  const txs = loadTransactions().filter(t => t.id !== id);
  saveTransactions(txs);
  return txs;
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/lib/storage.ts
git commit -m "feat: add LocalStorage CRUD layer"
```

---

### Task 4: 工具函数（格式化、聚合计算、CSV导出）

**Files:**
- Create: `asset-dashboard/lib/utils.ts`

- [ ] **Step 1: 写入工具函数**

```typescript
// asset-dashboard/lib/utils.ts
import { Transaction, AssetSummary, MonthSnapshot } from './types';

/** 格式化金额为千分位 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 从交易列表计算所有派生数据 */
export function computeSummary(transactions: Transaction[]): AssetSummary {
  const byCategory: Record<string, number> = {};

  // 逐笔累加每个类别的余额
  for (const tx of transactions) {
    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + delta;
  }

  // 分离资产和负债
  let totalAssets = 0;
  let totalLiabilities = 0;
  const pieData: Record<string, number> = {};

  for (const [cat, balance] of Object.entries(byCategory)) {
    if (cat === '负债') {
      totalLiabilities = Math.abs(balance);
    } else if (balance > 0) {
      totalAssets += balance;
      pieData[cat] = balance;
    }
  }

  const netWorth = totalAssets - totalLiabilities;
  const monthlySnapshots = computeMonthlySnapshots(transactions);
  const monthlyChange = computeMonthlyChange(monthlySnapshots, netWorth);

  return {
    totalAssets,
    totalLiabilities,
    netWorth,
    monthlyChange,
    byCategory: pieData,
    monthlySnapshots,
  };
}

/** 计算每月末的净值快照 */
function computeMonthlySnapshots(transactions: Transaction[]): MonthSnapshot[] {
  const map = new Map<string, number>();
  const sorted = [...transactions].sort((a, b) => a.date.localeCompare(b.date));

  let runningAssets = 0;
  let runningLiabilities = 0;

  for (const tx of sorted) {
    if (tx.category === '负债') {
      runningLiabilities += tx.amount;
    } else {
      const delta = tx.type === 'income' ? tx.amount : -tx.amount;
      runningAssets += delta;
    }

    const month = tx.date.substring(0, 7);
    map.set(month, runningAssets - runningLiabilities);
  }

  return Array.from(map.entries()).map(([month, netWorth]) => ({
    month,
    netWorth,
  }));
}

/** 计算本月净值变化 */
function computeMonthlyChange(
  snapshots: MonthSnapshot[],
  currentNetWorth: number
): number {
  const now = new Date();
  const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonth =
    now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  const thisSnapshot = snapshots.find(s => s.month === thisMonth);
  const lastSnapshot = snapshots.find(s => s.month === lastMonth);

  const thisValue = thisSnapshot?.netWorth ?? currentNetWorth;
  const lastValue = lastSnapshot?.netWorth ?? 0;

  return thisValue - lastValue;
}

/** 导出 CSV 文件（UTF-8 BOM，Excel 兼容） */
export function exportCSV(transactions: Transaction[]): void {
  const BOM = '﻿';
  const header = '日期,类型,金额,类别,备注';
  const sorted = [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  const rows = sorted.map(tx => {
    const type = tx.type === 'income' ? '收入' : '支出';
    return `${tx.date},${type},${tx.amount},${tx.category},${tx.note}`;
  });
  const csv = BOM + header + '\n' + rows.join('\n');

  const today = new Date().toISOString().substring(0, 10);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `资产记录_${today}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/lib/utils.ts
git commit -m "feat: add formatAmount, computeSummary, exportCSV utilities"
```

---

### Task 5: 主题切换组件

**Files:**
- Create: `asset-dashboard/components/ThemeToggle.tsx`

- [ ] **Step 1: 写入组件**

```typescript
// asset-dashboard/components/ThemeToggle.tsx
'use client';

import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setDark(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <button
      onClick={toggle}
      className="text-lg p-1 hover:scale-110 transition"
      title={dark ? '切换亮色模式' : '切换暗色模式'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/components/ThemeToggle.tsx
git commit -m "feat: add ThemeToggle component"
```

---

### Task 6: KPI 概览卡片组件

**Files:**
- Create: `asset-dashboard/components/KpiCards.tsx`

- [ ] **Step 1: 写入组件**

```typescript
// asset-dashboard/components/KpiCards.tsx
import { AssetSummary } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

interface Props {
  summary: AssetSummary;
}

export default function KpiCards({ summary }: Props) {
  const cards = [
    { label: '净资产', value: summary.netWorth, highlight: true },
    { label: '总资产', value: summary.totalAssets },
    { label: '总负债', value: summary.totalLiabilities },
    {
      label: '月变化',
      value: summary.monthlyChange,
      isChange: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => (
        <div
          key={card.label}
          className={`rounded-lg border p-4 ${
            card.highlight
              ? 'border-sky-500/30 bg-sky-500/10'
              : 'border-slate-700/50 bg-slate-800/50'
          }`}
        >
          <div className="text-xs text-slate-400 mb-1">{card.label}</div>
          <div
            className={`text-xl font-bold font-mono tabular-nums ${
              card.isChange
                ? card.value >= 0
                  ? 'text-emerald-400'
                  : 'text-red-400'
                : card.highlight
                  ? 'text-sky-300'
                  : 'text-slate-200'
            }`}
          >
            {card.isChange && card.value >= 0 ? '+' : ''}
            {formatAmount(card.value)}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/components/KpiCards.tsx
git commit -m "feat: add KpiCards component"
```

---

### Task 7: 资产配置饼图组件

**Files:**
- Create: `asset-dashboard/components/AssetPieChart.tsx`

- [ ] **Step 1: 写入组件**

```typescript
// asset-dashboard/components/AssetPieChart.tsx
'use client';

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const COLORS = [
  '#38bdf8',
  '#4ade80',
  '#fbbf24',
  '#f87171',
  '#a78bfa',
  '#fb923c',
  '#2dd4bf',
];

interface Props {
  data: Record<string, number>;
}

export default function AssetPieChart({ data }: Props) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));
  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-6 text-center text-slate-500 flex flex-col items-center justify-center min-h-[280px]">
        <p className="text-lg mb-1">🥧</p>
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">资产配置</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
          >
            {chartData.map((_, index) => (
              <Cell
                key={index}
                fill={COLORS[index % COLORS.length]}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            formatter={(value: number) => [
              `¥${value.toLocaleString()}`,
              '余额',
            ]}
            labelFormatter={(name: string) => {
              const pct = total > 0
                ? ((chartData.find(d => d.name === name)?.value ?? 0) / total * 100).toFixed(1)
                : '0';
              return `${name} (${pct}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/components/AssetPieChart.tsx
git commit -m "feat: add AssetPieChart component"
```

---

### Task 8: 月度净值趋势折线图组件

**Files:**
- Create: `asset-dashboard/components/MonthlyTrend.tsx`

- [ ] **Step 1: 写入组件**

```typescript
// asset-dashboard/components/MonthlyTrend.tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { MonthSnapshot } from '@/lib/types';

interface Props {
  data: MonthSnapshot[];
}

export default function MonthlyTrend({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-6 text-center text-slate-500 flex flex-col items-center justify-center min-h-[280px]">
        <p className="text-lg mb-1">📈</p>
        <p>暂无数据</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-4">
      <h3 className="text-sm font-medium text-slate-300 mb-3">
        月度净值变化
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="month"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickFormatter={(v: number) =>
              `¥${(v / 1000).toFixed(0)}k`
            }
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            formatter={(value: number) => [
              `¥${value.toLocaleString()}`,
              '净值',
            ]}
          />
          <Line
            type="monotone"
            dataKey="netWorth"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={{ fill: '#38bdf8', r: 4 }}
            activeDot={{ fill: '#38bdf8', r: 6, stroke: '#0f172a' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/components/MonthlyTrend.tsx
git commit -m "feat: add MonthlyTrend line chart component"
```

---

### Task 9: 交易录入表单组件

**Files:**
- Create: `asset-dashboard/components/TransactionForm.tsx`

- [ ] **Step 1: 写入组件**

```typescript
// asset-dashboard/components/TransactionForm.tsx
'use client';

import { useState } from 'react';
import { Transaction, AssetCategory } from '@/lib/types';

const CATEGORIES: AssetCategory[] = [
  '现金',
  '基金',
  '股票',
  '黄金',
  '加密货币',
  '房产',
  '负债',
];

interface Props {
  onSubmit: (tx: Transaction) => void;
  onClose: () => void;
}

export default function TransactionForm({ onSubmit, onClose }: Props) {
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<AssetCategory>('现金');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('请输入有效的金额');
      return;
    }
    if (!note.trim()) {
      setError('请输入备注');
      return;
    }
    setError('');

    const tx: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: num,
      category,
      note: note.trim(),
      date,
      createdAt: new Date().toISOString(),
    };
    onSubmit(tx);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-slate-100 mb-4">
          ✏️ 记一笔
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 收入/支出切换 */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                type === 'income'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
              }`}
            >
              💰 收入
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                type === 'expense'
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
              }`}
            >
              💸 支出
            </button>
          </div>

          {/* 金额 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">金额</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-lg font-mono focus:outline-none focus:border-sky-500/50 placeholder-slate-600"
              autoFocus
            />
          </div>

          {/* 类别 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">类别</label>
            <select
              value={category}
              onChange={e =>
                setCategory(e.target.value as AssetCategory)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500/50"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* 日期 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">日期</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">备注</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="如：工资到账"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500/50 placeholder-slate-600"
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* 按钮 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-slate-600 text-slate-400 text-sm hover:bg-slate-700/50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/components/TransactionForm.tsx
git commit -m "feat: add TransactionForm component"
```

---

### Task 10: 交易列表组件

**Files:**
- Create: `asset-dashboard/components/TransactionList.tsx`

- [ ] **Step 1: 写入组件**

```typescript
// asset-dashboard/components/TransactionList.tsx
'use client';

import { useState } from 'react';
import { Transaction } from '@/lib/types';
import { formatAmount } from '@/lib/utils';

interface Props {
  transactions: Transaction[];
  onDelete: (id: string) => void;
}

export default function TransactionList({
  transactions,
  onDelete,
}: Props) {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const sorted = [...transactions].sort(
    (a, b) =>
      b.date.localeCompare(a.date) ||
      b.createdAt.localeCompare(a.createdAt)
  );

  if (sorted.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 p-10 text-center">
        <p className="text-slate-500 mb-2 text-lg">📋</p>
        <p className="text-slate-500 mb-1">还没有交易记录</p>
        <p className="text-slate-600 text-sm">
          点击上方「+ 记一笔」开始记录你的财务旅程
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-700/50 bg-slate-800/50 overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-700/50">
        <h3 className="text-sm font-medium text-slate-300">交易记录</h3>
      </div>
      <div className="divide-y divide-slate-700/30">
        {sorted.map(tx => (
          <div
            key={tx.id}
            className="px-4 py-3 flex items-center gap-3 hover:bg-slate-700/20 transition"
          >
            {/* 日期 */}
            <span className="text-xs text-slate-500 w-20 shrink-0 font-mono">
              {tx.date.substring(5)}
            </span>

            {/* 金额 */}
            <span
              className={`font-mono text-sm w-28 shrink-0 text-right ${
                tx.type === 'income'
                  ? 'text-emerald-400'
                  : 'text-red-400'
              }`}
            >
              {tx.type === 'income' ? '+' : '-'}¥
              {formatAmount(tx.amount)}
            </span>

            {/* 备注 */}
            <span className="text-sm text-slate-300 flex-1 truncate">
              {tx.note}
            </span>

            {/* 类别标签 */}
            <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded shrink-0">
              {tx.category}
            </span>

            {/* 删除按钮 */}
            {confirmId === tx.id ? (
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => {
                    onDelete(tx.id);
                    setConfirmId(null);
                  }}
                  className="text-xs text-red-400 hover:text-red-300 bg-red-400/10 px-2 py-1 rounded"
                >
                  确认
                </button>
                <button
                  onClick={() => setConfirmId(null)}
                  className="text-xs text-slate-400 hover:text-slate-300 px-2 py-1 rounded"
                >
                  取消
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmId(tx.id)}
                className="text-slate-500 hover:text-red-400 transition shrink-0 p-1"
                title="删除"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 0 1 1.334-1.334h2.666a1.333 1.333 0 0 1 1.334 1.334V4m2 0v9.333a1.333 1.333 0 0 1-1.334 1.334H4.667a1.333 1.333 0 0 1-1.334-1.334V4h9.334z" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/components/TransactionList.tsx
git commit -m "feat: add TransactionList component with delete confirmation"
```

---

### Task 11: 全局样式和布局

**Files:**
- Create: `asset-dashboard/app/globals.css`
- Create: `asset-dashboard/app/layout.tsx`

- [ ] **Step 1: 写入 globals.css**

```css
/* asset-dashboard/app/globals.css */
@import "tailwindcss";

/* 暗色模式滚动条 */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: #0f172a;
}
::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 3px;
}

/* 数字等宽 */
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 2: 写入 layout.tsx**

```typescript
// asset-dashboard/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '资产仪表盘',
  description: '个人资产仪表盘 — 记账与资产管理',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="antialiased bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 4: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/app/globals.css asset-dashboard/app/layout.tsx
git commit -m "feat: add dark theme layout and global styles"
```

---

### Task 12: 主页面 — 组合所有组件

**Files:**
- Create: `asset-dashboard/app/page.tsx`

- [ ] **Step 1: 写入主页面**

```typescript
// asset-dashboard/app/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Transaction } from '@/lib/types';
import {
  loadTransactions,
  addTransaction,
  deleteTransaction,
} from '@/lib/storage';
import { computeSummary, exportCSV } from '@/lib/utils';
import KpiCards from '@/components/KpiCards';
import AssetPieChart from '@/components/AssetPieChart';
import MonthlyTrend from '@/components/MonthlyTrend';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import ThemeToggle from '@/components/ThemeToggle';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);

  // 首次加载从 localStorage 读取
  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

  // 所有派生数据实时计算
  const summary = computeSummary(transactions);

  const handleAdd = useCallback((tx: Transaction) => {
    const updated = addTransaction(tx);
    setTransactions(updated);
    setShowForm(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    const updated = deleteTransaction(id);
    setTransactions(updated);
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 顶栏 */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight">
            💰 资产仪表盘
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm font-medium hover:bg-sky-500 transition active:scale-95"
            >
              + 记一笔
            </button>
            <button
              onClick={() => exportCSV(transactions)}
              className="px-4 py-2 rounded-lg border border-slate-600 text-slate-400 text-sm hover:border-slate-500 hover:text-slate-300 transition"
              disabled={transactions.length === 0}
            >
              📥 导出 CSV
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* KPI 数字卡片 */}
        <KpiCards summary={summary} />

        {/* 图表区 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <AssetPieChart data={summary.byCategory} />
          </div>
          <div className="lg:col-span-2">
            <MonthlyTrend data={summary.monthlySnapshots} />
          </div>
        </div>

        {/* 交易列表 */}
        <TransactionList
          transactions={transactions}
          onDelete={handleDelete}
        />
      </div>

      {/* 录入弹窗 */}
      {showForm && (
        <TransactionForm
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </main>
  );
}
```

- [ ] **Step 2: 验证编译**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx tsc --noEmit
```

Expected: 无错误

- [ ] **Step 3: Commit**

```bash
cd "d:/邓杰鹏个人主页"
git add asset-dashboard/app/page.tsx
git commit -m "feat: assemble dashboard page composing all components"
```

---

### Task 13: 构建验证和本地测试

- [ ] **Step 1: 生产构建**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npm run build
```

Expected: 构建成功，无错误，无警告

- [ ] **Step 2: 启动开发服务器手动测试**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npm run dev
```

打开 `http://localhost:3000`，手动验证：

1. ✅ 页面正常渲染，暗色主题
2. ✅ 空状态显示引导文字
3. ✅ 点「+ 记一笔」弹出表单
4. ✅ 填收入 8000 现金 → 保存 → KPI 数字更新
5. ✅ 再填支出 35 现金 → 保存 → 净值变化正确
6. ✅ 饼图显示资产配置（只有现金一个扇区）
7. ✅ 折线图显示月度净值变化
8. ✅ 交易列表显示两条记录
9. ✅ 点删除 → 确认 → 交易消失，数据重新计算
10. ✅ 点「导出 CSV」→ 下载文件，Excel 打开中文不乱码
11. ✅ 点 ☀️ → 切换到亮色 → 刷新页面 → 保持亮色
12. ✅ 再次切换回暗色 → 刷新 → 保持暗色

测试完毕后 Ctrl+C 停掉。

- [ ] **Step 3: Commit（如有修改）**

```bash
cd "d:/邓杰鹏个人主页"
git status
# 如有手动修改，git add 并 commit
```

---

### Task 14: 部署到 Vercel

- [ ] **Step 1: 确保代码已全部提交**

```bash
cd "d:/邓杰鹏个人主页"
git status
```

Expected: working tree clean

- [ ] **Step 2: 推送到 GitHub**

```bash
cd "d:/邓杰鹏个人主页"
git push origin master
```

- [ ] **Step 3: 通过 Vercel CLI 部署**

```bash
cd "d:/邓杰鹏个人主页/asset-dashboard"
npx vercel --prod
```

按提示操作：
1. 登录 Vercel 账号
2. 确认项目配置（框架自动检测为 Next.js）
3. 设置 Root Directory 为 `asset-dashboard`
4. 等待部署完成

Expected: 部署成功，输出一个公开 URL，如 `https://asset-dashboard-xxx.vercel.app`

- [ ] **Step 4: 访问公开 URL 验证**

在浏览器打开 Vercel 返回的 URL，确认：
- 页面正常加载
- 图表正常渲染
- 录入/删除功能正常
- CSV 导出正常

- [ ] **Step 5: Commit（如有配置变更）**

```bash
cd "d:/邓杰鹏个人主页"
git status
# 如有 .vercel 或其他配置变更，提交
```

---

## 文件清单总结

| 文件 | 职责 |
|------|------|
| `asset-dashboard/app/layout.tsx` | 根布局，暗色主题默认开启 |
| `asset-dashboard/app/globals.css` | Tailwind + 滚动条样式 |
| `asset-dashboard/app/page.tsx` | 主页面，组合所有组件，管理数据状态 |
| `asset-dashboard/components/ThemeToggle.tsx` | 亮/暗主题切换，持久化到 localStorage |
| `asset-dashboard/components/KpiCards.tsx` | 4个概览数字卡片 |
| `asset-dashboard/components/AssetPieChart.tsx` | 资产配置饼图（Recharts） |
| `asset-dashboard/components/MonthlyTrend.tsx` | 月度净值趋势折线图（Recharts） |
| `asset-dashboard/components/TransactionForm.tsx` | 录入弹窗表单 |
| `asset-dashboard/components/TransactionList.tsx` | 交易记录列表 + 删除确认 |
| `asset-dashboard/lib/types.ts` | TypeScript 类型定义 |
| `asset-dashboard/lib/storage.ts` | LocalStorage CRUD |
| `asset-dashboard/lib/utils.ts` | 格式化、聚合计算、CSV导出 |
