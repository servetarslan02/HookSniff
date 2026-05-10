# HookSniff /tr/docs Audit Report

**Tarih:** 2026-05-10  
**Tarayıcı:** curl + SSR HTML analizi  
**Kapsam:** 15 sayfa (14 aktif, 1×404)

---

## ÖZET

| Kategori | Kritik | Yüksek | Orta | Düşük |
|----------|--------|--------|------|-------|
| Çeviri (Translation) | 0 | 14 | 0 | 0 |
| Routing | 1 | 0 | 0 | 0 |
| Link | 0 | 1 | 1 | 0 |
| SEO | 0 | 0 | 1 | 0 |
| Dark Mode | 0 | 0 | 0 | 1 |
| Footer | 0 | 0 | 1 | 0 |
| **TOPLAM** | **1** | **15** | **3** | **1** |

---

## GENEL BULGULAR (TÜM SAYFALARDA ORTAK)

### 1. Title Tag — Tüm sayfalarda aynı
- **Title:** `HookSniff — Webhook Delivery Service` (İngilizce)
- **Beklenen:** Sayfaya özel Türkçe title (ör. "Hızlı Başlangıç — HookSniff Dokümantasyon")
- **Severity:** medium | **Category:** seo

### 2. Dark Mode Toggle — Buton yok
- HTML'de dark mode script'i var (`localStorage.getItem('hooksniff-theme')`)
- CSS class'ları `dark:` variant'larını destekliyor
- Ama **görünür bir toggle butonu yok** — kullanıcı dark mode'u manuel olarak aktifleştiremiyor
- **Severity:** low | **Category:** darkmode

### 3. Footer — Karışık çeviri durumu
- Footer mevcut ✓
- "Product" bölümü tamamen İngilizce: "Get Started", "Pricing", "Compare", "Playground", "Startups", "Security"
- "Company" bölümü Türkçe: "Hakkında", "İletişim", "SSS", "Durum", "Şartlar", "Gizlilik"
- "Compare" bölümü İngilizce: "HookSniff vs Svix", "HookSniff vs Hookdeck" vb.
- "Resources" bölümü karışık: "Webhook Guides" (EN), "Değişiklik Günlüğü" (TR), "Dokümantasyon" (TR)
- Copyright Türkçe: "© 2026 HookSniff. Tüm hakları saklıdır." ✓
- **Severity:** medium | **Category:** footer

### 4. Sidebar Navigation — Tutarlı ✓
- Tüm sayfalarda sidebar mevcut
- Kategoriler Türkçe: "Başlarken", "Rehberler", "Özellikler", "Referans"
- Link'ler Türkçe etiketli: "Giriş", "Hızlı Başlangıç", "Temel Kavramlar", "Webhook Güvenliği" vb.
- Aktif sayfa highlight'ı mevcut (CSS class ile)
- **Severity:** yok | **Category:** nav

### 5. Navbar — Tutarlı ✓
- Üst navbarda: Logo, "Docs" etiketi, Dil seçici (TR/Türkçe), "Kontrol Paneli", "Ana Sayfa"
- Tüm sayfalarda aynı ✓
- **Severity:** yok | **Category:** nav

---

## SAYFA SAYFA DETAYLI RAPOR

### 1. `/tr/docs`

```json
{
  "page": "/tr/docs",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Dokümantasyon ana sayfası - Türkçe giriş metni ve kategori kartları",
  "actual_content": "H1: 'Başlarken' (TR) ama açıklama ve kartlar İngilizce",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Alt başlık İngilizce: 'HookSniff is a webhook delivery and monitoring platform. Send webhooks with confidence — we handle delivery, retries, signature verification, and observability.'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm kart başlıkları İngilizce: '🚀 Quickstart', '📐 Core Concepts', '🔒 Security', '🖥️ Dashboard', '🔌 Integrations', '🐳 Self-Hosting', '🔄 Retries & DLQ', '📦 SDKs'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm kart açıklamaları İngilizce: 'Send your first webhook in under 5 minutes', 'Endpoints, deliveries, retries, and more' vb."
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Bölümler İngilizce: 'API Base URL', 'Authentication', 'Rate Limits', 'Plan', 'Requests/min', 'Webhooks/month', 'Free', 'Pro', 'Business'"
    },
    {
      "severity": "high",
      "category": "link",
      "description": "Kart linklerinde /tr prefix eksik: href='/docs/quickstart', href='/docs/concepts' vb. Olması gereken: '/tr/docs/quickstart'"
    },
    {
      "severity": "medium",
      "category": "seo",
      "description": "Title tag İngilizce ve sayfaya özel değil: 'HookSniff — Webhook Delivery Service'"
    }
  ]
}
```

### 2. `/tr/docs/quickstart`

```json
{
  "page": "/tr/docs/quickstart",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Hızlı Başlangıç rehberi - Türkçe adım adım kurulum",
  "actual_content": "Tamamen İngilizce içerik: 'Hızlı Başlangıç' sidebar'da ama sayfa içeriği İngilizce",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Hızlı Başlangıç' (h1 Türkçe) ama alt başlık İngilizce: 'Send your first webhook in under 5 minutes.'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm adım başlıkları İngilizce: '1. Get Your API Key', '2. Create an Endpoint', '3. Send a Webhook', '4. Verify Signatures', '5. Monitor Deliveries'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm açıklama metinleri İngilizce: 'Sign up at hooksniff.vercel.app and grab your API key from the dashboard settings' vb."
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Uyarı metni İngilizce: '⚠️ Keep your API key secret. Never expose it in client-side code or public repos.'"
    },
    {
      "severity": "medium",
      "category": "import-leak",
      "description": "SDK kod örnekleri İngilizce comment'lerle: '// 1. Create an endpoint', '// 2. Send a webhook' — teknik içerikte çeviri gerekip gerekmediği tartışılabilir ama Türkçe dokümanda İngilizce comment'ler UX bütünlüğünü bozar"
    }
  ]
}
```

### 3. `/tr/docs/concepts`

```json
{
  "page": "/tr/docs/concepts",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Temel Kavramlar - Türkçe açıklamalar",
  "actual_content": "Tamamen İngilizce: 'Core Concepts', 'Endpoints', 'Webhooks & Deliveries', 'Retries', 'Dead Letter Queue', 'API Keys', 'FIFO Delivery'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Core Concepts' — sidebar'da 'Temel Kavramlar' olarak görünüyor ama sayfa içeriği İngilizce"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm bölüm başlıkları İngilizce: 'Endpoints', 'Webhooks & Deliveries', 'Retries', 'Dead Letter Queue', 'API Keys', 'FIFO Delivery'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm açıklama metinleri İngilizce: 'An endpoint represents a URL where webhook payloads are delivered' vb."
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tablo başlıkları İngilizce: 'Attempt', 'Delay', 'Cumulative'"
    }
  ]
}
```

### 4. `/tr/docs/api`

```json
{
  "page": "/tr/docs/api",
  "title": "404: This page could not be found.",
  "expected_content": "API Referansı sayfası",
  "actual_content": "404 - Sayfa bulunamadı",
  "routing_correct": false,
  "sidebar_present": false,
  "issues": [
    {
      "severity": "critical",
      "category": "routing",
      "description": "Sayfa 404 döndürüyor. Sidebar'da 'API Referansı' linki var ama hedef sayfa mevcut değil. Kırık link!"
    }
  ]
}
```

### 5. `/tr/docs/sdks`

```json
{
  "page": "/tr/docs/sdks",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "SDK Dokümantasyonu - Türkçe açıklamalar",
  "actual_content": "Başlık İngilizce: 'SDK Dokümantasyonu' (h1 Türkçe) ama açıklama İngilizce. Python SDK section başlığı Türkçe: 'Kurulum', 'Hızlı Başlangıç', 'İmza Doğrulama', 'Hata Yönetimi'. Node.js section başlıkları İngilizce: 'Installation', 'Quick Start'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Alt başlık İngilizce: 'Official SDKs for Python and Node.js. Install via your package manager and start sending webhooks in seconds.'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Node.js SDK bölümü tamamen İngilizce: 'Installation', 'Quick Start', 'Verify Signatures', 'Error Handling', 'TypeScript Support', 'Community SDKs'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Python SDK bölümünde başlıklar Türkçe ('Kurulum', 'Hızlı Başlangıç', 'İmza Doğrulama', 'Hata Yönetimi') ama açıklama metinleri ve code comment'leri İngilizce"
    },
    {
      "severity": "medium",
      "category": "import-leak",
      "description": "SDK sayfasında framework-specific import'lar gösteriliyor (Flask, Express) — bu beklenen bir durum, sızıntı değil"
    }
  ]
}
```

### 6. `/tr/docs/security`

```json
{
  "page": "/tr/docs/security",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Webhook Güvenliği rehberi - Türkçe açıklamalar",
  "actual_content": "Tamamen İngilizce: 'Webhook Security Guide', 'HMAC-SHA256 Signature Verification', 'Node.js Verification', 'Python Verification'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Webhook Security Guide' — sidebar'da 'Webhook Güvenliği' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Alt başlık İngilizce: 'Best practices for securing webhook deliveries — signature verification, IP whitelisting, and more.'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm bölüm başlıkları ve açıklamaları İngilizce: 'HMAC-SHA256 Signature Verification', 'Every webhook is signed using Standard Webhooks HMAC-SHA256' vb."
    }
  ]
}
```

### 7. `/tr/docs/dashboard`

```json
{
  "page": "/tr/docs/dashboard",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Kontrol Paneli rehberi - Türkçe açıklamalar",
  "actual_content": "Tamamen İngilizce: 'Dashboard Guide', 'Overview', 'Endpoint Management', 'Delivery Monitoring', 'Analytics', 'Team Collaboration', 'Settings'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Dashboard Guide' — sidebar'da 'Kontrol Paneli' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Alt başlık İngilizce: 'The HookSniff dashboard is your command center for managing webhooks, monitoring deliveries, and configuring your account.'"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm bölüm başlıkları ve açıklamaları İngilizce"
    }
  ]
}
```

### 8. `/tr/docs/dlq`

```json
{
  "page": "/tr/docs/dlq",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Dead Letter Queue açıklaması - Türkçe",
  "actual_content": "Tamamen İngilizce: 'Dead Letter Queue', 'What is the Dead Letter Queue?', 'When Do Webhooks Go to the DLQ?'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Dead Letter Queue' — sidebar'da aynı (çevrilmemiş)"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm bölüm başlıkları ve açıklamaları İngilizce"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tablo başlıkları İngilizce: 'Plan', 'Retention', 'Max DLQ Entries'"
    }
  ]
}
```

### 9. `/tr/docs/portal`

```json
{
  "page": "/tr/docs/portal",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Gömülebilir Portal rehberi - Türkçe",
  "actual_content": "Tamamen İngilizce: 'Embeddable Portal', 'What is the Embeddable Portal?', 'How to Embed'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Embeddable Portal' — sidebar'da 'Gömülebilir Portal' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm içerik İngilizce"
    }
  ]
}
```

### 10. `/tr/docs/self-hosting`

```json
{
  "page": "/tr/docs/self-hosting",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Self-Hosting rehberi - Türkçe",
  "actual_content": "Tamamen İngilizce: 'Self-Hosting Guide', 'Quick Setup', 'Services', 'Environment Variables'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Self-Hosting Guide' — sidebar'da 'Self-Hosting' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm içerik İngilizce"
    }
  ]
}
```

### 11. `/tr/docs/architecture`

```json
{
  "page": "/tr/docs/architecture",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Mimari açıklaması - Türkçe",
  "actual_content": "Tamamen İngilizce: 'Architecture', 'How HookSniff works under the hood — system components, data flow, and technology choices.'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Architecture' — sidebar'da 'Mimari' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm içerik İngilizce"
    }
  ]
}
```

### 12. `/tr/docs/retries`

```json
{
  "page": "/tr/docs/retries",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Yeniden Deneme rehberi - Türkçe",
  "actual_content": "Tamamen İngilizce: 'Retries & Retry Policy', 'Exponential Backoff Schedule', 'Custom Retry Policy'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Retries & Retry Policy' — sidebar'da 'Yeniden Deneme & DLQ' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm içerik İngilizce"
    }
  ]
}
```

### 13. `/tr/docs/idempotency`

```json
{
  "page": "/tr/docs/idempotency",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "İdempotency açıklaması - Türkçe",
  "actual_content": "Tamamen İngilizce: 'Idempotency', 'Safely retry webhook requests without creating duplicates.'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Idempotency' — sidebar'da 'İdempotency' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm içerik İngilizce"
    }
  ]
}
```

### 14. `/tr/docs/event-types`

```json
{
  "page": "/tr/docs/event-types",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Event Tipleri açıklaması - Türkçe",
  "actual_content": "Tamamen İngilizce: 'Event Types', 'Organize and filter webhooks by event type.'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Event Types' — sidebar'da 'Event Tipleri' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm içerik İngilizce"
    }
  ]
}
```

### 15. `/tr/docs/integrations`

```json
{
  "page": "/tr/docs/integrations",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Entegrasyonlar rehberi - Türkçe",
  "actual_content": "Tamamen İngilizce: 'Integration Guides', 'Connect HookSniff with popular platforms.'",
  "routing_correct": true,
  "sidebar_present": true,
  "issues": [
    {
      "severity": "high",
      "category": "translation",
      "description": "Sayfa başlığı İngilizce: 'Integration Guides' — sidebar'da 'Entegrasyonlar' olarak görünüyor"
    },
    {
      "severity": "high",
      "category": "translation",
      "description": "Tüm içerik İngilizce"
    }
  ]
}
```

---

## KRİTİK SORUNLAR ÖZETİ

### 🔴 Kritik (1)
1. **`/tr/docs/api` → 404**: Sidebar'daki "API Referansı" linki kırık. Sayfa hiç yok.

### 🟡 Yüksek (15)
1. **14 sayfada içerik İngilizce**: `/tr/docs` hariç tüm doküman sayfalarının gövde içeriği tamamen İngilizce. Sidebar etiketleri Türkçe ama sayfa başlıkları ve içerikleri İngilizce.
2. **`/tr/docs` sayfasında kart linkleri kırık**: `/docs/quickstart` gibi `/tr` prefix'i olmayan linkler.

### 🟠 Orta (3)
1. **Title tag tüm sayfalarda aynı**: "HookSniff — Webhook Delivery Service" — SEO için sayfaya özel title gerekli.
2. **Footer'da karışık çeviri**: "Product" ve "Compare" bölümleri İngilizce, "Company" bölümü Türkçe.
3. **`/tr/docs` kart linklerinde locale prefix eksik**: `/docs/quickstart` → `/tr/docs/quickstart` olmalı.

### 🟢 Düşük (1)
1. **Dark mode toggle butonu yok**: CSS dark mode desteği var ama kullanıcı toggle edemiyor.

---

## ÇÖZÜM ÖNERİLERİ

1. **Öncelik 1 — 404 düzeltmesi**: `/tr/docs/api` sayfası oluşturulmalı veya sidebar linki kaldırılmalı
2. **Öncelik 2 — Link prefix düzeltmesi**: `/tr/docs` sayfasındaki kart linklerine `/tr` prefix'i eklenmeli
3. **Öncelik 3 — İçerik çevirisi**: Tüm doküman sayfalarının gövde içeriği Türkçe'ye çevrilmeli (sidebar zaten Türkçe)
4. **Öncelik 4 — Title tag**: Her sayfaya özel `<title>` oluşturulmalı
5. **Öncelik 5 — Footer çevirisi**: "Product" ve "Compare" bölümleri Türkçe'ye çevrilmeli
6. **Öncelik 6 — Dark mode toggle**: Navbar'a dark/light mode toggle butonu eklenmeli
