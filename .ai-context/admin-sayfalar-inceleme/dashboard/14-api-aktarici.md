# 📥 API İçe Aktarıcı (API Importer)

> Sayfa: `dashboard/src/app/[locale]/dashboard/api-importer/page.tsx`
> Route: `/dashboard/api-importer`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- SpecInputPanel — OpenAPI/Swagger spec girişi
- ParsedResultsPanel — Parse edilen endpoint'ler
- Desteklenen formatlar: OpenAPI 3.0, Swagger 2.0, URL

## Özellikler
- ✅ **Spec Yükleme** — JSON/YAML dosya veya URL
- ✅ **Endpoint Parse** — Otomatik endpoint çıkarma
- ✅ **Seçim** — Tekli/tüm endpoint seçimi (toggle)
- ✅ **Format Desteği** — OpenAPI 3.0, Swagger 2.0

## Tespit Edilen Durumlar
### ✅ İyi Yönler
- Bileşenlere ayrılmış yapı
- Toggle all seçeneği
- Format bilgi kartları

### 🔴 Eksiklikler
- Endpoint düzenleme (parse sonrası) yok
- Import sonrası webhook oluşturma yok
- Geçmiş import'lar yok
