# SDK — Yapılacak İşler

> Son güncelleme: 2026-05-17 22:06 GMT+8

---

## 🔴 Öncelik 1 — Kritik (hemen yapılmalı)

### 1. Node.js SDK npm Publish (0.5.0)
- [ ] `npm publish` ile yeni SDK'yı yayınla
- [ ] Eski 0.4.0 users → breaking change haberi
- [ ] README'de migration guide ekle
- **Süre:** 10 dakika
- **Engel:** Servet'in npm token'ı gerekli (veya GitHub Actions)

### 2. Node.js SDK Test Suite
- [ ] `request.ts` unit test (retry, backoff, timeout, error parsing)
- [ ] `webhook.ts` unit test (verify, sign, invalid signature, expired timestamp)
- [ ] `pagination.ts` unit test (single page, multi page, empty)
- [ ] `resources/*.ts` integration test (mock API ile)
- [ ] Coverage hedefi: %80+
- **Süre:** 2-3 saat
- **Referans:** Svix'in `webhook.test.ts`, `index.test.ts`

### 3. publish-sdks.sh Güncelle
- [ ] Eski Node.js publish fonksiyonunu yeni yapıya uyarla
- [ ] `sdks/node/src` → `sdks/node/dist` build akışı
- **Süre:** 30 dakika

---

## 🟡 Öncelik 2 — Önemli (1-2 gün içinde)

### 4. Python SDK Svix Tabanlı Yeniden Yazım
- [ ] Svix Python SDK'dan core al (request, webhook, pagination)
- [ ] HookSniff resource'larını oluştur
- [ ] PyPI publish (0.5.0)
- **Süre:** 2-3 saat
- **Referans:** `https://github.com/svix/svix-webhooks/python/`

### 5. Go SDK Svix Tabanlı Yeniden Yazım
- [ ] Svix Go SDK'dan core al
- [ ] HookSniff resource'larını oluştur
- [ ] Go module publish (v0.5.0)
- **Süre:** 2-3 saat
- **Referans:** `https://github.com/svix/svix-webhooks/go/`

### 6. Rust SDK Svix Tabanlı Yeniden Yazım
- [ ] Svix Rust SDK'dan core al
- [ ] HookSniff resource'larını oluştur
- [ ] crates.io publish (0.5.0)
- **Süre:** 2-3 saat
- **Referans:** `https://github.com/svix/svix-webhooks/rust/`

### 7. GitHub Actions CI/CD
- [ ] `.github/workflows/sdk-ci.yml` oluştur
- [ ] Build + Test + Lint her push'ta çalışsın
- [ ] Publish: tag atılınca otomatik publish
- **Süre:** 1 saat

---

## 🟢 Öncelik 3 — Nice to have (ileride)

### 8. Kalan 8 SDK Yeniden Yazım
- [ ] Ruby — Svix Ruby SDK'dan adapte
- [ ] Java — Svix Java SDK'dan adapte
- [ ] Kotlin — Svix Kotlin SDK'dan adapte
- [ ] PHP — Svix PHP SDK'dan adapte
- [ ] C# — Svix C# SDK'dan adapte
- [ ] Swift — Svix Swift SDK'dan adapte
- [ ] Elixir — Svix Elixir SDK'dan adapte
- **Süre:** Her biri 1-2 saat (toplam 2 gün)

### 9. Versiyon Senkronizasyonu
- [ ] Tüm SDK'ları 0.5.0'a eşitle
- [ ] CHANGELOG.md oluştur (her SDK için)
- [ ] Breaking change migration guide

### 10. Dokümantasyon
- [ ] docs.hooksniff.com/sdk adresi oluştur
- [ ] Her dil için Quick Start
- [ ] API Reference (OpenAPI spec'ten otomatik)
- [ ] Example'lar (webhook send, verify, pagination)

### 11. Publish Otomasyonu
- [ ] GitHub Actions: tag → build → test → publish (tüm diller)
- [ ] npm, PyPI, crates.io, Go, RubyGems, Maven Central, NuGet, Hex, Packagist
- [ ] Changelog otomatik üretim

### 12. Svix Parity Features
- [ ] Region auto-detection (token'dan)
- [ ] Webhook payload signing (server-side)
- [ ] Rate limit header parsing
- [ ] Request/response logging (debug mode)

---

## 📊 İlerleme Takibi

| Tarih | Yapılan | Kalite |
|-------|---------|--------|
| 2026-05-11 | 11 SDK auto-gen + publish | %20-25 |
| 2026-05-17 | Node.js SDK Yeniden rewrite | %70-75 |
| TBD | Python, Go, Rust rewrite | → %70-75 |
| TBD | Test suite + CI/CD | → %85+ |
| TBD | Dokümantasyon + examples | → %90+ |
