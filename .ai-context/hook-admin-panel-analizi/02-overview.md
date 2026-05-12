# 02 — Admin Overview (Dashboard)

**Dosya:** `dashboard/src/app/[locale]/admin/page.tsx`  
**Satır:** ~250  
**Amaç:** Admin panelinin ana sayfası — platform istatistikleri

---

## Sayfada Ne Var?

### 4 İstatistik Kartı
| Kart | İkon | Veri | Renk | Trend |
|------|------|------|------|-------|
| Toplam Kullanıcı | 👥 | `stats.total_users` | Mavi | Dünle fark |
| Toplam Teslimat | 📦 | `stats.total_deliveries` | Emerald | Dünle fark |
| Toplam Gelir | 💰 | `stats.total_revenue` (₺) | Violet | Dünle fark |
| Aktif Kullanıcı Bugün | 🔥 | `stats.active_users_today` | Amber | Dünle fark |

### Live Webhook Indicator
- Yeşil pulse dot + "X active webhooks currently processing"
- Sadece `active_webhooks > 0` ise gösterilir

### Users by Plan (Pie Chart)
- Free: gri (#94a3b8), Pro: mavi (#4c6ef5), Business: mor (#8b5cf6)
- Legend: renk + plan adı + sayı
- Veri yoksa CSS bar chart placeholder (Free %60, Pro %30, Business %10)

### Recent Activity (Audit Log)
- Son 5 audit log kaydı
- Action (nokta/alt çizgi boşlukla değiştirilir), resource type, timestamp
- "View All →" linki `/admin/activity`

### Recent Signups
- Son kayıt olan kullanıcılar
- İsim, email, plan badge (renksiz), tarih

---

## Kullanılan Sistemler

| Sistem | Amaç |
|--------|------|
| `adminApi.getStats()` | Platform istatistikleri |
| `adminApi.getAuditLogs(limit=5)` | Son aktiviteler |
| `StatCard` (Tremor) | İstatistik kartları |
| `PieChart` (Recharts, lazy) | Plan dağılımı grafiği |
| `ResponsiveContainer` | Responsive grafik |
| `Tooltip` | Grafik tooltip |
| `Cell` | Pie chart dilimleri |
| `Promise.all` | Paralel API çağrısı |
| `useCallback` | Memoize edilmiş fetch fonksiyonu |
| `useTranslations('admin')` | i18n |

## API Çağrıları

```typescript
const [statsData, auditData] = await Promise.all([
  adminApi.getStats(token),                    // GET /admin/stats
  adminApi.getAuditLogs(token, { limit: 5 }),  // GET /admin/audit-logs?limit=5
]);
```

## State

```typescript
const [stats, setStats] = useState<AdminStatsResponse | null>(null);
const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

## Loading State
- 4 adet skeleton kart (animate-pulse)
- "Loading dashboard" mesajı

## Error State
- Kırmızı banner + retry butonu

---

## 🔴 Kritik Sorunlar

1. **Trend hesaplama yanıltıcı** — `diff !== 0` kontrolü var ama negatif trend için `value: Math.abs(diff)` kullanıldığı için negatif trend pozitif sayı olarak gösteriliyor. "Down 5" yerine sadece "5" gösteriliyor.

2. **Pie chart placeholder statik** — Veri yoksa "Free %60, Pro %30, Business %10" hardcoded gösteriliyor — yanıltıcı.

## 🟡 Orta Seviye Sorunlar

3. **Auto-refresh yok** — Sayfa yüklendikten sonra veriler güncellenmiyor. Manuel refresh butonu da yok.

4. **Audit log sadece 5 kayıt** — Son aktivite panelinde sadece 5 kayıt, sayfalama yok.

5. **Gelir ₺ formatında** — `₺${(stats?.total_revenue || 0).toLocaleString()}` — para birimi hardcoded.Uluslararası destek için dinamik olmalı.

6. **Recent Signups'ta plan badge rengi yok** — Sadece text, renkli badge olmalı (Users sayfasındaki gibi).

7. **Loading skeleton sayısı sabit** — `[1, 2, 3, 4]` — grid breakpoint'lerine göre dinamik olmalı.

## ✅ Olumlu

- Parallel API çağrısı (`Promise.all`)
- Error state + retry butonu
- Live webhooks indicator (pulse animasyonu)
- Responsive grid layout
- Lazy loaded grafikler (code-splitting)
