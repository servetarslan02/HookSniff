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

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Fatura Listesi Yüklenmiyor Olabilir
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/billing/page.tsx`
- **Backend:** `GET /v1/billing/invoices` — fatura listesi
- **Sorun:** `billingApiExtended.getInvoices` ve `billingApi.getInvoices` api.ts'de tanımlı ama sayfada `billingApi.getInvoices(token)` çağrılıyor. `billingApiExtended.getInvoices` hiç kullanılmıyor.
- **Adımlar:**
  1. `billingApi.getInvoices(token)` çağrısının çalıştığını doğrula
  2. Fatura yoksa empty state göster

#### BF-02: Kullanım Detayı Yüklenmiyor Olabilir
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/billing/page.tsx`
- **Backend:** `GET /v1/billing/usage` — kullanım detayı
- **Sorun:** `billingApiExtended.getUsage` api.ts'de tanımlı ama kullanım detayı UI'da eksik olabilir.
- **Adımlar:**
  1. `billingApiExtended.getUsage(token)` çağrısının çalıştığını doğrula
  2. Kullanım grafiği göster

#### BF-03: Customer Portal Erişimi Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/billing/page.tsx`
- **Backend:** `GET /v1/billing/portal` — müşteri portalı URL'si
- **Sorun:** api.ts'de tanımlı değil, "Müşteri Portalına Git" butonu yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     getPortalUrl: (token: string) =>
       apiFetch<{ url: string }>('/billing/portal', { token }),
     ```
  2. "Faturalandırma Yönetimi" butonu ekle → portal URL'sine yönlendir
  3. i18n key: `manageBilling`, `openBillingPortal`

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-04: İade (Refund) İşlemi Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/billing/page.tsx`
- **Backend:** `POST /v1/billing/refund` — iade işlemi
- **Sorun:** api.ts'de tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     requestRefund: (token: string) =>
       apiFetch<{ success: boolean }>('/billing/refund', { method: 'POST', token }),
     ```
  2. Fatura tablosuna "İade Talep Et" butonu ekle (son fatura için)
  3. ConfirmDialog: "İade talep edilecek, onaylıyor musunuz?"
  4. i18n key: `requestRefund`, `refundConfirm`, `refundRequested`
