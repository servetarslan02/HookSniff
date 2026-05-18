# HookSniff Admin Panel — Hata Yönetimi & Edge Case Analizi

**Tarih:** 2026-05-10  
**Kapsam:** 7 admin component dosyası (layout, overview, revenue, settings, system, users, user-detail)

---

## ÖZET

| Kategori | Bulgu Sayısı | Kritik | Orta | Düşük |
|---|---|---|---|---|
| Error Handling | 12 | 4 | 5 | 3 |
| Loading States | 3 | 0 | 2 | 1 |
| Empty States | 4 | 0 | 2 | 2 |
| Form Validation | 8 | 3 | 3 | 2 |
| Race Conditions | 5 | 2 | 2 | 1 |
| **TOPLAM** | **32** | **9** | **14** | **9** |

---

## A. ERROR HANDLING PATTERNS

### 🔴 KRİTİK: EH-01 — Sessizce Yutulan Hatalar (Overview Page)

**Dosya:** `src/app/[locale]/admin/page.tsx`  
**Satır:** ~25-30  
**Mevcut Kod:**
```typescript
try {
  const data = await adminApi.getStats(token);
  setStats(data);
} catch (err) {
  // Error handled silently
} finally {
  setLoading(false);
}
```
**Sorun:** API hatası tamamen yutuluyor. Kullanıcıya hiçbir feedback verilmiyor — sayfa boş kalır, loading biter ama veri gelmez. Kullanıcı neden boş sayfa gördüğünü anlayamaz.  
**Çözüm:** Error state ekleyin ve kullanıcıya hata mesajı gösterin:
```typescript
const [error, setError] = useState<string | null>(null);

try {
  const data = await adminApi.getStats(token);
  setStats(data);
  setError(null);
} catch (err) {
  setError('Failed to load admin stats. Please try again.');
  console.error('Admin stats fetch error:', err);
} finally {
  setLoading(false);
}

// JSX'te:
{error && (
  <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-xl text-red-700 dark:text-red-400 text-sm">
    {error}
    <button onClick={fetchStats} className="ml-2 underline">Retry</button>
  </div>
)}
```

---

### 🔴 KRİTİK: EH-02 — Sessizce Yutulan Hatalar (Revenue Page)

**Dosya:** `src/app/[locale]/admin/revenue/page.tsx`  
**Satır:** ~25-30  
**Mevcut Kod:**
```typescript
try {
  const data = await adminApi.getRevenue(token);
  setRevenue(data);
} catch (err) {
  // Error handled silently
} finally {
  setLoading(false);
}
```
**Sorun:** EH-01 ile aynı pattern. Revenue verisi yüklenemezse kullanıcı boş sayfa görür, hata mesajı yok.  
**Çözüm:** Aynı pattern — error state + retry butonu + kullanıcıya hata mesajı.

---

### 🔴 KRİTİK: EH-03 — Sessizce Yutulan Hatalar (System Page)

**Dosya:** `src/app/[locale]/admin/system/page.tsx`  
**Satır:** ~30-38  
**Mevcut Kod:**
```typescript
try {
  const res = await fetch(`${API}/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.ok) setHealth(await res.json());
} catch {
  // ignore
} finally {
  setLoading(false);
}
```
**Sorun:** 
1. Hata tamamen yutuluyor.
2. `res.ok` false ise (401, 403, 500 gibi) hiçbir şey yapılmıyor — `health` state'i `null` kalır, loading biter, servisler "unknown" gösterir ama kullanıcı neden bilinmiyor bilemez.
3. `res.json()` parse hatası yakalanmıyor (corrupt response).

**Çözüm:**
```typescript
try {
  const res = await fetch(`${API}/health`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status}`);
  }
  const data = await res.json();
  setHealth(data);
  setError(null);
} catch (err) {
  setError('Unable to reach system health endpoint');
  console.error('Health check error:', err);
} finally {
  setLoading(false);
}
```

---

### 🟡 ORTA: EH-04 — Error Boundary Eksikliği (Tüm Admin Sayfaları)

**Dosya:** Tüm admin layout ve sayfalar  
**Sorun:** Hiçbir admin sayfasında `<ErrorBoundary>` kullanılmıyor. React render hatası (örneğin `null.toLocaleString()`) tüm admin panelini crash ettirebilir.  
**Çözüm:** `layout.tsx`'e ErrorBoundary ekleyin:
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

// AdminShell içinde:
<main className="p-4 md:p-8 page-enter">
  <ErrorBoundary fallback={<AdminErrorFallback />}>
    {children}
  </ErrorBoundary>
</main>
```

---

### 🟡 ORTA: EH-05 — Settings Save Hatası Yetersiz

**Dosya:** `src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~60-72  
**Mevcut Kod:**
```typescript
try {
  const res = await fetch(`${API}/admin/settings`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error(tc('error'));
  toast(t('settingsSaved'), 'success');
} catch {
  toast('Failed to save settings', 'error');
}
```
**Sorun:**
1. `tc('error')` generic bir çeviri key'i — gerçek HTTP status kodu veya response body'den gelen hata mesajı gösterilmiyor.
2. Response body'deki detaylı hata mesajı (örn. validation error) yakalanmıyor.
3. 401 durumunda token expired olabilir ama login'e yönlendirme yok.

**Çözüm:**
```typescript
if (!res.ok) {
  const body = await res.json().catch(() => ({}));
  throw new Error(body.message || `Save failed (${res.status})`);
}
```

---

### 🟡 ORTA: EH-06 — Toast Hataları Generic (Users Page)

**Dosya:** `src/app/[locale]/admin/users/page.tsx`  
**Satır:** ~45-55, ~60-70, ~75-85  
**Mevcut Kod:**
```typescript
// fetchUsers:
} catch {
  toast(tc('error'), 'error');
}

// handleChangePlan:
} catch {
  toast(tc('error'), 'error');
}

// handleToggleStatus:
} catch {
  toast(tc('error'), 'error');
}
```
**Sorun:** Tüm hatalar aynı generic mesajı gösteriyor. Kullanıcı hangi işlemin başarısız olduğunu anlayamaz. API'den gelen spesifik hata (örn. "User not found", "Cannot ban admin") gösterilmiyor.  
**Çözüm:** Her catch bloğuna spesifik mesaj ve error detail ekleyin.

---

### 🟡 ORTA: EH-07 — User Detail Hataları Yetersiz

**Dosya:** `src/app/[locale]/admin/users/[id]/page.tsx`  
**Satır:** ~30-40  
**Mevcut Kod:**
```typescript
try {
  const data = await adminApi.getUserDetail(token, id);
  setDetail(data);
  setNewPlan(data.user.plan);
} catch {
  toast('Failed to load user details', 'error');
}
```
**Sorun:** Hata sonrası `detail` null kalır → "User Not Found" gösterilir ama aslında network hatası olabilir. Kullanıcı "kullanıcı bulunamadı" sanır ama aslında API bağlantı sorunu olabilir. Retry mekanizması yok.  
**Çözüm:** Error state ile "User Not Found" ve "Connection Error" ayrımı yapın + retry butonu.

---

### 🟡 ORTA: EH-08 — fetch() Hataları API Client Kullanılmıyor (System Page)

**Dosya:** `src/app/[locale]/admin/system/page.tsx`  
**Satır:** ~32-37  
**Mevcut Kod:**
```typescript
const res = await fetch(`${API}/health`, {
  headers: { Authorization: `Bearer ${token}` },
});
```
**Sorun:** Diğer sayfalar `adminApi` client kullanırken, system page doğrudan `fetch()` kullanıyor. Token refresh, retry, base URL yönetimi gibi API client'ın sağladığı avantajlardan yararlanamıyor.  
**Çözüm:** `adminApi.getHealth(token)` metodu oluşturun ve tutarlı API client kullanımı sağlayın.

---

### 🔴 KRİTİK: EH-09 — Token Null Kontrolü Yetersiz (System Page)

**Dosya:** `src/app/[locale]/admin/system/page.tsx`  
**Satır:** ~30  
**Mevcut Kod:**
```typescript
const fetchHealth = useCallback(async () => {
  try {
    const res = await fetch(`${API}/health`, {
      headers: { Authorization: `Bearer ${token}` },
    });
```
**Sorun:** `token` null/undefined olabilir (auth state henüz yüklenmemiş). `Bearer null` header'ı gönderilir → 401 döner → sessizce yutulur (EH-03). Diğer sayfalar `if (!token) return` guard'ı kullanıyor ama system page'de yok.  
**Çözüm:** Fonksiyonun başına `if (!token) return;` ekleyin.

---

### 🟢 DÜŞÜK: EH-10 — Login Page'e Yönlendirme Eksik

**Dosya:** `src/app/[locale]/admin/layout.tsx`  
**Satır:** ~25-28  
**Mevcut Kod:**
```typescript
useEffect(() => {
  if (user && !user.is_admin) {
    router.push('/dashboard');
  }
}, [user, router]);
```
**Sorun:** `user` null olduğunda (auth yüklenmemiş) ne yapılacağı belirsiz. Ayrıca `user` null iken `!user.is_admin` true olur ama koşul `user &&` ile guard'landığı için sorun yok — ama loading state yok.  
**Çözüm:** Auth loading state'i ekleyin ve user null iken loading spinner gösterin.

---

### 🟢 DÜŞÜK: EH-11 — Logout Hata Yönetimi

**Dosya:** `src/app/[locale]/admin/layout.tsx`  
**Satır:** ~140  
**Mevcut Kod:**
```typescript
<button
  onClick={() => { logout(); router.push('/login'); }}
```
**Sorun:** `logout()` async ise (API call ile token invalidation) ve başarısız olursa, kullanıcı login sayfasına yönlendirilir ama token hala geçerli kalır.  
**Çözüm:** `logout()` sonucunu handle edin, hata durumunda kullanıcıya bilgi verin.

---

### 🟢 DÜŞÜK: EH-12 — Date Format Hataları

**Dosya:** Birden fazla dosya  
**Satır:** Çeşitli  
**Mevcut Kod:**
```typescript
{new Date(user.created_at).toLocaleDateString()}
```
**Sorun:** `created_at` geçersiz bir tarih string'i ise `new Date()` Invalid Date döner ve `toLocaleDateString()` "Invalid Date" gösterir. Null check yok.  
**Çözüm:** Date helper fonksiyonu oluşturun:
```typescript
const safeFormatDate = (dateStr?: string) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
};
```

---

## B. LOADING STATES

### 🟡 ORTA: LS-01 — Skeleton Loading Eksik (Revenue Page)

**Dosya:** `src/app/[locale]/admin/revenue/page.tsx`  
**Satır:** ~35-45  
**Mevcut Kod:**
```typescript
if (loading) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('revenue')}</h1>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{tc('loading')}</p>
      </div>
    </div>
  );
}
```
**Sorun:** Loading durumunda sadece başlık ve "Loading..." text'i gösteriliyor. Overview ve System sayfalarında skeleton/pulse animasyonu var ama revenue'de yok. Tutarlı loading UX'i sağlanmamış.  
**Çözüm:** Overview page'deki gibi skeleton card'lar ekleyin.

---

### 🟡 ORTA: LS-02 — Settings Page'de Initial Loading Eksik

**Dosya:** `src/app/[locale]/admin/settings/page.tsx`  
**Satır:** N/A (yok)  
**Sorun:** Settings sayfası component mount olduğunda mevcut ayarları sunucudan yüklemiyor — `defaultSettings` hard-coded. Kullanıcı eski/değerleri görür, kaydetmediği değişlikler üzerine yazar. Ayrıca loading state yok.  
**Çözüm:** Component mount'ta `GET /admin/settings` çağırın, loading skeleton ekleyin:
```typescript
useEffect(() => {
  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await adminApi.getSettings(token);
      setSettings(data);
    } catch { /* handle */ }
    finally { setLoading(false); }
  };
  loadSettings();
}, [token]);
```

---

### 🟢 DÜŞÜK: LS-03 — Saving State Yetersiz Feedback (Settings)

**Dosya:** `src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~155-165  
**Mevcut Kod:**
```typescript
<button
  onClick={handleSave}
  disabled={saving}
  className="px-6 py-3 bg-gray-900 dark:bg-red-600 text-white rounded-xl font-medium hover:bg-gray-800 dark:hover:bg-red-700 transition disabled:opacity-60"
>
  {saving ? tc('saving') : t('saveSettings')}
</button>
```
**Sorun:** `disabled:opacity-60` yeterli görsel feedback vermiyor. Spinner eklenmeli.  
**Çözüm:** Saving durumunda spinner icon ekleyin.

---

## C. EMPTY STATES

### 🟡 ORTA: ES-01 — Overview Empty State Eksik

**Dosya:** `src/app/[locale]/admin/page.tsx`  
**Satır:** ~60-65  
**Mevcut Kod:**
```typescript
value={stats?.total_users?.toLocaleString() || '0'}
```
**Sorun:** `stats` null olduğunda (API hatası veya boş veri) tüm kartlar "0" gösterir. Bu, "hiç kullanıcı yok" mu yoksa "veri yüklenemedi" mi ayrımı yapılamaz.  
**Çözüm:** Error durumunu ayrı handle edin, empty state'te açıklayıcı mesaj gösterin.

---

### 🟡 ORTA: ES-02 — System Page Unknown State

**Dosya:** `src/app/[locale]/admin/system/page.tsx`  
**Satır:** ~70-85  
**Mevcut Kod:**
```typescript
status: health?.api?.status || 'unknown',
```
**Sorun:** `health` null olduğunda tüm servisler "unknown" gösterir. Loading bitmiş ama veri yok — bu durum error'dan farklı gösterilmeli.  
**Çözüm:** `health === null && !loading` durumunda error state gösterin.

---

### 🟢 DÜŞÜK: ES-03 — Users Empty State İyi Ama Tutarlı Değil

**Dosya:** `src/app/[locale]/admin/users/page.tsx`  
**Satır:** ~120  
**Mevcut Kod:**
```typescript
) : users.length === 0 ? (
  <div className="p-12 text-center text-gray-400 dark:text-slate-500">
    No users found.
  </div>
```
**Sorun:** Empty state iyi ama search/filter sonucu boş mu yoksa gerçekten hiç kullanıcı mı yok ayrımı yapılmıyor.  
**Çözüm:** `{search || planFilter || statusFilter ? 'No users match your filters.' : 'No users yet.'}`

---

### 🟢 DÜŞÜK: ES-04 — Recent Signups Empty State İyi

**Dosya:** `src/app/[locale]/admin/page.tsx`  
**Satır:** ~110-115  
**Mevcut Kod:**
```typescript
) : (
  <div className="px-6 py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
    No recent signups
  </div>
)}
```
**Değerlendirme:** ✅ İyi — empty state var ve açıklayıcı.

---

## D. FORM VALIDATION

### 🔴 KRİTİK: FV-01 — Number Input'larda Min/Max Kontrolü Yok (Settings)

**Dosya:** `src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~100-150 (tüm number input'lar)  
**Mevcut Kod:**
```typescript
<input
  type="number"
  value={settings.max_endpoints_free}
  onChange={(e) => update('max_endpoints_free', parseInt(e.target.value) || 0)}
  className="..."
/>
```
**Sorun:**
1. `min` attribute'u yok — negatif değer girilebilir (-5 endpoint?)
2. `max` attribute'u yok — aşırı büyük değer girilebilir
3. `parseInt(e.target.value) || 0` — boş input 0'a parse edilir, bu da "0 endpoint" anlamına gelir
4. Kullanıcı "abc" yazarsa `parseInt` NaN döner → `|| 0` ile 0'a düşer — sessiz data loss

**Çözüm:**
```typescript
<input
  type="number"
  min={1}
  max={10000}
  value={settings.max_endpoints_free}
  onChange={(e) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 10000) {
      update('max_endpoints_free', val);
    }
  }}
/>
```

---

### 🔴 KRİTİK: FV-02 — Settings Kaydetmeden Önce Validation Yok

**Dosya:** `src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~60-72  
**Mevcut Kod:**
```typescript
const handleSave = async () => {
  setSaving(true);
  try {
    const res = await fetch(`${API}/admin/settings`, {
      method: 'PUT',
      // ...
      body: JSON.stringify(settings),
    });
```
**Sorun:** Kaydetmeden önce hiçbir client-side validation yapılmıyor:
- `max_endpoints_free > max_endpoints_pro` olabilir (free plan pro'dan fazla endpoint)
- `retention_days_free > retention_days_pro` olabilir
- `retry_max_attempts` negatif olabilir
- `rate_limit_free > rate_limit_pro` olabilir (free daha hızlı rate limit)

**Çözüm:** Kaydetme öncesi validation ekleyin:
```typescript
const validateSettings = (s: PlatformSettings): string | null => {
  if (s.max_endpoints_free > s.max_endpoints_pro) return 'Free plan endpoints cannot exceed Pro plan';
  if (s.rate_limit_free > s.rate_limit_pro) return 'Free rate limit cannot exceed Pro rate limit';
  if (s.retry_max_attempts < 0 || s.retry_max_attempts > 10) return 'Retry attempts must be 0-10';
  return null;
};

const handleSave = async () => {
  const error = validateSettings(settings);
  if (error) { toast(error, 'error'); return; }
  // ...
};
```

---

### 🔴 KRİTİK: FV-03 — User ID Validation Yok

**Dosya:** `src/app/[locale]/admin/users/[id]/page.tsx`  
**Satır:** ~25-30  
**Mevcut Kod:**
```typescript
const { id } = useParams<{ id: string }>();
// ...
const fetchDetail = useCallback(async () => {
  if (!token || !id) return;
  // ...
  const data = await adminApi.getUserDetail(token, id);
```
**Sorun:** `id` URL'den geliyor ve hiçbir format validation'ı yok. Geçersiz UUID formatı ile API'ye istek atılır → 400/404 döner → generic hata mesajı.  
**Çözüm:** ID format validation ekleyin:
```typescript
const isValidUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

useEffect(() => {
  if (!token || !id || !isValidUUID(id)) {
    if (id && !isValidUUID(id)) toast('Invalid user ID format', 'error');
    return;
  }
  fetchDetail();
}, [fetchDetail]);
```

---

### 🟡 ORTA: FV-04 — Search Input Sanitization Yok

**Dosya:** `src/app/[locale]/admin/users/page.tsx`  
**Satır:** ~100  
**Mevcut Kod:**
```typescript
<input
  type="text"
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  placeholder={t('searchByEmail')}
```
**Sorun:** Search input'a özel karakterler, SQL injection attempt'leri veya aşırı uzun string girilebilir. API'ye doğrudan gönderiliyor.  
**Çözüm:** Input sanitization ve max length ekleyin:
```typescript
<input
  type="text"
  maxLength={100}
  value={search}
  onChange={(e) => setSearch(e.target.value.replace(/[<>{}]/g, ''))}
```

---

### 🟡 ORTA: FV-05 — Plan Değişikliği Onayı Yok

**Dosya:** `src/app/[locale]/admin/users/[id]/page.tsx`  
**Satır:** ~55-65  
**Mevcut Kod:**
```typescript
const handleUpdatePlan = async () => {
  if (!token || !id || !newPlan) return;
  try {
    await adminApi.updateUserPlan(token, id, newPlan);
    toast(`Plan updated to ${newPlan}`, 'success');
```
**Sorun:** Plan değişikliği (free → business gibi) anında uygulanıyor, onay dialog'u yok. Yanlışlıkla tıklanabilir.  
**Çözüm:** Kritik işlemler için confirmation dialog ekleyin.

---

### 🟡 ORTA: FV-06 — Ban/Activate Onayı Yok

**Dosya:** `src/app/[locale]/admin/users/[id]/page.tsx` ve `users/page.tsx`  
**Satır:** Çeşitli  
**Mevcut Kod:**
```typescript
const handleToggleStatus = async () => {
  // ...
  await adminApi.updateUserStatus(token, id, newStatus);
```
**Sorun:** Kullanıcı ban/activate işlemi anında uygulanıyor, onay yok. Bu kritik bir admin işlemi.  
**Çözüm:** Confirmation dialog ekleyin.

---

### 🟢 DÜŞÜK: FV-07 — Retry Max Attempts Min/Max Attribute'u Var Ama Yetersiz

**Dosya:** `src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~170  
**Mevcut Kod:**
```typescript
<input
  type="number"
  value={settings.retry_max_attempts}
  onChange={(e) => update('retry_max_attempts', parseInt(e.target.value) || 0)}
  min={0}
  max={10}
```
**Sorun:** `min` ve `max` attribute'u var ✅ ama `parseInt(e.target.value) || 0` pattern'i hala sorunlu — boş input 0'a düşer.  
**Çözüm:** NaN kontrolü ile birlikte min/max validation ekleyin.

---

### 🟢 DÜŞÜK: FV-08 — Select Input'lar Güvenli

**Dosya:** `src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~90-95  
**Mevcut Kod:**
```typescript
<select
  value={settings.default_plan}
  onChange={(e) => update('default_plan', e.target.value)}
>
  <option value="free">Free</option>
  <option value="pro">Pro</option>
</select>
```
**Değerlendirme:** ✅ Select input'lar hard-coded option'lar ile güvenli.

---

## E. RACE CONDITIONS

### 🔴 KRİTİK: RC-01 — useEffect Cleanup Eksik (Overview, Revenue, Users)

**Dosya:** `src/app/[locale]/admin/page.tsx`, `revenue/page.tsx`, `users/page.tsx`  
**Satır:** Çeşitli  
**Mevcut Kod:**
```typescript
useEffect(() => {
  fetchStats();
}, [fetchStats]);
```
**Sorun:** `fetchStats` async bir fonksiyon. Component unmount olursa (sayfa değiştirilirse) setState çağırılmaya devam eder → "Can't perform a React state update on an unmounted component" uyarısı.  
**Çözüm:** AbortController veya isMounted flag kullanın:
```typescript
useEffect(() => {
  const controller = new AbortController();
  fetchStats(controller.signal);
  return () => controller.abort();
}, [fetchStats]);

// fetchStats içinde:
const fetchStats = useCallback(async (signal?: AbortSignal) => {
  // ...
  const data = await adminApi.getStats(token, { signal });
  // ...
}, [token]);
```

---

### 🔴 KRİTİK: RC-02 — Stale Closure Riski (Callback Dependencies)

**Dosya:** `src/app/[locale]/admin/users/page.tsx`  
**Satır:** ~35-50  
**Mevcut Kod:**
```typescript
const fetchUsers = useCallback(async () => {
  if (!token) return;
  setLoading(true);
  try {
    const data = await adminApi.listUsers(token, {
      page,
      search: search || undefined,
      plan: planFilter || undefined,
      status: statusFilter || undefined,
    });
    // ...
  }
}, [token, page, search, planFilter, statusFilter, toast, tc]);
```
**Sorun:** Dependency array'de `toast` ve `tc` var — bunlar her render'da değişebilir (eğer referans stability sağlanmamışsa). Bu da gereksiz re-fetch'lere neden olabilir. Ayrıca `fetchUsers` referansı değiştiğinde useEffect tekrar çalışır → gereksiz API çağrısı.  
**Çözüm:** `toast` ve `tc`'yi dependency'den çıkarın (ref olarak tutun) veya useMemo ile stabilize edin.

---

### 🟡 ORTA: RC-03 — Concurrent Request Handling Yok

**Dosya:** `src/app/[locale]/admin/system/page.tsx`  
**Satır:** ~40-45  
**Mevcut Kod:**
```typescript
useEffect(() => {
  fetchHealth();
  const interval = setInterval(fetchHealth, 15000);
  return () => clearInterval(interval);
}, [fetchHealth]);
```
**Sorun:** `fetchHealth` 15 saniyede bir çalışıyor. Eğer bir istek hala devam ederken yenisi başlarsa (slow network), iki concurrent request olur. İlki geç dönerse stale data set edebilir.  
**Çözüm:** Request deduplication ekleyin:
```typescript
const pendingRef = useRef<AbortController | null>(null);

const fetchHealth = useCallback(async () => {
  pendingRef.current?.abort();
  const controller = new AbortController();
  pendingRef.current = controller;
  // ...
}, [token, API]);
```

---

### 🟡 ORTA: RC-04 — Settings Page'de Concurrent Save Yok Ama Double-Click Riski Var

**Dosya:** `src/app/[locale]/admin/settings/page.tsx`  
**Satır:** ~60-72  
**Mevcut Kod:**
```typescript
const handleSave = async () => {
  setSaving(true);
  try {
    // ...
  } finally {
    setSaving(false);
  }
};
```
**Sorun:** `saving` state'i double-click'i önlüyor ✅ ama `disabled={saving}` attribute'u var mı kontrol edilmeli. Evet var ✅ — bu iyi. Ama `saving` true iken kullanıcı input değiştirebilir → save tamamlandığında yeni değerler kaydedilmemiş olur.  
**Çözüm:** Saving sırasında input'ları da disable edin veya optimistic update kullanın.

---

### 🟢 DÜŞÜK: RC-05 — handleSearch Debounce Yok

**Dosya:** `src/app/[locale]/admin/users/page.tsx`  
**Satır:** ~85-90  
**Mevcut Kod:**
```typescript
const handleSearch = (e: React.FormEvent) => {
  e.preventDefault();
  setPage(1);
  fetchUsers();
};
```
**Sorun:** Search form submit'te çalışıyor (Enter tuşu) — bu iyi. Ama `search` state'i her keystroke'da değişiyor ve `fetchUsers` dependency'de `search` var → her karakter değişiminde API çağrısı tetikleniyor (useEffect).  
**Çözüm:** Debounce ekleyin:
```typescript
const debouncedSearch = useDebounce(search, 300);

useEffect(() => {
  fetchUsers();
}, [fetchUsers]); // fetchUsers'ta debouncedSearch kullanın
```

---

## GENEL DEĞERLENDİRME VE ÖNERİLER

### 1. Merkezi Error Handling Katmanı
Tüm admin sayfaları için ortak bir error handling strategy oluşturun:
```typescript
// hooks/useAdminFetch.ts
function useAdminFetch<T>(fetcher: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // ... retry, abort, etc.
}
```

### 2. Error Boundary
Admin layout'a ErrorBoundary ekleyin — React render crash'lerini yakalamak için.

### 3. Form Validation Library
Zod veya Yup ile schema-based validation kullanın — manual validation hata yapmaya açık.

### 4. Optimistic Updates
Ban/plan change gibi işlemlerde optimistic update kullanın — daha responsive UX.

### 5. Toast Messages
Her hata için spesifik, action-oriented mesajlar kullanın:
- ❌ "Error" 
- ✅ "Failed to update plan. Please check your connection and try again."

---

*Analiz tamamlandı — 32 bulgu tespit edildi (9 kritik, 14 orta, 9 düşük).*
