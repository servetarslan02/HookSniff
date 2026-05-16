'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { endpointsApi } from '@/lib/api';
import type { ParsedSpec } from '../parser';

export function ParsedResultsPanel({
  spec,
  onToggleEndpoint,
  onToggleAll,
}: {
  spec: ParsedSpec;
  onToggleEndpoint: (index: number) => void;
  onToggleAll: () => void;
}) {
  const t = useTranslations('apiImporter');
  const { token } = useAuth();
  const { toast } = useToast();
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(0);

  const importEndpoints = useCallback(async () => {
    if (!token) return;
    const selected = spec.endpoints.filter((e) => e.selected);
    if (selected.length === 0) {
      toast(t('selectAtLeastOne'), 'error');
      return;
    }

    setImporting(true);
    setImported(0);
    let success = 0;

    for (const ep of selected) {
      try {
        const url = ep.path.startsWith('http') ? ep.path : `${spec.baseUrl}${ep.path}`;
        await endpointsApi.create(token, {
          url: url || 'https://example.com/webhook',
          description: `[${ep.method}] ${ep.description}`,
        });
        success++;
        setImported(success);
      } catch {
        // Continue with remaining
      }
    }

    toast(t('imported', { success, total: selected.length }), success > 0 ? 'success' : 'error');
    setImporting(false);
  }, [spec, token, toast, t]);

  const selectedCount = spec.endpoints.filter((e) => e.selected).length;
  const allSelected = spec.endpoints.every((e) => e.selected);

  return (
    <>
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{spec.title} v{spec.version}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('endpointsFound', { count: spec.endpoints.length })}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onToggleAll}
              className="px-4 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition"
            >
              {allSelected ? t('deselectAll') : t('selectAll')}
            </button>
            <button
              onClick={importEndpoints}
              disabled={importing || selectedCount === 0}
              className="px-6 py-2 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition disabled:opacity-50"
            >
              {importing ? t('importing', { count: imported }) : t('importEndpoints', { count: selectedCount })}
            </button>
          </div>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {spec.endpoints.map((ep, i) => (
            <label
              key={i}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition ${
                ep.selected
                  ? 'bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20'
                  : 'bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-100 dark:hover:bg-slate-750'
              }`}
            >
              <input
                role="switch"
                aria-checked={ep.selected}
                type="checkbox"
                checked={ep.selected}
                onChange={() => onToggleEndpoint(i)}
                className="w-4 h-4 rounded-sm text-brand-600 focus:ring-brand-500"
              />
              <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                ep.method === 'GET' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400' :
                ep.method === 'POST' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400' :
                ep.method === 'PUT' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                ep.method === 'DELETE' ? 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400' :
                'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300'
              }`}>
                {ep.method}
              </span>
              <span className="font-mono text-sm text-gray-900 dark:text-white">{ep.path}</span>
              <span className="text-sm text-gray-500 dark:text-slate-400 truncate">{ep.description}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          {t('tip')}
        </p>
      </div>
    </>
  );
}
