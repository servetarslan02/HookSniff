# 2026-05-22 — Error Codes Refactor (Backend + Frontend)

## Özet
Backend hata mesajları kod bazlı sisteme geçirildi. Artık API `{ error: { code: "INVALID_CREDENTIALS" } }` döndürüyor. Frontend kod'a bakarak i18n mesaj seçiyor.

## Ne Değişti?

### Backend (Rust)
- `ErrorCode` enum eklendi (137 kod)
- `AppError::coded(ErrorCode::X)` yeni kullanım
- `AppError::BadRequest("mesaj")` → `AppError::coded(ErrorCode::INVALID_CREDENTIALS)`
- API response: `{ error: { code: "INVALID_CREDENTIALS" } }` (mesaj yok, sadece kod)
- 25 route dosyasında 137 değişiklik

### Frontend (TypeScript)
- `error-messages.ts`: code → i18n key mapping (direkt lookup, string matching yok)
- `api-errors.ts`: `HookSniffError` API'den kod çıkarır
- `useFriendlyToast`: `showError(errorCode)` ile i18n mesaj gösterir

## Değişen Dosyalar (29)
- `api/src/error.rs` — ErrorCode enum + AppError::coded
- `api/src/routes/*.rs` — 25 dosya, 137 BadRequest→coded değişikliği
- `dashboard/src/lib/error-messages.ts` — code-based mapping
- `dashboard/src/lib/api-errors.ts` — HookSniffError
- `dashboard/src/hooks/useFriendlyToast.ts` — showError hook

## Commit
`9755beff` — refactor(errors): structured error codes — backend + frontend
