'use client';

import { getErrorMessage } from '@/lib/errors';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { billingApiExtended } from '@/lib/api';
import { useBillingInvoices, useBillingSubscription } from '@/hooks/useDashboardData';
import { PlanCards } from './components/PlanCards';
import { InvoiceTable } from './components/InvoiceTable';
import { SubscriptionDetails } from './components/SubscriptionDetails';
import { OverageSettings } from './components/OverageSettings';
import { RefundRequestModal } from './components/RefundRequestModal';
import { CreditCard, BarChart3, Rocket, FileText } from '@/components/icons';

export default function BillingPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('billing');
  const tc = useTranslations('common');
  const router = useRouter();
  const currentPlan = user?.plan || 'developer';

  const { data: invoices, isLoading: loadingInvoices } = useBillingInvoices();
  const { data: subscription } = useBillingSubscription();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);
  const [showRefundRequestModal, setShowRefundRequestModal] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [_resuming, setResuming] = useState(false);
  const [pauseDays, setPauseDays] = useState(30);
  const [discountCode, setDiscountCode] = useState('');
  const upgradeModalRef = useRef<HTMLDivElement>(null);
  const cancelModalRef = useRef<HTMLDivElement>(null);
  const pauseModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showUpgradeModal && !showCancelModal && !showPauseModal) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUpgradeModal(null);
        setShowCancelModal(false);
        setShowPauseModal(false);
      }
    };
    document.addEventListener('keydown', handler);
    const modalRef = showUpgradeModal ? upgradeModalRef : showPauseModal ? pauseModalRef : cancelModalRef;
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

  const handlePause = async () => {
    if (!token) return;
    setPausing(true);
    try {
      const { billingApiExtended } = await import('@/lib/api');
      const result = await billingApiExtended.pause(token, pauseDays);
      toast(result.message || t('pauseSuccess'), 'success');
      setShowPauseModal(false);
      router.refresh();
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')) || t('pauseFailed'), 'error');
    } finally {
      setPausing(false);
    }
  };

  const handleResume = async () => {
    if (!token) return;
    setResuming(true);
    try {
      const { billingApiExtended } = await import('@/lib/api');
      const result = await billingApiExtended.resume(token);
      if (result.checkout_url) {
        const url = new URL(result.checkout_url);
        const trustedHosts = ['polar.sh', 'checkout.polar.sh', 'sandbox-api.polar.sh', 'sandbox.polar.sh', 'sandbox.checkout.polar.sh', 'checkout.stripe.com', 'pay.stripe.com', 'secure.iyzipay.com', 'sandbox-api.iyzipay.com', 'api.iyzipay.com'];
        if (trustedHosts.some(h => url.hostname === h || url.hostname.endsWith(`.${h}`))) {
          window.location.href = result.checkout_url;
        } else {
          toast(tc('invalidCheckoutUrl'), 'error');
        }
      } else {
        toast(result.message || t('resumeSuccess'), 'success');
        router.refresh();
      }
    } catch (err: unknown) {
      toast(getErrorMessage(err, tc('unknownError')) || t('resumeFailed'), 'error');
    } finally {
      setResuming(false);
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
      const result = await billingApiExtended.upgrade(token, showUpgradeModal, billingPeriod, discountCode || undefined);

      if (result.checkout_url) {
        const url = new URL(result.checkout_url);
        const trustedHosts = ['polar.sh', 'checkout.polar.sh', 'sandbox-api.polar.sh', 'sandbox.polar.sh', 'sandbox.checkout.polar.sh', 'checkout.stripe.com', 'pay.stripe.com', 'secure.iyzipay.com', 'sandbox-api.iyzipay.com', 'api.iyzipay.com'];
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
      </div>

      {/* 1. Subscription */}
      <section>
        <SectionLabel label={t('subscriptionDetails')} icon={<CreditCard size={16} strokeWidth={1.75} />} />
        <SubscriptionDetails
          onCancel={() => setShowCancelModal(true)}
          onPause={() => setShowPauseModal(true)}
          onResume={handleResume}
          onRefundRequest={() => setShowRefundRequestModal(true)}
        />
      </section>

      {/* 2. Overage */}
      <section>
        <SectionLabel label={t('overageSettings')} icon={<BarChart3 size={16} strokeWidth={1.75} />} />
        <OverageSettings />
      </section>

      {/* 3. Plans */}
      <section>
        <SectionLabel label={t('currentPlan')} icon={<Rocket size={16} strokeWidth={1.75} />} />
        <PlanCards currentPlan={currentPlan} onUpgrade={handleUpgrade} discountCode={discountCode} onDiscountCodeChange={setDiscountCode} hasUsedStartupTrial={subscription?.has_used_startup_trial ?? false} />
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
              {t('upgradeTo', { action: t('upgrade'), plan: t(`plans.${showUpgradeModal}`) })}
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">
              {t('upgradeDesc')}
            </p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowUpgradeModal(null); setUpgrading(false); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {tc('cancel')}
              </button>
              <button type="button" onClick={confirmUpgrade} disabled={upgrading} className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition disabled:opacity-60">
                {upgrading ? t('redirecting') : tc('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" aria-hidden="true" onClick={() => { setShowPauseModal(false); setPausing(false); }} />
          <div ref={pauseModalRef} tabIndex={-1} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6 outline-hidden">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('pauseTitle')}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{t('pauseDesc')}</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('pauseDuration')}</label>
              <select
                value={pauseDays}
                onChange={(e) => setPauseDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm"
              >
                <option value={7}>7 {t('days')}</option>
                <option value={14}>14 {t('days')}</option>
                <option value={30}>30 {t('days')}</option>
                <option value={60}>60 {t('days')}</option>
                <option value={90}>90 {t('days')}</option>
              </select>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">{t('pauseNote')}</p>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => { setShowPauseModal(false); setPausing(false); }} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition">
                {tc('cancel')}
              </button>
              <button type="button" onClick={handlePause} disabled={pausing} className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60">
                {pausing ? t('pausing') : t('confirmPause')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Modal */}
      <RefundRequestModal
        isOpen={showRefundRequestModal}
        onClose={() => setShowRefundRequestModal(false)}
      />

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
