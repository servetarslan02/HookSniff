import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ── Custom metrics ──
const errorRate = new Rate('errors');
const deliveryLatency = new Trend('delivery_latency');

// ── Configuration ──
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || 'hr_live_test';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

// ──────────────────────────────────────────────────────────────
// Scenario definitions
// ──────────────────────────────────────────────────────────────

export const options = {
  scenarios: {
    // Scenario 1: High-throughput webhook deliveries
    webhook_deliveries: {
      executor: 'constant-arrival-rate',
      rate: 1000,              // 1000 iterations per timeUnit
      timeUnit: '1s',          // = 1000 req/s
      duration: '2m',
      preAllocatedVUs: 200,
      maxVUs: 500,
      exec: 'deliverWebhook',
    },

    // Scenario 2: Concurrent endpoint creations
    endpoint_creation: {
      executor: 'constant-vus',
      vus: 100,
      duration: '1m',
      exec: 'createEndpoint',
      startTime: '30s',        // Start after webhook deliveries begin
    },

    // Scenario 3: Mixed read/write workload
    mixed_workload: {
      executor: 'ramping-vus',
      startVUs: 10,
      stages: [
        { duration: '30s', target: 50 },
        { duration: '1m', target: 100 },
        { duration: '30s', target: 0 },
      ],
      exec: 'mixedWorkload',
      startTime: '1m',
    },
  },

  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'],
    errors: ['rate<0.05'],
    delivery_latency: ['p(95)<500', 'p(99)<2000'],
  },
};

// ──────────────────────────────────────────────────────────────
// Scenario 1: Webhook deliveries (1000/sec target)
// ──────────────────────────────────────────────────────────────

export function deliverWebhook() {
  const endpointId = `ep_loadtest_${Math.floor(Math.random() * 100)}`;

  const payload = JSON.stringify({
    endpoint_id: endpointId,
    event: 'loadtest.ping',
    data: {
      ts: Date.now(),
      iteration: __ITER,
    },
  });

  const res = http.post(`${BASE_URL}/v1/webhooks`, payload, { headers });

  const success = check(res, {
    'webhook status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  errorRate.add(!success);
  deliveryLatency.add(res.timings.duration);

  sleep(0.001); // Minimal sleep to prevent CPU saturation
}

// ──────────────────────────────────────────────────────────────
// Scenario 2: Endpoint creation (100 concurrent)
// ──────────────────────────────────────────────────────────────

export function createEndpoint() {
  const payload = JSON.stringify({
    url: `https://loadtest-${__VU}-${__ITER}.example.com/webhook`,
    description: `Load test endpoint VU${__VU}`,
    events: ['loadtest.ping', 'loadtest.data'],
  });

  const res = http.post(`${BASE_URL}/v1/endpoints`, payload, { headers });

  const success = check(res, {
    'endpoint creation status is 2xx': (r) => r.status >= 200 && r.status < 300,
    'response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  errorRate.add(!success);
  sleep(0.1);
}

// ──────────────────────────────────────────────────────────────
// Scenario 3: Mixed read/write workload
// ──────────────────────────────────────────────────────────────

export function mixedWorkload() {
  const action = Math.random();

  if (action < 0.5) {
    // 50% — Send webhook
    const payload = JSON.stringify({
      endpoint_id: `ep_loadtest_${Math.floor(Math.random() * 100)}`,
      event: 'loadtest.mixed',
      data: { ts: Date.now() },
    });
    const res = http.post(`${BASE_URL}/v1/webhooks`, payload, { headers });
    const success = check(res, { 'webhook 2xx': (r) => r.status >= 200 && r.status < 300 });
    errorRate.add(!success);
  } else if (action < 0.75) {
    // 25% — List endpoints
    const res = http.get(`${BASE_URL}/v1/endpoints`, { headers });
    const success = check(res, { 'list endpoints 200': (r) => r.status === 200 });
    errorRate.add(!success);
  } else {
    // 25% — Get delivery stats
    const res = http.get(`${BASE_URL}/v1/stats`, { headers });
    const success = check(res, { 'stats 200': (r) => r.status === 200 });
    errorRate.add(!success);
  }

  sleep(0.05);
}

// ──────────────────────────────────────────────────────────────
// Setup: create test endpoints before the load test
// ──────────────────────────────────────────────────────────────

export function setup() {
  console.log('Creating test endpoints...');

  for (let i = 0; i < 100; i++) {
    const payload = JSON.stringify({
      url: `https://loadtest-${i}.example.com/webhook`,
      description: `Load test endpoint ${i}`,
      events: ['loadtest.ping', 'loadtest.data', 'loadtest.mixed'],
    });

    const res = http.post(`${BASE_URL}/v1/endpoints`, payload, { headers });

    if (res.status >= 300) {
      console.warn(`Failed to create endpoint ${i}: ${res.status} ${res.body}`);
    }
  }

  console.log('Test endpoints created.');
  return { startTime: Date.now() };
}

export default function () {
  // Default function — not used since scenarios have exec
}
