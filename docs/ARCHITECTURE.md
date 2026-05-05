# Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Internet                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   Nginx / LB    │
                    │   (TLS term.)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼───────┐ ┌───▼────┐ ┌───────▼───────┐
     │   API Server   │ │  Dash  │ │  Temporal UI  │
     │   (Axum/Rust)  │ │ (Next) │ │               │
     │   :3000        │ │ :3001  │ │   :8081       │
     └──┬──┬──┬───────┘ └───┬────┘ └───────────────┘
        │  │  │             │
        │  │  │    ┌────────┘
        │  │  │    │ (API calls)
        │  │  │    │
        │  │  └────┼──► Kafka/Redpanda ──► Worker (Temporal)
        │  │       │         :9092              │
        │  │       │                            │
        │  └───────┼──► CockroachDB            │
        │          │         :26257             │
        │          │                            │
        └──────────┼──► Prometheus /metrics     ▼
                   │         :9090         HTTP deliveries
                   │                        to endpoints
                   └──► Grafana
                           :3002
```

## Components

### API Server (`api/`)
- **Framework**: Axum (async Rust)
- **Port**: 3000
- **Responsibilities**:
  - REST API endpoints (`/v1/*`)
  - Authentication (API keys + JWT)
  - Rate limiting per plan
  - Webhook ingestion → Kafka
  - Metrics collection (Prometheus)
  - WebSocket connections (real-time events)

### Worker (`worker/`)
- **Framework**: Temporal Rust SDK
- **Responsibilities**:
  - Consumes webhook deliveries from Kafka
  - Executes delivery workflows with retry logic
  - Supports multiple delivery backends:
    - HTTP (standard webhook delivery)
    - gRPC
    - SQS
    - WebSocket
  - Fanout (one event → multiple endpoints)
  - Exponential backoff retry with jitter

### Dashboard (`dashboard/`)
- **Framework**: Next.js 14 (App Router)
- **Port**: 3001
- **Responsibilities**:
  - Web UI for managing endpoints, webhooks, and settings
  - Real-time delivery monitoring
  - Billing and usage dashboards
  - API key management
  - AI Center (anomaly detection, auto-fix)

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Database | CockroachDB | Distributed SQL — endpoints, customers, delivery logs |
| Message Queue | Redpanda (Kafka-compatible) | Async webhook delivery pipeline |
| Workflow Engine | Temporal | Reliable delivery orchestration with retries |
| Monitoring | Prometheus + Grafana | Metrics collection and dashboards |
| Tracing | Jaeger + OpenTelemetry | Distributed request tracing |

## Data Flow

### Webhook Ingestion

```
Client → POST /v1/webhooks
       → Authenticate (API key)
       → Rate limit check
       → Validate payload
       → Publish to Kafka (webhook-deliveries topic)
       → Return 202 Accepted
```

### Webhook Delivery

```
Kafka consumer (Worker)
       → Read message from topic
       → Look up endpoint URL + signing secret
       → Build HTTP request with HMAC signature
       → Attempt delivery (with timeout)
       → On success: record delivery, update stats
       → On failure: schedule retry via Temporal
                      (exponential backoff: 1m, 5m, 30m, 2h, 24h)
```

### Retry Strategy

| Attempt | Delay | Cumulative |
|---------|-------|------------|
| 1 | Immediate | 0 |
| 2 | 1 minute | 1 min |
| 3 | 5 minutes | 6 min |
| 4 | 30 minutes | 36 min |
| 5 | 2 hours | 2h 36m |
| 6 | 24 hours | ~26.5 hours |

After 6 failed attempts, the delivery is marked as permanently failed.

## Technology Stack

| Layer | Technology |
|-------|-----------|
| API | Rust, Axum, SQLx, rdkafka |
| Worker | Rust, Temporal SDK |
| Dashboard | TypeScript, Next.js 14, Tailwind CSS, Radix UI |
| Database | CockroachDB (PostgreSQL wire protocol) |
| Messaging | Redpanda (Kafka API compatible) |
| Workflow | Temporal |
| Monitoring | Prometheus, Grafana |
| Tracing | OpenTelemetry, Jaeger |
| Container | Docker, Docker Compose, Kubernetes |
| CI/CD | GitHub Actions |

## Security

- **Authentication**: API keys (hashed in DB) + JWT for dashboard
- **Payload signing**: HMAC-SHA256 (`X-Hookrelay-Signature` header)
- **Rate limiting**: Per-plan, sliding window, with proper headers
- **TLS**: Terminated at reverse proxy / ingress
- **Secrets**: Environment variables, Kubernetes Secrets (base64)
- **Network**: Services communicate over Docker/K8s internal network
