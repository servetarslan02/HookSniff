# 🚀 WebSocket/SSE Optimizasyonu — Aşamalı Uygulama Planı

> **Başlangıç:** 2026-05-26
> **Hedef:** Real-time webhook durum güncellemelerini optimize etmek
> **Mevcut:** SSE + WebSocket var ama optimize değil → **Hedef: < 100ms gecikme, 1000+ bağlantı**
> **Ek Maliyet:** $0

---

## 📖 İçindekiler

1. [Mevcut Durum & Darboğazlar](#1-mevcut-durum--darboğazlar)
2. [Sektör Karşılaştırması & Tezler](#2-sektör-karşılaştırması--tezler)
3. [Faz 1: SSE Optimizasyonu](#3-faz-1-sse-optimizasyonu)
4. [Faz 2: WebSocket Optimizasyonu](#4-faz-2-websocket-optimizasyonu)
5. [Faz 3: Connection Management](#5-faz-3-connection-management)
6. [Faz 4: Event Filtering & Routing](#6-faz-4-event-filtering--routing)
7. [Faz 5: Reconnection & Replay](#7-faz-5-reconnection--replay)
8. [Grafana Metrikleri & Monitoring](#8-grafana-metrikleri--monitoring)
9. [Test & Doğrulama](#9-test--doğrulama)
10. [Rollback Planı](#10-rollback-planı)
11. [Zaman Çizelgesi](#11-zaman-çizelgesi)

---

## 1. Mevcut Durum & Darboğazlar

### Mevcut Implementasyon

HookSniff'te iki real-time mekanizma var:

#### SSE (Server-Sent Events)
```rust
// routes/stream/handlers.rs — Mevcut SSE
// GET /v1/stream/deliveries → SSE stream
// Her 5 saniyede bir heartbeat
// Polling tabanlı (DB'den okuyor)
```

#### WebSocket
```rust
// ws/mod.rs — Mevcut WebSocket
// GET /v1/ws → WebSocket upgrade
// JWT auth, origin validation
// Pattern-based subscription
// Heartbeat/ping-pong
// Bounded channel (256) — slow consumer protection
```

### Mevcut Akış Diyagramı

```
Dashboard (Tarayıcı)
    │
    ├─ SSE: GET /v1/stream/deliveries
    │   └─ Her 5s'de bir DB'den oku → SSE event gönder
    │       └─ DARBOĞAZ: Polling, DB yükü, gecikme
    │
    └─ WebSocket: GET /v1/ws
        └─ Bağlantı kur → event'leri dinle
            └─ DARBOĞAZ: Broadcast channel, connection limit
```

### Tespit Edilen Sorunlar

| # | Sorun | Etki | Öncelik |
|---|-------|------|---------|
| 1 | SSE polling tabanlı (5s interval) | 5s gecikme | 🔴 Kritik |
| 2 | SSE her sorguda DB okuyor | DB yükü | 🔴 Kritik |
| 3 | WebSocket broadcast channel doyabilir | Mesaj kaybı | 🟡 Yüksek |
| 4 | Connection limit belirsiz | Memory patlaması | 🟡 Yüksek |
| 5 | Reconnection replay yok | Kaçan event'ler | 🟡 Yüksek |
| 6 | Event filtering yok | Gereksiz mesaj | 🟢 Orta |

---

## 2. Sektör Karşılaştırması & Tezler

### Rakip Real-time Teknolojileri

| Platform | Teknoloji | Gecikme | Bağlantı |
|----------|-----------|---------|----------|
| **Stripe** | Webhook (polling) | ~1s | N/A |
| **Svix** | WebSocket + SSE | < 100ms | 1000+ |
| **Pusher** | WebSocket | < 50ms | 100K+ |
| **Ably** | WebSocket + SSE | < 50ms | 1M+ |
| **HookSniff (mevcut)** | SSE (polling) | ~5s | ~100 |
| **HookSniff (hedef)** | **SSE + WebSocket** | **< 100ms** | **1000+** |

### Tez 1: Neden SSE + WebSocket (İkisi de)?

| Özellik | SSE | WebSocket |
|---------|-----|-----------|
| Yön | Tek taraflı (server → client) | İki taraflı |
| Protokol | HTTP | WS (upgrade) |
| Tarayıcı desteği | Tümü | Tümü |
| Otomatik reconnect | ✅ Built-in | ❌ Manuel |
| Firewall/proxy | ✅ HTTP (kolay) | ⚠️ Sorun olabilir |
| Performans | İyi | Daha iyi |
| Kullanım | Basit bildirimler | İnteraktif uygulamalar

**Sonuç:** SSE dashboard için yeterli (tek taraflı). WebSocket SDK'lar ve interaktif uygulamalar için.

### Tez 2: Neden Polling Değil, Push?

| Durum | Polling (5s) | Push (SSE/WS) |
|-------|-------------|---------------|
| Gecikme | 5s | < 100ms |
| DB yükü | Her 5s'de sorgu | Sadece değişiklikte |
| Bandwidth | Gereksiz boş yanıtlar | Sadece veri |
| Ölçeklenebilirlik | Kötü (N client × polling) | İyi (event-driven) |

### Tez 3: Neden Event-Driven Architecture?

```
Mevcut (Polling):
  Dashboard → Her 5s → DB oku → Yanıt gönder
  DB yükü: Yüksek (sürekli sorgu)

Hedef (Event-driven):
  Webhook teslimatı → Event yayınla → SSE/WS → Dashboard
  DB yükü: Sıfır (sadece değişiklikte)
```

---

## 3. Faz 1: SSE Optimizasyonu

> **Süre:** 1-2 oturum | **Etki:** 5s → < 100ms, DB yükü sıfır | **Risk:** Düşük

### 3.1 Mevcut SSE → Event-Driven SSE

```rust
// routes/stream/handlers.rs — YENİ: Event-driven SSE

use axum::response::sse::{Event, Sse};
use futures::stream::Stream;
use tokio::sync::broadcast;

/// SSE stream — event-driven (polling yok)
pub async fn delivery_stream(
    Extension(customer): Extension<Customer>,
    Extension(event_bus): Extension<broadcast::Sender<DeliveryEvent>>,
) -> Sse<impl Stream<Item = Result<Event, Infallible>>> {
    let mut rx = event_bus.subscribe();

    let stream = async_stream::stream! {
        // Bağlantı kurulduğunda son 10 event'i gönder (catch-up)
        // (Bu kısım Redis'ten alınabilir)

        loop {
            match rx.recv().await {
                Ok(event) => {
                    // Sadece bu müşteriye ait event'leri gönder
                    if event.customer_id == customer.id {
                        let data = serde_json::to_string(&event).unwrap_or_default();
                        yield Ok(Event::default().data(data));
                    }
                }
                Err(broadcast::error::RecvError::Lagged(n)) => {
                    tracing::warn!("SSE client lagged {} messages", n);
                    yield Ok(Event::default().event("lagged")
                        .data(format!("{} messages missed", n)));
                }
                Err(broadcast::error::RecvError::Closed) => break,
            }
        }
    };

    Sse::new(stream).keep_alive(
        axum::response::sse::KeepAlive::new()
            .interval(std::time::Duration::from_secs(30))
            .text("ping"),
    )
}
```

### 3.2 Event Bus (Broadcast Channel)

```rust
// events/bus.rs — YENİ: Global event bus

use tokio::sync::broadcast;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeliveryEvent {
    pub customer_id: Uuid,
    pub delivery_id: Uuid,
    pub endpoint_id: Uuid,
    pub status: String,  // "delivered", "failed", "pending"
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

/// Global event bus — tüm SSE/WS client'larına yayın yapar
pub struct EventBus {
    tx: broadcast::Sender<DeliveryEvent>,
}

impl EventBus {
    pub fn new(capacity: usize) -> Self {
        let (tx, _) = broadcast::channel(capacity);
        Self { tx }
    }

    /// Event yayınla (webhook teslimatı sonrası çağırılır)
    pub fn publish(&self, event: DeliveryEvent) {
        let _ = self.tx.send(event);
    }

    /// Yeni subscriber (SSE veya WS bağlantısı)
    pub fn subscribe(&self) -> broadcast::Receiver<DeliveryEvent> {
        self.tx.subscribe()
    }
}
```

### 3.3 Webhook Teslimatı → Event

```rust
// worker/src/main.rs — Teslimat sonrası event yayınla

// process_queue_message fonksiyonunda, başarılı teslimat sonrası:
if let Some(ref event_bus) = event_bus {
    event_bus.publish(DeliveryEvent {
        customer_id: msg.customer_id,
        delivery_id,
        endpoint_id,
        status: "delivered".to_string(),
        timestamp: Utc::now(),
    });
}
```

### 3.4 Faz 1 Doğrulama

- [ ] SSE polling yok (event-driven)
- [ ] Gecikme < 100ms (webhook teslimat → dashboard güncelleme)
- [ ] DB sorgusu yok (sadece event bus)
- [ ] Keep-alive çalışıyor (30s ping)
- [ ] Lagged client uyarısı çalışıyor

---

## 4. Faz 2: WebSocket Optimizasyonu

> **Süre:** 1-2 oturum | **Etki:** 1000+ bağlantı, < 50ms gecikme | **Risk:** Orta

### 4.1 Mevcut WebSocket → Optimize Edilmiş

```rust
// ws/mod.rs — Optimize edilmiş WebSocket gateway

pub struct WsGateway {
    pub connections: Arc<RwLock<HashMap<String, WsConnection>>>,
    pub event_tx: broadcast::Sender<WsEvent>,
    pub jwt_secret: String,
    pub max_connections: usize,
    // YENİ: Connection pool metrics
    pub metrics: Arc<WsMetrics>,
}

// YENİ: Bağlantı limiti ve memory kontrolü
impl WsGateway {
    /// Yeni bağlantı kabul et (limit kontrolü ile)
    pub async fn accept_connection(
        &self,
        customer_id: Uuid,
        tx: mpsc::Sender<WsMessage>,
    ) -> Result<String, WsError> {
        let connections = self.connections.read().await;

        // Global limit kontrolü
        if connections.len() >= self.max_connections {
            return Err(WsError::MaxConnectionsReached);
        }

        // Per-customer limit kontrolü
        let customer_count = connections.values()
            .filter(|c| c.customer_id == customer_id)
            .count();
        if customer_count >= 10 {  // Müşteri başına max 10 bağlantı
            return Err(WsError::MaxCustomerConnectionsReached);
        }

        let connection_id = Uuid::new_v4().to_string();
        drop(connections);

        // Bağlantıyı kaydet
        let mut connections = self.connections.write().await;
        connections.insert(connection_id.clone(), WsConnection {
            connection_id: connection_id.clone(),
            customer_id,
            event_filters: vec![],
            last_heartbeat: Utc::now(),
            metadata: None,
            tx,
        });

        self.metrics.total_connections.fetch_add(1, Ordering::Relaxed);

        Ok(connection_id)
    }

    /// Heartbeat kontrolü — ölü bağlantıları temizle
    pub async fn cleanup_dead_connections(&self) {
        let mut connections = self.connections.write().await;
        let now = Utc::now();
        let timeout = chrono::Duration::seconds(60);

        connections.retain(|_, conn| {
            let alive = now - conn.last_heartbeat < timeout;
            if !alive {
                self.metrics.dead_connections.fetch_add(1, Ordering::Relaxed);
            }
            alive
        });
    }
}
```

### 4.2 Bounded Channel (Slow Consumer Protection)

```rust
// Mevcut: bounded channel (256) — zaten iyi
// YENİ: Adaptive backpressure

/// Mesaj gönder — yavaş tüketici için backpressure
pub async fn send_to_connection(
    tx: &mpsc::Sender<WsMessage>,
    msg: WsMessage,
) -> Result<(), WsError> {
    // Try send — channel doluysa hemen hata döner (blocking yok)
    match tx.try_send(msg) {
        Ok(_) => Ok(()),
        Err(mpsc::error::TrySendError::Full(_)) => {
            // Channel dolu — yavaş tüketici
            // Son mesajı zorla (eski mesajı at)
            tracing::warn!("WS channel full — dropping oldest message");
            Err(WsError::SlowConsumer)
        }
        Err(mpsc::error::TrySendError::Closed(_)) => {
            Err(WsError::ConnectionClosed)
        }
    }
}
```

### 4.3 Faz 2 Doğrulama

- [ ] Global bağlantı limiti çalışıyor (max_connections)
- [ ] Per-customer limit çalışıyor (10 bağlantı)
- [ ] Dead connection cleanup çalışıyor (60s timeout)
- [ ] Slow consumer backpressure çalışıyor
- [ ] 1000+ bağlantı destekleniyor

---

## 5. Faz 3: Connection Management

> **Süre:** 1 oturum | **Etki:** Memory kontrolü, ölçeklenebilirlik | **Risk:** Düşük

### 5.1 Connection Pool Metrics

```rust
// ws/metrics.rs — Connection metrics

pub struct WsMetrics {
    pub total_connections: AtomicU64,
    pub active_connections: AtomicU64,
    pub dead_connections: AtomicU64,
    pub messages_sent: AtomicU64,
    pub messages_dropped: AtomicU64,
    pub reconnect_count: AtomicU64,
}
```

### 5.2 Graceful Shutdown

```rust
// ws/mod.rs — Graceful shutdown

/// Tüm WebSocket bağlantılarını kapat (sunucu kapanırken)
pub async fn shutdown(&self) {
    let connections = self.connections.read().await;
    for (_, conn) in connections.iter() {
        let _ = conn.tx.send(WsMessage::Error {
            code: "server_shutdown".to_string(),
            message: "Server is shutting down. Please reconnect.".to_string(),
        }).await;
    }
    tracing::info!("WS gateway shutdown — {} connections closed", connections.len());
}
```

### 5.3 Per-Customer Rate Limiting

```rust
// ws/handler.rs — Per-customer mesaj rate limiting

/// Müşteri başına saniyede max 100 mesaj
const MAX_MESSAGES_PER_SECOND: u64 = 100;

pub async fn handle_message_rate(
    customer_id: Uuid,
    rate_limiter: &RateLimiter,
) -> Result<(), WsError> {
    let key = format!("ws:{}", customer_id);
    let allowed = rate_limiter.check(&key, MAX_MESSAGES_PER_SECOND, 1).await;
    if !allowed.allowed {
        return Err(WsError::RateLimited);
    }
    Ok(())
}
```

### 5.4 Faz 3 Doğrulama

- [ ] Connection metrics Grafana'da görünüyor
- [ ] Graceful shutdown çalışıyor
- [ ] Per-customer rate limiting çalışıyor
- [ ] Memory kullanımı kontrol altında

---

## 6. Faz 4: Event Filtering & Routing

> **Süre:** 1 oturum | **Etki:** Gereksiz mesaj yok | **Risk:** Düşük

### 6.1 Event Filtering

```rust
// ws/handler.rs — Event filtering

/// Client'tan gelen subscription filter'larını uygula
pub fn matches_filter(event: &WsEvent, filters: &[String]) -> bool {
    if filters.is_empty() {
        return true; // Filtre yoksa tüm event'leri gönder
    }

    filters.iter().any(|filter| {
        // Wildcard desteği: "delivery.*" → "delivery.completed", "delivery.failed"
        if filter.ends_with(".*") {
            let prefix = &filter[..filter.len() - 2];
            event.event_type.starts_with(prefix)
        } else {
            event.event_type == *filter
        }
    })
}
```

### 6.2 Per-Endpoint Subscription

```rust
// Belirli bir endpoint için event dinle
// WS mesajı: {"type": "subscribe", "endpoint_id": "xxx"}
// Sadece o endpoint'in event'leri gönderilir

pub struct WsConnection {
    // ...
    pub endpoint_filters: Vec<Uuid>,  // Belirli endpoint'ler
}
```

### 6.3 Faz 4 Doğrulama

- [ ] Event filtering çalışıyor (wildcard desteği)
- [ ] Per-endpoint subscription çalışıyor
- [ ] Gereksiz mesaj gönderimi azaldı
- [ ] Client bandwidth azaldı

---

## 7. Faz 5: Reconnection & Replay

> **Süre:** 1 oturum | **Etki:** Kaçan event yok | **Risk:** Düşük

### 7.1 Son N Event Replay

```rust
// ws/handler.rs — Bağlantı kurulduğunda son event'leri gönder

/// Bağlantı kurulduğunda son 100 event'i gönder (catch-up)
pub async fn send_catch_up(
    tx: &mpsc::Sender<WsMessage>,
    customer_id: Uuid,
    last_event_id: Option<String>,
) {
    // Redis'ten son event'leri al
    if let Some(ref redis) = redis {
        let events: Vec<WsEvent> = redis
            .get(&format!("ws:replay:{}", customer_id))
            .await
            .unwrap_or_default();

        for event in events {
            let _ = tx.send(WsMessage::Event(event)).await;
        }
    }
}
```

### 7.2 Last-Event-ID Header (SSE)

```rust
// SSE için Last-Event-ID desteği
// Client reconnect ettiğinde kaçan event'leri alabilir

pub async fn delivery_stream(
    headers: HeaderMap,
    // ...
) -> Sse<impl Stream> {
    let last_event_id = headers.get("Last-Event-ID")
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.parse::<i64>().ok());

    // last_event_id'den sonraki event'leri gönder
    // ...
}
```

### 7.3 Faz 5 Doğrulama

- [ ] Reconnection sonrası son event'ler geliyor
- [ ] Last-Event-ID desteği çalışıyor
- [ ] Kaçan event yok
- [ ] Client otomatik reconnect yapıyor (SSE built-in)

---

## 8. Grafana Metrikleri & Monitoring

### 8.1 Yeni Metrikler

```rust
// ws/metrics.rs

// Connection metrics
pub static WS_TOTAL_CONNECTIONS: AtomicU64 = AtomicU64::new(0);
pub static WS_ACTIVE_CONNECTIONS: AtomicU64 = AtomicU64::new(0);
pub static WS_DEAD_CONNECTIONS: AtomicU64 = AtomicU64::new(0);
pub static WS_RECONNECT_COUNT: AtomicU64 = AtomicU64::new(0);

// Message metrics
pub static WS_MESSAGES_SENT: AtomicU64 = AtomicU64::new(0);
pub static WS_MESSAGES_DROPPED: AtomicU64 = AtomicU64::new(0);

// SSE metrics
pub static SSE_ACTIVE_STREAMS: AtomicU64 = AtomicU64::new(0);
pub static SSE_EVENTS_SENT: AtomicU64 = AtomicU64::new(0);
```

### 8.2 Grafana Dashboard Panelleri

```json
{
  "panels": [
    {
      "title": "Aktif Bağlantılar",
      "targets": [
        {"expr": "hooksniff_ws_active_connections", "legendFormat": "WebSocket"},
        {"expr": "hooksniff_sse_active_streams", "legendFormat": "SSE"}
      ],
      "type": "timeseries"
    },
    {
      "title": "Mesaj Hızı (sn)",
      "targets": [
        {"expr": "rate(hooksniff_ws_messages_sent[5m])", "legendFormat": "WS sent"},
        {"expr": "rate(hooksniff_sse_events_sent[5m])", "legendFormat": "SSE sent"}
      ],
      "type": "timeseries"
    },
    {
      "title": "Dropped Messages",
      "targets": [{"expr": "rate(hooksniff_ws_messages_dropped[5m])"}],
      "type": "timeseries",
      "alert": {
        "name": "WS Message Drop",
        "condition": "rate(hooksniff_ws_messages_dropped[5m]) > 10",
        "message": "WebSocket messages being dropped (slow consumers)"
      }
    },
    {
      "title": "Reconnection Rate",
      "targets": [{"expr": "rate(hooksniff_ws_reconnect_count[5m])"}],
      "type": "timeseries"
    }
  ]
}
```

---

## 9. Test & Doğrulama

### 9.1 SSE Testi

```bash
# SSE bağlantısı kur
curl -N -H "Authorization: Bearer $JWT" \
  -H "Accept: text/event-stream" \
  $API_URL/v1/stream/deliveries

# Webhook gönder → SSE'de görünmeli (< 100ms)
curl -X POST $API_URL/v1/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"endpoint_id":"...","event":"test","data":{}}'
```

### 9.2 WebSocket Testi

```javascript
// Browser console
const ws = new WebSocket('wss://hooksniff-api.run.app/v1/ws');
ws.onmessage = (e) => console.log('Event:', JSON.parse(e.data));
ws.send(JSON.stringify({type: 'subscribe', event_types: ['delivery.*']}));
```

### 9.3 Load Test

```javascript
// k6 — 1000 paralel WebSocket bağlantısı
import ws from 'k6/ws';

export const options = {
  vus: 1000,
  duration: '1m',
};

export default function () {
  const url = 'wss://hooksniff-api.run.app/v1/ws';
  const res = ws.connect(url, function (socket) {
    socket.on('open', () => socket.send(JSON.stringify({type: 'subscribe'})));
    socket.on('message', (data) => { /* handle */ });
    socket.setTimeout(() => socket.close(), 60000);
  });
}
```

### 9.4 Before/After Karşılaştırma

| Metrik | Before | After | İyileşme |
|--------|--------|-------|----------|
| SSE gecikme | ~5s | < 100ms | **50x** |
| DB sorgusu (SSE) | Her 5s'de 1 | 0 | **∞** |
| Max bağlantı | ~100 | 1000+ | **10x** |
| Event replay | Yok | Son 100 event | ✅ |
| Slow consumer | Crash | Backpressure | ✅ |

---

## 10. Rollback Planı

```bash
# WebSocket/SSE devre dışı bırak (eski polling'e dön)
# Environment variable: ENABLE_REALTIME=false
gcloud run services update hooksniff-api \
  --set-env-vars ENABLE_REALTIME=false \
  --region europe-west1
```

---

## 11. Zaman Çizelgesi

| Faz | Süre | Etki | Oturum |
|-----|------|------|--------|
| **Faz 1:** SSE Optimizasyonu | 1-2 oturum | 5s → < 100ms | 1-2 |
| **Faz 2:** WebSocket Optimizasyonu | 1-2 oturum | 1000+ bağlantı | 3-4 |
| **Faz 3:** Connection Management | 1 oturum | Memory kontrolü | 5 |
| **Faz 4:** Event Filtering | 1 oturum | Gereksiz mesaj yok | 6 |
| **Faz 5:** Reconnection & Replay | 1 oturum | Kaçan event yok | 7 |

**Toplam:** ~7 oturum, **$0 ek maliyet**

---

## 📚 Kaynaklar

- [SSE vs WebSocket](https://ably.com/blog/websockets-vs-sse)
- [Axum SSE](https://docs.rs/axum/latest/axum/response/sse/index.html)
- [Axum WebSocket](https://docs.rs/axum/latest/axum/extract/ws/index.html)
- [tokio::sync::broadcast](https://docs.rs/tokio/sync/broadcast/index.html)
- [WebSocket Scaling](https://ably.com/topic/websocket-scaling)

---

*Bu plan HookSniff'in real-time güncellemelerini sektörün en iyisi yapmayı hedefler.*
*Son güncelleme: 2026-05-26*
