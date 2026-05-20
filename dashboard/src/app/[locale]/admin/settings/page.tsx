'use client';

import { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/store';
import { useAdminSettings, useUpdateSettings, useAdminAlerts, useCreateAlert, useUpdateAlert } from '@/hooks/useAdminData';
import type { PlatformSettings } from '@/lib/api';
import { AlertTriangle, Check, CheckCircle2, FlaskConical, Mail, Settings } from '@/components/icons';

interface AlertRule {
 id: string;
 name: string;
 condition: string;
 threshold: number;
 channels: string[];
 is_active: boolean;
 created_at: string;
}

const defaultSettings: PlatformSettings = {
 default_plan: 'developer',
 max_endpoints_free: 5,
 max_endpoints_startup: 20,
 max_endpoints_pro: 50,
 max_endpoints_enterprise: 200,
 max_webhooks_free: 1000,
 max_webhooks_startup: 10000,
 max_webhooks_pro: 50000,
 max_webhooks_enterprise: 500000,
 rate_limit_free: 100,
 rate_limit_startup: 500,
 rate_limit_pro: 1000,
 rate_limit_enterprise: 5000,
 retention_days_free: 7,
 retention_days_startup: 14,
 retention_days_pro: 180,
 retention_days_enterprise: 365,
 retry_max_attempts: 3,
 maintenance_mode: false,
 signup_enabled: true,
 plan_price_startup: 14,
 plan_price_pro: 29,
 plan_price_enterprise: 99,
 plan_price_business: 99,
 resend_api_key: null,
 email_sender: null,
 webhook_secret: null,
 backup_retention_days: 30,
 global_rate_limit: 1000,
 cors_origins: null,
};

const ALERT_CONDITIONS: Record<string, { condition: string; label: string; unit: string; direction: 'below' | 'above'; default: number }> = {
 success_rate: { condition: 'failure_rate', label: 'successRateThreshold', unit: '%', direction: 'below', default: 95 },
 latency: { condition: 'latency', label: 'latencyThreshold', unit: 'ms', direction: 'above', default: 5000 },
 consecutive_failures: { condition: 'consecutive_failures', label: 'failedDeliveryThreshold', unit: 'perHour', direction: 'above', default: 10 },
};

const tabSkeleton = (
 <div className="space-y-6 animate-pulse">
  <div className="glass-card p-6"><div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
  <div className="glass-card p-6"><div className="h-32 bg-gray-200 dark:bg-slate-700 rounded-xl" /></div>
 </div>
);

// Lazy-loaded tab components — only mount when the tab is first visited
const GeneralTab = dynamic(() => import('./components/GeneralTab'), { ssr: false, loading: () => tabSkeleton });
const EmailTab = dynamic(() => import('./components/EmailTab'), { ssr: false, loading: () => tabSkeleton });
const AlertsTab = dynamic(() => import('./components/AlertsTab'), { ssr: false, loading: () => tabSkeleton });
const DevTab = dynamic(() => import('./components/DevTab'), { ssr: false, loading: () => tabSkeleton });

export default function AdminSettingsPage() {
 const { user } = useAuth();
 if (!user?.is_admin) return null;

 const { toast } = useToast();
 const t = useTranslations('admin');
 const tc = useTranslations('common');

 // React Query hooks
 const { data: settingsData, isLoading } = useAdminSettings();
 const updateSettingsMutation = useUpdateSettings();
 const { data: alertRules = [] } = useAdminAlerts();
 const createAlertMutation = useCreateAlert();
 const updateAlertMutation = useUpdateAlert();

 // Local UI state
 const [settings, setSettings] = useState<PlatformSettings>(defaultSettings);
 const [showSuccess, setShowSuccess] = useState(false);
 const [settingsTab, setSettingsTab] = useState<'general' | 'email' | 'alerts' | 'dev'>('general');
 const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['general']));
 const [alertThresholds, setAlertThresholds] = useState<Record<string, number>>({
  success_rate: 95,
  latency: 5000,
  consecutive_failures: 10,
 });
 const [alertChannels, setAlertChannels] = useState<Record<string, boolean>>({
  email: true,
  slack: false,
  webhook: false,
 });

 // Sync fetched settings into local state
 useEffect(() => {
  if (settingsData) {
   setSettings(settingsData as unknown as PlatformSettings);
  }
 }, [settingsData]);

 // Sync alert rules back to thresholds
 useEffect(() => {
  if (alertRules.length > 0) {
   const thresholds: Record<string, number> = {};
   const channels: Record<string, boolean> = { email: false, slack: false, webhook: false };

   for (const rule of alertRules) {
    if (rule.condition === 'failure_rate') thresholds.success_rate = rule.threshold;
    else if (rule.condition === 'latency') thresholds.latency = rule.threshold;
    else if (rule.condition === 'consecutive_failures') thresholds.consecutive_failures = rule.threshold;
    for (const ch of rule.channels) {
     channels[ch] = true;
    }
   }

   if (Object.keys(thresholds).length > 0) {
    setAlertThresholds((prev) => ({ ...prev, ...thresholds }));
   }
   setAlertChannels((prev) => ({ ...prev, ...channels }));
  }
 }, [alertRules]);

 const handleSave = async () => {
  if (updateSettingsMutation.isPending) return;
  try {
   await updateSettingsMutation.mutateAsync(settings as unknown as Record<string, unknown>);
   toast(t('settingsSaved'), 'success');
   setShowSuccess(true);
   setTimeout(() => setShowSuccess(false), 3000);
  } catch {
   toast(t('settingsSaveFailed'), 'error');
  }
 };

 const handleAlertSave = async () => {
  if (createAlertMutation.isPending || updateAlertMutation.isPending) return;
  try {
   const channels = Object.entries(alertChannels)
    .filter(([, enabled]) => enabled)
    .map(([ch]) => ch);

   const existingByCondition: Record<string, AlertRule> = {};
   for (const rule of alertRules) {
    existingByCondition[rule.condition] = rule as AlertRule;
   }

   const promises: Promise<unknown>[] = [];

   for (const [, config] of Object.entries(ALERT_CONDITIONS)) {
    const existing = existingByCondition[config.condition];
    const threshold = alertThresholds[config.condition === 'failure_rate' ? 'success_rate' : config.condition === 'latency' ? 'latency' : 'consecutive_failures'];

    if (existing) {
     promises.push(updateAlertMutation.mutateAsync({ id: existing.id, data: { threshold, channels, is_active: true } }));
    } else {
     promises.push(createAlertMutation.mutateAsync({ name: `${config.condition} alert`, condition: config.condition, threshold, channels }));
    }
   }

   const results = await Promise.allSettled(promises);
   const failures = results.filter(r => r.status === 'rejected');
   if (failures.length > 0) {
    toast(t('alertSettingsPartialFail') || `${failures.length} alert(s) failed to save`, 'error');
   } else {
    toast(t('alertSettingsSaved') || 'Alert settings saved', 'success');
   }
   setShowSuccess(true);
   setTimeout(() => setShowSuccess(false), 3000);
  } catch {
   toast(t('alertSettingsFailed') || 'Failed to save alert settings', 'error');
  }
 };

 const update = useCallback((key: keyof PlatformSettings, value: unknown) => {
  setSettings((prev) => ({ ...prev, [key]: value }));
  setShowSuccess(false);
 }, []);

 const updateAlertThreshold = useCallback((key: string, value: number) => {
  setAlertThresholds((prev) => ({ ...prev, [key]: value }));
 }, []);

 const toggleChannel = useCallback((channel: string) => {
  setAlertChannels((prev) => ({ ...prev, [channel]: !prev[channel] }));
 }, []);

 const setTab = useCallback((tab: string) => {
  setSettingsTab(tab as 'general' | 'email' | 'alerts' | 'dev');
  setVisitedTabs(prev => {
   if (prev.has(tab)) return prev;
   const next = new Set(prev);
   next.add(tab);
   return next;
  });
 }, []);

 const handleTabHover = useCallback((tab: string) => {
  setVisitedTabs(prev => {
   if (prev.has(tab)) return prev;
   const next = new Set(prev);
   next.add(tab);
   return next;
  });
 }, []);

 // Loading state
 if (isLoading) {
  return (
   <div className="space-y-8 max-w-3xl">
    <div>
     <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('platformSettings')}</h1>
     <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('loadingSettings')}</p>
    </div>
    <div className="flex flex-col items-center justify-center py-16">
     <div className="relative w-12 h-12 mb-4">
      <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin" />
     </div>
     <p className="text-sm text-gray-500 dark:text-slate-400">{t('loadingSettings')}</p>
    </div>
   </div>
  );
 }

 const tabs = [
  { key: 'general', icon: <Settings size={16} strokeWidth={1.75} />, label: t('general') || 'General' },
  { key: 'email', icon: <Mail size={16} strokeWidth={1.75} />, label: t('emailSecurity') || 'Email & Security' },
  { key: 'alerts', icon: <AlertTriangle size={16} strokeWidth={1.75} />, label: t('alertsRetry') || 'Alerts & Retry' },
  { key: 'dev', icon: <FlaskConical size={16} strokeWidth={1.75} />, label: 'Dev Tools' },
 ] as const;

 return (
  <div className="space-y-4 sm:space-y-6 lg:space-y-8 max-w-3xl">
   {/* Header */}
   <div>
    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('platformSettings')}</h1>
    <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">
     {t('platformSettingsDesc')}
    </p>
   </div>

   {/* Success feedback banner */}
   {showSuccess && (
    <div
     role="status"
     aria-live="polite"
     className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl p-4 flex items-center gap-2"
    >
     <span className="text-green-600 dark:text-green-400" aria-hidden="true"><CheckCircle2 size={18} strokeWidth={1.75} /></span>
     <span className="text-green-700 dark:text-green-400 text-sm font-medium">{t('settingsSaved')}</span>
    </div>
   )}

   {/* Tab Navigation */}
   <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl w-fit">
    {tabs.map((tab) => (
     <button
      key={tab.key}
      onClick={() => setTab(tab.key)}
      onMouseEnter={() => handleTabHover(tab.key)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
       settingsTab === tab.key
        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
        : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
      }`}
     >
      <span className="text-xs">{tab.icon}</span>
      {tab.label}
     </button>
    ))}
   </div>

   {/* Tab Content — lazy loaded, only visited tabs render */}
   {visitedTabs.has('general') && (
    <div style={{ display: settingsTab === 'general' ? 'block' : 'none' }}>
     <GeneralTab settings={settings} update={update} />
    </div>
   )}

   {visitedTabs.has('email') && (
    <div style={{ display: settingsTab === 'email' ? 'block' : 'none' }}>
     <EmailTab settings={settings} update={update} />
    </div>
   )}

   {visitedTabs.has('alerts') && (
    <div style={{ display: settingsTab === 'alerts' ? 'block' : 'none' }}>
     <AlertsTab
      settings={settings}
      update={update}
      alertRules={alertRules as AlertRule[]}
      alertThresholds={alertThresholds}
      alertChannels={alertChannels}
      updateAlertThreshold={updateAlertThreshold}
      toggleChannel={toggleChannel}
      handleAlertSave={handleAlertSave}
      isSaving={createAlertMutation.isPending || updateAlertMutation.isPending}
     />
    </div>
   )}

   {visitedTabs.has('dev') && (
    <div style={{ display: settingsTab === 'dev' ? 'block' : 'none' }}>
     <DevTab />
    </div>
   )}

   {/* Save button */}
   <div className="flex items-center gap-3 justify-end">
    {showSuccess && (
     <span className="text-sm text-green-600 dark:text-green-400 flex items-center gap-1">
      <span aria-hidden="true"><Check size={18} strokeWidth={1.75} /></span> {t('settingsSaved')}
     </span>
    )}
    <button type="button"
     onClick={handleSave}
     disabled={updateSettingsMutation.isPending}
     className="px-6 py-3 bg-red-600 dark:bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 dark:hover:bg-red-700 focus:ring-2 focus:ring-red-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition disabled:opacity-60"
    >
     {updateSettingsMutation.isPending ? tc('saving') : t('saveSettings')}
    </button>
   </div>
  </div>
 );
}
