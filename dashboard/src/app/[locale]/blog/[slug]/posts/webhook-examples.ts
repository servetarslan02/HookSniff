import type { Post } from '../data';

export const post: Post = {
    title: 'Webhook Examples: Real-World Use Cases Across 10 Industries',
    date: '2026-05-22',
    category: 'Standard',
    readTime: '9 min',
    tags: ['webhooks', 'examples', 'use-cases', 'tutorial', 'integration'],
    author: 'HookSniff Team',
    content: `Webhooks power modern software. From payment processing to AI agents, here are real-world webhook examples you can learn from and implement today.

## 1. Payment Processing

The most common webhook use case. When a payment succeeds, fails, or gets refunded, the payment provider notifies your app.

### Stripe Payment Webhook
\`\`\`javascript
app.post('/webhooks/stripe', async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'payment_intent.succeeded':
      const payment = event.data.object;
      await fulfillOrder(payment.metadata.orderId);
      await sendReceipt(payment.customer, payment.amount);
      break;

    case 'payment_intent.payment_failed':
      await notifyCustomer(event.data.object.customer);
      await flagOrder(event.data.object.metadata.orderId, 'payment_failed');
      break;

    case 'charge.refunded':
      await processRefund(event.data.object.id);
      await updateInventory(event.data.object.metadata.orderId);
      break;
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** You do not need to poll Stripe every second. Payments arrive instantly.

## 2. GitHub Repository Events

Automate your development workflow when code changes happen.

### GitHub Push and PR Webhook
\`\`\`javascript
app.post('/webhooks/github', async (req, res) => {
  const event = req.headers['x-github-event'];
  const payload = req.body;

  switch (event) {
    case 'push':
      if (payload.ref === 'refs/heads/main') {
        await triggerDeploy(payload.repository.name);
        await notifySlack('New deploy triggered for ' + payload.repository.name);
      }
      break;

    case 'pull_request':
      if (payload.action === 'opened') {
        await runCIPipeline(payload.pull_request);
        await requestReview(payload.pull_request);
      }
      break;

    case 'issues':
      if (payload.action === 'opened') {
        await createJiraTicket(payload.issue);
        await notifyTeam(payload.issue.assignee);
      }
      break;
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** Your CI/CD pipeline runs automatically. No manual triggers needed.

## 3. E-commerce Order Management

Connect your store to shipping, inventory, and CRM systems.

### Shopify Order Webhook
\`\`\`javascript
app.post('/webhooks/shopify', async (req, res) => {
  const topic = req.headers['x-shopify-topic'];
  const payload = req.body;

  switch (topic) {
    case 'orders/create':
      await reserveInventory(payload.line_items);
      await createShippingLabel(payload.shipping_address);
      await addToCRM(payload.customer);
      break;

    case 'orders/cancelled':
      await releaseInventory(payload.line_items);
      await refundPayment(payload.payment_details);
      await notifyWarehouse(payload.id, 'cancelled');
      break;

    case 'inventory_levels/update':
      if (payload.available < 5) {
        await alertLowStock(payload.product_id, payload.available);
      }
      break;
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** Orders flow through your entire system automatically.

## 4. User Authentication

React to user lifecycle events for security and onboarding.

### Auth Event Webhook
\`\`\`javascript
app.post('/webhooks/auth', async (req, res) => {
  const { event, user } = req.body;

  switch (event) {
    case 'user.created':
      await sendWelcomeEmail(user.email);
      await createDefaultWorkspace(user.id);
      await trackSignup(user.metadata.source);
      break;

    case 'user.password_changed':
      await invalidateAllSessions(user.id);
      await sendSecurityAlert(user.email);
      break;

    case 'user.login_from_new_device':
      await sendLoginAlert(user.email, req.body.device);
      await requireMFA(user.id);
      break;
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** Security events get immediate attention.

## 5. Slack and Team Notifications

Keep your team informed about important events.

### Multi-Service Notification Webhook
\`\`\`javascript
app.post('/webhooks/notify', async (req, res) => {
  const { service, event, data } = req.body;

  const message = formatMessage(service, event, data);

  // Send to multiple channels
  await Promise.all([
    slack.post('#alerts', message),
    discord.post('incidents', message),
    email.send('team@company.com', message),
  ]);

  // Log for audit
  await db.auditLog.create({
    service,
    event,
    data,
    timestamp: new Date(),
  });

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** One event, multiple notification channels.

## 6. AI Agent Integration

Modern AI agents use webhooks to receive context and trigger actions.

### AI Agent Webhook
\`\`\`javascript
app.post('/webhooks/ai-agent', async (req, res) => {
  const { event, context } = req.body;

  switch (event) {
    case 'user.message':
      const response = await ai.processMessage(context.message);
      await sendReply(context.conversationId, response);
      break;

    case 'task.completed':
      await notifyUser(context.userId, context.result);
      await updateTaskStatus(context.taskId, 'done');
      break;

    case 'tool.required':
      const result = await executeTool(context.toolName, context.params);
      await ai.provideToolResult(context.requestId, result);
      break;
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** AI agents react to events in real-time without polling.

## 7. IoT and Smart Devices

Handle device state changes and sensor data.

### IoT Device Webhook
\`\`\`javascript
app.post('/webhooks/iot', async (req, res) => {
  const { deviceId, event, data } = req.body;

  switch (event) {
    case 'temperature.high':
      await alertFacilityManager(deviceId, data.temperature);
      await activateCooling(deviceId);
      break;

    case 'motion.detected':
      await startRecording(deviceId);
      await logSecurityEvent(deviceId, data.location);
      break;

    case 'battery.low':
      await scheduleMaintenance(deviceId);
      await notifyAdmin('Battery low: ' + deviceId);
      break;
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** Devices report events as they happen, not when you ask.

## 8. Email and Communication

React to email events for automation.

### SendGrid Email Webhook
\`\`\`javascript
app.post('/webhooks/email', async (req, res) => {
  const events = req.body; // Array of events

  for (const event of events) {
    switch (event.event) {
      case 'delivered':
        await trackDelivery(event.email, event.timestamp);
        break;

      case 'bounce':
        await markEmailInvalid(event.email);
        await removeFromMailingList(event.email);
        break;

      case 'spam_report':
        await unsubscribeUser(event.email);
        await alertCompliance(event);
        break;

      case 'open':
        await trackEngagement(event.email, 'open');
        await triggerFollowUp(event.email);
        break;
    }
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** Email engagement drives automated follow-ups.

## 9. CRM and Sales Automation

Keep your sales pipeline synchronized.

### HubSpot CRM Webhook
\`\`\`javascript
app.post('/webhooks/crm', async (req, res) => {
  const { objectType, eventType, data } = req.body;

  switch (objectType) {
    case 'deal':
      if (eventType === 'creation') {
        await createProject(data.dealId);
        await assignTeam(data.ownerId);
      }
      if (data.stage === 'closedwon') {
        await triggerOnboarding(data.contactId);
        await sendWelcomeKit(data.contactId);
      }
      break;

    case 'contact':
      if (eventType === 'property_change' && data.property === 'lifecycle_stage') {
        await updateSegmentation(data.contactId, data.value);
      }
      break;
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** Sales events automatically trigger downstream actions.

## 10. Monitoring and Alerts

Get notified when systems have issues.

### Datadog Alert Webhook
\`\`\`javascript
app.post('/webhooks/monitoring', async (req, res) => {
  const { alert_type, title, body, tags } = req.body;

  switch (alert_type) {
    case 'error':
      await createIncident(title, body);
      await pageOnCall(tags.service);
      await updateStatusPage('degraded');
      break;

    case 'warning':
      await logWarning(title, body);
      await notifySlack('#ops', title);
      break;

    case 'recovery':
      await closeIncident(title);
      await updateStatusPage('operational');
      await sendRecoverySummary(title);
      break;
  }

  res.status(200).send('OK');
});
\`\`\`

**What makes this useful:** Incidents get routed to the right people instantly.

## Common Patterns Across All Examples

Every webhook implementation follows the same pattern:

1. **Verify the signature** — Make sure the webhook is authentic
2. **Parse the event type** — Determine what happened
3. **Route to a handler** — Process the specific event
4. **Respond with 200** — Acknowledge receipt quickly
5. **Process asynchronously** — Do heavy work in the background

\`\`\`javascript
// Universal webhook handler template
app.post('/webhooks/:provider', async (req, res) => {
  // 1. Verify signature
  if (!verifySignature(req)) {
    return res.status(401).send('Unauthorized');
  }

  // 2. Respond immediately
  res.status(200).send('OK');

  // 3. Process asynchronously
  try {
    await processWebhook(req.params.provider, req.body);
  } catch (error) {
    console.error('Webhook processing failed:', error);
    // HookSniff will retry if you return non-2xx
  }
});
\`\`\`

## Start Building with Webhooks

These examples show how webhooks connect modern software. The pattern is always the same: register a URL, receive events, process them.

HookSniff handles the hard parts — retries, signatures, monitoring, dead letter queues. You focus on your business logic.

Try it free at [hooksniff.com](https://hooksniff.com). 10,000 events per month, no credit card required.`,
};
