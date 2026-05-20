import type { Post } from '../data';

export const post: Post = {
    title: 'Inside HookSniff: How We Built a $0/Month Webhook Service',
    date: '2026-05-03',
    category: 'Engineering',
    readTime: '10 min',
    tags: ['architecture', 'rust', 'engineering', 'infrastructure'],
    author: 'HookSniff Team',
    content: `HookSniff processes over 10,000 webhooks per month and costs us $0 to operate. This post explains how we architected the entire system to run on free-tier services without sacrificing reliability.

### The Architecture

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare CDN                        │
│              (Static assets + edge cache)                │
└──────────────────────┬──────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────┐
│                   Vercel (Dashboard)                      │
│            Next.js 15 · SSR · App Router                  │
└──────────────────────┬──────────────────────────────────┘
                       │ API calls
┌──────────────────────▼──────────────────────────────────┐
│              Google Cloud Run (API)                       │
│         Rust · Axum · 0 min instances (scale-to-zero)    │
│                                                          │
│  ┌─────────┐ ┌──────────┐ ┌───────────┐ ┌───────────┐  │
│  │ Auth    │ │ Webhooks │ │ Endpoints │ │ Scheduler │  │
│  │ Service │ │ Delivery │ │ Manager   │ │ (retries) │  │
│  └─────────┘ └──────────┘ └───────────┘ └───────────┘  │
└─────┬────────────┬──────────────┬───────────────────────┘
      │            │              │
      ▼            ▼              ▼
┌──────────┐ ┌──────────┐ ┌──────────────┐
│PostgreSQL│ │  Upstash │ │   Cloudflare │
│ (Neon)   │ │  Redis   │ │      R2      │
│  Queue   │ │  Rate    │ │   Payload    │
│  Auth    │ │  Limit   │ │   Storage    │
└──────────┘ └──────────┘ └──────────────┘
\`\`\`

### Why Rust + Axum?

We chose Rust for the API server for three reasons:

1. **Performance** — Rust handles high-concurrency webhook delivery with minimal memory. A single Cloud Run instance can process hundreds of concurrent outbound HTTP requests.
2. **Reliability** — The type system catches bugs at compile time. No null pointer exceptions, no data races, no memory leaks.
3. **Cost** — Rust's efficiency means we need fewer Cloud Run instances. We run on the minimum configuration (1 vCPU, 512MB RAM) and scale to zero when idle.

Axum is our web framework. It is built on Tokio (async runtime) and Tower (middleware), giving us composable middleware for authentication, rate limiting, CORS, and logging.

### PostgreSQL as a Queue

We use Neon's serverless PostgreSQL as both our primary database and our webhook delivery queue. The key insight: PostgreSQL's LISTEN/NOTIFY provides pub/sub functionality without a separate message broker.

\`\`\`sql
-- Webhook delivery queue table
CREATE TABLE webhook_deliveries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id),
    event_type VARCHAR(255) NOT NULL,
    payload JSONB NOT NULL,
    sequence_number BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    attempts INT DEFAULT 0,
    next_retry_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ
);

-- FIFO index: process in order per endpoint
CREATE INDEX idx_fifo ON webhook_deliveries(endpoint_id, sequence_number)
    WHERE status = 'pending';

-- NOTIFY on new delivery
CREATE OR FUNCTION notify_new_delivery() RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify('new_delivery', NEW.endpoint_id::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
\`\`\`

When a new webhook is inserted, the trigger fires a NOTIFY. Our Rust server listens for these notifications and immediately begins processing.

### FIFO with Sequence Numbers

FIFO delivery requires strict ordering. We achieve this with monotonically increasing sequence numbers per endpoint:

\`\`\`rust
async fn get_next_delivery(endpoint_id: Uuid) -> Result<WebhookDelivery> {
    sqlx::query_as::<_, WebhookDelivery>(
        "SELECT * FROM webhook_deliveries
         WHERE endpoint_id = $1 AND status = 'pending'
         ORDER BY sequence_number ASC
         LIMIT 1
         FOR UPDATE SKIP LOCKED"
    )
    .bind(endpoint_id)
    .fetch_optional(&pool)
    .await
}
\`\`\`

The \`FOR UPDATE SKIP LOCKED\` ensures that concurrent workers do not process the same delivery, and ordering is guaranteed by the sequence number.

### Upstash Redis for Rate Limiting

We use Upstash Redis (serverless, free tier: 10,000 commands/day) for rate limiting. The sliding window algorithm:

\`\`\`rust
async fn check_rate_limit(
    redis: &Redis,
    user_id: &str,
    limit: u32,
    window_secs: u32,
) -> Result<bool> {
    let key = format!("rate:{}:{}", user_id, window_secs);
    let now = chrono::Utc::now().timestamp();

    let count: u32 = redis
        .eval(
            "local key = KEYS[1] local now = tonumber(ARGV[1]) local window = tonumber(ARGV[2]) \
             redis.call('ZREMRANGEBYSCORE', key, 0, now - window) \
             local count = redis.call('ZCARD', key) \
             if count < tonumber(ARGV[3]) then \
                 redis.call('ZADD', key, now, now .. '-' .. math.random()) \
                 redis.call('EXPIRE', key, window) \
                 return 0 \
             else \
                 return 1 \
             end",
            &[&key],
            &[&now.to_string(), &window_secs.to_string(), &limit.to_string()],
        )
        .await?;

    Ok(count == 0)
}
\`\`\`

### Cloudflare R2 for Payload Storage

Webhook payloads can be large (up to 1MB). Storing them in PostgreSQL would bloat the database and slow queries. Instead, we store payloads in Cloudflare R2 (S3-compatible, free tier: 10GB storage, 10M reads/month).

When a webhook is sent, the payload is written to R2 first, then the delivery record (with an R2 key reference) is inserted into PostgreSQL. On delivery, the payload is fetched from R2 and included in the outbound HTTP request.

### SSRF Protection

Webhooks are outbound HTTP requests to user-provided URLs. This creates a Server-Side Request Forgery (SSRF) risk — a malicious user could point their endpoint to \`http://169.254.169.254/latest/meta-data/\` (AWS metadata) or \`http://localhost:6379/\` (Redis).

Our SSRF protection:

\`\`\`rust
fn validate_webhook_url(url: &Url) -> Result<()> {
    // 1. Only HTTPS
    if url.scheme() != "https" {
        return Err(Error::InsecureUrl);
    }

    // 2. Resolve DNS and check IP
    let addrs = tokio::net::lookup_host(format!("{}:443", url.host_str().unwrap())).await?;
    for addr in addrs {
        if is_private_ip(addr.ip()) {
            return Err(Error::PrivateIp);
        }
    }

    // 3. Block known metadata endpoints
    let blocked = ["169.254.169.254", "metadata.google.internal", "localhost"];
    if blocked.contains(&url.host_str().unwrap_or("")) {
        return Err(Error::BlockedHost);
    }

    Ok(())
}
\`\`\`

### Circuit Breaker Pattern

If an endpoint is consistently failing (5xx errors, timeouts), we stop hammering it. Our circuit breaker:

- **Closed** — Normal delivery, tracking failures
- **Open** — After 5 consecutive failures, stop delivering for 5 minutes
- **Half-open** — After the cooldown, try one delivery. If it succeeds, close the circuit.

This prevents us from wasting resources on dead endpoints and protects downstream services from retry storms.

### OpenTelemetry Observability

Every webhook delivery is traced end-to-end with OpenTelemetry:

\`\`\`rust
#[instrument(skip(client, payload))]
async fn deliver_webhook(
    client: &reqwest::Client,
    delivery: &WebhookDelivery,
    payload: Vec<u8>,
) -> Result<DeliveryResult> {
    let span = tracing::info_span!(
        "webhook_delivery",
        endpoint_id = %delivery.endpoint_id,
        event_type = %delivery.event_type,
        sequence_number = delivery.sequence_number,
    );

    let response = client
        .post(&delivery.endpoint_url)
        .header("webhook-signature", compute_signature(&payload))
        .header("webhook-timestamp", chrono::Utc::now().timestamp())
        .body(payload)
        .timeout(Duration::from_secs(10))
        .send()
        .await?;

    span.record("http.status", response.status().as_u16());
    Ok(DeliveryResult::from(response))
}
\`\`\`

Traces are exported to Grafana Cloud (free tier) where we monitor delivery latency, error rates, and queue depth.

### The $0 Stack

| Component | Service | Free Tier |
|-----------|---------|-----------|
| API Server | Google Cloud Run | 2M requests/mo, scale-to-zero |
| Database | Neon PostgreSQL | 0.5GB storage, 24/7 compute |
| Rate Limiting | Upstash Redis | 10K commands/day |
| Payload Storage | Cloudflare R2 | 10GB, 10M reads/mo |
| Dashboard | Vercel | 100GB bandwidth/mo |
| Observability | Grafana Cloud | 10K metrics, 50GB logs |
| Domain | Cloudflare | Free DNS + CDN |

Total cost: $0/month for up to 10K webhooks. The only variable cost is Cloud Run compute during active delivery, which stays within the free tier for our current volume.

### Lessons Learned

1. **Scale-to-zero is magic** — Cloud Run charges nothing when idle. Perfect for webhook services with bursty traffic.
2. **PostgreSQL is underrated as a queue** — With LISTEN/NOTIFY and SKIP LOCKED, it handles our workload without a separate message broker.
3. **Free tiers are generous** — We use 6 free-tier services and stay well within limits.
4. **Rust pays off at the edges** — The initial learning curve is steep, but the runtime efficiency and reliability are worth it for infrastructure code.
5. **SSRF is real** — Webhook services are inherently SSRF-prone. Invest in protection early.

This architecture is not theoretical — it is running in production, serving real users, and costing us nothing. The cloud has made it possible to build serious infrastructure on a shoestring budget.`,
};
