/**
 * HookSniff Load Test — Smoke Test
 * =================================
 * Minimal load to verify the system works under light traffic.
 * 10 VUs, 1 dakika süre.
 *
 * Usage:
 *   k6 run tests/load/smoke_test.js
 *   k6 run -e BASE_URL=http://localhost:3000 -e API_KEY=hr_live_test tests/load/smoke_test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const webhookLatency = new Trend('webhook_latency');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || 'hr_live_test';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

export const options = {
  vus: 10,
  duration: '1m',

  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<3000'],
    errors: ['rate<0.1'],
    webhook_latency: ['p(95)<1000'],
  },
};

export function setup() {
  // Create a test endpoint
  const res = http.post(`${BASE_URL}/v1/endpoints`, JSON.stringify({
    url: 'https://httpbin.org/post',
    description: 'smoke-test-endpoint',
    events: ['test.ping'],
  }), { headers });

  if (res.status >= 300) {
    console.warn(`Setup: failed to create endpoint: ${res.status}`);
    return { endpointId: null };
  }

  const endpointId = res.json('id');
  console.log(`Setup: created endpoint ${endpointId}`);
  return { endpointId };
}

export default function (data) {
  const endpointId = data.endpointId || `ep_smoke_${__VU}`;

  // 70% webhook send, 20% list endpoints, 10% stats
  const action = Math.random();

  if (action < 0.7) {
    const payload = JSON.stringify({
      endpoint_id: endpointId,
      event: 'smoke.ping',
      data: { ts: Date.now(), vu: __VU, iter: __ITER },
    });

    const res = http.post(`${BASE_URL}/v1/webhooks`, payload, { headers });
    const ok = check(res, {
      'webhook 2xx': (r) => r.status >= 200 && r.status < 300,
      'webhook < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(!ok);
    webhookLatency.add(res.timings.duration);
  } else if (action < 0.9) {
    const res = http.get(`${BASE_URL}/v1/endpoints`, { headers });
    const ok = check(res, { 'list 200': (r) => r.status === 200 });
    errorRate.add(!ok);
  } else {
    const res = http.get(`${BASE_URL}/v1/stats`, { headers });
    const ok = check(res, { 'stats 200': (r) => r.status === 200 });
    errorRate.add(!ok);
  }

  sleep(1);
}

export function teardown(data) {
  if (data.endpointId) {
    http.del(`${BASE_URL}/v1/endpoints/${data.endpointId}`, null, { headers });
    console.log(`Teardown: deleted endpoint ${data.endpointId}`);
  }
}
