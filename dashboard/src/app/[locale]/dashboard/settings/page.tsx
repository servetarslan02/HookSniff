'use client';

import { useAuth } from '@/lib/store';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function SettingsPage() {
  const { user, token, apiKey, logout } = useAuth();
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

  // Notification preferences
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [failureAlerts, setFailureAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

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
      const res = await fetch(`${API}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ name: profileName, email: profileEmail }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Failed to update profile');
      }
      setProfileSuccess(tc('success'));
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (e: any) {
      setProfileError(e.message);
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
      const res = await fetch(`${API}/auth/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || ''}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Failed to change password');
      }
      setPasswordSuccess(tc('success'));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 3000);
    } catch (e: any) {
      setPasswordError(e.message);
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
          Manage your account, security, and notification preferences
        </p>
      </div>

      {/* Profile Section */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('profile')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('profile')}</p>

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
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Display Name</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Email Address</label>
            <input
              type="email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              placeholder="you@company.com"
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
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('changePassword')}</p>

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
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">Must be at least 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">Confirm New Password</label>
            <input
              type="password"
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
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('api')}</p>
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={apiKey || t('noApiKey')}
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
            Keep this secret. Do not share it in client-side code.{' '}
            <a href="/dashboard/api-keys" className="text-brand-600 dark:text-brand-400 hover:underline">
              Manage API keys →
            </a>
          </p>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('notifications')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('notifications')}</p>
        <div className="space-y-4">
          <ToggleRow
            label="Email notifications"
            description="Receive important account updates via email"
            checked={emailNotifs}
            onChange={setEmailNotifs}
          />
          <ToggleRow
            label="Failure alerts"
            description="Get notified when webhook deliveries fail"
            checked={failureAlerts}
            onChange={setFailureAlerts}
          />
          <ToggleRow
            label="Weekly digest"
            description="Receive a weekly summary of your webhook activity"
            checked={weeklyDigest}
            onChange={setWeeklyDigest}
          />
        </div>
      </div>

      {/* Danger Zone */}
      <div className="glass-card p-6 border-red-200 dark:border-red-500/20">
        <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">{t('dangerZone')}</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 rounded-xl">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">Sign Out</div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Sign out of your account on this device</div>
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
              className="border border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 hover:text-white transition"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
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
