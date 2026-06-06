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
            formatter={(_value: unknown) => {
              const value = _value as number;
              return [`¥${value.toLocaleString()}`, '余额'];
            }}
            labelFormatter={(_name: unknown) => {
              const name = String(_name);
              const pct =
                total > 0
                  ? (
                      ((chartData.find((d) => d.name === name)?.value ?? 0) /
                        total) *
                      100
                    ).toFixed(1)
                  : '0';
              return `${name} (${pct}%)`;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
