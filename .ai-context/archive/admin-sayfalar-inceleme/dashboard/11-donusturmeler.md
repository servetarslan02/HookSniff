# 🔄 Dönüştürmeler (Transforms)

> Sayfa: `dashboard/src/app/[locale]/dashboard/transforms/page.tsx`
> Route: `/dashboard/transforms`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| ConfirmDialog | `@/components/ConfirmDialog` | Silme onay |
| useToast | `@/components/Toast` | Bildirim |

### Veri Akışı
- `endpointsApi.list(token)` → endpoint listesi
- `transformsApi.list(token, endpointId)` → transform kuralları
- `transformsApi.create(token, endpointId, {rule})` → kural oluşturma
- `transformsApi.delete(token, endpointId, ruleId)` → kural silme

### Transform Rule Tipleri
| Tip | Açıklama |
|-----|----------|
| filter.include | Sadece belirli alanları dahil et |
| filter.exclude | Belirli alanları hariç tut |
| mappings | Alan adı dönüştürme (source → target) |
| enrich | Yeni alan ekleme (key-value) |

## Özellikler

### Endpoint Seçimi
- ✅ Select ile endpoint seçimi
- ✅ Endpoint değişince kurallar otomatik yüklenir

### Kural Oluşturma
- ✅ Filter (include/exclude) — virgülle ayrılmış
- ✅ Mapping (source → target)
- ✅ Enrich (key → value)
- ✅ Tümü opsiyonel (bir veya birden fazla kombinasyon)

### Kural Görüntüleme
- ✅ Renk kodlu tag'ler (mavi=filter, mor=map, yeşil=enrich)
- ✅ Kod görünümü (font-mono)
- ✅ Silme butonu (ConfirmDialog ile)

### Erişilebilirlik
- ✅ htmlFor/id eşleştirmesi (7 input)
- ✅ aria-label silme butonunda
- ✅ i18n tüm metinlerde

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Endpoint bazlı transform kuralları
- Renk kodlu tag sistemi
- 3 farklı transform tipi (filter, map, enrich)
- Form temizleme sonrası
- Bileşen yapısı basit ve anlaşılır

### ⚠️ Potansiyel Sorunlar
- **Kural düzenleme yok** — Sadece oluşturma ve silme
- **Sıralama yok** — Kuralların çalışma sırası belirlenemiyor
- **Önizleme yok** — Kuralın etkisi gösterilmiyor
- **Test yok** — Kural test edilemiyor
- **Kural kopyalama yok**

### 🔴 Eksiklikler
- Kural düzenleme (update)
- Kural sıralama (drag-drop veya up/down)
- Transform önizleme (örnek veri ile)
- Kural test etme
- Toplu kural yönetimi
- Kural şablonları

---

## 🔧 Backend & Frontend Uyumsuzluğu (2026-05-13)

### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Transform düzenleme | — (backend'de update endpoint'i yok) | ❌ Form yok | Backend'e eklenmeli |
| Transform sıralama | — (backend'de reorder endpoint'i yok) | ❌ Sürükleme yok | Backend'e eklenmeli |
| Transform test | — (backend'de test endpoint'i yok) | ❌ Buton yok | Backend'e eklenmeli |

### Yapılacaklar
1. **Transform Düzenleme** — Mevcut kuralı güncelleme
   - Backend: `PUT /v1/endpoints/{endpoint_id}/transforms/{id}` endpoint'i eklenmeli
   - Frontend: "Düzenle" butonu → mevcut değerlerle form
2. **Transform Sıralama** — Kuralların çalışma sırası
   - Backend: `PUT /v1/endpoints/{endpoint_id}/transforms/reorder` endpoint'i eklenmeli
   - Frontend: Sürükle-bırak veya yukarı/aşağı butonları
3. **Transform Önizleme** — Kuralın etkisini göster
   - Frontend: "Önizle" butonu → örnek veri ile transform sonucu
4. **Transform Test** — Kuralı test etme
   - Backend: `POST /v1/endpoints/{endpoint_id}/transforms/test` endpoint'i eklenmeli
   - Frontend: Payload textarea + "Test Et" butonu + önce/sonra karşılaştırma
5. **Kural Şablonları** — Önceden tanımlı transform şablonları
   - Frontend: "Şablonlardan Ekle" butonu → şablon seçimi

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Transform Düzenleme Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`
- **Backend:** — (backend'de update endpoint'i yok)
- **Sorun:** Sadece oluşturma ve silme var, düzenleme yok.
- **Adımlar:**
  1. Backend'e `PUT /v1/endpoints/{endpoint_id}/transforms/{id}` ekle (Rust)
  2. `api.ts`'ye `transformsApi.update` ekle
  3. Her transform kartına "Düzenle" butonu ekle
  4. Mevcut değerlerle form

#### BF-02: Transform Sıralama Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`
- **Backend:** — (backend'de reorder endpoint'i yok)
- **Sorun:** Kuralların çalışma sırası belirlenemiyor.
- **Adımlar:**
  1. Backend'e `PUT /v1/endpoints/{endpoint_id}/transforms/reorder` ekle
  2. Sürükle-bırak (react-beautiful-dnd) veya yukarı/aşağı butonları
  3. Sıra numarası gösterimi

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`
- **Sorun:** 3 useEffect, 4 fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: Pagination Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`
- **Sorun:** Tüm kurallar tek seferde yükleniyor.
- **Adımlar:**
  1. Backend pagination desteği varsa ekle
