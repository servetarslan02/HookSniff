# 🖼️ Portal Özelleştir (Portal Customize)

> Sayfa: `dashboard/src/app/[locale]/dashboard/portal-customize/page.tsx`
> Route: `/dashboard/portal-customize`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- PortalConfig ayarları (renk, logo, font, dark mode)
- PortalPreview — Canlı önizleme
- EmbedCodePanel — Embed kodu
- Font seçenekleri (FONT_OPTIONS)
- Event whitelist yönetimi

### PortalConfig
- primary_color — Marka rengi
- logo_url — Logo URL
- company_name — Şirket adı
- font_family — Font seçimi
- dark_mode — Karanlık mod
- show_events — Event gösterimi
- show_deliveries — Teslimat gösterimi
- allowed_events — İzin verilen event'ler
- custom_css — Özel CSS

## Özellikler
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

## Tespit Edilen Durumlar
### ✅ İyi Yönler
- Kapsamlı özelleştirme seçenekleri
- Canlı önizleme
- Embed kodu oluşturma
- Paralel API çağrısı (config + embed-code)

### 🔴 Eksiklikler
- CSS önizleme yok
- Mobil önizleme yok
- Brand kit import yok
