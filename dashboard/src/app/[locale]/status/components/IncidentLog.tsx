'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Incident } from './types';
import { formatDate, formatRelativeTime } from './utils';
import { StatusBadge } from './StatusBadge';
import { PartyPopper } from 'lucide-react';

export function IncidentLog({ incidents }: { incidents: Incident[] }) {
  const t = useTranslations('status');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Group by date
  const grouped: Record<string, Incident[]> = {};
  for (const inc of incidents) {
    const date = new Date(inc.created_at).toISOString().split('T')[0];
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(inc);
  }

  // Sort dates descending
  const sortedDates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (incidents.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-slate-500">
        <div className="text-3xl mb-2"><PartyPopper size={40} strokeWidth={1.5} className="text-emerald-500" /></div>
        <p>{t('noIncidents')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((date) => (
        <div key={date}>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3">{formatDate(date)}</h3>
          <div className="space-y-3">
            {grouped[date].map((inc) => (
              <div key={inc.id} className="border border-gray-100 dark:border-slate-700 rounded-lg overflow-hidden">
                <button
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                  onClick={() => setExpandedId(expandedId === inc.id ? null : inc.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${inc.severity === 'critical' ? 'bg-red-500' : inc.severity === 'major' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
                    <span className="font-medium text-gray-900 dark:text-white text-sm">{inc.title}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-sm font-medium ${inc.severity === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : inc.severity === 'major' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                      {inc.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={inc.status} />
                    <span className={`text-xs text-gray-500 transition-transform ${expandedId === inc.id ? 'rotate-180' : ''}`}>▼</span>
                  </div>
                </button>
                {expandedId === inc.id && (
                  <div className="px-4 pb-3 border-t border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-500 mt-2 mb-3">
                      <span>{t('affects', { components: inc.affected_components.join(', ') })}</span>
                      {inc.resolved_at && <span>• {t('resolvedAt', { time: formatRelativeTime(inc.resolved_at) })}</span>}
                    </div>
                    <div className="space-y-2">
                      {inc.updates.map((update, i) => (
                        <div key={i} className="flex gap-3 text-sm">
                          <span className="text-xs text-gray-500 dark:text-slate-500 shrink-0 w-14">
                            {new Date(update.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div>
                            <StatusBadge status={update.status} />
                            <p className="text-gray-600 dark:text-slate-300 mt-1">{update.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
