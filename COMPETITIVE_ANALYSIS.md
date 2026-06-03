# HookSniff — Competitive Analysis

> Last updated: 2026-06-03

This document compares HookSniff with other webhook delivery platforms and identifies areas for improvement.

---

## Market Overview

The webhook delivery market is maturing in 2026. Major players exist, but gaps remain — especially in pricing, self-hosting flexibility, and developer experience.

## Competitor Comparison

| Feature | **Svix** | **Hookdeck** | **Hook0** | **Convoy** | **HookSniff** |
|---------|----------|-------------|-----------|------------|---------------|
| **Price** | $490/mo | $39/mo | €59/mo | Free (OSS) | $49/mo |
| **License** | MIT | Apache 2.0 (Outpost) | SSPL v1 | Elastic License v2.0 | MIT |
| **Language** | Rust | Go (Outpost) | Rust | Go | Rust |
| **Self-hosted** | ✅ | ✅ (Outpost) | ✅ | ✅ | ✅ |
| **FIFO ordering** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Endpoint throttling** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Multi-destination** | HTTP + Bridge | 8 types | HTTPS only | HTTP only | HTTP + WS + Email |
| **SOC 2 Type II** | ✅ | ✅ | ❌ | ❌ | ⏳ Planned |
| **HIPAA** | ✅ | ❌ | ❌ | ❌ | ⏳ Planned |
| **PCI-DSS** | ✅ | ❌ | ❌ | ❌ | ⏳ Planned |
| **GDPR** | ✅ | ✅ | ✅ (EU) | ❌ | ✅ |
| **SDK count** | 10+ | 3 | 2 | 3 | **11 (in development)** |
| **Customer portal** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **OpenTelemetry** | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Schema registry** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Inbound proxy** | ❌ | ❌ | ❌ | ❌ | ✅ (Stripe, GitHub, Shopify) |
| **Embeddable widget** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Standard Webhooks** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Smart routing** | ❌ | ✅ | ❌ | ❌ | ✅ (round-robin, failover) |
| **Cortex AI** | ❌ | ❌ | ❌ | ❌ | ✅ (ML anomaly detection) |

---

## HookSniff Advantages

1. **Most SDKs planned (11)** — More language coverage than any competitor (in development)
2. **Lowest price ($49/mo)** — 10x cheaper than Svix for comparable features
3. **FIFO ordering** — Only Svix also offers this; critical for event-sourced systems
4. **Endpoint throttling** — Protects customer servers; no competitor offers this
5. **Inbound webhook proxy** — Unique feature for receiving webhooks from Stripe, GitHub, Shopify
6. **Embeddable portal widget** — Unique customer-facing portal for dashboard embedding
7. **Cortex AI** — ML-powered anomaly detection and auto-healing; no competitor has this
8. **Smart routing** — Round-robin, failover, weighted strategies with fallback URLs
9. **Standard Webhooks compliant** — Industry-standard HMAC-SHA256 signing

## Areas for Improvement

### High Priority

| Area | Current State | Action Required |
|------|--------------|-----------------|
| SOC 2 Type II | Not started | Engage auditor, prepare evidence collection |
| GDPR compliance | ✅ Data export + deletion | Add DPA template, cookie consent |
| Uptime SLA | Not measured | Set up status page, define SLA targets |

### Medium Priority

| Area | Current State | Action Required |
|------|--------------|-----------------|
| Integration tests | Partial | Expand test coverage for all API routes |
| Documentation | Good | Add more SDK examples, migration guides |
| Performance benchmarks | k6 tests exist | Publish benchmark results |

### Low Priority

| Area | Current State | Action Required |
|------|--------------|-----------------|
| HIPAA compliance | Not started | Future for healthcare customers |
| PCI-DSS compliance | Not started | Future for payment processors |
| Terraform provider | Skeleton exists | Complete implementation |

---

## Reference Repositories

| Repository | Why It's Useful | License |
|-----------|-----------------|---------|
| [svix/svix-webhooks](https://github.com/svix/svix-webhooks) | Most mature webhook platform; Rust; code structure, retry logic, SDK design reference | MIT |
| [hookdeck/outpost](https://github.com/hookdeck/outpost) | Go, multi-tenant, Apache 2.0; event destination architecture reference | Apache 2.0 |
| [hook0/hook0](https://github.com/hook0/hook0) | Rust, self-hosted; customer portal design reference | SSPL v1 |
| [standard-webhooks/standard-webhooks](https://github.com/standard-webhooks/standard-webhooks) | Industry standard; implementation reference in 10+ languages | MIT |
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
- **Circuit breaking:** İyi bir feature, bizde de var (cortex/healing_engine)
- **JavaScript transformations:** Payload dönüştürme gücü

---

> 💡 Bu dosya her güncelleme sonrası gözden geçirilmeli.
> Rakiplerin yeni özellikleri takip edilmeli.
