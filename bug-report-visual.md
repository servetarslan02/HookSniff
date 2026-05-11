# 🔍 HookSniff Görsel QA & i18n Hata Raporu

**Tarih:** 2026-05-12  
**Kontrol edilen:** 11 sayfa (`/tr/*`)  
**Toplam bulunan sorun:** 42

---

## Özet

| Ciddiyet | Sayı |
|----------|------|
| 🔴 Kritik | 18 |
| 🟡 Orta | 16 |
| 🟢 Düşük | 8 |

**Ana sorun:** Sayfaların büyük çoğunluğunda Türkçe çeviri yapılmamış. Başlıklar `t()` ile çevrilirken, gövde metinleri, açıklamalar ve CTA butonları hardcoded İngilizce olarak bırakılmış.

---

## 📄 Sayfa: `/tr` (Ana Sayfa)

### 1. Stats alanı İngilizce
- **Tip:** i18n
- **Açıklama:** Hero altındaki istatistik kartlarında "Deliveries", "Success Rate", "Avg Latency" etiketleri Türkçe'ye çevrilmemiş. Kodda hardcoded olarak `label: 'Deliveries'` şeklinde yazılmış.
- **Kaynak:** `dashboard/src/app/[locale]/page.tsx` satır 194-196
- **Ciddiyet:** 🔴 Kritik

### 2. Kod bloğu yorumları İngilizce
- **Tip:** i18n
- **Açıklama:** Ana sayfadaki `send-webhook.sh` kod bloğundaki `# Create an endpoint` ve `# Send a webhook` yorumları İngilizce. (Teknik içerik olduğu için düşük öncelik)
- **Ciddiyet:** 🟢 Düşük

---

## 📄 Sayfa: `/tr/about` (Hakkında)

### 3. "Live & Operational" badge İngilizce
- **Tip:** i18n
- **Açıklama:** Sayfanın en üstündeki yeşil badge "Live & Operational" Türkçe'ye çevrilmemiş.
- **Kaynak:** Hardcoded JSX
- **Ciddiyet:** 🟡 Orta

### 4. Hero alt başlık İngilizce
- **Tip:** i18n
- **Açıklama:** "Reliable webhook delivery infrastructure built by developers, for developers." metni hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 5. Misyon bölümü tamamen İngilizce
- **Tip:** i18n
- **Açıklama:** "Webhooks are the backbone of modern integrations..." ve "We believe developers shouldn't have to pay..." paragrafları İngilizce. Başlık `t('about.ourMission')` ile Türkçe geliyor ama gövde hardcoded.
- **Ciddiyet:** 🔴 Kritik

### 6. Hikaye bölümü tamamen İngilizce
- **Tip:** i18n
- **Açıklama:** "HookSniff started as a side project in 2026..." ve devamındaki 3 paragraf İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 7. Stats "SDK Languages" ve "Starting Price" İngilizce
- **Tip:** i18n
- **Açıklama:** About sayfasındaki istatistik kartlarında `label: 'SDK Languages'` ve `label: 'Starting Price'` hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 8. Değer kartları İngilizce
- **Tip:** i18n
- **Açıklama:** "Security First", "Transparent Pricing", "Global Infrastructure" başlıkları ve açıklamaları hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 9. CTA bölümü İngilizce
- **Tip:** i18n
- **Açıklama:** "Ready to get started?", "Start Free", "Contact Us" butonları hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

---

## 📄 Sayfa: `/tr/contact` (İletişim)

### 10. E-posta kartı açıklaması İngilizce
- **Tip:** i18n
- **Açıklama:** "Use the form below 👇" metni hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

### 11. Yanıt süresi İngilizce
- **Tip:** i18n
- **Açıklama:** "Usually within 24 hours" metni hardcoded İngilizce. Türkçe karşılığı "Genellikle 24 saat içinde" olmalı.
- **Ciddiyet:** 🟡 Orta

### 12. Form gönderim mesajları İngilizce
- **Tip:** i18n
- **Açıklama:** "Message sent! We'll get back to you soon." ve "Failed to send. Please try again or reach us on GitHub Discussions." mesajları hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

### 13. Form placeholder İngilizce
- **Tip:** i18n
- **Açıklama:** Mesaj textarea'sının placeholder'ı "How can we help?" İngilizce.
- **Ciddiyet:** 🟢 Düşük

---

## 📄 Sayfa: `/tr/security` (Güvenlik)

### 14. Sayfa title metadata İngilizce
- **Tip:** i18n
- **Açıklama:** `<title>` etiketi "Security & Compliance — HookSniff" olarak ayarlı. Tarayıcı sekmesinde İngilizce görünüyor.
- **Kaynak:** `export const metadata = { title: 'Security & Compliance — HookSniff' }`
- **Ciddiyet:** 🟡 Orta

### 15. Badge "Security & Compliance" İngilizce
- **Tip:** i18n
- **Açıklama:** Sayfa üstündeki yeşil badge hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

### 16. Hero başlık ve açıklama İngilizce
- **Tip:** i18n
- **Açıklama:** "Enterprise-grade security, startup-friendly pricing" ve "Security is not optional..." hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 17. 12 güvenlik özelliği tamamen İngilizce
- **Tip:** i18n
- **Açıklama:** TLS 1.3, HMAC-SHA256, 2FA, SSO, IP Whitelisting vb. tüm başlıklar ve açıklamalar hardcoded İngilizce dizi içinde.
- **Ciddiyet:** 🔴 Kritik

### 18. Compliance bölümü İngilizce
- **Tip:** i18n
- **Açıklama:** "Compliance & Standards" başlığı, GDPR, SOC 2, CCPA, KVKK açıklamaları hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 19. "Responsible Disclosure" bölümü İngilizce
- **Tip:** i18n
- **Açıklama:** "Found a security vulnerability?" ve "We commit to acknowledging..." metinleri İngilizce.
- **Ciddiyet:** 🟡 Orta

### 20. CTA "Security questions?" İngilizce
- **Tip:** i18n
- **Açıklama:** Alt CTA bölümü "Security questions?", "Our team is happy to discuss...", "Contact us →" butonu İngilizce.
- **Ciddiyet:** 🟡 Orta

---

## 📄 Sayfa: `/tr/get-started` (Başlayın)

### 21. Sayfa title metadata İngilizce
- **Tip:** i18n
- **Açıklama:** Tarayıcı sekmesi "HookSniff — Webhook Delivery Service" İngilizce.
- **Ciddiyet:** 🟢 Düşük

### 22. SDK kod örnekleri yorumları İngilizce
- **Tip:** i18n
- **Açıklama:** Node.js, Python, Go, Rust, curl kod bloklarındaki yorum satırları İngilizce. (Teknik içerik, düşük öncelik)
- **Ciddiyet:** 🟢 Düşük

### 23. Event tipleri kategorileri İngilizce
- **Tip:** i18n
- **Açıklama:** "💳 Payments", "👤 Users", "📦 Orders" gibi event kategori başlıkları İngilizce emoji + İngilizce metin.
- **Ciddiyet:** 🟡 Orta

---

## 📄 Sayfa: `/tr/what-is-a-webhook` (Webhook Nedir?)

### 24. Sayfa title metadata İngilizce
- **Tip:** i18n
- **Açıklama:** `<title>` "What is a Webhook? A Complete Guide — HookSniff" İngilizce.
- **Ciddiyet:** 🟡 Orta

### 25. Nav breadcrumb "What is a Webhook?" İngilizce
- **Tip:** i18n
- **Açıklama:** Navigasyon breadcrumb'ında hardcoded "What is a Webhook?" yazısı.
- **Ciddiyet:** 🟡 Orta

### 26. Sayfa başlık ve alt başlık İngilizce
- **Tip:** i18n
- **Açıklama:** "What is a Webhook?" h1 ve "A complete guide to webhooks..." açıklaması hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 27. Tüm gövde içerik İngilizce
- **Tip:** i18n
- **Açıklama:** Basit açıklama, pizza benzetmesi, "how it works" adımları, "common use cases" kartları, güvenlik açıklamaları, "getting started" adımları, "Pro tip" kutusu, CTA — tamamı hardcoded İngilizce. Sadece bölüm başlıkları (`t()`) Türkçe geliyor.
- **Ciddiyet:** 🔴 Kritik

---

## 📄 Sayfa: `/tr/startups` (Girişimler)

### 28. Sayfa title metadata İngilizce
- **Tip:** i18n
- **Açıklama:** `<title>` "HookSniff for Startups — Special Pricing" İngilizce.
- **Ciddiyet:** 🟡 Orta

### 29. Badge "🚀 Startup Program" İngilizce
- **Tip:** i18n
- **Açıklama:** Üst badge hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

### 30. Alt başlık İngilizce
- **Tip:** i18n
- **Açıklama:** "Special pricing for early-stage startups. Focus on your product, not webhook infrastructure." hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 31. 3 fayda kartı tamamen İngilizce
- **Tip:** i18n
- **Açıklama:** "50% off Pro", "Extended free tier", "Priority support" başlıkları ve açıklamaları hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 32. "Who qualifies?" bölümü İngilizce
- **Tip:** i18n
- **Açıklama:** "Who qualifies?" başlığı ve "Pre-Series A startups", "Less than $1M in funding" vb. 5 madde hardcoded İngilizce.
- **Ciddiyet:** 🔴 Kritik

### 33. CTA "Apply now →" İngilizce
- **Tip:** i18n
- **Açıklama:** "Tell us about your startup..." ve "Apply now →" butonu hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

---

## 📄 Sayfa: `/tr/providers/stripe`

### 34. Alt başlık İngilizce
- **Tip:** i18n
- **Açıklama:** "Receive and verify Stripe webhooks for payments..." hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

### 35. "Quick Start" başlığı İngilizce
- **Tip:** i18n
- **Açıklama:** "⚡ Quick Start" ve adım açıklamaları ("Sign up and create an endpoint...", "In Stripe Dashboard → Developers → Webhooks...") hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

### 36. "Start for free →" butonu İngilizce
- **Tip:** i18n
- **Açıklama:** Sayfa altındaki CTA butonu hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

---

## 📄 Sayfa: `/tr/providers/github`

### 37. Alt başlık İngilizce
- **Tip:** i18n
- **Açıklama:** "Set up GitHub webhooks for push, pull request..." hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

### 38. "Quick Start" başlığı ve adımlar İngilizce
- **Tip:** i18n
- **Açıklama:** "⚡ Quick Start" ve adım 1-3 açıklamaları İngilizce. Adım başlıkları Türkçe ama açıklamalar İngilizce.
- **Ciddiyet:** 🟡 Orta

---

## 📄 Sayfa: `/tr/providers/shopify`

### 39. Alt başlık İngilizce
- **Tip:** i18n
- **Açıklama:** "Integrate Shopify webhooks for orders, products..." hardcoded İngilizce.
- **Ciddiyet:** 🟡 Orta

### 40. "Quick Start" başlığı ve adımlar İngilizce
- **Tip:** i18n
- **Açıklama:** "⚡ Quick Start" ve adım açıklamaları İngilizce.
- **Ciddiyet:** 🟡 Orta

---

## 📄 Sayfa Geneli Sorunlar

### 41. Footer link etiketleri çevrilmemiş
- **Tip:** i18n
- **Açıklama:** `tr.json` dosyasında footer linklerinin çoğu Türkçe'ye çevrilmemiş: "Pricing", "Use Cases", "Compare", "Customers", "Security", "Playground", "Startups", "Newsletter" → Hepsi İngilizce kalmış.
- **Kaynak:** `dashboard/src/messages/tr.json` → `landing.footer.*`
- **Ciddiyet:** 🟡 Orta

### 42. Sayfa metadata title'ları İngilizce
- **Tip:** i18n
- **Açıklama:** security, startups, what-is-a-webhook, providers sayfalarının `<title>` etiketleri hardcoded İngilizce. Tarayıcı sekmesinde Türkçe sayfada İngilizce başlık görünüyor. Layout'taki default title da İngilizce: "HookSniff — Webhook Delivery Service".
- **Kaynak:** Her sayfanın `export const metadata` satırı
- **Ciddiyet:** 🟡 Orta

---

## 🔧 Önerilen Düzeltmeler

### Yüksek öncelik (🔴 Kritik):
1. **About sayfası:** Tüm hardcoded İngilizce metinleri `t()` çevirisi ile değiştir
2. **Security sayfası:** features/compliance dizilerini `t()` ile yeniden yapılandır
3. **What-is-a-webhook sayfası:** Tüm gövde içeriğini çevir
4. **Startups sayfası:** Fayda kartları ve kriterler bölümünü çevir
5. **Homepage stats:** "Deliveries", "Success Rate", "Avg Latency" → `t()` ile Türkçe'ye çevir

### Orta öncelik (🟡 Orta):
6. Footer linklerini `tr.json`'da çevir (Pricing → Fiyatlandırma, Use Cases → Kullanım Alanları, Compare → Karşılaştır, Customers → Müşteriler, Security → Güvenlik, Playground → Deneme Alanı, Startups → Girişimler, Newsletter → Bülten)
7. Tüm sayfa metadata title'larını locale-aware yap
8. Contact sayfası sabit metinlerini çevir

### Düşük öncelik (🟢 Düşük):
9. Kod bloklarındaki yorumları çevirmeyi değerlendir (teknik içerik)
10. Form placeholder'larını çevir

---

## 🧪 Dark Mode Notları

Dark mode sınıfları (`dark:` prefix) genel olarak tutarlı kullanılmış. Tespit edilen renk sorunları:

- **CTA kutuları:** `bg-gray-900 dark:bg-slate-800` → dark mode'da yeterli kontrast mevcut ✅
- **Badge'ler:** `dark:bg-brand-500/10`, `dark:text-brand-400` → okunabilir ✅
- **Tablo satırları:** `dark:border-slate-800` → yeterli kontrast ✅
- **Genel:** Dark mode'da okunmayan metin sorunu tespit edilmedi

---

## 📱 Responsive Notları

Tüm sayfalarda `md:` ve `lg:` breakpoint'leri tutarlı kullanılmış. Grid yapıları (`grid-cols-1 md:grid-cols-3` vb.) doğru ayarlanmış. Taşan içerik sorunu tespit edilmedi. ✅

---

## 🎨 Tutarlılık Notları

- **Renk şeması:** Tutarlı ✅ (brand-600, slate-900, emerald-500 palette)
- **Font:** Tutarlı ✅
- **Buton stilleri:** Tutarlı ✅ (rounded-xl, consistent padding)
- **Kart stilleri:** Tutarlı ✅ (bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800)
- **Boşluk:** Tutarlı ✅ (py-16, gap-6 pattern)
