# 2026-05-20 — Loglar/Teslimatlar/Arama Birleştirme

## Oturum: 21:21–21:28 GMT+8

### Kullanıcı: Servet Arslan (servetarslan02)

---

## Yapılan İşler

### 1. Üç Sayfa Birleştirildi
- **Sorun:** Loglar, Teslimatlar, Arama — üçü de aynı veriyi (webhook teslimatları) farklı UX ile gösteriyordu
- **Çözüm:** Tek `DeliveriesContent.tsx` bileşeninde tüm özellikler birleştirildi

### Birleştirilen Özellikler:
| Özellik | Kaynak |
|---------|--------|
| SSE canlı stream | Deliveries |
| Auto-refresh (5sn) | Logs |
| Status count badge'leri | Logs |
| Replay (tekil) | Deliveries |
| Toplu replay (feature flag) | Deliveries |
| VirtualTable | Deliveries |
| Detay modal (attempt timeline) | Logs |
| Detay sayfası link | Deliveries |
| Server-side arama + debounce | Search |

### Dosya Değişiklikleri:
- `dashboard/src/app/[locale]/(dashboard)/deliveries/DeliveriesContent.tsx` — Yeni birleşik bileşen (639 satır)
- `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx` — TabbedSection yerine tek bileşen

### Eski Dosyalar (middleware redirect ile korunuyor):
- `logs/page.tsx` — `/logs` → `/deliveries` redirect
- `search/page.tsx` — `/search` → `/deliveries` redirect

### Build: ✅ Başarılı
### Push: `b52bb8b9`

---

## Teknik Notlar
- `SearchResult` tipi `endpoint_url` kullanır, `Delivery` tipi `endpoint_id` — `DisplayDelivery` union tipi ile çözüldü
- `useSearch` hook'u sadece `q` veya `status` varsa aktif olur
- Status count'lar ayrı API çağrılarıyla alınır (4 paralel istek)
- `bulk_replay` feature flag ile kontrol edilir
