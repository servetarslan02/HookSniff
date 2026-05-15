# 🚀 HookSniff Real-Time Architecture Upgrade Plan

> **Hedef:** Polling tabanlı sistemi event-driven real-time sisteme çevir.
> **Tahmini süre:** 13-19 saat (4-5 oturum)
> **Başlangıç tarihi:** 2026-05-16
> **Maliyet:** $0 (mevcut free tier yeterli)

---

## 📋 İçindekiler

1. [Genel Bakış](#genel-bakış)
2. [Mevcut Durum](#mevcut-durum)
3. [Hedef Durum](#hedef-durum)
4. [Faz 1: React Query](#faz-1-react-query---frontend-cache)
5. [Faz 2: Event System](#faz-2-event-system---rust-backend)
6. [Faz 3: WebSocket](#faz-3-websocket---real-time-bağlantı)
7. [Faz 4: Entegrasyon](#faz-4-entegrasyon---her-şeyi-bağla)
8. [Faz 5: Optimizasyon](#faz-5-optimizasyon---son-dokunuşlar)
9. [Test Planı](#test-planı)
10. [Rollback Planı](#rollback-planı)

---

## Genel Bakış

```
FAZ 1: React Query          [⬜] → Cache + refetch + optimistic (2-3 saat)
FAZ 2: Event System         [⬜] → Rust'ta event üretimi + Redis Pub/Sub (3-4 saat)
FAZ 3: WebSocket            [⬜] → WS endpoint + connection manager (2-3 saat)
FAZ 4: Entegrasyon          [⬜] → Frontend WS hook + React Query invalidate (2-3 saat)
FAZ 5: Optimizasyon         [⬜] → Virtual lists, Sentry, route cache (2-3 saat)
```

---

## Mevcut Durum

```
Dashboard (Next.js) → useEffect → API çağrısı → State → Render
                       ↑
                   Sayfa her açıldığında
                   Cache yok
                   Polling: 60 sn (admin), 30 sn (health)
```

**Sorunlar:**
- Sayfa geçişlerinde loading spinner (1-3 sn)
- Aynı veri tekrar tekrar çekiliyor
- Real-time güncelleme yok (60 sn gecikme)
- Büyük listeler yavaş render oluyor

---

## Hedef Durum

```
Dashboard (Next.js) → React Query (cache) ← WebSocket (anlık veri)
                       ↑                        ↑
                   0ms cache hit           Sunucu推送 (<100ms)
                   Background refetch      Delta sync
                   Offline desteği         Otomatik reconnect
```

**Kazanımlar:**
- Sayfa geçiş hızı: 1-3 sn → <100ms
- API çağrısı/gün: ~5000 → ~500
- Real-time güncelleme: 60 sn → <1 sn
- Büyük liste render: 3-5 sn → <200ms

---

## Faz 1: React Query - Frontend Cache

> **Süre:** 2-3 saat
> **Amaç:** Tüm API çağrılarını React Query ile sar, cache mekanizması kur

### 1.1 Kurulum

```bash
cd dashboard
npm install @tanstack/react-query @tanstack/react-query-devtools
```

**Dosya:** `dashboard/package.json`
- [ ] `@tanstack/react-query` eklendi
- [ ] `@tanstack/react-query-devtools` eklendi (development)

### 1.2 QueryClient Provider

**Dosya:** `dashboard/src/app/[locale]/layout.tsx` (veya providers.tsx)

```tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 dk cache
      gcTime: 10 * 60 * 1000,         // 10 dk garbage collection
      refetchOnWindowFocus: true,      // Pencere odaklanınca tazele
      retry: 2,                        // Hata olursa 2 kez dene
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

- [ ] `QueryClient` oluşturuldu
- [ ] `QueryClientProvider` layout'a eklendi
- [ ] `ReactQueryDevtools` eklendi (dev only)
- [ ] Default stale time: 5 dakika
- [ ] Default gc time: 10 dakika
- [ ] `refetchOnWindowFocus: true`

### 1.3 API Hook'ları Oluştur

**Dosya:** `dashboard/src/hooks/useAdminData.ts` (YENİ)

```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/lib/store';

// ── Admin Stats ──
export function useAdminStats() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminApi.getStats(token!),
    enabled: !!token,
    staleTime: 30_000, // 30 sn (admin verisi daha sık güncellenir)
  });
}

// ── Admin Revenue ──
export function useAdminRevenue() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'revenue'],
    queryFn: () => adminApi.getRevenue(token!),
    enabled: !!token,
  });
}

// ── Admin Audit Logs ──
export function useAdminAuditLogs(limit = 5) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'audit-logs', limit],
    queryFn: () => adminApi.getAuditLogs(token!, { limit }),
    enabled: !!token,
  });
}

// ── Admin Feature Flags ──
export function useAdminFeatureFlags() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'feature-flags'],
    queryFn: () => adminApi.listFeatureFlags(token!),
    enabled: !!token,
  });
}

// ── Admin Deploy Info ──
export function useAdminDeployInfo() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'deploy-info'],
    queryFn: () => adminApi.getDeployInfo(token!),
    enabled: !!token,
  });
}

// ── Users List ──
export function useAdminUsers(params?: { page?: number; search?: string; plan?: string }) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'users', params],
    queryFn: () => adminApi.listUsers(token!, params),
    enabled: !!token,
  });
}

// ── User Detail ──
export function useAdminUserDetail(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['admin', 'user', id],
    queryFn: () => adminApi.getUserDetail(token!, id),
    enabled: !!token && !!id,
  });
}
```

**Dosya:** `dashboard/src/hooks/useDashboardData.ts` (YENİ)

```tsx
import { useQuery } from '@tanstack/react-query';
import { endpointsApi, webhooksApi, analyticsApi } from '@/lib/api';
import { useAuth } from '@/lib/store';

export function useEndpoints() {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['endpoints'],
    queryFn: () => endpointsApi.list(token!),
    enabled: !!token,
  });
}

export function useEndpointDetail(id: string) {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['endpoint', id],
    queryFn: () => endpointsApi.get(token!, id),
    enabled: !!token && !!id,
  });
}

export function useDeliveryTrend(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'delivery-trend', range],
    queryFn: () => analyticsApi.deliveryTrend(token!, range),
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useSuccessRate(range = '24h') {
  const { token } = useAuth();
  return useQuery({
    queryKey: ['analytics', 'success-rate', range],
    queryFn: () => analyticsApi.successRate(token!, range),
    enabled: !!token,
    staleTime: 30_000,
  });
}
```

- [ ] `useAdminStats()` hook'u oluşturuldu
- [ ] `useAdminRevenue()` hook'u oluşturuldu
- [ ] `useAdminAuditLogs()` hook'u oluşturuldu
- [ ] `useAdminFeatureFlags()` hook'u oluşturuldu
- [ ] `useAdminDeployInfo()` hook'u oluşturuldu
- [ ] `useAdminUsers()` hook'u oluşturuldu
- [ ] `useAdminUserDetail()` hook'u oluşturuldu
- [ ] `useEndpoints()` hook'u oluşturuldu
- [ ] `useEndpointDetail()` hook'u oluşturuldu
- [ ] `useDeliveryTrend()` hook'u oluşturuldu
- [ ] `useSuccessRate()` hook'u oluşturuldu

### 1.4 Admin Overview Sayfasını Güncelle

**Dosya:** `dashboard/src/app/[locale]/admin/page.tsx`

```tsx
// ESKİ:
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => { fetchStats(); }, [fetchStats]);

// YENİ:
const { data: stats, isLoading } = useAdminStats();
const { data: revenue } = useAdminRevenue();
const { data: auditLogs } = useAdminAuditLogs(5);
const { data: featureFlags } = useAdminFeatureFlags();
const { data: deployInfo } = useAdminDeployInfo();
```

- [ ] `useState` + `useEffect` → `useQuery` dönüşümü (stats)
- [ ] `useState` + `useEffect` → `useQuery` dönüşümü (revenue)
- [ ] `useState` + `useEffect` → `useQuery` dönüşümü (audit logs)
- [ ] `useState` + `useEffect` → `useQuery` dönüşümü (feature flags)
- [ ] `useState` + `useEffect` → `useQuery` dönüşümü (deploy info)
- [ ] Loading state: `isLoading` kullan
- [ ] Error state: `error` kullan
- [ ] Manual refetch: `refetch()` kullan
- [ ] Auto-refresh polling kaldırıldı (React Query otomatik yapıyor)

### 1.5 Diğer Admin Sayfalarını Güncelle

- [ ] `admin/users/page.tsx` → `useAdminUsers()`
- [ ] `admin/users/[id]/page.tsx` → `useAdminUserDetail()`
- [ ] `admin/revenue/page.tsx` → `useAdminRevenue()`
- [ ] `admin/system/page.tsx` → monitoring hook'ları
- [ ] `admin/alerts/page.tsx` → alerts hook'u
- [ ] `admin/settings/page.tsx` → settings hook'u
- [ ] `admin/activity/page.tsx` → audit logs hook'u

### 1.6 Dashboard Sayfalarını Güncelle

- [ ] `(dashboard)/core/page.tsx` → `useEndpoints()`
- [ ] `(dashboard)/endpoints/[id]/page.tsx` → `useEndpointDetail()`
- [ ] `(dashboard)/deliveries/page.tsx` → deliveries hook'u
- [ ] `(dashboard)/notifications/page.tsx` → notifications hook'u

### 1.7 Optimistic Updates

**Dosya:** Hook'lara optimistic update ekle

```tsx
// Endpoint güncelleme — anlık UI tepkisi
export function useUpdateEndpoint() {
  const queryClient = useQueryClient();
  const { token } = useAuth();

  return useMutation({
    mutationFn: (data: { id: string; url: string }) =>
      endpointsApi.update(token!, data.id, { url: data.url }),
    onMutate: async (data) => {
      // İptal et — eski veri üzerine yazmasın
      await queryClient.cancelQueries({ queryKey: ['endpoint', data.id] });
      // Snapshot — rollback için
      const previous = queryClient.getQueryData(['endpoint', data.id]);
      // Optimistic — hemen UI'ı güncelle
      queryClient.setQueryData(['endpoint', data.id], (old: unknown) => ({
        ...(old as Record<string, unknown>),
        url: data.url,
      }));
      return { previous };
    },
    onError: (_err, data, context) => {
      // Hata → rollback
      queryClient.setQueryData(['endpoint', data.id], context?.previous);
    },
    onSettled: (_data, _error, data) => {
      // Her durumda → cache'i tazele
      queryClient.invalidateQueries({ queryKey: ['endpoint', data.id] });
      queryClient.invalidateQueries({ queryKey: ['endpoints'] });
    },
  });
}
```

- [ ] `useUpdateEndpoint()` — optimistic update
- [ ] `useUpdatePlan()` — optimistic update
- [ ] `useToggleStatus()` — optimistic update
- [ ] `useReplayDelivery()` — optimistic update

### 1.8 Faz 1 Doğrulama

- [ ] Dashboard açıldığında loading spinner görünmüyor (cache hit)
- [ ] Sayfalar arası geçiş <100ms
- [ ] React Query Devtools çalışıyor (development)
- [ ] Stale veri arka planda güncelleniyor
- [ ] Pencere odaklanınca veri tazeleniyor
- [ ] Hata durumunda retry çalışıyor
- [ ] Build başarılı (`npm run build`)
- [ ] TypeScript hatası yok

---

## Faz 2: Event System - Rust Backend

> **Süre:** 3-4 saat
> **Amaç:** Backend'de event üretimi ve Redis Pub/Sub'a yayınlama

### 2.1 Event Tanımları

**Dosya:** `api/src/events.rs` (YENİ)

```rust
use serde::{Deserialize, Serialize};
use uuid::Uuid;

/// Tüm sistem event'leri
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", content = "data")]
pub enum AppEvent {
    /// Yeni teslimat oluşturuldu
    DeliveryCreated {
        delivery_id: Uuid,
        endpoint_id: Uuid,
        customer_id: Uuid,
        event_type: Option<String>,
        status: String,
    },
    /// Teslimat durumu değişti
    DeliveryStatusChanged {
        delivery_id: Uuid,
        customer_id: Uuid,
        old_status: String,
        new_status: String,
    },
    /// Kuyruk durumu değişti
    QueueUpdated {
        pending: i64,
        processing: i64,
        failed: i64,
    },
    /// Yeni kullanıcı kaydoldu
    UserCreated {
        user_id: Uuid,
        email: String,
        plan: String,
    },
    /// Alert tetiklendi
    AlertTriggered {
        alert_id: Uuid,
        customer_id: Uuid,
        name: String,
        condition: String,
    },
    /// Endpoint durumu değişti
    EndpointStatusChanged {
        endpoint_id: Uuid,
        customer_id: Uuid,
        is_active: bool,
    },
}

impl AppEvent {
    /// Redis kanal adı
    pub fn channel(&self) -> &'static str {
        match self {
            Self::DeliveryCreated { .. } | Self::DeliveryStatusChanged { .. } => "deliveries",
            Self::QueueUpdated { .. } => "queue",
            Self::UserCreated { .. } => "users",
            Self::AlertTriggered { .. } => "alerts",
            Self::EndpointStatusChanged { .. } => "endpoints",
        }
    }
}
```

- [ ] `AppEvent` enum'u tanımlandı
- [ ] `DeliveryCreated` variant'ı
- [ ] `DeliveryStatusChanged` variant'ı
- [ ] `QueueUpdated` variant'ı
- [ ] `UserCreated` variant'ı
- [ ] `AlertTriggered` variant'ı
- [ ] `EndpointStatusChanged` variant'ı
- [ ] `channel()` methodu

### 2.2 Event Publisher (Redis Pub/Sub)

**Dosya:** `api/src/events.rs` (devam)

```rust
use redis::aio::Connection;
use tokio::sync::broadcast;

/// Event publisher — Redis Pub/Sub + broadcast
pub struct EventPublisher {
    redis: redis::Client,
    local_tx: broadcast::Sender<AppEvent>,
}

impl EventPublisher {
    pub fn new(redis_url: &str) -> Self {
        let client = redis::Client::open(redis_url).expect("Failed to create Redis client");
        let (local_tx, _) = broadcast::channel(1000);
        Self {
            redis: client,
            local_tx,
        }
    }

    /// Event'i Redis'e yayınla
    pub async fn publish(&self, event: &AppEvent) -> Result<(), Box<dyn std::error::Error>> {
        let mut conn = self.redis.get_async_connection().await?;
        let payload = serde_json::to_string(event)?;
        redis::cmd("PUBLISH")
            .arg(event.channel())
            .arg(&payload)
            .execute_async(&mut conn)
            .await?;
        // Local broadcast (aynı instance'daki WS client'ları için)
        let _ = self.local_tx.send(event.clone());
        Ok(())
    }

    /// Local broadcast receiver
    pub fn subscribe(&self) -> broadcast::Receiver<AppEvent> {
        self.local_tx.subscribe()
    }
}
```

- [ ] `EventPublisher` struct'ı
- [ ] `publish()` methodu — Redis PUBLISH
- [ ] `subscribe()` methodu — local broadcast
- [ ] `main.rs`'de EventPublisher init
- [ ] Redis connection pool

### 2.3 Event'leri Tetikle

**Dosya:** `api/src/routes/webhooks.rs`

```rust
// Mevcut teslimat oluşturma koduna ekle:
// Teslimat oluşturulduktan sonra:
publisher.publish(&AppEvent::DeliveryCreated {
    delivery_id: new_delivery.id,
    endpoint_id,
    customer_id,
    event_type: event_type.clone(),
    status: "pending".to_string(),
}).await.ok(); // Hata olsa bile devam et
```

- [ ] `webhooks.rs` — `DeliveryCreated` event'i tetikleniyor
- [ ] `deliveries.rs` — `DeliveryStatusChanged` event'i tetikleniyor
- [ ] `auth.rs` — `UserCreated` event'i tetikleniyor
- [ ] `endpoints.rs` — `EndpointStatusChanged` event'i tetikleniyor
- [ ] `alerts.rs` — `AlertTriggered` event'i tetikleniyor
- [ ] `worker.rs` — `QueueUpdated` event'i tetikleniyor (periyodik)

### 2.4 Config

**Dosya:** `api/src/config.rs`

```rust
// Mevcut Redis config'e ekle:
pub event_publisher_enabled: bool,
pub ws_enabled: bool,
pub ws_max_connections: usize,
```

- [ ] `EVENT_PUBLISHER_ENABLED` env var
- [ ] `WS_ENABLED` env var
- [ ] `WS_MAX_CONNECTIONS` env var (default: 100)

### 2.5 Faz 2 Doğrulama

- [ ] `cargo check` — derleme hatası yok
- [ ] `cargo test --lib` — testler geçiyor
- [ ] Redis'e event yayınlanıyor (log'dan doğrula)
- [ ] Event payload'ları doğru JSON formatında
- [ ] Hata durumunda mevcut işlev bozulmuyor (publish best-effort)

---

## Faz 3: WebSocket - Real-Time Bağlantı

> **Süre:** 2-3 saat
> **Amaç:** WebSocket endpoint'i oluştur, istemci bağlantılarını yönet

### 3.1 WebSocket Handler

**Dosya:** `api/src/ws.rs` (YENİ)

```rust
use axum::{
    extract::ws::{Message, WebSocket, WebSocketUpgrade},
    extract::Extension,
    response::IntoResponse,
};
use futures::{SinkExt, StreamExt};
use tokio::sync::broadcast;
use uuid::Uuid;

use crate::events::{AppEvent, EventPublisher};
use crate::models::customer::Customer;

/// WebSocket upgrade handler
pub async fn ws_handler(
    ws: WebSocketUpgrade,
    Extension(customer): Extension<Customer>,
    Extension(publisher): Extension<EventPublisher>,
) -> impl IntoResponse {
    ws.on_upgrade(move |socket| handle_socket(socket, customer, publisher))
}

/// WebSocket bağlantısını yönet
async fn handle_socket(
    socket: WebSocket,
    customer: Customer,
    publisher: EventPublisher,
) {
    let (mut sender, mut receiver) = socket.split();
    let mut rx = publisher.subscribe();

    // Keepalive task
    let mut keepalive = tokio::time::interval(std::time::Duration::from_secs(30));

    loop {
        tokio::select! {
            // Event geldi → client'a gönder
            Ok(event) = rx.recv() => {
                // Sadece bu kullanıcıya ait event'leri gönder
                if should_send_to_user(&event, &customer) {
                    let msg = serde_json::to_string(&event).unwrap_or_default();
                    if sender.send(Message::Text(msg)).await.is_err() {
                        break; // Bağlantı koptu
                    }
                }
            }
            // Client'dan mesaj geldi (şimdilik ignore)
            msg = receiver.next() => {
                match msg {
                    Some(Ok(Message::Close(_))) | None => break,
                    Some(Ok(Message::Ping(data))) => {
                        let _ = sender.send(Message::Pong(data)).await;
                    }
                    _ => {} // Diğer mesajları ignore et
                }
            }
            // Keepalive ping
            _ = keepalive.tick() => {
                if sender.send(Message::Ping(vec![].into())).await.is_err() {
                    break;
                }
            }
        }
    }
}

/// Bu event'i bu kullanıcıya göndermeli miyiz?
fn should_send_to_user(event: &AppEvent, customer: &Customer) -> bool {
    match event {
        AppEvent::DeliveryCreated { customer_id, .. } |
        AppEvent::DeliveryStatusChanged { customer_id, .. } |
        AppEvent::AlertTriggered { customer_id, .. } |
        AppEvent::EndpointStatusChanged { customer_id, .. } => {
            customer.is_admin || *customer_id == customer.id
        }
        AppEvent::QueueUpdated { .. } |
        AppEvent::UserCreated { .. } => customer.is_admin,
    }
}
```

- [ ] `ws_handler()` — WebSocket upgrade
- [ ] `handle_socket()` — mesaj döngüsü
- [ ] Keepalive ping (30 sn)
- [ ] `should_send_to_user()` — event filtreleme
- [ ] Admin: tüm event'leri görür
- [ ] Normal kullanıcı: sadece kendi event'lerini görür

### 3.2 Router'a Ekle

**Dosya:** `api/src/routes/mod.rs`

```rust
pub mod ws;

// Router'a ekle:
.route("/ws", get(ws::ws_handler))
```

- [ ] `ws.rs` modülü routes'a eklendi
- [ ] `/v1/ws` endpoint'i tanımlandı
- [ ] JWT auth middleware uygulanıyor

### 3.3 Cloud Run Config

**Dosya:** `cloudbuild.yaml` veya Cloud Run env var

```yaml
# WebSocket için timeout artır
--timeout=3600
--max-instances=10
```

**Env var'lar:**
```
WS_ENABLED=true
WS_MAX_CONNECTIONS=100
EVENT_PUBLISHER_ENABLED=true
```

- [ ] Cloud Run timeout: 3600 sn
- [ ] `WS_ENABLED` env var eklendi
- [ ] `WS_MAX_CONNECTIONS` env var eklendi
- [ ] `EVENT_PUBLISHER_ENABLED` env var eklendi

### 3.4 Faz 3 Doğrulama

- [ ] `cargo check` — derleme hatası yok
- [ ] WebSocket endpoint'i yanıt veriyor (`wscat -c ws://api/v1/ws`)
- [ ] JWT auth çalışıyor (token'suz bağlantı reddediliyor)
- [ ] Keepalive ping çalışıyor (30 sn'de bir)
- [ ] Bağlantı koptuğunda temiz kapanıyor
- [ ] Admin tüm event'leri alıyor
- [ ] Normal kullanıcı sadece kendi event'lerini alıyor

---

## Faz 4: Entegrasyon - Her Şeyi Bağla

> **Süre:** 2-3 saat
> **Amaç:** Frontend'de WebSocket hook'u oluştur, React Query ile entegre et

### 4.1 WebSocket Hook

**Dosya:** `dashboard/src/hooks/useWebSocket.ts` (YENİ)

```tsx
'use client';
import { useEffect, useRef, useCallback, useState } from 'react';
import { useAuth } from '@/lib/store';

interface WsEvent {
  type: string;
  data: Record<string, unknown>;
}

interface UseWebSocketOptions {
  enabled?: boolean;
  onEvent?: (event: WsEvent) => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const { token } = useAuth();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const [isConnected, setIsConnected] = useState(false);

  const { enabled = true, onEvent } = options;

  const connect = useCallback(() => {
    if (!token || !enabled) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const wsUrl = apiUrl.replace(/^http/, 'ws') + '/v1/ws';

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('[WS] Connected');
      setIsConnected(true);
      reconnectAttempts.current = 0;

      // Auth mesajı gönder
      ws.send(JSON.stringify({ type: 'auth', token }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WsEvent;
        onEvent?.(data);
      } catch {
        // Parse hatası — ignore
      }
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected');
      setIsConnected(false);
      wsRef.current = null;

      // Exponential backoff reconnect
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
      reconnectAttempts.current++;
      reconnectTimeoutRef.current = setTimeout(connect, delay);
    };

    ws.onerror = (err) => {
      console.error('[WS] Error:', err);
    };

    wsRef.current = ws;
  }, [token, enabled, onEvent]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    wsRef.current?.close();
    wsRef.current = null;
  }, []);

  return { isConnected, disconnect };
}
```

- [ ] `useWebSocket()` hook'u
- [ ] Bağlantı kurma (JWT auth)
- [ ] Exponential backoff reconnect (1s → 2s → 4s → ... → 30s max)
- [ ] Keepalive (tarayıcı built-in ping/pong)
- [ ] `isConnected` state
- [ ] `disconnect()` methodu

### 4.2 React Query + WebSocket Entegrasyonu

**Dosya:** `dashboard/src/hooks/useRealtime.ts` (YENİ)

```tsx
'use client';
import { useQueryClient } from '@tanstack/react-query';
import { useWebSocket } from './useWebSocket';
import { useToast } from '@/components/Toast';

export function useRealtime() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { isConnected } = useWebSocket({
    onEvent: (event) => {
      switch (event.type) {
        case 'DeliveryCreated':
        case 'DeliveryStatusChanged':
          // Teslimat cache'ini tazele
          queryClient.invalidateQueries({ queryKey: ['deliveries'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          break;

        case 'QueueUpdated':
          // Kuyruk cache'ini tazele
          queryClient.invalidateQueries({ queryKey: ['admin', 'queue'] });
          break;

        case 'UserCreated':
          // Kullanıcı cache'ini tazele
          queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
          toast('🆕 Yeni kullanıcı kaydoldu', 'info');
          break;

        case 'AlertTriggered':
          queryClient.invalidateQueries({ queryKey: ['admin', 'alerts'] });
          toast(`🔔 Alert: ${event.data.name}`, 'warning');
          break;

        case 'EndpointStatusChanged':
          queryClient.invalidateQueries({ queryKey: ['endpoints'] });
          queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
          break;
      }
    },
  });

  return { isConnected };
}
```

- [ ] `useRealtime()` hook'u
- [ ] `DeliveryCreated` → cache invalidate
- [ ] `DeliveryStatusChanged` → cache invalidate
- [ ] `QueueUpdated` → cache invalidate
- [ ] `UserCreated` → cache invalidate + toast
- [ ] `AlertTriggered` → cache invalidate + toast
- [ ] `EndpointStatusChanged` → cache invalidate

### 4.3 Admin Layout'a Ekle

**Dosya:** `dashboard/src/app/[locale]/admin/layout.tsx`

```tsx
import { useRealtime } from '@/hooks/useRealtime';

function AdminShell({ children }: { children: React.ReactNode }) {
  const { isConnected } = useRealtime();

  // Bağlantı durumu göstergesi (isteğe bağlı)
  // Header'da küçük bir indicator
}
```

- [ ] `useRealtime()` admin layout'a eklendi
- [ ] Bağlantı durumu indicator'ı (yeşil/kırmızı dot)

### 4.4 Dashboard Layout'a Ekle

**Dosya:** `dashboard/src/app/[locale]/(dashboard)/layout.tsx`

```tsx
import { useRealtime } from '@/hooks/useRealtime';

function DashboardShell({ children }: { children: React.ReactNode }) {
  const { isConnected } = useRealtime();
  // ...
}
```

- [ ] `useRealtime()` dashboard layout'a eklendi

### 4.5 Polling Kaldır

- [ ] `admin/page.tsx` — `setInterval` polling kaldırıldı
- [ ] `admin/system/page.tsx` — polling kaldırıldı (varsa)
- [ ] `(dashboard)/health/page.tsx` — polling kaldırıldı (React Query refetch yeterli)
- [ ] `sandbox/content.tsx` — polling kalabilir (gerçek zamanlı gerekli)

### 4.6 Faz 4 Doğrulama

- [ ] Dashboard açıldığında WebSocket bağlantısı kuruluyor (console log)
- [ ] Yeni teslimat olduğunda UI anlık güncelleniyor (<1 sn)
- [ ] Yeni kullanıcı kaydolduğunda admin paneli güncelleniyor
- [ ] Alert tetiklendiğinde toast mesajı gösteriliyor
- [ ] Bağlantı koptuğunda otomatik reconnect oluyor
- [ ] Sayfalar arası geçiş <100ms (React Query cache)
- [ ] Polling kaldırıldı, API çağrısı sayısı azaldı

---

## Faz 5: Optimizasyon - Son Dokunuşlar

> **Süre:** 2-3 saat
> **Amaç:** Büyük listeler, hata takibi, route cache

### 5.1 TanStack Virtual — Büyük Listeler

```bash
cd dashboard
npm install @tanstack/react-virtual
```

**Dosya:** `dashboard/src/components/VirtualTable.tsx` (YENİ)

- [ ] `@tanstack/react-virtual` kuruldu
- [ ] `VirtualTable` bileşeni oluşturuldu
- [ ] Admin users listesine uygulandı
- [ ] Deliveries listesine uygulandı
- [ ] Audit logs listesine uygulandı

### 5.2 Sentry — Hata Takibi

```bash
cd dashboard
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

- [ ] `@sentry/nextjs` kuruldu
- [ ] `sentry.client.config.ts` oluşturuldu
- [ ] `sentry.server.config.ts` oluşturuldu
- [ ] `next.config.js` — Sentry plugin eklendi
- [ ] DSN env var eklendi (`SENTRY_DSN`)
- [ ] Test hatası gönderildi ve Sentry'de göründü

### 5.3 Route Segment Cache

**Dosya:** `dashboard/src/app/[locale]/admin/page.tsx`

```tsx
// Statik sayfalar için ISR
export const revalidate = 30; // 30 saniye cache
```

- [ ] Docs sayfaları → `revalidate = 3600` (1 saat)
- [ ] Landing page → `revalidate = 3600`
- [ ] Pricing → `revalidate = 3600`
- [ ] Admin → React Query (zaten cache'li)

### 5.4 Image Optimization

- [ ] `<Image />` bileşenine geçiş (logo, avatar)
- [ ] WebP formatı otomatik
- [ ] Lazy loading

### 5.5 Faz 5 Doğrulama

- [ ] 1000+ satırlık liste <200ms render
- [ ] Sentry'de hata görünüyor
- [ ] Statik sayfalar ISR ile servis ediliyor
- [ ] Görseller optimize (WebP, lazy)

---

## Test Planı

### Unit Test

- [ ] `EventPublisher::publish()` — Redis'e doğru kanalda publish
- [ ] `should_send_to_user()` — filtreleme doğru çalışıyor
- [ ] React Query hook'ları — cache, stale, refetch

### Integration Test

- [ ] WebSocket bağlantısı kuruluyor
- [ ] Event → Redis → WebSocket → Client zinciri çalışıyor
- [ ] Kopan bağlantı → otomatik reconnect
- [ ] JWT auth → yetkisiz bağlantı reddediliyor

### E2E Test

- [ ] Dashboard aç → veri yükle → 60 sn bekle → polling yok
- [ ] Webhook gönder → dashboard anlık güncelleniyor
- [ ] Admin paneli → yeni kullanıcı → anlık güncelleme
- [ ] Network kes → offline → tekrar bağlan → veri güncelleniyor

### Performance Test

- [ ] Sayfa geçiş hızı <100ms (cache hit)
- [ ] 100 eşzamanlı WebSocket bağlantısı
- [ ] API çağrısı/gün: ~500 (hedef)
- [ ] Memory leak yok (WebSocket bağlantıları temizleniyor)

---

## Rollback Planı

### Hızlı Rollback

```
1. git revert <commit-hash>
2. Cloud Run'a push (otomatik deploy)
3. Dashboard Vercel'e push (otomatik deploy)
```

### Kademeli Rollback

```
1. WS_ENABLED=false → WebSocket devre dışı, polling'e dön
2. React Query → useState'e geri dön (sayfa bazında)
3. Event system → publish() çağrılarını yorum satırı yap
```

### Monitoring

```
- Sentry: hata oranı artarsa alarm
- Grafana: API latency artarsa alarm
- Upstash: Redis komut sayısını izle
- Cloud Run: instance sayısını izle
```

---

## Dosya Değişiklik Listesi

### Yeni Dosyalar

| Dosya | Amaç |
|-------|------|
| `api/src/events.rs` | Event tanımları + publisher |
| `api/src/ws.rs` | WebSocket handler |
| `dashboard/src/hooks/useAdminData.ts` | Admin React Query hook'ları |
| `dashboard/src/hooks/useDashboardData.ts` | Dashboard React Query hook'ları |
| `dashboard/src/hooks/useWebSocket.ts` | WebSocket hook |
| `dashboard/src/hooks/useRealtime.ts` | React Query + WS entegrasyonu |
| `dashboard/src/components/VirtualTable.tsx` | Virtual list bileşeni |

### Değişecek Dosyalar

| Dosya | Değişiklik |
|-------|-----------|
| `api/src/main.rs` | EventPublisher + WS route init |
| `api/src/routes/mod.rs` | WS route ekleme |
| `api/src/routes/webhooks.rs` | Event publish |
| `api/src/routes/deliveries.rs` | Event publish |
| `api/src/routes/auth.rs` | Event publish |
| `api/src/routes/endpoints.rs` | Event publish |
| `api/src/routes/alerts.rs` | Event publish |
| `api/src/config.rs` | WS config |
| `dashboard/src/app/[locale]/layout.tsx` | QueryClientProvider |
| `dashboard/src/app/[locale]/admin/layout.tsx` | useRealtime |
| `dashboard/src/app/[locale]/admin/page.tsx` | React Query |
| `dashboard/src/app/[locale]/admin/users/page.tsx` | React Query |
| `dashboard/src/app/[locale]/admin/users/[id]/page.tsx` | React Query |
| `dashboard/src/app/[locale]/admin/revenue/page.tsx` | React Query |
| `dashboard/src/app/[locale]/admin/system/page.tsx` | React Query |
| `dashboard/src/app/[locale]/(dashboard)/layout.tsx` | useRealtime |
| `dashboard/package.json` | Yeni bağımlılıklar |
| `cloudbuild.yaml` | WS config |

---

## Ortam Değişkenleri (Yeni)

```bash
# Cloud Run
WS_ENABLED=true
WS_MAX_CONNECTIONS=100
EVENT_PUBLISHER_ENABLED=true

# Dashboard (Vercel)
NEXT_PUBLIC_WS_URL=wss://hooksniff-api-1046140057667.europe-west1.run.app/v1/ws
SENTRY_DSN=https://xxx@sentry.io/xxx
```

---

## İlerleme Takibi

| Faz | Durum | Başlangıç | Bitiş |
|-----|-------|-----------|-------|
| Faz 1: React Query | ⬜ Bekliyor | — | — |
| Faz 2: Event System | ⬜ Bekliyor | — | — |
| Faz 3: WebSocket | ⬜ Bekliyor | — | — |
| Faz 4: Entegrasyon | ⬜ Bekliyor | — | — |
| Faz 5: Optimizasyon | ⬜ Bekliyor | — | — |
| Test | ⬜ Bekliyor | — | — |
| Deploy | ⬜ Bekliyor | — | — |
