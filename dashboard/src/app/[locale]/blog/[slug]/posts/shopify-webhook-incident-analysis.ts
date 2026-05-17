import type { Post } from '.../data';

export const post: Post = {
    title: 'What the Shopify Webhook Incident Teaches Us About Resilience',
    date: '2026-04-30',
    category: 'Engineering',
    readTime: '8 min',
    tags: ['incident', 'resilience', 'shopify', 'engineering'],
    author: 'HookSniff Team',
    content: `On April 28, 2026, Shopify experienced a significant webhook delivery incident that lasted approximately 8 hours. Webhooks that normally arrived within seconds were delayed by minutes to over an hour. When the issue was resolved, a recovery surge flooded downstream systems with 3x the normal webhook volume.

This post analyzes what happened, what we can learn, and how resilient webhook infrastructure should handle these scenarios.

### Timeline of the Incident

\`\`\`
2026-04-28 Timeline (UTC)
─────────────────────────────────────────────────────
02:15  ┃ First reports of delayed webhooks in Shopify community forums
02:45  ┃ Shopify acknowledges increased webhook latency on status page
03:30  ┃ Latency increases to 15-30 minutes for most event types
05:00  ┃ Some webhooks delayed by 45+ minutes; order events most affected
07:00  ┃ Root cause identified: database migration caused queue backlog
08:30  ┃ Fix deployed; backlog begins clearing
09:00  ┃ Recovery surge starts — 3x normal webhook volume
09:45  ┃ Downstream systems start reporting 5xx errors from surge
10:15  ┃ Shopify throttles recovery delivery to 1.5x normal rate
10:30  ┃ Incident resolved; all webhooks delivered
─────────────────────────────────────────────────────
\`\`\`

### The Surge Pattern

The most dangerous part of the incident was not the delay — it was the recovery. Here is what the webhook delivery volume looked like:

\`\`\`
Webhook Volume (events/minute)
│
│                    ╭──╮ Recovery surge
│                   ╭╯  ╰╮  3x normal
│                  ╭╯    ╰╮
│    ╭────╮       ╭╯      ╰╮
│───╯    ╰──────╯        ╰────────── Normal
│   ╰──╮  ╰─────╮
│      ╰──╮     ╰──── Backlog clearing
│         ╰── Incident window
│
└────────────────────────────────────────────── Time
  02:00  04:00  06:00  08:00  10:00  12:00
\`\`\`

During the incident window (02:15–08:30), webhooks accumulated in Shopify's internal queue. When the fix was deployed, all queued webhooks were released simultaneously, creating a surge that overwhelmed unprepared downstream systems.

### Why Recovery Surges Are Dangerous

Most webhook consumers are designed for steady-state traffic. They handle normal volume fine but break under sudden spikes:

- **Connection pool exhaustion** — Database connections max out
- **Memory pressure** — Queued processing tasks consume all available RAM
- **Rate limit hits** — Third-party API rate limits get triggered
- **Cascading failures** — One slow consumer backs up the entire pipeline

The irony: the systems that survived the 8-hour delay just fine were the ones that crashed during the recovery.

### Lessons for Webhook Consumers

**1. Design for 3x burst capacity.** Your webhook endpoint should handle 3x your normal peak volume without degradation. This means connection pooling, async processing, and backpressure mechanisms.

**2. Implement circuit breakers.** If your downstream service starts returning 5xx, stop sending and queue locally. A circuit breaker prevents cascading failures during surge events.

**3. Use dead letter queues.** If processing fails after retries, preserve the event. Do not drop webhooks — they contain critical business data.

**4. Monitor p99 latency, not just averages.** During the Shopify incident, average latency was misleading. P99 showed the real story: some webhooks were delayed by over an hour while most arrived within minutes.

**5. Implement idempotent processing.** Recovery surges may deliver events that were partially processed before the incident. Idempotency ensures duplicate processing is safe.

### How HookSniff Handles Incident Recovery

HookSniff was designed with these scenarios in mind. Here is how we handle recovery surges:

**Exponential backoff with jitter.** Failed deliveries retry with increasing delays (10s, 30s, 2m, 10m, 30m) plus random jitter. This spreads retry traffic and prevents thundering herd problems.

\`\`\`typescript
// HookSniff retry configuration
const retryPolicy = {
  maxAttempts: 5,
  backoff: 'exponential',
  baseDelay: 10000,     // 10 seconds
  maxDelay: 1800000,    // 30 minutes
  jitter: true,         // Random ±25% to spread load
};
\`\`\`

**Circuit breaker per endpoint.** If an endpoint fails 5 consecutive deliveries, we open the circuit for 5 minutes. This prevents us from hammering a struggling service during a surge.

\`\`\`
Endpoint Health Check:
┌─────────────────────────────────────────┐
│  endpoint: https://shop.example.com/wh  │
│  status: OPEN (circuit tripped)         │
│  failures: 5 consecutive                │
│  cooldown: 4m 32s remaining             │
│  last_error: 503 Service Unavailable    │
└─────────────────────────────────────────┘
\`\`\`

**Dead letter queue with batch replay.** Events that exhaust all retries move to the DLQ. When the downstream service recovers, operators can batch-replay all dead-lettered events with a single API call.

\`\`\`python
# Batch replay all dead-lettered events for an endpoint
from hooksniff import HookSniff

client = HookSniff(api_key="hs_...")

# Replay all DLQ events for the affected endpoint
result = client.dead_letters.replay_all(
    endpoint_id="ep_shopify_integration",
    after="2026-04-28T02:00:00Z",
    before="2026-04-28T10:30:00Z",
)

print(f"Replayed {result.count} events")
\`\`\`

**Per-endpoint throttling.** During recovery, we limit delivery rate per endpoint to prevent overwhelming downstream systems. Default: 100 requests/second per endpoint, configurable.

\`\`\`rust
async fn apply_throttle(endpoint: &Endpoint, delivery: &Delivery) -> Result<()> {
    let rate = endpoint.throttle_rate.unwrap_or(100); // req/s
    let window = Duration::from_secs(1);

    if rate_limiter.check(&endpoint.id, rate, window).await?.is_limited() {
        // Re-queue with delay instead of dropping
        delivery.retry_at(chrono::Utc::now() + chrono::Duration::seconds(1)).await?;
        return Err(Error::Throttled);
    }

    Ok(())
}
\`\`\`

### Monitoring Checklist

After reviewing the Shopify incident, here is what every webhook consumer should monitor:

- **Delivery latency p50/p95/p99** — Not just average
- **Queue depth** — How many webhooks are pending delivery
- **Error rate by endpoint** — Per-consumer health
- **Retry rate** — Spikes indicate downstream issues
- **Circuit breaker state** — Open circuits need attention
- **DLQ depth** — Growing DLQ means lost events

### The Bigger Picture

The Shopify incident is a reminder that webhook infrastructure is only as resilient as its weakest consumer. The delivery service (Shopify) recovered, but many downstream systems were not prepared for the surge.

Building resilient webhook consumers is not optional — it is a production requirement. Plan for 3x burst capacity, implement circuit breakers, use dead letter queues, and monitor p99 latency.

And if you do not want to build all of that yourself, HookSniff handles it out of the box. Sign up at hooksniff.vercel.app — your first 10,000 webhooks per month are free.`,
};
