'use client';

import { useState, useEffect } from 'react';
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
  const [notificationSaving, setNotificationSaving] = useState(false);

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
