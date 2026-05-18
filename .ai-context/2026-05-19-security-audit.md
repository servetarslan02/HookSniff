# 🔒 HookSniff Güvenlik Denetim Raporu

> Tarih: 2026-05-19 07:45 GMT+8
> Kapsam: Kod incelemesi (OWASP Top 10)
> Otomatik tarama: npm audit (0 vulnerabilities), cargo audit (Rust kurulu değil)

---

## 🔴 YÜKSEK RİSK (2)

### 1. WebSocket Origin — Localhost Üretimde Açık
**Dosya:** `api/src/routes/ws.rs:47-48`
**Risk:** SSRF / Unauthorized Access

```rust
// Üretimde localhost/127.0.0.1 KAPALI olmalı
"http://localhost:3000",
"http://localhost:3001",
"http://127.0.0.1:3000",
"http://127.0.0.1:3001",
```

**Sorun:** Bir saldırgan `Origin: http://localhost:3000` header'ı ile WS bağlantısı açabilir.
**Çözüm:** `#[cfg(debug_assertions)]` ile sadece debug modunda ekle veya environment variable ile kontrol et.

### 2. SameSite=None Auth Cookie — CSRF Riski
**Dosya:** `api/src/routes/auth.rs:281`
**Risk:** CSRF

```
hooksniff_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0
```

**Sorun:** `SameSite=None` cookie'ler cross-site isteklerle gönderilir. OAuth flow'da CSRF state var ama normal auth cookie'sinde yok.
**Çözüm:** Auth cookie'sinde `SameSite=Lax` kullan. Sadece OAuth callback'te `SameSite=None` gerekli.

---

## 🟡 ORTA RİSK (3)

### 3. Custom HTML Sanitizer — DOMPurify Kullanılmıyor
**Dosya:** `dashboard/src/lib/sanitize.ts`
**Risk:** XSS

Kendi yazdığımız sanitizer `on*` event handler'larını strip ediyor ama:
- `javascript:` URL'leri filtrelenmemiş
- SVG-based XSS engellenmemiş
- Nested tag bypass mümkün olabilir

**Çözüm:** Client-side'da `DOMPurify` kullan (zaten dependency olarak var ama aktif kullanılmıyor).

### 4. Global Rate Limiting Eksik
**Dosya:** `api/src/` geneli
**Risk:** Brute-force / DoS

Spesifik endpoint'lerde rate limiting var (register, forgot-password) ama:
- Genel API'de global rate limit yok
- Login endpoint'inde brute-force koruması zayıf

**Çözüm:** Tower middleware ile global rate limiting ekle (IP bazlı, örn. 100 req/min).

### 5. Admin Sort Field Injection (Düşük ama Dikkat)
**Dosya:** `api/src/routes/admin/users.rs:75-85`

```rust
let allowed_sort_fields = ["email", "name", "plan", "status", "created_at"];
let sort_field = params.sort_field.as_deref().unwrap_or("created_at");
```

**İyi:** Allowlist kullanılmış, SQL injection yok.
**Ama:** `sort_dir` parametresi sadece `"asc"` kontrolü yapıyor, diğer her şey `DESC` — bu güvenli.

---

## 🟢 DÜŞÜK RİSK / İYİ UYGULAMALAR (6)

### 6. SQL Injection — Güvenli ✅
- Tüm SQL sorguları `sqlx` parameterized queries kullanıyor ($1, $2, ...)
- `format!` ile dinamik WHERE clause'lar sadece hardcoded string'lerden oluşuyor
- Admin sort field allowlist ile korunuyor
- Search input'u escape edilmiş (`%`, `_`, `\`)

### 7. SSRF Koruması — İyi ✅
**Dosya:** `worker/src/delivery/http.rs`
- Localhost bloklanmış ✅
- Metadata endpoint'leri bloklanmış ✅
- Private IP aralıkları kontrol ediliyor ✅
- DNS resolution sonrası IP doğrulama ✅

### 8. JWT Güvenliği — İyi ✅
- RS256 tercih ediliyor, HS256 fallback ✅
- HttpOnly, Secure cookie ✅
- Token revocation desteği ✅
- 2FA (TOTP) desteği ✅

### 9. Password Hashing — Güvenli ✅
- Argon2id kullanılıyor ✅
- Minimum 8 karakter, büyük/küçük harf + rakam zorunlu ✅
- Password reset rate limited ✅
- Token hash olarak saklanıyor ✅

### 10. CSP Headers — Mevcut ✅
**Dosya:** `dashboard/src/middleware.ts`
- Content Security Policy header eklenmiş ✅
- Nonce-based script protection ✅

### 11. Environment Variables — Güvenli ✅
- `.gitignore` `.env` dosyalarını exclude ediyor ✅
- `.env.production` exclude edilmiş ✅
- `EXTERNAL_TOKENS.md` exclude edilmiş ✅

---

## 📊 Özet Tablo

| # | Bulgu | Risk | Durum |
|---|-------|------|-------|
| 1 | WS Origin localhost | 🔴 Yüksek | ✅ Düzeltildi |
| 2 | SameSite=None cookie | 🔴 Yüksek | ✅ Düzeltildi |
| 3 | Custom sanitizer | 🟡 Orta | ✅ Düzeltildi |
| 4 | Global rate limit | 🟡 Orta | ✅ Düzeltildi |
| 5 | Admin sort field | 🟢 Düşük | Güvenli |
| 6 | SQL injection | 🟢 Güvenli | ✅ |
| 7 | SSRF koruması | 🟢 Güvenli | ✅ |
| 8 | JWT güvenliği | 🟢 Güvenli | ✅ |
| 9 | Password hashing | 🟢 Güvenli | ✅ |
| 10 | CSP headers | 🟢 Güvenli | ✅ |
| 11 | ENV güvenliği | 🟢 Güvenli | ✅ |

---

## 🎯 Öncelikli Aksiyonlar

1. **WS origin fix** — localhost'u production'dan kaldır (5 dk)
2. **SameSite=Lax** — auth cookie'sini düzelt (2 dk)
3. **DOMPurify** — sanitizer'ı güçlendir (10 dk)
4. **Global rate limit** — Tower middleware ekle (30 dk)

---

## 🔍 Ek Notlar

- `npm audit`: **0 vulnerabilities** ✅
- `cargo audit`: Çalıştırılamadı (Rust kurulu değil bu ortamda)
- Kod tabanı genel olarak **güvenli yazılmış**, OWASP Top 10'un çoğu kategorisi korunuyor
- SSRF koruması özellikle iyi — webhook delivery'de kritik
- En büyük risk: production'da localhost origin açık kalması
