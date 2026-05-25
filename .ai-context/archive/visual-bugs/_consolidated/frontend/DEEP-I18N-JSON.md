# 🔍 Deep i18n Audit Report — HookSniff Dashboard

**Tarih:** 2026-05-10
**Analiz edilen dosyalar:** 8 çeviri dosyası (`src/messages/`)
**Toplam unique key:** 893 | **en.json key sayısı:** 893

---

## 1. Eksik Key'ler

| Dil | Eksik Key Sayısı | Yüzde |
|-----|-----------------|-------|
| **tr** | 0 | 0.0% |
| **de** | 89 | 10.0% |
| **fr** | 89 | 10.0% |
| **es** | 89 | 10.0% |
| **ja** | 89 | 10.0% |
| **ko** | 89 | 10.0% |
| **pt-BR** | 89 | 10.0% |


### Eksik Key Özet (89 key, tüm dillerde aynı)
- `getStarted.*` section (25 key)
- `onboarding.*` section (30 key)  
- `pricingFaq.*` section (15 key)
- Çeşitli dashboard key'leri (19 key)

## 2. Yanlış Dil Karakterleri
| Dosya | Key | Değer | Beklenen | Gerçek |
|-------|-----|-------|----------|--------|
| tr.json | `a4` | `指向` | Türkçe | Çince |

## 3. Placeholder Sorunları
| Key | Dil | Sorun |
|-----|-----|-------|
| `apiKeys.keyCount` | tr | `{plural}` placeholder eksik |

## 4. Anlam Kayması
| Key | Dil | Çeviri | Doğrusu |
|-----|-----|--------|---------|
| `deliveries.title` | ko | 배달 (yemek) | 전달 |
| `deliveries.title` | de | Zustellungen (posta) | Lieferungen |
| `landing.pricing.business` | tr | İş | Kurumsal |

## 5. Çevrilmemiş Key Sayıları (en.json ile birebir aynı)
| Dil | Çevrilmemiş Key |
|-----|----------------|
| de | 502 |
| fr | 495 |
| es | 497 |
| ja | 487 |
| ko | 487 |
| pt-BR | 499 |

## 7. Kullanılmayan Key'ler: 471 adet

## 8. t() Kullanmayan Dosyalar (14 adet)
- customers/[slug]/page.tsx (36 hardcoded string)
- alternatives/*/page.tsx (8 dosya)
- providers/*/page.tsx (4 dosya)
- compare/CompareContent.tsx
