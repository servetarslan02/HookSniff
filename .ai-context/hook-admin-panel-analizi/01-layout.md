# 01 — Admin Layout (Shell)

**Dosya:** `dashboard/src/app/[locale]/admin/layout.tsx`  
**Satır:** ~200  
**Amaç:** Tüm admin sayfalarını saran ana kabuk

---

## Ne Yapıyor?

Admin panelinin layout bileşeni. Sidebar, header, auth guard ve sayfa container'ını sağlar.

## Temel Özellikler

### Auth Guard
```tsx
useEffect(() => {
  if (user && !user.is_admin) {
    router.push(`/${locale}/dashboard');
  }
}, [user, router, locale]);

if (!user?.is_admin) {
  return <AccessDeniedScreen />;  // 🔒 kilit ikonu + "Admin yetkiniz yok" mesajı
}
```
- `user.is_admin` kontrolü
- Admin olmayan kullanıcı `/dashboard`'a yönlendirilir
- Erişim engeli ekranı gösterilir

### Sidebar Navigation
```
📊 Overview      → /admin
👥 Users         → /admin/users
💰 Revenue       → /admin/revenue
🖥️ System        → /admin/system
⚙️ Settings      → /admin/settings
📋 Activity Log  → /admin/activity
```
- Aktif sayfa vurgusu (kırmızı arka plan)
- Mobilde hamburger menü ile açılır/kapanır
- `usePathname()` ile aktif rota tespiti

### Header
- **Sol:** Sayfa başlığı + Admin badge (kırmızı)
- **Orta:** Quick Search input → Enter ile `/admin/users?search=...`
- **Sağ:** Notification bell → `/admin/system`, Profile dropdown

### Profile Dropdown
- Kullanıcı email'i
- "Back to Dashboard" linki
- "Logout" butonu

### Responsive Tasarım
- Desktop: 64px genişliğinde sabit sidebar
- Mobil: Overlay sidebar, dışarı tıklayınca kapanır
- `md:translate-x-0` / `-translate-x-full` geçişleri

### Erişilebilirlik (ARIA)
- `aria-label` sidebar ve butonlarda
- `role="banner"` header'da
- `role="main"` içerik alanında
- Skip-to-content linki (`#admin-main-content`)

### Tema Desteği
- Dark/Light mode toggle (sidebar altında)
- `dark:` Tailwind sınıflarıyla kapsamlı destek

### i18n
- Tüm metinler `useTranslations('admin')` ve `useTranslations('common')` ile
- TR/EN destekli

## Kullanılan Bileşenler
- `ThemeToggle` — tema değiştirme
- `Link` (next-intl) — i18n linkleri
- `clsx` — koşullu class birleştirme

## State
```typescript
const [sidebarOpen, setSidebarOpen] = useState(false);  // Mobil sidebar
```

## Güvenlik
- Client-side auth guard (`is_admin` kontrolü)
- Backend'de ayrıca her API endpoint'inde admin kontrolü yapılmalı
