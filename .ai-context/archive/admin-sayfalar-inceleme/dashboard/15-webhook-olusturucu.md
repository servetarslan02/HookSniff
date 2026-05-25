# 🔧 Webhook Oluşturucu (Webhook Builder)

> Sayfa: `dashboard/src/app/[locale]/dashboard/webhook-builder/page.tsx`
> Route: `/dashboard/webhook-builder`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- Event type seçici + template'ler
- Dinamik alan ekleme/düzenleme/silme
- JSON önizleme
- Endpoint seçimi + gönderme

### Template'ler
| Template | Alanlar |
|----------|---------|
| order.created | order_id, total, currency, customer_id |
| payment.completed | payment_id, amount, status, method |
| user.created | user_id, email, plan |

## Özellikler
- ✅ **Template Sistemi** — Önceden tanımlı webhook şablonları
- ✅ **Dinamik Alanlar** — Ekleme/düzenleme/silme
- ✅ **Tip Desteği** — string/number/boolean/object/array
- ✅ **JSON Önizleme** — Canlı payload preview
- ✅ **Gönderme** — Seçili endpoint'e webhook gönderme

## Tespit Edilen Durumlar
### ✅ İyi Yönler
- Template sistemi
- Dinamik alan yönetimi
- JSON önizleme
- i18n desteği

### 🔴 Eksiklikler
- Template kaydetme/paylaşma yok
- Alan validasyonu yok
- Gönderme geçmişi yok
