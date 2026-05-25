# 🔀 Yönlendirme — Tekrar Politikası, Yönlendirme, Özel Alan Adı

> **Bölüm:** Yönlendirme  
> **İçerik:** Tekrar Politikası, Yönlendirme, Özel Alan Adı  
> **İnceleme Tarihi:** 2026-05-12  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `23-tekrar-politikasi.md`, `24-yonlendirme.md`, `25-ozel-alan-adi.md`

---

## 📑 İçindekiler

- [1. Tekrar Politikası (Retry Policy)](#1-tekrar-politikasi-retry-policy)
- [2. Yönlendirme (Routing)](#2-yonlendirme-routing)
- [3. Özel Alan Adı (Custom Domain)](#3-ozel-alan-adi-custom-domain)

---

## 1. Tekrar Politikası (Retry Policy)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/retry-policy/page.tsx`  
> Route: `/retry-policy`

### Sayfa Yapısı
- RetrySettingsCard — Max attempts, initial delay, max delay
- DeadLetterQueueCard — Dead letter queue ayarları
- StatusCodesCard — Retry edilecek HTTP status kodları
- DelayPreviewCard — Gecikme önizleme (exponential backoff)

#### GlobalRetryPolicy
- default_max_attempts, default_initial_delay_secs, default_max_delay_secs
- multiplier, retryable_status_codes

### Özellikler
- ✅ Max attempts ayarı
- ✅ Initial/max delay ayarı
- ✅ Multiplier (exponential backoff)
- ✅ Retryable status codes
- ✅ Dead letter queue
- ✅ Delay preview (gecikme önizleme)
- ✅ Bileşenlere ayrılmış yapı

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **Veri dönüşümü** — API'den endpoint verisi çekiliyor, policy formatına dönüştürülüyor
- **Endpoint bazlı policy yok** — Global policy

#### 🔴 Eksiklikler
- Endpoint bazlı retry policy
- Retry geçmişi (kaç retry yapıldı)
- Dead letter queue item listesi
- Retry test butonu

---

## 2. Yönlendirme (Routing)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/routing/page.tsx`  
> Route: `/routing`

### Sayfa Yapısı
- RoutingInfo — Endpoint bazlı routing bilgisi
- Fallback URL desteği

#### RoutingInfo
- id, url, endpoint_id, routing_strategy, fallback_url
- avg_response_ms, failure_streak, is_healthy, resolved_url, using_fallback

### Özellikler
- ✅ Endpoint listesi
- ✅ Routing strategy gösterimi
- ✅ Fallback URL
- ✅ Sağlık durumu (is_healthy)
- ✅ Failure streak
- ✅ Ortalama response time
- ✅ Fallback kullanımı (using_fallback)

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **Routing düzenleme yok** — Sadece listeleme
- **Fallback URL ekleme/düzenleme yok**

#### 🔴 Eksiklikler
- Routing strategy değiştirme
- Fallback URL ekleme/düzenleme
- Routing kuralı oluşturma
- Health check ayarları

### Backend & Frontend Uyumsuzluğu

#### Backend'de Var, Frontend'de Yok
| Özellik | Backend | Frontend | Durum |
|---------|---------|----------|-------|
| Routing düzenleme | `PUT /v1/endpoints/{id}/routing` (update_routing) | ❌ Düzenleme formu yok | EKLENMELİ |
| Health kontrolü | `GET /v1/endpoints/{id}/routing/health` (get_health) | ❌ Detay gösterimi yok | EKLENMELİ |

---

## 3. Özel Alan Adı (Custom Domain)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/custom-domain/page.tsx`  
> Route: `/custom-domain`

### Sayfa Yapısı
- Domain ekleme formu
- DNS kayıt talimatları (CNAME + TXT)
- Doğrulama durumu

### Özellikler
- ✅ Domain ekleme (POST /custom-domains)
- ✅ CNAME + TXT kayıt talimatları
- ✅ Durum takibi (none/pending/verified/error)
- ✅ Toast bildirimleri

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **Tek domain** — Birden fazla domain desteği yok
- **Doğrulama butonu yok** — DNS doğrulama otomatik mi?

#### 🔴 Eksiklikler
- Domain silme
- Domain düzenleme
- Çoklu domain desteği
- SSL sertifika durumu
- DNS doğrulama butonu

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Backend-Frontend Uyumsuzluğu

#### BF-01: Routing Düzenleme Formu Yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/routing/page.tsx`
- **Backend:** `PUT /v1/endpoints/{id}/routing` — routing güncelleme
- **Sorun:** Sadece okuma var, düzenleme formu yok.
- **Adımlar:**
  1. Her routing kartına "Düzenle" butonu ekle
  2. Modal form: routing_strategy (select: round-robin/weighted/fallback), fallback_url (input)
  3. `apiFetch('/endpoints/${id}/routing', { method: 'PUT', body: { routing_strategy, fallback_url }, token })` çağrısı
  4. i18n key: `editRouting`, `routingStrategy`, `fallbackUrl`, `routingUpdated`

#### BF-02: Fallback URL Ekleme
- **Backend:** `update_routing` içinde fallback_url destekliyor
- **Frontend:** Mevcut routing kartına "Fallback URL Ekle" butonu

#### BF-03: Health Durumu Detayı
- **Backend:** `GET /v1/endpoints/{id}/routing/health` zaten var
- **Frontend:** Sağlık durumu kartı (is_healthy, failure_streak, avg_response_ms)

#### BF-04: Routing Kuralı Oluşturma
- **Frontend:** "Yeni Kural" butonu → Form: endpoint seç, strateji, fallback

#### BF-05: Domain Doğrulama Butonu Yok — Özel Alan Adı
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/custom-domain/page.tsx`
- **Backend:** `POST /v1/custom-domains/{id}/verify` — DNS doğrulama
- **Durum:** `customDomainsApi.verifyDomain` api.ts'de tanımlı ✅, UI'da buton yok.
- **Adımlar:**
  1. `api.ts`'ye ekle:
     ```typescript
     verifyDomain: (token: string, id: string) =>
       apiFetch<{ verified: boolean; message?: string }>(`/custom-domains/${id}/verify`, { method: 'POST', token }),
     ```
  2. Domain kartına "Doğrula" butonu ekle
  3. Sonuç: ✅ Doğrulandı / ❌ Doğrulanamadı + hata mesajı
  4. i18n key: `verifyDomain`, `domainVerified`, `domainVerifyFailed`

### ⚡ Performans

#### P-01: Race Condition — AbortController Eksik (Yönlendirme)
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/routing/page.tsx`
- **Sorun:** 2 useEffect, fetch var ama abort yok.
- **Adımlar:** (standart — bkz. 01-dashboard-core P-01)
