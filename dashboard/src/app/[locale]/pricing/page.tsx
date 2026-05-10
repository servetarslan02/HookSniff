'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/* ─── Data ─── */

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    desc: 'For side projects and experiments',
    cta: 'Get Started',
    ctaStyle: 'outline',
    popular: false,
    features: [
      '1,000 webhooks/month',
      '1 endpoint',
      '3 retry attempts',
      'HMAC-SHA256 signatures',
      'Dashboard access',
      'Community support',
      '3-day log retention',
      '8 SDK access',
    ],
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    desc: 'For production applications',
    cta: 'Start Free Trial',
    ctaStyle: 'filled',
    popular: true,
    features: [
      '50,000 webhooks/month',
      '10 endpoints',
      '5 retry attempts',
      'Custom retry policies',
      'Priority support',
      'Custom domains',
      '30-day log retention',
      '11 SDK access',
      'Webhook playground',
      'Event tags & filtering',
      'Email alerts',
    ],
  },
  {
    name: 'Business',
    price: '$99',
    period: '/month',
    desc: 'For teams that need guarantees',
    cta: 'Contact Sales',
    ctaStyle: 'outline',
    popular: false,
    features: [
      '500,000 webhooks/month',
      'Unlimited endpoints',
      '10 retry attempts',
      '99.9% SLA guarantee',
      'Dedicated support',
      '90-day log retention',
      'Everything in Pro',
      'Schema registry',
      'FIFO delivery',
      'CloudEvents support',
      'Custom integrations',
      'SSO/SAML',
    ],
  },
];

const comparisonRows = [
  { category: 'Usage', items: [
    { feature: 'Monthly webhooks', free: '1,000', pro: '50,000', business: '500,000' },
    { feature: 'Endpoints', free: '1', pro: '10', business: 'Unlimited' },
    { feature: 'Requests/min rate limit', free: '100', pro: '1,000', business: '10,000' },
    { feature: 'Additional events', free: '—', pro: '$0.50/100K', business: '$0.30/100K' },
    { feature: 'Team members', free: '1', pro: '3', business: 'Unlimited' },
  ]},
  { category: 'Delivery', items: [
    { feature: 'Delivery methods', free: 'HTTP', pro: 'HTTP, WS', business: 'HTTP, WS, gRPC, SQS' },
    { feature: 'Retry attempts', free: '3', pro: '5', business: '10' },
    { feature: 'Custom retry policies', free: '—', pro: '✅', business: '✅' },
    { feature: 'FIFO ordered delivery', free: '—', pro: '—', business: '✅' },
    { feature: 'Exponential backoff', free: '✅', pro: '✅', business: '✅' },
    { feature: 'Dead letter queue (DLQ)', free: '—', pro: '✅', business: '✅' },
  ]},
  { category: 'Security', items: [
    { feature: 'HMAC-SHA256 signatures', free: '✅', pro: '✅', business: '✅' },
    { feature: 'Webhook secret rotation', free: '—', pro: '✅', business: '✅' },
    { feature: 'IP whitelisting', free: '—', pro: '—', business: '✅' },
    { feature: 'SSO / SAML', free: '—', pro: '—', business: '✅' },
    { feature: '2FA / TOTP', free: '✅', pro: '✅', business: '✅' },
    { feature: 'CloudEvents v1.0', free: '—', pro: '✅', business: '✅' },
  ]},
  { category: 'Monitoring & Logs', items: [
    { feature: 'Dashboard', free: '✅', pro: '✅', business: '✅' },
    { feature: 'Log retention', free: '7 days', pro: '30 days', business: '90 days' },
    { feature: 'Real-time delivery logs', free: '✅', pro: '✅', business: '✅' },
    { feature: 'Analytics & graphs', free: '—', pro: '✅', business: '✅' },
    { feature: 'Schema registry', free: '—', pro: '—', business: '✅' },
    { feature: 'Webhook playground', free: '—', pro: '✅', business: '✅' },
  ]},
  { category: 'Support', items: [
    { feature: 'Community support', free: '✅', pro: '✅', business: '✅' },
    { feature: 'Email support', free: '—', pro: '✅', business: '✅' },
    { feature: 'Priority support', free: '—', pro: '✅', business: '✅' },
    { feature: 'Dedicated account manager', free: '—', pro: '—', business: '✅' },
    { feature: 'SLA guarantee', free: '—', pro: '—', business: '99.9%' },
    { feature: 'Custom integrations', free: '—', pro: '—', business: '✅' },
  ]},
];

const faqs = [
  {
    q: 'What counts as a webhook?',
    a: 'A webhook is an event delivered to your endpoint. Failed deliveries that are retried do not count as additional webhooks — retries are free. Filtered messages (e.g., no matching endpoint) are also free.',
  },
  {
    q: 'Do I need a credit card to start?',
    a: 'No. You can sign up and start sending webhooks on the Free plan without a credit card. Upgrade when you need more volume or features.',
  },
  {
    q: 'What happens if I exceed my plan limit?',
    a: 'We never drop webhooks. If you exceed your monthly limit, additional events are metered at the per-plan rate ($0.50/100K for Pro, $0.30/100K for Business). You can also set a hard cap in your dashboard settings.',
  },
  {
    q: 'Are retries really free?',
    a: 'Yes. A webhook includes all its retries. If a delivery fails and we retry it 3 times, that still counts as 1 webhook. We absorb the retry cost because reliable delivery is our core promise.',
  },
  {
    q: 'Can I change plans mid-month?',
    a: 'Yes. Upgrades take effect immediately and are prorated. Downgrades take effect at the start of your next billing cycle. No penalties, no hidden fees.',
  },
  {
    q: 'Is there a startup discount?',
    a: 'Yes! If you\'re an early-stage startup (pre-Series A), contact us at hello@hooksniff.com with your details. We offer significant discounts and extended free tiers to help you grow.',
  },
  {
    q: 'What\'s the difference between Pro and Business?',
    a: 'Pro is for growing teams that need more volume and better monitoring. Business is for teams that need SLA guarantees, FIFO delivery, SSO, and dedicated support. If you need 99.9% uptime SLA, go Business.',
  },
  {
    q: 'Do you offer annual billing?',
    a: 'Yes. Annual billing saves you 20% compared to monthly. That\'s $278/year for Pro (instead of $348) and $950/year for Business (instead of $1,188).',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards (Visa, Mastercard, Amex) via Stripe. For Business and Enterprise plans, we also support invoicing and bank transfers.',
  },
  {
    q: 'Can I self-host HookSniff?',
    a: 'Yes! HookSniff is open-source. You can self-host with Docker or deploy to your own infrastructure. Self-hosted instances get community support. Paid plans add priority support for self-hosted.',
  },
  {
    q: 'What SDKs do you support?',
    a: 'We support 11 SDKs: Node.js, Python, Rust, C#, Go, Swift, PHP, Elixir, Java, Kotlin, and Ruby. All SDKs are open-source and available on their respective package managers.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. All data is encrypted in transit (TLS 1.3) and at rest. We use HMAC-SHA256 for webhook signatures, Argon2 for password hashing, and support 2FA/TOTP. Business plans add SSO/SAML and IP whitelisting.',
  },
  {
    q: 'Do you comply with GDPR?',
    a: 'Yes. We are GDPR compliant. We process data in EU regions (eu-central-1), support data export/deletion requests, and have a published privacy policy and DPA available on request.',
  },
  {
    q: 'What\'s your uptime SLA?',
    a: 'Free and Pro plans have a 99.9% uptime target (best effort). Business plans include a 99.9% uptime SLA with credits if we miss it. Enterprise plans can negotiate custom SLAs up to 99.999%.',
  },
  {
    q: 'How does HookSniff compare to Svix?',
    a: 'HookSniff offers similar features at 10x lower cost. Svix starts at $490/month for Professional; HookSniff Pro is $29/month. We also support more SDKs (11 vs 6), FIFO delivery, and CloudEvents. See our full comparison page.',
  },
  {
    q: 'Can I export my data?',
    a: 'Yes. You can export all your webhook logs, endpoint configurations, and delivery history as JSON or CSV from the dashboard. Business plans also get API access for automated exports.',
  },
];

const testimonials = [
  {
    quote: "We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time and $2K/month in infrastructure costs.",
    author: 'CTO',
    company: 'SaaS Startup',
    avatar: 'CS',
  },
  {
    quote: "The FIFO delivery feature is a game-changer for our order processing pipeline. Events arrive in order, every time.",
    author: 'Lead Developer',
    company: 'E-commerce Platform',
    avatar: 'LD',
  },
  {
    quote: "Free tier that actually works for startups. We process 8K webhooks/month without paying a cent. Svix wanted $490.",
    author: 'Solo Founder',
    company: 'Indie Hacker',
    avatar: 'SF',
  },
];

/* ─── ROI Calculator ─── */

function RoiCalculator() {
  const [events, setEvents] = useState(10000);

  // Cost comparison
  const svixCost = events <= 0 ? 0 : 490; // Svix Pro starts at $490
  const hookdeckCost = events <= 10000 ? 0 : 39 + Math.max(0, Math.ceil((events - 10000) / 100000)) * 1;
  const hooksniffCost = events <= 10000 ? 0 : events <= 50000 ? 29 : 99;
  const savingsVsSvix = svixCost - hooksniffCost;
  const savingsPercent = svixCost > 0 ? Math.round((savingsVsSvix / svixCost) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6 md:p-8">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">💰 ROI Calculator</h3>
      <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">See how much you save with HookSniff vs competitors.</p>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
          Monthly webhooks: <span className="text-brand-600 dark:text-brand-400 font-bold">{events.toLocaleString()}</span>
        </label>
        <input
          type="range"
          min={0}
          max={100000}
          step={1000}
          value={events}
          onChange={(e) => setEvents(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-600"
        />
        <div className="flex justify-between text-xs text-gray-400 dark:text-slate-600 mt-1">
          <span>0</span>
          <span>50K</span>
          <span>100K</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
          <p className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Svix</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">${svixCost}</p>
          <p className="text-xs text-red-500 dark:text-red-500">/month</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
          <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Hookdeck</p>
          <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">${hookdeckCost}</p>
          <p className="text-xs text-amber-500 dark:text-amber-500">/month</p>
        </div>
        <div className="text-center p-4 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-400 dark:border-emerald-500/40">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">🪝 HookSniff</p>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">${hooksniffCost}</p>
          <p className="text-xs text-emerald-500 dark:text-emerald-500">/month</p>
        </div>
      </div>

      {savingsVsSvix > 0 && (
        <div className="text-center p-4 rounded-lg bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/20">
          <p className="text-sm text-gray-600 dark:text-slate-400">
            You save <span className="text-brand-700 dark:text-brand-400 font-bold text-lg">${savingsVsSvix}/mo</span> vs Svix
            <span className="text-brand-600 dark:text-brand-400 font-bold"> ({savingsPercent}% less)</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
            That&apos;s <span className="font-semibold">${(savingsVsSvix * 12).toLocaleString()}/year</span> back in your pocket.
          </p>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */

export default function PricingPage() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600 dark:text-slate-400">Pricing</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium rounded-full mb-4">
            10x cheaper than Svix
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Pricing that grows with you
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-2">
            Save 12+ months of webhook infrastructure development. Start free, scale when ready.
          </p>
          <p className="text-sm text-gray-500 dark:text-slate-500">
            No credit card required. No surprise charges. Cancel anytime.
          </p>
        </div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative bg-white dark:bg-slate-900 rounded-xl border p-6 transition-all hover:shadow-lg ${
                plan.popular
                  ? 'border-brand-400 dark:border-brand-500 shadow-brand-100 dark:shadow-brand-500/10 ring-1 ring-brand-400 dark:ring-brand-500'
                  : 'border-gray-200 dark:border-slate-800'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-600 text-white text-xs font-medium rounded-full">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
              <div className="mt-2 mb-1">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{plan.price}</span>
                <span className="text-gray-500 dark:text-slate-500">{plan.period}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-6">{plan.desc}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.name === 'Business' ? '/contact' : '/login'}
                className={`block w-full text-center py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  plan.ctaStyle === 'filled'
                    ? 'bg-brand-600 hover:bg-brand-700 text-white'
                    : 'border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:border-brand-400 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* "Only pay for what you use" */}
        <div className="text-center mb-16 p-6 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
          <p className="text-lg font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
            Only pay for what you actually send
          </p>
          <p className="text-sm text-emerald-700 dark:text-emerald-400">
            Retries are free. Filtered messages are free. Failed deliveries that we retry 5 times still count as 1 webhook.
            We absorb the cost because reliable delivery is our promise.
          </p>
        </div>

        {/* ROI Calculator */}
        <div className="mb-16">
          <RoiCalculator />
        </div>

        {/* Comparison Table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Compare all features</h2>
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-800">
                    <th className="text-left py-4 px-6 font-semibold text-gray-900 dark:text-white w-2/5">Feature</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Free</th>
                    <th className="text-center py-4 px-4 font-semibold text-brand-600 dark:text-brand-400 bg-brand-50/50 dark:bg-brand-500/5">Pro</th>
                    <th className="text-center py-4 px-4 font-semibold text-gray-900 dark:text-white">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map((section) => (
                    <React.Fragment key={section.category}>
                      <tr className="bg-gray-50 dark:bg-slate-800/50">
                        <td colSpan={4} className="py-2 px-6 text-xs font-bold text-gray-500 dark:text-slate-500 uppercase tracking-wider">
                          {section.category}
                        </td>
                      </tr>
                      {section.items.map((item) => (
                        <tr key={item.feature} className="border-b border-gray-100 dark:border-slate-800/50 last:border-0">
                          <td className="py-3 px-6 text-gray-700 dark:text-slate-300">{item.feature}</td>
                          <td className="py-3 px-4 text-center text-gray-600 dark:text-slate-400">{item.free}</td>
                          <td className="py-3 px-4 text-center text-gray-900 dark:text-white bg-brand-50/30 dark:bg-brand-500/5 font-medium">{item.pro}</td>
                          <td className="py-3 px-4 text-center text-gray-900 dark:text-white">{item.business}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security & Compliance */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Security & Compliance</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { icon: '🔒', title: 'TLS 1.3', desc: 'All data encrypted in transit' },
              { icon: '🛡️', title: 'SOC 2 Ready', desc: 'Security controls in place' },
              { icon: '🇪🇺', title: 'GDPR Compliant', desc: 'EU data processing (eu-central-1)' },
              { icon: '🔑', title: 'HMAC-SHA256', desc: 'Every webhook signature verified' },
              { icon: '🔐', title: '2FA / TOTP', desc: 'Two-factor authentication' },
              { icon: '📋', title: 'Audit Logs', desc: 'Track every action' },
              { icon: '🌐', title: 'SSO / SAML', desc: 'Enterprise single sign-on' },
              { icon: '📍', title: 'IP Whitelisting', desc: 'Restrict by IP/CIDR' },
            ].map((item) => (
              <div key={item.title} className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 text-center">
                <span className="text-2xl">{item.icon}</span>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mt-2">{item.title}</h4>
                <p className="text-xs text-gray-600 dark:text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Support Levels */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Support levels</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                plan: 'Free',
                level: 'Community',
                features: ['GitHub Issues', 'Community Discord', 'Documentation', 'Stack Overflow'],
                response: 'Best effort',
              },
              {
                plan: 'Pro',
                level: 'Priority',
                features: ['Email support', '48h response time', 'Bug fix priority', 'Feature requests'],
                response: '< 48 hours',
                highlight: true,
              },
              {
                plan: 'Business',
                level: 'Dedicated',
                features: ['Dedicated account manager', 'Slack Connect channel', '24h response time', 'Custom integrations', 'Onboarding call'],
                response: '< 24 hours',
              },
            ].map((s) => (
              <div
                key={s.plan}
                className={`bg-white dark:bg-slate-900 rounded-xl border p-6 ${
                  s.highlight ? 'border-brand-400 dark:border-brand-500 ring-1 ring-brand-400 dark:ring-brand-500' : 'border-gray-200 dark:border-slate-800'
                }`}
              >
                <p className="text-xs font-medium text-gray-500 dark:text-slate-500 uppercase tracking-wider">{s.plan}</p>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">{s.level}</h3>
                <p className="text-sm text-brand-600 dark:text-brand-400 font-medium mb-4">Response: {s.response}</p>
                <ul className="space-y-2">
                  {s.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                      <svg className="w-4 h-4 text-emerald-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">What users say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 p-6">
                <svg className="w-8 h-8 text-brand-200 dark:text-brand-800 mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{t.quote}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{t.author}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Build vs Buy */}
        <div className="mb-16 p-6 md:p-8 bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">Build vs Buy</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4">❌ Building your own</h3>
              <ul className="space-y-3">
                {[
                  '3-6 months of engineering time',
                  '$50K-150K in developer costs',
                  'Ongoing maintenance burden',
                  'No SLA or uptime guarantee',
                  'Security vulnerabilities',
                  'No SDK ecosystem',
                  'Retry logic is hard to get right',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                    <span className="text-red-500 mt-0.5">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400 mb-4">✅ Using HookSniff</h3>
              <ul className="space-y-3">
                {[
                  'Up and running in 5 minutes',
                  'Starts at $0/month',
                  'Zero maintenance',
                  '99.9% SLA (Business)',
                  'HMAC, TLS, 2FA built-in',
                  '11 SDKs across all languages',
                  'Battle-tested retry engine',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Startup Discount */}
        <div className="mb-16 text-center p-8 bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">🚀 Early stage startup?</h2>
          <p className="text-gray-600 dark:text-slate-400 max-w-xl mx-auto mb-4">
            We have special startup plans to help you grow. Pre-Series A startups get extended free tiers and significant discounts on paid plans.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Apply for startup discount →
          </Link>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">Frequently asked questions</h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-4 text-left"
                >
                  <span className="font-medium text-gray-900 dark:text-white text-sm pr-4">{faq.q}</span>
                  <svg
                    className={`w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4">
                    <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to get started?</h2>
          <p className="text-gray-400 dark:text-slate-400 mb-6">Join thousands of developers who trust HookSniff for webhook delivery.</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Start for free →
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors"
            >
              Contact sales
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
