# HookSniff Admin Panel — Kaynak Kod Analiz Raporu

**Tarih:** 2026-05-10  
**Analiz edilen dosyalar:** 7 admin component dosyası  
**Test dosyaları:** Hariç (sadece production kod incelendi)

---

## Analiz Edilen Dosyalar

| # | Dosya | Satır |
|---|-------|-------|
| 1 | `src/app/[locale]/admin/layout.tsx` | 170 |
| 2 | `src/app/[locale]/admin/page.tsx` | 173 |
| 3 | `src/app/[locale]/admin/revenue/page.tsx` | 166 |
| 4 | `src/app/[locale]/admin/settings/page.tsx` | 199 |
| 5 | `src/app/[locale]/admin/system/page.tsx` | 186 |
| 6 | `src/app/[locale]/admin/users/[id]/page.tsx` | 283 |
| 7 | `src/app/[locale]/admin/users/page.tsx` | 247 |

---

## A. HARDCODE STRING'LER

### 🔴 KRİTİK — `layout.tsx` (17 hardcoded string)

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 12 | `name: 'Overview'` | i18n değil |
| 13 | `name: 'Users'` | i18n değil |
| 14 | `name: 'Revenue'` | i18n değil |
| 15 | `name: 'System'` | i18n değil |
| 16 | `name: 'Settings'` | i18n değil |
| 43 | `<h2>Access Denied</h2>` | i18n değil |
| 44 | `<p>You don&apos;t have admin privileges.</p>` | i18n değil |
| 50 | `Back to Dashboard` | i18n değil |
| 78 | `<div>Admin Panel</div>` | i18n değil |
| 79 | `<div>HookSniff Management</div>` | i18n değil |
| 120 | `Back to Dashboard` | i18n değil |
| 134 | `Admin` (badge) | i18n değil |
| 160 | `Logout` | i18n değil |

**Önerilen Çözüm:**
```tsx
// layout.tsx'te useTranslations ekle
const t = useTranslations('admin');
// Sonra:
name: t('navOverview')  // veya navigation array'ini component içine taşı
<h2>{t('accessDenied')}</h2>
<p>{t('noAdminPrivileges')}</p>
```

---

### 🔴 KRİTİK — `page.tsx` (Admin Overview) (3 hardcoded string)

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 73 | `<h1>Admin Overview</h1>` | i18n değil (t('overview') loading'de var ama ana başlıkta yok) |
| 74 | `<p>Platform-wide metrics and recent activity</p>` | i18n değil |
| 128 | `No recent signups` | i18n değil |

**Önerilen Çözüm:**
```tsx
<h1>{t('adminOverview')}</h1>
<p>{t('platformMetricsDesc')}</p>
// No recent signups:
{t('noRecentSignups')}
```

---

### 🔴 KRİTİK — `revenue/page.tsx` (4 hardcoded string)

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 51 | `<h1>Revenue Dashboard</h1>` | i18n değil |
| 52 | `<p>Financial metrics and revenue breakdown</p>` | i18n değil |
| 105 | `formatter={(value) => [\`$\${value.toLocaleString()}\`, 'Revenue']}` | Tooltip label i18n değil |
| 134 | `<span>({entry.count} users)</span>` | i18n değil |

**Önerilen Çözüm:**
```tsx
<h1>{t('revenueDashboard')}</h1>
<p>{t('financialMetricsDesc')}</p>
// Tooltip:
formatter={(value) => [`$${value.toLocaleString()}`, t('revenueLabel')]}
// Users count:
<span>({t('usersCount', { count: entry.count })})</span>
```

---

### 🔴 KRİTİK — `settings/page.tsx` (15+ hardcoded string)

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 63 | `toast('Failed to save settings', 'error')` | Hata mesajı İngilizce |
| 73 | `<p>Configure platform-wide defaults and limits</p>` | i18n değil |
| 79 | `<label>Default Plan</label>` | i18n değil |
| 86 | `<option>Free</option>`, `<option>Pro</option>` | i18n değil |
| 94 | `<label>Max Endpoints</label>` | i18n değil |
| 103 | `<label>Max Webhooks/Month</label>` | i18n değil |
| 112 | `<label>Rate Limit (req/min)</label>` | i18n değil |
| 121 | `<label>Retention (days)</label>` | i18n değil |
| 130 | `<label>Max Retry Attempts</label>` | i18n değil |
| 141 | `Max Endpoints` (Pro) | i18n değil |
| 150 | `Max Webhooks/Month` (Pro) | i18n değil |
| 159 | `Rate Limit (req/min)` (Pro) | i18n değil |
| 168 | `Retention (days)` (Pro) | i18n değil |

**Önerilen Çözüm:**
```tsx
const t = useTranslations('admin');
const tc = useTranslations('common');
// Tüm label'lar için:
<label>{t('defaultPlan')}</label>
<label>{t('maxEndpoints')}</label>
<label>{t('maxWebhooksMonth')}</label>
<label>{t('rateLimitPerMin')}</label>
<label>{t('retentionDays')}</label>
<label>{t('maxRetryAttempts')}</label>
// Hata mesajı:
toast(tc('saveFailed'), 'error');  // veya t('settingsSaveFailed')
```

---

### 🔴 KRİTİK — `system/page.tsx` (12+ hardcoded string)

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 91 | `<p>Monitor infrastructure services and system status</p>` | i18n değil |
| 116 | `Last checked: {new Date().toLocaleString()} · Auto-refresh every 15s` | i18n değil |
| 165-170 | `'API Server'`, `'PostgreSQL Database'`, `'Redis Cache'`, `'Webhook Queue'` | Service isimleri i18n değil |
| 166 | `'Checking...'` | i18n değil |
| 178 | `{ label: 'API Server', value: 'Oracle Cloud ARM', detail: '4 OCPU, 24 GB RAM' }` | i18n değil |
| 179 | `{ label: 'Database', value: 'Neon PostgreSQL', detail: 'Serverless, 0.5 GB' }` | i18n değil |
| 180 | `{ label: 'Cache', value: 'Upstash Redis', detail: 'Serverless, 256 MB' }` | i18n değil |
| 181 | `{ label: 'CDN', value: 'Cloudflare', detail: 'DNS, SSL, DDoS' }` | i18n değil |
| 182 | `{ label: 'Dashboard', value: 'Vercel', detail: 'Next.js 15' }` | i18n değil |
| 183 | `{ label: 'Monitoring', value: 'Grafana Cloud', detail: 'OpenTelemetry' }` | i18n değil |

**Not:** Infrastructure bilgileri teknik/marka isimleri olduğu için i18n tartışılabilir. Ama `Checking...`, `Auto-refresh every 15s` gibi metinler kesinlikle i18n olmalı.

---

### 🔴 KRİTİK — `users/[id]/page.tsx` (25+ hardcoded string)

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 82 | `<h2>User Not Found</h2>` | i18n değil |
| 86 | `← Back to Users` | i18n değil |
| 98 | `← Back` | i18n değil |
| 102 | `<p>User Detail</p>` | i18n değil |
| 110 | `<h2>User Info</h2>` | i18n değil |
| 112 | `<label>ID</label>` | i18n değil |
| 116 | `<label>Email</label>` | i18n değil |
| 120 | `<label>Name</label>` | i18n değil |
| 124 | `<label>Status</label>` | i18n değil |
| 128 | `<label>Created</label>` | i18n değil |
| 134 | `<h2>Management</h2>` | i18n değil |
| 140 | `<label>Plan</label>` | i18n değil |
| 160 | `<label>Account Status</label>` | i18n değil |
| 165 | `'Ban User'` / `'Activate User'` | i18n değil |
| 180 | `<label>Usage Stats</label>` | i18n değil |
| 183 | `Total Deliveries`, `Success Rate`, `Endpoints` | i18n değil |
| 203 | `<h2>Endpoints</h2>` | i18n değil |
| 220 | `'Active'` / `'Inactive'` | i18n değil |
| 234 | `<h2>Recent Deliveries</h2>` | i18n değil |
| 242-246 | `ID`, `Event`, `Status`, `Attempts`, `Time` (table headers) | i18n değil |
| 273 | `No deliveries` | i18n değil |

**Önerilen Çözüm:** Bu dosyada `useTranslations` hiç kullanılmamış. Eklenmeli:
```tsx
const t = useTranslations('admin');
const tc = useTranslations('common');
```

---

### 🔴 KRİTİK — `users/page.tsx` (8 hardcoded string)

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 77 | `<p>Manage users, plans, and account status</p>` | i18n değil |
| 127 | `Loading users...` | i18n değil (animate-pulse ile) |
| 131 | `No users found.` | i18n değil |
| 189 | `Previous` | i18n değil |
| 197 | `Next` | i18n değil |
| 213 | `<h3>Change Plan</h3>` | i18n değil |
| 215 | `Change plan for <span>{email}</span>` | i18n değil |
| 231 | `Cancel` | i18n değil |
| 238 | `Update Plan` | i18n değil |

**Önerilen Çözüm:**
```tsx
<button>{tc('previous')}</button>
<button>{tc('next')}</button>
<button>{tc('cancel')}</button>
<h3>{t('changePlan')}</h3>
```

---

### 📊 Hardcode String Özeti

| Dosya | Hardcoded Sayısı | i18n Kullanıyor mu? |
|-------|-----------------|---------------------|
| layout.tsx | 17 | ❌ Hayır |
| page.tsx | 3 | ✅ Kısmen |
| revenue/page.tsx | 4 | ✅ Kısmen |
| settings/page.tsx | 15+ | ✅ Kısmen |
| system/page.tsx | 12+ | ✅ Kısmen |
| users/[id]/page.tsx | 25+ | ❌ Hayır |
| users/page.tsx | 8+ | ✅ Kısmen |
| **TOPLAM** | **84+** | — |

---

## B. HATA YÖNETİMİ

### 🔴 KRİTİK — Error Boundary Yok

**Tüm 7 dosyada** `<ErrorBoundary>` veya herhangi bir error boundary kullanılmamış. React hata verirse beyaz ekran gösterir.

**Önerilen Çözüm:**
```tsx
// app/[locale]/admin/layout.tsx'te:
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function AdminLayout({ children }) {
  return (
    <ErrorBoundary fallback={<AdminErrorFallback />}>
      <AdminShell>{children}</AdminShell>
    </ErrorBoundary>
  );
}
```

---

### 🟡 ORTA — Sessiz Hata Yönetimi (Silent Error Handling)

| Dosya | Satır | Mevcut Kod | Sorun |
|-------|-------|-----------|-------|
| page.tsx | 31 | `catch (err) { /* Error handled silently */ }` | Kullanıcı hata olduğunu bilmiyor |
| revenue/page.tsx | 31 | `catch (err) { /* Error handled silently */ }` | Kullanıcı hata olduğunu bilmiyor |
| system/page.tsx | 31 | `catch { // ignore }` | Kullanıcı hata olduğunu bilmiyor |

**Senaryo:** API çökerse → loading biter → boş sayfa gösterilir. Kullanıcı "veri mi yok, hata mı oldu?" bilemez.

**Önerilen Çözüm:**
```tsx
catch (err) {
  setError('Failed to load data. Please try again.');
  // Veya toast:
  toast(t('loadFailed'), 'error');
}
// Error state'i UI'da göster:
{error && (
  <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-700 dark:text-red-400">
    {error}
    <button onClick={fetchStats}>{t('retry')}</button>
  </div>
)}
```

---

### 🟡 ORTA — Retry Mekanizması Yok

Hiçbir dosyada retry butonu veya otomatik retry mekanizması yok. Kullanıcı sayfayı yenilemek zorunda.

**Önerilen Çözüm:**
```tsx
// Her fetch fonksiyonunda:
<button onClick={fetchStats} className="...">
  {t('retry')}
</button>
```

---

### 🟢 İYİ — settings/page.tsx ve users/[id]/page.tsx Toast Kullanıyor

Bu dosyalarda hatalar toast ile gösteriliyor. Ama mesajlar İngilizce:
- `settings/page.tsx:63` → `'Failed to save settings'`
- `users/[id]/page.tsx` → `'Failed to load user details'`, `'Failed to update plan'`, `'Failed to update status'`

**Önerilen Çözüm:** Toast mesajlarını da i18n key ile değiştir.

---

## C. LOADING STATE'LER

### 🟢 İYİ — `page.tsx` (Admin Overview)

Satır 50-67: Skeleton loading gösteriyor (4 adet glass-card placeholder). ✅

### 🔴 KÖTÜ — `revenue/page.tsx`

Satır 43-50: Sadece başlık ve "Loading..." text'i gösteriyor. Skeleton yok.

**Mevut Kod:**
```tsx
if (loading) {
  return (
    <div className="space-y-6">
      <div>
        <h1>Revenue Dashboard</h1>
        <p>Loading...</p>  {/* Skeleton yok */}
      </div>
    </div>
  );
}
```

**Önerilen Çözüm:**
```tsx
if (loading) {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-64" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/2 mb-4" />
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 🟢 İYİ — `system/page.tsx`

Satır 65-73: 4 adet skeleton card gösteriyor. ✅

### 🟡 ORTA — `users/[id]/page.tsx`

Satır 71-77: Minimal skeleton (sadece başlık). Detail sayfası olduğu için daha fazla skeleton olmalı.

**Önerilen Çözüm:**
```tsx
if (loading) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded w-48 mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-32" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="glass-card p-6">
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-1/3 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="h-3 bg-gray-200 dark:bg-slate-700 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### 🟡 ORTA — `users/page.tsx`

Satır 125-129: Sadece `animate-pulse` text. Tablo skeleton'ı yok.

**Önerilen Çözüm:** Tablo satırları için skeleton rows ekle.

---

### 🔴 KÖTÜ — `settings/page.tsx` — Loading State Yok

**Hiç loading state yok.** Sayfa mount olduğunda defaultSettings ile render ediliyor. API'den veri gelmiyor — bu bir "settings yok" durumu mu, yoksa "yükleniyor" mu belli değil.

**Not:** Bu sayfa muhtemelen settings'i API'den çekmeli (GET endpoint). Şu an sadece default değerleri gösteriyor ve sadece PUT ile kaydediyor.

---

## D. EDGE CASES

### 🟡 ORTA — Null/Undefined Kontrolleri

| Dosya | Durum | Detay |
|-------|-------|-------|
| page.tsx | ✅ İyi | `stats?.total_users?.toLocaleString() \|\| '0'` fallback'lı |
| page.tsx | ✅ İyi | `stats?.recent_signups?.length` kontrolü var |
| page.tsx | ✅ İyi | `user.name \|\| user.email` fallback |
| revenue/page.tsx | ✅ İyi | `revenue?.mrr \|\| 0` fallback'lı |
| users/page.tsx | ✅ İyi | `u.name \|\| '—'` fallback |
| users/[id]/page.tsx | ✅ İyi | `detail.user.name \|\| detail.user.email` fallback |
| system/page.tsx | ✅ İyi | `health?.api?.status \|\| 'unknown'` fallback'lı |

---

### 🔴 SORUN — `settings/page.tsx` — `parseInt` Edge Case

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 94 | `onChange={(e) => update('max_endpoints_free', parseInt(e.target.value) \|\| 0)}` | Negatif sayı girilebilir |
| 103 | Aynı pattern | Negatif sayı girilebilir |
| 112 | Aynı pattern | Negatif sayı girilebilir |
| 121 | Aynı pattern | Negatif sayı girilebilir |
| 130 | Aynı pattern | Negatif sayı girilebilir |
| 141-168 | Aynı pattern (Pro plan) | Negatif sayı girilebilir |

**Senaryo:** Kullanıcı `-5` girer → `parseInt("-5")` = `-5` → `|| 0` tetiklenmez → negatif değer kaydedilir.

**Önerilen Çözüm:**
```tsx
onChange={(e) => {
  const val = parseInt(e.target.value);
  update('max_endpoints_free', isNaN(val) ? 0 : Math.max(0, val));
}}
// Veya input'a min ekle:
<input type="number" min={0} ... />
```

---

### 🟡 ORTA — `users/page.tsx` — Pagination Sync Risk

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 176 | `const perPage = 20;` | Client-side hardcoded. Server farklı değer dönerse UI bozulur. |

**Önerilen Çözüm:**
```tsx
// API response'dan gelen per_page değerini kullan:
const perPage = data.per_page || 20;
// Veya:
const totalPages = data.total_pages || Math.ceil(total / perPage);
```

---

### 🟡 ORTA — `system/page.tsx` — Interval Leak Risk

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 38-42 | `useEffect(() => { fetchHealth(); const interval = setInterval(fetchHealth, 15000); return () => clearInterval(interval); }, [fetchHealth]);` | `fetchHealth` useCallback ile memoized ✅ ama `token` null ise interval boşuna çalışır |

**Önerilen Çözüm:**
```tsx
useEffect(() => {
  if (!token) return;  // ← Bu kontrol eksik
  fetchHealth();
  const interval = setInterval(fetchHealth, 15000);
  return () => clearInterval(interval);
}, [fetchHealth, token]);
```

---

## E. PERFORMANS

### 🟡 ORTA — `page.tsx` — `pieData` Her Render'da Yeniden Oluşturuluyor

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 69-72 | `const pieData = stats?.users_by_plan?.map(...) \|\| [];` | Her render'da yeni array |

**Önerilen Çözüm:**
```tsx
const pieData = useMemo(() => 
  stats?.users_by_plan?.map((item) => ({
    name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
    value: item.count,
  })) || [],
  [stats?.users_by_plan]
);
```

---

### 🟡 ORTA — `revenue/page.tsx` — `monthlyData` ve `planData` Her Render'da

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 53 | `const monthlyData = revenue?.monthly_revenue \|\| [];` | Her render'da yeni array |
| 54-58 | `const planData = revenue?.revenue_by_plan?.map(...) \|\| [];` | Her render'da yeni array |

**Önerilen Çözüm:**
```tsx
const monthlyData = useMemo(() => revenue?.monthly_revenue || [], [revenue?.monthly_revenue]);
const planData = useMemo(() => 
  revenue?.revenue_by_plan?.map((item) => ({
    name: item.plan.charAt(0).toUpperCase() + item.plan.slice(1),
    value: item.revenue,
    count: item.count,
  })) || [],
  [revenue?.revenue_by_plan]
);
```

---

### 🔴 KRİTİK — `users/page.tsx` — Büyük Component (247 satır)

Bu component şunları yapıyor:
- User listesi fetch
- Search, plan filter, status filter
- Pagination
- Tablo render
- Plan change modal
- Status toggle

**Önerilen Çözüm:** Component'i parçalara ayır:
```
AdminUsersPage
├── UserSearchFilters (search + filters)
├── UsersTable (tablo + satır aksiyonları)
├── UsersPagination (pagination controls)
└── PlanChangeModal (modal)
```

---

### 🟡 ORTA — `layout.tsx` — Inline Object Creation

| Satır | Mevcut Kod | Sorun |
|-------|-----------|-------|
| 111 | `onClick={() => setSidebarOpen(false)}` | Her nav item'da inline function |
| 134 | `onClick={() => setSidebarOpen(true)}` | Inline function |

**Not:** Bu durumda performans etkisi minimal çünkü nav item sayısı az (5 adet). Ama pattern olarak kötü alışkanlık.

---

### 🟢 İYİ — `useCallback` Kullanımı

| Dosya | `useCallback` Kullanıyor mu? |
|-------|------------------------------|
| page.tsx | ✅ `fetchStats` |
| revenue/page.tsx | ✅ `fetchRevenue` |
| system/page.tsx | ✅ `fetchHealth` |
| users/[id]/page.tsx | ✅ `fetchDetail` |
| users/page.tsx | ✅ `fetchUsers` |

---

## ÖZET TABLO

| Kategori | Kritik | Orta | İyi |
|----------|--------|------|-----|
| **A. Hardcode String** | 84+ string, 7 dosya | — | — |
| **B. Hata Yönetimi** | Error boundary yok | Sessiz catch (3 dosya) | Toast kullanımı (2 dosya) |
| **C. Loading State** | revenue skeleton yok, settings loading yok | user detail minimal skeleton | overview, system skeleton ✅ |
| **D. Edge Cases** | Negatif sayı input | Pagination sync, interval leak | Null checks ✅ |
| **E. Performans** | users/page.tsx 247 satır | useMemo eksik (3 dosya) | useCallback ✅ |

---

## ÖNCELİK SIRASI

1. **🔴 P0 — Hardcode String'ler:** 84+ İngilizce string. i18n desteği var ama kullanılmamış. Locale değiştirince kırılır.
2. **🔴 P0 — Error Boundary:** Hiçbir yerde yok. API hatası = beyaz ekran.
3. **🔴 P1 — Settings Loading State:** Settings sayfası API'den veri çekmiyor, sadece default gösteriyor.
4. **🟡 P2 — Sessiz Hata Yönetimi:** 3 dosyada catch bloğu boş. Kullanıcı hata olduğunu bilmiyor.
5. **🟡 P2 — Negatif Sayı Input:** Settings'te tüm sayısal input'larda negatif değer girilebilir.
6. **🟡 P3 — Revenue Skeleton:** Loading'de skeleton yok, sadece text.
7. **🟡 P3 — useMemo Eksik:** Chart data her render'da yeniden oluşturuluyor.
8. **🟡 P3 — Component Boyutu:** users/page.tsx 247 satır, bölünmeli.
