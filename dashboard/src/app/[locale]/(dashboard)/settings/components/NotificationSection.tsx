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

  // Fetch notification preferences from backend on mount
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
      // Fallback to localStorage
      setEmailNotifs(localStorage.getItem('hooksniff_email_notifs') !== 'false');
      setFailureAlerts(localStorage.getItem('hooksniff_failure_alerts') !== 'false');
      setWeeklyDigest(localStorage.getItem('hooksniff_weekly_digest') === 'true');
    } finally {
      setLoadingPrefs(false);
    }
  }, [token]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  // Sync to localStorage when values change
  useEffect(() => {
    localStorage.setItem('hooksniff_email_notifs', String(emailNotifs));
  }, [emailNotifs]);
  useEffect(() => {
    localStorage.setItem('hooksniff_failure_alerts', String(failureAlerts));
  }, [failureAlerts]);
  useEffect(() => {
    localStorage.setItem('hooksniff_weekly_digest', String(weeklyDigest));
  }, [weeklyDigest]);

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
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('notifications')}</h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-5">{t('notificationsDesc')}</p>
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-sm w-40 mb-2" />
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded-sm w-64" />
              </div>
              <div className="w-11 h-6 bg-gray-200 dark:bg-slate-700 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
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
            type="button"
            onClick={handleNotificationSave}
            disabled={notificationSaving}
            className="px-4 py-2 bg-gray-900 dark:bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition disabled:opacity-60"
          >
            {notificationSaving ? tc('saving') : tc('save')}
          </button>
        </div>
      </div>
    </div>
  );
}
