'use client';
import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const dimensions = [
  {
    title: 'Time to Market',
    hooksniff: 'Days — deploy on free-tier infrastructure in under an hour',
    build: '6–12 months for a production-grade system',
    whyItMatters: 'Every month you spend building webhook infrastructure is a month your competitors are shipping features. Fast time-to-market means faster revenue, faster feedback loops, and faster iteration.',
  },
  {
    title: 'Engineering Cost',
    hooksniff: '$24/mo (Pro plan) — no engineers needed for maintenance',
    build: '3–5 engineers × 6–12 months = $300K–$1M+ initial build, then 1–2 engineers on-call permanently',
    whyItMatters: 'Webhook infrastructure looks simple (just HTTP POST, right?) but hides distributed-systems complexity: durable queues, retry logic, dead-letter handling, SSRF protection, signing, replay protection, FIFO ordering, log retention, and a self-serve portal. Each is a multi-week project.',
  },
  {
    title: 'Ongoing Maintenance',
    hooksniff: 'Zero — dedicated team handles everything',
    build: 'On-call rotations, customer bug reports, infrastructure scaling, security patches, compliance audits',
    whyItMatters: 'Webhooks are infrastructure your customers rely on daily. When they break, it\'s visible: missed events, out-of-order deliveries, 5xx errors. Your best engineers get pulled off core product to debug webhook issues.',
  },
  {
    title: 'Reliability & SLA',
    hooksniff: '99.9% uptime SLA (upgrading to 99.99%)',
    build: 'Whatever you build — typically 99% at best, with no external accountability',
    whyItMatters: 'Webhook failures are customer-facing. When your webhook system goes down, your customers\' integrations break. They notice. They complain. They churn.',
  },
  {
    title: 'Security',
    hooksniff: 'HMAC-SHA256, SSRF protection, constant-time comparison, Argon2id, 2FA, GDPR — all built-in',
    build: 'You need to implement: HMAC signing, SSRF blocking (private IPs, metadata endpoints, DNS rebinding), replay protection, rate limiting, input validation, secret rotation, audit logging',
    whyItMatters: 'Webhook-specific security is a niche expertise. SSRF attacks through webhook URLs are a real threat. One misconfiguration can expose internal infrastructure.',
  },
  {
    title: 'Developer Experience',
    hooksniff: '11 SDKs, webhook playground, schema registry, CloudEvents, 8-language dashboard, embeddable portal',
    build: 'Build your own SDKs, playground, portal, documentation — or leave developers to figure it out themselves',
    whyItMatters: 'Your webhook consumers are developers. A poor DX means more support tickets, slower adoption, and frustrated users who switch to competitors with better webhook experiences.',
  },
  {
    title: 'Scalability',
    hooksniff: 'Auto-scales on GCP Cloud Run — handles millions of events',
    build: 'You build it: connection pooling, queue management, backpressure handling, noisy-neighbor isolation',
    whyItMatters: 'Webhook traffic is spiky. Black Friday, product launches, viral moments — your system needs to handle 10x normal load without dropping events.',
  },
  {
    title: 'Compliance',
    hooksniff: 'SOC 2 ready, GDPR compliant (EU hosting), CCPA, Standard Webhooks spec',
    build: 'SOC 2 audit alone takes 3–6 months and $50K+. GDPR compliance requires data residency controls, export, deletion endpoints',
    whyItMatters: 'Enterprise customers won\'t integrate without SOC 2. EU customers need GDPR compliance. Building compliance from scratch is a 6-month detour.',
  },
  {
    title: 'Retry & Durability',
    hooksniff: 'Exponential backoff with jitter, dead letter queue, configurable retry policies, FIFO ordering',
    build: 'Implement: exponential backoff, jitter, dead-letter queues, message deduplication, sequence numbers, idempotency keys',
    whyItMatters: 'Retries sound simple until you realize you need: exponential backoff with jitter (to avoid thundering herd), dead-letter queues (for permanently failed events), deduplication (to avoid double-processing), and FIFO ordering (for sequential events).',
  },
  {
    title: 'Observability',
    hooksniff: 'OpenTelemetry (314 instrumentation points), structured JSON logging, Grafana Cloud integration',
    build: 'Build your own: distributed tracing, metrics collection, log aggregation, alerting dashboards',
    whyItMatters: 'When a customer says "I didn\'t receive my webhook," you need to trace: was it sent? Did it fail? Why? How many retries? What was the response? Without observability, you\'re debugging blind.',
  },
  {
    title: 'Self-Serve Portal',
    hooksniff: 'Embeddable portal — your customers manage their own webhook subscriptions, view logs, replay events',
    build: 'Build a full CRUD UI: endpoint management, log viewer, replay functionality, secret rotation, event filtering',
    whyItMatters: 'Without a self-serve portal, every webhook issue becomes a support ticket. "Can you check if my webhook was delivered?" "Can you replay these 50 events?" "Can you add a new endpoint?" — all manual work.',
  },
  {
    title: 'Multi-Tenancy',
    hooksniff: 'Built-in — isolate webhook traffic per customer, per endpoint, with per-tenant rate limiting',
    build: 'Architect tenant isolation from scratch: data separation, rate limiting per tenant, billing per tenant, API key management',
    whyItMatters: 'One noisy customer shouldn\'t affect others. Multi-tenancy requires careful isolation at every layer: storage, processing, rate limiting, and monitoring.',
  },
];

const faq = [
  {
    q: 'When does building in-house make sense?',
    a: 'For hobbyist projects, very low volume where reliability doesn\'t matter, or unusual data-residency/air-gapped deployments. Even then, consider using the HookSniff open-source server (MIT license) as a starting point.',
  },
  {
    q: 'What about using an open-source webhook library instead?',
    a: 'Libraries handle signing and maybe retries, but not: durable queues, dead-letter handling, multi-tenancy, a self-serve portal, observability, SSRF protection, rate limiting, or compliance. You still build 80% of the system.',
  },
  {
    q: 'Can\'t I just use a message queue (RabbitMQ, SQS) for webhooks?',
    a: 'Message queues solve delivery but not: HTTP-specific concerns (retries with backoff, status codes, timeouts), signing/verification, a consumer portal, SSRF protection, or compliance. You\'ll build a webhook system on top of the queue anyway.',
  },
  {
    q: 'How much does it really cost to build webhook infrastructure?',
    a: 'Industry data: 3–5 engineers × 6–12 months = $300K–$1M+ initial. Then 1–2 engineers on-call ($200K–$400K/year ongoing). Plus infrastructure, compliance audits, and opportunity cost of not building your core product.',
  },
  {
    q: 'What if HookSniff gets acquired or shuts down?',
    a: 'HookSniff is open-source (MIT license). You can self-host the entire system, fork the code, or migrate to another provider. You\'re never locked in.',
  },
  {
    q: 'Is HookSniff production-ready?',
    a: 'Yes. 1,378 tests, OpenTelemetry observability, SSRF protection, HMAC signing, GDPR compliance, and it runs on Google Cloud Run with Neon PostgreSQL. 11 SDKs published to npm, PyPI, crates.io, NuGet, Maven Central, and more.',
  },
];

export default function BuildVsBuyContent() {
  const t = useTranslations('buildVsBuy');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Webhooks: Build vs Buy
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto mb-6">
            Webhooks look simple — an HTTP POST when something happens. In practice they involve a long tail of distributed-systems problems. Make an informed decision about your webhook infrastructure.
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-500">Last updated: May 2026</p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-2">1–2</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t("engineers")}</p>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">vs 3–5 to build in-house</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-2">{t("days")}</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t("timeToProduction")}</p>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">vs 6–12 months to build</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 text-center">
            <p className="text-3xl font-bold text-brand-600 dark:text-brand-400 mb-2">$24/mo</p>
            <p className="text-sm text-gray-600 dark:text-slate-400">{t("hooksniffPro")}</p>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">vs $300K–$1M+ to build</p>
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-6 mb-16">
          {dimensions.map((dim, i) => (
            <div key={dim.title} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-sm font-bold">{i + 1}</span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{dim.title}</h3>
                </div>
                <div className="grid md:grid-cols-2 gap-6 mb-4">
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
                    <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">🪝 HookSniff (Buy)</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{dim.hooksniff}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                    <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">🔧 Build In-House</p>
                    <p className="text-sm text-gray-700 dark:text-slate-300">{dim.build}</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg border border-blue-200 dark:border-blue-500/20">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">💡 Why it matters</p>
                  <p className="text-sm text-gray-600 dark:text-slate-400">{dim.whyItMatters}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">💰 True Cost Comparison</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">🔧 Building In-House</h3>
              <ul className="space-y-3">
                {[
                  { item: 'Initial development (3–5 engineers × 6–12 months)', cost: '$300K–$1M+' },
                  { item: 'Ongoing maintenance (1–2 engineers)', cost: '$200K–$400K/yr' },
                  { item: 'Infrastructure (queues, databases, monitoring)', cost: '$2K–$10K/mo' },
                  { item: 'SOC 2 audit', cost: '$50K–$100K' },
                  { item: 'On-call burden', cost: 'Priceless stress' },
                  { item: 'Opportunity cost (not building core product)', cost: 'Immeasurable' },
                ].map((row) => (
                  <li key={row.item} className="flex justify-between items-start text-sm">
                    <span className="text-gray-600 dark:text-slate-400 mr-4">{row.item}</span>
                    <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.cost}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">Year 1 Total</span>
                  <span className="text-red-600 dark:text-red-400">$550K–$1.5M+</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">🪝 HookSniff (Buy)</h3>
              <ul className="space-y-3">
                {[
                  { item: 'Setup time', cost: '1 day' },
                  { item: 'Monthly cost (Pro)', cost: '$24/mo' },
                  { item: 'Infrastructure', cost: 'Included' },
                  { item: 'SOC 2 compliance', cost: 'Ready' },
                  { item: 'On-call burden', cost: 'Zero' },
                  { item: 'Opportunity cost', cost: 'Zero — focus on product' },
                ].map((row) => (
                  <li key={row.item} className="flex justify-between items-start text-sm">
                    <span className="text-gray-600 dark:text-slate-400 mr-4">{row.item}</span>
                    <span className="font-medium text-gray-900 dark:text-white whitespace-nowrap">{row.cost}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                <div className="flex justify-between font-bold">
                  <span className="text-gray-900 dark:text-white">Year 1 Total</span>
                  <span className="text-emerald-600 dark:text-emerald-400">$348</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* When to Build */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t("whenBuilding")}</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-4">Building in-house is defensible for a narrow set of cases:</p>
          <ul className="space-y-2">
            {[
              'Hobbyist and research workloads where reliability isn\'t critical',
              'Very low volume (fewer than 1,000 events/day) with no SLA requirements',
              'Unusual data-residency or air-gapped deployments where cloud services can\'t be used',
              'You already have a mature event infrastructure team with deep distributed-systems expertise',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-gray-500 dark:text-slate-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 dark:text-slate-500 mt-4">
            Even in these cases, consider the <a href="https://github.com/servetarslan02/HookSniff" className="text-brand-600 dark:text-brand-400 hover:underline" target="_blank" rel="noopener noreferrer">HookSniff open-source server</a> (MIT license) as a starting point.
          </p>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("faq")}</h2>
          <div className="space-y-3 max-w-3xl mx-auto">
            {faq.map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <button
                  type="button"
                  aria-expanded={expandedFaq === i}
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white pr-4">{item.q}</span>
                  <svg className={`w-5 h-5 text-gray-500 dark:text-slate-500 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 dark:text-slate-400">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to stop building and start shipping?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">Deploy HookSniff in under an hour. Free tier available. No credit card required.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
            <Link href="/compare" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("compareAlternatives")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
