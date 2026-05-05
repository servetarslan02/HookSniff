# 🪝 HookRelay — Derinlemesine Rekabet Analizi

> **Tarih:** 2026-05-06  
> **Hazırlayan:** Mamo (AI)  
> **Amaç:** Rakip şirketler, GitHub repoları, yasal düzenlemeler, global operasyonlar ve eksiklerimizin detaylı analizi

---

## 📊 1. Rakip Şirketler ve GitHub Repoları

### 🏆 Svix — En Büyük Rakip
**GitHub:** [svix/svix-webhooks](https://github.com/svix/svix-webhooks)

| Metrik | Değer |
|--------|-------|
| **Stars** | ~3,200+ |
| **Dil** | Rust (Python'dan yeniden yazılmış) |
| **Lisans** | MIT (açık kaynak, open-core model) |
| **Funding** | ~$17M (a16z liderliğinde, YC Continuity) |
| **Müşteriler** | Fortune 500 şirketleri (Brex, Lob, Benchling, LTSE Equity) |
| **Webhook hacmi** | Yılda milyarlarca webhook |
| **SDK sayısı** | 10+ (JS, Python, Go, Ruby, Java, C#, PHP, Kotlin, Elixir, Swift) |

**Neden güçlü:**
- a16z + YC desteği → kurumsal güvenilirlik
- Standard Webhooks standardını kendileri başlatmış (Zapier, Twilio, Mux destekliyor)
- Open-core model: açık kaynak versiyonu ücretsiz ama bazı özellikler ücretli
- FIFO sıralama (webhook'ların sıralı teslimi) — benzersiz özellik
- Endpoint throttling (müşteri sunucularını koruma)
- Embeddable portal (müşteri dashboard'una eklenebilir)
- SOC 2 Type II + HIPAA + PCI-DSS sertifikalı

**Kod yapısı dersleri:**
- `svix-server/` — Rust backend (Axum tabanlı, bizimkiyle aynı)
- `svix-libs/` — paylaşımlı kütüphaneler (imza doğrulama, model tanımları)
- `server/svix-server/` — HTTP API, queue, delivery engine
- Her SDK ayrı bir dilde, tutarlı API surface
- OpenAPI spec → SDK generation pipeline

---

### 🥈 Hookdeck — İkinci Büyük Rakip
**GitHub:** [hookdeck/outpost](https://github.com/hookdeck/outpost)

| Metrik | Değer |
|--------|-------|
| **Stars** | ~1,500+ |
| **Dil** | Go |
| **Lisans** | Apache 2.0 |
| **Funding** | ~$5.5M |
| **Fark** | Inbound webhook proxy (gelen webhook'ları yönetir) |

**Neden farklı:**
- Hookdeck gelen webhook'ları yönetir (inbound), HookRelay giden webhook'ları teslim eder (outbound)
- Outpost mimarisi: multi-tenant, 8 farklı destination türü (HTTP, AWS SQS, GCP Pub/Sub, RabbitMQ, vb.)
- Backpressure mekanizması: durable queue ile dayanıklılık
- Self-hosted + managed hybrid model (aynı kod tabanı)
- Per-endpoint rate limiting ve throttling

**Kod yapısı dersleri:**
- Go tabanlı, clean architecture
- Event destination pattern: her destination türü ayrı bir modül
- Tenant isolation: her müşteri kendi queue'suna sahip

---

### 🥉 Hook0 — Açık Kaynak Alternatif
**GitHub:** [hook0/hook0](https://github.com/hook0/hook0)

| Metrik | Değer |
|--------|-------|
| **Stars** | ~500+ |
| **Dil** | Rust + TypeScript (frontend) |
| **Lisans** | SSPL-1.0 (kendi servisini sunuyorsan açık kaynak olmalısın) |
| **Funding** | Bootstrapped (kendi kendine yetiyor) |
| **Fark** | EU merkezli, tam açık kaynak |

**Neden ilginç:**
- Self-hosted ile cloud versiyonu aynı özelliklere sahip (Svix'te bu yok!)
- Two-phase retry (hızlı + yavaş) + jitter — iyi bir pattern
- Biscuit tokens ile authentication (JWT'den daha esnek)
- Label-based multi-tenant filtering
- Event type hierarchy (dot-notation: `order.created`, `order.paid`)
- EU data residency odaklı

**Kod yapısı dersleri:**
- Rust backend + React frontend
- Biscuit token authentication (değişken süreli, scope'lu token'lar)
- Subscription-based event routing

---

### 📊 Convoy (Kapandı — Ders Çıkarma)
**GitHub:** [frain-dev/convoy](https://github.com/frain-dev/convoy)

| Metrik | Değer |
|--------|-------|
| **Dil** | Go |
| **Lisans** | Elastic License v2.0 |
| **Durum** | ⚠️ Kapandı |

**Neden kapandı — dersler:**
- Open source tek başına iş modeli olmuyor
- Kurumsal destek olmadan sürdürülebilir değil
- İyi özellikleri vardı: circuit breaking, JavaScript transformations, rate limiting
- **Bizim için ders:** Önce gelir, sonra open source

---

### 🔧 Pipedream & N8N (İlgili Platformlar)

**Pipedream** — Event-driven workflow automation
- Webhook trigger + 1000+ entegrasyon
- Developer-focused, code-first approach
- Webhook'ları sadece trigger olarak kullanır, delivery service değil

**N8N** — Open source workflow automation
- Self-hosted, 400+ node
- Webhook trigger + HTTP request nodes
- Bizim için: Rakip değil, entegrasyon hedefi (N8N → HookRelay webhook'ları)

---

## ⚖️ 2. Yasal Düzenlemeler — Detaylı Analizi

### 🇪🇺 GDPR (Avrupa Birliği Genel Veri Koruma Yönetmeliği)

**Ne:** Kişisel verilerin işlenmesi, saklanması ve silinmesi kuralları  
**Neden gerekli:** AB'deki müşterilerden veri işliyorsan zorunlu  
**Maliyet:** Uygulama ücretsiz, denetim $5K-15K  
**HookRelay'a etkisi:** 🔴 KRİTİK

**Yapılması gerekenler:**
1. **Privacy Policy** — Veri toplama, işleme, saklama politikası ✅ (mevcut)
2. **DPA (Data Processing Agreement)** — Müşterilerle veri işleme sözleşmesi ❌ (eksik)
3. **Right to Erasure** — Müşteri verisini silme mekanizması ❌ (eksik)
4. **Data Portability** — Verileri dışa aktarma ❌ (eksik)
5. **Consent Management** — Cookie consent, veri onayı ❌ (eksik)
6. **DPO (Data Protection Officer)** — AB'de veri sorumlusu atama (10K+ müşteri gerekli)
7. **Data Processing Records** — Veri işleme kayıtları tutma ❌ (eksik)

**Webhook-specific GDPR sorunları:**
- Webhook payload'larında PII (email, isim, adres) olabilir
- Bu veriler customer'ın endpoint'ine POST ediliyor → veri aktarımı
- Log'larda bu veriler saklanıyor → veri saklama
- Dead letter queue'da veri kalıyor → silinme mekanizması gerekli

---

### 🇺🇸 SOC 2 Type II (Güvenlik Denetimi)

**Ne:** Güvenlik kontrollerinin bağımsız denetçi tarafından doğrulanması  
**Neden gerekli:** Kurumsal müşteriler (Fortune 500) bunu şart koşuyor  
**Maliyet:** $15K-50K (denetim + hazırlık)  
**Süre:** 6-12 ay hazırlık + 3-6 ay denetim  
**HookRelay'a etkisi:** 🟡 ORTA (şu an gerekli değil, $500/ay gelir sonrası)

**SOC 2 hazırlık checklist:**
1. ✅ Access control (API key auth mevcut)
2. ✅ Encryption at rest (CockroachDB)
3. ❌ Encryption in transit (SSL devre dışı!) → düzeltildi review'da
4. ❌ Audit logging (kim ne yaptı?) → eksik
5. ❌ Incident response plan → eksik
6. ❌ Business continuity plan → eksik
7. ❌ Vendor management → eksik
8. ❌ Employee security training → N/A (bireysel)

**Otomasyon araçları:** Vanta ($5K+/ay), Drata, Secureframe — startup'lar için pahalı

---

### 🇹🇷 KVKK (Kişisel Verileri Koruma Kanunu)

**Ne:** Türkiye'nin GDPR eşdeğeri  
**Neden gerekli:** Türkiye'de müşteri topluyorsan zorunlu  
**Maliyet:** Ücretsiz (uygulama), cezalar ağır (1M+ TL)  
**HookRelay'a etkisi:** 🔴 KRİTİK (Servet Türkiye'de)

**Yapılması gerekenler:**
1. **Aydınlatma Metni** — Veri işleme hakkında bilgilendirme ❌
2. **Veri Sorumlusu Sicil Kaydı** — VERBİS'e kayıt ❌
3. **Rıza Yönetimi** — Açık rıza alma mekanizması ❌
4. **Veri Güvenliği Tedbirleri** — Teknik ve idari tedbirler ❌
5. **Yurt Dışı Aktarım** — AB ülkelerine veri aktarım kuralları ❌

**Önemli:** KVKK, GDPR'dan daha katı olabilir. Türkiye'de şirket kurmadan önce bireysel olarak da uyumlu olunmalı.

---

### 💳 PCI-DSS (Ödeme Kartı Endüstrisi Veri Güvenliği Standardı)

**Ne:** Kredi kartı verilerinin işlenmesi kuralları  
**HookRelay'a etkisi:** 🟢 DÜŞÜK (Stripe kullanıyoruz, kart verisi görmüyoruz)

Stripe zaten PCI-DSS uyumlu. Biz sadece Stripe webhook'larını alıyoruz. Ama müşterilerimizin webhook payload'larında ödeme verisi olabilir → dikkatli olunmalı.

---

### 🏥 HIPAA (Sağlık Verisi)

**Ne:** ABD'deki sağlık verilerinin korunması  
**HookRelay'a etkisi:** 🟢 DÜŞÜK (şu an sağlık sektörü hedeflenmiyor)

Gelecekte healthcare müşterileri gelirse gerekli. Maliyet: $10K+.

---

### 🌐 ISO 27001 (Bilgi Güvenliği Yönetim Sistemi)

**Ne:** Uluslararası bilgi güvenliği standardı  
**HookRelay'a etkisi:** 🟡 ORTA (kurumsal satış için avantaj)

SOC 2 ile birlikte düşünülmeli. Maliyet: $10K-30K.

---

## 🌍 3. Global Operasyon Modelleri

### Svix'in Deploy Stratejisi
- **Multi-region:** US, EU, APAC bölgelerinde deploy
- **Data residency:** Müşteriler verilerinin nerede saklanacağını seçebilir
- **Edge caching:** CDN ile API yanıt hızı optimizasyonu
- **Managed hosting:** Kendi altyapıları üzerinde (muhtemelen AWS)

### Hookdeck'in Outpost Mimarisi
- **Self-hosted hybrid:** Aynı kod tabanı hem cloud hem self-hosted
- **8 destination türü:** HTTP, AWS SQS, GCP Pub/Sub, RabbitMQ, Azure Service Bus, vb.
- **Tenant isolation:** Her müşteri kendi queue'suna sahip
- **Backpressure:** Durable queue ile spike koruması

### Hook0'nun EU Stratejisi
- **EU data residency:** Tüm veri AB'de saklanır
- **GDPR-first tasarım:** Right to erasure, data portability built-in
- **Self-hosted kolaylığı:** `docker compose up` ile tek komutla kurulum

### Bizim İçin Önerilen Model
1. **Phase 1 (şimdi):** Single region (Türkiye veya EU) — basit başlangıç
2. **Phase 2 ($500/ay+):** EU + US dual region
3. **Phase 3 ($5K/ay+):** Multi-region + data residency seçenekleri

---

## 💼 4. Rakiplerin İş Yetenekleri

### Svix — Kurumsal Dev
| Metrik | Değer |
|--------|-------|
| **Funding** | ~$17M (a16z, YC Continuity, Aleph) |
| **Müşteri segmenti** | Enterprise (Fortune 500) + Startup |
| **ARR** | Tahmini $2-5M (funding ve müşteri sayısına göre) |
| **Büyüme** | Yılda 2-3x (webhook kullanımı artıyor) |
| **Ekip** | 15-25 kişi (Rust engineers, DevRel, Sales) |
| **Fiyat** | $490/ay başlangıç, enterprise custom |
| **Avantaj** | Brand recognition, Standard Webhooks standardı |

### Hookdeck — Niş Oyuncu
| Metrik | Değer |
|--------|-------|
| **Funding** | ~$5.5M |
| **Müşteri segmenti** | Mid-market, DevOps ekipleri |
| **Fark** | Inbound webhook proxy (farklı pazar) |
| **Avantaj** | Outpost ile self-hosted hybrid |

### Hook0 — Bootstrapped EU
| Metrik | Değer |
|--------|-------|
| **Funding** | Kendi kendine yetiyor |
| **Müşteri segmenti** | EU startup'ları, self-hosted isteyenler |
| **Avantaj** | Tam açık kaynak, EU compliance |

---

## 🔗 5. HookRelay'a Faydalı Olacak Repolar

### Direkt Kullanılabilecekler

| Repo | Ne İşe Yarar | Lisans | Öncelik |
|------|-------------|--------|---------|
| [standard-webhooks/standard-webhooks](https://github.com/standard-webhooks/standard-webhooks) | Endüstri standardı imzalama protokolü, 10+ dilde referans kod | MIT | 🔴 |
| [svix/svix-webhooks/libraries/rust](https://github.com/svix/svix-webhooks/tree/main/rust) | Rust webhook imza doğrulama kütüphanesi | MIT | 🔴 |
| [serde-rs/json](https://github.com/serde-rs/json) | JSON serialization (zaten kullanıyoruz) | MIT/Apache | ✅ |
| [redis-rs/redis-rs](https://github.com/redis-rs/redis-rs) | Rate limiting için Redis backend | MIT | 🟡 |

### Payload Transformation

| Repo | Ne İşe Yarar | Lisans |
|------|-------------|--------|
| [jmespath/jmespath-rs](https://github.com/jmespath/jmespath-rs) | JSON path ile veri filtreleme/çekme | MIT |
| [JSONPath](https://github.com/serde-rs/json) | Payload transformation için path sorgulama | MIT |
| [jsonata-rs/jsonata](https://github.com/jsonata-rs/jsonata) | JSONata: güçlü JSON transformation dili | MIT |

### SDK Generation

| Repo | Ne İşe Yarar | Lisans |
|------|-------------|--------|
| [openapi-generator](https://github.com/OpenAPITools/openapi-generator) | OpenAPI spec → SDK generation (10+ dil) | Apache 2.0 |
| [kiota](https://github.com/microsoft/kiota) | Microsoft'ın API client generation aracı | MIT |
| [swagger-codegen](https://github.com/swagger-api/swagger-codegen) | Swagger → SDK | Apache 2.0 |

### Monitoring & Observability

| Repo | Ne İşe Yarar | Lisans |
|------|-------------|--------|
| [Quickwit-oss/tantivy](https://github.com/Quickwit-oss/tantivy) | Rust full-text search (webhook log arama) | MIT |
| [open-telemetry/opentelemetry-rust](https://github.com/open-telemetry/opentelemetry-rust) | OTEL Rust SDK (zaten kullanıyoruz) | Apache 2.0 |
| [grafana/grafana](https://github.com/grafana/grafana) | Dashboard (zaten kullanıyoruz) | AGPLv3 |

### Rate Limiting & Throttling

| Repo | Ne İşe Yarar | Lisans |
|------|-------------|--------|
| [tokio-rs/tower](https://github.com/tokio-rs/tower) | Middleware framework (zaten kullanıyoruz) | MIT |
| [redis-cell/redis-cell](https://github.com/brandur/redis-cell) | Redis tabanlı token bucket rate limiter | MIT |
| [governor-rs/governor](https://github.com/antifuchs/governor) | Rust rate limiter kütüphanesi | MIT |

### Embeddable Widget

| Repo | Ne İşe Yarar | Lisans |
|------|-------------|--------|
| [microsoft/fluentui-react](https://github.com/microsoft/fluentui-react) | Microsoft UI component library | MIT |
| [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | Embeddable UI bileşenleri | MIT |
| [storybookjs/storybook](https://github.com/storybookjs/storybook) | UI bileşen geliştirme ve test | MIT |

---

## 🎯 6. HookRelay'ın Eksik Olduğu NOKTALAR (Rakip Karşılaştırma)

### Svix vs HookRelay

| Özellik | Svix | HookRelay | Fark |
|---------|------|-----------|------|
| **Funding** | $17M | $0 | 🔴 17M$ fark |
| **SDK sayısı** | 10+ | 3 | 🔴 7 SDK eksik |
| **SOC 2** | ✅ | ❌ | 🔴 Kurumsal satış imkansız |
| **HIPAA** | ✅ | ❌ | 🟡 Sağlık sektörü giremez |
| **FIFO** | ✅ | ❌ | 🟡 Sıralı teslimat yok |
| **Endpoint throttling** | ✅ | ❌ | 🟡 Müşteri koruması yok |
| **Embeddable portal** | ✅ | ❌ | 🟡 Müşteri self-service yok |
| **Standard Webhooks** | ✅ | ⚠️ Kısmen | 🟡 Uyumlu olmalı |
| **Multi-region** | ✅ | ❌ | 🟢 Phase 2 |
| **Data residency** | ✅ | ❌ | 🟢 Phase 2 |

### Hook0 vs HookRelay

| Özellik | Hook0 | HookRelay | Fark |
|---------|-------|-----------|------|
| **Self-hosted parity** | ✅ Aynı özellikler | ⚠️ Eksik | 🔴 |
| **EU compliance** | ✅ GDPR-first | ❌ | 🔴 |
| **Two-phase retry** | ✅ Fast + slow + jitter | ⚠️ Exponential only | 🟡 |
| **Biscuit tokens** | ✅ | ❌ (JWT only) | 🟢 |
| **Label-based filtering** | ✅ | ❌ | 🟢 |
| **AI anomaly detection** | ❌ | ✅ | ✅ Bizde var! |
| **Multi-delivery** | HTTP only | HTTP/WS/gRPC/SQS | ✅ Bizde var! |
| **Temporal workflow** | ❌ | ✅ | ✅ Bizde var! |

### HookRelay'ın Öne Çıktığı Noktalar ✅

1. **AI Center** — Anomali tespiti, risk scoring, auto-fix (hiçbir rakipte yok!)
2. **Multi-delivery protocol** — HTTP, WebSocket, gRPC, SQS (Svix'te sadece HTTP + Bridge)
3. **Temporal workflow** — Durable execution, crash recovery (Hook0'da yok)
4. **Industry packages** — Healthcare, fintech, e-commerce, SaaS (rakiplerde yok)
5. **Fiyat** — $49/ay (Svix $490/ay, Hook0 €59/ay)
6. **Agent sistemi** — Webhook event'lerini analiz eden AI agent'lar (rakiplerde yok)

---

## 📋 Öncelikli Aksiyon Planı

### Acil (Bu Hafta)
1. ✅ `.env.production` secret validation — yapıldı
2. ✅ Rate limiter aktif edildi — yapıldı
3. ❌ **KVKK aydınlatma metni** — Türkiye'de satış için zorunlu
4. ❌ **GDPR privacy policy güncellemesi** — AB müşteriler için
5. ❌ **DPA template** — Müşterilere sunulacak veri işleme anlaşması

### Kısa Vadeli (1-2 Hafta)
6. ❌ **Standard Webhooks tam uyumluluk** — endüstri standardı
7. ❌ **Right to erasure endpoint** — veri silme mekanizması
8. ❌ **Audit logging** — kim ne yaptı kaydı (SOC 2 hazırlığı)
9. ❌ **Endpoint throttling** — müşteri sunucularını koruma
10. ❌ **Embeddable portal** — müşteri self-service

### Orta Vadeli (1-2 Ay)
11. ❌ **Ruby SDK** — en çok eksik SDK
12. ❌ **Java SDK** — kurumsal müşteriler için
13. ❌ **PHP SDK** — WordPress/Laravel ekosistemi
14. ❌ **SOC 2 hazırlık** — denetim süreci başlatma
15. ❌ **Multi-region deploy** — EU + US

### Uzun Vadeli (3-6 Ay)
16. ❌ **SOC 2 Type II** — kurumsal satış için
17. ❌ **FIFO delivery** — Svix'ten farklılaşma
18. ❌ **Payload transformations** — JSON path + JSONata
19. ❌ **Data residency seçenekleri** — EU, US, APAC
20. ❌ **Self-hosted Docker image** — tek komutla kurulum

---

## 💡 Stratejik Öneriler

### Fiyatlandırma Stratejisi
- **Svix $490/ay** → Biz $49/ay = **10x daha ucuz**
- Bu avantajı koru ama "cheap" algısından kaçın
- AI Center feature'ını premium'a koy ($99/ay)
- Enterprise planı $299/ay (SOC 2 + SLA + priority support)

### Farklılaşma Stratejisi
1. **AI-first** — Hiçbir rakipte yok, bizim en büyük avantajımız
2. **Multi-protocol** — gRPC, WS, SQS (Svix'te yok)
3. **Industry packages** — Dikey pazarlara özel çözümler
4. **Temporal workflow** — Durable execution (Hook0'da yok)
5. **Fiyat** — 10x daha ucuz, aynı kalite

### Büyüme Stratejisi
1. **Developer-first** — SDK kalitesi, dokümantasyon, DX
2. **Open source community** — GitHub'da aktif ol, PR'lara cevap ver
3. **Content marketing** — "Webhook best practices" blog yazıları
4. **Integration partnerships** — N8N, Pipedream, Zapier entegrasyonları
5. **Developer conferences** — Türkiye'deki tech etkinlikleri

---

## 📚 Ek Kaynaklar

- [Svix Blog](https://www.svix.com/blog/) — Ürün güncellemeleri ve webhook best practices
- [Hookdeck Blog](https://hookdeck.com/blog) — Webhook architecture patterns
- [Hook0 Docs](https://documentation.hook0.com/) — Open source webhook platform
- [Standard Webhooks Spec](https://www.standardwebhooks.com/) — Endüstri standardı
- [SOC 2 Guide for Startups](https://www.vanta.com/collection/soc-2/what-is-soc-2) — SOC 2 hazırlık rehberi
- [KVKK Rehberi](https://www.kvkk.gov.tr/) — Türk veri koruma kanunu

---

> 💡 Bu dosya her ay güncellenmeli. Rakiplerin yeni özellikleri, yasal değişiklikler ve pazar动态 takip edilmeli.
