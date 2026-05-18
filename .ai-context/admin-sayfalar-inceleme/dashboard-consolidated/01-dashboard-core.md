# 📊 Dashboard Core — Kontrol Paneli, Endpoint'ler, Teslimatlar, Arama

> **Bölüm:** Dashboard Core  
> **İçerik:** Kontrol Paneli, Endpoint'ler, Teslimatlar, Arama  
> **İnceleme Tarihi:** 2026-05-12/13  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `01-kontrol-paneli.md`, `02-endpoints.md`, `03-teslimatlar.md`, `05-arama.md`

---

## 📑 İçindekiler

- [1. Kontrol Paneli (Dashboard Overview)](#1-kontrol-paneli-dashboard-overview)
- [2. Endpoint'ler](#2-endpointler)
- [3. Teslimatlar (Deliveries)](#3-teslimatlar-deliveries)
- [4. Arama (Search)](#4-arama-search)

---

## 1. Kontrol Paneli (Dashboard Overview)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/page.tsx`  
> Route: `/`

### Sayfa Yapısı

> ⚠️ **2026-05-13 Güncelleme:** Eski overview sayfası tamamen yeniden yazıldı. Aşağıdaki bilgiler güncel kodu yansıtmaktadır.

#### Bileşenler
| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| StatCard | `@/components/tremor/StatCard` | İstatistik kartları (4 adet) |
| ChartCard | `@/components/tremor/ChartCard` | Grafik kartı |
| AreaChart (LazyAreaChart) | `@/components/LazyCharts` | Teslimat trend grafiği |
| Link | `@/i18n/navigation` | Sayfa içi linkler |

> **Not:** OnboardingWizard, SetupChecklist, TimeRangeSelector, AnimatedCounter, SuccessRateDonut, ActivityFeed, RecentDeliveriesTable bileşenleri hâlâ mevcut ama bu sayfada **kullanılmıyor**.

#### Veri Akışı
1. `useAuth()` → token alınır
2. `statsApi.get(token)` → genel istatistikler
3. `analyticsApi.deliveryTrend(token, '7d')` → 7 günlük trend verisi
4. `webhooksApi.list(token, {page: 1})` → son teslimatlar (5 adet)
5. `endpointsApi.list(token)` → endpoint sayısı
6. Tüm istekler `Promise.allSettled` ile paralel gönderilir

#### İstatistik Kartları (4 adet)
1. **Total Deliveries** — `stats.total_deliveries` (mavi)
2. **Success Rate** — `stats.success_rate` (emerald/amber/red, %)
3. **Active Endpoints** — `endpointCount` (mor)
4. **Failed Deliveries** — `stats.failed` (kırmızı)

#### Grafik
- **Delivery Trends (7d)** — AreaChart (successful + failed), gradient fill
- ChartCard içinde, `ResponsiveContainer` ile responsive

#### Quick Stats Paneli
- Delivered, Pending, Failed, Endpoints sayıları
- Quick Actions linkleri: Manage Endpoints, View Deliveries, Open Playground, View Analytics

#### Recent Deliveries Tablosu
- Son 5 teslimat: ID (link), Event, Status (badge), Attempts, Time
- "View all →" linki `/deliveries` sayfasına yönlendirir
- Empty state: 📭 ikonu + Playground linki

#### Loading State
- Skeleton shimmer kartları (animate-pulse)
- useCallback + useEffect ile data loading

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- i18n kullanımı (dashboard, common namespace) — `defaultValue` fallback'leri ile
- Promise.allSettled ile hata toleranslı paralel istek
- StatCard renk dinamikası (success rate ≥95 → emerald, ≥80 → amber, else → red)
- Quick Actions linkleri ile hızlı navigasyon
- Empty state tasarımı (📭 ikonu + Playground CTA)
- Refresh butonu (manuel yenileme)
- Dark mode tam destek
- AreaChart gradient fill ile görsel kalite

#### ⚠️ Potansiyel Sorunlar
- **Refresh butonu** — i18n key yerine `tc('refresh', { defaultValue: 'Refresh' })` kullanılmış (defaultValue fallback)
- **recentDeliveries sadece ilk 5** — "View all" linki ile `/deliveries`'a yönlendirme var
- **TimeRange sabit '7d'** — Kullanıcı zaman aralığı seçemiyor
- **_error state yok** — Hata toast ile gösteriliyor ama sayfada error banner yok

#### 🔴 Eksiklikler
- Zaman aralığı seçici (24h/7d/30d) yok
- Grafik zoom/drill-down yok
- Polling/auto-refresh mekanizması yok
- Mobile responsive grid breakpoint'leri kontrol edilmeli

#### 🆕 Eklenecekler (Sektör Karşılaştırma)
- **MRR/ARR kartı** — Aylık/yıllık tekrarlayan gelir gösterimi
- **Uptime göstergesi** — Platform uptime yüzdesi (SLA takibi)
- **Feature flag durumu** — Aktif/pasif feature sayısı
- **Son deploy bilgisi** — Son deployment zamanı ve versiyon

---

## 2. Endpoint'ler

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`  
> Route: `/endpoints`

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
- Error state: error banner + retry butonu ✅

#### Erişilebilirlik
- ✅ `htmlFor/id` eşleştirmesi (endpoint-url, endpoint-desc)
- ✅ `aria-label` butonlarda (settingsTitle, deleteTitle)
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
- Error handling: `.catch((err) => setError(...))` ile hata yakalama ✅
- Error banner + retry butonu (boş liste durumunda) ✅
- Mounted cleanup pattern

#### ⚠️ Potansiyel Sorunlar
- **Retry butonunda catch boş** — Error banner'daki retry butonunda `.catch(() => {})` kullanılmış (hata yutuluyor, ama bu retry senaryosunda kabul edilebilir)
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

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`  
> Route: `/deliveries`  
> Detay Sayfası: `dashboard/src/app/[locale]/(dashboard)/deliveries/[id]/page.tsx`  
> Route Detay: `/deliveries/[id]`

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

#### Detay Sayfası (`/deliveries/[id]`)
- ✅ Bileşenlere ayrılmış yapı: DeliveryOverviewCards, DeliveryInfoPanel, RequestDetailsPanel, AttemptTimeline
- ✅ Replay butonu (ConfirmDialog ile onay) ✅
- ✅ Copy-to-clipboard desteği (timerRef + useRef cleanup) ✅
- ✅ attempts listesi (webhooksApi.getAttempts ile)
- ✅ Error state + retry + back to deliveries
- ✅ Back navigation butonu
- ✅ Loading skeleton

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
- Replay özelliği (detay sayfasında ConfirmDialog ile) ✅
- Attempts timeline (AttemptTimeline bileşeni)
- Keyboard accessible tablo satırları
- getErrorMessage kullanımı
- useCallback ile fetchData memoization
- Overflow-x-auto tablo
- setTimeout cleanup: useRef + useEffect cleanup pattern ✅

#### ⚠️ Potansiyel Sorunlar
- **Arama client-side** — search sadece mevcut sayfada filtreliyor, tüm veriyi kapsamıyor
- **Search + Pagination çelişisi** — Arama yapıldığında pagination gizleniyor ama veri sadece 20 kayıt
- **selected state unused** — Detay modalı var ama `selected` hiç set edilmiyor (satıra tıklama → router.push)
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

---

## 4. Arama (Search)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/search/page.tsx`  
> Route: `/search`

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
- **Sorun:** Son teslimatlar sadece ilk 5 kayıt. "View all" linki var ama pagination yok.
- **Adımlar:**
  1. "Tüm Teslimatları Gör" linki zaten mevcut → `/deliveries`
  2. Opsiyonel: Daha fazla kayıt gösterimi

#### P-03: Pagination Eksik — Endpoint'ler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** Tüm endpoint'ler tek seferde yükleniyor.
- **Adımlar:**
  1. `endpointsApi.list(token, { page, per_page: 20 })` kullan
  2. Sayfalama butonları ekle
  3. Loading skeleton göster

### 🔒 Güvenlik

#### G-01: Hardcoded Stringler — Arama
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/search/page.tsx`
- **Sorun:** "Search", "Search and filter...", "Searching...", "results" hardcoded.
- **Adımlar:**
  1. i18n key'leri ekle: `searchButton`, `searchSubtitle`, `searching`, `results`

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Endpoint Durumu Toggle Yok — Endpoint'ler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** Endpoint aktif/pasif yapılamıyor.
- **Adımlar:**
  1. Endpoint kartına toggle switch ekle
  2. `endpointsApi.update(token, id, { is_active: !current })` çağrısı
  3. Toggle değişiminde optimistic UI update

#### BF-02: Webhook Export Butonu Yok — Teslimatlar
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Backend:** `GET /v1/webhooks/export?status=...&format=csv|json` — teslimatları dışa aktarır
- **Sorun:** UI'da export butonu yok.
- **Adımlar:**
  1. Sayfa header'ına "Dışa Aktar" butonu ekle
  2. Format seçici: CSV / JSON dropdown
  3. Mevcut filtre durumunu export'a aktar
  4. Dosya indirme: `Blob` + `URL.createObjectURL` + `<a download>`
  5. i18n key: `exportDeliveries`, `exportCSV`, `exportJSON`, `exporting`

#### BF-03: Batch Replay UI Eksik — Teslimatlar
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/page.tsx`
- **Backend:** `webhooksApi.batchReplay` api.ts'de tanımlı ✅
- **Sorun:** UI'da toplu replay butonu yok.
- **Adımlar:**
  1. Tablo satırlarına checkbox ekle
  2. "Seçilenleri Tekrar Gönder" butonu (toplu işlem bar'ında)
  3. ConfirmDialog: "X teslimat tekrar gönderilecek"
  4. Progress göstergesi (başarı/hata sayısı)
  5. i18n key: `batchReplay`, `batchReplayConfirm`, `replayProgress`

#### BF-04: Secret Rotasyonu UI Eksik — Endpoint'ler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Backend:** `endpointsApi.rotateSecret` api.ts'de tanımlı ✅
- **Sorun:** UI'da secret rotasyon butonu yok.
- **Adımlar:**
  1. Endpoint kartına "Secret Yenile" butonu ekle
  2. ConfirmDialog: "Secret yenilenecek, eski secret geçersiz olacak"
  3. Yeni secret'ı göster (bir kez)
  4. i18n key: `rotateSecret`, `rotateSecretConfirm`, `newSecret`

### 🎨 Erişilebilirlik

#### E-01: aria-label Eksik Butonlar — Endpoint'ler
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Durum:** Silme butonunda `aria-label={t('deleteTitle')}` var ✅, ayar butonunda `aria-label={t('settingsTitle')}` var ✅
- **Sorun:** Bulk delete butonunda aria-label eksik olabilir.

### 🔴 Kod Kalitesi

#### KK-01: EmptyState Bileşeni Kullanılmıyor — Kontrol Paneli
- **Dosya:** `dashboard/src/components/EmptyState.tsx`
- **Sorun:** Boş durum gösterimi için bileşen tanımlı ama hiçbir sayfa import etmiyor.
- **Adımlar:**
  1. Boş liste durumlarında `EmptyState` bileşenini kullan
  2. Endpoints, alerts, transforms, schemas sayfalarına uygula
  3. i18n key: `noDataYet`, `emptyStateTitle`, `emptyStateDesc`

### ✅ Düzeltildi

#### ~~ML-01: deliveries/[id] — setTimeout Cleanup Yok~~
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/deliveries/[id]/page.tsx`
- **Durum:** ✅ DÜZELTİLDİ — `useRef` + `useEffect` cleanup pattern uygulandı
- `timerRef.current = setTimeout(...)` → `useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, [])`

#### ~~BF-01: Secret Rotasyonu api.ts'de Tanımlı Değil~~
- **Durum:** ✅ DÜZELTİLDİ — `endpointsApi.rotateSecret` api.ts'ye eklendi (satır 212)

#### ~~BF-04: Batch Replay api.ts'de Tanımlı Değil~~
- **Durum:** ✅ DÜZELTİLDİ — `webhooksApi.batchReplay` api.ts'ye eklendi (satır 241)
