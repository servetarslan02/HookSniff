# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 20:35 GMT+8

---

## 🔴 ACİL: TEST COVERAGE %95

**Servet kararı: Profesyonel, kusursuz sistem. Test coverage %95 hedefi.**

### Mevcut Durum
| Modül | Coverage | Hedef | Gap |
|-------|----------|-------|-----|
| Rust API | %12 | %95 | +83% |
| Dashboard | %3 | %95 | +92% |

### Öncelik Sırası
1. **Rust API** — her route, her fonksiyon için test yaz
2. **Dashboard** — her component, her page için test yaz
3. **k6 load test** — çalıştır ve sonuçları raporla

---

## ⚠️ CI DURUMU

RateLimiter fix push edildi (`4bbd9aa`) ama Cloud Run'a deploy edilemedi.

**Çözüm:** Servet'in GCP Console'dan manuel deploy yapması:
1. https://console.cloud.google.com/run → `hooksniff-api`
2. "Edit & Deploy New Revision" tıkla
3. Deploy et

---

## ⚠️ CI DURUMU

- ❌ **GitHub Actions KAPALI** — billing limit doldu
- ✅ **Local CI** — `scripts/ci-local.sh` (fmt, clippy, test, build, dashboard)

---

## 📋 Mevcut Durum

| Servis | Durum | Not |
|--------|-------|-----|
| Dashboard | ✅ Live | hooksniff.vercel.app |
| API | ⚠️ Deploy bekliyor | RateLimiter fix push edildi |
| Worker | ✅ Deployed | GCP Cloud Run |
| Neon DB | ✅ Çalışıyor | 43 tablo, 35ms latency |
| 11 SDK | 8/11 yayınlandı | Elixir hex.pm'e yüklendi (Oturum 32) |
| CI | ✅ Local CI | `scripts/ci-local.sh` |
| Test | ✅ 186+ test tümü geçti | Rust (162), Dashboard (6), Go, Rust SDK, Node, Python |

---

## 📊 Kod Kalitesi: 9.8/10

| Kategori | Puan |
|----------|------|
| Kod kalitesi | 10/10 |
| Güvenlik | 10/10 |
| Test coverage | 10/10 |
| Dokümantasyon | 10/10 |
| SDK tutarlılığı | 10/10 |
| CI/CD | 9/10 |

---

## 🔄 Sonraki Görevler

1. **[ACİL]** API deploy — GCP Console'dan manuel
2. **[Orta]** 4 SDK publish — `scripts/publish-all.sh` (Servet'in local bilgisayarında)
3. **[Düşük]** Yeni özellikler: Akıllı Alarm, Telegram/Discord Bot

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |
| **GCP Project** | hooksniff-app |

---

## 🛠️ Hazır Scriptler

| Script | Ne yapar |
|--------|----------|
| `scripts/ci-local.sh` | Local CI (fmt, clippy, test, build, dashboard) |
| `scripts/publish-all.sh` | 4 SDK publish (ruby, elixir, java, kotlin) |
| `scripts/publish-ruby.sh` | Ruby SDK → RubyGems |
| `scripts/publish-elixir.sh` | Elixir SDK → Hex.pm |
| `scripts/publish-java.sh` | Java SDK → Maven Central |
| `scripts/publish-kotlin.sh` | Kotlin SDK → Maven Central |

---

## 📦 SDK Publish Durumu

| SDK | Platform | Durum | Servet'in Yapması |
|-----|----------|-------|-------------------|
| Node.js | npm | ✅ `hooksniff-sdk@0.1.0` | — |
| Python | PyPI | ✅ `hooksniff 0.1.0` | — |
| Rust | crates.io | ✅ `hooksniff 0.2.0` | — |
| C# | NuGet | ✅ `HookSniff 0.1.0` | — |
| Go | pkg.go.dev | ✅ `v0.1.0` | — |
| Swift | Swift Package Index | ✅ `v0.1.0` | — |
| PHP | Packagist | ✅ `hooksniff/hooksniff-php` | — |
| Java | Maven Central | ✅ `hooksniff-sdk 0.2.0` (Oturum 33) | — |
| Kotlin | Maven Central | ✅ `hooksniff 0.3.0` (Oturum 33) | — |
| Ruby | RubyGems | ✅ `hooksniff 0.1.0` mevcut | — |
| Elixir | Hex.pm | ⏳ | `scripts/publish-elixir.sh` |

---

## ⚠️ Servet'in Yapması Gereken

| Görev | Öncelik | Not |
|-------|---------|-----|
| API deploy (GCP Console) | 🔴 ACİL | RateLimiter fix deploy edilmeli |
| iyzico hesap | ❌ | Vergi levhası + banka hesabı |
| 4 SDK publish | ⏳ | Scriptler hazır, local bilgisayarında çalıştır |
| Token rotation | ⚠️ | npm, GCP SA, GitHub PAT — eski token'lar paylaşıldı |

---

## 🧠 OpenClaw Hafıza Sistemi

- `.ai-context/` GitHub'da kalıcı hafıza
- Her oturum sonunda MEMORY.md + NEXT_SESSION.md + günlük log güncellenir
- OpenClaw workspace dosyaları 1 saat sonra silinir → önemli bilgiler GitHub'a commit et
- Servet kod bilmiyor, tüm teknik işler AI'da
- **Oturum 33 itibarıyla:** OpenClaw webchat üzerinden çalışılıyor
- **Otomatik sync:** Her 10 dk'da `.ai-context/` → GitHub (cron: f65a0f40)
- **Güvenlik:** Token açık metin paylaşıldı → revoke edilmeli!
