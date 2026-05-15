// ─────────────────────────────────────────────────────────────────
// WebSocket Integration Test
// Event → Redis → WebSocket → Client zinciri testi
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
const wsConnectSuccess = new Rate('ws_connect_success');
const wsEventReceived = new Rate('ws_event_received');
const wsAuthSuccess = new Rate('ws_auth_success');
const integrationLatency = new Trend('integration_latency');
const integrationErrors = new Counter('integration_errors');

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${API_KEY}`,
};

// ════════════════════════════════════════════════════════════════
// Test 1: WS Connection + Auth
// ════════════════════════════════════════════════════════════════

export function testWsConnection() {
  group('ws_connection', () => {
    const url = `${WS_URL}?token=${encodeURIComponent(API_KEY)}`;

    const res = ws.connect(url, function (socket) {
      let connected = false;
      let authenticated = false;

      socket.on('open', () => {
        connected = true;
      });

      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'connected') {
          authenticated = true;
        }
      });

      socket.on('error', () => {
        integrationErrors.add(1);
      });

      sleep(2);

      check(connected, {
        'WS connection opened': (v) => v === true,
      });

      check(authenticated, {
        'WS authenticated (received connected msg)': (v) => v === true,
      });

      wsConnectSuccess.add(connected);
      wsAuthSuccess.add(authenticated);

      socket.close();
    });

    check(res, {
      'WS upgrade status is 101': (r) => r && r.status === 101,
    });
  });
}

// ════════════════════════════════════════════════════════════════
// Test 2: Event → WS Delivery
// ════════════════════════════════════════════════════════════════

export function testEventDelivery() {
  group('event_delivery', () => {
    const url = `${WS_URL}?token=${encodeURIComponent(API_KEY)}`;
    let eventReceived = false;
    let eventLatency = 0;

    const res = ws.connect(url, function (socket) {
      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'event' || (msg.event_type && msg.event_type.startsWith('delivery'))) {
          eventReceived = true;
          eventLatency = Date.now();
        }
      });

      // Subscribe to delivery events
      socket.send(JSON.stringify({
        type: 'subscribe',
        event_types: ['delivery.created', 'delivery.status_changed'],
      }));

      sleep(1);

      // Send a webhook to trigger an event
      const webhookStart = Date.now();
      const webhookRes = http.post(
        `${BASE_URL}/v1/webhooks`,
        JSON.stringify({
          endpoint_id: 'ep_integration_test',
          event: 'integration.test',
          data: { ts: webhookStart },
        }),
        { headers }
      );

      check(webhookRes, {
        'webhook sent successfully': (r) => r.status >= 200 && r.status < 300,
      });

      // Wait for WS event
      sleep(3);

      if (eventReceived && eventLatency > 0) {
        integrationLatency.add(eventLatency - webhookStart);
      }

      wsEventReceived.add(eventReceived);

      check(eventReceived, {
        'event received via WS': (v) => v === true,
      });

      socket.close();
    });
  });
}

// ════════════════════════════════════════════════════════════════
// Test 3: Unauthorized Connection
// ════════════════════════════════════════════════════════════════

export function testUnauthorizedConnection() {
  group('ws_unauthorized', () => {
    // No token
    const res = ws.connect(WS_URL, function (socket) {
      socket.on('open', () => {
        // Should not open
      });

      socket.on('error', () => {
        // Expected
      });

      sleep(1);
    });

    check(res, {
      'unauthorized WS rejected': (r) => !r || r.status !== 101,
    });
  });
}

// ════════════════════════════════════════════════════════════════
// Test 4: Reconnect Behavior
// ════════════════════════════════════════════════════════════════

export function testReconnect() {
  group('ws_reconnect', () => {
    const url = `${WS_URL}?token=${encodeURIComponent(API_KEY)}`;

    // First connection
    const res1 = ws.connect(url, function (socket) {
      socket.on('open', () => {});
      sleep(2);
      socket.close();
    });

    check(res1, { 'first connection OK': (r) => r && r.status === 101 });

    sleep(2);

    // Second connection (reconnect)
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

      check(reconnected, {
        'reconnected successfully': (v) => v === true,
      });

      socket.close();
    });

    check(res2, { 'reconnect OK': (r) => r && r.status === 101 });
  });
}

// ════════════════════════════════════════════════════════════════
// Test 5: Subscription Filtering
// ════════════════════════════════════════════════════════════════

export function testSubscriptionFiltering() {
  group('ws_subscription_filtering', () => {
    const url = `${WS_URL}?token=${encodeURIComponent(API_KEY)}`;

    const res = ws.connect(url, function (socket) {
      const receivedTypes = new Set();

      socket.on('message', (data) => {
        const msg = JSON.parse(data);
        if (msg.type === 'event' && msg.event_type) {
          receivedTypes.add(msg.event_type);
        }
      });

      // Subscribe only to delivery events
      socket.send(JSON.stringify({
        type: 'subscribe',
        event_types: ['delivery.created'],
      }));

      sleep(1);

      // Send events that should NOT match
      http.post(
        `${BASE_URL}/v1/webhooks`,
        JSON.stringify({
          endpoint_id: 'ep_filter_test',
          event: 'filter.test',
          data: { filter: true },
        }),
        { headers }
      );

      sleep(3);

      // Should only receive subscribed events
      const hasOnlySubscribed = [...receivedTypes].every(
        (t) => t === 'delivery.created' || t === 'connected' || t === 'subscribed'
      );

      check(hasOnlySubscribed, {
        'only subscribed events received': (v) => v === true,
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
    integration: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
    },
  },
  thresholds: {
    ws_connect_success: ['rate>0.9'],
    ws_auth_success: ['rate>0.9'],
    integration_errors: ['count<5'],
  },
};

export default function () {
  testWsConnection();
  sleep(1);

  testEventDelivery();
  sleep(1);

  testUnauthorizedConnection();
  sleep(1);

  testReconnect();
  sleep(1);

  testSubscriptionFiltering();
  sleep(2);
}
