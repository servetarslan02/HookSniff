'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';

interface PlatformSettings {
  default_plan: string;
  max_endpoints_free: number;
  max_endpoints_pro: number;
  max_webhooks_free: number;
  max_webhooks_pro: number;
  rate_limit_free: number;
  rate_limit_pro: number;
  retry_max_attempts: number;
  retention_days_free: number;
  retention_days_pro: number;
  maintenance_mode: boolean;
  signup_enabled: boolean;
}

const defaultSettings: PlatformSettings = {
  default_plan: 'free',
  max_endpoints_free: 5,
  max_endpoints_pro: 50,
  max_webhooks_free: 10000,
  max_webhooks_pro: 50000,
  rate_limit_free: 100,
  rate_limit_pro: 1000,
  retry_max_attempts: 3,
  retention_days_free: 7,
  retention_days_pro: 30,
  maintenance_mode: false,
  signup_enabled: true,
};

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true); // Item 121 — initial loading state
  const [showSuccess, setShowSuccess] = useState(false); // Item 120 — inline success
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

  // Item 123 — Fetch settings from backend on mount
  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
      // If fetch fails, keep default settings
    } catch {
      // Silently fall back to defaults
    } finally {
      setLoading(false);
    }
  }, [token, API]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    setShowSuccess(false);
    try {
      const res = await fetch(`${API}/admin/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error(tc('error'));
      toast(t('settingsSaved'), 'success');
      // Item 120 — Show inline success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch {
      toast(t('settingsSaveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof PlatformSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setShowSuccess(false);
  };

  // Item 121 — Loading state
  if (loading) {
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

      {/* Item 120 — Success feedback banner */}
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
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
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
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
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
              <option value="free">{t('freePlan')}</option>
              <option value="pro">{t('proPlan')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Plan Limits */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('planLimits')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">{t('freePlan')}</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="max_endpoints_free" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('maxEndpoints')} <span className="text-red-500">*</span></label>
                <input
                  id="max_endpoints_free"
                  type="number"
                  min={1}
                  max={999}
                  value={settings.max_endpoints_free}
                  onChange={(e) => update('max_endpoints_free', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="max_webhooks_free" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('maxWebhooksMonth')} <span className="text-red-500">*</span></label>
                <input
                  id="max_webhooks_free"
                  type="number"
                  min={0}
                  max={9999999}
                  value={settings.max_webhooks_free}
                  onChange={(e) => update('max_webhooks_free', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="rate_limit_free" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('rateLimitReqMin')} <span className="text-red-500">*</span></label>
                <input
                  id="rate_limit_free"
                  type="number"
                  min={1}
                  max={100000}
                  value={settings.rate_limit_free}
                  onChange={(e) => update('rate_limit_free', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="retention_days_free" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('retentionDays')} <span className="text-red-500">*</span></label>
                <input
                  id="retention_days_free"
                  type="number"
                  min={1}
                  max={365}
                  value={settings.retention_days_free}
                  onChange={(e) => update('retention_days_free', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">{t('proPlan')}</h3>
            <div className="space-y-3">
              <div>
                <label htmlFor="max_endpoints_pro" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('maxEndpoints')} <span className="text-red-500">*</span></label>
                <input
                  id="max_endpoints_pro"
                  type="number"
                  min={1}
                  max={999}
                  value={settings.max_endpoints_pro}
                  onChange={(e) => update('max_endpoints_pro', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="max_webhooks_pro" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('maxWebhooksMonth')} <span className="text-red-500">*</span></label>
                <input
                  id="max_webhooks_pro"
                  type="number"
                  min={0}
                  max={9999999}
                  value={settings.max_webhooks_pro}
                  onChange={(e) => update('max_webhooks_pro', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="rate_limit_pro" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('rateLimitReqMin')} <span className="text-red-500">*</span></label>
                <input
                  id="rate_limit_pro"
                  type="number"
                  min={1}
                  max={100000}
                  value={settings.rate_limit_pro}
                  onChange={(e) => update('rate_limit_pro', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
              <div>
                <label htmlFor="retention_days_pro" className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('retentionDays')} <span className="text-red-500">*</span></label>
                <input
                  id="retention_days_pro"
                  type="number"
                  min={1}
                  max={365}
                  value={settings.retention_days_pro}
                  onChange={(e) => update('retention_days_pro', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Retry Settings */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('retrySettings')}</h2>
        <div>
          <label htmlFor="retry_max_attempts" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('maxRetryAttempts')} <span className="text-red-500">*</span></label>
          <input
            id="retry_max_attempts"
            type="number"
            value={settings.retry_max_attempts}
            onChange={(e) => update('retry_max_attempts', parseInt(e.target.value) || 0)}
            min={0}
            max={10}
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
          />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('retryDesc')}</p>
        </div>
      </div>

      {/* Alert Thresholds */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">🚨 {t('alertThresholds')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('alertThresholdsDesc')}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="alert_success_rate" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('successRateThreshold')}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('below')}</span>
              <input
                id="alert_success_rate"
                type="number"
                min={0}
                max={100}
                defaultValue={95}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
              />
              <span className="text-sm text-gray-500 dark:text-slate-400">%</span>
            </div>
          </div>
          <div>
            <label htmlFor="alert_latency" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('latencyThreshold')}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('above')}</span>
              <input
                id="alert_latency"
                type="number"
                min={0}
                max={60000}
                defaultValue={5000}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
              />
              <span className="text-sm text-gray-500 dark:text-slate-400">ms</span>
            </div>
          </div>
          <div>
            <label htmlFor="alert_queue" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('queueDepthThreshold')}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('above')}</span>
              <input
                id="alert_queue"
                type="number"
                min={0}
                max={100000}
                defaultValue={100}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
              />
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('messages')}</span>
            </div>
          </div>
          <div>
            <label htmlFor="alert_failed" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('failedDeliveryThreshold')}</label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('above')}</span>
              <input
                id="alert_failed"
                type="number"
                min={0}
                max={10000}
                defaultValue={10}
                className="w-24 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition"
              />
              <span className="text-sm text-gray-500 dark:text-slate-400">{t('perHour')}</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">{t('notificationChannels')}</h3>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">📧 Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">💬 Slack</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-red-600 focus:ring-red-500" />
              <span className="text-sm text-gray-700 dark:text-slate-300">🔗 Webhook</span>
            </label>
          </div>
        </div>
      </div>

      {/* Item 130 — Save button: consistent color in both modes */}
      <div className="flex items-center gap-3 justify-end">
        {showSuccess && (
          <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
            <span aria-hidden="true">✓</span> {t('settingsSaved')}
          </span>
        )}
        <button type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-red-600 dark:bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 dark:hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition disabled:opacity-60"
        >
          {saving ? tc('saving') : t('saveSettings')}
        </button>
      </div>
    </div>
  );
}
