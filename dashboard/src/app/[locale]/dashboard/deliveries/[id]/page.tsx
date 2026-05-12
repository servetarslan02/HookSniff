'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';
import { webhooksApi, type DeliveryDetail, type DeliveryAttempt } from '@/lib/api';
import ConfirmDialog from '@/components/ConfirmDialog';
import { DeliveryOverviewCards } from './components/DeliveryOverviewCards';
import { DeliveryInfoPanel } from './components/DeliveryInfoPanel';
import { RequestDetailsPanel } from './components/RequestDetailsPanel';
import { AttemptTimeline } from './components/AttemptTimeline';

export default function DeliveryDetailPage() {
  const t = useTranslations('deliveryDetail');
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [delivery, setDelivery] = useState<DeliveryDetail | null>(null);
  const [attempts, setAttempts] = useState<DeliveryAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [replaying, setReplaying] = useState(false);
  const [showReplayConfirm, setShowReplayConfirm] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!token || !id) return;
    setLoading(true);
    setError('');
    try {
      const [detail, attemptList] = await Promise.all([
        webhooksApi.get(token, id),
        webhooksApi.getAttempts(token, id).catch(() => [] as DeliveryAttempt[]),
      ]);
      setDelivery(detail);
      setAttempts(attemptList);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('loadFailed');
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, id, t]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReplay = async () => {
    if (!token || !id) return;
    setReplaying(true);
    try {
      await webhooksApi.replay(token, id);
      toast(t('toastReplaySuccess'), 'success');
      fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('toastReplayFailed');
      toast(message, 'error');
    } finally {
      setReplaying(false);
      setShowReplayConfirm(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast(t('toastCopyFailed'), 'error');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="glass-card p-6 animate-pulse">
              <div className="h-5 bg-gray-200 dark:bg-slate-700 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-12 text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('loadFailed')}</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">{error}</p>
        <div className="flex items-center justify-center gap-3">
          <button type="button"
            onClick={fetchData}
            className="bg-brand-600 dark:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition"
          >
            {t('tryAgain')}
          </button>
          <button type="button"
            onClick={() => router.push('/dashboard/deliveries')}
            className="bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition"
          >
            {t('backToDeliveries')}
          </button>
        </div>
      </div>
    );
  }

  if (!delivery) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={() => router.push('/dashboard/deliveries')}
            className="p-2 -ml-2 text-gray-500 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition"
            title={t('backToDeliveries')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-mono">{delivery.id}</p>
          </div>
        </div>
        <button type="button"
          onClick={() => setShowReplayConfirm(true)}
          className="bg-brand-600 dark:bg-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-700 dark:hover:bg-brand-600 transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {t('replayWebhook')}
        </button>
      </div>

      {/* Overview Cards */}
      <DeliveryOverviewCards delivery={delivery} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeliveryInfoPanel delivery={delivery} copiedField={copiedField} onCopy={copyToClipboard} />
        <RequestDetailsPanel delivery={delivery} copiedField={copiedField} onCopy={copyToClipboard} />
      </div>

      {/* Attempt Timeline */}
      <AttemptTimeline attempts={attempts} copiedField={copiedField} onCopy={copyToClipboard} />

      {/* Replay Confirmation */}
      <ConfirmDialog
        open={showReplayConfirm}
        title={t('replayTitle')}
        message={t('replayMessage')}
        confirmLabel={t('replayConfirm')}
        onConfirm={handleReplay}
        onCancel={() => setShowReplayConfirm(false)}
        loading={replaying}
      />
    </div>
  );
}
