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
      {cards.map((card) => (
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
