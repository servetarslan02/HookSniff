# 🐛 02 — Dokümantasyon Sayfaları Hataları

> Durum: 🔴 KRİTİK — 15 doc sayfasının sadece 8'i doğru içerik gösteriyor
> Etkilenen sayfa: 15
> Tahmini düzeltme süresi: 1-2 saat

---

## Genel Durum

| Durum | Sayı | Yüzde |
|-------|------|-------|
| ✅ Doğru içerik gösteren | 8 | %53 |
| 🔴 Yanlış içerik gösteren | 6 | %40 |
| 🔴 404 dönen | 1 | %7 |

---

## Doğru Çalışan Doc Sayfaları (8)

| URL | İçerik | Çeviri Durumu |
|-----|--------|---------------|
| `/tr/docs` | Doc ana sayfa | 🟡 Başlıklar İngilizce |
| `/tr/docs/sdks` | SDK rehberi | 🟡 Karışık |
| `/tr/docs/architecture` | Mimari | ❌ Tamamen İngilizce |
| `/tr/docs/security` | Güvenlik | ❌ Tamamen İngilizce |
| `/tr/docs/dlq` | Dead Letter Queue | ❌ Tamamen İngilizce |
| `/tr/docs/dashboard` | Dashboard rehberi | ❌ Tamamen İngilizce |
| `/tr/docs/portal` | Portal rehberi | ❌ Tamamen İngilizce |
| `/tr/docs/self-hosting` | Self-hosting | ❌ Tamamen İngilizce |

---

## Bozuk Doc Sayfaları (7)

### 1. `/tr/docs/quickstart` — Blog gösteriyor
| Özellik | Değer |
|---------|-------|
| Beklenen | Hızlı başlangıç rehberi |
| Gerçek | Blog sayfası (blog posts, newsletter, pagination) |
| Sidebar | ❌ Docs sidebar yok |
| Layout | Blog layout kullanılıyor |

### 2. `/tr/docs/concepts` — Login gösteriyor
| Özellik | Değer |
|---------|-------|
| Beklenen | Temel kavramlar |
| Gerçek | Login sayfası ("Tekrar hoş geldin") |
| Sidebar | ❌ Docs sidebar yok |
| Layout | Auth layout kullanılıyor |

### 3. `/tr/docs/api` — 404
| Özellik | Değer |
|---------|-------|
| Beklenen | API referansı |
| Gerçek | 404 — "This page could not be found." |
| Sidebar | ❌ 404 sayfası |
| Etki | Sidebar'dan link verildiği için tüm doc sayfalarından kırık link |

### 4. `/tr/docs/retries` — Login gösteriyor
| Özellik | Değer |
|---------|-------|
| Beklenen | Retry mekanizması dokümantasyonu |
| Gerçek | Login sayfası ("Tekrar hoş geldin") |
| Sidebar | ❌ Docs sidebar yok |

### 5. `/tr/docs/idempotency` — ShopFlow hikayesi gösteriyor
| Özellik | Değer |
|---------|-------|
| Beklenen | İdempotency açıklaması |
| Gerçek | ShopFlow müşteri hikayesi (case study) |
| Sidebar | ❌ Docs sidebar yok |

### 6. `/tr/docs/event-types` — Login'e yönlendiriyor
| Özellik | Değer |
|---------|-------|
| Beklenen | Event türleri listesi |
| Gerçek | `/tr/login`'e redirect |
| Erişilebilirlik | Tamamen erişilemez |

### 7. `/tr/docs/integrations` — Svix karşılaştırması gösteriyor
| Özellik | Değer |
|---------|-------|
| Beklenen | Entegrasyon rehberi |
| Gerçek | HookSniff vs Svix karşılaştırma sayfası |
| Layout | Alternatives layout kullanılıyor |

---

## Doc Link Sorunları

### Locale Prefix Eksik
`/tr/docs` ana sayfasındaki 8 kart linki `/docs/xxx`'e gidiyor, `/tr/docs/xxx`'e değil.

| Link Text | Hedef (yanlış) | Olması gereken |
|-----------|----------------|----------------|
| Quickstart | `/docs/quickstart` | `/tr/docs/quickstart` |
| Core Concepts | `/docs/concepts` | `/tr/docs/concepts` |
| API Reference | `/docs/api` | `/tr/docs/api` |
| SDKs | `/docs/sdks` | `/tr/docs/sdks` |
| Security | `/docs/security` | `/tr/docs/security` |
| Dashboard | `/docs/dashboard` | `/tr/docs/dashboard` |
| Integrations | `/docs/integrations` | `/tr/docs/integrations` |
| Self-Hosting | `/docs/self-hosting` | `/tr/docs/self-hosting` |

### Sidebar Dead Link
Tüm doc sayfalarının sidebar'ında `/docs/api` linki var ama bu sayfa 404 dönüyor.

---

## SDK Docs Sorunları

### Sızan Import (`/tr/docs/sdks`)
Node.js signature verification örneğinde:
```typescript
import { useTranslations } from 'next-intl'; // ← Bu SDK kodu değil, Next.js framework kodu
```
Bu import SDK dokümantasyonunda olmamalı.

### Karışık Dil
- Python bölümü Türkçe başlıklar kullanıyor ("Kurulum", "Hızlı Başlangıç")
- Node.js bölümü İngilizce başlıklar kullanıyor ("Installation", "Quick Start")
- Tutarlılık yok

---

## Önerilen Düzeltme Adımları

1. **Route dosyalarını kontrol et** — `app/[locale]/docs/*/page.tsx` dosyaları doğru içerik mi render ediyor?
2. **Layout dosyasını kontrol et** — `app/[locale]/docs/layout.tsx` doğru sidebar mı gösteriyor?
3. **Link'leri düzelt** — `/tr/docs` sayfasındaki kart href'lerine `/tr` prefix ekle
4. **404 sayfasını düzelt** — `/tr/docs/api` ya doğru içerik göstermeli ya da sidebar'dan kaldırılmalı
5. **Sızan import'u temizle** — `docs/sdks/page.tsx` içindeki `useTranslations` import'unu kaldır