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
- Svix Pricing: https://www.svix.com/pricing/ (doğrulandı 2026-05-10)
- Hookdeck Pricing: https://hookdeck.com/pricing (doğrulandı 2026-05-10)
