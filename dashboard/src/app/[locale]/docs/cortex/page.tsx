import { Suspense } from 'react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Brain, Shield, Zap, TrendingUp, Activity, AlertTriangle, CheckCircle2, Settings, BarChart3, Eye, RefreshCw, GitBranch } from '@/components/icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cortex AI — HookSniff',
  description: 'ML-powered anomaly detection, self-healing, predictive monitoring, and smart routing — all built into HookSniff.',
};

const features = [
  {
    icon: <Eye size={20} strokeWidth={1.75} />,
    title: 'Anomaly Detection',
    desc: 'Automatically detects when an endpoint is behaving abnormally — unusual latency spikes, error bursts, or drops in success rate.',
    color: 'blue',
  },
  {
    icon: <Shield size={20} strokeWidth={1.75} />,
    title: 'Self-Healing',
    desc: 'Takes automatic corrective actions when problems are detected: adjusts rate limits, switches to fallback URLs, or temporarily disables struggling endpoints.',
    color: 'green',
  },
  {
    icon: <TrendingUp size={20} strokeWidth={1.75} />,
    title: 'Predictive Monitoring',
    desc: 'Predicts failures before they happen by analyzing trends. Alerts you when an endpoint is likely to fail in the next hour.',
    color: 'amber',
  },
  {
    icon: <GitBranch size={20} strokeWidth={1.75} />,
    title: 'Smart Routing',
    desc: 'If you have fallback URLs configured, Cortex automatically routes traffic to the best-performing endpoint.',
    color: 'purple',
  },
  {
    icon: <Activity size={20} strokeWidth={1.75} />,
    title: 'Adaptive Thresholds',
    desc: 'Learns what\'s "normal" for each endpoint individually. No fixed thresholds — your slow endpoint won\'t trigger false alarms.',
    color: 'rose',
  },
  {
    icon: <Zap size={20} strokeWidth={1.75} />,
    title: 'Proactive Alerts',
    desc: 'Get notified about degradation trends, capacity warnings, and error patterns before they impact your users.',
    color: 'orange',
  },
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
          {t('cortex')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-slate-400 mb-4">
          {t('cortexDesc')}
        </p>
        <div className="flex flex-wrap gap-2 not-prose">
          {['Auto-Detection', 'Self-Healing', 'Predictive', 'Smart Routing', 'Per-Endpoint Learning'].map((tag) => (
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
          Cortex is the intelligence layer built into HookSniff. It continuously monitors your webhooks,
          learns what&apos;s normal for each endpoint, and takes action when something goes wrong —
          often before you even notice.
        </p>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          You don&apos;t need to configure anything. Cortex works automatically for every endpoint on every plan.
        </p>

        <div className="not-prose grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="p-5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-lg bg-${f.color}-100 dark:bg-${f.color}-900/30 flex items-center justify-center text-${f.color}-600 dark:text-${f.color}-400 mb-3`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Helps You */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How Cortex Helps You</h2>

        <div className="not-prose space-y-6">
          {/* Scenario 1 */}
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400 text-sm font-bold shrink-0">1</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Your endpoint starts failing</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Maybe your server is down, or a third-party service is having issues. Cortex detects the anomaly within minutes.
                </p>
              </div>
            </div>
            <div className="ml-11 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
              <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span><strong>Cortex acts:</strong> Reduces delivery rate to protect your server, switches to a fallback URL if configured, and sends you an alert.</span>
              </p>
            </div>
          </div>

          {/* Scenario 2 */}
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 text-sm font-bold shrink-0">2</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">Your endpoint is getting slower</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Latency is creeping up over the last few hours. Not failing yet, but trending in the wrong direction.
                </p>
              </div>
            </div>
            <div className="ml-11 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
              <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span><strong>Cortex acts:</strong> Generates a proactive insight with an estimated time to threshold. You get an alert before it becomes a real problem.</span>
              </p>
            </div>
          </div>

          {/* Scenario 3 */}
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-sm font-bold shrink-0">3</div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">An outage recovers</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">
                  Your server is back online, but there are thousands of queued webhooks waiting to be delivered.
                </p>
              </div>
            </div>
            <div className="ml-11 p-3 bg-green-50 dark:bg-green-900/10 rounded-lg border border-green-200 dark:border-green-800/30">
              <p className="text-sm text-green-800 dark:text-green-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="shrink-0" />
                <span><strong>Cortex acts:</strong> Gradually ramps up delivery speed instead of flooding your server. Monitors success rate and pauses if your server struggles.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What You See in the Dashboard */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What You See in the Dashboard</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-6">
          Cortex works behind the scenes, but you can see its activity in several places:
        </p>

        <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <BarChart3 size={16} className="text-purple-600 dark:text-purple-400" /> Analytics Dashboard
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1.5">
              <li>• Success rate trends (1h, 24h, 7d)</li>
              <li>• Latency percentiles (p50, p95, p99)</li>
              <li>• Delivery volume charts</li>
              <li>• Error breakdown by type</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" /> Alerts & Insights
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1.5">
              <li>• Anomaly alerts when endpoints misbehave</li>
              <li>• Proactive degradation warnings</li>
              <li>• Rate limit approaching notifications</li>
              <li>• Dominant error type insights</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <Activity size={16} className="text-green-600 dark:text-green-400" /> Endpoint Health
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1.5">
              <li>• Per-endpoint health score</li>
              <li>• Failure streak indicators</li>
              <li>• Auto-disable status (if triggered)</li>
              <li>• Recovery status after issues</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-gray-200 dark:border-slate-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
              <RefreshCw size={16} className="text-blue-600 dark:text-blue-400" /> Delivery History
            </h3>
            <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-1.5">
              <li>• Full delivery attempt history</li>
              <li>• Response codes and latency per attempt</li>
              <li>• Replay failed deliveries</li>
              <li>• Dead letter queue for debugging</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Smart Routing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Smart Routing</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If you configure fallback URLs for an endpoint, Cortex automatically routes traffic to the best-performing one.
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">How to use it</h3>
          <div className="space-y-3 text-sm text-gray-600 dark:text-slate-400">
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">1</span>
              <p>Go to your endpoint settings and add fallback URLs in the <strong>Routing</strong> section.</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">2</span>
              <p>Cortex monitors the performance of each URL (success rate + latency).</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold shrink-0">3</span>
              <p>If the primary URL degrades, traffic is automatically routed to the best fallback.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Disable & Recovery */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Auto-Disable & Recovery</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When an endpoint is consistently failing, Cortex can temporarily disable it to prevent wasted deliveries.
          This is a safety net, not a punishment.
        </p>

        <div className="not-prose space-y-4">
          <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/10">
            <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm mb-2 flex items-center gap-2">
              <AlertTriangle size={16} /> When does auto-disable trigger?
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-300">
              Only after <strong>multiple consecutive failures</strong> over a sustained period.
              A single bad hour won&apos;t disable your endpoint. Cortex uses a safety mechanism
              that requires consistent poor performance before taking this action.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-green-200 dark:border-green-800/30 bg-green-50 dark:bg-green-900/10">
            <h3 className="font-bold text-green-900 dark:text-green-300 text-sm mb-2 flex items-center gap-2">
              <CheckCircle2 size={16} /> How does recovery work?
            </h3>
            <p className="text-sm text-green-800 dark:text-green-300">
              Cortex automatically tests disabled endpoints every 15 minutes.
              When your endpoint is healthy again (95%+ success rate), it&apos;s automatically re-enabled
              and you receive a notification.
            </p>
          </div>
        </div>
      </section>

      {/* What Happens After an Outage */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">What Happens After an Outage</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          After an outage, your server might have thousands of queued webhooks waiting to be delivered.
          Sending them all at once could crash your server again.
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">Gradual Recovery</h3>
          <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
            Cortex uses a gradual ramp-up approach: it starts with a small number of deliveries per minute
            and slowly increases the rate. If your server starts struggling again, it pauses and retries later.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {['Slow', 'Medium', 'Fast', 'Full Speed'].map((label, i) => (
                <div key={label} className="flex items-center gap-2">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                    i < 2 ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                    i < 3 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  }`}>{label}</div>
                  {i < 3 && <span className="text-gray-300 dark:text-slate-600 text-xs">→</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Alerts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Alerts & Notifications</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex generates several types of alerts. You can configure notification channels in your alert settings.
        </p>
        <div className="not-prose">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Alert Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">When It Fires</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700 dark:text-slate-300">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {[
                  { type: 'Anomaly Detected', when: 'Endpoint behavior deviates from its learned baseline', severity: 'high' },
                  { type: 'Proactive Degradation', when: 'Success rate trending downward (not yet failing)', severity: 'medium' },
                  { type: 'Rate Limit Warning', when: 'Approaching daily webhook limit (80%+ usage)', severity: 'medium' },
                  { type: 'Endpoint Auto-Disabled', when: 'Endpoint disabled after sustained failures', severity: 'critical' },
                  { type: 'Endpoint Recovered', when: 'Auto-disabled endpoint is healthy again', severity: 'info' },
                  { type: 'High Latency', when: 'P95 latency significantly above normal', severity: 'low' },
                  { type: 'Dominant Error', when: 'Single error type accounts for most failures', severity: 'medium' },
                ].map(({ type, when, severity }) => (
                  <tr key={type}>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{type}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{when}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 text-[10px] font-semibold rounded-md ${
                        severity === 'critical' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                        severity === 'high' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                        severity === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                        severity === 'info' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                        'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400'
                      }`}>
                        {severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Weekly Reports */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Weekly Reports</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Cortex generates a weekly health report for your account, including:
        </p>
        <div className="not-prose p-5 rounded-xl border border-gray-200 dark:border-slate-700">
          <ul className="text-sm text-gray-600 dark:text-slate-400 space-y-2">
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Overall success rate for the week</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Total deliveries across all endpoints</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Per-endpoint health summary</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Active insights and recommendations</li>
            <li className="flex items-start gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-green-500" /> Latency trends and percentiles</li>
          </ul>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('cortexFAQ')}</h2>
        <div className="not-prose space-y-4">
          {[
            { q: 'Does Cortex cost extra?', a: 'No. Cortex is included in all plans — Free, Pro, Business, and Enterprise. There are no additional charges.' },
            { q: 'Do I need to configure anything?', a: 'No. Cortex works automatically for every endpoint. It starts learning from your first delivery.' },
            { q: 'Will Cortex disable my endpoint without warning?', a: 'No. Auto-disable only triggers after sustained, repeated failures. You\'ll receive a warning alert first, and the endpoint is automatically re-enabled once it recovers.' },
            { q: 'Can I turn off auto-disable?', a: 'Yes. You can disable auto-disable per endpoint in your endpoint settings if you prefer to handle failures manually.' },
            { q: 'How does Cortex learn what\'s "normal"?', a: 'Cortex analyzes your endpoint\'s historical performance — success rates, latency, delivery volume — and builds a baseline. It then detects deviations from that baseline, not from fixed global thresholds.' },
            { q: 'Does Cortex affect my webhook delivery speed?', a: 'Only when it helps. Cortex may slow down deliveries to a struggling endpoint (to protect it) or speed up recovery after an outage. Normal operations are unaffected.' },
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
            { href: '/docs/analytics', title: 'Analytics', desc: 'View delivery trends, success rates, and latency charts.' },
            { href: '/docs/alerts', title: 'Alerts', desc: 'Configure how and where you receive Cortex notifications.' },
            { href: '/docs/endpoints', title: 'Endpoints', desc: 'Manage your endpoints, fallback URLs, and health settings.' },
            { href: '/docs/retries', title: 'Retries & DLQ', desc: 'Understand retry behavior and the dead letter queue.' },
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
