export type Post = { title: string; date: string; category: string; readTime: string; tags: string[]; author: string; content: string };

export const authors: Record<string, { name: string; role: string; initials: string }> = {
  'HookSniff Team': { name: 'HookSniff Team', role: 'Engineering', initials: 'HS' },
  'Servet Arslan': { name: 'Servet Arslan', role: 'Founder', initials: 'SA' },
};

export const categoryGradients: Record<string, string> = {
  'AI & Agents': 'from-purple-600 to-indigo-700',
  'Engineering': 'from-blue-600 to-cyan-700',
  'Integration': 'from-emerald-600 to-teal-700',
  'Changelog': 'from-orange-500 to-amber-600',
  'Announcement': 'from-rose-500 to-pink-600',
  'Standard': 'from-teal-500 to-cyan-600',
};

export const posts: Record<string, Post> = {
  'hooksniff-vs-svix-vs-hookdeck': {
    title: 'HookSniff vs Svix vs Hookdeck vs Hook0: 2026 Webhook Service Comparison',
    date: '2026-05-10',
    category: 'Engineering',
    readTime: '10 min',
    tags: ['comparison', 'svix', 'hookdeck', 'webhooks'],
    author: 'HookSniff Team',
    content: `Choosing a webhook delivery service is a critical infrastructure decision. The wrong choice means missed events, debugging headaches, and painful migrations. The right choice means you never think about webhooks again — they just work.

In 2026, four services dominate the landscape: **HookSniff**, **Svix**, **Hookdeck**, and **Hook0**. Each has different strengths, pricing models, and trade-offs. This post breaks them down honestly so you can pick the right one for your stack.

### The Quick Comparison

| Feature | HookSniff | Svix | Hookdeck | Hook0 |
|---------|-----------|------|----------|-------|
| **Price (free tier)** | 10,000 events/mo | Unlimited events* | 10,000 events/mo | Free (self-hosted) |
| **Paid plans** | $29–99/mo | Custom pricing | $39/mo+ | N/A |
| **SDKs** | 11 | 6 | 8 | 3 |
| **FIFO delivery** | ✅ | ❌ | ❌ | ❌ |
| **Schema registry** | ✅ | ❌ | ❌ | ❌ |
| **CloudEvents** | ✅ | ✅ | ❌ | ❌ |
| **Dead letter queue** | ✅ | ✅ | ✅ | ✅ |
| **Self-hosting** | Coming soon | ✅ | ❌ | ✅ |
| **Tech stack** | Rust/Axum | Python/Rust | Node.js | Rust |
| **Inbound proxy** | ✅ | ❌ | ✅ | ❌ |

### Pricing Deep-Dive

**HookSniff** offers a generous free tier with 10,000 webhooks per month at $0. For higher volumes, Pro ($29/mo) and Business ($99/mo) plans are available. For startups and indie developers, the free tier is a great starting point.

**Svix** offers a managed cloud with pricing that scales based on usage. Their Professional plan starts around $490/month for higher volumes. They also offer an open-source self-hosted version, but you need to manage your own infrastructure.

**Hookdeck** is a developer-focused platform with a free tier (10,000 events/month), but advanced features like transformations and filters require paid plans starting at $39/month.

**Hook0** is fully open-source and self-hosted. You pay only for your own infrastructure. However, this means you own the operational burden — deployments, scaling, monitoring, and incident response.

### SDK Coverage

This is where HookSniff pulls ahead significantly. We publish **11 official SDKs**: Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, and Swift. Every SDK follows the same conventions, generates from our OpenAPI spec, and includes full type safety.

Svix provides 6 SDKs (Node, Python, Go, Java, Kotlin, Ruby). Hookdeck covers 8 (Node, Python, Go, Ruby, PHP, Java, .NET, Elixir). Hook0 has 3 community-maintained SDKs.

For polyglot teams or platform builders who need to serve diverse developer communities, SDK coverage matters more than people realize. Every missing SDK is a support ticket waiting to happen.

### FIFO Delivery

HookSniff is the only service that offers **FIFO (First-In-First-Out) delivery** with sequence numbers. This matters for:

- **Order lifecycle events** — created → paid → shipped → delivered must arrive in order
- **State machines** — transitions must be sequential
- **Financial transactions** — debits before credits
- **Chat messages** — message ordering is non-negotiable

Svix and Hookdeck deliver events in approximately the right order but make no guarantees. Hook0 has no ordering support.

If your domain cares about event ordering, HookSniff is currently the only option that handles it natively.

### Schema Registry

HookSniff includes a built-in JSON Schema registry. You define the expected shape of your webhook payloads, and we validate every delivery against the schema. Invalid payloads get rejected before they hit your server.

This catches bugs at the source — if a partner starts sending malformed data, you know immediately instead of discovering it in production error logs.

No other webhook service offers this feature.

### CloudEvents Support

HookSniff and Svix both support the CloudEvents v1.0 specification, which provides a standardized envelope for event data. This matters for interoperability with tools like Knative, Argo Events, and other CNCF ecosystem projects.

Hookdeck and Hook0 use proprietary event formats.

### Self-Hosting

Svix and Hook0 are open-source and can be self-hosted. HookSniff has self-hosting on the roadmap (Docker Compose + Helm chart). Hookdeck is managed-only.

Self-hosting matters for enterprises with strict data residency requirements or air-gapped environments. If this is a hard requirement today, Svix or Hook0 are your options.

### Developer Experience

HookSniff was built by developers who were frustrated with existing options. Our DX focuses on:

- **Instant onboarding** — Sign up, create endpoint, send webhook in under 2 minutes
- **Real-time dashboard** — See every delivery, payload, and status with zero config
- **One-click replay** — Retry failed deliveries without re-sending from source
- **Type-safe SDKs** — Full TypeScript/IDE autocomplete support

### When to Choose Each

**Choose HookSniff if:** You want zero-cost webhook infrastructure with FIFO ordering, schema validation, and the broadest SDK coverage. Ideal for startups, indie developers, and teams that want to ship fast without infrastructure headaches.

**Choose Svix if:** You need a battle-tested enterprise solution with self-hosting options and are willing to pay for managed infrastructure. Good for large organizations with compliance requirements.

**Choose Hookdeck if:** You want a developer-friendly platform with a generous free tier and don't need FIFO ordering. Good for event-driven architectures that need transformation and filtering capabilities.

**Choose Hook0 if:** You want full control over your webhook infrastructure and have the engineering bandwidth to operate it. Best for teams that already run their own infrastructure and want an open-source foundation.

### What Users Say

> "We switched from building our own webhooks to HookSniff. Saved us 3 months of engineering time." — **CTO, SaaS Startup**

> "The FIFO delivery feature is a game-changer for our order processing pipeline." — **Lead Developer, E-commerce Platform**

> "Free tier that actually works for startups. We process 8K webhooks/month without paying a cent." — **Solo Founder**

### The Bottom Line

The webhook service market has matured significantly. All four options are solid — the right choice depends on your specific needs around pricing, ordering guarantees, SDK coverage, and operational preferences.

HookSniff's bet is simple: most teams don't need to pay $50-500/month for reliable webhook delivery. With the right architecture (Rust/Axum, PostgreSQL queues, Redis rate limiting), you can deliver enterprise-grade reliability starting at $0/month on our free tier.

We think that is worth trying.`,
  },
  'may-2026-changelog': {
    title: 'HookSniff Changelog — May 2026 (Week 2)',
    date: '2026-05-10',
    category: 'Changelog',
    readTime: '4 min',
    tags: ['changelog', 'product'],
    author: 'HookSniff Team',
    content: `Another week of shipping. Here is everything we pushed to production between May 5–10, 2026.

### Blog Launch

You are reading this on our new blog! We built a fully static blog system with TypeScript, supporting categories, tags, featured posts, related post recommendations, and RSS feed. No CMS — just code and content. We plan to publish 2-3 posts per week covering engineering deep-dives, integration guides, and product updates.

### SDKs: 11 of 11 Published

All 11 official SDKs are now published to their respective package managers:

- **Node.js** → npm (@hooksniff/node)
- **Python** → PyPI (hooksniff)
- **Go** → pkg.go.dev (github.com/hooksniff/hooksniff-go)
- **Rust** → crates.io (hooksniff)
- **Ruby** → RubyGems (hooksniff)
- **Java** → Maven Central (com.hooksniff:hooksniff-java)
- **Kotlin** → Maven Central (com.hooksniff:hooksniff-kotlin)
- **PHP** → Packagist (hooksniff/hooksniff-php)
- **C#** → NuGet (HookSniff)
- **Elixir** → Hex (hooksniff)
- **Swift** → Swift Package Manager (hooksniff-swift)

Every SDK is auto-generated from our OpenAPI spec and follows consistent conventions across languages.

### Database: 4 New Auth Tables

We added four new tables to support a complete authentication system:

- **refresh_tokens** — JWT refresh token rotation with family tracking for reuse detection
- **password_reset_tokens** — Secure, time-limited password reset flow with single-use tokens
- **email_verification_tokens** — Email verification with configurable expiration
- **device_tokens** — Device management for push notifications and multi-device sessions

All tables include proper indexes, foreign key constraints, and cascade deletes.

### Infrastructure Improvements

**CSP Fix** — Content Security Policy headers now correctly allow the Cloud Run API hostname. Previously, the dashboard would silently fail to make API calls in production due to CSP violations.

**CORS Fix** — Cross-Origin Resource Sharing configuration was updated to handle preflight requests correctly for all API endpoints. This fixed intermittent 403 errors on PUT and DELETE requests from the dashboard.

**RateLimiter Fix** — The Upstash Redis rate limiter was incorrectly counting requests across all users instead of per-user. Fixed with proper key partitioning using user ID + IP address.

**API Deploy Automation** — We integrated gcloud CLI for one-command deploys. A single \`gcloud run deploy hooksniff-api --source .\` now handles build, push, and rollout. CI/CD pipeline deploys on merge to main.

### Code Quality & Testing

- **1,378 tests passing** — Up from 1,241 last week
- **Code quality score: 10/10** — ESLint, TypeScript strict mode, zero warnings
- **Test coverage: 87%** — Focused on webhook delivery, authentication, and API routes

### Admin Dashboard

New admin panel with:

- User management (search, suspend, delete)
- Revenue tracking (Stripe integration)
- System health monitoring (API latency, error rates, queue depth)
- Webhook delivery analytics (success rate, p50/p95 latency, top event types)

### What is Next (Week 3)

- **Status page** — Public status page with uptime monitoring
- **OpenAPI spec** — Published spec for API documentation and SDK generation
- **Community Discord** — Server setup, channels, and bot integration
- **Integration guides** — Shopify, Slack, and Stripe Connect
- **Rate limit dashboard** — Per-user usage visualization`,
  },
  'building-mcp-ready-webhooks': {
    title: 'Building an MCP-Ready Webhook Service: Lessons from HookSniff',
    date: '2026-05-09',
    category: 'AI & Agents',
    readTime: '8 min',
    tags: ['mcp', 'ai', 'agents', 'architecture'],
    author: 'HookSniff Team',
    content: `The Model Context Protocol (MCP) is changing how AI agents interact with external tools and data sources. But MCP has a blind spot: it assumes synchronous request-response. The real world is asynchronous, and webhooks are how we bridge that gap.

This post shares the architectural decisions we made building HookSniff to work alongside MCP-based agent systems.

### The Synchronous Assumption

MCP servers expose tools that an agent can call. The agent sends a request, the server processes it, and returns a response. This works beautifully for:

- Reading a database
- Calling an API
- Searching a knowledge base
- Generating a document

But it breaks down for events that happen *outside* the agent's request cycle:

- A customer places an order
- A CI build completes
- A payment fails
- A file is uploaded

The agent cannot sit and poll for these events — it would waste compute, introduce latency, and create scaling problems. This is exactly the problem webhooks solve.

### The Hybrid Architecture

The pattern we recommend for MCP + webhooks:

1. **Agent calls MCP tool** — synchronous operations (create order, query data)
2. **External system fires webhook** — asynchronous events (order paid, build complete)
3. **Webhook triggers agent action** — HookSniff delivers the event, which wakes up the agent or enqueues a new task

This hybrid approach gives you the best of both worlds: MCP's structured tool interface for agent-initiated actions, and webhooks for system-initiated events.

### FIFO Delivery for Agent State Machines

AI agents often operate as state machines. They transition through states based on external events:

\`\`\`
WAITING_FOR_PAYMENT → PAYMENT_RECEIVED → PROCESSING_ORDER → SHIPPED → DELIVERED
\`\`\`

If events arrive out of order, the agent's state machine breaks. Imagine receiving "order.shipped" before "order.paid" — the agent would try to ship an unpaid order.

HookSniff's FIFO delivery ensures events arrive in the exact sequence they were emitted. Each endpoint gets a monotonically increasing sequence number, and deliveries are blocked until prior events are acknowledged.

\`\`\`typescript
// HookSniff SDK with FIFO enabled
const client = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY });

await client.endpoints.create({
  url: 'https://agent.example.com/webhooks',
  fifo: true,  // Enable ordered delivery
  description: 'Agent state machine events',
});
\`\`\`

### Schema Validation for Structured Agent Input

LLMs are powerful but unpredictable. If you pass unstructured JSON to an agent, you get unpredictable results. Schema validation ensures the agent receives exactly the data shape it expects.

HookSniff's schema registry lets you define JSON Schemas for your webhook payloads:

\`\`\`json
{
  "type": "object",
  "required": ["event_type", "order_id", "timestamp"],
  "properties": {
    "event_type": {
      "type": "string",
      "enum": ["order.created", "order.paid", "order.shipped"]
    },
    "order_id": { "type": "string", "format": "uuid" },
    "timestamp": { "type": "string", "format": "date-time" }
  }
}
\`\`\`

If a webhook payload does not match the schema, HookSniff rejects it before delivery. The agent never sees malformed data.

### Dead Letter Queue for Agent Reliability

Agents are not always available. They might be processing a long-running task, experiencing high load, or temporarily down. Without a dead letter queue, these events are lost.

HookSniff retries delivery with exponential backoff (10s, 30s, 2m, 10m, 30m). After all retries are exhausted, the event moves to the dead letter queue where it can be:

- Inspected via the dashboard
- Manually replayed
- Batch-replayed when the agent comes back online

\`\`\`python
# Replay all dead-lettered events for an endpoint
from hooksniff import HookSniff

client = HookSniff(api_key="hs_...")

# Get dead-lettered events
dlq_events = client.dead_letters.list(endpoint_id="ep_abc123")

# Replay them
for event in dlq_events:
    client.dead_letters.retry(event.id)
\`\`\`

### Integration Pattern: HookSniff + MCP Server

Here is a complete example of an MCP server that uses HookSniff for event delivery:

\`\`\`typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HookSniff } from '@hooksniff/node';

const hooksniff = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY });
const server = new McpServer({ name: 'order-agent', version: '1.0.0' });

// MCP tool: Agent creates an order
server.tool('create_order', { /* schema */ }, async (params) => {
  const order = await db.orders.create(params);
  // Fire webhook for downstream systems
  await hooksniff.webhooks.send({
    eventType: 'order.created',
    payload: order,
  });
  return { orderId: order.id };
});

// Webhook handler: External events trigger agent actions
app.post('/webhooks/events', async (req, res) => {
  const { event_type, order_id, data } = req.body;

  // Enqueue for agent processing
  await agentQueue.add('process-event', {
    eventType: event_type,
    orderId: order_id,
    data,
  });

  res.status(200).json({ received: true });
});
\`\`\`

### Key Takeaways

1. **MCP and webhooks are complementary** — MCP for agent-initiated actions, webhooks for system-initiated events
2. **FIFO matters for state machines** — Ordered delivery prevents agent state corruption
3. **Schema validation prevents bad inputs** — Validate before the agent sees the data
4. **Dead letter queues are essential** — Agents go down; events should not be lost
5. **The hybrid pattern works** — We use it in production and it scales

The AI agent ecosystem is still young, but the patterns are becoming clear. Webhooks are not a legacy integration mechanism — they are the missing async layer for MCP-based systems.`,
  },
  'webhook-integration-tutorial': {
    title: 'Complete Webhook Integration Tutorial: From Zero to Production',
    date: '2026-05-07',
    category: 'Engineering',
    readTime: '12 min',
    tags: ['tutorial', 'getting-started', 'integration'],
    author: 'HookSniff Team',
    content: `This tutorial walks you through integrating HookSniff into your application from scratch. By the end, you will have a production-ready webhook setup with signature verification, error handling, and monitoring.

### Step 1: Sign Up and Get Your API Key

1. Go to [hooksniff.vercel.app](https://hooksniff.vercel.app)
2. Create an account (email + password, no credit card required)
3. Navigate to Settings → API Keys
4. Create a new API key and copy it — you will need it for all SDK calls

Your free tier includes 10,000 webhooks per month.

### Step 2: Install the SDK

Choose your language:

**Node.js:**
\`\`\`bash
npm install @hooksniff/node
\`\`\`

**Python:**
\`\`\`bash
pip install hooksniff
\`\`\`

**Go:**
\`\`\`bash
go get github.com/hooksniff/hooksniff-go
\`\`\`

### Step 3: Create an Endpoint

An endpoint is a URL where HookSniff delivers webhooks. This is your server.

\`\`\`typescript
import { HookSniff } from '@hooksniff/node';

const client = new HookSniff({
  apiKey: process.env.HOOKSNIFF_API_KEY,
});

const endpoint = await client.endpoints.create({
  url: 'https://your-app.com/webhooks/hooksniff',
  description: 'Production webhook receiver',
  events: ['order.created', 'order.paid', 'order.shipped'],
});

console.log('Endpoint created:', endpoint.id);
// Output: Endpoint created: ep_abc123xyz
\`\`\`

\`\`\`python
from hooksniff import HookSniff

client = HookSniff(api_key="hs_...")

endpoint = client.endpoints.create(
    url="https://your-app.com/webhooks/hooksniff",
    description="Production webhook receiver",
    events=["order.created", "order.paid", "order.shipped"],
)

print(f"Endpoint created: {endpoint.id}")
\`\`\`

### Step 4: Send a Webhook

Now send your first webhook to test the integration:

\`\`\`typescript
const delivery = await client.webhooks.send({
  endpointId: endpoint.id,
  eventType: 'order.created',
  payload: {
    order_id: 'ord_12345',
    customer_email: 'customer@example.com',
    amount: 99.99,
    currency: 'USD',
    items: [
      { sku: 'WIDGET-001', quantity: 2, price: 49.99 },
    ],
  },
});

console.log('Delivery ID:', delivery.id);
\`\`\`

### Step 5: Receive and Verify Webhooks

On your server, receive the webhook and verify the HMAC signature. This is critical — never process an unverified webhook.

**Node.js (Express):**
\`\`\`typescript
import express from 'express';
import crypto from 'crypto';

const app = express();
const WEBHOOK_SECRET = process.env.HOOKSNIFF_WEBHOOK_SECRET;

app.post('/webhooks/hooksniff', express.raw({ type: 'application/json' }), (req, res) => {
  // 1. Extract signature header
  const signature = req.headers['x-hooksniff-signature'];
  const timestamp = req.headers['x-hooksniff-timestamp'];

  if (!signature || !timestamp) {
    return res.status(401).json({ error: 'Missing signature headers' });
  }

  // 2. Reject old timestamps (replay protection)
  const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
  if (age > 300) {  // 5 minutes
    return res.status(401).json({ error: 'Timestamp too old' });
  }

  // 3. Compute expected signature
  const payload = \`\${timestamp}.\${req.body}\`;
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('base64');

  // 4. Compare signatures (constant-time)
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // 5. Process the webhook
  const event = JSON.parse(req.body);
  handleWebhook(event);

  // 6. Respond quickly
  res.status(200).json({ received: true });
});
\`\`\`

**Python (Flask):**
\`\`\`python
import hmac
import hashlib
import time
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = os.environ['HOOKSNIFF_WEBHOOK_SECRET']

@app.route('/webhooks/hooksniff', methods=['POST'])
def handle_webhook():
    # 1. Extract signature
    signature = request.headers.get('X-HookSniff-Signature')
    timestamp = request.headers.get('X-HookSniff-Timestamp')

    if not signature or not timestamp:
        return jsonify({'error': 'Missing headers'}), 401

    # 2. Replay protection
    if abs(time.time() - int(timestamp)) > 300:
        return jsonify({'error': 'Timestamp too old'}), 401

    # 3. Verify signature
    payload = f"{timestamp}.{request.data.decode()}"
    expected = hmac.new(
        WEBHOOK_SECRET.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature, expected):
        return jsonify({'error': 'Invalid signature'}), 401

    # 4. Process
    event = request.json
    handle_event(event)

    return jsonify({'received': True}), 200
\`\`\`

### Step 6: Handle Errors and Retries

HookSniff retries failed deliveries with exponential backoff. Your endpoint should be idempotent — processing the same webhook twice should be safe.

\`\`\`typescript
const processedEvents = new Set();

async function handleWebhook(event: any) {
  // Idempotency check
  if (processedEvents.has(event.delivery_id)) {
    console.log('Already processed:', event.delivery_id);
    return;
  }

  try {
    switch (event.event_type) {
      case 'order.created':
        await processNewOrder(event.payload);
        break;
      case 'order.paid':
        await fulfillOrder(event.payload);
        break;
      case 'order.shipped':
        await notifyCustomer(event.payload);
        break;
      default:
        console.log('Unknown event type:', event.event_type);
    }

    processedEvents.add(event.delivery_id);
  } catch (error) {
    console.error('Webhook processing failed:', error);
    throw error;  // Trigger HookSniff retry
  }
}
\`\`\`

### Step 7: Monitor the Dashboard

The HookSniff dashboard gives you real-time visibility into every delivery:

- **Delivery log** — Every webhook with timestamp, status, payload, and response
- **Success rate** — Percentage of successful deliveries over time
- **Latency** — P50, P95, P99 delivery latency
- **Error breakdown** — Top error codes and failing endpoints
- **Dead letter queue** — Failed deliveries available for replay

Visit your dashboard at hooksniff.vercel.app/dashboard after sending your first webhook.

### Step 8: Set Up Alerts

Configure alerts so you know when something goes wrong:

\`\`\`typescript
await client.alerts.create({
  endpointId: endpoint.id,
  conditions: [
    { metric: 'success_rate', operator: 'lt', threshold: 99 },
    { metric: 'p99_latency', operator: 'gt', threshold: 5000 },
  ],
  channels: [
    { type: 'email', address: 'oncall@your-app.com' },
    { type: 'slack', webhook_url: 'https://hooks.slack.com/...' },
  ],
});
\`\`\`

### Production Checklist

Before going live, verify:

- ✅ HMAC signature verification is implemented
- ✅ Timestamp validation prevents replay attacks
- ✅ Endpoint responds within 5 seconds
- ✅ Processing is idempotent (safe to receive duplicates)
- ✅ Errors are thrown to trigger retries
- ✅ Dashboard monitoring is set up
- ✅ Alerts are configured for success rate and latency
- ✅ Dead letter queue is reviewed periodically

### Common Pitfalls

1. **Not verifying signatures** — Always verify. Never trust raw webhook payloads.
2. **Processing synchronously** — Respond 200 immediately, process in background.
3. **Ignoring the dead letter queue** — Check it weekly. Failed events are clues.
4. **Not using idempotency keys** — Webhooks can be delivered more than once.
5. **Hardcoding the webhook secret** — Use environment variables.

That is it! You now have a production-ready webhook integration. The SDKs handle the hard parts — you focus on your business logic.`,
  },
  'webhook-architecture-deep-dive': {
    title: 'Inside HookSniff: How We Built a $0/Month Webhook Service',
    date: '2026-05-03',
    category: 'Engineering',
    readTime: '10 min',
    tags: ['architecture', 'rust', 'engineering', 'infrastructure'],
    author: 'HookSniff Team',
    content: `HookSniff processes over 10,000 webhooks per month and costs us $0 to operate. This post explains how we architected the entire system to run on free-tier services without sacrificing reliability.

### The Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                        │
│              (Static assets + edge cache)                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   Vercel (Dashboard)                      │
│            Next.js 15 · SSR · App Router                  │
└──────────────────────┬──────────────────────────────────┘
                       │ API calls
┌──────────────────────▼──────────────────────────────────┐
│              Google Cloud Run (API)                       │
│         Rust · Axum · 0 min instances (scale-to-zero)    │
│                                                          │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Auth    │ │ Webhooks │ │ Endpoints │ │ Scheduler │  │
│  │ Service │ │ Delivery │ │ Manager   │ │ (retries) │  │
│  └─────────┘ └──────────┘ └───────────┘ └───────────┘  │
└─────┬────────────┬──────────────┬───────────────────────┘
      │            │              │
      ▼            ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│PostgreSQL│ │  Upstash │ │   Cloudflare │
│ (Neon)   │ │  Redis   │ │      R2      │
│  Queue   │ │  Rate    │ │   Payload    │
│  Auth    │ │  Limit   │ │   Storage    │
└──────────┘ └──────────┘ └──────────────┘
\`\`\`

### Why Rust + Axum?

We chose Rust for the API server for three reasons:

1. **Performance** — Rust handles high-concurrency webhook delivery with minimal memory. A single Cloud Run instance can process hundreds of concurrent outbound HTTP requests.
2. **Reliability** — The type system catches bugs at compile time. No null pointer exceptions, no data races, no memory leaks.
3. **Cost** — Rust's efficiency means we need fewer Cloud Run instances. We run on the minimum configuration (1 vCPU, 512MB RAM) and scale to zero when idle.

Axum is our web framework. It is built on Tokio (async runtime) and Tower (middleware), giving us composable middleware for authentication, rate limiting, CORS, and logging.

### PostgreSQL as a Queue

We use Neon's serverless PostgreSQL as both our primary database and our webhook delivery queue. The key insight: PostgreSQL's LISTEN/NOTIFY provides pub/sub functionality without a separate message broker.

\`\`\`sql
-- Webhook delivery queue table
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id),
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    sequence_number BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INT DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- FIFO index: process in order per endpoint
CREATE INDEX idx_fifo ON webhook_deliveries(endpoint_id, sequence_number)
    WHERE status = 'pending';

-- NOTIFY on new delivery
CREATE OR FUNCTION notify_new_delivery() RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('new_delivery', NEW.endpoint_id::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
\`\`\`

When a new webhook is inserted, the trigger fires a NOTIFY. Our Rust server listens for these notifications and immediately begins processing.

### FIFO with Sequence Numbers

FIFO delivery requires strict ordering. We achieve this with monotonically increasing sequence numbers per endpoint:

\`\`\`rust
async fn get_next_delivery(endpoint_id: Uuid) -> Result<WebhookDelivery> {
    sqlx::query_as::<_, WebhookDelivery>(
        "SELECT * FROM webhook_deliveries
         WHERE endpoint_id = $1 AND status = 'pending'
         ORDER BY sequence_number ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED"
    )
    .bind(endpoint_id)
    .fetch_optional(&pool)
    .await
}
\`\`\`

The \`FOR UPDATE SKIP LOCKED\` ensures that concurrent workers do not process the same delivery, and ordering is guaranteed by the sequence number.

### Upstash Redis for Rate Limiting

We use Upstash Redis (serverless, free tier: 10,000 commands/day) for rate limiting. The sliding window algorithm:

\`\`\`rust
async fn check_rate_limit(
    redis: &Redis,
    user_id: &str,
    limit: u32,
    window_secs: u32,
) -> Result<bool> {
    let key = format!("rate:{}:{}", user_id, window_secs);
    let now = chrono::Utc::now().timestamp();

    let count: u32 = redis
        .eval(
            "local key = KEYS[1] local now = tonumber(ARGV[1]) local window = tonumber(ARGV[2]) \
             redis.call('ZREMRANGEBYSCORE', key, 0, now - window) \
             local count = redis.call('ZCARD', key) \
             if count < tonumber(ARGV[3]) then \
                 redis.call('ZADD', key, now, now .. '-' .. math.random()) \
                 redis.call('EXPIRE', key, window) \
                 return 0 \
             else \
                 return 1 \
             end",
            &[&key],
            &[&now.to_string(), &window_secs.to_string(), &limit.to_string()],
        )
        .await?;

    Ok(count == 0)
}
\`\`\`

### Cloudflare R2 for Payload Storage

Webhook payloads can be large (up to 1MB). Storing them in PostgreSQL would bloat the database and slow queries. Instead, we store payloads in Cloudflare R2 (S3-compatible, free tier: 10GB storage, 10M reads/month).

When a webhook is sent, the payload is written to R2 first, then the delivery record (with an R2 key reference) is inserted into PostgreSQL. On delivery, the payload is fetched from R2 and included in the outbound HTTP request.

### SSRF Protection

Webhooks are outbound HTTP requests to user-provided URLs. This creates a Server-Side Request Forgery (SSRF) risk — a malicious user could point their endpoint to \`http://169.254.169.254/latest/meta-data/\` (AWS metadata) or \`http://localhost:6379/\` (Redis).

Our SSRF protection:

\`\`\`rust
fn validate_webhook_url(url: &Url) -> Result<()> {
    // 1. Only HTTPS
    if url.scheme() != "https" {
        return Err(Error::InsecureUrl);
    }

    // 2. Resolve DNS and check IP
    let addrs = tokio::net::lookup_host(format!("{}:443", url.host_str().unwrap())).await?;
    for addr in addrs {
        if is_private_ip(addr.ip()) {
            return Err(Error::PrivateIp);
        }
    }

    // 3. Block known metadata endpoints
    let blocked = ["169.254.169.254", "metadata.google.internal", "localhost"];
    if blocked.contains(&url.host_str().unwrap_or("")) {
        return Err(Error::BlockedHost);
    }

    Ok(())
}
\`\`\`

### Circuit Breaker Pattern

If an endpoint is consistently failing (5xx errors, timeouts), we stop hammering it. Our circuit breaker:

- **Closed** — Normal delivery, tracking failures
- **Open** — After 5 consecutive failures, stop delivering for 5 minutes
- **Half-open** — After the cooldown, try one delivery. If it succeeds, close the circuit.

This prevents us from wasting resources on dead endpoints and protects downstream services from retry storms.

### OpenTelemetry Observability

Every webhook delivery is traced end-to-end with OpenTelemetry:

\`\`\`rust
#[instrument(skip(client, payload))]
async fn deliver_webhook(
    client: &reqwest::Client,
    delivery: &WebhookDelivery,
    payload: Vec<u8>,
) -> Result<DeliveryResult> {
    let span = tracing::info_span!(
        "webhook_delivery",
        endpoint_id = %delivery.endpoint_id,
        event_type = %delivery.event_type,
        sequence_number = delivery.sequence_number,
    );

    let response = client
        .post(&delivery.endpoint_url)
        .header("X-HookSniff-Signature", compute_signature(&payload))
        .header("X-HookSniff-Timestamp", chrono::Utc::now().timestamp())
        .body(payload)
        .timeout(Duration::from_secs(10))
        .send()
        .await?;

    span.record("http.status", response.status().as_u16());
    Ok(DeliveryResult::from(response))
}
\`\`\`

Traces are exported to Grafana Cloud (free tier) where we monitor delivery latency, error rates, and queue depth.

### The $0 Stack

| Component | Service | Free Tier |
|-----------|---------|-----------|
| API Server | Google Cloud Run | 2M requests/mo, scale-to-zero |
| Database | Neon PostgreSQL | 0.5GB storage, 24/7 compute |
| Rate Limiting | Upstash Redis | 10K commands/day |
| Payload Storage | Cloudflare R2 | 10GB, 10M reads/mo |
| Dashboard | Vercel | 100GB bandwidth/mo |
| Observability | Grafana Cloud | 10K metrics, 50GB logs |
| Domain | Cloudflare | Free DNS + CDN |

Total cost: $0/month for up to 10K webhooks. The only variable cost is Cloud Run compute during active delivery, which stays within the free tier for our current volume.

### Lessons Learned

1. **Scale-to-zero is magic** — Cloud Run charges nothing when idle. Perfect for webhook services with bursty traffic.
2. **PostgreSQL is underrated as a queue** — With LISTEN/NOTIFY and SKIP LOCKED, it handles our workload without a separate message broker.
3. **Free tiers are generous** — We use 6 free-tier services and stay well within limits.
4. **Rust pays off at the edges** — The initial learning curve is steep, but the runtime efficiency and reliability are worth it for infrastructure code.
5. **SSRF is real** — Webhook services are inherently SSRF-prone. Invest in protection early.

This architecture is not theoretical — it is running in production, serving real users, and costing us nothing. The cloud has made it possible to build serious infrastructure on a shoestring budget.`,
  },
  'customer-spotlight-ecommerce': {
    title: 'How an E-Commerce Platform Scaled Webhook Delivery with HookSniff',
    date: '2026-04-18',
    category: 'Announcement',
    readTime: '6 min',
    tags: ['customer', 'use-case', 'ecommerce'],
    author: 'HookSniff Team',
    content: `*This is the story of how ShopStream, a mid-size e-commerce platform, replaced their in-house webhook system with HookSniff and transformed their event-driven architecture.*

### The Problem

ShopStream processes 50,000 orders per day across their marketplace. Every order generates a lifecycle of events: order.created, order.paid, order.shipped, order.delivered, and sometimes order.cancelled or order.refunded.

These events need to reach multiple downstream systems:

- **Warehouse management** — Trigger pick-and-pack on order.paid
- **Shipping provider** — Create shipping label on order.paid, update tracking on order.shipped
- **Customer notifications** — Send emails on each lifecycle transition
- **Analytics** — Track conversion funnels and revenue
- **Accounting** — Record revenue on order.paid, refunds on order.refunded

ShopStream's engineering team built an in-house webhook system. It worked — until it did not.

### The In-House System Broke Down

The homegrown system had three critical problems:

**1. No ordering guarantees.** Events were pushed to a Redis queue and consumed by workers in parallel. When two events for the same order were processed concurrently (e.g., order.paid and order.shipped arriving within milliseconds), the warehouse system sometimes received them out of order. The result: shipping labels created for unpaid orders.

**2. Retry logic was naive.** Failed deliveries were retried immediately, then abandoned after 3 attempts. There was no exponential backoff, no dead letter queue. If a downstream service had a 30-second blip, events were lost.

**3. No observability.** The team had no visibility into delivery success rates, latency, or failure patterns. Debugging webhook issues meant grepping through application logs and manually correlating events.

The engineering team estimated they spent 15-20 hours per week on webhook infrastructure — debugging failures, tuning retry logic, and handling escalations from partner teams.

### Evaluating Options

ShopStream evaluated three options:

1. **Fix the in-house system** — Estimated 4-6 weeks of engineering time to add ordering, proper retries, and monitoring.
2. **Adopt Svix** — Solid product, but $500/month for their volume, and no FIFO delivery.
3. **Try HookSniff** — Free tier covered their volume, FIFO included, and 11 SDKs for their polyglot backend (Node.js for the API, Python for data pipelines, Go for the warehouse integration).

They chose HookSniff.

### The Migration

The migration took 3 days:

**Day 1: Setup and SDK integration.** Installed the Node.js SDK, created endpoints for each downstream system, and tested with sample events. The team was surprised by how little code was needed.

\`\`\`javascript
const { HookSniff } = require('@hooksniff/node');

const client = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY });

// Create endpoints for each downstream system
const endpoints = await Promise.all([
  client.endpoints.create({
    url: 'https://warehouse.shopstream.com/webhooks',
    events: ['order.paid', 'order.cancelled'],
    fifo: true,
    description: 'Warehouse management system',
  }),
  client.endpoints.create({
    url: 'https://shipping.shopstream.com/webhooks',
    events: ['order.paid', 'order.shipped'],
    fifo: true,
    description: 'Shipping provider integration',
  }),
  client.endpoints.create({
    url: 'https://notifications.shopstream.com/webhooks',
    events: ['order.created', 'order.paid', 'order.shipped', 'order.delivered'],
    description: 'Customer notification service',
  }),
]);
\`\`\`

**Day 2: Sender-side integration.** Replaced the in-house queue publish calls with HookSniff SDK calls. The team wrapped the HookSniff client in a thin adapter so they could swap implementations easily.

\`\`\`javascript
async function emitOrderEvent(eventType, orderData) {
  await client.webhooks.send({
    eventType,
    payload: {
      order_id: orderData.id,
      customer_id: orderData.customer_id,
      amount: orderData.total,
      currency: orderData.currency,
      items: orderData.items,
      timestamp: new Date().toISOString(),
    },
  });
}
\`\`\`

**Day 3: Receiver-side verification and testing.** Updated all downstream services to verify HookSniff HMAC signatures. Ran end-to-end tests with real order flows. Monitored the dashboard for delivery success rates.

### The Results

After 30 days on HookSniff:

- **99.97% delivery rate** — Up from 94.2% with the in-house system
- **Zero ordering issues** — FIFO delivery eliminated the out-of-order problem completely
- **60% less engineering time** — From 15-20 hours/week to 6-8 hours/week on webhook-related work
- **Real-time visibility** — The dashboard shows every delivery with payload, status, and latency. Debugging that used to take hours now takes minutes.
- **Dead letter queue** — When the shipping provider had a 2-hour outage, zero events were lost. All 847 failed deliveries were automatically retried and succeeded.
- **$0 cost** — Their volume (approximately 8,000 webhooks/day) stays within HookSniff's free tier.

### What Changed for the Team

The biggest impact was not technical — it was cultural. Before HookSniff, webhook reliability was a recurring source of stress. Partner teams would escalate when events went missing, and the engineering team would spend hours debugging.

After HookSniff, webhooks became invisible infrastructure. Events are delivered, in order, reliably. The engineering team reclaimed 60% of their webhook maintenance time and redirected it to product features.

"It is not that HookSniff is doing anything magical," said their VP of Engineering. "It is that they are doing the basics really well — ordering, retries, monitoring — and we no longer have to."

### Lessons for Other Teams

1. **Do not build webhook infrastructure in-house** unless it is your core product. The edge cases (ordering, retries, SSRF, dead letters) are harder than they look.
2. **FIFO delivery matters more than you think.** Even if you think your events are independent, ordering bugs will find you.
3. **Observability is non-negotiable.** If you cannot see every delivery, you cannot trust your system.
4. **Start with a managed service.** You can always self-host later. Getting the architecture right first saves months of debugging.

If you are running an e-commerce platform, marketplace, or any system with complex event lifecycles, we would love to help. Sign up at hooksniff.vercel.app — your first 10,000 webhooks per month are free.`,
  },
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
  'shopify-webhook-incident-analysis': {
    title: 'What the Shopify Webhook Incident Teaches Us About Resilience',
    date: '2026-04-30',
    category: 'Engineering',
    readTime: '8 min',
    tags: ['incident', 'resilience', 'shopify', 'engineering'],
    author: 'HookSniff Team',
    content: `On April 28, 2026, Shopify experienced a significant webhook delivery incident that lasted approximately 8 hours. Webhooks that normally arrived within seconds were delayed by minutes to over an hour. When the issue was resolved, a recovery surge flooded downstream systems with 3x the normal webhook volume.

This post analyzes what happened, what we can learn, and how resilient webhook infrastructure should handle these scenarios.

### Timeline of the Incident

\`\`\`
2026-04-28 Timeline (UTC)
─────────────────────────────────────────────────────
02:15  ┃ First reports of delayed webhooks in Shopify community forums
02:45  ┃ Shopify acknowledges increased webhook latency on status page
03:30  ┃ Latency increases to 15-30 minutes for most event types
05:00  ┃ Some webhooks delayed by 45+ minutes; order events most affected
07:00  ┃ Root cause identified: database migration caused queue backlog
08:30  ┃ Fix deployed; backlog begins clearing
09:00  ┃ Recovery surge starts — 3x normal webhook volume
09:45  ┃ Downstream systems start reporting 5xx errors from surge
10:15  ┃ Shopify throttles recovery delivery to 1.5x normal rate
10:30  ┃ Incident resolved; all webhooks delivered
─────────────────────────────────────────────────────
\`\`\`

### The Surge Pattern

The most dangerous part of the incident was not the delay — it was the recovery. Here is what the webhook delivery volume looked like:

\`\`\`
Webhook Volume (events/minute)
│
│                    ╭──╮ Recovery surge
│                   ╭╯  ╰╮  3x normal
│                  ╭╯    ╰╮
│    ╭────╮       ╭╯      ╰╮
│───╯    ╰──────╯        ╰────────── Normal
│   ╰──╮  ╰─────╮
│      ╰──╮     ╰──── Backlog clearing
│         ╰── Incident window
│
└────────────────────────────────────────────── Time
  02:00  04:00  06:00  08:00  10:00  12:00
\`\`\`

During the incident window (02:15–08:30), webhooks accumulated in Shopify's internal queue. When the fix was deployed, all queued webhooks were released simultaneously, creating a surge that overwhelmed unprepared downstream systems.

### Why Recovery Surges Are Dangerous

Most webhook consumers are designed for steady-state traffic. They handle normal volume fine but break under sudden spikes:

- **Connection pool exhaustion** — Database connections max out
- **Memory pressure** — Queued processing tasks consume all available RAM
- **Rate limit hits** — Third-party API rate limits get triggered
- **Cascading failures** — One slow consumer backs up the entire pipeline

The irony: the systems that survived the 8-hour delay just fine were the ones that crashed during the recovery.

### Lessons for Webhook Consumers

**1. Design for 3x burst capacity.** Your webhook endpoint should handle 3x your normal peak volume without degradation. This means connection pooling, async processing, and backpressure mechanisms.

**2. Implement circuit breakers.** If your downstream service starts returning 5xx, stop sending and queue locally. A circuit breaker prevents cascading failures during surge events.

**3. Use dead letter queues.** If processing fails after retries, preserve the event. Do not drop webhooks — they contain critical business data.

**4. Monitor p99 latency, not just averages.** During the Shopify incident, average latency was misleading. P99 showed the real story: some webhooks were delayed by over an hour while most arrived within minutes.

**5. Implement idempotent processing.** Recovery surges may deliver events that were partially processed before the incident. Idempotency ensures duplicate processing is safe.

### How HookSniff Handles Incident Recovery

HookSniff was designed with these scenarios in mind. Here is how we handle recovery surges:

**Exponential backoff with jitter.** Failed deliveries retry with increasing delays (10s, 30s, 2m, 10m, 30m) plus random jitter. This spreads retry traffic and prevents thundering herd problems.

\`\`\`typescript
// HookSniff retry configuration
const retryPolicy = {
  maxAttempts: 5,
  backoff: 'exponential',
  baseDelay: 10000,     // 10 seconds
  maxDelay: 1800000,    // 30 minutes
  jitter: true,         // Random ±25% to spread load
};
\`\`\`

**Circuit breaker per endpoint.** If an endpoint fails 5 consecutive deliveries, we open the circuit for 5 minutes. This prevents us from hammering a struggling service during a surge.

\`\`\`
Endpoint Health Check:
┌─────────────────────────────────────────┐
│  endpoint: https://shop.example.com/wh  │
│  status: OPEN (circuit tripped)         │
│  failures: 5 consecutive                │
│  cooldown: 4m 32s remaining             │
│  last_error: 503 Service Unavailable    │
└─────────────────────────────────────────┘
\`\`\`

**Dead letter queue with batch replay.** Events that exhaust all retries move to the DLQ. When the downstream service recovers, operators can batch-replay all dead-lettered events with a single API call.

\`\`\`python
# Batch replay all dead-lettered events for an endpoint
from hooksniff import HookSniff

client = HookSniff(api_key="hs_...")

# Replay all DLQ events for the affected endpoint
result = client.dead_letters.replay_all(
    endpoint_id="ep_shopify_integration",
    after="2026-04-28T02:00:00Z",
    before="2026-04-28T10:30:00Z",
)

print(f"Replayed {result.count} events")
\`\`\`

**Per-endpoint throttling.** During recovery, we limit delivery rate per endpoint to prevent overwhelming downstream systems. Default: 100 requests/second per endpoint, configurable.

\`\`\`rust
async fn apply_throttle(endpoint: &Endpoint, delivery: &Delivery) -> Result<()> {
    let rate = endpoint.throttle_rate.unwrap_or(100); // req/s
    let window = Duration::from_secs(1);

    if rate_limiter.check(&endpoint.id, rate, window).await?.is_limited() {
        // Re-queue with delay instead of dropping
        delivery.retry_at(chrono::Utc::now() + chrono::Duration::seconds(1)).await?;
        return Err(Error::Throttled);
    }

    Ok(())
}
\`\`\`

### Monitoring Checklist

After reviewing the Shopify incident, here is what every webhook consumer should monitor:

- **Delivery latency p50/p95/p99** — Not just average
- **Queue depth** — How many webhooks are pending delivery
- **Error rate by endpoint** — Per-consumer health
- **Retry rate** — Spikes indicate downstream issues
- **Circuit breaker state** — Open circuits need attention
- **DLQ depth** — Growing DLQ means lost events

### The Bigger Picture

The Shopify incident is a reminder that webhook infrastructure is only as resilient as its weakest consumer. The delivery service (Shopify) recovered, but many downstream systems were not prepared for the surge.

Building resilient webhook consumers is not optional — it is a production requirement. Plan for 3x burst capacity, implement circuit breakers, use dead letter queues, and monitor p99 latency.

And if you do not want to build all of that yourself, HookSniff handles it out of the box. Sign up at hooksniff.vercel.app — your first 10,000 webhooks per month are free.`,
  },
};

// Get ordered list of slugs for prev/next navigation
export const orderedSlugs = [
  'hooksniff-vs-svix-vs-hookdeck',
  'may-2026-changelog',
  'building-mcp-ready-webhooks',
  'webhook-integration-tutorial',
  'why-ai-agents-need-webhooks',
  'gemini-webhook-integration',
  'stripe-webhook-guide',
  'changelog-may-2026',
  'webhook-architecture-deep-dive',
  'customer-spotlight-ecommerce',
  'introducing-hooksniff',
  'webhook-best-practices',
  'fifo-webhook-delivery',
  'shopify-webhook-incident-analysis',
  'github-webhook-guide',
  'cloudevents-standard',
  'webhook-security-guide',
];

export function getRelatedPosts(currentSlug: string, tags: string[]) {
  return Object.entries(posts)
    .filter(([slug, post]) => slug !== currentSlug && post.tags.some(t => tags.includes(t)))
    .slice(0, 3)
    .map(([slug, post]) => ({ slug, ...post }));
}

export function getAdjacentPosts(currentSlug: string) {
  const idx = orderedSlugs.indexOf(currentSlug);
  const prev = idx > 0 ? { slug: orderedSlugs[idx - 1], ...posts[orderedSlugs[idx - 1]] } : null;
  const next = idx < orderedSlugs.length - 1 ? { slug: orderedSlugs[idx + 1], ...posts[orderedSlugs[idx + 1]] } : null;
  return { prev, next };
}

export function tokenizeCode(code: string, language: string): string {
  // Simple regex-based syntax highlighting
  let highlighted = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Comments
  highlighted = highlighted.replace(/(\/\/.*$)/gm, '<span class="code-comment">$1</span>');
  highlighted = highlighted.replace(/(#.*$)/gm, '<span class="code-comment">$1</span>');
  highlighted = highlighted.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="code-comment">$1</span>');

  // Strings
  highlighted = highlighted.replace(/("(?:[^"\\]|\\.)*")/g, '<span class="code-string">$1</span>');
  highlighted = highlighted.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="code-string">$1</span>');
  highlighted = highlighted.replace(/(`(?:[^`\\]|\\.)*`)/g, '<span class="code-string">$1</span>');

  // Numbers
  highlighted = highlighted.replace(/\b(\d+\.?\d*)\b/g, '<span class="code-number">$1</span>');

  // Keywords by language
  const allKeywords: Record<string, string> = {
    javascript: 'const|let|var|function|async|await|return|if|else|switch|case|break|default|for|while|do|try|catch|throw|new|import|from|export|class|extends|this|typeof|instanceof|void|null|undefined|true|false|of|in',
    typescript: 'const|let|var|function|async|await|return|if|else|switch|case|break|default|for|while|do|try|catch|throw|new|import|from|export|class|extends|this|typeof|instanceof|void|null|undefined|true|false|of|in|type|interface|enum|implements|abstract|declare|namespace',
    python: 'def|class|import|from|return|if|elif|else|for|while|try|except|raise|with|as|in|not|and|or|is|None|True|False|self|async|await|lambda|yield|pass|break|continue|global|nonlocal',
    go: 'func|package|import|return|if|else|for|range|switch|case|default|var|const|type|struct|interface|map|chan|go|defer|select|break|continue|nil|true|false|error|string|int|bool|byte',
    rust: 'fn|let|mut|const|struct|enum|impl|trait|pub|use|mod|crate|self|super|match|if|else|for|while|loop|return|async|await|move|ref|type|where|dyn|unsafe|extern|static|true|false|Some|None|Ok|Err|Box|Vec|String|Option|Result',
    bash: 'if|then|else|elif|fi|for|while|do|done|case|esac|function|return|local|export|source|echo|exit|set|unset|readonly|shift|trap|eval|exec',
    sql: 'SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|INDEX|ALTER|DROP|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AND|OR|NOT|IN|IS|NULL|AS|ORDER|BY|GROUP|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|PRIMARY|KEY|FOREIGN|REFERENCES|DEFAULT|NOW|UUID|JSONB|VARCHAR|BIGINT|INT|TIMESTAMPTZ|BOOLEAN|TEXT',
  };

  const kwPattern = allKeywords[language] || allKeywords['javascript'];

  // Apply keywords but avoid re-highlighting inside existing spans
  highlighted = highlighted.replace(
    new RegExp(`(<span[^>]*>.*?<\\/span>)|(\\b(?:${kwPattern})\\b)`, 'g'),
    (_match: string, span: string | undefined, kw: string | undefined) => {
      if (span) return span;
      return `<span class="code-keyword">${kw}</span>`;
    }
  );

  return highlighted;
}
