# ADR-001: PostgreSQL over MySQL

**Date:** 2026-04-01
**Status:** Accepted
**Deciders:** Servet Arslan, AI Agent
**Technical Story:** Initial technology selection for HookSniff's primary database

---

## Context

HookSniff needs a relational database for:
- User accounts, API keys, endpoints (ACID transactions)
- Webhook queue (high-throughput inserts and dequeues)
- Delivery history (append-heavy, time-series queries)
- Billing data (consistency critical)

Requirements:
- Serverless hosting (no database administration)
- JSON support (flexible webhook payloads)
- Strong ACID guarantees (billing, queue integrity)
- Good Rust ecosystem support (SQLx)
- Cost-effective at launch (free tier available)
- Horizontal scaling path for future growth

## Decision

We chose **PostgreSQL** (hosted on Neon serverless) as the primary database.

### Key Reasons

1. **JSONB support** — Native binary JSON storage and indexing. Webhook payloads can be stored as JSONB with GIN indexes for flexible querying without schema changes.

2. **CTE and window functions** — Complex analytics queries (delivery success rates, queue depth over time) are straightforward with PostgreSQL's SQL extensions.

3. **Advisory locks** — Needed for distributed worker coordination. `pg_try_advisory_lock()` allows safe concurrent dequeue without external coordination.

4. **LISTEN/NOTIFY** — Real-time queue notifications without polling. Worker can `LISTEN` for new webhook events instead of polling every second.

5. **Neon serverless** — True serverless PostgreSQL with scale-to-zero, branching (for dev/staging), and generous free tier (512 MB storage, 100 connections).

6. **SQLx** — First-class Rust support with compile-time query checking. Queries are validated against the database schema at build time.

7. **Extensions** — `pg_trgm` for fuzzy search, `pg_cron` for scheduled tasks, `pg_stat_statements` for query performance monitoring.

## Consequences

### Positive
- Rich SQL features reduce application complexity
- JSONB allows schema evolution without migrations
- Neon branching enables cheap staging environments
- Compile-time query safety with SQLx
- Battle-tested at scale (Supabase, Notion, Instagram)

### Negative
- Slightly higher memory usage than MySQL for simple queries
- Neon free tier has cold start latency (~500ms)
- Must manage connection pooling carefully (Neon connection limits)

### Neutral
- Team needs PostgreSQL-specific knowledge (CTEs, advisory locks)
- Different backup strategy than MySQL (pg_dump vs mysqldump)

## Alternatives Considered

### MySQL (PlanetScale)
- **Pros:** Familiar, PlanetScale branching, simpler query planner
- **Cons:** No native JSONB (JSON column is text-based), no advisory locks, limited CTE support, weaker SQL extensions
- **Why rejected:** Missing features that would require application-level workarounds

### SQLite (Turso)
- **Pros:** Embedded, zero-config, Turso for distributed SQLite
- **Cons:** Single-writer limitation, no LISTEN/NOTIFY, weaker concurrent access, less mature Rust ecosystem
- **Why rejected:** Concurrent write requirements (webhook queue) exceed SQLite's capabilities

### CockroachDB
- **Pros:** Distributed SQL, PostgreSQL wire compatible, strong consistency
- **Cons:** Higher latency, more expensive, complex operations, overkill for launch scale
- **Why rejected:** Complexity and cost don't justify at current scale

## References

- [Neon Documentation](https://neon.tech/docs)
- [SQLx Documentation](https://docs.rs/sqlx)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
