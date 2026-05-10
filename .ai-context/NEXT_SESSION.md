# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-10 16:35 GMT+8

---

## ✅ BU OTURUMDA YAPILAN (Session 71 + 71b)

### İlk Geçiş — Genel İnceleme (5 Agent)
- ~100 sayfa tarandı
- ~105 görsel hata tespit edildi
- 9 kategoride raporlandı
- GitHub: `.ai-context/visual-bugs/` klasörü

### İkinci Geçiş — Derin İnceleme (5 Agent, Kimlik Doğrulamalı)
- Admin girişi yapıldı (servetarslan02@gmail.com)
- Demo hesap oluşturuldu (demo@hooksniff.com / Demo1234!)
- ~52 sayfa derinlemesine incelendi
- ~115 ek hata tespit edildi
- GitHub: `.ai-context/visual-bugs/DEEP-AUDIT-REPORT.md`

### Tespit Edilen En Kritik Sorunlar
1. 🔴 **Routing tamamen çökmüş** — 30+ sayfa yanlış içerik gösteriyor
2. 🔴 **Admin paneli çalışmıyor** — 6 sayfanın hiçbiri doğru değil
3. 🔴 **Dashboard sayfaları bozuk** — 32 sayfanın sadece 7-8'i doğru yükleniyor
4. 🔴 **Ham translation key'ler** — Billing'de `billing.nextBilling` gibi key'ler görünüyor
5. 🔴 **Sidebar faciaları** — 27+ menü, çift emoji, karışık dil, aktif highlight yok
6. 🟡 **Public sayfa çevirisi** — 10 sayfanın 7'si %0-15 Türkçe

---

## 🔴 ACİL — Sonraki Oturum Görevleri

### 1. Routing Düzeltmesi (EN KRİTİK — 4-6 saat)
Tüm Next.js route'larını kontrol et ve düzelt:
- `middleware.ts` — locale redirect mantığı
- `i18n/routing.ts` — route tanımları
- `[locale]` klasör yapısı — çakışan rotalar
- `next.config.js` — redirect/rewrite kuralları
- Vercel build logları

### 2. Admin Paneli (2-3 saat)
- 6 admin sayfasını oluştur veya düzelt
- `/admin` — overview
- `/admin/users` — user management
- `/admin/revenue` — revenue dashboard
- `/admin/system` — system status
- `/admin/settings` — admin settings

### 3. Sidebar Fix (1-2 saat)
- Çift emoji kaldır (⚡ ⚡ → ⚡)
- Tüm menü öğelerini Türkçeleştir
- Aktif sayfa highlight'ı ekle
- Admin linkini gizle (non-admin)

### 4. Billing Fix (30 dk)
- Ham translation key'leri düzelt
- `billing.nextBilling` → çevrilmiş metin

### 5. "+ New Endpoint" Fix (30 dk)
- Fiyat sayfası yerine endpoint creation form

### 6. Public Sayfa Çevirisi (3-5 saat)
- security, startups, status, use-cases, what-is-a-webhook
- privacy ve terms body content
- about ve contact

### 7. Onboarding Çevirisi (1 saat)
- Welcome wizard'ı tamamen Türkçeleştir

### 8. Footer Ekleme (1-2 saat)
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

## 📝 Mevcut Test Hesapları
| Email | Plan |
|-------|------|
| test@test.com | free |
| servet@test.com | free |
| live-test@hooksniff.dev | free |
| final-test@hooksniff.dev | free |
| routing-test@hooksniff.dev | free |
| debug3@hooksniff.dev | free |
| test-agent@hooksniff.dev | free |
| final2@hooksniff.dev | free |