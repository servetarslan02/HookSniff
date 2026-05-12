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
