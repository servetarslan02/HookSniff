'use client';

import { clsx } from 'clsx';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { usePlans } from '@/hooks/usePlans';

const PLAN_FEATURES: Record<string, string[]> = {
  developer: [
    '100 events/day',
    '1 application',
    '5 endpoints',
    '10 event types',
    '10 subscriptions',
    '7-day log retention',
    'HMAC signatures',
    '2FA support',
    'Community support',
  ],
  startup: [
    '30kEventsDay', '1application', '50endpoints', '50eventTypes', '300subscriptions', '14dayLog', 'neverBlocked', '003overage', 'cloudevents', 'secretRotation', 'deadLetter', 'emailSupport',
  ],
  pro: [
    '100kEventsDay', 'unlimitedApps', '500endpoints', 'unlimitedEventTypes', 'unlimitedSubs', '30dayLog', '0001overage', 'fifo', 'ipWhitelist', 'analytics', 'schemaRegistry', 'prioritySupport',
  ],
  enterprise: [
    'unlimitedEvents', 'unlimitedApps', 'unlimitedEndpoints', 'unlimitedEventTypes', 'unlimitedSubs', 'customLog', 'customPricing', 'ssoSaml', 'accountManager', 'sla99', 'customIntegrations', 'onPremise',
  ],
};

export function PlanCards({
  currentPlan,
  onUpgrade,
}: {
  currentPlan: string;
  onUpgrade: (planKey: string, billingPeriod: 'monthly' | 'annual') => void;
}) {
  const t = useTranslations('billing');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const isAnnual = billingPeriod === 'annual';
  const { getPlan } = usePlans();

  const planOrder = ['developer', 'startup', 'pro', 'enterprise'];

  const plans = planOrder.map((key) => {
    const apiPlan = getPlan(key);
    const priceMonthly = apiPlan?.price_monthly ?? (key === 'developer' ? 0 : key === 'startup' ? 29 : key === 'pro' ? 49 : 0);
    const priceYearly = apiPlan?.price_yearly ?? (key === 'developer' ? 0 : key === 'startup' ? 278 : key === 'pro' ? 470 : 0);
    const limits = apiPlan ? {
      endpoints: apiPlan.max_endpoints,
      webhooks: apiPlan.max_webhooks,
      rateLimit: apiPlan.rate_limit,
      retention: apiPlan.retention_days,
    } : null;

    return {
      key,
      nameKey: `plans.${key}`,
      price: key === 'developer' ? 0 : isAnnual ? Math.round(priceYearly / 12) : priceMonthly,
      monthlyPrice: priceMonthly,
      yearlyTotal: priceYearly,
      limits,
      features: PLAN_FEATURES[key] || [],
      popular: key === 'pro',
      isEnterprise: key === 'enterprise',
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('currentPlan')}</h2>
        {/* Billing period toggle */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setBillingPeriod('monthly')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition',
              !isAnnual
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            )}
          >
            {t('monthly')}
          </button>
          <button
            type="button"
            onClick={() => setBillingPeriod('annual')}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium transition relative',
              isAnnual
                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-xs'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
            )}
          >
            {t('annual')}
            <span className="ml-1.5 inline-block px-1.5 py-0.5 text-[10px] font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.key === currentPlan;
          const isDowngrade = planOrder.indexOf(plan.key) < planOrder.indexOf(currentPlan);
          return (
            <div
              key={plan.key}
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
                {plan.isEnterprise ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                    <span className="text-gray-500 dark:text-slate-400 text-sm">/month</span>
                  </>
                ) : plan.key === 'developer' ? (
                  <>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">$0</span>
                    <span className="text-gray-500 dark:text-slate-400 text-sm">/month</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      ${plan.price}
                    </span>
                    <span className="text-gray-500 dark:text-slate-400 text-sm">
                      {isAnnual ? '/month, billed annually' : '/month'}
                    </span>
                    {isAnnual && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-400 dark:text-slate-500 line-through">
                          ${plan.monthlyPrice}
                        </span>
                        <span className="ml-1.5 text-xs font-medium text-green-600 dark:text-green-400">
                          {t('savePercent')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              {/* Dynamic limits */}
              {plan.limits && (
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
                  {plan.limits.endpoints} endpoints · {plan.limits.webhooks.toLocaleString()} webhooks/mo · {plan.limits.retention}d retention
                </p>
              )}
              {!plan.limits && (
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t(plan.key === 'enterprise' ? 'plans.enterpriseLimit' : `plans.${plan.key}Limit`)}</p>
              )}
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <span className="text-green-500">✓</span> {t(`features.${f}`)}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                  {t('currentPlanLabel')}
                </div>
              ) : plan.isEnterprise ? (
                <button type="button"
                  onClick={() => window.open('/contact', '_blank')}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                >
                  {t('contactSales')}
                </button>
              ) : (
                <button type="button"
                  onClick={() => onUpgrade(plan.key, billingPeriod)}
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
  );
}
