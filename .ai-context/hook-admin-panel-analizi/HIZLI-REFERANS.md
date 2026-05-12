# Admin Panel — Hızlı Referans Kartı

## 📊 Sayfa Sayıları

| Sayfa | Dosya | ~Satır | Özellik Sayısı |
|-------|-------|--------|----------------|
| Layout | `admin/layout.tsx` | 200 | 8 |
| Overview | `admin/page.tsx` | 250 | 5 |
| Users | `admin/users/page.tsx` | 500 | 10 |
| User Detail | `admin/users/[id]/page.tsx` | 600 | 12 |
| Revenue | `admin/revenue/page.tsx` | 350 | 6 |
| System | `admin/system/page.tsx` | 400 | 8 |
| Settings | `admin/settings/page.tsx` | 500 | 9 |
| Activity | `admin/activity/page.tsx` | 250 | 5 |
| **TOPLAM** | | **~3050** | **63** |

## 🔑 Anahtar Özellikler (Yeni Sistemde Olması Gerekenler)

### Zorunlu (Must-have)
- [ ] Admin auth guard (is_admin kontrolü)
- [ ] Kullanıcı CRUD (listeleme, arama, filtreleme)
- [ ] Plan yönetimi (Free/Pro/Business)
- [ ] Kullanıcı ban/activate
- [ ] Audit log (tüm admin aksiyonları)
- [ ] Platform ayarları (limitler, fiyatlar)
- [ ] Sistem sağlık izleme

### Önemli (Should-have)
- [ ] Impersonation (kullanıcı gibi görüntüleme)
- [ ] Bulk operations (toplu ban, plan değişikliği)
- [ ] CSV export
- [ ] Gelir analizi + churn
- [ ] Alert sistemi (email, Slack, webhook)
- [ ] Test webhook konsolu
- [ ] Kullanıcı email gönderme

### İyi Olur (Nice-to-have)
- [ ] Kullanıcı analitik grafikleri
- [ ] Plan değişiklik geçmişi
- [ ] Endpoint sağlık durumu
- [ ] Real-time canlı göstergeler
- [ ] Keyboard shortcuts
- [ ] Multi-language (i18n)

## 🏗️ Teknik Gereksinimler

```
Frontend:  Next.js / React / TypeScript
UI:        Tailwind CSS + Grafik kütüphanesi (Recharts/Tremor)
State:     Zustand / Redux / Context API
Auth:      JWT + Role-based access
API:       REST (GET/POST/PUT/DELETE)
DB:        PostgreSQL
Cache:     Redis (opsiyonel)
Deploy:    Docker / Vercel / Self-hosted
```

## 📁 Dosya Yapısı (Önerilen)

```
admin/
├── layout.tsx           → Shell, sidebar, auth guard
├── page.tsx             → Dashboard overview
├── users/
│   ├── page.tsx         → Kullanıcı listesi
│   └── [id]/page.tsx    → Kullanıcı detay
├── revenue/page.tsx     → Gelir analizi
├── system/page.tsx      → Sistem sağlığı
├── settings/page.tsx    → Platform ayarları
├── activity/page.tsx    → Audit log
├── components/
│   ├── UserTable.tsx    → Kullanıcı tablosu
│   ├── PlanBadge.tsx    → Plan rozeti
│   ├── StatusBadge.tsx  → Durum rozeti
│   ├── StatCard.tsx     → İstatistik kartı
│   ├── ChartCard.tsx    → Grafik kartı
│   ├── BulkActions.tsx  → Toplu işlemler
│   ├── FilterBar.tsx    → Filtre çubuğu
│   └── ConfirmModal.tsx → Onay modali
└── hooks/
    useAdminStats.ts     → İstatistik hook'u
    useAdminUsers.ts     → Kullanıcı hook'u
    useAdminSettings.ts  → Ayarlar hook'u
```
