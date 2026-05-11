# ADR-002: Rust + Axum over Node.js

**Date:** 2026-04-01
**Status:** Accepted
**Deciders:** Servet Arslan, AI Agent
**Technical Story:** Selection of API server and worker runtime for HookSniff

---

## Context

HookSniff requires two backend services:
1. **API Server** — REST API handling webhook ingestion, endpoint management, authentication
2. **Worker** — Background process delivering webhooks to customer endpoints with retry logic

Requirements:
- High throughput (webhook delivery is the core product)
- Low latency (customers expect fast API responses)
- Memory efficiency (serverless deployment, pay per resource)
- Reliable webhook delivery (exactly-once semantics with retries)
- Strong security (cryptographic signing, SSRF protection)
- Cost-effective (low margins at $29/month pricing)
- Maintainable by a single developer (Servet) + AI agent

## Decision

We chose **Rust** with **Axum** framework for both API server and worker.

### Key Reasons

1. **Performance** — Rust provides near-C performance with zero-cost abstractions. Webhook delivery is CPU-bound (signing, serialization) and I/O-bound (HTTP delivery). Rust handles both efficiently.

2. **Memory safety** — No garbage collector pauses, no null pointer exceptions. Critical for a webhook delivery service where reliability is the product.

3. **Axum ecosystem** — Built on tokio + hyper (the de facto async Rust stack). Tower middleware ecosystem for auth, rate limiting, CORS. Excellent developer ergonomics with extractors.

4. **Compile-time guarantees** — SQLx validates queries at build time. Serde catches serialization errors at compile time. Type system prevents many runtime errors.

5. **Single binary deployment** — No runtime dependencies, no node_modules, no version conflicts. Deploys to Cloud Run as a minimal Docker image (~20MB).

6. **Concurrency model** — Tokio's async runtime handles thousands of concurrent webhook deliveries without thread explosion. `tokio::select!` for timeout handling.

7. **Cost efficiency** — Lower memory footprint than Node.js (20MB vs 100MB+). Fewer Cloud Run instances needed for same throughput.

## Consequences

### Positive
- Sub-millisecond p50 API latency
- Thousands of concurrent webhook deliveries
- Small Docker images, fast cold starts
- Memory-safe by default (no use-after-free, no data races)
- Strong type system catches bugs at compile time

### Negative
- Steeper learning curve (ownership, borrowing, lifetimes)
- Slower development velocity (compilation times, stricter types)
- Smaller ecosystem than Node.js (fewer libraries)
- Harder to hire Rust developers (if team grows)
- AI agent must be more careful with Rust code (common pitfalls)

### Neutral
- Different mental model from GC languages
- Error handling with `Result<T, E>` is explicit but verbose
- Macro system powerful but can be confusing

## Alternatives Considered

### Node.js (Express/Fastify)
- **Pros:** Huge ecosystem, fast prototyping, easy to hire, AI agent very familiar
- **Cons:** Single-threaded, GC pauses affect latency, higher memory usage, runtime type checking, callback complexity at scale
- **Why rejected:** Performance and reliability requirements exceed what Node.js can provide cost-effectively

### Go (Gin/Echo)
- **Pros:** Good performance, simpler than Rust, great concurrency (goroutines), easy deployment
- **Cons:** Less memory-safe than Rust (nil dereference), GC pauses, less expressive type system, error handling boilerplate
- **Why rejected:** Rust's memory safety and performance advantages outweigh Go's simplicity

### Elixir (Phoenix)
- **Pros:** Excellent concurrency (BEAM VM), fault-tolerant, real-time features built-in
- **Cons:** Smaller ecosystem, harder to deploy, different paradigm, less suitable for CPU-bound work
- **Why rejected:** CPU-bound webhook signing and serialization not ideal for BEAM VM

### Python (FastAPI)
- **Pros:** Fast development, huge ecosystem, AI agent familiar
- **Cons:** Slow runtime, GIL limits concurrency, high memory usage, not suitable for high-throughput webhook delivery
- **Why rejected:** Performance requirements incompatible with Python runtime

## References

- [Axum Documentation](https://docs.rs/axum)
- [Tokio Documentation](https://tokio.rs)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
- [Why Rust for Web Services](https://blog.rust-lang.org/2020/07/16/Rust-1.45.0.html)
