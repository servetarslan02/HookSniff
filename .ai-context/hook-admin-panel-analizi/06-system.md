# 06 — System (Sistem Sağlığı)

**Dosya:** `dashboard/src/app/[locale]/admin/system/page.tsx`  
**Satır:** ~400  
**Amaç:** Platform altyapı izleme, test webhook konsolu

---

## Servis Durumu Kartları (4 adet)
| Servis | İkon | Metrik |
|--------|------|--------|
| API Server | 🚀 | Uptime (gün/saat/dakika) |
| Database | 🐘 | Latency (ms) |
| Cache (Redis) | ⚡ | Latency (ms) |
| Queue | 📬 | Pending/Processing/Failed |

### Durum Renkleri
- `healthy` / `connected` / `ok` → Yeşil
- `degraded` / `slow` → Sarı
- Diğer → Kırmızı

### Latency Barı
- 0-50ms → Yeşil (fast)
- 50-200ms → Sarı (moderate)
- 200ms+ → Kırmızı (slow)

## Overall Status
- Tüm servisler OK → Yeşil pulse + "All Operational"
- Bazı degraded → Sarı + "Partial Degradation"
- Sorun var → Kırmızı + "System Issues"
- 15 saniyede bir otomatik yenileme

## Active Alerts Summary
- Aktif alert kuralı sayısı
- Sarı border ile vurgulu

## Altyapı Tablosu
```
API Server     → Oracle Cloud ARM    → 4 OCPU, 24 GB RAM
Database       → Neon PostgreSQL     → Serverless, 0.5 GB
Cache          → Upstash Redis       → Serverless, 256 MB
CDN            → Cloudflare          → DNS, SSL, DDoS
Dashboard      → Vercel              → Next.js 15
Monitoring     → Grafana Cloud       → OpenTelemetry
```

## DB Size (opsiyonel)
- `health.checks.db_size.size` varsa gösterilir

## Queue Details
- Pending, Processing, Failed (son 1 saat)

## Recent Error Logs
- Event, error mesajı, timestamp
- Tablo formatında

## Test Webhook Konsolu
| Input | Açıklama |
|-------|----------|
| Endpoint URL | Test edilecek webhook URL'i |
| Event Type | Varsayılan: `test.ping` |
| Payload | JSON textarea, monospace font |
| Send Test | Gönder butonu |

### Sonuç
- Status Code (yeşil < 400, kırmızı ≥ 400)
- Response Time (ms)
- Response Body (pre format, max-height scroll)

## API Çağrıları
```typescript
const [res, alertsRes] = await Promise.all([
  fetch(`${API}/health`, { headers: { Authorization: `Bearer ${token}` } }),
  fetch(`${API}/admin/alerts`, { headers: { Authorization: `Bearer ${token}` } }),
]);
```

## State
```typescript
const [health, setHealth] = useState<SystemHealth | null>(null);
const [activeAlerts, setActiveAlerts] = useState<number>(0);
const [testUrl, setTestUrl] = useState('');
const [testEvent, setTestEvent] = useState('test.ping');
const [testPayload, setTestPayload] = useState('{\n  "message": "Hello from HookSniff"\n}');
const [testResult, setTestResult] = useState(null);
const [testLoading, setTestLoading] = useState(false);
```
