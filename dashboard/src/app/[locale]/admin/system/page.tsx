'use client';

import { LazySection, Skeletons } from '@/components/LazySection';
import dynamic from 'next/dynamic';
import { useTranslations, useLocale } from 'next-intl';
import { AlertTriangle } from '@/components/icons';
import { useToast } from '@/components/Toast';
import {
  useSystemHealth,
  useAdminAlerts,
  useQueueStatus,
  useFailedDeliveries,
  useDeadLetters,
  useRateLimitViolations,
  useApiLatency,
  useBatchReplay,
} from '@/hooks/useAdminData';
import { useState } from 'react';

// Lazy-loaded section components
const HealthStatus = dynamic(() => import('../components/system/HealthStatus'), { ssr: false });
const QueueStatusSection = dynamic(() => import('../components/system/QueueStatus'), { ssr: false });
const Infrastructure = dynamic(() => import('../components/system/Infrastructure'), { ssr: false });
const FailedTable = dynamic(() => import('../components/system/FailedTable'), { ssr: false });
const DeadLetters = dynamic(() => import('../components/system/DeadLetters'), { ssr: false });
const RateLimits = dynamic(() => import('../components/system/RateLimits'), { ssr: false });
const LatencyTable = dynamic(() => import('../components/system/LatencyTable'), { ssr: false });
const TestWebhook = dynamic(() => import('../components/system/TestWebhook'), { ssr: false });

const mockHealth = {
  status: 'unknown',
  database: { status: 'unknown', latency_ms: 0 },
  redis: { status: 'unknown', latency_ms: 0 },
  api: { status: 'unknown', uptime_seconds: 0 },
  queue: { pending: 0, processing: 0, failed: 0 },
  checks: {
    database: { status: 'unknown', latency_ms: 0 },
    redis: { status: 'unknown', latency_ms: 0 },
    queue: { status: 'unknown', latency_ms: 0, pending_count: 0 },
  },
} as const;

export default function AdminSystemPage() {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();
  const { toast } = useToast();

  // React Query hooks
  const { data: health, isLoading, error: healthError, refetch: refetchHealth } = useSystemHealth();
  const { data: alerts = [] } = useAdminAlerts();
  const { data: queueStatus } = useQueueStatus();
  const { data: failedData } = useFailedDeliveries({ limit: 20, since: '24h' });
  const { data: deadLettersData } = useDeadLetters({ limit: 20, since: '24h' });
  const { data: rlvData } = useRateLimitViolations({ limit: 20, since: '24h' });
  const { data: latencyData } = useApiLatency({ period: '24h' });
  const batchReplayMutation = useBatchReplay();

  const failedDeliveries = failedData?.deliveries ?? [];
  const deadLetters = deadLettersData?.dead_letters ?? [];
  const rateLimitViolations = rlvData?.violations ?? [];
  const apiLatency = latencyData?.endpoints ?? [];

  // Local UI state
  const [selectedFailed, setSelectedFailed] = useState<Set<string>>(new Set());

  const handleBatchReplay = async () => {
    if (selectedFailed.size === 0) return;
    try {
      await batchReplayMutation.mutateAsync(Array.from(selectedFailed));
      toast(t('batchReplaySuccess') || 'Replayed successfully', 'success');
      setSelectedFailed(new Set());
    } catch (err) {
      toast(err instanceof Error ? err.message : (t('batchReplayFailed') || 'Replay failed'), 'error');
    }
  };

  const toggleFailedSelect = (id: string) => {
    setSelectedFailed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedFailed.size === failedDeliveries.length) {
      setSelectedFailed(new Set());
    } else {
      setSelectedFailed(new Set(failedDeliveries.map((d) => d.id)));
    }
  };

  const displayHealth = health || mockHealth;
  const isHealthError = !!healthError;

  const infrastructureItems = [
    { label: t('apiServer'), value: 'Google Cloud Run', detail: 'Serverless, auto-scaling' },
    { label: t('database'), value: 'Neon PostgreSQL', detail: 'Serverless, Free tier' },
    { label: t('cache'), value: 'Upstash Redis', detail: 'Serverless, Free tier' },
    { label: t('cdn'), value: 'Cloudflare Workers', detail: 'Edge proxy, DNS, SSL' },
    { label: t('dashboard'), value: 'Vercel', detail: 'Next.js 15, Hobby plan' },
    { label: t('monitoring'), value: 'Grafana Cloud', detail: 'OpenTelemetry, Free tier' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('fetchingHealth')}</p>
        </div>
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative w-12 h-12 mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-500 animate-spin" />
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('fetchingHealth')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('systemHealth')}</h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400 mt-1">{t('systemHealthDesc')}</p>
      </div>

      {/* Error banner */}
      {healthError && (
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} strokeWidth={1.75} className="text-amber-500" />
              <span className="text-red-700 dark:text-red-400 text-sm font-medium">{t('healthCheckFailed') || 'Health check failed'}</span>
            </div>
            <button type="button" onClick={() => refetchHealth()} className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 underline">
              {tc('retry')}
            </button>
          </div>
        </div>
      )}

      {/* Above the fold: Health Status + Service Cards */}
      <LazySection eager>
        <HealthStatus
          health={displayHealth}
          isHealthError={isHealthError}
          alerts={alerts}
          onRefresh={() => refetchHealth()}
        />
      </LazySection>

      {/* Below the fold: Infrastructure */}
      <LazySection fallback={Skeletons.card} rootMargin={400}>
        <Infrastructure items={infrastructureItems} />
      </LazySection>

      {/* Below the fold: Queue + DB Size */}
      <LazySection fallback={Skeletons.card} rootMargin={300}>
        <QueueStatusSection
          queueStatus={queueStatus}
          dbSize={health?.checks?.db_size?.size}
          queueDetail={health?.checks?.queue_detail}
          recentErrors={health?.checks?.recent_errors?.errors}
          locale={locale}
        />
      </LazySection>

      {/* Below the fold: Failed Deliveries */}
      <LazySection fallback={Skeletons.table()} rootMargin={300}>
        <FailedTable
          failedDeliveries={failedDeliveries}
          selectedFailed={selectedFailed}
          onToggleSelect={toggleFailedSelect}
          onToggleSelectAll={toggleSelectAll}
          onBatchReplay={handleBatchReplay}
          isReplaying={batchReplayMutation.isPending}
        />
      </LazySection>

      {/* Below the fold: Dead Letters */}
      <LazySection fallback={Skeletons.table()} rootMargin={200}>
        <DeadLetters deadLetters={deadLetters} />
      </LazySection>

      {/* Below the fold: Rate Limits */}
      <LazySection fallback={Skeletons.table()} rootMargin={200}>
        <RateLimits violations={rateLimitViolations} />
      </LazySection>

      {/* Below the fold: API Latency */}
      <LazySection fallback={Skeletons.table()} rootMargin={200}>
        <LatencyTable endpoints={apiLatency} />
      </LazySection>

      {/* Below the fold: Test Webhook */}
      <LazySection fallback={Skeletons.card} rootMargin={200}>
        <TestWebhook />
      </LazySection>
    </div>
  );
}
