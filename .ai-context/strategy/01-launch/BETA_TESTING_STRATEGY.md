# HookSniff — Beta Testing Stratejisi
> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulandı)
> Durum: Taslak
> Öncelik: 🔴 Lansmandan önce

## İçindekiler
1. [Mevcut Durum](#1-mevcut-durum)
2. [Rakip Karşılaştırması](#2-rakip-karşılaştırması)
3. [Standart/Best Practice](#3-standartbest-practice)
4. [Strateji](#4-strateji)
5. [Uygulama Planı](#5-uygulama-planı)
6. [Metrikler](#6-metrikler)
7. [Riskler](#7-riskler)
8. [Notlar](#8-notlar)

---

## 1. Mevcut Durum

### HookSniff'in Bugünkü Durumu
- **Ürün**: 11 SDK yayınlandı, 1378 test, dashboard canlı (Vercel), API deployed (Cloud Run)
- **Test kullanıcıları**: Henüz gerçek kullanıcı yok
- **Feedback mekanizması**: Yok
- **Beta signup formu**: Yok
- **Bug tracking**: Sadece GitHub issues
- **Onboarding flow**: Strateji raporu hazır, uygulanmamış
- **Community**: Discord planlandı ama aktif değil
- **Analytics**: PostHog entegre değil (BETA_TESTING_STRATEGY ile eş zamanlı)

### Eksiklikler
| Alan | Durum | Öncelik |
|------|-------|---------|
| Beta kullanıcı listesi | ❌ | 🔴 |
| Feedback toplama sistemi | ❌ | 🔴 |
| Bug triage süreci | ❌ | 🔴 |
| Beta onboarding email sequence | ❌ | 🔴 |
| NPS/satisfaction survey | ❌ | 🟡 |
| Beta community (Discord) | ❌ | 🟡 |
| Beta signup formu | ❌ | 🔴 |
| Quick start guide | ❌ | 🔴 |

---

## 2. Rakip Karşılaştırması

### Rakip Beta/Lansman Süreçleri

| Aşama | Svix | Hookdeck | HookSniff Hedef |
|-------|------|----------|-----------------|
| Lansman YC | ✅ YC W21 | ❌ | ❌ |
| İlk yatırımcı | a16z, Aleph | — | — |
| Open-source | ✅ GitHub | ❌ | ✅ GitHub |
| Beta program | Kapalı beta → open | Early access | Kapalı beta → open |
| Müşteri profili | Enterprise (Brex, Twilio) | Mid-market | Startup + solo dev |
| Pricing | $490/ay (Professional) | $39/ay (Team) | $29/ay (Plan) |

### Rakip Launch Stratejileri (Doğrulanmış)

**Svix:**
- YC-backed, a16z yatırımcı
- Fortune 500 müşterileri (Brex, PagerDuty, Twilio, Replicate)
- Open-source GitHub repo → developer trust
- Professional plan: $490/ay (HookSniff'ten 17x pahalı)

**Hookdeck:**
- Developer-focused, SoC2 compliance
- Free tier: 10K event, 3 gün retention
- Team plan: $39/ay
- Built-in metrics dashboard

---

## 3. Standart/Best Practice

### BetaList Verileri (Doğrulanmış — 2025)

Kaynak: awesome-directories.com (50+ launch analizi)

| Metrik | Değer | Not |
|--------|-------|-----|
| Ziyaretçi | 200-1.000 | Ortalama: 200-500 |
| Signup | 50-400 | Ortalama: 50-200 |
| Conversion rate | **%15-20** | Product Hunt'tan 5-7x yüksek |
| Maliyet/signup | $0.50-$1.40 | Ücretsiz tier da mevcut |
| Ziyaretçi profili | Early adopter, tech-savvy | Ürün test etmeye istekli |

**BetaList vs Product Hunt:**
| Platform | Conversion | Ziyaretçi Profili |
|----------|-----------|-------------------|
| BetaList | %15-20 | Early adopter, test etmeye istekli |
| Product Hunt | %1-3 | Innovation tourist, casual browser |

**BetaList Başarı Faktörleri:**
- ✅ Açık unique value proposition
- ✅ Landing page A/B test (launch sırasında)
- ✅ Tech-savvy audience (developer tools uygun)
- ❌ B2B hiring tools gibi niche ürünler için uygun değil

### Canny Feedback Tool (Doğrulanmış — 2026-05-10)

Kaynak: canny.io/pricing

| Plan | Fiyat | Tracked Users | Özellikler |
|------|-------|---------------|------------|
| **Free** | $0/ay | 25 | Unlimited posts, boards, changelog |
| **Core** | $19/ay | 100+ | Custom domain, translations |
| **Pro** | $79/ay | 100+ | PM integrations, advanced privacy |
| **Business** | Özel | 5.000+ | SSO, CRM integrations |

**Canny Free Plan Detayları:**
- 25 tracked user (feedback bırakan kullanıcı)
- Unlimited post ve board
- Automatic feedback capture (AI)
- 5 manager
- Public roadmap
- Changelog

**HookSniff Beta Dönemi İçin**: Canny Free plan yeterli (25 tracked user başlangıçta yeterli).

### Beta Kullanıcı Bulma Yöntemleri (Doğrulanmış)

Kaynak: Canny blog, founder case studies

| Yöntem | Beklenen Sonuç | Maliyet |
|--------|---------------|---------|
| **BetaList** | 200-500 ziyaretçi, 50-200 signup | $0-$99 |
| **Product Hunt** | 1.000-5.000 ziyaretçi, 30-150 signup | Ücretsiz |
| **Hacker News (Show HN)** | 500-5.000 ziyaretçi | Ücretsiz |
| **Reddit** (r/webdev, r/SaaS) | 100-500 ziyaretçi | Ücretsiz |
| **Dev.to** makale | 200-1.000 ziyaretçi | Ücretsiz |
| **Twitter/X** thread | 100-500 ziyaretçi | Ücretsiz |
| **Discord topluluklar** | 20-50 signup | Ücretsiz |
| **Kişisel network** | 10-30 signup | Ücretsiz |

### Beta Tester Incentive Önerileri

Kaynak: Canny blog "Finding Beta Testers"

| Incentive | Uygunluk | Maliyet |
|-----------|----------|---------|
| Lifetime discount (%50) | ✅ En etkili | Gelir kaybı |
| Free plan upgrade | ✅ Etkili | $0 |
| Exclusive Discord kanalı | ✅ Etkili | $0 |
| Shoutout (Twitter/blog) | ✅ Orta etkili | $0 |
| Amazon gift card ($10-25) | ⚠️ Düşük etkili | $10-25/kişi |
| T-shirt/swag | ⚠️ Düşük etkili | $15-30/kişi |

---

## 4. Strateji

### 4.1 Beta Program Yapısı

**Süre**: 4 hafta
**Hedef**: 30-50 aktif beta kullanıcısı
**Pricing**: Ücretsiz (full access, limitsiz)
**Destek**: Discord + 1:1 onboarding call

### 4.2 Kullanıcı Bulma Planı

**Kanal 1: BetaList (Gün 1)**
- betalist.com'a submit et
- Hedef: 200-500 ziyaretçi, 50-100 signup
- Maliyet: Ücretsiz (paid tier opsiyonel: $99)
- Beklenişi: %15-20 conversion rate

**Kanal 2: Hacker News — Show HN (Gün 1)**
- "Show HN: HookSniff – Open-source webhook delivery with FIFO, schema registry"
- Hedef: 500-2.000 ziyaretçi
- Timing: Salı-Perşembe, 09:00-11:00 EST (en yüksek trafik)

**Kanal 3: Reddit (Gün 2-3)**
- r/webdev: "I built an open-source webhook service – looking for beta testers"
- r/SaaS: "Launching HookSniff: webhook delivery as a service"
- r/devops: Webhook management ile ilgili post
- r/programming: Teknik deep-dive post

**Kanal 4: Dev.to Makale (Gün 3-5)**
- "Why I Built a Webhook Service (and What I Learned)"
- Teknik, developer-focused
- İçerik: FIFO delivery, schema registry, CloudEvents

**Kanal 5: Twitter/X Thread (Gün 1)**
- "We just launched HookSniff beta. Here's why webhooks need fixing 🧵"
- 8-12 tweet thread
- HookSniff'in rakiplerden farkları

**Kanal 6: Discord Topluluklar (Gün 1-7)**
- Dev tool Discord'ları
- Webhook/API ile ilgili kanallar
- Direkt mesaj ile davet (spam değil)

**Kanal 7: Kişisel Network (Gün 1)**
- Arkadaşlar, eski iş arkadaşları
- Startup CTO'lar
- 1:1 mesaj ile davet

### 4.3 Beta Signup Formu

**Tool: Tally.so (Free) veya Google Forms**

Sorular:
```
1. Email adresiniz *
2. GitHub kullanıcı adınız (opsiyonel)
3. Hangi dil/platform için webhook kullanıyorsunuz?
   [ ] Node.js  [ ] Python  [ ] Rust  [ ] Go  [ ] Java  [ ] Diğer: ___
4. Ne için webhook kullanıyorsunuz?
   [ ] Payment notifications  [ ] CI/CD  [ ] Third-party API  [ ] Diğer: ___
5. Şu an hangi webhook tool'u kullanıyorsunuz?
   [ ] Kendi sistemim  [ ] Svix  [ ] Hookdeck  [ ] Yok  [ ] Diğer: ___
6. Beta'da neyi test etmek istiyorsunuz? (opsiyonel, serbest metin)
```

### 4.4 Beta Onboarding Akışı

```
Beta Signup Form
    ↓
Hoşgeldin emaili (24 saat içinde)
  - Dashboard linki (https://hooksniff.vercel.app)
  - Quick start guide linki
  - Discord daveti
  - "Herhangi bir sorun olursa direkt yanıtla"
    ↓
1:1 onboarding call (ilk 20 kişiye, opsiyonel)
  - 15-20 dakika
  - Live demo: endpoint oluşturma + webhook gönderme
  - Sorular + feedback
    ↓
Gün 1 takibi
  - "İlk webhook gönderdin mi?" check email
    ↓
Gün 3 takibi
  - "Nasılsın? Bir sorun var mı?" email
    ↓
Gün 7 takibi
  - Feedback formu (Canny link veya Google Form)
    ↓
Haftalık update (her pazartesi)
  - Yeni feature'lar
  - Bug fix'ler
  - Roadmap güncellemesi
    ↓
Gün 28: Beta sonu survey
  - NPS (0-10)
  - Feature priority ranking
  - Pricing feedback
  - Referans isteği
```

### 4.5 Email Template'leri

**Template 1: Hoşgeldin Emaili**
```
Subject: 🎉 HookSniff Beta'ya hoş geldin!

Merhaba [isim],

HookSniff beta programına katıldığın için teşekkürler!

İşte hızlı başlangıç:

1. Dashboard: https://hooksniff.vercel.app
2. Quick Start Guide: [link]
3. Discord: [davet linki]

İlk webhook'ını göndermek yaklaşık 5 dakika sürüyor.
Bir sorun olursa bu email'e yanıtla veya Discord'da yaz.

Başarılar,
HookSniff ekibi
```

**Template 2: Gün 1 Check**
```
Subject: İlk webhook'ını gönderdin mi?

Merhaba [isim],

Dün beta'ya katıldın — ilk webhook'ını gönderdin mi?

Evet → Harika! Deneyimini Discord'da paylaşır mısın?
Hayır → Sorun mu var? İşte yardım: [quick start link]
```

**Template 3: Haftalık Update**
```
Subject: HookSniff Beta — Hafta [X] Güncellemesi

Bu hafta neler değişti:
✅ [Yeni feature]
🐛 [Bug fix]
📋 Sırada: [Gelecek feature]

Feedback: [Canny link]
Discord: [link]
```

**Template 4: Beta Sonu Survey**
```
Subject: Beta bitti — görüşlerini paylaşır mısın?

Merhaba [isim],

4 haftalık beta süreci sona erdi. Deneyimlerin çok değerli!

2 dakikalık survey: [Tally.so link]

Teşekkürler,
HookSniff ekibi
```

### 4.6 Feedback Toplama Sistemi

**Tool: Canny (Free plan — 25 tracked user)**

Kurulum:
1. canny.io → Free plan signup
2. Board oluştur: "Feature Requests"
3. Board oluştur: "Bug Reports"
4. Public roadmap oluştur
5. HookSniff dashboard'a widget ekle (Canny embed code)

**Discord Kanalları:**
```
#beta-general       → Genel sohbet
#beta-feedback      → Feature request + bug report
#beta-announcements → Yeni feature'lar (sadece admin)
#beta-help          → Teknik destek
```

**Feedback Priority Matrix:**
| Öncelik | Kriter | Aksiyon |
|---------|--------|---------|
| 🔴 P0 | Kullanılamaz, veri kaybı | 2 saat içinde fix |
| 🟡 P1 | Major feature çalışmıyor | 24 saat içinde fix |
| 🟢 P2 | Workaround var | 1 hafta içinde fix |
| ⚪ P3 | Minor, cosmetic | Backlog |

### 4.7 Bug Triage Süreci

**Bug Report Template (Discord/Canny):**
```
## Bug Report
**Adım**: [Tekrar üretme adımları]
**Beklenen**: [Ne olmalıydı]
**Gerçek**: [Ne oldu]
**SDK**: [Node.js/Python/Rust/etc]
**Version**: [hooksniff-sdk versiyonu]
**Screenshot**: [varsa]
```

**Triage Akışı:**
```
Bug report geldi
    ↓
Severity belirle (P0/P1/P2/P3)
    ↓
P0 → Hemen fix → deploy (2 saat)
P1 → Ertesi gün fix (24 saat)
P2 → Haftalık sprint (1 hafta)
P3 → Backlog
    ↓
Fix → Test → Deploy
    ↓
Kullanıcıya bildirim (Discord + email)
```

### 4.8 1:1 Onboarding Call

**Kimlerle:** İlk 20 beta kullanıcısına opsiyonel call
**Süre:** 15-20 dakika
**Platform:** Google Meet / Zoom
**Agenda:**
```
1. (2 dk) Tanışma — ne için kullanıyorsun?
2. (5 dk) Live demo — endpoint oluşturma + webhook gönderme
3. (8 dk) Beraber ilk webhook'ı gönderin
4. (3 dk) Sorular + feedback
5. (2 dk) Discord'a davet, haftalık update bilgisi
```

**Notlar:**
- Her call sonrası not al (use case, pain points, feature request)
- PostHog'a event gönder: `beta_onboarding_call_completed`
- Canny'a feature request'leri kaydet

### 4.9 Beta Pricing Stratejisi

**Beta Dönemi (4 hafta):**
- ✅ Ücretsiz (full access)
- ✅ Limitsiz webhook
- ✅ Limitsiz endpoint
- ✅ Tüm feature'lar açık
- ❌ Kredi kartı gerekmez

**Beta → Launch Geçişi:**
- Beta kullanıcılarına "founding member" discount: %50 lifetime
- 7 gün önceden bildirim emaili
- Free plan'a downgrade veya $14.50/ay (Plan) / $49.50/ay (Team)

---

## 5. Uygulama Planı

### Hafta 0: Hazırlık (Lansmandan 1 hafta önce)

| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| Canny hesabı oluştur | 30 dk | canny.io | Free plan, 2 board |
| Discord kanalları oluştur | 30 dk | Discord | 4 kanal: general, feedback, announcements, help |
| Beta signup formu | 1 saat | Tally.so | 6 soru (yukarıdaki template) |
| Quick start guide yaz | 3 saat | GitHub docs | Endpoint oluşturma + SDK kurulumu + ilk webhook |
| Hoşgeldin emaili template | 1 saat | Gmail/Resend | HTML template |
| Gün 1 check email template | 30 dk | Gmail/Resend | Kısa, samimi |
| Haftalık update template | 30 dk | Gmail/Resend | Yeni feature + bug fix formatı |
| Beta sonu survey | 1 saat | Tally.so | NPS + feature priority + pricing |
| Dashboard'a Canny widget | 30 dk | Next.js | Feedback butonu |
| BetaList submission | 30 dk | betalist.com | Landing page + açıklama |

### Hafta 1: Davet + İlk Kullanıcılar

| Adım | Süre | Kanal | Detay |
|------|------|-------|-------|
| BetaList submit | 30 dk | betalist.com | "Open-source webhook service" |
| Show HN post | 1 saat | HN | Teknik açıklama + demo link |
| Twitter thread | 1 saat | X | 8-12 tweet, HookSniff farkları |
| Reddit postları | 1 saat | 3 subreddit | webdev, SaaS, devops |
| Dev.to makale | 3 saat | Dev.to | "Why I Built a Webhook Service" |
| İlk 10 kullanıcıyı davet et | 1 saat | Email | Kişisel davet |
| 1:1 onboarding call'lar | 3 saat | Meet | 6 call x 30 dk |

### Hafta 2-3: Aktif Beta

| Adım | Süre | Sıklık | Detay |
|------|------|--------|-------|
| Feedback kontrol | 15 dk | Günlük | Canny + Discord |
| Bug triage | 30 dk | Günlük | P0/P1 öncelik |
| Haftalık email | 30 dk | Haftalık | Update + feature |
| 1:1 call'lar | 2 saat | Haftalık | 4 call |
| Quick win feature | 4 saat | Haftalık | En çok istenen |

### Hafta 4: Kapanış

| Adım | Süre | Tool | Detay |
|------|------|------|-------|
| Beta sonu survey gönder | 30 dk | Email | Tally.so link |
| NPS hesapla | 15 dk | Excel | 0-10 dağılımı |
| Teşekkür emaili | 30 dk | Email | + founding member discount |
| Feedback raporu | 2 saat | Markdown | Özet + aksiyonlar |
| Beta → Launch geçiş | 1 gün | — | Pricing aktif, limits kaldır |
| NEXT_SESSION.md güncelle | 30 dk | GitHub | Sonraki oturum planı |

---

## 6. Metrikler

### Beta Başarı KPI'ları

| KPI | Hedef | Ölçüm Tool | Not |
|-----|-------|-----------|-----|
| **Beta signup sayısı** | 50+ | Tally.so | BetaList + Reddit + HN |
| **Aktif kullanıcı (haftalık)** | 30+ | PostHog DAU | Dashboard login |
| **Activation rate** | %60+ | PostHog funnel | İlk webhook gönderenler |
| **Time to first webhook** | <15 dk | PostHog timing | Signup → ilk success |
| **Feedback sayısı** | 100+ | Canny | Feature request + bug |
| **Bug report sayısı** | 20+ | GitHub + Canny | P0-P3 |
| **NPS skoru** | 40+ | Tally.so survey | 0-10 |
| **1:1 call completion** | %80+ | Calendar | İlk 20 kişi |
| **Haftalık retention** | %50+ | PostHog cohort | Beta süresince |
| **Discord katılımcısı** | 30+ | Discord | Aktif üye |

### Benchmark Karşılaştırması

| Metrik | SaaS Ortalaması | HookSniff Hedef | BetaList Verisi |
|--------|----------------|-----------------|-----------------|
| Landing page conversion | %5-10 | %15-20 | %15-20 (BetaList) |
| Beta activation rate | %30-50 | %60+ | — |
| Time to activate (dev tools) | 10-30 dk | <15 dk | — |
| NPS (beta) | 30-40 | 40+ | — |
| Week 1 retention | %30-40 | %50+ | — |

---

## 7. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Yetersiz beta kullanıcı (<30) | Orta | Yüksek | 7 kanal, kişisel davet, BetaList paid |
| Düşük engagement | Orta | Orta | 1:1 call, haftalık email, quick win feature |
| Çok fazla bug (P0) | Düşük | Yüksek | Alpha test'i önce yap, staged rollout |
| Beta kullanıcı churn | Orta | Orta | Sürekli iletişim, hızlı fix |
| Spam/abuse | Düşük | Düşük | Davet sistemi, rate limit |
| Pricing feedback olumsuz | Orta | Orta | Beta'da ücretsiz, launch'ta makul fiyat |
| Feedback overload | Orta | Düşük | Canny priority, triage süreci |
| Burnout (tek kişi) | Yüksek | Yüksek | Zaman yönetimi, template'ler |

### Fallback Plan

**Eğer 2 hafta sonunda <20 aktif kullanıcı:**
1. BetaList paid tier ($99)
2. Twitter'da developer influencer mention
3. Dev.to'da ikinci makale (farklı angle)
4. Reddit'te cross-post
5. Kişisel network genişletme

---

## 8. Notlar

### Tool Karşılaştırması (Doğrulanmış)

| Tool | Free Tier | HookSniff İçin | Kaynak |
|------|-----------|---------------|--------|
| **Canny** | 25 tracked user, unlimited post | ✅ Yeterli beta | canny.io/pricing |
| **Tally.so** | Unlimited form, unlimited response | ✅ Signup + survey | tally.so |
| **Discord** | Unlimited kanal, unlimited üye | ✅ Community | discord.com |
| **GitHub Issues** | Unlimited issue | ✅ Bug tracking | github.com |

### Maliyet Tahmini (Beta Dönemi)

| Kalem | Maliyet |
|-------|---------|
| Canny (Free plan) | $0 |
| Tally.so (Free plan) | $0 |
| Discord (Free) | $0 |
| BetaList (Free tier) | $0 |
| BetaList (Paid tier, opsiyonel) | $99 |
| Email (Gmail API mevcut) | $0 |
| **Toplam** | **$0-$99** |

### Kaynaklar
- Canny Pricing: https://canny.io/pricing (doğrulandı 2026-05-10)
- BetaList Launch Guide: https://awesome-directories.com/blog/betalist-launch-strategy-guide-2025/ (doğrulandı 2026-05-10)
- Canny "Finding Beta Testers": https://canny.io/blog/finding-beta-testers-saas/ (doğrulandı 2026-05-10)
- Product Hunt Launch Guide 2025: https://awesome-directories.com/blog/product-hunt-launch-guide-2025-algorithm-changes/ (doğrulandı 2026-05-10)
- Product Hunt Dev Tools: https://ronakganatra.com/posts/successfully-launch-dev-tools-on-producthunt (doğrulandı 2026-05-10)
- Resend Pricing: https://resend.com/pricing (doğrulandı 2026-05-10)
- Svix Pricing: https://www.svix.com/pricing/ (doğrulandı 2026-05-10)
- Hookdeck Pricing: https://hookdeck.com/pricing (doğrulandı 2026-05-10)

---

## 9. Product Hunt Launch Stratejisi (Detaylı)

### 9.1 Product Hunt Durumu 2025-2026 (Kritik Uyarı)

Kaynak: awesome-directories.com (1.077 launch analizi + Tetriz.io verisi)

**2024 Algoritma Değişikliği:**
- Eylül 2023: Ürünün/gün **47 ürün** featured oluyordu
- Eylül 2024: Sadece **16 ürün** featured oluyor
- **%66 düşüş** — featured olma oranı artık sadece **%10**

**Ne Demek Bu?**
- 10 launch'ın sadece 1'i homepage'de görünüyor
- Featured olmayan ürün neredeyse sıfır trafik alıyor
- Upvote sayısı artık tek başına yeterli değil

**Product Hunt'ın 4 Kriteri:**
1. **Useful** — Pratik ve faydalı
2. **Novel** — Yenilikçi veya özgün
3. **High Craft** — İyi tasarlanmış
4. **Creative** — Eğlenceli veya ilgi çekici

**HookSniff İçin Değerlendirme:**
| Kriter | HookSniff | Durum |
|--------|-----------|-------|
| Useful | ✅ Webhook yönetimi — gerçek problem çözüyor | Güçlü |
| Novel | ✅ FIFO, schema registry, CloudEvents — rakiplerde yok | Güçlü |
| High Craft | 🟡 Dashboard iyi ama görsel varlıklar hazırlanmalı | Orta |
| Creative | ⚠️ B2B tool — "eğlenceli" değil | Zayıf |

### 9.2 Product Hunt Submission Süreci

**Adım 1: Hesap Oluşturma (Gün -30)**
- producthunt.com → Maker hesabı
- Profil fotoğrafı, bio, sosyal medya bağlantıları
- **ÖNEMLİ:** 10 gün öncesinden platform'da aktif ol (yorum yap, upvote)

**Adım 2: Ürün Sayfası Hazırla (Gün -14)**
```
Ürün adı: HookSniff
Tagline: "Open-source webhooks with FIFO delivery, schema registry & CloudEvents"
Kategori: Developer Tools, APIs, Open Source
Website: https://hooksniff.vercel/app
GitHub: https://github.com/servetarslan02/HookSniff
```

**Adım 3: Görsel Varlıklar (Gün -10)**

| Varlık | Format | Boyut | İçerik |
|--------|--------|-------|--------|
| Logo | PNG | 240x240 | HookSniff logosu |
| Thumbnail | PNG | 240x240 | Logo + tagline |
| Gallery (4-6 görsel) | PNG/GIF | 1270x760 | Dashboard screenshot, flow diagram, SDK listesi |
| Video (opsiyonel) | MP4 | <60 sn | Quick demo: endpoint → webhook → success |

**Gallery Görselleri Planı:**
```
1. Hero: "Webhooks that actually work" — dashboard overview
2. Feature: FIFO delivery diagram
3. Feature: Schema registry screenshot
4. Comparison: HookSniff vs Svix vs Hookdeck tablo
5. SDK: 11 SDK logosu
6. Social proof: "1378 tests, 0 failures"
```

**Adım 4: Hunter Bulma (Gün -7)**

**Hunter Nedir?** Product Hunt'ta popüler, çok takipçisi olan birisi senin ürününü "avlar" (paylaşır). Hunter'ın kitlesi ürünü görür.

**Hunter Bulma Yöntemleri:**
1. **Twitter/X:** "product hunt hunter" ara, developer tools hunter'larını bul
2. **Product Hunt:** Popüler developer tool launch'larına bak, hunter'ı bul
3. **Slack/Discord:** Developer marketing toplulukları
4. **Kişisel network:** PH'da hesabı olan arkadaş

**Hunter Yoksa?** Kendin de yapabilirsin ama daha az erişim. Son çare olarak "Self-hunt."

**Adım 5: Launch Günü (Gün 0)**

**Timing (Kritik):**
- Product Hunt gün başlangıcı: **00:00 San Francisco zamanı (PST)**
- Türkiye saati ile: **11:00**
- **En iyi zaman: 00:00-01:00 PST** — günün en erken saati = daha fazla görünme süresi

**Launch Günü Planı (PST saat dilimi):**
```
00:00 PST (11:00 TR) — Ürünü publish et
00:05 PST — Featured mı kontrol et (eğer değilse PH destek yaz)
01:00 PST — Twitter announcement thread paylaş
02:00 PST — Reddit postları
03:00 PST — Hacker News Show HN
06:00 PST — Dev.to makale yayınla
09:00 PST — Discord topluluk duyuruları
12:00 PST — Öğle update (upvote iste, yorum yanıtla)
18:00 PST — Gün sonu teşekkür postu
```

**ÖNEMLİ:**
- Her yorumu yanıtla (PH algoritması engagement'ı ölçer)
- Twitter'da "We just launched on PH!" paylaş — compound effect
- Upvote isteme ama yorum iste ("What do you think?")
- İlk 1 saatte Top 3'te olmak kritik

### 9.3 Product Hunt Beklenti Yönetimi

**Senaryo Analizi:**

| Senaryo | Featured | Upvote | Trafik | Signup | Olasılık |
|---------|----------|--------|--------|--------|----------|
| En iyi | ✅ #1 Product of the Day | 500+ | 5.000+ | 200+ | %5 |
| İyi | ✅ Top 5 | 200-400 | 2.000-5.000 | 100-200 | %15 |
| Orta | ✅ Featured | 50-200 | 500-2.000 | 30-100 | %30 |
| Kötü | ❌ Featured değil | <50 | <500 | <30 | %50 |

**Kritik Uyarı (Doğrulanmış):**
> "The coveted #1 slot can feel good, but if it's not moving the needle on your inbound loop, it's probably not worth a major investment. PH is great for tech-y products or for some tech-y buzz. But for B2B SaaS, more often than not, your buyer likely isn't perusing the latest PH launches."
> — Sarah, Knock.app founder

**HookSniff İçin:** Developer tool olduğu için PH uygun ama beklentiyi yüksek tutma. Asıl hedef BetaList + HN + Reddit.

---

## 10. Email Automation (Resend ile)

### 10.1 Neden Resend?

Kaynak: resend.com/pricing (doğrulandı 2026-05-10)

| Plan | Fiyat | Emails/Ay | Limit |
|------|-------|-----------|-------|
| **Free** | $0 | 3.000 | 100/gün, 1 domain |
| **Pro** | $20 | 50.000 | Sınır yok |

**HookSniff Beta Dönemi İçin:** Free plan yeterli (3.000 email/ay = 100 kullanıcıya 30 email/ay).

### 10.2 Email Automation Akışı

**Yöntem: Resend API + Rust backend (HookSniff zaten Rust)**

```
Tetikleyici                      → Email
──────────────────────────────────────────────────
signup_created (Gün 0)           → Hoşgeldin emaili
signup_created + 24 saat         → "İlk webhook gönderdin mi?"
signup_created + 3 gün           → "Nasılsın? Bir sorun mu var?"
webhook_first_success            → "Tebrikler! İlk webhook başarılı 🎉"
signup_created + 7 gün (inactive)→ "Seni özledik" + Quick start link
signup_created + 14 gün (inactive)→ "Sana yardım edebilir miyiz?"
signup_created + 28 gün          → Beta sonu survey link
```

### 10.3 Kod Entegrasyonu

**Cargo.toml:**
```toml
# api/Cargo.toml [dependencies]
resend-rs = "0.4"
```

**Yeni dosya: `api/src/email.rs`**
```rust
//! Email automation for beta onboarding sequence.
//!
//! Uses Resend API (free tier: 3,000 emails/mo).
//! Emails are sent asynchronously — no latency impact on API.

use resend_rs::{Resend, Email, Error};
use std::sync::OnceLock;

static RESEND: OnceLock<Option<Resend>> = OnceLock::new();

pub fn init() {
    let client = std::env::var("RESEND_API_KEY")
        .ok()
        .map(|key| Resend::new(&key));
    let _ = RESEND.set(client);
}

/// Send beta welcome email (Gün 0).
pub async fn send_welcome(user_email: &str, user_name: &str) -> Result<(), Error> {
    let Some(Some(resend)) = RESEND.get() else { return Ok(()) };

    let email = Email::builder()
        .from("HookSniff <beta@hooksniff.com>")
        .to(user_email)
        .subject("🎉 HookSniff Beta'ya hoş geldin!")
        .html(format!(r#"
            <h2>Merhaba {name},</h2>
            <p>HookSniff beta programına katıldığın için teşekkürler!</p>
            <h3>Hızlı başlangıç:</h3>
            <ol>
                <li><a href="https://hooksniff.vercel.app">Dashboard'a git</a></li>
                <li><a href="https://github.com/servetarslan02/HookSniff#quick-start">Quick Start Guide</a></li>
                <li><a href="https://discord.gg/hooksniff">Discord'a katıl</a></li>
            </ol>
            <p>İlk webhook'ını göndermek yaklaşık 5 dakika sürüyor.</p>
            <p>Bir sorun olursa bu email'e yanıtla.</p>
        "#, name = user_name))
        .build();

    resend.emails.send(email).await?;
    Ok(())
}

/// Send "first webhook" check (Gün 1, 24 saat sonra).
pub async fn send_first_webhook_check(user_email: &str, has_webhook: bool) -> Result<(), Error> {
    let Some(Some(resend)) = RESEND.get() else { return Ok(()) };

    let (subject, body) = if has_webhook {
        (
            "Harika! İlk webhook'ını gönderdin 🎉",
            "<p>Deneyimini Discord'da paylaşır mısın? Diğer beta kullanıcıları duymak ister.</p>".to_string()
        )
    } else {
        (
            "İlk webhook'ını gönderdin mi?",
            r#"<p>Bir sorun mu var? İşte yardım:
            <a href="https://github.com/servetarslan02/HookSniff#quick-start">Quick Start Guide</a></p>"#.to_string()
        )
    };

    let email = Email::builder()
        .from("HookSniff <beta@hooksniff.com>")
        .to(user_email)
        .subject(subject)
        .html(body)
        .build();

    resend.emails.send(email).await?;
    Ok(())
}

/// Send weekly update (her Pazartesi).
pub async fn send_weekly_update(
    user_email: &str,
    new_features: &[String],
    bug_fixes: &[String],
) -> Result<(), Error> {
    let Some(Some(resend)) = RESEND.get() else { return Ok(()) };

    let features_html: String = new_features.iter()
        .map(|f| format!("<li>✅ {}</li>", f))
        .collect();

    let fixes_html: String = bug_fixes.iter()
        .map(|f| format!("<li>🐛 {}</li>", f))
        .collect();

    let email = Email::builder()
        .from("HookSniff <beta@hooksniff.com>")
        .to(user_email)
        .subject("HookSniff Beta — Haftalık Güncelleme")
        .html(format!(r#"
            <h2>Bu hafta neler değişti</h2>
            <h3>Yeni Feature'lar</h3>
            <ul>{features}</ul>
            <h3>Bug Fix'ler</h3>
            <ul>{fixes}</ul>
            <p><a href="https://feedback.hooksniff.com">Feature Request →</a></p>
            <p><a href="https://discord.gg/hooksniff">Discord →</a></p>
        "#, features = features_html, fixes = fixes_html))
        .build();

    resend.emails.send(email).await?;
    Ok(())
}
```

### 10.4 Cron Job (Her Pazartesi Haftalık Update)

**PostHog veya Rust cron ile:**
```rust
// api/src/jobs/weekly_email.rs
// Her Pazartesi 10:00 UTC'de çalışır
pub async fn send_weekly_updates(pool: &PgPool) {
    let users = sqlx::query!("SELECT email, name FROM beta_users WHERE active = true")
        .fetch_all(pool)
        .await
        .unwrap_or_default();

    let new_features = vec![
        "Schema registry desteği eklendi".to_string(),
        "Python SDK 0.1.1 yayınlandı".to_string(),
    ];
    let bug_fixes = vec![
        "FIFO queue timeout fix".to_string(),
    ];

    for user in &users {
        let _ = crate::email::send_weekly_update(
            &user.email,
            &new_features,
            &bug_fixes,
        ).await;
    }
}
```

---

## 11. Beta Sonu Survey (Tüm Sorular)

### 11.1 Survey Tool: Tally.so (Free)

tally.so/forms → Yeni form oluştur

### 11.2 Tüm Sorular (12 soru)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOOKSniff BETA SURVEY (2 dakika)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. HookSniff'i bir arkadaşına tavsiye eder misin? (NPS)
   [0] [1] [2] [3] [4] [5] [6] [7] [8] [9] [10]
   Hiç mümkün değil          Kesinlikle tavsiye ederim

2. HookSniff'i ne için kullanıyorsunuz? (çoklu seçim)
   □ Payment webhook'ları
   □ CI/CD pipeline
   □ Third-party API entegrasyonu
   □ Internal microservice iletişimi
   □ Diğer: ___________

3. En çok hangi feature'ı sevdiniz? (çoklu seçim)
   □ FIFO delivery
   □ Schema registry
   □ CloudEvents desteği
   □ Dashboard
   □ SDK'lar
   □ Replay
   □ Diğer: ___________

4. En sinir bozucu şey neydi? (serbest metin)
   [_____________________________________________]

5. Hangi feature eksik? (çoklu seçim)
   □ Daha fazla SDK dili
   □ Daha iyi dokümantasyon
   □ Dashboard'da daha fazla grafik
   □ Alert/monitoring
   □ Team management
   □ API rate limiting
   □ Webhook testing/sandbox
   □ Diğer: ___________

6. HookSniff'i başka webhook tool'uyla karşılaştırın:
   □ Daha iyi
   □ Aynı
   □ Daha kötü
   □ Hiç kullanmadım

7. Fiyat nasıl? ($29/ay Plan, $99/ay Team)
   □ Çok ucuz
   □ Makul
   □ Biraz pahalı
   □ Çok pahalı
   □ Ücretsiz kalmalı

8. Hangi planı düşünürdünüz?
   □ Free (limitsiz webhook, 1 endpoint)
   □ Plan ($29/ay)
   □ Team ($99/ay)
   □ Henüz karar vermedim

9. Onboarding deneyimi nasıldı? (1-5)
   [1] Çok kötü  [2] Kötü  [3] Normal  [4] İyi  [5] Mükemmel

10. Quick start guide yeterli miydi?
    □ Evet
    □ Hayır, eksikler var: ___________

11. 1 cümleyle HookSniff'i tanımlayın:
    [_____________________________________________]

12. Ek yorumlarınız:
    [_____________________________________________]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 11.3 NPS Hesaplama

```
NPS = %Promoters - %Detractors

Promoters (9-10): Tavsiye edenler
Passives (7-8): Nötr
Detractors (0-6): Olumsuz

Hedef: NPS 40+ (developer tools benchmark: 30-40)
```

### 11.4 Sonuç Analizi (Haftalık)

Survey kapandıktan sonra:
1. NPS hesapla
2. En çok sevilen feature → öne çıkar (landing page)
3. En çok eksik bulunan feature → roadmap'e ekle
4. Fiyat feedback → fiyat ayarlaması
5. "1 cümle" yanıtları → testimonial olarak kullan (izinli)

---

## 12. BetaList Uyarısı (Golden Era Bitti)

### 12.1 BetaList Tarihsel Performans

Kaynak: awesome-directories.com (50+ launch analizi)

**2011-2016 Golden Era:**
- BetaList ilk çıktığında çok etkiliydi
- "It really helped us getting first traction" — 2011 founder
- High conversion, quality early adopters

**2022-2025 Düşüş:**
- "Pretty much zero" — aynı founder, 2022'de tekrar denedi
- Maker profili arttı (diğer founder'lar), müşteri profili azaldı
- Aylık ziyaretçi: 150.000-227.000 (SimilarWeb)
- Bounce rate: %44-46

**2025 Sonuçları (Doğrulanmış Veri):**
| Metrik | İyi Senaryo | Kötü Senaryo |
|--------|-------------|-------------|
| Ziyaretçi | 500-1.000 | 60-200 |
| Signup | 100-400 | 10-50 |
| Conversion | %20-40 | %8-15 |
| Maliyet/signup | $0.50-$1.40 | Ücretsiz tier |

### 12.2 BetaList Ne Zaman Etkili?

**Etkili:**
- ✅ Developer tools (tech-savvy audience)
- ✅ Açık unique value proposition
- ✅ Landing page A/B test yapılıyorsa
- ✅ HN/Reddit ile kombine ediliyorsa

**Etkisiz:**
- ❌ B2B enterprise tool (karar verici orada değil)
- ❌ Çok niche ürün (audience mismatch)
- ❌ Tek başına kullanılıyorsa (kombine etmek gerekli)

**HookSniff İçin:** Developer tool → BetaList uygun ama tek başına yeterli değil. HN + Reddit + Dev.to ile kombine et.

---

## 13. 1:1 Onboarding Call (Gerçekçi Plan)

### 13.1 Neden 20 Call Gerçekçi Değil?

Tek kişi = Servet (kod bilmiyor). AI (ben) call yapamaz. Gerçekçi plan:

**Seçenek A: Servet Yaparsa**
- Haftada 5 call x 20 dk = 1 saat 40 dk
- 4 hafta = 20 call toplam
- Hazırlık: Demo script + FAQ listesi

**Seçenek B: Call Yerine Async**
- Her beta kullanıcısına 5 dakikalık video gönder (Loom)
- "Merhaba, ben [isim], HookSniff'in kurucusu. İşte hızlı demo..."
- Videoyu email ile gönder, feedback'i email/Discord'dan topla
- Avantaj: Ölçeklenebilir, tekrar kullanılabilir

**Seçenek C: Küçük Grup Call**
- Haftada 1 grup call (4-5 kişi)
- Google Meet, 30 dakika
- Demo + Q&A
- 4 hafta = 16-20 kişi

**Önerilen:** Seçenek B (async video) + Seçenek C (haftalık grup call)

### 13.2 Demo Script (Video İçin)

```
[0:00] Merhaba, ben [isim]. HookSniff'e hoş geldiniz.
[0:30] HookSniff ne yapıyor? Webhook'ları güvenilir şekilde teslim ediyor.
[1:00] Dashboard → Endpoint oluşturma
[2:00] SDK kurulumu (npm install hooksniff-sdk)
[3:00] İlk webhook gönderimi
[4:00] Dashboard'da teslim durumu görme
[4:30] Sorularınız için Discord veya email
```

### 13.3 Grup Call Agenda (30 dk)

```
[0-5 dk]  Tanışma — herkes kısaca ne için kullanıyor
[5-15 dk] Live demo — endpoint + webhook + dashboard
[15-25 dk] Q&A — sorular + feedback
[25-30 dk] Kapanış — Discord daveti, haftalık update bilgisi
```

---

## 14. Rakip Beta Süreçleri (Svix/Hookdeck)

### 14.1 Svix

**Bilinen:**
- YC W21 (Winter 2021) — YC batch ile launch
- a16z + Aleph yatırımcı desteği
- Open-source GitHub repo (svix/svix-webhooks) → developer trust
- Enterprise müşteriler: Brex, PagerDuty, Twilio, Replicate
- Professional plan: $490/ay

**Beta Süreci Tahmini:**
- YC Demo Day → ilk müşteriler
- Open-source → organik developer adoption
- Enterprise outreach → büyük müşteriler
- **Doğrulanmış bilgi yok** — Svix'in beta süreci kamuya açık değil

### 14.2 Hookdeck

**Bilinen:**
- SoC2 compliance (enterprise readiness)
- Free tier: 10K event, 3 gün retention
- Team plan: $39/ay
- Built-in metrics dashboard
- LinkedIn postu: "Dozens of early access users" (2022)

**Beta Süreci Tahmini:**
- Developer community outreach
- Early access program (LinkedIn postu doğruluyor)
- **Doğrulanmış detay yok**

### 14.3 HookSniff Farkı

Svix ve Hookdeck'in aksine HookSniff:
- YC-backed değil → grassroots launch gerekli
- $0 bütçe → ücretsiz kanallar (BetaList, HN, Reddit, Dev.to)
- Açık kaynak → GitHub stars organik growth
- Türkiye'den → global developer topluluğuna erişim stratejisi gerekli
