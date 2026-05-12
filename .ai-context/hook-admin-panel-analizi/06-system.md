# 06 — System (Sistem Sağlığı)

**Dosya:** `dashboard/src/app/[locale]/admin/system/page.tsx`  
**Satır:** ~400  
**Amaç:** Platform altyapı izleme, test webhook konsolu

---

## Sayfada Ne Var?

### Overall Status Banner
- Yeşil pulse + "All Operational"
- Sarı + "Partial Degradation"
- Kırmızı + "System Issues"
- Son kontrol zamanı + "Auto-refresh 15s"

### Active Alerts Summary
- Sarı border ile alert sayısı
- "X active alert rule(s)"

### 4 Servis Kartı
| Servis | İkon | Metrik |
|--------|------|--------|
| API Server | 🚀 | Uptime (gün/saat/dakika) |
| Database | 🐘 | Latency (ms) |
| Cache (Redis) | ⚡ | Latency (ms) |
| Queue | 📬 | Pending/Processing/Failed |

### Latency Barı
- 0-50ms → Yeşil (fast)
- 50-200ms → Sarı (moderate)
- 200ms+ → Kırmızı (slow)

### DB Size (opsiyonel)
- `health.checks.db_size.size` varsa gösterilir

### Queue Details (opsiyonel)
- Pending, Processing, Failed (son 1 saat)

### Recent Error Logs (opsiyonel)
- Event, error mesajı, timestamp

### Infrastructure Tablosu
| Servis | Sağlayıcı | Detay |
|--------|-----------|-------|
| API Server | Oracle Cloud ARM | 4 OCPU, 24 GB RAM |
| Database | Neon PostgreSQL | Serverless, 0.5 GB |
| Cache | Upstash Redis | Serverless, 256 MB |
| CDN | Cloudflare | DNS, SSL, DDoS |
| Dashboard | Vercel | Next.js 15 |
| Monitoring | Grafana Cloud | OpenTelemetry |

### Test Webhook Konsolu
- Endpoint URL input
- Event Type input (varsayılan: `test.ping`)
- Payload textarea (JSON, monospace)
- Send Test butonu
- Sonuç: Status Code, Response Time, Response Body

---

## Kullanılan Sistemler

| Sistem | Amaç |
|--------|------|
| `fetch(/health)` | Sağlık kontrolü |
| `fetch(/admin/alerts)` | Alert listesi |
| `adminApi.testWebhook()` | Test webhook gönderme |
| `setInterval(15000)` | 15 saniyede polling |
| CSS `animate-pulse` | Pulse animasyonu |

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
const [testError, setTestError] = useState<string | null>(null);
```

---

## 🔴 Kritik Sorunlar

1. **Health check auth gerektiriyor** — `fetch(${API}/health, { headers: { Authorization: Bearer ${token} } })` — health endpoint'i genelde auth'suz olmalı. Monitoring araçları (UptimeRobot, Grafana) erişemez.

2. **Test webhook'ta SSRF riski** — Kullanıcı herhangi bir URL girebilir (ör: `http://169.254.169.254/latest/meta-data/`). Backend'de SSRF koruması olmalı.

3. **Mock data fallback** — API erişilemezse sahte "unknown" durum gösteriliyor. Kullanıcı sorun olduğunu anlamayabilir.

## 🟡 Orta Seviye Sorunlar

4. **15 saniyede bir polling** — `setInterval(fetchHealth, 15000)` — SSE veya WebSocket daha verimli olur.

5. **Infrastructure tablosu hardcoded** — "Oracle Cloud ARM", "Neon PostgreSQL" vb. sabit değerler. Değişirse kod değişmeli.

6. **Alert detayları gösterilmiyor** — Sadece "X active alert rule(s)" mesajı, detay yok.

7. **Error logs'ta filtreleme yok** — Tüm son hatalar gösteriliyor, tarih/severity filtresi yok.

## ✅ Olumlu

- 4 servis kartı (API, DB, Redis, Queue)
- Latency progress bar
- Test webhook konsolu
- Otomatik yenileme (15sn)
- Overall status banner
