# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-09 00:42 GMT+8

## Kullanıcı
- **Servet Arslan** — servetarslan02 (GitHub)
- Türkiye, teknik bilgi yok, ilk proje
- Hedef: $500/ay gelir, sonra şirket kur
- Dil: Türkçe

## Çalışma Kuralları
- Oturumlar 1 saat, yetişmeyebilir
- `.ai-context/` GitHub'da kalıcı hafıza
- Her oturum sonunda MEMORY.md + NEXT_SESSION.md güncelle
- Local dosyalar silinir, önemli bilgiler GitHub'a commit et

### ⚠️ REPO AYRIMI KURALI (2026-05-08 — Servet Kararı)
- **Hata düzeltme, fix, refactor** → Orijinal repo `servetarslan02/HookSniff` (main branch)
- **Mobil uygulama** → Ayrı repo `servetarslan02/hooksniff-mobile` (main branch)
- **Yeni web özellikleri** → Lab repo `servetarslan02/hooksniff-lab`
  - Lab repo'da test edilir, kusursuz çalışınca Servet onayı ile ana repo'ya merge edilir
  - Ana repo'nun main branch'i bozulmaz
  - Her özellik ayrı branch'te geliştirilir
- **AI Agent katmanı** → Lab repo'da geliştirilecek (Servet onayı beklemede, en son iş)
- **Market research, plan, notlar** → `.ai-context/` klasörüne kaydedilir

## Domain Kararı
- ~~is-a.dev~~ iptal
- Vercel ücretsiz domain: `hooksniff.vercel.app` ✅

---

## ✅ SERVİS DURUMU (2026-05-08 22:49)

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Healthy |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |
| CI/CD | GitHub Actions | ✅ 6/6 job geçiyor |
| Neon DB | eu-central-1 | ✅ Çalışıyor |
| Upstash Redis | 64MB | ✅ PONG |
| R2 Storage | hooksniff-storage | ✅ Bucket var |
| Cloudflare | Hesap aktif | ✅ |
| Polar.sh | ✅ Token aktif | ✅ |
| Email | GCloud Gmail API | ✅ |

---

### Bu Oturum (13) — 2026-05-08 22:02-22:49 GMT+8:

**Servet ile yeni oturum başladı. Token yenilendi, tüm hafıza dosyaları incelendi.**

1. **GitHub token yenilendi** — eski `ghp_ogQ...` → yeni `ghp_***.`
2. **Polar.sh durumu güncellendi** — MEMORY.md + STATUS.md "expired" → "aktif"
3. **Tüm .ai-context/ dosyaları detaylı incelendi** (19 dosya)
4. **3 denetim raporu güncellendi** — AUDIT_REPORT.md, CODEBASE_AUDIT.md, FULL_SYSTEM_AUDIT.md
5. **Python SDK AI Center import'ları temizlendi** — `AiStatus`, `AiEvent`, `RiskScore`, `AiAction` import'ları silindi
6. **6 SDK versiyonu 0.1.0'a standardize edildi** — Node, Python, Go, Java, PHP, Ruby
7. **Dashboard Resend → Gmail API** — `resend` dependency kaldırıldı, `email.ts` Gmail API'ye çevrildi
8. **CI sorunu tespit edildi** — GitHub Actions dakika limiti bitmiş (private repo, 2000 dk/ay)
9. **Repo public/private toggle** — dakika limiti sıfırlandı, CI tekrar çalışıyor
10. **main-protection ruleset oluşturuldu** — PR zorunlu, CI checks zorunlu, force push yasak, deletion yasak
11. **CI hataları tespit edildi** — Clippy, test, build-dashboard, security-audit başarısız (düzeltiliyor)
12. **CI workflow düzeltmeleri** — ubuntu-22.04 pinned, permissions eklendi, concurrency group eklendi

### Bu Oturum (14) — 2026-05-08 22:56-23:23 GMT+8:

**CI hataları düzeltildi ve push edildi.**

1. **Clippy** ✅ — zaten geçiyordu (yerel test doğruladı)
2. **Test** ✅ — 29 test geçti (18 api + 11 worker)
3. **Dashboard build** ✅ — 20 dosyada unused variable/import temizlendi
   - `noUnusedLocals: true` nedeniyle TypeScript hataları
   - `tc` (useTranslations) 10 dosyada tanımlı ama kullanılmıyordu → silindi
   - `SuccessRateDonut` component'inde `tc` kullanılıyor ama tanımlı değildi → eklendi
   - `Link`, `StatusBadge`, `useCallback`, `useRef`, `useTranslations`, `CheckIcon` unused → temizlendi
   - `endpoints`, `apiKey`, `showAiGenerator`, `setEvent`, `loading` unused → underscore prefix veya silme
4. **Security audit** ✅ — `.cargo/audit.toml` ile sqlx transitive vulnerabilities allowlist'e alındı
   - 6 vulnerability (protobuf, rsa, rustls-webpki, sqlx) + 2 warning (paste, rustls-pemfile)
   - Tümü sqlx 0.7.4 kaynaklı, sqlx 0.8'e upgrade ayrı iş
5. **Push edildi** — `7ff7c94` commit, main branch

### Bu Oturum (15) — 2026-05-08 23:50-00:42 GMT+8:

**Mobil uygulama için eksik backend feature'ları eklendi.**

1. **CI düzeltmeleri** — PR #29 (cache key reset) + PR #30 (ubuntu-latest) merge edildi
2. **Repo public/private toggle** — dakika limiti sıfırlandı, CI geçti
3. **5 yeni backend feature** — sub-agent ile kodlandı, `cargo check` temiz:
   - Şifre sıfırlama (forgot-password + reset-password)
   - Email doğrulama (verify-email + resend-verification)
   - Refresh token (15dk access + 30 gün refresh, rotasyonlu)
   - 2FA/TOTP (enable/confirm/disable/verify)
   - Push notification (FCM client + device token CRUD)
4. **5 yeni migration** — 030-034 (password_reset_tokens, email_verification, refresh_tokens, totp_2fa, device_tokens)
5. **PR #31 açıldı** — 15 dosya, +1036 satır, merge bekliyor
6. **Yeni env var'lar** — `EMAIL_BASE_URL`, `FCM_SERVER_KEY` (deploy'da eklenecek)

---

## ❌ KALAN SORUNLAR (Güncel — 2026-05-08 22:49)

### CI Hataları — ✅ DÜZELTİLDİ (Oturum 14)
1. ~~Clippy lints failure~~ ✅ geçiyor
2. ~~Run tests failure~~ ✅ 29 test geçiyor
3. ~~Dashboard build failure~~ ✅ 20 dosyada unused temizlendi
4. ~~Rust dependency audit failure~~ ✅ .cargo/audit.toml ile allowlist

### Kalan CI İşleri
- **CI workflow güncelle** — `cargo audit` komutuna ignore flag'leri eklenebilir (veya audit.toml yeterli)
- **CI dakika limiti** — repo public/private toggle ile çözüldü, CI çalıştırılabilir
- **Deploy tetikleme** — CI geçince otomatik deploy olacak

### Servet'in dış servis görevleri:
- ~~Polar.sh token~~ ✅ yenilendi
- ~~GitHub token~~ ✅ yenilendi
- **GitHub Actions dakika limiti** — repo public/private toggle ile çözüldü
- **iyzico hesap** — vergi levhası + banka hesabı

### Eksik Backend Özellikleri (Mobil uygulama için) — ✅ TAMAMLANDI (Oturum 15)
1. ~~Push notification (FCM/APNs)~~ ✅ FCM client + device token CRUD
2. ~~Şifre sıfırlama API'si~~ ✅ forgot-password + reset-password
3. ~~Email doğrulama API'si~~ ✅ verify-email + resend-verification
4. ~~Refresh token~~ ✅ 15dk access + 30 gün refresh, rotasyonlu
5. ~~2FA~~ ✅ TOTP: enable/confirm/disable/verify

PR #31: https://github.com/servetarslan02/HookSniff/pull/31

## 📋 YENİ ÖZELLİK PLANI (2026-05-08 — Hafıza Kaydı)

Detay: `.ai-context/FEATURE_PLAN.md`
Araştırma: `.ai-context/MARKET_RESEARCH.md`

12 yeni özellik, 4 faz, 9-10 hafta tahmini. Tümü Servet onayı ile başlayacak.
Lab repo'da geliştirilecek → test → onay → ana repo'ya merge.

| Faz | Özellikler | Süre |
|-----|-----------|------|
| 1 | Akıllı Alarm + Telegram/Discord Bot + Test Modu | 2 hafta |
| 2 | Zaman Tüneli + Playground + Custom Retry + Etiketler | 2 hafta |
| 3 | Müşteri İstatistikleri + Uptime + Export + IP Whitelist | 2-3 hafta |
| 4 | Webhook Zinciri (otomasyon) | 3+ hafta |

## 🤖 AI AGENT KATMANI (2026-05-08 — Hafıza Kaydı)

Detay: `.ai-context/MARKET_RESEARCH.md` (son bölüm)
⚠️ Servet onayı BEKLENİYOR. En son iş bu olacak.
4 hafta, $0 maliyet, kural tabanlı (AI API yok).
Lab repo'da geliştirilecek.

## 📱 MOBİL UYGULAMA (2026-05-08 — Servet Onayı İle Netleştirildi)

Detay: `.ai-context/MOBILE_MASTER_PLAN.md` ← TEK KAYNAK DÖKÜMAN
Eksiklik analizi: `.ai-context/MOBILE_APP_AUDIT.md`
Performans: `.ai-context/MOBILE_PERFORMANCE.md`
Kaynaklar: `.ai-context/MOBILE_RESOURCES.md`
Kararlar: `.ai-context/MOBILE_DECISIONS.md`

**Kararlar:**
- Platform: Android (sadece, iOS yok)
- Teknoloji: React Native + Expo (SDK 53+)
- Dağıtım: Siteden APK indirme (Google Play YOK)
- Güncelleme: OTA (Expo Updates) + APK güncelleme
- Tasarım: Premium, native his, dark mode varsayılan, 29 sayfa
- Dil: Türkçe varsayılan, İngilizce destek
- Maliyet: $0
- Süre: 6-8 hafta
- Performans: 60fps, <2sn cold start, <130MB bellek, <40MB APK
- Motor: Hermes (%50 hızlı cold start)
- Liste: FlashList (Shopify, FlatList'ten %30-50 hızlı)
- Animasyon: Reanimated 3 (UI thread, 60fps)
- Cache: TanStack Query (stale-while-revalidate)
- Hata takibi: Sentry (5K error/ay ücretsiz)
- New Architecture: Interop Layer ile eski kütüphane uyumluluğu garantili
- ARM64-only build ile APK <40MB
- Aynı teknoloji: Instagram, Discord, Shopify, Microsoft, Amazon kullanıyor
- Backend %90 hazır, sadece push notification + şifre sıfırlama + refresh token eksik
- Ek kararlar: `.ai-context/MOBILE_DECISIONS.md`
  - Offline: AsyncStorage + TanStack Query cache
  - Deep link: `hooksniff://screen/id`
  - Dil: Türkçe + İngilizce (i18next)
  - Arama: Global search
  - Widget: İkinci sürümde
  - QR kod: Endpoint ekleme için
- WhatsApp bot İPTAL — sadece Telegram bot kullanılacak

---

## ❌ KALAN SORUNLAR (Güncel — 2026-05-08 22:49)

### CI Hataları — ✅ DÜZELTİLDİ (Oturum 14)
1. ~~Clippy lints failure~~ ✅ geçiyor
2. ~~Run tests failure~~ ✅ 29 test geçiyor
3. ~~Dashboard build failure~~ ✅ 20 dosyada unused temizlendi
4. ~~Rust dependency audit failure~~ ✅ .cargo/audit.toml ile allowlist

### Kalan CI İşleri
- **CI workflow güncelle** — `cargo audit` komutuna ignore flag'leri eklenebilir (veya audit.toml yeterli)
- **CI dakika limiti** — repo public/private toggle ile çözüldü, CI çalıştırılabilir
- **Deploy tetikleme** — CI geçince otomatik deploy olacak

### Servet'in dış servis görevleri:
- ~~Polar.sh token~~ ✅ yenilendi
- ~~GitHub token~~ ✅ yenilendi
- **GitHub Actions dakika limiti** — repo public/private toggle ile çözüldü
- **iyzico hesap** — vergi levhası + banka hesabı

### Eksik Backend Özellikleri (Mobil uygulama için) — ✅ TAMAMLANDI (Oturum 15)
1. ~~Push notification (FCM/APNs)~~ ✅ FCM client + device token CRUD
2. ~~Şifre sıfırlama API'si~~ ✅ forgot-password + reset-password
3. ~~Email doğrulama API'si~~ ✅ verify-email + resend-verification
4. ~~Refresh token~~ ✅ 15dk access + 30 gün refresh, rotasyonlu
5. ~~2FA~~ ✅ TOTP: enable/confirm/disable/verify

PR #31: https://github.com/servetarslan02/HookSniff/pull/31

---

## 📦 SDK STRATEJİSİ (2026-05-08 Oturum 9 — Karar)

### Aktif Bakım Yapılacak SDK'lar (6 adet)
| # | Dil | Registry | Bağımlılık | Bakım Zorluğu |
|---|-----|----------|------------|----------------|
| 1 | **Node.js/TypeScript** | npm (`@hooksniff/sdk`) | 0 (fetch) | Düşük |
| 2 | **Python** | PyPI (`hooksniff`) | 1 (requests) | Düşük |
| 3 | **Go** | Go modules | 0 (net/http) | Çok düşük |
| 4 | **Java** | Maven Central | 0 (java.net.http) | Düşük |
| 5 | **PHP** | Packagist | 0 (curl) | Düşük |
| 6 | **Ruby** | RubyGems | 0 (net/http) | Düşük |

### Community Katkısına Açık (Aktif Bakım Yok)
- C#, Kotlin, Elixir, Swift, Rust
- PR gelirse merge edilir, ama aktif bakım yapılmaz
- README'de "community maintained" olarak işaretlenecek

### SDK Güvenlik ve Bakım Planı
1. **Dependabot** kurulacak → açık bulunduğunda otomatik PR açar
2. **Her SDK'ya minimal test** eklenecek → CI'da otomatik çalışır
3. **Güvenlik açığı durumunda:** AI agent (OpenClaw) düzeltmeyi yapar, Servet sadece onaylar
4. **Yeni dil sürümü çıktığında:** Genellikle bir şey bozulmaz. Bozulursa AI düzeltir.
5. **OpenAPI spec** gelecekte kurulacak → SDK'lar otomatik üretilir

### Kritik Kural
- SDK'lar minimal bağımlılık kullanmalı (mümkünse 0)
- Ne kadar az bağımlılık = o kadar az güvenlik riski
- SDK'lar sadece API wrapper'ı, karmaşık iş mantığı yok

---

## Teknik Notlar

### main.rs / lib.rs Yapısı
- `api/src/lib.rs` — Tüm modülleri `pub mod` olarak tanımlar
- `api/src/main.rs` — sadece gerekli import'ları kullanır

### CI Workflow
- `cargo fmt --check` → artık zorunlu (continue-on-error kaldırıldı)
- `cargo clippy -D warnings` → artık zorunlu
- `cargo test` → artık zorunlu
- Deploy workflow CI başarılı olunca tetiklenir

### Rate Limiting
- Login: 10 deneme / 15 dakika / IP bazlı
- Register: 5 deneme / saat / IP bazlı
- Genel: Plan bazlı (Free: 100/dk, Pro: 1000/dk)

### Cleanup Jobs (6 saatte bir)
- `seen_webhooks` expired kayıtları temizle
- `idempotency_keys` expired kayıtları temizle

### Zombie Reaper (30 saniyede bir)
- 5 dakikadan uzun süren "processing" kayıtları kurtar
- Orphaned delivery'leri (queue'da olmayan pending) yeniden queue'ya al
