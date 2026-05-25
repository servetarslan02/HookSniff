# 2026-05-14 — Güvenlik Raporu Düzeltmeleri

## Kaynak
- Servet'in paylaştığı "HookSniff Güvenlik Sızma Testi Raporu" (Matrix Agent tarafından hazırlanmış)
- 11 bulgu tespit edildi, 9'u doğrulandı, 2'si hatalı/eksik çıktı

## Yapılan Düzeltmeler (commit d8f27c15)

### KRİTİK
1. **#1, #3, #10 — /health endpoint veri sızıntısı**
   - `api/src/routes/health.rs`: `version`, `uptime_seconds`, `otel` bloğu kaldırıldı
   - Artık sadece `status` ve `checks` döndürüyor

2. **#2 — /metrics Prometheus auth**
   - `api/src/metrics.rs`: `METRICS_SECRET` env var set ise Bearer token zorunlu
   - Query param `?token=` desteği eklendi (Prometheus scraper'lar için)
   - Dev ortamda METRICS_SECRET yoksa erişim serbest (geriye uyumluluk)

### YÜKSEK
3. **#5 — API güvenlik başlıkları**
   - `api/src/middleware/mod.rs`: `security_headers_middleware` eklendi
   - X-Content-Type-Options, X-Frame-Options, HSTS, Referrer-Policy, Cache-Control, X-XSS-Protection
   - `api/src/main.rs`: middleware router'a eklendi

4. **#4 — CSP unsafe-inline → nonce**
   - `dashboard/src/middleware.ts`: script-src `'unsafe-inline'` → `'nonce-{random}' 'strict-dynamic'`
   - style-src hala `'unsafe-inline'` (Tailwind CSS gerektiriyor)

### ORTA
5. **#7 — /.env erişim engeli**
   - `dashboard/src/middleware.ts`: .env, .git, .bak gibi dosya uzantılarına 404 döndürüyor

6. **#8 — robots.txt temizliği**
   - Deploy trigger yorum satırı kaldırıldı

7. **#9 — İmza header standardizasyonu**
   - Backend: `webhook-signature` (Standard Webhooks) birinci öncelik olarak eklendi
   - Docs: quickstart, sdk-libraries sayfalarında `X-HookSniff-Signature` → `webhook-signature`
   - Playground: güncellendi

### DÜŞÜK
8. **#11 — /v1/outbound-ips auth**
   - `api/src/routes/mod.rs`: protected router'a taşındı (auth middleware artık zorunlu)

## Hatalı Bulgular (Düzeltilmedi)
- **#6** — signing_secret API yanıtında ifşa: YANLIŞ. `EndpointResponse` struct'ında secret yok, sadece rotation endpoint'inde bir kez gösteriliyor (standart davranış)
- **#10** — robots.txt'te versiyon: YANLIŞ. Sadece deploy timestamp vardı, versiyon yoktu

## Dikkat Edilecekler
- Cargo kurulu olmadığı için API değişiklikleri compile edilemedi — Vercel deploy'da Cloud Build kontrol edecek
- CSP nonce tam propagation için Next.js bileşenlerinde nonce attribute kullanımı gerekebilir
- METRICS_SECRET env var Cloud Run'da ayarlanmalı
