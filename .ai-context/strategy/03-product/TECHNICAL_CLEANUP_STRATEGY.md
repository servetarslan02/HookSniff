# HookSniff — Teknik Temizlik Raporu

> Oluşturma: 2026-05-09
> Durum: Taslak — Servet onayı bekliyor
> Kapsam: SDK yönetimi, .ai-context temizliği, GCP SA key, GitHub PAT, npm token

---

## İçindekiler

1. [SDK Yönetimi](#1-sdk-yönetimi)
2. [.ai-context Dosya Temizliği](#2-ai-context-dosya-temizliği)
3. [GCP Service Account Key](#3-gcp-service-account-key)
4. [GitHub PAT](#4-github-pat)
5. [npm Token](#5-npm-token)
6. [Rakip Karşılaştırması](#6-rakip-karşılaştırması)
7. [Öncelik Sırası ve Aksiyon Planı](#7-öncelik-sırası-ve-aksıyon-planı)
8. [Tüm Token ve Secret Envanteri](#8-tüm-token-ve-secret-envanteri)
9. [WIF Kurulum Rehberi ve Rollback Planı](#9-wif-kurulum-rehberi-ve-rollback-planı)
10. [Token Rotate Sırası ve Bağımlılıklar](#10-token-rotate-sırası-ve-bağımlılıklar)

---

## 1. SDK Yönetimi

### 1.1 Mevcut Durum

HookSniff'in 11 SDK'sı var ve hepsi yayınlanmış durumda:

| SDK | Registry | Versiyon | Durum |
|-----|----------|----------|-------|
| Node.js | npm | `hooksniff-sdk@0.1.0` | ✅ Yayında |
| Python | PyPI | `hooksniff 0.1.0` | ✅ Yayında |
| Go | pkg.go.dev | `v0.1.0` | ✅ Yayında |
| Rust | crates.io | `hooksniff 0.2.0` | ✅ Yayında |
| Java | Maven Central | `hooksniff-sdk 0.2.0` | ✅ Yayında |
| Kotlin | Maven Central | `hooksniff 0.3.0` | ✅ Yayında |
| PHP | Packagist | `hooksniff/hooksniff-php` | ✅ Yayında |
| Ruby | RubyGems | `hooksniff 0.1.0` | ✅ Yayında |
| C# | NuGet | `HookSniff 0.1.0` | ✅ Yayında |
| Elixir | Hex.pm | `hooksniff 0.2.0` | ✅ Yayında |
| Swift | Swift Package Index | `v0.1.0` | ✅ Yayında |

### 1.2 Archive Edilmeli mi?

**Cevap: Hayır. Hiçbir SDK archive edilmeyecek.**

Neden:
- Hepsi yayınlanmış, geri çekmek kullanıcı kaybına neden olur
- 11 SDK = pazarlama avantajı (rakipler: Svix 6, Hookdeck 8)
- Community SDK'lar zaten minimal bakım gerektiriyor
- Archive etmek "bu projeyi bıraktık" mesajı verir

### 1.3 Aktif vs Community Ayrımı

SDK_STRATEGY.md'nin mevcut ayrımı doğru:

**Aktif Bakım (6 SDK):**
| SDK | Neden Aktif |
|-----|-------------|
| Node.js | En yaygın webhook tüketicisi |
| Python | İkinci en yaygın, data/AI dünyası |
| Go | Backend/DevOps geliştiricileri |
| Java | Enterprise dünya |
| PHP | WordPress/Laravel ekosistemi |
| Ruby | Rails ekosistemi, startup'lar |

**Community Bakım (5 SDK):**
| SDK | Neden Community |
|-----|-----------------|
| C# | .NET dünyası — PR gelirse merge |
| Kotlin | Android/JVM — PR gelirse merge |
| Elixir | Phoenix/BEAM — PR gelirse merge |
| Swift | iOS/macOS — PR gelirse merge |
| Rust | HookSniff Rust ile yazıldı ama SDK kullanıcıları az |

### 1.4 Düzeltilmesi Gereken Hatalar

| # | SDK | Sorun | Önem | Düzeltme |
|---|-----|-------|------|----------|
| 1 | PHP | `send()` metodunda duplicate satır | 🔴 | Fazla `> $data];` silinecek |
| 2 | Tümü | Yanlış base URL (`hooksniff.io` → Cloud Run) | 🔴 | Domain kararı sonrası güncelle |
| 3 | Java | Gson 2.10.1 → 2.11.0 | 🟡 | pom.xml güncelle |
| 4 | Go | go 1.21 → 1.22 | 🟡 | go.mod güncelle |
| 5 | Tümü | Versiyon tutarsızlığı (0.1.0 - 0.4.0) | 🟡 | 1.0.0'a senkronize et |

### 1.5 Rakip SDK Karşılaştırması

| Platform | SDK Sayısı | Aktif Bakım | Community | Auto-generate |
|----------|-----------|-------------|-----------|---------------|
| **HookSniff** | 11 | 6 | 5 | ❌ Manuel |
| **Svix** | 6 | 6 | 0 | ✅ OpenAPI + Codegen |
| **Hookdeck** | 8 | 8 | 0 | ✅ OpenAPI + Codegen |
| **Hook0** | 2 | 2 | 0 | ❌ Manuel |
| **Stripe** | 7 | 7 | 0 | ✅ OpenAPI + Codegen |
| **Twilio** | 7 | 7 | 0 | ✅ OpenAPI + Codegen |

**Sonuç:** HookSniff 11 SDK ile sektörde en fazla SDK'ya sahip. Ama Svix ve Hookdeck OpenAPI + Codegen ile otomatik üretiyor — bu daha sürdürülebilir.

### 1.6 Gelecek Strateji: OpenAPI + Otomatik SDK Üretimi

| Adım | Ne | Süre |
|------|-----|------|
| 1 | `openapi.json` spec oluştur | 2 saat |
| 2 | OpenAPI Generator kur | 30 dk |
| 3 | Her SDK için template ayarla | 2 saat |
| 4 | CI/CD'de otomatik üret + test | 1 saat |
| 5 | Publish scripti (npm, PyPI, vb.) | 1 saat |

**Sonuç:** Yeni dil eklemek 5 dakika sürer. Manuel bakım neredeyse sıfır.

---

## 2. .ai-context Dosya Temizliği

### 2.1 Mevcut Durum

| İstatistik | Değer |
|------------|-------|
| Toplam dosya | 33 |
| Toplam boyut | ~340KB |
| Gereksiz/birleştirilebilir | ~12 dosya |
| Tasarruf | ~90KB, 13 dosya azaltma |

### 2.2 Detaylı Dosya Analizi

**Silinecek Dosyalar (5):**

| Dosya | Boyut | Neden Silinmeli |
|-------|-------|----------------|
| `AUDIT_REPORT.md` | 5KB | `CODEBASE_AUDIT.md` ile aynı konu, eski tarih |
| `AUDIT_REPORT_2026-05-09.md` | 4KB | `CODEBASE_REVIEW_2026-05-09.md` ile örtüşüyor |
| `2026-05-08-review-notes.md` | 2KB | Tek seferlik not, başka yerde bilgi yok |
| `SDK_MANAGEMENT_RESEARCH.md` | 38KB | Araştırma notu, özeti `SDK_STRATEGY.md`'de var |
| `sync.sh` | 1KB | GitHub Actions cron ile aynı işi yapıyor |

**Birleştirilecek Dosyalar (2 grup → 2 dosya):**

| Mevcut Dosyalar | → | Hedef Dosya | Tasarruf |
|-----------------|---|-------------|----------|
| `SDK_AUDIT.md` + `SDK_PUBLISH_GUIDE.md` | → | `SDK_STRATEGY.md` (genişlet) | ~11KB |
| `MOBILE_APP_AUDIT.md` + `MOBILE_DECISIONS.md` + `MOBILE_MASTER_PLAN.md` + `MOBILE_PERFORMANCE.md` + `MOBILE_RESOURCES.md` | → | `MOBILE_STRATEGY.md` (yeni) | ~47KB → ~15KB |

**Tutulacak Dosyalar (21):**

| Dosya | Boyut | Neden Gerekli |
|-------|-------|---------------|
| `MEMORY.md` | 10KB | Proje hafızası |
| `NEXT_SESSION.md` | 3KB | Sonraki oturum planı |
| `SYSTEM_ANALYSIS.md` | 17KB | Sistem mimarisi |
| `COMPETITIVE_ANALYSIS_2026.md` | 8KB | Rakip analizi |
| `CUSTOMER_INSIGHTS.md` | 12KB | Müşteri içgörüleri |
| `FEATURE_PLAN.md` | 19KB | Özellik planı |
| `MARKET_RESEARCH.md` | 20KB | Pazar araştırması |
| `MASTER_RECOMMENDATIONS.md` | 11KB | Ana öneriler |
| `SECURITY_TRUST_REPORT.md` | 8KB | Güvenlik raporu |
| `ONBOARDING.md` | 6KB | Onboarding rehberi |
| `RESOURCES.md` | 10KB | Kaynaklar |
| `CODEBASE_AUDIT.md` | 5KB | Kod denetimi |
| `CODEBASE_REVIEW_2026-05-09.md` | 12KB | Son inceleme |
| `FULL_SYSTEM_AUDIT.md` | 6KB | Sistem denetimi |
| `DASHBOARD_ISSUES.md` | 3KB | Dashboard sorunları |
| `PRODUCT_IMPROVEMENTS.md` | 4KB | Ürün iyileştirmeleri |
| `SDK_STRATEGY.md` | 4KB | SDK stratejisi (genişletilecek) |
| `MOBILE_STRATEGY.md` | ~15KB | Mobil strateji (yeni, birleştirme) |
| `strategy/*` | 156KB | Strateji dokümanları |
| `2026-05-08.md` | 12KB | Oturum logu |
| `2026-05-09.md` | 36KB | Oturum logu |
| `README.md` | 1KB | Dizin rehberi |

### 2.3 Temizlik Sonrası

| Önce | Sonra | Tasarruf |
|------|-------|----------|
| 33 dosya, ~340KB | 23 dosya, ~250KB | 10 dosya, ~90KB |

---

## 3. GCP Service Account Key

### 3.1 Mevcut Durum

| Konu | Durum |
|------|-------|
| SA key dosyası repo'da mı? | ❌ Hayır (`.gitignore` ile korunuyor) |
| Ama paylaşıldı mı? | ✅ Evet — önceki oturumda kopyala-yapıştır |
| GitHub Actions'ta nasıl kullanılıyor? | `secrets.GCP_SA_KEY` (JSON key) |
| GCP Project | `hooksniff-app` |
| Region | `europe-west1` |

### 3.2 İki Seçenek: Key Rotate vs Workload Identity Federation

**Seçenek A: SA Key Rotate (Eski yöntem)**

| Konu | Durum |
|------|-------|
| Ne yapar | Yeni key oluştur, eski key sil |
| Süre | 15 dk |
| Tekrar gerekli mi? | Evet — 90 günde bir rotate |
| Risk | Key yine çalınabilir |
| Maliyet | $0 |

**Seçenek B: Workload Identity Federation — WIF (Yeni yöntem, Google önerisi)**

| Konu | Durum |
|------|-------|
| Ne yapar | Key'i tamamen kaldırır, OIDC ile keyless auth |
| Süre | 30-45 dk (kurulum) |
| Tekrar gerekli mi? | Hayır — key yok, rotate yok |
| Risk | Key çalınamaz (key yok) |
| Maliyet | $0 |

### 3.3 WIF Nasıl Çalışır?

```
GitHub Actions Workflow
        │
        ├── 1. GitHub OIDC provider'dan identity token alır
        │
        ├── 2. Token'ı GCP'ye gönderir
        │
        ├── 3. GCP Workload Identity Pool token'ı doğrular
        │   - "Bu token hangi repo'dan geldi?"
        │   - "Bu workflow hangi branch'te çalışıyor?"
        │   - "Bu repo'dan gelen isteklere izin var mı?"
        │
        ├── 4. Doğrulama başarılı → short-lived credential ver
        │
        └── 5. GitHub Actions bu credential ile GCP'ye erişir
                (credential 1 saat geçerli, sonra yok olur)
```

**Avantajları:**
- ❌ Key dosyası yok → çalınamaz
- ❌ Rotate yok → bakım yok
- ✅ Short-lived credential → 1 saat sonra geçersiz
- ✅ Repo-level restriction → sadece HookSniff repo'sundan erişim
- ✅ Branch-level restriction → sadece `main` branch'ten deploy
- ✅ Audit trail → hangi workflow ne zaman erişmiş

**Dezavantajları:**
- İlk kurulum biraz daha karmaşık (30-45 dk)
- GCP Console'da 5-6 adım var

### 3.4 Öneri: WIF'e Geç

**Neden:**
- Google'ın resmi önerisi: "SA key kullanmayın, WIF kullanın"
- npm Trusted Publishers, GitHub App, hep aynı mantık: keyless auth
- HookSniff tek kişilik ekip → key rotate hatırlamak yük
- WIF bir kez kurulur, sonra bakım gerektirmez

**Adımlar (yapılacak):**

```
1. GCP Console → IAM → Workload Identity Pools
2. Yeni pool oluştur: "github-actions-pool"
3. Provider ekle: GitHub OIDC
   - Issuer URL: https://token.actions.githubusercontent.com
4. Attribute mapping:
   - assertion.repository → attribute.repository
   - assertion.ref → attribute.ref
5. Condition: assertion.repository == 'servetarslan02/HookSniff'
6. Service account oluştur: "github-deploy@hooksniff-app.iam.gserviceaccount.com"
7. IAM binding:
   - roles/run.admin
   - roles/artifactregistry.writer
   - roles/iam.serviceAccountUser
8. Workload Identity User binding:
   - principalSet://iam.googleapis.com/projects/[PROJECT_NUM]/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/servetarslan02/HookSniff
9. GitHub Actions workflow güncelle:
   - credentials_json yerine workload_identity_provider + service_account
10. Eski SA key'i sil
11. GitHub Secrets'tan GCP_SA_KEY'i sil
```

**Güncellenmiş GitHub Actions workflow:**

```yaml
# Eski (key-based):
- uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

# Yeni (WIF, keyless):
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/[PROJECT_NUM]/locations/global/workloadIdentityPools/github-actions-pool/providers/github'
    service_account: 'github-deploy@hooksniff-app.iam.gserviceaccount.com'
```

### 3.5 Acil Durum: SA Key Rotate (WIF kurulana kadar)

WIF kurulumu 30-45 dk süreceği için, önce SA key rotate yapılmalı:

```
1. GCP Console → IAM → Service Accounts → hooksniff-app
2. Keys tab → mevcut key'leri listele
3. Yeni key oluştur (JSON) → indir
4. Eski key'leri sil (TÜMÜ)
5. GitHub → Settings → Secrets → GCP_SA_KEY
6. Güncelle → yeni JSON'u yapıştır
7. GitHub Actions'ı manuel trigger et → test
```

---

## 4. GitHub PAT

### 4.1 Mevcut Durum

| Konu | Durum |
|------|-------|
| Bu oturumda paylaşıldı mı? | ✅ Evet (`ghp_2ZKX...`) |
| Ne için kullanılıyor? | Repo clone, push, OpenClaw erişimi |
| Scope | Muhtemelen `repo` (full access) |
| Fine-grained mı? | ❌ Hayır (classic) |

### 4.2 İki Seçenek: Classic PAT vs Fine-Grained PAT

**Seçenek A: Classic PAT (Eski yöntem)**

| Konu | Durum |
|------|-------|
| Scope | Tüm repo'lara erişim |
| Süre | Sınırsız (opsiyonel 90 gün) |
| Rotate | Manuel |
| Risk | Yüksek — tüm repo'lara erişebilir |

**Seçenek B: Fine-Grained PAT (Yeni yöntem, GitHub önerisi)**

| Konu | Durum |
|------|-------|
| Scope | Sadece belirli repo'lar |
| Süre | Maksimum 366 gün (organizasyon politikası) |
| Permissions | Granular: contents, metadata, actions |
| Risk | Düşük — sadece belirli repo + belirli izinler |

### 4.3 Öneri: Fine-Grained PAT + 90 Gün Süre

**Neden:**
- GitHub'ın resmi önerisi: classic PAT'ler kaldırılıyor
- Fine-grained PAT sadece HookSniff repo'suna erişir
- 90 gün süre → otomatik rotate hatırlatması
- Minimum izin prensibi

**Adımlar (yapılacak):**

```
1. GitHub → Settings → Developer settings → Personal access tokens
2. "Fine-grained tokens" sekmesi
3. "Generate new token"
4. Token name: "hooksniff-ai-openclaw"
5. Expiration: 90 gün
6. Repository access: "Only select repositories" → servetarslan02/HookSniff
7. Permissions:
   - Contents: Read and write (clone, push)
   - Metadata: Read-only (repo bilgisi)
   - Actions: Read and write (CI trigger)
   - Issues: Read and write (issue yönetimi)
   - Pull requests: Read and write (PR yönetimi)
8. Generate token → kopyala
9. OpenClaw config'te güncelle
10. Eski classic PAT'ı revoke et
```

### 4.4 GitHub Actions'ta PAT Kullanımı

GitHub Actions'ta `GITHUB_TOKEN` zaten var ve otomatik üretiliyor. PAT sadece OpenClaw ve local erişim için gerekli:

| Kullanım | Token | Neden |
|----------|-------|-------|
| GitHub Actions CI/CD | `GITHUB_TOKEN` (otomatik) | PAT'a gerek yok |
| OpenClaw (bu oturum) | Fine-grained PAT | Repo erişimi |
| Local git | Fine-grained PAT | Push/pull |

### 4.5 Daha İyi Alternatif: GitHub App (Gelecek)

PAT yerine GitHub App kullanmak daha güvenli:

| Konu | PAT | GitHub App |
|------|-----|------------|
| Rate limit | 5,000/saat | 15,000/saat |
| Token süresi | Manuel | 1 saat (otomatik yenilenir) |
| Scope | Kullanıcı bazlı | Repo bazlı |
| Audit | Zayıf | Güçlü |
| Kurulum | Kolay | Orta |

**Öneri:** Şimdilik fine-grained PAT yeterli. 100+ kullanıcı olduğunda GitHub App'e geç.

---

## 5. npm Token

### 5.1 Mevcut Durum

| Konu | Durum |
|------|-------|
| Bu oturumda paylaşıldı mı? | ❌ Hayır |
| Önceki oturumda paylaşıldı mı? | ✅ Evet (MEMORY.md'ye göre) |
| npm'de yayınlanmış SDK var mı? | ✅ Evet — `hooksniff-sdk@0.1.0` |
| GitHub Actions'ta NPM_TOKEN var mı? | ❌ Hayır |
| npm classic token kullanılıyor mu? | Muhtemelen evet |

### 5.2 npm Güvenlik Değişiklikleri (Kritik!)

npm 2025 Eylül'de büyük değişiklikler yaptı:

| Değişiklik | Tarih | Etki |
|------------|-------|------|
| Classic token'lar revoke edilecek | Kasım 2025 | ⚠️ Eski token'lar geçersiz olacak |
| Granular token max 90 gün | Ekim 2025 | Token 90 günde bir rotate edilmeli |
| TOTP 2FA kaldırılıyor | Yakında | WebAuthn/passkey kullanılmalı |
| Trusted Publishers (OIDC) | Aktif | ✅ En güvenli yöntem |

### 5.3 Üç Seçenek

**Seçenek A: Granular Token (Orta güvenli)**

| Konu | Durum |
|------|-------|
| Ne yapar | Yeni granular token oluştur |
| Süre | Max 90 gün |
| Rotate | 90 günde bir |
| Risk | Orta — token çalınabilir |

**Seçenek B: Trusted Publishers / OIDC (En güvenli, npm önerisi)**

| Konu | Durum |
|------|-------|
| Ne yapar | GitHub Actions'tan keyless publish |
| Süre | Sınırsız (token yok) |
| Rotate | Gerekmez |
| Risk | Yok — token yok |

**Seçenek C: npm Automation Token (CI için)**

| Konu | Durum |
|------|-------|
| Ne yapar | 2FA bypass token (sadece CI) |
| Süre | Sınırsız |
| Rotate | Gerekmez |
| Risk | Yüksek — 2FA bypass |

### 5.4 Öneri: Trusted Publishers (OIDC) + Geçiş Döneminde Granular Token

**Neden Trusted Publishers:**
- npm'in resmi önerisi: "Token yok, rotate yok"
- GitHub Actions OIDC ile publish
- Provenance attestation otomatik
- Supply chain attack riski sıfır

**Adımlar (yapılacak):**

**Aşama 1 — Hemen (Granular Token):**
```
1. npmjs.com → Access Tokens
2. Eski token'ları kontrol et → varsa sil
3. "Generate New Token" → "Granular Access Token"
4. Package: hooksniff-sdk
5. Permissions: Read and Write
6. Expiration: 90 gün
7. Token'ı kopyala
8. GitHub Secrets'ta NPM_TOKEN olarak ekle
```

**Aşama 2 — Sonra (Trusted Publishers):**
```
1. npmjs.com → hooksniff-sdk → Settings → Publishing access
2. "Add trusted publisher"
3. GitHub repository: servetarslan02/HookSniff
4. Workflow: ci.yml (veya publish.yml)
5. Environment: (opsiyonel)
6. GitHub Actions workflow'da npm publish step'i:
   - id-token: write permission ekle
   - npm publish --provenance
7. NPM_TOKEN secret'ını sil
```

### 5.5 GitHub Actions Publish Workflow (Trusted Publishers)

```yaml
name: Publish SDK

on:
  push:
    tags: ['sdk-v*']

permissions:
  contents: read
  id-token: write  # OIDC için gerekli

jobs:
  publish-npm:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          registry-url: https://registry.npmjs.org
      - run: cd sdks/node && npm ci
      - run: cd sdks/node && npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}  # Aşama 2'de silinecek
```

---

## 6. Rakip Karşılaştırması

### 6.1 Secret Management

| Platform | GCP Auth | GitHub Token | npm Token | Güvenlik Skoru |
|----------|----------|-------------|-----------|----------------|
| **HookSniff** | SA Key (JSON) | Classic PAT | Classic (muhtemelen) | ⚠️ 3/10 |
| **Svix** | WIF (tahmini) | Fine-grained | Trusted Publishers | ✅ 9/10 |
| **Hookdeck** | WIF (tahmini) | Fine-grained | — (SDK yok) | ✅ 8/10 |
| **Hook0** | Self-hosted | — | — | ✅ 10/10 |
| **Stripe** | WIF | GitHub App | npm OIDC | ✅ 10/10 |

### 6.2 SDK Management

| Platform | SDK Sayısı | Auto-generate | Dependabot | CI Test | Publish |
|----------|-----------|---------------|------------|---------|---------|
| **HookSniff** | 11 | ❌ Manuel | ❌ | ❌ | ❌ Manuel |
| **Svix** | 6 | ✅ OpenAPI | ✅ | ✅ | ✅ Otomatik |
| **Stripe** | 7 | ✅ OpenAPI | ✅ | ✅ | ✅ Otomatik |
| **Twilio** | 7 | ✅ OpenAPI | ✅ | ✅ | ✅ Otomatik |

### 6.3 .ai-context / Memory Dosyaları

| Platform | Yaklaşım | Dosya Sayısı | Düzen |
|----------|----------|-------------|-------|
| **HookSniff** | Serbest format, çok dosya | 33 | ⚠️ Dağınık |
| **Svix** | Docs site + CHANGELOG | ~10 | ✅ Düzenli |
| **Stripe** | Monorepo + CHANGELOG | ~5 | ✅ Minimal |
| **Best practice** | CHANGELOG + ROADmap + ADR | 3-5 | ✅ Temiz |

**ADR (Architecture Decision Record):** Önemli teknik kararlar tek bir formatta kaydedilir:
- `ADR-001: Rust ile API yazma kararı.md`
- `ADR-002: 11 SDK destekleme kararı.md`
- `ADR-003: WIF'e geçiş kararı.md`

---

## 7. Öncelik Sırası ve Aksiyon Planı

### 🔴 ACİL — Bu Hafta (yapılacak)

| # | Görev | Süre 
|---|-------|------|-----|
| 1 | GCP SA Key rotate (acil, WIF kurulana kadar) | 15 dk |
| 2 | GitHub PAT → Fine-grained PAT | 10 dk |
| 3 | npm → Granular token oluştur (90 gün) | 10 dk |

### 🟡 ÖNEMLİ — Bu Ay

| # | Görev | Süre 
|---|-------|------|-----|
| 4 | GCP WIF kurulumu (SA key'i tamamen kaldır) | 30-45 dk |
| 5 | .ai-context temizliği (5 sil, 2 birleştir) | 30 dk |
| 6 | npm Trusted Publishers kurulumu | 20 dk |
| 7 | PHP SDK duplicate satır fix | 5 dk |
| 8 | GitHub Actions workflow WIF'e güncelle | 10 dk |

### 🟢 İYİLEŞTİRME — Gelecek

| # | Görev | Süre 
|---|-------|------|-----|
| 9 | OpenAPI spec oluştur | 2 saat |
| 10 | SDK auto-generation pipeline kur | 3 saat |
| 11 | Dependabot kur | 30 dk |
| 12 | GitHub App'e geç (100+ kullanıcı olduğunda) | 1 saat |
| 13 | ADR formatına geç (karar dokümantasyonu) | 1 saat |

### Takvim

| Gün | Görev |
|-----|-------|
| Bugün | GCP SA key rotate + GitHub PAT rotate + npm token rotate |
| Yarın | GCP WIF kurulumu |
| Bu hafta | .ai-context temizliği + PHP fix |
| Gelecek hafta | npm Trusted Publishers + OpenAPI spec |

---

## 8. Tüm Token ve Secret Envanteri

### 8.1 Envanter Tablosu

`.env.production.example` (GitHub'da public) + GitHub Actions secrets + Cloud Run env incelendi:

| Secret | Nerede Kullanılıyor | .env.example'da Değer Var mı? | GitHub Actions'ta mı? | Cloud Run'da mı? | Durum |
|--------|---------------------|-------------------------------|----------------------|-----------------|-------|
| `GCP_SA_KEY` | Cloud Run deploy | ❌ | ✅ `secrets.GCP_SA_KEY` | ❌ | 🔴 Paylaşıldı, rotate |
| `DATABASE_URL` | API, Worker | ❌ Boş | ❌ | ✅ Secret Manager | ✅ Güvenli |
| `REDIS_URL` | API, Worker | ❌ Boş | ❌ | ✅ Secret Manager | ✅ Güvenli |
| `JWT_SECRET` | Auth | ❌ Boş | ❌ | ✅ Secret Manager | ✅ Güvenli |
| `HMAC_SECRET` | Webhook signing | ❌ Boş | ❌ | ✅ Secret Manager | ✅ Güvenli |
| `POLAR_ACCESS_TOKEN` | Ödeme | ❌ Boş | ❌ | ✅ Secret Manager | ✅ Güvenli |
| `POLAR_WEBHOOK_SECRET` | Ödeme webhook | ❌ Boş | ❌ | ✅ Secret Manager | ✅ Güvenli |
| `OTEL_EXPORTER_OTLP_HEADERS` | Grafana monitoring | ⚠️ **GERÇEK TOKEN** | ❌ | ✅ Secret Manager | 🔴 **PUBLIC!** |
| `STRIPE_SECRET_KEY` | Ödeme (legacy) | ❌ Boş | ❌ | ✅ Secret Manager | ✅ Güvenli |
| `FCM_SERVER_KEY` | Push notification | ❌ Boş | ❌ | Belirsiz | 🟡 Kontrol et |
| `R2_ACCESS_KEY_ID` | Cloudflare storage | ❌ Boş | ❌ | Belirsiz | 🟡 Kontrol et |
| `R2_SECRET_ACCESS_KEY` | Cloudflare storage | ❌ Boş | ❌ | Belirsiz | 🟡 Kontrol et |
| GitHub PAT | OpenClaw, git | ❌ | ❌ | ❌ | 🔴 Paylaşıldı, rotate |
| npm token | SDK publish | ❌ | ❌ | ❌ | ⚠️ Eski oturumda paylaşıldı |

### 8.2 KRİTİK: Grafana Cloud OTEL Token Exposed!

**`.env.production.example` dosyası GitHub'da public ve gerçek Grafana Cloud token içeriyor.**

```bash
# .env.production.example'daki satır:
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic MTYyNTQ3NjpnbGNfZXlKdklqb2lNVGMxTnpNek5TSXNJbTRp...
```

Bu base64 decode edildiğinde gerçek Grafana Cloud API key çıkıyor:
- Stack ID: `1625476`
- Stack name: `hooksniff-hooksniff2`
- Region: `us`
- API key format: `glc_eyJv...`

**Risk:** Herkes bu token ile Grafana Cloud hesabınıza erişebilir, logları okuyabilir, silebilir.

**Acil Aksiyon:**
```
1. Grafana Cloud → hookrelay org → Security → Cloud Access Policies
2. Mevcut policy'yi bul → "hooksniff" adlı
3. Token'ı revoke et / yeni token oluştur
4. Yeni token'ı GCP Secret Manager'da güncelle:
   gcloud secrets versions add otel-headers --data-file=new-token.txt
5. .env.production.example'daki OTEL_EXPORTER_OTLP_HEADERS satırını boşalt:
   OTEL_EXPORTER_OTLP_HEADERS=
6. GitHub'da commit et → force push (tarihi temizle)
7. Cloud Run servislerini yeniden deploy et
```

### 8.3 Polar Product ID'ler

`.env.production.example`'da Polar.sh product UUID'leri var:
```
POLAR_PRODUCT_PRO=ec5826ad-4a01-4146-b2d0-3b99eaf150a5
POLAR_PRODUCT_BUSINESS=e5b7d88a-7606-4963-a070-4102ca6405e2
```

**Risk analizi:** Bunlar sadece ürün ID'leri, secret değil. Polar.sh'de ürün oluştururken otomatik üretilir. Birisi bu ID'leri bilse bile ödeme yapamaz veya hesaba erişemez. **Güvenli, rotate gerekmez.**

### 8.4 Secret Manager vs Environment Variables

**Mevcut yapı (iyi):**
- Gerçek secret'lar GCP Secret Manager'da saklanıyor
- GitHub Actions'ta `secrets.*` olarak referans ediliyor
- Cloud Run'da `--set-secrets` ile inject ediliyor
- `.env.production.example` sadece template (boş değerler)

**Tek sorun:** OTEL token example'a düşmüş.

**Önerilen yapı:**
```
┌─────────────────────────────────────────────────────────┐
│ GCP Secret Manager                                       │
│ ├── neon-db-url → DATABASE_URL                          │
│ ├── upstash-redis-url → REDIS_URL                       │
│ ├── jwt-secret → JWT_SECRET                             │
│ ├── hmac-secret → HMAC_SECRET                           │
│ ├── polar-token → POLAR_ACCESS_TOKEN                    │
│ ├── polar-webhook → POLAR_WEBHOOK_SECRET                │
│ ├── otel-headers → OTEL_EXPORTER_OTLP_HEADERS           │
│ └── gcp-sa-json → GCP_SA_KEY (WIF sonrası silinecek)   │
└─────────────────────────────────────────────────────────┘
        │
        ▼ (inject)
┌─────────────────────────────────────────────────────────┐
│ Cloud Run Services (API, Worker)                         │
│ Environment variables → Secret Manager'dan okunur       │
│ Hiçbir secret image'da veya env dosyasında yok          │
└─────────────────────────────────────────────────────────┘
```

---

## 9. WIF Kurulum Rehberi ve Rollback Planı

### 9.1 WIF Kurulum Adımları (Detaylı)

**Önkoşul:** GCP Console erişimi (Servet)

**Adım 1: Workload Identity Pool oluştur**
```
GCP Console → IAM & Admin → Workload Identity Pools → Create Pool
  - Name: github-actions-pool
  - Description: GitHub Actions CI/CD for HookSniff
  - Pool ID: github-actions-pool
```

**Adım 2: Identity Provider ekle**
```
Pool → Add Provider
  - Provider name: github-oidc
  - Provider type: OIDC (OpenID Connect)
  - Issuer URL: https://token.actions.githubusercontent.com
  - Allowed audiences: (boş bırak)
```

**Adım 3: Attribute Mapping ayarla**
```
Provider → Attribute Mapping
  - google.subject → assertion.sub
  - attribute.repository → assertion.repository
  - attribute.repository_owner → assertion.repository_owner
  - attribute.ref → assertion.ref
  - attribute.event_name → assertion.event_name
```

**Adım 4: Attribute Condition ayarla**
```
Provider → Attribute Condition
  - expression: assertion.repository == 'servetarslan02/HookSniff'
  - Bu sadece HookSniff repo'sundan gelen isteklere izin verir
```

**Adım 5: Service Account oluştur**
```
IAM & Admin → Service Accounts → Create
  - Name: github-deploy
  - Description: GitHub Actions deploy for HookSniff
  - Service account ID: github-deploy
```

**Adım 6: IAM Roller ata**
```
Service Account → Permissions → Add
  - roles/run.admin (Cloud Run deploy)
  - roles/artifactregistry.writer (Docker image push)
  - roles/secretmanager.secretAccessor (Secret okuma)
  - roles/iam.serviceAccountUser (SA impersonation)
```

**Adım 7: Workload Identity User binding**
```
Service Account → Permissions → Add IAM Policy Binding
  - Principal: principalSet://iam.googleapis.com/projects/[PROJECT_NUM]/locations/global/workloadIdentityPools/github-actions-pool/attribute.repository/servetarslan02/HookSniff
  - Role: roles/iam.workloadIdentityUser
```

**Adım 8: GitHub Actions workflow güncelle**
```yaml
# deploy.yml — Eski:
- uses: google-github-actions/auth@v2
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

# deploy.yml — Yeni:
- uses: google-github-actions/auth@v2
  with:
    workload_identity_provider: 'projects/[PROJECT_NUM]/locations/global/workloadIdentityPools/github-actions-pool/providers/github-oidc'
    service_account: 'github-deploy@hooksniff-app.iam.gserviceaccount.com'
```

**Adım 9: Test et**
```
GitHub → Actions → Deploy to Cloud Run → Run workflow (main branch)
Başarılı olursa:
  - Eski SA key'i GCP Console'dan sil
  - GitHub Secrets'tan GCP_SA_KEY'i sil
```

### 9.2 WIF Rollback Planı

WIF kurulumu başarısız olursa:

**Senaryo 1: WIF auth başarısız**
```
Belirti: GitHub Actions "Permission denied" hatası
Çözüm:
  1. GCP Console → IAM → Workload Identity Pool → Provider
  2. Attribute condition'ı kontrol et (repo adı doğru mu?)
  3. Service account binding'leri kontrol et
  4. GCP audit log'dan hata detayını gör
  5. Düzeltemezsen → eski SA key ile devam et
```

**Senaryo 2: SA key silindiyse ama WIF çalışmıyorsa**
```
Belirti: Ne WIF ne de SA key çalışıyor → deploy yapılamıyor
Çözüm:
  1. GCP Console → IAM → Service Accounts → github-deploy
  2. Keys tab → Add Key → Create new key (JSON)
  3. Yeni key'i GitHub Secrets'ta GCP_SA_KEY olarak ekle
  4. deploy.yml'yi eski haline geri al (credentials_json)
  5. Deploy'u test et
  6. WIF'i tekrar kurmayı dene
```

**Senaryo 3: Yanlışlıkla tüm SA key'ler silindi**
```
Belirti: Service account'un hiç key'i yok
Çözüm:
  1. GCP Console → IAM → Service Accounts → hooksniff-app SA
  2. Keys tab → Add Key → Create new key
  3. Cloud Run servislerinin çalıştığını doğrula
  4. (Cloud Run Secret Manager kullandığı için etkilenmez)
```

**Senaryo 4: GitHub Actions timeout**
```
Belirti: Auth step 10+ dakika sürüyor
Çözüm:
  1. GitHub Actions logs'da "Federated token" adımını kontrol et
  2. GCP'de Workload Identity Pool'un "Enabled" olduğunu doğrula
  3. Provider'un "Enabled" olduğunu doğrula
  4. GitHub OIDC endpoint'in erişilebilir olduğunu kontrol et
```

### 9.3 WIF Doğrulama Checklist

Kurulum sonrası mutlaka kontrol et:

```
□ GitHub Actions deploy başarılı mı?
□ Cloud Run servisleri çalışıyor mu?
□ Secret Manager'dan secret okunabiliyor mu?
□ Docker image Artifact Registry'a push edilebildi mi?
□ Eski SA key silindi mi?
□ GitHub Secrets'tan GCP_SA_KEY silindi mi?
□ Audit log'da "WorkloadIdentityFederation" girişleri var mı?
```

---

## 10. Token Rotate Sırası ve Bağımlılıklar

### 10.1 Bağımlılık Haritası

```
[GCP SA Key] ──────┬──→ GitHub Actions deploy
                   └──→ Cloud Run services
                         │
[Github PAT] ───────────→ OpenClaw (repo erişimi)
                         │
[npm token] ────────────→ SDK publish
                         │
[Grafana OTEL token] ───→ Monitoring (bağımsız)
```

### 10.2 Doğru Sıra

**Kural:** Önce bağımlı olmayanları rotate et, sonra bağımlı olanları.

```
GÜN 1 — Bağımsız token'lar (diğerlerini etkilemez)
├── 1. Grafana OTEL token (ACİL — public exposed)
│   ├── Grafana Cloud'da revoke et
│   ├── Yeni token oluştur
│   ├── GCP Secret Manager'da güncelle
│   └── .env.production.example'ı temizle
│
├── 2. GitHub PAT (OpenClaw erişimi)
│   ├── Eski PAT'ı revoke et
│   ├── Fine-grained PAT oluştur (90 gün)
│   └── OpenClaw config'te güncelle
│
└── 3. npm token (SDK publish)
    ├── Eski token'ı kontrol et/sil
    ├── Granular token oluştur (90 gün)
    └── (GitHub Actions'ta NPM_TOKEN yok, local'de kullanılıyor)

GÜN 2 — GCP SA Key (en kritik, deploy'u etkiler)
├── 4. GCP SA Key rotate (acil)
│   ├── Yeni key oluştur
│   ├── Eski key sil
│   ├── GitHub Secrets'ta güncelle
│   └── Deploy test et
│
└── 5. (Opsiyonel) WIF kurulumu
    ├── WIF pool + provider oluştur
    ├── Service account binding
    ├── Workflow güncelle
    ├── Test et
    └── Eski SA key sil + GitHub Secrets'tan GCP_SA_KEY sil

GÜN 3 — Doğrulama
├── 6. Tüm servislerin çalıştığını doğrula
├── 7. GitHub Actions deploy test et
├── 8. Monitoring (Grafana) çalışıyor mu?
└── 9. SDK publish test et (local)
```

### 10.3 Neden Bu Sıra?

| Sıra | Token | Neden |
|------|-------|-------|
| 1 | Grafana OTEL | 🔴 PUBLIC — en acil, bağımsız |
| 2 | GitHub PAT | 🔴 Paylaşıldı, bağımsız (OpenClaw erişimi) |
| 3 | npm token | ⚠️ Eski oturumda paylaşıldı, bağımsız |
| 4 | GCP SA Key | 🔴 Paylaşıldı ama deploy'u etkiliyor → dikkatli rotate |
| 5 | WIF | GCP SA Key sonrası, en güvenli çözüm |

### 10.4 Senaryo: Bir Şey Yanlış Giderse

| Durum | Etki | Çözüm |
|-------|------|-------|
| Grafana rotate sonrası monitoring çalışmaz | Log kaybı | Eski token'ı geri al (eğer revoke edilmediyse) |
| GitHub PAT rotate sonrası OpenClaw erişimi kaybolur | Bu oturum kesilir | Yeni PAT ile OpenClaw config güncelle |
| npm token rotate sonrası SDK publish başarısız | Bir sonraki publish'de sorun | Yeni token ile local .npmrc güncelle |
| GCP SA key rotate sonrası deploy başarısız | Yeni sürüm deploy edilemez | Eski key'i geri al (eğer silindiyse yeni key oluştur) |
| WIF kurulumu başarısız | Deploy yapılamaz | Eski SA key'e geri dön (rollback planı §9.2) |

### 10.5 Acil Durum İletişim

| Durum | Ne Yap |
|-------|--------|
| Tüm token'lar rotate edildi ama bir şey çalışmıyor | GCP Console → Service Accounts → yeni key oluştur |
| GitHub'a erişim yok | github.com → Settings → Developer settings → PAT → yeni oluştur |
| npm'e erişim yok | npmjs.com → Access Tokens → yeni oluştur |
| Grafana'ya erişim yok | grafana.com → org → Security → Cloud Access Policies |

---

## Notlar

- Bu rapor OPERATIONS_STRATEGY.md ve STATUS_PAGE_STRATEGY.md ile birlikek okunmalı
- GCP WIF kurulumu en kritik iyileştirme — key'i tamamen kaldırır
- npm Trusted Publishers yakında zorunlu olacak — classic token'lar Kasım 2025'te kaldırılıyor
- Grafana OTEL token ACİL — GitHub'da public, hemen revoke edilmeli
- .ai-context temizliği bir sonraki oturumda AI tarafından yapılacak
- SDK auto-generation uzun vadeli hedef — şimdilik manuel bakım yeterli
