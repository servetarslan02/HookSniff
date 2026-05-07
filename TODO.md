# HookSniff — Yapılacaklar (Birleştirilmiş)

> Son güncelleme: 2026-05-08
> Kaynaklar: FEATURES.md, MEMORY.md, rekabet analizi

---

## 🔴 Acil — Blocking

1. Render Docker build hatasını düzelt — API + Worker deploy olmuyor
2. Resend domain doğrulama — DNS TXT + MX kayıtları ekle

---

## Satılabilir Ürün — Hafta 1-2

3. Customer Self-Service sayfasını tamamla — backend kısmen hazır, frontend'i bitir
4. Webhook Playground UI güncelle — backend hazır (`routes/playground.rs`), frontend güncellemesi gerek
5. Delivery Attempt Details UI güncelle — backend hazır (`routes/delivery_details.rs`), frontend güncellemesi gerek
6. Custom Retry Policy UI ekle — backend hazır (retry_policy JSONB), dashboard'da ayar paneli yok
7. Signature Rotation UI ekle — backend var (old_signing_secret), dashboard'da buton yok
8. Rate Limit Dashboard ekle — backend var, UI yok

---

## Rekabet Avantajı — Hafta 3-4

9. Embeddable Customer Portal tamamla — `portal/embed.js` var ama başlanmamış, iframe ile SaaS'lara kendi müşterilerine webhook dashboard gösterme
10. CLI Tool'u tamamla — `cli/index.js` kısmen hazır, bitir
11. Webhook Alerting test et — backend + frontend hazır
12. Endpoint Health Monitoring test et — backend + frontend hazır
13. Standard Webhooks header'larını ekle — şu an `X-HookSniff-Signature` kullanıyorsun, Standard Webhooks spec'e tam uyum için `webhook-id`, `webhook-timestamp`, `webhook-signature` header'larını da ekle (veya mevcut formatı standard formata çevir: `v1,` prefix + base64)
14. Free tier limitini artır — şu an 1,000 webhook/ay, rakipler 10k+ veriyor. En az 10,000/ay yap
15. iyzico hesabını aç — Türk müşteriler için ödeme

---

## Fark Yaratma — Hafta 5-6

16. Webhook Transformations ekle — payload'ı teslimattan önce dönüştürme (map, filter, enrich)
17. Self-Hosted kurulumu kolaylaştır — docker-compose var ama tek komutla çalışan `make self-host` veya Helm chart hazırla, dokümantasyon yaz
18. Webhook Analytics Dashboard tamamla — backend ve frontend kısmen hazır, tamamla
19. Inbound Webhook Proxy ekle — şu an sadece outbound var. Hookdeck'in tek güçlü yanı bu. Webhook alma + yönlendirme desteği ile rakiplerden ayrış
20. Event type hierarchy filtering — `event_filter` sütunu var ama dot-notation hiyerarşik eşleşme destekleniyor mu? (örn: `user.*` ile `user.created` + `user.updated` hepsini yakala). Kontrol et, eksikse ekle
21. Timestamp toleransı (replay protection) — Standard Webhooks ±5dk tolerans öneriyor. Alıcı tarafında timestamp doğrulama rehberi/docs ekle

---

## Ek Özellikler

22. Bulk Operations — toplu endpoint oluşturma/silme, toplu replay
23. WebSocket real-time updates — dashboard'da canlı olay akışı (SSE veya WS)
24. Event Schema Validation — her event type için JSON Schema tanımlama ve gelen payload'ı doğrulama
25. Terraform Provider — IaC kullanıcıları için
26. Unit + integration test yaz — FEATURES.md'de her yerde "Test ❌"
27. Grafana OTEL test et — Grafana Cloud hesabı var ama doğrulanmamış

---

## Durum Takibi

| # | Görev | Durum |
|---|-------|-------|
| 1 | Render Docker build | ❌ |
| 2 | Resend domain | ❌ |
| 3 | Customer Self-Service | ⚠️ Kısmen |
| 4 | Playground UI | ⚠️ Backend hazır |
| 5 | Delivery Details UI | ⚠️ Backend hazır |
| 6 | Custom Retry Policy UI | ⚠️ Backend hazır |
| 7 | Signature Rotation UI | ⚠️ Backend hazır |
| 8 | Rate Limit Dashboard | ⚠️ Backend hazır |
| 9 | Embeddable Portal | ❌ |
| 10 | CLI Tool | ⚠️ Kısmen |
| 11 | Alerting test | ✅ Hazır |
| 12 | Health Monitoring test | ✅ Hazır |
| 13 | Standard Webhooks headers | ❌ |
| 14 | Free tier artır | ❌ |
| 15 | iyzico hesabı | ❌ |
| 16 | Transformations | ❌ |
| 17 | Self-Host kolaylaştırma | ⚠️ docker-compose var |
| 18 | Analytics Dashboard | ⚠️ Kısmen |
| 19 | Inbound Webhook Proxy | ❌ |
| 20 | Event hierarchy filtering | ❌ Kontrol et |
| 21 | Timestamp tolerans docs | ❌ |
| 22 | Bulk Operations | ❌ |
| 23 | WebSocket real-time | ❌ |
| 24 | Event Schema Validation | ❌ |
| 25 | Terraform Provider | ❌ |
| 26 | Test coverage | ❌ |
| 27 | Grafana OTEL test | ⚠️ Hesap var |
