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
