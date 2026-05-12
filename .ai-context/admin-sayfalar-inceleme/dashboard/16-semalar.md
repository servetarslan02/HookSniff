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
