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

  return (
    <>
      {/* Embed Code */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('embedCode')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          {t('embedCodeDesc')}
        </p>
        {portalUrl && (
          <div className="mb-4 p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-xl">
            <div className="text-xs font-medium text-brand-700 dark:text-brand-300 mb-1">{t('portalUrl') || 'Portal URL'}</div>
            <a href={displayPortalUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-mono text-brand-600 dark:text-brand-400 hover:underline break-all">
              {displayPortalUrl}
            </a>
          </div>
        )}
        <div className="relative">
          <button type="button"
            onClick={() => { navigator.clipboard.writeText(displayEmbedCode); toast(t('copied'), 'success'); }}
            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
          >
            {t('copy')}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
            <code>{displayEmbedCode}</code>
          </pre>
        </div>
      </div>

      {/* React Integration */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('reactIntegration')}</h2>
        <div className="relative">
          <button type="button"
            onClick={() => {
              navigator.clipboard.writeText(`import { HookSniffPortal } from 'hooksniff-sdk/react';

<HookSniffPortal
  portalId="${portalUrl ? portalUrl.split('/').pop() : 'YOUR_PORTAL_ID'}"
  primaryColor="${config.primary_color}"
  darkMode={${config.dark_mode}}
  companyName="${config.company_name || 'My App'}"
/>`);
              toast(t('copied'), 'success');
            }}
            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
          >
            {t('copy')}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm font-mono overflow-x-auto">
            <code>{`import { HookSniffPortal } from 'hooksniff-sdk/react';

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
