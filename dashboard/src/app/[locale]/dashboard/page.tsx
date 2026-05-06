'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/lib/store';
import {
  statsApi,
  webhooksApi,
  analyticsApi,
  type StatsResponse,
  type Delivery,
  type DeliveryTrendResponse,
  type SuccessRateData,
  type TimeBucket,
} from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import { Onboarding } from '@/components/Onboarding';
import { StatCard, ChartCard, StatusBadge } from '@/components/tremor';
import { useTranslations } from 'next-intl';

// ─── Time Range Selector ───
type TimeRange = '24h' | '7d' | '30d';

function TimeRangeSelector({
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (range: TimeRange) => void;
}) {
  const ranges: TimeRange[] = ['24h', '7d', '30d'];
  const labels: Record<TimeRange, string> = { '24h': t('timeRange.24h'), '7d': t('timeRange.7d'), '30d': t('timeRange.30d') };

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onChange(range)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            value === range
              ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300'
          }`}
        >
          {labels[range]}
        </button>
      ))}
    </div>
  );
}

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevRef.current;
    const diff = value - start;
    if (diff === 0) {
      setDisplay(value);
      return;
    }
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevRef.current = value;
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

/* ─── Delivery Trend Chart ─── */
function DeliveryTrendChart({
  data,
  loading,
}: {
  data: DeliveryTrendResponse | null;
  loading: boolean;
}) {
  const tc = useTranslations("common");
  const chartData = data?.buckets.map((b) => ({
    date: new Date(b.timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      ...(data.range === '24h' ? { hour: '2-digit', minute: '2-digit' } : {}),
    }),
    successful: b.successful,
    failed: b.failed,
  })) || [];

  return (
    <ChartCard title={t('deliveryTrend')}>
      <div className="h-72">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse text-gray-400 dark:text-slate-500">{t('loadingChart')}</div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-gray-400 dark:text-slate-500">
            No delivery data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-slate-700" />
              <XAxis
                dataKey="date"
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary, #fff)',
                  border: '1px solid var(--border-color, #e5e7eb)',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="successful"
                stroke="#10b981"
                fillOpacity={1}
                fill="url(#colorSuccess)"
                strokeWidth={2}
                name={t('successful')}
              />
              <Area
                type="monotone"
                dataKey="failed"
                stroke="#ef4444"
                fillOpacity={1}
                fill="url(#colorFailed)"
                strokeWidth={2}
                name={t('failed')}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}

/* ─── Success Rate Donut ─── */
function SuccessRateDonut({
  data,
  loading,
}: {
  data: SuccessRateData | null;
  loading: boolean;
}) {
  const t = useTranslations('dashboard');
  const tc = useTranslations('common');
  const rate = data?.success_rate ?? 0;
  const chartData = [
    { name: tc('success'), value: data?.successful ?? 0 },
    { name: tc('failed') || 'Failed', value: data?.failed ?? 0 },
    { name: tc('pending') || 'Pending', value: data?.pending ?? 0 },
  ];
  const COLORS = ['#10b981', '#ef4444', '#f59e0b'];

  return (
    <ChartCard title={t('successRate')}>
      <div className="h-72 flex items-center justify-center">
        {loading ? (
          <div className="animate-pulse text-gray-400 dark:text-slate-500">{tc('loading')}</div>
        ) : (
          <div className="relative">
            <ResponsiveContainer width={220} height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{rate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500 dark:text-slate-400">{t('success')}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ChartCard>
  );
}

/* ─── Activity Feed with auto-refresh ─── */
function ActivityFeed({ token }: { token: string }) {
  const tc = useTranslations("common");
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeliveries = useCallback(async () => {
    try {
      const data = await webhooksApi.list(token, { page: 1 });
      setDeliveries(data.deliveries.slice(0, 10));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchDeliveries();
    const interval = setInterval(fetchDeliveries, 5000);
    return () => clearInterval(interval);
  }, [fetchDeliveries]);

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('liveActivity')}</h3>
        </div>
        <span className="text-xs text-gray-400 dark:text-slate-500">{t('autoRefresh5s')}</span>
      </div>
      {loading ? (
        <div className="p-8 text-center text-gray-400 dark:text-slate-500 animate-pulse">{tc('loading')}</div>
      ) : deliveries.length === 0 ? (
        <div className="p-8 text-center text-gray-400 dark:text-slate-500">No recent activity</div>
      ) : (
        <div className="divide-y divide-gray-100 dark:divide-slate-800">
          {deliveries.map((d, i) => (
            <div
              key={d.id}
              className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-3">
                <StatusDot status={d.status} />
                <div>
                  <div className="text-sm font-mono text-gray-700 dark:text-slate-300">
                    {d.event || 'webhook'}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500">
                    {d.id.slice(0, 10)}…
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {d.attempt_count} attempt{d.attempt_count !== 1 ? 's' : ''}
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500">
                  {new Date(d.created_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    delivered: 'bg-green-500',
    failed: 'bg-red-500',
    pending: 'bg-yellow-500',
  };
  return <div className={`w-2.5 h-2.5 rounded-full ${colors[status] || colors.pending}`} />;
}

/* ─── Main Dashboard ─── */
export default function DashboardOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  // Analytics state
  const [trendData, setTrendData] = useState<DeliveryTrendResponse | null>(null);
  const [successRateData, setSuccessRateData] = useState<SuccessRateData | null>(null);
  const [chartLoading, setChartLoading] = useState(true);

  // Load stats + recent deliveries
  useEffect(() => {
    if (!token) return;

    async function load() {
      try {
        const [statsData, deliveriesData] = await Promise.all([
          statsApi.get(token!).catch(() => null),
          webhooksApi.list(token!, { page: 1 }).catch(() => null),
        ]);
        if (statsData) setStats(statsData);
        if (deliveriesData) setRecentDeliveries(deliveriesData.deliveries.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  // Load analytics when time range changes
  useEffect(() => {
    if (!token) return;
    setChartLoading(true);

    async function loadAnalytics() {
      try {
        const [trend, sr] = await Promise.all([
          analyticsApi.deliveryTrend(token!, timeRange).catch(() => null),
          analyticsApi.successRate(token!, timeRange).catch(() => null),
        ]);
        if (trend) setTrendData(trend);
        if (sr) setSuccessRateData(sr);
      } catch {
        // ignore
      } finally {
        setChartLoading(false);
      }
    }

    loadAnalytics();
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
      <Onboarding />
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

        {/* Recent Deliveries Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('recentDeliveries')}</h2>
            <a
              href="/dashboard/deliveries"
              className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium"
            >
              View all →
            </a>
          </div>
          {recentDeliveries.length === 0 ? (
            <div className="p-12 text-center text-gray-400 dark:text-slate-500">
              No deliveries yet. Send your first webhook!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Attempts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                  {recentDeliveries.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition"
                    >
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                        {d.id.slice(0, 12)}…
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-xs font-mono text-gray-700 dark:text-slate-300">
                          {d.event || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                        {d.attempt_count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-slate-500">
                        {new Date(d.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
