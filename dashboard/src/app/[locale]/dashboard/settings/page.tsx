'use client';

import { getErrorMessage } from '@/lib/errors';

import { useAuth } from '@/lib/store';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/components/Toast';
import { useRouter } from '@/i18n/navigation';

export default function SettingsPage() {
  const { user, token, apiKey, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const t = useTranslations('settings');
  const tc = useTranslations('common');

  // Profile form state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notification preferences (persisted in localStorage until API supports them)
  const [emailNotifs, setEmailNotifs] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hooksniff_email_notifs') !== 'false';
  });
  const [failureAlerts, setFailureAlerts] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('hooksniff_failure_alerts') !== 'false';
  });
  const [weeklyDigest, setWeeklyDigest] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('hooksniff_weekly_digest') === 'true';
  });

  // Persist preferences on change
  useEffect(() => {
    localStorage.setItem('hooksniff_email_notifs', String(emailNotifs));
  }, [emailNotifs]);
  useEffect(() => {
    localStorage.setItem('hooksniff_failure_alerts', String(failureAlerts));
  }, [failureAlerts]);
  useEffect(() => {
    localStorage.setItem('hooksniff_weekly_digest', String(weeklyDigest));
  }, [weeklyDigest]);

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess('');
    try {
      const { api } = await import('@/lib/api');
      await api.put('/auth/profile', { name: profileName, email: profileEmail }, token ?? undefined);
      setProfileSuccess(tc('success'));
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (e: unknown) {
      setProfileError(getErrorMessage(e));
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }

    setPasswordSaving(true);
    try {
      const { api } = await import('@/lib/api');
      await api.put('/auth/password', { current_password: currentPassword, new_password: newPassword }, token ?? undefined);
      setPasswordSuccess(tc('success'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (e: unknown) {
      setPasswordError(getErrorMessage(e));
    } finally {
      setPasswordSaving(false);
    }
  };

  const [notificationSaving, setNotificationSaving] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') return;
    setDeletingAccount(true);
    try {
      const { api } = await import('@/lib/api');
      await api.delete('/auth/account', token ?? undefined);
      logout();
      router.push('/');
    } catch (e: unknown) {
      toast(getErrorMessage(e), 'error');
    } finally {
      setDeletingAccount(false);
      setShowDeleteModal(false);
    }
  };

  const handleNotificationSave = async () => {
    setNotificationSaving(true);
    try {
      const { api } = await import('@/lib/api');
      await api.put('/portal/notifications', {
        email_on_failure: failureAlerts,
        email_on_dead_letter: failureAlerts,
        email_on_success: emailNotifs,
        slack_webhook_url: null,
      }, token ?? undefined);
      toast(tc('success'), 'success');
    } catch (e: unknown) {
      toast(getErrorMessage(e), 'error');
    } finally {
      setNotificationSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('profile')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('profileDesc')}</p>

        {profileSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-sm text-green-700 dark:text-green-400">
            ✓ {profileSuccess}
          </div>
        )}
        {profileError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
            {profileError}
          </div>
        )}

        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {(profileName || user?.email || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">
                Plan: <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300">
                  {user?.plan || 'free'}
                </span>
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('displayName')}</label>
            <input
              id="profile-name"
              type="text" autoComplete="name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('emailAddress')}</label>
            <input
              id="profile-email"
              type="email" autoComplete="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={profileSaving}
              className="px-6 py-2.5 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60"
            >
              {profileSaving ? tc('saving') : tc('save')}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('changePassword')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('changePasswordDesc')}</p>

        {passwordSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-sm text-green-700 dark:text-green-400">
            ✓ {passwordSuccess}
          </div>
        )}
        {passwordError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-700 dark:text-red-400">
            {passwordError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('currentPassword')}</label>
            <input
              id="current-password"
              type="password" autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('newPassword')}</label>
            <input
              id="new-password"
              type="password" autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">{t('passwordMinLength')}</p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">{t('confirmNewPassword')}</label>
            <input
              id="confirm-password"
              type="password" autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={passwordSaving}
              className="px-6 py-2.5 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60"
            >
              {passwordSaving ? tc('saving') : t('changePassword')}
            </button>
          </div>
        </form>
      </div>

      {/* API Key Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('api')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('apiDesc')}</p>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={apiKey ? '••••••••••••••••••••••••••••••••' : t('noApiKey')}
              readOnly
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-950 font-mono text-sm text-gray-700 dark:text-slate-300"
            />
            <button
              onClick={copyApiKey}
              disabled={!apiKey}
              className="bg-gray-900 dark:bg-slate-700 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-slate-600 transition disabled:opacity-40 whitespace-nowrap"
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            {t('keepSecret')}{' '}
            <a href="/dashboard/api-keys" className="text-brand-600 dark:text-brand-400 hover:underline">
              {t('manageApiKeys')} →
            </a>
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('notifications')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('notificationsDesc')}</p>
        <div className="space-y-4">
          <ToggleRow
            label={t('emailNotifications')}
            description={t('emailNotificationsDesc')}
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <ToggleRow
            label={t('failureAlerts')}
            description={t('failureAlertsDesc')}
            checked={failureAlerts}
            onChange={setFailureAlerts}
          />
          <ToggleRow
            label={t('weeklyDigest')}
            description={t('weeklyDigestDesc')}
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
          />
          <div className="pt-2">
            <button
              onClick={handleNotificationSave}
              disabled={notificationSaving}
              className="px-4 py-2 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60"
            >
              {notificationSaving ? tc('saving') : tc('save')}
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-red-200 dark:border-red-500/20">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">{t('dangerZone')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{t('signOut')}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{t('signOutDesc')}</div>
            </div>
            <button
              onClick={logout}
              className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition"
            >
              Sign Out
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{t('deleteAccount')}</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">{t('deleteAccountDesc')}</div>
            </div>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 hover:text-white transition"
            >
              {t('deleteAccount')}
            </button>
          </div>
        </div>
      </div>
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
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
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(''); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE' || deletingAccount}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-40"
              >
                {deletingAccount ? tc('deleting') : t('permanentlyDelete')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Toggle Row Component ─── */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-xs text-gray-500 dark:text-slate-400">{description}</div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
          checked ? 'bg-brand-600 dark:bg-brand-500' : 'bg-gray-300 dark:bg-slate-600'
        }`}
      >
        <div
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
