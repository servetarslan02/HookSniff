# HookSniff — Yapılacaklar (26 Madde)

> Son güncelleme: 2026-05-08 06:36
> Kaynak: Servet'in görev listesi

---

## ✅ Tamamlandı (13/26)

| # | Görev | Durum |
|---|-------|-------|
| 2 | Free tier limit: 1,000 → 10,000 webhook/ay | ✅ |
| 3 | Playground UI | ✅ |
| 4 | Delivery Details UI | ✅ |
| 5 | Custom Retry Policy UI | ✅ |
| 6 | Signature Rotation UI | ✅ |
| 7 | Rate Limit Dashboard | ✅ |
| 8 | Customer Self-Service sayfası | ✅ |
| 9 | Standard Webhooks header'ları | ✅ |
| 10 | Event hierarchy filtering | ✅ |
| 11 | Timestamp tolerans docs | ✅ |
| 12 | Alerting test | ✅ |
| 13 | Health Monitoring test | ✅ |
| 14 | Grafana OTEL test | ✅ |

---

## ❌ Kalan (13/26)

### Acil — Servet Yapacak
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 1 | Render Docker build düzelt | ❌ | Dockerfile.api + Dockerfile.worker, OpenSSL-sys |

### Büyük Özellikler — AI Yapacak
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 15 | Embeddable Customer Portal | ❌ | portal/embed.js, iframe ile SaaS'lara webhook dashboard göster |
| 16 | CLI Tool tamamla | ❌ | cli/index.js kısmen hazır, bitir |
| 17 | Webhook Transformations | ❌ | payload dönüştürme (map, filter, enrich) modülü yaz |
| 18 | Self-Host kolaylaştır | ❌ | make self-host komutu + Helm chart + dokümantasyon |
| 19 | Webhook Analytics Dashboard | ❌ | mevcut stats'ı geliştir |
| 20 | Inbound Webhook Proxy | ❌ | webhook alma + yönlendirme modülü sıfırdan yaz |
| 21 | Bulk Operations | ❌ | toplu endpoint oluşturma/silme, toplu replay |
| 22 | WebSocket real-time updates | ❌ | dashboard'da canlı olay akışı |
| 23 | Event Schema Validation | ❌ | JSON Schema ile payload doğrulama |

### Enterprise
| # | Görev | Durum | Not |
|---|-------|-------|-----|
| 24 | Terraform Provider | ❌ | terraform-provider-hooksniff repo oluştur |
| 25 | Test coverage | ❌ | unit + integration test (her route için) |
| 26 | Paket adı reserve | ❌ | npm @hooksniff, PyPI hooksniff, crates.io hooksniff |

---

## Servet'in Blokları

| Görev | Not |
|-------|-----|
| Render Docker build | OpenSSL-sys derleme hatası |
| Resend domain doğrulama | DNS TXT + MX kayıtları |
| Domain kararı | eu.org ücretsiz vs .com $12/yıl |
| iyzico hesap | Vergi levhası + banka hesabı |
