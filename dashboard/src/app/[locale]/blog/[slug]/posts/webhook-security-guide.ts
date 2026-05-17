import type { Post } from '.../data';

export const post: Post = {
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
};
