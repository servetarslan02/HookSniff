/**
 * HookSniff Load Test — Stress Test
 * ===================================
 * Yüksek trafik. Sistem limitlerini bulmak için.
 * 500 VUs, 2 dakika süre.
 *
 * Usage:
 *   k6 run tests/load/stress_test.js
 *   k6 run -e BASE_URL=http://localhost:3000 -e API_KEY=hr_live_test tests/load/stress_test.js
 *
 * Warning: Bu test sistemi zorlayacak. Production'da çalıştırmayın!
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const errorRate = new Rate('errors');
const webhookLatency = new Trend('webhook_latency');
const reqPerSec = new Counter('requests_per_second');
const status429 = new Counter('rate_limited_count');
const status5xx = new Counter('server_errors');

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_KEY = __ENV.API_KEY || 'hr_live_test';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

export const options = {
  stages: [
    { duration: '15s', target: 100 },   // Warm up
    { duration: '30s', target: 300 },   // Ramp to 300
    { duration: '30s', target: 500 },   // Peak at 500
    { duration: '30s', target: 500 },   // Sustain peak
    { duration: '15s', target: 0 },     // Cool down
  ],

  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    errors: ['rate<0.15'],             // Higher tolerance for stress
    webhook_latency: ['p(95)<2000'],
    rate_limited_count: ['count<1000'], // Expect some 429s
  },
};

export function setup() {
  // Create a pool of endpoints
  const ids = [];
  console.log('Creating 20 test endpoints for stress test...');

  for (let i = 0; i < 20; i++) {
    const res = http.post(`${BASE_URL}/v1/endpoints`, JSON.stringify({
      url: 'https://httpbin.org/post',
      description: `stress-test-${i}`,
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
    sleep(0.5);
    return;
  }

  const endpointId = endpointIds[__VU % endpointIds.length];
  reqPerSec.add(1);

  // 80% webhook sends (the heavy operation), 20% reads
  if (Math.random() < 0.8) {
    const payload = JSON.stringify({
      endpoint_id: endpointId,
      event: 'stress.test',
      data: {
        vu: __VU,
        iter: __ITER,
        ts: Date.now(),
        // Add some payload weight
        items: Array.from({ length: 5 }, (_, i) => ({
          id: i,
          value: Math.random(),
        })),
      },
    });

    const res = http.post(`${BASE_URL}/v1/webhooks`, payload, { headers });

    if (res.status === 429) {
      status429.add(1);
    }
    if (res.status >= 500) {
      status5xx.add(1);
    }

    const ok = check(res, {
      'webhook accepted or rate-limited': (r) => r.status === 200 || r.status === 429,
      'webhook < 2s': (r) => r.timings.duration < 2000,
    });
    errorRate.add(!ok && res.status !== 429); // Don't count 429 as error
    webhookLatency.add(res.timings.duration);

  } else {
    // Reads
    const choice = Math.random();
    let res;

    if (choice < 0.5) {
      res = http.get(`${BASE_URL}/v1/endpoints`, { headers });
    } else if (choice < 0.8) {
      res = http.get(`${BASE_URL}/v1/webhooks?page=1&per_page=10`, { headers });
    } else {
      res = http.get(`${BASE_URL}/v1/stats`, { headers });
    }

    if (res.status === 429) {
      status429.add(1);
    }
    if (res.status >= 500) {
      status5xx.add(1);
    }

    const ok = check(res, { 'read 200 or 429': (r) => r.status === 200 || r.status === 429 });
    errorRate.add(!ok && res.status !== 429);
  }

  sleep(0.05); // Minimal sleep — we want pressure
}

export function teardown(data) {
  console.log('Stress test complete. Cleaning up...');
  const ids = data.endpointIds || [];
  for (const id of ids) {
    http.del(`${BASE_URL}/v1/endpoints/${id}`, null, { headers });
  }
  console.log(`Cleaned up ${ids.length} endpoints`);
}
