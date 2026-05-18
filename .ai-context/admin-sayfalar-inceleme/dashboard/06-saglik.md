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

### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **Uptime monitoring** — Son 24h/7d/30d uptime yüzdesi
- **SLA hedefi** — Kullanıcı tanımlı SLA hedefi (%99.9, %99.99)
- **Uptime grafikleri** — Tarih bazlı uptime trend grafiği
- **Incident geçmişi** — Kesinti olaylarının kaydı
- **Endpoint gruplama** — Kategori bazlı sağlık durumu
- **Structured health checks** — Worker bazlı JSON sağlık durumu (Hookdeck ✅)
- **Deduplication stats** — Filtrelenen tekrarlayan event sayısı
- **Endpoint disable listesi** — Devre dışı endpoint'lerin listesi
- **Circuit breaker durumu** — Hangi endpoint'ler circuit breaker'da
- Sağlık trendi grafiği yok (son 24s/7g/30g)
- Endpoint bazlı detay sayfası yok (tıklanabilir)
- Sağlık durumu değişikliği geçmişi yok
- Alert entegrasyonu yok (unhealthy → otomatik alert)
- Uptime 24h gösterilmiyor (interface'de var ama UI'da yok)
- Export raporu yok
- Karşılaştırma (endpoint karşılaştırma) yok

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Circuit Breaker Durumu Gösterilmiyor
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/health/page.tsx`
- **Backend:** `api/src/circuit_breaker.rs` — `CircuitState::Closed | Open | HalfOpen`
- **Sorun:** Endpoint kartlarında circuit breaker durumu yok.
- **Adımlar:**
  1. Backend'den circuit breaker durumunu health response'a ekle
  2. Her endpoint kartına durum göstergesi ekle:
     - 🟢 Closed (normal)
     - 🔴 Open (devre açık, istekler reddediliyor)
     - 🟡 HalfOpen (test modu)
  3. Manuel reset butonu (Open durumunda)
  4. i18n key: `circuitClosed`, `circuitOpen`, `circuitHalfOpen`, `resetCircuit`

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/health/page.tsx`
- **Sorun:** 2 useEffect, 7 fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: Pagination Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/health/page.tsx`
- **Sorun:** Tüm endpoint'ler tek seferde yükleniyor.
- **Adımlar:**
  1. Backend pagination desteği varsa ekle
  2. Durum bazlı gruplama: Healthy / Degraded / Unhealthy sekmeleri
