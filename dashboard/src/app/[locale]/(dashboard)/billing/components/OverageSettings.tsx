'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { billingApiExtended } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useOverageSettings } from '@/hooks/useDashboardData';
import { useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';

export function OverageSettings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useOverageSettings();
  const [saving, setSaving] = useState(false);

  const handleToggle = async (field: 'allow_overage' | 'overage_email_notification', value: boolean) => {
    if (!token || !settings) return;
    setSaving(true);
    try {
      await billingApiExtended.updateOverageSettings(token, { [field]: value });
      queryClient.invalidateQueries({ queryKey: ['billing', 'overage'] });
      toast(t('overageSettingsSaved'), 'success');
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse space-y-4">
        <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded" />
        <div className="h-10 w-full bg-gray-200 dark:bg-slate-700 rounded" />
      </div>
    );
  }

  if (!settings) return null;

  const isFree = settings.plan === 'developer' || settings.plan === 'free';

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
      <p className="text-xs text-gray-500 dark:text-slate-400 mb-5">
        {t('overageSettingsDesc')}
      </p>

      <div className="space-y-4">
        {/* Allow Overage Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t('allowOverage')}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {t('allowOverageDesc')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.allow_overage}
            disabled={saving || isFree}
            onClick={() => handleToggle('allow_overage', !settings.allow_overage)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              settings.allow_overage ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-0 transition-transform duration-200 ease-in-out ${
                settings.allow_overage ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Email Notification Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {t('overageEmailNotification')}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
              {t('overageEmailNotificationDesc')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.overage_email_notification}
            disabled={saving || isFree}
            onClick={() => handleToggle('overage_email_notification', !settings.overage_email_notification)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
              settings.overage_email_notification ? 'bg-brand-600' : 'bg-gray-200 dark:bg-slate-600'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-xs ring-0 transition-transform duration-200 ease-in-out ${
                settings.overage_email_notification ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('dailyLimit')}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {settings.daily_limit.toLocaleString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {t('eventsPerDay')}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('overagePrice')}</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {settings.overage_price === 0
                ? '$0.00'
                : settings.overage_price < 0.001
                  ? `$${(settings.overage_price * 1000).toFixed(2)} / 1K`
                  : `$${settings.overage_price.toFixed(4)}`
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {settings.overage_price === 0 ? t('noOverage') : t('perEvent')}
            </p>
          </div>
        </div>

        {isFree && (
          <p className="text-xs text-gray-500 dark:text-slate-400 text-center pt-2">
            {t('overageUpgradeRequired')}
          </p>
        )}
      </div>
    </div>
  );
}
