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
