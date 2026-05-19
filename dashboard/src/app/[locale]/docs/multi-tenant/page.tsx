import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Multi-Tenant Webhooks — HookSniff Docs',
  description: 'Build multi-tenant webhook systems where each customer gets their own endpoints and signing secrets',
};

export default function MultiTenantPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">🏢 Multi-Tenant Webhooks</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        Let your customers register their own webhook endpoints. Each customer gets a unique signing secret and isolated delivery.
      </p>

      {/* Architecture */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Architecture</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Instead of one endpoint for all customers, each customer gets their own HookSniff endpoint. Your app sends events to HookSniff, which delivers to each customer's URL independently.
        </p>
        <CodeBlock
          code={`Your App → HookSniff → Customer A's endpoint (https://a.com/webhook)
                   → Customer B's endpoint (https://b.com/webhook)
                   → Customer C's endpoint (https://c.com/webhook)

Each customer has:
- Unique endpoint URL
- Unique signing secret (whsec_...)
- Independent retry policy
- Independent rate limit`}
        />
      </section>

      {/* Registration Flow */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customer Registration Flow</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When a customer registers for webhooks, create an endpoint in HookSniff and store the details in your database:
        </p>
        <CodeBlock
          code={`// POST /api/webhooks/register
app.post('/api/webhooks/register', authenticate, async (req, res) => {
  const { url, events } = req.body;
  const customerId = req.user.id;

  // 1. Validate URL (must be HTTPS)
  if (!url.startsWith('https://')) {
    return res.status(400).json({ error: 'URL must be HTTPS' });
  }

  // 2. Create endpoint in HookSniff
  const endpoint = await hs.endpoint.create({
    url,
    description: \`Customer \${customerId}\`,
    event_types: events, // e.g., ['order.created', 'payment.completed']
  });

  // 3. Save to your database
  await db.webhookEndpoints.create({
    customer_id: customerId,
    hooksniff_endpoint_id: endpoint.id,
    signing_secret: endpoint.secret, // Store encrypted!
    url,
    events,
    created_at: new Date(),
  });

  // 4. Return secret to customer (only shown once)
  res.json({
    endpoint_id: endpoint.id,
    signing_secret: endpoint.secret,
    events,
    url,
  });
});`}
        />
      </section>

      {/* Sending Events */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Sending Events to All Customers</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          When your app generates an event, find all subscribed customers and send to each:
        </p>
        <CodeBlock
          code={`async function notifyCustomers(event, data) {
  // Find all customers subscribed to this event
  const subscribers = await db.webhookEndpoints.find({
    events: { $contains: event },
    active: true,
  });

  // Send to each subscriber's endpoint
  const promises = subscribers.map(sub =>
    hs.message.create({
      endpoint_id: sub.hooksniff_endpoint_id,
      event,
      data,
    })
  );

  await Promise.all(promises);
  console.log(\`Sent \${event} to \${subscribers.length} customers\`);
}

// Usage
await notifyCustomers('order.created', {
  order_id: 'ORD-12345',
  amount: 99.99,
  currency: 'USD',
});`}
        />
      </section>

      {/* Customer Portal */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Customer Self-Service Portal</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          Let customers manage their own endpoints, view delivery logs, and rotate secrets — without contacting support:
        </p>
        <CodeBlock
          code={`// Generate a portal link for a customer
app.get('/api/webhooks/portal', authenticate, async (req, res) => {
  const customerId = req.user.id;
  const endpoints = await db.webhookEndpoints.find({ customer_id: customerId });

  // Generate portal access for each endpoint
  const links = await Promise.all(
    endpoints.map(ep =>
      hs.portal.generate_link({ endpoint_id: ep.hooksniff_endpoint_id })
    )
  );

  res.json({ links });
});`}
        />
      </section>

      {/* Webhook Handler */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Handling Customer Webhooks</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          If customers send webhooks <em>to you</em> (inbound), verify each one with its unique secret:
        </p>
        <CodeBlock
          code={`app.post('/api/inbound-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  // 1. Identify customer from header or URL path
  const customerId = req.headers['x-customer-id'];
  const endpoint = await db.webhookEndpoints.findOne({ customer_id: customerId });

  if (!endpoint) {
    return res.status(404).json({ error: 'Unknown customer' });
  }

  // 2. Verify signature with customer's secret
  try {
    const wh = new Webhook(endpoint.signing_secret);
    const payload = wh.verify(req.body, {
      'webhook-id': req.headers['webhook-id'],
      'webhook-timestamp': req.headers['webhook-timestamp'],
      'webhook-signature': req.headers['webhook-signature'],
    });

    // 3. Process event
    res.status(200).json({ received: true });

    await processInboundEvent(customerId, payload);
  } catch (err) {
    res.status(401).json({ error: 'Invalid signature' });
  }
});`}
        />
      </section>

      {/* Best Practices */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Best Practices</h2>
        <div className="space-y-4 not-prose">
          {[
            { icon: '✅', title: 'One endpoint per customer', desc: 'Don\'t share endpoints between customers. Each gets their own URL and secret.' },
            { icon: '✅', title: 'Encrypt signing secrets', desc: 'Store signing secrets encrypted at rest. Decrypt only when verifying.' },
            { icon: '✅', title: 'Use event filtering', desc: 'Only send events the customer subscribed to. Use event_types on endpoint creation.' },
            { icon: '✅', title: 'Rate limit per customer', desc: 'Set per-endpoint rate limits to prevent one customer from overwhelming your system.' },
            { icon: '✅', title: 'Offer portal access', desc: 'Let customers view deliveries, rotate secrets, and manage endpoints themselves.' },
            { icon: '❌', title: 'Don\'t share secrets', desc: 'Never share signing secrets between customers or expose them in logs.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-xl">
              <span className="text-xl">{icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Full Example */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Full Example: SaaS Platform</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          A complete example for a SaaS platform where each tenant can subscribe to events:
        </p>
        <CodeBlock
          code={`// Database schema
CREATE TABLE webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  hooksniff_endpoint_id TEXT NOT NULL,
  signing_secret_encrypted BYTEA NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_webhook_endpoints_customer ON webhook_endpoints(customer_id);
CREATE INDEX idx_webhook_endpoints_events ON webhook_endpoints USING GIN(events);

// Tenant isolation middleware
function tenantIsolation(req, res, next) {
  req.tenantId = req.user.tenant_id;
  next();
}

// All webhook queries are scoped to tenant
app.get('/api/webhooks', tenantIsolation, async (req, res) => {
  const endpoints = await db.webhookEndpoints.find({
    customer_id: req.tenantId,
  });
  res.json({ endpoints });
});`}
        />
      </section>
    </article>
  );
}
