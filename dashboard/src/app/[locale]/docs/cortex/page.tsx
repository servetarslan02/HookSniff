import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Brain, Shield, Zap, TrendingUp, Activity, AlertTriangle, CheckCircle2, Settings, BarChart3, Eye, RefreshCw, GitBranch } from '@/components/icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cortex AI — HookSniff',
  description: 'ML-powered anomaly detection, self-healing, predictive monitoring, and smart routing. The brain behind HookSniff.',
};

const mlAlgorithms = [
  {
    name: 'Adaptive Thresholds',
    desc: 'EWMA + IQR based threshold learning. Each endpoint learns its own "normal" — no fixed thresholds.',
    detail: 'Exponentially Weighted Moving Average (EWMA) for smooth trend tracking, Interquartile Range (IQR) for outlier resilience. Separate model per endpoint.',
    icon: <Activity size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Statistical Anomaly Detection',
    desc: 'Modified Z-Score + Mahalanobis distance for multi-dimensional anomaly detection.',
    detail: 'Instead of univariate Z-Score, analyzes success rate, latency, and delivery rate together in a multi-dimensional approach.',
    icon: <AlertTriangle size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Multi-Armed Bandit (UCB1)',
    desc: 'Automatically selects the best action for retry strategies, circuit breaker thresholds, and throttle rates.',
    detail: 'UCB1 formula: exploitation + exploration bonus. Separate learning per endpoint — exploration-exploitation balance is automatic.',
    icon: <Settings size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Time Series Forecasting',
    desc: 'Holt-Winters + multi-seasonality (hourly + daily) for future predictions.',
    detail: 'Prophet-like approach: trend component, 24-hour seasonality, 7-day seasonality, and CUSUM changepoint detection.',
    icon: <TrendingUp size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Concept Drift Detection',
    desc: 'Page-Hinkley + ADWIN + Kolmogorov-Smirnov automatically detects model degradation.',
    detail: 'Three algorithms work together: sudden changes (Page-Hinkley), gradual changes (ADWIN), distribution shifts (KS Test). When drift is detected, automatic retraining is triggered.',
    icon: <GitBranch size={20} strokeWidth={1.75} />,
  },
  {
    name: 'Contextual Bandit (Thompson Sampling)',
    desc: 'Advanced bandit algorithm that selects the best healing action based on context.',
    detail: 'Decisions based not just on past performance, but on current context (time, traffic level, error type).',
    icon: <Brain size={20} strokeWidth={1.75} />,
  },
];

const pipelineStages = [
  { stage: '1', name: 'Signal Collector', interval: '1 hour', desc: 'Converts delivery data into hourly summaries. Uses PostgreSQL PERCENTILE_CONT for accurate p95/p99.' },
  { stage: '2', name: 'Profile Engine', interval: '15 min', desc: 'Builds behavioral profile per endpoint: 1h/24h/7d windows, busiest/quietest hour, error distribution.' },
  { stage: '3', name: 'Anomaly Scorer', interval: '5 min', desc: 'Calculates anomaly scores with ML models. Falls back to formula-based scoring if ML is not yet trained.' },
  { stage: '3b', name: 'Alert Correlation', interval: '5 min', desc: 'Groups related anomalies into a single root cause alert. 100 alerts → 1 root cause.' },
  { stage: '4', name: 'Self-Healing', interval: '5 min', desc: 'Automatic corrective actions: rate limit reduction, circuit breaker tightening, timeout increase, fallback URL switch.' },
  { stage: '5', name: 'Action Memory', interval: 'Continuous', desc: 'Records every action and its outcome. Updates strategy weights for Multi-Armed Bandit.' },
  { stage: '6', name: 'Recovery Surge', interval: 'On demand', desc: 'Controls the rate of queued webhook re-delivery after an outage. Prevents the "recovery surge" pattern.' },
  { stage: '7', name: 'Predictive Engine', interval: '15 min', desc: 'Calculates failure probability and capacity forecast from trend analysis.' },
  { stage: '8', name: 'Insights Engine', interval: '24 hours', desc: 'Generates actionable insights: declining trends, high latency, dominant error types.' },
  { stage: '9', name: 'Smart Routing', interval: '15 min', desc: 'Automatically selects the best-performing fallback URL.' },
  { stage: '10', name: 'ML Training', interval: '15 min', desc: 'Batch trains all ML models. Model versioning for rollback support.' },
  { stage: '11', name: 'Drift Detection', interval: '10 min', desc: 'Detects model degradation. Triggers automatic retraining on critical drift.' },
  { stage: '12', name: 'Proactive Healing', interval: '15 min', desc: 'Detects degradation trends before anomalies occur and takes preventive action.' },
];

const healingActions = [
  { action: 'rate_limit_reduce', desc: 'Reduces endpoint rate limit by 25%', severity: 'medium' },
  { action: 'circuit_tighten', desc: 'Tightens circuit breaker thresholds', severity: 'medium' },
  { action: 'retry_slowdown', desc: 'Slows down retry speed', severity: 'low' },
  { action: 'timeout_adjust', desc: 'Increases timeout by 50% (max 30s)', severity: 'low' },
  { action: 'retry_increase', desc: 'Increases max retry count', severity: 'low' },
  { action: 'fallback_url_switch', desc: 'Automatically switches to fallback URL', severity: 'high' },
  { action: 'auto_disable', desc: 'Automatically disables the endpoint', severity: 'critical' },
];

async function CortexContent(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('docs');

  return (
    <article className="prose prose-gray max-w-none">
      {/* Header */}
      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-200 dark:border-purple-800 mb-4">
          <Brain size={16} className="text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">{t('cortex')}</span>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">
          {t('cortex')}: The AI Behind HookSniff
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexDesc')}
        </p>
        <div className="flex flex-wrap gap-2 not-prose">
          {['Anomaly Detection', 'Self-Healing', 'Predictive', 'Drift Detection', 'Smart Routing', 'AutoML'].map((tag) => (
            <span key={tag} className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* What is Cortex */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexWhatIs')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexWhatIsDesc')}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 not-prose mb-6">
          {[
            { icon: <Eye size={20} />, title: t('cortexSeeing'), desc: t('cortexSeeingDesc'), color: 'blue' },
            { icon: <Zap size={20} />, title: t('cortexLearning'), desc: t('cortexLearningDesc'), color: 'amber' },
            { icon: <Shield size={20} />, title: t('cortexProtecting'), desc: t('cortexProtectingDesc'), color: 'green' },
          ].map(({ icon, title, desc, color }) => (
            <div key={title} className={`p-5 rounded-xl border border-${color}-200 dark:border-${color}-800/30 bg-${color}-50 dark:bg-${color}-900/10`}>
              <div className={`text-${color}-600 dark:text-${color}-400 mb-3`}>{icon}</div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl">
          <p className="text-sm text-purple-800 dark:text-purple-300">
            <strong><Brain size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('cortexRuleBased')}</strong>
          </p>
        </div>
      </section>

      {/* How It Works — Pipeline */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexHowItWorks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          {t('cortexHowItWorksDesc')}
        </p>

        <div className="not-prose space-y-3">
          {pipelineStages.map((s) => (
            <div key={s.stage} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 transition-colors">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                {s.stage}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{s.name}</h3>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 rounded">
                    {s.interval}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-slate-400">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ML Algorithms */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexMlAlgorithms')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          {t('cortexMlAlgorithmsDesc')}
        </p>

        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
          {mlAlgorithms.map((algo) => (
            <div key={algo.name} className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                  {algo.icon}
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{algo.name}</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-2">{algo.desc}</p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{algo.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Anomaly Detection Deep Dive */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexAnomalyDetection')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Two-phase anomaly detection for each endpoint:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-6">
          <div className="p-5 rounded-xl border border-blue-200 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/10">
            <h3 className="font-bold text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center">1</span>
              ML Path (≥10 data points)
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-2">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Adaptive Threshold (EWMA + IQR) for threshold setting</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Statistical Detection (Z-Score + Mahalanobis) for anomaly scoring</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Weighted average of both scores (50/50)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> ML confidence score included</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 mb-3 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center">2</span>
              Fallback Path (&lt;10 data points)
            </h3>
            <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-2">
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Latency spike (weight: 30%)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Success rate drop (weight: 30%)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Error burst (weight: 20%)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Traffic anomaly (weight: 10%)</li>
              <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0" /> Consecutive failures (weight: 10%)</li>
            </ul>
          </div>
        </div>

        <div className="not-prose p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
          <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">Anomaly Categories</h4>
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'Low (0-39)', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
              { label: 'Medium (40-69)', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
              { label: 'High (70-79)', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' },
              { label: 'Critical (80-100)', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
            ].map(({ label, color }) => (
              <span key={label} className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${color}`}>{label}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Self-Healing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexSelfHealing')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexSelfHealingDesc')}
        </p>

        <div className="not-prose mb-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Action</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Description</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {healingActions.map((a) => (
                  <tr key={a.action}>
                    <td className="px-4 py-3 font-mono text-xs text-purple-600 dark:text-purple-400">{a.action}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{a.desc}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        a.severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        a.severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                        a.severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}>
                        {a.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <strong><AlertTriangle size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Circuit Breaker Protection:</strong> The auto-disable action only triggers when there are 3+ consecutive high anomaly scores within the last 3 hours. A single momentary issue won&apos;t cause a destructive action.
          </p>
        </div>
      </section>

      {/* Proactive Healing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexProactiveHealing')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexProactiveHealingDesc')}
        </p>
        <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Degradation Trend Detection', desc: 'Is success rate trending downward over the last 6 hours? Alerts before it crosses the threshold.', icon: <TrendingUp size={18} /> },
            { title: 'Peak Preparation', desc: 'Warns if you\'re approaching rate limits. Notifies if you\'re using 80%+ of your daily limit.', icon: <BarChart3 size={18} /> },
            { title: 'Preemptive Throttle', desc: 'If latency is increasing but not yet at anomaly level, proactively adjusts throttle rates.', icon: <Zap size={18} /> },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="p-4 rounded-xl border border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-900/10">
              <div className="text-green-600 dark:text-green-400 mb-2">{icon}</div>
              <h3 className="font-bold text-green-900 dark:text-green-300 text-sm mb-1">{title}</h3>
              <p className="text-xs text-green-700 dark:text-green-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Predictive Engine */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexPredictiveEngine')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexPredictiveEngineDesc')}
        </p>
        <div className="not-prose space-y-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Failure Probability Prediction</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400 mb-3">
              Analyzes the last 6 hours of data with linear regression. Calculates trend slope, momentum, and R² value. Negative trend + low momentum = high failure probability.
            </p>
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> &gt;70% → Critical alert</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500" /> 30-70% → Monitoring</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> &lt;30% → Normal</span>
            </div>
          </div>
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Capacity Forecast</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              Predicts when you&apos;ll hit your rate limit based on average and peak delivery rates. Shows usage percentage and estimated days remaining on the dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* Drift Detection */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexDriftDetection')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexDriftDetectionDesc')}
        </p>
        <div className="not-prose grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Page-Hinkley', type: 'Sudden Change', desc: 'Cumulative deviation tracking. Detects when distribution shifts suddenly.', color: 'red' },
            { name: 'ADWIN', type: 'Gradual Change', desc: 'Adaptive window size. Catches slowly changing patterns.', color: 'amber' },
            { name: 'KS Test', type: 'Distribution Shift', desc: 'Checks if two samples come from the same distribution.', color: 'blue' },
          ].map(({ name, type, desc, color }) => (
            <div key={name} className={`p-4 rounded-xl border border-${color}-200 dark:border-${color}-800/30`}>
              <h3 className={`font-bold text-${color}-900 dark:text-${color}-300 text-sm mb-1`}>{name}</h3>
              <span className="text-xs text-gray-500 dark:text-slate-500 mb-2 block">{type}</span>
              <p className="text-xs text-gray-600 dark:text-slate-400">{desc}</p>
            </div>
          ))}
        </div>
        <div className="not-prose mt-4 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            <strong>What happens when drift is detected?</strong> If severity &gt; 0.7, automatic retraining is triggered. Lower severity only increases monitoring. All drift events are recorded in the <code className="bg-gray-100 dark:bg-slate-800 px-1 rounded text-xs">ml_drift_events</code> table.
          </p>
        </div>
      </section>

      {/* Smart Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexSmartRouting')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexSmartRoutingDesc')}
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">How does it decide?</h3>
          <div className="space-y-2 text-sm text-gray-600 dark:text-slate-400">
            <p>1. If current endpoint success rate is &lt;95% or p95 latency is &gt;5000ms, it looks for a fallback</p>
            <p>2. Each fallback URL&apos;s delivery data from the last hour is analyzed</p>
            <p>3. Scoring: <strong>Success Rate (70%) + Latency (30%)</strong></p>
            <p>4. Automatic switch to the highest-scoring URL</p>
          </div>
        </div>
      </section>

      {/* AutoML */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexAutoML')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexAutoMLDesc')}
        </p>
        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Optimized Parameters</h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1">
              <li>• <strong>Adaptive Threshold:</strong> alpha, threshold_multiplier, iqr_multiplier</li>
              <li>• <strong>Time Series:</strong> alpha, beta, gamma (Holt-Winters smoothing factors)</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Auto Deploy</h3>
            <p className="text-sm text-gray-600 dark:text-slate-400">
              After 5+ trials, if the best parameter set shows 5%+ better performance than the current baseline, it&apos;s automatically applied.
            </p>
          </div>
        </div>
      </section>

      {/* Chaos Engineering */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexChaosEngineering')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexChaosEngineeringDesc')}
        </p>
        <div className="not-prose grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { name: 'Redis Down', severity: 'low' },
            { name: 'DB Slow', severity: 'medium' },
            { name: 'Endpoint Down', severity: 'high' },
            { name: 'Traffic Spike', severity: 'medium' },
            { name: 'Error Burst', severity: 'high' },
          ].map(({ name, severity }) => (
            <div key={name} className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 text-center">
              <p className="font-semibold text-xs text-gray-900 dark:text-white mb-1">{name}</p>
              <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                severity === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              }`}>{severity}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Model Quality & A/B Testing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexModelQuality')}</h2>
        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <BarChart3 size={16} /> Quality Tracking
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2">
              <li>• Each prediction is compared against the actual value</li>
              <li>• Within 20% tolerance is considered &quot;acceptable&quot;</li>
              <li>• Low-quality models are automatically reset and retrained</li>
              <li>• Quality score: 60% accuracy + 25% low error + 15% stability</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3 flex items-center gap-2">
              <GitBranch size={16} /> A/B Testing
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2">
              <li>• Compares two models on the same endpoint</li>
              <li>• Configurable traffic split ratio</li>
              <li>• Statistical significance testing (z-test, p&lt;0.05)</li>
              <li>• Winner is automatically determined and applied</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Explainable AI */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexXAI')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexXAIDesc')}
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Example Anomaly Explanation</h3>
          <div className="p-4 bg-gray-900 rounded-lg text-sm font-mono text-green-400 leading-relaxed">
            <p>Based on last 24 data points:</p>
            <p>• Success Rate: 87.3% (baseline: 96.1%, dropped 8.8%)</p>
            <p>• Latency: 2340ms (baseline: 890ms, increased 1450ms)</p>
            <p>• P95/Latency ratio: 3.2x ⚠️ high</p>
            <p>• Score: 72/100</p>
          </div>
          <div className="mt-3 text-xs text-gray-500 dark:text-slate-500">
            Each feature&apos;s contribution, direction (increases/decreases risk), and importance percentage is included.
          </div>
        </div>
      </section>

      {/* Recovery Surge */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexRecoverySurge')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexRecoverySurgeDesc')}
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-4 mb-4">
            {[10, 20, 50, 100, 200].map((rate, i) => (
              <div key={rate} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  i < 3 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                  i < 4 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                }`}>{rate}</div>
                {i < 4 && <span className="text-gray-300 dark:text-slate-600">→</span>}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            Gradual ramp-up: 10/min → 20/min → 50/min → 100/min → 200/min.
            60-second wait between each step. If success rate drops below 95%, the ramp is paused.
          </p>
        </div>
      </section>

      {/* Prometheus Metrics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexPrometheus')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex metrics are exposed in Prometheus format at <code className="bg-gray-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-sm text-sm">/metrics</code>.
        </p>
        <div className="not-prose p-4 bg-gray-900 rounded-xl text-sm font-mono text-green-400 overflow-x-auto leading-relaxed">
          <p>cortex_hourly_stats_runs_total</p>
          <p>cortex_hourly_stats_endpoints_processed</p>
          <p>cortex_profile_updates_total</p>
          <p>cortex_anomaly_scores_high_total</p>
          <p>cortex_alerts_correlated_total</p>
          <p>cortex_healing_actions_total</p>
          <p>cortex_cascade_detections_total</p>
          <p>cortex_action_memory_records_total</p>
          <p>cortex_recovery_surges_started_total</p>
          <p>cortex_recovery_surges_completed_total</p>
          <p>cortex_predictions_generated_total</p>
          <p>cortex_insights_generated_total</p>
          <p>cortex_routing_decisions_total</p>
          <p>cortex_drift_detected_total</p>
        </div>
      </section>

      {/* Architecture */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexArchitecture')}</h2>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <pre className="text-sm font-mono text-gray-600 dark:text-slate-400 overflow-x-auto leading-relaxed">
{`┌─────────────────────────────────────────────────────┐
│                 Cortex Scheduler                     │
│         (Tick every 30s, 15 stages)                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Signal   │→│ Profile  │→│ Anomaly  │          │
│  │ Collector│  │ Engine   │  │ Scorer   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│       │                          │                   │
│       ▼                          ▼                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Alert    │→│ Self     │→│ Proactive│          │
│  │Correlate │  │ Healing  │  │ Healing  │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│       │                          │                   │
│       ▼                          ▼                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │Predictive│→│  Smart   │→│   ML     │          │
│  │ Engine   │  │ Routing  │  │ Training │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│       │                          │                   │
│       ▼                          ▼                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Drift    │→│  AutoML  │→│ Insights │          │
│  │Detection │  │          │  │ Engine   │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
├─────────────────────────────────────────────────────┤
│  PostgreSQL Advisory Locks (multi-instance safe)     │
│  Per-stage timeout protection                        │
│  Structured tracing (cortex_traces)                  │
│  Prometheus metrics (/metrics)                       │
└─────────────────────────────────────────────────────┘`}
          </pre>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexFAQ')}</h2>
        <div className="not-prose space-y-4">
          {[
            { q: 'Does Cortex add extra cost?', a: 'No. Cortex is included in all plans. ML models run on your own servers — no external API calls.' },
            { q: 'Does Cortex work immediately for new endpoints?', a: 'Yes, but uses formula-based fallback for the first 10 data points. ML kicks in automatically after 10+ data points.' },
            { q: 'When does an auto-disabled endpoint get re-enabled?', a: 'Cortex tests disabled endpoints every 15 minutes. If the success rate is 95%+ over the last 2 hours, it\'s automatically re-enabled and the customer is notified.' },
            { q: 'Where are ML models stored?', a: 'In PostgreSQL\'s ml_models table. Separate model parameters per endpoint, stored as JSON.' },
            { q: 'Can I disable Cortex?', a: 'Yes. Via platform_settings.cortex_config you can disable all stages or specific ones.' },
          ].map(({ q, a }) => (
            <div key={q} className="p-4 rounded-xl border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2">{q}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexNextSteps')}</h2>
        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { href: '/docs/analytics', title: 'Analytics', desc: 'View Cortex metrics on the dashboard.' },
            { href: '/docs/alerts', title: 'Alerts', desc: 'Configure Cortex alerts.' },
            { href: '/docs/architecture', title: 'Architecture', desc: 'Deep dive into system architecture.' },
            { href: '/docs/monitor-performance', title: 'Monitor Performance', desc: 'Monitor endpoint performance.' },
          ].map(({ href, title, desc }) => (
            <a key={href} href={href} className="block p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-md transition">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
            </a>
          ))}
        </div>
      </section>
    </article>
  );
}

export default async function CortexPage(params: Promise<{ locale: string }>) {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4"><div className="h-8 w-64 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" /><div className="h-4 w-3/4 rounded bg-gray-200 dark:bg-gray-700" /><div className="h-64 w-full rounded bg-gray-200 dark:bg-gray-700" /></div>}>
      <CortexContent {...params} />
    </Suspense>
  );
}
