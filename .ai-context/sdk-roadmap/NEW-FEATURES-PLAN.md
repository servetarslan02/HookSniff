# Yeni Özellikler Planı — Post-SDK

> Oluşturma: 2026-05-18 01:32 GMT+8
> Durum: Beklemede — SDK Faz 1-7 tamamlandıktan sonra başlanacak

## 📋 Özellik Listesi

| # | Özellik | Zorluk | Süre | Yeni Tablo | Bağımlılık |
|---|---------|--------|------|------------|-------------|
| 1 | **Environment** | Orta | 4-6 saat | `environments`, `environment_variables` | — |
| 2 | **Background Task** | Orta | 3-4 saat | `background_tasks` | — |
| 3 | **Operational Webhook** | Orta | 3-4 saat | `operational_webhook_endpoints`, `operational_webhook_deliveries` | Background Task |
| 4 | **Message Poller** | Orta | 3-4 saat | `message_cursors` | — |
| 5 | **Ingest** (inbound webhook) | Zor | 8-10 saat | `ingest_sources`, `ingest_endpoints` | — |
| 6 | **Connector** (Shopify,Stripe...) | Çok zor | 20+ saat | `connectors`, `connector_configs` | Ingest |
| 7 | **Integration** | Zor | 10-15 saat | `integrations` | Connector |
| 8 | **Streaming** (SSE/WebSocket) | Çok zor | 15-20 saat | Mevcut `ws_subscriptions` üzerine | — |

**Toplam:** ~65-85 saat

---

## 🏗️ Bağımlılık Ağacı

```
Environment (temel)
│
├── Background Task (temel)
│   ├── Operational Webhook
│   └── Ingest
│       ├── Connector
│       └── Integration
│
├── Message Poller (bağımsız)
│
└── Streaming (bağımsız, en son)
```

---

## 📐 Her Özellik İçin Yapılacaklar

### 1. Environment (dev/staging/prod)
- [ ] Migration: `environments` tablosu (id, name, app_id, created_at)
- [ ] Migration: `environment_variables` tablosu (id, env_id, key, value, encrypted)
- [ ] Rust API: CRUD endpoint'leri
- [ ] SDK güncellemesi (11 dil)
- [ ] Dashboard UI

### 2. Background Task
- [ ] Migration: `background_tasks` tablosu (id, status, task_type, data, result, created_at, finished_at)
- [ ] Rust API: List, get, cancel endpoint'leri
- [ ] Worker: Task execution logic
- [ ] SDK güncellemesi (11 dil)

### 3. Operational Webhook
- [ ] Migration: `operational_webhook_endpoints` tablosu
- [ ] Migration: `operational_webhook_deliveries` tablosu
- [ ] Rust API: CRUD + delivery log
- [ ] Worker: Operational event dispatch
- [ ] SDK güncellemesi (11 dil)

### 4. Message Poller
- [ ] Migration: `message_cursors` tablosu (consumer_id, last_message_id, created_at)
- [ ] Rust API: Poll, seek, commit endpoint'leri
- [ ] SDK güncellemesi (11 dil)

### 5. Ingest (Inbound Webhook)
- [ ] Migration: `ingest_sources` tablosu (id, name, url, secret, config)
- [ ] Migration: `ingest_endpoints` tablosu (id, source_id, target_url, filters)
- [ ] Rust API: CRUD + webhook receiver
- [ ] Worker: Routing + forwarding logic
- [ ] SDK güncellemesi (11 dil)

### 6. Connector
- [ ] Migration: `connectors` tablosu (id, name, type, config_schema)
- [ ] Migration: `connector_configs` tablosu (id, connector_id, app_id, credentials)
- [ ] Rust API: CRUD + config management
- [ ] Worker: Connector-specific transform logic
- [ ] SDK güncellemesi (11 dil)
- [ ] Her connector için özel handler (Shopify, Stripe, GitHub, vb.)

### 7. Integration
- [ ] Migration: `integrations` tablosu (id, name, app_id, connector_ids)
- [ ] Rust API: CRUD + multi-connector management
- [ ] SDK güncellemesi (11 dil)

### 8. Streaming
- [ ] Mevcut `ws_subscriptions` tablosu üzerine inşa
- [ ] Rust API: SSE endpoint + WebSocket upgrade
- [ ] Worker: Event fan-out to subscribers
- [ ] SDK güncellemesi (11 dil)

---

## 🔗 Svix Karşılaştırma

| Svix Feature | HookSniff Karşılığı | Durum |
|-------------|---------------------|-------|
| Application | Endpoint (farklı tasarım) | ✅ Mevcut |
| BackgroundTask | Background Task | ⬜ Planlandı |
| Connector | Connector | ⬜ Planlandı |
| Environment | Environment | ⬜ Planlandı |
| Ingest | Ingest | ⬜ Planlandı |
| Integration | Integration | ⬜ Planlandı |
| OperationalWebhook | Operational Webhook | ⬜ Planlandı |
| Streaming | Streaming | ⬜ Planlandı |
| MessagePoller | Message Poller | ⬜ Planlandı |

---

## ⚠️ Notlar

- Her özellik için: Migration → API → SDK → Dashboard sırası takip edilecek
- SDK güncellemeleri Svix pattern'ını takip edecek (mevcut adaptation methodu)
- Her oturum sonunda `.ai-context/sdk-roadmap/` dosyaları güncellenecek
- Yeni feature'lar HookSniff'e özel olacak, Svix ile uyumlu olmayacak
