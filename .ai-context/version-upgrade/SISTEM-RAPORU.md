# HookSniff — Sistem Raporu

> Tarama: 2026-05-16
> Kapsam: Tüm bileşenler, bağımlılıklar, altyapı, SDK'lar

---

## Proje Nedir?

HookSniff bir webhook altyapı platformu. Kullanıcılar webhook endpoint'leri oluşturur, HookSniff webhook'ları alır, işler ve teslim eder.

| Katman | Teknoloji | Nerede Çalışıyor |
|--------|-----------|-----------------|
| API | Rust + Axum | Google Cloud Run |
| Worker | Rust | Google Cloud Run |
| Dashboard | Next.js + React | Vercel |
| Veritabanı | PostgreSQL | Neon (serverless) |
| Cache/Queue | Redis | Upstash (serverless) |
| Depolama | R2 | Cloudflare |
| Monitoring | Grafana + OpenTelemetry | Grafana Cloud |

---

## Versiyon Durumu

### Rust Backend — ✅ Neredeyse Güncel

Ana proje `Cargo.lock` dosyasında tüm crate'ler güncel. Sadece 1 minor patch var.

| En Kritik Crate'ler | Versiyon |
|---------------------|----------|
| Rust toolchain | 1.95.0 |
| axum (web framework) | 0.8.9 |
| tokio (async runtime) | 1.52.3 |
| sqlx (database) | 0.8.6 |
| reqwest (HTTP client) | 0.13.3 |

**Yapılacak:** `cargo update` çalıştır. 5 dk.

---

### Dashboard — 🔴 5 Major Güncelleme Var

| Paket | Mevcut | Güncel | Fark |
|-------|--------|--------|------|
| Next.js | 15.5 | **16.2** | Major |
| Tailwind CSS | 3.4 | **4.3** | Major |
| TypeScript | 5.9 | **6.0** | Major |
| recharts | 2.15 | **3.8** | Major |
| ESLint | 9.39 | **10.4** | Major |

**Risk yüksek.** Her biri ayrı oturumda, sırayla yapılmalı. En büyük değişiklikler:

- **Next.js 16:** Turbopack varsayılan oldu. Async API'lar tamamen kaldırıldı.
- **Tailwind 4:** Config dosyası CSS'e taşındı. Utility isimleri değişti (`shadow-sm` → `shadow-xs`).
- **TypeScript 6:** Compiler varsayılanları değişti. TS 7.0'a hazırlık sürümü.

---

### GitHub Actions — 🔴 10 Eski Versiyon

Tüm workflow dosyalarında eski action versiyonları kullanılıyor:

| Action | Mevcut | Güncel |
|--------|--------|--------|
| actions/checkout | v4 | **v6** |
| actions/cache | v4 | **v5** |
| actions/upload-artifact | v4 | **v7** |
| actions/setup-node | v4 | **v6** |
| docker/build-push-action | v5 | **v7** |

**Ek sorun:** `aquasecurity/trivy-action@master` kullanılıyor. Spesifik versiyon pin'lenmeli (`v0.36.0`). `@master` supply chain riski.

---

### Docker Image'ları — 🟡 2 Güncelleme

| Image | Mevcut | Güncel | Nerede |
|-------|--------|--------|--------|
| Node.js | 20-alpine | **22-alpine** | Dashboard Dockerfile, CI |
| PostgreSQL | 16-alpine | **17-alpine** | docker-compose (local) |

Node 20 Nisan 2026'da EOL oluyor.

---

### Monitoring — 🟡 2 Güncelleme

| Servis | Mevcut | Güncel |
|--------|--------|--------|
| Prometheus | v3.4.1 | **v3.11.3** |
| Grafana | 12.0.2 | **13.0.1** |

---

## SDK Durumu

11 dilde SDK var. Hepsi OpenAPI Generator 7.22.0 ile üretilmiş (güncel).

### SDK Bağımlılık Sorunları

| SDK | Sorun | Seviye |
|-----|-------|--------|
| **Rust** | `reqwest 0.12` kullanıyor (ana proje: 0.13) | 🔴 Uyumsuz |
| **Swift** | `swift-tools-version:5.1` (en son: 6.0) | 🔴 Eski |
| **Kotlin** | `gradle 8.14` (en son: 9.5) | 🔴 Eski |
| **Ruby** | `rubocop 0.66` (en son: 1.75+) | 🔴 Çok eski |
| **Python** | `>=3.9` (3.9 EOL Ekim 2025) | 🟡 |
| **PHP** | `>=8.0` (8.0 EOL Kasım 2023) | 🟡 |
| **Node** | `>=18` (18 EOL Nisan 2025) | 🟡 |
| **Java** | compiler target 17 (21 LTS mevcut) | 🟡 |
| **C#** | `net8.0` (.NET 9 mevcut) | 🟡 |
| **Go** | `go 1.22` (1.24 mevcut) | 🟡 |
| **Elixir** | `~> 1.18` | ✅ Güncel |

---

## Kod Kalitesi

### Rust Backend

| Metrik | Değer | Yorum |
|--------|-------|-------|
| `unwrap()`/`expect()` | 816 | Panic riski — production'da sorun çıkarır |
| `unsafe` blok | 0 | Mükemmel |
| Test fonksiyonu | 1,181 | İyi |
| `.clone()` çağrısı | 269 | Performans etkisi |
| TODO/FIXME | 5 | Az |

### Dashboard (TypeScript)

| Metrik | Değer | Yorum |
|--------|-------|-------|
| `any` tipi | 11 | Düzeltmeli |
| `console.log` | 24 | Production'da kaldırılmalı |
| Test dosyası | 138 | İyi |
| E2E test | 1 | Çok az |

---

## Güvenlik

| Konu | Durum |
|------|-------|
| Argon2id şifre hash | ✅ |
| HttpOnly cookie (refresh token) | ✅ |
| 2FA (TOTP) | ✅ |
| CORS/CSP headers | ✅ |
| Rate limiting (Redis-backed) | ✅ |
| SSRF koruması | ✅ |
| SQL injection koruması | ✅ (sqlx parameterized) |
| API key rotation | ✅ |
| `unsafe` Rust bloku | ✅ 0 tane |
| Redis auth (Helm) | ⚠️ Kapalı — açılmalı |
| trivy-action pin | ⚠️ `@master` → versiyon pin gerekli |
| cargo audit ignore | ⚠️ 8 güvenlik açığı ignore edilmiş |
| SQL format! + user input | ⚠️ webhooks.rs:65 team_id doğrudan SQL'e giriyor |
| dangerouslySetInnerHTML | ⚠️ 4 yerde kullanılıyor (sanitize var ama kontrol gerekli) |
| Rust mega dosyalar | ⚠️ admin.rs 5130 satır, 10 dosya 1000+ satır |

### Ignore Edilen Güvenlik Açıkları (.cargo/audit.toml)

| ID | Paket | Sorun | Durum |
|----|-------|-------|-------|
| RUSTSEC-2026-0099 | rustls-webpki | Name constraints | sqlx transitive |
| RUSTSEC-2026-0104 | rustls-webpki | CRL parsing panic | sqlx transitive |
| RUSTSEC-2026-0098 | rustls-webpki | URI name constraints | sqlx transitive |
| RUSTSEC-2024-0437 | protobuf | Crash | prometheus transitive |
| RUSTSEC-2024-0363 | sqlx | Binary protocol misinterpretation | sqlx direct |
| RUSTSEC-2024-0436 | paste | Unmaintained | sqlx transitive |
| RUSTSEC-2025-0134 | rustls-pemfile | Unmaintained | sqlx transitive |
| RUSTSEC-2023-0071 | rsa | Marvin Attack | sqlx-mysql transitive |

**Not:** Çoğu sqlx transitive dependency. sqlx güncellendiğinde düzelmesi beklenir.

---

## Bilinen Sorunlar

| Sorun | Seviye | Not |
|-------|--------|-----|
| Neon compute limiti aşılmış | 🔴 | Free tier 191.99/193.39 saat |
| GitHub Actions dakikaları bitmiş | 🔴 | CI çalışmıyor |
| Dependabot devre dışı | 🟡 | Vercel deploy limiti yüzünden |
| Grafana trial bitiyor | 🟡 | 20 Mayıs |
| 816 unwrap() | 🟡 | Refactor gerekli |
| 1 E2E test | 🟡 | Kapsam artırılmalı |

---

## Servet'in Yapması Gereken

| Görev | Seviye | Açıklama |
|-------|--------|----------|
| Polar.sh Go Live | 🔴 | Stripe verification → ödeme almak için |
| GitHub Actions billing | 🔴 | Dakikalar yenilenmeli |
| Grafana trial | 🟡 | 20 Mayıs'ta bitiyor, karar ver |

---

## Güncelleme Planı (Özet)

| Faz | Ne | Süre | Risk |
|-----|-----|------|------|
| 1 | Minor/patch'ler | 30 dk | 🟢 |
| 2 | TypeScript 6 | 1 oturum | 🟡 |
| 3 | ESLint 10 | 1 oturum | 🟡 |
| 4 | recharts 3 | 1 oturum | 🟡 |
| 5 | Tailwind 4 | 1-2 oturum | 🔴 |
| 6 | Next.js 16 | 2-3 oturum | 🔴 |
| 7 | GitHub Actions | 1 oturum | 🟡 |
| 8 | Docker (Node 22, PG 17) | 30 dk | 🟡 |

**Toplam: 7-9 oturum (~1'er saat)**

Her adımda `npm run build` çalıştır, test et, commit + push et. Tek seferde hepsini yapma.

---

## Dosya Yapısı

```
HookSniff/
├── api/           → Rust API (39 route modülü, 119 .rs dosyası)
├── worker/        → Rust Worker (webhook teslimatı)
├── common/        → Paylaşılan Rust kütüphanesi
├── dashboard/     → Next.js Dashboard (442 .ts/.tsx dosyası)
├── sdks/          → 11 SDK (OpenAPI Generator ile üretilmiş)
├── migrations/    → 37 SQL migration
├── deploy/        → Docker, Helm, Terraform, deploy scriptleri
├── monitoring/    → Prometheus, Grafana, OTEL config
├── workers/       → Cloudflare Workers (edge proxy)
├── mcp/           → MCP Server (AI agent entegrasyonu)
├── docs-sdk/      → SDK dokümantasyonu (Docusaurus)
├── cli/           → CLI aracı
├── scripts/       → 47 shell script
├── tests/         → Integration, contract, load testleri
└── .ai-context/   → Kalıcı hafıza (GitHub'da sync)
```
