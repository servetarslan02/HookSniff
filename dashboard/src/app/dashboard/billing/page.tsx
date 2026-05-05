'use client';

import { useState } from 'react';
import { clsx } from 'clsx';
import { useAuth } from '@/lib/store';
import { useToast } from '@/components/Toast';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: '/month',
    limit: '1,000 webhooks/month',
    features: ['100 requests/min', '3 retry attempts', 'Community support', '1 endpoint'],
    popular: false,
  },
  {
    name: 'Pro',
    price: 49,
    period: '/month',
    limit: '50,000 webhooks/month',
    features: ['1,000 requests/min', '5 retry attempts', 'Priority support', 'Custom domains', '10 endpoints'],
    popular: true,
  },
  {
    name: 'Business',
    price: 199,
    period: '/month',
    limit: '500,000 webhooks/month',
    features: ['10,000 requests/min', '10 retry attempts', 'Dedicated support', 'SLA guarantee', 'Unlimited endpoints', 'Custom integrations'],
    popular: false,
  },
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
            <text x={x + barWidth / 2} y={h + 20} textAnchor="middle" className="text-xs fill-gray-500">
              {d.month}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function BillingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const currentPlan = user?.plan || 'free';
  const usageCount = 650;
  const usageLimit = currentPlan === 'free' ? 1000 : currentPlan === 'pro' ? 50000 : 500000;
  const usagePercent = Math.round((usageCount / usageLimit) * 100);

  const handleUpgrade = (planName: string) => {
    toast(`Upgrade to ${planName} — Stripe integration coming soon!`, 'info');
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Billing</h1>

      {/* Current Usage */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Current Usage</h2>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Webhooks this month</span>
              <span className="font-medium">{usageCount.toLocaleString()} / {usageLimit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={clsx(
                  'h-3 rounded-full transition-all',
                  usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-brand-500'
                )}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900">{usagePercent}%</div>
            <div className="text-sm text-gray-500">used</div>
          </div>
        </div>
      </div>

      {/* Monthly Chart */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage</h2>
        <UsageChart data={monthlyUsage} />
      </div>

      {/* Plans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const isCurrent = plan.name.toLowerCase() === currentPlan;
            return (
              <div
                key={plan.name}
                className={clsx(
                  'glass-card p-6 hover-lift relative',
                  plan.popular && 'ring-2 ring-brand-500'
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white px-3 py-0.5 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500 text-sm">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{plan.limit}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {isCurrent ? (
                  <div className="w-full py-2.5 rounded-xl text-sm font-medium text-center bg-gray-100 text-gray-500">
                    Current Plan
                  </div>
                ) : (
                  <button
                    onClick={() => handleUpgrade(plan.name)}
                    className={clsx(
                      'w-full py-2.5 rounded-xl text-sm font-medium transition',
                      plan.popular
                        ? 'bg-brand-600 text-white hover:bg-brand-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    )}
                  >
                    {plan.price > 0 ? 'Upgrade' : 'Downgrade'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
