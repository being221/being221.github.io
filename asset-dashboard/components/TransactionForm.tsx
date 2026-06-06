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
        onClick={(e) => e.stopPropagation()}
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
              onChange={(e) => setAmount(e.target.value)}
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
              onChange={(e) =>
                setCategory(e.target.value as AssetCategory)
              }
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500/50"
            >
              {CATEGORIES.map((c) => (
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
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500/50"
            />
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-xs text-slate-400 mb-1">备注</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
