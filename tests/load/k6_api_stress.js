import http from "k6/http";
import { check, sleep, group } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

// ─── Config ───────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const API_KEY = __ENV.API_KEY || "";

// ─── Custom Metrics ───────────────────────────────────────────────
const endpointListLatency = new Trend("endpoint_list_latency", true);
const webhookListLatency = new Trend("webhook_list_latency", true);
const webhookGetLatency = new Trend("webhook_get_latency", true);
const endpointCreateLatency = new Trend("endpoint_create_latency", true);
const webhookCreateLatency = new Trend("webhook_create_latency", true);
const statsLatency = new Trend("stats_latency", true);
const healthLatency = new Trend("health_latency", true);
const apiSuccessRate = new Rate("api_success_rate");
const apiErrors = new Counter("api_errors");
const p95Exceeded = new Counter("p95_exceeded_500ms");

// ─── Options ──────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Gradually increase load to find breaking point
    stress: {
      executor: "ramping-vus",
      startVUs: 1,
      stages: [
        { duration: "30s", target: 5 },    // Warm up
        { duration: "30s", target: 10 },   // Light
        { duration: "30s", target: 20 },   // Moderate
        { duration: "30s", target: 40 },   // Heavy
        { duration: "30s", target: 60 },   // Stress
        { duration: "30s", target: 80 },   // High stress
        { duration: "30s", target: 100 },  // Breaking point probe
        { duration: "30s", target: 0 },    // Cool down
      ],
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    api_success_rate: ["rate>0.90"],
    // Alert if p95 exceeds 500ms for any endpoint
    endpoint_list_latency: ["p(95)<500"],
    webhook_list_latency: ["p(95)<500"],
    stats_latency: ["p(95)<500"],
  },
};

// ─── Setup ────────────────────────────────────────────────────────
export function setup() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };

  // Create a test endpoint for webhook creation tests
  const endpointRes = http.post(
    `${BASE_URL}/v1/endpoints`,
    JSON.stringify({
      url: "https://httpbin.org/post",
      description: "Stress test endpoint",
    }),
    { headers }
  );

  let endpointId = "";
  if (endpointRes.status === 200) {
    endpointId = endpointRes.json("id");
  }

  return { endpointId, headers };
}

// ─── Helpers ──────────────────────────────────────────────────────
function measureAndCheck(name, res, trend, expectStatus) {
  trend.add(res.timings.duration);
  const ok = check(res, {
    [`${name} status ${expectStatus || 200}`]: (r) => r.status === (expectStatus || 200),
    [`${name} under 500ms`]: (r) => r.timings.duration < 500,
  });
  apiSuccessRate.add(ok);
  if (!ok) {
    apiErrors.add(1);
    if (res.timings.duration > 500) {
      p95Exceeded.add(1);
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────
export default function (data) {
  const { endpointId, headers } = data;

  // 1. Health check (no auth)
  group("health", () => {
    const res = http.get(`${BASE_URL}/health`, {
      tags: { name: "GET /health" },
    });
    measureAndCheck("health", res, healthLatency);
  });

  // 2. List endpoints
  group("list_endpoints", () => {
    const res = http.get(`${BASE_URL}/v1/endpoints`, {
      headers,
      tags: { name: "GET /v1/endpoints" },
    });
    measureAndCheck("list_endpoints", res, endpointListLatency);
  });

  // 3. List webhooks
  group("list_webhooks", () => {
    const res = http.get(`${BASE_URL}/v1/webhooks?page=1&per_page=10`, {
      headers,
      tags: { name: "GET /v1/webhooks" },
    });
    measureAndCheck("list_webhooks", res, webhookListLatency);
  });

  // 4. Get specific webhook (if we have one)
  group("get_webhook", () => {
    // First fetch one to get an ID
    const listRes = http.get(`${BASE_URL}/v1/webhooks?page=1&per_page=1`, {
      headers,
      tags: { name: "GET /v1/webhooks (prefetch)" },
    });

    if (listRes.status === 200) {
      const deliveries = listRes.json("deliveries");
      if (deliveries && deliveries.length > 0) {
        const webhookId = deliveries[0].id;
        const res = http.get(`${BASE_URL}/v1/webhooks/${webhookId}`, {
          headers,
          tags: { name: "GET /v1/webhooks/:id" },
        });
        measureAndCheck("get_webhook", res, webhookGetLatency);
      }
    }
  });

  // 5. Get stats
  group("stats", () => {
    const res = http.get(`${BASE_URL}/v1/stats`, {
      headers,
      tags: { name: "GET /v1/stats" },
    });
    measureAndCheck("stats", res, statsLatency);
  });

  // 6. Create endpoint (sparsely — only ~5% of iterations)
  if (__ITER % 20 === 0) {
    group("create_endpoint", () => {
      const res = http.post(
        `${BASE_URL}/v1/endpoints`,
        JSON.stringify({
          url: `https://httpbin.org/post?ts=${Date.now()}`,
          description: `Stress test ep ${__VU}-${__ITER}`,
        }),
        {
          headers,
          tags: { name: "POST /v1/endpoints" },
        }
      );
      measureAndCheck("create_endpoint", res, endpointCreateLatency);
    });
  }

  // 7. Send a webhook (sparsely — ~10% of iterations)
  if (__ITER % 10 === 0 && endpointId) {
    group("create_webhook", () => {
      const res = http.post(
        `${BASE_URL}/v1/webhooks`,
        JSON.stringify({
          endpoint_id: endpointId,
          event: "stress.test",
          data: { vu: __VU, iter: __ITER },
        }),
        {
          headers,
          tags: { name: "POST /v1/webhooks" },
        }
      );
      measureAndCheck("create_webhook", res, webhookCreateLatency);
    });
  }

  sleep(0.1); // Small pause between iterations
}

// ─── Teardown ─────────────────────────────────────────────────────
export function teardown(data) {
  if (!data.endpointId) return;

  http.del(`${BASE_URL}/v1/endpoints/${data.endpointId}`, null, {
    headers: data.headers,
  });
  console.log(`Cleaned up stress test endpoint: ${data.endpointId}`);
}
