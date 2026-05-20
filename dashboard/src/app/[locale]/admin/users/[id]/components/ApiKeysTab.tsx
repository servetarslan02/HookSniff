'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import type { ApiKeysTabProps } from './types';
import { Key } from '@/components/icons';

export function ApiKeysTab({ userApiKeys, t }: ApiKeysTabProps) {
  return (
    <LazySection fallback={Skeletons.card} rootMargin={300}>
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><Key size={16} strokeWidth={1.75} className="inline mr-1" /> {t("apiKeys") || "API Keys"}</h2>
      {userApiKeys.length > 0 ? (
        <div className="glass-card p-6">
          {userApiKeys.map((k, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{k.name}</p>
                <p className="text-sm font-mono text-gray-500 dark:text-slate-400">{k.prefix}••••••••</p>
              </div>
              <div className="text-right">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${k.is_active ? "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" : "bg-gray-100 dark:bg-slate-800 text-gray-500"}`}>{k.is_active ? "Active" : "Inactive"}</span>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{new Date(k.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-slate-400">{t("noApiKeys") || "No API keys"}</p>
      )}
    </div>
    </LazySection>
  );
}
