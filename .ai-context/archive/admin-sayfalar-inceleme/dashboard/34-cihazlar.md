# 📲 Cihazlar (Devices)

> Sayfa: ❌ OLUŞTURULMALI
> Route: `/dashboard/devices`
> Backend: `api/src/routes/devices.rs` — mevcut
> İnceleme Tarihi: 2026-05-13

## Backend Durumu

### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| GET | `/v1/devices` | Cihaz listesi |
| POST | `/v1/devices` | Cihaz kaydetme (push token) |
| DELETE | `/v1/devices/{id}` | Cihaz silme |

## Frontend Yapılacaklar

### Sayfa Yapısı
1. **Cihaz Listesi** — Kayıtlı cihazlar (tablo)
   - Cihaz adı, tip (iOS/Android/Web), token (kısaltılmış), son aktivite
2. **Cihaz Kaydetme** — Push notification token ekleme
3. **Cihaz Silme** — ConfirmDialog ile silme
4. **Test Bildirim** — Test push notification gönderme

### Neden Önemli?
- Müşteriler mobil/web push notification almak isteyebilir
- Cihaz yönetimi (eski cihazları temizleme)

### Sidebar Ekleme
```typescript
// sections.account.items'a ekle (notifications'un yanına):
{ name: t('devices'), href: '/devices', icon: '📲' }
```

### i18n Anahtarları (EN + TR)
- devices, devicesDesc, registerDevice, deviceName, deviceType, lastActive, noDevicesYet
- deleteDevice, testNotification, tokenRegistered

### Öncelik: 🟢 ORTA — Push notification müşterileri için gerekli
