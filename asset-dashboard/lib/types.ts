export type AssetCategory =
  | '现金'
  | '基金'
  | '股票'
  | '黄金'
  | '加密货币'
  | '房产'
  | '负债';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: AssetCategory;
  note: string;
  date: string;
  createdAt: string;
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
  month: string;
  netWorth: number;
}
