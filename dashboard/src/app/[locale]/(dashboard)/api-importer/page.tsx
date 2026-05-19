'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { ParsedSpec } from './parser';
import { SpecInputPanel } from './components/SpecInputPanel';
import { ParsedResultsPanel } from './components/ParsedResultsPanel';

export default function ApiSpecImporterPage() {
  const t = useTranslations('apiImporter');
  const [parsed, setParsed] = useState<ParsedSpec | null>(null);

  const toggleEndpoint = (index: number) => {
    if (!parsed) return;
    const updated = { ...parsed };
    updated.endpoints = [...updated.endpoints];
    updated.endpoints[index] = { ...updated.endpoints[index], selected: !updated.endpoints[index].selected };
    setParsed(updated);
  };

  const toggleAll = () => {
    if (!parsed) return;
    const allSelected = parsed.endpoints.every((e) => e.selected);
    setParsed({
      ...parsed,
      endpoints: parsed.endpoints.map((e) => ({ ...e, selected: !allSelected })),
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      <SpecInputPanel onParsed={(spec) => setParsed(spec)} />

      {parsed && (
        <ParsedResultsPanel
          spec={parsed}
          onToggleEndpoint={toggleEndpoint}
          onToggleAll={toggleAll}
        />
      )}

      {/* Supported Formats */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('supportedFormats')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: t('openapi30'), ext: '.json / .yaml', icon: '📄' },
            { name: t('swagger20'), ext: '.json', icon: '📄' },
            { name: 'URL', ext: 'https://...', icon: '🔗' },
          ].map((fmt) => (
            <div key={fmt.name} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-xl">
              <span className="text-xl">{fmt.icon}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white text-sm">{fmt.name}</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{fmt.ext}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
