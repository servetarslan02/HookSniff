# ADR-003: Event-Driven Webhook Delivery

**Date:** 2026-04-01
**Status:** Accepted
**Deciders:** Servet Arslan, AI Agent
**Technical Story:** Architecture for webhook ingestion, queuing, and delivery pipeline

---

## Context

HookSniff's core product is reliable webhook delivery. When a customer sends a webhook via our API, we must:

1. Accept and validate the webhook payload
2. Store it durably (no data loss)
3. Deliver it to the target endpoint
4. Retry on failure with exponential backoff
5. Provide delivery status and history
6. Handle thousands of webhooks per second

The key tension is between **immediacy** (deliver now) and **reliability** (deliver eventually, even if the system crashes).

## Decision

We chose an **event-driven architecture** with a PostgreSQL-backed job queue:

```
API Ingest → PostgreSQL Queue → Worker Dequeue → HTTP Delivery → Status Update
     │              │                  │               │
     │         DURABLE STORAGE    ASYNC PROCESSING   RETRY LOGIC
     │              │                  │               │
     └── Returns 200 immediately      └── Decoupled from API
```

### Architecture Components

1. **API Server** — Accepts webhooks, validates payload, inserts into `webhook_queue` table, returns 200 immediately
2. **webhook_queue table** — PostgreSQL-based durable queue with status tracking
3. **Worker** — Polls queue, delivers webhooks, handles retries, records results
4. **Retry Policy** — Exponential backoff with configurable max attempts
5. **Dead Letter** — Permanently failed deliveries marked for manual review

### Key Design Decisions

**Why PostgreSQL queue over Redis/RabbitMQ/Kafka:**

1. **Durability** — PostgreSQL is ACID-compliant. If the system crashes mid-delivery, the webhook is still in the queue. Redis would require additional persistence configuration.

2. **Simplicity** — One database instead of two. No separate message broker to deploy, monitor, and maintain. Fewer moving parts = fewer failure modes.

3. **Cost** — Neon free tier handles both application data and queue. No additional infrastructure costs.

4. **Consistency** — Webhook metadata and queue state are in the same database. No dual-write problem. Transaction guarantees: insert webhook + enqueue = atomic.

5. **SQL queries** — Queue depth, delivery rates, error analysis — all expressible as SQL queries. No separate monitoring for message broker.

6. **Advisory locks** — PostgreSQL advisory locks prevent duplicate delivery by concurrent workers without external coordination.

### Queue Schema

```sql
CREATE TABLE webhook_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint_id UUID NOT NULL REFERENCES endpoints(id),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',  -- pending, processing, delivered, failed, dead
    attempt_count INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_attempt_at TIMESTAMPTZ,
    next_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_queue_pending ON webhook_queue (status, scheduled_at)
    WHERE status = 'pending';
```

### Worker Processing Loop

```
loop {
    1. BEGIN TRANSACTION
    2. SELECT ... FROM webhook_queue
       WHERE status = 'pending' AND scheduled_at <= NOW()
       ORDER BY created_at
       LIMIT batch_size
       FOR UPDATE SKIP LOCKED
    3. UPDATE status = 'processing'
    4. COMMIT

    5. For each webhook (concurrent):
       a. Sign payload (HMAC-SHA256)
       b. HTTP POST to endpoint
       c. If 2xx → UPDATE status = 'delivered'
       d. If 4xx → UPDATE status = 'dead' (client error, don't retry)
       e. If 5xx/timeout → UPDATE status = 'pending', increment attempt_count, schedule next_retry

    6. Sleep(poll_interval)
}
```

## Consequences

### Positive
- **Durability** — No webhook lost due to crashes (PostgreSQL guarantees)
- **Decoupling** — API and worker scale independently
- **Retry reliability** — Failed deliveries automatically retried with backoff
- **Observability** — All delivery state in one database, queryable with SQL
- **Simplicity** — No message broker to maintain
- **Cost-effective** — Single database handles everything

### Negative
- **Polling overhead** — Worker polls database (vs push-based message broker)
- **Queue contention** — Concurrent workers compete for queue rows (mitigated by `SKIP LOCKED`)
- **Scaling limits** — PostgreSQL queue may bottleneck at very high throughput (>10K/sec)
- **No pub/sub** — Can't fan out to multiple consumers per event (acceptable for webhook delivery)

### Neutral
- Worker must handle idempotency (same webhook might be delivered twice in edge cases)
- Queue cleanup needed (archive old deliveries to prevent table bloat)

## Alternatives Considered

### Redis Streams (with persistence)
- **Pros:** Very high throughput, built-in consumer groups, push-based delivery
- **Cons:** Requires Redis persistence configuration (AOF), dual-write problem (Redis + Postgres), additional infrastructure cost, data loss risk if Redis crashes before persistence
- **Why rejected:** Added complexity and durability risk not justified at current scale

### RabbitMQ
- **Pros:** Battle-tested message broker, built-in retry/DLQ, multiple exchange types
- **Cons:** Additional infrastructure to deploy and monitor, Erlang dependency, overkill for single-consumer pattern, 3x operational complexity
- **Why rejected:** Operational overhead doesn't justify at startup scale

### Amazon SQS
- **Pros:** Fully managed, no operations, built-in DLQ, massive scale
- **Cons:** Vendor lock-in, latency (not sub-second), cost at scale, requires AWS infrastructure
- **Why rejected:** Vendor lock-in and latency concerns

### Apache Kafka
- **Pros:** Extremely high throughput, event sourcing, replay capability
- **Cons:** Massive operational complexity, minimum 3 brokers, ZooKeeper dependency (or KRaft), overkill by 1000x
- **Why rejected:** Astronomical overkill for a startup webhook service

### In-Process Channel (tokio::mpsc)
- **Pros:** Zero latency, no external dependencies
- **Cons:** Not durable (crash = data loss), single-process only, no persistence
- **Why rejected:** Durability is a hard requirement

## Future Scaling Path

If PostgreSQL queue becomes a bottleneck (>10K webhooks/sec):

1. **Short term** — Partition `webhook_queue` by status or time
2. **Medium term** — Add Redis Streams as fast-path queue, PostgreSQL as durable backup
3. **Long term** — Migrate to dedicated message broker (NATS, Kafka)

Current architecture supports 1-5K webhooks/sec which is sufficient for launch and early growth.

## References

- [PostgreSQL SKIP LOCKED](https://www.postgresql.org/docs/current/sql-select.html#SQL-FOR-UPDATE-SHARE)
- [Patterns for Distributed Systems: Queue](https://martinfowler.com/articles/patterns-of-distributed-systems/single-server.html)
- [PostgreSQL as Queue](https://www.2ndquadrant.com/en/blog/what-is-select-skip-locked-for-in-postgresql-9-5/)
