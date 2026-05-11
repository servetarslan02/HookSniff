# HookSniff — Footer & Navigasyon Tutarlılık Raporu

**Tarih:** 2026-05-12  
**Kontrol edilen sayfa sayısı:** 16  
**Toplam bulunan sorun:** 47

---

## 📊 Özet

| Kategori | Sorun Sayısı |
|---|---|
| Footer eksik | 12 sayfa |
| Footer tutarsız | 3 varyant |
| Navbar tutarsız | 15 sayfa |
| Dark mode eksik | 15 sayfa |
| "Panel →" eksik/tutarsız | 15 sayfa |
| Logo link tutarsızlığı | 8 sayfa |
| Kırık link | 2 sayfa |
| Dil sorunu (EN/TR karışık) | 10 sayfa |

---

## 🔴 KRİTİK: Footer Sorunları

### Genel Durum
- **Sadece 2 sayfada gerçek footer var** (ana sayfa ve docs)
- **1 sayfada minimal footer var** (status)
- **13 sayfada footer tamamen eksik**

### `/tr` (Ana Sayfa) — REFERANS FOOTER
- ✅ Footer var
- ✅ Logo: 🪝 HookSniff
- ✅ Link listesi: GitHub, Dokümantasyon, Durum, Hakkında, SSS, İletişim, Şartlar, Gizlilik
- ✅ Copyright: © 2026 HookSniff. Tüm hakları saklıdır.
- ❌ Sosyal medya ikonları yok (Twitter/X, LinkedIn, Discord)
- ❌ "Panel →" linki footer'da yok

### `/tr/docs` — FARKLI FOOTER
- Açıklama: Docs sayfasının footer'ı ana sayfadan tamamen farklı yapıda
- Beklenen: Ana sayfa ile aynı footer
- Mevcut: 4 sütunlu ayrıntılı footer (Ürün, Compare, Kaynaklar, Şirket)
- Farklar:
  - Kategorize edilmiş link yapısı (ana sayfada düz liste)
  - "Compare" kategorisi (alternatif karşılaştırma sayfaları)
  - "Kaynaklar" kategorisi (webhook rehberleri, sözlük, blog)
  - Farklı link seti

### `/tr/status` — MİNİMAL FOOTER
- Açıklama: Status sayfasında sadece alt bilgi var, gerçek footer yok
- Beklenen: Ana sayfa ile aynı footer
- Mevcut: "Version 0.1.0 • hooksniff.vercel.app • Dokümanlar • Powered by HookSniff monitoring"

### Footer Olmayan Sayfalar (12 sayfa):
1. `/tr/pricing`
2. `/tr/about`
3. `/tr/contact`
4. `/tr/faq`
5. `/tr/terms`
6. `/tr/privacy`
7. `/tr/get-started`
8. `/tr/what-is-a-webhook`
9. `/tr/startups`
10. `/tr/security`
11. `/tr/providers/stripe`
12. `/tr/providers/github`
13. `/tr/providers/shopify`

---

## 🔴 KRİTİK: Navbar Tutarsızlığı

### 3 Farklı Navbar Varyantı Mevcut:

#### Varyant 1: Tam Navbar (sadece `/tr` ana sayfa)
```
🪝 HookSniff | Özellikler | Fiyatlandırma | Başlayın | Dokümanlar | Durum | [Dil değiştir] | [🌙 Dark Mode] | [Panel →]
```

#### Varyant 2: Docs Navbar (sadece `/tr/docs`)
```
🪝 HookSniff docs.docs | [Dil değiştir] | Kontrol Paneli | Ana Sayfa
```
- "docs.docs" yazısı garip/broken görünüyor
- "Kontrol Paneli" → "Panel →" ile tutarsız

#### Varyant 3: Minimal Navbar (diğer 14 sayfa)
```
🪝 HookSniff / [Sayfa Adı] | [Dil değiştir]
```

### `/tr/docs` — Navbar Sorunu
- Açıklama: Logo yanında "docs.docs" yazısı var
- Beklenen: "Dokümanlar" veya "Docs" (Türkçe locale'de)
- Mevcut: "docs.docs" (broken/stilize edilmemiş)

### `/tr/pricing` — Navbar
- Açıklama: Sadece logo + dil değiştirici
- Beklenen: Tam navbar (ana sayfadaki gibi)
- Mevcut: Minimal navbar

### `/tr/about` — Navbar
- Açıklama: Sadece logo + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Minimal navbar

### `/tr/contact` — Navbar
- Açıklama: Sadece logo + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Minimal navbar

### `/tr/status` — Navbar
- Açıklama: Logo + "🔔 Subscribe to updates" butonu + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Özel navbar (farklı yapı)

### `/tr/faq` — Navbar
- Açıklama: Sadece logo + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Minimal navbar

### `/tr/get-started` — Navbar
- Açıklama: Logo + dil değiştirici + "Ücretsiz Hesap Oluştur" linki
- Beklenen: Tam navbar
- Mevcut: Özel navbar

### `/tr/what-is-a-webhook` — Navbar
- Açıklama: Sadece logo + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Minimal navbar

### `/tr/startups` — Navbar
- Açıklama: Sadece logo + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Minimal navbar

### `/tr/security` — Navbar
- Açıklama: Sadece logo + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Minimal navbar

### `/tr/providers/stripe` — Navbar
- Açıklama: Logo + breadcrumb (Sağlayıcılar / Stripe) + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Breadcrumb'lı minimal navbar

### `/tr/providers/github` — Navbar
- Açıklama: Logo + breadcrumb (Sağlayıcılar / GitHub) + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Breadcrumb'lı minimal navbar

### `/tr/providers/shopify` — Navbar
- Açıklama: Logo + breadcrumb (Sağlayıcılar / Shopify) + dil değiştirici
- Beklenen: Tam navbar
- Mevcut: Breadcrumb'lı minimal navbar

---

## 🔴 Dark Mode Toggle

### Durum
- **Sadece ana sayfada (`/tr`) dark mode toggle var**
- **Diğer 15 sayfada dark mode toggle eksik**

### Etkilenen Sayfalar:
1. `/tr/docs`
2. `/tr/pricing`
3. `/tr/about`
4. `/tr/contact`
5. `/tr/status`
6. `/tr/faq`
7. `/tr/terms`
8. `/tr/privacy`
9. `/tr/get-started`
10. `/tr/what-is-a-webhook`
11. `/tr/startups`
12. `/tr/security`
13. `/tr/providers/stripe`
14. `/tr/providers/github`
15. `/tr/providers/shopify`

---

## 🔴 "Panel →" Linki Tutarsızlığı

### Durum
- `/tr` (ana sayfa): ✅ "Panel →" → `/tr/dashboard`
- `/tr/docs`: ⚠️ "Kontrol Paneli" → `/tr/dashboard` (farklı metin)
- Diğer 14 sayfa: ❌ "Panel →" linki yok

---

## 🔴 Logo Link Tutarsızlığı

### `/tr` (ana sayfa) → `/tr`
- Logo linki locale-aware ✅

### `/tr/docs` → `/tr`
- Logo linki locale-aware ✅

### `/tr/pricing` → `/`
- Açıklama: Logo `/` (root) linkine gidiyor
- Beklenen: `/tr` (locale-aware)
- Mevcut: `/` (locale kaybedilir)

### `/tr/about` → `/`
- Açıklama: Logo `/` linkine gidiyor
- Beklenen: `/tr`
- Mevcut: `/`

### `/tr/contact` → `/`
- Açıklama: Logo `/` linkine gidiyor
- Beklenen: `/tr`
- Mevcut: `/`

### `/tr/terms` → `/`
- Açıklama: Logo `/` linkine gidiyor
- Beklenen: `/tr`
- Mevcut: `/`

### `/tr/privacy` → `/`
- Açıklama: Logo `/` linkine gidiyor
- Beklenen: `/tr`
- Mevcut: `/`

### `/tr/status` → `/tr`
- Logo linki locale-aware ✅

### `/tr/faq` → `/tr`
- Logo linki locale-aware ✅

### `/tr/get-started` → `/tr`
- Logo linki locale-aware ✅

### `/tr/what-is-a-webhook` → `/tr`
- Logo linki locale-aware ✅

### `/tr/startups` → `/tr`
- Logo linki locale-aware ✅

### `/tr/security` → `/tr`
- Logo linki locale-aware ✅

### `/tr/providers/*` → `/tr`
- Logo linki locale-aware ✅

---

## 🔴 Kırık Linkler

### `/tr/terms` — Kırık Link
- Açıklama: Sayfa içinde "contact form" linki `/contact`'a gidiyor
- Beklenen: `/tr/contact`
- Mevcut: `/contact` (locale kaybedilir)

### `/tr/security` — Kırık Link
- Açıklama: "Responsible Disclosure" bölümündeki "contact form" linki `/contact`'a gidiyor
- Beklenen: `/tr/contact`
- Mevcut: `/contact` (locale kaybedilir)

---

## 🟡 Dil Sorunları (TR locale'de İngilizce İçerik)

### `/tr/what-is-a-webhook` — Tamamen İngilizce
- Açıklama: /tr/ altında olmasına rağmen neredeyse tamamen İngilizce içerik
- Beklenen: Türkçe içerik
- Mevcut: Başlık "What is a Webhook?", tüm paragraflar İngilizce

### `/tr/security` — Büyük Oranda İngilizce
- Açıklama: Başlıklar ve açıklamalar çoğunlukla İngilizce
- Örnekler: "Enterprise-grade security, startup-friendly pricing", "TLS 1.3 Everywhere", "HMAC-SHA256 Signatures", "Contact us →"

### `/tr/startups` — Büyük Oranda İngilizce
- Açıklama: İçeriğin çoğu İngilizce
- Örnekler: "Startup Program", "50% off Pro", "Extended free tier", "Who qualifies?", "Apply now →"

### `/tr/about` — Karışık
- Açıklama: Bazı başlıklar ve CTA'lar İngilizce
- Örnekler: "Security First", "Transparent Pricing", "Start Free", "Contact Us"

### `/tr/contact` — Karışık
- Açıklama: Form placeholder ve bazı metinler İngilizce
- Örnekler: "Use the form below 👇", "Usually within 24 hours", "How can we help?"

### `/tr/get-started` — Karışık
- Açıklama: Bazı başlıklar İngilizce
- Örnekler: "Payments", "Users", "Orders", "Email", "Notifications" (olay türü referansı)

### `/tr/pricing` — Karışık
- Açıklama: Bazı metinler İngilizce
- Örnekler: "All data encrypted in transit", "Security controls in place", "EU data processing"

### `/tr/status` — Karışık
- Açıklama: Durum mesajları ve butonlar İngilizce
- Örnekler: "Subscribe to updates", "All Systems Operational", "Refresh", "Operational", "Resolved"

### `/tr/providers/stripe` — Karışık
- Açıklama: Section başlıkları İngilizce
- Örnekler: "Quick Start", "Common Stripe Events", "Node.js Example", "Start for free →"

### `/tr/providers/github` — Karışık
- Açıklama: Section başlıkları İngilizce
- Örnekler: "Quick Start", "Common GitHub Events", "Start for free →"

### `/tr/providers/shopify` — Karışık
- Açıklama: Section başlıkları İngilizce
- Örnekler: "Quick Start", "Common Shopify Events", "Start for free →"

---

## 🟡 Docs Sayfası İç Linkler — Locale Eksik

### `/tr/docs` — İçerik Linkleri
- Açıklama: Docs ana sayfasındaki kartlar `/docs/quickstart`, `/docs/concepts` gibi linklere gidiyor
- Beklenen: `/tr/docs/quickstart`, `/tr/docs/concepts`
- Mevcut: `/docs/quickstart` (locale kaybedilir)

---

## ✅ Çalışan Özellikler

### Dil Değiştirici
- ✅ Tüm 15 sayfada mevcut (get-started hariç kontrol edildi)
- ✅ "TR Türkçe" gösteriyor
- ✅ Türkçe locale korunuyor

### Locale Korunması
- ✅ Navbar linklerindeki `/tr/` prefix'i tutarlı
- ✅ Footer linklerinde `/tr/` prefix'i mevcut (docs sayfası)
- ✅ Sayfalar arası geçişlerde `/tr/` korunuyor

---

## 📋 Öncelikli Aksiyon Listesi

### P0 (Kritik — Hemen düzeltilmeli)
1. **Tüm sayfalara footer ekle** — Tekrar kullanılabilir bir footer bileşeni oluştur
2. **Tüm sayfalara tutarlı navbar ekle** — Tam navbar bileşeni (logo + nav linkleri + dil değiştirici + dark mode + Panel →)
3. **Kırık linkleri düzelt** — `/contact` → `/tr/contact` (terms ve security sayfaları)

### P1 (Yüksek — Kısa vadede)
4. **Dark mode toggle'ı tüm sayfalara ekle**
5. **"Panel →" linkini tüm sayfalara ekle** — Tutarlı metin kullan
6. **Logo link tutarlılığı** — Tüm logolar `/tr`'ye linklenmeli
7. **Docs iç linklerini düzelt** — `/docs/quickstart` → `/tr/docs/quickstart`

### P2 (Orta — Dil düzeltmeleri)
8. **what-is-a-webhook sayfasını Türkçeleştir**
9. **security sayfasını Türkçeleştir**
10. **startups sayfasını Türkçeleştir**
11. **Diğer sayfalardaki İngilizce metinleri Türkçeleştir**

### P3 (Düşük — İyileştirmeler)
12. **Sosyal medya ikonlarını footer'a ekle** (Twitter/X, LinkedIn, Discord)
13. **"docs.docs" yazısını düzelt** → "Dokümanlar"
14. **Status sayfası footer'ını standartlaştır**
