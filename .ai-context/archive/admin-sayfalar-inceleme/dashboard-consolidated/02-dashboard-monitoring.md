# 📡 Monitoring — Loglar, Sağlık, Uyarılar, Analitik, Stream

> **Bölüm:** Monitoring  
> **İçerik:** Loglar, Sağlık, Uyarılar, Analitik, Stream  
> **İnceleme Tarihi:** 2026-05-12/13  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `04-loglar.md`, `06-saglik.md`, `07-uyarilar.md`, `10-analitik.md`, `32-stream.md`

---

## 📑 İçindekiler

- [1. Loglar (Logs)](#1-loglar-logs)
- [2. Sağlık (Health)](#2-saglik-health)
- [3. Uyarılar (Alerts)](#3-uyarilar-alerts)
- [4. Analitik (Analytics)](#4-analitik-analytics)
- [5. Stream (Real-time Events)](#5-stream-real-time-events)

---

## 1. Loglar (Logs)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/logs/page.tsx`  
> Route: `/logs`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatusBadge | `@/components/StatusBadge` | Durum rozeti |
| DetailRow | İç bileşen | Detay modalı satırı |

#### Veri Akışı
- `webhooksApi.list(token, {page, status})` → mevcut sayfa verisi
- **Paralel istekler:** Her durum için ayrı API çağrısı (delivered, failed, pending) → status counts

#### State Yönetimi
| State | Tip | Açıklama |
|-------|-----|----------|
| deliveries | Delivery[] | Teslimat listesi |
| total | number | Toplam kayıt |
| page | number | Mevcut sayfa |
| filter | StatusFilter | Durum filtresi |
| search | string | Arama |
| selected | Delivery | Seçili teslimat |
| autoRefresh | boolean | Otomatik yenileme |
| statusCounts | Record<StatusFilter, number> | Durum bazlı sayılar |

### Özellikler

#### Liste Görünümü
- ✅ **Server-side sayfalama** — 20 kayıt/sayfa
- ✅ **Durum filtresi** — All/Delivered/Failed/Pending (ikonlu)
- ✅ **Status counts** — Her filtre sekmesinde sayı gösterimi
- ✅ **Arama** — Event, ID, endpoint_id ile (client-side)
- ✅ **Auto-refresh** — 5 saniyede bir otomatik yenileme
- ✅ **Manual refresh** — ↻ Refresh butonu
- ✅ **Tablo kolonları:** ID, Event, Endpoint, Status, Attempts, Response, Time

#### Detay Modalı
- ✅ ID, Event, Endpoint, Status, Attempts, HTTP Response, Created
- ✅ Attempts Timeline (renk kodlu: yeşil/son başarılı, kırmızı/son başarısız, sarı/retry)
- ✅ Modal kapatma (✕ + backdrop + Close butonu)

#### Response Status Renk Kodları
- 🟢 2xx — Yeşil
- 🔵 3xx — Mavi
- 🟡 4xx — Sarı
- 🔴 5xx — Kırmızı

#### Erişilebilirlik
- ✅ aria-label pagination butonlarında
- ✅ aria-live pagination bilgisinde
- ✅ aria-hidden backdrop
- ✅ Dark mode tam destek

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Auto-refresh özelliği (5s interval)
- Status counts paralel API çağrısı ile
- Response status renk kodlaması (4 seviye)
- Attempts timeline renk kodlu
- getErrorMessage kullanımı
- useCallback + cleanup pattern

#### ⚠️ Potansiyel Sorunlar
- **4 paralel API çağrısı** — Her fetchData'da 4 istek yapılıyor (performans)
- **Arama client-side** — Sadece mevcut sayfada filtreliyor
- **"Loading logs..." hardcoded** — i18n key kullanılmamış
- **"Full delivery history..." subtitle hardcoded** — i18n key kullanılmamış
- **"Refresh" butonu hardcoded** — i18n key kullanılmamış
- **"Close" butonu hardcoded** — i18n key kullanılmamış
- **Tüm tablo header'ları hardcoded** — "ID", "Event", "Endpoint", "Status", "Attempts", "Response", "Time" i18n değil
- **Attempts Timeline header hardcoded** — i18n değil

#### 🔴 Eksiklikler
- Endpoint bazlı filtreleme yok
- Event type bazlı filtreleme yok
- Tarih aralığı filtresi yok
- Export (CSV/JSON) yok
- Teslimat replay butonu yok (deliveries sayfasında var)
- Toplu işlem yok
- Request/response body gösterimi yok
- Auto-refresh hızı ayarlanamıyor

---

## 2. Sağlık (Health)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/health/page.tsx`  
> Route: `/health`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| apiFetch | `@/lib/api` | API istemcisi |

#### Veri Akışı
- `apiFetch<EndpointHealth[]>(/endpoint-health)` → endpoint sağlık verisi

#### EndpointHealth Interface
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

### Özellikler

#### Sağlık Durumu
- ✅ **3 durum kartı** — Healthy / Degraded / Unhealthy (sayılarla)
- ✅ **Otomatik yenileme** — 30 saniyede bir
- ✅ **Progress bar** — Başarı oranı yüzde olarak
- ✅ **Consecutive failures** — Ardışık hata uyarısı
- ✅ **Son hata zamanı** — last_failure_at gösterimi

#### Endpoint Detayları
- ✅ URL + açıklama
- ✅ Durum rozeti (renk kodlu)
- ✅ Başarı oranı (büyük font)
- ✅ 5 istatistik: Total, Successful, Failed, Avg Latency, P95 Latency
- ✅ Progress bar (success_rate)
- ✅ Consecutive failures uyarısı

#### Erişilebilirlik
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek
- ✅ Renk + metin kombinasyonu (sadece renk değil)

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- 30 saniyelik auto-refresh
- Üç durumlu sağlık kartları
- Progress bar ile görsel gösterim
- Consecutive failures uyarısı
- P95 latency metriği
- i18n tam destek
- Error banner with retry

#### ⚠️ Potansiyel Sorunlar
- **Auto-refresh hızı sabit** — Kullanıcı ayarlayamıyor
- **Tüm endpoint'ler tek liste** — Durum bazlı gruplama yok
- **Grafik yok** — Sağlık trendi gösterilmiyor
- **Bildirim yok** — Unhealthy olduğunda kullanıcı bilgilendirilmiyor
- **is_active filtresi yok** — Pasif endpoint'ler de gösteriliyor

#### 🔴 Eksiklikler

#### 🆕 Eklenecekler (Sektör Karşılaştırma)
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

## 3. Uyarılar (Alerts)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`  
> Route: `/alerts`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| ConfirmDialog | `@/components/ConfirmDialog` | Silme onay dialogu |
| useToast | `@/components/Toast` | Bildirim |
| alertsApi | `@/lib/api` | Alert API |

#### Veri Akışı
- `alertsApi.list(token)` → alert listesi
- `alertsApi.create(token, form)` → yeni alert
- `alertsApi.delete(token, id)` → alert silme
- `alertsApi.test(token, id)` → test mesajı gönderme

#### Alert Koşulları
| Koşul | Açıklama |
|-------|----------|
| failure_rate | Başarısızlık oranı > threshold (%) |
| latency | Ortalama gecikme > threshold (ms) |
| consecutive_failures | Ardışık hata sayısı > threshold |

#### Bildirim Kanalları
| Kanal | İkon |
|-------|------|
| slack | 💬 |
| email | 📧 |
| webhook | 🔗 |

### Özellikler

#### CRUD İşlemleri
- ✅ **Listeleme** — Tüm alert kuralları
- ✅ **Oluşturma** — Ad, koşul, eşik, kanallar
- ✅ **Silme** — ConfirmDialog ile
- ✅ **Test** — Test mesajı gönderme

#### Form
- ✅ Alert adı
- ✅ Koşul seçimi (failure_rate/latency/consecutive_failures)
- ✅ Eşik değeri (number input)
- ✅ Bildirim kanalları (çoklu seçim: slack/email/webhook)

#### Erişilebilirlik
- ✅ htmlFor/id eşleştirmesi (alert-name, alert-condition, alert-threshold)
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Test butonu (alert test gönderme)
- Koşul bazlı eşik gösterimi (% veya ms)
- Kanal ikonları
- Active/paused durumu
- ConfirmDialog ile silme
- i18n tam destek

#### ⚠️ Potansiyel Sorunlar
- **Endpoint filtresi yok** — Alert tüm endpoint'ler için geçerli
- **Alert düzenleme yok** — Sadece oluşturma ve silme
- **Pause/resume yok** — Active/pasif değiştirme butonu yok
- **Alert geçmişi yok** — Ne zaman tetiklendi bilgisi yok
- **Threshold validasyonu yok** — Negatif değer girilebilir

#### 🔴 Eksiklikler

#### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **Admin bazlı alert yönetimi** — Tüm müşterilerin alert'lerini görme
- **Global alert kuralları** — Platform genelinde alert tanımlama
- **Alert şablonları** — Önceden tanımlı alert şablonları
- **PagerDuty/OpsGenie entegrasyonu** — Enterprise alert kanalları
- **Alert history** — Geçmiş alert olaylarının kaydı
- **Escalation policy** — Alert yükseltme politikası
- **Microsoft Teams entegrasyonu** — Teams kanallarına bildirim (Hookdeck ✅)
- **Discord entegrasyonu** — Discord kanallarına bildirim
- **Endpoint disable alert** — Endpoint devre dışı kalınca otomatik bildirim (Svix ✅)
- **SSRF/Spoofing alert** — Güvenlik olaylarında otomatik alert
- **Quick filter** — Alert listesinde tek tıkla filtre (Hookdeck ✅)
- Alert düzenleme (update) endpoint'i
- Alert pause/resume toggle
- Alert tetiklenme geçmişi/log'u
- Endpoint bazlı alert
- Koşul bazlı önerilen eşikler
- Alert kopyalama
- Toplu alert yönetimi
- Webhook URL doğrulama (webhook kanalı için)

### Backend & Frontend Uyumsuzluğu

#### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Alert düzenleme | `PUT /v1/alerts/{id}` (update_alert) | ❌ Düzenleme butonu yok | api.ts'de `alertsApi.update` tanımlı ✅, UI butonu EKLENMELİ |
| Alert pause/resume | — (backend'de toggle endpoint'i yok) | ❌ Toggle yok | Backend'e eklenmeli |
| Alert tetiklenme geçmişi | — (backend'de history endpoint'i yok) | ❌ Liste yok | Backend'e eklenmeli |

---

## 4. Analitik (Analytics)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/analytics/page.tsx`  
> Route: `/analytics`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| AreaChart | LazyCharts | Teslimat trendi grafiği |
| PieChart | LazyCharts | Başarı oranı donut grafiği |
| ChartCard | tremor | Grafik kartı |
| StatCard | tremor | İstatistik kartı |

#### Veri Akışı
- `analyticsApi.deliveryTrend(token, timeRange)` → trend verisi
- `analyticsApi.successRate(token, timeRange)` → başarı oranı verisi

#### Grafikler
1. **Delivery Trend** — Area chart (successful + failed)
2. **Success Rate** — Donut pie chart (successful/failed/pending)

### Özellikler

#### Zaman Aralığı
- ✅ 24h / 7d / 30d seçici
- ✅ ChartCard entegre time range selector

#### İstatistik Kartları (3 adet)
1. **Success Rate** — % (emerald)
2. **Total Delivered** — Sayı (blue)
3. **Total Failed** — Sayı (red)

#### Grafikler
- ✅ **Area Chart** — Gradient fill, grid, tooltip, legend
- ✅ **Donut Chart** — Center label ile success rate
- ✅ **Responsive** — ResponsiveContainer

#### Erişilebilirlik
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Lazy loading grafikler (LazyCharts)
- Gradient fill area chart
- Donut chart center label
- StatCard entegrasyonu
- Paralel API çağrısı (Promise.all)
- i18n tam destek

#### ⚠️ Potansiyel Sorunlar
- **Endpoint bazlı filtreleme yok** — Tüm endpoint'ler için
- **Event type bazlı filtreleme yok**
- **Export yok** — Veri dışa aktarma
- **Grafik zoom/drill-down yok**

#### 🔴 Eksiklikler

#### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **MRR/ARR grafiği** — Aylık/yıllık tekrarlayan gelir trendi
- **ARPU** — Kullanıcı başına ortalama gelir
- **LTV** — Müşteri yaşam boyu değeri
- **Churn rate grafiği** — Tarih bazlı churn trendi
- **Cohort analizi** — Müşteri cohort karşılaştırması
- **Gelir projeksiyonu** — Gelecek dönem gelir tahmini
- **Deduplication metrics** — Filtrelenen event sayısı ve oranı
- **Standard Webhooks adoption** — Uyumluluk oranı
- **Quick filter** — Grafiklerde tek tıkla filtre (Hookdeck ✅)
- **Metrik export** — New Relic/Datadog/Grafana'ya export (Hookdeck ✅)
- Endpoint bazlı analitik
- Event type bazlı analitik
- Tarih aralığı özel seçici (custom range)
- Veri export (CSV/PNG)
- Grafik zoom/drill-down
- Karşılaştırma (önceki dönem)
- Heatmap (saat/gün bazlı)
- Latency dağılım grafiği

---

## 5. Stream (Real-time Events)

> Sayfa: ❌ OLUŞTURULMALI  
> Route: `/stream`  
> Backend: `api/src/routes/stream.rs` — SSE mevcut

### Backend Durumu

#### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| GET | `/v1/stream` | SSE (Server-Sent Events) bağlantısı |

### Frontend Yapılacaklar

#### Sayfa Yapısı
1. **Bağlantı Durumu** — SSE bağlantı göstergesi (bağlı/bağlanıyor/koptu)
2. **Event Akışı** — Canlı event listesi (yeni üstte)
3. **Filtre** — Event type, endpoint, durum filtresi
4. **Duraklat/Devam** — Akışı durdurma butonu
5. **Temizle** — Event listesini temizleme

#### Teknik Detay
- `EventSource` API ile SSE bağlantısı
- Auto-reconnect (bağlantı koparsa)
- Max 100 event gösterimi (performans)

#### Sidebar Ekleme
```typescript
// sections.tools.items'a ekle:
{ name: t('stream'), href: '/stream', icon: '📡' }
```

#### i18n Anahtarları (EN + TR)
- stream, streamDesc, connected, disconnected, reconnecting, pause, resume, clear
- noEventsYet, eventType, endpoint, status, timestamp

#### Öncelik: 🟢 ORTA — Gelişmiş kullanıcılar için gerçek zamanlı izleme

---

## 🔧 Yapılacaklar (2026-05-13)

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik (Tüm Sayfalar)
- **Etkilenen Dosyalar:**
  - `dashboard/src/app/[locale]/(dashboard)/logs/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/health/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/analytics/page.tsx`
- **Sorun:** Birden fazla `useEffect`, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-dashboard-core P-01)

#### P-02: 4 Paralel API Çağrısı — Gereksiz (Logs)
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/logs/page.tsx`
- **Sorun:** Her fetchData'da 4 ayrı API çağrısı (1 liste + 3 status count).
- **Adımlar:**
  1. Backend'de status count'ları ana response'a ekle (tek istek)
  2. Veya: Status count'ları lazy load et (sekme tıklandığında)

#### P-03: Pagination Eksik (Sağlık, Uyarılar, Analitik)
- **Etkilenen Dosyalar:**
  - `dashboard/src/app/[locale]/(dashboard)/health/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/analytics/page.tsx`
- **Sorun:** Tüm veri tek seferde yükleniyor.
- **Adımlar:**
  1. Backend pagination desteği varsa ekle
  2. Durum bazlı gruplama: Healthy / Degraded / Unhealthy sekmeleri (Sağlık)
  3. "Daha Fazla Yükle" butonu ekle (Uyarılar)
  4. Lazy loading: Grafik viewport'a girdiğinde yükle (Analitik)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Alert Düzenleme Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
- **Backend:** `PUT /v1/alerts/{id}` — alert güncelleme
- **Durum:** `alertsApi.update` api.ts'de tanımlı ✅, düzenleme butonu UI'da yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     update: (token: string, id: string, data: Partial<CreateAlertRequest>) =>
       apiFetch<Alert>(`/alerts/${id}`, { method: 'PUT', body: data, token }),
     ```
  2. Her alert kartına "Düzenle" butonu ekle
  3. Mevcut değerlerle form (name, condition, threshold, channels)
  4. `alertsApi.update(token, id, formData)` çağrısı
  5. i18n key: `editAlert`, `updateAlert`

#### BF-02: Alert Pause/Resume Toggle Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/alerts/page.tsx`
- **Sorun:** Alert aktif/pasif yapılamıyor.
- **Adımlar:**
  1. Her alert kartına toggle switch ekle
  2. `alertsApi.update(token, id, { is_active: !current })` çağrısı
  3. Toggle değişiminde optimistic UI update

#### BF-03: Circuit Breaker Durumu Gösterilmiyor (Sağlık)
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

#### BF-04: Latency Trend Grafiği Yok (Analitik)
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/analytics/page.tsx`
- **Backend:** `GET /v1/analytics/latency` — gecikme trendi verisi
- **Sorun:** `analyticsApi.latencyTrend` api.ts'de tanımlı ama hiçbir sayfa çağırmıyor.
- **Adımlar:**
  1. `analyticsApi.latencyTrend(token, timeRange)` çağrısını ekle
  2. Yeni grafik bileşeni: AreaChart (P50, P95, P99 gecikme)
  3. i18n key: `latencyTrend`, `p50`, `p95`, `p99`

### 🔒 Güvenlik

#### G-01: Hardcoded Stringler (Logs)
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/logs/page.tsx`
- **Sorun:** "Loading logs...", "Full delivery history...", "Refresh", "Close", tablo header'ları hardcoded.
- **Adımlar:**
  1. i18n key'leri ekle: `loadingLogs`, `logsSubtitle`, `refresh`, `close`
  2. Tablo header'ları: `thId`, `thEvent`, `thEndpoint`, `thStatus`, `thAttempts`, `thResponse`, `thTime`

### 🔴 Kod Kalitesi

#### KK-01: useDeliveryStream Hook Kullanılmıyor (Logs)
- **Dosya:** `dashboard/src/hooks/useDeliveryStream.ts`
- **Sorun:** Real-time SSE delivery stream hook'u tanımlı ve test ediliyor ama hiçbir sayfa kullanmıyor.
- **Adımlar:**
  1. Logs veya Deliveries sayfasına entegre et
  2. Auto-refresh yerine SSE ile gerçek zamanlı güncelleme
  3. Bağlantı durumu göstergesi (bağlı/bağlanıyor/koptu)

### 🔴 Backend-Frontend Uyumsuzluğu (Uyarılar — Yapılacaklar)

#### BF-U01: Alert Düzenleme
- Backend: `PUT /v1/alerts/{id}` zaten var ✅
- api.ts'de `alertsApi.update` tanımlı ✅
- Frontend: Her alert kartında "Düzenle" butonu → mevcut değerlerle form
- Form: name, condition, threshold, channels (mevcut değerlerle dolu)

#### BF-U02: Alert Pause/Resume
- Backend: `PUT /v1/alerts/{id}` ile `is_active` toggle (zaten destekliyor)
- Frontend: Her alert kartında toggle switch (aktif/pasif)

#### BF-U03: Alert Tetiklenme Geçmişi
- Backend: `GET /v1/alerts/{id}/history` endpoint'i eklenmeli
- Frontend: "Geçmiş" butonu → modal: tetiklenme listesi (tarih, değer, kanal)

#### BF-U04: Alert Kopyalama
- Frontend: "Kopyala" butonu → yeni alert formu (mevcut değerlerle)

#### BF-U05: Endpoint Bazlı Alert
- Frontend: Form'a endpoint seçici ekle (opsiyonel)
