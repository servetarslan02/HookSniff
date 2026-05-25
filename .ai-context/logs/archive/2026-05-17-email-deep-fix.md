# 2026-05-17 — Admin Email Sayfası Derin Düzeltmeler

> Oturum: Yeni (Servet'in yeni AI session'ı)
> Commit: d848f821

## Yapılan İşler

### 16 Fix Uygulandı

**Backend (api/src/):**
1. `routes/admin.rs` — Bulk email `text` → `html` (Resend API doğru format)
2. `routes/admin.rs` — Manuel `reqwest::Client` → `EmailProvider` (her iki handler)
3. `routes/admin.rs` — `body_preview` UTF-8 panic fix: byte dilimi → `chars().take(200)`
4. `routes/admin.rs` — `deny_unknown_fields` kaldırıldı (SendEmailRequest + BulkEmailRequest)
5. `routes/admin.rs` — Rate limiting: tekli 20/dk, bulk 5/saat
6. `routes/admin.rs` — `EmailProvider::is_configured()` kontrolü
7. `routes/admin.rs` — Subject 500, body 100KB limit
8. `routes/contact.rs` — HTML injection (XSS) escape: `escape_html()` helper
9. `routes/contact.rs` — `validate_email()` kullanımı
10. `routes/contact.rs` — Subject 200 karakter limit
11. `routes/auth.rs` — `Language::from_accept_language()` ile dinamik dil algılama
12. `routes/auth.rs` — 4 handler güncellendi (register, resend_verify, forgot_password, verification)
13. `email.rs` — `Language::from_accept_language()` metodu eklendi
14. `email.rs` — `EmailProvider::is_configured()` metodu eklendi

**Frontend (dashboard/src/):**
15. `app/[locale]/admin/email/page.tsx` — Doğrulama modal'ı eklendi
16. `app/[locale]/admin/email/page.tsx` — `t('supported')` → `t('bulkEmailPlaceholders')`
17. `app/[locale]/admin/email/page.tsx` — Çift fallback kaldırıldı
18. `messages/en.json` — 18 yeni translation key
19. `messages/tr.json` — 18 yeni translation key

### Dosya Değişiklikleri
- `api/src/email.rs` — +15 satır (from_accept_language, is_configured)
- `api/src/routes/admin.rs` — ~80 satır değişti (EmailProvider, rate limit, validation)
- `api/src/routes/auth.rs` — ~30 satır değişti (dil algılama)
- `api/src/routes/contact.rs` — ~15 satır değişti (XSS, validation, limit)
- `dashboard/src/app/[locale]/admin/email/page.tsx` — tam yeniden yazıldı
- `dashboard/src/messages/en.json` — +18 key
- `dashboard/src/messages/tr.json` — +18 key

### Bulunan Sorunlar (Önceki Oturumlardan)
- ❌ Bulk email düz metin gönderiyordu (text vs html)
- ❌ Manuel reqwest::Client — retry logic yok
- ❌ body_preview Türkçe karakterde panic
- ❌ Contact form XSS açığı
- ❌ Tüm emailler Türkçe'ye sabitli
- ❌ Admin email endpoint'lerinde rate limiting yok
- ❌ EmailProvider::None sessizce email yutuyordu

### Kullanılmayan platform_settings Alanları
- `resend_api_key` — artık email handler'larında kullanılmıyor (EmailProvider env var'dan okuyor)
- `email_sender` — artık email handler'larında kullanılmıyor
- Bu alanlar settings CRUD'da duruyor (geriye uyumlu), ileride temizlenebilir
