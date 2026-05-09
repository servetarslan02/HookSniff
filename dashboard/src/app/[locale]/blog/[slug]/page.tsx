import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { notFound } from 'next/navigation';

type Post = { title: string; date: string; category: string; readTime: string; tags: string[]; author: string; content: string };

const posts: Record<string, Post> = {
  'why-ai-agents-need-webhooks': {
    title: 'Why AI Agents Need Webhooks',
    date: '2026-05-09',
    category: 'AI & Agents',
    readTime: '6 min',
    tags: ['ai', 'agents', 'mcp'],
    author: 'HookSniff Team',
    content: `The AI agent ecosystem is exploding. From coding assistants to autonomous sales agents, AI systems are becoming increasingly capable of acting on their own. But there is a fundamental problem: **how do agents know when something happens?**

### The Polling Problem

Most AI agents today use polling — they check an API every N seconds to see if something changed. This is inefficient, wasteful, and introduces latency.

### Webhooks: The Nervous System

Webhooks solve this perfectly. When an event occurs — a customer signs up, a payment fails, a CI build completes — the relevant agent gets notified instantly via a webhook.

### MCP and Event Delivery

The Model Context Protocol (MCP) is emerging as the standard for AI agent communication. But MCP focuses on request-response patterns. For asynchronous events, webhooks remain the best mechanism.

### How HookSniff Enables Agent Workflows

- **Instant delivery** — Sub-second latency for time-sensitive agent decisions
- **FIFO ordering** — Agents process events in the correct sequence
- **Schema validation** — Ensure agents receive well-structured data
- **Dead letter queue** — Never lose an event, even if the agent is temporarily down

### The Future

As agents become more autonomous, the demand for reliable event delivery will only grow. Webhooks are not just a developer tool — they are the connective tissue of the AI agent ecosystem.`,
  },
  'gemini-webhook-integration': {
    title: 'How to Handle Google Gemini Webhooks',
    date: '2026-05-08',
    category: 'Integration',
    readTime: '5 min',
    tags: ['google', 'gemini', 'integration'],
    author: 'HookSniff Team',
    content: `Google recently added webhook support to the Gemini API, making it easier to receive real-time notifications from Gemini models. Here is how to set it up with HookSniff.

### What Are Gemini Webhooks?

Gemini webhooks notify you when long-running operations complete — batch inference, fine-tuning jobs, and more. Instead of polling for results, you get a POST request when the job is done.

### Setting Up with HookSniff

1. Create an endpoint in HookSniff pointing to your server
2. Configure the Gemini webhook URL to your HookSniff endpoint
3. HookSniff handles retries, signature verification, and monitoring

### Verifying Gemini Signatures

Google signs webhook payloads with HMAC. HookSniff verifies these signatures automatically, ensuring your endpoints only accept authentic Gemini events.

### Best Practices

- Use idempotency keys — Gemini may retry deliveries
- Process asynchronously — acknowledge quickly, process in background
- Monitor delivery rates — HookSniff dashboard shows success rates and latency

### Code Example

\`\`\`javascript
const express = require('express');
const app = express();

app.post('/webhooks/gemini', (req, res) => {
  const { operation, status, result } = req.body;
  if (status === 'DONE') {
    // Process the completed operation
    handleGeminiResult(operation, result);
  }
  res.status(200).send('OK');
});
\`\`\``,
  },
  'stripe-webhook-guide': {
    title: 'Complete Guide to Stripe Webhooks',
    date: '2026-05-05',
    category: 'Integration',
    readTime: '8 min',
    tags: ['stripe', 'payments', 'integration'],
    author: 'HookSniff Team',
    content: `Stripe sends dozens of event types — payment_intent.succeeded, invoice.paid, customer.subscription.deleted, and many more. Handling them reliably is critical for any payment-enabled application.

### Why Stripe Webhooks Matter

- **Real-time updates** — Know immediately when payments succeed or fail
- **Reliable delivery** — Stripe retries failed webhooks for up to 3 days
- **Event ordering** — Some events must be processed in order

### Setting Up HookSniff as Your Stripe Webhook Receiver

1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: \`https://api.hooksniff.com/v1/inbound/stripe\`
3. Select events to listen for
4. HookSniff receives, verifies, and forwards to your server

### Verifying Stripe Signatures

Stripe signs every webhook with a timestamp and signature. HookSniff verifies this using the \`stripe-signature\` header and your webhook secret.

### Handling Common Event Types

\`\`\`python
def handle_stripe_event(event):
    if event['type'] == 'payment_intent.succeeded':
        fulfill_order(event['data']['object'])
    elif event['type'] == 'invoice.paid':
        activate_subscription(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        deactivate_account(event['data']['object'])
\`\`\`

### Idempotency

Stripe may deliver the same event more than once. Always use the event ID as an idempotency key.

### Monitoring with HookSniff

- Dashboard shows every Stripe event with payload and status
- Alerts on delivery failures
- Replay failed events with one click`,
  },
  'changelog-may-2026': {
    title: 'HookSniff Changelog — May 2026',
    date: '2026-05-01',
    category: 'Changelog',
    readTime: '3 min',
    tags: ['changelog', 'product'],
    author: 'HookSniff Team',
    content: `Here is what we shipped in May 2026.

### New Features

- **Blog** — You are reading it! Engineering insights, integration guides, and product updates
- **4 new database tables** — refresh_tokens, password_reset_tokens, email_verification_tokens, device_tokens for enhanced auth
- **Admin dashboard** — Full admin panel with user management, revenue tracking, and system health

### Improvements

- **CSP fix** — Content Security Policy now correctly handles Cloud Run API hostname
- **Build fix** — Resolved vitest config TypeScript error that blocked Vercel deployments
- **API deploy automation** — gcloud CLI integration for one-command deploys

### SDK Updates

All 11 SDKs remain up-to-date: Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift.

### What is Next

- Status page
- OpenAPI spec
- Integration guides for Shopify, GitHub, and Slack
- Community Discord server`,
  },
  'introducing-hooksniff': {
    title: 'Introducing HookSniff: Webhooks Made Simple',
    date: '2026-04-28',
    category: 'Announcement',
    readTime: '3 min',
    tags: ['announcement', 'product'],
    author: 'HookSniff Team',
    content: `Webhooks are the backbone of modern integrations. When something happens in your app — an order is created, a payment succeeds, a user signs up — you need to notify other systems in real-time.

But building reliable webhook infrastructure is harder than it looks. You need retry logic, signature verification, delivery tracking, dead letter queues, and a dashboard to monitor it all.

**That is why we built HookSniff.**

HookSniff is a webhook delivery service that handles the hard parts so you can focus on your product:

- **Reliable delivery** — Automatic retries with exponential backoff and jitter
- **HMAC signatures** — Standard Webhooks compliant
- **Dead letter queue** — Failed deliveries preserved for debugging
- **Real-time dashboard** — See every delivery, its status, and payload
- **11 SDKs** — Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift

### Free Forever

HookSniff runs entirely on free-tier services. 10,000 webhooks per month, no credit card required.

### Getting Started

1. Sign up at hooksniff.vercel.app
2. Create an endpoint
3. Send a webhook via our API
4. We deliver it — and if it fails, we retry`,
  },
  'webhook-best-practices': {
    title: 'Webhook Best Practices for Production',
    date: '2026-04-25',
    category: 'Engineering',
    readTime: '7 min',
    tags: ['security', 'engineering', 'best-practices'],
    author: 'HookSniff Team',
    content: `Sending webhooks seems simple — just make an HTTP POST to a URL. But in production, there are several critical considerations.

### 1. Always Sign Your Payloads

Every webhook payload should include an HMAC-SHA256 signature. We follow the Standard Webhooks specification.

### 2. Implement Idempotency

Webhooks can be delivered more than once. Use the webhook ID as an idempotency key.

### 3. Use Exponential Backoff with Jitter

When a delivery fails, use exponential backoff: 10s, 30s, 2m, 10m, 30m.

### 4. Set Reasonable Timeouts

Your endpoint should respond within 5-10 seconds. Process asynchronously if needed.

### 5. Monitor and Alert

Track delivery rates, latency, and error rates. Alert when success rate drops below 99%.

### 6. Implement a Dead Letter Queue

After all retries, preserve failed deliveries for debugging.

### 7. Version Your Payloads

Include a version field when you change your payload format.

HookSniff handles all of this out of the box.`,
  },
  'fifo-webhook-delivery': {
    title: 'Why FIFO Webhook Delivery Matters',
    date: '2026-04-20',
    category: 'Engineering',
    readTime: '5 min',
    tags: ['engineering', 'fifo', 'architecture'],
    author: 'HookSniff Team',
    content: `Most webhook services deliver events in whatever order is convenient. But for many workflows, event ordering is critical.

### The Problem

Imagine an e-commerce platform: order.created, order.paid, order.shipped, order.delivered. If these arrive out of order, your system breaks.

### How FIFO Works

HookSniff assigns sequence numbers per endpoint. Deliveries happen in order — webhook #2 waits until #1 succeeds.

### When You Need FIFO

- Order lifecycle events
- State machines
- Financial transactions
- Chat messages

### When You Do Not

- Independent events
- High-throughput scenarios
- Fan-out patterns

### Our Implementation

FIFO is opt-in per endpoint. Enable when ordering matters, disable when throughput matters.`,
  },
  'github-webhook-guide': {
    title: 'How to Set Up GitHub Webhooks',
    date: '2026-04-15',
    category: 'Integration',
    readTime: '6 min',
    tags: ['github', 'integration', 'ci-cd'],
    author: 'HookSniff Team',
    content: `GitHub webhooks let you react to events in your repositories — pushes, pull requests, issues, deployments, and more.

### Setting Up

1. Go to Settings → Webhooks → Add webhook
2. Set Payload URL to your HookSniff endpoint
3. Choose Content type: application/json
4. Select events: push, pull_request, issues, deployment
5. Save

### Verifying GitHub Signatures

GitHub signs payloads with HMAC-SHA1 using your webhook secret. HookSniff verifies this automatically.

### Common Use Cases

- **CI/CD** — Trigger builds on push
- **Notifications** — Alert team on PR reviews
- **Automation** — Auto-merge dependabot PRs
- **Analytics** — Track commit frequency

### Code Example

\`\`\`go
func handleGitHubWebhook(w http.ResponseWriter, r *http.Request) {
    event := r.Header.Get("X-GitHub-Event")
    switch event {
    case "push":
        triggerBuild(payload)
    case "pull_request":
        reviewPR(payload)
    }
    w.WriteHeader(200)
}
\`\`\``,
  },
  'cloudevents-standard': {
    title: 'Embracing the CloudEvents Standard',
    date: '2026-04-10',
    category: 'Standard',
    readTime: '4 min',
    tags: ['cloudevents', 'standard', 'architecture'],
    author: 'HookSniff Team',
    content: `CloudEvents is a CNCF specification for describing event data in a common way. HookSniff supports CloudEvents v1.0 natively.

### What is CloudEvents?

CloudEvents defines a standard envelope for event data with fields like specversion, type, source, id, and time.

### Why It Matters

Without a standard, every provider uses their own format. CloudEvents eliminates this by providing a universal envelope.

### Benefits

- **Interoperability** — Works with Knative, Argo Events, and more
- **Tooling** — Existing CloudEvents SDKs work out of the box
- **Consistency** — Predictable structure across all events
- **Future-proof** — CNCF-backed, widely adopted

### How to Enable It

Go to Settings and enable CloudEvents format. Mix formats per endpoint.`,
  },
  'webhook-security-guide': {
    title: 'Webhook Security: A Complete Guide',
    date: '2026-04-05',
    category: 'Engineering',
    readTime: '9 min',
    tags: ['security', 'hmac', 'best-practices'],
    author: 'HookSniff Team',
    content: `Webhook security is often overlooked — until something goes wrong. Here is everything you need to secure your webhook endpoints.

### HMAC Signatures

Every webhook should be signed with HMAC-SHA256. The receiver verifies the signature using a shared secret.

### Replay Attack Prevention

Include a timestamp in the signature. Reject webhooks with timestamps older than 5 minutes.

### IP Whitelisting

Restrict webhook sources to known IP addresses. HookSniff provides a /v1/outbound-ips endpoint.

### TLS

Always use HTTPS. Never accept webhooks over plain HTTP.

### Rate Limiting

Protect your endpoints from webhook floods. HookSniff supports per-endpoint throttling.

### Input Validation

Validate webhook payloads against a JSON schema. HookSniff's schema registry handles this.

### Monitoring

Alert on unusual patterns — spike in volume, new IP addresses, failed signatures.`,
  },
};

function getRelatedPosts(currentSlug: string, tags: string[]) {
  return Object.entries(posts)
    .filter(([slug, post]) => slug !== currentSlug && post.tags.some(t => tags.includes(t)))
    .slice(0, 3)
    .map(([slug, post]) => ({ slug, ...post }));
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string; locale: string }> }) {
  const { slug } = await params;
  const post = posts[slug];
  if (!post) notFound();

  const related = getRelatedPosts(slug, post.tags);

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className="text-xs font-medium bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400 px-2.5 py-1 rounded-full">{post.category}</span>
            <span className="text-sm text-gray-500 dark:text-slate-500">{post.date}</span>
            <span className="text-sm text-gray-400 dark:text-slate-600">·</span>
            <span className="text-sm text-gray-500 dark:text-slate-500">{post.readTime}</span>
            <span className="text-sm text-gray-400 dark:text-slate-600">·</span>
            <span className="text-sm text-gray-500 dark:text-slate-500">{post.author}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight">{post.title}</h1>
          <div className="flex gap-2 mt-4">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-500 px-2 py-0.5 rounded">#{tag}</span>
            ))}
          </div>
        </div>

        {/* Content */}
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
                  {items.map((item, j) => <li key={j}>{item.replace('- ', '')}</li>)}
                </ul>
              );
            }
            if (paragraph.match(/^\d+\./)) {
              const items = paragraph.split('\n');
              return (
                <ol key={i} className="list-decimal list-inside space-y-1 my-4 text-gray-600 dark:text-slate-400">
                  {items.map((item, j) => <li key={j}>{item.replace(/^\d+\.\s*/, '')}</li>)}
                </ol>
              );
            }
            return <p key={i} className="text-gray-600 dark:text-slate-400 leading-relaxed my-4">{paragraph}</p>;
          })}
        </div>

        {/* Share */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800 flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-slate-500">Share:</span>
          <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://hooksniff.vercel.app/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Twitter</a>
          <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://hooksniff.vercel.app/blog/${slug}`)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">LinkedIn</a>
          <a href={`https://news.ycombinator.com/submitlink?u=${encodeURIComponent(`https://hooksniff.vercel.app/blog/${slug}`)}&t=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 dark:text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Hacker News</a>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Related Posts</h3>
            <div className="grid gap-4">
              {related.map((r) => (
                <Link key={r.slug} href={`/blog/${r.slug}`} className="block group">
                  <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-4 hover:border-brand-300 dark:hover:border-brand-500/40 transition-colors">
                    <span className="text-xs text-brand-600 dark:text-brand-400">{r.category}</span>
                    <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors mt-1">{r.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-slate-500 mt-1">{r.date} · {r.readTime}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-slate-800">
          <Link href="/blog" className="text-brand-600 dark:text-brand-400 hover:underline">← Back to Blog</Link>
        </div>
      </article>
    </div>
  );
}
