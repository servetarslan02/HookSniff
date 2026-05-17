'use client';

import { useTranslations } from 'next-intl';
import type { PlatformSettings } from '@/lib/api';

interface EmailTabProps {
  settings: PlatformSettings;
  update: (key: keyof PlatformSettings, value: unknown) => void;
}

export default function EmailTab({ settings, update }: EmailTabProps) {
  const t = useTranslations('admin');

  return (
    <div className="space-y-6">
      {/* Email Settings */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">📧 {t('emailSettings') || 'Email Settings'}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('emailSettingsDesc') || 'Configure email delivery via Resend.'}</p>
        <div className="space-y-4">
          <div>
            <label htmlFor="resend_api_key" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Resend API Key</label>
            <input id="resend_api_key" type="password" value={settings.resend_api_key || ''} onChange={(e) => update('resend_api_key', e.target.value || null)} placeholder="re_..." className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          </div>
          <div>
            <label htmlFor="email_sender" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('senderAddress') || 'Sender Address'}</label>
            <input id="email_sender" type="email" value={settings.email_sender || ''} onChange={(e) => update('email_sender', e.target.value || null)} placeholder="noreply@hooksniff.vercel.app" className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="glass-card p-6">
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
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">💾 {t('backupSettings') || 'Backup Settings'}</h2>
        <div>
          <label htmlFor="backup_retention" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('backupRetention') || 'Backup Retention (days)'}</label>
          <input id="backup_retention" type="number" min={1} max={365} value={settings.backup_retention_days} onChange={(e) => update('backup_retention_days', parseInt(e.target.value) || 30)} className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent transition" />
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('backupRetentionDesc') || 'Number of days to keep database backups.'}</p>
        </div>
      </div>
    </div>
  );
}
