# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-19 00:36 GMT+8 (Tüm SDK publish tamamlandı)
> Bu dosya GitHub'da kalıcıdır. Her oturum başı okunur, oturum sonunda güncellenir.

## 🎯 Sıradaki: Ne Yapalım?

SDK Faz 0-15 tamamlandı ✅. Tüm 11 SDK registry'de yüklü ✅.

### Seçenekler:

1. **Test Coverage Artırma** (2-3 saat)
   - Node.js: %60 → %90+
   - Python: %65 → %90+
   - Go: %70 → %90+

2. **Yeni Feature** — Servet'in isteğine göre

3. **Bug Fix / Polish** — Bilinen sorunlar varsa

## 📋 Hızlı Başlangıç

```powershell
# Repo güncelle
git pull origin main

# Hafıza oku
cat .ai-context/sdk-roadmap/MEMORY.md
cat .ai-context/sdk-roadmap/TODO.md

# Local CI
bash local-ci.sh

# SDK test
bash local-sdk-test.sh all

# OpenAPI codegen
python3 openapi-codegen.py all
```

## 🔑 Token'lar

`.sdk-tokens.env` dosyasında (gitignore'da):
- npm, PyPI, crates.io, RubyGems, NuGet, Hex, Packagist, Maven

## 📊 Mevcut Durum

- 11 SDK: v1.1.0/v1.2.0, tüm registry'lerde yüklü ✅
- Faz 8-15: Tamamlandı ✅
- Navigation Restructure: Tamamlandı ✅
- Test coverage: %60-70 (hedef: %90+)
- Benchmark: Tamamlandı
- Security audit: Tamamlandı (7 minor sorun)

## ⚠️ Bilinen Sorunlar

1. Test coverage düşük (%60-70)
2. Connector'lar eksik (Shopify, Stripe)
3. Streaming eksik (UI tarafı)
