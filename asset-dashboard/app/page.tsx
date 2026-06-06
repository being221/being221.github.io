'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Transaction } from '@/lib/types';
import { loadTransactions, saveTransactions } from '@/lib/storage';
import { computeSummary, exportCSV } from '@/lib/utils';
import {
  getSyncConfig,
  fetchFromGitHub,
  pushToGitHub,
} from '@/lib/github-sync';
import KpiCards from '@/components/KpiCards';
import AssetPieChart from '@/components/AssetPieChart';
import MonthlyTrend from '@/components/MonthlyTrend';
import TransactionList from '@/components/TransactionList';
import TransactionForm from '@/components/TransactionForm';
import ThemeToggle from '@/components/ThemeToggle';
import SyncSettings from '@/components/SyncSettings';

type SyncStatus = 'synced' | 'syncing' | 'error';

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [syncError, setSyncError] = useState('');
  const loadedRef = useRef(false);

  // 首次加载：先读 localStorage 快速渲染，再尝试从 GitHub 拉取
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    const local = loadTransactions();
    setTransactions(local);

    const config = getSyncConfig();
    if (!config) return;

    setSyncStatus('syncing');
    fetchFromGitHub(config)
      .then((result) => {
        if (result && result.transactions.length > 0) {
          setTransactions(result.transactions);
          saveTransactions(result.transactions);
        }
        setSyncStatus('synced');
      })
      .catch(() => {
        setSyncStatus('error');
        setSyncError('拉取失败，使用本地数据');
      });
  }, []);

  // 推送数据到 GitHub
  const sync = useCallback(async (txs: Transaction[]) => {
    const config = getSyncConfig();
    if (!config) return;

    setSyncStatus('syncing');
    const result = await pushToGitHub(txs);
    if (result.success) {
      setSyncStatus('synced');
      setSyncError('');
    } else {
      setSyncStatus('error');
      setSyncError(result.error ?? '推送失败');
      // 3 秒后自动清除错误提示
      setTimeout(() => {
        setSyncError('');
      }, 5000);
    }
  }, []);

  const summary = computeSummary(transactions);

  const handleAdd = useCallback(
    (tx: Transaction) => {
      const updated = [...transactions, tx];
      saveTransactions(updated);
      setTransactions(updated);
      setShowForm(false);
      sync(updated);
    },
    [transactions, sync]
  );

  const handleDelete = useCallback(
    (id: string) => {
      const updated = transactions.filter((t) => t.id !== id);
      saveTransactions(updated);
      setTransactions(updated);
      sync(updated);
    },
    [transactions, sync]
  );

  // 同步状态图标
  const syncIcon = getSyncConfig()
    ? syncStatus === 'syncing'
      ? '⏳'
      : syncStatus === 'error'
        ? '❌'
        : '⚡'
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* 顶栏 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">
              💰 资产仪表盘
            </h1>
            {syncIcon && (
              <span
                className="text-sm cursor-help"
                title={
                  syncStatus === 'synced'
                    ? '已同步到 GitHub'
                    : syncStatus === 'syncing'
                      ? '同步中...'
                      : syncError || '同步失败'
                }
              >
                {syncIcon}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg bg-sky-600 text-white text-xs lg:text-sm font-medium hover:bg-sky-500 transition active:scale-95"
            >
              + 记一笔
            </button>
            <button
              onClick={() => exportCSV(transactions)}
              className="px-3 py-1.5 lg:px-4 lg:py-2 rounded-lg border border-slate-600 text-slate-400 text-xs lg:text-sm hover:border-slate-500 hover:text-slate-300 transition"
              disabled={transactions.length === 0}
            >
              📥 CSV
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-1.5 rounded-lg border border-slate-600/50 text-slate-400 text-sm hover:border-slate-500 hover:text-slate-300 transition"
              title="同步设置"
            >
              ⚙️
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* 同步错误提示 */}
        {syncError && (
          <div className="bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2 text-sm text-red-400 flex items-center gap-2">
            <span>⚠️</span>
            <span>{syncError}</span>
            <span className="text-slate-500 text-xs ml-auto">
              数据已保存到本机，下次会重试
            </span>
          </div>
        )}

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

      {/* 同步设置弹窗 */}
      {showSettings && (
        <SyncSettings onClose={() => setShowSettings(false)} />
      )}
    </main>
  );
}
