# 📦 Teslimatlar (Deliveries)

> Sayfa: `dashboard/src/app/[locale]/dashboard/deliveries/page.tsx`
> Route: `/dashboard/deliveries`
> Detay Sayfası: `/dashboard/deliveries/[id]`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatusBadge | `@/components/StatusBadge` | Durum rozeti |
| ConfirmDialog | `@/components/ConfirmDialog` | Replay onay dialogu |
| DetailRow | İç bileşen | Detay satırı |
| useToast | `@/components/Toast` | Bildirim |

### Veri Akışı
1. `webhooksApi.list(token, {page, status})` → teslimat listesi
2. `webhooksApi.replay(token, id)` → teslimat tekrarı

### State Yönetimi
| State | Tip | Açıklama |
|-------|-----|----------|
| deliveries | Delivery[] | Teslimat listesi |
| total | number | Toplam kayıt sayısı |
| page | number | Mevcut sayfa |
| loading | boolean | Yükleme |
| error | string | Hata mesajı |
| filter | string | Durum filtresi (all/delivered/failed/pending) |
| search | string | Arama metni |
| selected | Delivery | Seçili teslimat (detay modalı) |
| replayTarget | Delivery | Tekrar gönderilecek teslimat |
| replaying | boolean | Tekrar işlemi |

## Özellikler

### Liste Görünümü
- ✅ **Sayfalama** — 20 kayıt/sayfa, toplam sayısı ile
- ✅ **Durum Filtresi** — All / Delivered / Failed / Pending
- ✅ **Arama** — Event type ve ID ile arama (client-side)
- ✅ **Sıralama** — Yok (varsayılan created_at DESC varsayılıyor)
- ✅ **Tablo Kolonları:** ID, Event, Status, Attempts, Response, Time, Actions

### Detay Modalı
- ✅ ID, Event, Endpoint, Status, Attempts, HTTP Status, Created
- ✅ Attempts Timeline (deneme sayısı kadar adım)
- ✅ Modal kapatma (✕ + backdrop click)
- ✅ max-h-[80dvh] overflow-y-auto

### Replay İşlemi
- ✅ ConfirmDialog ile onay
- ✅ Toast ile başarı/hata mesajı
- ✅ Liste otomatik yenileme

### Erişilebilirlik
- ✅ Tablo satırı `role="link"` + `tabIndex={0}`
- ✅ Keyboard navigation (Enter/Space)
- ✅ aria-label satırlarda
- ✅ aria-live pagination bilgisinde
- ✅ `aria-hidden="true"` backdrop
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Server-side sayfalama (20 kayıt/sayfa)
- Durum filtresi ile API filtreleme
- Replay özelliği
- Attempts timeline
- Keyboard accessible tablo satırları
- getErrorMessage kullanımı
- useCallback ile fetchData memoization
- Overflow-x-auto tablo

### ⚠️ Potansiyel Sorunlar
- **Arama client-side** — search sadece mevcut sayfada filtreliyor, tüm veriyi kapsamıyor
- **Search + Pagination çelişisi** — Arama yapıldığında pagination gizleniyor ama veri sadece 20 kayıt
- **selected state unused** — Detay modalı var ama `selected` hiç set edilmiyor (satıra tıklama → router.push)
- **Replay butonu yok** — `replayTarget` state var ama UI'da replay butonu bulunamadı
- **Sıralama yok** — Kullanıcı sıralama seçemiyor
- **Tarih formatı** — `toLocaleString()` locale-aware ama i18n key ile yapılabilir
- **"View Details" hardcoded** — i18n key yerine hardcoded İngilizce

### 🔴 Eksiklikler
- Toplu replay yok
- Toplu durum filtreleme yok (sadece tek filtre)
- Export (CSV/JSON) yok
- Gerçek zamanlı güncelleme (WebSocket/polling) yok
- Tarih aralığı filtresi yok
- Endpoint bazlı filtreleme yok
- Event type bazlı filtreleme yok
- Teslimat detayında request/response body gösterimi yok (modalda)

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Webhook Export Butonu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Backend:** `GET /v1/webhooks/export?status=...&format=csv|json` — teslimatları dışa aktarır
- **Sorun:** api.ts'de `webhooksApi.export` tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     exportDeliveries: (token: string, params?: { status?: string; format?: string }) => {
       const qs = new URLSearchParams(params).toString();
       return apiFetch<string>(`/webhooks/export${qs ? `?${qs}` : ''}`, { token });
     },
     ```
  2. Sayfa header'ına "Dışa Aktar" butonu ekle
  3. Format seçici: CSV / JSON dropdown
  4. Mevcut filtre durumunu export'a aktar
  5. Dosya indirme: `Blob` + `URL.createObjectURL` + `<a download>`
  6. i18n key: `exportDeliveries`, `exportCSV`, `exportJSON`, `exporting`

#### BF-02: Batch Replay Butonu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Backend:** `POST /v1/webhooks/batch/replay` — toplu tekrar gönderme
- **Sorun:** api.ts'de `webhooksApi.batchReplay` tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     batchReplay: (token: string, deliveryIds: string[]) =>
       apiFetch<{ replayed: number }>('/webhooks/batch/replay', { method: 'POST', body: { delivery_ids: deliveryIds }, token }),
     ```
  2. Tablo satırlarına checkbox ekle
  3. "Seçilenleri Tekrar Gönder" butonu (toplu işlem bar'ında)
  4. ConfirmDialog: "X teslimat tekrar gönderilecek"
  5. Progress göstergesi (başarı/hata sayısı)
  6. i18n key: `batchReplay`, `batchReplayConfirm`, `replayProgress`

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

### 🔒 Güvenlik

#### G-01: "View Details" Hardcoded
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Sorun:** `View Details` metni i18n key kullanılmamış.
- **Adımlar:**
  1. i18n key ekle: `viewDetails`
  2. `t('viewDetails')` kullan

### 🔒 Memory Leak

#### ML-01: deliveries/[id] — setTimeout Cleanup Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/[id]/page.tsx`
- **Sorun:** `setTimeout` kullanılıyor ama `clearTimeout` yok.
- **Adımlar:**
  1. useEffect içinde timer oluştur
  2. Return'de `clearTimeout(timer)` ekle
