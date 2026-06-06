import { Transaction, AssetSummary, MonthSnapshot } from './types';

/** 格式化金额为千分位 */
export function formatAmount(amount: number): string {
  return amount.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** 计算每月末的净值快照 */
function computeMonthlySnapshots(
  transactions: Transaction[]
): MonthSnapshot[] {
  const map = new Map<string, number>();
  const sorted = [...transactions].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

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
  const thisMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1
  ).padStart(2, '0')}`;
  const lastMonth =
    now.getMonth() === 0
      ? `${now.getFullYear() - 1}-12`
      : `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`;

  const thisSnapshot = snapshots.find((s) => s.month === thisMonth);
  const lastSnapshot = snapshots.find((s) => s.month === lastMonth);

  const thisValue = thisSnapshot?.netWorth ?? currentNetWorth;
  const lastValue = lastSnapshot?.netWorth ?? 0;

  return thisValue - lastValue;
}

/** 从交易列表计算所有派生数据 */
export function computeSummary(transactions: Transaction[]): AssetSummary {
  const byCategory: Record<string, number> = {};

  for (const tx of transactions) {
    const delta = tx.type === 'income' ? tx.amount : -tx.amount;
    byCategory[tx.category] = (byCategory[tx.category] ?? 0) + delta;
  }

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

/** 导出 CSV 文件（UTF-8 BOM，Excel 兼容） */
export function exportCSV(transactions: Transaction[]): void {
  const BOM = '﻿';
  const header = '日期,类型,金额,类别,备注';
  const sorted = [...transactions].sort(
    (a, b) => b.date.localeCompare(a.date)
  );
  const rows = sorted.map((tx) => {
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
