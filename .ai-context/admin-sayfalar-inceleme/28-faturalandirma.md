# 💳 Faturalandırma (Billing)

> Sayfa: `dashboard/src/app/[locale]/dashboard/billing/page.tsx`
> Route: `/dashboard/billing`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- PlanCards — Plan karşılaştırma (Free/Pro/Business)
- UsageChart — Kullanım grafiği
- InvoiceTable — Fatura tablosu

### Bileşenler
| Bileşen | Açıklama |
|---------|----------|
| PlanCards | Plan seçimi ve karşılaştırma |
| UsageChart | Kullanım grafiği (chartData) |
| InvoiceTable | Fatura listesi |

## Özellikler
- ✅ Plan karşılaştırma (Free/Pro/Business)
- ✅ Mevcut plan gösterimi
- ✅ Kullanım grafiği
- ✅ Fatura listesi
- ✅ Plan değiştirme
- ✅ i18n desteği

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Plan fiyatları hardcoded** — $29/$99 (veya $49/$149)
- **Ödeme yöntemi yönetimi yok**

### 🔴 Eksiklikler
- Ödeme yöntemi ekleme/düzenleme
- Fatura indirme (PDF)
- Kullanım limiti uyarısı
- Plan karşılaştırma tablosu
- İndirim/kupon sistemi
