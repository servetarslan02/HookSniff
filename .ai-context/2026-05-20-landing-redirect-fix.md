# 2026-05-20 — Landing Page Redirect Fix

## Sorun
Admin ve kullanıcı panelinde sol üstteki banner ana giriş sayfasına yönlendiriyordu ama tıklanınca hemen admin/user paneline geri atıyordu. Login olmuş kullanıcılar ana sayfaya ulaşamıyordu.

## Kök Neden
`dashboard/src/app/[locale]/content.tsx` satır 291-295'te admin kullanıcılar otomatik olarak `/admin`'e yönlendiriliyordu:
```tsx
useEffect(() => {
  if (user?.is_admin) {
    router.replace('/admin');
  }
}, [user, router]);
```

## Yapılan Düzeltmeler

### 1. Admin auto-redirect kaldırıldı
- `router.replace('/admin')` useEffect kaldırıldı
- Artık tüm kullanıcılar (admin dahil) landing page'de kalabilir

### 2. Landing page nav — profil dropdown eklendi
- Giriş yapmış kullanıcıya sağ üstte profil ikonu (avatar) gösteriliyor
- Tıklanınca dropdown: Dashboard/Admin Panel linki + Çıkış Yap
- Admin → `/admin`, normal kullanıcı → `/core`

### 3. CTA butonları düzeltildi
- Hero "Dashboard" butonu `/register` yerine gerçek dashboard'a gidiyor
- Mobil nav aynı düzeltme

### Değişen Dosya
- `dashboard/src/app/[locale]/content.tsx` — +61/-12

### Commit
- `c1de6c27`
