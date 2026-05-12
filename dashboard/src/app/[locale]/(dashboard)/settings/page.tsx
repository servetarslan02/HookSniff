'use client';

import { useAuth } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { ProfileSection } from './components/ProfileSection';
import { PasswordSection } from './components/PasswordSection';
import { NotificationSection } from './components/NotificationSection';
import { DangerZoneSection } from './components/DangerZoneSection';

/* ─── Hook0-style: Settings (Ayarlar) ─── */

export default function SettingsPage() {
  const { user, token } = useAuth();
  const t = useTranslations('settings');

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('title')}</h2>

      {/* ── Edit Organization (Hook0 gibi) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {t('editOrg') || 'Organizasyonu düzenle'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t('editOrgDesc') || 'Organizasyon adını ve profil bilgilerinizi güncelleyin'}
        </p>
        <ProfileSection user={user} token={token} />
      </div>

      {/* ── Password ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {t('changePassword') || 'Şifre değiştir'}
        </h3>
        <PasswordSection token={token} />
      </div>

      {/* ── Notifications ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {t('notifications') || 'Bildirimler'}
        </h3>
        <NotificationSection />
      </div>

      {/* ── Delete Organization (Hook0 gibi, kırmızı) ── */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900 p-5">
        <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1 flex items-center gap-2">
          ⚠️ {t('deleteOrg') || 'Organizasyonu sil'}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          {t('deleteOrgDesc') || 'Bu işlem geri alınamaz. Tüm uygulamalar, endpoint\'ler ve veriler kalıcı olarak silinecek.'}
        </p>
        <DangerZoneSection />
      </div>
    </div>
  );
}
