# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 05:02 GMT+8

---

## 🔴 ACİL — Servet'in Yapması Gereken

| Görev | Öncelik | Not |
|-------|---------|-----|
| GitHub PAT rotate | 🔴 ACİL | Eski token chat'te paylaşıldı |
| npm token rotate | 🔴 ACİL | Eski token paylaşıldı |
| GCP SA key rotate | 🔴 ACİL | Eski key paylaşıldı |
| Vercel token rotate | 🔴 ACİL | Bu oturumda paylaşıldı |
| Login test | 🔴 | Deploy sonrası dashboard'da dene |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |

---

## ✅ SON OTURUM (64) — TAM ÖZET (2026-05-10 04:13-05:02 GMT+8)

### Yeni Sayfalar (11 adet)
| Sayfa | İçerik |
|-------|--------|
| `/build-vs-buy` | 12 boyut, maliyet analizi, 6 FAQ |
| `/webhooks` | Hub: guides, glossary, providers, alternatives |
| `/webhooks/glossary` | 35+ webhook terimi |
| `/webhooks/guides` | 4 kategori rehber |
| `/providers` | Provider hub |
| `/providers/stripe` | Stripe setup, events, kod örneği |
| `/providers/github` | GitHub setup, events |
| `/providers/shopify` | Shopify setup, events |
| `/alternatives/svix-alternatives` | 4 servis karşılaştırma |
| `/alternatives/hookdeck-alternatives` | 5 servis + pros/cons |
| `/alternatives/convoy-alternatives` | 5 servis karşılaştırma |

### Compare Sayfası — Svix Seviyesi
- **TL;DR** — 5 anahtar takeaway
- **Screenshots** — 4 preview kartı (playground, compare, scorecard, build-vs-buy)
- **Scorecard** — 6 kategori, toplam puan (HookSniff: 50, Svix: 51, Hookdeck: 41, Hook0: 38)
- **20 detaylı section** — Her birinde: başlık, açıklama, bestFit, 4 servis, badge, winner
- **Sections:** Production Track Record, Uptime SLA, Pricing, SDKs, FIFO, CloudEvents, Schema Registry, Portal, Smart Routing, Transformations, Inbound Proxy, Streaming, Rate Limiting, Latency Alerts, Standard Webhooks, Compliance, Data Residency, Open Source, DX, Business Continuity
- **Sosyal kanıt** — 3 testimonial
- **8 FAQ** — HIPAA eksikliği dürüstçe belirtilmiş
- **Deep dive links** — 6 link
- **When to choose** — 4 kart
- **CTA** — Start for free

### Footer
- 4 sütun: Product, Compare (8 link), Resources (9 link), Company

### Rakip Analizi Düzeltmeleri
- Svix SDK 6→11, Stream/Ingest/Diom keşfedildi
- Svix compliance: HIPAA, PCI-DSS eklendi
- Hookdeck: MCP, Radar keşfedildi
- Hook0: MCP Server keşfedildi
- Convoy: GitHub 404, durdurulmuş
- API'deki gizli özellikler ortaya çıkarıldı (static IPs, streaming, routing, CLI, alerts)

### Bug Düzeltmeleri
- Server/client split (SEO metadata)
- Dead link /docs/examples
- Glossary quick nav 10→34
- Accessibility (aria-expanded, type=button)

### GitHub Push (8 commit)
- `2116baa` — feat: 10 new pages
- `ab38999` — fix: SEO metadata, dead links
- `d2b33e6` — fix: accessibility
- `3610697` — fix: accurate competitor data
- `8d1f57b` — fix: hidden features revealed
- `3f37367` — feat: compare page rewrite
- `4896823` — docs: hafıza dosyaları
- `cd5623d` — feat: screenshots + bestFit

### Toplam Etki
- 13+ dosya changed
- +1600 satır kod
- 83 locale route × 8 dil = 664+ static page
- Build: 0 error, 0 warning

---

## 🟡 YENİ OTURUMDA YAPILACAK

| # | Görev | Öncelik | Not |
|---|-------|---------|-----|
| 1 | **SOC 2 Type 2 audit** | 🔴 Kritik | Scorecard'ta 4 puan fark |
| 2 | Newsletter → DB taşıma | Yüksek | Neon PostgreSQL |
| 3 | Newsletter → double opt-in email | Yüksek | Gmail API |
| 4 | k6 load test | Orta | Gerçek trafik simülasyonu |
| 5 | Staging ortamı | Orta | GCP'de staging |
| 6 | OpenAPI spec doldurma | Orta | Mevcut spec boş |
| 7 | Terraform provider | Orta | Svix ve Hookdeck'te var |
| 8 | HIPAA compliance | Düşük | Dış denetim gerekli |

---

## ⚠️ Önemli Notlar

- **Oturumlar 1 saat** — planlı çalış, GitHub push sık yap
- **Hafıza GitHub'da kalıcı** — `.ai-context/`
- **Scorecard dürüst** — Svix 51, biz 50 (compliance farkı)
- **Compare sayfası tamam** — 20 section, screenshots, bestFit, TL;DR
- **API'de gizli özellikler var** — compare sayfasında artık gösteriliyor
