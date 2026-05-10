'use client';

import { useState } from 'react';
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
  max_webhooks_free: 1000,
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
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const API = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:3000/v1');

  const handleSave = async () => {
    setSaving(true);
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
    } catch {
      toast('Failed to save settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof PlatformSettings, value: unknown) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('platformSettings')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Configure platform-wide defaults and limits
        </p>
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
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('defaultPlan')}</label>
            <select
              value={settings.default_plan}
              onChange={(e) => update('default_plan', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
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
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('maxEndpoints')}</label>
                <input
                  type="number"
                  value={settings.max_endpoints_free}
                  onChange={(e) => update('max_endpoints_free', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Max Webhooks/Month</label>
                <input
                  type="number"
                  value={settings.max_webhooks_free}
                  onChange={(e) => update('max_webhooks_free', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Rate Limit (req/min)</label>
                <input
                  type="number"
                  value={settings.rate_limit_free}
                  onChange={(e) => update('rate_limit_free', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Retention (days)</label>
                <input
                  type="number"
                  value={settings.retention_days_free}
                  onChange={(e) => update('retention_days_free', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-slate-300 mb-3">{t('proPlan')}</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">{t('maxEndpoints')}</label>
                <input
                  type="number"
                  value={settings.max_endpoints_pro}
                  onChange={(e) => update('max_endpoints_pro', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Max Webhooks/Month</label>
                <input
                  type="number"
                  value={settings.max_webhooks_pro}
                  onChange={(e) => update('max_webhooks_pro', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Rate Limit (req/min)</label>
                <input
                  type="number"
                  value={settings.rate_limit_pro}
                  onChange={(e) => update('rate_limit_pro', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-slate-400 mb-1">Retention (days)</label>
                <input
                  type="number"
                  value={settings.retention_days_pro}
                  onChange={(e) => update('retention_days_pro', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
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
          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('maxRetryAttempts')}</label>
          <input
            type="number"
            value={settings.retry_max_attempts}
            onChange={(e) => update('retry_max_attempts', parseInt(e.target.value) || 0)}
            min={0}
            max={10}
            className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t('retryDesc')}</p>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gray-900 dark:bg-red-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-red-700 transition disabled:opacity-60"
        >
          {saving ? tc('saving') : t('saveSettings')}
        </button>
      </div>
    </div>
  );
}
