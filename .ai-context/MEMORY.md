# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-09 02:38 GMT+8

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

### ⚠️ CI POLİTİKASI (2026-05-09 — Servet Kararı)
- ❌ **GitHub Actions CI kullanılmAYACAK** — dakika limiti + billing sorunları
- ✅ **Local CI** çalıştırılacak (aşağıda komutlar)
- ✅ **PR merge** — admin override ile CI bypass
- ✅ **main-protection ruleset** — sadece PR zorunlu, CI check yok

### Local CI Komutları
```bash
source "$HOME/.cargo/env"
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo build --release
cd dashboard && npm install && npm run build
```

### PR Merge İşlemi
1. Local CI çalıştır → hepsi geçsin
2. Format düzeltmesi varsa: `cargo fmt` → GitHub API ile push
3. GitHub API ile squash merge (admin override)

## Domain Kararı
- ~~is-a.dev~~ iptal
- Vercel ücretsiz domain: `hooksniff.vercel.app` ✅

---

## ✅ SERVİS DURUMU (2026-05-09 01:27)

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Healthy |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |
| CI/CD | Local CI (GitHub Actions devre dışı) | ⚠️ Billing sorunu |
| Neon DB | eu-central-1 | ✅ Çalışıyor |
| Upstash Redis | 64MB | ✅ PONG |
| R2 Storage | hooksniff-storage | ✅ Bucket var |
| Cloudflare | Hesap aktif | ✅ |
| Polar.sh | ✅ Token aktif | ✅ |
| Email | GCloud Gmail API | ✅ |

---

### Bu Oturum (13) — 2026-05-08 22:02-22:49 GMT+8:

1. GitHub token yenilendi
2. Polar.sh durumu güncellendi
3. Tüm .ai-context/ dosyaları incelendi (19 dosya)
4. 3 denetim raporu güncellendi
5. Python SDK AI Center import'ları temizlendi
6. 6 SDK versiyonu 0.1.0'a standardize edildi
7. Dashboard Resend → Gmail API
8. CI sorunu tespit edildi — dakika limiti
9. Repo public/private toggle
10. main-protection ruleset oluşturuldu
11. CI hataları düzeltildi
12. CI workflow düzeltmeleri

### Bu Oturum (14) — 2026-05-08 22:56-23:23 GMT+8:

1. Clippy ✅, Test ✅ (29), Dashboard build ✅, Security audit ✅
2. Push edildi — `7ff7c94` commit

### Bu Oturum (17) — 2026-05-09 02:40-03:17 GMT+8:

1. **Grafana OTEL token sorunu çözüldü** — çoklu token denemeleri, endpoint keşfi
2. Stack ID'nin 1625476 (1757335 değil) olduğu tespit edildi
3. Auth formatı: `Basic base64(1625476:glc_token)` (Bearer değil!)
4. Region: prod-eu-west-2 (us değil!)
5. `otlp-gateway-prod-eu-west-2.grafana.net` → HTTP 200 ✅
6. EXTERNAL_TOKENS.md güncellendi — yeni token + stack bilgileri
7. .env.production.example güncellendi — OTEL endpoint + headers
8. otel-collector-config.yml güncellendi — Grafana Cloud exporter eklendi
9. 3 dosya değiştirildi, push bekleniyor

### Bu Oturum (16) — 2026-05-09 01:41-01:55 GMT+8:

1. **OpenAPI spec yazıldı** — `docs/openapi.yaml` (74KB, tüm 60+ endpoint, OpenAPI 3.0.3)
2. **`.env.production.example` güncellendi** — `EMAIL_BASE_URL`, `FCM_SERVER_KEY` eklendi, email "Resend" → "Gmail API", `OTEL_ENABLED=true`
3. **console.log** — SDK dokümantasyon code example'larında, debug kalıntısı değil (atlandı)
4. **TODO** — config.rs ve dashboard mesaj dosyalarında TODO bulunamadı (zaten temiz)
5. **Vercel deploy hook düzeltildi** — `prj_NQgFly8h...` → `prj_cSIVYHpCoAtoihRp8xlXIun1KVSR`
6. **Servis doğrulama tamamlandı**:
   - Neon DB ✅ — PostgreSQL 17.8, 43 public tablo
   - GCP SA ✅ — hooksniff-app, hooksniff-deploy@...
   - Grafana OTEL ❌ — 401, token süresi dolmuş (Servet yenilemeli)
7. **Dependency temizliği** — Rust kuruldu, cargo-udeps derlenemedi (nightly uyumsuz), manuel analiz: API ve Worker'da gereksiz dependency yok
8. Commit `24419de` + `41d4956` + `80504cb` push edildi

### Bu Oturum (15) — 2026-05-08 23:50-01:37 GMT+8:

1. PR #29 + PR #30 merge edildi
2. 5 yeni backend feature kodlandı (password reset, email verification, refresh token, 2FA, push notifications)
3. 5 yeni migration (030-034)
4. **PR #31 merge edildi** — local CI ile doğrulandı (29/29 test, clippy, fmt, build)
5. **CI politikası değişti** — GitHub Actions devre dışı, local CI'ya geçildi
6. Hassas dosyalar yönetildi (public/private toggle)
7. main-protection ruleset güncellendi — CI check'leri kaldırıldı
8. **Kapsamlı denetim yapıldı** — mevcut sistem sorunları kontrol edildi (aşağıda)

### Deploy Sonrası Eklenecek Env Var'lar
- `EMAIL_BASE_URL` — `https://hooksniff.vercel.app`
- `FCM_SERVER_KEY` — Firebase Cloud Messaging server key

---

## ❌ KALAN SORUNLAR (Güncel — 2026-05-09 01:37 — Denetim Sonrası)

### ✅ ZATEN DÜZELTİLMİŞ (4 adet — bu oturumda tespit edildi)
- ~~`#[allow(dead_code)]` (7 adet)~~ → tümü temizlenmiş
- ~~TypeScript strict ayarları~~ → `noUnusedLocals: true`, `noUnusedParameters: true` ekli
- ~~Hardcoded DB credentials (run-migrations.js)~~ → script silinmiş
- ~~truncate duplicate (main.rs)~~ → sadece delivery/http.rs'de kalmış

### ❌ HALA DÜZELTİLMEMİŞ (1 adet)
1. **Grafana OTEL token** — ✅ DÜZELTİLDİ (Oturum 17). Stack ID: 1625476, Auth: Basic, Region: eu-west-2
2. ~~OpenAPI spec boş~~ → ✅ Tam OpenAPI 3.0.3 spec yazıldı (Oturum 16)
3. ~~`.env.production.example` eksik~~ → ✅ Güncellendi (Oturum 16)
4. ~~console.log kalıntıları~~ → ✅ SDK code example'larında, kalıntı değil (Oturum 16)
5. ~~TODO kalıntıları~~ → ✅ Bulunamadı, zaten temiz (Oturum 16)
6. ~~Vercel deploy hook URL~~ → ✅ Project ID düzeltildi (Oturum 16)

### ⚠️ DOĞRULANMADI (test edilmeli)
- Neon DB bağlantı testi
- Grafana OTEL doğrulama
- GCP Service Account doğrulama

### Servet'in görevleri:
- **iyzico hesap** — vergi levhası + banka hesabı
- **GitHub billing** — $12 ödenmemiş fatura (opsiyonel, CI artık local)

### Teknik Borç
- sqlx 0.7.4 → 0.8 upgrade (security audit vulnerabilities)
- Dependency temizliği — cargo-udeps ile kontrol (API: 37, Worker: 22)

---

## 📋 YENİ ÖZELLİK PLANI

Detay: `.ai-context/FEATURE_PLAN.md`
12 yeni özellik, 4 faz, 9-10 hafta. Lab repo'da geliştirilecek.

| Faz | Özellikler | Süre |
|-----|-----------|------|
| 1 | Akıllı Alarm + Telegram/Discord Bot + Test Modu | 2 hafta |
| 2 | Zaman Tüneli + Playground + Custom Retry + Etiketler | 2 hafta |
| 3 | Müşteri İstatistikleri + Uptime + Export + IP Whitelist | 2-3 hafta |
| 4 | Webhook Zinciri (otomasyon) | 3+ hafta |

## 🤖 AI AGENT KATMANI
⚠️ Servet onayı BEKLENİYOR. En son iş. 4 hafta, $0, kural tabanlı.

## 📱 MOBİL UYGULAMA

Detay: `.ai-context/MOBILE_MASTER_PLAN.md`
- Platform: Android, React Native + Expo (SDK 53+)
- Dağıtım: Siteden APK indirme (Google Play YOK)
- Backend %90 hazır ✅ (push notification + şifre sıfırlama + refresh token mevcut)

---

## 📦 SDK STRATEJİSİ

Aktif bakım (6 SDK): Node.js, Python, Go, Java, PHP, Ruby
Community: C#, Kotlin, Elixir, Swift, Rust
Kural: Minimal bağımlılık, OpenAPI spec gelecekte

---

## Teknik Notlar

- `api/src/lib.rs` — Tüm modülleri `pub mod` olarak tanımlar
- `api/src/main.rs` — sadece gerekli import'ları kullanır
- Rate Limiting: Login 10/15dk, Register 5/saat, Genel plan bazlı
- Cleanup Jobs: 6 saatte bir (seen_webhooks, idempotency_keys)
- Zombie Reaper: 30 saniyede bir (5dk+ processing kayıtları)
