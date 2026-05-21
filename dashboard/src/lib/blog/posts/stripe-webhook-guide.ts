import type { Post } from '../data';

export const post: Post = {
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
};
