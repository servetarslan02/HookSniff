# 📐 Şemalar (Schemas)

> Sayfa: `dashboard/src/app/[locale]/dashboard/schemas/page.tsx`
> Route: `/dashboard/schemas`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- Schema listesi (expandable)
- JSON Schema özellikleri: enum, format, oneOf, anyOf, allOf
- Expand/collapse toggle

### Schema Interface
```typescript
interface Schema {
  id: string;
  name: string;
  version: string;
  created_at: string;
  schema?: Record<string, unknown>;
}
```

## Özellikler
- ✅ **Schema Listesi** — Tüm şemalar
- ✅ **Expand/Collapse** — Detay gösterimi
- ✅ **Schema Features** — enum, format, oneOf, anyOf, allOf tag'leri
- ✅ **Keyboard Navigation** — Enter/Space ile toggle

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Schema oluşturma yok** — Sadece listeleme
- **Schema düzenleme yok**
- **Schema silme yok**
- **Schema doğrulama yok** — JSON Schema validation

### 🔴 Eksiklikler
- Schema oluşturma/düzenleme formu
- Schema silme onayı
- Schema ile event eşleştirmesi
- Schema versioning geçmişi
- Schema test/validasyon aracı

---

## 🔧 Backend & Frontend Uyumsuzluğu (2026-05-13)

### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Schema oluşturma | `POST /v1/schemas` (register_schema) | ❌ Form yok | EKLENMELİ |
| Schema silme | — (backend'de delete endpoint'i yok) | ❌ | Backend'e eklenmeli |
| Event doğrulama | `POST /v1/schemas/{id}/validate` | ❌ Buton/form yok | EKLENMELİ |

### Yapılacaklar
1. **Schema Oluşturma Formu** — name, version, JSON Schema textarea
   - Backend: `POST /v1/schemas` zaten var
   - Frontend: `schemasApi.create(token, {name, version, schema})` çağrısı + form UI
2. **Schema Silme** — ConfirmDialog ile silme butonu
   - Backend: `DELETE /v1/schemas/{id}` endpoint'i eklenmeli (Rust)
   - Frontend: `schemasApi.delete(token, id)` + silme butonu
3. **Event Doğrulama** — Schema ile event test etme
   - Backend: `POST /v1/schemas/{id}/validate` zaten var
   - Frontend: payload textarea + "Validate" butonu + sonuç gösterimi
4. **Schema Düzenleme** — Mevcut schema'yı güncelleme
   - Backend: `PUT /v1/schemas/{id}` endpoint'i eklenmeli
   - Frontend: düzenleme formu (modal veya inline)

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Schema Oluşturma Formu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`
- **Backend:** `POST /v1/schemas` — schema oluşturma
- **Sorun:** Sadece listeleme var, oluşturma formu yok.
- **Adımlar:**
  1. "Yeni Schema" butonu ekle
  2. Modal form: name (input), version (input), schema (JSON textarea)
  3. `apiFetch('/schemas', { method: 'POST', body: { name, version, schema }, token })` çağrısı
  4. Başarı sonrası listeyi yenile
  5. i18n key: `createSchema`, `schemaName`, `schemaVersion`, `schemaBody`

#### BF-02: Schema Doğrulama Aracı Yok
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

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-kontrol-paneli P-01)

#### P-02: Pagination Eksik
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/schemas/page.tsx`
- **Sorun:** Tüm şemalar tek seferde yükleniyor.
