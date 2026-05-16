'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

/* ─── Data ─── */

type UseCase = {
  id: string;
  icon: string;
  title: string;
  tagline: string;
  description: string;
  painPoints: string[];
  solutions: string[];
  events: { name: string; desc: string }[];
  codeExample: { lang: string; label: string; code: string };
  metrics: { label: string; value: string }[];
  testimonial?: { quote: string; author: string; company: string };
};

const useCases: UseCase[] = [
  {
    id: 'saas',
    icon: '☁️',
    title: 'SaaS Platforms',
    tagline: 'Power your integrations with reliable webhooks',
    description: 'Your customers expect real-time notifications when something happens in your app. HookSniff delivers their events reliably so you can focus on your core product.',
    painPoints: [
      'Building webhook infrastructure takes 3-6 months',
      'Customers complain about missed or duplicate events',
      'Retry logic is hard to get right at scale',
      'No visibility into delivery success rates',
    ],
    solutions: [
      'Up and running in 5 minutes, not months',
      'Automatic retries with exponential backoff — zero missed events',
      'Per-customer delivery logs and analytics',
      'Embeddable portal so customers manage their own webhooks',
    ],
    events: [
      { name: 'user.created', desc: 'New user signs up for your platform' },
      { name: 'subscription.renewed', desc: 'Monthly/annual subscription renews' },
      { name: 'invoice.paid', desc: 'Customer payment succeeds' },
      { name: 'feature.toggled', desc: 'Feature flag changed for a tenant' },
      { name: 'team.member_added', desc: 'New team member invited' },
    ],
    codeExample: {
      lang: 'javascript',
      label: 'Node.js',
      code: `import { HookSniff } from 'hooksniff-sdk';

const hs = new HookSniff({ apiKey: process.env.HOOKSNIFF_KEY });

// When a new user signs up
await hs.webhooks.send({
  event: 'user.created',
  payload: {
    id: user.id,
    email: user.email,
    plan: user.plan,
    created_at: user.createdAt,
  },
  url: customerWebhookUrl,
});`,
    },
    metrics: [
      { label: 'avgDeliveryLatency', value: '<200ms' },
      { label: 'deliverySuccessRate', value: '99.97%' },
      { label: 'SDKs available', value: '11' },
      { label: 'freeTierEvents', value: '1,000/mo' },
    ],
  },
  {
    id: 'ecommerce',
    icon: '🛒',
    title: 'E-Commerce',
    tagline: 'Never miss an order, payment, or inventory event',
    description: 'E-commerce runs on events — orders, payments, shipping, inventory. One missed webhook can mean a lost order, an angry customer, or an accounting discrepancy.',
    painPoints: [
      'Missed payment webhooks cause order fulfillment gaps',
      'Inventory sync fails silently, overselling products',
      'Order status updates arrive out of sequence',
      'Multiple systems need the same event (ERP, CRM, shipping)',
    ],
    solutions: [
      'FIFO ordered delivery — events arrive in sequence',
      'Multi-endpoint delivery — one event, many destinations',
      'Dead letter queue captures failures for manual review',
      'Schema validation ensures payload integrity',
    ],
    events: [
      { name: 'order.created', desc: 'Customer places a new order' },
      { name: 'payment.completed', desc: 'Payment processed successfully' },
      { name: 'payment.failed', desc: 'Payment attempt fails' },
      { name: 'shipment.dispatched', desc: 'Order shipped with tracking' },
      { name: 'inventory.low', desc: 'Stock below threshold' },
      { name: 'refund.processed', desc: 'Refund issued to customer' },
    ],
    codeExample: {
      lang: 'python',
      label: 'Python',
      code: `from hooksniff import HookSniff

hs = HookSniff(api_key=os.environ["HOOKSNIFF_KEY"])

# When an order is placed
hs.webhooks.send(
    event="order.created",
    payload={
        "order_id": order.id,
        "total": order.total,
        "currency": "USD",
        "items": order.line_items,
        "customer_id": order.customer_id,
    },
    url=erp_webhook_url,
)`,
    },
    metrics: [
      { label: 'eventsProcessedDay', value: '50K+' },
      { label: 'orderedDelivery', value: '✅' },
      { label: 'retryOnFailure', value: '5x / 24h' },
      { label: 'multiEndpoint', value: '✅' },
    ],
  },
  {
    id: 'fintech',
    icon: '💳',
    title: 'Fintech & Payments',
    tagline: 'Real-time financial event delivery with zero loss',
    description: 'In fintech, every event matters. A missed transaction webhook can mean regulatory non-compliance, reconciliation errors, or fraud going undetected.',
    painPoints: [
      'Regulatory requirements demand zero event loss',
      'Transaction webhooks must arrive in order for reconciliation',
      'Fraud alerts must be delivered in real-time, not minutes later',
      'Multiple downstream systems need the same events',
    ],
    solutions: [
      'FIFO delivery guarantees ordered transactions',
      'HMAC-SHA256 signatures prevent spoofed events',
      'Sub-200ms latency for real-time fraud alerts',
      'CloudEvents standard for cross-system compatibility',
    ],
    events: [
      { name: 'transaction.completed', desc: 'Payment processed and settled' },
      { name: 'transaction.reversed', desc: 'Chargeback or reversal initiated' },
      { name: 'fraud.alert', desc: 'Suspicious activity detected' },
      { name: 'kyc.verified', desc: 'Identity verification passed' },
      { name: 'payout.initiated', desc: 'Payout sent to merchant' },
      { name: 'account.frozen', desc: 'Account locked for investigation' },
    ],
    codeExample: {
      lang: 'typescript',
      label: 'TypeScript',
      code: `import { HookSniff } from 'hooksniff-sdk';

const hs = new HookSniff({ apiKey: process.env.HOOKSNIFF_KEY });

// Real-time fraud alert
await hs.webhooks.send({
  event: 'fraud.alert',
  payload: {
    transaction_id: txn.id,
    risk_score: 0.92,
    flags: ['velocity', 'geo_mismatch'],
    amount: txn.amount,
    merchant_id: txn.merchant_id,
  },
  url: complianceWebhookUrl,
});`,
    },
    metrics: [
      { label: 'deliveryGuarantee', value: 'Zero loss' },
      { label: 'signature', value: 'HMAC-SHA256' },
      { label: 'latencyP99', value: '<200ms' },
      { label: 'cloudevents', value: 'v1.0' },
    ],
  },
  {
    id: 'ai',
    icon: '🤖',
    title: 'AI & Agents',
    tagline: 'Event-driven AI agents with real-time webhooks',
    description: 'AI agents are autonomous — they need to react to events in real-time. Webhooks are the nervous system of the agent ecosystem, triggering actions when something changes.',
    painPoints: [
      'AI agents poll APIs instead of reacting to events',
      'MCP assumes synchronous request-response, but events are async',
      'Agent-to-agent communication needs reliable delivery',
      'No standard for AI event payloads',
    ],
    solutions: [
      'Webhooks trigger agents instantly — no polling needed',
      'MCP-ready webhook infrastructure bridges sync/async gap',
      'CloudEvents standard for AI event interoperability',
      'Schema registry ensures payload consistency across agents',
    ],
    events: [
      { name: 'agent.task_completed', desc: 'AI agent finishes a task' },
      { name: 'model.prediction', desc: 'ML model returns a prediction' },
      { name: 'data.pipeline_ready', desc: 'ETL pipeline completes' },
      { name: 'agent.alert', desc: 'Agent detects an anomaly' },
      { name: 'training.epoch_done', desc: 'Training epoch completes' },
    ],
    codeExample: {
      lang: 'python',
      label: 'Python',
      code: `from hooksniff import HookSniff

hs = HookSniff(api_key=os.environ["HOOKSNIFF_KEY"])

# When an AI agent completes a task
hs.webhooks.send(
    event="agent.task_completed",
    payload={
        "agent_id": "agent_abc123",
        "task_id": "task_xyz",
        "status": "success",
        "result": {"summary": "Analysis complete"},
        "tokens_used": 15420,
        "latency_ms": 3200,
    },
    url=orchestrator_webhook_url,
)`,
    },
    metrics: [
      { label: 'eventDriven', value: '✅' },
      { label: 'MCP compatible', value: '✅' },
      { label: 'cloudevents', value: 'v1.0' },
      { label: 'schemaRegistry', value: '✅' },
    ],
  },
  {
    id: 'devtools',
    icon: '🛠️',
    title: 'Developer Tools',
    tagline: 'Webhooks your developers will actually love',
    description: 'If you\'re building a developer platform — CI/CD, monitoring, analytics, or any API — your users need webhooks. But most webhook experiences are terrible.',
    painPoints: [
      'Developers spend hours debugging webhook failures',
      'No playground to test webhooks before going live',
      'Documentation is sparse, examples are missing',
      'SDK support is limited to 2-3 languages',
    ],
    solutions: [
      'Webhook playground — test payloads before going live',
      '11 SDKs covering every major language',
      'Per-delivery logs with request/response bodies',
      'Embeddable portal for your users to manage their webhooks',
    ],
    events: [
      { name: 'build.completed', desc: 'CI/CD build finishes' },
      { name: 'deploy.success', desc: 'Deployment succeeds' },
      { name: 'deploy.failed', desc: 'Deployment fails' },
      { name: 'alert.triggered', desc: 'Monitoring alert fires' },
      { name: 'incident.opened', desc: 'Incident created' },
    ],
    codeExample: {
      lang: 'go',
      label: 'Go',
      code: `package main

import (


    "os"
    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    hs := hooksniff.New(os.Getenv("HOOKSNIFF_KEY"))

    hs.Webhooks.Send(&hooksniff.WebhookRequest{
        Event:   "build.completed",
        Payload: map[string]interface{}{
            "build_id":  "build_123",
            "status":    "success",
            "duration":  45,
            "commit":    "abc123",
        },
        URL: userWebhookURL,
    })
}`,
    },
    metrics: [
      { label: 'SDKs', value: '11 languages' },
      { label: 'Playground', value: '✅' },
      { label: 'embeddablePortal', value: '✅' },
      { label: 'openSource', value: '✅' },
    ],
  },
  {
    id: 'healthcare',
    icon: '🏥',
    title: 'Healthcare',
    tagline: 'HIPAA-aware event delivery for healthcare systems',
    description: 'Healthcare systems need reliable, auditable event delivery. Appointment reminders, lab results, patient updates — every event must arrive, and every delivery must be logged.',
    painPoints: [
      'Missed appointment reminders cause no-shows',
      'Lab results must be delivered in real-time',
      'Audit trail required for compliance',
      'Data must stay in specific regions',
    ],
    solutions: [
      'Delivery logs provide complete audit trail',
      'EU data processing (eu-central-1) for GDPR',
      'Webhook signatures prevent tampered payloads',
      'Retry ensures no missed critical events',
    ],
    events: [
      { name: 'appointment.reminder', desc: 'Upcoming appointment notification' },
      { name: 'lab.result_ready', desc: 'Lab results available' },
      { name: 'prescription.filled', desc: 'Prescription ready for pickup' },
      { name: 'patient.discharged', desc: 'Patient discharged from facility' },
      { name: 'insurance.claim_updated', desc: 'Claim status changed' },
    ],
    codeExample: {
      lang: 'csharp',
      label: 'C#',
      code: `using HookSniff;

var hs = new HookSniffClient(Environment.GetEnvironmentVariable("HOOKSNIFF_KEY"));

// Notify when lab results are ready
await hs.Webhooks.SendAsync(new WebhookRequest
{
    Event = "lab.result_ready",
    Payload = new
    {
        patient_id = patient.Id,
        lab_id = lab.Id,
        result_type = "blood_panel",
        status = "completed",
        ready_at = DateTime.UtcNow,
    },
    Url = emrWebhookUrl,
});`,
    },
    metrics: [
      { label: 'auditTrail', value: 'Complete' },
      { label: 'Data region', value: 'EU (Frankfurt)' },
      { label: 'signature', value: 'HMAC-SHA256' },
      { label: 'GDPR', value: 'Compliant' },
    ],
  },
];

/* ─── Page ─── */

export function UseCasesPageContent() {
  const t = useTranslations('useCases');
  const [activeCase, setActiveCase] = useState(useCases[0].id);
  const current = useCases.find((u) => u.id === activeCase) ?? useCases[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-500 dark:text-slate-500">/</span>
            <span className="text-gray-600 dark:text-slate-400">{t("title")}</span>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Webhooks for every industry
          </h1>
          <p className="text-lg text-gray-600 dark:text-slate-400 max-w-2xl mx-auto">
            Whether you&apos;re building a SaaS platform, an e-commerce store, or an AI agent fleet —
            HookSniff delivers your events reliably.
          </p>
        </div>

        {/* Industry Tabs */}
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          {useCases.map((uc) => (
            <button
              key={uc.id}
              onClick={() => setActiveCase(uc.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
                activeCase === uc.id
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border border-gray-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-brand-500/40'
              }`}
            >
              {uc.icon} {uc.title}
            </button>
          ))}
        </div>

        {/* Active Use Case */}
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left: Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Header */}
            <div>
              <span className="text-4xl mb-3 block">{current.icon}</span>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{current.title}</h2>
              <p className="text-lg text-brand-600 dark:text-brand-400 font-medium mb-4">{current.tagline}</p>
              <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{current.description}</p>
            </div>

            {/* Pain Points → Solutions */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-3">❌ The problem</h3>
                <ul className="space-y-2">
                  {current.painPoints.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400">
                      <span className="text-red-500 mt-0.5 shrink-0">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3">✅ How HookSniff helps</h3>
                <ul className="space-y-2">
                  {current.solutions.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-sm text-gray-700 dark:text-slate-300">
                      <svg className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Example Events */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t("commonEvents")}</h3>
              <div className="space-y-2">
                {current.events.map((ev) => (
                  <div key={ev.name} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                    <code className="text-sm font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 px-2 py-0.5 rounded-sm shrink-0">
                      {ev.name}
                    </code>
                    <span className="text-sm text-gray-600 dark:text-slate-400">{ev.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Code Example */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t("codeExample")}</h3>
              <div className="bg-gray-900 dark:bg-slate-800 rounded-xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 dark:bg-slate-700 border-b border-gray-700 dark:border-slate-600">
                  <span className="w-3 h-3 rounded-full bg-red-500/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  <span className="text-xs text-gray-500 dark:text-slate-500 ml-2 font-mono">{current.codeExample.label}</span>
                </div>
                <pre className="p-4 overflow-x-auto text-sm leading-relaxed">
                  <code className="text-gray-300 dark:text-slate-300 font-mono">{current.codeExample.code}</code>
                </pre>
              </div>
            </div>

            {/* Testimonial */}
            {current.testimonial && (
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
                <svg className="w-8 h-8 text-brand-200 dark:text-brand-800 mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                </svg>
                <p className="text-gray-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{current.testimonial.quote}</p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400 text-xs font-bold">
                    {current.testimonial.author.split(' ').map((w) => w[0]).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{current.testimonial.author}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-500">{current.testimonial.company}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="lg:col-span-2 space-y-6">
            {/* Metrics */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t("keyMetrics")}</h3>
              <div className="space-y-4">
                {current.metrics.map((m) => (
                  <div key={m.label} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-slate-400">{t(m.label)}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{m.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Start */}
            <div className="bg-linear-to-br from-brand-50 to-blue-50 dark:from-brand-500/10 dark:to-blue-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Get started in 5 minutes</h3>
              <p className="text-sm text-gray-600 dark:text-slate-400 mb-4">
                Sign up, create an endpoint, and send your first webhook. No credit card required.
              </p>
              <Link
                href="/login"
                className="block w-full text-center py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {t('startForFree')}
              </Link>
            </div>

            {/* All Industries */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">{t("allIndustries")}</h3>
              <div className="space-y-2">
                {useCases.map((uc) => (
                  <button
                    key={uc.id}
                    onClick={() => setActiveCase(uc.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      activeCase === uc.id
                        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 font-medium'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    {uc.icon} {uc.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center p-8 bg-gray-900 dark:bg-slate-800 rounded-xl">
          <h2 className="text-2xl font-bold text-white mb-2">Don&apos;t see your industry?</h2>
          <p className="text-gray-500 dark:text-slate-400 mb-6">
            HookSniff works for any system that needs reliable event delivery. Tell us about your use case.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/contact"
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {t('talkToUs')}
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 border border-gray-600 dark:border-slate-600 text-gray-300 dark:text-slate-300 rounded-lg text-sm font-medium hover:border-gray-400 dark:hover:border-slate-400 transition-colors"
            >
              View pricing
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
