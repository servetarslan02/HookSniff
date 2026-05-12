# 🌐 Özel Alan Adı (Custom Domain)

> Sayfa: `dashboard/src/app/[locale]/dashboard/custom-domain/page.tsx`
> Route: `/dashboard/custom-domain`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- Domain ekleme formu
- DNS kayıt talimatları (CNAME + TXT)
- Doğrulama durumu

## Özellikler
- ✅ Domain ekleme (POST /custom-domains)
- ✅ CNAME + TXT kayıt talimatları
- ✅ Durum takibi (none/pending/verified/error)
- ✅ Toast bildirimleri

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Tek domain** — Birden fazla domain desteği yok
- **Doğrulama butonu yok** — DNS doğrulama otomatik mi?

### 🔴 Eksiklikler
- Domain silme
- Domain düzenleme
- Çoklu domain desteği
- SSL sertifika durumu
- DNS doğrulama butonu

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Domain Doğrulama Butonu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/custom-domain/page.tsx`
- **Backend:** `POST /v1/custom-domains/{id}/verify` — DNS doğrulama
- **Sorun:** api.ts'de tanımlı değil, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     verifyDomain: (token: string, id: string) =>
       apiFetch<{ verified: boolean; message?: string }>(`/custom-domains/${id}/verify`, { method: 'POST', token }),
     ```
  2. Domain kartına "Doğrula" butonu ekle
  3. Sonuç: ✅ Doğrulandı / ❌ Doğrulanamadı + hata mesajı
  4. i18n key: `verifyDomain`, `domainVerified`, `domainVerifyFailed`
