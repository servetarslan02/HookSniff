'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { billingApiExtended } from '@/lib/api';
import { useBillingUsage, useBillingInvoices } from '@/hooks/useDashboardData';
import { usePlans } from '@/hooks/usePlans';
import { UsageChart, type UsageChartData } from './components/UsageChart';
import { PlanCards } from './components/PlanCards';
import { InvoiceTable } from './components/InvoiceTable';
import { SubscriptionDetails } from './components/SubscriptionDetails';
import { OverageSettings } from './components/OverageSettings';

export default function BillingPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const currentPlan = user?.plan || 'developer';

  // React Query hooks for data fetching
  const { data: usageData, isLoading: loadingUsage } = useBillingUsage();
  const { data: invoices, isLoading: loadingInvoices } = useBillingInvoices();
  const { getPlanLimits } = usePlans();
  const planLimits = getPlanLimits(currentPlan);

  // Derived values from usage data
  const usageCount = usageData
    ? usageData.webhooks?.used ?? usageData.deliveries_used ?? 0
    : 0;
  const usageLimit = usageData
    ? usageData.webhooks?.limit ?? usageData.deliveries_limit ?? 10000
    : 10000;

  // Endpoint usage
  const endpointUsed = usageData
    ? usageData.endpoints?.used ?? usageData.endpoints_count ?? 0
    : 0;
  const endpointLimit = usageData
    ? usageData.endpoints?.limit ?? usageData.endpoints_limit ?? 5
    : 5;

  // Build chart data from usage
  const chartData: UsageChartData[] = usageData
    ? (() => {
        const now = new Date();
        const monthLabel = now.toLocaleString(locale, { month: 'short' });
        return [{ month: monthLabel, count: usageCount }];
      })()
    : [];

  const usagePercent = usageLimit > 0 ? Math.round((usageCount / usageLimit) * 100) : 0;
  const endpointPercent = endpointLimit > 0 ? Math.round((endpointUsed / endpointLimit) * 100) : 0;

  // UI state (kept as useState)
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const upgradeModalRef = useRef<HTMLDivElement>(null);
  const cancelModalRef = useRef<HTMLDivElement>(null);

  // Escape key to close modals + focus trap
  useEffect(() => {
    if (!showUpgradeModal && !showCancelModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUpgradeModal(null);
        setShowCancelModal(false);
      }
    };
    document.addEventListener('keydown', handler);
    const modalRef = showUpgradeModal ? upgradeModalRef : cancelModalRef;
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [showUpgradeModal, showCancelModal]);

  const handleCancel = async () => {
    if (!token) return;
    setCancelling(true);
    try {
      await billingApiExtended.getSubscription(token).then(async () => {
        const { api } = await import('@/lib/api');
        await api.delete('/billing/subscription', token);
      });
      toast(t('cancelledMsg'), 'info');
      setShowCancelModal(false);
      router.refresh();
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')) || tc('cancelFailed'), 'error');
    } finally {
      setCancelling(false);
    }
  };

  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const handleUpgrade = (planKey: string, period: 'monthly' | 'annual' = 'monthly') => {
    setBillingPeriod(period);
    setShowUpgradeModal(planKey);
  };

  const confirmUpgrade = async () => {
    if (!showUpgradeModal || !token) return;
    setUpgrading(true);
    try {
      const result = await billingApiExtended.upgrade(token, showUpgradeModal, billingPeriod);

      // Enterprise requires contact
      if (result.requires_contact) {
        const contactUrl = result.contact_url || 'mailto:enterprise@hooksniff.dev?subject=Enterprise%20Plan%20Inquiry';
        window.open(contactUrl, '_blank');
        toast(t('enterpriseContact') || 'Enterprise plan requires a custom agreement. Opening contact...', 'info');
        setShowUpgradeModal(null);
        return;
      }

      if (result.checkout_url) {
        const url = new URL(result.checkout_url);
        const trustedHosts = ['polar.sh', 'checkout.polar.sh', 'pay.stripe.com', 'sandbox-api.iyzipay.com', 'api.iyzipay.com'];
        if (trustedHosts.some(h => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
          window.location.href = result.checkout_url;
        } else {
          toast(tc('invalidCheckoutUrl'), 'error');
        }
      } else {
        toast(result.message || t('upgradeInitiated'), 'success');
      }
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')) || tc('upgradeFailed'), 'error');
    } finally {
      setUpgrading(false);
      setShowUpgradeModal(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Subscription Details */}
      <SubscriptionDetails />

      {/* Usage Overview */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('usageOverview')}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Webhook Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">{t('webhooksThisMonth')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {usageCount.toLocaleString()} / {usageLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={clsx(
                  'h-3 rounded-full transition-all duration-500',
                  usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-brand-500'
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {usagePercent > 80 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                ⚠️ {t('approachingLimit')}
              </p>
            )}
          </div>

          {/* Endpoint Usage */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">{t('endpoints')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {endpointUsed} / {endpointLimit}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={clsx(
                  'h-3 rounded-full transition-all duration-500',
                  endpointPercent > 80 ? 'bg-red-500' : endpointPercent > 50 ? 'bg-yellow-500' : 'bg-brand-500'
                )}
                style={{ width: `${endpointPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Plan Limits Grid */}
        {planLimits && (
          <div className="mt-6 pt-6 border-t border-gray-200/50 dark:border-slate-700/50">
            <h3 className="text-sm font-medium text-gray-500 dark:text-slate-400 mb-4">{t('planLimits')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planLimits.endpoints}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('endpoints')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planLimits.webhooks.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('webhooksMonth')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planLimits.rateLimit.toLocaleString()}</p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('rateLimit')}</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800/50">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{planLimits.retention}<span className="text-base">d</span></p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('dataRetention')}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Monthly Chart */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('usage')}</h2>
        {loadingUsage ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chartData.length > 0 ? (
          <div className="overflow-x-auto">
            <UsageChart data={chartData} />
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-slate-400 py-6 text-center">
            {t('noUsageData')}
          </p>
        )}
      </div>

      {/* Overage Settings */}
      <OverageSettings />

      {/* Plans */}
      <PlanCards currentPlan={currentPlan} onUpgrade={handleUpgrade} />

      {/* Invoice History */}
      <InvoiceTable invoices={invoices ?? []} loading={loadingInvoices} />

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => { setShowUpgradeModal(null); setUpgrading(false); }} />
          <div ref={upgradeModalRef} tabIndex={-1} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 outline-hidden">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('upgradeTo', {
                action: 'upgrade',
                plan: showUpgradeModal
              })}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {t('upgradeDesc')}
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button"
                onClick={() => { setShowUpgradeModal(null); setUpgrading(false); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {tc('cancel')}
              </button>
              <button type="button"
                onClick={confirmUpgrade}
                disabled={upgrading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60"
              >
                {upgrading ? t('redirecting') : tc('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => { setShowCancelModal(false); setCancelling(false); }} />
          <div ref={cancelModalRef} tabIndex={-1} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 outline-hidden">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('cancelTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {t('cancelDesc')}
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button"
                onClick={() => { setShowCancelModal(false); setCancelling(false); }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                {t('keepPlan')}
              </button>
              <button type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60"
              >
                {cancelling ? t('redirecting') : t('cancelSubscription')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
