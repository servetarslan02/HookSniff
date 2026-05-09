import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { notFound } from 'next/navigation';

const posts: Record<string, { title: string; date: string; category: string; readTime: string; content: string }> = {
  'introducing-hooksniff': {
    title: 'Introducing HookSniff: Webhooks Made Simple',
    date: '2026-05-01',
    category: 'Announcement',
    readTime: '3 min',
    content: `Webhooks are the backbone of modern integrations. When something happens in your app — an order is created, a payment succeeds, a user signs up — you need to notify other systems in real-time.

But building reliable webhook infrastructure is harder than it looks. You need retry logic, signature verification, delivery tracking, dead letter queues, and a dashboard to monitor it all.

**That is why we built HookSniff.**

HookSniff is a webhook delivery service that handles the hard parts so you can focus on your product:

- **Reliable delivery** — Automatic retries with exponential backoff and jitter
- **HMAC signatures** — Standard Webhooks compliant, so your endpoints can verify authenticity
- **Dead letter queue** — Failed deliveries are preserved for debugging
- **Real-time dashboard** — See every delivery, its status, and payload
- **11 SDKs** — Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift

### Getting Started

Getting started takes about 5 minutes:

1. Sign up at hooksniff.vercel.app
2. Create an endpoint (your server URL)
3. Send a webhook via our API
4. We deliver it — and if it fails, we retry

### Free Forever

HookSniff runs entirely on free-tier services. That means we can offer a generous free plan: 10,000 webhooks per month, no credit card required.

As you grow, our Pro plan starts at $49/month with 50,000 webhooks and 30-day retention.

### What is Next

We are just getting started. In the coming weeks, we will be launching:

- Schema registry for payload validation
- CloudEvents v1.0 support
- Embeddable customer portal
- Smart routing with failover

Stay tuned, and happy shipping!`,
  },
  'webhook-best-practices': {
    title: 'Webhook Best Practices for Production',
    date: '2026-04-25',
    category: 'Engineering',
    readTime: '7 min',
    content: `Sending webhooks seems simple — just make an HTTP POST to a URL. But in production, there are several critical considerations that separate toy implementations from reliable systems.

### 1. Always Sign Your Payloads

Every webhook payload should include an HMAC-SHA256 signature. This lets the receiver verify that the payload actually came from you and was not tampered with in transit.

We follow the Standard Webhooks specification:

\`\`\`
webhook-id: msg_123
webhook-timestamp: 1683000000
webhook-signature: v1,abc123...
\`\`\`

### 2. Implement Idempotency

Webhooks can be delivered more than once. Your endpoint must handle duplicate deliveries gracefully. Use the webhook ID as an idempotency key.

### 3. Use Exponential Backoff with Jitter

When a delivery fails, do not retry immediately. Use exponential backoff with jitter to avoid thundering herd problems:

- 1st retry: ~10 seconds
- 2nd retry: ~30 seconds
- 3rd retry: ~2 minutes
- 4th retry: ~10 minutes

### 4. Set Reasonable Timeouts

Your webhook endpoint should respond within 5-10 seconds. If processing takes longer, accept the webhook immediately and process asynchronously.

### 5. Monitor and Alert

Track delivery rates, latency, and error rates. Alert when the success rate drops below 99% or when latency spikes.

### 6. Implement a Dead Letter Queue

After all retries are exhausted, failed deliveries should be preserved for debugging. Do not just drop them silently.

### 7. Version Your Payloads

When you change your webhook payload format, include a version field. This lets consumers handle different formats gracefully.

HookSniff handles all of this out of the box — so you do not have to build it yourself.`,
  },
  'fifo-webhook-delivery': {
    title: 'Why FIFO Webhook Delivery Matters',
    date: '2026-04-18',
    category: 'Engineering',
    readTime: '5 min',
    content: `Most webhook services deliver events in whatever order is convenient — usually fastest-first. But for many workflows, event ordering is critical.

### The Problem

Imagine an e-commerce platform sending these events:

1. order.created
2. order.paid
3. order.shipped
4. order.delivered

If these arrive out of order — say order.shipped arrives before order.paid — your system breaks.

### How FIFO Works

HookSniff assigns each webhook a sequence number per endpoint. Deliveries are guaranteed to happen in sequence order:

- Webhook #1 is delivered first
- Webhook #2 waits until #1 succeeds
- If #1 fails and is retried, #2 waits

This is implemented at the database level with a FIFO queue, ensuring correctness even under high load.

### When You Need FIFO

- **Order lifecycle events** — created → paid → shipped → delivered
- **State machines** — status transitions must be ordered
- **Financial transactions** — debits before credits
- **Chat messages** — messages must arrive in send order

### When You Do Not Need FIFO

- **Independent events** — user.created and order.created are unrelated
- **High-throughput scenarios** — where ordering is less important than speed
- **Fan-out patterns** — multiple consumers processing independently

### Our Implementation

HookSniff FIFO is opt-in per endpoint. Enable it when ordering matters, disable it when throughput matters. You get the best of both worlds.`,
  },
  'cloudevents-standard': {
    title: 'Embracing the CloudEvents Standard',
    date: '2026-04-10',
    category: 'Standard',
    readTime: '4 min',
    content: `CloudEvents is a CNCF specification for describing event data in a common way. HookSniff supports CloudEvents v1.0 natively — here is why that matters.

### What is CloudEvents?

CloudEvents defines a standard envelope for event data:

\`\`\`json
{
  "specversion": "1.0",
  "type": "com.example.order.created",
  "source": "/orders/123",
  "id": "A234-1234-1234",
  "time": "2026-04-10T12:00:00Z",
  "datacontenttype": "application/json",
  "data": { "order_id": "12345", "total": 99.99 }
}
\`\`\`

### Why It Matters

Without a standard, every webhook provider uses their own format. This means consumers must write custom parsing for each provider. CloudEvents eliminates this by providing a universal envelope.

### Benefits for HookSniff Users

- **Interoperability** — Works with CloudEvents-compatible tools (Knative, Argo Events, etc.)
- **Tooling** — Existing CloudEvents SDKs work out of the box
- **Consistency** — Predictable structure across all events
- **Future-proof** — CNCF-backed, widely adopted

### How to Enable It

In your HookSniff dashboard, go to Settings and enable CloudEvents format. All subsequent webhooks will use the CloudEvents envelope.

You can also mix formats — some endpoints can use Standard Webhooks format while others use CloudEvents.`,
  },
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <nav className="border-b border-gray-200/50 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="items-center gap-3 flex">
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">🪝 HookSniff</Link>
            <span className="text-gray-400">/</span>
            <Link href="/blog" className="text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link>
          </div>
          <LanguageSwitcher />
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full">{post.category}</span>
            <span className="text-sm text-gray-500 dark:text-slate-500">{post.date}</span>
            <span className="text-sm text-gray-400 dark:text-slate-600">·</span>
            <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">{post.title}</h1>
        </div>

        <div className="prose prose-gray dark:prose-invert max-w-none">
          {post.content.split('\n\n').map((paragraph, i) => {
            if (paragraph.startsWith('### ')) {
              return <h3 key={i} className="text-xl font-semibold text-gray-900 dark:text-white mt-8 mb-4">{paragraph.replace('### ', '')}</h3>;
            }
            if (paragraph.startsWith('```')) {
              const lines = paragraph.split('\n').slice(1, -1);
              return (
                <pre key={i} className="bg-gray-100 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto text-sm my-4">
                  <code className="text-gray-800 dark:text-slate-200">{lines.join('\n')}</code>
                </pre>
              );
            }
            if (paragraph.startsWith('- **')) {
              const items = paragraph.split('\n');
              return (
                <ul key={i} className="space-y-2 my-4">
                  {items.map((item, j) => (
                    <li key={j} className="text-gray-600 dark:text-slate-400 leading-relaxed">{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            if (paragraph.startsWith('- ')) {
              const items = paragraph.split('\n');
              return (
                <ul key={i} className="list-disc list-inside space-y-1 my-4 text-gray-600 dark:text-slate-400">
                  {items.map((item, j) => (
                    <li key={j}>{item.replace('- ', '')}</li>
                  ))}
                </ul>
              );
            }
            if (paragraph.match(/^\d+\./)) {
              const items = paragraph.split('\n');
              return (
                <ol key={i} className="list-decimal list-inside space-y-1 my-4 text-gray-600 dark:text-slate-400">
                  {items.map((item, j) => (
                    <li key={j}>{item.replace(/^\d+\.\s*/, '')}</li>
                  ))}
                </ol>
              );
            }
            return <p key={i} className="text-gray-600 dark:text-slate-400 leading-relaxed my-4">{paragraph}</p>;
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-800">
          <Link href="/blog" className="text-brand-600 dark:text-brand-400 hover:underline">← Back to Blog</Link>
        </div>
      </article>
    </div>
  );
}
