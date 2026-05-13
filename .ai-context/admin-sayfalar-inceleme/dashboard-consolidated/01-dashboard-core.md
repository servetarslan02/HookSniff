# 📊 Dashboard Core — Kontrol Paneli, Endpoint'ler, Teslimatlar, Arama

> **Bölüm:** Dashboard Core  
> **İçerik:** Kontrol Paneli, Endpoint'ler, Teslimatlar, Arama  
> **İnceleme Tarihi:** 2026-05-12/13  
> **Kaynak Dosyalar:** `01-kontrol-paneli.md`, `02-endpoints.md`, `03-teslimatlar.md`, `05-arama.md`

---

## 📑 İçindekiler

- [1. Kontrol Paneli (Dashboard Overview)](#1-kontrol-paneli-dashboard-overview)
- [2. Endpoint'ler](#2-endpointler)
- [3. Teslimatlar (Deliveries)](#3-teslimatlar-deliveries)
- [4. Arama (Search)](#4-arama-search)

---

## 1. Kontrol Paneli (Dashboard Overview)

> Sayfa: `dashboard/src/app/[locale]/dashboard/page.tsx`  
> Route: `/dashboard`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| OnboardingWizard | `@/components/OnboardingWizard` | İlk giriş wizard'ı |
| SetupChecklist | `@/components/OnboardingWizard` | Kurulum kontrol listesi |
| StatCard | `@/components/tremor` | İstatistik kartları |
| TimeRangeSelector | `./components/TimeRangeSelector` | Zaman aralığı seçici |
| AnimatedCounter | `./components/AnimatedCounter` | Animasyonlu sayılar |
| DeliveryTrendChart | `./components/DeliveryTrendChart` | Teslimat trend grafiği |
| SuccessRateDonut | `./components/SuccessRateDonut` | Başarı oranı donut grafiği |
| ActivityFeed | `./components/ActivityFeed` | Son aktivite akışı |
| RecentDeliveriesTable | `./components/RecentDeliveriesTable` | Son teslimatlar tablosu |

#### Veri Akışı
1. `useAuth()` → token alınır
2. `statsApi.get(token)` → genel istatistikler
3. `webhooksApi.list(token, {page: 1})` → son teslimatlar (5 adet)
4. `analyticsApi.deliveryTrend(token, timeRange)` → trend verisi
5. `analyticsApi.successRate(token, timeRange)` → başarı oranı verisi

#### İstatistik Kartları (6 adet)
1. **Toplam Teslimat** — `stats.total_deliveries` (mavi)
2. **Teslim Edilen** — `stats.delivered` (yeşil)
3. **Başarısız** — `stats.failed` (kırmızı)
4. **Başarı Oranı** — `stats.success_rate` (mor, %)
5. **Bekleyen** — `stats.pending` (sarı)
6. **Endpoint Sayısı** — `stats.endpoints_count` (gri)

#### Zaman Aralığı Seçici
- `TimeRange` tipi ile filtreleme
- Değişiklikte otomatik analytics yenileme

#### Loading State
- 6 adet skeleton shimmer kart
- `mounted` flag ile cleanup kontrolü

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- i18n kullanımı (dashboard, common namespace)
- Skeleton loading state
- Cleanup (mounted flag)
- Error handling (try/catch + fallback)
- Time range ile dinamik grafik
- OnboardingWizard + SetupChecklist entegrasyonu

#### ⚠️ Potansiyel Sorunlar
- `_error` state tanımlanmış ama UI'da gösterilmiyor (sadece console)
- `recentDeliveries` sadece ilk 5 item — pagination yok
- Analytics catch bloğu boş (`// ignore`)
- Token null iken bileşenler render ediliyor (early return yok)
- `useEffect` dependency array'de `t` ve `tc` yok (stable reference)

#### 🔴 Eksiklikler
- Error toast/banner gösterimi yok
- Refresh/polling mekanizması yok (manuel yenileme gerekli)
- Empty state tasarımı yok (hiç veri yoksa)
- Grafik verisi yoksa placeholder mesajı eksik
- Mobile responsive grid breakpoint'leri kontrol edilmeli

#### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **MRR/ARR kartı** — Aylık/yıllık tekrarlayan gelir gösterimi
- **Uptime göstergesi** — Platform uptime yüzdesi (SLA takibi)
- **Feature flag durumu** — Aktif/pasif feature sayısı
- **Son deploy bilgisi** — Son deployment zamanı ve versiyon

---

## 2. Endpoint'ler

> Sayfa: `dashboard/src/app/[locale]/dashboard/endpoints/page.tsx`  
> Route: `/dashboard/endpoints`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| ConfirmDialog | `@/components/ConfirmDialog` | Silme onay dialogu |
| useToast | `@/components/Toast` | Bildirim toast'ı |
| useRouter | `@/i18n/navigation` | Next.js router |

#### Veri Akışı
1. `useAuth()` → token
2. `endpointsApi.list(token)` → endpoint listesi
3. `endpointsApi.create(token, {url, description})` → yeni endpoint
4. `endpointsApi.delete(token, id)` → endpoint silme

#### State Yönetimi
| State | Tip | Açıklama |
|-------|-----|----------|
| endpoints | Endpoint[] | Endpoint listesi |
| loading | boolean | İlk yükleme |
| showCreate | boolean | Form görünürlüğü |
| newUrl | string | Yeni endpoint URL |
| newDesc | string | Yeni endpoint açıklama |
| creating | boolean | Oluşturma işlemi |
| error | string | Hata mesajı |
| deleteId | string | Silinecek endpoint ID |
| selected | Set<string> | Seçili endpoint'ler |
| bulkDeleting | boolean | Toplu silme işlemi |

### Özellikler

#### CRUD İşlemleri
- ✅ **Listeleme** — Tüm endpoint'ler listelenir
- ✅ **Oluşturma** — URL + açıklama ile yeni endpoint
- ✅ **Silme** — Tekli silme (ConfirmDialog ile)
- ✅ **Toplu Silme** — Checkbox ile birden fazla seçme + toplu silme
- ❌ **Güncelleme** — Düzenleme formu yok (detay sayfasına yönlendirme var)

#### UI Özellikleri
- Skeleton loading (3 adet shimmer kart)
- Empty state (`noEndpointsYet` mesajı)
- Bulk actions bar (select all + delete selected)
- Status indicator (active/inactive yeşil/gri dot)
- Endpoint ID truncated gösterim (12 karakter)
- Hover-lift animasyonu
- Responsive grid layout
- i18n desteği (endpoints, common namespace)

#### Erişilebilirlik
- ✅ `htmlFor/id` eşleştirmesi (endpoint-url, endpoint-desc)
- ✅ `aria-label` butonlarda
- ✅ `type="button"` butonlarda
- ✅ Focus ring (brand-500)
- ✅ Dark mode desteği

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- ConfirmDialog ile silme onayı
- Toplu silme özelliği
- i18n tam destek
- Dark mode uyumlu
- Form validasyonu (url required)
- Error handling (try/catch + toast)
- Mounted cleanup pattern

#### ⚠️ Potansiyel Sorunlar
- **Catch bloğu boş** — `endpointsApi.list().catch(() => {})` → hata yutuluyor
- **Toplu silme seri** — `for...of` ile tek tek siliniyor, paralel yapılabilir
- **Düzenleme yok** — Sadece detay sayfasına yönlendirme, inline edit yok
- **Pagination yok** — Tüm endpoint'ler tek seferde yükleniyor
- **Search/filter yok** — Endpoint arama/filtreleme yok
- **Sıralama yok** — Endpoint sıralama seçeneği yok
- **Endpoint durumu toggle** — Aktif/pasif değiştirme butonu yok

#### 🔴 Eksiklikler
- Endpoint sayısı çoksa performans sorunu (pagination eksik)
- Toplu durum değiştirme (aktif/pasif) yok
- Endpoint kopyalama/duplike etme yok
- Endpoint etiketi/label sistemi yok
- Webhook başarı oranı endpoint kartında gösterilmiyor
- Son teslimat tarihi endpoint kartında yok

---

## 3. Teslimatlar (Deliveries)

> Sayfa: `dashboard/src/app/[locale]/dashboard/deliveries/page.tsx`  
> Route: `/dashboard/deliveries`  
> Detay Sayfası: `/dashboard/deliveries/[id]`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatusBadge | `@/components/StatusBadge` | Durum rozeti |
| ConfirmDialog | `@/components/ConfirmDialog` | Replay onay dialogu |
| DetailRow | İç bileşen | Detay satırı |
| useToast | `@/components/Toast` | Bildirim |

#### Veri Akışı
1. `webhooksApi.list(token, {page, status})` → teslimat listesi
2. `webhooksApi.replay(token, id)` → teslimat tekrarı

#### State Yönetimi
| State | Tip | Açıklama |
|-------|-----|----------|
| deliveries | Delivery[] | Teslimat listesi |
| total | number | Toplam kayıt sayısı |
| page | number | Mevcut sayfa |
| loading | boolean | Yükleme |
| error | string | Hata mesajı |
| filter | string | Durum filtresi (all/delivered/failed/pending) |
| search | string | Arama metni |
| selected | Delivery | Seçili teslimat (detay modalı) |
| replayTarget | Delivery | Tekrar gönderilecek teslimat |
| replaying | boolean | Tekrar işlemi |

### Özellikler

#### Liste Görünümü
- ✅ **Sayfalama** — 20 kayıt/sayfa, toplam sayısı ile
- ✅ **Durum Filtresi** — All / Delivered / Failed / Pending
- ✅ **Arama** — Event type ve ID ile arama (client-side)
- ✅ **Sıralama** — Yok (varsayılan created_at DESC varsayılıyor)
- ✅ **Tablo Kolonları:** ID, Event, Status, Attempts, Response, Time, Actions

#### Detay Modalı
- ✅ ID, Event, Endpoint, Status, Attempts, HTTP Status, Created
- ✅ Attempts Timeline (deneme sayısı kadar adım)
- ✅ Modal kapatma (✕ + backdrop click)
- ✅ max-h-[80dvh] overflow-y-auto

#### Replay İşlemi
- ✅ ConfirmDialog ile onay
- ✅ Toast ile başarı/hata mesajı
- ✅ Liste otomatik yenileme

#### Erişilebilirlik
- ✅ Tablo satırı `role="link"` + `tabIndex={0}`
- ✅ Keyboard navigation (Enter/Space)
- ✅ aria-label satırlarda
- ✅ aria-live pagination bilgisinde
- ✅ `aria-hidden="true"` backdrop
- ✅ Dark mode tam destek

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Server-side sayfalama (20 kayıt/sayfa)
- Durum filtresi ile API filtreleme
- Replay özelliği
- Attempts timeline
- Keyboard accessible tablo satırları
- getErrorMessage kullanımı
- useCallback ile fetchData memoization
- Overflow-x-auto tablo

#### ⚠️ Potansiyel Sorunlar
- **Arama client-side** — search sadece mevcut sayfada filtreliyor, tüm veriyi kapsamıyor
- **Search + Pagination çelişisi** — Arama yapıldığında pagination gizleniyor ama veri sadece 20 kayıt
- **selected state unused** — Detay modalı var ama `selected` hiç set edilmiyor (satıra tıklama → router.push)
- **Replay butonu yok** — `replayTarget` state var ama UI'da replay butonu bulunamadı
- **Sıralama yok** — Kullanıcı sıralama seçemiyor
- **Tarih formatı** — `toLocaleString()` locale-aware ama i18n key ile yapılabilir
- **"View Details" hardcoded** — i18n key yerine hardcoded İngilizce

#### 🔴 Eksiklikler
- Toplu replay yok
- Toplu durum filtreleme yok (sadece tek filtre)
- Export (CSV/JSON) yok
- Gerçek zamanlı güncelleme (WebSocket/polling) yok
- Tarih aralığı filtresi yok
- Endpoint bazlı filtreleme yok
- Event type bazlı filtreleme yok
- Teslimat detayında request/response body gösterimi yok (modalda)

---

## 4. Arama (Search)

> Sayfa: `dashboard/src/app/[locale]/dashboard/search/page.tsx`  
> Route: `/dashboard/search`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| StatusBadge | `@/components/StatusBadge` | Durum rozeti |
| apiFetch | `@/lib/api` | API istemcisi |

#### Veri Akışı
- `apiFetch<SearchResponse>(/search?q=...&status=...&page=...&per_page=20)` → arama sonuçları

#### State Yönetimi
| State | Tip | Açıklama |
|-------|-----|----------|
| query | string | Arama sorgusu |
| status | string | Durum filtresi |
| results | SearchResponse | Arama sonuçları |
| loading | boolean | Yükleme |
| error | string | Hata |
| page | number | Mevcut sayfa |

#### SearchResponse Interface
```typescript
interface SearchResult {
  id: string;
  event: string | null;
  status: string;
  attempt_count: number;
  response_status: number | null;
  created_at: string;
  endpoint_url: string;
}
```

### Özellikler

#### Arama
- ✅ **Debounce** — 300ms gecikme ile otomatik arama
- ✅ **Server-side arama** — API'ye q parametresi gönderiliyor
- ✅ **Durum filtresi** — All/Delivered/Failed/Pending select
- ✅ **Sayfalama** — 20 kayıt/sayfa
- ✅ **Form submit** — Enter ile arama

#### Tablo Kolonları
- ID (truncated 12 karakter)
- Event (tag görünümü)
- Status (StatusBadge)
- Endpoint URL (truncated, max-width 200px)
- Attempts + Response status
- Time

#### Erişilebilirlik
- ✅ Form submit (Enter)
- ✅ aria-label pagination butonlarında
- ✅ aria-live pagination bilgisinde
- ✅ Dark mode tam destek

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Server-side arama (API ile)
- Debounce (300ms)
- Status filtresi ile birleşik arama
- Pagination
- getErrorMessage yerine doğrudan error handling

#### ⚠️ Potansiyel Sorunlar
- **"Search" butonu hardcoded** — i18n key kullanılmamış
- **"Search and filter..." subtitle hardcoded** — i18n key kullanılmamış
- **"Searching..." loading text hardcoded** — i18n key kullanılmamış
- **"results" text hardcoded** — i18n key kullanılmamış
- **_error state unused** — tanımlanmış ama UI'da gösterilmiyor
- **Tablo header'ları kısmen hardcoded** — "ID" i18n değil
- **Tarih formatı** — toLocaleString() locale-aware ama i18n key ile yapılabilir

#### 🔴 Eksiklikler
- Tarih aralığı filtresi yok
- Endpoint bazlı filtreleme yok
- Event type bazlı filtreleme yok
- Export (CSV/JSON) yok
- Arama geçmişi (son aramalar) yok
- Gelişmiş filtre (attempt count, response status range) yok
- Bulk işlem yok
- Sonuç sıralama seçeneği yok

---

## 🔧 Yapılacaklar (2026-05-13)

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik (Tüm Sayfalar)
- **Etkilenen Dosyalar:**
  - `dashboard/src/app/[locale]/(dashboard)/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/search/page.tsx`
- **Sorun:** Birden fazla `useEffect` var ama AbortController yok. Kullanıcı sayfadan çıkınca API yanıtı gelirse state güncellenir.
- **Adımlar:**
  1. Her useEffect başında `const controller = new AbortController()` oluştur
  2. `apiFetch` çağrısına `{ signal: controller.signal }` ekle
  3. useEffect return'ünde `return () => controller.abort()` ekle
  4. Fetch callback'inde `if (!controller.signal.aborted)` kontrolü ekle

#### P-02: Pagination Eksik — Kontrol Paneli
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/page.tsx`
- **Sorun:** Son teslimatlar sadece ilk 5 kayıt. Tüm liste tek seferde yükleniyor.
- **Adımlar:**
  1. `webhooksApi.list(token, { page: 1 })` çağrısını pagination'lı yap
  2. "Tüm Teslimatları Gör" linki ekle → `/deliveries` sayfasına yönlendir

#### P-03: Pagination Eksik — Endpoint'ler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** Tüm endpoint'ler tek seferde yükleniyor.
- **Adımlar:**
  1. `endpointsApi.list(token, { page, per_page: 20 })` kullan
  2. Sayfalama butonları ekle
  3. Loading skeleton göster

### 🔒 Güvenlik

#### G-01: Error State UI'da Gösterilmiyor — Kontrol Paneli
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/page.tsx`
- **Sorun:** `_error` state tanımlanmış ama UI'da gösterilmiyor (sadece console).
- **Adımlar:**
  1. Error banner bileşeni ekle (kapatılabilir)
  2. `{error && <ErrorBanner message={error} onRetry={fetchData} />}` ekle
  3. i18n key: `dashboardError`, `dashboardErrorDesc`

#### G-02: "View Details" Hardcoded — Teslimatlar
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Sorun:** `View Details` metni i18n key kullanılmamış.
- **Adımlar:**
  1. i18n key ekle: `viewDetails`
  2. `t('viewDetails')` kullan

#### G-03: Hardcoded Stringler — Arama
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/search/page.tsx`
- **Sorun:** "Search", "Search and filter...", "Searching...", "results" hardcoded.
- **Adımlar:**
  1. i18n key'leri ekle: `searchButton`, `searchSubtitle`, `searching`, `results`

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Secret Rotasyonu UI Yok — Endpoint'ler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Backend:** `POST /v1/endpoints/{id}/rotate-secret` — endpoint secret'ını yeniler
- **Sorun:** api.ts'de `endpointsApi.rotateSecret` tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     rotateSecret: (token: string, id: string) =>
       apiFetch<{ secret: string }>(`/endpoints/${id}/rotate-secret`, { method: "POST", token }),
     ```
  2. Endpoint kartına "Secret Yenile" butonu ekle
  3. ConfirmDialog: "Secret yenilenecek, eski secret geçersiz olacak"
  4. Yeni secret'ı göster (bir kez)
  5. i18n key: `rotateSecret`, `rotateSecretConfirm`, `newSecret`

#### BF-02: Endpoint Durumu Toggle Yok — Endpoint'ler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** Endpoint aktif/pasif yapılamıyor.
- **Adımlar:**
  1. Endpoint kartına toggle switch ekle
  2. `endpointsApi.update(token, id, { is_active: !current })` çağrısı
  3. Toggle değişiminde optimistic UI update

#### BF-03: Webhook Export Butonu Yok — Teslimatlar
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Backend:** `GET /v1/webhooks/export?status=...&format=csv|json` — teslimatları dışa aktarır
- **Sorun:** api.ts'de `webhooksApi.export` tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     exportDeliveries: (token: string, params?: { status?: string; format?: string }) => {
       const qs = new URLSearchParams(params).toString();
       return apiFetch<string>(`/webhooks/export${qs ? `?${qs}` : ''}`, { token });
     },
     ```
  2. Sayfa header'ına "Dışa Aktar" butonu ekle
  3. Format seçici: CSV / JSON dropdown
  4. Mevcut filtre durumunu export'a aktar
  5. Dosya indirme: `Blob` + `URL.createObjectURL` + `<a download>`
  6. i18n key: `exportDeliveries`, `exportCSV`, `exportJSON`, `exporting`

#### BF-04: Batch Replay Butonu Yok — Teslimatlar
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Backend:** `POST /v1/webhooks/batch/replay` — toplu tekrar gönderme
- **Sorun:** api.ts'de `webhooksApi.batchReplay` tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     batchReplay: (token: string, deliveryIds: string[]) =>
       apiFetch<{ replayed: number }>('/webhooks/batch/replay', { method: 'POST', body: { delivery_ids: deliveryIds }, token }),
     ```
  2. Tablo satırlarına checkbox ekle
  3. "Seçilenleri Tekrar Gönder" butonu (toplu işlem bar'ında)
  4. ConfirmDialog: "X teslimat tekrar gönderilecek"
  5. Progress göstergesi (başarı/hata sayısı)
  6. i18n key: `batchReplay`, `batchReplayConfirm`, `replayProgress`

### 🎨 Erişilebilirlik

#### E-01: type="button" Eksik Butonlar — Kontrol Paneli
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/page.tsx`
- **Sorun:** Butonlarda `type="button"` yok. Form içinde yanlışlıkla submit olabilir.
- **Adımlar:**
  1. Tüm `<button` etiketlerine `type="button"` ekle (form submit butonları hariç)
  2. `aria-label` ekle (emoji-only butonlar için)

#### E-02: aria-label Eksik Butonlar — Endpoint'ler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** Emoji-only butonlarda aria-label yok.
- **Adımlar:**
  1. Her `<button`'a `aria-label={t('actionName')}` ekle
  2. Silme butonu: `aria-label={t('deleteEndpoint')}`
  3. Düzenleme butonu: `aria-label={t('editEndpoint')}`

### 🔴 Kod Kalitesi

#### KK-01: EmptyState Bileşeni Kullanılmıyor — Kontrol Paneli
- **Dosya:** `dashboard/src/components/EmptyState.tsx`
- **Sorun:** Boş durum gösterimi için bileşen tanımlı ama hiçbir sayfa import etmiyor.
- **Adımlar:**
  1. Boş liste durumlarında `EmptyState` bileşenini kullan
  2. Endpoints, alerts, transforms, schemas sayfalarına uygula
  3. i18n key: `noDataYet`, `emptyStateTitle`, `emptyStateDesc`

### 🔒 Memory Leak

#### ML-01: deliveries/[id] — setTimeout Cleanup Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/[id]/page.tsx`
- **Sorun:** `setTimeout` kullanılıyor ama `clearTimeout` yok.
- **Adımlar:**
  1. useEffect içinde timer oluştur
  2. Return'de `clearTimeout(timer)` ekle
