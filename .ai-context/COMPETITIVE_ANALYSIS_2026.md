# 🪝 HookSniff vs Rakipler — Detaylı Karşılaştırma (2026)

> **Tarih:** 2026-05-09
> **Hazırlayan:** AI Asistan
> **Amaç:** Rekabet analizi — güçlü/zayıf yönler, stratejik pozisyon

---

## Rakip Tanımları

| Rakip | Ne Yapıyor | Funding | Dil |
|-------|-----------|---------|-----|
| **Svix** | Outbound webhook platform (pazar lideri) | ~$17M (a16z, YC) | Rust |
| **Hookdeck** | Inbound webhook proxy/gateway | ~$5.5M | Go |
| **Hook0** | Açık kaynak outbound webhook | Bootstrapped | Rust |
| **Hostedhooks** | Basit webhook servisi | Bilinmiyor | — |
| **HookSniff (Biz)** | Outbound + Inbound webhook | $0 (bireysel) | Rust |

---

## ✅ Bizim Daha İyi Olduğumuz Yerler

### 1. Fiyat — Açık Ara En Ucuz
| Rakip | Free Tier | Başlangıç Fiyatı |
|-------|-----------|-----------------|
| **Svix** | 50 msg/sn | **$490/ay** |
| **Hookdeck** | 10K event | **$39/ay** |
| **Hook0** | Cloud free | Self-hosted bedava |
| **Hostedhooks** | Sınırlı | Bilinmiyor |
| **HookSniff** | 10K webhook | **$49/ay** |

**Biz 10 kat daha ucuzuz.** Svix'in free tier'ı var ama profesyonel plan $490'dan başlıyor.

### 2. SDK Sayısı — 11 Dil (En Fazla)
| Rakip | SDK Sayısı | Diller |
|-------|-----------|--------|
| **Svix** | 10+ | Node, Python, Go, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift |
| **Hookdeck** | 4 | JS, Python, Go, Ruby |
| **Hook0** | 2 | JS, Rust |
| **Hostedhooks** | 1 | JS |
| **HookSniff** | **11** | Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift |

### 3. FIFO Sıralı Teslimat
| Rakip | FIFO |
|-------|------|
| **Svix** | ✅ Var |
| **Hookdeck** | ❌ Yok |
| **Hook0** | ❌ Yok |
| **Hostedhooks** | ❌ Yok |
| **HookSniff** | ✅ **Var** |

Sadece Svix'te var, Hookdeck ve Hook0'da yok. Bizde var.

### 4. Per-Endpoint Throttling
| Rakip | Throttling |
|-------|-----------|
| **Svix** | ✅ Var |
| **Hookdeck** | ❌ Yok |
| **Hook0** | ❌ Yok |
| **Hostedhooks** | ❌ Yok |
| **HookSniff** | ✅ **Var** (token bucket + sliding window) |

### 5. Inbound Webhook Proxy
| Rakip | Inbound Proxy |
|-------|--------------|
| **Svix** | ❌ (sadece outbound) |
| **Hookdeck** | ✅ (ana işi bu) |
| **Hook0** | ❌ |
| **Hostedhooks** | ❌ |
| **HookSniff** | ✅ **Var** (Stripe, GitHub, Shopify)** |

Biz hem outbound hem inbound yapıyoruz. Svix sadece outbound, Hookdeck sadece inbound. **İkisini birleştiren tek platformuz.**

### 6. Smart Routing
| Rakip | Smart Routing |
|-------|--------------|
| **Svix** | ❌ Yok |
| **Hookdeck** | ⚠️ Kısmen (routing rules) |
| **Hook0** | ❌ Yok |
| **Hostedhooks** | ❌ Yok |
| **HookSniff** | ✅ **Var** (round-robin, latency-based, failover)** |

### 7. Embeddable Portal Widget
| Rakip | Embeddable Widget |
|-------|------------------|
| **Svix** | ✅ Var (Svix Portal) |
| **Hookdeck** | ❌ Yok |
| **Hook0** | ❌ Yok |
| **Hostedhooks** | ❌ Yok |
| **HookSniff** | ✅ **Var** |

### 8. Schema Registry
| Rakip | Schema Registry |
|-------|----------------|
| **Svix** | ✅ Var |
| **Hookdeck** | ❌ Yok |
| **Hook0** | ❌ Yok |
| **Hostedhooks** | ❌ Yok |
| **HookSniff** | ✅ **Var** (JSON Schema + versioning) |

### 9. CloudEvents Desteği
| Rakip | CloudEvents |
|-------|------------|
| **Svix** | ❌ Yok |
| **Hookdeck** | ❌ Yok |
| **Hook0** | ❌ Yok |
| **Hostedhooks** | ❌ Yok |
| **HookSniff** | ✅ **Var** (v1.0) |

### 10. $0 Hosting Maliyeti
| Rakip | Hosting Maliyeti |
|-------|-----------------|
| **Svix** | $0 (managed) ama vendor lock-in |
| **Hookdeck** | $0 (managed) ama vendor lock-in |
| **Hook0** | $0 (self-hosted) ama kendi sunucun gerek |
| **Hostedhooks** | $0 (managed) |
| **HookSniff** | **$0** (GCP free tier + Neon + Upstash) |

---

## ❌ Rakiplerin Daha İyi Olduğu Yerler

### 1. Güvenilirlik & Güven — Svix
| Konu | Svix | Biz |
|------|------|-----|
| SOC 2 Type II | ✅ | ❌ |
| HIPAA | ✅ | ❌ |
| PCI-DSS | ✅ | ❌ |
| $17M yatırım | ✅ | ❌ |
| 15-25 kişilik ekip | ✅ | ❌ (1 kişi + AI) |
| Status page | ✅ status.svix.com | ❌ Yok |
| Uptime SLA | 99.99% | Ölçülmemiş |

**Bu Svix'in en büyük avantajı.** Kurumsal müşteriler bunu arar.

### 2. Inbound Webhook Uzmanlığı — Hookdeck
| Konu | Hookdeck | Biz |
|------|----------|-----|
| 8 destination türü | ✅ | ❌ (HTTP, WS, Email) |
| Backpressure / Durable queue | ✅ | ⚠️ Kısmen |
| Event routing rules | ✅ Gelişmiş | ⚠️ Basit |
| SOC 2 | ✅ | ❌ |

Hookdeck inbound'da daha olgun. Ama biz outbound + inbound birleştiriyoruz.

### 3. Tam Açık Kaynak — Hook0
| Konu | Hook0 | Biz |
|------|-------|-----|
| Self-hosted feature parity | ✅ Aynı özellikler | ⚠️ Bazı özellikler managed'da |
| Lisans | SSPL-1.0 | MIT |
| Community | Daha büyük | Küçük |
| Two-phase retry | ✅ (fast + slow + jitter) | ✅ (exponential backoff + jitter) |

Hook0 self-hosted'da daha güçlü. Ama SSPL lisansı kısıtlayıcı (managed service yapamazsın).

### 4. Basitlik — Hostedhooks
| Konu | Hostedhooks | Biz |
|------|------------|-----|
| Kurulum süresi | 2 dakika | 10 dakika |
| Karmaşıklık | Çok basit | Daha fazla feature = daha karmaşık |
| SDK | Sadece JS | 11 dil |

Hostedhooks "just works" prensibiyle çalışıyor. Basitlik isteyenler için iyi.

---

## 📊 Genel Karşılaştırma Matrisi

| Özellik | Svix | Hookdeck | Hook0 | Hostedhooks | **HookSniff** |
|---------|------|----------|-------|-------------|---------------|
| **Fiyat (başlangıç)** | $490/ay | $39/ay | $0 (self-host) | Düşük | **$49/ay** |
| **Free tier** | ✅ | ✅ | ✅ | ✅ | **✅** |
| **Self-hosted** | ⚠️ Open-core | ❌ | ✅ Full | ❌ | **✅** |
| **Open source** | ⚠️ Open-core | ❌ | ✅ SSPL | ❌ | **✅ MIT** |
| **Outbound webhook** | ✅ | ⚠️ | ✅ | ✅ | **✅** |
| **Inbound proxy** | ❌ | ✅ | ❌ | ❌ | **✅** |
| **FIFO** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **Throttling** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **Smart routing** | ❌ | ⚠️ | ❌ | ❌ | **✅** |
| **Schema registry** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **CloudEvents** | ❌ | ❌ | ❌ | ❌ | **✅** |
| **Embeddable widget** | ✅ | ❌ | ❌ | ❌ | **✅** |
| **SDK sayısı** | 10+ | 4 | 2 | 1 | **11** |
| **SOC 2** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **HIPAA** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **GDPR** | ✅ | ✅ | ✅ | ❌ | **✅** |
| **Uptime SLA** | 99.99% | ✅ | ❌ | ❌ | ❌ |
| **Status page** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Community** | Büyük | Orta | Orta | Küçük | **Küçük** |
| **Dil** | Rust | Go | Rust | — | **Rust** |

---

## 🎯 Sonuç

### Bizim Güçlü Yanlarımız (Fark Yaratan)
1. **Outbound + Inbound birleşik** — Svix outbound, Hookdeck inbound. İkisini yapan tek platformuz
2. **FIFO + Throttling + Smart Routing** — üçü birlikte sadece bizde
3. **11 SDK** — en fazla dil desteği
4. **$49/ay** — Svix'ten 10x ucuz
5. **CloudEvents + Schema Registry** — endüstri standardı desteği
6. **$0 hosting** — tamamen free tier'da çalışıyor

### Zayıf Yanlarımız (Kapanması Gereken)
1. **SOC 2 / HIPAA yok** — kurumsal müşteri kaybı
2. **Status page yok** — güven sinyali eksik
3. **Uptime SLA yok** — taahhüt veremiyoruz
4. **Community küçük** — 1 kişi + AI
5. **Olgunluk** — Svix milyarlarca webhook teslim etmiş, biz henüz başlangıçtayız

### Stratejik Pozisyon
> **HookSniff = Svix + Hookdeck birleşimi, 10x daha ucuz.**
> Kurumsal müşteri değil, startup'lar ve indie developer'lar hedef kitlen.

---

## Kaynakça

- Hook0 Comparison: https://documentation.hook0.com/comparisons
- Svix Pricing: https://www.svix.com/pricing/
- Hookdeck Pricing: https://hookdeck.com/pricing
- Hook0 Website: https://www.hook0.com/
- Svix Security: https://www.svix.com/security/
