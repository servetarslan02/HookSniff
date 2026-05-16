# 2026-05-17 — Güvenlik + Forgot Password (Oturum 180)

## Yapılan İşler

### 1. Güvenlik Denetimi ✅
4 kalan P0 güvenlik maddesi incelendi — hepsi zaten çözülmüş:
- **HS-038f (Timing attack)**: Login'de dummy hash ile timing normalize edilmiş ✅
- **HS-038g (serde_json hata)**: error.rs'de generic mesaj döndürüyor ✅
- **HS-038h (Email enumeration)**: Register'da aynı mesaj dönüyor ✅
- **HS-038j (unwrap panic)**: rate_limit.rs'de safe insert_header fonksiyonu ✅

### 2. Şifremi Unuttum — Frontend ✅
Backend zaten hazırdı (`/v1/auth/forgot-password`, `/v1/auth/reset-password`), frontend UI eklendi:

- **`/forgot-password` sayfası** — Email formu → API'ye istek gönderir
- **`/reset-password` sayfası** — URL'den token alır → yeni şifre formu → API'ye gönderir
- **Login sayfasına "Şifreni mi unuttun?" linki** eklendi
- **Password strength indicator** reset sayfasında
- **22 yeni çeviri key'i** (en + tr)

### Değişen Dosyalar (5)
1. `dashboard/src/app/[locale]/forgot-password/page.tsx` — YENİ (132 satır)
2. `dashboard/src/app/[locale]/reset-password/page.tsx` — YENİ (206 satır)
3. `dashboard/src/app/[locale]/login/content.tsx` — +7 satır (forgot password linki)
4. `dashboard/src/messages/en.json` — +26 satır (yeni key'ler)
5. `dashboard/src/messages/tr.json` — +24 satır (yeni key'ler)

## Commit
- `b0d23301` — feat: add forgot password + reset password UI

## Not
- Vercel otomatik deploy tetiklenmeli (push → deploy)
- `/forgot-password` ve `/reset-password` middleware.ts'de zaten whitelist'te
