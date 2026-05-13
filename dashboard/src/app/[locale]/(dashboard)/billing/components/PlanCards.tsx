'use client';

import { clsx } from 'clsx';
import { useTranslations, useLocale } from 'next-intl';

const planDefaults = [
  {
    key: 'developer',
    nameKey: 'plans.developer',
    priceUsd: 0,
    priceTry: 0,
    period: '/month',
    limitKey: 'plans.developerLimit',
    features: [
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
    popular: false,
  },
  {
    key: 'startup',
    nameKey: 'plans.startup',
    priceUsd: 29,
    priceTry: 599,
    period: '/month',
    limitKey: 'plans.startupLimit',
    features: [
      '30,000 events/day',
      '1 application',
      '50 endpoints',
      '50 event types',
      '300 subscriptions',
      '14-day log retention',
      'Never-blocked mode',
      '$0.003/event overage',
      'CloudEvents v1.0',
      'Secret rotation',
      'Dead letter queue',
      'Email support',
    ],
    popular: false,
  },
  {
    key: 'pro',
    nameKey: 'plans.pro',
    priceUsd: 49,
    priceTry: 999,
    period: '/month',
    limitKey: 'plans.proLimit',
    features: [
      '100,000 events/day',
      'Unlimited applications',
      '500 endpoints',
      'Unlimited event types',
      'Unlimited subscriptions',
      '30-day log retention',
      '$0.0001/event overage',
      'FIFO ordered delivery',
      'IP whitelisting',
      'Analytics & graphs',
      'Schema registry',
      'Priority support',
    ],
    popular: true,
  },
  {
    key: 'enterprise',
    nameKey: 'plans.enterprise',
    priceUsd: 0,
    priceTry: 0,
    period: '',
    limitKey: 'plans.enterpriseLimit',
    features: [
      'Unlimited events/day',
      'Unlimited applications',
      'Unlimited endpoints',
      'Unlimited event types',
      'Unlimited subscriptions',
      'Custom log retention',
      'Custom pricing',
      'SSO / SAML',
      'Dedicated account manager',
      '99.9% SLA guarantee',
      'Custom integrations',
      'On-premise option',
    ],
    popular: false,
  },
];

export function PlanCards({
  currentPlan,
  onUpgrade,
}: {
  currentPlan: string;
  onUpgrade: (planKey: string) => void;
}) {
  const t = useTranslations('billing');
  const locale = useLocale();
  const isTr = locale === 'tr';
  const plans = planDefaults.map(p => ({
    ...p,
    price: p.key === 'developer' ? 0 : isTr ? p.priceTry : p.priceUsd,
    isEnterprise: p.key === 'enterprise',
  }));

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('currentPlan')}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                {plan.isEnterprise ? (
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">{t('customPricing', { defaultValue: 'Custom' })}</span>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{isTr ? `₺${plan.price.toLocaleString('tr-TR')}` : `$${plan.price}`}</span>
                    <span className="text-gray-500 dark:text-slate-400 text-sm">{plan.period}</span>
                  </>
                )}
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
              ) : plan.isEnterprise ? (
                <button type="button"
                  onClick={() => window.open('mailto:enterprise@hooksniff.dev?subject=Enterprise%20Plan%20Inquiry', '_blank')}
                  className="w-full py-2.5 rounded-xl text-sm font-medium bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition"
                >
                  {t('contactSales', { defaultValue: 'Contact Sales' })}
                </button>
              ) : (
                <button type="button"
                  onClick={() => onUpgrade(plan.key)}
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
