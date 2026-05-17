# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-18 02:45 GMT+8 (Oturum — SDK Faz 3-7 tamamlandı)
> Bu dosya GitHub'da kalıcıdır. Her oturum başı okunur, oturum sonunda güncellenir.

## 🎯 Sıradaki: Yeni Özellikler (Faz 8-15)

SDK Faz 0-7 tamamlandı ✅. Şimdi yeni özelliklere geçiyoruz.

### Öncelik Sırası:

1. **Live Publish Test** (30 dk)
   - `./publish-sdk.sh node` ile npm'e yükle
   - npm'de görünüyor mu kontrol et
   - `pip install hooksniff` test et

2. **Test Coverage Artırma** (2-3 saat)
   - Node.js: %60 → %90+
   - Python: %65 → %90+
   - Go: %70 → %90+

3. **Faz 8 — Environment** (4-6 saat)
   - `environments` tablosu (dev/staging/prod)
   - `environment_variables` tablosu
   - Rust API: CRUD endpoint'leri
   - SDK güncellemesi (11 dil)
   - Dashboard UI

4. **Faz 9 — Background Task** (3-4 saat)
   - `background_tasks` tablosu
   - Rust API: List, get, cancel
   - Worker: Task execution

5. **Faz 10 — Operational Webhook** (3-4 saat)
   - `operational_webhook_endpoints` tablosu
   - CRUD + delivery log

6. **Faz 11-15** (sonra)
   - Message Poller, Ingest, Connector, Integration, Streaming

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

- 11 SDK: v1.0.0, Svix'ten adapte
- Kalite: %75-80 (Svix'e göre)
- Test coverage: %60-70
- Publish: Token hazır, live test yapılmadı
- Benchmark: Tamamlandı
- Security audit: Tamamlandı (7 minor sorun)
- Migration guide: Tamamlandı

## ⚠️ Bilinen Sorunlar

1. Test coverage düşük (%60-70)
2. Live publish test edilmedi
3. Connector'lar eksik (Shopify, Stripe)
4. Streaming eksik
5. Ingest eksik
