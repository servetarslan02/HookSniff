# HookSniff Load Tests

k6-based load testing suite for HookSniff's API, webhook delivery pipeline, and worker throughput.

## Prerequisites

- [k6](https://k6.io/docs/getting-started/installation/) installed
- Node.js (for the test receiver)
- HookSniff API running (local or remote)

## Quick Start

```bash
# 1. Start the test receiver (returns 200 for all webhooks)
node tests/load/webhook_receiver.js

# 2. Run the webhook flow test
API_KEY=hr_live_YOUR_KEY k6 run tests/load/k6_webhook_flow.js

# 3. Run the API stress test
API_KEY=hr_live_YOUR_KEY k6 run tests/load/k6_api_stress.js

# 4. Run the worker throughput test
API_KEY=hr_live_YOUR_KEY k6 run tests/load/k6_worker_throughput.js
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `BASE_URL` | `http://localhost:3000` | HookSniff API base URL |
| `API_KEY` | _(none)_ | Your `hr_live_*` API key |
| `RECEIVER_URL` | `http://localhost:8090` | Test webhook receiver URL |
| `TOTAL_WEBHOOKS` | `10000` | Number of webhooks for throughput test |
| `WEBHOOKS_PER_ITERATION` | `5` | Webhooks per VU iteration (flow test) |
| `POLL_INTERVAL` | `5` | Seconds between status polls (throughput) |
| `MAX_WAIT` | `300` | Max seconds to wait for worker (throughput) |

## Test Descriptions

### 1. Webhook Flow (`k6_webhook_flow.js`)

Full end-to-end test. Creates an endpoint → sends webhooks at increasing rates → cleans up.

**Phases:**
| Phase | Duration | Rate | VUs |
|-------|----------|------|-----|
| Warmup | 1 min | 10/s | 10-20 |
| Medium | 1.5 min | 50/s | 30-80 |
| High | 1.5 min | 100/s | 60-150 |
| Stress | 2 min | 200/s | 100-300 |

**What to watch:**
- `webhook_send_latency` — p95 should stay under 2s
- `webhook_success_rate` — should stay above 95%
- Where does the rate plateau? That's your throughput ceiling.

### 2. API Stress (`k6_api_stress.js`)

Ramps VUs from 5 → 100 to find where API latency degrades.

**Endpoints tested:**
- `GET /health`
- `GET /v1/endpoints`
- `GET /v1/webhooks`
- `GET /v1/webhooks/:id`
- `GET /v1/stats`
- `POST /v1/endpoints` (5% of iterations)
- `POST /v1/webhooks` (10% of iterations)

**What to watch:**
- At what VU count does p95 exceed 500ms?
- Which endpoint degrades first?
- `p95_exceeded_500ms` counter — if climbing, you're past the limit.

### 3. Worker Throughput (`k6_worker_throughput.js`)

Pre-populates the queue with webhooks, then monitors how fast the worker drains them.

**Process:**
1. Creates an endpoint pointing to the test receiver
2. Batches 10,000 webhooks into the queue via `POST /v1/webhooks/batch`
3. Polls `GET /v1/stats` every 5 seconds
4. Reports throughput (items/sec), failure rate, and total processing time

**What to watch:**
- `worker_items_per_sec` — baseline throughput
- `worker_failure_rate` — should be <5%
- Total time to drain 10K items — establishes capacity planning numbers

### 4. Test Receiver (`webhook_receiver.js`)

A minimal Node.js HTTP server that accepts webhook POSTs and returns 200. Use this instead of a real endpoint to isolate HookSniff performance from downstream latency.

```bash
# Start it
node tests/load/webhook_receiver.js

# Custom port
PORT=9000 node tests/load/webhook_receiver.js

# Verbose logging (logs every 1000th request)
VERBOSE=true node tests/load/webhook_receiver.js

# Check stats
curl http://localhost:8090/stats
```

## Expected Baselines

These are rough targets for a single-node deployment on free-tier infrastructure:

| Metric | Target | Concern |
|--------|--------|---------|
| API p50 latency | <50ms | >100ms = investigate |
| API p95 latency | <200ms | >500ms = bottleneck |
| Webhook creation p95 | <500ms | >2s = queue/DB issue |
| Webhook success rate | >99% | <95% = reliability issue |
| Worker throughput | >100/s | <50/s = worker bottleneck |
| Queue drain time (10K) | <5 min | >10 min = scale worker |

## Interpreting Results

### Reading k6 Output

k6 prints a summary after each run. Key sections:

```
     http_req_duration..............: avg=45ms  min=12ms  med=38ms  max=890ms  p(90)=95ms  p(95)=180ms
     webhook_success_rate...........: 98.50%   (5840/5929)
     webhook_send_latency...........: avg=42ms  min=10ms  med=35ms  max=1200ms p(90)=89ms  p(95)=175ms
```

- **p(95)** is the 95th percentile — 95% of requests are faster than this
- **p(99)** catches the tail — slow requests that affect UX
- **Rate** metrics show percentage — 0.985 = 98.5%

### Finding the Breaking Point

1. Run `k6_api_stress.js` and note when p95 crosses 500ms
2. Run `k6_webhook_flow.js` and note when success rate drops below 95%
3. The lower of the two is your effective capacity limit

### JSON Output for CI

```bash
k6 run --out json=results.json tests/load/k6_webhook_flow.js
```

Or use k6's `--summary-export` flag:

```bash
k6 run --summary-export=summary.json tests/load/k6_webhook_flow.js
```

## Free Tier Limits to Watch

### Neon (PostgreSQL)

| Limit | Free Tier | Impact |
|-------|-----------|--------|
| Compute | 0.25 CU (shared) | Query latency spikes under load |
| Connections | ~20 pooled | Connection exhaustion at high VU counts |
| Storage | 512 MB | Delivery logs fill up fast |
| Branches | 10 | Use sparingly for test data |

**Watch for:** `connection refused`, `too many clients`, queries taking >1s

**Mitigation:** Neon's connection pooler (via `-pooler` suffix in connection string) helps. Keep test duration short.

### Upstash (Redis)

| Limit | Free Tier | Impact |
|-------|-----------|--------|
| Commands | 500K/month | Each webhook = ~3-5 Redis ops |
| Bandwidth | 1 GB/month | Payload size matters |
| Max connections | 100 | Enough for testing |
| Request size | 1 MB | Webhook payload limit |

**Watch for:** 500K command budget. A 10K webhook throughput test ≈ 30-50K commands. Running all three tests ≈ 80-150K commands. Budget accordingly.

**Monthly budget estimate:**
- Webhook flow test: ~20K commands
- API stress test: ~5K commands  
- Worker throughput (10K items): ~40K commands
- **Total per full run: ~65K commands (~13% of monthly budget)**

### Oracle Cloud (Compute)

| Limit | Free Tier | Impact |
|-------|-----------|--------|
| CPU | 1/8 OCPU (A1) | Single-threaded bottleneck |
| RAM | 1 GB | Worker memory pressure |
| Network | 10 TB/month | Not a concern for testing |

**Watch for:** CPU saturation during worker throughput test. If worker can't keep up, it's likely CPU-bound.

## Tips

- **Run against staging, not production.** Load tests create real data and may hit rate limits.
- **Clean up after tests.** Each test has a `teardown` that deletes test endpoints, but verify.
- **One test at a time.** Don't run all three simultaneously — they'll interfere with each other's metrics.
- **Increase `TOTAL_WEBHOOKS` gradually.** Start with 100, then 1000, then 10000.
- **Check the receiver.** If the test receiver isn't running, webhooks will fail and skew results.
