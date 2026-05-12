'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { billingApi, billingApiExtended, type Invoice } from '@/lib/api';

const planDefaults = [
  {
    key: 'free',
    nameKey: 'plans.free',
    priceUsd: 0,
    priceTry: 0,
    period: '/month',
    limitKey: 'plans.freeLimit',
    features: ['100 requests/min', '3 retry attempts', 'Community support', '5 endpoints', '7-day retention'],
    popular: false,
  },
  {
    key: 'pro',
    nameKey: 'plans.pro',
    priceUsd: 49,
    priceTry: 999,
    period: '/month',
    limitKey: 'plans.proLimit',
    features: ['1,000 requests/min', '5 retry attempts', 'Priority support', '50 endpoints', '30-day retention'],
    popular: true,
  },
  {
    key: 'business',
    nameKey: 'plans.business',
    priceUsd: 99,
    priceTry: 1999,
    period: '/month',
    limitKey: 'plans.businessLimit',
    features: ['10,000 requests/min', '10 retry attempts', 'Dedicated support', 'SLA guarantee', '500 endpoints', '90-day retention'],
    popular: false,
  },
];



interface UsageChartData {
  month: string;
  count: number;
}

function UsageChart({ data }: { data: UsageChartData[] }) {
  if (data.length === 0) return null;

  const max = Math.max(...data.map((d) => d.count), 1); // min 1 to avoid div/0
  const barWidth = data.length === 1 ? 80 : 40;
  const gap = data.length === 1 ? 0 : 20;
  const w = data.length * (barWidth + gap);
  const h = 160;

  return (
    <svg width={w} height={h + 30} className="overflow-visible">
      {data.map((d, i) => {
        const barH = Math.max((d.count / max) * h, 2); // min 2px so bar is visible
        const x = i * (barWidth + gap);
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={h - barH}
              width={barWidth}
              height={barH}
              rx={6}
              fill="#4c6ef5"
              opacity={0.8}
            />
            <text x={x + barWidth / 2} y={h + 20} textAnchor="middle" className="text-xs fill-gray-500 dark:fill-slate-400">
              {d.month}
            </text>
            <text x={x + barWidth / 2} y={h - barH - 6} textAnchor="middle" className="text-[10px] font-medium fill-gray-600 dark:fill-slate-300">
              {d.count.toLocaleString()}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20',
    pending: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20',
    failed: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function BillingPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const locale = useLocale();
  const router = useRouter();
  const isTr = locale === 'tr';
  const plans = planDefaults.map(p => ({
    ...p,
    price: p.key === 'free' ? 0 : isTr ? p.priceTry : p.priceUsd,
  }));
  const currentPlan = user?.plan || 'free';
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(10000);
  const [chartData, setChartData] = useState<UsageChartData[]>([]);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  // Fetch real usage data
  useEffect(() => {
    if (!token) return;
    billingApiExtended
      .getUsage(token)
      .then((data) => {
        const used = data.deliveries_used ?? 0;
        const limit = data.deliveries_limit ?? 10000;
        setUsageCount(used);
        setUsageLimit(limit);

        const now = new Date();
        const monthLabel = now.toLocaleString(locale, { month: 'short' });
        setChartData([{ month: monthLabel, count: used }]);
      })
      .catch(() => {
        // fallback to defaults
      })
      .finally(() => setLoadingUsage(false));
  }, [token]);

  // Fetch real invoice data
  useEffect(() => {
    if (!token) return;
    setLoadingInvoices(true);
    billingApi
      .getInvoices(token)
      .then((data) => setInvoices(data))
      .catch(() => {
        // fallback to empty list
      })
      .finally(() => setLoadingInvoices(false));
  }, [token]);

  const usagePercent = usageLimit > 0 ? Math.round((usageCount / usageLimit) * 100) : 0;

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
    // Focus the modal
    const modalRef = showUpgradeModal ? upgradeModalRef : cancelModalRef;
    modalRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [showUpgradeModal, showCancelModal]);

  const handleCancel = async () => {
    if (!token) return;
    setCancelling(true);
    try {
      await billingApiExtended.getSubscription(token).then(async () => {
        // Cancel via API - using generic api client for DELETE
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

  const handleUpgrade = (planKey: string) => {
    setShowUpgradeModal(planKey);
  };

  const confirmUpgrade = async () => {
    if (!showUpgradeModal || !token) return;
    setUpgrading(true);
    try {
      const result = await billingApiExtended.upgrade(token, showUpgradeModal);
      if (result.checkout_url) {
        // Validate checkout URL is from a trusted payment provider
        const url = new URL(result.checkout_url);
        const trustedHosts = ['polar.sh', 'checkout.polar.sh', 'pay.stripe.com', 'sandbox-api.iyzipay.com', 'api.iyzipay.com'];
        if (trustedHosts.some(h => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
          window.location.href = result.checkout_url;
        } else {
          toast('Invalid checkout URL', 'error');
        }
      } else {
        toast(t('upgradeInitiated'), 'success');
      }
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')) || tc('upgradeFailed'), 'error');
    } finally {
      setUpgrading(false);
      setShowUpgradeModal(null);
    }
  };

  // Calculate next billing date dynamically (1st of next month)
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextBillingDate = nextMonth.toISOString().split('T')[0];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          {t('subtitle')}
        </p>
      </div>

      {/* Current Plan Summary */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('currentPlan')}</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-inset ring-brand-600/20">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                {t('nextBilling')}: {new Date(nextBillingDate).toLocaleDateString(locale)}
              </span>
            </div>
          </div>
          {currentPlan !== 'free' && (
            <button type="button"
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition"
            >
              {t('cancelSubscription')}
            </button>
          )}
        </div>

        {/* Usage */}
        <div className="flex items-center gap-6">
          <div className="flex-1">
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
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{usagePercent}%</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{t('used')}</div>
          </div>
        </div>
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

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('currentPlan')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.key === currentPlan;
            const isDowngrade = plans.findIndex((p) => p.key === currentPlan) > plans.indexOf(plan);
            return (
              <div
                key={plan.nameKey}
                className={clsx(
                  'glass-card p-6 hover-lift relative',
                  plan.popular && 'ring-2 ring-brand-500'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 dark:bg-brand-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                    {t('mostPopular')}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t(plan.nameKey)}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{isTr ? `₺${plan.price.toLocaleString('tr-TR')}` : `$${plan.price}`}</span>
                  <span className="text-gray-500 dark:text-slate-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t(plan.limitKey)}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                    {t('currentPlanLabel')}
                  </div>
                ) : (
                  <button type="button"
                    onClick={() => handleUpgrade(plan.key)}
                    className={clsx(
                      'w-full py-2.5 rounded-xl text-sm font-medium transition',
                      plan.popular
                        ? 'bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {t('upgradeTo', { action: isDowngrade ? t('downgrade') : t('upgrade'), plan: t(plan.nameKey) })}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('invoiceHistory')}</h2>
          <span className="text-sm text-gray-500 dark:text-slate-400">{invoices.length} {t('invoices')}</span>
        </div>
        {loadingInvoices ? (
          <div className="px-6 py-12 text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">{tc('loading')}</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-slate-400">{t('noInvoices')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('invoice')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('plan')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('amount')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('status')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                      {inv.id.slice(0, 8)}…
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                      {new Date(inv.date).toLocaleDateString(locale)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{inv.plan}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <InvoiceStatusBadge status={inv.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => { setShowUpgradeModal(null); setUpgrading(false); }} />
          <div ref={upgradeModalRef} tabIndex={-1} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 outline-none">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {t('upgradeTo', {
                action: plans.findIndex((p) => p.key === currentPlan) > plans.findIndex((p) => p.key === showUpgradeModal)
                  ? t('downgrade')
                  : t('upgrade'),
                plan: t(plans.find((p) => p.key === showUpgradeModal)?.nameKey || 'plans.free')
              })}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {plans.findIndex((p) => p.key === currentPlan) > plans.findIndex((p) => p.key === showUpgradeModal)
                ? t('downgradeDesc')
                : t('upgradeDesc')}
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
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={() => { setShowCancelModal(false); setCancelling(false); }} />
          <div ref={cancelModalRef} tabIndex={-1} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 outline-none">
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
