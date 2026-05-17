import type { Post } from '../data';

export const post: Post = {

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
};
