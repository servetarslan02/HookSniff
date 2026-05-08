# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-08 20:59 GMT+8

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
- **Yeni özellik geliştirme** → Ayrı lab repo `servetarslan02/hooksniff-lab`
  - Lab repo'da test edilir, kusursuz çalışınca Servet onayı ile ana repo'ya merge edilir
  - Ana repo'nun main branch'i bozulmaz
  - Her özellik ayrı branch'te geliştirilir
- **AI Agent katmanı** → Lab repo'da geliştirilecek (Servet onayı beklemede, en son iş)
- **Market research, plan, notlar** → `.ai-context/` klasörüne kaydedilir

## Domain Kararı
- ~~is-a.dev~~ iptal
- Vercel ücretsiz domain: `hooksniff.vercel.app` ✅

---

## ✅ SERVİS DURUMU (2026-05-08 19:00)

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ✅ Healthy |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |
| CI/CD | GitHub Actions | ⏳ Test hataları var |
| Neon DB | eu-central-1 | ✅ Çalışıyor |
| Upstash Redis | 64MB | ✅ PONG |
| R2 Storage | hooksniff-storage | ✅ Bucket var |
| Cloudflare | Hesap aktif | ✅ |
| Polar.sh | Token expired | ❌ Yeni token lazım |
| ~~Resend~~ | ~~hooksniff.is-a.dev iptal~~ → GCloud Gmail API'ya taşındı | ✅ |

---

## ✅ YAPILAN DÜZELTMELER (2026-05-08 — Oturum 1 + 2)

### Önceki Oturumlar (1-7):
1. `main.rs` mod çakışması düzeltildi
2. OpenClaw workspace dosyaları temizlendi
3. Dashboard ESLint hataları düzeltildi
4. Vercel Root Directory `dashboard/` ayarlandı
5. Cloudflare R2 bucket oluşturuldu
6. CI/CD pipeline açıldı

### Bu Oturum (8) — 16 Düzeltme:
1. CI `continue-on-error` kaldırıldı — bozuk kod artık deploy'u engelliyor
2. Dashboard API token wrapper düzeltildi
3. Login rate limit eklendi (10/15dk, 5/saat register)
4. `seen_webhooks` cleanup job eklendi (6 saatte bir)
5. `idempotency_keys` cleanup job eklendi (6 saatte bir)
6. Admin plan değişikliğinde webhook_count yönetimi (upgrade→sıfırla, downgrade→cap)
7. Duplicate `truncate` fonksiyonu birleştirildi
8. Duplicate `validate_url` ssrf.rs'e yönlendirildi
9. Zombie reaper + orphaned delivery kurtarma eklendi
10. `#[allow(dead_code)]` kaldırıldı
11. Invoice oluşturma eklendi (SubscriptionCreated + SubscriptionUpdated)
12. CORS fallback (production'da dashboard izni)
13. Replay protection race condition düzeltildi (atomic INSERT)
14. validate_url http/https şeması kontrolü eklendi
15. cargo fmt --all uygulandı (70 dosya)
16. Unused import'lar temizlendi

### Bu Oturum (9) — 2026-05-08 19:14-19:47 GMT+8:
1. **12 test hatası düzeltildi** (Stripe base64, JSON depth, FieldMapper, plan limits, usage, API key)
2. **37+ Clippy hatası düzeltildi** → cargo clippy --fix + manuel düzeltmeler
3. **#[allow] sorunları tamamen çözüldü**:
   - `from_str` × 6 → `parse_str` olarak yeniden adlandırıldı + tüm call site'ları güncellendi
   - `dead_code`: kullanılmayan `truncate` fonksiyonu silindi
   - `dead_code`: kullanılmayan config field'ları silindi (resend_api_key, notify_from_email)
   - `dead_code`: verify fonksiyonları `#[cfg(test)]` modülüne taşındı
   - `too_many_arguments`: `AttemptRecord` struct ile refactor edildi
4. **Cron job düzeltildi** — MEMORY.md path hatası giderildi
5. **CI yeşil** — 0 Clippy hatası, 156/156 test geçti

---

## ❌ KALAN SORUNLAR

**Tüm testler temiz (156/156) ✅ | Clippy temiz ✅ (0 #[allow])**

### Servet'in dış servis görevleri:
- Polar.sh token yenile
- ~~Resend yeni domain~~ → GCloud Gmail API'ya taşındı ✅
- GitHub token yenile
- iyzico hesap aç

---

### Bu Oturum (10) — 2026-05-08 20:06-20:59 GMT+8:
1. **Resend → GCloud Gmail API tamamen kaldırıldı:**
   - `api/src/email.rs`: `ResendClient` → `GCloudEmailClient` (service account JWT → Gmail API)
   - `api/src/config.rs`: `resend_api_key` kaldırıldı, `gcp_service_account_path` eklendi
   - `api/src/main.rs`: `resend_client` → `gcloud_email` init
   - `api/src/routes/contact.rs`: yeni client'a taşındı
   - `api/src/routes/auth.rs`: `ResendClient` → `GCloudEmailClient`
   - `worker/src/delivery/mod.rs`: Resend API → Gmail API (service account auth)
   - `worker/Cargo.toml`: `jsonwebtoken` dependency eklendi
   - `.github/workflows/deploy.yml`: `RESEND_API_KEY` kaldırıldı, `GCP_SA_JSON` eklendi (API + Worker)
   - `.ai-context/EXTERNAL_TOKENS.md`: Resend section kaldırıldı, GCloud email notu eklendi
   - `DEPLOY_GUIDE.md`, `FREE_TIER_SETUP.md`, `STATUS.md`, `README.md`: dokümantasyon güncellendi
2. **GCP Secret Manager:**
   - `gcp-sa-json` secret'ı oluşturuldu (version 1)
   - Cloud Run servis hesabına `secretAccessor` izni verildi
3. **cargo fmt + clippy + test:** 29/29 test geçti, 0 Clippy hatası
4. **CI yeşil** — Deploy tetiklendi

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

## 📱 MOBİL UYGULAMA (2026-05-08 — Hafıza Kaydı)

Detay: `.ai-context/FEATURE_PLAN.md` (son bölüm)
⚠️ Servet onayı BEKLENİYOR. Tüm web özellikleri bittikten sonra.
Önce PWA (2 hafta, $0), gerekirse React Native/Expo (4-6 hafta).
WhatsApp bot İPTAL — sadece Telegram bot kullanılacak.

---

## ❌ KALAN SORUNLAR

### Test Hataları (3 adet — düzeltilecek)
1. `validate_json_depth` — derlik sayacı 1'den başlıyor, 0'dan başlamalı
2. Stripe signature testleri (5 test) — timestamp tolerance sorunlu
3. Transform pipeline testi — name field silinmiyor ama test silinmesini bekliyor

### SDK Hataları (2026-05-08 tespit edildi — detay: .ai-context/SDK_AUDIT.md)
1. **🔴 AI Center backend'de yok** — SDK'da kod var ama endpoint'ler tanımlanmamış. SDK'dan kaldırılacak.
2. PHP SDK `send()` duplicate satır — kod çalışmaz
3. Tüm SDK'lar yanlış base URL (api.hooksniff.io → GCP Cloud Run)
4. Java Gson 2.10.1 eski (güncel: 2.11.0)
5. Go 1.21 eski (güncel: 1.22)
6. Versiyon tutarsızlığı (0.1.0 ~ 0.4.0 arası)
7. Hiçbir SDK'da test, CI, publish yok

### Kod Kalitesi Sorunları (2026-05-08 tespit edildi — detay: .ai-context/CODEBASE_AUDIT.md)
1. 107 tane eski domain referansı (`is-a.dev`) — domain kararı sonrası temizlenecek
2. 8 tane `#[allow(dead_code)]` — worker/signing.rs'te 5 tanesi
3. Duplicate fonksiyonlar (`validate_url` 2 yerde, `truncate` 2 yerde)
4. API'de 38 dependency — bazıları gereksiz olabilir
5. Dashboard'da console.log kalıntıları (docs sayfalarında)
6. 3 tane TODO kalıntısı (customer_portal.rs + settings)
7. CI'da otomatik tarama araçları yok (clippy, audit, lint)

### 🔴 KRİTİK GÜVENLİK (2026-05-08 tespit edildi — detay: .ai-context/FULL_SYSTEM_AUDIT.md)
1. OpenAPI spec boş (1 satır) — SDK üretimi yapılamaz
2. Dependabot kurulmamış — güvenlik taraması yok
3. Migration numara boşluğu (013-025 arası 13 eksik)
4. .env.production.example'de 3 eksik env var + eski domain

---

## ⚠️ SERVET'İN YAPMASI GEREKEN

1. **Polar.sh yeni token** — polar.sh dashboard → Settings → Access Tokens
2. ~~Resend yeni domain~~ → ✅ GCloud Gmail API'ya taşındı
3. **GitHub token yenile** — eski token açık paylaşıldı, güvenlik riski
4. **Domain kararı** — şimdilik `hooksniff.vercel.app` yeterli
5. **iyzico hesap** — vergi levhası + banka hesabı

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
