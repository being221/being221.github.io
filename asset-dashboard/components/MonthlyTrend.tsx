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
            tickFormatter={(v: number) => `¥${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '8px',
              fontSize: '13px',
            }}
            formatter={(_value: unknown) => {
              const value = _value as number;
              return [`¥${value.toLocaleString()}`, '净值'];
            }}
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
