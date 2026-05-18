# Dashboard Restructure Plan v3 — Kullanıcı Odaklı Yapı

> Tarih: 2026-05-19 02:37 GMT+8
> Durum: Planlama aşaması
> Prensip: Kullanıcı ne düşünüyor → o gruplama

---

## 🎯 Temel Prensip

```
Kullanıcı sormuyor: "Schema & Content nerede?"
Kullanıcı soruyor:  "Endpoint'lerimi nerede yönetirim?"
                     "Mesajlarımı nerede görürüm?"
                     "Webhook'larım güvenli mi?"
```

---

## 📋 Yeni Sidebar — 8 Section

```
┌──────────────────────────────────────────────────────┐
│  🪝 HookSniff                                         │
├──────────────────────────────────────────────────────┤
│                                                       │
│  📊 Overview              → /dashboard                │
│                                                       │
│  ── WEBHOOK'LARIM ─────────────────────────────────  │
│  🔗 Endpoints             → /endpoints               │
│  📱 Applications          → /applications            │
│  🔑 API Keys              → /api-keys                │
│                                                       │
│  ── MESAJLAR ───────────────────────────────────────  │
│  📨 Deliveries            → /deliveries (tab'lar:     │
│       └─ History | Search | Logs)                     │
│                                                       │
│  ── KONFİGÜRASYON ──────────────────────────────────  │
│  🔀 Routing               → /routing (tab'lar:        │
│       └─ Rules | Retry Policy | Custom Domain)        │
│  📐 Content               → /content (tab'lar:        │
│       └─ Schemas | Templates | Transforms | Inbound)  │
│  🌐 Environments          → /environments             │
│                                                       │
│  ── GÜVENLİK ───────────────────────────────────────  │
│  🔒 Security              → /security (tab'lar:       │
│       └─ Rate Limiting | SSO | Audit Log)             │
│                                                       │
│  ── ENTEGRASYONLAR ──────────────────────────────────  │
│  🔌 Connectors            → /connectors               │
│  🔗 Integrations          → /integrations             │
│  🪝 Op. Webhooks          → /operational-webhooks     │
│  📬 Message Poller        → /message-poller            │
│  📡 Streaming             → /streaming                │
│                                                       │
│  ── İZLEME ──────────────────────────────────────────  │
│  📡 Observability         → /observability (tab'lar:   │
│       └─ Health | Alerts | Analytics)                 │
│  ⏳ Background Tasks      → /background-tasks          │
│                                                       │
│  ── ARAÇLAR ─────────────────────────────────────────  │
│  🛠️ DevTools              → /devtools (tab'lar:        │
│       └─ Playground | Signature | Builder | Importer)  │
│                                                       │
│  ── HESAP ───────────────────────────────────────────  │
│  👤 Account               → /account (tab'lar:         │
│       └─ Team | Tokens | Portal | Notifications |      │
│          Settings | Billing)                           │
│                                                       │
└──────────────────────────────────────────────────────┘
```

---

## 📊 Section Detayları

### 📊 Overview — `/dashboard`
- Toplam endpoint, mesaj, success rate
- Son aktivite feed
- Hızlı erişim butonları

### 🔗 WEBHOOK'LARIM — 3 bağımsız sayfa
| Sayfa | URL | Neden ayrı? |
|-------|-----|-------------|
| Endpoints | `/endpoints` | Ana iş, CRUD gerekli |
| Applications | `/applications` | Gruplama, detail page var |
| API Keys | `/api-keys` | Güvenlik, ayrı sayfa |

### 📨 MESAJLAR — 1 sayfa, 3 tab
| Tab | Component | İçerik |
|-----|-----------|--------|
| History | `<DeliveriesPage />` | Teslim geçmişi |
| Search | `<SearchPage />` | Webhook arama |
| Logs | `<LogsPage />` | Tüm loglar |

**Neden tek sayfa?** Hepsi "mesaj geçmişi" — kullanıcı arama yaparken History'ye de bakıyor.

### 🔀 KONFİGÜRASYON — 3 sayfa
| Sayfa | URL | Tab'lar |
|-------|-----|---------|
| Routing | `/routing` | Rules, Retry Policy, Custom Domain |
| Content | `/content` | Schemas, Templates, Transforms, Inbound |
| Environments | `/environments` | (bağımsız sayfa) |

**Neden "Konfigürasyon"?** Kullanıcı "webhook'larım nasıl çalışsın?" sorusunun cevabı.

### 🔒 GÜVENLİK — 1 sayfa, 3 tab
| Tab | Component | İçerik |
|-----|-----------|--------|
| Rate Limiting | `<RateLimitingPage />` | Hız sınırı |
| SSO | `<SsoPage />` | Tek oturum açma |
| Audit Log | `<AuditLogPage />` | Denetim günlüğü |

### 🔌 ENTEGRASYONLAR — 5 bağımsız sayfa
| Sayfa | URL | Neden ayrı? |
|-------|-----|-------------|
| Connectors | `/connectors` | Shopify, Stripe — yapılandırma gerektirir |
| Integrations | `/integrations` | 3. parti — farklı workflow |
| Op. Webhooks | `/operational-webhooks` | Sistem webhook'ları |
| Message Poller | `/message-poller` | Polling mekanizması |
| Streaming | `/streaming` | SSE/WebSocket — farklı teknoloji |

### 📡 İZLEME — 2 sayfa
| Sayfa | URL | Tab'lar |
|-------|-----|---------|
| Observability | `/observability` | Health, Alerts, Analytics |
| Background Tasks | `/background-tasks` | (bağımsız sayfa) |

### 🛠️ ARAÇLAR — 1 sayfa, 4 tab
| Tab | Component | İçerik |
|-----|-----------|--------|
| Playground | `<PlaygroundPage />` | Test webhook gönder |
| Signature Tool | `<SignatureVerifierPage />` | HMAC doğrulama |
| Webhook Builder | `<WebhookBuilderPage />` | Görsel oluşturucu |
| API Importer | `<ApiImporterPage />` | API import |

### 👤 HESAP — 1 sayfa, 6 tab
| Tab | Component | İçerik |
|-----|-----------|--------|
| Team | `<TeamPage />` | Üye yönetimi |
| Service Tokens | `<ServiceTokensPage />` | Token yönetimi |
| Portal | `<PortalCustomizePage />` | Portal özelleştirme |
| Notifications | `<NotificationsPage />` | Bildirim ayarları |
| Settings | `<SettingsPage />` | Genel ayarlar |
| Billing | `<BillingPage />` | Plan & ödeme |

**Neden Portal burada?** Kullanıcı portal'ı ayda 1 değiştirir. Billing gibi nadir kullanılan şey.

---

## 📊 Karşılaştırma

| | v2 (önceki) | v3 (yeni) |
|--|-------------|-----------|
| Section sayısı | 11 | **8** |
| Top-level item | 15 | **12** |
| Mantık | Feature bazlı | **Kullanıcı odaklı** |
| Portal | Tek section | **Account altı** |
| Billing | Tek section | **Account altı** |
| Environments | Kayıp | **Konfigürasyon altı** |
| Background Tasks | Kayıp | **İzleme altı** |

---

## 🔄 Birleştirme Haritası

```
ESKI                              → YENİ
─────────────────────────────────────────────────
/billing                          → /account (Billing tab)
/billing-overview                 → /account (Billing tab)
/billing-section                  → /account (Billing tab)
/team                             → /account (Team tab)
/team-mgmt                        → /account (Team tab)
/settings                         → /account (Settings tab)
/settings-section                 → /account (Settings tab)
/portal-customize                 → /account (Portal tab)
/portal-manage                    → /account (Portal tab)
/portal-section                   → /account (Portal tab)
/routing                          → /routing (Rules tab)
/routing-config                   → /routing (tek sayfa)
/content-mgmt                     → /content (tek sayfa)
/security-section                 → /security (tek sayfa)
/sandbox                          → /devtools (Playground tab)
/sandbox/playground               → /devtools (Playground tab)
/notifications                    → /account (Notifications tab)
/service-tokens                   → /account (Tokens tab)
```

---

## ⚠️ Notlar

- Mevcut component'ler **silinmeyecek** — tab container'lar dynamic import ile çağıracak
- Eski URL'ler redirect edilecek (SEO + bookmark koruması)
- `applications/[id]`, `deliveries/[id]`, `endpoints/[id]` detail sayfaları korunacak
- Admin panel ayrı kalacak (`/admin`)
- Public sayfalar (landing, docs, blog) etkilenmeyecek
