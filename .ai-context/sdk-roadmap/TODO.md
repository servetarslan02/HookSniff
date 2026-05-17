# SDK — Yapılacak İşler

> Son güncelleme: 2026-05-18 01:10 GMT+8

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
| ⬜ | C# SDK adapte | Beklemede | — |
| ⬜ | Swift SDK adapte | Beklemede | — |
| ⬜ | Elixir SDK adapte | Beklemede | — |
| Faz 1 | Core kalite | ⬜ | %85 |
| Faz 2 | Test suite | ⬜ | %90 |
| Faz 3 | CI/CD | ⬜ | %92 |
| Faz 4 | OpenAPI codegen | ⬜ | %95 |
| Faz 5 | Dokümantasyon | ⬜ | %97 |
| Faz 6 | Multi-dil publish | ⬜ | 11/11 |
| Faz 7 | Son dokunuşlar | ⬜ | %100 |

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
- [ ] GitHub Actions workflow
- [ ] Otomatik publish
- [ ] CHANGELOG

### Faz 4 — OpenAPI Codegen (3 saat)
- [ ] Type üretici script
- [ ] Model generation
- [ ] Validation

### Faz 5 — Dokümantasyon (4 saat)
- [ ] Site kurulumu
- [ ] Quick start guides
- [ ] API reference
- [ ] Examples

### Faz 6 — Multi-Dil Publish (12-16 saat)
- [ ] npm, PyPI, crates.io, Go module
- [ ] RubyGems, Maven Central, NuGet, Hex.pm, Packagist

### Faz 7 — Son Dokunuşlar (3 saat)
- [ ] Tree-shaking
- [ ] Performance benchmark
- [ ] Security audit
- [ ] Migration guide
