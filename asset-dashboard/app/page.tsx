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

  useEffect(() => {
    setTransactions(loadTransactions());
  }, []);

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

        <KpiCards summary={summary} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1">
            <AssetPieChart data={summary.byCategory} />
          </div>
          <div className="lg:col-span-2">
            <MonthlyTrend data={summary.monthlySnapshots} />
          </div>
        </div>

        <TransactionList
          transactions={transactions}
          onDelete={handleDelete}
        />
      </div>

      {showForm && (
        <TransactionForm
          onSubmit={handleAdd}
          onClose={() => setShowForm(false)}
        />
      )}
    </main>
  );
}
