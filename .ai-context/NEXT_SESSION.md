# NEXT_SESSION.md — Yeni Oturum Rehberi

> Son güncelleme: 2026-05-09 06:40 GMT+8

---

## ⚠️ KRİTİK KURAL: REPO AYRIMI

| İş Türü | Repo | Branch |
|---------|------|--------|
| Hata düzeltme, fix, refactor | `servetarslan02/HookSniff` (orijinal) | main |
| Yeni web özellikleri | `servetarslan02/hooksniff-lab` (lab) | feature/... |
| Mobil uygulama | `servetarslan02/hooksniff-mobile` | main |
| Market research, plan, notlar | `.ai-context/` klasörü (her iki repo'da) | main |

---

## ⚠️ CI POLİTİKASI (Servet Kararı — 2026-05-09)

**GitHub Actions kullanılmAYACAK.** Yerine local CI:

```bash
source "$HOME/.cargo/env"
cargo fmt --check
cargo clippy -- -D warnings
cargo test
cargo build --release
cd dashboard && npm install && npm run build
```

PR merge: admin override ile CI bypass.

---

## 🚀 Yeni Oturuma Başlarken

1. `.ai-context/MEMORY.md` ve `.ai-context/NEXT_SESSION.md` oku
2. Gerekirse repo'yu klonla
3. Rust kurulu değilse kur: `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y`

---

## 📌 Proje Bilgileri

| Bilgi | Değer |
|-------|-------|
| **Repo** | https://github.com/servetarslan02/HookSniff |
| **Dashboard** | https://hooksniff.vercel.app |
| **API** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Worker** | https://hooksniff-worker-1046140057667.europe-west1.run.app |

---

## 📦 SDK DURUMU (Güncel — 2026-05-09 06:25)

### ✅ Publish Edilmiş (6 SDK)
| SDK | Platform | Versiyon | Paket Adı |
|-----|----------|----------|-----------|
| Node.js | npm | 0.1.0 | hooksniff-sdk |
| Python | PyPI | 0.1.0 | hooksniff |
| Rust | crates.io | 0.2.0 | hooksniff |
| C# | NuGet | 0.1.0 | HookSniff |
| Go | pkg.go.dev | v0.1.0 | git tag |
| Swift | Swift Package Index | v0.1.0 | git tag |

### ⏳ Publish Bekleyen (5 SDK)
| SDK | Platform | Versiyon | Durum |
|-----|----------|----------|-------|
| Java | Maven Central | 0.1.0 | GPG key propagasyonu bekliyor |
| Kotlin | Maven Central | 0.2.0 | Gradle wrapper eksik |
| Ruby | RubyGems | 0.1.0 | Local'de publish edilecek |
| PHP | Packagist | 0.1.0 | ✅ Yayında — `hooksniff/hooksniff-php` |
| Elixir | Hex.pm | 0.2.0 | Local'de publish edilecek |

### 📖 Publish Rehberi
Detaylı rehber: `.ai-context/SDK_PUBLISH_GUIDE.md`

---

## 🎯 YENİ OTURUM GÖREVLERİ

### Öncelik 1: SDK Publish (Kalan 5)
1. ~~**PHP** — Packagist'e submit~~ ✅ `hooksniff/hooksniff-php` yayında
2. **Ruby** — `gem push hooksniff-0.1.0.gem`
3. **Elixir** — `mix hex.publish`
4. **Java** — `mvn deploy` (Maven + GPG)
5. **Kotlin** — Gradle wrapper ekle + `gradle publish`

### Öncelik 2: Dashboard İyileştirmeleri
- DASHBOARD_ISSUES.md'deki kalan 10 sorun
- Responsive tasarım düzeltmeleri
- Erişilebilirlik iyileştirmeleri

### Öncelik 3: Yeni Özellikler (Faz 1)
- Akıllı Alarm sistemi
- Telegram/Discord Bot entegrasyonu
- Test Modu (zaten var, dashboard'da UI ekle)

---

## ⏳ SERVET'İN GÖREVLERİ

### SDK Publish İçin
- **Java**: GPG key'i local'e import et, `mvn deploy` çalıştır
- **Kotlin**: `gradle wrapper --gradle-version 8.5` çalıştır, sonra `gradle publish`
- **Ruby**: `gem signin` + `gem push`
- ~~**PHP**: https://packagist.org/packages/submit → repo URL gir~~ ✅ API ile yapıldı
- **Elixir**: `mix hex.auth` + `mix hex.publish`

### Diğer
- **iyzico hesap** — vergi levhası + banka hesabı
- **GitHub billing** — $12 fatura (opsiyonel)

---

## 🔴 GRAFANA OTEL TOKEN (Hâlâ Geçerli)

### Mevcut Durum
- Stack ID: `1625476` (Oturum 17'de doğrulandı)
- Region: `prod-eu-west-2`
- Auth formatı: `Basic base64(1625476:glc_token)`
- Endpoint: `otlp-gateway-prod-eu-west-2.grafana.net`

### Token Güncellemesi Gerekirse
1. Grafana Cloud → profil → API Keys → Add API Key → Role: Editor
2. EXTERNAL_TOKENS.md'de `GRAFANA_OTEL_HEADERS` güncelle
3. `.env.production.example`'deki `OTEL_EXPORTER_OTLP_HEADERS` güncelle
4. Push et

---

## 🔄 Hafıza Kuralları

Her oturum sonunda:
1. `.ai-context/MEMORY.md` güncelle
2. `.ai-context/NEXT_SESSION.md` güncelle
3. `.ai-context/2026-05-09.md` günlük log güncelle
4. GitHub API ile push et
