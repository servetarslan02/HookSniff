# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 16:39 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 71 + 71b)

### İlk Geçiş — Genel İnceleme (5 Agent)
- ~100 sayfa tarandı
- ~105 görsel hata tespit edildi
- 9 kategoride raporlandı
- GitHub: `.ai-context/visual-bugs/` klasörü

### İkinci Geçiş — Derin İnceleme (5 Agent + Manuel)
- Admin girişi yapıldı (servetarslan02@gmail.com)
- Demo hesap oluşturuldu (demo@hooksniff.com / Demo1234!)
- ~52 sayfa derinlemesine incelendi
- **DÜZELTME:** Admin paneli admin hesabıyla test edildi — tüm 5 sayfa çalışıyor
- GitHub: `.ai-context/visual-bugs/DEEP-AUDIT-REPORT.md`

### Tespit Edilen En Kritik Sorunlar
1. 🔴 **Dashboard routing çökmüş** — 16 sayfa yanlış içerik gösteriyor
2. 🔴 **Ham translation key'ler** — Billing'de `billing.nextBilling` gibi key'ler görünüyor
3. 🔴 **Sidebar faciaları** — 27+ menü, çift emoji, karışık dil, aktif highlight yok
4. 🟡 **Public sayfa çevirisi** — 10 sayfanın 7'si %0-15 Türkçe
5. 🟡 **Onboarding karışık dil** — Türkçe + İngilizce karışık

### Düzeltmeler
- ⚠️ Admin paneli "bozuk" raporu düzeltildi — demo hesabı admin yetkisi olmadığı için erişememiş, admin hesabıyla tüm sayfalar çalışıyor

---

## 🔴 ACİL — Sonraki Oturum Görevleri

### 1. Dashboard Routing Düzeltmesi (EN KRİTİK — 4-6 saat)
16 dashboard sayfası yanlış içerik gösteriyor. Next.js route'larını düzelt:
- `middleware.ts` — locale redirect mantığı
- `i18n/routing.ts` — route tanımları
- `[locale]/dashboard/` klasör yapısı — çakışan rotalar
- `next.config.js` — redirect/rewrite kuralları

Bozuk sayfalar:
- `/dashboard/endpoints/[id]` → endpoint listesi
- `/dashboard/deliveries` → dashboard redirect
- `/dashboard/logs` → rate limiting gösteriyor
- `/dashboard/health` → audit log gösteriyor
- `/dashboard/rate-limiting` → health gösteriyor
- `/dashboard/signature-verifier` → deliveries gösteriyor
- `/dashboard/portal` → compare gösteriyor
- `/dashboard/portal-customize` → get-started gösteriyor
- `/dashboard/retry-policy` → audit log gösteriyor
- `/dashboard/alerts` → pricing gösteriyor
- `/dashboard/webhook-builder` → pricing gösteriyor
- `/dashboard/playground` → dashboard redirect
- `/dashboard/search` → endpoint listesi
- `/dashboard/routing` → dashboard redirect
- `/dashboard/schemas` → dashboard redirect
- `/dashboard/sso` → retry policy gösteriyor

### 2. Sidebar Fix (1-2 saat)
- Çift emoji kaldır (⚡ ⚡ → ⚡)
- Tüm menü öğelerini Türkçeleştir
- Aktif sayfa highlight'ı ekle
- Admin linkini gizle (non-admin kullanıcılar için)

### 3. Billing Fix (30 dk)
- Ham translation key'leri düzelt
- `billing.nextBilling` → çevrilmiş metin

### 4. "+ New Endpoint" Fix (30 dk)
- Fiyat sayfası yerine endpoint creation form

### 5. Public Sayfa Çevirisi (3-5 saat)
- security, startups, status, use-cases, what-is-a-webhook
- privacy ve terms body content
- about ve contact

### 6. Onboarding Çevirisi (1 saat)
- Welcome wizard'ı tamamen Türkçeleştir

### 7. Footer Ekleme (1-2 saat)
- Tüm sayfalarda tutarlı footer

---

## 🟡 Servet'in Yapması Gereken
- OAuth test et
- GitHub PAT rotate
- Vercel rebuild kontrol
- iyzico hesap aç
- ENCRYPTION_KEY env var ayarla

## 📝 Demo Hesap Bilgileri
- Email: demo@hooksniff.com
- Şifre: Demo1234!
- Plan: Free
- Admin erişimi: Yok

## 📝 Mevcut Kullanıcılar
| Email | Plan | Admin |
|-------|------|-------|
| servetarslan02@gmail.com | business | ✅ |
| demo@hooksniff.com | free | ❌ |
| test@test.com | free | ❌ |
| servet@test.com | free | ❌ |
| + 6 test hesabı | free | ❌ |