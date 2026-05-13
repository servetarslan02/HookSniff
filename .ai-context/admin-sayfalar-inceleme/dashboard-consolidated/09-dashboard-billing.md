# 💳 Faturalandırma & API — API Anahtarları, Faturalandırma

> **Bölüm:** Faturalandırma & API  
> **İçerik:** API Anahtarları, Faturalandırma  
> **İnceleme Tarihi:** 2026-05-12  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `08-api-anahtarlari.md`, `28-faturalandirma.md`

---

## 📑 İçindekiler

- [1. API Anahtarları (API Keys)](#1-api-anahtarlari-api-keys)
- [2. Faturalandırma (Billing)](#2-faturalandirma-billing)

---

## 1. API Anahtarları (API Keys)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/api-keys/page.tsx`  
> Route: `/api-keys`

### Sayfa Yapısı

#### Alt Bileşenler
| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| NewKeyAlert | `./components/NewKeyAlert` | Yeni key gösterimi |
| CreateKeyForm | `./components/CreateKeyForm` | Key oluşturma formu |
| KeyList | `./components/KeyList` | Key listesi |
| ConfirmActionModal | `./components/ConfirmActionModal` | Onay modalları |

#### Veri Akışı
- `apiFetch<ApiKey[]>(/api-keys)` → key listesi
- `apiFetch(/api-keys, POST, {name})` → key oluşturma
- `apiFetch(/api-keys/{id}, DELETE)` → key silme
- `apiFetch(/api-keys/{id}/rotate, POST)` → key rotasyonu

#### ApiKey Interface
```typescript
interface ApiKey {
  id: string;
  name: string | null;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
}
```

### Özellikler

#### CRUD İşlemleri
- ✅ **Listeleme** — Tüm API key'leri
- ✅ **Oluşturma** — İsim ile key oluşturma
- ✅ **Silme** — ConfirmActionModal ile
- ✅ **Rotasyon** — Eski key'i yenileme
- ✅ **Yeni key gösterimi** — NewKeyAlert bileşeni

#### UI Bileşenleri
- ✅ Error banner (kapatılabilir)
- ✅ New key alert (bir kez gösterilir)
- ✅ Create key form
- ✅ Key listesi
- ✅ Delete onay modalları (danger varyantı)
- ✅ Rotate onay modalları (warning varyantı)

#### Erişilebilirlik
- ✅ aria-label dismiss butonunda
- ✅ i18n tüm metinlerde
- ✅ Dark mode tam destek

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Bileşenlere ayrılmış yapı (NewKeyAlert, CreateKeyForm, KeyList, ConfirmActionModal)
- Key rotasyonu özelliği
- Prefix gösterimi (güvenlik)
- last_used_at gösterimi
- is_active durumu
- getErrorMessage kullanımı
- useCallback ile fetchKeys memoization

#### ⚠️ Potansiyel Sorunlar
- **Key kopyalama** — NewKeyAlert'de kopyalama butonu var mı bilinmiyor
- **Key gizleme** — Yeni key gösterildikten sonra tekrar görülemiyor
- **Toplu silme yok** — Tek tek silme
- **Key adı düzenleme yok** — Sadece oluşturma
- **İs_active toggle yok** — Pasif yapma butonu yok

#### 🔴 Eksiklikler
- Key kullanım istatistikleri yok (kaç kez kullanıldı)
- Key bazlı izin/scope sistemi yok
- Key süresi (expiry) yok
- Key IP whitelist yok
- Toplu key yönetimi yok
- Key kullanım grafiği yok

---

## 2. Faturalandırma (Billing)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/billing/page.tsx`  
> Route: `/billing`

### Sayfa Yapısı
- PlanCards — Plan karşılaştırma (Free/Pro/Business)
- UsageChart — Kullanım grafiği
- InvoiceTable — Fatura tablosu

#### Bileşenler
| Bileşen | Açıklama |
|---------|----------|
| PlanCards | Plan seçimi ve karşılaştırma |
| UsageChart | Kullanım grafiği (chartData) |
| InvoiceTable | Fatura listesi |

### Özellikler
- ✅ Plan karşılaştırma (Free/Pro/Business)
- ✅ Mevcut plan gösterimi
- ✅ Kullanım grafiği
- ✅ Fatura listesi
- ✅ Plan değiştirme
- ✅ i18n desteği

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **Plan fiyatları hardcoded** — $29/$99 (veya $49/$149)
- **Ödeme yöntemi yönetimi yok**

#### 🔴 Eksiklikler
- Ödeme yöntemi ekleme/düzenleme
- Fatura indirme (PDF)
- Kullanım limiti uyarısı
- Plan karşılaştırma tablosu
- İndirim/kupon sistemi

---

## 🔧 Yapılacaklar (2026-05-13)

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik — API Anahtarları
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/api-keys/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-dashboard-core P-01)

### ✅ Düzeltildi

#### ~~ML-01: NewKeyAlert — setTimeout Cleanup Yok~~
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/api-keys/components/NewKeyAlert.tsx`
- **Durum:** ✅ DÜZELTİLDİ — `useRef` + `useEffect` cleanup pattern uygulandı
- `timerRef.current = setTimeout(...)` → `useEffect(() => { return () => { if (timerRef.current) clearTimeout(timerRef.current); }; }, [])`

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
- **Durum:** `billingApi.getPortalUrl` api.ts'de tanımlı ✅, "Müşteri Portalına Git" butonu yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     getPortalUrl: (token: string) =>
       apiFetch<{ url: string }>('/billing/portal', { token }),
     ```
  2. "Faturalandırma Yönetimi" butonu ekle → portal URL'sine yönlendir
  3. i18n key: `manageBilling`, `openBillingPortal`

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
