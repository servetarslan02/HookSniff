# Admin Panel — Sayfa Haritası

## Sidebar Menü

```
┌─────────────────────────────────────┐
│ ⚡ Admin Panel                       │
│    Management                        │
├─────────────────────────────────────┤
│ 📊 Overview      → /admin           │
│ 👥 Users         → /admin/users     │
│ 💰 Revenue       → /admin/revenue   │
│ 🖥️  System        → /admin/system   │
│ ⚙️  Settings      → /admin/settings │
│ 📋 Activity Log  → /admin/activity  │
├─────────────────────────────────────┤
│ ← Back to Dashboard                 │
│ 🌙 Theme Toggle                     │
└─────────────────────────────────────┘
```

---

## Sayfa Ağacı

```
/admin (layout.tsx — Shell)
│
├── page.tsx                    → OVERVIEW
│   ├── StatCard x4             → Toplam Kullanıcı, Teslimat, Gelir, Aktif Kullanıcı
│   ├── Live Webhook Indicator  → Yeşil pulse + sayı
│   ├── PieChart                → Users by Plan (Free/Pro/Business)
│   ├── Recent Activity         → Son 5 audit log
│   └── Recent Signups          → Son kayıt olanlar
│
├── users/
│   ├── page.tsx                → USERS LİSTESİ
│   │   ├── Search + Filters    → Email, Plan, Status, Date Range
│   │   ├── Export CSV          → Filtrelenmiş kullanıcıları indir
│   │   ├── Tablo               → ID, Email, Name, Plan, Status, Created, Actions
│   │   ├── Bulk Actions        → Ban, Unban, Change Plan (seçili kullanıcılar)
│   │   ├── Pagination          → 20/sayfa
│   │   ├── Modal: Plan Change  → Plan selector
│   │   └── Modal: Ban          → Ban reason textarea
│   │
│   └── [id]/
│       └── page.tsx            → USER DETAY
│           ├── User Info Card  → ID, Email, Name, Status, Created
│           ├── Management      → Plan selector, Status toggle, Usage stats
│           ├── Endpoints       → URL, Active/Inactive, Date
│           ├── Plan History    → Değişiklik geçmişi
│           ├── Son Teslimatlar → Tablo: ID, Event, Status, Attempts, Time, Actions
│           ├── Bar Chart       → Daily Deliveries (son 14 gün)
│           ├── Pie Chart       → Event Distribution
│           ├── Endpoint Health → Progress bar + latency
│           ├── Modal: Email    → Subject + Body
│           └── Modal: Delivery → Request body, headers, attempts
│
├── revenue/
│   └── page.tsx                → GELİR ANALİZİ
│       ├── StatCard x3         → MRR, Toplam Gelir, Churn Rate
│       ├── Export Report       → CSV indir
│       ├── Plan Prices Info    → Pro: $29, Business: $99
│       ├── Date Filter         → 7d, 30d, 90d, 12m, All
│       ├── Bar Chart           → Monthly Revenue
│       ├── Pie Chart           → Revenue by Plan
│       └── Churn Table         → Email, Name, Plan, Amount, Date
│
├── system/
│   └── page.tsx                → SİSTEM SAĞLIĞI
│       ├── Status Banner       → All Operational / Degraded / Issues
│       ├── Active Alerts       → Sayı + sarı border
│       ├── Service Cards x4    → API, Database, Redis, Queue
│       ├── DB Size             → Boyut bilgisi
│       ├── Queue Details       → Pending, Processing, Failed
│       ├── Recent Errors       → Event, error, timestamp
│       ├── Infrastructure      → Tablo: servis, sağlayıcı, detay
│       └── Test Webhook        → URL, Event Type, Payload, Send → Result
│
├── settings/
│   └── page.tsx                → PLATFORM AYARLARI
│       ├── General             → Maintenance mode, Signups, Default plan
│       ├── Plan Limits         → Free/Pro: endpoints, webhooks, rate limit, retention
│       ├── Plan Prices         → Pro: $, Business: $
│       ├── Email Settings      → Resend API Key, Sender address
│       ├── Security            → Webhook secret, Rate limit, CORS origins
│       ├── Backup              → Retention days
│       ├── Retry               → Max attempts
│       └── Alert Thresholds    → Success rate, Latency, Failures + Channels
│
└── activity/
    └── page.tsx                → AUDİT LOG
        ├── Action Filter       → Dropdown (11 aksiyon tipi)
        ├── Tablo               → Action, Resource, Admin, Timestamp, Details
        └── Pagination          → 20/sayfa
```

---

## API Çağrıları Haritası

| Sayfa | API Endpoint | Method |
|-------|-------------|--------|
| Overview | `/admin/stats` | GET |
| Overview | `/admin/audit-logs?limit=5` | GET |
| Users | `/admin/users?page=&search=&plan=&status=&created_after=` | GET |
| Users | `/admin/users/{id}/plan` | PUT |
| Users | `/admin/users/{id}/status` | PUT |
| Users | `/admin/users/{id}/impersonate` | POST |
| Users | `/admin/users/export?plan=&status=` | GET |
| Users | `/admin/audit-logs` | POST (create) |
| User Detail | `/admin/users/{id}` | GET |
| User Detail | `/admin/users/{id}/analytics?days=30` | GET |
| User Detail | `/admin/users/{id}/plan-history` | GET |
| User Detail | `/admin/users/{id}/plan` | PUT |
| User Detail | `/admin/users/{id}/status` | PUT |
| User Detail | `/admin/users/{id}/impersonate` | POST |
| User Detail | `/admin/users/{id}/send-email` | POST |
| User Detail | `/admin/deliveries/{id}/replay` | POST |
| User Detail | `/webhooks/{id}` | GET |
| User Detail | `/webhooks/{id}/attempts` | GET |
| Revenue | `/admin/revenue` | GET |
| Revenue | `/admin/churn` | GET |
| Revenue | `/admin/settings` | GET |
| Revenue | `/admin/revenue/export?months=12` | GET |
| System | `/health` | GET |
| System | `/admin/alerts` | GET |
| System | `/admin/test-webhook` | POST |
| Settings | `/admin/settings` | GET |
| Settings | `/admin/settings` | PUT |
| Settings | `/admin/alerts` | GET |
| Settings | `/admin/alerts` | POST |
| Settings | `/admin/alerts/{id}` | PUT |
| Activity | `/admin/audit-logs?limit=&offset=&action=` | GET |

---

## Bileşen Kullanım Haritası

| Sayfa | Bileşenler |
|-------|-----------|
| Layout | ThemeToggle, Link, clsx |
| Overview | StatCard, PieChart, ResponsiveContainer, Tooltip |
| Users | StatusBadge, Toast |
| User Detail | StatusBadge, Toast, BarChart, PieChart |
| Revenue | StatCard, ChartCard, BarChart, PieChart |
| System | (yok — inline HTML) |
| Settings | Toast |
| Activity | (yok — inline HTML) |

---

## State Yönetim Haritası

| Sayfa | State Sayısı | Kritik State'ler |
|-------|-------------|-----------------|
| Layout | 1 | sidebarOpen |
| Overview | 4 | stats, auditLogs, loading, error |
| Users | 12 | users, total, page, search, filters, sort, selectedIds, bulkAction, banTarget, planChangeTarget |
| User Detail | 10 | detail, analytics, planHistory, deliveryDetail, deliveryAttempts, emailModal |
| Revenue | 6 | revenue, churnUsers, planPrices, loading, dateRange |
| System | 7 | health, activeAlerts, testUrl, testEvent, testPayload, testResult |
| Settings | 6 | settings, alertRules, alertThresholds, alertChannels, saving, loading |
| Activity | 5 | entries, total, page, actionFilter, loading |
