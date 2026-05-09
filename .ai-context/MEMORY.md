# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-09 18:00 GMT+8

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

## ✅ SERVİS DURUMU (2026-05-09 18:00)

| Servis | URL | Durum |
|--------|-----|-------|
| Dashboard | https://hooksniff.vercel.app | ✅ Live |
| API | https://hooksniff-api-1046140057667.europe-west1.run.app | ⚠️ RateLimiter fix push edildi, deploy bekliyor |
| Worker | https://hooksniff-worker-1046140057667.europe-west1.run.app | ✅ Deployed |
| CI/CD | Local CI (GitHub Actions devre dışı) | ⚠️ Billing sorunu |
| Neon DB | eu-central-1 | ✅ Çalışıyor |
| Upstash Redis | 64MB | ✅ PONG |
| R2 Storage | hooksniff-storage | ✅ Bucket var |
| Cloudflare | Hesap aktif | ✅ |
| Polar.sh | ✅ Token aktif | ✅ |
| Email | GCloud Gmail API | ✅ |

---

## 📦 SDK DURUMU

| SDK | Platform | Durum |
|-----|----------|-------|
| Node.js | npm | ✅ `hooksniff-sdk@0.1.0` |
| Python | PyPI | ✅ `hooksniff 0.1.0` |
| Rust | crates.io | ✅ `hooksniff 0.2.0` |
| C# | NuGet | ✅ `HookSniff 0.1.0` |
| Go | pkg.go.dev | ✅ `v0.1.0` tag |
| Swift | Swift Package Index | ✅ `v0.1.0` tag |
| PHP | Packagist | ✅ `hooksniff/hooksniff-php` |
| Java | Maven Central | ⏳ GPG key bekliyor |
| Kotlin | Maven Central | ⏳ Gradle wrapper gerekli |
| Ruby | RubyGems | ⏳ `gem push` |
| Elixir | Hex.pm | ⏳ `mix hex.publish` |

**7/11 SDK publish edildi**

---

## 🔴 ACIL GÖREVLER

1. **API Deploy** — RateLimiter fix (`4bbd9aa`) push edildi ama Cloud Run'a deploy edilemedi (CI bozuk). Servet'in GCP Console'dan manuel deploy yapması gerekiyor
2. **CI Pipeline** — GitHub Actions runner sorunu, dakika limiti
3. **Dashboard İyileştirmeleri** — DASHBOARD_ISSUES.md'ye bak

---

## 📋 Servet'in Yapması Gereken

| Görev | Durum | Not |
|-------|-------|------|
| API deploy (GCP Console) | ⚠️ | RateLimiter fix deploy edilmeli |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |
| Domain kararı | ❌ | hooksniff.vercel.app yeterli şimdilik |
| Java/Kotlin/Ruby/Elixir SDK publish | ⏳ | Servet'in local bilgisayarında |

---

## Son Oturumlar

| Oturum | Tarih | Konu |
|--------|-------|------|
| 29 | 2026-05-09 18:00 | OpenClaw webchat, GitHub senkronizasyonu kuruldu |
| 28 | 2026-05-09 08:26 | RateLimiter fix, kapsamlı kod incelemesi |
| 27 | 2026-05-09 06:26 | PHP SDK Packagist publish |
| 26 | 2026-05-09 06:21 | SDK publish rehberi |
| 24 | 2026-05-09 05:33 | SDK publish tamamlandı (M2) |
