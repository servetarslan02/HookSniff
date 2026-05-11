# i18n Fix Report: About & Contact Pages

**Tarih:** 2026-05-12

## About Sayfası — Değişiklikler

| # | Hardcoded Metin | i18n Key | Durum |
|---|----------------|----------|-------|
| 1 | "Live & Operational" | `about.liveOperational` | ✅ |
| 2 | "Reliable webhook delivery infrastructure built by developers, for developers." | `about.heroSubtitle` | ✅ |
| 3 | Mission paragraf 1 | `about.missionP1` | ✅ |
| 4 | Mission paragraf 2 | `about.missionP2` | ✅ |
| 5 | "SDK Languages" | `about.sdkLanguages` | ✅ |
| 6 | "Starting Price" | `about.startingPrice` | ✅ |
| 7 | Story paragraf 1 | `about.storyP1` | ✅ |
| 8 | Story paragraf 2 | `about.storyP2` | ✅ |
| 9 | Story paragraf 3 | `about.storyP3` | ✅ |
| 10 | "Security First" + desc | `about.securityFirst` / `about.securityFirstDesc` | ✅ |
| 11 | "Transparent Pricing" + desc | `about.transparentPricing` / `about.transparentPricingDesc` | ✅ |
| 12 | "Global Infrastructure" + desc | `about.globalInfrastructure` / `about.globalInfrastructureDesc` | ✅ |
| 13 | "Ready to get started?" | `about.readyToStart` | ✅ |
| 14 | "Start Free" | `about.startFree` | ✅ |
| 15 | "Contact Us" | `about.contactUs` | ✅ |

## Contact Sayfası — Değişiklikler

| # | Hardcoded Metin | i18n Key | Durum |
|---|----------------|----------|-------|
| 1 | "Use the form below 👇" | `contact.useFormBelow` | ✅ |
| 2 | "Turkey 🇹🇷" | `contact.locationValue` | ✅ |
| 3 | "Usually within 24 hours" | `contact.responseTimeValue` | ✅ |
| 4 | "✅ Message sent! We'll get back to you soon." | `contact.messageSent` | ✅ |
| 5 | "❌ Failed to send. Please try again or reach us on GitHub Discussions." | `contact.sendError` | ✅ |
| 6 | "How can we help?" (placeholder) | `contact.howCanWeHelp` | ✅ |

## Dil Dosyaları Güncellendi

- `src/messages/tr.json` — `about` ve `contact` section'larına yeni key'ler eklendi (Türkçe çevirilerle)
- `src/messages/en.json` — `about` ve `contact` section'larına yeni key'ler eklendi (İngilizce orijinallerle)

## Notlar

- `useTranslations()` her iki sayfada zaten tanımlıydı, namespace değişikliği gerekmedi
- Dosya yapısı ve mevcut düzen bozulmadı
- `you@example.com` placeholder (email input) — bu evrensel bir örnek, i18n'e gerek yok
- `t('sending')`, `t('sendMessage')`, `t('deliveryRate')`, `t('avgLatency')`, `t('cta')` gibi key'ler zaten mevcuttu, dokunulmadı
