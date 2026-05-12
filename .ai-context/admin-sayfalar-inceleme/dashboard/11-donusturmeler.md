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
