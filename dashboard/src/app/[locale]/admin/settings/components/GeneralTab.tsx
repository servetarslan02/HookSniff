'use client';

import { useTranslations } from 'next-intl';
import type { PlatformSettings } from '@/lib/api';
import { DollarSign } from '@/components/icons';

interface GeneralTabProps {
  settings: PlatformSettings;
  update: (key: keyof PlatformSettings, value: unknown) => void;
}

export default function GeneralTab({ settings, update }: GeneralTabProps) {
  const t = useTranslations('admin');

  return (
    <div className="space-y-6">
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
      <div className="glass-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white"><DollarSign size={16} strokeWidth={1.75} className="inline mr-1" /> {t('planPrices') || 'Plan Prices & Limits'}</h2>
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
    </div>
  );
}
