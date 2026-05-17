'use client';

import { sparkBarColor } from './utils';

export function Sparkline({ data }: { data: number[] }) {
  if (!data || data.length === 0) {
    return <div className="flex items-end gap-px h-6">{Array.from({ length: 24 }).map((_, i) => <div key={i} className="flex-1 bg-gray-200 dark:bg-slate-700 rounded-t-sm" style={{ height: '4px' }} />)}</div>;
  }
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-6" title={`Response times (last ${data.length}h): ${data.join(', ')}ms`}>
      {Array.from({ length: 24 }).map((_, i) => {
        const val = data[i] ?? 0;
        const height = val > 0 ? Math.max(4, (val / max) * 24) : 4;
        return (
          <div
            key={i}
            className={`flex-1 rounded-t-sm transition-all ${val > 0 ? sparkBarColor(val) : 'bg-gray-200 dark:bg-slate-700'}`}
            style={{ height: `${height}px` }}
            title={val > 0 ? `${val}ms` : 'No data'}
          />
        );
      })}
    </div>
  );
}
