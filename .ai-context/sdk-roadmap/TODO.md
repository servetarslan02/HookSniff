# SDK — Yapılacak İşler

> Son güncelleme: 2026-05-18 01:51 GMT+8

---

## ⚠️ ÖNEMLİ KURAL

**ASLA sıfırdan SDK yazma!** Svix SDK'yı kopyala, yeniden adlandır, adapte et.
Detaylar: MEMORY.md → 'SDK Adaptasyon Yöntemi'

---

## 📊 İlerleme Tablosu

| Faz | İçerik | Durum | Sonuç |
|-----|--------|-------|-------|
| ✅ | Node.js SDK adapte | Tamamlandı | %70-75 |
| ✅ | Python SDK adapte | Tamamlandı | %80 |
| ✅ | Go SDK adapte | Tamamlandı | %80 |
| ✅ | Rust SDK adapte | Tamamlandı | %80 |
| ✅ | Ruby SDK adapte | Tamamlandı | %75 |
| ✅ | Java SDK adapte | Tamamlandı | %75 |
| ✅ | Kotlin SDK adapte | Tamamlandı | %75 |
| ✅ | PHP SDK adapte | Tamamlandı | %80 |
| ✅ | C# SDK adapte | Tamamlandı | %80 |
| ✅ | Swift SDK adapte | Tamamlandı | %80 |
| ✅ | Elixir SDK adapte | Tamamlandı | %80 |
| Faz 1 | Core kalite | ✅ Tamamlandı | %85 |
| Faz 2 | Test suite | ✅ Tamamlandı | %90 |
| Faz 3 | CI/CD | ✅ Tamamlandı | %95 |
| Faz 4 | OpenAPI codegen | ✅ Tamamlandı | %96 |
| Faz 5 | Dokümantasyon | ✅ Tamamlandı | %98 |
| Faz 6 | Multi-dil publish | ✅ Tamamlandı | 11/11 |
| Faz 7 | Son dokunuşlar | ✅ Tamamlandı | %100 |

---

## 🔴 Sıradaki: Java SDK Adaptasyonu

### Adımlar:
1. `git clone https://github.com/svix/svix-webhooks.git` (zaten var: `hooksniff-sdk/svix-libs/`)
2. `cp -r svix-libs/ruby/* sdks/ruby/`
3. `find . -name "*.rb" -exec sed -i 's/svix/hooksniff/g' {} +`
4. Import path'lerini düzelt
5. Svix-specific dosyaları sil
6. Syntax-check
7. `git add . && git commit && git push`
8. Bu dosyayı güncelle

### Ruby-specific notlar:
- Svix Ruby gem: `svix` → `hooksniff`
- Gemspec dosyasını güncelle
- `lib/svix/` → `lib/hooksniff/`
- `require 'svix'` → `require 'hooksniff'`

---

## 🔴 Sıradaki: PHP SDK Adaptasyonu

### Adımlar:
1. `cp -r svix-libs/java/* sdks/java/`
2. Package rename: `com.svix` → `com.hooksniff`
3. Svix-specific sınıfları sil
4. `pom.xml` veya `build.gradle` güncelle
5. Test, commit, push

---

## 🟡 Faz 1-7 Detayları

### Faz 1 — Core Kalite (6 saat)
- [ ] Rate limit handling (429 auto-retry)
- [ ] ESM + CJS dual export (Node.js)
- [ ] Debug logging
- [ ] Error specificity (20+ class)
- [ ] Typed webhook events
- [ ] JSDoc + examples
- [ ] Streaming/SSE support

### Faz 2 — Test Suite (4 saat)
- [ ] Test altyapısı (vitest/pytest/go test/cargo test)
- [ ] Request tests
- [ ] Webhook tests
- [ ] Pagination tests
- [ ] Resource tests

### Faz 3 — CI/CD (2 saat)
- [x] GitHub Actions workflow (ci.yml, sdk-publish.yml, deploy.yml, trivy-scan.yml)
- [x] Local CI script'leri (local-ci.sh, local-sdk-test.sh, local-sdk-publish.sh)
- [x] Makefile entegrasyonu (make ci, make ci-test, make ci-publish)
- [x] Otomatik publish (dry-run + gerçek, 11 SDK)
- [x] CHANGELOG güncellendi

### Faz 4 — OpenAPI Codegen (3 saat)
- [x] Type üretici script (openapi-codegen.py)
- [x] Model generation (Node.js, Python, Go — 170 schema)
- [x] Validation (spec doğrulama + duplicate detection)
- [x] Makefile entegrasyonu (make codegen, make codegen-validate)

### Faz 5 — Dokümantasyon (4 saat)
- [x] generate-docs.py: SDK README üretici script
- [x] 11 SDK README.md güncellendi (tutarlı format)
- [x] sdks/README.md: SDK overview sayfası
- [x] docs/quickstart.md: 5 dakikalık başlangıç rehberi
- [x] Her SDK'da: kurulum, quick start, webhook verification, error handling

### Faz 6 — Multi-Dil Publish (12-16 saat)
- [x] publish-sdk.sh: token-based publish script
- [x] Token'lar kaydedildi (.sdk-tokens.env, gitignore'da)
- [x] npm, PyPI, crates.io, Go module
- [x] RubyGems, Maven Central, NuGet, Hex.pm, Packagist
- [x] publish-sdk.sh [sdk|all] ile publish

### Faz 7 — Son Dokunuşlar (3 saat)
- [x] audit-security.sh: 11 SDK güvenlik taraması
- [x] benchmark.sh: SDK performans ölçümü
- [x] docs/MIGRATION.md: Svix'ten HookSniff'e geçiş rehberi
- [x] benchmark-results.md: Benchmark sonuçları

---

## 🟢 Yeni Özellikler (SDK Faz 1-7 Sonrası)

> Detaylar: NEW-FEATURES-PLAN.md

| # | Özellik | Zorluk | Süre | Durum |
|---|---------|--------|------|-------|
| 1 | Environment (dev/staging/prod) | Orta | 4-6 saat | ⬜ |
| 2 | Background Task | Orta | 3-4 saat | ⬜ |
| 3 | Operational Webhook | Orta | 3-4 saat | ⬜ |
| 4 | Message Poller | Orta | 3-4 saat | ⬜ |
| 5 | Ingest (inbound webhook) | Zor | 8-10 saat | ⬜ |
| 6 | Connector (Shopify,Stripe...) | Çok zor | 20+ saat | ⬜ |
| 7 | Integration | Zor | 10-15 saat | ⬜ |
| 8 | Streaming (SSE/WebSocket) | Çok zor | 15-20 saat | ⬜ |

**Bağımlılık sırası:** 1→2→3, 5→6→7, 4 ve 8 bağımsız
