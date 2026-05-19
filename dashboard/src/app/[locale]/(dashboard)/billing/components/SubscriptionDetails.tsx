'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';
import { useToast } from '@/components/Toast';
import { billingApiExtended } from '@/lib/api';
import { useAuth } from '@/lib/store';
import { useBillingSubscription } from '@/hooks/useDashboardData';
import { getErrorMessage } from '@/lib/errors';

const PROVIDER_LABELS: Record<string, { name: string; icon: string }> = {
  stripe: { name: 'Stripe', icon: '💳' },
  polar: { name: 'Polar.sh', icon: '🔷' },
  iyzico: { name: 'iyzico', icon: '🟡' },
};

function getCardIcon(brand?: string | null): string {
  switch (brand?.toLowerCase()) {
    case 'visa': return '💳';
    case 'mastercard': return '💳';
    case 'amex': return '💳';
    case 'discover': return '💳';
    default: return '💳';
  }
}

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20',
  canceled: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20',
  past_due: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20',
  inactive: 'bg-gray-50 dark:bg-gray-500/10 text-gray-700 dark:text-gray-400 ring-gray-600/20',
};

export function SubscriptionDetails({ onCancel }: { onCancel?: () => void }) {
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
        window.open(result.url, '_blank');
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

  const provider = PROVIDER_LABELS[sub.payment_provider] || { name: sub.payment_provider, icon: '💰' };
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
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{t('status')}</p>
          <span className={clsx(
            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset',
            statusStyle
          )}>
            {t(`status.${sub.status}`)}
          </span>
          {sub.cancel_at_period_end && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              ⚠️ {t('cancelAtPeriodEnd')}
            </p>
          )}
          {!isFree && !sub.cancel_at_period_end && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-red-600 dark:text-red-400 hover:underline mt-2 block"
            >
              {t('cancelSubscription')}
            </button>
          )}
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
          ) : (
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {provider.icon} {provider.name}
            </p>
          )}
          {!isFree && (
            <button
              type="button"
              onClick={handleOpenPortal}
              disabled={openingPortal}
              className="text-xs text-brand-600 dark:text-brand-400 hover:underline mt-2 disabled:opacity-50"
            >
              {openingPortal ? t('openingPortal') : t('changeCard')}
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
