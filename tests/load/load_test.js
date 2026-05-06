/**
 * HookSniff Load Test — Load Test
 * ================================
 * Orta düzey trafik simülasyonu. Gerçekçi production yükü.
 * 100 VUs, 5 dakika süre.
 *
 * Usage:
 *   k6 run tests/load/load_test.js
 *   k6 run -e BASE_URL=https://staging.hooksniff.is-a.dev -e API_KEY=hr_live_staging tests/load/load_test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const webhookLatency = new Trend('webhook_latency');
const requestCount = new Counter('total_requests');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || 'hr_live_test';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

export const options = {
  stages: [
    { duration: '30s', target: 20 },   // Ramp up
    { duration: '1m', target: 100 },   // Reach target
    { duration: '3m', target: 100 },   // Sustain
    { duration: '30s', target: 0 },    // Ramp down
  ],

  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'],
    errors: ['rate<0.05'],
    webhook_latency: ['p(95)<500', 'p(99)<2000'],
  },
};

// Endpoints created during setup
let endpointIds = [];

export function setup() {
  console.log('Creating 50 test endpoints...');
  const ids = [];

  for (let i = 0; i < 50; i++) {
    const res = http.post(`${BASE_URL}/v1/endpoints`, JSON.stringify({
      url: `https://httpbin.org/post`,
      description: `load-test-endpoint-${i}`,
      events: ['order.created', 'order.paid', 'payment.failed'],
    }), { headers });

    if (res.status < 300) {
      ids.push(res.json('id'));
    }
  }

  console.log(`Created ${ids.length} endpoints`);
  return { endpointIds: ids };
}

export default function (data) {
  const endpointIds = data.endpointIds || [];
  if (endpointIds.length === 0) {
    sleep(1);
    return;
  }

  const endpointId = endpointIds[Math.floor(Math.random() * endpointIds.length)];
  requestCount.add(1);

  // Workload distribution (realistic):
  // 55% webhook send, 15% list webhooks, 10% get webhook detail,
  // 10% list endpoints, 5% stats, 5% replay
  const action = Math.random();

  if (action < 0.55) {
    // Send webhook
    const events = ['order.created', 'order.paid', 'payment.failed', 'user.registered'];
    const event = events[Math.floor(Math.random() * events.length)];

    const payload = JSON.stringify({
      endpoint_id: endpointId,
      event: event,
      data: {
        order_id: `ORD-${__VU}-${__ITER}`,
        amount: Math.floor(Math.random() * 10000) / 100,
        ts: Date.now(),
      },
    });

    const res = http.post(`${BASE_URL}/v1/webhooks`, payload, { headers });
    const ok = check(res, {
      'webhook 2xx': (r) => r.status >= 200 && r.status < 300,
      'webhook < 500ms': (r) => r.timings.duration < 500,
    });
    errorRate.add(!ok);
    webhookLatency.add(res.timings.duration);

  } else if (action < 0.70) {
    // List webhooks
    const page = Math.floor(Math.random() * 5) + 1;
    const res = http.get(`${BASE_URL}/v1/webhooks?page=${page}&per_page=20`, { headers });
    const ok = check(res, { 'list webhooks 200': (r) => r.status === 200 });
    errorRate.add(!ok);

  } else if (action < 0.80) {
    // Get webhook detail (use a recent webhook)
    const res = http.get(`${BASE_URL}/v1/webhooks?page=1&per_page=1`, { headers });
    if (res.status === 200) {
      const body = res.json();
      const items = body.data || body.items || body;
      if (Array.isArray(items) && items.length > 0) {
        const whId = items[0].id;
        const detailRes = http.get(`${BASE_URL}/v1/webhooks/${whId}`, { headers });
        check(detailRes, { 'webhook detail 200': (r) => r.status === 200 });
      }
    }

  } else if (action < 0.90) {
    // List endpoints
    const res = http.get(`${BASE_URL}/v1/endpoints`, { headers });
    const ok = check(res, { 'list endpoints 200': (r) => r.status === 200 });
    errorRate.add(!ok);

  } else if (action < 0.95) {
    // Stats
    const res = http.get(`${BASE_URL}/v1/stats`, { headers });
    const ok = check(res, { 'stats 200': (r) => r.status === 200 });
    errorRate.add(!ok);

  } else {
    // Replay (pick random endpoint and send)
    const payload = JSON.stringify({
      endpoint_id: endpointId,
      event: 'loadtest.replay',
      data: { replay: true, ts: Date.now() },
    });
    const res = http.post(`${BASE_URL}/v1/webhooks`, payload, { headers });
    check(res, { 'replay 2xx': (r) => r.status >= 200 && r.status < 300 });
  }

  sleep(Math.random() * 0.5 + 0.1); // 100-600ms think time
}

export function teardown(data) {
  console.log('Cleaning up test endpoints...');
  const ids = data.endpointIds || [];
  let cleaned = 0;
  for (const id of ids) {
    const res = http.del(`${BASE_URL}/v1/endpoints/${id}`, null, { headers });
    if (res.status < 300) cleaned++;
  }
  console.log(`Cleaned up ${cleaned}/${ids.length} endpoints`);
}
