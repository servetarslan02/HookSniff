# HookSniff — CI/CD Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulandı)
> Durum: Taslak
> Kaynaklar: HookSniff .github/workflows/, scripts/ci-local.sh, GitHub Actions Pricing 2026, Jenkins vs GitHub Actions vs GitLab CI 2026

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Neden CI/CD Önemli?](#2-neden-cicd-önemli)
3. [Mevcut Pipeline Analizi](#3-mevcut-pipeline-analizi)
4. [CI/CD Karşılaştırması](#4-cicd-karşılaştırması)
5. [Strateji: Local CI + Selective GitHub Actions](#5-strateji-local-ci--selective-github-actions)
6. [Pipeline Tasarımı](#6-pipeline-tasarımı)
7. [Deployment Stratejisi](#7-deployment-stratejisi)
8. [Test Stratejisi](#8-test-stratejisi)
9. [Güvenlik ve Kalite Kapıları](#9-güvenlik-ve-kalite-kapıları)
10. [Otomasyon ve Enstrümantasyon](#10-otomasyon-ve-enstrümantasyon)
11. [Uygulama Planı](#11-uygulama-planı)
12. [Kaynaklar](#12-kaynaklar)

---

## 1. Mevcut Durum

### 1.1 CI/CD Envanteri

| Bileşen | Teknoloji | Durum | Not |
|---------|-----------|-------|-----|
| CI (test/lint) | GitHub Actions (ci.yml) | ⚠️ Devre dışı | Dakika limiti + billing |
| CI (local alternatif) | scripts/ci-local.sh | ✅ Aktif | 6 step: fmt, clippy, test, build, dashboard |
| Deploy (API) | GitHub Actions (deploy.yml) | ⚠️ Devre dışı | Cloud Build trigger kurulmalı |
| Deploy (Dashboard) | Vercel auto-deploy | ✅ Aktif | Git push → auto-deploy |
| Deploy (Worker) | GitHub Actions (deploy.yml) | ⚠️ Devre dışı | Cloud Build trigger kurulmalı |
| Release | GitHub Actions (release.yml) | ⚠️ Devre dışı | Version bump + changelog |
| Security audit | cargo audit | ✅ CI'da | Dependency vulnerability scan |
| SDK publish | Manuel scriptler | ✅ Aktif | 11 SDK, her biri için script |

### 1.2 GitHub Actions Workflow'ları

#### ci.yml (3171 satır — kapsamlı)

```yaml
# Mevcut adımlar:
# 1. Lint: cargo fmt + clippy
# 2. Test: cargo test (PostgreSQL service container ile)
# 3. Build API: cargo build --release
# 4. Build Worker: cargo build --release
# 5. Dashboard: npm ci + npm run lint + npm run build
# 6. Security: cargo audit
```

**Güçlü yönler:**
- ✅ PostgreSQL service container (test DB)
- ✅ Cargo cache (build hızı)
- ✅ Concurrency control (cancel-in-progress)
- ✅ Separated jobs (lint, test, build)

**Sorun:**
- ❌ GitHub Actions dakika limiti aşıldı
- ❌ Billing sorunları

#### deploy.yml

```yaml
# Mevcut adımlar:
# 1. Build Docker image
# 2. Push to Google Container Registry
# 3. Deploy to Cloud Run
# 4. Health check validation
```

**Sorun:**
- ❌ Cloud Build trigger kurulmamış
- ❌ GCP SA key rotation gerekli

### 1.3 Local CI Script (scripts/ci-local.sh)

```bash
# 6 step:
# 1. cargo fmt --check        → Format kontrolü
# 2. cargo clippy -D warnings → Lint
# 3. cargo test               → Test
# 4. cargo build --release    → Release build
# 5. npm run lint             → Dashboard lint
# 6. npm run build            → Dashboard build
```

**Değerlendirme:** İyi bir alternatif ama manuel çalıştırılıyor, otomatik tetikleme yok.

---

## 2. Neden CI/CD Önemli?

### 2.1 CI/CD Olmadan Ne Olur?

| Risk | Etki | Olasılık |
|------|------|----------|
| Bozuk kod production'a gider | Müşteri kaybı | Yüksek |
| Test çalıştırılmadan deploy | Sessiz hatalar | Yüksek |
| Manuel deploy hatası | Downtime | Orta |
| Güvenlik açığı tespit edilmez | İhlal riski | Orta |
| Rollback süresi uzar | Downtime artar | Yüksek |

### 2.2 CI/CD ile Ne Kazanılır?

| Kazanım | Etki |
|---------|------|
| Her push otomatik test | Hatalar erken yakalanır |
| Otomatik deploy | İnsan hatası sıfır |
| Rollback tek tıkla | Downtime minimize |
| Security scan otomatik | Güvenlik proaktif |
| Code quality gates | Kod kalitesi garantili |

---

## 3. Mevcut Pipeline Analizi

### 3.1 Pipeline Akışı (Hedef)

```
Developer → Git Push → CI Pipeline → Quality Gates → Deploy Pipeline → Production
                         │                │
                    ┌────┴────┐     ┌─────┴─────┐
                    │  Tests  │     │  Security  │
                    │  Lint   │     │  Quality   │
                    │  Build  │     │  Coverage  │
                    └─────────┘     └───────────┘
```

### 3.2 Mevcut vs Hedef

| Aşama | Mevcut | Hedef | Fark |
|-------|--------|-------|------|
| Push trigger | ⚠️ Devre dışı | ✅ Her push | CI aktifleştir |
| Format check | ✅ Local | ✅ Otomatik | Otomasyon |
| Lint (clippy) | ✅ Local | ✅ Otomatik | Otomasyon |
| Unit test | ✅ Local | ✅ Otomatik | Otomasyon |
| Integration test | ⚠️ Manuel | ✅ Otomatik | Yeni |
| Security audit | ✅ CI'da | ✅ Otomatik | Otomasyon |
| Build | ✅ Local | ✅ Otomatik | Otomasyon |
| Dashboard test | ✅ Local | ✅ Otomatik | Otomasyon |
| Deploy (API) | ❌ Manuel | ✅ Otomatik | Yeni |
| Deploy (Dashboard) | ✅ Vercel | ✅ Vercel | Mevcut |
| Deploy (Worker) | ❌ Manuel | ✅ Otomatik | Yeni |
| Rollback | ❌ Manuel | ✅ Tek tıkla | Yeni |
| Smoke test | ❌ Yok | ✅ Otomatik | Yeni |

---

## 4. CI/CD Karşılaştırması

> Kaynak: Jenkins vs GitHub Actions vs GitLab CI 2026 (EITT Academy, 2026-04-01, doğrulanmış), GitHub Actions Pricing 2026 (Reddit, 2026-03, doğrulanmış)

### 4.1 Platform Karşılaştırması

| Özellik | GitHub Actions | GitLab CI | Jenkins | Local CI |
|---------|---------------|-----------|---------|----------|
| Fiyat | Free: 2K dk/ay (private) | Free: 400 dk/ay | $0 (self-hosted) | $0 |
| Setup | ✅ Kolay (YAML) | ✅ Kolay | ❌ Zor | ✅ Kolay |
| Bakım | ✅ Sıfır | ✅ Sıfır | ❌ Yüksek | ⚠️ Manuel |
| Runner | ✅ Hosted | ✅ Hosted | ❌ Self-hosted | ✅ Local |
| Marketplace | ✅ 20K+ action | ✅ 1K+ | ✅ 1K+ plugin | ❌ Yok |
| Docker support | ✅ | ✅ | ✅ | ✅ |
| Caching | ✅ Cargo, npm | ✅ | ✅ | ❌ |
| Matrix build | ✅ | ✅ | ✅ | ❌ |
| OIDC (keyless) | ✅ | ✅ | ❌ | ❌ |

### 4.2 GitHub Actions Pricing (2026)

> Kaynak: Reddit r/programming — "Starting March 1, 2026, GitHub will introduce a new $0.002 per..." (2025-12-16, doğrulanmış), GitHub Docs — Actions billing (2026, doğrulanmış)

| Plan | Free Minutes (Private Repo) | Free Minutes (Public Repo) | Storage | Ücret |
|------|---------------------------|---------------------------|---------|-------|
| Free | 2,000 dk/ay (Linux) | **Sınırsız** | 500 MB | $0 |
| Pro | 3,000 dk/ay | **Sınırsız** | 1 GB | $4/ay |
| Team | 3,000 dk/ay | **Sınırsız** | 2 GB | $4/kullanıcı/ay |
| Enterprise | 50,000 dk/ay | **Sınırsız** | 50 GB | $21/kullanıcı/ay |

> ⚠️ **Mart 2026 değişikliği:** GitHub, self-hosted runner'lar için private repo'larda **$0.002/dk** ücret getirdi. Bu, self-hosted runner stratejisini etkileyebilir.

### ⚠️ KRİTİK BULGU: Repo Private!

**HookSniff reposu şu an PRIVATE.** Bu şu anlama geliyor:
- GitHub Actions: **2,000 dk/ay limit** (aşılmış durumda!)
- Public olsa: **Sınırsız ücretsiz dakika**

**Seçenekler:**

| Seçenek | Etki | Risk |
|---------|------|------|
| **A) Repo'yu public yap** | ✅ Sınırsız GHA dakika, $0 | ⚠️ Kod herkese açık olur (açık kaynak yapabilir) |
| **B) Repo private kalsın** | ❌ 2K dk/ay limit, aşılmış | ✅ Kod gizli kalır |
| **C) Hybrid: Public CI repo + Private code repo** | ✅ CI sınırsız, kod gizli | ⚠️ İki repo yönetmek gerek |

**Öneri:** Eğer HookSniff açık kaynak olacaksa → public yap (Svix da open-source). Eğer değilse → Cloud Build veya local CI ile devam.

### 4.3 Seçenek Analizi

| Seçenek | Maliyet | Avantaj | Dezavantaj |
|---------|---------|---------|------------|
| **A) GitHub Actions (limit dahilinde)** | $0 | Kolay, mevcut workflow | Dakika limiti |
| **B) Local CI (mevcut)** | $0 | Limit yok, hızlı | Manuel, trigger yok |
| **C) Google Cloud Build** | $0 (120 dk/gün) | Deploy için ideal | CI için pahalı |
| **D) Self-hosted runner** | $0 (VPS varsa) | Sınırsız | Bakım gerekli |
| **E) Hybrid: Local CI + Selective GHA** | $0 | En iyi denge | Kompleks |

---

## 5. Strateji: Local CI + Selective GitHub Actions

### 5.1 Karar: Hybrid Yaklaşım

**Neden hybrid?**
- Repo **private** → GitHub Actions 2K dk/ay limit (aşılmış!)
- Local CI hızlı ama manuel
- Cloud Build deploy için ideal (120 dk/gün free)
- **Repo public yapılırsa → GHA sınırsız, local CI'a gerek kalmaz**

**Karar ağacı:**
```
Repo public mu?
    │
    ├── Evet → GitHub Actions (sınırsız, $0) → Tercih edilen
    │
    └── Hayır → Hybrid: Local CI + Cloud Build
                ├── Pre-commit: Local CI
                ├── PR/CI: Cloud Build (120 dk/gün)
                └── Deploy: Cloud Build
```

### 5.2 Strateji Tablosu

| Aşama | Araç | Tetikleyici | Dakika Kullanımı |
|-------|------|-------------|-----------------|
| **Pre-commit** | Local CI (ci-local.sh) | Developer manuel | 0 (local) |
| **PR Check** | GitHub Actions (kısa) | PR açıldığında | ~5 dk/PR |
| **Full CI** | GitHub Actions (tam) | main branch merge | ~15 dk/merge |
| **Deploy (API)** | Cloud Build | CI başarılı + main | ~10 dk/deploy |
| **Deploy (Dashboard)** | Vercel | Git push | 0 (Vercel free) |
| **Deploy (Worker)** | Cloud Build | CI başarılı + main | ~10 dk/deploy |
| **SDK Publish** | Manuel script | Servet onayı | 0 (local) |

### 5.3 Dakika Bütçesi (Aylık)

#### Senaryo A: Repo Private (Mevcut)

```
GitHub Actions Free: 2,000 dk/ay (PRIVATE repos)

Tahmini kullanım:
  - PR checks: ~20 PR × 5 dk = 100 dk
  - Full CI: ~10 merge × 15 dk = 150 dk
  - Release CI: ~2 × 20 dk = 40 dk
  ────────────────────────────
  Toplam: ~290 dk/ay (%14.5 kullanım) ✅ limit dahilinde

Cloud Build Free: 120 dk/gün = 3,600 dk/ay

Tahmini kullanım:
  - API deploy: ~10 × 10 dk = 100 dk
  - Worker deploy: ~10 × 10 dk = 100 dk
  ────────────────────────────
  Toplam: ~200 dk/ay (%5.5 kullanım) ✅
```

#### Senaryo B: Repo Public (Önerilen)

```
GitHub Actions: SINIRSIZ dk/ay (PUBLIC repos) ✅

Tahmini kullanım:
  - PR checks: ~20 PR × 5 dk = 100 dk
  - Full CI: ~10 merge × 15 dk = 150 dk
  - Release CI: ~2 × 20 dk = 40 dk
  - Deploy: ~10 × 10 dk = 100 dk
  ────────────────────────────
  Toplam: ~390 dk/ay (sınırsız, $0) ✅

Cloud Build: Gerek yok (GitHub Actions deploy da yapar)
```

**Sonuç:** Repo public yapılırsa Cloud Build'e bile gerek kalmaz. $0 bütçeyle sınırsız CI/CD.

---

## 6. Pipeline Tasarımı

### 6.1 Pre-Commit Pipeline (Local)

```bash
#!/bin/bash
# .git/hooks/pre-commit (opsiyonel)
# veya: npm run pre-commit

echo "🔍 Pre-commit checks..."
cargo fmt --check || { echo "❌ Format failed. Run: cargo fmt"; exit 1; }
cargo clippy -- -D warnings || { echo "❌ Clippy failed"; exit 1; }
echo "✅ Pre-commit passed"
```

### 6.2 PR Pipeline (GitHub Actions — Hafif)

```yaml
# .github/workflows/pr-check.yml
name: PR Check
on:
  pull_request:
    branches: [main]

jobs:
  quick-check:
    runs-on: ubuntu-latest
    timeout-minutes: 5
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
        with:
          components: rustfmt, clippy
      - uses: actions/cache@v4
        with:
          path: target/
          key: pr-${{ hashFiles('**/Cargo.lock') }}
      - run: cargo fmt --all -- --check
      - run: cargo clippy --workspace --all-targets -- -D warnings
```

**Süre:** ~3-5 dakika
**Dakika kullanımı:** ~5 dk/PR

### 6.3 Full CI Pipeline (GitHub Actions — Tam)

```yaml
# .github/workflows/ci.yml (mevcut, optimize edilmiş)
name: CI
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  lint:
    # ... (mevcut)
  test:
    # ... (mevcut, PostgreSQL service container)
  build:
    needs: [lint, test]
    # ... (mevcut)
  dashboard:
    # ... (mevcut)
  security:
    # ... (cargo audit)
```

**Süre:** ~10-15 dakika
**Dakika kullanımı:** ~15 dk/merge

### 6.4 Deploy Pipeline (Cloud Build)

```yaml
# cloudbuild.yaml (mevcut, iyileştirilmiş)
steps:
  # 1. Build API Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/hooksniff-api', '-f', 'Dockerfile.api', '.']

  # 2. Push to Container Registry
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/hooksniff-api']

  # 3. Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'hooksniff-api'
      - '--image'
      - 'gcr.io/$PROJECT_ID/hooksniff-api'
      - '--region'
      - 'europe-west1'
      - '--platform'
      - 'managed'

  # 4. Health check
  - name: 'curlimages/curl'
    args: ['curl', '-f', 'https://hooksniff-api-*.run.app/health']
```

**Süre:** ~8-10 dakika
**Dakika kullanımı:** ~10 dk/deploy (Cloud Build free tier)

### 6.5 Dashboard Deploy (Vercel)

```
Git Push → GitHub Webhook → Vercel Build → Deploy
Süre: ~2-3 dakika
Maliyet: $0 (Vercel free tier, 100 deploy/gün)
```

---

## 7. Deployment Stratejisi

### 7.1 Deploy Flow

```
main branch merge
       │
       ▼
  ┌──────────┐
  │ CI Pass? │
  └────┬─────┘
       │
  ┌────┴────┐
  │         │
 Evet      Hayır
  │         │
  ▼         ▼
Deploy    Block
  │
  ├─→ Cloud Build → API (Cloud Run)
  ├─→ Cloud Build → Worker (Cloud Run)
  └─→ Vercel → Dashboard (otomatik)
```

### 7.2 Rollback Stratejisi

| Servis | Rollback Yöntemi | Süre |
|--------|------------------|------|
| API (Cloud Run) | `gcloud run services update-traffic --to-revisions=LATEST-1=100` | 30 sn |
| Worker (Cloud Run) | Aynı yöntem | 30 sn |
| Dashboard (Vercel) | Vercel Dashboard → Redeploy previous | 1 dk |
| Database | Neon PITR | 2-5 dk |

### 7.3 Blue-Green Deploy (İleri Seviye)

```
Mevcut: Rolling update (Cloud Run default)
Hedef:  Blue-Green (zero downtime)

Adımlar:
1. Yeni revision'ı deploy (blue)
2. Health check başarılı mı?
3. Trafik %10 → %50 → %100 kaydır
4. Eski revision'ı kapat (green)

Cloud Run'da built-in:
  gcloud run services update-traffic hooksniff-api \
    --to-revisions=NEW_REVISION=10
```

**Not:** Cloud Run zaten rolling update yapıyor. Blue-green $0 bütçede gereksiz.

---

## 8. Test Stratejisi

### 8.1 Test Pyramid

```
         ┌─────────┐
         │  E2E    │  ← Az, yavaş, pahalı
         │ (5-10)  │
         ├─────────┤
         │ Integr. │  ← Orta, orta hız
         │ (50-100)│
         ├─────────┤
         │  Unit   │  ← Çok, hızlı, ucuz
         │(1000+)  │
         └─────────┘
```

### 8.2 Mevcut Test Durumu

| Test Türü | Sayı | Kapsam | Durum |
|-----------|------|--------|-------|
| Rust unit tests | 952 | Tüm modüller | ✅ Mükemmel |
| Dashboard tests (Vitest) | 426 | Tüm sayfalar | ✅ Mükemmel |
| Integration tests | ~50 | API endpoints | ✅ İyi |
| E2E tests | ❌ Yok | — | ❌ Gerekli |
| Load tests | Script var | k6 | ⚠️ Çalıştırılmamış |
| **TOPLAM** | **1,378+** | | ✅ |

### 8.3 Test CI Entegrasyonu

| Test | CI Aşaması | Süre | Zorunlu mu? |
|------|-----------|------|-------------|
| cargo fmt | PR check | 30 sn | ✅ Evet |
| cargo clippy | PR check | 1 dk | ✅ Evet |
| cargo test (unit) | Full CI | 3 dk | ✅ Evet |
| cargo test (integration) | Full CI | 5 dk | ✅ Evet |
| npm run test (dashboard) | Full CI | 2 dk | ✅ Evet |
| cargo audit (security) | Full CI | 30 sn | ✅ Evet |
| k6 load test | Manual / weekly | 10 dk | ❌ Opsiyonel |
| Playwright E2E | Full CI (gelecek) | 5 dk | ❌ Opsiyonel |

---

## 9. Güvenlik ve Kalite Kapıları

### 9.1 Quality Gates

```
PR → CI → Quality Gates → Merge
              │
    ┌─────────┼─────────┐
    │         │         │
 Format    Test      Security
  Gate      Gate       Gate
    │         │         │
  ✅/❌    ✅/❌     ✅/❌
    │         │         │
    └─────────┴─────────┘
              │
         All Pass?
           │
      ┌────┴────┐
      │         │
     Evet      Hayır
      │         │
    Merge     Block
```

### 9.2 Quality Gate Tanımları

| Gate | Kriter | Block? |
|------|--------|--------|
| Format | `cargo fmt --check` temiz | ✅ Evet |
| Lint | `cargo clippy -D warnings` temiz | ✅ Evet |
| Test | Tüm testler geçiyor | ✅ Evet |
| Build | `cargo build --release` başarılı | ✅ Evet |
| Dashboard | `npm run build` başarılı | ✅ Evet |
| Security | `cargo audit` — 0 critical | ✅ Evet |
| Coverage | Test coverage ≥ %90 | ⚠️ Warning (block değil) |
| Performance | Load test geçiyor | ❌ Manuel kontrol |

### 9.3 Branch Protection Rules

```yaml
# GitHub Branch Protection (main branch)
required_status_checks:
  strict: true
  contexts:
    - lint
    - test
    - build
    - dashboard
    - security
enforce_admins: true
required_pull_request_reviews:
  required_approving_review_count: 0  # Tek kişilik ekip
restrictions: null
```

**Not:** Servet tek kişilik ekip olduğu için PR review zorunlu değil. Ama quality gates zorunlu.

---

## 10. Otomasyon ve Enstrümantasyon

### 10.1 Otomatik Tetikleyiciler

| Tetikleyici | Aksiyon | Araç |
|-------------|---------|------|
| `git push main` | Full CI + Deploy | GitHub Actions + Cloud Build |
| `git push` (PR branch) | PR Check | GitHub Actions |
| `git tag v*` | Release build + SDK publish | GitHub Actions (gelecek) |
| `dependabot PR` | Security check + auto-merge | GitHub Actions |
| `schedule (haftalık)` | Load test + security scan | GitHub Actions (cron) |

### 10.2 Bildirimler

| Event | Kanal | İçerik |
|-------|-------|--------|
| CI başarılı | Discord | ✅ "Build #123 passed" |
| CI başarısız | Discord + Email | ❌ "Build #123 failed — [link]" |
| Deploy başarılı | Discord | 🚀 "API v0.5.0 deployed" |
| Deploy başarısız | Discord + Email | 🔴 "Deploy failed — [link]" |
| Security alert | Email | 🔒 "Vulnerability found in [package]" |

### 10.3 Monitoring Entegrasyonu

```
CI/CD Pipeline → Grafana Cloud

Metrics:
  - ci_build_duration_seconds
  - ci_build_success_total
  - ci_build_failure_total
  - deploy_duration_seconds
  - deploy_success_total
  - test_coverage_ratio
```

---

## 11. Uygulama Planı

### Faz 1: CI Aktifleştirme (1 gün)

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | PR Check workflow oluştur (hafif) | 30 dk | ❌ |
| 2 | Mevcut ci.yml optimize et | 1 saat | ❌ |
| 3 | Branch protection rules kur | 15 dk | ❌ |
| 4 | Discord notification ekle | 30 dk | ❌ |
| 5 | dakika bütçesi hesapla + doğrula | 15 dk | ❌ |

### Faz 2: Deploy Otomasyonu (1-2 gün)

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | Cloud Build trigger kur (API) | 1 saat | ❌ |
| 2 | Cloud Build trigger kur (Worker) | 30 dk | ❌ |
| 3 | Deploy notification ekle | 30 dk | ❌ |
| 4 | Rollback script yaz | 30 dk | ❌ |
| 5 | Deploy smoke test ekle | 1 saat | ❌ |

### Faz 3: İyileştirmeler (1 gün)

| # | Görev | Süre | Durum |
|---|-------|------|-------|
| 1 | Dependabot auto-merge kur | 30 dk | ❌ |
| 2 | Weekly security scan cron | 30 dk | ❌ |
| 3 | CI metrics → Grafana | 1 saat | ❌ |
| 4 | Release automation (tag → publish) | 1 saat | ❌ |

**Toplam süre:** 3-4 gün
**Toplam maliyet:** $0

---

## 12. Kaynaklar

| # | Kaynak | URL | Doğrulama |
|---|--------|-----|-----------|
| 1 | GitHub Actions Pricing 2026 | reddit.com/r/programming (2025-12-16) | ✅ |
| 2 | Jenkins vs GitHub Actions vs GitLab CI 2026 | eitt.academy (2026-04-01) | ✅ |
| 3 | Google Cloud Build Free Tier | cloud.google.com/build/pricing | ✅ 2026 |
| 4 | Vercel Deploy Limits | vercel.com/docs/limits | ✅ 2026 |
| 5 | GitHub Branch Protection | docs.github.com/en/pull-requests | ✅ 2026 |
| 6 | Cargo Cache (GitHub Actions) | github.com/actions/cache | ✅ 2026 |
| 7 | Dependabot | github.com/dependabot | ✅ 2026 |
| 8 | HookSniff ci.yml | .github/workflows/ci.yml | ✅ Mevcut |
| 9 | HookSniff deploy.yml | .github/workflows/deploy.yml | ✅ Mevcut |
| 10 | HookSniff ci-local.sh | scripts/ci-local.sh | ✅ Mevcut |
| 11 | HookSniff cloudbuild.yaml | cloudbuild.yaml | ✅ Mevcut |
