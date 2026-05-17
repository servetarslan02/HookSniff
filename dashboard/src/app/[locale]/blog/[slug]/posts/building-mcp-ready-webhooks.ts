import type { Post } from '../data';

export const post: Post = {
    title: 'Building an MCP-Ready Webhook Service: Lessons from HookSniff',
    date: '2026-05-09',
    category: 'AI & Agents',
    readTime: '8 min',
    tags: ['mcp', 'ai', 'agents', 'architecture'],
    author: 'HookSniff Team',
    content: `The Model Context Protocol (MCP) is changing how AI agents interact with external tools and data sources. But MCP has a blind spot: it assumes synchronous request-response. The real world is asynchronous, and webhooks are how we bridge that gap.

This post shares the architectural decisions we made building HookSniff to work alongside MCP-based agent systems.

### The Synchronous Assumption

MCP servers expose tools that an agent can call. The agent sends a request, the server processes it, and returns a response. This works beautifully for:

- Reading a database
- Calling an API
- Searching a knowledge base
- Generating a document

But it breaks down for events that happen *outside* the agent's request cycle:

- A customer places an order
- A CI build completes
- A payment fails
- A file is uploaded

The agent cannot sit and poll for these events — it would waste compute, introduce latency, and create scaling problems. This is exactly the problem webhooks solve.

### The Hybrid Architecture

The pattern we recommend for MCP + webhooks:

1. **Agent calls MCP tool** — synchronous operations (create order, query data)
2. **External system fires webhook** — asynchronous events (order paid, build complete)
3. **Webhook triggers agent action** — HookSniff delivers the event, which wakes up the agent or enqueues a new task

This hybrid approach gives you the best of both worlds: MCP's structured tool interface for agent-initiated actions, and webhooks for system-initiated events.

### FIFO Delivery for Agent State Machines

AI agents often operate as state machines. They transition through states based on external events:

\`\`\`
WAITING_FOR_PAYMENT → PAYMENT_RECEIVED → PROCESSING_ORDER → SHIPPED → DELIVERED
\`\`\`

If events arrive out of order, the agent's state machine breaks. Imagine receiving "order.shipped" before "order.paid" — the agent would try to ship an unpaid order.

HookSniff's FIFO delivery ensures events arrive in the exact sequence they were emitted. Each endpoint gets a monotonically increasing sequence number, and deliveries are blocked until prior events are acknowledged.

\`\`\`typescript
// HookSniff SDK with FIFO enabled
const client = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY });

await client.endpoints.create({
  url: 'https://agent.example.com/webhooks',
  fifo: true,  // Enable ordered delivery
  description: 'Agent state machine events',
});
\`\`\`

### Schema Validation for Structured Agent Input

LLMs are powerful but unpredictable. If you pass unstructured JSON to an agent, you get unpredictable results. Schema validation ensures the agent receives exactly the data shape it expects.

HookSniff's schema registry lets you define JSON Schemas for your webhook payloads:

\`\`\`json
{
  "type": "object",
  "required": ["event_type", "order_id", "timestamp"],
  "properties": {
    "event_type": {
      "type": "string",
      "enum": ["order.created", "order.paid", "order.shipped"]
    },
    "order_id": { "type": "string", "format": "uuid" },
    "timestamp": { "type": "string", "format": "date-time" }
  }
}
\`\`\`

If a webhook payload does not match the schema, HookSniff rejects it before delivery. The agent never sees malformed data.

### Dead Letter Queue for Agent Reliability

Agents are not always available. They might be processing a long-running task, experiencing high load, or temporarily down. Without a dead letter queue, these events are lost.

HookSniff retries delivery with exponential backoff (10s, 30s, 2m, 10m, 30m). After all retries are exhausted, the event moves to the dead letter queue where it can be:

- Inspected via the dashboard
- Manually replayed
- Batch-replayed when the agent comes back online

\`\`\`python
# Replay all dead-lettered events for an endpoint
from hooksniff import HookSniff

client = HookSniff(api_key="hs_...")

# Get dead-lettered events
dlq_events = client.dead_letters.list(endpoint_id="ep_abc123")

# Replay them
for event in dlq_events:
    client.dead_letters.retry(event.id)
\`\`\`

### Integration Pattern: HookSniff + MCP Server

Here is a complete example of an MCP server that uses HookSniff for event delivery:

\`\`\`typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { HookSniff } from '@hooksniff/node';

const hooksniff = new HookSniff({ apiKey: process.env.HOOKSNIFF_API_KEY });
const server = new McpServer({ name: 'order-agent', version: '1.0.0' });

// MCP tool: Agent creates an order
server.tool('create_order', { /* schema */ }, async (params) => {
  const order = await db.orders.create(params);
  // Fire webhook for downstream systems
  await hooksniff.webhooks.send({
    eventType: 'order.created',
    payload: order,
  });
  return { orderId: order.id };
});

// Webhook handler: External events trigger agent actions
app.post('/webhooks/events', async (req, res) => {
  const { event_type, order_id, data } = req.body;

  // Enqueue for agent processing
  await agentQueue.add('process-event', {
    eventType: event_type,
    orderId: order_id,
    data,
  });

  res.status(200).json({ received: true });
});
\`\`\`

### Key Takeaways

1. **MCP and webhooks are complementary** — MCP for agent-initiated actions, webhooks for system-initiated events
2. **FIFO matters for state machines** — Ordered delivery prevents agent state corruption
3. **Schema validation prevents bad inputs** — Validate before the agent sees the data
4. **Dead letter queues are essential** — Agents go down; events should not be lost
5. **The hybrid pattern works** — We use it in production and it scales

The AI agent ecosystem is still young, but the patterns are becoming clear. Webhooks are not a legacy integration mechanism — they are the missing async layer for MCP-based systems.`,
};
