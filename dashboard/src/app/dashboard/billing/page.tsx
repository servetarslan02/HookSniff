'use client';

import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: '/month',
    limit: '1,000 webhooks/month',
    features: ['100 requests/min', '3 retry attempts', 'Community support', '5 endpoints', '7-day retention'],
    popular: false,
  },
  {
    name: 'Pro',
    price: 49,
    period: '/month',
    limit: '50,000 webhooks/month',
    features: ['1,000 requests/min', '5 retry attempts', 'Priority support', '50 endpoints', '30-day retention'],
    popular: true,
  },
  {
    name: 'Business',
    price: 149,
    period: '/month',
    limit: '500,000 webhooks/month',
    features: ['10,000 requests/min', '10 retry attempts', 'Dedicated support', 'SLA guarantee', '500 endpoints', '90-day retention'],
    popular: false,
  },
];

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string;
}

const mockInvoices: Invoice[] = [
  { id: 'inv_2026_05', date: '2026-05-01', amount: 49, status: 'paid', plan: 'Pro' },
  { id: 'inv_2026_04', date: '2026-04-01', amount: 49, status: 'paid', plan: 'Pro' },
  { id: 'inv_2026_03', date: '2026-03-01', amount: 49, status: 'paid', plan: 'Pro' },
  { id: 'inv_2026_02', date: '2026-02-01', amount: 0, status: 'paid', plan: 'Free' },
  { id: 'inv_2026_01', date: '2026-01-01', amount: 0, status: 'paid', plan: 'Free' },
  { id: 'inv_2025_12', date: '2025-12-01', amount: 0, status: 'paid', plan: 'Free' },
];

const monthlyUsage = [
  { month: 'Jan', count: 420 },
  { month: 'Feb', count: 580 },
  { month: 'Mar', count: 720 },
  { month: 'Apr', count: 890 },
  { month: 'May', count: 650 },
  { month: 'Jun', count: 980 },
];

function UsageChart({ data }: { data: typeof monthlyUsage }) {
  const max = Math.max(...data.map((d) => d.count));
  const barWidth = 40;
  const gap = 20;
  const w = data.length * (barWidth + gap);
  const h = 160;

  return (
    <svg width={w} height={h + 30} className="overflow-visible">
      {data.map((d, i) => {
        const barH = (d.count / max) * h;
        const x = i * (barWidth + gap);
        return (
          <g key={d.month}>
            <rect
              x={x}
              y={h - barH}
              width={barWidth}
              height={barH}
              rx={6}
              fill="#4c6ef5"
              opacity={0.8}
            />
            <text x={x + barWidth / 2} y={h + 20} textAnchor="middle" className="text-xs fill-gray-500 dark:fill-slate-400">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function InvoiceStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 ring-green-600/20',
    pending: 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 ring-yellow-600/20',
    failed: 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 ring-red-600/20',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${styles[status] || styles.pending}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function BillingPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const currentPlan = user?.plan || 'free';
  const [usageCount, setUsageCount] = useState(0);
  const [usageLimit, setUsageLimit] = useState(1000);
  const [loadingUsage, setLoadingUsage] = useState(true);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

  // Fetch real usage data
  useEffect(() => {
    if (!token) return;
    fetch(`${API}/billing/usage`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUsageCount(data.webhooks?.used ?? 0);
        setUsageLimit(data.webhooks?.limit ?? 1000);
      })
      .catch(() => {
        // fallback to defaults
      })
      .finally(() => setLoadingUsage(false));
  }, [token, API]);

  const usagePercent = usageLimit > 0 ? Math.round((usageCount / usageLimit) * 100) : 0;

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<string | null>(null);
  const [upgrading, setUpgrading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/v1';

  const handleUpgrade = (planName: string) => {
    setShowUpgradeModal(planName);
  };

  const confirmUpgrade = async () => {
    if (!showUpgradeModal || !token) return;
    setUpgrading(true);
    try {
      const res = await fetch(`${API}/billing/upgrade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan: showUpgradeModal.toLowerCase() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || 'Upgrade failed');
      }
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        toast(data.message || 'Upgrade initiated', 'success');
      }
    } catch (err: any) {
      toast(err.message || 'Upgrade failed', 'error');
    } finally {
      setUpgrading(false);
      setShowUpgradeModal(null);
    }
  };

  const nextBillingDate = '2026-06-01';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h1>
        <p className="text-gray-500 dark:text-slate-400 mt-1">
          Manage your subscription, usage, and payment history
        </p>
      </div>

      {/* Current Plan Summary */}
      <div className="glass-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Current Plan</h2>
            <div className="flex items-center gap-3 mt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 ring-1 ring-inset ring-brand-600/20">
                {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)}
              </span>
              <span className="text-sm text-gray-500 dark:text-slate-400">
                Next billing: {new Date(nextBillingDate).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
          {currentPlan !== 'free' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium transition"
            >
              Cancel Subscription
            </button>
          )}
        </div>

        {/* Usage */}
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">Webhooks this month</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {usageCount.toLocaleString()} / {usageLimit.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-3">
              <div
                className={clsx(
                  'h-3 rounded-full transition-all duration-500',
                  usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-brand-500'
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            {usagePercent > 80 && (
              <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                ⚠️ You&apos;re approaching your plan limit. Consider upgrading.
              </p>
            )}
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{usagePercent}%</div>
            <div className="text-sm text-gray-500 dark:text-slate-400">used</div>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Usage</h2>
        <div className="overflow-x-auto">
          <UsageChart data={monthlyUsage} />
        </div>
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentPlan;
            const isDowngrade = plans.findIndex((p) => p.name.toLowerCase() === currentPlan) > plans.indexOf(plan);
            return (
              <div
                key={plan.name}
                className={clsx(
                  'glass-card p-6 hover-lift relative',
                  plan.popular && 'ring-2 ring-brand-500'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 dark:bg-brand-500 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">${plan.price}</span>
                  <span className="text-gray-500 dark:text-slate-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">{plan.limit}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    className={clsx(
                      'w-full py-2.5 rounded-xl text-sm font-medium transition',
                      plan.popular
                        ? 'bg-brand-600 dark:bg-brand-500 text-white hover:bg-brand-700 dark:hover:bg-brand-600'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
                    )}
                  >
                    {isDowngrade ? 'Downgrade' : 'Upgrade'} to {plan.name}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Invoice History */}
      <div className="glass-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Invoice History</h2>
          <span className="text-sm text-gray-400 dark:text-slate-500">{mockInvoices.length} invoices</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
              {mockInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-slate-400">
                    {inv.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                    {new Date(inv.date).toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{inv.plan}</span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    ${inv.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <InvoiceStatusBadge status={inv.status} />
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium transition">
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upgrade Confirmation Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowUpgradeModal(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {plans.findIndex((p) => p.name.toLowerCase() === currentPlan) > plans.findIndex((p) => p.name === showUpgradeModal)
                ? 'Downgrade'
                : 'Upgrade'}{' '}
              to {showUpgradeModal}?
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              {plans.findIndex((p) => p.name.toLowerCase() === currentPlan) > plans.findIndex((p) => p.name === showUpgradeModal)
                ? 'Your new limits will take effect immediately. You\'ll receive a prorated credit.'
                : 'You\'ll be charged the difference immediately. New limits take effect right away.'}
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowUpgradeModal(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpgrade}
                disabled={upgrading}
                className="px-4 py-2.5 text-sm font-medium text-white bg-brand-600 rounded-xl hover:bg-brand-700 transition disabled:opacity-60"
              >
                {upgrading ? 'Redirecting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Cancel Subscription?</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">
              Your plan will remain active until the end of the current billing period. After that, you&apos;ll be moved to the Free plan.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-700 transition"
              >
                Keep Plan
              </button>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  toast('Subscription cancelled. You\'ll keep access until the end of the billing period.', 'info');
                }}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-xl hover:bg-red-700 transition"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
