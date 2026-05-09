# 📦 HookSniff — SDK Yönetim Sistemi

> **Tarih:** 2026-05-09
> **Hazırlayan:** AI Asistan
> **Durum:** Planlama aşaması

---

## İçindekiler

1. [Bu Belge Ne Anlatıyor?](#1-bu-belge-ne-anlatıyor)
2. [Mevcut Durum](#2-mevcut-durum)
3. [Hedef Sistem](#3-hedef-sistem)
4. [11 SDK Otomatik Planı](#4-11-sdk-otomatik-planı)
5. [OpenAPI Spec Güncelleme Süreci](#5-openapi-spec-güncelleme-süreci)
6. [Admin Paneli (Senin Panelin)](#6-admin-paneli-senin-panelin)
7. [Müşteri Paneli](#7-müşteri-paneli)
8. [Otomatik Güncelleme Akışı](#8-otomatik-güncelleme-akışı)
9. [Hangi Araçları Kullanacağız?](#9-hangi-araçları-kullanacağız)
10. [Uygulama Planı](#10-uygulama-planı)
11. [Maliyet](#11-maliyet)
12. [Kaynaklar](#12-kaynaklar)
13. [Implementation Detayları — Adım Adım Komutlar](#13-implementation-detayları--adım-adım-komutlar)
    - 13.1 OpenAPI Generator Kurulumu
    - 13.2 Speakeasy Kurulumu (Ruby SDK)
    - 13.3 Swift OpenAPI Generator Kurulumu
    - 13.4 GitHub Actions Workflow
    - 13.5 Publish Scriptleri
    - 13.6 Elixir Fix Scripti
    - 13.7 Versiyon Yönetimi
    - 13.8 Troubleshooting

---

## 1. Bu Belge Ne Anlatıyor?

Bu belge şunları açıklıyor:
- HookSniff'in 11 SDK'sı nasıl otomatik yönetilir?
- API değiştiğinde SDK'lar nasıl güncellenir?
- Müşteri panelinde SDK bilgisi nasıl gösterilir?
- Admin panelinde SDK durumu nasıl takip edilir?
- Hangi ücretsiz araçlar kullanılır?

**Kim okuyacak?** Bu işi yapacak kişi (AI veya geliştirici). İlk kez okuyan kişi adım adım ne yapacağını bilmeli.

---

## 2. Mevcut Durum

### Bugünkü Sorunlar

| Sorun | Açıklama |
|-------|----------|
| **11 SDK elle yönetiliyor** | Her SDK için ayrı kod, ayrı publish, ayrı bakım |
| **API değişince SDK güncellenmiyor** | Elle takip etmek gerekiyor |
| **Müşteri hangi SDK'yı kullandığını bilmiyor** | Versiyon bilgisi yok |
| **Admin panelinde SDK durumu yok** | Hangi SDK güncel, hangisi değil görünmüyor |

### Mevcut SDK Listesi

| SDK | Platform | Versiyon | Durum |
|-----|----------|----------|-------|
| Node.js | npm | 0.1.0 | ✅ Yayında |
| Python | PyPI | 0.1.0 | ✅ Yayında |
| Go | pkg.go.dev | 0.1.0 | ✅ Yayında |
| Rust | crates.io | 0.2.0 | ✅ Yayında |
| Java | Maven Central | 0.2.0 | ✅ Yayında |
| Kotlin | Maven Central | 0.3.0 | ✅ Yayında |
| C# | NuGet | 0.1.0 | ✅ Yayında |
| PHP | Packagist | 0.1.0 | ✅ Yayında |
| Ruby | RubyGems | 0.1.0 | ✅ Yayında |
| Elixir | Hex.pm | 0.2.0 | ✅ Yayında |
| Swift | Swift Package Index | 0.1.0 | ✅ Yayında |

### Mevcut OpenAPI Spec

- **Dosya:** `docs/openapi.yaml`
- **Boyut:** 80KB, 3000+ satır
- **İçerik:** Tüm API endpoint'leri, request/response formatları, authentication
- **Durum:** Güncel

---

## 3. Hedef Sistem

### Ne İstiyoruz?

```
API değişikliği → OpenAPI spec güncelle → SDK'lar otomatik üret → Publish et → Müşteri bilgilendir
```

### Kim Ne Yapacak?

| Kişi/Sistem | Ne Yapar |
|-------------|----------|
| **AI (asistan)** | API kodu yazar, OpenAPI spec günceller, GitHub'a push eder |
| **GitHub Actions** | SDK'ları otomatik üretir, test eder, publish eder |
| **Admin (Sen)** | Dashboard'dan "Güncelle" butonuna basar |
| **Müşteri** | Bildirim görür, SDK'yı günceller |

---

## 4. 11 SDK Otomatik Planı

### Strateji: Her Dil İçin En İyi Araç

11 SDK'yı tek araçla değil, her dil için en uygun araçla üreteceğiz.

### Araç Seçimi

| SDK | Araç | Neden Bu Araç | Kalite |
|-----|------|---------------|--------|
| **Node.js** | OpenAPI Generator | En iyi TypeScript desteği | ⭐⭐⭐⭐ |
| **Python** | OpenAPI Generator | Type hints, pip uyumlu | ⭐⭐⭐⭐ |
| **Go** | OpenAPI Generator | Idiomatic Go kodu | ⭐⭐⭐⭐ |
| **Java** | OpenAPI Generator | En olgun template | ⭐⭐⭐⭐ |
| **Kotlin** | OpenAPI Generator | Java template'inden türetilmiş | ⭐⭐⭐ |
| **C#** | OpenAPI Generator | .NET uyumlu | ⭐⭐⭐ |
| **Rust** | OpenAPI Generator | Cargo uyumlu | ⭐⭐⭐ |
| **PHP** | OpenAPI Generator | Composer uyumlu | ⭐⭐⭐ |
| **Ruby** | **Speakeasy** | OpenAPI Generator'dan çok daha iyi Ruby kodu | ⭐⭐⭐⭐ |
| **Elixir** | **OpenAPI Generator + fix script** | İyi bir Elixir generator yok, elle düzeltme gerekli | ⭐⭐⭐ |
| **Swift** | **Apple swift-openapi-generator** | Apple'ın kendi aracı, en iyi Swift desteği | ⭐⭐⭐⭐ |

### Neden Karışık Sistem?

- OpenAPI Generator 50+ dil destekliyor ama bazı dillerde kalitesi düşük
- Ruby: OpenAPI Generator "Java-flavored Ruby" üretiyor → Speakeasy daha iyi
- Elixir: İyi bir generator yok → OpenAPI Generator + fix script
- Swift: Apple'ın kendi aracı var → en iyi kalite

### Her SDK İçin Ne Kullanılacak?

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  OpenAPI Spec (docs/openapi.yaml)                       │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  OpenAPI Generator ──→ Node.js, Python, Go, Java,       │
│                        Kotlin, C#, Rust, PHP            │
│                                                         │
│  Speakeasy ──────────→ Ruby                             │
│                                                         │
│  swift-openapi-generator ──→ Swift                      │
│                                                         │
│  OpenAPI Generator + fix ──→ Elixir                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. OpenAPI Spec Güncelleme Süreci

### OpenAPI Spec Nedir?

`docs/openapi.yaml` dosyası — API'nin kullanma kılavuzu. Hangi endpoint var, ne gönderir, ne döndürür, hepsi burada yazılı.

### Kim Günceller?

**AI günceller.** Sen sadece ne istediğini söylersin.

### Adım Adım Süreç

```
1. SEN: "Yeni endpoint ekleyelim: /v1/webhooks/batch"
   ↓
2. AI: API kodunu yazar (Rust)
   ↓
3. AI: openapi.yaml günceller (yeni endpoint tanımı ekler)
   ↓
4. AI: GitHub'a push eder
   ↓
5. GitHub Actions tetiklenir (openapi.yaml değiştiği için)
   ↓
6. SDK'lar otomatik üretilir (11 dilde)
   ↓
7. Test edilir (otomatik)
   ↓
8. npm, PyPI, crates.io vb.'ye publish edilir
   ↓
9. Dashboard'da "3 SDK güncellenebilir" bildirimi çıkar
   ↓
10. SEN: "Güncelle" tıklarsın
   ↓
11. Müşteri: Bildirim görür, SDK'yı günceller
```

### Sen Ne Yapıyorsun?

**Sadece 1. adımı.** "Şu endpoint'i ekleyelim" diyorsun. Gerisi otomatik.

### AI OpenAPI Spec'i Nasıl Günceller?

Örnek — batch endpoint ekleme:

```yaml
# openapi.yaml'a AI şunu ekler:

/v1/webhooks/batch:
  post:
    tags: [Webhooks]
    summary: "Birden fazla webhook gönder"
    requestBody:
      content:
        application/json:
          schema:
            type: object
            properties:
              webhooks:
                type: array
                items:
                  $ref: '#/components/schemas/WebhookRequest'
    responses:
      '200':
        description: "Başarılı"
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/BatchResponse'
```

### OpenAPI Spec Dosyası Nerede?

```
HookSniff/
└── docs/
    └── openapi.yaml    ← Bu dosya. 80KB, 3000+ satır.
```

---

## 6. Admin Paneli (Senin Panelin)

### Ne Göreceksin?

Dashboard'a girince header'da bir rozet görecek:

```
🔔 SDK Güncellemeleri Mevcut (3)
```

### SDK Yönetim Sayfası

```
┌─────────────────────────────────────────────────────────┐
│  🔧 Admin → SDK Management                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  📦 SDK Durumu                    [⚠️ 3 güncellenebilir]│
│                                                         │
│  SDK          Versiyon    Son Publish    Durum           │
│  ─────────────────────────────────────────────────────  │
│  Node.js      0.2.0→0.3   2026-05-01    [⬆️ Güncelle]   │
│  Python       0.2.0→0.3   2026-05-01    [⬆️ Güncelle]   │
│  Go           0.2.0→0.3   2026-05-01    [⬆️ Güncelle]   │
│  Java         0.2.0       2026-04-20    ✅ Güncel       │
│  Kotlin       0.3.0       2026-04-20    ✅ Güncel       │
│  C#           0.1.0       2026-04-15    ✅ Güncel       │
│  Rust         0.2.0       2026-04-15    ✅ Güncel       │
│  PHP          0.1.0       2026-04-15    ✅ Güncel       │
│  Ruby         0.1.0       2026-04-10    ✅ Güncel       │
│  Elixir       0.2.0       2026-04-10    ✅ Güncel       │
│  Swift        0.1.0       2026-04-10    ✅ Güncel       │
│                                                         │
│  [Tümünü Güncelle]                                      │
│                                                         │
│  📊 Global Kullanım                                      │
│  ─────────────────────────────────────────────────────  │
│  Toplam müşteri: 45                                      │
│  Toplam SDK kurulumu: 3,200                              │
│  En popüler: Node.js (%62)                               │
│                                                         │
│  🔄 Otomatik Güncelleme                                  │
│  ─────────────────────────────────────────────────────  │
│  Son tarama: 2026-05-09 20:00                           │
│  Sonraki tarama: 2026-05-16 20:00                       │
│  Durum: ✅ Aktif (haftalık Pazartesi 12:00)              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Butonlar Ne Yapar?

| Buton | Ne Yapar |
|-------|----------|
| **Güncelle** (tek SDK) | Seçili SDK'yı üretir + publish eder |
| **Tümünü Güncelle** | Tüm SDK'ları üretir + publish eder |

---

## 7. Müşteri Paneli

### Müşteri Ne Görecek?

```
┌─────────────────────────────────────────────────────────┐
│  📦 SDK & Entegrasyon                                   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Mevcut SDK Bilgim                                      │
│  ─────────────────────────────────────────────────────  │
│  Dil: Node.js                                           │
│  Versiyon: 0.2.0                                        │
│  Kurulum: npm install hooksniff-sdk                     │
│  [Komutu Kopyala]                                       │
│                                                         │
│  ⚠️ Yeni versiyon mevcut: 0.3.0                        │
│  ─────────────────────────────────────────────────────  │
│  Ne değişti:                                            │
│  • ✨ Yeni: batch webhook desteği                       │
│  • 🐛 Düzeltme: timeout hatası                          │
│  • 📚 Dokümantasyon güncellendi                         │
│                                                         │
│  Güncelleme komutu:                                     │
│  ┌─────────────────────────────────────────────────┐    │
│  │ npm update hooksniff-sdk                        │    │
│  └─────────────────────────────────────────────────┘    │
│  [Komutu Kopyala]                                       │
│                                                         │
│  📊 SDK Kullanım İstatistiklerim                        │
│  ─────────────────────────────────────────────────────  │
│  Son 30 gün: 12,400 API çağrısı                         │
│  Başarı oranı: 99.8%                                    │
│  Ort. yanıt süresi: 45ms                                │
│                                                         │
│  🔗 Hızlı Bağlantılar                                  │
│  ─────────────────────────────────────────────────────  │
│  [Quick Start] [API Reference] [Örnekler]               │
│  [Changelog] [GitHub]                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Müşteri Ne Yapar?

1. Dashboard'a girer → SDK bilgisini görür
2. Yeni versiyon varsa → uyarı çıkar
3. "Komutu Kopyala" butonuna basar
4. Terminal'e yapıştırır → SDK güncellenir

**Kod bilmesine gerek yok.** Sadece kopyala-yapıştır.

---

## 8. Otomatik Güncelleme Akışı

### Tam Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  AŞAMA 1: API Değişikliği                              │
│  ─────────────────────────────────────────────────────  │
│  AI → API kodu yazar                                    │
│  AI → openapi.yaml günceller                            │
│  AI → GitHub'a push eder                                │
│                                                         │
│  AŞAMA 2: GitHub Actions Tetiklenir                     │
│  ─────────────────────────────────────────────────────  │
│  openapi.yaml değiştiği için workflow çalışır            │
│                                                         │
│  AŞAMA 3: SDK Üretimi                                  │
│  ─────────────────────────────────────────────────────  │
│  OpenAPI Generator → Node.js, Python, Go, Java,         │
│                      Kotlin, C#, Rust, PHP              │
│  Speakeasy ────────→ Ruby                               │
│  swift-openapi ────→ Swift                              │
│  OpenAPI Gen+fix ──→ Elixir                             │
│                                                         │
│  AŞAMA 4: Test                                         │
│  ─────────────────────────────────────────────────────  │
│  Her SDK için otomatik test çalışır                     │
│  Hata varsa → bildirim gönderilir                       │
│                                                         │
│  AŞAMA 5: Publish                                      │
│  ─────────────────────────────────────────────────────  │
│  npm ────────→ Node.js SDK                              │
│  PyPI ───────→ Python SDK                               │
│  pkg.go.dev ─→ Go SDK (git tag)                         │
│  crates.io ──→ Rust SDK                                 │
│  Maven ──────→ Java, Kotlin SDK                         │
│  NuGet ──────→ C# SDK                                   │
│  Packagist ──→ PHP SDK                                  │
│  RubyGems ───→ Ruby SDK                                 │
│  Hex.pm ─────→ Elixir SDK                               │
│  Swift Pkg ──→ Swift SDK (git tag)                      │
│                                                         │
│  AŞAMA 6: Dashboard Güncelleme                          │
│  ─────────────────────────────────────────────────────  │
│  Admin panelinde → "3 SDK güncellenebilir" rozeti        │
│  Müşteri panelinde → "Yeni versiyon var" uyarısı         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Haftalık Otomatik Tarama

GitHub Actions her Pazartesi 12:00'de otomatik çalışır:
1. OpenAPI spec'i okur
2. Mevcut SDK versiyonlarıyla karşılaştırır
3. Fark varsa → Dashboard'a bildirim gönderir
4. Fark yoksa → bir şey yapmaz

---

## 9. Hangi Araçları Kullanacağız?

### Ücretsiz Araçlar ($0)

| Araç | Ne İşe Yarar | Hangi SDK'lar |
|------|-------------|---------------|
| **OpenAPI Generator** | SDK otomatik üretim | Node, Python, Go, Java, Kotlin, C#, Rust, PHP, Elixir |
| **Speakeasy** (free tier) | SDK otomatik üretim | Ruby |
| **swift-openapi-generator** | SDK otomatik üretim | Swift |
| **GitHub Actions** | CI/CD pipeline | Tümü |
| **npm** | Node.js SDK dağıtım | Node.js |
| **PyPI** | Python SDK dağıtım | Python |
| **crates.io** | Rust SDK dağıtım | Rust |
| **Maven Central** | Java/Kotlin SDK dağıtım | Java, Kotlin |
| **NuGet** | C# SDK dağıtım | C# |
| **Packagist** | PHP SDK dağıtım | PHP |
| **RubyGems** | Ruby SDK dağıtım | Ruby |
| **Hex.pm** | Elixir SDK dağıtım | Elixir |
| **Swift Package Index** | Swift SDK dağıtım | Swift |

### Neden Bu Araçlar?

| Kriter | OpenAPI Generator | Speakeasy | swift-openapi-generator |
|--------|------------------|-----------|------------------------|
| **Fiyat** | $0 | $0 (free tier) | $0 |
| **Dil sayısı** | 50+ | 10+ | Swift only |
| **Ruby kalitesi** | ⭐⭐ Zayıf | ⭐⭐⭐⭐ İyi | — |
| **Swift kalitesi** | ⭐⭐ Zayıf | — | ⭐⭐⭐⭐ İyi |
| **CI/CD entegrasyonu** | ✅ | ✅ | ✅ |

### Gelecekte ($$ Olduğunda)

| Aşama | Araç | Neden |
|-------|------|-------|
| **İlk gelir** | Fern ($250/ay) | Daha iyi SDK kalitesi + docs |
| **Büyüme** | Stainless | En iyi kod kalitesi (OpenAI kullanıyor) |

---

## 10. Uygulama Planı

### Faz 1: Temel Kurulum (1 hafta, $0)

| Adım | Ne Yapılacak | Kim Yapacak |
|------|-------------|-------------|
| 1.1 | OpenAPI spec'i kontrol et | AI |
| 1.2 | OpenAPI Generator kur (npm) | AI |
| 1.3 | 8 SDK için generate komutu yaz | AI |
| 1.4 | Speakeasy ile Ruby SDK generate komutu yaz | AI |
| 1.5 | swift-openapi-generator ile Swift SDK generate komutu yaz | AI |
| 1.6 | Elixir fix scripti yaz | AI |
| 1.7 | GitHub Actions workflow oluştur | AI |
| 1.8 | Publish scriptleri yaz (tüm paket yöneticileri için) | AI |
| 1.9 | Test et — tüm SDK'lar üretiliyor mu? | AI |

### Faz 2: Dashboard Entegrasyonu (1 hafta, $0)

| Adım | Ne Yapılacak | Kim Yapacak |
|------|-------------|-------------|
| 2.1 | Admin SDK sayfası (SDK durumu, güncelle butonu) | AI |
| 2.2 | Müşteri SDK sayfası (versiyon bilgisi, changelog) | AI |
| 2.3 | Güncelleme bildirimi (header'da rozet) | AI |
| 2.4 | Kurulum rehberi (komutu kopyala butonu) | AI |
| 2.5 | Changelog sayfası (ne değişti) | AI |

### Faz 3: İyileştirme (1 ay, $0)

| Adım | Ne Yapılacak | Kim Yapacak |
|------|-------------|-------------|
| 3.1 | Breaking change detection (OpenAPI diff) | AI |
| 3.2 | Changelog otomatik üretimi | AI |
| 3.3 | SDK istatistikleri (hangi dil ne kadar kullanılıyor) | AI |
| 3.4 | Müşteri bildirim sistemi | AI |

---

## 11. Maliyet

### Sıfır Bütçe ($0)

| Kalem | Maliyet | Açıklama |
|-------|---------|----------|
| OpenAPI Generator | $0 | Açık kaynak |
| Speakeasy free tier | $0 | Ruby SDK için |
| swift-openapi-generator | $0 | Apple'ın kendi aracı |
| GitHub Actions | $0 | Free tier (2000 dakika/ay) |
| npm publish | $0 | Ücretsiz |
| PyPI publish | $0 | Ücretsiz |
| crates.io publish | $0 | Ücretsiz |
| Maven Central publish | $0 | Ücretsiz (onay süreci var) |
| NuGet publish | $0 | Ücretsiz |
| Packagist publish | $0 | Ücretsiz |
| RubyGems publish | $0 | Ücretsiz |
| Hex.pm publish | $0 | Ücretsiz |
| Swift Package Index | $0 | Ücretsiz (git tag) |
| Dashboard sayfaları | $0 | Mevcut Next.js |
| **TOPLAM** | **$0** | |

---

## 12. Kaynaklar

### Araçlar

| Araç | URL | Ne İşe Yarar |
|------|-----|-------------|
| OpenAPI Generator | https://github.com/openapitools/openapi-generator | SDK generation (50+ dil) |
| Speakeasy | https://www.speakeasy.com | SDK generation (Ruby için) |
| swift-openapi-generator | https://github.com/apple/swift-openapi-generator | Swift SDK generation |
| Fern | https://buildwithfern.com | SDK + docs generation |
| Stainless | https://www.stainless.com | En iyi SDK generation |

### Referans Projeler

| Proje | URL | Ne İşe Yarar |
|-------|-----|-------------|
| Cloudflare SDK Pipeline | https://blog.cloudflare.com/lessons-from-building-an-automated-sdk-pipeline/ | Otomatik SDK pipeline referansı |
| Svix Portal | https://www.svix.com/application-portal/ | Müşteri portalı referansı |
| Svix Webhooks | https://github.com/svix/svix-webhooks | Webhook servisi referans kod |
| OpenAPI Spec Standardı | https://openapi.org | API specification standardı |
| Semver | https://semver.org | Versiyonlama standardı |

### Paket Yöneticileri

| Platform | URL | Ne İşe Yarar |
|----------|-----|-------------|
| npm | https://npmjs.com | Node.js paket dağıtımı |
| PyPI | https://pypi.org | Python paket dağıtımı |
| crates.io | https://crates.io | Rust paket dağıtımı |
| Maven Central | https://search.maven.org | Java/Kotlin paket dağıtımı |
| NuGet | https://nuget.org | C# paket dağıtımı |
| Packagist | https://packagist.org | PHP paket dağıtımı |
| RubyGems | https://rubygems.org | Ruby paket dağıtımı |
| Hex.pm | https://hex.pm | Elixir paket dağıtımı |
| Swift Package Index | https://swiftpackageindex.com | Swift paket dağıtımı |

---

## 13. Implementation Detayları — Adım Adım Komutlar

> Bu bölüm her aracın nasıl kurulacağını ve kullanılacağını adım adım anlatır.
> İlk kez yapan kişi bu komutları sırayla çalıştırarak sistemi kurabilir.

### 13.1 OpenAPI Generator Kurulumu

**Ne yapıyor:** OpenAPI spec'den 9 dilde SDK otomatik üretir (Node, Python, Go, Java, Kotlin, C#, Rust, PHP, Elixir).

**Kurulum (bir kere yapılır):**
```bash
# npm ile kur (en kolay yol)
npm install @openapitools/openapi-generator-cli -g

# Kurulumu doğrula
openapi-generator-cli version
```

**Kullanım (her SDK için):**
```bash
# Node.js (TypeScript) SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-node \
  -o sdks/node/ \
  --additional-properties=packageName=hooksniff-sdk,npmName=hooksniff-sdk,npmVersion=0.3.0

# Python SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g python \
  -o sdks/python/ \
  --additional-properties=packageName=hooksniff,projectName=hooksniff

# Go SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g go \
  -o sdks/go/ \
  --additional-properties=packageName=hooksniff,gitUserId=servetarslan02,gitRepoId=hooksniff-go

# Java SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g java \
  -o sdks/java/ \
  --additional-properties=groupId=com.hooksniff,artifactId=hooksniff-sdk,artifactVersion=0.3.0

# Kotlin SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g kotlin \
  -o sdks/kotlin/ \
  --additional-properties=packageName=com.hooksniff,artifactVersion=0.3.0

# C# SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g csharp \
  -o sdks/csharp/ \
  --additional-properties=packageName=HookSniff,packageVersion=0.3.0

# Rust SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g rust \
  -o sdks/rust/ \
  --additional-properties=packageName=hooksniff,crateVersion=0.3.0

# PHP SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g php \
  -o sdks/php/ \
  --additional-properties=packageName=HookSniff,artifactVersion=0.3.0

# Elixir SDK üret
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g elixir \
  -o sdks/elixir/ \
  --additional-properties=packageName=HookSniff
```

**Doğrulama:**
```bash
# Hangi generator'lar mevcut?
openapi-generator-cli list -s

# Spec'i doğrula
openapi-generator-cli validate -i docs/openapi.yaml
```

---

### 13.2 Speakeasy Kurulumu (Ruby SDK için)

**Ne yapıyor:** Ruby SDK'yı OpenAPI spec'den üretir. OpenAPI Generator'dan daha iyi Ruby kodu üretir.

**Kurulum (bir kere yapılır):**
```bash
# macOS
brew install speakeasy-api/tap/speakeasy

# Linux
curl -fsSL https://go.speakeasy.com/cli-install.sh | sh

# Kurulumu doğrula
speakeasy --version
```

**İlk kurulum (bir kere yapılır):**
```bash
# Speakeasy hesabı oluştur (browser açılır)
speakeasy quickstart

# OpenAPI spec yolunu göster
# → "Local file" seç
# → docs/openapi.yaml ver
# → "Ruby" dilini seç
# → SDK adı: hooksniff
```

**Kullanım (her güncellemede):**
```bash
# Ruby SDK'yı yeniden üret
speakeasy generate sdk \
  --schema docs/openapi.yaml \
  --lang ruby \
  --out sdks/ruby/
```

**Not:** Speakeasy free tier = 1 SDK, 50 API method. Ruby SDK için yeterli.

---

### 13.3 Swift OpenAPI Generator Kurulumu

**Ne yapıyor:** Swift SDK'yı OpenAPI spec'den üretir. Apple'ın kendi aracı.

**Kurulum (bir kere yapılır):**
```bash
# Swift Package Manager ile (bir kere, Package.swift'e eklenir)
# Ya da CLI olarak:
git clone https://github.com/apple/swift-openapi-generator.git
cd swift-openapi-generator
swift build -c release
cp .build/release/swift-openapi-generator /usr/local/bin/
```

**Kullanım (her güncellemede):**
```bash
# Swift SDK üret
swift-openapi-generate generate \
  --spec docs/openapi.yaml \
  --mode client \
  --output sdks/swift/Sources/HookSniff/
```

**Ya da Swift Package Plugin olarak (önerilen):**
```swift
// Package.swift'e eklenir:
.package(url: "https://github.com/apple/swift-openapi-generator", from: "1.0.0")

// Derleme sırasında otomatik üretilir:
// swift build
```

**Not:** Swift OpenAPI Generator, kodu build-time'da üretir. Source control'e commit etmeye gerek yok.

---

### 13.4 GitHub Actions Workflow

**Ne yapıyor:** OpenAPI spec değiştiğinde otomatik olarak tüm SDK'ları üretir ve publish eder.

**Dosya:** `.github/workflows/generate-sdks.yml`

```yaml
name: Generate & Publish SDKs

on:
  push:
    paths:
      - 'docs/openapi.yaml'
    branches:
      - main
  workflow_dispatch:  # Manuel tetikleme

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Setup Java (OpenAPI Generator için)
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Install OpenAPI Generator
        run: npm install @openapitools/openapi-generator-cli -g

      - name: Validate OpenAPI Spec
        run: openapi-generator-cli validate -i docs/openapi.yaml

      # ── OpenAPI Generator ile 8 SDK ──

      - name: Generate Node.js SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g typescript-node \
            -o sdks/node/ \
            --additional-properties=packageName=hooksniff-sdk,npmName=hooksniff-sdk

      - name: Generate Python SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g python \
            -o sdks/python/ \
            --additional-properties=packageName=hooksniff

      - name: Generate Go SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g go \
            -o sdks/go/ \
            --additional-properties=packageName=hooksniff

      - name: Generate Java SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g java \
            -o sdks/java/ \
            --additional-properties=groupId=com.hooksniff,artifactId=hooksniff-sdk

      - name: Generate Kotlin SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g kotlin \
            -o sdks/kotlin/ \
            --additional-properties=packageName=com.hooksniff

      - name: Generate C# SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g csharp \
            -o sdks/csharp/ \
            --additional-properties=packageName=HookSniff

      - name: Generate Rust SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g rust \
            -o sdks/rust/ \
            --additional-properties=packageName=hooksniff

      - name: Generate PHP SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g php \
            -o sdks/php/ \
            --additional-properties=packageName=HookSniff

      - name: Generate Elixir SDK
        run: |
          openapi-generator-cli generate \
            -i docs/openapi.yaml \
            -g elixir \
            -o sdks/elixir/ \
            --additional-properties=packageName=HookSniff

      # ── Speakeasy ile Ruby SDK ──

      - name: Install Speakeasy
        run: curl -fsSL https://go.speakeasy.com/cli-install.sh | sh

      - name: Generate Ruby SDK
        run: |
          speakeasy generate sdk \
            --schema docs/openapi.yaml \
            --lang ruby \
            --out sdks/ruby/
        env:
          SPEAKEASY_API_KEY: ${{ secrets.SPEAKEASY_API_KEY }}

      # ── Swift OpenAPI Generator ile Swift SDK ──

      - name: Generate Swift SDK
        run: |
          swift-openapi-generate generate \
            --spec docs/openapi.yaml \
            --mode client \
            --output sdks/swift/Sources/HookSniff/

      # ── Test ──

      - name: Test Node.js SDK
        run: cd sdks/node && npm install && npm test || true

      - name: Test Python SDK
        run: cd sdks/python && pip install -e . && python -m pytest || true

      # ── Publish ──

      - name: Publish Node.js to npm
        run: cd sdks/node && npm publish || true
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Publish Python to PyPI
        run: cd sdks/python && python -m build && python -m twine upload dist/* || true
        env:
          TWINE_USERNAME: __token__
          TWINE_PASSWORD: ${{ secrets.PYPI_TOKEN }}

      # Go, Rust, Java, Kotlin, C#, PHP, Ruby, Elixir, Swift
      # → Git tag ile publish (aşağıda)

      - name: Create Git tag and push
        run: |
          VERSION=$(grep 'version:' docs/openapi.yaml | head -1 | awk '{print $2}' | tr -d '"')
          git tag "sdk-v${VERSION}"
          git push origin "sdk-v${VERSION}"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

### 13.5 Publish Scriptleri

**Dosya:** `scripts/publish-all.sh`

```bash
#!/bin/bash
# Tüm SDK'ları publish et
# Kullanım: bash scripts/publish-all.sh

set -e

VERSION=$(grep 'version:' docs/openapi.yaml | head -1 | awk '{print $2}' | tr -d '"')
echo "Publishing SDKs for version: $VERSION"

# Node.js → npm
echo "📦 Publishing Node.js SDK..."
cd sdks/node
npm version $VERSION --no-git-tag-version
npm publish
cd ../..

# Python → PyPI
echo "📦 Publishing Python SDK..."
cd sdks/python
python -m build
python -m twine upload dist/*
cd ../..

# Rust → crates.io
echo "📦 Publishing Rust SDK..."
cd sdks/rust
cargo publish
cd ../..

# C# → NuGet
echo "📦 Publishing C# SDK..."
cd sdks/csharp
dotnet pack -c Release
dotnet nuget push bin/Release/*.nupkg -k $NUGET_API_KEY -s https://api.nuget.org/v3/index.json
cd ../..

# PHP → Packagist (git tag ile)
echo "📦 Publishing PHP SDK (git tag)..."
cd sdks/php
git tag "php-v$VERSION"
git push origin "php-v$VERSION"
cd ../..

# Ruby → RubyGems
echo "📦 Publishing Ruby SDK..."
cd sdks/ruby
gem build hooksniff.gemspec
gem push hooksniff-$VERSION.gem
cd ../..

# Elixir → Hex.pm
echo "📦 Publishing Elixir SDK..."
cd sdks/elixir
mix hex.publish --yes
cd ../..

# Go → pkg.go.dev (git tag ile)
echo "📦 Publishing Go SDK (git tag)..."
git tag "go-v$VERSION"
git push origin "go-v$VERSION"

# Java + Kotlin → Maven Central (ayrı script)
echo "📦 Java/Kotlin → Maven Central (scripts/publish-java.sh çalıştırın)"

# Swift → Swift Package Index (git tag ile)
echo "📦 Publishing Swift SDK (git tag)..."
git tag "swift-v$VERSION"
git push origin "swift-v$VERSION"

echo "✅ Tüm SDK'lar publish edildi!"
```

---

### 13.6 Elixir Fix Scripti

**Ne yapıyor:** OpenAPI Generator'ın ürettiği Elixir kodunu düzeltir.

**Dosya:** `scripts/fix-elixir.sh`

```bash
#!/bin/bash
# Elixir SDK düzeltmeleri
# OpenAPI Generator'ın ürettiği Elixir kodunda bilinen sorunları düzeltir

SDK_DIR="sdks/elixir"

echo "🔧 Fixing Elixir SDK..."

# 1. mix.exs düzelt (gerekirse)
if [ -f "$SDK_DIR/mix.exs" ]; then
  # Versiyonu güncelle
  sed -i 's/version: ".*"/version: "0.3.0"/' "$SDK_DIR/mix.exs"
  
  # HookSniff package adını düzelt
  sed -i 's/app: :openapi/app: :hooksniff/' "$SDK_DIR/mix.exs"
  sed -i 's/name: "OpenAPI"/name: "hooksniff"/' "$SDK_DIR/mix.exs"
fi

# 2. Module adlarını düzelt
find "$SDK_DIR/lib" -name "*.ex" -exec sed -i 's/OpenAPI\./HookSniff./g' {} \;

# 3. Config dosyası oluştur (yoksa)
if [ ! -f "$SDK_DIR/config/config.exs" ]; then
  mkdir -p "$SDK_DIR/config"
  cat > "$SDK_DIR/config/config.exs" << 'EOF'
import Config

config :hooksniff,
  base_url: "https://hooksniff-api-1046140057667.europe-west1.run.app/v1"
EOF
fi

echo "✅ Elixir SDK düzeltildi"
```

---

### 13.7 Versiyon Yönetimi

**Kural:** Semver kullan (Major.Minor.Patch)

```
0.2.0 → 0.2.1  (patch: bug fix)
0.2.0 → 0.3.0  (minor: yeni özellik, geriye uyumlu)
0.2.0 → 1.0.0  (major: kırıcı değişiklik)
```

**Versiyon nerede güncellenir?**
- OpenAPI spec'de: `info.version` alanı
- Her SDK'da: otomatik olarak spec'den çekilir

**Nasıl güncellenir?**
```bash
# openapi.yaml'da versiyonu değiştir:
# info:
#   version: "0.3.0"  ← burayı güncelle

# Sonra SDK'ları yeniden üret:
openapi-generator-cli generate -i docs/openapi.yaml -g typescript-node -o sdks/node/
# ... diğerleri
```

---

### 13.8 Troubleshooting — Sık Karşılaşılan Sorunlar

| Sorun | Çözüm |
|-------|-------|
| **OpenAPI Generator "command not found"** | `npm install @openapitools/openapi-generator-cli -g` |
| **Java gerekli hatası** | Java 17+ kur: `apt install openjdk-17-jdk` |
| **Speakeasy auth hatası** | `speakeasy quickstart` ile tekrar giriş yap |
| **Swift generator bulunamadı** | swift-openapi-generator'ı PATH'e ekle |
| **Elixir module adı yanlış** | `scripts/fix-elixir.sh` çalıştır |
| **npm publish "403"** | `npm login` ile giriş yap |
| **PyPI publish "401"** | PyPI token oluştur ve `~/.pypirc`'ye ekle |
| **Maven Central onay bekliyor** | Normal — 1-2 gün sürebilir |
| **Go pkg.go.dev güncellenmiyor** | Git tag push et: `git tag go-v0.3.0 && git push origin go-v0.3.0` |
