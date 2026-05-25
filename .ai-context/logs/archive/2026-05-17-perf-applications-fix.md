# 2026-05-17 — Applications Sayfası Performans Düzeltmesi

## Sorun
`/applications` sayfası diğer sayfalara göre çok yavaş açılıyor, işlemler uzun sürüyordu.

## Tespit Edilen Sorunlar

### 1. API'de N+1 Sorgu Problemi (EN BÜYÜK)
- `list_applications`: Her uygulama için ayrı `SELECT COUNT(*) FROM endpoints` sorgusu
- 5 uygulama = 6 DB sorgusu, sırayla (her biri ~100-200ms)
- `get_application`: 2 ayrı sorgu
- `update_application`: 2 ayrı sorgu (update + count)

### 2. Frontend'de Bloklayıcı AuthGuard
- AuthGuard, token doğrulanana kadar tüm sayfayı blokluyordu
- Spinner gösteriliyor, hiçbir içerik render edilmiyordu
- `/auth/me` API çağrısı (0.4-0.9s) + applications veri çekme (0.5-1s) = ~1.5-2s bekleme

## Yapılan Düzeltmeler

### API (Rust)
- `list_applications`: LEFT JOIN ile tek sorguda endpoint count'ları alınıyor
- `get_application`: LEFT JOIN ile tek sorgu
- `update_application`: RETURNING clause içinde subquery ile tek sorgu
- Yeni struct: `ApplicationWithCount` (sqlx::FromRow ile)

### Frontend (TypeScript)
- AuthGuard: Token varsa çocukları hemen render et, doğrulama arka planda
- Sadece token yoksa VE loading bittiyse redirect göster

## Dosyalar
- `api/src/models/application.rs` — ApplicationWithCount struct eklendi
- `api/src/routes/applications.rs` — N+1 sorguları düzeltildi
- `dashboard/src/components/AuthGuard.tsx` — Non-blocking loading

## Beklenen Etki
- Applications sayfa yükleme: ~2s → ~0.5s
- Create/Edit/Delete sonrası yenileme: ~1s → ~0.3s
