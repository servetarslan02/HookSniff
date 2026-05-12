'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/store';
import {
  statsApi,
  webhooksApi,
  analyticsApi,
  type StatsResponse,
  type Delivery,
  type DeliveryTrendResponse,
  type SuccessRateData,
} from '@/lib/api';
import { OnboardingWizard, SetupChecklist } from '@/components/OnboardingWizard';
import { StatCard } from '@/components/tremor';
import { useTranslations } from 'next-intl';
import { TimeRangeSelector, type TimeRange } from './components/TimeRangeSelector';
import { AnimatedCounter } from './components/AnimatedCounter';
import { DeliveryTrendChart } from './components/DeliveryTrendChart';
import { SuccessRateDonut } from './components/SuccessRateDonut';
import { ActivityFeed } from './components/ActivityFeed';
import { RecentDeliveriesTable } from './components/RecentDeliveriesTable';

export default function DashboardOverview() {
  const { token } = useAuth();
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Analytics state
  const [trendData, setTrendData] = useState<DeliveryTrendResponse | null>(null);
  const [successRateData, setSuccessRateData] = useState<SuccessRateData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);

  // Load stats + recent deliveries
  useEffect(() => {
    if (!token) return;
    let mounted = true;

    async function load() {
      try {
        setError(null);
        const [statsData, deliveriesData] = await Promise.all([
          statsApi.get(token!).catch(() => null),
          webhooksApi.list(token!, { page: 1 }).catch(() => null),
        ]);
        if (!mounted) return;
        if (statsData) setStats(statsData);
        if (deliveriesData) setRecentDeliveries(deliveriesData.deliveries.slice(0, 5));
        if (!statsData && !deliveriesData) {
          setError(tc('failedToLoad'));
        }
      } catch (err) {
        if (mounted) setError(err instanceof Error ? err.message : tc('failedToLoad'));
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, [token]);

  // Load analytics when time range changes
  useEffect(() => {
    if (!token) return;
    let mounted = true;
    setChartLoading(true);

    async function loadAnalytics() {
      try {
        const [trend, sr] = await Promise.all([
          analyticsApi.deliveryTrend(token!, timeRange).catch(() => null),
          analyticsApi.successRate(token!, timeRange).catch(() => null),
        ]);
        if (!mounted) return;
        if (trend) setTrendData(trend);
        if (sr) setSuccessRateData(sr);
      } catch {
        // ignore
      } finally {
        if (mounted) setChartLoading(false);
      }
    }

    loadAnalytics();
    return () => { mounted = false; };
  }, [token, timeRange]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-6 skeleton-shimmer">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
              <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: t('stats.totalDeliveries'),
      value: stats?.total_deliveries ?? 0,
      color: 'blue' as const,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a4 4 0 00-8 0v2" />
          <path d="M12 12v3" />
        </svg>
      ),
    },
    {
      label: t('delivered'),
      value: stats?.delivered ?? 0,
      color: 'emerald' as const,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="8,12 11,15 16,9" />
        </svg>
      ),
    },
    {
      label: t('failed'),
      value: stats?.failed ?? 0,
      color: 'red' as const,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
      ),
    },
    {
      label: t('stats.successRate'),
      value: stats?.success_rate ?? 0,
      color: 'violet' as const,
      isPercent: true,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 3v18h18" />
          <path d="M7 16l4-8 4 4 4-6" />
        </svg>
      ),
    },
    {
      label: t('pending'),
      value: stats?.pending ?? 0,
      color: 'amber' as const,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12,6 12,12 16,14" />
        </svg>
      ),
    },
    {
      label: t('endpoints'),
      value: stats?.endpoints_count ?? 0,
      color: 'slate' as const,
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <OnboardingWizard />
      <SetupChecklist />
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('title')}</h2>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.isPercent ? `${stat.value}` : <AnimatedCounter value={stat.value} />}
            icon={stat.icon}
            color={stat.color}
            isPercent={stat.isPercent}
          />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeliveryTrendChart data={trendData} loading={chartLoading} />
        </div>
        <SuccessRateDonut data={successRateData} loading={chartLoading} />
      </div>

      {/* Activity Feed + Recent Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed token={token!} />
        <RecentDeliveriesTable deliveries={recentDeliveries} />
      </div>
    </div>
  );
}
