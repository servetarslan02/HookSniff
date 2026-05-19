'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { billingApiExtended } from '@/lib/api';
import { useBillingInvoices } from '@/hooks/useDashboardData';
import { PlanCards } from './components/PlanCards';
import { InvoiceTable } from './components/InvoiceTable';
import { SubscriptionDetails } from './components/SubscriptionDetails';
import { OverageSettings } from './components/OverageSettings';
import { CreditCard, BarChart3, Rocket, FileText } from 'lucide-react';

export default function BillingPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const router = useRouter();
  const currentPlan = user?.plan || 'developer';

  const { data: invoices, isLoading: loadingInvoices } = useBillingInvoices();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const upgradeModalRef = useRef<HTMLDivElement>(null);
  const cancelModalRef = useRef<HTMLDivElement>(null);

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
      const { api } = await import('@/lib/api');
      await api.delete('/billing/subscription', token);
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

  const planOrder = ['developer', 'startup', 'pro', 'enterprise'];

  const confirmUpgrade = async () => {
    if (!showUpgradeModal || !token) return;

    // Downgrade → open customer portal (backend only supports upgrades)
    const isDowngrade = planOrder.indexOf(showUpgradeModal) < planOrder.indexOf(currentPlan);
    if (isDowngrade) {
      try {
        const result = await billingApiExtended.openPortal(token);
        if (result.url) {
          window.open(result.url, '_blank');
          toast(t('downgradePortal') || 'Opening billing portal to manage your plan…', 'info');
        }
      } catch (err: unknown) {
        toast(getErrorMessage(err, tc('unknownError')) || tc('upgradeFailed'), 'error');
      }
      setShowUpgradeModal(null);
      return;
    }

    setUpgrading(true);
    try {
      const result = await billingApiExtended.upgrade(token, showUpgradeModal, billingPeriod);

      if (result.requires_contact) {
        const contactUrl = result.contact_url || '/contact';
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
    <div className="max-w-5xl space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* 1. Subscription */}
      <section>
        <SectionLabel label={t('subscriptionDetails')} icon={<CreditCard size={16} strokeWidth={1.75} />} />
        <SubscriptionDetails onCancel={() => setShowCancelModal(true)} />
      </section>

      {/* 2. Overage */}
      <section>
        <SectionLabel label={t('overageSettings')} icon={<BarChart3 size={16} strokeWidth={1.75} />} />
        <OverageSettings />
      </section>

      {/* 3. Plans */}
      <section>
        <SectionLabel label={t('currentPlan')} icon={<Rocket size={16} strokeWidth={1.75} />} />
        <PlanCards currentPlan={currentPlan} onUpgrade={handleUpgrade} />
      </section>

      {/* 4. Invoices */}
      <section>
        <SectionLabel label={t('invoiceHistory')} icon={<FileText size={16} strokeWidth={1.75} />} />
        <InvoiceTable invoices={invoices ?? []} loading={loadingInvoices} />
      </section>

      {/* Upgrade/Downgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => { setShowUpgradeModal(null); setUpgrading(false); }} />
          <div ref={upgradeModalRef} tabIndex={-1} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 outline-hidden">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {planOrder.indexOf(showUpgradeModal) < planOrder.indexOf(currentPlan)
                ? t('downgradeTo', { plan: t(`plans.${showUpgradeModal}`) }) || `${t('downgrade')} → ${t(`plans.${showUpgradeModal}`)}`
                : t('upgradeTo', { action: t('upgrade'), plan: t(`plans.${showUpgradeModal}`) })
              }
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {planOrder.indexOf(showUpgradeModal) < planOrder.indexOf(currentPlan)
                ? t('downgradeDesc')
                : t('upgradeDesc')
              }
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowUpgradeModal(null); setUpgrading(false); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {tc('cancel')}
              </button>
              <button type="button" onClick={confirmUpgrade} disabled={upgrading} className={`px-4 py-2.5 text-sm font-medium text-white rounded-xl transition disabled:opacity-60 ${
                showUpgradeModal && planOrder.indexOf(showUpgradeModal) < planOrder.indexOf(currentPlan)
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}>
                {upgrading
                  ? t('redirecting')
                  : showUpgradeModal && planOrder.indexOf(showUpgradeModal) < planOrder.indexOf(currentPlan)
                    ? t('downgrade')
                    : tc('confirm')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => { setShowCancelModal(false); setCancelling(false); }} />
          <div ref={cancelModalRef} tabIndex={-1} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 outline-hidden">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('cancelTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{t('cancelDesc')}</p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowCancelModal(false); setCancelling(false); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {t('keepPlan')}
              </button>
              <button type="button" onClick={handleCancel} disabled={cancelling} className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60">
                {cancelling ? t('redirecting') : t('cancelSubscription')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-gray-400">{icon}</span>
      <h2 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">{label}</h2>
      <div className="flex-1 h-px bg-gray-200 dark:bg-slate-700 ml-2" />
    </div>
  );
}
