# 03 — Users (Kullanıcı Yönetimi)

**Dosya:** `dashboard/src/app/[locale]/admin/users/page.tsx`  
**Satır:** ~500  
**Amaç:** Tüm kullanıcıları listeleme, filtreleme, toplu işlemler

---

## Arama ve Filtreleme
| Filtre | Tip | Açıklama |
|--------|-----|----------|
| Search | Text input | Email ile arama |
| Plan | Select | All/Free/Pro/Business |
| Status | Select | All/Active/Banned |
| Date Range | Select | All time/7d/30d/90d |
| Export CSV | Button | Filtrelenmiş kullanıcıları indir |

## Tablo Kolonları
| Kolon | İçerik |
|-------|--------|
| Checkbox | Bulk selection |
| ID | İlk 8 karakter + `…` |
| Email | Gradient avatar + email |
| Name | İsim veya `—` |
| Plan | Renkli badge + Role badge |
| Status | StatusBadge bileşeni |
| Created | `tr-TR` tarih formatı |
| Actions | View/ChangePlan/Ban/Impersonate |

## Sıralama
- Email, Name, Plan, Status, Created At
- ASC/DESC toggle (`↑` / `↓` ikonu)

## Toplu İşlemler (Bulk Actions)
```
selectedIds: Set<string>  → Seçili kullanıcı ID'leri
bulkAction: 'ban' | 'unban' | 'plan' | null
```
- **Ban Selected** → `Promise.allSettled(ids.map(id => updateUserStatus(token, id, 'banned')))`
- **Unban Selected** → Aynı, status='active'
- **Change Plan** → Toplu plan değişikliği (modal)
- Başarı/başarısız sayısı toast ile gösterilir

## Tekil İşlemler

### 1. Plan Değiştirme
- Modal açılır → Plan selector (Free/Pro/Business)
- `adminApi.updateUserPlan(token, userId, newPlan)`

### 2. Kullanıcı Banlama
- Modal açılır → Ban reason textarea (opsiyonel)
- `adminApi.updateUserStatus(token, userId, 'banned')`
- Audit log kaydı (best-effort)

### 3. Kullanıcı Aktifleştirme
- Direkt `adminApi.updateUserStatus(token, userId, 'active')`

### 4. Impersonate
- `adminApi.impersonateUser(token, userId)` → token döner
- Yeni sekmede `?impersonate_token=...` ile açılır

### 5. CSV Export
- `adminApi.exportUsers(token, { plan, status })`
- Yeni sekmede açılır

## Pagination
- 20 kullanıcı/sayfa
- "Showing X to Y of Z" bilgisi
- Previous/Next butonları

## State
```typescript
const [users, setUsers] = useState<AdminUser[]>([]);
const [total, setTotal] = useState(0);
const [page, setPage] = useState(1);
const [search, setSearch] = useState('');
const [planFilter, setPlanFilter] = useState('');
const [statusFilter, setStatusFilter] = useState('');
const [dateRange, setDateRange] = useState('');
const [sortField, setSortField] = useState<'email'|'name'|'plan'|'status'|'created_at'>('created_at');
const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [bulkAction, setBulkAction] = useState<'ban'|'unban'|'plan'|null>(null);
const [planChangeTarget, setPlanChangeTarget] = useState<AdminUser|null>(null);
const [banTarget, setBanTarget] = useState<AdminUser|null>(null);
const [banReason, setBanReason] = useState('');
```
