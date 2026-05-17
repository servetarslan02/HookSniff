'use client';
import { useTranslations } from 'next-intl';

import { useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

const tlDr = [
  'HookSniff is 20x cheaper than Svix ($24/mo vs $490/mo) with more features.',
  'Both have 11 SDKs. HookSniff adds FIFO delivery, CloudEvents, and schema registry — Svix doesn\'t.',
  'Svix leads in compliance (SOC 2 Type 2, HIPAA, PCI-DSS) and enterprise trust (30+ Fortune 500 logos).',
  'Hookdeck has the best routing and 99.999% SLA, but is closed-source and usage-based.',
  'Hook0 is the simplest self-hosted option but has only 4 SDKs and no compliance.',
];

const sections = [
  {
    title: 'Production Track Record',
    description: 'How battle-tested is the platform in production?',
    hooksniff: { text: 'Open-source since 2025. Growing community of startups and indie developers. 1,378 tests, production-ready codebase.', badge: 'Growing' },
    svix: { text: 'Delivers billions of webhooks for fast-growing startups and Fortune 500. YC/a16z backed. 4.5M SDK downloads/week.', badge: 'Leader' },
    hookdeck: { text: 'Processing billions of events/week. SOC 2 Type 2 certified. Used by thousands of developers worldwide.', badge: 'Established' },
    hook0: { text: 'Independent European company. Bootstrapped, no VC. Smaller but dedicated community.', badge: 'Niche' },
    winner: 'svix',
    bestFit: 'Svix for enterprise trust, HookSniff for cost-conscious startups.',
  },
  {
    title: 'Uptime SLA',
    description: 'Contractually guaranteed uptime.',
    hooksniff: { text: '99.9% uptime SLA. Upgrading to 99.99% with multi-region deployment.', badge: '99.9%' },
    svix: { text: 'Up to 99.999% depending on tier. Measured 99.99999% historical uptime.', badge: '99.999%' },
    hookdeck: { text: 'Up to 99.999% depending on tier. 99.999% measured uptime.', badge: '99.999%' },
    hook0: { text: 'No SLA. Self-hosted — uptime depends on your infrastructure.', badge: 'N/A' },
    winner: 'svix',
    bestFit: 'Svix and Hookdeck for mission-critical. HookSniff for growing teams.',
  },
  {
    title: 'Pricing',
    description: 'Total cost of ownership at different scales.',
    hooksniff: { text: 'Pro: $24/mo. 10,000 free events/mo. $0.50 per 100K events. 20% annual discount. All features included.', badge: '$24/mo' },
    svix: { text: 'Professional: $490/mo. Unlimited free tier. Custom per-event pricing. Enterprise: custom.', badge: '$490/mo' },
    hookdeck: { text: 'Developer: $0 (10K events). Team: $39/mo + usage. Growth: $499/mo. $1.00 per 100K events.', badge: '$39/mo+' },
    hook0: { text: 'Self-hosted: free. Cloud: €99/mo. No per-event pricing on self-hosted.', badge: 'Free' },
    winner: 'hooksniff',
    bestFit: 'HookSniff for best value. Hook0 for zero budget.',
  },
  {
    title: 'SDKs & Language Support',
    description: 'Officially supported client libraries.',
    hooksniff: { text: '11 SDKs: Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift. Plus CLI tool.', badge: '11 SDKs' },
    svix: { text: '11 SDKs: TypeScript, Python, Go, Java, Kotlin, Ruby, Rust, PHP, C#, CLI. Plus signature verification libs.', badge: '11 SDKs' },
    hookdeck: { text: '8 SDKs: TypeScript, Python, Go, Java, Ruby, PHP, C#, Rust. Plus CLI tool.', badge: '8 SDKs' },
    hook0: { text: '4 SDKs: JavaScript, Python, Go, PHP. Smaller ecosystem.', badge: '4 SDKs' },
    winner: 'tie',
    bestFit: 'HookSniff and Svix tied. Both cover every major language.',
  },
  {
    title: 'FIFO Ordered Delivery',
    description: 'Guarantee events are delivered in exact order. Critical for sequential operations like payment flows and state machines.',
    hooksniff: { text: '✅ Full FIFO support with sequence numbers. Per-endpoint ordering guarantees.', badge: '✅' },
    svix: { text: '❌ Not supported. Events may arrive out of order.', badge: '❌' },
    hookdeck: { text: '❌ Not supported. Events may arrive out of order.', badge: '❌' },
    hook0: { text: '❌ Not supported.', badge: '❌' },
    winner: 'hooksniff',
    bestFit: 'HookSniff — only service with FIFO support.',
  },
  {
    title: 'CloudEvents v1.0',
    description: 'CNCF standard event format. Provides a common envelope for event data across different systems.',
    hooksniff: { text: '✅ Full CloudEvents v1.0 support. Required attributes (specversion, type, source, id) validated.', badge: '✅' },
    svix: { text: '❌ Not supported. Uses proprietary event format.', badge: '❌' },
    hookdeck: { text: '❌ Not supported.', badge: '❌' },
    hook0: { text: '❌ Not supported.', badge: '❌' },
    winner: 'hooksniff',
    bestFit: 'HookSniff — only service with CloudEvents support.',
  },
  {
    title: 'Schema Registry',
    description: 'Define, validate, and version webhook payloads with JSON Schema. Catch breaking changes before they ship.',
    hooksniff: { text: '✅ Full schema registry with versioning, validation, and breaking change detection.', badge: '✅' },
    svix: { text: '❌ No schema registry. Payloads are unvalidated.', badge: '❌' },
    hookdeck: { text: '❌ No schema registry.', badge: '❌' },
    hook0: { text: '❌ No schema registry.', badge: '❌' },
    winner: 'hooksniff',
    bestFit: 'HookSniff — only service with schema registry.',
  },
  {
    title: 'Embeddable Consumer Portal',
    description: 'White-label UI for your customers to manage webhook subscriptions, view logs, and replay events.',
    hooksniff: { text: '✅ Full embeddable portal. Endpoint management, log viewer, replay, secret rotation.', badge: '✅' },
    svix: { text: '✅ Best-in-class. Fully themable, React library, one line of code. Custom UI via SDKs.', badge: '✅ Best' },
    hookdeck: { text: '❌ No embeddable portal. Dashboard-only.', badge: '❌' },
    hook0: { text: '❌ Basic UI only.', badge: '❌' },
    winner: 'svix',
    bestFit: 'Svix for best portal. HookSniff for solid alternative.',
  },
  {
    title: 'Smart Routing',
    description: 'Route webhooks to different endpoints based on strategy: round-robin, latency-based, or failover.',
    hooksniff: { text: '✅ Round-robin, latency-based, and failover routing with fallback URLs.', badge: '✅' },
    svix: { text: '❌ No smart routing. Single endpoint per webhook.', badge: '❌' },
    hookdeck: { text: '✅ Advanced routing with filtering, transformation, and fan-out.', badge: '✅ Best' },
    hook0: { text: '❌ No smart routing.', badge: '❌' },
    winner: 'hookdeck',
    bestFit: 'Hookdeck for advanced routing. HookSniff for basic needs.',
  },
  {
    title: 'Payload Transformations',
    description: 'Modify webhook payloads before delivery. Filter fields, reshape data, adapt to consumer formats.',
    hooksniff: { text: '✅ Template-based transformations with filtering.', badge: '✅' },
    svix: { text: '✅ JavaScript-based payload transformations and delivery control.', badge: '✅' },
    hookdeck: { text: '✅ Custom functions for payload modification.', badge: '✅' },
    hook0: { text: '❌ Not supported.', badge: '❌' },
    winner: 'svix',
    bestFit: 'Svix for JS-based transforms. HookSniff for templates.',
  },
  {
    title: 'Inbound Webhook Proxy',
    description: 'Receive webhooks from third-party providers (Stripe, GitHub, Shopify) and forward them to your app.',
    hooksniff: { text: '✅ Supports Stripe, GitHub, Shopify, and Generic. Auto-verifies HMAC signatures.', badge: '✅' },
    svix: { text: '✅ Svix Ingest — dedicated product for receiving webhooks.', badge: '✅' },
    hookdeck: { text: '✅ Core strength — Event Gateway for inbound webhooks.', badge: '✅ Best' },
    hook0: { text: '❌ Not supported.', badge: '❌' },
    winner: 'hookdeck',
    bestFit: 'Hookdeck for core strength. HookSniff and Svix for basic needs.',
  },
  {
    title: 'Real-Time Streaming',
    description: 'Live delivery stream for monitoring and debugging.',
    hooksniff: { text: '✅ Server-Sent Events (SSE) for real-time delivery stream.', badge: '✅' },
    svix: { text: '✅ Svix Stream — dedicated data streaming product. Goes beyond webhooks.', badge: '✅ Best' },
    hookdeck: { text: '❌ No real-time streaming.', badge: '❌' },
    hook0: { text: '❌ No real-time streaming.', badge: '❌' },
    winner: 'svix',
    bestFit: 'Svix for dedicated streaming product. HookSniff for SSE.',
  },
  {
    title: 'Rate Limiting',
    description: 'Protect consumer endpoints from being overwhelmed. Per-endpoint throttling.',
    hooksniff: { text: '✅ Token bucket and sliding window algorithms. Per-endpoint configuration.', badge: '✅' },
    svix: { text: '✅ Per-tier limits: 50/s (Free), 400/s (Pro), Custom (Enterprise).', badge: '✅' },
    hookdeck: { text: '✅ Throughput management with backpressure.', badge: '✅' },
    hook0: { text: '❌ Not supported.', badge: '❌' },
    winner: 'hooksniff',
    bestFit: 'HookSniff for per-endpoint control. Svix for tier-based.',
  },
  {
    title: 'Latency Alerts',
    description: 'Get notified when webhook delivery latency exceeds thresholds.',
    hooksniff: { text: '✅ Alerts API with latency, failure rate, and consecutive failure conditions.', badge: '✅' },
    svix: { text: '❌ No dedicated latency alerts.', badge: '❌' },
    hookdeck: { text: '✅ Radar — dedicated latency alerting for third-party webhooks.', badge: '✅ Best' },
    hook0: { text: '❌ Not supported.', badge: '❌' },
    winner: 'hookdeck',
    bestFit: 'Hookdeck for Radar. HookSniff for alerts API.',
  },
  {
    title: 'Standard Webhooks',
    description: 'Compatibility with the open Standard Webhooks specification for signing and verification.',
    hooksniff: { text: '✅ Fully compatible. Uses HMAC-SHA256 with whsec_ secrets.', badge: '✅' },
    svix: { text: '✅ Authored the spec with Twilio, Kong, Mux, Supabase, ngrok, Lob. Adopted by OpenAI, Brex.', badge: '✅ Author' },
    hookdeck: { text: '⚠️ Custom signature schemes only. No Standard Webhooks.', badge: '⚠️' },
    hook0: { text: '✅ Compatible with Standard Webhooks.', badge: '✅' },
    winner: 'svix',
    bestFit: 'Svix as spec author. HookSniff and Hook0 as adopters.',
  },
  {
    title: 'Compliance & Security',
    description: 'Regulatory and security certifications.',
    hooksniff: { text: 'SOC 2 ready (audit in progress). GDPR compliant (EU hosting). SSRF protection. Constant-time HMAC. Argon2id. 2FA.', badge: 'SOC 2 Ready' },
    svix: { text: 'SOC 2 Type II. HIPAA. PCI-DSS. PIPEDA. GDPR. CCPA. Static source IPs. Mature Rust codebase.', badge: 'Full' },
    hookdeck: { text: 'SOC 2 Type II. PIPEDA. GDPR. CCPA. SSO/SAML on Growth+. IP whitelisting (add-on).', badge: 'SOC 2' },
    hook0: { text: 'GDPR compliant (EU hosting). No SOC 2. No HIPAA.', badge: 'GDPR' },
    winner: 'svix',
    bestFit: 'Svix for full compliance. HookSniff for startups.',
  },
  {
    title: 'Data Residency',
    description: 'Where customer data can be hosted.',
    hooksniff: { text: 'EU (Frankfurt). Single region.', badge: 'EU' },
    svix: { text: 'EU, US, Australia, Canada, India, and custom private regions.', badge: '6+ regions' },
    hookdeck: { text: 'US, EU, and Asia.', badge: '3 regions' },
    hook0: { text: 'Your choice — self-hosted anywhere. Cloud: Europe.', badge: 'Any' },
    winner: 'svix',
    bestFit: 'Svix for 6+ regions. Hook0 for self-hosted anywhere.',
  },
  {
    title: 'Open Source & Self-Hosted',
    description: 'Can you run it on your own infrastructure?',
    hooksniff: { text: '✅ MIT license. Docker deployment. Full feature parity with cloud.', badge: '✅ MIT' },
    svix: { text: '✅ MIT license. Docker/K8s. Enterprise on-prem available.', badge: '✅ MIT' },
    hookdeck: { text: '❌ Closed-source. Cloud-only.', badge: '❌' },
    hook0: { text: '✅ Open-source. Self-hosted or cloud.', badge: '✅' },
    winner: 'hooksniff',
    bestFit: 'All except Hookdeck. HookSniff for MIT + full features.',
  },
  {
    title: 'Developer Experience',
    description: 'CLI, Terraform, MCP, i18n, documentation quality.',
    hooksniff: { text: 'CLI tool. MCP support. 8-language i18n dashboard. OpenAPI spec. 1,378 tests.', badge: 'Strong' },
    svix: { text: 'CLI tool. Terraform provider. Swagger API docs. 6 industry use-case pages.', badge: 'Best' },
    hookdeck: { text: 'CLI tool. Terraform provider. MCP support. Console. Radar.', badge: 'Strong' },
    hook0: { text: 'MCP Server. Basic docs. Smaller ecosystem.', badge: 'Basic' },
    winner: 'svix',
    bestFit: 'Svix for best DX. HookSniff for i18n + MCP.',
  },
  {
    title: 'Business Continuity',
    description: 'Will the vendor be there long-term?',
    hooksniff: { text: 'Open-source (MIT). Self-hostable. No vendor lock-in. Growing community.', badge: 'Low risk' },
    svix: { text: 'YC/a16z backed. Powers Fortune 500 webhooks. Years of production history.', badge: 'Very low' },
    hookdeck: { text: 'VC-backed. Established customer base. SOC 2 certified.', badge: 'Low' },
    hook0: { text: 'Bootstrapped, no VC. "100% bootstrapped, we are here to stay."', badge: 'Low' },
    winner: 'svix',
    bestFit: 'Svix for VC backing. HookSniff and Hook0 for no lock-in.',
  },
];

const faq = [
  { q: 'Is HookSniff really cheaper than Svix?', a: 'Yes. HookSniff Pro is $24/mo vs Svix Professional at $490/mo. That\'s $5,592/year saved. HookSniff even offers a free tier with 10,000 events/month.' },
  { q: 'Why is HookSniff SOC 2 "Ready" but not "Type 2"?', a: 'SOC 2 Type 2 requires a 3–12 month audit period. HookSniff has implemented all required controls and is undergoing the audit. We expect Type 2 certification soon.' },
  { q: 'Can I self-host HookSniff?', a: 'Yes. HookSniff is open-source (MIT license) and supports Docker deployment. You can run the entire stack on your own infrastructure.' },
  { q: 'Which webhook service has the most SDKs?', a: 'HookSniff and Svix both have 11 SDKs. Hookdeck has 8, Hook0 has 4.' },
  { q: 'What is FIFO delivery and why does it matter?', a: 'FIFO (First In, First Out) guarantees events are delivered in order. Critical for sequential operations like order status updates, payment flows, and state machines. Only HookSniff offers this.' },
  { q: 'Is HookSniff production-ready?', a: 'Yes. 1,378 tests, OpenTelemetry observability, SSRF protection, HMAC signing, GDPR compliance, and it runs on Google Cloud Run with Neon PostgreSQL.' },
  { q: 'Can I migrate from Svix to HookSniff?', a: 'Yes. HookSniff uses the Standard Webhooks spec (same as Svix), so migration is straightforward. Your existing HMAC verification code will work as-is.' },
  { q: 'Does HookSniff support HIPAA?', a: 'Not yet. HIPAA compliance requires a BAA and external audit. It\'s on our roadmap. Svix currently supports HIPAA.' },
];

const scorecard = [
  { category: 'Features', hooksniff: 9, svix: 8, hookdeck: 8, hook0: 5 },
  { category: 'Pricing', hooksniff: 10, svix: 4, hookdeck: 7, hook0: 10 },
  { category: 'Compliance', hooksniff: 6, svix: 10, hookdeck: 8, hook0: 3 },
  { category: 'DX', hooksniff: 8, svix: 9, hookdeck: 8, hook0: 5 },
  { category: 'Reliability', hooksniff: 7, svix: 10, hookdeck: 10, hook0: 5 },
  { category: 'Open Source', hooksniff: 10, svix: 10, hookdeck: 0, hook0: 10 },
];

function Badge({ text, variant }: { text: string; variant: 'green' | 'red' | 'yellow' | 'gray' | 'blue' }) {
  const colors = {
    green: 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400',
    yellow: 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400',
    gray: 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400',
    blue: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400',
  };
  return <span className={`inline-block px-2 py-0.5 text-xs rounded-full font-medium ${colors[variant]}`}>{text}</span>;
}

function getBadgeVariant(winner: string, name: string): 'green' | 'red' | 'yellow' | 'gray' | 'blue' {
  if (winner === name) return 'green';
  if (winner === 'tie') return 'blue';
  return 'gray';
}

export default function CompareContent() {
  const t = useTranslations('compare');
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            HookSniff vs Svix vs Hookdeck vs Hook0
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-3xl mx-auto">
            A comprehensive, honest comparison of the top webhook services in 2026. Updated May 2026.
          </p>
        </div>

        {/* TL;DR */}
        <div className="mb-16 p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">TL;DR</h2>
          <ul className="space-y-2">
            {tlDr.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                <svg className="w-4 h-4 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Screenshots */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("inAction")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <Image src="/screenshots/compare-hero.jpg" alt="HookSniff Compare — side-by-side webhook service comparison" width={800} height={450} className="w-full" />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t("comparePage")}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-500">20 detailed sections with honest, side-by-side comparison.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <Image src="/screenshots/scorecard.jpg" alt="HookSniff Scorecard — feature comparison across 6 categories" width={800} height={450} className="w-full" />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t("scorecard")}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-500">6 categories scored honestly. Svix: 51, HookSniff: 50.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <Image src="/screenshots/playground.png" alt="HookSniff Playground — test webhooks in real-time" width={800} height={450} className="w-full" />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t("playground")}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-500">Generate URLs, send webhooks, inspect payloads in real-time.</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
              <Image src="/screenshots/build-vs-buy.png" alt="HookSniff Build vs Buy — 12 dimension webhook infrastructure comparison" width={800} height={450} className="w-full" />
              <div className="p-4">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm">{t("buildVsBuy")}</h3>
                <p className="text-xs text-gray-500 dark:text-slate-500">12 dimensions: cost, time, security, reliability, and more.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scorecard */}
        <div className="mb-16 p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t("scorecard")}</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left py-2 px-4 font-semibold text-gray-900 dark:text-white">{t("category")}</th>
                  <th className="text-center py-2 px-4 font-semibold text-brand-600 dark:text-brand-400">🪝 HookSniff</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-900 dark:text-white">📨 Svix</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-900 dark:text-white">🔗 Hookdeck</th>
                  <th className="text-center py-2 px-4 font-semibold text-gray-900 dark:text-white">🪝 Hook0</th>
                </tr>
              </thead>
              <tbody>
                {scorecard.map((row) => (
                  <tr key={row.category} className="border-b border-gray-100 dark:border-slate-700/50 last:border-0">
                    <td className="py-2 px-4 text-gray-700 dark:text-slate-300 font-medium">{row.category}</td>
                    <td className="py-2 px-4 text-center font-bold text-gray-900 dark:text-white bg-brand-50/20 dark:bg-brand-500/5">{row.hooksniff}/10</td>
                    <td className="py-2 px-4 text-center text-gray-600 dark:text-slate-400">{row.svix}/10</td>
                    <td className="py-2 px-4 text-center text-gray-600 dark:text-slate-400">{row.hookdeck}/10</td>
                    <td className="py-2 px-4 text-center text-gray-600 dark:text-slate-400">{row.hook0}/10</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-gray-300 dark:border-slate-700">
                  <td className="py-2 px-4 text-gray-900 dark:text-white font-bold">{t("total")}</td>
                  <td className="py-2 px-4 text-center font-bold text-brand-600 dark:text-brand-400 bg-brand-50/20 dark:bg-brand-500/5">{scorecard.reduce((s, r) => s + r.hooksniff, 0)}</td>
                  <td className="py-2 px-4 text-center font-bold text-gray-900 dark:text-white">{scorecard.reduce((s, r) => s + r.svix, 0)}</td>
                  <td className="py-2 px-4 text-center font-bold text-gray-900 dark:text-white">{scorecard.reduce((s, r) => s + r.hookdeck, 0)}</td>
                  <td className="py-2 px-4 text-center font-bold text-gray-900 dark:text-white">{scorecard.reduce((s, r) => s + r.hook0, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Trust Statement */}
        <div className="mb-16">
          <p className="text-center text-sm text-gray-500 dark:text-slate-500">{t('trustedBy')}</p>
        </div>

        {/* Detailed Sections */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("detailedComparison")}</h2>
          <div className="space-y-6">
            {sections.map((section, idx) => (
              <div key={section.title} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 flex items-center justify-center rounded-full bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold">{idx + 1}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{section.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-slate-500">{section.description}</p>
                      {section.bestFit && <p className="text-xs text-brand-600 dark:text-brand-400 mt-1 font-medium">Best fit: {section.bestFit}</p>}
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100 dark:divide-slate-800">
                  {(['hooksniff', 'svix', 'hookdeck', 'hook0'] as const).map((name) => {
                    const data = section[name];
                    const isWinner = section.winner === name;
                    const labels: Record<string, string> = { hooksniff: '🪝 HookSniff', svix: '📨 Svix', hookdeck: '🔗 Hookdeck', hook0: '🪝 Hook0' };
                    return (
                      <div key={name} className={`p-4 ${isWinner ? 'bg-brand-50/30 dark:bg-brand-500/5' : ''}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 dark:text-slate-500">{labels[name]}</span>
                          <Badge text={data.badge} variant={getBadgeVariant(section.winner, name)} />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-slate-400">{data.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* When to choose what */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">When to choose what?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { when: 'Choose HookSniff if...', items: ['You want the best price/feature ratio ($24/mo)', 'You need FIFO ordered delivery', 'You want CloudEvents standard support', 'You\'re a startup watching costs', 'You want self-hosted + managed options', 'You need a schema registry'] },
              { when: 'Choose Svix if...', items: ['You need SOC 2 Type 2, HIPAA, or PCI-DSS', 'You\'re a Fortune 500 company', 'You need 99.999% SLA guarantees', 'You want data streaming (Svix Stream)', 'You need 6+ data residency regions', 'You want the most mature ecosystem'] },
              { when: 'Choose Hookdeck if...', items: ['You need complex event routing rules', 'You need 99.999% uptime SLA', 'You want webhook latency alerts (Radar)', 'You need advanced inbound webhook handling', 'You want a fully managed solution'] },
              { when: 'Choose Hook0 if...', items: ['You want 100% self-hosted control', 'You need European data sovereignty', 'Budget is the #1 priority', 'You want a bootstrapped, no-VC company'] },
            ].map((section) => (
              <div key={section.when} className="p-6 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">{section.when}</h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
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
                  <svg className={`w-5 h-5 text-gray-500 dark:text-slate-500 shrink-0 transition-transform ${expandedFaq === i ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                {expandedFaq === i && (
                  <div className="px-6 pb-4"><p className="text-sm text-gray-600 dark:text-slate-400">{item.a}</p></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Deep Dive Links */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">{t("deepDive")}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'HookSniff vs Svix', desc: 'Detailed 1:1 comparison', href: '/alternatives/svix' },
              { title: 'HookSniff vs Hookdeck', desc: 'Open-source vs closed-source', href: '/alternatives/hookdeck' },
              { title: 'HookSniff vs Hook0', desc: 'Feature-rich vs minimal', href: '/alternatives/hook0' },
              { title: 'Svix Alternatives', desc: 'All Svix alternatives ranked', href: '/alternatives/svix-alternatives' },
              { title: 'Hookdeck Alternatives', desc: 'All Hookdeck alternatives ranked', href: '/alternatives/hookdeck-alternatives' },
              { title: 'Build vs Buy', desc: 'Should you build your own?', href: '/build-vs-buy' },
            ].map((link) => (
              <Link key={link.title} href={link.href} className="group p-5 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mb-1">{link.title}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Ready to try HookSniff?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">Start free. Scale when ready. No credit card required.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/login" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors">Start for free →</Link>
            <Link href="/pricing" className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors">{t("viewPricing")}</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
