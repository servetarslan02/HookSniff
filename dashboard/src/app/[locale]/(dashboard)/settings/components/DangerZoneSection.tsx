'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useRouter } from '@/i18n/navigation';
import { getErrorMessage } from '@/lib/errors';

export function DangerZoneSection() {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const { token, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE' || !deletePassword) return;
    setDeletingAccount(true);
    try {
      const { apiFetch } = await import('@/lib/api');
      await apiFetch('/auth/account', { method: 'DELETE', body: { password: deletePassword }, token: token ?? undefined });
      logout();
      router.push('/');
    } catch (e: unknown) {
      toast(getErrorMessage(e, tc('unknownError')), 'error');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      {/* Section divider */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-base">⚠️</span>
        <h2 className="text-sm font-semibold text-red-500 dark:text-red-400 uppercase tracking-wider">{t('dangerZone')}</h2>
        <div className="flex-1 h-px bg-red-200 dark:bg-red-500/20 ml-2" />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-red-200 dark:border-red-500/20 divide-y divide-red-100 dark:divide-red-500/10">
        {/* Sign out */}
        <div className="flex items-center justify-between p-5">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{t('signOut')}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{t('signOutDesc')}</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl hover:bg-red-100 dark:hover:bg-red-500/20 transition"
          >
            {t('signOut')}
          </button>
        </div>

        {/* Delete account */}
        <div className="flex items-center justify-between p-5">
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">{t('deleteAccount')}</div>
            <div className="text-xs text-gray-500 dark:text-slate-400">{t('deleteAccountDesc')}</div>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl hover:bg-red-600 hover:text-white hover:border-red-600 transition"
          >
            {t('deleteAccount')}
          </button>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-2">⚠️ {t('deleteAccount')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('deleteAccountWarning')}
            </p>
            <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">
              {t('typeDeleteToConfirm')}
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder={t('deletePlaceholder')}
              className="w-full px-4 py-3 border border-red-300 dark:border-red-500/30 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <p className="text-sm text-gray-700 dark:text-slate-300 mb-2">
              {t('confirmPassword') || 'Enter your password to confirm'}
            </p>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder={t('passwordPlaceholder') || 'Password'}
              className="w-full px-4 py-3 border border-red-300 dark:border-red-500/30 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white mb-4 focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); setDeletePassword(''); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || !deletePassword || deletingAccount}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-40"
              >
                {deletingAccount ? tc('deleting') : t('permanentlyDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
