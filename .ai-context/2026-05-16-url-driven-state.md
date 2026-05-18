# 2026-05-16 — URL-Driven State (Refresh Persistence)

## Sorun
Sayfa içindeki tab, filtre, sayfa numaraları `useState` ile tutuluyordu.
Tarayıcı yenilendiğinde veya link paylaşıldığında başlangıç durumuna dönüyordu.

## Çözüm
`useState` → `useSearchParams` + URL parametreleri olarak değiştirildi.
Artık sayfa yenilendiğinde kaldığı yerden devam eder.

## Değişilen Sayfalar

### 1. Deliveries (`/deliveries`)
- `page` → `?page=3`
- `filter` → `?status=failed`
- Örnek: `/deliveries?status=failed&page=2`

### 2. Admin Overview (`/admin`)
- `overviewTab` → `?tab=activity`
- Örnek: `/admin?tab=health`

### 3. Logs (`/logs`)
- `page` → `?page=2`
- `filter` → `?status=delivered`

### 4. Notifications (`/notifications`)
- `page` → `?page=1`
- `typeFilter` → `?type=alert`
- `readFilter` → `?read=unread`

## Pattern
```tsx
// Eski
const [page, setPage] = useState(1);

// Yeni
const searchParams = useSearchParams();
const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

// Değiştirirken
const params = new URLSearchParams(searchParams.toString());
params.set('page', '2');
router.push(`${pathname}?${params.toString()}`, { scroll: false });
```
