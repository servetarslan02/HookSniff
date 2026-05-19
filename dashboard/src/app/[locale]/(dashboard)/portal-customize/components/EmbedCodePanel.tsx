'use client';

import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import type { PortalConfig } from '../types';
import { ClipboardList, Link2, Zap } from 'lucide-react';

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

  const apiBase = 'https://hooksniff-api-1046140057667.europe-west1.run.app';
  const dashBase = 'https://hooksniff.vercel.app';

  const fallbackIframe = `<iframe
  src="${apiBase}/v1/embed/portal"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.1);"
/>`;

  const fallbackScript = `<script
  src="${dashBase}/portal/embed.js"
  data-api-key="YOUR_API_KEY"
  data-api-url="${apiBase}/v1"
  data-theme="${config.dark_mode ? 'dark' : 'light'}"
  data-height="600px"
></script>`;

  const displayIframe = embedCode || fallbackIframe;
  const displayPortalUrl = portalUrl || `${apiBase}/v1/embed/portal`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast(t('copied'), 'success');
  };

  return (
    <>
      {/* Portal URL */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-green-50 dark:bg-green-500/10 flex items-center justify-center">
            <span className="text-base"><Link2 size={18} strokeWidth={1.75} /></span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('portalUrl') || 'Portal URL'}</h2>
        </div>
        <div className="flex items-center gap-3">
          <code className="flex-1 px-3.5 py-2.5 text-xs font-mono text-gray-700 dark:text-slate-300 bg-gray-50 dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-700 truncate select-all">
            {displayPortalUrl}
          </code>
          <button
            type="button"
            onClick={() => handleCopy(displayPortalUrl)}
            className="px-3 py-2.5 text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition whitespace-nowrap"
          >
            {t('copy')}
          </button>
        </div>
      </div>

      {/* iframe Embed */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
            <span className="text-base"><ClipboardList size={18} strokeWidth={1.75} /></span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('embedCode')}</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
          {t('embedCodeDesc')}
        </p>
        <div className="relative">
          <button
            type="button"
            onClick={() => handleCopy(displayIframe)}
            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition z-10"
          >
            {t('copy')}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <code>{displayIframe}</code>
          </pre>
        </div>
      </div>

      {/* Script Embed */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <span className="text-base"><Zap size={18} strokeWidth={1.75} /></span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Script Embed</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
          Doğrudan sayfanıza script olarak ekleyin. API anahtarınızı <code className="px-1 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs">data-api-key</code> alanına girin.
        </p>
        <div className="relative">
          <button
            type="button"
            onClick={() => handleCopy(fallbackScript)}
            className="absolute top-2 right-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition z-10"
          >
            {t('copy')}
          </button>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <code>{fallbackScript}</code>
          </pre>
        </div>
      </div>
    </>
  );
}
