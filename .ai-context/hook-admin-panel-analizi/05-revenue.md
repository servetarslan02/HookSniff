# 05 — Revenue (Gelir Analizi)

**Dosya:** `dashboard/src/app/[locale]/admin/revenue/page.tsx`  
**Satır:** ~350  
**Amaç:** Platform gelir analizi, churn raporu

---

## İstatistik Kartları (4 adet)
| Kart | Veri | Renk |
|------|------|------|
| MRR | Aylık yinelenen gelir + trend | Violet |
| Toplam Gelir | Tüm ayların toplamı | Emerald |
| Churn Rate | Yüzde | Red |
| Export Report | CSV indirme | — |

## Grafikler

### Monthly Revenue (Bar Chart)
- X: Aylar, Y: Gelir (₺)
- Tarih aralığı filtresi: 7d, 30d, 90d, 12m, All
- ResponsiveContainer ile responsive

### Revenue by Plan (Pie Chart)
- Free/Pro/Business gelir dağılımı
- Legend: renk + plan adı + tutar + kullanıcı sayısı

## Plan Fiyatları Bilgi Kartı
- Settings'den çekilir
- Pro: $X/mo, Business: $Y/mo
- "Configurable from Settings" notu

## Churn Analizi Tablosu
| Kolon | İçerik |
|-------|--------|
| Email | Kullanıcı email |
| Name | İsim |
| Plan | Badge |
| Amount | ₺ formatında |
| Churn Date | Türkçe tarih |

## Tarih Filtresi
```typescript
type DateRange = '7d' | '30d' | '90d' | '12m' | 'all';
```
- `allMonthlyData` filtrelerek `monthlyData` oluşturulur

## API Çağrıları
```typescript
const [revenueData, churnData, settings] = await Promise.all([
  adminApi.getRevenue(token),
  adminApi.getChurn(token),
  adminApi.getSettings(token),
]);
```

## State
```typescript
const [revenue, setRevenue] = useState<RevenueResponse | null>(null);
const [churnUsers, setChurnUsers] = useState<ChurnUser[]>([]);
const [planPrices, setPlanPrices] = useState({ pro: 29, business: 99 });
const [dateRange, setDateRange] = useState<DateRange>('12m');
const [refreshing, setRefreshing] = useState(false);
```

## Refresh
- Manuel refresh butonu (animate-spin ikonu)
- `fetchRevenue(true)` ile refresh
