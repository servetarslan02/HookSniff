// ─────────────────────────────────────────────────────────────────
// E2E Test Suite — Dashboard + WS + Fallback
// npm run test:e2e ile çalıştır
// ─────────────────────────────────────────────────────────────────
import http from 'k6/http';
import ws from 'k6/ws';
import { check, sleep, group } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

// ── Config ─────────────────────────────────────────────────────
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL = __ENV.WS_URL || 'ws://localhost:3000/v1/ws';
const API_KEY = __ENV.API_KEY || '';

// ── Metrics ────────────────────────────────────────────────────
const e2eSuccess = new Rate('e2e_success');
const e2eErrors = new Counter('e2e_errors');
const dashboardLatency = new Trend('dashboard_page_latency');
const wsReconnectSuccess = new Rate('ws_reconnect_success');
const fallbackPollingWorks = new Rate('fallback_polling_works');

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_KEY}`,
};

// ════════════════════════════════════════════════════════════════
// E2E 1: Dashboard loads with cached data
// ════════════════════════════════════════════════════════════════

function testDashboardLoad() {
  group('e2e_dashboard_load', () => {
    const start = Date.now();

    // Health check
    const healthRes = http.get(`${BASE_URL}/health`);
    const healthOk = check(healthRes, {
      'health check OK': (r) => r.status === 200,
    });

    // Endpoints list
    const endpointsRes = http.get(`${BASE_URL}/v1/endpoints`, { headers });
    const endpointsOk = check(endpointsRes, {
      'endpoints list OK': (r) => r.status === 200,
    });

    // Stats
    const statsRes = http.get(`${BASE_URL}/v1/stats`, { headers });
    const statsOk = check(statsRes, {
      'stats OK': (r) => r.status === 200,
    });

    const latency = Date.now() - start;
    dashboardLatency.add(latency);

    e2eSuccess.add(healthOk && endpointsOk && statsOk);
  });
}

// ════════════════════════════════════════════════════════════════
// E2E 2: Webhook → WS real-time update
// ════════════════════════════════════════════════════════════════

function testWebhookToWs() {
  group('e2e_webhook_to_ws', () => {
    const url = `${WS_URL}?token=${encodeURIComponent(API_KEY)}`;
    let eventReceived = false;

    const res = ws.connect(url, function (socket) {
      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'event' || msg.event_type) {
          eventReceived = true;
        }
      });

      socket.send(JSON.stringify({
        type: 'subscribe',
        event_types: ['delivery.created'],
      }));

      sleep(1);

      // Send webhook
      const webhookRes = http.post(
        `${BASE_URL}/v1/webhooks`,
        JSON.stringify({
          endpoint_id: 'ep_e2e_test',
          event: 'e2e.test',
          data: { ts: Date.now() },
        }),
        { headers }
      );

      check(webhookRes, {
        'webhook sent': (r) => r.status >= 200 && r.status < 300,
      });

      sleep(3);

      check(eventReceived, {
        'real-time event received': (v) => v === true,
      });

      e2eSuccess.add(eventReceived);
      socket.close();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// E2E 3: WS reconnect after disconnect
// ════════════════════════════════════════════════════════════════

function testReconnect() {
  group('e2e_reconnect', () => {
    const url = `${WS_URL}?token=${encodeURIComponent(API_KEY)}`;

    // Connect
    const res1 = ws.connect(url, function (socket) {
      sleep(2);
      socket.close();
    });

    sleep(2);

    // Reconnect
    const res2 = ws.connect(url, function (socket) {
      let reconnected = false;
      socket.on('open', () => {
        reconnected = true;
      });
      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'connected') {
          reconnected = true;
        }
      });
      sleep(2);

      wsReconnectSuccess.add(reconnected);
      check(reconnected, {
        'reconnected after disconnect': (v) => v === true,
      });

      socket.close();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// E2E 4: Fallback polling when WS unavailable
// ════════════════════════════════════════════════════════════════

function testFallbackPolling() {
  group('e2e_fallback_polling', () => {
    // Simulate WS unavailable by using invalid URL
    const invalidWsUrl = 'ws://localhost:99999/ws';

    const res = ws.connect(invalidWsUrl, function (socket) {
      // Should fail to connect
      sleep(1);
    });

    // WS should fail
    const wsFailed = !res || res.status !== 101;

    check(wsFailed, {
      'WS connection failed (expected)': (v) => v === true,
    });

    // Polling should still work
    const endpointsRes = http.get(`${BASE_URL}/v1/endpoints`, { headers });
    const pollingWorks = endpointsRes.status === 200;

    check(pollingWorks, {
      'fallback polling works': (v) => v === true,
    });

    fallbackPollingWorks.add(pollingWorks);
    e2eSuccess.add(wsFailed && pollingWorks);
  });
}

// ════════════════════════════════════════════════════════════════
// E2E 5: Admin panel real-time updates
// ════════════════════════════════════════════════════════════════

function testAdminRealtime() {
  group('e2e_admin_realtime', () => {
    // Admin stats
    const statsRes = http.get(`${BASE_URL}/v1/admin/stats`, { headers });
    const statsOk = check(statsRes, {
      'admin stats OK': (r) => r.status === 200,
    });

    // Admin users
    const usersRes = http.get(`${BASE_URL}/v1/admin/users`, { headers });
    const usersOk = check(usersRes, {
      'admin users OK': (r) => r.status === 200,
    });

    e2eSuccess.add(statsOk && usersOk);
  });
}

// ════════════════════════════════════════════════════════════════
// E2E 6: Token refresh → WS reconnect
// ════════════════════════════════════════════════════════════════

function testTokenRefresh() {
  group('e2e_token_refresh', () => {
    const url = `${WS_URL}?token=${encodeURIComponent(API_KEY)}`;

    const res = ws.connect(url, function (socket) {
      let messages = 0;
      socket.on('message', () => {
        messages++;
      });

      sleep(2);

      // Simulate token refresh by reconnecting with new token
      socket.close();
      sleep(1);
    });

    // Reconnect with "new" token
    const newUrl = `${WS_URL}?token=${encodeURIComponent(API_KEY + '_refreshed')}`;
    const res2 = ws.connect(newUrl, function (socket) {
      let connected = false;
      socket.on('open', () => {
        connected = true;
      });
      sleep(2);

      check(connected, {
        'reconnected with new token': (v) => v === true,
      });

      socket.close();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// Scenarios
// ════════════════════════════════════════════════════════════════

export const options = {
  scenarios: {
    e2e: {
      executor: 'constant-vus',
      vus: 1,
      duration: '3m',
    },
  },
  thresholds: {
    e2e_success: ['rate>0.8'],
    e2e_errors: ['count<10'],
    dashboard_page_latency: ['p(95)<5000'],
  },
};

export default function () {
  testDashboardLoad();
  sleep(2);

  testWebhookToWs();
  sleep(2);

  testReconnect();
  sleep(2);

  testFallbackPolling();
  sleep(2);

  testAdminRealtime();
  sleep(2);

  testTokenRefresh();
  sleep(3);
}
