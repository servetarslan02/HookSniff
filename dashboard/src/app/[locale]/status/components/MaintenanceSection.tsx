'use client';

import { useTranslations } from 'next-intl';
import type { Maintenance } from './types';
import { formatDate, formatDateTime } from './utils';
import { StatusBadge } from './StatusBadge';
import { Calendar, Wrench } from '@/components/icons';

export function MaintenanceSection({ maintenance }: { maintenance: Maintenance[] }) {
  const t = useTranslations('status');
  const upcoming = maintenance.filter(m => m.status === 'scheduled' || m.status === 'in_progress');
  const past = maintenance.filter(m => m.status === 'completed');

  return (
    <div className="space-y-4">
      {upcoming.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3">{t("upcoming")}</h3>
          <div className="space-y-3">
            {upcoming.map((m) => (
              <div key={m.id} className="border border-blue-200 dark:border-blue-500/20 bg-blue-50/50 dark:bg-blue-500/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 dark:text-white text-sm"><Wrench size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {m.title}</span>
                  <StatusBadge status={m.status === 'in_progress' ? 'monitoring' : 'identified'} />
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-400 mb-2">{m.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-slate-500">
                  <span><Calendar size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {formatDateTime(m.scheduled_start)} — {formatDateTime(m.scheduled_end)}</span>
                  <span>• Affects: {m.affected_components.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {past.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 mb-3">{t("pastMaintenance")}</h3>
          <div className="space-y-2">
            {past.map((m) => (
              <div key={m.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <span className="text-gray-900 dark:text-white">{m.title}</span>
                  <span className="text-gray-500 dark:text-slate-500 ml-2 text-xs">({m.affected_components.join(', ')})</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-slate-500">{formatDate(m.scheduled_start)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {upcoming.length === 0 && past.length === 0 && (
        <div className="text-center py-6 text-gray-500 dark:text-slate-500">
          <p className="text-sm">{t("noScheduled")}</p>
        </div>
      )}
    </div>
  );
}
