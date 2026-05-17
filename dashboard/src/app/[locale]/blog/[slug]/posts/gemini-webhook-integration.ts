import type { Post } from '.../data';

export const post: Post = {
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
};
