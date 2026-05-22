'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { useAuth } from '@/lib/store';
import PublicNavbar from '@/components/PublicNavbar';
import { useTranslations } from 'next-intl';
import Footer from '@/components/Footer';
import { Box, Circle, Code2, Globe, CreditCard, User, Package, Mail, Bot, Bell, EyeOff, Eye, Gem, Lightbulb, Monitor, Zap, FlaskConical, BarChart3, RefreshCw, ClipboardList, Image, Terminal , Check } from '@/components/icons';

/* ─── SDK Code Examples ─── */

const SDK_EXAMPLES = {
  nodejs: {
    label: 'Node.js',
    icon: <Circle size={16} strokeWidth={1.75} className="text-green-500" />,
    install: 'npm install hooksniff-sdk',
    code: `import { HookSniff } from 'hooksniff-sdk';

const hs = new HookSniff({ apiKey: 'YOUR_API_KEY' });

// 1. Create an endpoint
const endpoint = await hs.endpoints.create({
  url: 'https://myapp.com/webhooks',
  description: 'My production endpoint',
});

// 2. Send a webhook
const delivery = await hs.webhooks.send({
  endpointId: endpoint.id,
  event: 'order.created',
  data: { order_id: 'ord_123', total: 49.99 },
});

console.log('Delivery ID:', delivery.id);`,
  },
  python: {
    label: 'Python',
    icon: <Code2 size={16} strokeWidth={1.75} className="text-yellow-600" />,
    install: 'pip install hooksniff',
    code: `import hooksniff

client = hooksniff.Client(api_key="YOUR_API_KEY")

# 1. Create an endpoint
endpoint = client.endpoints.create(
    url="https://myapp.com/webhooks",
    description="My production endpoint"
)

# 2. Send a webhook
delivery = client.webhooks.send(
    endpoint_id=endpoint.id,
    event="order.created",
    data={"order_id": "ord_123", "total": 49.99}
)

print(f"Delivery ID: {delivery.id}")`,
  },
  go: {
    label: 'Go',
    icon: <Box size={16} strokeWidth={1.75} className="text-blue-500" />,
    install: 'go get github.com/servetarslan02/hooksniff-go',
    code: `package main

import (
    "fmt"
    hooksniff "github.com/servetarslan02/hooksniff-go"
)

func main() {
    client := hooksniff.NewClient("YOUR_API_KEY")

    endpoint, _ := client.Endpoints.Create(&hooksniff.EndpointParams{
        URL:         "https://myapp.com/webhooks",
        Description: "My production endpoint",
    })

    delivery, _ := client.Webhooks.Send(&hooksniff.WebhookParams{
        EndpointID: endpoint.ID,
        Event:      "order.created",
        Data:       map[string]interface{}{"order_id": "ord_123", "total": 49.99},
    })

    fmt.Printf("Delivery ID: %s\\n", delivery.ID)
}`,
  },
  rust: {
    label: 'Rust',
    icon: <Gem size={16} strokeWidth={1.75} className="text-orange-600" />,
    install: 'cargo add hooksniff',
    code: `use hooksniff::Client;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    let client = Client::new("YOUR_API_KEY");

    let endpoint = client.endpoints().create(
        "https://myapp.com/webhooks",
        Some("My production endpoint")
    ).await?;

    let delivery = client.webhooks().send(
        &endpoint.id,
        "order.created",
        serde_json::json!({"order_id": "ord_123", "total": 49.99}),
    ).await?;

    println!("Delivery ID: {}", delivery.id);
    Ok(())
}`,
  },
  curl: {
    label: 'curl',
    icon: <Globe size={16} strokeWidth={1.75} />,
    install: '',
    code: `# 1. Create an endpoint
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/endpoints \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://myapp.com/webhooks"}'

# 2. Send a webhook
curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"endpoint_id": "ep_abc123", "event": "order.created", "data": {"order_id": "ord_123", "total": 49.99}}'`,
  },
};

type SdkKey = keyof typeof SDK_EXAMPLES;

const EVENT_TYPES = [
  { category: <><CreditCard size={14} strokeWidth={1.75} className="inline mr-1" /> Payments</>, events: ['payment.completed', 'payment.failed', 'payment.refunded', 'subscription.created', 'subscription.cancelled'] },
  { category: <><User size={14} strokeWidth={1.75} className="inline mr-1" /> Users</>, events: ['user.created', 'user.updated', 'user.deleted', 'user.login', 'user.password_reset'] },
  { category: <><Package size={14} strokeWidth={1.75} className="inline mr-1" /> Orders</>, events: ['order.created', 'order.shipped', 'order.delivered', 'order.cancelled', 'order.refunded'] },
  { category: <><Mail size={14} strokeWidth={1.75} className="inline mr-1" /> Email</>, events: ['email.sent', 'email.delivered', 'email.opened', 'email.bounced', 'email.complained'] },
  { category: <><Bot size={14} strokeWidth={1.75} className="inline mr-1" /> AI / Agents</>, events: ['agent.task_started', 'agent.task_completed', 'agent.task_failed', 'model.response_completed'] },
  { category: <><Bell size={14} strokeWidth={1.75} className="inline mr-1" /> Notifications</>, events: ['notification.created', 'notification.read', 'notification.dismissed'] },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
    >
      {copied ? '<Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Copied!' : 'Copy'}
    </button>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="relative pl-12 pb-12 last:pb-0">
      <div className="absolute left-5 top-10 bottom-0 w-px bg-gray-200 dark:bg-slate-700 last:hidden" />
      <div className="absolute left-0 top-0 w-10 h-10 rounded-full bg-brand-600 dark:bg-brand-500 text-white flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
      <div className="text-gray-600 dark:text-slate-400">{children}</div>
    </div>
  );
}

export function GetStartedPageContent() {
  const { user } = useAuth();
  const t = useTranslations('getStarted');
  const [activeSdk, setActiveSdk] = useState<SdkKey>('nodejs');
  const [apiKeyRevealed, setApiKeyRevealed] = useState(false);

  const sdkKeys = Object.keys(SDK_EXAMPLES) as SdkKey[];

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-brand-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">
      <PublicNavbar pageTitle={t('title')} />

      {/* Hero */}
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-sm font-medium mb-6">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          {t('heroBadge')}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          {t('subtitle')}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm text-gray-500 dark:text-slate-400">
          <span className="flex items-center gap-2"><span className="text-green-500"><Check size={14} strokeWidth={1.75} /></span> {t('freeForever')}</span>
          <span className="flex items-center gap-2"><span className="text-green-500"><Check size={14} strokeWidth={1.75} /></span> {t('elevenSdks')}</span>
          <span className="flex items-center gap-2"><span className="text-green-500"><Check size={14} strokeWidth={1.75} /></span> {t('noCreditCard')}</span>
          <span className="flex items-center gap-2"><span className="text-green-500"><Check size={14} strokeWidth={1.75} /></span> {t('fiveMinSetup')}</span>
        </div>
      </div>

      {/* Steps */}
      <div className="max-w-3xl mx-auto px-4 pb-20">

        {/* Step 1 */}
        <Step number={1} title={t('step1Title')}>
          <p className="mb-4">{t('step1Desc')}</p>
          {!user ? (
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition">
              {t('createFreeAccount')} →
            </Link>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-xl text-sm font-medium">
              <Check size={14} strokeWidth={1.75} className="inline-block align-text-bottom mr-1 text-emerald-500" /> {t('signedInAs')} {user.email}
            </div>
          )}
        </Step>

        {/* Step 2 */}
        <Step number={2} title={t('step2Title')}>
          <p className="mb-4">{t('step2Desc')}</p>
          <div className="bg-gray-900 rounded-xl p-4 font-mono text-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 dark:text-slate-500">{t('yourApiKey')}</span>
              {user && (
                <Link href={`/api-keys`} className="text-brand-400 text-xs hover:text-brand-300">
                  {t('manageKeys')} →
                </Link>
              )}
            </div>
            <div className="flex items-center gap-3">
              <code className="text-green-400">
                {apiKeyRevealed ? 'hr_live_k3y_••••••••••••••••' : 'hr_live_••••••••••••••••••••'}
              </code>
              <button
                onClick={() => setApiKeyRevealed(!apiKeyRevealed)}
                className="text-gray-500 hover:text-gray-300 transition text-xs"
              >
                {apiKeyRevealed ? <><EyeOff size={14} strokeWidth={1.75} className="inline mr-1" />{t('hide')}</> : <><Eye size={14} strokeWidth={1.75} className="inline mr-1" />{t('show')}</>}
              </button>
            </div>
          </div>
          <p className="mt-3 text-sm text-gray-500 dark:text-slate-500"><Lightbulb size={14} strokeWidth={1.75} className="inline mr-1" /> {t('keepSecret')}</p>
        </Step>

        {/* Step 3 */}
        <Step number={3} title={t('step3Title')}>
          <p className="mb-4">{t('step3Desc')}</p>
          <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="flex flex-wrap border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
              {sdkKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveSdk(key)}
                  className={`px-4 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    activeSdk === key
                      ? 'text-brand-700 dark:text-brand-400 border-b-2 border-brand-500 bg-white dark:bg-slate-800'
                      : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{SDK_EXAMPLES[key].icon}</span>
                  <span>{SDK_EXAMPLES[key].label}</span>
                </button>
              ))}
            </div>
            {SDK_EXAMPLES[activeSdk].install && (
              <div className="border-b border-gray-200 dark:border-slate-700 p-4 bg-gray-900">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wider">{t('install')}</span>
                  <CopyButton text={SDK_EXAMPLES[activeSdk].install} />
                </div>
                <code className="text-green-400 text-sm font-mono">{SDK_EXAMPLES[activeSdk].install}</code>
              </div>
            )}
            <div className="p-4 bg-gray-900">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">{t('quickstart')}</span>
                <CopyButton text={SDK_EXAMPLES[activeSdk].code} />
              </div>
              <pre className="text-sm font-mono overflow-x-auto text-green-400">
                <code>{SDK_EXAMPLES[activeSdk].code}</code>
              </pre>
            </div>
          </div>
        </Step>

        {/* Step 4 */}
        <Step number={4} title={t('step4Title')}>
          <p className="mb-4">{t('step4Desc')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2"><Monitor size={16} strokeWidth={1.75} className="inline mr-1" /> {t('viaDashboard')}</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {t('viaDashboardDesc')}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2"><Zap size={16} strokeWidth={1.75} className="inline mr-1" /> {t('viaApi')}</h4>
              <p className="text-sm text-gray-500 dark:text-slate-400">
                {t('viaApiDesc')} <code className="text-xs bg-gray-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-sm">/v1/endpoints</code>.
              </p>
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4">
            <p className="text-sm text-blue-700 dark:text-blue-400"><Lightbulb size={14} strokeWidth={1.75} className="inline mr-1" /> {t('tipPlayground')}</p>
          </div>
        </Step>

        {/* Step 5 */}
        <Step number={5} title={t('step5Title')}>
          <p className="mb-4">{t('step5Desc')}</p>
          <div className="bg-gray-900 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{t('testWebhook')}</span>
              <CopyButton text={`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\\n  -H "Authorization: Bearer YOUR_API_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{"endpoint_id":"ep_YOUR_ID","event":"order.created","data":{"order_id":"ord_123","total":49.99}}'`} />
            </div>
            <pre className="text-sm font-mono text-green-400 overflow-x-auto">
              <code>{`curl -X POST https://hooksniff-api-1046140057667.europe-west1.run.app/v1/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "endpoint_id": "ep_YOUR_ID",
    "event": "order.created",
    "data": {"order_id": "ord_123", "total": 49.99}
  }'`}</code>
            </pre>
          </div>
          <div className="flex gap-3">
            <Link href={`/playground`} className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-xl text-sm font-medium hover:bg-brand-700 transition">
              <FlaskConical size={16} strokeWidth={1.75} className="inline mr-1" /> {t('tryPlayground')}
            </Link>
            <Link href={`/deliveries`} className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition">
              <Package size={16} strokeWidth={1.75} className="inline mr-1" /> {t('viewDeliveries')}
            </Link>
          </div>
        </Step>

        {/* Step 6 */}
        <Step number={6} title={t('step6Title')}>
          <p className="mb-4">{t('step6Desc')}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2"><BarChart3 size={32} strokeWidth={1.75} /></div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('realtimeDashboard')}</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('realtimeDashboardDesc')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2"><RefreshCw size={32} strokeWidth={1.75} /></div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('autoRetries')}</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('autoRetriesDesc')}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-center">
              <div className="text-3xl mb-2"><Bell size={32} strokeWidth={1.75} /></div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{t('alerts')}</h4>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">{t('alertsDesc')}</p>
            </div>
          </div>
          <Link href={"/"} className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-brand-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-brand-700 transition">
            {t('openDashboard')} →
          </Link>
        </Step>
      </div>

      {/* Event Types */}
      <div className="bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2"><ClipboardList size={24} strokeWidth={1.75} className="inline mr-1" /> {t('eventTypesTitle')}</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-8">{t('eventTypesDesc')}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {EVENT_TYPES.map((cat, idx) => (
              <div key={idx} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">{cat.category}</h4>
                <div className="flex flex-wrap gap-1.5">
                  {cat.events.map((ev) => (
                    <code key={ev} className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300 px-2 py-1 rounded-sm">
                      {ev}
                    </code>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Embed Portal */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2"><Image size={24} strokeWidth={1.75} className="inline mr-1" /> {t('embedTitle')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-8">{t('embedDesc')}</p>
        <div className="bg-gray-900 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 uppercase tracking-wider">{t('embedCode')}</span>
            <CopyButton text={`<iframe\n  src="https://hooksniff.vercel.app/portal-customize?token=YOUR_PORTAL_TOKEN"\n  style="width:100%;height:600px;border:none;"\n  allow="clipboard-write"\n/>`} />
          </div>
          <pre className="text-sm font-mono text-green-400 overflow-x-auto">
            <code>{`<iframe
  src="https://hooksniff.vercel.app/portal-customize?token=YOUR_PORTAL_TOKEN"
  style="width: 100%; height: 600px; border: none;"
  allow="clipboard-write"
/>`}</code>
          </pre>
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-slate-500">
          {t('customizeColors')} <Link href={`/portal-manage`} className="text-brand-600 dark:text-brand-400 hover:underline">{t('portalSettings')}</Link>.
        </p>
      </div>

      {/* CLI */}
      <div className="bg-gray-50 dark:bg-slate-800/50 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2"><Terminal size={24} strokeWidth={1.75} className="inline mr-1" /> {t('cliTitle')}</h2>
          <p className="text-gray-600 dark:text-slate-400 mb-8">{t('cliDesc')}</p>
          <div className="bg-gray-900 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-wider">{t('installAndUse')}</span>
              <CopyButton text={`npm install -g github:servetarslan02/hooksniff-cli\nhooksniff login\nhooksniff endpoints create --url https://myapp.com/webhooks\nhooksniff webhooks send --endpoint ep_abc123 --event order.created`} />
            </div>
            <pre className="text-sm font-mono text-green-400 overflow-x-auto">
              <code>{`# Install from GitHub
npm install -g github:servetarslan02/hooksniff-cli

hooksniff login
hooksniff endpoints create --url https://myapp.com/webhooks
hooksniff webhooks send --endpoint ep_abc123 --event order.created
hooksniff deliveries list --limit 10`}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t('readyTitle')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-8">{t('readyDesc')}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {!user ? (
            <>
              <Link href="/login" className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition">
                {t('createFreeAccount')}
              </Link>
              <Link href="/devtools" className="px-8 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 transition">
                {t('tryPlaygroundBtn')}
              </Link>
            </>
          ) : (
            <Link href={"/"} className="px-8 py-3 bg-brand-600 text-white rounded-xl font-semibold hover:bg-brand-700 transition">
              {t('goToDashboard')} →
            </Link>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
