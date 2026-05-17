'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { HistoryDay } from './types';
import { formatDate, uptimeCalendarColor } from './utils';

export function UptimeCalendar({ history }: { history: HistoryDay[] }) {
  const t = useTranslations('status');
  const [hoveredDay, setHoveredDay] = useState<HistoryDay | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Group by month for labels
  const months: { label: string; count: number }[] = [];
  let currentMonth = '';
  for (const day of history) {
    const month = new Date(day.date).toLocaleString('en-US', { month: 'short' });
    if (month !== currentMonth) {
      months.push({ label: month, count: 1 });
      currentMonth = month;
    } else {
      months[months.length - 1].count++;
    }
  }

  return (
    <div className="mt-4">
      <div className="flex gap-px flex-wrap" style={{ gap: '2px' }}>
        {history.map((day) => (
          <div
            key={day.date}
            className={`w-3 h-3 rounded-xs cursor-pointer hover:ring-1 hover:ring-white/50 transition-all ${uptimeCalendarColor(day.uptime)}`}
            onMouseEnter={(e) => {
              setHoveredDay(day);
              setTooltipPos({ x: e.clientX, y: e.clientY });
            }}
            onMouseLeave={() => setHoveredDay(null)}
          />
        ))}
      </div>
      {/* Month labels */}
      <div className="flex gap-px mt-1" style={{ gap: '2px' }}>
        {months.map((m) => (
          <div key={m.label + m.count} className="text-[10px] text-gray-500 dark:text-slate-500" style={{ width: `${m.count * 14}px` }}>
            {m.label}
          </div>
        ))}
      </div>
      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 px-2.5 py-1.5 bg-gray-900 dark:bg-slate-700 text-white text-xs rounded-lg shadow-lg pointer-events-none"
          style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 36 }}
        >
          <div className="font-medium">{formatDate(hoveredDay.date)}</div>
          <div>{hoveredDay.uptime.toFixed(2)}% uptime</div>
        </div>
      )}
      {/* Legend */}
      <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-500 dark:text-slate-500">
        <span>100%</span>
        <div className="flex gap-0.5">
          <div className="w-2.5 h-2.5 rounded-xs bg-emerald-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-lime-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-yellow-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-orange-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-red-500" />
          <div className="w-2.5 h-2.5 rounded-xs bg-gray-600" />
        </div>
        <span>0%</span>
        <span className="ml-2">{t("noData")}</span>
      </div>
    </div>
  );
}
