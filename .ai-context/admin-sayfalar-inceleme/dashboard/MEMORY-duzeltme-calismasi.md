# Dashboard İnceleme Düzeltme Çalışması — Memory Dosyası

> **Tarih:** 2026-05-13  
> **Durum:** DEVAM EDİYOR — Yarım kaldı  
> **Son İşlem:** api.ts eksik metodlar ekleniyor

---

## ✅ Yapılan Düzeltmeler

### 1. Endpoint'ler — catch bloğu hatayı yutuyor
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/endpoints/page.tsx`
- `.catch(() => {})` → `.catch((err) => { setError(...) })` olarak değiştirildi
- Error banner eklendi (retry butonu ile birlikte)

### 2. Şablonlar — catch bloğu hatayı yutuyor
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/templates/page.tsx`
- `.catch(() => {})` → `.catch((err) => { setError(...) })` olarak değiştirildi
- Error state ve error banner eklendi

### 3. setTimeout Cleanup — 5 dosya düzeltildi
- **NewKeyAlert.tsx** — `useRef` + `useEffect` cleanup eklendi
- **PasswordSection.tsx** — `useRef` + `useEffect` cleanup eklendi
- **ApiKeySection.tsx** — `useRef` + `useEffect` cleanup eklendi
- **ProfileSection.tsx** — `useRef` + `useEffect` cleanup eklendi
- **deliveries/[id]/page.tsx** — `useRef` + `useEffect` cleanup eklendi

### 4. api.ts — Eksik API metodları eklendi
- `alertsApi.update` — Alert düzenleme (PUT /alerts/{id})
- `endpointsApi.rotateSecret` — Secret rotasyonu (POST /endpoints/{id}/rotate-secret)

---

## 🔴 KALAN İŞLER (Yapılmadı)

### api.ts — Hâlâ eksik metodlar
- `webhooksApi.batchReplay` — Toplu tekrar gönderme
- `twoFactorApi` — 2FA enable/confirm/disable
- `customDomainsApi.verifyDomain` — Domain doğrulama
- `ssoApi.testSso` — SSO bağlantı testi
- `billingApi.getPortalUrl` — Müşteri portal URL'si

### ConsentToggle — Backend'e çağrı yok
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/ConsentToggle.tsx`
- Sadece localStorage + cookie yazıyor, backend'e göndermiyor
- `POST /v1/auth/consent` endpoint'i eklenmeli + ConsentToggle güncellenmeli

### NotificationSection — Başlangıç değerleri localStorage'dan
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/settings/components/NotificationSection.tsx`
- API'den tercihler çekilmiyor, sadece localStorage'dan okunuyor
- Sayfa yüklenirken API'den çekme eklenmeli

### Playground — Raw fetch (7 yer)
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/playground/content.tsx`
- `fetch('/api/playground/...')` → `apiFetch` veya en azından timeout/error handling eklenmeli
- NOT: Playground public endpoint, auth header sorun çıkarabilir

### Dashboard Overview sayfası yok
- `(dashboard)/page.tsx` dosyası mevcut DEĞİL
- Review'da bahsedilen "Kontrol Paneli" sayfası aslında yok
- Sidebar'daki "📊 Dashboard" linki `/`'a gidiyor ama orası landing page

### Konsolide dosya düzeltmeleri
- `00-INDEKS.md` ve konsolide dosyalar güncellenmeli (doğru bulgularla)
- Bazı bulgular yanlıştı (notifications markAsRead çalışıyor mesela)

---

## 📊 Dosya Değişiklik Listesi

| Dosya | Değişiklik |
|-------|-----------|
| `endpoints/page.tsx` | catch fix + error banner |
| `templates/page.tsx` | catch fix + error state + error banner |
| `api-keys/components/NewKeyAlert.tsx` | setTimeout cleanup |
| `settings/components/PasswordSection.tsx` | setTimeout cleanup |
| `settings/components/ApiKeySection.tsx` | setTimeout cleanup |
| `settings/components/ProfileSection.tsx` | setTimeout cleanup |
| `deliveries/[id]/page.tsx` | setTimeout cleanup |
| `lib/api.ts` | alertsApi.update + endpointsApi.rotateSecret eklendi |

---

## 🔧 Doğrulanmış Bulgular (Review yanlıştı)

| Review Bulgusu | Gerçek Durum |
|---------------|-------------|
| "notificationsApi.markAsRead UI'da kullanılmıyor" | ❌ YANLIŞ — notifications/page.tsx'de `handleMarkAsRead` ve `handleMarkAllAsRead` var |
| "Dashboard overview sayfası eksik" | ⚠️ DOĞRU — `(dashboard)/page.tsx` yok, landing page kullanılıyor |
| "Playground raw fetch" | ✅ DOĞRU — 7 yerde raw fetch var ama public endpoint olduğu için kasıtlı olabilir |
| "Catch blokları boş" | ✅ DOĞRU — endpoints ve templates'de `.catch(() => {})` var |
| "setTimeout cleanup yok" | ✅ DOĞRU — 5 dosyada düzeltildi |

---

## 📝 Sonraki Adımlar

1. Kalan api.ts metodlarını ekle (batchReplay, twoFactorApi, customDomainsApi, ssoApi, billingApi.getPortalUrl)
2. ConsentToggle'ı backend'e bağla
3. NotificationSection'ı API'den veri çek
4. Konsolide dosyaları güncelle (doğru bulgularla)
5. Değişiklikleri commit + push et
