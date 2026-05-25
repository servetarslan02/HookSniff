# 🖼️ Portal — Özelleştirme ve Yönetim

> **Bölüm:** Portal  
> **İçerik:** Portal Özelleştirme, Portal Yönetim  
> **İnceleme Tarihi:** 2026-05-12  
> **Güncelleme:** 2026-05-13 (kod değişiklikleriyle eşleştirildi)  
> **Kaynak Dosyalar:** `18-portal-ozellestir.md`, `19-portal.md`

---

## 📑 İçindekiler

- [1. Portal Özelleştir (Portal Customize)](#1-portal-ozellestir-portal-customize)
- [2. Portal (Portal Manage)](#2-portal-portal-manage)

---

## 1. Portal Özelleştir (Portal Customize)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/portal-customize/page.tsx`  
> Route: `/portal-customize`

### Sayfa Yapısı
- PortalConfig ayarları (renk, logo, font, dark mode)
- PortalPreview — Canlı önizleme
- EmbedCodePanel — Embed kodu
- Font seçenekleri (FONT_OPTIONS)
- Event whitelist yönetimi

#### PortalConfig
- primary_color — Marka rengi
- logo_url — Logo URL
- company_name — Şirket adı
- font_family — Font seçimi
- dark_mode — Karanlık mod
- show_events — Event gösterimi
- show_deliveries — Teslimat gösterimi
- allowed_events — İzin verilen event'ler
- custom_css — Özel CSS

### Özellikler
- ✅ Renk seçici (primary_color)
- ✅ Logo URL girişi
- ✅ Şirket adı
- ✅ Font seçimi
- ✅ Dark mode toggle
- ✅ Event/Delivery gösterim toggle'ları
- ✅ Event whitelist yönetimi
- ✅ Custom CSS
- ✅ Canlı portal önizleme
- ✅ Embed kodu (iframe, React, script)
- ✅ Portal URL

### Tespit Edilen Durumlar

#### ✅ İyi Yönler
- Kapsamlı özelleştirme seçenekleri
- Canlı önizleme
- Embed kodu oluşturma
- Paralel API çağrısı (config + embed-code)

#### 🔴 Eksiklikler
- CSS önizleme yok
- Mobil önizleme yok
- Brand kit import yok

---

## 2. Portal (Portal Manage)

> Sayfa: `dashboard/src/app/[locale]/(dashboard)/portal-manage/page.tsx`  
> Route: `/portal-manage`

### Sayfa Yapısı
- PortalProfile — Kullanıcı profili (email, plan, limit)
- PortalUsage — Kullanım istatistikleri

#### PortalProfile
- email, name, plan, webhook_limit, webhook_count, created_at

#### PortalUsage
- webhooks_used, api_calls_today, total_deliveries
- delivered, failed, success_rate, endpoints_count

### Özellikler
- ✅ Profil bilgileri
- ✅ Kullanım istatistikleri
- ✅ Plan bilgisi
- ✅ Webhook limit/sayı
- ✅ Success rate
- ✅ Error state
- ✅ Loading state

### Tespit Edilen Durumlar

#### ⚠️ Potansiyel Sorunlar
- **Portal URL yok** — Embed link gösterimi eksik
- **Portal ayarlarına yönlendirme yok** — portal-customize'a link

#### 🔴 Eksiklikler
- Portal paylaşma (link)
- Portal activity log
- Portal kullanıcı yönetimi

---

## 🔧 Yapılacaklar (2026-05-13)

### 🔴 Eksiklikler

#### E-01: CSS Önizleme Yok — Portal Özelleştir
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/portal-customize/page.tsx`
- **Sorun:** Custom CSS girildiğinde önizleme gösterilmiyor.
- **Adımlar:**
  1. CSS değişikliğinde canlı önizleme güncelle
  2. Geçersiz CSS uyarısı göster

#### E-02: Mobil Önizleme Yok — Portal Özelleştir
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/portal-customize/page.tsx`
- **Sorun:** Portal mobil görünümü önizlenemiyor.
- **Adımlar:**
  1. Mobil/Tablet/Desktop önizleme toggle'ı ekle
  2. Responsive iframe boyutları

#### E-03: Portal URL Gösterimi Yok — Portal Yönetim
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/portal-manage/page.tsx`
- **Sorun:** Portal embed linki gösterilmiyor.
- **Adımlar:**
  1. Portal URL kartı ekle
  2. Kopyalama butonu
  3. i18n key: `portalUrl`, `copyPortalUrl`

#### E-04: Portal Ayarlarına Yönlendirme Yok — Portal Yönetim
- **Dosya:** `dashboard/src/app/[locale]/(dashboard)/portal-manage/page.tsx`
- **Sorun:** portal-customize'a link yok.
- **Adımlar:**
  1. "Portal Ayarlarını Düzenle" butonu ekle
  2. `/portal-customize` sayfasına yönlendir
