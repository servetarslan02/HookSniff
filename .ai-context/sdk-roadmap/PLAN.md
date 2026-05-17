# SDK Strateji Planı — %100 Hedefi

> Son güncelleme: 2026-05-17 22:20 GMT+8
> Hedef: Stripe seviyesinde SDK kalitesi

---

## 🎯 Hedef Tanımı

**%100 = Stripe seviyesi.** Kullanıcı SDK'yı indirdiğinde:
- Type-safe, autocomplete çalışıyor
- Her method'da JSDoc + example kod
- Retry, rate limit, pagination otomatik
- Webhook verify tek satırda
- Hata durumunda açıklayıcı mesaj
- Test coverage %95+
- CI/CD otomatik publish
- Dokümantasyon interaktif

---

## 📐 Mimariler Arası Karşılaştırma

| Katman | Mevcut | %100 Hedef |
|--------|--------|------------|
| **Core** (request, retry, webhook) | ✅ Var | ✅ + rate limit + streaming |
| **Resources** (endpoint, webhook vs.) | ✅ 12 adet | ✅ + JSDoc + examples |
| **Models** (type'lar) | ⚠️ %80 typed | ✅ %100 typed (OpenAPI codegen) |
| **Test** | ❌ Yok | ✅ %95+ coverage |
| **CI/CD** | ❌ Yok | ✅ GitHub Actions |
| **Publish** | ⚠️ Manuel | ✅ Otomatik (tag → publish) |
| **Dokümantasyon** | ⚠️ README | ✅ Interaktif site |
| **ESM/CJS** | ⚠️ Sadece CJS | ✅ Dual export |
| **Debug** | ❌ Yok | ✅ Request/response logging |
| **Error handling** | ⚠️ Genel | ✅ 20+ spesifik error class |
| **Streaming** | ❌ Yok | ✅ SSE support |
| **Tree-shaking** | ❌ Yok | ✅ ESM modular import |

---

## 🗓️ Faz Planı

### Faz 1 — Core Kalite (6 saat)
> Mevcut SDK'yı production-ready yapar

| # | Görev | Süre | Puan |
|---|-------|------|------|
| 1.1 | Rate limit handling (429 auto-retry) | 30 dk | +5 |
| 1.2 | ESM + CJS dual export | 30 dk | +3 |
| 1.3 | Debug logging (request/response) | 30 dk | +2 |
| 1.4 | Error specificity (20+ class) | 30 dk | +3 |
| 1.5 | Typed webhook events | 1 saat | +3 |
| 1.6 | JSDoc + examples (12 resource) | 2 saat | +5 |
| 1.7 | Streaming/SSE support | 1 saat | +3 |
| **Faz 1 toplam** | | **6 saat** | **+24 puan** |

**Sonuç:** %70-75 → **~%85**

---

### Faz 2 — Test Suite (4 saat)
> En büyük puan artışı

| # | Görev | Süre | Puan |
|---|-------|------|------|
| 2.1 | Test altyapısı kur (vitest/jest) | 30 dk | — |
| 2.2 | request.ts test (retry, backoff, timeout, error) | 1 saat | +3 |
| 2.3 | webhook.ts test (verify, sign, invalid, expired) | 30 dk | +2 |
| 2.4 | pagination.ts test (single, multi, empty) | 30 dk | +1 |
| 2.5 | Resource test — endpoints, webhooks, auth | 1 saat | +2 |
| 2.6 | Resource test — teams, alerts, billing, analytics | 30 dk | +1 |
| 2.7 | Resource test — admin, search, notifications, health | 30 dk | +1 |
| **Faz 2 toplam** | | **4 saat** | **+10 puan** |

**Sonuç:** %85 → **~%90**

---

### Faz 3 — CI/CD + Publish Otomasyonu (2 saat)
> Otomatik build, test, publish

| # | Görev | Süre | Puan |
|---|-------|------|------|
| 3.1 | `.github/workflows/sdk-ci.yml` — her push'ta build+test | 30 dk | +1 |
| 3.2 | `.github/workflows/sdk-publish.yml` — tag'de publish | 30 dk | +1 |
| 3.3 | Otomatik CHANGELOG.md üretimi | 30 dk | +1 |
| 3.4 | npm publish otomasyonu (Node.js) | 30 dk | — |
| **Faz 3 toplam** | | **2 saat** | **+3 puan** |

**Sonuç:** %90 → **~%92**

---

### Faz 4 — OpenAPI Codegen (3 saat)
> Model'lerin %100 type-safe olması

| # | Görev | Süre | Puan |
|---|-------|------|------|
| 4.1 | OpenAPI spec'ten TypeScript type üretici script | 1 saat | +2 |
| 4.2 | Tüm model'leri codegen ile üret (80+ type) | 1 saat | +2 |
| 4.3 | Serializer/Deserializer ekle | 1 saat | +1 |
| **Faz 4 toplam** | | **3 saat** | **+5 puan** |

**Sonuç:** %92 → **~%95**

---

### Faz 5 — Dokümantasyon Sitesi (4 saat)
> Interaktif API reference + guides

| # | Görev | Süre | Puan |
|---|-------|------|------|
| 5.1 | Docusaurus/Nextra site kurulumu | 1 saat | — |
| 5.2 | Quick Start guide (her dil) | 1 saat | +1 |
| 5.3 | API Reference (OpenAPI spec'ten otomatik) | 1 saat | +1 |
| 5.4 | Example'lar (webhook send, verify, pagination) | 1 saat | +1 |
| **Faz 5 toplam** | | **4 saat** | **+3 puan** |

**Sonuç:** %95 → **~%97**

---

### Faz 6 — Multi-Dil Yayılımı (12-16 saat)
> Aynı kaliteyi diğer 10 SDK'ya uygula

| # | Görev | Süre | Not |
|---|-------|------|-----|
| 6.1 | Python SDK rewrite | 2-3 saat | Svix Python core'dan adapte |
| 6.2 | Go SDK rewrite | 2-3 saat | Svix Go core'dan adapte |
| 6.3 | Rust SDK rewrite | 2-3 saat | Svix Rust core'dan adapte |
| 6.4 | Kalan 7 SDK (Ruby, Java, Kotlin, PHP, C#, Swift, Elixir) | 6-8 saat | Her biri 1 saat |
| **Faz 6 toplam** | | **12-16 saat** | |

**Sonuç:** 1/11 → **11/11 SDK %95+**

---

### Faz 7 — Son Dokunuşlar (3 saat)
> %97 → %100

| # | Görev | Süre | Puan |
|---|-------|------|------|
| 7.1 | Tree-shaking optimizasyonu (ESM modular) | 1 saat | +1 |
| 7.2 | Performance benchmark (diğer SDK'larla karşılaştırma) | 30 dk | +0.5 |
| 7.3 | Security audit (npm audit, Snyk) | 30 dk | +0.5 |
| 7.4 | Migration guide (v0.4 → v0.5 breaking changes) | 30 dk | +0.5 |
| 7.5 | Interactive playground (webhook test tool) | 30 dk | +0.5 |
| **Faz 7 toplam** | | **3 saat** | **+3 puan** |

**Sonuç:** %97 → **%100**

---

## 📊 Toplam Zaman Çizelgesi

| Faz | İçerik | Süre | Sonuç |
|-----|--------|------|-------|
| Faz 1 | Core kalite | 6 saat | %85 |
| Faz 2 | Test suite | 4 saat | %90 |
| Faz 3 | CI/CD | 2 saat | %92 |
| Faz 4 | OpenAPI codegen | 3 saat | %95 |
| Faz 5 | Dokümantasyon | 4 saat | %97 |
| Faz 6 | Multi-dil (10 SDK) | 12-16 saat | 11/11 %95+ |
| Faz 7 | Son dokunuşlar | 3 saat | %100 |
| **TOPLAM** | | **34-38 saat** | **%100** |

---

## 📦 Publish Rehberi (Her Dil)

### 1. Node.js → npm
```bash
cd sdks/node
npm run build
npm publish --access public
# Gerekli: npm token (npmjs.com → Access Tokens)
# Versiyon: package.json → "version"
```

### 2. Python → PyPI
```bash
cd sdks/python
python3 -m build
python3 -m twine upload dist/*
# Gerekli: PyPI token (pypi.org → API tokens)
# Versiyon: pyproject.toml veya setup.cfg → version
```

### 3. Go → proxy.golang.org
```bash
cd sdks/go
git tag v0.5.0
git push origin v0.5.0
# Go module otomatik publish olur (tag push ile)
# Gerekli: GitHub repo public olmalı
# Versiyon: git tag
```

### 4. Rust → crates.io
```bash
cd sdks/rust
cargo publish
# Gerekli: crates.io token (crates.io → API Tokens)
# Versiyon: Cargo.toml → version
```

### 5. Ruby → RubyGems
```bash
cd sdks/ruby
gem build hooksniff.gemspec
gem push hooksniff-*.gem
# Gerekli: RubyGems API key
# Versiyon: lib/hooksniff/version.rb → VERSION
```

### 6. Java → Maven Central
```bash
cd sdks/java
./gradlew publish
# Gerekli: Maven Central token (sonatype.org)
# Gerekli: GPG key imzası
# Versiyon: build.gradle → version
# Not: En zor publish, ~24 saat sürebilir
```

### 7. Kotlin → Maven Central
```bash
cd sdks/kotlin
./gradlew publish
# Gerekli: Aynı Maven Central token + GPG key
# Versiyon: build.gradle.kts → version
```

### 8. PHP → Packagist
```bash
cd sdks/php
git tag v0.5.0
git push origin v0.5.0
# Packagist otomatik algılar (GitHub webhook)
# Gerekli: Packagist hesabı + GitHub webhook
# Versiyon: composer.json → version
```

### 9. C# → NuGet
```bash
cd sdks/csharp
dotnet pack -c Release
dotnet nuget push bin/Release/*.nupkg --api-key $NUGET_KEY --source https://api.nuget.org/v3/index.json
# Gerekli: NuGet API key
# Versiyon: .csproj → Version
```

### 10. Elixir → Hex.pm
```bash
cd sdks/elixir
mix hex.publish
# Gerekli: Hex.pm API key
# Versiyon: mix.exs → version
```

### 11. Swift → GitHub (SPM)
```bash
cd sdks/swift
git tag v0.5.0
git push origin v0.5.0
# Swift Package Manager GitHub'dan çeker
# Gerekli: GitHub repo public olmalı
# Versiyon: Package.swift + git tag
```

---

## 🔑 Registry Token'ları (Servet'in yapması gerekli)

| Registry | Token Konumu | Durum |
|----------|-------------|-------|
| npm | npmjs.com → Access Tokens | ⬜ Gerekli |
| PyPI | pypi.org → API Tokens | ⬜ Gerekli |
| crates.io | crates.io → API Tokens | ⬜ Gerekli |
| RubyGems | rubygems.org → API Keys | ⬜ Gerekli |
| Maven Central | sonatype.org | ⬜ Gerekli |
| NuGet | nuget.org → API Keys | ⬜ Gerekli |
| Hex.pm | hex.pm → API Keys | ⬜ Gerekli |
| Packagist | packagist.org → API Tokens | ⬜ Gerekli |

---

## 🤖 CI/CD Workflow

### `sdk-ci.yml` — Her push'ta
```yaml
name: SDK CI
on: [push, pull_request]
jobs:
  build-and-test:
    strategy:
      matrix:
        sdk: [node, python, go, rust]
    steps:
      - uses: actions/checkout@v4
      - name: Build
        run: cd sdks/${{ matrix.sdk }} && make build
      - name: Test
        run: cd sdks/${{ matrix.sdk }} && make test
```

### `sdk-publish.yml` — Tag'de
```yaml
name: SDK Publish
on:
  push:
    tags: ['v*']
jobs:
  publish:
    strategy:
      matrix:
        sdk: [node, python, go, rust]
    steps:
      - uses: actions/checkout@v4
      - name: Publish
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          PYPI_TOKEN: ${{ secrets.PYPI_TOKEN }}
          CARGO_TOKEN: ${{ secrets.CARGO_TOKEN }}
        run: cd sdks/${{ matrix.sdk }} && make publish
```

---

## ⚠️ Kurallar

1. **Onay almadan başlama** — Servet onay vermeden yeni SDK'ya geçme
2. **Her SDK sonrası commit + push** — GitHub'a sync et
3. **`.ai-context/sdk-roadmap/` güncelle** — STATUS.md, DONE.md, TODO.md
4. **Breaking change varsa haber ver** — Kullanıcı etkilenirse söyle
5. **Svix branding** — Public dosyalarda Svix adı geçmeyecek
6. **Versiyon tutarlılığı** — Tüm SDK'lar aynı versiyonda olmalı

---

## 📊 Başarı Kriterleri

| Kriter | Hedef | Ölçüm |
|--------|-------|-------|
| SDK kalitesi | %100 (her dil) | Tüm checklist tamam |
| Versiyon tutarlılığı | Tümü 0.5.0 | STATUS.md |
| Test coverage | %95+ | CI pipeline |
| Publish | 11/11 registry | STATUS.md |
| Kullanıcı DX | Stripe ile aynı | Code comparison |
| Dokümantasyon | Interaktif site | docs.hooksniff.com |
