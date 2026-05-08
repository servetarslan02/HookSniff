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
9. **KOD HATASI BULUNDU**: `opentelemetry-otlp` crate `tonic` (gRPC) feature kullanıyordu, Grafana HTTP istiyor
10. `tonic` → `http-proto` feature değişikliği + `telemetry.rs` HTTP exporter'a geçiş
11. 5 dosya değiştirildi, push edildi `1260a09` + devam commit'leri

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
- sqlx 0.7.4 → 0.8.6 upgrade — ✅ TAMAMLANDI
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


### Bu Oturum (18) — 2026-05-09 04:00-04:15 GMT+8:

1. **Grafana OTEL token güncellendi** — yeni `glc_` cloud access policy token
2. `.env.production.example` → OTEL_HEADERS güncellendi
3. `monitoring/otel-collector-config.yml` → authorization header güncellendi
4. `.ai-context/EXTERNAL_TOKENS.md` → GRAFANA_* ve GITHUB_PAT güncellendi
5. **Neon DB doğrulandı** — API health check: 35ms latency ✅
6. **GCP SA doğrulandı** — hooksniff-deploy@hooksniff-app.iam.gserviceaccount.com ✅
7. **Grafana Tempo doğrulandı** — hooksniff-api trace'leri akıyor ✅
8. **API durumu** — healthy, uptime OK, queue boş
9. **sqlx 0.7.4 → 0.8.6 upgrade** — RUSTSEC-2024-0374 güvenlik açığı kapatıldı
   - `fifo/mod.rs` Encode trait return type düzeltildi
   - 29/29 test ✅, clippy ✅, fmt ✅
10. Commit `d0df105` push edildi

### Bu Oturum (20) — 2026-05-09 04:28-05:00 GMT+8:

1. **OpenClaw entegrasyonu** — Servet OpenClaw'dan bağlandı
2. **Kapsamlı sistem analizi** — 24K satır kod incelendi
3. **Rakip analizi** — Svix, Hookdeck, Hook0, Convoy karşılaştırıldı
4. **Forum/müşteri taraması** — Reddit, HN, devopsschool tarandı
5. **SYSTEM_ANALYSIS.md** raporu yazıldı (15KB, 5 bölüm)
6. **Rekabet stratejisi** belirlendi:
   - HookSniff: Svix ile aynı özellik, 10x daha ucuz ($49 vs $490)
   - FIFO + throttle = benzersiz avantaj
   - Türkiye pazarı boşluğu (iyzico + Türkçe)
7. **5 yenilikçi özellik önerisi** — Debugging Console, Simulator, Smart Retry, Analytics, Pay-Per-Use
8. **Acil eylem planı** — GDPR + SDK'lar + Portal + Landing page + Benchmark

### Bu Oturum (21) — 2026-05-09 05:22-05:30 GMT+8:

1. **OpenClaw webchat'ten bağlantı** — İlk kez OpenClaw kullanıldı
2. **Hafıza dosyaları okundu** — MEMORY.md, NEXT_SESSION.md, FEATURE_PLAN.md
3. **Milestone doğrulama** — M1-M10 tablosu kod üzerinden kontrol edildi
4. **Sonuç:** 8/10 milestone kodda mevcut ✅
   - M2 (SDK publish) — token gerekli, Servet'in yapması lazım
   - M6 (console.log + TODO) — atlandı, debug kalıntısı değil
5. **Test sayıları düzeltildi:**
   - Tabloda "161 test" yazıyor ama gerçek: Rust 146 + Node.js 12 + Python 12 = 170
   - Tüm testler passing ✅
6. **cargo fmt** — 2 dosya formatlandı (hafif fark)

### Bu Oturum (22) — 2026-05-09 05:26-05:35 GMT+8:

1. **SDK Publish denemesi (M2)** — npm, PyPI, crates.io token'ları ile deneme
2. **npm** — ❌ 403: "bypass 2FA" gerektiriyor, granular token'da bu seçenek kapalı
3. **PyPI** — ✅ `hooksniff 0.1.0` zaten publish edilmiş (önceki oturumlarda)
4. **crates.io** — ❌ 400: doğrulanmış email gerekli
5. **Sonuç:** M2 tamamlanması için Servet'in 2 şey yapması lazım:
   - npm: Granular token + "Allow 2FA bypass"
   - crates.io: Email doğrula

### Bu Oturum (23) — 2026-05-09 05:29 GMT+8:

1. **npm publish** — ✅ Başarılı! `hooksniff-sdk@0.1.0` npm'de yayında
   - `@hooksniff` scope'u yok → `hooksniff-sdk` olarak publish edildi
   - Yeni token ile 2FA bypass sorun çözüldü
2. **crates.io** — hala email doğrulama bekliyor

### Bu Oturum (24) — 2026-05-09 05:33 GMT+8:

1. **crates.io publish** — ✅ `hooksniff v0.2.0` yayında!
2. **M2 TAMAMLANDI** — tüm 3 platformda SDK publish edildi:
   - npm: `hooksniff-sdk@0.1.0`
   - PyPI: `hooksniff 0.1.0`
   - crates.io: `hooksniff v0.2.0`
3. **Tüm 10 milestone tamamlandı!** 🎉

### Bu Oturum (25) — 2026-05-09 05:35-05:55 GMT+8:

1. **Tüm .ai-context/ dosyaları incelendi** — 28 dosya, cross-reference analizi yapıldı
2. **DASHBOARD_ISSUES.md doğrulandı** — kod üzerinden 54 madde kontrol edildi
3. **31 sorun düzeltildi**, 7'si zaten düzeltilmiş, 10'u hâlâ bekliyor
4. **Dashboard build başarılı** ✅ — 26 dosya değiştirildi, 945 satır eklendi
5. **i18n tamamlandı** — 8 locale'de ~100+ yeni key eklendi (settings, billing, FAQ, about, contact, inbound, alerts)
6. **SEO dosyaları oluşturuldu** — sitemap.ts, robots.txt, manifest.json
7. **Error pages oluşturuldu** — error.tsx, not-found.tsx, loading.tsx
8. **Confirm dialog standardize edildi** — endpoints/alerts artık ConfirmDialog kullanıyor
9. **Pricing düzeltildi** — Free plan 1,000 → 10,000 (API ile uyumlu)
10. **Footer düzeltildi** — GitHub URL, tüm linkler t() ile, blog linki kaldırıldı
11. **Sidebar logo** — artık tıklanabilir (Link to home)
12. **Status page** — nav bar eklendi
13. **Tutarsızlık tespit edildi** — NEXT_SESSION.md ve FULL_SYSTEM_AUDIT.md güncellenmemiş (Grafana, OpenAPI, SDK publish)
14. Commit `54e171b` push edildi

### Bu Oturum (26) — 2026-05-09 06:21 GMT+8:

1. **OpenClaw webchat'ten bağlantı** — Servet tekrar bağlandı
2. **Tüm .ai-context/ dosyaları okundu** — MEMORY.md, NEXT_SESSION.md, SDK_AUDIT.md, 2026-05-09.md
3. **SDK durum kontrolü** — 11 SDK incelendi, 6'sı publish edilmiş, 5'i bekliyor
4. **SDK_PUBLISH_GUIDE.md oluşturuldu** — Kalan 5 SDK için detaylı publish rehberi
5. **Java SDK** — pom.xml hazır, GPG key 7306B334, Sonatype OSSRH yapılandırılmış
6. **Kotlin SDK** — build.gradle.kts hazır, Gradle wrapper eksik
7. **Ruby SDK** — hooksniff.gemspec hazır, `gem push` ile publish edilecek
8. **PHP SDK** — composer.json hazır, Packagist'e submit edilecek
9. **Elixir SDK** — mix.exs hazır, `mix hex.publish` ile publish edilecek
10. **Ortam kısıtlaması** — Bu sunucuda Java/Ruby/PHP/Elixir kurulu değil, kurulum yapılamıyor
11. **Çözüm** — Servet local bilgisayarında publish edecek, rehber hazır

### Kalan SDK Publish Durumu:
| SDK | Durum | Servet'in Yapması Gereken |
|-----|-------|---------------------------|
| Java | ⏳ | Maven + GPG ile `mvn deploy` |
| Kotlin | ⏳ | Gradle wrapper ekle + `gradle publish` |
| Ruby | ⏳ | `gem push hooksniff-0.1.0.gem` |
| PHP | ✅ | `hooksniff/hooksniff-php` Packagist'de yayında |
| Elixir | ⏳ | `mix hex.publish` |

### Bu Oturum (27) — 2026-05-09 06:29-06:47 GMT+8:

1. **Ruby SDK** — Ruby 3.3.0 source'dan compile edildi, OpenSSL + libyaml + psych eklendi
   - `hooksniff-0.1.0.gem` build edildi ✅
   - RubyGems push için API key lazım
   - Ayrı repo: `servetarslan02/hooksniff-ruby` (v0.1.0 tag)
2. **Java SDK** — OpenJDK 21 + Maven 3.9.6 kuruldu
   - `mvn clean compile test` başarılı ✅
   - Ayrı repo: `servetarslan02/hooksniff-java` (v0.1.0 tag)
   - Maven Central publish için GPG + Sonatype credentials lazım
3. **Kotlin SDK** — Gradle 8.5 kuruldu, compile hatası düzeltildi
   - `inline fun` → `fun` değişikliği (private member access hatası)
   - `gradle build` başarılı ✅
   - Ayrı repo: `servetarslan02/hooksniff-kotlin` (v0.2.0 tag)
   - Maven Central publish için GPG + Sonatype credentials lazım
4. **PHP SDK** — Packagist'de yayında ✅ (önceki oturumda)
5. **3 yeni GitHub repo** oluşturuldu:
   - `servetarslan02/hooksniff-java`
   - `servetarslan02/hooksniff-kotlin`
   - `servetarslan02/hooksniff-ruby`

### Publish İçin Credentials Gereken:
| SDK | Platform | Credential |
|-----|----------|------------|
| Ruby | RubyGems | API key |
| Java | Maven Central | Sonatype OSSRH user/pass + GPG passphrase |
| Kotlin | Maven Central | Aynı (Java ile aynı hesap) |
| Elixir | Hex.pm | Hex.pm account |

