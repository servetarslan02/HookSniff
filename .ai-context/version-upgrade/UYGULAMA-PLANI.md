# HookSniff — Uygulama Planı

> Oluşturulma: 2026-05-16
> Her adımın yanına ✅ tik atılabilir

---

## Faz 1: Hazırlık

- [ ] Git branch oluştur: `upgrade/system-updates`
- [ ] Mevcut durumu test et: `cargo check --workspace && cd dashboard && npm run build`
- [ ] Neon DB backup al (Console → Branch → Export)

---

## Faz 2: Minor/Patch Güncellemeleri

### Rust
- [ ] `cargo update` çalıştır
- [ ] `cargo check --workspace` — derleme kontrol
- [ ] `cargo test --workspace` — test çalıştır
- [ ] `git commit -m "chore: update Cargo.lock minor patches"`

### Dashboard NPM
- [ ] `cd dashboard && npm update`
- [ ] `next-intl` 4.11 → 4.12 güncelle
- [ ] `vitest` 4.1.5 → 4.1.6 güncelle
- [ ] `dompurify` 3.4.2 → 3.4.3 güncelle
- [ ] `npm run build` — build kontrol
- [ ] `git commit -m "chore: update dashboard minor patches"`

### Push
- [ ] `git push origin upgrade/system-updates`

---

## Faz 3: TypeScript 5 → 6

- [ ] `cd dashboard && npm install -D typescript@latest @types/react@latest @types/react-dom@latest`
- [ ] `npx tsc --noEmit` — tip kontrolü
- [ ] Hataları düzelt (import assert → import with, tip uyumsuzlukları)
- [ ] `npm run build` — build kontrol
- [ ] `git commit -m "chore: upgrade TypeScript to 6.0"`
- [ ] `git push`

---

## Faz 4: ESLint 9 → 10

- [ ] `npm install -D eslint@latest eslint-config-next@latest`
- [ ] Eski config kontrolü (.eslintrc → eslint.config.js)
- [ ] `/* eslint-env */` yorumlarını kaldır (grep ile bul)
- [ ] `npx eslint .` — lint test
- [ ] Yeni kurallar: `no-unassigned-vars`, `no-useless-assignment`, `preserve-caught-error` — hata varsa düzelt
- [ ] `npm run build` — build kontrol
- [ ] `git commit -m "chore: upgrade ESLint to 10"`
- [ ] `git push`

---

## Faz 5: recharts 2 → 3

- [ ] `npm install recharts@latest`
- [ ] `grep -r "recharts" src/` — kullanım tara
- [ ] `activeIndex` varsa Tooltip ile değiştir
- [ ] `TooltipProps` → `TooltipContentProps` güncelle
- [ ] `Customized` component varsa doğrudan render et
- [ ] `ref.current.current` varsa kaldır
- [ ] `alwaysShow` varsa kaldır
- [ ] `npm run build` — build kontrol
- [ ] Tarayıcıda chart'ları kontrol et
- [ ] `git commit -m "chore: upgrade recharts to 3"`
- [ ] `git push`

---

## Faz 6: Tailwind CSS 3 → 4

- [ ] `npx @tailwindcss/upgrade` — otomatik tool çalıştır
- [ ] `postcss.config.mjs` kontrol: `tailwindcss` → `@tailwindcss/postcss`
- [ ] CSS import kontrol: `@tailwind base/components/utilities` → `@import "tailwindcss"`
- [ ] Utility rename'leri kontrol et:
  - [ ] `shadow-sm` → `shadow-xs`
  - [ ] `shadow` → `shadow-sm`
  - [ ] `rounded-sm` → `rounded-xs`
  - [ ] `rounded` → `rounded-sm`
  - [ ] `blur-sm` → `blur-xs`
  - [ ] `ring` → `ring-3`
  - [ ] `outline-none` → `outline-hidden`
- [ ] Border rengi kontrol: `border-*` kullanan yerlerde renk belirtilmiş mi?
- [ ] Ring kontrol: `ring` → `ring-3 ring-blue-500`
- [ ] `npm run build` — build kontrol
- [ ] `npm run dev` — tarayıcıda tüm sayfaları kontrol et
- [ ] `git commit -m "chore: upgrade Tailwind CSS to 4"`
- [ ] `git push`

---

## Faz 7: Next.js 15 → 16

### Adım 1: Codemod
- [ ] `npx @next/codemod@canary upgrade latest` çalıştır
- [ ] `npm install next@latest react@latest react-dom@latest`
- [ ] `npm install -D @types/react@latest @types/react-dom@latest`

### Adım 2: Config
- [ ] `next.config.js` kontrol:
  - [ ] `experimental.turbopack` → top-level `turbopack`
  - [ ] Custom webpack config varsa `--webpack` flag ekle (build script'inde)
- [ ] `postcss.config.js` Tailwind 4 ile uyumlu mu?

### Adım 3: Async API
- [ ] `cookies()` async kullanılıyor mu? Kontrol et
- [ ] `headers()` async kullanılıyor mu? Kontrol et
- [ ] `params` async mi? Kontrol et
- [ ] `searchParams` async mi? Kontrol et
- [ ] Gerekirse manuel düzelt: `const cookieStore = await cookies()`

### Adım 4: Build
- [ ] `npm run build` — build kontrol
- [ ] Hataları düzelt (varsa)
- [ ] Tekrar `npm run build`

### Adım 5: Test
- [ ] `npm run dev` — tarayıcıda aç
- [ ] Login sayfası çalışıyor mu?
- [ ] Dashboard yükleniyor mu?
- [ ] Chart'lar görünüyor mu?
- [ ] Dil değiştirme çalışıyor mu?
- [ ] Mobil görünüm doğru mu?

### Adım 6: Commit
- [ ] `git commit -m "feat: upgrade Next.js to 16"`
- [ ] `git push`

---

## Faz 8: GitHub Actions

- [ ] `.github/workflows/ci.yml` güncelle:
  - [ ] `actions/checkout@v4` → `@v6`
  - [ ] `actions/cache@v4` → `@v5`
  - [ ] `actions/upload-artifact@v4` → `@v7`
  - [ ] `actions/setup-node@v4` → `@v6`
  - [ ] `node-version: '20'` → `'22'`
  - [ ] `postgres:16-alpine` → `postgres:17-alpine`
- [ ] `.github/workflows/deploy.yml` güncelle:
  - [ ] `docker/setup-buildx-action@v3` → `@v4`
  - [ ] `docker/login-action@v3` → `@v4`
  - [ ] `docker/build-push-action@v5` → `@v7`
- [ ] `.github/workflows/release.yml` güncelle:
  - [ ] `docker/metadata-action@v5` → `@v6`
  - [ ] `docker/build-push-action@v5` → `@v7`
- [ ] `.github/workflows/sdk-publish.yml` güncelle:
  - [ ] `actions/setup-node@v4` → `@v6`
  - [ ] `actions/setup-python@v5` → `@v6`
  - [ ] `actions/setup-java@v4` → `@v5`
  - [ ] `gradle/actions@v3` → `@v6`
  - [ ] `node-version: '20'` → `'22'`
- [ ] `.github/workflows/trivy-scan.yml` güncelle:
  - [ ] `aquasecurity/trivy-action@master` → `@v0.36.0`
  - [ ] `actions/checkout@v4` → `@v6`
- [ ] `.github/workflows/dependency-audit.yml` güncelle:
  - [ ] `actions/checkout@v4` → `@v6`
- [ ] `.github/workflows/sdk-tests.yml` güncelle:
  - [ ] `actions/checkout@v4` → `@v6`
  - [ ] `actions/setup-node@v4` → `@v6`
  - [ ] `node-version: '20'` → `'22'`
- [ ] `.github/workflows/mutation-test.yml` güncelle:
  - [ ] `actions/checkout@v4` → `@v6`
- [ ] `.github/workflows/release-verify.yml` güncelle:
  - [ ] `actions/checkout@v4` → `@v6`
- [ ] `git commit -m "chore: upgrade GitHub Actions to latest versions"`
- [ ] `git push`

---

## Faz 9: Docker Image'ları

- [ ] `Dockerfile.dashboard`: `node:20-alpine` → `node:22-alpine` (3 yerde)
- [ ] `cloudbuild.yaml`: `node:20-slim` → `node:22-slim`
- [ ] `docker-compose.yml`: `postgres:16-alpine` → `postgres:17-alpine`
- [ ] `docker-compose.staging.yml`: `postgres:16-alpine` → `postgres:17-alpine`
- [ ] `.github/workflows/ci.yml`: `postgres:16-alpine` → `postgres:17-alpine` (Faz 8'de yapıldıysa atla)
- [ ] `git commit -m "chore: upgrade Docker images (Node 22, PostgreSQL 17)"`
- [ ] `git push`

---

## Faz 10: Dependabot Aç

- [ ] `.github/dependabot.yml` düzenle:
  - [ ] Cargo: `open-pull-requests-limit: 0` → `3`
  - [ ] NPM: `open-pull-requests-limit: 0` → `3`
  - [ ] GitHub Actions: `open-pull-requests-limit: 0` → `3`
- [ ] `git commit -m "chore: enable Dependabot security PRs (limit: 3)"`
- [ ] `git push`

---

## Faz 11: Monitoring Güncelle

- [ ] `monitoring/docker-compose.monitoring.yml`:
  - [ ] `prom/prometheus:v3.4.1` → `prom/prometheus:v3.11.3`
  - [ ] `grafana/grafana:12.0.2` → `grafana/grafana:13.0.1`
- [ ] `git commit -m "chore: upgrade Prometheus and Grafana"`
- [ ] `git push`

---

## Faz 12: Edge Proxy Güncelle

- [ ] `cd workers/edge-proxy`
- [ ] `npm install wrangler@latest`
- [ ] `npm install -D vitest@latest typescript@latest @cloudflare/workers-types@latest`
- [ ] `npm run test` — test çalıştır
- [ ] `git commit -m "chore: upgrade edge proxy dependencies"`
- [ ] `git push`

---

## Faz 13: SDK Güncellemeleri

### Rust SDK (KRİTİK)
- [ ] `sdks/rust/Cargo.toml` düzenle:
  - [ ] `reqwest = "0.12"` → `"0.13"`
  - [ ] `hmac = "0.12"` → `"0.13"`
  - [ ] `sha2 = "0.10"` → `"0.11"`
- [ ] `cargo check` — derleme kontrol
- [ ] `cargo test` — test çalıştır
- [ ] `git commit -m "fix: upgrade Rust SDK dependencies (reqwest, hmac, sha2)"`

### Go SDK
- [ ] `sdks/go/go.mod`: `go 1.22` → `go 1.24`
- [ ] `git commit -m "chore: upgrade Go SDK to go 1.24"`

### Python SDK
- [ ] `sdks/python/pyproject.toml`: `requires-python = ">=3.9"` → `">=3.11"`
- [ ] `git commit -m "chore: bump Python SDK minimum to 3.11"`

### Node SDK
- [ ] `sdks/node/package.json`: `"node": ">=18.0.0"` → `">=20.0.0"`
- [ ] `git commit -m "chore: bump Node SDK minimum to Node 20"`

### PHP SDK
- [ ] `sdks/php/composer.json`: `"php": ">=8.0"` → `">=8.2"`
- [ ] `git commit -m "chore: bump PHP SDK minimum to 8.2"`

### Ruby SDK
- [ ] `sdks/ruby/Gemfile`: `rubocop ~> 0.66.0` → `rubocop ~> 1.75`
- [ ] `git commit -m "chore: upgrade Ruby SDK rubocop"`

### Java SDK
- [ ] `sdks/java/pom.xml`: `maven.compiler.source 17` → `21`
- [ ] `git commit -m "chore: upgrade Java SDK target to 21"`

### Kotlin SDK
- [ ] `sdks/kotlin/build.gradle.kts`: `kotlin("jvm") version "2.0.21"` → `"2.3.21"`
- [ ] `gradle-wrapper.properties`: Gradle `8.14.3` → `9.5.1`
- [ ] `git commit -m "chore: upgrade Kotlin SDK (kotlin 2.3, gradle 9.5)"`

### Swift SDK
- [ ] `sdks/swift/Package.swift`: `swift-tools-version:5.1` → `6.0`
- [ ] Platform sürümlerini güncelle (iOS 16, macOS 13)
- [ ] `git commit -m "chore: upgrade Swift SDK tools version to 6.0"`

### C# SDK
- [ ] `sdks/csharp/src/HookSniff/HookSniff.csproj`: `net8.0` → `net9.0`
- [ ] `git commit -m "chore: upgrade C# SDK to .NET 9"`

### Tüm SDK Push
- [ ] `git push`

---

## Faz 14: Docs SDK Güncelle

- [ ] `cd docs-sdk`
- [ ] `npm install @docusaurus/core@latest @docusaurus/preset-classic@latest`
- [ ] `npm install react@latest react-dom@latest`
- [ ] `npm run build` — build kontrol
- [ ] `git commit -m "chore: upgrade Docusaurus and React in docs-sdk"`
- [ ] `git push`

---

## Faz 15: CLI Güncelle

- [ ] `cd cli`
- [ ] `npm install commander@latest`
- [ ] `git commit -m "chore: upgrade CLI commander"`
- [ ] `git push`

---

## Faz 16: Helm Chart Düzelt

- [ ] `deploy/helm/hooksniff/Chart.yaml`:
  - [ ] `appVersion: "1.0.0"` → `"0.4.0"`
  - [ ] `version: 0.1.0` → `0.4.0`
- [ ] `deploy/helm/hooksniff/values.yaml`:
  - [ ] `redis.auth.enabled: false` → `true`
- [ ] `git commit -m "fix: update Helm chart versions and enable Redis auth"`
- [ ] `git push`

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
- [ ] Tarayıcıda https://hooksniff.vercel.app aç
- [ ] Login ol (demo@hooksniff.com / Demo1234!)
- [ ] Dashboard sayfalarını gez
- [ ] API health check: `curl https://hooksniff-api-*.run.app/health`
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
- [ ] `dashboard/e2e/` klasöründe en az 5 temel E2E test yaz:
  - [ ] Login akışı (giriş → dashboard)
  - [ ] Endpoint oluşturma
  - [ ] Webhook gönderme
  - [ ] Dashboard sayfa yüklenme
  - [ ] Dil değiştirme
- [ ] `npm run test:visual` — test çalıştır
- [ ] `git commit -m "test: add critical E2E tests"`

---

## Faz 22: Ek Düzeltmeler

### Dashboard tsconfig.target
- [ ] `dashboard/tsconfig.json`: `"target": "ES2017"` → `"ES2022"`
- [ ] `npm run build` — build kontrol
- [ ] `git commit -m "chore: update tsconfig target to ES2022"`

### MCP Server Node Engine
- [ ] `mcp/package.json`: `"node": ">=18"` → `">=20"`
- [ ] `git commit -m "chore: bump MCP server minimum Node to 20"`

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

### SQL Injection Kontrol
- [ ] `api/src/routes/webhooks.rs:65` — `scope.team_id` doğrudan `format!` ile SQL'e giriyor
- [ ] Bu SQL injection riski mi? (team_id UUID olmalı ama kontrol et)
- [ ] Gerekirse `$1` bind parametresi kullan
- [ ] `grep -rn "format!.*SELECT\|format!.*INSERT" api/src/` — diğer format! SQL'leri kontrol et
- [ ] `git commit -m "security: fix potential SQL injection in webhooks.rs"`

### dangerouslySetInnerHTML Kontrol
- [ ] `dashboard/src/app/[locale]/layout.tsx` — 2 yerde (JSON-LD, theme script)
- [ ] `dashboard/src/app/[locale]/blog/[slug]/page.tsx` — 2 yerde (CSS, syntax highlighting)
- [ ] `dashboard/src/lib/sanitize.ts` — allowlist sanitizer var, kontrol et
- [ ] DOMPurify yüklü mü? (`package.json`'da `dompurify` var ✅)
- [ ] Tüm dangerouslySetInnerHTML kullanımının sanitize edildiğini doğrula
- [ ] `git commit -m "security: audit dangerouslySetInnerHTML usage"`

### Servet Ek Görevler (TODO.md'den)
- [ ] iyzico hesap aç (vergi levhası + banka hesabı gerekli)
- [ ] Domain kararı (hooksniff.vercel.app yeterli şimdilik)
- [ ] GCP SA key rotate (yeni key oluştur)
- [ ] GitHub PAT rotate (yeni token oluştur)

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
