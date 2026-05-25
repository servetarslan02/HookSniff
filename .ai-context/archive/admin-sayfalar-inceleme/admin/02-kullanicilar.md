# 👤 Kullanıcılar (Admin Users)

> Sayfa: `admin/users/page.tsx`
> Route: `/admin/users`
> Detay: `admin/users/[id]/page.tsx`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatusBadge | `@/components/StatusBadge` | Durum rozeti |
| useToast | `@/components/Toast` | Bildirim |
| Link | i18n/navigation | Kullanıcı detay |

### Veri Akışı
- `adminApi.listUsers(token, {page, search, plan, status, created_after})` → Kullanıcı listesi
- `adminApi.updateUserPlan(token, id, plan)` → Plan değiştirme
- `adminApi.updateUserStatus(token, id, status)` → Ban/activate
- `adminApi.impersonateUser(token, id)` → Kullanıcı taklidi
- `adminApi.exportUsers(token, {plan, status})` → CSV export URL

### AdminUser Interface
- id, email, name, plan, role, status, created_at

## Özellikler

### Arama & Filtreleme
- ✅ **Arama** — Email ile arama (form submit)
- ✅ **Plan filtresi** — All/Free/Pro/Business
- ✅ **Durum filtresi** — All/Active/Banned
- ✅ **Tarih aralığı** — All time/7d/30d/90d
- ✅ **CSV Export** — Filtrelenmiş kullanıcıları dışa aktarma

### Sıralama
- ✅ **Çoklu sıralama** — Email, Name, Plan, Status, Created_at
- ✅ **ASC/DESC** — Tıklama ile yön değiştirme
- ✅ **Sıralama göstergesi** — ↑↓ ok ikonları

### Toplu İşlem (Bulk Actions)
- ✅ **Checkbox seçimi** — Tekli/tüm seçimi
- ✅ **Bulk Ban** — Seçili kullanıcıları banlama
- ✅ **Bulk Unban** — Seçili kullanıcıları aktif etme
- ✅ **Bulk Plan Change** — Seçili kullanıcıların planını değiştirme
- ✅ **Onay modalları** — Her işlem için ayrı modal
- ✅ **Progress** — Başarı/hata sayısı gösterimi

### Kullanıcı İşlemleri
- ✅ **Plan Değiştirme** — Modal ile plan seçimi
- ✅ **Ban/Activate** — Durum değiştirme
- ✅ **Ban Reason** — Ban sebebi (opsiyonel textarea)
- ✅ **Impersonate** — Kullanıcı taklidi (yeni sekme)
- ✅ **View Detail** — Kullanıcı detay sayfası

### Tablo
- ✅ Checkbox seçimi
- ✅ Avatar (gradient, ilk harf)
- ✅ Plan badge (renk kodlu)
- ✅ Role badge (amber, admin/owner)
- ✅ StatusBadge
- ✅ Tarih formatı (tr-TR)
- ✅ Zebra stripes (alternatif satır renkleri)

### Erişilebilirlik
- ✅ scope="col" tablo header'larında
- ✅ aria-label checkbox'larda
- ✅ sr-only label'lar
- ✅ Keyboard navigation
- ✅ Dark mode tam destek

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- Kapsamlı filtreleme (4 filtre)
- Çoklu sıralama
- Toplu işlem (ban/unban/plan change)
- CSV export
- Impersonate
- Ban reason
- Zebra stripes
- i18n tam destek

### ⚠️ Potansiyel Sorunlar
- **Impersonate token URL'de** — `?impersonate_token=` query param (güvenlik riski)
- **Ban reason audit log** — `createAuditLog?.()` optional chaining (best-effort)
- **Export URL token** — `&token=${token}` URL'de (güvenlik riski)

### 🔴 Eksiklikler
- Kullanıcı detay sayfası bilinmiyor (incelenmedi)
- Email gönderme butonu yok
- Kullanıcı notu/etiketi yok
- Activity log filtreleme (kullanıcı bazlı) yok
