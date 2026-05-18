# HookSniff Alternatives, Providers & Compare Audit Report

**Audit Date:** 2026-05-10  
**Auditor:** Subagent (audit-alternatives)  
**Scope:** All /tr/ alternatives, providers, and compare pages  
**Base URL:** https://hooksniff.vercel.app

---

## Executive Summary

**Critical Finding:** ALL 13 Turkish locale (/tr/) pages display **100% English content** — zero Turkish translation has been applied. The /tr/ prefix routes correctly but serves untranslated English text. This is a **site-wide i18n failure** affecting every page audited.

| Category | Issues Found | Severity |
|----------|-------------|----------|
| Translation | 13/13 pages | 🔴 CRITICAL |
| SEO | 2/13 pages | 🟠 HIGH |
| Content | 2/13 pages | 🟠 HIGH |
| Footer | 13/13 pages | 🟡 MEDIUM |
| Dark Mode | 13/13 pages | 🟡 MEDIUM |

---

## Per-Page Audit Results

### 1. /tr/alternatives/svix

```json
{
  "page": "/tr/alternatives/svix",
  "title": "HookSniff vs Svix (no <title> tag extracted)",
  "expected_content": "HookSniff ve Svix karşılaştırması — Türkçe içerik",
  "actual_content": "HookSniff vs Svix — full English comparison table and bottom line",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Entire sayfa İngilizce. Başlık 'HookSniff vs Svix', paragraflar, tablo ve bottom line tamamen İngilizce. Türkçe çeviri yapılmamış."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Readability extraction'da footer elementi tespit edilemedi. Footer varlığı doğrulanamadı."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle butonu extracted content'te görünmüyor."
    },
    {
      "severity": "low",
      "category": "seo",
      "description": "Title tag extraction'da yakalanamadı (SPA/client-rendered). Manuel kontrol gerekli."
    }
  ]
}
```

### 2. /tr/alternatives/svix-alternatives

```json
{
  "page": "/tr/alternatives/svix-alternatives",
  "title": "Svix Alternatives — Best Webhook Services Compared (2026) | HookSniff | HookSniff",
  "expected_content": "Svix alternatifleri listesi — Türkçe",
  "actual_content": "Title İngilizce, body content neredeyse boş (sadece emoji 🪝 ve title text)",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Title tamamen İngilizce: 'Svix Alternatives — Best Webhook Services Compared (2026)'. Türkçe çeviri yok."
    },
    {
      "severity": "high",
      "category": "content",
      "description": "Sayfa body'si readability extraction'da neredeyse boş çıkıyor. Alternatifler listesi-render edilmemiş olabilir veya client-side rendering sorunu var."
    },
    {
      "severity": "high",
      "category": "seo",
      "description": "Title tag İngilizce: 'Svix Alternatives — Best Webhook Services Compared (2026) | HookSniff | HookSniff'. 'HookSniff' iki kez tekrarlanmış. Türkçe locale'de Türkçe title olmalı."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    }
  ]
}
```

### 3. /tr/alternatives/hookdeck

```json
{
  "page": "/tr/alternatives/hookdeck",
  "title": "(extraction'da yok)",
  "expected_content": "HookSniff ve Hookdeck karşılaştırması — Türkçe",
  "actual_content": "HookSniff vs Hookdeck — full English comparison table",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. Başlık, açıklama, tablo ve bottom line Türkçe değil."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    }
  ]
}
```

### 4. /tr/alternatives/hookdeck-alternatives

```json
{
  "page": "/tr/alternatives/hookdeck-alternatives",
  "title": "(extraction'da yok)",
  "expected_content": "Hookdeck alternatifleri listesi — Türkçe",
  "actual_content": "Hookdeck Alternatives in 2026 — full English with comparison table and CTA",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. 'Hookdeck Alternatives in 2026', 'Why Choose HookSniff Over Hookdeck?' gibi başlıklar ve tüm paragraflar İngilizce."
    },
    {
      "severity": "medium",
      "category": "link",
      "description": "CTA linki '/tr/login' olarak doğru locale'de — bu doğru."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    }
  ]
}
```

### 5. /tr/alternatives/hook0

```json
{
  "page": "/tr/alternatives/hook0",
  "title": "(extraction'da yok)",
  "expected_content": "HookSniff ve Hook0 karşılaştırması — Türkçe",
  "actual_content": "HookSniff vs Hook0 — full English comparison",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. Türkçe çeviri yapılmamış."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    }
  ]
}
```

### 6. /tr/alternatives/convoy

```json
{
  "page": "/tr/alternatives/convoy",
  "title": "(extraction'da yok)",
  "expected_content": "HookSniff ve Convoy karşılaştırması — Türkçe",
  "actual_content": "HookSniff vs Convoy — full English, includes archived warning",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. 'Convoy is archived' uyarısı dahil Türkçe değil."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    }
  ]
}
```

### 7. /tr/alternatives/convoy-alternatives

```json
{
  "page": "/tr/alternatives/convoy-alternatives",
  "title": "(extraction'da yok)",
  "expected_content": "Convoy alternatifleri listesi — Türkçe",
  "actual_content": "Convoy Alternatives in 2026 — full English with comparison table and CTA",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. 'Convoy Alternatives in 2026', 'Why Choose HookSniff Over Convoy?' başlıkları İngilizce."
    },
    {
      "severity": "medium",
      "category": "link",
      "description": "CTA linki '/tr/login' olarak doğru locale'de."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    }
  ]
}
```

### 8. /tr/alternatives/webhook-relay

```json
{
  "page": "/tr/alternatives/webhook-relay",
  "title": "(extraction'da yok)",
  "expected_content": "HookSniff ve Webhook Relay karşılaştırması — Türkçe",
  "actual_content": "HookSniff vs Webhook Relay — full English comparison",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. Türkçe çeviri yapılmamış."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    }
  ]
}
```

### 9. /tr/providers

```json
{
  "page": "/tr/providers",
  "title": "(extraction'da yok)",
  "expected_content": "Webhook sağlayıcı rehberleri — Türkçe",
  "actual_content": "Webhook Provider Guides — English. Lists Stripe, GitHub, Shopify with English descriptions.",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Başlık 'Webhook Provider Guides' İngilizce. Tüm provider açıklamaları İngilizce: 'Payments, subscriptions, disputes, and refunds.' vb."
    },
    {
      "severity": "medium",
      "category": "nav",
      "description": "Nav bar mevcut: '[🪝 HookSniff](/tr)/Providers' — breadcrumb doğru locale'e işaret ediyor."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    },
    {
      "severity": "low",
      "category": "link",
      "description": "Tüm provider linkleri doğru locale prefix'i ile: /tr/providers/stripe, /tr/providers/github, /tr/providers/shopify."
    }
  ]
}
```

### 10. /tr/providers/stripe

```json
{
  "page": "/tr/providers/stripe",
  "title": "(extraction'da yok)",
  "expected_content": "Stripe webhook entegrasyon rehberi — Türkçe",
  "actual_content": "Stripe Webhooks Guide — full English with Node.js code example",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. 'Stripe Webhooks Guide', 'Receive and verify Stripe webhooks' gibi metinler Türkçe değil. Kod örnekleri de İngilizce comment'ler içeriyor."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    },
    {
      "severity": "low",
      "category": "link",
      "description": "CTA linki '/tr/login' doğru."
    }
  ]
}
```

### 11. /tr/providers/github

```json
{
  "page": "/tr/providers/github",
  "title": "(extraction'da yok)",
  "expected_content": "GitHub webhook entegrasyon rehberi — Türkçe",
  "actual_content": "GitHub Webhooks Guide — full English with Quick Start steps and events table",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. Quick Start adımları, event tablosu ve açıklamaları Türkçe değil."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    },
    {
      "severity": "low",
      "category": "layout",
      "description": "Event tablosu markdown extraction'da düzgün görünüyor, overflow riski düşük."
    }
  ]
}
```

### 12. /tr/providers/shopify

```json
{
  "page": "/tr/providers/shopify",
  "title": "(extraction'da yok)",
  "expected_content": "Shopify webhook entegrasyon rehberi — Türkçe",
  "actual_content": "Shopify Webhooks Guide — full English with Quick Start and events table",
  "routing_correct": true,
  "issues": [
    {
      "severity": "critical",
      "category": "translation",
      "description": "Tüm içerik İngilizce. 'Shopify Webhooks Guide', Quick Start adımları ve topic tablosu Türkçe değil."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    }
  ]
}
```

### 13. /tr/compare

```json
{
  "page": "/tr/compare",
  "title": "HookSniff vs Svix vs Hookdeck vs Hook0 — Webhook Comparison (2026) | HookSniff",
  "expected_content": "Webhook servis karşılaştırma tablosu — Türkçe",
  "actual_content": "Title İngilizce, body content sadece emoji 🪝 — büyük ihtimalle client-side rendered (React/Next.js hydration sonrası içerik yükleniyor)",
  "routing_correct": true,
  "issues": [
    {
      "severity": "high",
      "category": "content",
      "description": "Sayfa body'si neredeyse boş. Readability extraction sadece 🪝 emoji'si döndürüyor. Compare tablosu client-side rendering ile yükleniyor olabilir — SSR/SSG sorunu veya readability extraction yetersizliği."
    },
    {
      "severity": "critical",
      "category": "translation",
      "description": "Title İngilizce: 'HookSniff vs Svix vs Hookdeck vs Hook0 — Webhook Comparison (2026)'. Türkçe çeviri yok."
    },
    {
      "severity": "high",
      "category": "seo",
      "description": "Title tag İngilizce. Google'da Türkçe arama sonuçlarında İngilizce title gösterilecek. SEO açısından olumsuz."
    },
    {
      "severity": "medium",
      "category": "footer",
      "description": "Footer tespit edilemedi."
    },
    {
      "severity": "medium",
      "category": "darkmode",
      "description": "Dark mode toggle görünmüyor."
    },
    {
      "severity": "medium",
      "category": "a11y",
      "description": "Client-side rendered content, slow connections veya JS disabled durumunda erişilemez olabilir."
    }
  ]
}
```

---

## Cross-Cutting Issues Summary

### 🔴 CRITICAL: Translation Failure (13/13 pages)

**Durum:** Hiçbir /tr/ sayfası Türkçe'ye çevrilmemiş. Tüm content İngilizce olarak servis ediliyor.

**Etkilenen sayfalar:** Tüm 13 sayfa

**Kök neden olasılıkları:**
1. i18n translation dosyaları (messages/tr.json vb.) eksik veya boş
2. Next.js i18n config'de Türkçe locale için translation key'leri tanımlanmamış
3. Fallback mekanizması İngilizce'ye düşüyor

**Öneri:** Türkçe translation dosyalarını kontrol et. `next-intl`, `next-i18next` veya kullanılan i18n kütüphanesinin Türkçe mesaj dosyalarının dolu olduğundan emin ol.

### 🟠 HIGH: Empty/Client-Rendered Pages (2/13 pages)

**Etkilenen:** `/tr/alternatives/svix-alternatives`, `/tr/compare`

Bu sayfalar readability extraction'da neredeyse boş dönüyor. Compare sayfası büyük ihtimalle tamamen client-side rendered — SEO ve accessibility için SSR/SSG gerekli.

### 🟡 MEDIUM: Footer Visibility (13/13 pages)

Readability extraction hiçbir sayfada footer elementi yakalayamadı. Bu ya:
- Footer gerçekten yok (kötü UX)
- Footer extraction'dan gizleniyor (readability heuristic)
- Manuel kontrol gerekli

### 🟡 MEDIUM: Dark Mode Toggle (13/13 pages)

Hiçbir extracted content'te dark mode toggle butonu görünmüyor. Manuel kontrol gerekli — extraction'da header/nav elementleri genellikle atlanır.

---

## Recommendations (Priority Order)

1. **P0 — Türkçe çevirileri tamamla:** Tüm /tr/ sayfaları için translation key'lerini doldur. Bu en kritik eksik.
2. **P1 — Compare sayfası SSR:** Client-side rendered compare tablosu SSR/SSG ile render et (SEO + a11y).
3. **P1 — svix-alternatives content:** Body content'in doğru render edildiğini doğrula.
4. **P2 — Title tag'leri Türkçe yap:** Tüm /tr/ sayfalarının `<title>` tag'lerini Türkçe olarak ayarla.
5. **P2 — Footer doğrulama:** Footer'ın tüm sayfalarda göründüğünü manuel olarak doğrula.
6. **P3 — Dark mode toggle doğrulama:** Header'da dark mode toggle'ın varlığını doğrula.

---

*Report generated by audit-alternatives subagent on 2026-05-10*
