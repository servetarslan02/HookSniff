'use client';

import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import type { PortalConfig } from '../types';

export function EmbedCodePanel({
  config,
  embedCode,
  portalUrl,
}: {
  config: PortalConfig;
  embedCode: string;
  portalUrl: string;
}) {
  const t = useTranslations('portalCustomize');
  const { toast } = useToast();

  const fallbackEmbedCode = `<iframe
  src="https://hooksniff.vercel.app/portal/embed/YOUR_PORTAL_ID"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"
/>`;

  const displayEmbedCode = embedCode || fallbackEmbedCode;
  const displayPortalUrl = portalUrl || 'https://hooksniff.vercel.app/portal/embed/YOUR_PORTAL_ID';

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast(t('copied'), 'success');
  };

  return (
    <>
      {/* Embed Code */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
            <span className="text-base">📋</span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('embedCode')}</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
          {t('embedCodeDesc')}
        </p>
        {portalUrl && (
          <div className="mb-4 p-3 bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20 rounded-xl">
            <div className="text-xs font-medium text-brand-700 dark:text-brand-300 mb-1">{t('portalUrl') || 'Portal URL'}</div>
            <a href={displayPortalUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-mono text-brand-600 dark:text-brand-400 hover:underline break-all">
              {displayPortalUrl}
            </a>
          </div>
        )}
        <div className="relative">
          <button
            type="button"
            onClick={() => handleCopy(displayEmbedCode)}
            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition z-10"
          >
            {t('copy')}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <code>{displayEmbedCode}</code>
          </pre>
        </div>
      </div>

      {/* React Integration */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <span className="text-base">⚛️</span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('reactIntegration')}</h2>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              handleCopy(`import { HookSniffPortal } from '@hooksniff/react';

<HookSniffPortal
  portalId="${portalUrl ? portalUrl.split('/').pop() : 'YOUR_PORTAL_ID'}"
  primaryColor="${config.primary_color}"
  darkMode={${config.dark_mode}}
  companyName="${config.company_name || 'My App'}"
/>`);
            }}
            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition z-10"
          >
            {t('copy')}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <code>{`import { HookSniffPortal } from '@hooksniff/react';

<HookSniffPortal
  portalId="${portalUrl ? portalUrl.split('/').pop() : 'YOUR_PORTAL_ID'}"
  primaryColor="${config.primary_color}"
  darkMode={${config.dark_mode}}
  companyName="${config.company_name || 'My App'}"
/>`}</code>
          </pre>
        </div>
      </div>
    </>
  );
}
