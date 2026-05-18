# HookSniff /tr (Türkçe) Sayfaları — Kapsamlı Denetim Raporu

**Tarih:** 2026-05-10  
**Denetlenen URL:** `https://hooksniff.vercel.app/tr/*`  
**Toplam Sayfa:** 18  
**Denetim Metodu:** web_fetch + browser snapshot (Chromium)

---

## ÖZET

| Kategori | Critical | High | Medium | Low |
|----------|----------|------|--------|-----|
| Translation (Çeviri) | 8 | 3 | 2 | 0 |
| Footer | 0 | 8 | 0 | 0 |
| Dark Mode | 0 | 8 | 0 | 0 |
| Navigation | 0 | 3 | 5 | 0 |
| SEO | 0 | 0 | 18 | 0 |
| Routing | 0 | 0 | 0 | 0 |
| Layout | 0 | 0 | 0 | 2 |
| Link | 0 | 0 | 1 | 0 |
| Mobile | 0 | 0 | 0 | 0 |
| A11y | 0 | 0 | 0 | 2 |

**Toplam Sorun:** ~57

### Kritik Bulgular
- **18 sayfadan 10'u** Türkçe locale'de neredeyse tamamen İngilizce içerik gösteriyor
- **8 sayfada** footer eksik (SPA sayfaları)
- **8 sayfada** dark mode toggle eksik
- Navigation bar sayfadan sayfaya değişiyor — tutarsız

---

## SAYFA SAYFA DETAYLI RAPOR

### 1. `/tr` (Landing Page)

```json
{
  "page": "/tr",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe landing page: hero, özellikler, fiyatlandırma, CTA",
  "actual_content": "Tamamen Türkçe içerik: 'Asla başarısız olmayan teslimat sistemi', 'Webhook için ihtiyacınız olan her şey', fiyatlandırma kartları Türkçe",
  "routing_correct": true,
  "issues": [
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce: 'HookSniff — Webhook Delivery Service'. Türkçe olmalı: 'HookSniff — Webhook Teslimat Hizmeti'"},
    {"severity": "low", "category": "layout", "description": "Hero başlık '|' karakteriyle kesiliyor: 'Asla başarısız olmayan teslimat sist|' — text-overflow sorunu"}
  ]
}
```

**Türkçe Durumu:** ✅ Tamamen çevrilmiş  
**Footer:** ✅ Var (8 link: GitHub, Dokümantasyon, Durum, Hakkında, SSS, İletişim, Şartlar, Gizlilik)  
**Dark Mode:** ✅ Toggle mevcut  
**Nav:** ✅ Tam nav bar (Özellikler, Fiyatlandırma, Başlayın, Dokümanlar, Durum, Dil Seçici, Dark Mode, Panel)  

---

### 2. `/tr/pricing`

```json
{
  "page": "/tr/pricing",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Tamamen Türkçe fiyatlandırma sayfası",
  "actual_content": "Kısmen Türkçe. Fiyatlandırma kartları ve karşılaştırma tablosu Türkçe, ancak 'Security & Compliance' bölümü, testimonial'lar ve destek seviyeleri İngilizce",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "'Security & Compliance' bölümü tamamen İngilizce: 'TLS 1.3 Everywhere', 'SOC 2 Ready', 'GDPR Compliant', 'HMAC-SHA256', '2FA / TOTP', 'Audit Logs', 'SSO / SAML', 'IP Whitelisting'"},
    {"severity": "high", "category": "translation", "description": "Testimonial'lar İngilizce: 'We switched from building our own webhooks to HookSniff...', 'The FIFO delivery feature is a game-changer...', 'Free tier that actually works for startups...'"},
    {"severity": "high", "category": "translation", "description": "Destek seviyeleri kısmen İngilizce: 'GitHub Issues', 'Community Discord', 'Documentation', 'Stack Overflow', '48h response time', 'Bug fix priority', 'Feature requests', 'Slack Connect channel', '24h response time', 'Onboarding call'"},
    {"severity": "medium", "category": "translation", "description": "ROI Hesaplayıcı 'Tasarrufunuz' Türkçe ama 'Svix'e göre' ve '100% daha az' karışık"},
    {"severity": "medium", "category": "nav", "description": "Nav bar sadece breadcrumb + dil seçici. Tam nav bar yok (Özellikler, Fiyatlandırma, Başlayın linkleri eksik). Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik — sayfanın alt kısmında footer bölümü yok"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 3. `/tr/about`

```json
{
  "page": "/tr/about",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe hakkında sayfası: misyon, hikaye, ekip",
  "actual_content": "Neredeyse tamamen İngilizce. Breadcrumb 'About' diyor, başlık 'About HookSniff', misyon ve hikaye İngilizce. Sadece istatistik etiketleri kısmen Türkçe ('Teslimat Oranı', 'Ort. Gecikme')",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa neredeyse tamamen İngilizce: 'About HookSniff', 'Our Mission', 'Our Story', 'Security First', 'Transparent Pricing', 'Global Infrastructure', 'Ready to get started?', 'Start Free', 'Contact Us'"},
    {"severity": "high", "category": "translation", "description": "Breadcrumb 'About' olarak gösterilmiş, 'Hakkında' olmalı"},
    {"severity": "medium", "category": "translation", "description": "İstatistik etiketleri karışık: 'Teslimat Oranı' Türkçe ama 'SDK Languages' ve 'Starting Price' İngilizce"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Home linki '/' yerine '/tr'指向"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "darkmode", "description": "Dark mode toggle eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 4. `/tr/contact`

```json
{
  "page": "/tr/contact",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe iletişim sayfası: form, e-posta, konum",
  "actual_content": "Neredeyse tamamen İngilizce. 'Contact Us', 'Have a question or need help?', 'Email', 'Location', 'Response Time', 'Send us a message', form labels İngilizce. Sadece buton 'Mesaj Gönder' Türkçe",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Başlık ve açıklama İngilizce: 'Contact Us', 'Have a question or need help? We\\'d love to hear from you.'"},
    {"severity": "high", "category": "translation", "description": "Form label'ları İngilizce: 'Name', 'Email', 'Subject', 'Message', placeholder'lar 'Your name', 'you@example.com', 'How can we help?', dropdown 'Select a topic', 'General question', 'Technical support', 'Billing & payments', 'Enterprise inquiry', 'Bug report', 'Feature request'"},
    {"severity": "high", "category": "translation", "description": "Bilgi kartları İngilizce: 'Email', 'Location', 'Response Time', 'Usually within 24 hours'"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Home linki '/'指向"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "darkmode", "description": "Dark mode toggle eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 5. `/tr/faq`

```json
{
  "page": "/tr/faq",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe SSS sayfası: sorular ve cevaplar",
  "actual_content": "Tamamen Türkçe: 'Sıkça Sorulan Sorular', kategori filtreleri (Genel, Başlarken, Faturalandırma, Teknik, Güvenlik), sorular Türkçe, CTA 'Destek ile İletişim'",
  "routing_correct": true,
  "issues": [
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce: 'HookSniff — Webhook Delivery Service'. Türkçe olmalı: 'HookSniff — Sıkça Sorulan Sorular'"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "darkmode", "description": "Dark mode toggle eksik"}
  ]
}
```

**Türkçe Durumu:** ✅ Tamamen çevrilmiş  
**Nav:** ✅ Breadcrumb var (🪝 HookSniff / FAQ) — breadcrumb 'FAQ' İngilizce  

---

### 6. `/tr/security`

```json
{
  "page": "/tr/security",
  "title": "Security & Compliance — HookSniff | HookSniff",
  "expected_content": "Türkçe güvenlik sayfası: güvenlik özellikleri, uyumluluk",
  "actual_content": "Tamamen İngilizce. Başlık 'Enterprise-grade security, startup-friendly pricing', tüm özellik kartları İngilizce, uyumluluk bölümü İngilizce, mimari güvenlik İngilizce",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa tamamen İngilizce: 'Enterprise-grade security, startup-friendly pricing', 'TLS 1.3 Everywhere', 'HMAC-SHA256 Signatures', '2FA / TOTP', 'SSO / SAML', 'IP Whitelisting', 'SSRF Protection', 'Argon2 Password Hashing', 'Audit Logs', 'EU Data Processing', 'API Key Rotation', 'Rate Limiting', 'Webhook Secret Rotation'"},
    {"severity": "critical", "category": "translation", "description": "Uyumluluk bölümü İngilizce: 'GDPR Compliant', 'SOC 2 Ready', 'CCPA Compliant', 'KVKK Compliant', 'Standard Webhooks Compliant', 'CloudEvents v1.0 Supported'"},
    {"severity": "high", "category": "translation", "description": "Mimari güvenlik İngilizce: 'Data at rest', 'Data in transit', 'AES-256 encryption', 'TLS 1.3', 'HSTS with preload'"},
    {"severity": "high", "category": "translation", "description": "Breadcrumb 'Security' olarak gösterilmiş, 'Güvenlik' olmalı"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce: 'Security & Compliance — HookSniff | HookSniff'"}
  ]
}
```

---

### 7. `/tr/privacy`

```json
{
  "page": "/tr/privacy",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe gizlilik politikası",
  "actual_content": "Başlık 'Gizlilik Politikası' ve tarih Türkçe, ancak tüm içerik maddeleri İngilizce: 'Introduction', 'Information We Collect', 'How We Use Your Information', 'Webhook Payloads', 'Data Sharing', 'Data Security', 'Data Retention', 'Your Rights', 'Cookies', 'International Data Transfers', 'Children\\'s Privacy', 'Changes to This Policy', 'Contact'",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa başlığı Türkçe ('Gizlilik Politikası') ama tüm madde başlıkları ve içerik İngilizce. Kullanıcı Türkçe başlık görünce Türkçe içerik bekler ama İngilizce görür — yanıltıcı"},
    {"severity": "high", "category": "translation", "description": "Tüm section başlıkları İngilizce: '1. Introduction', '2. Information We Collect', '3. How We Use Your Information', vb."},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 8. `/tr/terms`

```json
{
  "page": "/tr/terms",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe hizmet şartları",
  "actual_content": "Başlık 'Hizmet Şartları' ve tarih Türkçe, ancak tüm içerik maddeleri İngilizce: 'Acceptance of Terms', 'Description of Service', 'Account Registration', vb.",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa başlığı Türkçe ('Hizmet Şartları') ama tüm madde başlıkları ve içerik İngilizce — privacy sayfasıyla aynı sorun"},
    {"severity": "high", "category": "translation", "description": "Tüm section başlıkları İngilizce: '1. Acceptance of Terms', '2. Description of Service', '3. Account Registration', vb."},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 9. `/tr/startups`

```json
{
  "page": "/tr/startups",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe girişim programı sayfası",
  "actual_content": "Tamamen İngilizce: 'Startup Program', 'Build faster with HookSniff', 'Special pricing for early-stage startups', '50% off Pro', 'Extended free tier', 'Priority support', 'Who qualifies?', 'Apply for startup pricing'",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa tamamen İngilizce. Türkçe locale'de İngilizce girişim programı sayfası gösteriliyor"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 10. `/tr/status`

```json
{
  "page": "/tr/status",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe sistem durumu sayfası",
  "actual_content": "Tamamen İngilizce: 'System Status', 'All Systems Operational', 'Uptime — Last 90 Days', 'Overall Uptime', 'Components', 'Incident History', 'Scheduled Maintenance'",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa tamamen İngilizce. Tüm başlıklar, bileşen adları, olay geçmişi İngilizce"},
    {"severity": "high", "category": "translation", "description": "Breadcrumb 'Status' olarak gösterilmiş, 'Durum' olmalı"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik — alt kısımda sadece versiyon bilgisi var"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 11. `/tr/get-started`

```json
{
  "page": "/tr/get-started",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe başlangıç rehberi",
  "actual_content": "Neredeyse tamamen Türkçe: 'HookSniff\\'e Başlayın', 'Hesabınızı oluşturun', 'API anahtarınızı alın', 'SDK\\'yı yükleyin', 'İlk uç noktanızı oluşturun', 'İlk webhook\\'unuzu gönderin', 'Teslimatları izleyin'",
  "routing_correct": true,
  "issues": [
    {"severity": "medium", "category": "translation", "description": "Bazı teknik terimler İngilizce bırakılmış: 'SDK', 'API', 'endpoint', 'dashboard', 'CLI', 'Node.js', 'Python', 'Go', 'Rust', 'curl' — bunlar kabul edilebilir"},
    {"severity": "medium", "category": "translation", "description": "Olay türü referansı başlıkları İngilizce: '💳 Payments', '👤 Users', '📦 Orders', '📧 Email', '🤖 AI / Agents', '🔔 Notifications'"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"},
    {"severity": "low", "category": "layout", "description": "Kod bloklarında 'Copy' butonu İngilizce — 'Kopyala' olmalı"}
  ]
}
```

**Türkçe Durumu:** ✅ büyük ölçüde çevrilmiş (teknik terimler hariç)  
**Footer:** ✅ Var (alt kısımda CTA bölümü var ama footer linkleri yok)  
**Dark Mode:** ❌ Toggle eksik  

---

### 12. `/tr/build-vs-buy`

```json
{
  "page": "/tr/build-vs-buy",
  "title": "Webhooks Build vs Buy — Should You Build Your Own? | HookSniff",
  "expected_content": "Türkçe build vs buy karşılaştırması",
  "actual_content": "Tamamen İngilizce: 'Webhooks: Build vs Buy', tüm 12 boyut İngilizce, maliyet karşılaştırması İngilizce, SSS İngilizce",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa tamamen İngilizce. 12 boyutluk detaylı karşılaştırma, maliyet analizi, SSS — hepsi İngilizce"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce: 'Webhooks Build vs Buy — Should You Build Your Own? | HookSniff'"}
  ]
}
```

---

### 13. `/tr/use-cases`

```json
{
  "page": "/tr/use-cases",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe kullanım senaryoları",
  "actual_content": "Tamamen İngilizce: 'Webhooks for every industry', 'SaaS Platforms', 'E-Commerce', 'Fintech & Payments', 'AI & Agents', 'Developer Tools', 'Healthcare', tüm detaylı içerik İngilizce",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa tamamen İngilizce. Tüm sektör başlıkları, problem/çözüm karşılaştırmaları, kod örnekleri, testimonial'lar İngilizce"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 14. `/tr/playground`

```json
{
  "page": "/tr/playground",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe webhook playground sayfası",
  "actual_content": "Tamamen İngilizce: 'Webhook Playground', 'Get a unique URL, send webhooks, inspect requests in real-time. No signup required.', 'Test webhooks in real-time', 'Generate Webhook URL →', 'Free forever · No signup · Works with any service'",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Sayfa tamamen İngilizce"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 15. `/tr/newsletter`

```json
{
  "page": "/tr/newsletter",
  "title": "Newsletter — HookSniff | HookSniff",
  "expected_content": "Türkçe bülten sayfası",
  "actual_content": "Tamamen İngilizce: 'The Webhook Digest', 'Webhook tips, product updates, and engineering insights...', 'Subscribe', 'Product updates', 'Engineering insights', 'Industry trends', 'Recent Issues', testimonial'lar, SSS İngilizce",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa tamamen İngilizce"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce: 'Newsletter — HookSniff | HookSniff'"}
  ]
}
```

---

### 16. `/tr/what-is-a-webhook`

```json
{
  "page": "/tr/what-is-a-webhook",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe webhook rehberi",
  "actual_content": "Tamamen İngilizce: 'A complete guide to webhooks', 'The Simple Explanation', 'How Webhooks Work', 'Webhook vs API vs Polling', 'Common Use Cases', 'Webhook Security', 'Getting Started with Webhooks'",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Sayfa tamamen İngilizce"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 17. `/tr/verify-email`

```json
{
  "page": "/tr/verify-email",
  "title": "HookSniff — Webhook Delivery Service",
  "expected_content": "Türkçe e-posta doğrulama sayfası",
  "actual_content": "İngilizce: 'Verification Failed', 'No verification token provided.', 'Go to Login'. Sadece link '/tr/login'指向 Türkçe login sayfası",
  "routing_correct": true,
  "issues": [
    {"severity": "high", "category": "translation", "description": "Sayfa İngilizce: 'Verification Failed', 'No verification token provided.', 'Go to Login'"},
    {"severity": "medium", "category": "nav", "description": "Minimal nav bar (sadece logo linki). Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce"}
  ]
}
```

---

### 18. `/tr/compare`

```json
{
  "page": "/tr/compare",
  "title": "HookSniff vs Svix vs Hookdeck vs Hook0 — Webhook Comparison (2026) | HookSniff",
  "expected_content": "Türkçe karşılaştırma sayfası",
  "actual_content": "Tamamen İngilizce: 'HookSniff vs Svix vs Hookdeck vs Hook0', 20 detaylı bölüm, skor kartı, testimonial'lar, SSS — hepsi İngilizce",
  "routing_correct": true,
  "issues": [
    {"severity": "critical", "category": "translation", "description": "Sayfa tamamen İngilizce. 20 detaylı karşılaştırma bölümü, skor kartı, 'When to choose what?' bölümü, SSS — hepsi İngilizce"},
    {"severity": "medium", "category": "nav", "description": "Nav bar breadcrumb-only. Dark mode toggle eksik"},
    {"severity": "medium", "category": "footer", "description": "Footer eksik"},
    {"severity": "medium", "category": "seo", "description": "Title tag İngilizce: 'HookSniff vs Svix vs Hookdeck vs Hook0 — Webhook Comparison (2026) | HookSniff'"}
  ]
}
```

---

## GENEL SORUNLAR

### 1. Tutarlı Olmayan Nav Bar

| Sayfa | Nav Tipi | Dark Mode | Footer |
|-------|----------|-----------|--------|
| /tr | ✅ Tam nav | ✅ | ✅ |
| /tr/pricing | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/about | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/contact | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/faq | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/security | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/privacy | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/terms | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/startups | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/status | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/get-started | ❌ Minimal | ❌ | ❌ |
| /tr/build-vs-buy | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/use-cases | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/playground | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/newsletter | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/what-is-a-webhook | ❌ Breadcrumb-only | ❌ | ❌ |
| /tr/verify-email | ❌ Minimal | ❌ | ❌ |
| /tr/compare | ❌ Breadcrumb-only | ❌ | ❌ |

**Sonuç:** Sadece landing page (`/tr`) tam nav bar, dark mode toggle ve footer'a sahip. Diğer 17 sayfada bunların hiçbiri yok.

### 2. Home Link Hatası

Birçok sayfada breadcrumb'daki HookSniff linki `/`指向 (İngilizce ana sayfa), `/tr`指向 olmalı:
- `/tr/about` → link `/`指向 ❌
- `/tr/contact` → link `/`指向 ❌
- `/tr/privacy` → link `/`指向 ❌
- `/tr/terms` → link `/`指向 ❌
- `/tr/security` → link `/tr`指向 ✅
- Diğerleri → `/tr`指向 ✅

### 3. Title Tag Sorunu

Tüm 18 sayfanın title tag'i İngilizce. Hiçbir sayfanın title'ı Türkçe locale'e uygun değil:
- Çoğu: "HookSniff — Webhook Delivery Service"
- Bazıları: "Security & Compliance — HookSniff | HookSniff", "Newsletter — HookSniff | HookSniff", vb.

### 4. Çeviri Durumu Özeti

| Durum | Sayfa Sayısı | Sayfalar |
|-------|-------------|----------|
| ✅ Tamamen Türkçe | 3 | /tr, /tr/faq, /tr/get-started |
| ⚠️ Kısmen Türkçe | 3 | /tr/pricing, /tr/privacy, /tr/terms |
| ❌ Tamamen İngilizce | 12 | /tr/about, /tr/contact, /tr/security, /tr/startups, /tr/status, /tr/build-vs-buy, /tr/use-cases, /tr/playground, /tr/newsletter, /tr/what-is-a-webhook, /tr/verify-email, /tr/compare |

---

## ÖNERİLER

### Acil (Critical)
1. **12 sayfayı Türkçeye çevirin** — /tr/about, /tr/contact, /tr/security, /tr/startups, /tr/status, /tr/build-vs-buy, /tr/use-cases, /tr/playground, /tr/newsletter, /tr/what-is-a-webhook, /tr/verify-email, /tr/compare
2. **Privacy ve Terms sayfalarının body içeriğini Türkçeye çevirin** — başlık Türkçe ama içerik İngilizce, bu yanıltıcı

### Yüksek (High)
3. **Tüm sayfalara nav bar ekleyin** — sadece landing page'de tam nav var
4. **Tüm sayfalara footer ekleyin** — sadece landing page'de footer var
5. **Tüm sayfalara dark mode toggle ekleyin** — sadece landing page'de var

### Orta (Medium)
6. **Title tag'leri Türkçe yapın** — SEO için önemli
7. **Breadcrumb linklerini düzeltin** — bazıları `/`指向, `/tr`指向 olmalı
8. **Breadcrumb text'lerini Türkçeleştirin** — 'About' → 'Hakkında', 'Security' → 'Güvenlik', 'Status' → 'Durum', vb.

### Düşük (Low)
9. **Hero başlık text-overflow sorununu düzeltin** — `/tr` sayfasında 'sist|' kesiliyor
10. **'Copy' butonlarını 'Kopyala' yapın** — get-started sayfasında
