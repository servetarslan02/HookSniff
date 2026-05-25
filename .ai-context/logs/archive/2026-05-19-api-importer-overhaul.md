# 2026-05-19 — API Spec İçe Aktarıcı Kapsamlı İnceleme + Düzeltme

## Yapılan İşler

### Tespit Edilen Sorunlar ve Düzeltmeleri

| # | Sorun | Öncelik | Düzeltme |
|---|-------|---------|----------|
| 1 | Parser sadece JSON destekliyor — YAML listede var ama parse edemiyor | 🔴 Bug | YAML parser eklendi (recursive descent) |
| 2 | Swagger 2.0 desteklenmiyor (host+basePath) | 🟡 Feature | Swagger 2.0 baseUrl hesaplama eklendi |
| 3 | Fetch butonunda loading yok | 🟡 UX | "Getiriliyor…" loading state eklendi |
| 4 | Parse butonunda loading yok | 🟡 UX | "Ayrıştırılıyor…" loading state eklendi |
| 5 | Temizleme butonu yok | 🟡 UX | "🗑️ Temizle" butonu eklendi |
| 6 | Klavye kısayolu yok | 🟢 UX | Ctrl/Cmd + Enter ile fetch/parse |
| 7 | YAML desteği açıklaması yok | 🟢 UX | Paste mode'da "JSON ve YAML destekler" ipucu |
| 8 | Test import yolu yanlış | 🔴 Bug | `[username]` → `(dashboard)` |
| 9 | Test'ler i18n key'leriyle uyumsuz | 🔴 Bug | 34 test güncellendi, tümü geçti |

### Parser İyileştirmeleri

- **YAML desteği**: Recursive descent parser — OpenAPI-shaped YAML dosyalarını parse edebilir
- **Swagger 2.0**: `host` + `basePath` + `schemes` alanlarından baseUrl oluşturur
- **HTTP yöntemleri**: `HEAD` ve `OPTIONS` eklendi
- **Sıralama**: Endpoint'ler path'a göre sıralanır
- **Doğrulama**: Content formatı parse öncesi kontrol edilir

### Eklenen i18n Anahtarları (EN + TR)

- `clearAll` — Temizle
- `fetching` — Getiriliyor…
- `parsing` — Ayrıştırılıyor…
- `toFetch` — ile getir
- `toParse` — ile ayrıştır
- `yamlSupported` — JSON ve YAML destekler

### Değişen Dosyalar

1. `api-importer/parser.ts` — +132 satır (YAML parser, Swagger 2.0)
2. `api-importer/components/SpecInputPanel.tsx` — +150/-50 (loading, clear, keyboard)
3. `api-importer/page.tsx` — 2 satır (null handling)
4. `api-importer-page.test.tsx` — 34 test, tümü geçti
5. `messages/en.json` — +8
6. `messages/tr.json` — +8

### Commit
- `9bcec388` — fix(api-importer): comprehensive overhaul — YAML support, UX improvements, test fixes
