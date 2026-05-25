# 🔗 Endpoint'ler

> Sayfa: `dashboard/src/app/[locale]/dashboard/endpoints/page.tsx`
> Route: `/dashboard/endpoints`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı

### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| ConfirmDialog | `@/components/ConfirmDialog` | Silme onay dialogu |
| useToast | `@/components/Toast` | Bildirim toast'ı |
| useRouter | `@/i18n/navigation` | Next.js router |

### Veri Akışı
1. `useAuth()` → token
2. `endpointsApi.list(token)` → endpoint listesi
3. `endpointsApi.create(token, {url, description})` → yeni endpoint
4. `endpointsApi.delete(token, id)` → endpoint silme

### State Yönetimi
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

## Özellikler

### CRUD İşlemleri
- ✅ **Listeleme** — Tüm endpoint'ler listelenir
- ✅ **Oluşturma** — URL + açıklama ile yeni endpoint
- ✅ **Silme** — Tekli silme (ConfirmDialog ile)
- ✅ **Toplu Silme** — Checkbox ile birden fazla seçme + toplu silme
- ❌ **Güncelleme** — Düzenleme formu yok (detay sayfasına yönlendirme var)

### UI Özellikleri
- Skeleton loading (3 adet shimmer kart)
- Empty state (`noEndpointsYet` mesajı)
- Bulk actions bar (select all + delete selected)
- Status indicator (active/inactive yeşil/gri dot)
- Endpoint ID truncated gösterim (12 karakter)
- Hover-lift animasyonu
- Responsive grid layout
- i18n desteği (endpoints, common namespace)

### Erişilebilirlik
- ✅ `htmlFor/id` eşleştirmesi (endpoint-url, endpoint-desc)
- ✅ `aria-label` butonlarda
- ✅ `type="button"` butonlarda
- ✅ Focus ring (brand-500)
- ✅ Dark mode desteği

## Tespit Edilen Durumlar

### ✅ İyi Yönler
- ConfirmDialog ile silme onayı
- Toplu silme özelliği
- i18n tam destek
- Dark mode uyumlu
- Form validasyonu (url required)
- Error handling (try/catch + toast)
- Mounted cleanup pattern

### ⚠️ Potansiyel Sorunlar
- **Catch bloğu boş** — `endpointsApi.list().catch(() => {})` → hata yutuluyor
- **Toplu silme seri** — `for...of` ile tek tek siliniyor, paralel yapılabilir
- **Düzenleme yok** — Sadece detay sayfasına yönlendirme, inline edit yok
- **Pagination yok** — Tüm endpoint'ler tek seferde yükleniyor
- **Search/filter yok** — Endpoint arama/filtreleme yok
- **Sıralama yok** — Endpoint sıralama seçeneği yok
- **Endpoint durumu toggle** — Aktif/pasif değiştirme butonu yok

### 🔴 Eksiklikler
- Endpoint sayısı çoksa performans sorunu (pagination eksik)
- Toplu durum değiştirme (aktif/pasif) yok
- Endpoint kopyalama/duplike etme yok
- Endpoint etiketi/label sistemi yok
- Webhook başarı oranı endpoint kartında gösterilmiyor
- Son teslimat tarihi endpoint kartında yok

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Secret Rotasyonu UI Yok
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

#### BF-02: Endpoint Durumu Toggle Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** Endpoint aktif/pasif yapılamıyor.
- **Adımlar:**
  1. Endpoint kartına toggle switch ekle
  2. `endpointsApi.update(token, id, { is_active: !current })` çağrısı
  3. Toggle değişiminde optimistic UI update

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: Pagination Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** Tüm endpoint'ler tek seferde yükleniyor.
- **Adımlar:**
  1. `endpointsApi.list(token, { page, per_page: 20 })` kullan
  2. Sayfalama butonları ekle
  3. Loading skeleton göster

### 🎨 Erişilebilirlik

#### E-01: aria-label Eksik Butonlar
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- **Sorun:** Emoji-only butonlarda aria-label yok.
- **Adımlar:**
  1. Her `<button`'a `aria-label={t('actionName')}` ekle
  2. Silme butonu: `aria-label={t('deleteEndpoint')}`
  3. Düzenleme butonu: `aria-label={t('editEndpoint')}`
