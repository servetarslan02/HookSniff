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
