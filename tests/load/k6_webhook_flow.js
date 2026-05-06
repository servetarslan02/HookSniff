import http from "k6/http";
import { check, sleep, group } from "k6";
import { Counter, Trend, Rate } from "k6/metrics";

// ─── Config ───────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || "http://localhost:3000";
const API_KEY = __ENV.API_KEY || "";
const RECEIVER_URL = __ENV.RECEIVER_URL || "http://localhost:8090";
const WEBHOOKS_PER_ITERATION = parseInt(__ENV.WEBHOOKS_PER_ITERATION || "5");

// ─── Custom Metrics ───────────────────────────────────────────────
const webhookLatency = new Trend("webhook_send_latency", true);
const webhookSuccess = new Rate("webhook_success_rate");
const webhookErrors = new Counter("webhook_errors");

// ─── Options ──────────────────────────────────────────────────────
export const options = {
  scenarios: {
    // Phase 1: Warm up at 10/s
    warmup: {
      executor: "constant-arrival-rate",
      rate: 10,
      timeUnit: "1s",
      duration: "1m",
      preAllocatedVUs: 10,
      maxVUs: 20,
      startTime: "0s",
      exec: "sendWebhook",
    },
    // Phase 2: Ramp to 50/s
    medium: {
      executor: "ramping-arrival-rate",
      startRate: 10,
      timeUnit: "1s",
      stages: [
        { duration: "30s", target: 50 },
        { duration: "1m", target: 50 },
      ],
      preAllocatedVUs: 30,
      maxVUs: 80,
      startTime: "1m",
      exec: "sendWebhook",
    },
    // Phase 3: Ramp to 100/s
    high: {
      executor: "ramping-arrival-rate",
      startRate: 50,
      timeUnit: "1s",
      stages: [
        { duration: "30s", target: 100 },
        { duration: "1m", target: 100 },
      ],
      preAllocatedVUs: 60,
      maxVUs: 150,
      startTime: "2m30s",
      exec: "sendWebhook",
    },
    // Phase 4: Push to 200/s
    stress: {
      executor: "ramping-arrival-rate",
      startRate: 100,
      timeUnit: "1s",
      stages: [
        { duration: "30s", target: 200 },
        { duration: "1m30s", target: 200 },
      ],
      preAllocatedVUs: 100,
      maxVUs: 300,
      startTime: "4m",
      exec: "sendWebhook",
    },
  },
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<5000"],
    webhook_success_rate: ["rate>0.95"],
    webhook_send_latency: ["p(95)<2000"],
  },
};

// ─── Setup: Create endpoint on receiver ───────────────────────────
export function setup() {
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_KEY}`,
  };

  // Verify receiver is up
  const healthCheck = http.get(`${RECEIVER_URL}/health`);
  check(healthCheck, {
    "receiver is up": (r) => r.status === 200,
  });

  // Create endpoint pointing to receiver
  const endpointRes = http.post(
    `${BASE_URL}/v1/endpoints`,
    JSON.stringify({
      url: `${RECEIVER_URL}/webhook`,
      description: "Load test endpoint",
      retry_policy: {
        max_attempts: 1,
        backoff: "exponential",
        initial_delay_secs: 10,
        max_delay_secs: 60,
      },
    }),
    { headers }
  );

  const endpointCreated = check(endpointRes, {
    "endpoint created": (r) => r.status === 200,
  });

  if (!endpointCreated) {
    console.error(`Failed to create endpoint: ${endpointRes.status} ${endpointRes.body}`);
    // Try to continue anyway — maybe endpoint exists from a previous run
  }

  const endpointId = endpointRes.status === 200
    ? endpointRes.json("id")
    : __ENV.ENDPOINT_ID || "";

  return { endpointId, headers };
}

// ─── Main: Send webhooks ──────────────────────────────────────────
export function sendWebhook(data) {
  const { endpointId, headers } = data;

  for (let i = 0; i < WEBHOOKS_PER_ITERATION; i++) {
    const idempotencyKey = `loadtest-${__VU}-${__ITER}-${i}-${Date.now()}`;

    const payload = JSON.stringify({
      endpoint_id: endpointId,
      event: "loadtest.ping",
      data: {
        vu: __VU,
        iter: __ITER,
        seq: i,
        ts: new Date().toISOString(),
      },
    });

    const res = http.post(`${BASE_URL}/v1/webhooks`, payload, {
      headers: {
        ...headers,
        "Idempotency-Key": idempotencyKey,
      },
      tags: { name: "POST /v1/webhooks" },
    });

    webhookLatency.add(res.timings.duration);
    webhookSuccess.add(res.status === 200);

    if (res.status !== 200) {
      webhookErrors.add(1);
      console.warn(`Webhook failed: ${res.status} — ${res.body}`);
    }
  }
}

// ─── Teardown: Cleanup ────────────────────────────────────────────
export function teardown(data) {
  if (!data.endpointId) return;

  const headers = data.headers;
  const res = http.del(
    `${BASE_URL}/v1/endpoints/${data.endpointId}`,
    null,
    { headers }
  );

  check(res, {
    "endpoint deleted": (r) => r.status === 200 || r.status === 404,
  });

  console.log(`Cleaned up endpoint: ${data.endpointId}`);
}
