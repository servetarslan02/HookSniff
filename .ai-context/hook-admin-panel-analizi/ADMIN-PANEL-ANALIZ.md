# HookSniff Admin Panel — Kapsamlı İnceleme

> **Tarih:** 2026-05-12  
> **Kaynak:** https://github.com/servetarslan02/HookSniff  
> **Amaç:** Admin panelindeki tüm sayfaları, özellikleri ve sistemleri belgelemek — benzer/gelişmiş sistem kurulumu için referans

---

## 📋 İçindekiler

1. [Genel Mimari](#1-genel-mimari)
2. [Admin Layout (admin/layout.tsx)](#2-admin-layout)
3. [Admin Overview (admin/page.tsx)](#3-admin-overview)
4. [Kullanıcı Yönetimi (admin/users/)](#4-kullanıcı-yönetimi)
5. [Kullanıcı Detay (admin/users/[id]/)](#5-kullanıcı-detay)
6. [Gelir Yönetimi (admin/revenue/)](#6-gelir-yönetimi)
7. [Sistem Sağlığı (admin/system/)](#7-sistem-sağlığı)
8. [Platform Ayarları (admin/settings/)](#8-platform-ayarları)
9. [Aktivite Logu (admin/activity/)](#9-aktivite-logu)
10. [API Entegrasyonu](#10-api-entegrasyonu)
11. [Orak Kullanılan Bileşenler](#11-ortak-bileşenler)
12. [Güvenlik](#12-güvenlik)
13. [Eksikler & İyileştirme Önerileri](#13-eksikler--iyileştirme-önerileri)

---

## 1. Genel Mimari

### Teknoloji Stack'i

| Katman | Teknoloji |
|--------|-----------|
| **Frontend** | Next.js 15 (App Router), React, TypeScript |
| **UI Framework** | Tailwind CSS, Tremor (chart bileşenleri) |
| **State Management** | Zustand (`lib/store.tsx`) |
| **Grafikler** | Recharts (LazyCharts ile code-splitting) |
| **i18n** | next-intl (çok dilli destek) |
| **Backend API** | Rust (Actix-web) — `api/src/routes/admin.rs` |
| **Auth** | JWT + Biscuit token |
| **Veritabanı** | PostgreSQL (Neon serverless) |
| **Cache** | Upstash Redis |
| **Deploy** | Vercel (frontend), Oracle Cloud ARM (API) |

### Admin Sayfa Haritası

```
/admin
├── layout.tsx          → Admin shell (sidebar, auth guard, header)
├── page.tsx            → Overview dashboard (istatistikler)
├── loading.tsx         → Loading spinner
├── activity/
│   └── page.tsx        → Audit log listesi
├── revenue/
│   └── page.tsx        → Gelir analizi, churn, plan dağılımı
├── settings/
│   └── page.tsx        → Platform ayarları (limitler, email, alert)
├── system/
│   └── page.tsx        → Sistem sağlığı, infra, test webhook
└── users/
    ├── page.tsx         → Kullanıcı listesi (CRUD, bulk actions)
    └── [id]/
        └── page.tsx     → Kullanıcı detay (plan, analytics, deliveries)
```

---

## 2. Admin Layout (`admin/layout.tsx`)

### Ne Yapıyor?
Admin panelinin ana kabuğu. Tüm admin sayfalarını sarar.

### Özellikler

| Özellik | Açıklama |
|---------|----------|
| **Auth Guard** | `user.is_admin` kontrolü — admin olmayan `/dashboard`'a yönlendirilir |
| **Sidebar Navigation** | 6 menü: Overview, Users, Revenue, System, Settings, Activity |
| **Mobile Responsive** | Sidebar mobilde hamburger menü ile açılır |
| **Quick Search** | Header'da kullanıcı arama → `/admin/users?search=...` |
| **Notification Bell** | `/admin/system`'a yönlendirir |
| **Profile Dropdown** | Email gösterimi, Dashboard'a dönüş, Logout |
| **Theme Toggle** | Dark/Light mode |
| **ARIA Erişilebilirlik** | `aria-label`, `role="banner"`, `role="main"`, skip-to-content link |
| **i18n Destek** | Tüm metinler `useTranslations('admin')` ile |

### Navigation Menüsü

```typescript
const adminNavigation = [
  { nameKey: 'overview',      href: '/admin',           icon: '📊' },
  { nameKey: 'users',         href: '/admin/users',     icon: '👥' },
  { nameKey: 'revenue',       href: '/admin/revenue',   icon: '💰' },
  { nameKey: 'system',        href: '/admin/system',    icon: '🖥️' },
  { nameKey: 'settingsNav',   href: '/admin/settings',  icon: '⚙️' },
  { nameKey: 'activityLog',   href: '/admin/activity',  icon: '📋' },
];
```

### Koruma Mekanizması
```tsx
useEffect(() => {
  if (user && !user.is_admin) {
    router.push(`/${locale}/dashboard`);
  }
}, [user, router, locale]);

if (!user?.is_admin) {
  return <AccessDeniedScreen />;
}
```

---

## 3. Admin Overview (`admin/page.tsx`)

### Ne Yapıyor?
Admin panelinin ana dashboard'u — platform genelinde istatistikler.

### Gösterilen Veriler

| Kart | Veri | Kaynak |
|------|------|--------|
| **Toplam Kullanıcı** | `stats.total_users` + dünkü trend | `adminApi.getStats()` |
| **Toplam Teslimat** | `stats.total_deliveries` + trend | Aynı |
| **Toplam Gelir** | `stats.total_revenue` (₺ formatında) | Aynı |
| **Aktif Kullanıcı (Bugün)** | `stats.active_users_today` + trend | Aynı |
| **Aktif Webhook'lar** | `stats.trends.active_webhooks` (canlı indicator) | Aynı |

### Grafikler ve Tablolar

1. **Users by Plan (Pie Chart)**
   - Free/Pro/Business dağılımı
   - Recharts PieChart, renk kodları: Free=gri, Pro=mavi, Business=mor
   - Veri yoksa CSS bar chart placeholder gösterir

2. **Recent Activity (Audit Log)**
   - Son 5 audit log kaydı
   - Action, resource type, timestamp
   - "View All" linki → `/admin/activity`

3. **Recent Signups**
   - Son kayıt olan kullanıcılar
   - İsim, email, plan, tarih

### API Çağrıları
```typescript
const [statsData, auditData] = await Promise.all([
  adminApi.getStats(token),
  adminApi.getAuditLogs(token, { limit: 5 }),
]);
```

### State Yönetimi
```typescript
const [stats, setStats] = useState<AdminStatsResponse | null>(null);
const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

---

## 4. Kullanıcı Yönetimi (`admin/users/page.tsx`)

### Ne Yapıyor?
Tüm kullanıcıları listeler, filtreler, toplu işlemler yapar.

### Özellikler

#### Arama ve Filtreleme
| Filtre | Açıklama |
|--------|----------|
| **Search** | Email ile arama |
| **Plan Filter** | Free/Pro/Business |
| **Status Filter** | Active/Banned |
| **Date Range** | All time, 7 gün, 30 gün, 90 gün |

#### Sıralama
- Email, Name, Plan, Status, Created At
- ASC/DESC toggle

#### Tablo Kolonları
| Kolon | İçerik |
|-------|--------|
| Checkbox | Bulk selection |
| ID | İlk 8 karakter |
| Email | Avatar + email |
| Name | İsim veya "—" |
| Plan | Renkli badge (Free/Pro/Business) + Role |
| Status | StatusBadge bileşeni |
| Created | Türkçe tarih formatı |
| Actions | View, Change Plan, Ban/Activate, Impersonate |

#### Toplu İşlemler (Bulk Actions)
```typescript
const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
const [bulkAction, setBulkAction] = useState<'ban' | 'unban' | 'plan' | null>(null);
```

- **Ban Selected** → Tüm seçili kullanıcıları banlar
- **Unban Selected** → Tüm seçili kullanıcıları aktifleştirir
- **Change Plan** → Toplu plan değişikliği
- `Promise.allSettled` ile paralel işlem, başarı/başarısız sayacı

#### Tekil İşlemler

1. **Plan Değiştirme**
   - Modal: Plan selector (Free/Pro/Business)
   - `adminApi.updateUserPlan(token, userId, newPlan)`

2. **Kullanıcı Banlama**
   - Modal: Ban reason (opsiyonel textarea)
   - `adminApi.updateUserStatus(token, userId, 'banned')`
   - Audit log kaydı (best-effort)

3. **Kullanıcı Aktifleştirme**
   - Direkt `adminApi.updateUserStatus(token, userId, 'active')`

4. **Impersonate (Kullanıcı Gibi Görüntüle)**
   - `adminApi.impersonateUser(token, userId)` → token döner
   - Yeni sekmede `?impersonate_token=...` ile açar

5. **CSV Export**
   - `adminApi.exportUsers(token, filters)`
   - Filtrelenmiş kullanıcıları CSV olarak indirir

#### Pagination
```
20 kullanıcı/sayfa
showing: 1-20 of 150
Previous / Next butonları
```

---

## 5. Kullanıcı Detay (`admin/users/[id]/page.tsx`)

### Ne Yapıyor?
Tek bir kullanıcının detaylı bilgisini gösterir.

### Gösterilen Bilgiler

#### Kullanıcı Bilgi Kartı
- ID (full UUID)
- Email
- Name
- Status (badge)
- Created At

#### Yönetim Kartı
- **Plan Selector** → Free/Pro/Business dropdown + Update butonu
- **Status Toggle** → Ban/Activate butonu
- **Usage Stats**:
  - Total Deliveries
  - Success Rate (%)
  - Endpoints Count

#### Endpoints Listesi
- URL, Active/Inactive durumu, oluşturulma tarihi

#### Plan History
- Plan değişiklik geçmişi
- Kim tarafından değiştirildi (admin email)
- Değişiklik tarihi

#### Son Teslimatlar Tablosu
| Kolon | İçerik |
|-------|--------|
| ID | İlk 10 karakter |
| Event | Badge formatında |
| Status | StatusBadge |
| Attempts | Sayı |
| Time | Tarih/saat |
| Actions | View Details, Replay |

**Teslimat Detay Modal:**
- ID, Status, Event, Attempts, Endpoint URL
- Error Message (varsa)
- Request Body (JSON formatında, max-height scroll)
- Request Headers
- Attempt Timeline (attempt number, status, duration, response)

#### Müşteri Analitik Grafikleri

1. **Daily Deliveries (Bar Chart)**
   - Son 14 gün
   - Success (yeşil) + Failed (kırmızı) stacked

2. **Event Distribution (Pie Chart)**
   - En sık kullanılan event type'ları

3. **Endpoint Health**
   - URL, success rate progress bar, avg latency
   - Renk kodları: ≥99% yeşil, ≥95% sarı, <95% kırmızı

#### Email Gönderme
- Modal: Subject + Body textarea
- `adminApi.sendUserEmail(token, userId, subject, body)`

#### API Çağrıları
```typescript
const [detailData, analyticsData, planHistoryData] = await Promise.all([
  adminApi.getUserDetail(token, id),
  adminApi.getUserAnalytics(token, id, 30),
  adminApi.getUserPlanHistory(token, id),
]);
```

---

## 6. Gelir Yönetimi (`admin/revenue/page.tsx`)

### Ne Yapıyor?
Platform gelirini analiz eder, churn analizi yapar.

### İstatistik Kartları

| Kart | Veri |
|------|------|
| **MRR** | Aylık yinelenen gelir + trend |
| **Toplam Gelir** | Tüm ayların toplamı |
| **Churn Rate** | Yüzde olarak |
| **Export Report** | CSV indirme |

### Grafikler

1. **Monthly Revenue (Bar Chart)**
   - X: Aylar, Y: Gelir (₺)
   - Tarih aralığı filtresi: 7d, 30d, 90d, 12m, All
   - `dateRange` state ile filtreleme

2. **Revenue by Plan (Pie Chart)**
   - Free/Pro/Business gelir dağılımı
   - Her plan için: renk, tutar, kullanıcı sayısı

### Plan Fiyatları
- Settings'den çekilir: `plan_price_pro`, `plan_price_business`
- Header'da bilgi kartı olarak gösterilir

### Churn Analizi Tablosu
| Kolon | İçerik |
|-------|--------|
| Email | Kullanıcı email |
| Name | İsim |
| Plan | Badge |
| Amount | ₺ formatında |
| Churn Date | Türkçe tarih |

### API Çağrıları
```typescript
const [revenueData, churnData, settings] = await Promise.all([
  adminApi.getRevenue(token),
  adminApi.getChurn(token),
  adminApi.getSettings(token),
]);
```

---

## 7. Sistem Sağlığı (`admin/system/page.tsx`)

### Ne Yapıyor?
Platform altyapısını izler, test webhook gönderir.

### Servis Durumu Kartları

| Servis | İkon | Detay |
|--------|------|-------|
| **API Server** | 🚀 | Uptime (gün/saat/dakika) |
| **Database** | 🐘 | Latency (ms) |
| **Cache (Redis)** | ⚡ | Latency (ms) |
| **Queue** | 📬 | Pending/Processing/Failed sayısı |

### Durum Göstergeleri
- **All Operational** → Yeşil pulse dot
- **Partial Degradation** → Sarı
- **System Issues** → Kırmızı
- 15 saniyede bir otomatik yenileme

### Altyapı Tablosu
```
API Server     → Oracle Cloud ARM    → 4 OCPU, 24 GB RAM
Database       → Neon PostgreSQL     → Serverless, 0.5 GB
Cache          → Upstash Redis       → Serverless, 256 MB
CDN            → Cloudflare          → DNS, SSL, DDoS
Dashboard      → Vercel              → Next.js 15
Monitoring     → Grafana Cloud       → OpenTelemetry
```

### Ek Özellikler

1. **Active Alerts Summary**
   - Aktif alert kuralı sayısı
   - Sarı border ile vurgulu

2. **DB Size** (opsiyonel)
   - `health.checks.db_size.size`

3. **Queue Details**
   - Pending, Processing, Failed (son 1 saat)

4. **Recent Error Logs**
   - Event, error mesajı, timestamp
   - Tablo formatında

5. **Test Webhook Console**
   - Endpoint URL input
   - Event Type input (varsayılan: `test.ping`)
   - Payload textarea (JSON, monospace font)
   - Send Test butonu
   - Sonuç: Status Code, Response Time (ms), Response Body

### API Çağrıları
```typescript
const [res, alertsRes] = await Promise.all([
  fetch(`${API}/health`, { headers: { Authorization: `Bearer ${token}` } }),
  fetch(`${API}/admin/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
]);
```

---

## 8. Platform Ayarları (`admin/settings/page.tsx`)

### Ne Yapıyor?
Tüm platform konfigürasyonunu yönetir.

### Ayar Kategorileri

#### 1. Genel Ayarlar
| Ayar | Tip | Açıklama |
|------|-----|----------|
| `maintenance_mode` | Toggle | Bakım modu |
| `signup_enabled` | Toggle | Kayıt açık/kapalı |
| `default_plan` | Select | Varsayılan plan (Free/Pro) |

#### 2. Plan Limitleri
| Ayar | Free | Pro |
|------|------|-----|
| `max_endpoints` | 5 | 50 |
| `max_webhooks/month` | 10,000 | 50,000 |
| `rate_limit (req/min)` | 100 | 1,000 |
| `retention_days` | 7 | 30 |

#### 3. Plan Fiyatları
- Pro: $29/ay (varsayılan)
- Business: $99/ay (varsayılan)

#### 4. Email Ayarları
- Resend API Key (password input)
- Sender Address (email input)

#### 5. Güvenlik Ayarları
- Webhook Secret (password input)
- Global Rate Limit (req/min)
- CORS Origins (comma-separated)

#### 6. Backup Ayarları
- Backup Retention (gün)

#### 7. Retry Ayarları
- Max Retry Attempts (0-10)

#### 8. Alert Thresholds
| Threshold | Varsayılan | Koşul |
|-----------|-----------|-------|
| Success Rate | < 95% | failure_rate |
| Latency | > 5000ms | latency |
| Consecutive Failures | > 10/saat | consecutive_failures |

**Notification Channels:**
- ✅ Email
- ☐ Slack
- ☐ Webhook

### Kaydetme Mekanizması
```typescript
// Platform settings
const res = await fetch(`${API}/admin/settings`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify(settings),
});

// Alert settings - her bir kural için ayrı PUT/POST
for (const [, config] of Object.entries(ALERT_CONDITIONS)) {
  if (existing) {
    await fetch(`${API}/admin/alerts/${existing.id}`, { method: 'PUT', ... });
  } else {
    await fetch(`${API}/admin/alerts`, { method: 'POST', ... });
  }
}
```

---

## 9. Aktivite Logu (`admin/activity/page.tsx`)

### Ne Yapıyor?
Tüm admin aksiyonlarını loglar.

### Desteklenen Aksiyonlar

| Aksiyon | İkon | Renk |
|---------|------|------|
| LOGIN | 🔑 | Mavi |
| REGISTER | 👤 | Yeşil |
| ENDPOINT_CREATE | ➕ | Emerald |
| ENDPOINT_DELETE | 🗑️ | Kırmızı |
| ENDPOINT_UPDATE | ✏️ | Amber |
| API_KEY_CREATE | 🔐 | Mor |
| API_KEY_DELETE | 🗑️ | Kırmızı |
| IMPERSONATE | 👁️ | Turuncu |
| PASSWORD_CHANGE | 🔒 | Sarı |
| 2FA_ENABLE | 🛡️ | Yeşil |
| 2FA_DISABLE | 🛡️ | Kırmızı |

### Tablo Kolonları
| Kolon | İçerik |
|-------|--------|
| Action | İkon + renkli badge |
| Resource | Type + ID (truncated) |
| Admin | Customer ID |
| Timestamp | Türkçe format |
| Details | JSON (pre format) + IP adresi |

### Filtreleme
- Action bazlı dropdown
- Pagination: 20/sayfa

---

## 10. API Entegrasyonu

### `adminApi` Fonksiyonları (`lib/api.ts`)

```typescript
export const adminApi = {
  // İstatistikler
  getStats: (token) => AdminStatsResponse,
  
  // Kullanıcılar
  listUsers: (token, params) => AdminUsersResponse,
  getUserDetail: (token, id) => AdminUserDetail,
  getUserAnalytics: (token, userId, days) => UserAnalytics,
  getUserPlanHistory: (token, userId) => { history: [...] },
  updateUserPlan: (token, userId, plan) => void,
  updateUserStatus: (token, userId, status) => void,
  impersonateUser: (token, userId) => { token: string },
  sendUserEmail: (token, userId, subject, body) => void,
  exportUsers: (token, filters) => string, // URL
  
  // Gelir
  getRevenue: (token) => RevenueResponse,
  getChurn: (token) => { users: ChurnUser[] },
  exportRevenue: (token, months) => string,
  
  // Ayarlar
  getSettings: (token) => PlatformSettings,
  updateSettings: (token, settings) => void,
  
  // Audit Log
  getAuditLogs: (token, params) => { entries, total, limit, offset },
  createAuditLog: (token, data) => void,
  
  // Test
  testWebhook: (token, data) => { status_code, response_body, duration_ms },
  
  // Alert
  getAlerts: (token) => AlertRule[],
  createAlert: (token, data) => void,
  updateAlert: (token, id, data) => void,
};
```

### Veri Tipleri

```typescript
interface AdminStatsResponse {
  total_users: number;
  total_deliveries: number;
  total_revenue: number;
  active_users_today: number;
  users_by_plan: Array<{ plan: string; count: number }>;
  recent_signups: Array<{ id, email, name, plan, created_at }>;
  trends: {
    total_users_yesterday: number;
    total_deliveries_yesterday: number;
    revenue_yesterday: number;
    active_users_yesterday: number;
    active_webhooks: number;
  };
}

interface AdminUser {
  id: string;
  email: string;
  name: string;
  plan: string;
  status: string;
  role: string;
  created_at: string;
}

interface RevenueResponse {
  mrr: number;
  mrr_trend: number;
  churn_rate: number;
  monthly_revenue: Array<{ month: string; revenue: number }>;
  revenue_by_plan: Array<{ plan: string; revenue: number; count: number }>;
}

interface PlatformSettings {
  default_plan: string;
  max_endpoints_free: number;
  max_endpoints_pro: number;
  max_webhooks_free: number;
  max_webhooks_pro: number;
  rate_limit_free: number;
  rate_limit_pro: number;
  retry_max_attempts: number;
  retention_days_free: number;
  retention_days_pro: number;
  maintenance_mode: boolean;
  signup_enabled: boolean;
  plan_price_pro: number;
  plan_price_business: number;
  resend_api_key: string | null;
  email_sender: string | null;
  webhook_secret: string | null;
  backup_retention_days: number;
  global_rate_limit: number;
  cors_origins: string | null;
}
```

---

## 11. Ortak Bileşenler

### Kullanılan Bileşenler

| Bileşen | Dosya | Kullanım |
|---------|-------|----------|
| `StatCard` | `components/tremor/StatCard.tsx` | İstatistik kartları |
| `ChartCard` | `components/tremor/ChartCard.tsx` | Grafik kartları |
| `StatusBadge` | `components/StatusBadge.tsx` | Durum rozetleri |
| `LoadingSpinner` | `components/LoadingSpinner.tsx` | Loading states |
| `Toast` | `components/Toast.tsx` | Bildirimler |
| `ThemeToggle` | `components/ThemeToggle.tsx` | Tema değiştirme |
| `LazyCharts` | `components/LazyCharts.tsx` | Code-split grafikler |

### Grafik Kütüphanesi
- **Recharts** kullanılıyor
- `LazyCharts.tsx` ile code-splitting (performans)
- BarChart, PieChart, ResponsiveContainer, Tooltip

---

## 12. Güvenlik

### Auth Guard
- Layout seviyesinde `user.is_admin` kontrolü
- Her API çağrısında `Authorization: Bearer ${token}` header'ı

### Impersonation
- `adminApi.impersonateUser()` → geçici token
- Yeni sekmede açılır (ana session etkilenmez)

### Audit Trail
- Tüm admin aksiyonları audit log'a kaydedilir
- IP adresi, timestamp, details

### Input Validasyonu
- Number input'larda `min`/`max` sınırları
- JSON payload validasyonu (test webhook)
- Password input'ları (API key, webhook secret)

---

## 13. Eksikler & İyileştirme Önerileri

### Mevcut Eksikler

| # | Eksik | Açıklama |
|---|-------|----------|
| 1 | **2FA Yönetimi** | Admin panelinde 2FA enable/disable yok |
| 2 | **Rol Yönetimi** | Sadece `is_admin` var, granular roller yok |
| 3 | **Bulk Email** | Toplu email gönderme yok |
| 4 | **Custom Dashboard** | Admin kendi dashboard'unu özelleştiremiyor |
| 5 | **API Rate Limit Override** | Tek kullanıcı için override yok |
| 6 | **Whitelist/Blacklist** | IP whitelist/blacklist yönetimi yok |
| 7 | **Webhook Template** | Admin webhook template'i oluşturamıyor |
| 8 | **Multi-tenant** | Organizasyon bazlı admin yok |
| 9 | **Scheduled Reports** | Otomatik rapor gönderimi yok |
| 10 | **Real-time Updates** | WebSocket/SSE ile canlı güncelleme yok |

### İyileştirme Önerileri

1. **Granular RBAC**: Owner > Admin > Support > Viewer rolleri
2. **Advanced Analytics**: Funnel, cohort, retention analizi
3. **API Usage Dashboard**: Kullanıcı başına API çağrı grafiği
4. **Automated Alerts**: Slack/Discord/PagerDuty entegrasyonu
5. **Data Export**: Full database export (JSON/CSV)
6. **Multi-language Admin**: Admin paneli için ayrı dil dosyaları
7. **Keyboard Shortcuts**: Power-user kısayolları
8. **Activity Heatmap**: Kullanıcı aktivite ısı haritası
9. **Billing Integration**: Stripe/Iyzico admin paneli
10. **Self-hosted Admin**: Docker ile kurulabilir admin paneli

---

## 14. Backend API Endpoint'leri (`api/src/routes/admin.rs`)

### Route Tanımları (Rust/Axum)

```rust
pub fn router() -> Router {
    Router::new()
        // Kullanıcılar
        .route("/users", get(list_users))
        .route("/users/export", get(export_users_csv))
        .route("/users/{id}", get(get_user_detail))
        .route("/users/{id}/plan", put(change_plan))
        .route("/users/{id}/plan-history", get(user_plan_history))
        .route("/users/{id}/send-email", post(send_user_email))
        .route("/users/{id}/status", put(change_status))
        .route("/users/{id}/impersonate", post(impersonate_user))
        .route("/users/{id}/analytics", get(user_analytics))
        
        // İstatistikler
        .route("/stats", get(system_stats))
        .route("/revenue", get(revenue_by_month))
        .route("/revenue/export", get(export_revenue_csv))
        .route("/churn", get(churn_report))
        
        // Audit & Test
        .route("/audit-logs", get(admin_audit_logs))
        .route("/deliveries/{id}/replay", post(replay_delivery))
        .route("/test-webhook", post(test_webhook))
        .route("/sdk-update", post(notify_sdk_update))
        
        // Ayarlar & Alertler
        .route("/settings", get(get_settings).put(update_settings))
        .route("/alerts", get(list_all_alerts).post(create_platform_alert))
        .route("/alerts/{id}", put(update_alert_admin).delete(delete_alert_admin))
}
```

### Backend Veri Yapıları

```rust
// Pagination
struct PaginationParams {
    page: Option<i64>,
    per_page: Option<i64>,
    search: Option<String>,
    plan: Option<String>,
    status: Option<String>,
    created_after: Option<String>,
    created_before: Option<String>,
}

// System Stats
struct SystemStats {
    total_users: i64,
    total_deliveries: i64,
    total_revenue: f64,
    active_users_today: i64,
    users_by_plan: Vec<PlanCount>,
    recent_signups: Vec<RecentSignup>,
    trends: StatsTrends,
}

struct StatsTrends {
    total_users_yesterday: i64,
    total_deliveries_yesterday: i64,
    revenue_yesterday: f64,
    active_users_yesterday: i64,
    active_webhooks: i64,  // İşlenmekte olan webhook sayısı
}

// User Detail
struct UserDetailResponse {
    user: UserSummary,
    endpoints: Vec<EndpointSummary>,
    recent_deliveries: Vec<DeliverySummary>,
    usage_stats: UsageStats,
}

struct UsageStats {
    total_deliveries: i64,
    success_rate: f64,
    endpoints_count: i64,
}

// Revenue
struct RevenueRow { month: String, revenue: f64 }
struct RevenueByPlan { plan: String, revenue: f64, count: i64 }

// Request Bodies
struct PlanRequest { plan: String }
struct StatusRequest { is_active: bool }
struct SendEmailRequest { subject: String, body: String }
```

### SQL Sorguları (Tahmini)

| Endpoint | Sorgu |
|----------|-------|
| `GET /stats` | `SELECT COUNT(*) FROM customers`, `SELECT COUNT(*) FROM deliveries`, `SELECT plan, COUNT(*) GROUP BY plan` |
| `GET /users` | `SELECT * FROM customers WHERE email ILIKE $1 AND plan = $2 ORDER BY created_at DESC LIMIT $3 OFFSET $4` |
| `GET /users/{id}` | `SELECT * FROM customers WHERE id = $1` + endpoints + deliveries JOIN |
| `PUT /users/{id}/plan` | `UPDATE customers SET plan = $1 WHERE id = $2` + audit log |
| `PUT /users/{id}/status` | `UPDATE customers SET is_active = $1 WHERE id = $2` + audit log |
| `GET /revenue` | `SELECT DATE_TRUNC('month', created_at), SUM(amount) FROM payments GROUP BY 1` |
| `GET /churn` | `SELECT * FROM customers WHERE plan_changed_at > NOW() - INTERVAL '30 days' AND new_plan = 'free'` |
| `POST /impersonate` | JWT token oluştur → `generate_impersonation_token(user_id)` |
| `GET /audit-logs` | `SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2` |
| `POST /test-webhook` | HTTP POST → endpoint_url, response'ı kaydet |

---

## Kaynak Dosyalar

| Dosya | Satır | Açıklama |
|-------|-------|----------|
| `dashboard/src/app/[locale]/admin/layout.tsx` | ~200 | Admin shell |
| `dashboard/src/app/[locale]/admin/page.tsx` | ~250 | Overview |
| `dashboard/src/app/[locale]/admin/users/page.tsx` | ~500 | Kullanıcı yönetimi |
| `dashboard/src/app/[locale]/admin/users/[id]/page.tsx` | ~600 | Kullanıcı detay |
| `dashboard/src/app/[locale]/admin/revenue/page.tsx` | ~350 | Gelir analizi |
| `dashboard/src/app/[locale]/admin/system/page.tsx` | ~400 | Sistem sağlığı |
| `dashboard/src/app/[locale]/admin/settings/page.tsx` | ~500 | Platform ayarları |
| `dashboard/src/app/[locale]/admin/activity/page.tsx` | ~250 | Audit log |
| `dashboard/src/lib/api.ts` | ~300 | API client |
| `dashboard/src/lib/store.tsx` | ~100 | Auth state |
