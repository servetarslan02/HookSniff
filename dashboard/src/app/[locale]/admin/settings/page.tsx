'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useAdminSettings, useUpdateSettings, useAdminAlerts, useCreateAlert, useUpdateAlert } from '@/hooks/useAdminData';
import { useQueryClient } from '@tanstack/react-query';
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

const defaultSettings: PlatformSettings = {
  default_plan: 'developer',
  max_endpoints_free: 5,
  max_endpoints_startup: 20,
  max_endpoints_pro: 50,
  max_endpoints_enterprise: 200,
  max_webhooks_free: 1000,
  max_webhooks_startup: 10000,
  max_webhooks_pro: 50000,
  max_webhooks_enterprise: 500000,
  rate_limit_free: 100,
  rate_limit_startup: 500,
  rate_limit_pro: 1000,
  rate_limit_enterprise: 5000,
  retention_days_free: 7,
  retention_days_startup: 14,
  retention_days_pro: 180,
  retention_days_enterprise: 365,
  retry_max_attempts: 3,
  maintenance_mode: false,
  signup_enabled: true,
  plan_price_startup: 14,
  plan_price_pro: 29,
  plan_price_enterprise: 99,
  plan_price_business: 99,
  resend_api_key: null,
  email_sender: null,
  webhook_secret: null,
  backup_retention_days: 30,
  global_rate_limit: 1000,
  cors_origins: null,
};

const ALERT_CONDITIONS: Record<string, { condition: string; label: string; unit: string; direction: 'below' | 'above'; default: number }> = {
  success_rate: { condition: 'failure_rate', label: 'successRateThreshold', unit: '%', direction: 'below', default: 95 },
  latency: { condition: 'latency', label: 'latencyThreshold', unit: 'ms', direction: 'above', default: 5000 },
  consecutive_failures: { condition: 'consecutive_failures', label: 'failedDeliveryThreshold', unit: 'perHour', direction: 'above', default: 10 },
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  // React Query hooks
  const queryClient = useQueryClient();
  const { data: settingsData, isLoading } = useAdminSettings();
  const updateSettingsMutation = useUpdateSettings();
  const { data: alertRules = [] } = useAdminAlerts();
  const createAlertMutation = useCreateAlert();
  const updateAlertMutation = useUpdateAlert();

  // Local UI state
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'general' | 'email' | 'alerts' | 'dev'>('general');
  const [alertThresholds, setAlertThresholds] = useState<Record<string, number>>({
    success_rate: 95,
    latency: 5000,
    consecutive_failures: 10,
  });
  const [alertChannels, setAlertChannels] = useState<Record<string, boolean>>({
    email: true,
    slack: false,
    webhook: false,
  });

  // Sync fetched settings into local state
  useEffect(() => {
    if (settingsData) {
      setSettings(settingsData as unknown as PlatformSettings);
    }
  }, [settingsData]);

  // Sync alert rules back to thresholds
  useEffect(() => {
    if (alertRules.length > 0) {
      const thresholds: Record<string, number> = {};
      const channels: Record<string, boolean> = { email: false, slack: false, webhook: false };

      for (const rule of alertRules) {
        if (rule.condition === 'failure_rate') thresholds.success_rate = rule.threshold;
        else if (rule.condition === 'latency') thresholds.latency = rule.threshold;
        else if (rule.condition === 'consecutive_failures') thresholds.consecutive_failures = rule.threshold;
        for (const ch of rule.channels) {
          channels[ch] = true;
        }
      }

      if (Object.keys(thresholds).length > 0) {
        setAlertThresholds((prev) => ({ ...prev, ...thresholds }));
      }
      setAlertChannels((prev) => ({ ...prev, ...channels }));
    }
  }, [alertRules]);

  const handleSave = async () => {
    if (updateSettingsMutation.isPending) return;
    try {
      await updateSettingsMutation.mutateAsync(settings as unknown as Record<string, unknown>);
      toast(t('settingsSaved'), 'success');
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      toast(t('settingsSaveFailed'), 'error');
    }
  };

  const handleAlertSave = async () => {
    if (createAlertMutation.isPending || updateAlertMutation.isPending) return;
    try {
      const channels = Object.entries(alertChannels)
        .filter(([, enabled]) => enabled)
        .map(([ch]) => ch);

      const existingByCondition: Record<string, AlertRule> = {};
      for (const rule of alertRules) {
        existingByCondition[rule.condition] = rule as AlertRule;
      }

      const promises: Promise<unknown>[] = [];

      for (const [, config] of Object.entries(ALERT_CONDITIONS)) {
        const existing = existingByCondition[config.condition];
        const threshold = alertThresholds[config.condition === 'failure_rate' ? 'success_rate' : config.condition === 'latency' ? 'latency' : 'consecutive_failures'];

        if (existing) {
          promises.push(updateAlertMutation.mutateAsync({ id: existing.id, data: { threshold, channels, is_active: true } }));
        } else {
          promises.push(createAlertMutation.mutateAsync({ name: `${config.condition} alert`, condition: config.condition, threshold, channels }));
        }
      }

      const results = await Promise.allSettled(promises);
      const failures = results.filter(r => r.status === 'rejected');
      if (failures.length > 0) {
        toast(t('alertSettingsPartialFail') || `${failures.length} alert(s) failed to save`, 'error');
      } else {
        toast(t('alertSettingsSaved') || 'Alert settings saved', 'success');
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      toast(t('alertSettingsFailed') || 'Failed to save alert settings', 'error');
    }
  };

  const update = (key: keyof PlatformSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setShowSuccess(false);
  };

  const updateAlertThreshold = (key: string, value: number) => {
    setAlertThresholds((prev) => ({ ...prev, [key]: value }));
  };

  const toggleChannel = (channel: string) => {
    setAlertChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-8 max-w-3xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('platformSettings')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('loadingSettings')}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('loadingSettings')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('platformSettings')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('platformSettingsDesc')}
        </p>
      </div>

      {/* Success feedback banner */}
      {showSuccess && (
        <div
          role="status"
          aria-live="polite"
          className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4 flex items-center gap-2"
        >
          <span className="text-green-600 dark:text-green-400" aria-hidden="true">✅</span>
          <span className="text-green-700 dark:text-green-400 text-sm font-medium">{t('settingsSaved')}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
        {([
          { key: 'general', icon: '⚙️', label: t('general') || 'General' },
          { key: 'email', icon: '📧', label: t('emailSecurity') || 'Email & Security' },
          { key: 'alerts', icon: '🚨', label: t('alertsRetry') || 'Alerts & Retry' },
          { key: 'dev', icon: '🧪', label: 'Dev Tools' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSettingsTab(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              settingsTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            }`}
          >
            <span className="text-xs">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* General */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('general')}</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{t('maintenanceMode')}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{t('maintenanceDesc')}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.maintenance_mode}
              onClick={() => update('maintenance_mode', !settings.maintenance_mode)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                settings.maintenance_mode ? 'bg-red-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                settings.maintenance_mode ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{t('signupsEnabled')}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">{t('signupsDesc')}</div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={settings.signup_enabled}
              onClick={() => update('signup_enabled', !settings.signup_enabled)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                settings.signup_enabled ? 'bg-green-600' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ${
                settings.signup_enabled ? 'translate-x-5' : 'translate-x-0'
              }`} />
            </button>
          </div>
          <div>
            <label htmlFor="default_plan" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('defaultPlan')} <span className="text-red-500">*</span></label>
            <select
              id="default_plan"
              value={settings.default_plan}
              onChange={(e) => update('default_plan', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
            >
              <option value="developer">{t('developerPlan')}</option>
              <option value="startup">{t('startupPlan')}</option>
              <option value="pro">{t('proPlan')}</option>
              <option value="enterprise">{t('enterprisePlan')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plan Limits & Prices — moved to Revenue page */}
      <div className={`glass-card p-6 ${settingsTab !== 'general' ? 'hidden' : ''}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💰 {t('planPrices') || 'Plan Prices & Limits'}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('planPricesMoved') || 'Plan prices and limits are now managed from the Revenue page.'}</p>
          </div>
          <a
            href="/admin/revenue"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
          >
            {t('goToRevenue') || 'Go to Revenue'} →
          </a>
        </div>
      </div>

      {/* Email Settings */}
      <div className={`glass-card p-6 ${settingsTab !== 'email' ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📧 {t('emailSettings') || 'Email Settings'}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('emailSettingsDesc') || 'Configure email delivery via Resend.'}</p>
        <div className="space-y-4">
          <div>
            <label htmlFor="resend_api_key" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Resend API Key</label>
            <input id="resend_api_key" type="password" value={settings.resend_api_key || ''} onChange={(e) => update('resend_api_key', e.target.value || null)} placeholder="re_..." className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          </div>
          <div>
            <label htmlFor="email_sender" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('senderAddress') || 'Sender Address'}</label>
            <input id="email_sender" type="email" value={settings.email_sender || ''} onChange={(e) => update('email_sender', e.target.value || null)} placeholder="noreply@hooksniff.dev" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className={`glass-card p-6 ${settingsTab !== 'email' ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🔐 {t('securitySettings') || 'Security & Webhook Settings'}</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="webhook_secret" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('webhookSecret') || 'Default Webhook Secret'}</label>
            <input id="webhook_secret" type="password" value={settings.webhook_secret || ''} onChange={(e) => update('webhook_secret', e.target.value || null)} placeholder="whsec_..." className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('webhookSecretDesc') || 'Default signing secret for webhook payloads.'}</p>
          </div>
          <div>
            <label htmlFor="global_rate_limit" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('globalRateLimit') || 'Global API Rate Limit (req/min)'}</label>
            <input id="global_rate_limit" type="number" min={10} max={100000} value={settings.global_rate_limit} onChange={(e) => update('global_rate_limit', parseInt(e.target.value) || 1000)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          </div>
          <div>
            <label htmlFor="cors_origins" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('corsOrigins') || 'Allowed CORS Origins'}</label>
            <input id="cors_origins" type="text" value={settings.cors_origins || ''} onChange={(e) => update('cors_origins', e.target.value || null)} placeholder="https://hooksniff.vercel.app, https://app.example.com" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('corsOriginsDesc') || 'Comma-separated list of allowed origins. Leave empty for default.'}</p>
          </div>
        </div>
      </div>

      {/* Backup Settings */}
      <div className={`glass-card p-6 ${settingsTab !== 'email' ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💾 {t('backupSettings') || 'Backup Settings'}</h2>
        <div>
          <label htmlFor="backup_retention" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('backupRetention') || 'Backup Retention (days)'}</label>
          <input id="backup_retention" type="number" min={1} max={365} value={settings.backup_retention_days} onChange={(e) => update('backup_retention_days', parseInt(e.target.value) || 30)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('backupRetentionDesc') || 'Number of days to keep database backups.'}</p>
        </div>
      </div>

      {/* Retry Settings */}
      <div className={`glass-card p-6 ${settingsTab !== 'alerts' ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('retrySettings')}</h2>
        <div>
          <label htmlFor="retry_max_attempts" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('maxRetryAttempts')} <span className="text-red-500">*</span></label>
          <input id="retry_max_attempts" type="number" value={settings.retry_max_attempts} onChange={(e) => update('retry_max_attempts', parseInt(e.target.value) || 0)} min={0} max={10} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('retryDesc')}</p>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className={`glass-card p-6 ${settingsTab !== 'alerts' ? 'hidden' : ''}`}>
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
            disabled={createAlertMutation.isPending || updateAlertMutation.isPending}
            className="px-6 py-3 bg-orange-600 dark:bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 dark:hover:bg-orange-700 focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition disabled:opacity-60"
          >
            {(createAlertMutation.isPending || updateAlertMutation.isPending) ? tc('saving') : (t('saveAlertSettings') || '🚨 Save Alert Settings')}
          </button>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-3 justify-end">
        {showSuccess && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <span aria-hidden="true">✓</span> {t('settingsSaved')}
          </span>
        )}
        <button type="button"
          onClick={handleSave}
          disabled={updateSettingsMutation.isPending}
          className="px-6 py-3 bg-red-600 dark:bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 dark:hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition disabled:opacity-60"
        >
          {updateSettingsMutation.isPending ? tc('saving') : t('saveSettings')}
        </button>
      </div>
    
      {/* Dev Tools — Sentry Test */}
      <div className={`glass-card p-6 ${settingsTab !== 'dev' ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🧪 Dev Tools</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
          Development and debugging tools. Only visible in dev mode.
        </p>

        <div className="space-y-4">
          {/* Sentry Error Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Sentry Error Test</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Throw a test error to verify Sentry integration</p>
            </div>
            <button
              type="button"
              onClick={() => {
                try {
                  throw new Error('[HookSniff] Sentry test error from admin settings');
                } catch (e) {
                  import('@sentry/nextjs').then((Sentry) => {
                    Sentry.captureException(e);
                    toast('Test error sent to Sentry', 'success');
                  }).catch(() => {
                    toast('Sentry not available in this environment', 'error');
                  });
                }
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Send Test Error
            </button>
          </div>

          {/* WS Connection Test */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">WebSocket Status</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Check WebSocket connection state</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';
                const wsUrl = apiUrl.replace(/^http/, 'ws') + '/ws';
                toast(`WS: ${wsUrl}`, 'info');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition"
            >
              Check WS
            </button>
          </div>

          {/* Cache Clear */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">Clear React Query Cache</h3>
              <p className="text-xs text-gray-500 dark:text-slate-400">Force invalidate all cached data</p>
            </div>
            <button
              type="button"
              onClick={() => {
                queryClient.clear();
                toast('React Query cache cleared', 'success');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 rounded-lg transition"
            >
              Clear Cache
            </button>
          </div>
        </div>
      </div>
</div>
  );
}
