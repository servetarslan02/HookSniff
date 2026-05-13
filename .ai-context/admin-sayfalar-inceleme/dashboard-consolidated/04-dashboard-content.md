# 📐 İçerik Yönetimi — Dönüştürmeler, Gelen, Şemalar, Şablonlar

> **Bölüm:** İçerik Yönetimi  
> **İçerik:** Dönüştürmeler, Gelen, Şemalar, Şablonlar  
> **İnceleme Tarihi:** 2026-05-12  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `11-donusturmeler.md`, `12-gelen.md`, `16-semalar.md`, `17-sablonlar.md`

---

## 📑 İçindekiler

- [1. Dönüştürmeler (Transforms)](#1-donusturmeler-transforms)
- [2. Gelen (Inbound)](#2-gelen-inbound)
- [3. Şemalar (Schemas)](#3-semalar-schemas)
- [4. Şablonlar (Templates)](#4-sablonlar-templates)

---

## 1. Dönüştürmeler (Transforms)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`  
> Route: `/transforms`

### Sayfa Yapısı

#### Bileşenler
| Bileşen | Kaynak | Açıklama |
|---------|--------|----------|
| ConfirmDialog | `@/components/ConfirmDialog` | Silme onay |
| useToast | `@/components/Toast` | Bildirim |

#### Veri Akışı
- `endpointsApi.list(token)` → endpoint listesi
- `transformsApi.list(token, endpointId)` → transform kuralları
- `transformsApi.create(token, endpointId, {rule})` → kural oluşturma
- `transformsApi.delete(token, endpointId, ruleId)` → kural silme

#### Transform Rule Tipleri
| Tip | Açıklama |
|-----|----------|
| filter.include | Sadece belirli alanları dahil et |
| filter.exclude | Belirli alanları hariç tut |
| mappings | Alan adı dönüştürme (source → target) |
| enrich | Yeni alan ekleme (key-value) |

### Özellikler

#### Endpoint Seçimi
- ✅ Select ile endpoint seçimi
- ✅ Endpoint değişince kurallar otomatik yüklenir

#### Kural Oluşturma
- ✅ Filter (include/exclude) — virgülle ayrılmış
- ✅ Mapping (source → target)
- ✅ Enrich (key → value)
- ✅ Tümü opsiyonel (bir veya birden fazla kombinasyon)

#### Kural Görüntüleme
- ✅ Renk kodlu tag'ler (mavi=filter, mor=map, yeşil=enrich)
- ✅ Kod görünümü (font-mono)
- ✅ Silme butonu (ConfirmDialog ile)

#### Erişilebilirlik
- ✅ htmlFor/id eşleştirmesi (7 input)
- ✅ aria-label silme butonunda
- ✅ i18n tüm metinlerde

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Endpoint bazlı transform kuralları
- Renk kodlu tag sistemi
- 3 farklı transform tipi (filter, map, enrich)
- Form temizleme sonrası
- Bileşen yapısı basit ve anlaşılır

#### ⚠️ Potansiyel Sorunlar
- **Kural düzenleme yok** — Sadece oluşturma ve silme
- **Sıralama yok** — Kuralların çalışma sırası belirlenemiyor
- **Önizleme yok** — Kuralın etkisi gösterilmiyor
- **Test yok** — Kural test edilemiyor
- **Kural kopyalama yok**

#### 🔴 Eksiklikler
- Kural düzenleme (update)
- Kural sıralama (drag-drop veya up/down)
- Transform önizleme (örnek veri ile)
- Kural test etme
- Toplu kural yönetimi
- Kural şablonları

### Backend & Frontend Uyumsuzluğu

#### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Transform düzenleme | — (backend'de update endpoint'i yok) | ❌ Form yok | Backend'e eklenmeli |
| Transform sıralama | — (backend'de reorder endpoint'i yok) | ❌ Sürükleme yok | Backend'e eklenmeli |
| Transform test | — (backend'de test endpoint'i yok) | ❌ Buton yok | Backend'e eklenmeli |

---

## 2. Gelen (Inbound)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`  
> Route: `/inbound`

### Sayfa Yapısı

#### Provider Listesi
| Provider | İkon | Docs |
|----------|------|------|
| Stripe | 💳 | stripe.com/docs/webhooks |
| GitHub | 🐙 | docs.github.com/en/webhooks |
| Shopify | 🛒 | shopify.dev/docs |
| Generic | 🔗 | - |

#### Veri Akışı
- `endpointsApi.list(token)` → endpoint listesi
- `inboundApi.listConfigs(token)` → inbound konfigürasyonları
- `inboundApi.create(token, {provider, endpoint_id, secret})` → yeni konfigürasyon

### Özellikler
- ✅ Provider seçimi (Stripe, GitHub, Shopify, Generic)
- ✅ Endpoint atama
- ✅ Webhook secret girişi
- ✅ "How it works" açıklaması
- ✅ Konfigürasyon listesi
- ✅ i18n desteği

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **API_BASE hardcoded** — `process.env.NEXT_PUBLIC_API_URL` fallback ile
- **"📨" emoji hardcoded** — i18n key yerine doğrudan emoji
- **Provider docs linkleri hardcoded** — i18n değil

#### 🔴 Eksiklikler
- Konfigürasyon düzenleme yok
- Konfigürasyon silme yok
- Webhook test butonu yok
- Provider bazlı rehber yok
- Entegrasyon durumu gösterimi yok

### Backend & Frontend Uyumsuzluğu

#### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Konfigürasyon silme | — (backend'de delete endpoint'i yok) | ❌ Buton yok | Backend'e eklenmeli |
| Konfigürasyon düzenleme | — (backend'de update endpoint'i yok) | ❌ Form yok | Backend'e eklenmeli |
| Webhook test | — (backend'de test endpoint'i yok) | ❌ Buton yok | Backend'e eklenmeli |

---

## 3. Şemalar (Schemas)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`  
> Route: `/schemas`

### Sayfa Yapısı
- Schema listesi (expandable)
- JSON Schema özellikleri: enum, format, oneOf, anyOf, allOf
- Expand/collapse toggle

#### Schema Interface
```typescript
interface Schema {
  id: string;
  name: string;
  version: string;
  created_at: string;
  schema?: Record<string, unknown>;
}
```

### Özellikler
- ✅ **Schema Listesi** — Tüm şemalar
- ✅ **Expand/Collapse** — Detay gösterimi
- ✅ **Schema Features** — enum, format, oneOf, anyOf, allOf tag'leri
- ✅ **Keyboard Navigation** — Enter/Space ile toggle

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **Schema oluşturma yok** — Sadece listeleme
- **Schema düzenleme yok**
- **Schema silme yok**
- **Schema doğrulama yok** — JSON Schema validation

#### 🔴 Eksiklikler
- Schema oluşturma/düzenleme formu
- Schema silme onayı
- Schema ile event eşleştirmesi
- Schema versioning geçmişi
- Schema test/validasyon aracı

### Backend & Frontend Uyumsuzluğu

#### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Schema oluşturma | `POST /v1/schemas` (register_schema) | ❌ Form yok | EKLENMELİ |
| Schema silme | — (backend'de delete endpoint'i yok) | ❌ | Backend'e eklenmeli |
| Event doğrulama | `POST /v1/schemas/{id}/validate` | ❌ Buton/form yok | EKLENMELİ |

---

## 4. Şablonlar (Templates)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/templates/page.tsx`  
> Route: `/templates`

### Sayfa Yapısı
- Template listesi (grid görünümü)
- Template interface: id, name, description, tags

### Özellikler
- ✅ Template listeleme (grid)
- ✅ Tag gösterimi
- ✅ Empty state
- ✅ Loading state
- ✅ i18n desteği
- ✅ Error handling: `.catch((err) => setError(...))` ile hata yakalama
- ✅ Error banner + retry butonu

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Template listeleme (grid)
- Tag gösterimi
- Empty state + error state
- i18n desteği
- Error handling düzeltildi: `.catch((err) => setError(...))` + error banner + retry ✅

#### ⚠️ Potansiyel Sorunlar
- **Template detay sayfası yok** — Sadece listeleme
- **Template kullanma butonu yok** — Sadece kart gösterimi

#### 🔴 Eksiklikler
- Template oluşturma formu
- Template düzenleme
- Template silme
- Template ile webhook oluşturma
- Template arama/filtreleme
- Template kategorileri

### Backend & Frontend Uyumsuzluğu

#### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Template uygulama | `POST /v1/templates/{id}/apply` (apply_template) | ❌ "Kullan" butonu yok | EKLENMELİ |
| Template detay | `GET /v1/templates/{id}` (get_template) | ❌ Detay sayfası yok | EKLENMELİ |

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Transform Düzenleme Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`
- **Backend:** — (backend'de update endpoint'i yok)
- **Sorun:** Sadece oluşturma ve silme var, düzenleme yok.
- **Adımlar:**
  1. Backend'e `PUT /v1/endpoints/{endpoint_id}/transforms/{id}` ekle (Rust)
  2. `api.ts`'ye `transformsApi.update` ekle
  3. Her transform kartına "Düzenle" butonu ekle
  4. Mevcut değerlerle form

#### BF-02: Transform Sıralama Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`
- **Backend:** — (backend'de reorder endpoint'i yok)
- **Sorun:** Kuralların çalışma sırası belirlenemiyor.
- **Adımlar:**
  1. Backend'e `PUT /v1/endpoints/{endpoint_id}/transforms/reorder` ekle
  2. Sürükle-bırak (react-beautiful-dnd) veya yukarı/aşağı butonları
  3. Sıra numarası gösterimi

#### BF-03: Konfigürasyon Silme Yok — Gelen
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`
- **Backend:** — (backend'de delete endpoint'i yok)
- **Sorun:** Oluşturulan konfigürasyon silinemiyor.
- **Adımlar:**
  1. Backend'e `DELETE /v1/inbound/configs/{id}` ekle (Rust)
  2. `api.ts`'ye `inboundApi.deleteConfig` ekle
  3. Her konfigürasyon kartına silme butonu + ConfirmDialog

#### BF-04: Konfigürasyon Düzenleme Yok — Gelen
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`
- **Backend:** — (backend'de update endpoint'i yok)
- **Sorun:** Secret veya endpoint değiştirilemiyor.
- **Adımlar:**
  1. Backend'e `PUT /v1/inbound/configs/{id}` ekle
  2. "Düzenle" butonu + form (endpoint select, secret input)

#### BF-05: Schema Oluşturma Formu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`
- **Backend:** `POST /v1/schemas` — schema oluşturma
- **Sorun:** Sadece listeleme var, oluşturma formu yok.
- **Adımlar:**
  1. "Yeni Schema" butonu ekle
  2. Modal form: name (input), version (input), schema (JSON textarea)
  3. `apiFetch('/schemas', { method: 'POST', body: { name, version, schema }, token })` çağrısı
  4. Başarı sonrası listeyi yenile
  5. i18n key: `createSchema`, `schemaName`, `schemaVersion`, `schemaBody`

#### BF-06: Schema Doğrulama Aracı Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`
- **Backend:** `POST /v1/schemas/{id}/validate` — event doğrulama
- **Sorun:** api.ts'de tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     validateEvent: (token: string, schemaId: string, event: unknown) =>
       apiFetch<{ valid: boolean; errors?: string[] }>(`/schemas/${schemaId}/validate`, { method: 'POST', body: event, token }),
     ```
  2. Her schema kartına "Doğrula" butonu ekle
  3. Modal: Event payload textarea + "Doğrula" butonu + sonuç gösterimi
  4. i18n key: `validateEvent`, `validEvent`, `invalidEvent`, `validationErrors`

#### BF-07: "Kullan" Butonu Yok — Şablonlar
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/templates/page.tsx`
- **Backend:** `POST /v1/templates/{id}/apply` — template uygulama
- **Sorun:** api.ts'de tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     applyTemplate: (token: string, templateId: string, endpointId: string) =>
       apiFetch(`/templates/${templateId}/apply`, { method: 'POST', body: { endpoint_id: endpointId }, token }),
     ```
  2. Her template kartına "Kullan" butonu ekle
  3. Modal: Endpoint seçici (dropdown) + "Uygula" butonu
  4. Başarı toast mesajı
  5. i18n key: `applyTemplate`, `selectEndpoint`, `templateApplied`

#### BF-08: Webhook Test — Gelen
- **Backend:** `POST /v1/inbound/{provider}/test` endpoint'i eklenmeli
- **Frontend:** "Test Et" butonu → örnek payload gönder → sonuç gösterimi

#### BF-09: Entegrasyon Durumu — Gelen
- **Frontend:** Her provider kartında bağlantı durumu göstergesi (bağlı/bağlı değil)

### Backend & Frontend Uyumsuzluğu — Dönüştürmeler Yapılacaklar

#### BF-D01: Transform Düzenleme
- Backend: `PUT /v1/endpoints/{endpoint_id}/transforms/{id}` endpoint'i eklenmeli
- Frontend: "Düzenle" butonu → mevcut değerlerle form

#### BF-D02: Transform Sıralama
- Backend: `PUT /v1/endpoints/{endpoint_id}/transforms/reorder` endpoint'i eklenmeli
- Frontend: Sürükle-bırak veya yukarı/aşağı butonları

#### BF-D03: Transform Önizleme
- Frontend: "Önizle" butonu → örnek veri ile transform sonucu

#### BF-D04: Transform Test
- Backend: `POST /v1/endpoints/{endpoint_id}/transforms/test` endpoint'i eklenmeli
- Frontend: Payload textarea + "Test Et" butonu + önce/sonra karşılaştırma

#### BF-D05: Kural Şablonları
- Frontend: "Şablonlardan Ekle" butonu → şablon seçimi

### Backend & Frontend Uyumsuzluğu — Şemalar Yapılacaklar

#### BF-S01: Schema Silme
- Backend: `DELETE /v1/schemas/{id}` endpoint'i eklenmeli (Rust)
- Frontend: `schemasApi.delete(token, id)` + silme butonu

#### BF-S02: Schema Düzenleme
- Backend: `PUT /v1/schemas/{id}` endpoint'i eklenmeli
- Frontend: düzenleme formu (modal veya inline)

### Backend & Frontend Uyumsuzluğu — Şablonlar Yapılacaklar

#### BF-T01: Template Detay Sayfası
- Backend: `GET /v1/templates/{id}` zaten var
- Frontend: `/templates/[id]` sayfası oluştur
- İçerik: Açıklama, tag'ler, şema yapısı, örnek payload

#### BF-T02: Template Arama/Filtreleme
- Frontend: Client-side arama input'u + tag filtreleri

#### BF-T03: Template Kategorileri
- Frontend: Kategori sekmeleri (e-commerce, saas, devops, vb.)

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik (Tüm Sayfalar)
- **Etkilenen Dosyalar:**
  - `dashboard/src/app/[locale]/(dashboard)/transforms/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`
  - `dashboard/src/app/[locale]/(dashboard)/templates/page.tsx`
- **Sorun:** Birden fazla `useEffect`, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-dashboard-core P-01)

#### P-02: Pagination Eksik (Tüm Sayfalar)
- **Etkilenen Dosyalar:** transforms, inbound, schemas, templates
- **Sorun:** Tüm veri tek seferde yükleniyor.
- **Adımlar:**
  1. Backend pagination desteği varsa ekle
