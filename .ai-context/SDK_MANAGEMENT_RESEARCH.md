# 📦 SDK Yönetim Sistemi — Araştırma Raporu

> **Tarih:** 2026-05-09
> **Hazırlayan:** AI Asistan
> **Amaç:** SDK otomatik yönetim sistemi araştırması, müşteri paneli entegrasyonu, hangi araçlar kullanılır

---

## 1. SDK Generator Araçları — Karşılaştırma

### Piyasadaki Araçlar

| Araç | Tür | Fiyat | Diller | Kim Kullanıyor |
|------|-----|-------|--------|----------------|
| **OpenAPI Generator** | Açık kaynak (Java) | $0 | 50+ dil | Geniş topluluk |
| **Stainless** | Ticari | Ücretli (özel) | TS, Python, Go, Java, Kotlin, Ruby, C#, PHP | **OpenAI, Stripe kurucuları** |
| **Fern** | Ticari (Postman satın aldı) | Ücretsiz plan + $250/ay+ | 8+ dil | Postman ekosistemi |
| **Speakeasy** | Ticari | Ücretsiz plan + ücretli | 10+ dil | Startup'lar |
| **Kiota** | Açık kaynak (Microsoft) | $0 | TS, Python, Go, Java, C#, Ruby, PHP | Microsoft |
| **APIMatic** | Ticari | Ücretli | 10+ dil | Enterprise |
| **liblab** | Ticari | Ücretsiz plan + ücretli | 10+ dil | Startup'lar |

### Detaylı Karşılaştırma

#### OpenAPI Generator (En Popüler Açık Kaynak)
- **GitHub:** 22K+ yıldız, 50+ dil desteği
- **Avantaj:** Bedava, büyük topluluk, çok dil desteği
- **Dezavantaj:** Java tabanlı (Docker gerektirir), generated kod "native" hissettirmez, 4500+ açık issue
- **Bakım yükü:** Enterprise ekipler genelde 3+ kişi ayırır (fork bakım, template düzeltme)
- **HookSniff için uygun mu?** Evet — başlangıç için ideal, bedava

#### Stainless (En Kaliteli)
- **Kurucular:** Stripe'ın SDK ekibinden
- **Kullanan:** OpenAI, Stripe benzeri şirketler
- **Avantaj:** Generated kod el ile yazılmış gibi görünüyor, retry/pagination/type-safety dahil
- **Dezavantaj:** Ücretli, fiyat gizli
- **HookSniff için uygun mu?** Şu an hayır — bütçe yok. İleride düşünülebilir.

#### Fern (Postman Satın Aldı)
- **Avantaj:** Bedava plan (5 SDK'ya kadar), API docs + SDK birlikte
- **Dezavantaj:** Postman ekosistemi bağımlılığı
- **HookSniff için uygun mu?** Evet — bedava plan 3 SDK için yeterli

#### Speakeasy
- **Avantaj:** Breaking change detection, type-safe SDK, CI/CD entegrasyonu
- **Dezavantaj:** Ücretli plan gerekli
- **HookSniff için uygun mu?** Gelecekte düşünülebilir

---

## 2. Cloudflare'ın SDK Pipeline Deneyimi

Cloudflare 2024'te SDK'larını otomatik üretmeye başladı. Dersler:

### Ne Yaptılar?
- OpenAPI spec'den TypeScript, Go, Python SDK otomatik ürettiler
- Manuel bakım → otomatik pipeline geçtiler

### Sorunlar
- Her değişiklik için 4+ pull request gerekiyordu (her dil için ayrı)
- Manuel hatalar, dil uyumsuzlukları
- Go SDK'ya odaklandılar, diğerleri geride kaldı

### Çözüm
- OpenAPI spec tek kaynak oldu
- SDK'lar otomatik üretildi
- CI/CD pipeline'da tetiklendi

### Ders
> "Generated kod el ile yazılmış gibi görünmeli. Ruby'de `if bar? do_something` kullanmalı, `if/else` bloğu değil."

---

## 3. Svix'in Müşteri Portalı (Embeddable UI)

Svix, müşterilerine "Application Portal" sunuyor — tek satır kod ile embed edilebilir:

### Ne Yapıyor?
- Endpoint yönetimi (müşteri kendi endpoint'lerini ekler/siler)
- Delivery logs (webhook teslimatlarını izler)
- Event catalog (hangi event tiplerine abone olabilir)
- Event subscription (filtreleme)
- Webhook testing (test webhook gönder)
- Retry (manuel retry butonu)
- Payload transformation

### Nasıl Embed Ediliyor?
```jsx
// React
import { SvixPortal } from '@svix/portal-react';

<SvixPortal appId="app_xxx" token="eyJ..." />
```

### HookSniff İçin Ne Anlama Geliyor?
HookSniff'in zaten `routes/embed.rs` ve `portal/` klasörü var — embeddable portal widget mevcut. Müşteri panelinde bu kullanılabilir.

---

## 4. Müşteri Panelinde SDK Yönetimi — Ne Olmalı?

### Müşteri Ne Görmeli?

#### Sayfa: SDK & Entegrasyon
```
┌─────────────────────────────────────────────┐
│  📦 SDK & Entegrasyon                       │
├─────────────────────────────────────────────┤
│                                             │
│  Mevcut SDK Bilgim                          │
│  ─────────────────────────────────────────  │
│  Dil: Node.js                               │
│  Versiyon: 0.2.0                            │
│  Kurulum: npm install hooksniff-sdk         │
│  [Komutu Kopyala]                           │
│                                             │
│  ⚠️ Yeni versiyon mevcut: 0.3.0            │
│  ─────────────────────────────────────────  │
│  Ne değişti:                                │
│  • ✨ Yeni: batch webhook desteği           │
│  • 🐛 Düzeltme: timeout hatası              │
│  • 📚 Dokümantasyon güncellendi             │
│                                             │
│  Güncelleme komutu:                         │
│  ┌─────────────────────────────────────┐    │
│  │ npm update hooksniff-sdk            │    │
│  └─────────────────────────────────────┘    │
│  [Komutu Kopyala]                           │
│                                             │
│  📊 SDK Kullanım İstatistiklerim            │
│  ─────────────────────────────────────────  │
│  Son 30 gün: 12,400 API çağrısı             │
│  Başarı oranı: 99.8%                        │
│  Ort. yanıt süresi: 45ms                    │
│                                             │
│  🔗 Hızlı Bağlantılar                      │
│  ─────────────────────────────────────────  │
│  [Quick Start] [API Reference] [Örnekler]   │
│  [Changelog] [GitHub]                       │
│                                             │
└─────────────────────────────────────────────┘
```

### Özellikler

| Özellik | Ne Yapar | Öncelik |
|---------|---------|---------|
| **SDK versiyon bilgisi** | Hangi SDK, hangi versiyon | Yüksek |
| **Güncelleme uyarısı** | "Yeni versiyon var" bildirimi | Yüksek |
| **Changelog** | "Ne değişti" listesi | Orta |
| **Kurulum rehberi** | Komutu kopyala butonu | Orta |
| **SDK kullanım istatistikleri** | API çağrı sayısı, başarı oranı | Düşük |
| **Quick links** | Docs, examples, GitHub | Düşük |

---

## 5. Admin Panelinde SDK Yönetimi — Ne Olmalı?

### Admin (Sen) Ne Görmeli?

#### Sayfa: Admin → SDK Management
```
┌─────────────────────────────────────────────┐
│  🔧 Admin → SDK Management                  │
├─────────────────────────────────────────────┤
│                                             │
│  📦 SDK Durumu                    [⚠️ 3 güncellenebilir]  │
│                                             │
│  SDK          Versiyon   Son Publish   Durum│
│  ─────────────────────────────────────────  │
│  Node.js      0.2.0→0.3  2026-05-01   [⬆️] │
│  Python       0.2.0→0.3  2026-05-01   [⬆️] │
│  Go           0.2.0→0.3  2026-05-01   [⬆️] │
│  Rust         0.2.0      2026-04-20   ✅    │
│  Ruby         0.1.0      2026-04-15   ✅    │
│  ...                                        │
│                                             │
│  [Tümünü Güncelle]  [Yayınla]               │
│                                             │
│  📊 Global Kullanım                          │
│  ─────────────────────────────────────────  │
│  Toplam müşteri: 45                          │
│  Toplam SDK kurulumu: 3,200                  │
│  En popüler: Node.js (%62)                   │
│                                             │
│  🔄 Otomatik Güncelleme                      │
│  ─────────────────────────────────────────  │
│  Son tarama: 2026-05-09 20:00               │
│  Sonraki tarama: 2026-05-16 20:00           │
│  Durum: ✅ Aktif (haftalık)                  │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 6. Otomatik Güncelleme Akışı

### Tam Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────┐
│                    HAFTALIK AKIŞ                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. GitHub Actions (Pazartesi 12:00)                    │
│     ├── OpenAPI spec'i oku                              │
│     ├── Mevcut SDK versiyonlarıyla karşılaştır          │
│     ├── Fark varsa → API'ye bildir                      │
│     └── Fark yoksa → bitir                              │
│                                                         │
│  2. Dashboard (Sen girince)                             │
│     ├── Header'da rozet: "3 SDK güncellenebilir"        │
│     ├── SDK sayfasına git                               │
│     ├── "Güncelle" butonuna bas                         │
│     └── Sistem otomatik üretir + publish eder           │
│                                                         │
│  3. Müşteri Dashboard'u                                 │
│     ├── SDK bilgisi göster (dil, versiyon)              │
│     ├── Güncelleme uyarısı (varsa)                     │
│     ├── Changelog (ne değişti)                          │
│     └── Kurulum rehberi (komutu kopyala)                │
│                                                         │
│  4. Paket Yöneticileri                                  │
│     ├── npm → Node.js SDK publish                       │
│     ├── PyPI → Python SDK publish                       │
│     ├── pkg.go.dev → Go SDK (git tag)                   │
│     └── ... diğerleri                                   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Versiyon Akışı

```
OpenAPI spec değişti
    ↓
CI/CD tetiklendi
    ↓
SDK'lar üretildi (openapi-generator)
    ↓
Test edildi (otomatik)
    ↓
Versiyon bump (0.2.0 → 0.3.0)
    ↓
Paket yöneticilerine publish
    ↓
Dashboard güncellendi
    ↓
Müşteri bilgilendirildi
```

---

## 7. Hangi Araç? — Karar Matrisi

| Kriter | OpenAPI Generator | Fern | Stainless | Speakeasy |
|--------|------------------|------|-----------|-----------|
| **Fiyat** | $0 ✅ | Ücretsiz plan | Ücretli | Ücretsiz plan |
| **Dil sayısı** | 50+ ✅ | 8+ | 9 | 10+ |
| **Kod kalitesi** | ⚠️ Orta | ✅ İyi | ✅✅ En iyi | ✅ İyi |
| **CI/CD entegrasyonu** | ✅ Docker | ✅ | ✅ | ✅ |
| **Breaking change detection** | ❌ | ✅ | ✅ | ✅ |
| **Bakım yükü** | ⚠️ Yüksek | ✅ Düşük | ✅ Düşük | ✅ Düşük |
| **Topluluk** | ✅ Büyük | Orta | Küçük | Orta |
| **HookSniff için** | ✅ Şu an | ✅ Gelecekte | ❌ Bütçe yok | ⚠️ Düşük |

### Öneri

| Aşama | Araç | Neden |
|-------|------|-------|
| **Şimdi ($0)** | **OpenAPI Generator** | Bedava, 50+ dil, büyük topluluk |
| **İlk gelir ($)** | **Fern** | Bedava plan (5 SDK), daha iyi kod kalitesi |
| **Büyüme ($$)** | **Stainless veya Speakeasy** | En iyi kod kalitesi, breaking change detection |

---

## 8. GitHub Repo Referansları

### İncelenmesi Gereken Repolar

| Repo | Ne İşe Yarar | Dil |
|------|-------------|-----|
| [openapitools/openapi-generator](https://github.com/openapitools/openapi-generator) | SDK otomatik üretim (50+ dil) | Java |
| [svix/svix-webhooks](https://github.com/svix/svix-webhooks) | Webhook servisi referans kod (Rust) | Rust |
| [fern-api/fern](https://github.com/fern-api/fern) | SDK + docs generation | TypeScript |
| [speakeasy-api/speakeasy](https://github.com/speakeasy-api/speakeasy) | SDK generation + breaking change | Go |
| [stainless-api/stainless](https://github.com/stainless-api) | En iyi SDK generation (kapalı kaynak) | — |
| [cloudflare/cloudflare-typescript](https://github.com/cloudflare/cloudflare-typescript) | Otomatik generated SDK örneği | TypeScript |
| [cloudflare/cloudflare-python](https://github.com/cloudflare/cloudflare-python) | Otomatik generated SDK örneği | Python |

### Cloudflare SDK Pipeline Referansı
- Blog yazısı: https://blog.cloudflare.com/lessons-from-building-an-automated-sdk-pipeline/
- OpenAPI spec'den SDK üretme süreci detaylı anlatılıyor
- 3 dil (TS, Go, Python) için otomatik pipeline

### Svix Portal Referansı
- Portal dokümantasyonu: https://www.svix.com/application-portal/
- Embed kodu: `@svix/portal-react` npm paketi
- Müşteri paneli için UI bileşeni

---

## 9. Maliyet Analizi

### Sıfır Bütçe ($0)

| Araç | Maliyet | Ne Yapar |
|------|---------|---------|
| OpenAPI Generator | $0 | SDK üretir |
| GitHub Actions | $0 (free tier) | Haftalık tarama |
| npm/PyPI publish | $0 | Dağıtım |
| Dashboard sayfası | $0 (mevcut Next.js) | Müşteri UI |
| **Toplam** | **$0** | Tam otomatik sistem |

### Düşük Bütçe ($250/ay+)

| Araç | Maliyet | Ne Yapar |
|------|---------|---------|
| Fern | $250/ay | Daha iyi SDK kalitesi + docs |
| **Toplam** | **$250/ay** | Profesyonel SDK'lar |

---

## 10. Uygulama Planı

### Faz 1: Temel Kurulum (1 hafta, $0)
1. OpenAPI spec'i kontrol et/güncelle (`docs/openapi.json`)
2. OpenAPI Generator kur (Docker veya npm)
3. 3 SDK için generate komutu yaz (Node, Python, Go)
4. GitHub Actions workflow oluştur (haftalık tarama)
5. Publish scriptleri yaz (npm, PyPI, git tag)

### Faz 2: Dashboard Entegrasyonu (1 hafta, $0)
1. Admin SDK sayfası (SDK durumu, güncelle butonu)
2. Müşteri SDK sayfası (versiyon bilgisi, changelog)
3. Güncelleme bildirimi (header'da rozet)
4. Kurulum rehberi (komutu kopyala butonu)

### Faz 3: İyileştirme (Ay, $0)
1. Breaking change detection (OpenAPI diff)
2. Changelog otomatik üretimi
3. SDK istatistikleri (hangi dil ne kadar kullanılıyor)
4. Müşteri bildirim sistemi

---

## 11. Kaynaklar

| Kaynak | URL | Ne İşe Yarar |
|--------|-----|-------------|
| OpenAPI Generator | github.com/openapitools/openapi-generator | SDK generation (bedava) |
| Fern | buildwithfern.com | SDK + docs generation |
| Stainless | stainless.com | En iyi SDK generation |
| Speakeasy | speakeasy.com | SDK + breaking change |
| Cloudflare Blog | blog.cloudflare.com/lessons-from-building-an-automated-sdk-pipeline/ | Pipeline referansı |
| Svix Portal | svix.com/application-portal/ | Müşteri portalı referansı |
| OpenAPI Spec | openapi.org | API specification standardı |
| Semver | semver.org | Versiyonlama standardı |
