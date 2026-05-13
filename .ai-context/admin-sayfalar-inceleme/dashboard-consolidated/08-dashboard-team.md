# 👥 Ekip & Bildirimler — Ekip, Bildirimler, Uygulamalar, Cihazlar

> **Bölüm:** Ekip & Bildirimler  
> **İçerik:** Ekip, Bildirimler, Uygulamalar, Cihazlar  
> **İnceleme Tarihi:** 2026-05-12/13  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `26-ekip.md`, `27-bildirimler.md`, `30-uygulamalar.md`, `34-cihazlar.md`

---

## 📑 İçindekiler

- [1. Ekip (Team)](#1-ekip-team)
- [2. Bildirimler (Notifications)](#2-bildirimler-notifications)
- [3. Uygulamalar (Applications)](#3-uygulamalar-applications)
- [4. Cihazlar (Devices)](#4-cihazlar-devices)

---

## 1. Ekip (Team)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/team/page.tsx`  
> Route: `/team`

### Sayfa Yapısı
- TeamList — Ekip listesi
- TeamDetail — Ekip detayı (üyeler)
- CreateTeamModal — Ekip oluşturma
- InviteMemberModal — Üye davet
- ConfirmDialog — Üye çıkarma onayı

#### Rol Sistemi
- owner > admin > member
- canInvite: owner veya admin
- canRemove: owner veya admin
- canChangeRole: sadece owner

### Özellikler
- ✅ Ekip listeleme
- ✅ Ekip oluşturma
- ✅ Üye davet
- ✅ Üye çıkarma (onay ile)
- ✅ Rol bazlı yetkilendirme
- ✅ Owner demote koruması

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Rol bazlı yetkilendirme
- Bileşenlere ayrılmış yapı
- ConfirmDialog ile silme onayı
- Owner demote guard

#### 🔴 Eksiklikler
- Rol değiştirme
- Ekip silme
- Üye profili görüntüleme
- Ekip activity log

---

## 2. Bildirimler (Notifications)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx`  
> Route: `/notifications`

### Sayfa Yapısı
- Notification listesi
- Tip filtresi (all/webhook_failed/alert/system/billing)
- Okunma filtresi (all/read/unread)
- Sayfalama (20/sayfa)

#### Bildirim Tipleri
| Tip | İkon |
|-----|------|
| webhook_failed | 🔴 |
| alert | ⚠️ |
| system | 🔔 |
| billing | 💳 |

### Özellikler
- ✅ Bildirim listeleme
- ✅ Tip filtresi
- ✅ Okunma filtresi (read/unread)
- ✅ Sayfalama
- ✅ Bildirim silme (ConfirmDialog)
- ✅ Tip ikonları
- ✅ i18n desteği

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Bildirim listeleme
- Tip filtresi (all/webhook_failed/alert/system/billing)
- Okunma filtresi (all/read/unread)
- Sayfalama (20/sayfa)
- Bildirim silme (ConfirmDialog)
- Tip ikonları
- i18n desteği
- `notificationsApi.markAsRead` kullanımı ✅ — `handleMarkAsRead` fonksiyonu ile tekil bildirim okundu işaretleme
- `notificationsApi.markAllAsRead` kullanımı ✅ — `handleMarkAllAsRead` fonksiyonu ile toplu okundu işaretleme
- "Mark all as read" butonu header'da ✅

#### ⚠️ Potansiyel Sorunlar
- **any type kullanımı** — 1 yerde `any` type kullanılıyor (TYPE_I18N_MAP key erişimi)

#### 🔴 Eksiklikler
- Bildirim ayarları (tercihler)
- Push notification desteği

---

## 3. Uygulamalar (Applications)

> Sayfa: ❌ OLUŞTURULMALI  
> Route: `/applications`  
> Backend: `api/src/routes/applications.rs` — CRUD mevcut

### Backend Durumu

#### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| GET | `/v1/applications` | Uygulama listesi |
| POST | `/v1/applications` | Yeni uygulama oluşturma |
| GET | `/v1/applications/{id}` | Uygulama detayı |
| PUT | `/v1/applications/{id}` | Uygulama güncelleme |
| DELETE | `/v1/applications/{id}` | Uygulama silme |

### Frontend Yapılacaklar

#### Sayfa Yapısı
1. **Uygulama Listesi** — Grid görünümü (kartlar)
   - Uygulama adı, açıklama, endpoint sayısı, oluşturulma tarihi
   - Durum göstergesi (aktif/pasif)
2. **Oluşturma Formu** — Modal veya yeni sayfa
   - Ad, açıklama, webhook URL
3. **Detay Sayfası** — `/applications/[id]`
   - Endpoint'ler, teslimatlar, istatistikler
4. **Düzenleme** — Inline edit veya modal
5. **Silme** — ConfirmDialog ile

#### Sidebar Ekleme
```typescript
// sections[?].items'a ekle:
{ name: t('applications'), href: '/applications', icon: '📱' }
```

#### i18n Anahtarları (EN + TR)
- applications, applicationsDesc, createApplication, editApplication, deleteApplication
- applicationName, applicationDescription, noApplicationsYet

#### Öncelik: 🟡 YÜKSEK — Müşteri birden fazla uygulama yönetebilmeli

---

## 4. Cihazlar (Devices)

> Sayfa: ❌ OLUŞTURULMALI  
> Route: `/devices`  
> Backend: `api/src/routes/devices.rs` — mevcut

### Backend Durumu

#### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| GET | `/v1/devices` | Cihaz listesi |
| POST | `/v1/devices` | Cihaz kaydetme (push token) |
| DELETE | `/v1/devices/{id}` | Cihaz silme |

### Frontend Yapılacaklar

#### Sayfa Yapısı
1. **Cihaz Listesi** — Kayıtlı cihazlar (tablo)
   - Cihaz adı, tip (iOS/Android/Web), token (kısaltılmış), son aktivite
2. **Cihaz Kaydetme** — Push notification token ekleme
3. **Cihaz Silme** — ConfirmDialog ile silme
4. **Test Bildirim** — Test push notification gönderme

#### Neden Önemli?
- Müşteriler mobil/web push notification almak isteyebilir
- Cihaz yönetimi (eski cihazları temizleme)

#### Sidebar Ekleme
```typescript
// sections.account.items'a ekle (notifications'un yanına):
{ name: t('devices'), href: '/devices', icon: '📲' }
```

#### i18n Anahtarları (EN + TR)
- devices, devicesDesc, registerDevice, deviceName, deviceType, lastActive, noDevicesYet
- deleteDevice, testNotification, tokenRegistered

#### Öncelik: 🟢 ORTA — Push notification müşterileri için gerekli

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Ekip Detay Sayfası Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/team/page.tsx`
- **Backend:** `GET /v1/teams/{id}` — ekip detayı
- **Sorun:** `teamsApi.get` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor. Ekip detay sayfası yok.
- **Adımlar:**
  1. `dashboard/src/app/[locale]/(dashboard)/team/[id]/page.tsx` oluştur
  2. Ekip bilgileri, üye listesi, davet geçmişi
  3. `teamsApi.get(token, teamId)` çağrısı
  4. i18n key: `teamDetails`, `teamMembers`, `teamHistory`

#### BF-02: Okunmamış Bildirim Sayısı Gösterilmiyor
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx`
- **Backend:** `GET /v1/notifications/unread-count` — okunmamış sayısı
- **Sorun:** `notificationsApi.getUnreadCount` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor.
- **Adımlar:**
  1. `NotificationCenter` bileşeninde badge sayısı göster
  2. `notificationsApi.getUnreadCount(token)` çağrısını polling ile (30s)
  3. Badge: kırmızı daire içinde sayı
  4. i18n key: `unreadCount`

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik (Ekip, Bildirimler)
- **Etkilenen Dosyalar:**
  - `dashboard/src/app/[locale]/(dashboard)/team/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx`
- **Sorun:** Birden fazla `useEffect`, fetch var ama abort yok.
- **Adımlar:**
  1. Her useEffect başında `const controller = new AbortController()` oluştur
  2. `apiFetch` çağrısına `{ signal: controller.signal }` ekle
  3. useEffect return'ünde `return () => controller.abort()` ekle

### 🔒 Kod Kalitiesi

#### KK-01: any/unknown Type Kullanımı — Bildirimler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/notifications/page.tsx`
- **Sorun:** 1 yerde `any` type kullanılıyor.
- **Adımlar:**
  1. `any` → doğru type tanımlaması yap
