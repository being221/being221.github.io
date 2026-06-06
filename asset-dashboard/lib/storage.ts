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
  const txs = loadTransactions().filter((t) => t.id !== id);
  saveTransactions(txs);
  return txs;
}
