'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/store';
import { statsApi, webhooksApi, type StatsResponse, type Delivery } from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Onboarding } from '@/components/Onboarding';

/* ─── Animated Counter ─── */
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const start = ref.current;
    const diff = value - start;
    const startTime = performance.now();

    function animate(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + diff * eased);
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        ref.current = value;
      }
    }

    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

/* ─── Delivery Trend Chart ─── */
function DeliveryTrendChart({ data }: { data: { date: string; deliveries: number; success: number }[] }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Delivery Trend</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorDeliveries" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey="deliveries"
              stroke="#4c6ef5"
              fillOpacity={1}
              fill="url(#colorDeliveries)"
              strokeWidth={2}
              name="Total"
            />
            <Area
              type="monotone"
              dataKey="success"
              stroke="#10b981"
              fillOpacity={1}
              fill="url(#colorSuccess)"
              strokeWidth={2}
              name="Success"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ─── Success Rate Donut ─── */
function SuccessRateDonut({ rate }: { rate: number }) {
  const data = [
    { name: 'Success', value: rate },
    { name: 'Failed', value: 100 - rate },
  ];
  const COLORS = ['#10b981', '#ef4444'];

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Success Rate</h3>
      <div className="h-64 flex items-center justify-center">
        <div className="relative">
          <ResponsiveContainer width={200} height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
                strokeWidth={0}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{rate}%</div>
              <div className="text-xs text-gray-500 dark:text-slate-400">success</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Activity Feed ─── */
function ActivityFeed({ deliveries }: { deliveries: Delivery[] }) {
  if (deliveries.length === 0) {
    return (
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Live Activity</h3>
        <div className="text-center py-8 text-gray-400 dark:text-slate-500">No recent activity</div>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Live Activity</h3>
        </div>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-slate-800">
        {deliveries.slice(0, 5).map((d, i) => (
          <div
            key={d.id}
            className="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition"
            style={{ animationDelay: `${i * 100}ms` }}
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

/* ─── Status Badge ─── */
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20 dark:ring-green-500/30',
    failed: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20 dark:ring-red-500/30',
    pending: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20 dark:ring-yellow-500/30',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
}

/* ─── Main Dashboard ─── */
export default function DashboardOverview() {
  const { token } = useAuth();
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [recentDeliveries, setRecentDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);

  // Generate mock trend data
  const trendData = Array.from({ length: 14 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - i));
    const total = Math.floor(Math.random() * 500 + 200);
    return {
      date: date.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      deliveries: total,
      success: Math.floor(total * (0.95 + Math.random() * 0.05)),
    };
  });

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
    { name: 'Total Deliveries', rawValue: stats?.total_deliveries ?? 0, icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/><path d="M12 12v3"/></svg>
    )},
    { name: 'Delivered', rawValue: stats?.delivered ?? 0, icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="8,12 11,15 16,9"/></svg>
    )},
    { name: 'Failed', rawValue: stats?.failed ?? 0, icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
    )},
    { name: 'Success Rate', rawValue: stats?.success_rate ?? 0, isPercent: true, icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 3v18h18"/><path d="M7 16l4-8 4 4 4-6"/></svg>
    )},
    { name: 'Pending', rawValue: stats?.pending ?? 0, icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
    )},
    { name: 'Endpoints', rawValue: stats?.endpoints_count ?? 0, icon: (
      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
    )},
  ];

  return (
    <div className="space-y-8">
      <Onboarding />
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div key={stat.name} className="glass-card p-6 hover-lift card-tilt group">
            <div className="flex items-center justify-between mb-4">
              <div className="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-brand-100 dark:border-brand-500/20">
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.isPercent ? (
                <>{stat.rawValue}%</>
              ) : (
                <AnimatedCounter value={stat.rawValue} />
              )}
            </div>
            <div className="text-sm text-gray-500 dark:text-slate-400">{stat.name}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DeliveryTrendChart data={trendData} />
        </div>
        <SuccessRateDonut rate={stats?.success_rate ?? 0} />
      </div>

      {/* Activity Feed + Recent Deliveries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityFeed deliveries={recentDeliveries} />

        {/* Recent Deliveries Table */}
        <div className="glass-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Deliveries</h2>
            <a href="/dashboard/deliveries" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Event</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Attempts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                  {recentDeliveries.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">{d.id.slice(0, 12)}…</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 dark:bg-slate-700 text-xs font-mono text-gray-700 dark:text-slate-300">
                          {d.event || '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{d.attempt_count}</td>
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
