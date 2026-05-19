'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { PortalConfig } from '../types';

export function PortalPreview({ config }: { config: PortalConfig }) {
  const t = useTranslations('portalCustomize');

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
          <span className="text-base">👁️</span>
        </div>
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{t('preview')}</h2>
      </div>
      <div
        className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-sm"
        style={{ fontFamily: config.font_family }}
      >
        {/* Preview Header */}
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ backgroundColor: config.primary_color }}
        >
          <div className="flex items-center gap-2.5">
            {config.logo_url ? (
              <Image src={config.logo_url} alt={t("logo")} width={28} height={28} className="w-7 h-7 rounded-md" />
            ) : (
              <span className="text-xl">🪝</span>
            )}
            <span className="text-white text-sm font-semibold">
              {config.company_name || 'HookSniff'} {t('portalLabel')}
            </span>
          </div>
        </div>
        {/* Preview Content */}
        <div className={`p-5 space-y-3 ${config.dark_mode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
          <div className={`p-3.5 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
            <div className="text-xs font-medium mb-1.5">{t('webhookEndpoints')}</div>
            <div className={`text-xs ${config.dark_mode ? 'text-slate-400' : 'text-gray-500'}`}>
              {t('endpointsConfigured', { count: 2 })}
            </div>
          </div>
          {config.show_events && (
            <div className={`p-3.5 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
              <div className="text-xs font-medium mb-1.5">{t('eventSubscriptions')}</div>
              <div className="flex gap-1.5">
                <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: config.primary_color + '20', color: config.primary_color }}>
                  order.created
                </span>
                <span className="text-xs px-2 py-1 rounded-md" style={{ backgroundColor: config.primary_color + '20', color: config.primary_color }}>
                  payment.completed
                </span>
              </div>
            </div>
          )}
          {config.show_deliveries && (
            <div className={`p-3.5 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
              <div className="text-xs font-medium mb-1.5">{t('recentDeliveries')}</div>
              <div className={`text-xs ${config.dark_mode ? 'text-slate-400' : 'text-gray-500'}`}>
                {t('deliveredFailed', { delivered: 47, failed: 3 })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
