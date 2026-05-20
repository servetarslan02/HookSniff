import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { Bell, Building2, DollarSign, Globe, Rocket, ShoppingCart } from '@/components/icons';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Real-World Examples — HookSniff Docs',
  description: 'Production webhook patterns for e-commerce, CI/CD, notifications, and more',
};

export default function RealWorldExamplesPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"><Globe size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Real-World Examples</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Production webhook patterns you can copy and adapt. Each example includes the full flow: sending, receiving, and processing.
      </p>

      {/* E-Commerce */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><ShoppingCart size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> E-Commerce: Order Lifecycle</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Track orders through creation, payment, fulfillment, and delivery. Notify your warehouse, accounting, and customer service systems.
        </p>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">1. Create Endpoints</h3>
        <CodeBlock
          code={`// Warehouse endpoint
const warehouse = await hs.endpoint.create({
  url: 'https://warehouse.myapp.com/webhook',
  description: 'Warehouse notifications',
  event_types: ['order.created', 'order.paid', 'order.cancelled'],
});

// Accounting endpoint
const accounting = await hs.endpoint.create({
  url: 'https://accounting.myapp.com/webhook',
  description: 'Accounting system',
  event_types: ['order.paid', 'order.refunded'],
});

// Customer notifications endpoint
const notifications = await hs.endpoint.create({
  url: 'https://notifications.myapp.com/webhook',
  description: 'Customer email/SMS',
  event_types: ['order.shipped', 'order.delivered', 'order.cancelled'],
});`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">2. Send Events</h3>
        <CodeBlock
          code={`// When customer places an order
await hs.message.create({
  endpoint_id: warehouse.id,
  event: 'order.created',
  data: {
    order_id: 'ORD-12345',
    customer: { email: 'john@example.com', name: 'John Doe' },
    items: [
      { sku: 'WIDGET-001', qty: 2, price: 29.99 },
      { sku: 'GADGET-002', qty: 1, price: 49.99 },
    ],
    total: 109.97,
    shipping_address: '123 Main St, City, Country',
  },
});

// When payment is confirmed
await hs.message.create({
  endpoint_id: accounting.id,
  event: 'order.paid',
  data: {
    order_id: 'ORD-12345',
    payment_id: 'PAY-789',
    amount: 109.97,
    currency: 'USD',
    method: 'credit_card',
    paid_at: new Date().toISOString(),
  },
});`}
        />

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 mt-6">3. Receive & Process</h3>
        <CodeBlock
          code={`// Warehouse handler
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = wh.verify(req.body, req.headers);

  // Acknowledge immediately
  res.status(200).send('OK');

  // Process asynchronously
  switch (payload.event) {
    case 'order.created':
      await warehouse.createPickList(payload.data);
      await inventory.reserve(payload.data.items);
      break;
    case 'order.paid':
      await warehouse.startFulfillment(payload.data.order_id);
      break;
    case 'order.cancelled':
      await warehouse.cancelFulfillment(payload.data.order_id);
      await inventory.release(payload.data.items);
      break;
  }
});`}
        />
      </section>

      {/* CI/CD */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><Rocket size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> CI/CD: Deploy Pipeline</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Trigger deployments on code push, run tests on pull requests, and notify your team on Slack.
        </p>

        <CodeBlock
          code={`// 1. Create endpoints
const deploy = await hs.endpoint.create({
  url: 'https://deploy.myapp.com/api/trigger',
  description: 'Deployment service',
  event_types: ['push.main', 'release.created'],
});

const ci = await hs.endpoint.create({
  url: 'https://ci.myapp.com/api/build',
  description: 'CI runner',
  event_types: ['pull_request.opened', 'pull_request.synchronize'],
});

const slack = await hs.endpoint.create({
  url: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
  description: 'Slack notifications',
  event_types: ['push.main', 'release.created', 'build.failed'],
});

// 2. GitHub webhook handler — forward to HookSniff
app.post('/github-webhook', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  // Map GitHub events to HookSniff events
  const eventMap = {
    'push': payload.ref === 'refs/heads/main' ? 'push.main' : null,
    'pull_request': payload.action === 'opened' ? 'pull_request.opened' :
                    payload.action === 'synchronize' ? 'pull_request.synchronize' : null,
    'release': payload.action === 'published' ? 'release.created' : null,
  };

  const hooksniffEvent = eventMap[event];
  if (!hooksniffEvent) return res.status(200).send('Ignored');

  await hs.message.create({
    event: hooksniffEvent,
    data: {
      repo: payload.repository.full_name,
      sha: payload.after || payload.pull_request?.head.sha,
      author: payload.sender.login,
      message: payload.head_commit?.message || payload.pull_request?.title,
    },
  });

  res.status(200).send('OK');
});`}
        />
      </section>

      {/* Notification System */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><Bell size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Multi-Channel Notifications</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Send the same event to multiple channels: Slack, email, SMS, and push notifications. Each endpoint handles its own delivery.
        </p>

        <CodeBlock
          code={`// Create one endpoint per channel
const channels = {
  slack: await hs.endpoint.create({
    url: 'https://hooks.slack.com/services/YOUR/WEBHOOK',
    description: 'Slack #alerts channel',
    event_types: ['alert.*', 'deploy.*'],
  }),
  email: await hs.endpoint.create({
    url: 'https://email-service.myapp.com/webhook',
    description: 'Email notifications',
    event_types: ['alert.critical', 'user.signup'],
  }),
  sms: await hs.endpoint.create({
    url: 'https://sms-service.myapp.com/webhook',
    description: 'SMS for critical alerts',
    event_types: ['alert.critical'],
  }),
  push: await hs.endpoint.create({
    url: 'https://push-service.myapp.com/webhook',
    description: 'Push notifications',
    event_types: ['alert.*', 'message.received'],
  }),
};

// Send event — HookSniff delivers to all matching endpoints
await hs.message.create({
  event: 'alert.critical',
  data: {
    title: 'Database connection pool exhausted',
    severity: 'critical',
    service: 'api-server',
    timestamp: new Date().toISOString(),
  },
});
// → Delivered to: Slack + Email + SMS + Push`}
        />
      </section>

      {/* Multi-Tenant */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><Building2 size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Multi-Tenant Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Let your customers register their own webhook endpoints. Each customer gets their own signing secret.
        </p>

        <CodeBlock
          code={`// Customer registers their webhook endpoint
app.post('/api/webhooks/register', async (req, res) => {
  const { url, events } = req.body;
  const customerId = req.user.id;

  // Create endpoint in HookSniff
  const endpoint = await hs.endpoint.create({
    url,
    description: \`Customer \${customerId}\`,
    event_types: events, // e.g., ['order.created', 'payment.completed']
  });

  // Save to your database
  await db.webhookEndpoints.create({
    customer_id: customerId,
    hooksniff_endpoint_id: endpoint.id,
    signing_secret: endpoint.secret, // Store encrypted!
    url,
    events,
  });

  // Return secret to customer (only shown once)
  res.json({
    endpoint_id: endpoint.id,
    signing_secret: endpoint.secret,
    events,
  });
});

// When your app generates an event
async function notifyCustomers(event, data) {
  // Find all customers subscribed to this event
  const subscribers = await db.webhookEndpoints.find({
    events: { $contains: event },
    active: true,
  });

  // Send to each subscriber's endpoint
  for (const sub of subscribers) {
    await hs.message.create({
      endpoint_id: sub.hooksniff_endpoint_id,
      event,
      data,
    });
  }
}`}
        />
      </section>

      {/* Fintech */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4"><DollarSign size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> Fintech: Payment Events</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Handle payment events with idempotency and audit logging. Critical for financial systems.
        </p>

        <CodeBlock
          code={`// Payment webhook handler with idempotency
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const payload = wh.verify(req.body, req.headers);

  // Acknowledge immediately
  res.status(200).send('OK');

  // Idempotency check
  const existing = await db.processedEvents.findOne({
    webhook_id: payload.data.webhook_id,
  });
  if (existing) return; // Already processed

  // Process payment event
  switch (payload.event) {
    case 'payment.completed':
      await db.transactions.update(
        { order_id: payload.data.order_id },
        { status: 'paid', paid_at: new Date() }
      );
      await accounting.recordRevenue(payload.data);
      await notifications.sendReceipt(payload.data);
      break;

    case 'payment.failed':
      await db.transactions.update(
        { order_id: payload.data.order_id },
        { status: 'failed', error: payload.data.error }
      );
      await notifications.sendPaymentFailed(payload.data);
      break;

    case 'refund.created':
      await db.transactions.update(
        { order_id: payload.data.order_id },
        { status: 'refunded', refunded_at: new Date() }
      );
      await accounting.recordRefund(payload.data);
      break;
  }

  // Mark as processed (idempotency)
  await db.processedEvents.insert({
    webhook_id: payload.data.webhook_id,
    event: payload.event,
    processed_at: new Date(),
  });

  // Audit log
  await db.auditLog.insert({
    action: 'webhook.processed',
    event: payload.event,
    webhook_id: payload.data.webhook_id,
    timestamp: new Date(),
  });
});`}
        />
      </section>
    </article>
  );
}
