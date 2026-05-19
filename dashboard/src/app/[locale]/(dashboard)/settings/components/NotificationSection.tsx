'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { getErrorMessage } from '@/lib/errors';
import { ToggleRow } from './ToggleRow';

export function NotificationSection() {
  const t = useTranslations('settings');
  const tc = useTranslations('common');
  const { token } = useAuth();
  const { toast } = useToast();

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [failureAlerts, setFailureAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [loadingPrefs, setLoadingPrefs] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!token) {
      setLoadingPrefs(false);
      return;
    }
    try {
      const { apiFetch } = await import('@/lib/api');
      const data = await apiFetch<{
        email_on_failure?: boolean;
        email_on_dead_letter?: boolean;
        email_on_success?: boolean;
        email_on_weekly_digest?: boolean;
      }>('/portal/notifications', { token });
      if (data.email_on_success !== undefined) setEmailNotifs(data.email_on_success);
      if (data.email_on_failure !== undefined) setFailureAlerts(data.email_on_failure);
      if (data.email_on_weekly_digest !== undefined) setWeeklyDigest(data.email_on_weekly_digest);
    } catch {
      setEmailNotifs(localStorage.getItem('hooksniff_email_notifs') !== 'false');
      setFailureAlerts(localStorage.getItem('hooksniff_failure_alerts') !== 'false');
      setWeeklyDigest(localStorage.getItem('hooksniff_weekly_digest') === 'true');
    } finally {
      setLoadingPrefs(false);
    }
  }, [token]);

  useEffect(() => { fetchPreferences(); }, [fetchPreferences]);

  useEffect(() => { localStorage.setItem('hooksniff_email_notifs', String(emailNotifs)); }, [emailNotifs]);
  useEffect(() => { localStorage.setItem('hooksniff_failure_alerts', String(failureAlerts)); }, [failureAlerts]);
  useEffect(() => { localStorage.setItem('hooksniff_weekly_digest', String(weeklyDigest)); }, [weeklyDigest]);

  const handleNotificationSave = async () => {
    setNotificationSaving(true);
    try {
      const { api } = await import('@/lib/api');
      await api.put('/portal/notifications', {
        email_on_failure: failureAlerts,
        email_on_dead_letter: failureAlerts,
        email_on_success: emailNotifs,
        email_on_weekly_digest: weeklyDigest,
        slack_webhook_url: null,
      }, token ?? undefined);
      toast(tc('success'), 'success');
    } catch (e: unknown) {
      toast(getErrorMessage(e, tc('unknownError')), 'error');
    } finally {
      setNotificationSaving(false);
    }
  };

  if (loadingPrefs) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 animate-pulse">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-slate-700" />
          <div>
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32 mb-1" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-48" />
          </div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-2">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-1" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-56" />
              </div>
              <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
          <span className="text-base">🔔</span>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t('notifications')}</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400">{t('notificationsDesc')}</p>
        </div>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-slate-700/50">
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
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleNotificationSave}
          disabled={notificationSaving}
          className="px-5 py-2 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60 shadow-sm"
        >
          {notificationSaving ? tc('saving') : tc('save')}
        </button>
      </div>
    </div>
  );
}
