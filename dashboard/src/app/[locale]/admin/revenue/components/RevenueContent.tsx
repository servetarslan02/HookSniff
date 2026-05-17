'use client';

import { useTranslations, useLocale } from 'next-intl';
import { ChartCard } from '@/components/tremor/ChartCard';
import { LazyBarChart as BarChart, LazyPieChart as PieChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Pie, Cell } from '@/components/LazyCharts';

const PLAN_COLORS: Record<string, string> = {
  developer: '#94a3b8',
  startup: '#10b981',
  pro: '#4c6ef5',
  enterprise: '#8b5cf6',
};

const PLAN_COLOR_MAP: Record<string, { border: string; bg: string; dot: string; badge: string }> = {
  gray: { border: 'border-gray-200 dark:border-slate-700', bg: 'bg-gray-50/50 dark:bg-slate-800/50', dot: 'bg-gray-400', badge: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400' },
  emerald: { border: 'border-emerald-200 dark:border-emerald-500/20', bg: 'bg-emerald-50/50 dark:bg-emerald-500/5', dot: 'bg-emerald-500', badge: 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
  blue: { border: 'border-blue-200 dark:border-blue-500/20', bg: 'bg-blue-50/50 dark:bg-blue-500/5', dot: 'bg-blue-500', badge: 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' },
  violet: { border: 'border-violet-200 dark:border-violet-500/20', bg: 'bg-violet-50/50 dark:bg-violet-500/5', dot: 'bg-violet-500', badge: 'bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400' },
};

const PLAN_FEATURES: Record<string, string[]> = {
  developer: ['5 endpoints', '1,000 webhooks/mo', '100 rate/min', '7-day retention', 'HMAC signatures', '2FA support'],
  startup: ['20 endpoints', '10K webhooks/mo', '500 rate/min', '14-day retention', 'CloudEvents', 'Secret rotation', 'Dead letter queue', 'Email support'],
  pro: ['50 endpoints', '50K webhooks/mo', '1,000 rate/min', '30-day retention', 'FIFO delivery', 'IP whitelist', 'Analytics', 'Schema registry', 'Priority support'],
  enterprise: ['200 endpoints', '500K webhooks/mo', '5,000 rate/min', '90-day retention', 'SSO/SAML', 'Account manager', '99.9% SLA', 'Custom integrations', 'On-premise option'],
};

// ── Inline helper components for plan editing ──
function PlanLimitRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-600 dark:text-slate-400">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-20 px-2 py-1 text-sm font-semibold text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg text-right focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
      />
    </div>
  );
}

function PlanCard({ name, color, price, limits, editing, onPriceChange, onLimitChange, t, free, popular, planId }: {
  name: string; color: string; price: number;
  limits: { endpoints: number; webhooks: number; rateLimit: number; retention: number };
  editing: boolean; onPriceChange?: (v: number) => void;
  onLimitChange: (field: string, value: number) => void;
  t: (k: string) => string; free?: boolean; popular?: boolean; planId?: string;
}) {
  const c = PLAN_COLOR_MAP[color] || PLAN_COLOR_MAP.gray;
  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4 relative ${popular ? 'ring-2 ring-blue-400 dark:ring-blue-500' : ''}`}>
      {popular && (
        <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold uppercase bg-blue-500 text-white rounded-full">
          {t('popular') || 'Popular'}
        </span>
      )}
      <div className="flex items-center gap-2 mb-3">
        <span className={`w-3 h-3 rounded-full ${c.dot}`} />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{name}</span>
      </div>

      {/* Price */}
      <div className="flex items-center gap-1.5 mb-4">
        {free ? (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">Free</span>
        ) : (
          <>
            <span className="text-base text-gray-500 dark:text-slate-400">$</span>
            {editing && onPriceChange ? (
              <input
                type="number" min="0" step="1"
                value={price}
                onChange={(e) => onPriceChange(Number(e.target.value))}
                className="w-20 px-2 py-1 text-2xl font-bold text-gray-900 dark:text-white bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              />
            ) : (
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{price}</span>
            )}
            <span className="text-xs text-gray-500 dark:text-slate-400">/mo</span>
          </>
        )}
      </div>

      {/* Limits */}
      <div className="space-y-2 text-xs">
        {editing ? (
          <>
            <PlanLimitRow label={t('maxEndpoints') || 'Endpoints'} value={limits.endpoints} onChange={(v) => onLimitChange('endpoints', v)} />
            <PlanLimitRow label={t('maxWebhooks') || 'Webhooks/mo'} value={limits.webhooks} onChange={(v) => onLimitChange('webhooks', v)} />
            <PlanLimitRow label={t('rateLimit') || 'Rate/min'} value={limits.rateLimit} onChange={(v) => onLimitChange('rateLimit', v)} />
            <PlanLimitRow label={t('retentionDays') || 'Retention'} value={limits.retention} onChange={(v) => onLimitChange('retention', v)} />
          </>
        ) : (
          <>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">{t('maxEndpoints') || 'Endpoints'}</span><span className="font-semibold text-gray-900 dark:text-white">{limits.endpoints}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">{t('maxWebhooks') || 'Webhooks/mo'}</span><span className="font-semibold text-gray-900 dark:text-white">{limits.webhooks.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">{t('rateLimit') || 'Rate/min'}</span><span className="font-semibold text-gray-900 dark:text-white">{limits.rateLimit.toLocaleString()}</span></div>
            <div className="flex justify-between"><span className="text-gray-500 dark:text-slate-400">{t('retentionDays') || 'Retention'}</span><span className="font-semibold text-gray-900 dark:text-white">{limits.retention}d</span></div>
          </>
        )}
      </div>

      {/* Features */}
      {planId && PLAN_FEATURES[planId] && (
        <div className="mt-3 pt-3 border-t border-gray-200/50 dark:border-slate-700/50">
          <p className="text-[10px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">{t('features') || 'Features'}</p>
          <ul className="space-y-1">
            {PLAN_FEATURES[planId].map((f, i) => (
              <li key={i} className="flex items-center gap-1.5 text-[11px] text-gray-600 dark:text-slate-400">
                <span className="text-emerald-500">✓</span> {f}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface Cohort {
  cohort_month: string;
  customers_signed_up: number;
  customers_active: number;
  retention_rate: number;
  total_revenue_cents: number;
}

interface Refund {
  id: string;
  email?: string;
  customer_id: string;
  amount_cents: number;
  currency: string;
  reason?: string;
  status: string;
  created_at: string;
}

interface ChurnUser {
  id: string;
  email: string;
  name?: string;
  plan: string;
  amount: number;
  churn_date: string;
}

interface PlanForm {
  plan_price_startup: number;
  plan_price_pro: number;
  plan_price_enterprise: number;
  max_endpoints_free: number;
  max_endpoints_startup: number;
  max_endpoints_pro: number;
  max_endpoints_enterprise: number;
  max_webhooks_free: number;
  max_webhooks_startup: number;
  max_webhooks_pro: number;
  max_webhooks_enterprise: number;
  rate_limit_free: number;
  rate_limit_startup: number;
  rate_limit_pro: number;
  rate_limit_enterprise: number;
  retention_days_free: number;
  retention_days_startup: number;
  retention_days_pro: number;
  retention_days_enterprise: number;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
}

interface PlanData {
  name: string;
  value: number;
  count: number;
}

export interface RevenueContentProps {
  monthlyData: MonthlyRevenue[];
  planData: PlanData[];
  hasRevenueData: boolean;
  cohorts: Cohort[];
  allRefunds: Refund[];
  refundsTotal: number;
  churnUsers: ChurnUser[];
  editingPlans: boolean;
  setEditingPlans: (v: boolean) => void;
  planForm: PlanForm;
  setPlanForm: (v: PlanForm) => void;
  handleSavePlans: () => void;
  savingPlans: boolean;
}

export default function RevenueContent({
  monthlyData,
  planData,
  hasRevenueData,
  cohorts,
  allRefunds,
  refundsTotal,
  churnUsers,
  editingPlans,
  setEditingPlans,
  planForm,
  setPlanForm,
  handleSavePlans,
  savingPlans,
}: RevenueContentProps) {
  const t = useTranslations('admin');
  const tc = useTranslations('common');
  const locale = useLocale();

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* ── Plan Management (Prices + Limits) ── */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">💰 {t('planManagement') || 'Plan Management'}</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('planManagementDesc') || 'Configure plan prices and limits. Changes sync to Polar.'}</p>
          </div>
          {!editingPlans ? (
            <button
              type="button"
              onClick={() => setEditingPlans(true)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition"
            >
              {t('editPlans') || 'Edit Plans'}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditingPlans(false)}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600 transition"
              >
                {tc('cancel')}
              </button>
              <button
                type="button"
                onClick={handleSavePlans}
                disabled={savingPlans}
                className="px-3 py-1.5 text-sm font-medium rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {savingPlans ? (tc('saving') || 'Saving...') : (tc('save') || 'Save')}
              </button>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* ── Plan Cards (4 plans) ── */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-3 uppercase tracking-wide">{t('planPrices') || 'Plan Prices & Limits'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <PlanCard
                name={t('developerPlan') || 'Developer'}
                color="gray"
                price={0}
                limits={{ endpoints: planForm.max_endpoints_free, webhooks: planForm.max_webhooks_free, rateLimit: planForm.rate_limit_free, retention: planForm.retention_days_free }}
                editing={editingPlans}
                onLimitChange={(field, value) => {
                  const map: Record<string, string> = { endpoints: 'max_endpoints_free', webhooks: 'max_webhooks_free', rateLimit: 'rate_limit_free', retention: 'retention_days_free' };
                  setPlanForm({ ...planForm, [map[field]]: value });
                }}
                t={t}
                planId="developer"
                free
              />
              <PlanCard
                name={t('startupPlan') || 'Startup'}
                color="emerald"
                price={planForm.plan_price_startup}
                limits={{ endpoints: planForm.max_endpoints_startup, webhooks: planForm.max_webhooks_startup, rateLimit: planForm.rate_limit_startup, retention: planForm.retention_days_startup }}
                editing={editingPlans}
                onPriceChange={(v) => setPlanForm({ ...planForm, plan_price_startup: v })}
                onLimitChange={(field, value) => {
                  const map: Record<string, string> = { endpoints: 'max_endpoints_startup', webhooks: 'max_webhooks_startup', rateLimit: 'rate_limit_startup', retention: 'retention_days_startup' };
                  setPlanForm({ ...planForm, [map[field]]: value });
                }}
                t={t}
                planId="startup"
              />
              <PlanCard
                name={t('proPlan') || 'Pro'}
                color="blue"
                price={planForm.plan_price_pro}
                limits={{ endpoints: planForm.max_endpoints_pro, webhooks: planForm.max_webhooks_pro, rateLimit: planForm.rate_limit_pro, retention: planForm.retention_days_pro }}
                editing={editingPlans}
                onPriceChange={(v) => setPlanForm({ ...planForm, plan_price_pro: v })}
                onLimitChange={(field, value) => {
                  const map: Record<string, string> = { endpoints: 'max_endpoints_pro', webhooks: 'max_webhooks_pro', rateLimit: 'rate_limit_pro', retention: 'retention_days_pro' };
                  setPlanForm({ ...planForm, [map[field]]: value });
                }}
                t={t}
                planId="pro"
                popular
              />
              <PlanCard
                name={t('enterprisePlan') || 'Enterprise'}
                color="violet"
                price={planForm.plan_price_enterprise}
                limits={{ endpoints: planForm.max_endpoints_enterprise, webhooks: planForm.max_webhooks_enterprise, rateLimit: planForm.rate_limit_enterprise, retention: planForm.retention_days_enterprise }}
                editing={editingPlans}
                onPriceChange={(v) => setPlanForm({ ...planForm, plan_price_enterprise: v })}
                onLimitChange={(field, value) => {
                  const map: Record<string, string> = { endpoints: 'max_endpoints_enterprise', webhooks: 'max_webhooks_enterprise', rateLimit: 'rate_limit_enterprise', retention: 'retention_days_enterprise' };
                  setPlanForm({ ...planForm, [map[field]]: value });
                }}
                t={t}
                planId="enterprise"
              />
            </div>
          </div>

          {/* ── Polar Sync Info ── */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <span className="text-lg">🔗</span>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              {t('polarSyncActive') || 'Prices auto-sync to Polar on save. Product IDs must be configured in POLAR_PRODUCT_* env vars.'}
            </p>
          </div>
        </div>
      </div>

      {hasRevenueData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Monthly Revenue Chart */}
          <div className="lg:col-span-2">
            <ChartCard title={t('monthlyRevenue')} subtitle={t('revenueOverTime')}>
              <div className="h-64 sm:h-80" role="img" aria-label={t('revenueChartDesc')}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <title>{t('revenueChartTitle')}</title>
                    <desc>{t('revenueChartDesc')}</desc>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} className="text-gray-500 dark:text-slate-400" interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} className="text-gray-500 dark:text-slate-400" tickFormatter={(v) => `$${v}`} width={50} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, t("revenue")]} />
                    <Bar dataKey="revenue" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={48} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Revenue by Plan */}
          <div className="glass-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('revenueByPlan')}</h2>
            {planData.length > 0 ? (
              <>
                <div className="h-48" role="img" aria-label={t('planDistributionDesc')}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <title>{t('planDistributionTitle')}</title>
                      <desc>{t('planDistributionDesc')}</desc>
                      <Pie data={planData} cx="50%" cy="50%" innerRadius={35} outerRadius={65} paddingAngle={4} dataKey="value">
                        {planData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8'} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'rgb(15 23 42)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '12px' }} formatter={(value) => [`$${Number(value).toLocaleString()}`, t("revenue")]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4" role="list" aria-label={t('planDistributionTitle')}>
                  {planData.map((entry) => (
                    <div key={entry.name} className="flex items-center justify-between" role="listitem">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: PLAN_COLORS[entry.name.toLowerCase()] || '#94a3b8' }} aria-hidden="true" />
                        <span className="text-sm text-gray-600 dark:text-slate-400">{entry.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">${entry.value.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 dark:text-slate-400 ml-1">({entry.count} {t('users')})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-gray-500 dark:text-slate-400 text-sm">{t('noRevenue')}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 sm:p-12 text-center">
          <div className="text-4xl sm:text-5xl mb-4" aria-hidden="true">📊</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('noRevenueData')}</h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 max-w-md mx-auto">{t('revenueDesc')}</p>
        </div>
      )}

      {/* Cohort Analysis */}
      {cohorts.length > 0 && (
        <div className="glass-card overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">📊 {t('cohortAnalysis') || 'Cohort Analysis'}</h2>
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('cohortDesc') || 'Monthly customer cohorts — signups, retention, and revenue'}</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('cohort') || 'Cohort'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('signedUp') || 'Signed Up'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('active') || 'Active'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('retention') || 'Retention'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('revenue') || 'Revenue'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {cohorts.map((c) => (
                  <tr key={c.cohort_month} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition">
                    <td className="px-4 sm:px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{c.cohort_month}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-slate-400">{c.customers_signed_up}</td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-slate-400">{c.customers_active}</td>
                    <td className="px-4 sm:px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${c.retention_rate >= 70 ? 'bg-emerald-500' : c.retention_rate >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.min(c.retention_rate, 100)}%` }} />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-slate-400">{c.retention_rate}%</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-sm text-gray-600 dark:text-slate-400">${(c.total_revenue_cents / 100).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Refund History */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('refundHistory') || 'Refund History'}</h2>
            {refundsTotal > 0 && <span className="text-sm text-gray-500 dark:text-slate-400">{refundsTotal} {t('total') || 'total'}</span>}
          </div>
        </div>
        {allRefunds.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('email')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('amount')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('reason') || 'Reason'}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('status')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('date')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {allRefunds.map((ref, index) => (
                  <tr key={ref.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">{ref.email || ref.customer_id.slice(0, 8) + '...'}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm font-medium text-red-600 dark:text-red-400">-{(ref.amount_cents / 100).toFixed(2)} {ref.currency.toUpperCase()}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-slate-400 max-w-xs truncate">{ref.reason || '—'}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        ref.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                        ref.status === 'pending' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>{ref.status}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(ref.created_at).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="text-3xl mb-2" aria-hidden="true">💸</div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('noRefunds') || 'No refunds yet'}</p>
          </div>
        )}
      </div>

      {/* Churn Analysis */}
      <div className="glass-card overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('churnAnalysis')}</h2>
        </div>
        {churnUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 dark:bg-slate-800/50">
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('email')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{tc('name')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('plan')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('amount')}</th>
                  <th scope="col" className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">{t('churnDate')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50 dark:divide-slate-700/50">
                {churnUsers.map((u, index) => (
                  <tr key={u.id} className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'} hover:bg-gray-100 dark:hover:bg-gray-700 transition`}>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-900 dark:text-white">{u.email}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-slate-400">{u.name || '—'}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-300">{u.plan}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-slate-400">${u.amount.toLocaleString()}</td>
                    <td className="px-4 sm:px-6 py-4 text-sm text-gray-500 dark:text-slate-400">
                      {new Date(u.churn_date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-6 py-8 text-center">
            <div className="text-3xl mb-2" aria-hidden="true">📉</div>
            <p className="text-gray-500 dark:text-slate-400 text-sm">{t('noChurn')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
