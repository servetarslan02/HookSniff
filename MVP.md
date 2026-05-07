# HookSniff — MVP Tanımı

> MVP = Satılabilir En Basit Ürün
> Müşteri girip kayıt oluyor → endpoint oluşturuyor → webhook gönderiyor → logları görüyor → retry ediyor → plan satın alıyor → hiçbir yerde "bu eksik" demiyor.

---

## MVP Checklist (~5 saat)

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | Free tier limit: 1,000 → 10,000/ay | 5dk | ✅ |
| 2 | Standard Webhooks header'ları ekle (`webhook-id`, `webhook-timestamp`, `webhook-signature`) | 45dk | ✅ |
| 3 | Playground UI tamamla | 20dk | ✅ |
| 4 | Delivery Details UI tamamla | 20dk | ✅ |
| 5 | Custom Retry Policy UI ekle | 25dk | ✅ |
| 6 | Signature Rotation UI ekle | 20dk | ✅ |
| 7 | Rate Limit Dashboard ekle | 20dk | ✅ |
| 8 | Customer Self-Service sayfası | 25dk | ✅ |
| 9 | Event hierarchy filtering kontrol/düzelt (`user.*` → `user.created`+`user.updated`) | 30dk | ✅ |
| 10 | Timestamp tolerans docs (±5dk replay protection) | 20dk | ✅ |
| 11 | Alerting test et | 15dk | ✅ |
| 12 | Health Monitoring test et | 15dk | ✅ |
| 13 | Grafana OTEL test et | 30dk | ✅ |

---

## Sonraki Versiyonlar (MVP sonrası)

### v1.1 — Rekabet Avantajı (~10 saat)
- Embeddable Customer Portal
- CLI Tool tamamla
- Inbound Webhook Proxy
- Webhook Transformations

### v1.2 — Fark Yaratma (~10 saat)
- Bulk Operations
- WebSocket real-time updates
- Event Schema Validation
- Self-Host kolaylaştırma (Helm chart)

### v1.3 — Enterprise Ready (~8 saat)
- Terraform Provider
- Test coverage (unit + integration)
- SOC 2 hazırlık

---

## Bloklar (Kullanıcı yapacak)

| Görev | Not |
|-------|-----|
| Render Docker build düzelt | Deploy erişimi gerekli |
| Resend domain doğrulama | DNS erişimi gerekli |
| Domain kararı (eu.org vs .com) | eu.org ücretsiz, .com $12/yıl |
| iyzico hesap aç | Vergi levhası + banka hesabı |

---

> Son güncelleme: 2026-05-08
