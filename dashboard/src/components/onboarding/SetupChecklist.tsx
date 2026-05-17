'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { loadState } from './types';

interface ChecklistItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export function SetupChecklist() {
  const t = useTranslations('onboarding');
  const { user, token } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const items: ChecklistItem[] = [
    { id: 'account', label: t('checklistAccount'), href: "/", icon: '👤' },
    { id: 'apikey', label: t('checklistApikey'), href: `/core`, icon: '🔑' },
    { id: 'endpoint', label: t('checklistEndpoint'), href: `/core`, icon: '🔗' },
    { id: 'webhook', label: t('checklistWebhook'), href: `/devtools`, icon: '🧪' },
    { id: 'monitor', label: t('checklistMonitor'), href: `/core`, icon: '📊' },
  ];
  const [completed, setCompleted] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => {
    if (!token) return;
    const state = loadState();
    const done: string[] = ['account'];
    if (state.completedSteps.includes('sdk')) done.push('apikey');
    if (state.endpointCreated) done.push('endpoint');
    if (state.firstWebhookSent) done.push('webhook');
    if (state.completedSteps.includes('test')) done.push('monitor');
    setCompleted(done);
    if (done.length === items.length) {
      const completedAt = localStorage.getItem('hooksniff_checklist_completed_at');
      if (!completedAt) {
        localStorage.setItem('hooksniff_checklist_completed_at', Date.now().toString());
      } else if (Date.now() - parseInt(completedAt) > 24 * 60 * 60 * 1000) {
        setDismissed(true);
      }
    }
  }, [token, items.length]);

  if (!user || dismissed) return null;

  const percentage = Math.round((completed.length / items.length) * 100);

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-750 transition"
      >
        <div className="flex items-center gap-3">
          <div className="text-lg">🎯</div>
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{t("setupProgress")}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{t('checklistCompleted', { count: completed.length, total: items.length })}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-linear-to-r from-brand-500 to-green-500 transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{percentage}%</span>
          <span className="text-gray-500 dark:text-slate-500 text-sm">{expanded ? '▲' : '▼'}</span>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {items.map((item) => {
              const isDone = completed.includes(item.id);
              return (
                <a
                  key={item.id}
                  href={item.href}
                  className={`flex items-center gap-3 p-2.5 rounded-lg transition ${
                    isDone
                      ? 'bg-green-50 dark:bg-green-500/5'
                      : 'hover:bg-gray-50 dark:hover:bg-slate-750'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isDone
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
                  }`}>
                    {isDone ? '✓' : item.icon}
                  </div>
                  <span className={`text-sm ${
                    isDone
                      ? 'text-green-700 dark:text-green-400 line-through'
                      : 'text-gray-700 dark:text-slate-300'
                  }`}>
                    {item.label}
                  </span>
                </a>
              );
            })}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="mt-3 text-xs text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition"
          >
            {t('dismissChecklist')}
          </button>
        </div>
      )}
    </div>
  );
}
