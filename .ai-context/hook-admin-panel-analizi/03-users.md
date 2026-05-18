# 03 — Users (Kullanıcı Yönetimi)

**Dosya:** `dashboard/src/app/[locale]/admin/users/page.tsx`  
**Satır:** ~500  
**Amaç:** Tüm kullanıcıları listeleme, filtreleme, toplu işlemler

---

## Sayfada Ne Var?

### Arama ve Filtre Çubuğu
- Email search input (form submit)
- Plan filter: All/Free/Pro/Business
- Status filter: All/Active/Banned
- Date range: All time/7d/30d/90d
- Export CSV butonu

### Bulk Action Bar (seçili kullanıcılar varsa)
- Seçili sayısı
- 🚫 Ban Selected
- ✅ Unban Selected
- 📋 Change Plan
- ✕ Cancel

### Kullanıcı Tablosu
| Kolon | İçerik |
|-------|--------|
| Checkbox | Bulk selection (select all / tek tek) |
| ID | İlk 8 karakter + `…` |
| Email | Gradient avatar + email |
| Name | İsim veya `—` |
| Plan | Renkli badge (Free=gri, Pro=mavi, Business=mor) + Role badge |
| Status | StatusBadge bileşeni |
| Created | `tr-TR` tarih formatı |
| Actions | View, Change Plan, Ban/Activate, Impersonate |

### Sıralama
- Email, Name, Plan, Status, Created At
- ASC/DESC toggle (`↑` / `↓` ikonu)

### Pagination
- 20 kullanıcı/sayfa
- "Showing X to Y of Z" bilgisi
- Previous/Next butonları

### Modal: Ban Reason
- "Ban User" başlığı
- Ban reason textarea (opsiyonel)
- Cancel / Ban User butonları

### Modal: Plan Change
- "Change Plan" başlığı
- Plan selector (Free/Pro/Business)
- Cancel / Update Plan butonları

### Modal: Bulk Action Confirm
- "Ban/Unban/Change Plan Selected" başlığı
- "This will affect X user(s)" mesajı
- Plan selector (sadece plan değişikliğinde)
- Cancel / Confirm butonları

---

## Kullanılan Sistemler

| Sistem | Amaç |
|--------|------|
| `adminApi.listUsers()` | Kullanıcı listesi (filtreli) — GET /admin/users |
| `adminApi.updateUserPlan()` | Plan değiştirme — PUT /admin/users/{id}/plan |
| `adminApi.updateUserStatus()` | Ban/Activate — PUT /admin/users/{id}/status |
| `adminApi.impersonateUser()` | Kullanıcı gibi görüntüleme — POST /admin/users/{id}/impersonate |
| `adminApi.exportUsers()` | CSV export — GET /admin/users/export |
| `adminApi.createAuditLog()` | Audit log kaydı — POST /admin/audit-logs |
| `StatusBadge` | Durum rozeti |
| `Toast` | Bildirim |
| `Set<string>` | Bulk selection |
| `Promise.allSettled` | Toplu işlem |
| `localeCompare` | Client-side sıralama |
| `useTranslations('admin')` | i18n |

## API Çağrıları

```typescript
// Listeleme
GET /admin/users?page=&search=&plan=&status=&created_after=

// Tekil işlemler
PUT /admin/users/{id}/plan      → { plan: "pro" }
PUT /admin/users/{id}/status    → { is_active: false }
POST /admin/users/{id}/impersonate

// Toplu
GET /admin/users/export?plan=&status=

// Audit
POST /admin/audit-logs → { action, resource_type, resource_id, details }
```

## State

```typescript
const [users, setUsers] = useState<AdminUser[]>([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [loading, setLoading] = useState(true);
const [search, setSearch] = useState('');
const [planFilter, setPlanFilter] = useState('');
const [statusFilter, setStatusFilter] = useState('');
const [dateRange, setDateRange] = useState('');
const [planChangeTarget, setPlanChangeTarget] = useState<AdminUser | null>(null);
const [newPlan, setNewPlan] = useState('');
const [sortField, setSortField] = useState('created_at');
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [bulkAction, setBulkAction] = useState<'ban' | 'unban' | 'plan' | null>(null);
const [bulkPlan, setBulkPlan] = useState('free');
const [bulkProcessing, setBulkProcessing] = useState(false);
const [banTarget, setBanTarget] = useState<AdminUser | null>(null);
const [banReason, setBanReason] = useState('');
```

---

## 🔴 Kritik Sorunlar

1. **CSV export token'ı URL'de taşıyor** — `window.open(${API}${url}&token=${token})` — token URL'de görünür, loglarda kalabilir. Header ile gönderilmeli.

2. **Impersonate token'ı URL'de** — `?impersonate_token=...` — aynı güvenlik riski.

3. **Ban reason kaydedilmiyor** — `adminApi.createAuditLog?.()` optional chaining ile çağrılıyor, audit log API'si yoksa sessizce başarısız oluyor.

4. **Toplu işlemlerde error handling zayıf** — `Promise.allSettled` kullanılıyor ama başarısız olanların ID'leri gösterilmiyor.

5. **Pagination 20/sayfa hardcoded** — `const perPage = 20` — kullanıcı tarafından değiştirilemiyor.

## 🟡 Orta Seviye Sorunlar

6. **Sıralama client-side** — `sortedUsers` sadece mevcut sayfadaki kullanıcıları sıralıyor. Tüm veri sıralanmıyor.

7. **Search debounce yok** — Form submit ile gidiyor ama kullanıcı deneyimi açısından debounce olmalı.

8. **Date range filtresi API'ye gidiyor ama UI'da "All time" varsayılan** — İlk yüklemede tüm kullanıcılar geliyor.

9. **Plan change modal'ında mevcut plan gösterilmiyor** — Sadece selector, "Mevcut plan: Free" bilgisi yok.

10. **Tablo erişilebilirliği** — `<th scope="col">` var ama tablo caption yok.

## ✅ Olumlu

- Bulk selection (select all, clear)
- Modal ile onay (ban, plan change)
- CSV export
- Impersonate özelliği
- Responsive tablo
- Alternatif satır renklendirme (zebra stripe)
