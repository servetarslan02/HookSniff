# 2026-05-18 — Cloud Build Derleme Hatası Düzeltmesi

## Sorun
Cloud Build'de `build-api` adımında 4 derleme hatası (exit code 101):

```
error[E0599]: no variant or associated item named `Validation` found for enum `error::AppError`
```

### Etkilenen dosyalar
- `api/src/routes/integrations.rs` — 4 satır (298, 311, 365, 449)
- `api/src/routes/stream.rs` — 3 satır (298, 302, 638)

### Root Cause
`integrations.rs` ve `stream.rs` dosyalarında `AppError::Validation(...)` kullanılmış ama `error.rs`'de böyle bir variant tanımlı değildi.

## Yapılan Düzeltme
`api/src/error.rs` dosyasına:
1. `Validation(String)` variant'ı eklendi (enum'a)
2. `IntoResponse` match kolonu eklendi → 422 Unprocessable Entity + `VALIDATION_ERROR` kodu
3. Unit testler eklendi (`test_display_validation`, `test_into_response_validation`)

## Sonuç
- Build: ✅ SUCCESS (tüm 11 adım)
- API Health: ✅ healthy
- Database: ✅ 23ms
- Redis: ✅ bağlı
- Queue: ✅ 0 pending

## Dosyalar
- `api/src/error.rs` — Validation variant eklendi (+23 satır)
