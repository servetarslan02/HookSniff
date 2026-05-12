# 02 — Admin Overview (Dashboard)

**Dosya:** `dashboard/src/app/[locale]/admin/page.tsx`  
**Satır:** ~250  
**Amaç:** Admin panelinin ana sayfası — platform istatistikleri

---

## Ne Yapıyor?
Platform genelinde istatistikleri gösterir: toplam kullanıcı, teslimat, gelir, aktif kullanıcı.

## Gösterilen Veriler

### İstatistik Kartları (4 adet)
| Kart | Veri | Trend |
|------|------|-------|
| Toplam Kullanıcı | `stats.total_users` | Dünle fark |
| Toplam Teslimat | `stats.total_deliveries` | Dünle fark |
| Toplam Gelir | `stats.total_revenue` (₺) | Dünle fark |
| Aktif Kullanıcı (Bugün) | `stats.active_users_today` | Dünle fark |

### Canlı Webhook Göstergesi
- `stats.trends.active_webhooks > 0` ise yeşil pulse dot ile gösterilir
- "Currently processing" mesajı

### Users by Plan (Pie Chart)
- Free: gri (#94a3b8)
- Pro: mavi (#4c6ef5)
- Business: mor (#8b5cf6)
- Veri yoksa CSS bar chart placeholder

### Recent Activity (Audit Log)
- Son 5 audit log kaydı
- Action, resource type, timestamp
- "View All →" linki `/admin/activity`

### Recent Signups
- Son kayıt olan kullanıcılar
- İsim, email, plan badge, tarih

## API Çağrıları
```typescript
const [statsData, auditData] = await Promise.all([
  adminApi.getStats(token),
  adminApi.getAuditLogs(token, { limit: 5 }),
]);
```

## State
```typescript
const [stats, setStats] = useState<AdminStatsResponse | null>(null);
const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
```

## Bileşenler
- `StatCard` — istatistik kartı (tremor)
- `PieChart` — pie chart (recharts, lazy loaded)
- `ResponsiveContainer` — responsive grafik

## Loading State
- 4 adet skeleton kart (animate-pulse)

## Error State
- Kırmızı banner + retry butonu
