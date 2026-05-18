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

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Okunmamış Bildirim Sayısı Gösterilmiyor
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx`
- **Backend:** `GET /v1/notifications/unread-count` — okunmamış sayısı
- **Sorun:** `notificationsApi.getUnreadCount` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor.
- **Adımlar:**
  1. `NotificationCenter` bileşeninde badge sayısı göster
  2. `notificationsApi.getUnreadCount(token)` çağrısını polling ile (30s)
  3. Badge: kırmızı daire içinde sayı
  4. i18n key: `unreadCount`

### 🔒 Kod Kalitesi

#### KK-01: any/unknown Type Kullanımı
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx`
- **Sorun:** 1 yerde `any` type kullanılıyor.
- **Adımlar:**
  1. `any` → doğru type tanımlaması yap
