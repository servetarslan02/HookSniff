# 🪝 HookSniff — Rekabet Analizi ve Eksikler Raporu

> **Tarih:** 2026-05-06
> **Hazırlayan:** Mamo (AI)
> **Amaç:** Rakipleri, yasal düzenlemeleri ve eksiklerimizi tespit etmek

---

## 📊 Pazar Durumu

Webhook delivery pazarı 2026'da olgunlaşıyor. Büyük oyuncular var ama hala boşluklar mevcut.

### Rakip Karşılaştırma Tablosu

| Özellik | **Svix** | **Hookdeck** | **Hook0** | **Convoy** | **HookSniff (Biz)** |
|---------|----------|-------------|-----------|------------|-------------------|
| **Fiyat** | $490/ay | $39/ay | €59/ay | Ücretsiz (açık kaynak) | $49/ay |
| **Lisans** | MIT (açık kaynak) | Apache 2.0 (Outpost) | SSPL v1 | Elastic License v2.0 | MIT |
| **Dil** | Rust | Go (Outpost) | Rust | Go | Rust |
| **Self-hosted** | ✅ | ✅ (Outpost) | ✅ | ✅ | ✅ |
| **FIFO Sıralama** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Endpoint Throttling** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Multi-destination** | HTTP + Bridge | 8 tür | HTTPS only | HTTP only | HTTP + WS + Email |
| **SOC 2 Type II** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **HIPAA** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **PCI-DSS** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **GDPR** | ✅ | ✅ | ✅ (EU) | ❌ | ✅ |
| **Uptime** | 99.99999% | Yüksek | Düşük | <99% | Ölçülmemiş |
| **SDK Sayısı** | 10+ | 3 | 2 | 3 | 11 (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift) |
| **Customer Portal** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **OTel Desteği** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Schema Registry** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Inbound Proxy** | ❌ | ❌ | ❌ | ❌ | ✅ (Stripe, GitHub, Shopify) |
| **Embeddable Widget** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Standard Webhooks** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Smart Routing** | ❌ | ✅ | ❌ | ❌ | ✅ (round-robin, failover) |
| **Firma Durumu** | a16z backed, aktif | Aktif | Bootstrapped, EU | ⚠️ Kapandı | Bireysel |

---

## 🔴 Kritik Eksiklikler

### 1. Domain ve Marka
- **hooksniff.vercel.app zaten var!** — İsim çakışması
- Henüz domain alınmamış
- **Yapılacak:** Alternatif isim düşün (bkz. isim önerileri aşağıda)

### 2. Yasal Uyumluluk — Hiçbiri Yok!
Rakiplerin hepsinin en az bir sertifikası var, bizim hiç yok:

| Sertifika | Ne Demek | Maliyet | Öncelik |
|-----------|----------|---------|---------|
| **SOC 2 Type II** | Güvenlik denetim raporu | $5K-20K | 🔴 Yüksek |
| **GDPR** | Avrupa veri koruma | Ücretsiz (uygulama) | 🔴 Yüksek |
| **CCPA** | California veri koruma | Ücretsiz (uygulama) | 🟡 Orta |
| **HIPAA** | Sağlık verisi | $10K+ | 🟢 Düşük |
| **PCI-DSS** | Ödeme verisi | $5K-15K | 🟢 Düşük |

**Başlangıç için minimum:** GDPR uyumlu gizlilik politikası + ToS + veri işleme anlaşması

### 3. Customer Portal (Müşteri Paneli)
- Svix, Hookdeck ve Hook0'un hepsinde var
- Müşteriler kendi webhook'larını yönetebilmeli
- **Bizde:** Dashboard var ama multi-tenant müşteri portalı yok

### 4. Production Deploy Yok
- Henüz canlıda değil
- Rakipler zaten milyarlarca webhook teslim ediyor

---

## 🟡 Orta Seviye Eksiklikler

### 5. Standard Webhooks Uyumluluğu
- https://github.com/standard-webhooks/standard-webhooks
- Endüstri standardı imzalama protokolü
- Svix tarafından başlatılmış, Zapier, Twilio, Mux gibi şirketler destekliyor
- **Bizde:** HMAC-SHA256 var ama standard-webhooks spec'e tam uyumlu mu kontrol edilmeli
- **Yapılacak:** Standard Webhooks spec'ini implemente et

### 6. Embeddable Portal
- Rakiplerde müşteriler kendi dashboard'larına portal ekleyebiliyor
- **Bizde:** Yok — FEATURES.md'de "başlanmadı" olarak işaretli

### 7. FIFO Sıralama
- Svix'in en büyük rekabet avantajı
- Webhook'ların sırasıyla teslim edilmesi (örn: order.created → order.paid → order.shipped)
- **Bizde:** Yok

### 8. Endpoint Throttling
- Belirli endpoint'lere istek hızı sınırı
- Müşterilerin sunucularını korumak için kritik
- **Bizde:** Rate limiting var ama per-endpoint throttling yok

### 9. Payload Transformations
- Webhook verisini filtreleme, dönüştürme, zenginleştirme
- **Bizde:** FEATURES.md'de "başlanmadı"

### 10. SDK'lar — 11 Dil Destekleniyor
HookSniff 11 dilde SDK sunuyor (rakiplerin çoğundan fazla):
- ✅ Node.js
- ✅ Python
- ✅ Go
- ✅ Rust
- ✅ Ruby
- ✅ Java
- ✅ Kotlin
- ✅ PHP
- ✅ C#
- ✅ Elixir
- ✅ Swift

---

## 🟢 Düşük Seviye Eksiklikler

### 11. Webhook Replay UI
- Backend'de replay endpoint'i var ama UI'da eksik

### 12. Bulk Operations
- Toplu webhook gönderme, toplu replay

### 13. Event Schema Validation
- JSON Schema ile event doğrulama

### 14. Rate Limit Dashboard
- Backend'de rate limiting var ama UI'da gösterilmiyor

### 15. WebSocket Real-time Updates
- Dashboard'da canlı güncelleme yok

### 16. Self-Hosted Docker Image
- Tek komutla kurulabilir Docker image'ı yok

---

## 🔗 Faydalı GitHub Repoları

### Referans Olarak Kullanılacaklar

| Repo | Neden Faydalı | Lisans |
|------|---------------|--------|
| [svix/svix-webhooks](https://github.com/svix/svix-webhooks) | En olgun webhook platformu, Rust, MIT. Kod yapısı, retry logic, SDK tasarımı için referans | MIT |
| [hookdeck/outpost](https://github.com/hookdeck/outpost) | Go ile yazılmış, multi-tenant, Apache 2.0. Event destination mimarisi için referans | Apache 2.0 |
| [hook0/hook0](https://github.com/hook0/hook0) | Rust, self-hosted, müşteri portalı tasarımı için referans | SSPL v1 |
| [standard-webhooks/standard-webhooks](https://github.com/standard-webhooks/standard-webhooks) | Endüstri standardı, implementasyon gerekli. 10+ dilde referans kod | MIT |

### Direkt Kullanılabilecekler

| Repo | Ne İşe Yarar | Lisans |
|------|-------------|--------|
| [standard-webhooks/standard-webhooks/libraries/rust](https://github.com/standard-webhooks/standard-webhooks/tree/main/libraries/rust) | Rust webhook imza doğrulama kütüphanesi | MIT |
| [standard-webhooks/standard-webhooks/libraries/python](https://github.com/standard-webhooks/standard-webhooks/tree/main/libraries/python) | Python SDK için imza doğrulama | MIT |
| [standard-webhooks/standard-webhooks/libraries/go](https://github.com/standard-webhooks/standard-webhooks/tree/main/libraries/go) | Go SDK için imza doğrulama | MIT |
| [svix/svix-webhooks/go](https://github.com/svix/svix-webhooks/tree/main/go) | Go SDK referans implementasyonu | MIT |
| [svix/svix-webhooks/python](https://github.com/svix/svix-webhooks/tree/main/python) | Python SDK referans implementasyonu | MIT |

### İlham Alınacaklar

| Repo | Ne Öğrenebiliriz |
|------|-----------------|
| [temporalio/sdk-rust](https://github.com/temporalio/sdk-rust) | Temporal Rust SDK kullanımı |
| [Quickwit-oss/tantivy](https://github.com/Quickwit-oss/tantivy) | Rust full-text search (webhook log arama için) |
| [tokio-rs/axum](https://github.com/tokio-rs/axum) | Axum best practices |

---

## 🎯 Önerilen İsim Alternatifleri

hooksniff.vercel.app zaten var. Alternatifler:

| İsim | Domain Uygunluğu | Not |
|------|------------------|-----|
| **HookFire** | hookfire.dev/com | Kısa, akılda kalıcı |
| **WebhookHQ** | webhookhq.com | Profesyonel |
| **HookStream** | hookstream.dev | Modern |
| **EventPilot** | eventpilot.dev | Geniş kapsamlı |
| **HookDrop** | hookdrop.com | Basit, akılda kalıcı |
| **Pulsehook** | pulsehook.com | Enerjik |

---

## 📋 Öncelik Sıralaması (Yapılacaklar)

### Hafta 1: Temel
1. ✅ Domain al (alternatif isim seç)
2. ✅ ToS + Privacy Policy (GDPR uyumlu)
3. ✅ Local test, hataları düzelt
4. ✅ Standard Webhooks uyumluluğunu kontrol et

### Hafta 2-3: Ürün
5. Customer portal (multi-tenant)
6. Embeddable portal
7. Endpoint throttling
8. Payload transformations

### Hafta 4+: Büyüme
9. Production deploy (Oracle Cloud Free Tier / Railway)
10. Beta kullanıcı bul (Reddit, HN, ProductHunt)
11. SOC 2 sertifikası araştırması
12. Ek SDK'lar (Ruby, Java, PHP)

---

## 🏢 Rakip Şirketlerin İş Modelleri

### Svix — Kurumsal Dev
| Metrik | Değer |
|--------|-------|
| **Funding** | ~$17M (a16z, YC Continuity, Aleph) |
| **Müşteri segmenti** | Enterprise (Fortune 500) + Startup |
| **Ekip** | 15-25 kişi (Rust engineers, DevRel, Sales) |
| **Fiyat** | $490/ay başlangıç, enterprise custom |
| **Avantaj** | Brand recognition, Standard Webhooks standardı, SOC 2 + HIPAA + PCI-DSS |

### Hookdeck — Niş Oyuncu
| Metrik | Değer |
|--------|-------|
| **Funding** | ~$5.5M |
| **Müşteri segmenti** | Mid-market, DevOps ekipleri |
| **Fark** | Inbound webhook proxy (farklı pazar) |
| **Avantaj** | Outpost ile self-hosted hybrid, 8 destination türü |

### Hook0 — Bootstrapped EU
| Metrik | Değer |
|--------|-------|
| **Funding** | Kendi kendine yetiyor |
| **Müşteri segmenti** | EU startup'ları, self-hosted isteyenler |
| **Avantaj** | Tam açık kaynak, EU compliance, two-phase retry |

### Convoy (Kapandı)
- Open source tek başına iş modeli olmuyor
- Kurumsal destek olmadan sürdürülebilir değil
- **Ders:** Önce gelir, sonra open source

---

## 💡 Rakiplerden Öğreneceklerimiz

### Svix'ten
- **SDK tasarımı:** 10+ dilde tutarlı API — biz de aynı pattern'i izlemeliyiz
- **Standard Webhooks:** Endüstri standardı oluşturmuşlar, biz de uymalıyız
- **FIFO delivery:** Sıralı teslimat büyük avantaj
- **Portal:** Müşterilerin kendi webhook'larını yönetmesi kritik

### Hookdeck'ten
- **Outpost mimarisi:** Multi-tenant, 8 farklı destination türü
- **Backpressure:** Durable queue ile dayanıklılık
- **Self-hosted + managed hybrid:** Aynı kod tabanı, iki model

### Hook0'dan
- **EU data residency:** Avrupa pazarı için önemli
- **Basit fiyatlandırma:** Event-based pricing
- **Self-hosted kolaylığı:** Tek komutla kurulum

### Convoy'dan (Kapanmış)
- **Ders:** Open source tek başına yetmiyor, şirket desteği gerekli
- **Circuit breaking:** İyi bir feature, bizde de var (ai-center)
- **JavaScript transformations:** Payload dönüştürme gücü

---

> 💡 Bu dosya her güncelleme sonrası gözden geçirilmeli.
> Rakiplerin yeni özellikleri takip edilmeli.
