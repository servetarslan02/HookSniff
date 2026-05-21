'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { useToast } from '@/components/Toast';
import { billingApiExtended } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useBillingSubscription } from '@/hooks/useDashboardData';
import { getErrorMessage } from '@/lib/errors';
import { AlertTriangle, CreditCard, DollarSign, Pause, Play } from '@/components/icons';

const PROVIDER_LABELS: Record<string, { name: string; icon: React.ReactNode }> = {
  stripe: { name: 'Stripe', icon: <CreditCard size={16} strokeWidth={1.75} /> },
  polar: { name: 'Polar.sh', icon: <DollarSign size={16} strokeWidth={1.75} /> },
  iyzico: { name: 'iyzico', icon: <CreditCard size={16} strokeWidth={1.75} /> },
};

function getCardIcon(brand?: string | null): React.ReactNode {
  switch (brand?.toLowerCase()) {
    case 'visa': return <CreditCard size={16} strokeWidth={1.75} />;
    case 'mastercard': return <CreditCard size={16} strokeWidth={1.75} />;
    case 'amex': return <CreditCard size={16} strokeWidth={1.75} />;
    case 'discover': return <CreditCard size={16} strokeWidth={1.75} />;
    default: return <CreditCard size={16} strokeWidth={1.75} />;
  }
}

const STATUS_STYLES: Record<string, React.ReactNode> = {
  active: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20',
  canceled: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20',
  past_due: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20',
  inactive: 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 ring-gray-600/20',
  paused: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 ring-blue-600/20',
};

export function SubscriptionDetails({ onCancel, onPause, onResume, onRefundRequest }: { onCancel?: () => void; onPause?: () => void; onResume?: () => void; onRefundRequest?: () => void }) {
  const { token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const { data: sub, isLoading, error } = useBillingSubscription();
  const [openingPortal, setOpeningPortal] = useState(false);

  const handleOpenPortal = async () => {
    if (!token) return;
    setOpeningPortal(true);
    try {
      const result = await billingApiExtended.openPortal(token);
      if (result.url) {
        // If the URL points back to our own pages, just navigate in the same tab
        const isOwnPage = result.url.includes('/dashboard/billing') || result.url.includes('/billing') || result.url.includes('/account');
        if (isOwnPage) {
          toast(t('noPaymentMethod') || 'No payment method on file. Add one when upgrading to a paid plan.', 'info');
        } else {
          // Use location.href to avoid popup blockers (must be in async context)
          window.location.href = result.url;
        }
      } else {
        toast(t('portalNotAvailable') || 'No external billing portal available for your account.', 'info');
      }
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')), 'error');
    } finally {
      setOpeningPortal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-64 bg-gray-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('subscriptionDetails')}
        </h2>
        <p className="text-sm text-red-600 dark:text-red-400">
          {tc('unknownError')}
        </p>
      </div>
    );
  }

  if (!sub) return null;

  const provider = PROVIDER_LABELS[sub.payment_provider] || { name: sub.payment_provider, icon: <DollarSign size={16} strokeWidth={1.75} /> };
  const statusStyle = STATUS_STYLES[sub.status] || STATUS_STYLES.inactive;
  const isFree = sub.plan === 'developer' || sub.plan === 'free';
  const priceDisplay = isFree ? '$0' : `$${(sub.monthly_price_cents / 100).toFixed(0)}`;
  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Plan */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('currentPlan')}</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{sub.plan}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {priceDisplay}{isFree ? '' : `/${t('month')}`}
          </p>
        </div>

        {/* Status */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('statusLabel')}</p>
          <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
            statusStyle
          )}>
            {t(`status.${sub.status}`)}
          </span>
          {sub.cancel_at_period_end && !sub.paused_at && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              <AlertTriangle size={16} strokeWidth={1.75} className="inline mr-1" /> {t('cancelAtPeriodEnd')}
            </p>
          )}
          {sub.paused_at && (
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
              <Pause size={14} strokeWidth={1.75} className="inline mr-1" />
              {t('subscriptionPaused')}
              {sub.paused_until && ` — ${t('resumeBefore')} ${new Date(sub.paused_until).toLocaleDateString()}`}
            </p>
          )}
          <div className="flex gap-3 mt-2">
            {!isFree && !sub.paused_at && !sub.cancel_at_period_end && (
              <button
                type="button"
                onClick={onPause}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Pause size={12} strokeWidth={1.75} /> {t('pauseSubscription')}
              </button>
            )}
            {!isFree && !sub.paused_at && !sub.cancel_at_period_end && (
              <button
                type="button"
                onClick={onCancel}
                className="text-xs text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                {t('cancelSubscription')}
              </button>
            )}
            {!isFree && !sub.paused_at && !sub.cancel_at_period_end && onRefundRequest && (
              <button
                type="button"
                onClick={onRefundRequest}
                className="text-xs text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                {t('requestRefund') || 'Request Refund'}
              </button>
            )}
            {sub.paused_at && (
              <button
                type="button"
                onClick={onResume}
                className="text-xs text-green-600 dark:text-green-400 hover:underline flex items-center gap-1"
              >
                <Play size={12} strokeWidth={1.75} /> {t('resumeSubscription')}
              </button>
            )}
          </div>
        </div>

        {/* Card on File */}
        <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('cardOnFile')}</p>
          {sub.card_last4 ? (
            <>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {getCardIcon(sub.card_brand)} {sub.card_brand?.toUpperCase() || '••••'} •••• {sub.card_last4}
              </p>
              {sub.card_exp_month && sub.card_exp_year && (
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                  {t('expires')} {String(sub.card_exp_month).padStart(2, '0')}/{sub.card_exp_year}
                </p>
              )}
            </>
          ) : sub.payment_provider === 'polar' ? (
            <>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {provider.icon} Polar.sh
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
                {t('polarManaged') || 'Payments managed by Polar.sh'}
              </p>
            </>
          ) : (
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {provider.icon} {provider.name}
            </p>
          )}
          {!isFree && sub.payment_provider !== 'polar' && (
            <button
              type="button"
              onClick={handleOpenPortal}
              disabled={openingPortal}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-2 disabled:opacity-50"
            >
              {openingPortal ? t('openingPortal') : t('changeCard')}
            </button>
          )}
          {!isFree && sub.payment_provider === 'polar' && (
            <button
              type="button"
              onClick={handleOpenPortal}
              disabled={openingPortal}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-2 disabled:opacity-50"
            >
              {openingPortal ? t('openingPortal') : t('manageInPolar') || 'Manage in Polar Portal'}
            </button>
          )}
        </div>

        {/* Next Billing Date */}
        {periodEnd && !isFree && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('nextBilling')}</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {periodEnd.toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
              {t('billingPeriod')}: {t(sub.billing_period === 'annual' ? 'periodAnnual' : 'periodMonthly')}
            </p>
          </div>
        )}

        {/* Subscription ID (debug) */}
        {(sub.stripe_subscription_id || sub.polar_subscription_id || sub.iyzico_subscription_id) && (
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900">
            <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('subscriptionId')}</p>
            <p className="text-xs font-mono text-gray-600 dark:text-slate-400 break-all">
              {sub.stripe_subscription_id || sub.polar_subscription_id || sub.iyzico_subscription_id}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
