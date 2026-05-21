import type { Post } from '../data';

export const post: Post = {
    title: 'Webhook Tutorial: Build Your First Webhook in 15 Minutes',
    date: '2026-05-22',
    category: 'Standard',
    readTime: '11 min',
    tags: ['webhooks', 'tutorial', 'beginner', 'hands-on', 'coding'],
    author: 'HookSniff Team',
    content: `This tutorial teaches you webhooks by building one from scratch. No prior webhook experience needed. By the end, you will have a working webhook sender and receiver.

## What We Are Building

A simple order notification system:
1. An "order service" sends a webhook when an order is placed
2. A "notification service" receives the webhook and sends a confirmation

This is the same pattern used by Stripe, GitHub, Shopify, and every major platform.

## Prerequisites

- Node.js installed (any recent version)
- A terminal/command prompt
- A text editor

## Project Setup

Create a new project folder:

\`\`\`bash
mkdir webhook-tutorial
cd webhook-tutorial
npm init -y
npm install express crypto
\`\`\`

## Part 1: Build the Webhook Receiver

Create \`receiver.js\` — this is the server that listens for webhooks:

\`\`\`javascript
const express = require('express');
const crypto = require('crypto');

const app = express();
const PORT = 3001;
const WEBHOOK_SECRET = 'whsec_my_secret_key_123';

// Parse raw body for signature verification
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Webhook receiver endpoint
app.post('/webhooks/orders', (req, res) => {
  console.log('\\n--- Webhook Received ---');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  
  // Step 1: Get the signature from headers
  const signature = req.headers['x-webhook-signature'];
  const timestamp = req.headers['x-webhook-timestamp'];
  
  if (!signature) {
    console.log('ERROR: No signature header found');
    return res.status(401).json({ error: 'Missing signature' });
  }
  
  // Step 2: Verify the signature
  const payload = \`\${timestamp}.\${req.body}\`;
  const expectedSignature = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');
  
  if (signature !== expectedSignature) {
    console.log('ERROR: Signature mismatch');
    console.log('Expected:', expectedSignature);
    console.log('Got:', signature);
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  console.log('Signature verified!');
  
  // Step 3: Parse and process the event
  const event = JSON.parse(req.body);
  console.log('Event type:', event.type);
  console.log('Order ID:', event.data.order_id);
  console.log('Customer:', event.data.customer_email);
  console.log('Amount:', event.data.amount);
  
  // Step 4: Do something with the event
  switch (event.type) {
    case 'order.created':
      console.log('Processing new order...');
      sendConfirmationEmail(event.data);
      notifyWarehouse(event.data);
      break;
    case 'order.paid':
      console.log('Payment received!');
      updateOrderStatus(event.data.order_id, 'paid');
      break;
    default:
      console.log('Unknown event type:', event.type);
  }
  
  // Step 5: Respond with 200
  console.log('Webhook processed successfully\\n');
  res.status(200).json({ 
    received: true, 
    processed_at: new Date().toISOString() 
  });
});

// Simulated business logic functions
function sendConfirmationEmail(order) {
  console.log(  -> Sending confirmation email to \${order.customer_email});
  console.log(  -> Order \${order.order_id}: \${order.amount} \${order.currency});
}

function notifyWarehouse(order) {
  console.log(  -> Notifying warehouse about order \${order.order_id});
  console.log(  -> Items: \${order.items.length} products);
}

function updateOrderStatus(orderId, status) {
  console.log(  -> Updating order \${orderId} status to: \${status});
}

app.listen(PORT, () => {
  console.log(Webhook receiver running at http://localhost:\${PORT});
  console.log(POST webhooks to http://localhost:\${PORT}/webhooks/orders);
});
\`\`\`

## Part 2: Build the Webhook Sender

Create \`sender.js\` — this simulates a service that sends webhooks:

\`\`\`javascript
const crypto = require('crypto');
const http = require('http');

const WEBHOOK_SECRET = 'whsec_my_secret_key_123';
const RECEIVER_URL = 'http://localhost:3001/webhooks/orders';

function sendWebhook(event) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(event);
    const timestamp = Math.floor(Date.now() / 1000).toString();
    
    // Create signature
    const payload = \`\${timestamp}.\${body}\`;
    const signature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    console.log('\\n--- Sending Webhook ---');
    console.log('Event:', event.type);
    console.log('Signature:', signature);
    
    const url = new URL(RECEIVER_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'x-webhook-signature': signature,
        'x-webhook-timestamp': timestamp,
      },
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('Response:', res.statusCode, data);
        resolve({ statusCode: res.statusCode, body: data });
      });
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Send test events
async function main() {
  // Event 1: New order
  await sendWebhook({
    type: 'order.created',
    data: {
      order_id: 'ord_001',
      customer_email: 'alice@example.com',
      amount: 49.99,
      currency: 'USD',
      items: [
        { sku: 'WIDGET-A', quantity: 2, price: 24.99 },
      ],
    },
  });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 1000));
  
  // Event 2: Payment confirmed
  await sendWebhook({
    type: 'order.paid',
    data: {
      order_id: 'ord_001',
      payment_method: 'credit_card',
      paid_at: new Date().toISOString(),
    },
  });
}

main().catch(console.error);
\`\`\`

## Part 3: Run It

Open two terminal windows:

**Terminal 1 — Start the receiver:**
\`\`\`bash
node receiver.js
\`\`\`

**Terminal 2 — Send webhooks:**
\`\`\`bash
node sender.js
\`\`\`

### Expected Output

**Receiver terminal:**
\`\`\`
Webhook receiver running on http://localhost:3001

--- Webhook Received ---
Signature verified!
Event type: order.created
Order ID: ord_001
Customer: alice@example.com
Amount: 49.99
Processing new order...
  -> Sending confirmation email to alice@example.com
  -> Order ord_001: 49.99 USD
  -> Notifying warehouse about order ord_001
  -> Items: 1 products
Webhook processed successfully

--- Webhook Received ---
Signature verified!
Event type: order.paid
Payment received!
  -> Updating order ord_001 status to: paid
Webhook processed successfully
\`\`\`

**Sender terminal:**
\`\`\`
--- Sending Webhook ---
Event: order.created
Signature: a1b2c3d4...
Response: 200 {"received":true,"processed_at":"2026-05-22T..."}

--- Sending Webhook ---
Event: order.paid
Signature: e5f6g7h8...
Response: 200 {"received":true,"processed_at":"2026-05-22T..."}
\`\`\`

## Part 4: Add Error Handling

Update your receiver to handle common failure scenarios:

\`\`\`javascript
app.post('/webhooks/orders', (req, res) => {
  try {
    // Verify signature
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    
    if (!signature || !timestamp) {
      return res.status(401).json({ error: 'Missing signature headers' });
    }
    
    // Replay protection: reject timestamps older than 5 minutes
    const age = Math.abs(Date.now() / 1000 - parseInt(timestamp));
    if (age > 300) {
      return res.status(401).json({ error: 'Timestamp too old, possible replay attack' });
    }
    
    // Verify signature
    const payload = \`\${timestamp}.\${req.body}\`;
    const expected = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(payload)
      .digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    // Process
    const event = JSON.parse(req.body);
    processEvent(event);
    
    res.status(200).json({ received: true });
    
  } catch (error) {
    console.error('Webhook error:', error.message);
    // Return 500 so the sender knows to retry
    res.status(500).json({ error: 'Internal server error' });
  }
});
\`\`\`

## Part 5: Test Failure and Retry

Simulate a server error to see how retries work:

\`\`\`javascript
let attemptCount = 0;

app.post('/webhooks/orders', (req, res) => {
  attemptCount++;
  console.log(Attempt #\${attemptCount});
  
  // Simulate failure on first two attempts
  if (attemptCount <= 2) {
    console.log('Simulating server error...');
    return res.status(500).json({ error: 'Database connection failed' });
  }
  
  // Succeed on third attempt
  console.log('Processing succeeded!');
  const event = JSON.parse(req.body);
  processEvent(event);
  res.status(200).json({ received: true });
});
\`\`\`

In production, webhook services like HookSniff automatically retry failed deliveries with exponential backoff.

## What You Learned

1. **Webhooks are HTTP POST requests** — nothing more
2. **Signature verification** ensures the webhook is authentic
3. **Respond with 200 quickly** — process in the background
4. **Idempotency** prevents duplicate processing
5. **Error handling** with proper status codes enables retries

## Next Steps

- **Add a database** to track processed events
- **Add a queue** (like BullMQ or Redis) for background processing
- **Add monitoring** to track delivery success rates
- **Use a webhook service** like HookSniff for production — automatic retries, signature verification, dead letter queue, and real-time monitoring

Try HookSniff free at [hooksniff.com](https://hooksniff.com). 10,000 events per month, no credit card required.`,
};
