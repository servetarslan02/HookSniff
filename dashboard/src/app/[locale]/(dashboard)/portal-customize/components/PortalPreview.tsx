'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import type { PortalConfig } from '../types';

export function PortalPreview({ config }: { config: PortalConfig }) {
  const t = useTranslations('portalCustomize');

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('preview')}</h2>
      <div
        className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700"
        style={{ fontFamily: config.font_family }}
      >
        {/* Preview Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: config.primary_color }}
        >
          <div className="flex items-center gap-3">
            {config.logo_url ? (
              <Image src={config.logo_url} alt={t("logo")} width={32} height={32} className="w-8 h-8 rounded-sm" />
            ) : (
              <span className="text-2xl">🪝</span>
            )}
            <span className="text-white font-semibold">
              {config.company_name || 'HookSniff'} {t('portalLabel')}
            </span>
          </div>
        </div>
        {/* Preview Content */}
        <div className={`p-6 ${config.dark_mode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
          <div className="space-y-4">
            <div className={`p-4 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
              <div className="text-sm font-medium mb-2">{t('webhookEndpoints')}</div>
              <div className={`text-xs ${config.dark_mode ? 'text-slate-400' : 'text-gray-500'}`}>
                {t('endpointsConfigured', { count: 2 })}
              </div>
            </div>
            {config.show_events && (
              <div className={`p-4 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                <div className="text-sm font-medium mb-2">{t('eventSubscriptions')}</div>
                <div className="flex gap-2">
                  <span className="text-xs px-2 py-1 rounded-sm" style={{ backgroundColor: config.primary_color + '20', color: config.primary_color }}>
                    order.created
                  </span>
                  <span className="text-xs px-2 py-1 rounded-sm" style={{ backgroundColor: config.primary_color + '20', color: config.primary_color }}>
                    payment.completed
                  </span>
                </div>
              </div>
            )}
            {config.show_deliveries && (
              <div className={`p-4 rounded-xl ${config.dark_mode ? 'bg-slate-800' : 'bg-gray-50'}`}>
                <div className="text-sm font-medium mb-2">{t('recentDeliveries')}</div>
                <div className={`text-xs ${config.dark_mode ? 'text-slate-400' : 'text-gray-500'}`}>
                  {t('deliveredFailed', { delivered: 47, failed: 3 })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
