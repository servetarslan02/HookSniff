# 2026-05-19 — i18n Türkçe Çeviri Çalışması

## Yapılan İşler

### Çeviri Dosyaları (tr.json + en.json)
- **buildVsBuy section**: 60+ anahtar eklendi (Kur mu Satın Al mı sayfası)
- **customers section**: 40+ anahtar eklendi (Müşteri Hikayeleri sayfası)
- **compare section**: 247 anahtar eklendi (Karşılaştırma sayfası)
- **Düzeltmeler**: alerts, billing, rateLimiting eksik/çevrilmemiş anahtarlar

### Component Güncellemeleri
- `BuildVsBuyContent.tsx`: Tüm hardcoded İngilizce metinler `t()` ile değiştirildi
- `CompareContent.tsx`: Tüm hardcoded İngilizce metinler `t()` ile değiştirildi
- `customers/content.tsx`: Tüm hardcoded İngilizce metinler `t()` ile değiştirildi

### Kalite Kontrol
- Teknik terimler İngilizce bırakıldı (SDK, API, HMAC, CloudEvents, vb.)
- Türkçe çeviriler doğal ve akıcı
- Brand isimleri korundu (HookSniff, Svix, Hookdeck, Hook0)

## Sıradaki
- Diğer sayfalardaki hardcoded İngilizce metinler (startups, security, pricing, faq, docs)
- hata mesajlarının Türkçeleştirilmesi
- Component bazlı i18n denetimi

## Commit
- `13b9fbc2`: feat(i18n): translate hardcoded English strings to Turkish
