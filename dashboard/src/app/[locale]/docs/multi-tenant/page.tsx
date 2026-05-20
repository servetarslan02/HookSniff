import CodeBlock from '@/components/CodeBlock';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Building2 , Check, X } from '@/components/icons';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Multi-Tenant Webhooks — HookSniff Docs',
  description: 'Build multi-tenant webhook systems where each customer gets their own endpoints and signing secrets',
};

export default async function MultiTenantPage() {
  const t = await getTranslations('docsMultiTenant');
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2"><Building2 size={16} strokeWidth={1.75} className="inline-block align-text-bottom mr-1" /> {t('title')}</h1>
      <p className="text-lg text-gray-600 dark:text-slate-400 mb-8">
        {t('subtitle')}
      </p>

      {/* Architecture */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('architecture')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('architectureDesc')}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('registrationFlow')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('registrationFlowDesc')}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('sendingEvents')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('sendingEventsDesc')}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('customerPortal')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('customerPortalDesc')}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('handlingWebhooks')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('handlingWebhooksDesc')}
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('bestPractices')}</h2>
        <div className="space-y-4 not-prose">
          {[
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('bpOneEndpoint'), desc: t('bpOneEndpointDesc') },
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('bpEncryptSecrets'), desc: t('bpEncryptSecretsDesc') },
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('bpEventFiltering'), desc: t('bpEventFilteringDesc') },
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('bpRateLimit'), desc: t('bpRateLimitDesc') },
            { icon: <Check size={16} strokeWidth={1.75} className="text-emerald-500" />, title: t('bpPortal'), desc: t('bpPortalDesc') },
            { icon: <X size={16} strokeWidth={1.75} className="text-red-500" />, title: t('bpDontShare'), desc: t('bpDontShareDesc') },
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('fullExample')}</h2>
        <p className="text-gray-600 dark:text-slate-400 mb-4">
          {t('fullExampleDesc')}
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
