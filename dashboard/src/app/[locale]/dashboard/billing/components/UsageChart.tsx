'use client';

export interface UsageChartData {
  month: string;
  count: number;
}

export function UsageChart({ data }: { data: UsageChartData[] }) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count), 1); // min 1 to avoid div/0
  const barWidth = data.length === 1 ? 80 : 40;
  const gap = data.length === 1 ? 0 : 20;
  const w = data.length * (barWidth + gap);
  const h = 160;

  return (
    <svg width={w} height={h + 30} className="overflow-visible">
      {data.map((d, i) => {
        const barH = Math.max((d.count / max) * h, 2); // min 2px so bar is visible
        const x = i * (barWidth + gap);
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={h - barH}
              width={barWidth}
              height={barH}
              rx={6}
              fill="#4c6ef5"
              opacity={0.8}
            />
            <text x={x + barWidth / 2} y={h + 20} textAnchor="middle" className="text-xs fill-gray-500 dark:fill-slate-400">
              {d.month}
            </text>
            <text x={x + barWidth / 2} y={h - barH - 6} textAnchor="middle" className="text-[10px] font-medium fill-gray-600 dark:fill-slate-300">
              {d.count.toLocaleString()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
