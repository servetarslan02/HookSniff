// ─────────────────────────────────────────────────────────────────
// HookSniff WebSocket Stress Test
// k6 ile 100+ eşzamanlı WS bağlantısı, memory leak, reconnect testi
// ─────────────────────────────────────────────────────────────────
import ws from 'k6/ws';
import { check, sleep } from 'k6';
import { Counter, Gauge, Trend, Rate } from 'k6/metrics';

// ── Custom Metrics ──
const wsConnections = new Gauge('ws_active_connections');
const wsMessagesReceived = new Counter('ws_messages_received');
const wsErrors = new Counter('ws_errors');
const wsConnectLatency = new Trend('ws_connect_latency');
const wsMessageLatency = new Trend('ws_message_latency');
const wsSuccessRate = new Rate('ws_success_rate');
const wsReconnectSuccess = new Rate('ws_reconnect_success');

// ── Config ──
const BASE_URL = __ENV.WS_URL || 'ws://localhost:3000/v1/ws';
const API_TOKEN = __ENV.API_TOKEN || '';
const RUN_MODE = __ENV.MODE || 'stress'; // stress | memory | reconnect

// ════════════════════════════════════════════════════════════════
// Scenario 1: STRESS — 100 eşzamanlı bağlantı
// ════════════════════════════════════════════════════════════════

export const options = {
  scenarios: RUN_MODE === 'stress' ? {
    ws_stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 10 },   // Warm up
        { duration: '20s', target: 50 },   // Ramp up
        { duration: '30s', target: 100 },  // Full load
        { duration: '30s', target: 100 },  // Hold
        { duration: '10s', target: 0 },    // Cool down
      ],
    },
  } : RUN_MODE === 'memory' ? {
    ws_memory: {
      executor: 'constant-vus',
      vus: 50,
      duration: '10m', // 10 dakika açık bağlantı — memory leak testi
    },
  } : {
    ws_reconnect: {
      executor: 'constant-vus',
      vus: 20,
      duration: '2m',
    },
  },

  thresholds: {
    ws_connect_latency: ['p(95)<2000'],
    ws_success_rate: ['rate>0.95'],
    ws_errors: ['count<50'],
  },
};

// ════════════════════════════════════════════════════════════════
// Ana Test Fonksiyonu
// ════════════════════════════════════════════════════════════════

export default function () {
  const token = API_TOKEN || `test_token_${__VU}`;
  const url = `${BASE_URL}?token=${encodeURIComponent(token)}`;

  const connectStart = Date.now();

  const res = ws.connect(url, function (socket) {
    const connectTime = Date.now() - connectStart;
    wsConnectLatency.add(connectTime);
    wsConnections.add(1);

    let messagesReceived = 0;
    let lastMessageTime = Date.now();

    socket.on('open', () => {
      console.log(`[VU ${__VU}] Connected`);

      // Subscribe to events
      socket.send(JSON.stringify({
        type: 'subscribe',
        event_types: ['delivery.created', 'delivery.status_changed', 'queue.updated'],
      }));
    });

    socket.on('message', (data) => {
      messagesReceived++;
      wsMessagesReceived.add(1);
      wsSuccessRate.add(true);

      const now = Date.now();
      wsMessageLatency.add(now - lastMessageTime);
      lastMessageTime = now;

      try {
        const msg = JSON.parse(data);

        check(msg, {
          'message has type': (m) => m.type !== undefined,
          'message is valid': (m) => m.type === 'event' || m.type === 'connected' || m.type === 'subscribed' || m.type === 'ping',
        });

        // Ping → Pong
        if (msg.type === 'ping') {
          socket.send(JSON.stringify({ type: 'ping' }));
        }
      } catch (e) {
        wsErrors.add(1);
        wsSuccessRate.add(false);
      }
    });

    socket.on('close', () => {
      wsConnections.add(-1);
      console.log(`[VU ${__VU}] Disconnected after ${messagesReceived} messages`);
    });

    socket.on('error', (e) => {
      wsErrors.add(1);
      wsSuccessRate.add(false);
      console.error(`[VU ${__VU}] Error: ${e}`);
    });

    // Bağlantıyı açık tut (test süresince)
    if (RUN_MODE === 'memory') {
      // Memory test: 10 dakika açık kal, her 30 sn'de bir mesaj gönder
      const interval = setInterval(() => {
        if (socket.readyState === 1) {
          socket.send(JSON.stringify({ type: 'ping' }));
        } else {
          clearInterval(interval);
        }
      }, 30000);

      sleep(600); // 10 dakika
      clearInterval(interval);
    } else if (RUN_MODE === 'reconnect') {
      // Reconnect test: 30 sn açık kal, sonra kapat, tekrar bağlan
      sleep(30);
      socket.close();
      sleep(2);

      // Tekrar bağlan
      const reconnectStart = Date.now();
      const res2 = ws.connect(url, function (socket2) {
        const reconnectTime = Date.now() - reconnectStart;
        wsConnectLatency.add(reconnectTime);

        socket2.on('open', () => {
          wsReconnectSuccess.add(true);
          console.log(`[VU ${__VU}] Reconnected in ${reconnectTime}ms`);
        });

        socket2.on('error', () => {
          wsReconnectSuccess.add(false);
        });

        socket2.on('message', (data) => {
          wsMessagesReceived.add(1);
        });

        sleep(10);
        socket2.close();
      });

      check(res2, { 'reconnect status is 101': (r) => r && r.status === 101 });
    } else {
      // Stress test: 60 sn açık kal
      sleep(60);
    }
  });

  check(res, {
    'connection status is 101': (r) => r && r.status === 101,
  });

  if (!res || res.status !== 101) {
    wsErrors.add(1);
    wsSuccessRate.add(false);
  }

  sleep(1);
}

// ════════════════════════════════════════════════════════════════
// Setup — Test başlamadan önce
// ════════════════════════════════════════════════════════════════

export function setup() {
  console.log(`═══ HookSniff WS Stress Test ═══`);
  console.log(`Mode: ${RUN_MODE}`);
  console.log(`Target: ${BASE_URL}`);
  console.log(`Token: ${API_TOKEN ? 'provided' : 'using test tokens'}`);
  console.log(`═══════════════════════════════`);
}

// ════════════════════════════════════════════════════════════════
// Teardown — Test bittikten sonra
// ════════════════════════════════════════════════════════════════

export function teardown() {
  console.log(`═══ Test Complete ═══`);
  console.log(`Check results above for:`);
  console.log(`  - ws_connect_latency: Connection time`);
  console.log(`  - ws_active_connections: Concurrent connections`);
  console.log(`  - ws_messages_received: Total messages`);
  console.log(`  - ws_errors: Error count`);
  console.log(`  - ws_success_rate: Success rate`);
  console.log(`═══════════════════════════`);
}
