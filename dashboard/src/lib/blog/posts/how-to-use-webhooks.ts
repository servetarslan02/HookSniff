import type { Post } from '../data';

export const post: Post = {
    title: 'How to Use Webhooks: A Step-by-Step Guide for Beginners',
    date: '2026-05-22',
    category: 'Standard',
    readTime: '10 min',
    tags: ['webhooks', 'tutorial', 'beginner', 'guide', 'how-to'],
    author: 'HookSniff Team',
    content: `Webhooks allow applications to communicate in real-time. Instead of constantly checking for updates, webhooks send data to your application the moment something happens. Here is exactly how to use them.

## What You Will Learn

By the end of this guide you will know:
- How webhooks work behind the scenes
- How to create a webhook receiver in any language
- How to verify webhook signatures
- How to handle errors and retries
- How to test webhooks locally

## How Webhooks Work

A webhook is an HTTP POST request that a service sends to your URL when an event occurs.

**The flow:**
1. You give a service your URL (the "webhook endpoint")
2. Something happens in that service (a payment, a sign-up, a push)
3. The service sends an HTTP POST request to your URL with event data
4. Your server receives the request and processes it
5. Your server responds with HTTP 200 to acknowledge receipt

That is it. A webhook is just an automated HTTP POST.

## Step 1: Create a Webhook Receiver

You need a server that listens for incoming HTTP POST requests. Here is how to do it in the most popular languages.

### Node.js (Express)

\`\`\`javascript
const express = require('express');
const app = express();

// Parse raw body for signature verification
app.use('/webhooks', express.raw({ type: 'application/json' }));

app.post('/webhooks', (req, res) => {
  const event = JSON.parse(req.body);
  console.log('Received event:', event.type);
  
  // Process the event
  handleEvent(event);
  
  // Acknowledge receipt
  res.status(200).json({ received: true });
});

function handleEvent(event) {
  switch (event.type) {
    case 'payment.completed':
      console.log('Payment received:', event.data.amount);
      break;
    case 'user.created':
      console.log('New user:', event.data.email);
      break;
    default:
      console.log('Unknown event:', event.type);
  }
}

app.listen(3000, () => {
  console.log('Webhook receiver running on port 3000');
});
\`\`\`

### Python (Flask)

\`\`\`python
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/webhooks', methods=['POST'])
def handle_webhook():
    event = request.json
    print(f"Received event: {event['type']}")
    
    if event['type'] == 'payment.completed':
        print(f"Payment received: {event['data']['amount']}")
    elif event['type'] == 'user.created':
        print(f"New user: {event['data']['email']}")
    
    return jsonify({'received': True}), 200

if __name__ == '__main__':
    app.run(port=3000)
\`\`\`

### Go (net/http)

\`\`\`go
package main

import (
    "encoding/json"
    "fmt"
    "net/http"
)

type Event struct {
    Type string                 \`json:"type"\`
    Data map[string]interface{} \`json:"data"\`
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodPost {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    var event Event
    if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
        http.Error(w, "Invalid JSON", http.StatusBadRequest)
        return
    }

    fmt.Printf("Received event: %s\\n", event.Type)
    
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    w.Write([]byte(\`{"received": true}\`))
}

func main() {
    http.HandleFunc("/webhooks", handleWebhook)
    fmt.Println("Webhook receiver running on port 3000")
    http.ListenAndServe(":3000", nil)
}
\`\`\`

### PHP

\`\`\`php
<?php
// webhooks.php
$input = file_get_contents('php://input');
$event = json_decode($input, true);

error_log("Received event: " . $event['type']);

switch ($event['type']) {
    case 'payment.completed':
        error_log("Payment received: " . $event['data']['amount']);
        break;
    case 'user.created':
        error_log("New user: " . $event['data']['email']);
        break;
}

http_response_code(200);
echo json_encode(['received' => true]);
?>
\`\`\`

## Step 2: Verify the Signature

**This is the most important step.** Anyone can send a POST request to your URL. Signature verification ensures the webhook came from the trusted service.

Most webhook services include a signature header. Here is how to verify it:

### How HMAC Signature Verification Works

1. The service has a secret key (you get this when you set up the webhook)
2. When sending a webhook, the service computes: \`signature = HMAC-SHA256(secret, payload)\`
3. The service includes this signature in a header
4. You compute the same HMAC with your copy of the secret
5. If the signatures match, the webhook is authentic

### Node.js Signature Verification

\`\`\`javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  // Constant-time comparison prevents timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your webhook handler:
app.post('/webhooks', express.raw({ type: 'application/json' }), (req, res) => {
  const signature = req.headers['x-webhook-signature'];
  const secret = process.env.WEBHOOK_SECRET;
  
  if (!verifyWebhookSignature(req.body, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  const event = JSON.parse(req.body);
  handleEvent(event);
  res.status(200).json({ received: true });
});
\`\`\`

### Python Signature Verification

\`\`\`python
import hmac
import hashlib

def verify_signature(payload, signature, secret):
    expected = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

@app.route('/webhooks', methods=['POST'])
def handle_webhook():
    signature = request.headers.get('x-webhook-signature')
    secret = os.environ['WEBHOOK_SECRET']
    
    if not verify_signature(request.data.decode(), signature, secret):
        return jsonify({'error': 'Invalid signature'}), 401
    
    event = request.json
    handle_event(event)
    return jsonify({'received': True}), 200
\`\`\`

## Step 3: Respond Quickly

Webhook services have timeouts. If your server takes too long to respond, the service will think the delivery failed and retry.

**Rules:**
- Respond with HTTP 200 within 5 seconds
- Do heavy processing in the background
- Use a queue if processing takes longer than a few seconds

\`\`\`javascript
app.post('/webhooks', async (req, res) => {
  const event = JSON.parse(req.body);
  
  // Respond immediately
  res.status(200).json({ received: true });
  
  // Process in background
  try {
    await processEventAsync(event);
  } catch (error) {
    console.error('Processing failed:', error);
    // Log for debugging — the webhook service will not retry
    // because we already sent 200
  }
});
\`\`\`

## Step 4: Handle Retries and Idempotency

Webhook services retry failed deliveries. Your endpoint might receive the same event multiple times. Make your processing idempotent.

\`\`\`javascript
const processedEvents = new Set();

async function processEventAsync(event) {
  // Check if already processed
  if (processedEvents.has(event.id)) {
    console.log('Duplicate event, skipping:', event.id);
    return;
  }
  
  // Process the event
  await doWork(event);
  
  // Mark as processed
  processedEvents.add(event.id);
  
  // For production, use a database instead of a Set:
  // await db.processedEvents.create({ eventId: event.id });
}
\`\`\`

## Step 5: Test Webhooks Locally

You cannot receive webhooks on localhost without a public URL. Use one of these tools:

### Option 1: ngrok

\`\`\`bash
# Install ngrok
npm install -g ngrok

# Start your local server
node server.js

# In another terminal, expose port 3000
ngrok http 3000
\`\`\`

ngrok gives you a public URL like \`https://abc123.ngrok.io\`. Use this as your webhook URL.

### Option 2: HookSniff Playground

HookSniff has a built-in webhook playground where you can send test webhooks and see the delivery in real-time. No setup required.

### Option 3: Manual Testing with curl

\`\`\`bash
# Send a test webhook to your local server
curl -X POST http://localhost:3000/webhooks \\
  -H "Content-Type: application/json" \\
  -H "x-webhook-signature: test123" \\
  -d '{"type":"payment.completed","data":{"amount":99.99}}'
\`\`\`

## Step 6: Go to Production

Before going live, check these items:

- [ ] Signature verification is implemented
- [ ] Timestamp validation prevents replay attacks
- [ ] Endpoint responds within 5 seconds
- [ ] Processing is idempotent
- [ ] Error logging is in place
- [ ] Monitoring and alerts are configured
- [ ] Dead letter queue is set up for failed deliveries

## Common Mistakes to Avoid

### 1. Not Verifying Signatures
\`\`\`javascript
// DANGEROUS: Processing any POST request
app.post('/webhooks', (req, res) => {
  processEvent(req.body); // Anyone can send this!
  res.status(200).send('OK');
});

// SAFE: Verify signature first
app.post('/webhooks', (req, res) => {
  if (!verifySignature(req)) {
    return res.status(401).send('Unauthorized');
  }
  processEvent(req.body);
  res.status(200).send('OK');
});
\`\`\`

### 2. Processing Synchronously
\`\`\`javascript
// BAD: Slow response causes retries
app.post('/webhooks', async (req, res) => {
  await sendEmail(req.body);        // 2 seconds
  await updateDatabase(req.body);   // 1 second
  await notifyTeam(req.body);       // 1 second
  res.status(200).send('OK');       // Total: 4 seconds — might timeout!
});

// GOOD: Respond immediately, process later
app.post('/webhooks', (req, res) => {
  res.status(200).send('OK');
  queue.add(() => processEvent(req.body));
});
\`\`\`

### 3. Not Handling Duplicates
\`\`\`javascript
// BAD: Processing duplicates
app.post('/webhooks', async (req, res) => {
  await chargeCustomer(req.body.amount); // Might charge twice!
  res.status(200).send('OK');
});

// GOOD: Idempotent processing
app.post('/webhooks', async (req, res) => {
  if (await alreadyProcessed(req.body.id)) {
    return res.status(200).send('Already handled');
  }
  await chargeCustomer(req.body.amount);
  await markProcessed(req.body.id);
  res.status(200).send('OK');
});
\`\`\`

## What is Next?

Now that you know how to use webhooks, you need infrastructure to make them reliable:

- **Automatic retries** when your server is down
- **Signature verification** built-in
- **Dead letter queue** for debugging failures
- **Real-time monitoring** of all deliveries

HookSniff handles all of this. You focus on your application logic, HookSniff handles the webhook infrastructure.

Start for free at [hooksniff.com](https://hooksniff.com) — 10,000 events per month, no credit card required.`,
};
