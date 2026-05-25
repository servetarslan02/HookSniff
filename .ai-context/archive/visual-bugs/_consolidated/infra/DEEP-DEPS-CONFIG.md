# 🔍 HookSniff — Deep Dependency & Configuration Audit

> **Tarih:** 2026-05-10  
> **Kapsam:** Tüm bağımlılıklar, yapılandırma dosyaları, Docker, CI/CD, env dosyaları, git config

---

## 📊 Bulunan Sorunlar Özeti

| Severity | Sayı |
|----------|------|
| 🔴 Critical | 2 |
| 🟠 High | 8 |
| 🟡 Medium | 9 |
| 🔵 Low | 6 |
| **Toplam** | **25** |

---

## 1. RUST BAĞIMLILIKLARI

### Kullanılmayan Dependencies

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `api/Cargo.toml` | `cookie = "0.18"` — kodda hiç `use cookie` yok, kullanılmıyor | 🟡 Medium | `Cargo.toml`'dan kaldır, `cargo check` ile doğrula |
| `api/Cargo.toml` | `async-stream = "0.3"` — kodda hiç kullanılmıyor | 🟡 Medium | Kaldır |
| `api/Cargo.toml` | `aes-gcm = "0.10"` — kodda hiç kullanılmıyor | 🟡 Medium | Kaldır veya ilgili feature implement et |
| `api/Cargo.toml` | `totp-rs` ve `base32` — TOTP/2FA implementasyonu yok (sadece import yok) | 🟡 Medium | Ya implement et ya da kaldır; 2FA feature planlanıyorsa tut |

### Eski / Güncel Olmayan Versionlar

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `Dockerfile.api` (dev) | `FROM rust:1-bookworm` — sabit major version yok, `1` tag'i her an değişebilir | 🟠 High | `rust:1.82-bookworm` gibi sabit version kullan (prod Dockerfile'da doğru yapılmış) |
| `Dockerfile.worker` (dev) | `FROM rust:slim` — ne sabit version ne de distro belirtilmemiş | 🟠 High | `rust:1.82-bookworm-slim` kullan |
| `api/Cargo.toml` | `tracing-subscriber` workspace'de `= "0.3"` olarak tanımlı ama API'de tekrar `version = "0.3"` ile override edilmiş | 🔵 Low | Workspace dependency kullan (`tracing-subscriber.workspace = true`) |

### Security Vulnerability Riskleri

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `api/Cargo.toml` | `rand = "0.8"` — güncel sürüm 0.9+, 0.8 bazı platformlarda weak entropy riski | 🟡 Medium | `rand = "0.9"`'a yükselt |
| `api/Cargo.toml` | `argon2 = "0.5"` — 0.6 mevcut, 0.5'da bilinen minor issue var | 🔵 Low | `argon2 = "0.6"`'ya güncelle |
| `Cargo.lock` | `cargo audit` CI'da var ama lock dosyası güncel mi kontrol edilmeli | 🔵 Low | Periyodik `cargo audit` çalıştır |

### Duplicate Dependencies

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `api/Cargo.toml` | `tracing-subscriber` hem workspace'de hem API'de ayrı tanımlı (aynı version) | 🔵 Low | `tracing-subscriber.workspace = true` kullan |

### Feature Flag Sorunları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `api/Cargo.toml` | `opentelemetry-otlp` features `["http-proto", "reqwest"]` ama `tonic` de bağımlılık olarak var — gRPC transportпотенstial conflict | 🟡 Medium | Tek transport seç: ya `http-proton` ya `grpc-tonic`, ikisi birden gereksiz |

---

## 2. NODE.JS BAĞIMLILIKLARI

### Kullanılmayan Dependencies

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `dashboard/package.json` | `lucide-react` — `src/` dizininde hiçbir import yok | 🟠 High | Ya icon'ları implement et ya da dependency'yi kaldır (~150KB bundle etkisi) |

### Version Uyumsuzlukları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `dashboard/package.json` | `eslint = "^8.0.0"` + `eslint-config-next = "^15.0.0"` — ESLint 8 + Next.js 15 eslint-config uyumsuzluğu riski | 🟠 High | `eslint = "^9.0.0"`'a yükselt veya `eslint-config-next` version'ını 8 ile uyumlu yap |
| `dashboard/package.json` | `@next/eslint-plugin-next = "^15.0.0"` — Next.js 15 plugin ama ESLint 8 | 🟠 High | ESLint 9'a yükselt |
| `dashboard/package.json` | `@tailwindcss/forms = "^0.5.0"` — Tailwind 3.4 ile uyumlu ama Tailwind 4'e geçişte uyumsuz olacak | 🔵 Low | Tailwind 4 planı varsa not et |
| `mcp/package.json` | `@modelcontextprotocol/sdk = "^1.0.0"` — çok eski, güncel sürüm 1.9+ | 🟡 Medium | Güncelle: `"^1.9.0"` |

### Bundle Size Etkisi

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `dashboard/package.json` | `recharts = "^2.15.0"` — ~200KB gzipped, D3 tabanlı | 🟡 Medium | Alternatif: `@tremor/react` veya lightweight chart lib düşün |
| `dashboard/package.json` | `lucide-react` unused ama yine de install ediliyor | 🟠 High | Kaldır (yukarıda belirtildi) |

### CLI & MCP

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `cli/package.json` | Test script: `"test": "echo \"Error: no test specified\" && exit 1"` — test yok | 🟡 Minimum | En azından `--help` smoke test ekle |
| `mcp/package.json` | `"type": "module"` ama `"test": "node --test test.js"` — `test.js` var mı kontrol et | 🔵 Low | Test dosyası yoksa ekle veya script'i düzelt |

---

## 3. NEXT.JS KONFİGÜRASYONU

### Kritik Sorun: `output: 'standalone'` Eksik!

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `dashboard/next.config.js` | `output: 'standalone'` ayarı yok ama `Dockerfile.dashboard` `.next/standalone` klasörünü kopyalıyor! **Docker build başarısız olur** | 🔴 Critical | `next.config.js`'ye `output: 'standalone'` ekle |

```javascript
// next.config.js'e ekle:
const nextConfig = {
  output: 'standalone',  // ← BU SATIR EKSİK
  reactStrictMode: true,
  // ...
};
```

### Security Headers

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `dashboard/next.config.js` | `Strict-Transport-Security` (HSTS) header eksik | 🟠 High | Ekle: `{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }` |
| `dashboard/next.config.js` | CSP `script-src 'unsafe-inline' 'unsafe-eval'` — XSS riski | 🟠 High | Nonce-based CSP'ye geç veya `'unsafe-eval'`'i kaldır |
| `dashboard/next.config.js` | `X-XSS-Protection` header deprecated, modern tarayıcılarda etkisiz | 🔵 Low | Kaldır veya `0` yap; CSP yeterli |

### Image Optimization

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `dashboard/next.config.js` | `remotePatterns: [{ protocol: 'https', hostname: '**' }]` — herhangi bir HTTPS image'a izin veriyor | 🟡 Medium | Sadece gerekli domain'leri whitelist'le |

### Environment Variable Handling

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `dashboard/next.config.js` | API URL hardcoded: `hooksniff-api-1046140057667.europe-west1.run.app` | 🟡 Medium | Environment variable'dan oku: `process.env.NEXT_PUBLIC_API_URL` |

### Build Output

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `dashboard/next.config.js` | `module.exports` (CJS) kullanıyor ama `tsconfig.json` `module: "esnext"` | 🔵 Low | Uyumsuzluk yok (Next.js ikisini de handle eder) ama `next.config.mjs` (ESM) daha modern |

---

## 4. DOCKER / DEPLOY

### Base Image Sorunları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `Dockerfile.api` (dev) | `FROM rust:1-bookworm` — tag unstable | 🟠 High | `rust:1.82-bookworm` kullan |
| `Dockerfile.worker` (dev) | `FROM rust:slim` — hem distro hem version belirsiz | 🟠 High | `rust:1.82-bookworm-slim` kullan |
| `Dockerfile.dashboard` | `FROM node:20-alpine` — LTS ama patch version sabit değil | 🟡 Medium | `node:20.x.y-alpine` pinle (CVE riski) |

### Security Best Practices

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `Dockerfile.worker` (dev) | Healthcheck yok — container crash olsa bile fark edilmez | 🟡 Medium | Healthcheck ekle (API ve dashboard'da var) |
| `Dockerfile.api` (dev) | `docs/` dizini COPY ediliyor — gereksiz dosya şişkinliği | 🔵 Low | `COPY docs/ docs/` satırını kaldır |
| `docker-compose.yml` | `HMAC_SECRET` ve `JWT_SECRET` plain text olarak env'de | 🟡 Medium | `.env` dosyasına taşı ve `.gitignore`'a ekle |

### Health Check

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `Dockerfile.api` (dev) | `HEALTHCHECK` var ✅ | — | OK |
| `Dockerfile.worker` (dev) | `HEALTHCHECK` yok ❌ | 🟡 Medium | Worker için `/health` endpoint ekle veya process check |
| `Dockerfile.dashboard` | `HEALTHCHECK` var ama `wget --spider` kullanıyor — Alpine'de wget yok olabilir | 🔵 Low | `curl` ekle veya `wget`'in Alpine'de olduğundan emin ol |

### Volume & Data

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `docker-compose.yml` | `pgdata` volume tanımlı ama backup strategy yok | 🟡 Medium | Backup volume veya script ekle |

---

## 5. ENV DOSYALARI

### 🔴 CRITICAL: Gerçek Secret .env.example'da!

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `.env.production.example` | `OTEL_EXPORTER_OTLP_HEADERS` içinde **gerçek Grafana Cloud token** var (base64 encoded) | 🔴 Critical | **Hemen** token'ı revoke et ve placeholder yap: `OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <YOUR_BASE64_ENCODED_TOKEN>` |

### Belgelendirme Sorunları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `.env.production.example` | `REDIS_URL` ve `UPSTASH_REDIS_REST_URL/TOKEN` boş ama hangisinin gerektiği belirsiz | 🟡 Medium | Comment ekle: "Upstash REST API için URL+TOKEN, veya Redis direct için REDIS_URL" |
| `.env.production.example` | `RATE_LIMIT_STORE=memory` default'u production için güvenli değil | 🟡 Medium | Production'da `redis` default yap, comment ekle |
| `.env.production.example` | `STRIPE_*` env var'ları var ama "legacy" olarak işaretlenmiş | 🔵 Low | Ya kaldır ya da `# DEPRECATED: Stripe artık kullanılmıyor` ekle |
| `dashboard/.env.production.example` | Sadece 3 env var — Upstash token eksik açıklaması | 🔵 Low | Comment ekle |
| `.env.production.example` | `OUTBOUND_IPS` boş — customer firewall whitelist için ne yapılmalı belirsiz | 🔵 Low | Comment: "Cloud Run outbound IP'lerini girin" |

---

## 6. CI/CD

### Pipeline Sorunları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `.github/workflows/ci.yml` | `security-audit` job'ı `continue-on-error: true` ile npm audit — vulnerability'ler göz ardı edilebilir | 🟡 Medium | `continue-on-error: false` yap veya sadece critical/high fail etsin |
| `.github/workflows/ci.yml` | Dashboard test step yok — sadece lint + build | 🟡 Medium | `npm test` step ekle (vitest konfigüre edilmiş) |
| `.github/workflows/ci.yml` | `build-api` ve `build-worker` parallel çalışıyor ama aynı cache key kullanıyor — cache conflict | 🟡 Medium | Farklı cache key'ler kullan: `cargo-release-api-v2-` vs `cargo-release-worker-v2-` |
| `.github/workflows/deploy.yml` | `--allow-unauthenticated` ile API deploy ediliyor — Cloud Run'da herkese açık | 🟡 Medium | Cloud IAM ile erişimi sınırla veya API gateway ekle |
| `.github/workflows/deploy.yml` | Secrets `--set-secrets` ile environment'a set ediliyor ama rotation mekanizması yok | 🔵 Low | Secret rotation policy ekle |

### Build Cache

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `.github/workflows/release.yml` | GHA cache (`type=gha`) kullanıyor ✅ | — | OK |
| `.github/workflows/ci.yml` | Cargo cache `actions/cache@v4` ile ✅ | — | OK |

### Dependabot

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `.github/dependabot.yml` | Cargo, npm ve GitHub Actions için weekly schedule ✅ | — | OK |

### CI Local Script

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `scripts/ci-local.sh` | `npm ci 2>/dev/null \|\| npm install` — npm ci başarısız olursa npm install fallback'i lock file'ı ignore edebilir | 🔵 Low | Sadece `npm ci` kullan, başarısız olursa hata ver |

---

## 7. GIT CONFIG

### .gitignore Sorunları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `.gitignore` | `.env.` pattern'i var (nokta sondaj) ama `.env` (noktasız) ignore edilmemiş | 🟠 High | `.env` satırı ekle (sadece `.env.production` ve `.env.*.local` ignore ediliyor) |
| `.gitignore` | `.env.example` ignore edilmiş ama `.env.production.example` edilmemiş | 🟠 High | `.env.production.example` de ignore edilmeli (gerçek secret içeriyor!) |
| `.gitignore` | `deploy/gcp-service-account.json` ignore edilmiş ✅ | — | OK |
| `.gitignore` | `node_modules/` ignore edilmiş ✅ | — | OK |
| `.gitignore` | `target/` ignore edilmiş ✅ | — | OK |

### .gitattributes

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `.gitattributes` | Dosya mevcut değil | 🔵 Low | Büyük binary dosyalar için LFS tracking ekle (Docker image'lar, binary'ler) |

---

## 🏁 Öncelikli Aksiyon Planı

### 🔴 Critical (Hemen yapılmalı)
1. **`.env.production.example`'daki Grafana token'ı revoke et** ve placeholder yap
2. **`next.config.js`'ye `output: 'standalone'` ekle** — Docker build şu an bozuk

### 🟠 High (Bu hafta)
3. `.gitignore`'a `.env` ve `.env.production.example` ekle
4. Dockerfile'larda Rust base image version'larını sabitle
5. `lucide-react` dependency'sini kaldır veya implement et
6. ESLint 9'a yükselt (Next.js 15 uyumluluğu)
7. HSTS header ekle
8. CSP'den `'unsafe-eval'`'i kaldır

### 🟡 Medium (Sprint içinde)
9. Kullanılmayan Rust dependency'leri kaldır (cookie, async-stream, aes-gcm)
10. `rand` ve `argon2`'yi güncelle
11. Dashboard test step ekle CI'ya
12. Worker Dockerfile'a healthcheck ekle
13. Image remotePatterns'i kısıtla
14. API URL'yi hardcoded yapma, env'den oku

### 🔵 Low (Backlog)
15. `.gitattributes` ekle
16. `output: 'standalone'` ESM config'e geç
17. Backup strategy ekle
18. CLI'ya test ekle
19. Secret rotation policy belirle
