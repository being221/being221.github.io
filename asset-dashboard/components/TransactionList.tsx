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
        {sorted.map((tx) => (
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
