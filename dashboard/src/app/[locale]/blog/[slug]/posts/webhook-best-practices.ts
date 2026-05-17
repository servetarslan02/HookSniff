import type { Post } from '.../data';

export const post: Post = {
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
};
