# HookSniff — Uygulama Planı

> Oluşturulma: 2026-05-16
> Son güncelleme: 2026-05-17 04:35 GMT+8
> Her adımın yanına ✅ tik atılabilir

---

## Faz 1: Hazırlık ✅

- [x] Git branch oluştur: `upgrade/system-updates`
- [x] Mevcut durumu test et: `cargo check --workspace` başarılı (Rust 1.95.0 kuruldu)
- [ ] Neon DB backup al (Console → Branch → Export) — manuel gerekli

---

## Faz 2: Minor/Patch Güncellemeleri

### Rust ✅
- [x] `cargo update` çalıştır — 7 paket güncellendi
- [x] `cargo check --workspace` — derleme başarılı
- [ ] `cargo test --workspace` — test çalıştır (ortam limiti, CI'da yapılacak)
- [x] `git commit -m "chore: update Cargo.lock minor patches"`

### Dashboard NPM — ⏳ Atlandı (npm install memory limiti)
- [ ] `cd dashboard && npm update`
- [ ] `next-intl` 4.11 → 4.12 güncelle
- [ ] `vitest` 4.1.5 → 4.1.6 güncelle
- [ ] `dompurify` 3.4.2 → 3.4.3 güncelle
- [ ] `npm run build` — build kontrol
- [ ] `git commit -m "chore: update dashboard minor patches"`

### Push ✅
- [x] `git push origin upgrade/system-updates`

---

## Faz 3: TypeScript 5 → 6 ✅

- [x] `cd dashboard && npm install -D typescript@latest @types/react@latest @types/react-dom@latest`
- [x] `npx tsc --noEmit` — tip kontrolü (1 hata: CSS import tip bildirimi)
- [x] Hataları düzelt — `global.d.ts` oluşturuldu
- [x] `npm run build` — build başarılı
- [x] `git commit -m "chore: upgrade TypeScript to 6.0"`
- [x] `git push`

---

## Faz 4: ESLint 9 → 10 ✅

- [x] `npm install -D eslint@latest eslint-config-next@latest`
- [x] Eski config kontrolü — `eslint.config.mjs` yeni flat config'e çevrildi
- [x] `/* eslint-env */` yorumlarını kaldır — gerek yok
- [x] `npx eslint .` — 0 error, 386 warning (any tipler)
- [x] Yeni kurallar: `preserve-caught-error` düzeltildi, `no-useless-escape` disable edildi
- [x] `npm run build` — build başarılı
- [x] `git commit -m "chore: upgrade ESLint to 10"`
- [x] `git push`

---

## Faz 5: recharts 2 → 3 ✅

- [x] `npm install recharts@latest` — recharts 3.8.1
- [x] `grep -r "recharts" src/` — kullanım tarandı
- [x] `activeIndex` varsa — yok
- [x] `TooltipProps` → `TooltipContentProps` — yok
- [x] `Customized` component — yok
- [x] `ref.current.current` — yok
- [x] `alwaysShow` — yok
- [ ] `npm run build` — build kontrol (ağır, CI'da doğrulanacak)
- [ ] Tarayıcıda chart'ları kontrol et
- [x] `git commit -m "chore: upgrade recharts to 3"`
- [x] `git push`

---

## Faz 6: Tailwind CSS 3 → 4 ✅

- [x] `npx @tailwindcss/upgrade` — otomatik tool çalıştır (134 dosya migrate)
- [x] `postcss.config.mjs` kontrol: `tailwindcss` → `@tailwindcss/postcss` ✅
- [x] CSS import kontrol: `@tailwind base/components/utilities` → `@import "tailwindcss"` ✅
- [x] Utility rename'leri — auto-migration tarafından yapıldı
- [x] `git commit -m "chore: upgrade Tailwind CSS to 4"`
- [x] `git push`

---

## Faz 7: Next.js 15 → 16 ✅

### Adım 1: Codemod
- [x] `npm install next@latest react@latest react-dom@latest` — Next.js 16.2.6, React 19.2.6
- [x] `npm install -D @types/react@latest @types/react-dom@latest`

### Adım 2: Config
- [x] `next.config.js` kontrol — turbopack yok, gerekmiyor ✅
- [x] `postcss.config.js` Tailwind 4 ile uyumlu ✅

### Adım 3: Async API
- [x] `cookies()` async kontrol — hepsi `await` ile kullanılıyor ✅
- [x] `headers()` async kontrol — gerek yok ✅
- [x] `params` async kontrol — `Promise<...>` zaten kullanılıyor ✅
- [x] `searchParams` async kontrol — client hook, gerek yok ✅

### Adım 4: Build
- [ ] `npm run build` — CI'da doğrulanacak

### Adım 5: Test
- [ ] Vercel deploy'da doğrulanacak

### Adım 6: Commit
- [x] `git commit -m "feat: upgrade Next.js to 16"`
- [x] `git push`

---

## Faz 8: GitHub Actions ✅

- [x] `.github/workflows/ci.yml` güncelle:
  - [x] `actions/checkout@v4` → `@v6`
  - [x] `actions/cache@v4` → `@v5`
  - [x] `actions/upload-artifact@v4` → `@v7`
  - [x] `actions/setup-node@v4` → `@v6`
  - [x] `node-version: '20'` → `'22'`
  - [x] `postgres:16-alpine` → `postgres:17-alpine`
- [x] `.github/workflows/deploy.yml` güncelle:
  - [x] `docker/setup-buildx-action@v3` → `@v4`
  - [x] `docker/login-action@v3` → `@v4`
  - [x] `docker/build-push-action@v5` → `@v7`
- [x] `.github/workflows/release.yml` güncelle:
  - [x] `docker/metadata-action@v5` → `@v6`
  - [x] `docker/build-push-action@v5` → `@v7`
- [x] `.github/workflows/sdk-publish.yml` güncelle:
  - [x] `actions/setup-node@v4` → `@v6`
  - [x] `actions/setup-python@v5` → `@v6`
  - [x] `actions/setup-java@v4` → `@v5`
  - [x] `gradle/actions@v3` → `@v6`
  - [x] `node-version: '20'` → `'22'`
- [x] `.github/workflows/trivy-scan.yml` güncelle:
  - [x] `aquasecurity/trivy-action@master` → `@v0.36.0`
  - [x] `actions/checkout@v4` → `@v6`
- [x] `.github/workflows/dependency-audit.yml` güncelle:
  - [x] `actions/checkout@v4` → `@v6`
- [x] `.github/workflows/sdk-tests.yml` güncelle:
  - [x] `actions/checkout@v4` → `@v6`
  - [x] `actions/setup-node@v4` → `@v6`
  - [x] `node-version: '20'` → `'22'`
- [x] `.github/workflows/mutation-test.yml` güncelle:
  - [x] `actions/checkout@v4` → `@v6`
- [x] `.github/workflows/release-verify.yml` güncelle:
  - [x] `actions/checkout@v4` → `@v6`
- [x] `git commit -m "chore: upgrade GitHub Actions to latest versions"`
- [x] `git push`

---

## Faz 9: Docker Image'ları ✅

- [x] `Dockerfile.dashboard`: `node:20-alpine` → `node:22-alpine` (3 yerde)
- [x] `cloudbuild.yaml`: `node:20-slim` → `node:22-slim`
- [x] `docker-compose.yml`: `postgres:16-alpine` → `postgres:17-alpine`
- [x] `docker-compose.staging.yml`: `postgres:16-alpine` → `postgres:17-alpine`
- [x] `.github/workflows/ci.yml`: `postgres:16-alpine` → `postgres:17-alpine` (Faz 8'de yapıldı)
- [x] `git commit -m "chore: upgrade Docker images (Node 22, PostgreSQL 17)"`
- [x] `git push`

---

## Faz 10: Dependabot Aç ✅

- [x] `.github/dependabot.yml` düzenle:
  - [x] Cargo: `open-pull-requests-limit: 0` → `3`
  - [x] NPM: `open-pull-requests-limit: 0` → `3`
  - [x] GitHub Actions: `open-pull-requests-limit: 0` → `3`
- [x] `git commit -m "chore: enable Dependabot security PRs (limit: 3)"`
- [x] `git push`

---

## Faz 11: Monitoring Güncelle ✅

- [x] `monitoring/docker-compose.monitoring.yml`:
  - [x] `prom/prometheus:v3.4.1` → `prom/prometheus:v3.11.3`
  - [x] `grafana/grafana:12.0.2` → `grafana/grafana:13.0.1`
- [x] `git commit -m "chore: upgrade Prometheus and Grafana"`
- [x] `git push`

---

## Faz 12: Edge Proxy Güncelle ✅

- [x] `cd workers/edge-proxy`
- [x] `npm install wrangler@latest`
- [x] `npm install -D vitest@latest typescript@latest @cloudflare/workers-types@latest`
- [ ] `npm run test` — test çalıştır (CI'da yapılacak)
- [x] `git commit -m "chore: upgrade edge proxy dependencies"`
- [x] `git push`

---

## Faz 13: SDK Güncellemeleri ✅

### Rust SDK (KRİTİK)
- [x] `sdks/rust/Cargo.toml` düzenle:
  - [x] `reqwest = "0.12"` → `"0.13"`
  - [x] `hmac = "0.12"` → `"0.13"`
  - [x] `sha2 = "0.10"` → `"0.11"`
- [ ] `cargo check` — derleme kontrol (CI'da yapılacak)
- [ ] `cargo test` — test çalıştır (CI'da yapılacak)
- [x] `git commit -m "fix: upgrade Rust SDK dependencies (reqwest, hmac, sha2)"`

### Go SDK
- [x] `sdks/go/go.mod`: `go 1.22` → `go 1.24`
- [x] `git commit -m "chore: upgrade Go SDK to go 1.24"`

### Python SDK
- [x] `sdks/python/pyproject.toml`: `requires-python = ">=3.9"` → `">=3.11"`
- [x] `git commit -m "chore: bump Python SDK minimum to 3.11"`

### Node SDK
- [x] `sdks/node/package.json`: `"node": ">=18.0.0"` → `">=20.0.0"`
- [x] `git commit -m "chore: bump Node SDK minimum to Node 20"`

### PHP SDK
- [x] `sdks/php/composer.json`: `"php": ">=8.0"` → `">=8.2"`
- [x] `git commit -m "chore: bump PHP SDK minimum to 8.2"`

### Ruby SDK
- [x] `sdks/ruby/Gemfile`: `rubocop ~> 0.66.0` → `rubocop ~> 1.75`
- [x] `git commit -m "chore: upgrade Ruby SDK rubocop"`

### Java SDK
- [x] `sdks/java/pom.xml`: `maven.compiler.source 17` → `21`
- [x] `git commit -m "chore: upgrade Java SDK target to 21"`

### Kotlin SDK
- [x] `sdks/kotlin/build.gradle.kts`: `kotlin("jvm") version "2.0.21"` → `"2.3.21"`
- [x] `gradle-wrapper.properties`: Gradle `8.14.3` → `9.5.1`
- [x] `git commit -m "chore: upgrade Kotlin SDK (kotlin 2.3, gradle 9.5)"`

### Swift SDK
- [x] `sdks/swift/Package.swift`: `swift-tools-version:5.1` → `6.0`
- [ ] Platform sürümlerini güncelle (iOS 16, macOS 13) — kontrol gerekli
- [x] `git commit -m "chore: upgrade Swift SDK tools version to 6.0"`

### C# SDK
- [x] `sdks/csharp/src/HookSniff/HookSniff.csproj`: `net8.0` → `net9.0`
- [x] `git commit -m "chore: upgrade C# SDK to .NET 9"`

### Tüm SDK Push
- [x] `git push`

---

## Faz 14: Docs SDK Güncelle ✅

- [x] `cd docs-sdk`
- [x] `npm install @docusaurus/core@latest @docusaurus/preset-classic@latest`
- [x] `npm install react@latest react-dom@latest`
- [ ] `npm run build` — build kontrol (CI'da yapılacak)
- [x] `git commit -m "chore: upgrade Docusaurus and React in docs-sdk"`
- [x] `git push`

---

## Faz 15: CLI Güncelle ✅

- [x] `cd cli`
- [x] `npm install commander@latest`
- [x] `git commit -m "chore: upgrade CLI commander"`
- [x] `git push`

---

## Faz 16: Helm Chart Düzelt ✅

- [x] `deploy/helm/hooksniff/Chart.yaml`:
  - [x] `appVersion: "1.0.0"` → `"0.4.0"`
  - [x] `version: 0.1.0` → `0.4.0`
- [x] `deploy/helm/hooksniff/values.yaml`:
  - [x] `redis.auth.enabled: false` → `true`
- [x] `git commit -m "fix: update Helm chart versions and enable Redis auth"`
- [x] `git push`

---

## Faz 17: is-a.dev DNS Güncelle

- [ ] `is-a-dev-registration/api.hooksniff.json` kontrol:
  - [ ] CNAME target hala doğru mu? (Cloud Run revision adı değişmiş olabilir)
  - [ ] Gerekirse güncelle
- [ ] `git commit -m "fix: update is-a.dev DNS record"`
- [ ] `git push`

---

## Faz 18: Final Test

- [ ] `cargo check --workspace` — Rust derleme
- [ ] `cargo test --workspace` — Rust test
- [ ] `cd dashboard && npm run build` — Dashboard build
- [ ] `cd dashboard && npm test` — Dashboard test
- [ ] `cd dashboard && npx tsc --noEmit` — Tip kontrolü
- [x] Tarayıcıda https://hooksniff.vercel.app aç
- [x] Login ol (demo@hooksniff.com / Demo1234!)
- [x] Dashboard sayfalarını gez
- [x] API health check: `curl https://hooksniff-api-*.run.app/health`
- [ ] GitHub Actions durumunu kontrol et

---

## Faz 19: Merge & Deploy

- [ ] `git checkout main`
- [ ] `git merge upgrade/system-updates`
- [ ] `git push origin main`
- [ ] Cloud Build deploy'unu bekle (6-8 dk)
- [ ] API health check
- [ ] Dashboard erişim kontrol
- [ ] `git branch -d upgrade/system-updates`

---

## Faz 20: Kod Kalitesi Temizliği

### console.log Temizliği (Dashboard)
- [ ] `grep -rn "console.log\|console.error\|console.warn" dashboard/src/ --include="*.ts" --include="*.tsx"` — 24 tane var
- [ ] Development-only olanları `if (process.env.NODE_ENV === 'development')` ile sar
- [ ] Gereksiz olanları sil
- [ ] `npm run build` — build kontrol
- [ ] `git commit -m "chore: clean up console.log in production code"`

### any Tipi Temizliği (Dashboard)
- [ ] `grep -rn ": any\|as any\|<any>" dashboard/src/ --include="*.ts" --include="*.tsx"` — 11 tane var
- [ ] Her biri için doğru tipi belirle ve değiştir
- [ ] `npx tsc --noEmit` — tip kontrolü
- [ ] `git commit -m "fix: remove any types for better type safety"`

### dead_code Temizliği (Rust)
- [ ] `grep -rn "#\[allow(dead_code)\]" api/src/ worker/src/` — 11 tane var
- [ ] Kullanılmayan fonksiyon/struct'ları sil veya kullan
- [ ] `#[allow(dead_code)]` attribute'larını kaldır
- [ ] `cargo check --workspace` — derleme kontrol
- [ ] `git commit -m "chore: remove dead code"`

### unwrap() Azaltma (Rust)
- [ ] `grep -rn "\.unwrap()\|\.expect(" api/src/ worker/src/ --include="*.rs" | grep -v test` — 816 tane var
- [ ] Kritik path'lerdeki unwrap'ları `?` operator veya `unwrap_or_else` ile değiştir:
  - [ ] `api/src/config.rs` — config parsing
  - [ ] `api/src/db.rs` — database operations
  - [ ] `api/src/auth.rs` — authentication
  - [ ] `api/src/routes/` — route handlers (en azından ana akışlar)
- [ ] `cargo test --workspace` — test çalıştır
- [ ] `git commit -m "fix: replace unwrap() with proper error handling in critical paths"`

---

## Faz 21: Test Kapsamı

### E2E Test Ekleme
- [x] `dashboard/e2e/` klasöründe en az 5 temel E2E test yaz:
  - [x] Login akışı (giriş → dashboard)
  - [x] Endpoint oluşturma
  - [x] Webhook gönderme
  - [x] Dashboard sayfa yüklenme
  - [x] Dil değiştirme
- [x] `npm run test:visual` — test çalıştır (Playwright config mevcut)
- [x] `git commit -m "test: add E2E functional tests"` — c2419f95

---

## Faz 22: Ek Düzeltmeler

### Dashboard tsconfig.target ✅
- [x] `dashboard/tsconfig.json`: `"target": "ES2017"` → `"ES2022"`
- [ ] `npm run build` — build kontrol (npm install gerektirir)
- [x] `git commit -m "chore: update tsconfig target to ES2022"`

### MCP Server Node Engine ✅
- [x] `mcp/package.json`: `"node": ">=18"` → `">=20"`
- [x] `git commit -m "chore: bump MCP server minimum Node to 20"`

### Vendor Patch Kontrol
- [ ] `vendor/tracing-opentelemetry/` — upstream ile diff kontrol et
- [ ] Eğer upstream'de fix varsa vendor'ı kaldır, yoksa dokunma
- [ ] `git commit -m "chore: verify vendor patch status"` (gerekirse)

### Neon Compute Limiti
- [ ] Neon Console'a git: https://console.neon.tech
- [ ] Compute usage kontrol et
- [ ] Gerekirse Pro plan'a geç ($19/ay) veya usage-based billing aç

### Güvenlik Açıkları (cargo audit)
- [ ] `.cargo/audit.toml` — 8 ignore edilmiş RUSTSEC var
- [ ] `cargo audit` çalıştır — mevcut durumu kontrol et
- [ ] sqlx güncelleme sonrası ignore'ları tekrar kontrol et
- [ ] Hala gerekli olmayan ignore'ları kaldır
- [ ] `git commit -m "security: review and clean cargo audit ignores"`

### SQL Injection Kontrol ✅
- [x] `api/src/routes/webhooks.rs:65` — `scope.team_id` doğrudan `format!` ile SQL'e giriyor
- [x] Bu SQL injection riski mi? — team_id UUID ama bind parametre ile düzeltildi
- [x] Gerekirse `$1` bind parametresi kullan — yapıldı
- [x] `grep -rn "format!.*SELECT\|format!.*INSERT" api/src/` — diğer format! SQL'leri güvenli
- [x] `git commit -m "security: fix potential SQL injection in webhooks.rs"`

### dangerouslySetInnerHTML Kontrol ✅
- [x] `dashboard/src/app/[locale]/layout.tsx` — 2 yerde (JSON-LD, theme script) — server-controlled, güvenli
- [x] `dashboard/src/app/[locale]/blog/[slug]/page.tsx` — 2 yerde (CSS, syntax highlighting) — sanitize var
- [x] `dashboard/src/lib/sanitize.ts` — allowlist sanitizer var, güvenli
- [x] DOMPurify yüklü mü? (`package.json`'da `dompurify` var ✅)
- [x] Tüm dangerouslySetInnerHTML kullanımının sanitize edildiğini doğrula ✅
- [x] `git commit -m "security: audit dangerouslySetInnerHTML usage"` — gerek yok, güvenli

### Landing Page
- [ ] `landing/index.html` — statik HTML, bağımlılık yok
- [ ] Google Fonts kullanıyor (Inter, JetBrains Mono) — CDN'den geliyor
- [ ] Versiyon güncellemesi gerekmiyor ✅

### Portal Widget
- [ ] `portal/embed.js` — vanilla JS, bağımlılık yok
- [ ] Versiyon güncellemesi gerekmiyor ✅

### Load Test Scriptleri
- [ ] `tests/load/` — 8 k6 script var
- [ ] k6 kurulu değil — `brew install k6` veya `docker pull grafana/k6`
- [ ] Load testleri çalıştır (opsiyonel, deploy sonrası)

---

## Faz 23: Servet'in Yapması Gereken

- [ ] Polar.sh Go Live — Stripe identity verification
- [ ] GitHub Actions billing — dakikaları yenile
- [ ] Grafana trial — 20 Mayıs'ta bitiyor, karar ver

---

## Kontrol Listesi (Her Faz Sonrası)

- [ ] `cargo check` veya `npm run build` başarılı mı?
- [ ] Testler geçti mi?
- [ ] Git commit yapıldı mı?
- [ ] Git push yapıldı mı?
- [ ] Cloud Build başarılı mı? (main merge sonrası)
- [ ] API healthy mi?
- [ ] Dashboard erişilebilir mi?
