'use client';

import { useTranslations } from 'next-intl';
import type { PlatformSettings } from '@/lib/api';

interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  channels: string[];
  is_active: boolean;
  created_at: string;
}

interface AlertsTabProps {
  settings: PlatformSettings;
  update: (key: keyof PlatformSettings, value: unknown) => void;
  alertRules: AlertRule[];
  alertThresholds: Record<string, number>;
  alertChannels: Record<string, boolean>;
  updateAlertThreshold: (key: string, value: number) => void;
  toggleChannel: (channel: string) => void;
  handleAlertSave: () => void;
  isSaving: boolean;
}

export default function AlertsTab({
  settings,
  update,
  alertRules,
  alertThresholds,
  alertChannels,
  updateAlertThreshold,
  toggleChannel,
  handleAlertSave,
  isSaving,
}: AlertsTabProps) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  return (
    <div className="space-y-6">
      {/* Retry Settings */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('retrySettings')}</h2>
        <div>
          <label htmlFor="retry_max_attempts" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('maxRetryAttempts')} <span className="text-red-500">*</span></label>
          <input id="retry_max_attempts" type="number" value={settings.retry_max_attempts} onChange={(e) => update('retry_max_attempts', parseInt(e.target.value) || 0)} min={0} max={10} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('retryDesc')}</p>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🚨 {t('alertThresholds')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('alertThresholdsDesc')}</p>

        {alertRules.length > 0 && (
          <div className="mb-4 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            {alertRules.length} {t('activeAlertRules') || 'active alert rule(s) configured'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="alert_success_rate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('successRateThreshold')}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('below')}</span>
              <input id="alert_success_rate" type="number" min={0} max={100} value={alertThresholds.success_rate} onChange={(e) => updateAlertThreshold('success_rate', parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
              <span className="text-sm text-gray-500 dark:text-slate-400">%</span>
            </div>
          </div>
          <div>
            <label htmlFor="alert_latency" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('latencyThreshold')}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('above')}</span>
              <input id="alert_latency" type="number" min={0} max={60000} value={alertThresholds.latency} onChange={(e) => updateAlertThreshold('latency', parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
              <span className="text-sm text-gray-500 dark:text-slate-400">ms</span>
            </div>
          </div>
          <div>
            <label htmlFor="alert_failed" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('failedDeliveryThreshold')}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('above')}</span>
              <input id="alert_failed" type="number" min={0} max={10000} value={alertThresholds.consecutive_failures} onChange={(e) => updateAlertThreshold('consecutive_failures', parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('perHour')}</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">{t('notificationChannels')}</h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={alertChannels.email} onChange={() => toggleChannel('email')} className="w-4 h-4 rounded-sm border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">📧 Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={alertChannels.slack} onChange={() => toggleChannel('slack')} className="w-4 h-4 rounded-sm border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">💬 Slack</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={alertChannels.webhook} onChange={() => toggleChannel('webhook')} className="w-4 h-4 rounded-sm border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">🔗 Webhook</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 justify-end">
          <button type="button"
            onClick={handleAlertSave}
            disabled={isSaving}
            className="px-6 py-3 bg-orange-600 dark:bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 dark:hover:bg-orange-700 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition disabled:opacity-60"
          >
            {isSaving ? tc('saving') : (t('saveAlertSettings') || '🚨 Save Alert Settings')}
          </button>
        </div>
      </div>
    </div>
  );
}
