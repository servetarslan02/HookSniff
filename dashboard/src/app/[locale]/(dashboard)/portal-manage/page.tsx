'use client';

import { useTranslations, useLocale } from 'next-intl';
import { clsx } from 'clsx';
import { usePortalProfile, useBillingUsage } from '@/hooks/useDashboardData';
import { usePlans } from '@/hooks/usePlans';
import { AlertTriangle, TrendingUp, Zap, Globe, Clock, Gauge } from '@/components/icons';

/** Values >= this threshold represent "unlimited" (max int from DB) */
const UNLIMITED_THRESHOLD = 2147483647;

function isUnlimited(value: number | undefined | null): boolean {
  return !value || value >= UNLIMITED_THRESHOLD;
}

function formatLimit(value: number): string {
  if (isUnlimited(value)) return '∞';
  return value.toLocaleString();
}

export default function PortalPage() {
  const t = useTranslations('portal');
  const tb = useTranslations('billing');
  const locale = useLocale();
  const { data: profile, isLoading: profileLoading, error: profileError } = usePortalProfile();
  const { data: billingUsage, isLoading: billingLoading } = useBillingUsage();
  const { getPlanLimits } = usePlans();

  const loading = profileLoading || billingLoading;
  const error = profileError;
  const currentPlan = profile?.plan || billingUsage?.plan || 'developer';
  const planLimits = getPlanLimits(currentPlan);
  // Prefer retention from billing usage API (authoritative, from DB plan),
  // fallback to plans API lookup
  const retentionDays = billingUsage?.retention_days ?? planLimits?.retention ?? null;
  const dataAgeDays = billingUsage?.data_age_days ?? 0;
  const dataExpiresInDays = billingUsage?.data_expires_in_days ?? null;

  const webhookUsed = billingUsage?.webhooks?.used ?? 0;
  const webhookRawLimit = billingUsage?.webhooks?.limit;
  const webhookLimit = webhookRawLimit ?? 10000;
  const endpointUsed = billingUsage?.endpoints?.used ?? 0;
  const webhookUnlimited = webhookRawLimit === null || isUnlimited(webhookLimit);
  const webhookPercent = webhookUnlimited ? 0 : webhookLimit > 0 ? Math.round((webhookUsed / webhookLimit) * 100) : 0;

  if (loading) {
    return (
      <div className="max-w-4xl space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse" />)}
        </div>
        <div className="h-48 bg-gray-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('title')}</h1>
        <div className="p-5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-600 dark:text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800 dark:text-red-300">{error instanceof Error ? error.message : t('failedToLoad')}</p>
            </div>
            <button type="button" onClick={() => window.location.reload()}
              className="px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-500/20 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition">
              ↻ {t('retry') || 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('title')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{t('subtitle') || 'Your account overview and usage'}</p>
      </div>

      {/* Profile Card */}
      {profile && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold shadow-md">
              {(profile.email || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">{profile.email}</div>
              <div className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                <Clock size={12} strokeWidth={1.75} />
                {t('memberSince')}: {new Date(profile.created_at).toLocaleDateString(locale)}
              </div>
            </div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-500/20 capitalize">
              {profile.plan}
            </span>
          </div>
        </div>
      )}

      {/* Usage Stats — 3 compact cards (all from billingUsage) */}
      {billingUsage && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <UsageCard
            icon={<Zap size={18} strokeWidth={1.75} />}
            label={t('webhooksUsed')}
            value={webhookUsed.toLocaleString()}
            color="purple"
          />
          <UsageCard
            icon={<Globe size={18} strokeWidth={1.75} />}
            label={t('endpoints')}
            value={`${endpointUsed}`}
            badge="∞"
            color="blue"
          />
          <UsageCard
            icon={<Gauge size={18} strokeWidth={1.75} />}
            label={t('rateLimit')}
            value={billingUsage?.rate_limit
              ? (isUnlimited(billingUsage.rate_limit.requests_per_minute)
                  ? '∞'
                  : `${billingUsage.rate_limit.requests_per_minute.toLocaleString()}/min`)
              : '—'}
            color="emerald"
          />
        </div>
      )}

      {/* Plan Limits & Usage Bar */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp size={16} strokeWidth={1.75} className="text-gray-400 dark:text-slate-500" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-slate-300">{tb('usageOverview')}</h2>
        </div>

        <div className="space-y-5">
          {/* Webhook Usage Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">{tb('webhooksThisMonth')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {webhookUnlimited ? (
                  <>{webhookUsed.toLocaleString()} / <span className="text-brand-500">∞ {tb('unlimited') || 'Sınırsız'}</span></>
                ) : (
                  <>{webhookUsed.toLocaleString()} / {webhookLimit.toLocaleString()}</>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
              <div
                className={clsx(
                  'h-2 rounded-full transition-all duration-500',
                  webhookPercent > 80 ? 'bg-red-500' : webhookPercent > 50 ? 'bg-amber-500' : 'bg-brand-500'
                )}
                style={{ width: webhookUnlimited ? '100%' : `${webhookPercent}%` }}
              />
            </div>
            {webhookPercent > 80 && !webhookUnlimited && (
              <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 flex items-center gap-1">
                <AlertTriangle size={12} strokeWidth={1.75} /> {tb('approachingLimit')}
              </p>
            )}
          </div>

          {/* Data Retention */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600 dark:text-slate-400">{tb('dataRetention')}</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {dataExpiresInDays !== null && dataExpiresInDays > 0
                  ? `${dataExpiresInDays} ${tb('days')} ${tb('remaining') || 'kaldı'}`
                  : dataExpiresInDays === 0
                  ? (tb('dataExpired') || 'Süresi doldu')
                  : `${retentionDays ?? '—'} ${tb('days')}`
                }
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  dataExpiresInDays !== null && dataExpiresInDays <= 7
                    ? 'bg-red-500'
                    : dataExpiresInDays !== null && dataExpiresInDays <= 30
                    ? 'bg-yellow-500'
                    : 'bg-brand-500'
                }`}
                style={{
                  width: retentionDays && retentionDays > 0
                    ? `${Math.max(2, Math.min(100, ((retentionDays - dataAgeDays) / retentionDays) * 100))}%`
                    : '100%',
                }}
              />
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
              {dataAgeDays > 0
                ? `${dataAgeDays} ${tb('daysOldData') || 'günlük veri var'} — ${retentionDays} ${tb('days')} ${tb('retentionLabel') || 'saklanır'}`
                : tb('retentionDesc')
              }
            </p>
          </div>

          {/* Plan Limits Grid */}
          {planLimits && (
            <div className="pt-4 border-t border-gray-100 dark:border-slate-700/50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <LimitChip value="∞" label={tb('endpoints')} />
                <LimitChip value={formatLimit(planLimits.webhooks)} label={tb('webhooksMonth')} />
                <LimitChip value={formatLimit(planLimits.rateLimit)} label={tb('rateLimit')} />
                <LimitChip value={isUnlimited(retentionDays) ? '∞' : `${retentionDays}d`} label={tb('dataRetention')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Compact Usage Card ─── */
function UsageCard({ icon, label, value, badge, color }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge?: string;
  color: 'purple' | 'blue' | 'emerald';
}) {
  const colorMap = {
    purple: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400',
    blue: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={clsx('w-8 h-8 rounded-lg flex items-center justify-center', colorMap[color])}>
          {icon}
        </div>
        <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        {badge && (
          <span className="text-xs font-medium text-brand-500 dark:text-brand-400">{badge}</span>
        )}
      </div>
    </div>
  );
}

/* ─── Compact Limit Chip ─── */
function LimitChip({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-slate-900">
      <span className="text-sm font-bold text-gray-900 dark:text-white">{value}</span>
      <span className="text-xs text-gray-500 dark:text-slate-400 truncate">{label}</span>
    </div>
  );
}
