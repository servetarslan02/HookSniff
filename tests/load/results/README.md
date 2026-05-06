# Load Testing — How to Run & Interpret Results

## Prerequisites

Install [k6](https://k6.io/docs/getting-started/installation/):

```bash
# macOS
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | \
  sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6

# Docker
docker pull grafana/k6
```

## Running the Load Test

### Against local development

```bash
# Make sure HookSniff is running locally first
cd /root/.openclaw/workspace/hooksniff
k6 run tests/load/k6_load_test.js
```

### Against a remote/staging environment

```bash
k6 run \
  -e BASE_URL=https://api-staging.hooksniff.is-a.dev \
  -e API_KEY=hr_live_your_staging_key \
  tests/load/k6_load_test.js
```

### With custom parameters

```bash
# Reduce load for initial testing
k6 run \
  --duration 30s \
  --vus 10 \
  -e BASE_URL=http://localhost:3000 \
  -e API_KEY=hr_live_test \
  tests/load/k6_load_test.js
```

### Generate HTML report

```bash
k6 run --out json=tests/load/results/raw.json tests/load/k6_load_test.js

# Convert to HTML (requires k6-reporter)
# npm install -g k6-reporter
# k6-reporter tests/load/results/raw.json --output tests/load/results/report.html
```

## Scenarios

| Scenario | What it tests | Target | Duration |
|----------|--------------|--------|----------|
| `webhook_deliveries` | High-throughput webhook processing | 1000 req/s | 2 min |
| `endpoint_creation` | Concurrent endpoint CRUD operations | 100 VUs | 1 min |
| `mixed_workload` | Realistic mixed read/write traffic | 10→100 VUs | 2 min |

## Key Metrics to Watch

### Response Time
- **p95 < 500ms** — 95th percentile should be under 500ms
- **p99 < 2000ms** — 99th percentile should be under 2s
- If p99 > 5s, investigate database queries and Kafka publish latency

### Error Rate
- **< 5%** — Less than 5% of requests should fail
- Check `http_req_failed` and the custom `errors` metric
- Look for 429 (rate limited) vs 500 (server errors)

### Throughput
- The `webhook_deliveries` scenario targets 1000 req/s
- If actual rate is significantly lower, the system may be bottlenecked
- Check CPU, memory, database connections, Kafka throughput

### Resource Usage (monitor during test)
```bash
# CPU and memory
docker stats

# CockroachDB dashboard
open http://localhost:8080

# Redpanda metrics
rpk cluster health --api-urls=localhost:9644
```

## Interpreting Results

### Good Results
```
http_req_duration..............: avg=45ms   min=2ms   max=320ms  p(95)=120ms  p(99)=250ms
http_req_failed................: 0.00%   ✓ 0   ✗ 15420
delivery_latency................: avg=42ms   min=1ms   max=280ms  p(95)=110ms  p(99)=230ms
webhook_deliveries..............: 1000.23/s
```

### Problematic Results
```
http_req_duration..............: avg=2.1s   min=5ms   max=15s    p(95)=8s     p(99)=12s  ← TOO HIGH
http_req_failed................: 12.50%  ✓ 1800  ✗ 2200          ← TOO HIGH
errors..........................: 12.50%                      ← CHECK ENDPOINTS
```

**Common issues:**
1. **High p95/p99** → Database query optimization needed, check connection pool size
2. **High error rate** → Check application logs, verify Kafka connectivity
3. **Low throughput** → Bottleneck in API or database; consider horizontal scaling
4. **Memory growth** → Potential memory leak; check Rust allocator usage

## CI Integration

Add to `.github/workflows/ci.yml`:

```yaml
load-test:
  runs-on: ubuntu-latest
  needs: [build-api, build-worker]
  if: github.ref == 'refs/heads/main'
  steps:
    - uses: actions/checkout@v4
    - uses: grafana/k6-action@v0.3.1
      with:
        filename: tests/load/k6_load_test.js
        flags: --duration 30s --vus 10
      env:
        BASE_URL: http://localhost:3000
```
