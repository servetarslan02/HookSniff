# 💓 Sağlık (Health)

> Sayfa: `dashboard/src/app/[locale]/dashboard/health/page.tsx`
> Route: `/dashboard/health`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| apiFetch | `@/lib/api` | API istemcisi |

### Veri Akışı
- `apiFetch<EndpointHealth[]>(/endpoint-health)` → endpoint sağlık verisi

### EndpointHealth Interface
```typescript
interface EndpointHealth {
  id: string;
  url: string;
  description: string | null;
  is_active: boolean;
  health_status: string;       // healthy/degraded/unhealthy
  success_rate: number;        // yüzde
  avg_response_ms: number;     // ortalama gecikme
  p95_response_ms: number;     // P95 gecikme
  total_deliveries: number;
  successful: number;
  failed: number;
  consecutive_failures: number;
  last_failure_at: string | null;
  uptime_24h: number;
}
```

## Özellikler

### Sağlık Durumu
- ✅ **3 durum kartı** — Healthy / Degraded / Unhealthy (sayılarla)
- ✅ **Otomatik yenileme** — 30 saniyede bir
- ✅ **Progress bar** — Başarı oranı yüzde olarak
- ✅ **Consecutive failures** — Ardışık hata uyarısı
- ✅ **Son hata zamanı** — last_failure_at gösterimi

### Endpoint Detayları
- ✅ URL + açıklama
- ✅ Durum rozeti (renk kodlu)
- ✅ Başarı oranı (büyük font)
- ✅ 5 istatistik: Total, Successful, Failed, Avg Latency, P95 Latency
- ✅ Progress bar (success_rate)
- ✅ Consecutive failures uyarısı

### Erişilebilirlik
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek
- ✅ Renk + metin kombinasyonu (sadece renk değil)

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- 30 saniyelik auto-refresh
- Üç durumlu sağlık kartları
- Progress bar ile görsel gösterim
- Consecutive failures uyarısı
- P95 latency metriği
- i18n tam destek
- Error banner with retry

### ⚠️ Potansiyel Sorunlar
- **Auto-refresh hızı sabit** — Kullanıcı ayarlayamıyor
- **Tüm endpoint'ler tek liste** — Durum bazlı gruplama yok
- **Grafik yok** — Sağlık trendi gösterilmiyor
- **Bildirim yok** — Unhealthy olduğunda kullanıcı bilgilendirilmiyor
- **is_active filtresi yok** — Pasif endpoint'ler de gösteriliyor

### 🔴 Eksiklikler
- Sağlık trendi grafiği yok (son 24s/7g/30g)
- Endpoint bazlı detay sayfası yok (tıklanabilir)
- Sağlık durumu değişikliği geçmişi yok
- Alert entegrasyonu yok (unhealthy → otomatik alert)
- Uptime 24h gösterilmiyor (interface'de var ama UI'da yok)
- Export raporu yok
- Karşılaştırma (endpoint karşılaştırma) yok
