'use client';

import { useTranslations } from 'next-intl';

interface InfrastructureItem {
  label: string;
  value: string;
  detail: string;
}

export default function Infrastructure({ items }: { items: InfrastructureItem[] }) {
  const t = useTranslations('admin');

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('infrastructure')}</h2>
      </div>
      <div className="hidden md:grid md:grid-cols-3 gap-4 px-6 py-3 bg-gray-50 dark:bg-slate-800/30 border-b border-gray-200/50 dark:border-slate-700/50 text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
        <div>{t('infrastructureHeader')}</div>
        <div>{t('providerLabel')}</div>
        <div>{t('details')}</div>
      </div>
      <div className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
        {items.map((item) => (
          <div key={item.label} className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
            <div className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</div>
            <div className="text-sm text-gray-600 dark:text-slate-300">{item.value}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{item.detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
