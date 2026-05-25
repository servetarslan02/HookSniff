# 05 — Revenue (Gelir Analizi)

**Dosya:** `dashboard/src/app/[locale]/admin/revenue/page.tsx`  
**Satır:** ~350  
**Amaç:** Platform gelir analizi, churn raporu

---

## Sayfada Ne Var?

### Date Range Filter
- 7d, 30d, 90d, 12m, All
- `DateRange` type: `'7d' | '30d' | '90d' | '12m' | 'all'`

### Refresh Butonu
- Manuel refresh (animate-spin ikonu)
- `fetchRevenue(true)` ile refresh

### 3 İstatistik Kartı
| Kart | İkon | Veri | Renk |
|------|------|------|------|
| MRR | 💰 | Aylık yinelenen gelir + trend | Violet |
| Toplam Gelir | 📈 | Tüm ayların toplamı | Emerald |
| Churn Rate | 📉 | Yüzde | Red |

### Export Report Butonu
- CSV indirme (window.open ile)

### Plan Prices Info
- Pro: $29/mo, Business: $99/mo
- "Configurable from Settings" notu

### Monthly Revenue (Bar Chart)
- X: Aylar, Y: Gelir (₺)
- ResponsiveContainer ile responsive

### Revenue by Plan (Pie Chart)
- Free/Pro/Business gelir dağılımı
- Legend: renk + plan adı + tutar + kullanıcı sayısı

### Churn Analizi Tablosu
| Kolon | İçerik |
|-------|--------|
| Email | Kullanıcı email |
| Name | İsim |
| Plan | Badge |
| Amount | ₺ formatında |
| Churn Date | Türkçe tarih |

---

## Kullanılan Sistemler

| Sistem | Amaç |
|--------|------|
| `adminApi.getRevenue()` | Gelir verisi — GET /admin/revenue |
| `adminApi.getChurn()` | Churn verisi — GET /admin/churn |
| `adminApi.getSettings()` | Plan fiyatları — GET /admin/settings |
| `adminApi.exportRevenue()` | CSV export — GET /admin/revenue/export |
| `StatCard` (Tremor) | İstatistik kartları |
| `ChartCard` (Tremor) | Grafik kartı |
| `BarChart` (Recharts) | Aylık gelir |
| `PieChart` (Recharts) | Plan dağılımı |
| `ResponsiveContainer` | Responsive grafik |
| `Tooltip` | Grafik tooltip |
| `Cell` | Pie chart dilimleri |

## API Çağrıları

```typescript
const [revenueData, churnData, settings] = await Promise.all([
  adminApi.getRevenue(token),      // GET /admin/revenue
  adminApi.getChurn(token),        // GET /admin/churn
  adminApi.getSettings(token),     // GET /admin/settings
]);
```

## State

```typescript
const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
const [churnUsers, setChurnUsers] = useState<ChurnUser[]>([]);
const [planPrices, setPlanPrices] = useState({ pro: 29, business: 99 });
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState<string | null>(null);
const [dateRange, setDateRange] = useState<DateRange>('12m');
```

---

## 🔴 Kritik Sorunlar

1. **Churn rate NaN olabilir** — `revenue?.churn_rate?.toFixed(1)` — backend null dönerse NaN gösterilir.

2. **CSV export token'ı URL'de** — `window.open(${API}${url}&token=${token})` — güvenlik riski.

## 🟡 Orta Seviye Sorunlar

3. **MRR trend yüzde olarak gösterilmiyor** — `revenue.mrr_trend` mutlak değer, yüzde hesabı yok.

4. **Churn tablosunda aksiyon yok** — Sadece bilgi gösterimi, "Win back" email gönderme yok.

5. **Plan fiyatları düzenlenemiyor** — Sadece bilgi amaçlı, düzenleme linki var ama doğrudan settings'e yönlendirme yok.

6. **Gelir ₺ hardcoded** — Para birimi dinamik olmalı.

7. **Tarih aralığı "12m" varsayılan** — İlk yüklemede son 12 ay, iyi.

## ✅ Olumlu

- Tarih aralığı filtresi (7d, 30d, 90d, 12m, all)
- Manuel refresh butonu
- Pie chart + Legend
- Churn analizi tablosu
- Empty state var
- Export CSV
