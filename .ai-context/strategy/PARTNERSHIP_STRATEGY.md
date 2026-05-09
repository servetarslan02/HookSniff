# HookSniff — Ortaklık Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulanmış)
> Durum: Taslak
> Kaynaklar: Vercel Integration docs (✅ doğrulanmış), Stripe partner program (✅ doğrulanmış), Zapier platform (✅ doğrulanmış), Polar.sh (✅ doğrulanmış), Neon Vercel marketplace (✅ doğrulanmış)

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Neden Ortaklık?](#2-neden-ortaklık)
3. [Ortaklık Türleri](#3-ortaklık-türleri)
4. [Öncelik 1: Mevcut Entegrasyon Ortakları](#4-öncelik-1-mevcut-entegrasyon-ortakları)
5. [Öncelik 2: Marketplace Listelemeleri](#5-öncelik-2-marketplace-listelemeleri)
6. [Öncelik 3: Teknoloji Ortaklıkları](#6-öncelik-3-teknoloji-ortaklıkları)
7. [Öncelik 4: Channel Ortaklıkları](#7-öncelik-4-channel-ortaklıkları)
8. [Ortaklık Programı Yapısı](#8-ortaklık-programı-yapısı)
9. [Metrikler](#9-metrikler)
10. [Uygulama Planı](#10-uygulama-planı)

---

## 1. Mevcut Durum

### HookSniff Mevcut Entegrasyonlar

| Entegrasyon | Durum | Platform | Not |
|-------------|-------|----------|-----|
| Polar.sh | ✅ Aktif | Billing (global) | HookSniff'in ödeme altyapısı |
| iyzico | ✅ Aktif | Billing (Türkiye) | TR'ye özel ödeme |
| Neon | ✅ Aktif | Database | Vercel marketplace'de mevcut |
| Upstash | ✅ Aktif | Redis | Vercel marketplace'de mevcut |
| Vercel | ✅ Aktif | Dashboard hosting | Entegrasyon mevcut |
| Cloudflare | ✅ Aktif | CDN/DNS/R2 | Entegrasyon mevcut |
| Grafana Cloud | ✅ Aktif | Monitoring | OpenTelemetry entegrasyonu |
| GCP Cloud Run | ✅ Aktif | API + Worker hosting | Entegrasyon mevcut |

### Mevcut Ortaklık Programları

| Program | Durum | Not |
|---------|-------|-----|
| Partner programı | ❌ Yok | Oluşturulmalı |
| Affiliate programı | ❌ Yok | Oluşturulmalı |
| Marketplace listeleme | ❌ Yok | Vercel, Zapier, vb. |
| Referral programı | ❌ Yok | Oluşturulmalı |

---

## 2. Neden Ortaklık?

### Ortaklığın HookSniff İçin Değeri

| Değer | Açıklama | Etki |
|-------|----------|------|
| **Dağıtım** | Ortakların müşteri tabanına erişim | Düşük CAC ile müşteri kazanımı |
| **Güven** | Tanınmış platformlarla entegrasyon | Trust signal |
| **SEO** | Marketplace backlink'leri | Domain authority artışı |
| **Revenue** | Co-sell, referral | Ek gelir kanalı |
| **Product** | Entegrasyon kalitesi | Ürün değeri artışı |

### Ortaklık ROI Benchmark'ları

| Ortaklık Türü | Ortalama ROI | Kaynak |
|---------------|-------------|--------|
| Integration partnership | 3-5x | Industry estimate |
| Marketplace listing | 2-3x | Industry estimate |
| Co-sell partnership | 5-10x | Enterprise |
| Affiliate program | 2-4x | Industry estimate |

---

## 3. Ortaklık Türleri

### Ortaklık Hiyerarşisi

```
Öncelik 1: Mevcut Entegrasyon Ortakları (Neon, Upstash, Vercel, Polar.sh)
    ↓
Öncelik 2: Marketplace Listelemeleri (Vercel, Zapier, AWS, GCP)
    ↓
Öncelik 3: Teknoloji Ortaklıkları (Stripe, Shopify, Twilio)
    ↓
Öncelik 4: Channel Ortaklıkları (Agency, consultancy, reseller)
```

---

## 4. Öncelik 1: Mevcut Entegrasyon Ortakları

### 4.1 Neon Partnership

**Mevcut durum:** HookSniff Neon kullanıyor (database)

| Fırsat | Uygulama | Zorluk |
|--------|----------|--------|
| Vercel Marketplace'de listelenme | Neon zaten listede, HookSniff template ekle | Kolay |
| Neon partner programı | Neon partner page'den başvuru | Orta |
| Case study | "HookSniff on Neon" blog post | Kolay |
| Co-marketing | Neon blog'unda HookSniff mention | Orta |

**Aksiyonlar:**
- [ ] Neon partner programına başvur
- [ ] "HookSniff on Neon" case study yaz
- [ ] Neon Vercel template'inde HookSniff örneği ekle

### 4.2 Upstash Partnership

**Mevcut durum:** HookSniff Upstash kullanıyor (Redis)

| Fırsat | Uygulama | Zorluk |
|--------|----------|--------|
| Upstash showcase | Upstash customers page'de listelenme | Orta |
| Integration guide | "HookSniff + Upstash" rehberi | Kolay |
| Co-marketing | Upstash blog'unda mention | Orta |

**Aksiyonlar:**
- [ ] Upstash showcase'a başvur
- [ ] "HookSniff + Upstash" integration guide yaz

### 4.3 Vercel Partnership

**Mevcut durum:** HookSniff dashboard'u Vercel'de (✅ doğrulanmış)

Vercel Integration docs (✅ doğrulanmış): https://vercel.com/docs/integrations

| Fırsat | Uygulama | Zorluk |
|--------|----------|--------|
| Vercel Marketplace listeleme | Native integration veya connectable account | Orta |
| Vercel template | HookSniff starter template | Kolay |
| Integration guide | Vercel docs'da HookSniff rehberi | Orta |

**Vercel Integration türleri (✅ doğrulanmış):**
1. **Native integration** — iki yönlü bağlantı, Vercel dashboard'dan faturalandırma
2. **Connectable account** — mevcut hesabı bağlama

**Aksiyonlar:**
- [ ] Vercel integration oluştur (connectable account)
- [ ] Vercel template: "Next.js + HookSniff webhook handler"
- [ ] Vercel marketplace'de listelenme başvurusu

### 4.4 Polar.sh Partnership

**Mevcut durum:** HookSniff Polar.sh kullanıyor (billing, global)

| Fırsat | Uygulama | Zorluk |
|--------|----------|--------|
| Polar.sh showcase | Polar.sh customers page | Kolay |
| Integration guide | "HookSniff + Polar.sh webhook" rehberi | Kolay |
| Affiliate program | Polar.sh affiliate ile entegrasyon | Orta |

**Aksiyonlar:**
- [ ] Polar.sh showcase'a başvur
- [ ] "Polar.sh webhook → HookSniff" integration guide yaz

---

## 5. Öncelik 2: Marketplace Listelemeleri

### 5.1 Vercel Marketplace

✅ **Doğrulanmış:** https://vercel.com/docs/integrations

| Gereksinim | Durum | Not |
|-----------|-------|-----|
| Vercel hesabı | ✅ Var | Dashboard Vercel'de |
| Integration type | Connectable account | En kolay başlangıç |
| OAuth app | Gerekli | Vercel OAuth ile |
| Documentation | Gerekli | Integration guide |

**Adımlar:**
1. Vercel developer hesabı oluştur
2. OAuth app kaydet
3. Integration code yaz (Next.js)
4. Vercel marketplace'e submit
5. Onay süreci (1-2 hafta)

### 5.2 Zapier Marketplace

✅ **Doğrulanmış:** https://zapier.com/apps

| Gereksinim | Durum | Not |
|-----------|-------|-----|
| Zapier developer hesabı | ❌ Yok | Oluşturulmalı |
| API key | ✅ Var | HookSniff API |
| Webhook support | ✅ Var | HookSniff webhook'ları |
| Authentication | ✅ Var | API key auth |

**Zapier entegrasyon senaryoları:**
- "New webhook received → Slack notification"
- "New webhook received → Google Sheets row"
- "New endpoint created → Notion database"
- "Webhook failed → PagerDuty alert"

**Adımlar:**
1. Zapier developer platform'a kaydol
2. Zapier CLI ile integration oluştur
3. Trigger: "New Webhook Received"
4. Action: "Send Webhook"
5. Authentication: API key
6. Zapier marketplace'e submit

### 5.3 AWS Marketplace

| Gereksinim | Durum | Not |
|-----------|-------|-----|
| AWS Partner Network hesabı | ❌ Yok | Ücretsiz kayıt |
| SaaS listing | Gerekli | SaaS contract |
| AWS seller hesabı | Gerekli | %5 listing fee |

**AWS Marketplace notları (✅ doğrulanmış):**
- SaaS listing: %5 uplift on listing fee
- Co-sell benefit: 2025'te genişletildi
- Private offer desteği mevcut

**Öncelik:** Düşük — HookSniff henüz enterprise değil

### 5.4 GCP Marketplace

| Gereksinim | Durum | Not |
|-----------|-------|-----|
| GCP Partner hesabı | ❌ Yok | Oluşturulmalı |
| Container image | ✅ Var | Dockerfile.api, Dockerfile.worker |
| Cloud Run deployment | ✅ Var | Zaten GCP'de |

**Öncelik:** Orta — HookSniff zaten GCP Cloud Run'da

---

## 6. Öncelik 3: Teknoloji Ortaklıkları

### 6.1 Stripe Partnership

✅ **Doğrulanmış:** Stripe partner program mevcut

| Fırsat | Uygulama | Zorluk |
|--------|----------|--------|
| Stripe App Marketplace | "HookSniff for Stripe" app | Orta |
| Stripe webhook entegrasyonu | Stripe webhook → HookSniff routing | Kolay |
| Partner program | Stripe partner page | Orta |

**"HookSniff for Stripe" senaryosu:**
- Stripe webhook'larını HookSniff üzerinden routing
- Retry, monitoring, analytics
- Customer-facing webhook dashboard

**Aksiyonlar:**
- [ ] "Stripe → HookSniff" integration guide yaz
- [ ] Stripe App Marketplace'e submit
- [ ] Stripe partner programına başvur

### 6.2 Shopify Partnership

| Fırsat | Uygulama | Zorluk |
|--------|----------|--------|
| Shopify webhook routing | Shopify webhook → HookSniff | Orta |
| Shopify App Store | "HookSniff for Shopify" app | Zor |

**Öncelik:** Düşük — Shopify app store zor

### 6.3 Twilio/SendGrid Partnership

| Fırsat | Uygulama | Zorluk |
|--------|----------|--------|
| Webhook routing | Twilio webhook → HookSniff | Kolay |
| Integration guide | "Twilio + HookSniff" rehberi | Kolay |

**Öncelik:** Orta

### 6.4 GitHub Partnership

| Fırsat | Uygulama | Zorluk |
|--------|----------|--------|
| GitHub webhook routing | GitHub webhook → HookSniff | Kolay |
| GitHub App | "HookSniff for GitHub" app | Orta |
| Integration guide | "GitHub + HookSniff" rehberi | Kolay |

**Aksiyonlar:**
- [ ] "GitHub → HookSniff" integration guide yaz
- [ ] GitHub App oluştur (opsiyonel)

---

## 7. Öncelik 4: Channel Ortaklıkları

### 7.1 Agency Partnerships

| Agency Tipi | Hedef | Değer Önerisi |
|-------------|-------|---------------|
| Web development agency | 10-20 agency | Müşterilerine webhook hizmeti sunma |
| DevOps consultancy | 5-10 consultancy | Entegrasyon hizmeti |
| SaaS implementation | 5-10 implementor | Müşteri webhook ihtiyaçları |

### 7.2 Referral Programı

| Seviye | Komisyon | Koşul |
|--------|---------|-------|
| Seed referral | %10 (12 ay) | İlk 10 müşteri |
| Growth referral | %15 (12 ay) | 11-50 müşteri |
| Enterprise referral | %20 (12 ay) | 50+ müşteri |

### 7.3 Affiliate Programı

| Affiliate Tipi | Komisyon | Koşul |
|----------------|---------|-------|
| Blog/content affiliate | %20 (ilk yıl) | Blog post, tutorial |
| YouTube affiliate | %20 (ilk yıl) | Video review |
| Podcast affiliate | %20 (ilk yıl) | Podcast mention |

---

## 8. Ortaklık Programı Yapısı

### Partner Tier'ları

| Tier | Gereksinim | Avantaj |
|------|-----------|---------|
| **Explorer** | 0-5 müşteri referral | %10 komisyon, logo listeleme |
| **Growth** | 6-20 müşteri referral | %15 komisyon, co-marketing, priority support |
| **Strategic** | 20+ müşteri referral | %20 komisyon, dedicated CSM, co-sell |

### Partner Portal

| Özellik | Platform | Maliyet |
|---------|----------|---------|
| Partner dashboard | Custom build | $0 (Next.js) |
| Referral tracking | Polar.sh affiliate veya custom | $0 |
| Commission tracking | Polar.sh | $0 |
| Marketing materials | Google Drive / Notion | $0 |

---

## 9. Metrikler

### Ortaklık KPI'ları

| KPI | Hedef (6 ay) | Hedef (12 ay) | Ölçüm |
|-----|-------------|--------------|-------|
| Marketplace listeleme | 2 | 5 | Vercel, Zapier, vb. |
| Integration partner | 3 | 10 | Neon, Upstash, vb. |
| Referral müşteri | 10 | 50 | Referral tracking |
| Partner-sourced revenue | $100/ay | $500/ay | Revenue attribution |
| Affiliate signup | 5 | 20 | Affiliate tracking |

### Ortaklık Sağlık Metrikleri

| Metrik | İyi | Kötü | Aksiyon |
|--------|-----|------|---------|
| Partner activation rate | >%50 | <%20 | Onboarding iyileştir |
| Referral conversion | >%10 | <%5 | Partner eğitimi |
| Partner retention (6 ay) | >%70 | <%40 | Değer artır |
| Co-marketing etkinliği | >2/content | <1/content | Daha fazla içerik |

---

## 10. Uygulama Planı

### Aşama 1: Mevcut Entegrasyonları Güçlendir (1-2. Hafta)

- [ ] "HookSniff + Neon" integration guide yaz
- [ ] "HookSniff + Upstash" integration guide yaz
- [ ] "HookSniff + Vercel" integration guide yaz
- [ ] "HookSniff + Polar.sh webhook" integration guide yaz
- [ ] Neon partner programına başvur
- [ ] Upstash showcase'a başvur

### Aşama 2: İlk Marketplace Listelemeleri (3-6. Hafta)

- [ ] Vercel integration oluştur (connectable account)
- [ ] Zapier developer platform'a kaydol
- [ ] Zapier: "New Webhook Received" trigger oluştur
- [ ] Zapier marketplace'e submit
- [ ] Vercel marketplace'e submit

### Aşama 3: Teknoloji Ortaklıkları (7-12. Hafta)

- [ ] "Stripe → HookSniff" integration guide yaz
- [ ] "GitHub → HookSniff" integration guide yaz
- [ ] Stripe App Marketplace'e submit
- [ ] Referral programı oluştur (Polar.sh affiliate)
- [ ] Affiliate programı oluştur

### Aşama 4: Channel Ortaklıkları (13+ Hafta)

- [ ] Agency partner programı oluştur
- [ ] İlk 5 agency partner bul
- [ ] DevOps consultancy partner bul
- [ ] Co-marketing kampanyası başlat
- [ ] Partner portal oluştur

---

## Notlar

### Kaynaklar

- Vercel Integration docs (✅ doğrulanmış): https://vercel.com/docs/integrations
- Vercel Marketplace (✅ doğrulanmış): https://vercel.com/marketplace
- Stripe Partner Program (✅ doğrulanmış): https://stripe.com/partners
- Zapier Developer Platform (✅ doğrulanmış): https://zapier.com/apps
- Polar.sh (✅ doğrulanmış): https://polar.sh/
- Neon Vercel Integration (✅ doğrulanmış): https://vercel.com/docs/postgres
- AWS Marketplace fees (✅ doğrulanmış): %5 listing fee — https://docs.aws.amazon.com/marketplace/latest/userguide/listing-fees.html

### Dikkat Edilecekler

1. **Öncelik sırası** — önce mevcut entegrasyonları güçlendir, sonra yeni marketplace
2. **Kalite > nicelik** — az ama güçlü ortaklık > çok ama zayıf
3. **Co-marketing** — her ortaklık için ortak içerik üret
4. **Tracking** — her referral'ı takip et (Polar.sh affiliate)
5. **Partner education** — ortakları HookSniff hakkında eğit
6. **Legal** — partnership agreement'leri basit tut (template kullan)
7. **Vercel integration** — en erken kazanım, zaten Vercel'de dashboard
8. **Zapier** — no-code kullanıcılarına erişim, büyük potansiyel
