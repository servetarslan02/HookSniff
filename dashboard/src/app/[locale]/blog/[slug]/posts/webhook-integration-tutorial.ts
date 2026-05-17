import type { Post } from '../data';

export const post: Post = {

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
};
