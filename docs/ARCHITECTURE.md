# HookSniff — Architecture

## System Overview

```
                            ┌─────────────────┐
                            │    Internet      │
                            └────────┬────────┘
                                     │
                            ┌────────▼────────┐
                            │   Fly.io Proxy   │
                            │   (TLS, LB)      │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
           ┌────────▼───────┐ ┌─────▼─────┐ ┌───────▼───────┐
           │   API Server   │ │ Dashboard │ │  Healthcheck  │
           │   (Axum/Rust)  │ │ (Next.js) │ │   (internal)  │
           │   Port 3000    │ │ Port 3001 │ │               │
           └──┬──┬──┬───────┘ └─────┬─────┘ └───────────────┘
              │  │  │               │
              │  │  │               │ (API calls via HTTP)
              │  │  │               │
              │  │  └───────────────┼────► PostgreSQL (Neon)
              │  │                  │         sslmode=require
              │  │                  │
              │  └──────────────────┼────► PostgreSQL (Neon)
              │                     │         sslmode=require
              │                     │
              └─────────────────────┼────► PostgreSQL Queue
                                    │         (webhook_queue table)
                                    │
                                    ▼
                              ┌───────────┐
                              │  Worker   │
                              │ (Rust)    │
                              └─────┬─────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
              ┌──────────┐   ┌──────────┐   ┌──────────┐
              │  HTTP    │   │  gRPC    │   │  SQS     │
              │ Delivery │   │ Delivery │   │ Delivery │
              └──────────┘   └──────────┘   └──────────┘
                    │
                    ▼
              Customer Endpoints
              (webhooks delivered)
```

## Components

### API Server (`api/`)

| Property | Value |
|----------|-------|
| Framework | Axum (async Rust) |
| Port | 3000 |
| Database | PostgreSQL via SQLx (Neon in production) |
| Queue | PostgreSQL (`webhook_queue` table) |

**Responsibilities:**
- REST API endpoints (`/v1/*`)
- Authentication: API keys (`hr_live_*`) for programmatic access, JWT for dashboard
- Rate limiting per plan (sliding window)
- Webhook ingestion → PostgreSQL queue
- Idempotency key support (`Idempotency-Key` header)
- SSRF protection (blocks internal/private IPs)
- Payload validation (size, JSON depth, event type format)
- Prometheus metrics at `/metrics`

**Key Routes:**

| Route Group | Module | Description |
|-------------|--------|-------------|
| `/auth/*` | `auth.rs` | Registration, login (JWT) |
| `/endpoints/*` | `endpoints.rs` | Endpoint CRUD, secret rotation |
| `/webhooks/*` | `webhooks.rs` | Send, list, replay, batch, export |
| `/api-keys/*` | `api_keys.rs` | API key CRUD, rotation |
| `/billing/*` | `billing.rs` | Stripe integration, usage, portal |
| `/endpoint-health/*` | `health_endpoints.rs` | Health monitoring |
| `/stats` | `stats.rs` | Delivery statistics |
| `/alerts/*` | `alerts.rs` | Alert rules CRUD |
| `/search` | `search.rs` | Webhook log search |

### Worker (`worker/`)

| Property | Value |
|----------|-------|
| Framework | Rust + Tokio |
| Queue | PostgreSQL polling (`webhook_queue`) |

**Responsibilities:**
- Polls `webhook_queue` table for pending deliveries
- Executes webhook delivery with retry logic
- Signs payloads with HMAC-SHA256 (`Standard Webhooks headers (webhook-id, webhook-timestamp, webhook-signature)`)
- Supports multiple delivery backends:
  - **HTTP** — Standard webhook delivery (primary)
  - **gRPC** — For gRPC-capable endpoints
  - **SQS** — Forward to AWS SQS queues
  - **WebSocket** — Real-time delivery
- Fanout: one event → multiple endpoints
- Exponential backoff retry with jitter
- Retry scheduler: polls DB every 30s for pending retries

**Delivery Backends:**

```
worker/src/delivery/
├── mod.rs          # Delivery trait + factory
├── http.rs         # HTTP POST delivery
├── grpc.rs         # gRPC delivery
├── sqs.rs          # AWS SQS delivery
└── websocket.rs    # WebSocket delivery
```

### Dashboard (`dashboard/`)

| Property | Value |
|----------|-------|
| Framework | Next.js 14 (App Router) |
| Port | 3001 |
| UI | Tailwind CSS + Radix UI + Tremor |

**Pages:**
- Dashboard overview (stats, charts)
- Endpoints management
- Webhook logs + search
- API key management
- Billing & usage
- Alerts configuration
- Endpoint health monitoring
- AI Center (anomaly detection, actions, blocklist)
- Playground (webhook tester)


Autonomous management system for anomaly detection and automated remediation.

**Built-in Agents:**
- `fraud_detector` — Detects suspicious webhook patterns
- `churn_detector` — Identifies at-risk customers
- `customer_segmenter` — Segments customers by behavior
- `inventory_optimizer` — Optimizes resource allocation

**Capabilities:**
- Risk scoring per endpoint (0-100)
- Auto-actions (with human approval for high-risk)
- IP/customer/endpoint blocklist
- Event anomaly detection

---

## Data Flow

### 1. Webhook Ingestion (Client → Queue)

```
Client
  │
  ▼
POST /v1/webhooks
  │
  ├─► Authenticate (API key lookup → customer)
  ├─► Check idempotency key (cached response?)
  ├─► Validate event type format
  ├─► Validate JSON payload depth
  ├─► Check payload size (≤ 1 MB)
  ├─► Check rate limit (webhook_count < webhook_limit)
  ├─► Verify endpoint exists, is active, matches event filter
  │
  ├─► INSERT INTO deliveries (status: 'pending')
  ├─► UPDATE customers SET webhook_count++
  ├─► Insert into PostgreSQL queue (webhook_queue table)
  ├─► Store idempotency key (if provided)
  │
  ▼
Return 200 (delivery ID + status: 'pending')
```

### 2. Webhook Delivery (Worker → Endpoint)

```
PostgreSQL Queue Poller (Worker)
  │
  ├─► Read message from topic
  ├─► Look up endpoint URL + signing secret
  ├─► Build HTTP request:
  │     POST {endpoint_url}
  │     Content-Type: application/json
  │     webhook-signature: v1,{base64(hmac)}
  │     webhook-id: {id}
  │     webhook-attempt: {n}
  │     Body: {event, data, timestamp}
  │
  ├─► Send with timeout (30s default)
  │
  ├─► On 2xx success:
  │     ├─► UPDATE deliveries SET status='delivered'
  │     ├─► INSERT INTO delivery_attempts (status_code, duration_ms)
  │     └─► Update endpoint stats (success_rate, avg_response_ms)
  │
  └─► On failure (timeout, 4xx, 5xx):
        ├─► INSERT INTO delivery_attempts (error details)
        ├─► If attempts < max_attempts:
        │     ├─► Calculate next_retry_at (exponential backoff)
        │     └─► UPDATE deliveries SET status='pending', next_retry_at=...
        └─► If attempts >= max_attempts:
              └─► UPDATE deliveries SET status='failed'
```

### 3. Retry Scheduling

```
Retry Scheduler (background task, every 30s)
  │
  ├─► SELECT FROM deliveries
  │     WHERE status = 'pending'
  │     AND next_retry_at <= now()
  │     ORDER BY next_retry_at ASC
  │     LIMIT 50
  │
  └─► For each delivery:
        └─► Re-insert into PostgreSQL queue for retry
```

---

## Retry Mechanism

### Backoff Strategy

HookSniff uses **exponential backoff with jitter** by default. Configurable per endpoint.

| Attempt | Default Delay | Cumulative |
|---------|--------------|------------|
| 1 | Immediate | 0 |
| 2 | 10 seconds | 10s |
| 3 | ~1 minute | ~1 min |
| 4 | ~5 minutes | ~6 min |
| 5 | ~30 minutes | ~36 min |
| 6 | ~2 hours | ~2h 36m |
| 7 | ~24 hours | ~26.5 hours |

### Retry Policy Configuration

Each endpoint can customize:

```json
{
  "max_attempts": 5,
  "backoff": "exponential",
  "initial_delay_secs": 30,
  "max_delay_secs": 3600
}
```

| Parameter | Default | Description |
|-----------|---------|-------------|
| `max_attempts` | 3 | Maximum delivery attempts |
| `backoff` | `exponential` | Strategy: `exponential`, `linear`, `fixed` |
| `initial_delay_secs` | 10 | Delay before first retry |
| `max_delay_secs` | 3600 | Maximum delay between retries (1 hour) |

### Backoff Formulas

- **Exponential:** `delay = initial_delay × 2^(attempt-2)`, capped at `max_delay`
- **Linear:** `delay = initial_delay × attempt`
- **Fixed:** `delay = initial_delay` (constant)

Jitter (±25%) is applied to all strategies to prevent thundering herd.

### Failure Detection

A delivery is marked as failed if:
- HTTP status code is `4xx` or `5xx`
- Connection timeout (30 seconds)
- DNS resolution failure
- TLS handshake failure

A delivery is marked as successful if:
- HTTP status code is `2xx`

---

## Security Model

### Authentication Layers

```
┌─────────────────────────────────────────────────┐
│                  API Requests                    │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. API Key Auth (hr_live_*)                     │
│     ├─ Lookup: hash(api_key) → customer          │
│     ├─ Stored: Argon2 hash in DB                 │
│     ├─ Scope: Full API access                    │
│     └─ Used by: External integrations, SDKs      │
│                                                  │
│  2. JWT Auth                                     │
│     ├─ Issued on: login / register               │
│     ├─ Contains: customer_id, email, plan        │
│     ├─ Signed: HMAC-SHA256 (JWT_SECRET)          │
│     └─ Used by: Dashboard sessions               │
│                                                  │
│  3. Stripe Webhook Signature                     │
│     ├─ Header: stripe-signature                  │
│     ├─ Verified: HMAC with webhook secret        │
│     └─ Used by: Billing webhook handler          │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Webhook Payload Signing

Every delivered webhook is signed with HMAC-SHA256:

```
Signature = "sha256=" + HMAC-SHA256(signing_secret, request_body)
```

- **Header:** `Standard Webhooks headers (webhook-id, webhook-timestamp, webhook-signature)`
- **Algorithm:** HMAC-SHA256
- **Format:** Standard Webhooks compatible
- **Rotation:** Endpoint secret can be rotated; old secret valid for 24 hours

### SSRF Protection

The API blocks webhook delivery to internal/private networks:

- `localhost`, `127.0.0.1`, `::1`
- Private IP ranges: `10.*`, `172.16-31.*`, `192.168.*`
- Link-local: `169.254.*`
- Internal domains: `*.local`, `*.internal`, `*.localhost`
- Hex-encoded IPs: `0x7f000001`

### Rate Limiting

- Per-customer, per-plan limits
- Sliding window algorithm
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`
- Monthly webhook count tracked in `customers.webhook_count`

### Data Protection

| Concern | Implementation |
|---------|---------------|
| API keys | Argon2 hashed in database, never stored in plaintext |
| Signing secrets | Stored in DB, only transmitted over TLS |
| JWT tokens | Short-lived, signed with server-side secret |
| TLS | Terminated at Fly.io edge proxy |
| Database | Neon PostgreSQL with SSL (`sslmode=require`) |
| Payloads | Stored in DB, retained per plan (7-90 days) |

### Network Security

- All services communicate over Fly.io private network (6PN)
- No public ports except API (3000) and Dashboard (3001)
- Internal services (PostgreSQL) are not publicly accessible
- Health checks on all services

---

## Database Schema (Key Tables)

```sql
-- Customers (accounts)
customers (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  api_key_hash TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL,
  password_hash TEXT,
  plan TEXT DEFAULT 'free',
  webhook_count INTEGER DEFAULT 0,
  webhook_limit INTEGER DEFAULT 1000,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Webhook endpoints
endpoints (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  url TEXT NOT NULL,
  description TEXT,
  signing_secret TEXT NOT NULL,
  old_signing_secret TEXT,
  secret_rotated_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  retry_policy JSONB,
  custom_headers JSONB,
  event_filter TEXT,
  failure_streak INTEGER DEFAULT 0,
  avg_response_ms INTEGER DEFAULT 0,
  last_failure_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Webhook deliveries
deliveries (
  id UUID PRIMARY KEY,
  endpoint_id UUID REFERENCES endpoints(id),
  customer_id UUID REFERENCES customers(id),
  payload JSONB NOT NULL,
  event_type TEXT,
  status TEXT DEFAULT 'pending',
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  response_status INTEGER,
  replay_count INTEGER DEFAULT 0,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- Delivery attempts
delivery_attempts (
  id UUID PRIMARY KEY,
  delivery_id UUID REFERENCES deliveries(id),
  attempt_number INTEGER NOT NULL,
  status_code INTEGER,
  response_body TEXT,
  duration_ms INTEGER,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
)

-- API keys
api_keys (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  api_key_hash TEXT NOT NULL,
  api_key_prefix TEXT NOT NULL,
  name TEXT DEFAULT 'Default',
  is_active BOOLEAN DEFAULT true,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
)
```

---

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| API | Rust, Axum, SQLx | Async REST API |
| Worker | Rust, Tokio | Webhook delivery engine |
| Dashboard | TypeScript, Next.js 14, Tailwind CSS | Web UI |
| Database | PostgreSQL (Neon) | Persistent storage |
| Queue | PostgreSQL (webhook_queue) | Async message delivery |
| Auth | JWT + Argon2 + HMAC-SHA256 | Multi-layer auth |
| Billing | Stripe (Checkout + Portal + Webhooks) | Payments |
| Monitoring | Prometheus + Grafana | Metrics & dashboards |
| Tracing | OpenTelemetry, Jaeger | Distributed tracing |
| Container | Docker, Docker Compose | Local dev |
| Deploy | Fly.io | Production hosting |
| CI/CD | GitHub Actions | Automated builds |
