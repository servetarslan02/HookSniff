# 01 — Admin Layout (Shell)

**Dosya:** `dashboard/src/app/[locale]/admin/layout.tsx`  
**Satır:** ~200  
**Amaç:** Tüm admin sayfalarını saran ana kabuk

---

## Sayfada Ne Var?

### Sidebar (sol, 64px, sabit)
- Logo: ⚡ ikonu + "Admin Panel" başlığı
- 6 menü linki (Overview, Users, Revenue, System, Settings, Activity)
- "← Back to Dashboard" linki
- Theme Toggle (dark/light)

### Header (üst, 64px)
- Sol: Hamburger menü (mobil), sayfa başlığı, "Admin" badge
- Orta: Quick Search input (Enter ile kullanıcı arar)
- Sağ: Notification bell → system sayfası, Profile dropdown

### Main Content
- Sayfa içeriği buraya render edilir

### Mobile Overlay
- Siyah yarı saydam, sidebar açıkken tıklanınca kapanır

---

## Kullanılan Sistemler

| Sistem | Amaç |
|--------|------|
| `next-intl` (`useTranslations`) | i18n — tüm metinler TR/EN |
| `clsx` | Koşullu CSS class birleştirme |
| `useAuth()` (Zustand store) | Kullanıcı bilgisi, logout |
| `usePathname()` | Aktif rota tespiti |
| `useRouter()` | Programatik yönlendirme |
| `ThemeToggle` | Dark/Light mode |
| CSS `transition-transform` | Sidebar animasyonu |
| CSS `group-hover` | Profile dropdown açılması |

## Yapılan İşlemler

1. **Auth Guard:** `user.is_admin` false ise erişim engeli gösterilir
2. **Document Title:** "HookSniff — Webhook Teslimat Servisi" olarak ayarlanır
3. **Quick Search:** Enter'a basılınca `/admin/users?search=...`'a yönlendirir
4. **Logout:** `logout()` çağrılır, login sayfasına yönlendirilir

## State

```typescript
const [sidebarOpen, setSidebarOpen] = useState(false);  // Mobil sidebar
```

## Erişilebilirlik

- `aria-label` sidebar ve butonlarda
- `role="banner"` header'da
- `role="main"` içerik alanında
- Skip-to-content linki (`#admin-main-content`)

---

## 🔴 Kritik Sorunlar

1. **Client-side auth guard yetersiz** — `user.is_admin` sadece frontend'de kontrol ediliyor. Backend'de her `/admin/*` endpoint'inde ayrıca kontrol yapılmalı. Kullanıcı token'ı ile doğrudan API'ye istek atarak admin verilerine erişebilir.

2. **Document title hardcoded** — `document.title = 'HookSniff — Webhook Teslimat Servisi'` her admin sayfasında aynı. Sayfa bazlı başlık olmalı (ör: "Admin | Kullanıcılar").

3. **Quick Search sadece kullanıcı arıyor** — `router.push(/admin/users?search=...)` hardcoded. Endpoint, event, delivery araması yapılamıyor.

## 🟡 Orta Seviye Sorunlar

4. **Sidebar navigation statik** — `adminNavigation` array'i hardcoded. Plugin veya modüler yapı yok.

5. **Profile dropdown hover ile açılıyor** — `group-hover` kullanılmış, mobilde touch cihazlarda sorun çıkarabilir. `click` event'i olmalı.

6. **Notification bell sabit link** — `/admin/system`'a yönlendiriyor, gerçek notification sayısı gösterilmiyor.

7. **Logout sonrası yönlendirme locale gerektiriyor** — `router.push(/${locale}/login)` — locale undefined olursa 404.

## ✅ Olumlu

- Skip-to-content erişilebilirlik linki
- ARIA landmark'ları (banner, main, aside)
- Dark mode tam destek
- Mobil responsive sidebar
