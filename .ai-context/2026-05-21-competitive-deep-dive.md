# 2026-05-21 — Rakip Analizi: Hook0 vs Svix vs HookSniff

> Tarih: 2026-05-21 06:12 GMT+8
> Kaynaklar: documentation.hook0.com, docs.svix.com, HookSniff FEATURES.md + COMPETITIVE_ANALYSIS.md

---

## 📊 Genel Karşılaştırma

| Özellik | **Svix** | **Hook0** | **HookSniff (Biz)** |
|---------|----------|-----------|-------------------|
| **Dil** | Rust | Rust | Rust (API) + Next.js (Dashboard) |
| **Lisans** | MIT (açık kaynak) | SSPL v1 | MIT |
| **Self-hosted** | ✅ (open-core) | ✅ (tam özellik) | ✅ |
| **Hosting modeli** | SaaS + Self-hosted | SaaS + Self-hosted | Free-tier SaaS (GCP + Vercel) |
| **Fiyat** | $490/ay başlangıç | €59/ay (cloud) | $49/ay (planlanan) |
| **Funding** | ~$17M (a16z, YC) | Bootstrapped | Bireysel |
| **SDK sayısı** | 10+ | 2 (JS, Rust) | 11 ✅ (en fazla!) |
| **Dashboard** | React | Vue.js | Next.js 15 (41 sayfa) |

---

## 🔑 Konsept Farklılıkları (ÇOK ÖNEMLİ)

### Hook0'un Veri Modeli
```
Organization → Application → Event Types → Events → Subscriptions → Request Attempts
```
- **Organization**: Üst seviye gruplama (ekip + uygulamalar)
- **Application**: Servis/ürün temsili
- **Event Types**: `service.resource_type.verb` formatı (örn: `user.account.created`)
- **Subscriptions**: Endpoint + event type eşleştirmesi + label-based routing
- **Request Attempts**: Her teslimat denemesi kaydı

### Svix'un Veri Modeli
```
Application → Event Types → Messages → Endpoints → Attempts
```
- **Application**: Tenant/customer temsili
- **Event Types**: Basit adlandırma (`user.created`)
- **Messages**: Event payload'ı
- **Endpoints**: Teslimat hedefleri
- **Attempts**: Teslimat denemeleri

### HookSniff'in Veri Modeli
```
User → Organization → Endpoints → Webhooks → Deliveries
```
- **User/Organization**: Auth tabanlı gruplama
- **Endpoints**: Teslimat hedefleri (URL + config)
- **Webhooks**: Event payload'ı
- **Deliveries**: Teslimat denemeleri

**💡 Analiz:** Hook0'un modeli en detaylı. "Application" kavramı çoklu tenant için kritik. HookSniff'te bu eksik — müşteri kendi uygulamalarını yönetemiyor.

---

## 🏗️ Mimarİ Karşılaştırma

### Hook0 Mimarisi
- **Varsayılan**: PostgreSQL-only (FOR UPDATE SKIP LOCKED ile queue)
- **Yüksek throughput**: Apache Pulsar + S3 (queue + payload depolama)
- **Worker'lar**: Per-worker queue_type ayarı (database switch, kod değişikliği yok)
- **Auth**: Biscuit tokens (JWT'den daha esnek, built-in authorization)
- **Retry**: Two-phase (hızlı: 3s, 10s + yavaş: 3min, 30min, 1h, 3h, 5h, 10h)

### Svix Mimarisi
- **Queue**: PostgreSQL-based (persistence) + Redis (real-time)
- **Retry**: Exponential backoff + jitter
- **Auth**: API keys
- **Multi-tenant**: Application-based isolation

### HookSniff Mimarisi
- **Queue**: PostgreSQL LISTEN/NOTIFY + fallback polling (1s)
- **Retry**: Exponential backoff + jitter ✅
- **Auth**: JWT + API key (Argon2id) + 2FA (TOTP) ✅
- **Worker**: Rust background worker
- **Deploy**: GCP Cloud Run (free tier)

**💡 Analiz:** Hook0'un Pulsar+S3 geçişi akıllıca — aynı kod tabanı ile ölçeklenebilirlik. HookSniff'in PostgreSQL LISTEN/NOTIFY yaklaşımı free-tier için doğru tercih.

---

## ✅ HookSniff'in ÖNE ÇIKTIĞI ALANLAR

### 1. SDK Sayısı — 11 dil (EN FAZLA!)
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| 10+ | 2 | **11** ✅ |

Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift

### 2. Multi-Destination Teslimat
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| HTTP + Bridge | HTTP only | **HTTP + WebSocket + Email** ✅ |

### 3. Inbound Webhook Proxy
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| ❌ | ❌ | **✅ (Stripe, GitHub, Shopify)** |

### 4. Smart Routing
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| ❌ | ❌ | **✅ (round-robin, latency, failover)** |

### 5. FIFO Sıralı Teslimat
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| ❌ | ❌ | **✅** |

### 6. Endpoint Throttling (Token Bucket)
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| ❌ | ❌ | **✅** |

### 7. Schema Registry + Validation
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| ❌ | ❌ | **✅** |

### 8. Embeddable Portal Widget
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| ❌ | ❌ | **✅** |

### 9. CloudEvents v1.0 Desteği
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| ❌ | ❌ | **✅** |

### 10. Free-Tier Hosting ($0/ay)
| Svix | Hook0 | HookSniff |
|------|-------|-----------|
| SaaS ücretli | Cloud ücretli | **$0/ay** ✅ |

---

## 🔴 HookSniff'in EKSİK OLDUĞU ALANLAR

### 1. ⚠️ Multi-Tenant Application Modeli — MEVCUT AMA GELİŞTİRİLMELİ
- Hook0: Organization → Application → Subscription hiyerarşisi
- Svix: Application-based tenant isolation
- **HookSniff**: `applicationsApi` mevcut — CRUD + endpoint filtering + delivery filtering var
- **Etki**: Temel multi-tenant altyapı mevcut ama label-based routing ve subscription kavramı eksik

### 2. ❌ Event Type Hiyerarşisi
- Hook0: `service.resource_type.verb` (dot-notation, hiyerarşik)
- Svix: Basit event type adları
- **HookSniff**: Flat event type yapısı
- **Etki**: Label-based routing var ama structured event type yok

### 3. ❌ Label-Based Multi-Tenant Routing
- Hook0: Event'lerde label zorunlu, subscription'lar label ile filtreleniyor
- **HookSniff**: Label/filtre sistemi eksik

### 4. ❌ Two-Phase Retry (Hızlı + Yavaş)
- Hook0: Hızlı retry (3s, 10s) + Yavaş retry (3min, 30min, 1h, 3h, 5h, 10h)
- **HookSniff**: Sadece exponential backoff (tek faz)

### 5. ❌ Webhook Playground / Tester
- Hook0: play.hook0.com — signup gerektirmez, anında test
- **HookSniff**: Playground endpoint var ama public tester yok

### 6. ❌ Status Page
- Hook0: status.hook0.com
- Svix: Built-in
- **HookSniff**: Sayfa var ama gerçek monitoring yok

### 7. ⚠️ Documentation Quality
- Hook0: Diataxis metodu (Tutorials, How-to, Reference, Explanation) — çok iyi organize
- Svix: Basit ama etkili
- **HookSniff**: README + FEATURES.md var ama structured docs eksik

### 8. ❌ Sertifikalar (SOC 2, HIPAA, PCI-DSS)
- Svix: SOC 2 + HIPAA + PCI-DSS ✅
- Hook0: GDPR (EU) ✅
- **HookSniff**: Hiçbiri yok

---

## 💡 STRATEJİK ÖNERİLER

### Kısa Vadeli (1-2 Hafta) — Quick Wins

#### 1. Application Modeli Ekle
```rust
// Organization → Application → Endpoint hiyerarşisi
// Her customer kendi application'larını yönetebilmeli
// Hook0'un modeli: Organization > Application > Event Types > Subscriptions
```
**Neden kritik:** Multi-tenant SaaS için temel. Müşteriler kendi webhook'larını izole etmeli.

#### 2. Event Type Hiyerarşisi
```
service.resource_type.verb formatına geç
Örn: payment.invoice.created, user.account.updated
```
**Neden:** Hook0'un `service.resource_type.verb` convention'ı çok iyi. Daha organize, daha filtrelebilir.

#### 3. Public Webhook Tester
`play.hooksniff.com` veya `/play` sayfası:
- Signup gerektirmez
- Anında webhook URL oluşturur
- Gelen webhook'ları real-time gösterir
**Neden:** Hook0'un en güçlü pazarlama aracı. Developer experience.

#### 4. Label-Based Routing
Event'lere label ekle, subscription'lar label ile filtrele:
```json
{
  "labels": {"environment": "production", "region": "eu"},
  "event_type": "payment.invoice.created"
}
```

### Orta Vadeli (1 Ay) — Rekabet Gücü

#### 5. Two-Phase Retry
Hızlı faz (3s, 10s, 30s) + Yavaş faz (3min, 15min, 1h, 3h, 6h, 12h)
**Neden:** Hook0'un fark yaratan özelliği. Basit exponential backoff yeterli değil.

#### 6. Documentation Overhaul
Hook0'un Diataxis metodunu uygula:
- **Tutorials**: "İlk webhook'unu gönder" (5 dakika)
- **How-to Guides**: "Failed webhook'ları debug et"
- **Reference**: API docs (Swagger zaten var)
- **Explanation**: Mimari, retry logic, security model

#### 7. Status Page (Gerçek Monitoring)
Uptime monitoring + public status page
**Neden:** Kurumsal müşteriler için güven göstergesi.

### Uzun Vadeli (3+ Ay) — Büyüme

#### 8. SOC 2 / GDPR Uyumluluğu
- GDPR: Privacy policy + data export + account deletion (zaten var!)
- SOC 2: Denetim raporu ($5K-20K)

#### 9. MCP Server (AI Integration)
Hook0'un yeni özelliği: AI assistant'lar ile kontrol
**Neden:** Developer tooling trendi. Cursor, Claude, VS Code entegrasyonu.

#### 10. Webhook Best Practices Dokümantasyonu
Hook0'un producer/consumer guide'ı çok iyi. Benzerini yap.

---

## 🎯 HookSniff'in Unique Selling Points (USP)

Rakiplerde olmayan ama bizde olan özellikler:

1. **$0/ay hosting** — Free-tier ile tam fonksiyonel SaaS
2. **11 SDK** — En geniş dil desteği
3. **Multi-destination** — HTTP + WebSocket + Email
4. **Inbound proxy** — Stripe, GitHub, Shopify webhook'ları
5. **Smart routing** — Round-robin, latency-based, failover
6. **FIFO delivery** — Sıralı teslimat
7. **Embeddable portal** — Müşteri dashboard'u kendi sitene ekle
8. **Schema registry** — JSON schema validation
9. **CloudEvents v1.0** — Endüstri standardı event formatı

**Pozisyonlama:** "Rakiplerin tüm özellikleri, $0/ay, 11 SDK"

---

## 📈 Pazarlama Önerileri

### Hook0 vs HookSniff Blog Post
"Hook0'a alternatif: HookSniff ile $0/ay webhook altyapısı"
- Hook0'un eksiklerini vurgula (SDK sayısı, multi-destination, inbound proxy)
- Free-tier avantajını öne çıkar

### Svix vs HookSniff Blog Post
"Svix'e alternatif: Self-hosted webhook platformu"
- Svix'in $490/ay fiyatını vurgula
- 11 SDK + free-tier avantajı

### Developer Experience Focus
- "5 dakikada ilk webhook" tutorial
- Interactive playground (signup yok)
- Code examples (11 dilde)

---

## 🔍 Sonuç

HookSniff teknik olarak rakiplerinden geri değil — hatta birçok alanda önde. Asıl eksiklikler:

1. **Multi-tenant model** (application kavramı)
2. **Dokümantasyon** (structured, Diataxis metodu)
3. **Developer experience** (playground, quick start)
4. **Sertifikalar** (SOC 2, GDPR compliance)

Bunlar çözülebilir sorunlar. Teknik altyapı zaten sağlam.
