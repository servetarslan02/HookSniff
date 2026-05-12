'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { adminApi, type PlatformSettings } from '@/lib/api';
import { useTranslations } from 'next-intl';

/* ─── Hook0-style Admin Settings: Kart tabanlı ayarlar ─── */

export default function AdminSettingsPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const t = useTranslations('admin');
  const tc = useTranslations('common');

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const data = await adminApi.getSettings(token);
      setSettings(data);
    } catch {
      toast(t('failedToLoadSettings') || 'Ayarlar yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  }, [token, toast, t]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    if (!token || !settings) return;
    setSaving(true);
    try {
      await adminApi.updateSettings(token, settings);
      toast(t('settingsSaved') || 'Ayarlar kaydedildi', 'success');
    } catch {
      toast(t('settingsSaveFailed') || 'Kaydetme başarısız', 'error');
    } finally {
      setSaving(false);
    }
  };

  const update = (key: keyof PlatformSettings, value: unknown) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settingsNav') || 'Ayarlar'}</h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('settingsNav') || 'Ayarlar'}</h2>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition disabled:opacity-60"
        >
          {saving ? (tc('saving') || 'Kaydediliyor...') : (tc('save') || 'Kaydet')}
        </button>
      </div>

      {/* ── Plan Fiyatları ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('planPrices') || 'Plan Fiyatları'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Pro ($)</label>
            <input
              type="number"
              value={settings.plan_price_pro}
              onChange={(e) => update('plan_price_pro', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Business ($)</label>
            <input
              type="number"
              value={settings.plan_price_business}
              onChange={(e) => update('plan_price_business', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Limitler ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('limits') || 'Limitler'}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t('maxEndpointsFree') || 'Max Endpoint (Free)'}</label>
            <input
              type="number"
              value={settings.max_endpoints_free}
              onChange={(e) => update('max_endpoints_free', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t('maxEndpointsPro') || 'Max Endpoint (Pro)'}</label>
            <input
              type="number"
              value={settings.max_endpoints_pro}
              onChange={(e) => update('max_endpoints_pro', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t('rateLimitFree') || 'Rate Limit (Free)'}</label>
            <input
              type="number"
              value={settings.rate_limit_free}
              onChange={(e) => update('rate_limit_free', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">{t('rateLimitPro') || 'Rate Limit (Pro)'}</label>
            <input
              type="number"
              value={settings.rate_limit_pro}
              onChange={(e) => update('rate_limit_pro', Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-sm"
            />
          </div>
        </div>
      </div>

      {/* ── Toggle'lar ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('platform') || 'Platform'}</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.signup_enabled}
              onChange={(e) => update('signup_enabled', e.target.checked)}
              className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('signupEnabled') || 'Kayıt açık'}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.maintenance_mode}
              onChange={(e) => update('maintenance_mode', e.target.checked)}
              className="w-4 h-4 rounded text-green-600 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t('maintenanceMode') || 'Bakım modu'}</span>
          </label>
        </div>
      </div>
    </div>
  );
}
