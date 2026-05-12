# 🔔 Bildirimler (Notifications)

> Sayfa: `dashboard/src/app/[locale]/dashboard/notifications/page.tsx`
> Route: `/dashboard/notifications`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- Notification listesi
- Tip filtresi (all/webhook_failed/alert/system/billing)
- Okunma filtresi (all/read/unread)
- Sayfalama (20/sayfa)

### Bildirim Tipleri
| Tip | İkon |
|-----|------|
| webhook_failed | 🔴 |
| alert | ⚠️ |
| system | 🔔 |
| billing | 💳 |

## Özellikler
- ✅ Bildirim listeleme
- ✅ Tip filtresi
- ✅ Okunma filtresi (read/unread)
- ✅ Sayfalama
- ✅ Bildirim silme (ConfirmDialog)
- ✅ Tip ikonları
- ✅ i18n desteği

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Bildirim okundu işaretleme yok** — UI'da buton yok
- **Toplu okundu işaretleme yok**

### 🔴 Eksiklikler
- Bildirim okundu işaretleme
- Toplu okundu işaretleme
- Bildirim ayarları (tercihler)
- Push notification desteği
