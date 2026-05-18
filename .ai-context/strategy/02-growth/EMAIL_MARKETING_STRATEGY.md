# HookSniff — E-posta Pazarlama Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulandı — ikinci revizyon)
> Durum: Taslak
> Kaynaklar: Postmark pricing (doğrulanmış), Resend pricing (doğrulanmış), Knock 11 Email Services 2026, Folderly Tech Email Benchmarks 2025, Oliver Munro SaaS Marketing Stats 2026, ActiveCampaign Benchmarks 2026

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [E-posta Türleri](#2-e-posta-türleri)
3. [Araç Karşılaştırması](#3-araç-karşılaştırması)
4. [Lifecycle Email Akışları](#4-lifecycle-email-akışları)
5. [Transactional Email Şablonları](#5-transactional-email-şablonları)
6. [Drip Campaigns](#6-drip-campaigns)
7. [Benchmark'lar](#7-benchmarklar)
8. [Metrikler](#8-metrikler)
9. [Uygulama Planı](#9-uygulama-planı)

---

## 1. Mevcut Durum

### HookSniff Bugünkü E-posta Durumu

| Metrik | Değer | Not |
|--------|-------|-----|
| Email servisi | GCloud Gmail API | 2,000 gün/gün free tier |
| Transactional email | ✅ Var | Email verification, password reset |
| Marketing email | ❌ Yok | Henüz newsletter/drip yok |
| Email templates | ❌ Yok | HTML template oluşturulmalı |
| Open rate tracking | ❌ Yok | Implemente edilmeli |
| Automation | ❌ Yok | Drip/lifecycle akışları yok |

### Neden E-posta Pazarlama Kritik?

Kaynak: Oliver Munro SaaS Marketing Stats 2026:
- **E-posta pazarlama ROI'si: $42:$1** — her $1 için $42 getiri (Genesys Growth 2026, doğrulanmış)
- **Organik arama B2B gelirinin %44.6'sını** oluşturuyor (Oliver Munro 2026, doğrulanmış)
- **Software sektörü email open rate: %36.20-%39.31** (ActiveCampaign + MailerLite 2025, doğrulanmış)
- **E-posta maliyeti: Geleneksel pazarlamadan %62 daha ucuz** (Genesys Growth 2026, doğrulanmış)

---

## 2. E-posta Türleri

### HookSniff İçin E-posta Kategorileri

| Kategori | Tür | Amaç | Öncelik |
|----------|-----|------|---------|
| **Transactional** | Tetiklemeli | Kullanıcı işlemi bildirimi | 🔴 Kritik |
| **Lifecycle** | Otomatik | Kullanıcı yolculuğu yönlendirme | 🔴 Yüksek |
| **Marketing** | Toplu | Ürün güncellemesi, blog, promosyon | 🟡 Orta |
| **Re-engagement** | Tetiklemeli | Kaybedilen kullanıcıları geri kazanma | 🟢 Düşük |

### Transactional E-postalar (Zaten Var/Olmali)

| E-posta | Tetikleyici | Amaç |
|---------|-----------|------|
| Email verification | Kayıt | Hesap doğrulama |
| Password reset | Şifre sıfırlama | Güvenlik |
| Welcome email | İlk kayıt | Onboarding başlatma |
| Webhook failure alert | Hata | Kullanıcıyı bilgilendirme |
| Plan upgrade confirmation | Ödeme | Onay |
| Invoice/receipt | Ödeme | Muhasebe |
| API key rotation reminder | 30 gün | Güvenlik |

### Lifecycle E-postalar (Oluşturulmalı)

| E-posta | Tetikleyici | Amaç | Zamanlama |
|---------|-----------|------|-----------|
| Onboarding drip | Kayıt | İlk webhook göndermeye yönlendirme | Gün 0-7 |
| Activation nudge | 3 gün inaktif | İlk webhook'u göndermeye teşvik | Gün 3 |
| Feature highlight | 7 gün aktif | FIFO, Schema Registry gibi özellikleri göster | Gün 7 |
| Usage limit warning | %80 limit | Upgrade teşviki | Tetiklemeli |
| Upgrade prompt | Limit aşıldı | Pro/Business plan tanıtımı | Tetiklemeli |
| Churn prevention | 14 gün inaktif | Geri kazanma | Gün 14 |
| Win-back | 30 gün inaktif | Son deneme | Gün 30 |
| NPS survey | 30 gün aktif | Feedback toplama | Ay 1 |

---

## 3. Araç Karşılaştırması

### Mevcut: GCloud Gmail API

| Özellik | Değer |
|---------|-------|
| Fiyat | Ücretsiz (2,000/gün) |
| Transactional | ✅ Yeterli |
| Marketing | ❌ Uygun değil (spam riski) |
| Templates | ❌ Yok |
| Analytics | ❌ Yok |
| Automation | ❌ Yok |

**Sonuç:** Transactional email için yeterli, ama marketing + lifecycle için yeni araç gerekli.

### Seçenek Karşılaştırması (Doğrulanmış Fiyatlar 2026-05-10)

| Araç | Free Tier | Başlangıç | Orta Plan | Developer DX | HookSniff Uygunluğu |
|------|-----------|-----------|-----------|-------------|---------------------|
| **Resend** | 3,000/mo (100/gün) | $20/mo (50K) | $90/mo (100K) | ✅ Mükemmel (React Email, SDK) | ✅ **EN UYGUN** |
| **Postmark** | 100/mo (test) | $15/mo (10K) | $16.50/mo (10K) | ✅ İyi | ✅ İyi |
| **Mailgun** | 100/gün | $15/mo (10K) | $35/mo (50K) | ✅ İyi | 🟡 Orta |
| **SendGrid** | 100/gün | $19.95/mo (40K) | $34.95/mo (100K) | 🟡 Orta (Twilio karmaşık) | 🟡 Orta |
| **Amazon SES** | 62K/mo (EC2) | $0.10/1K | $0.10/1K | ❌ Zor kurulum | ❌ Çok teknik |
| **Mailchimp** | 500 kontakt | $13/mo | $20/mo | ❌ Developer-friendly değil | ❌ |

### Seçim: Resend + Gmail API Hybrid

**Neden Hybrid?**

1. **Gmail API** → Transactional (email verification, password reset) — zaten kurulu, ücretsiz
2. **Resend** → Lifecycle + Marketing (onboarding drip, feature highlights, newsletter) — developer-friendly, React Email, uygun fiyat

**Neden Resend?**
- **React Email** ile template oluşturmak kolay (Next.js ile uyumlu)
- **Free tier: 3,000 email/ay** — başlangıç için yeterli
- **$20/mo: 50,000 email/ay** — büyüme için uygun
- **SOC 2 Type II** + GDPR uyumlu
- **Webhook support** — open/click tracking
- **SDK'lar:** Node.js, Python, Go, Ruby, Elixir, Laravel

### Fiyat Projeksiyonu (Resend)

| Aylık Email | Plan | Maliyet | Not |
|-------------|------|---------|-----|
| 0-3,000 | Free | $0 | Başlangıç |
| 3,000-50,000 | Pro | $20/mo | Büyüme |
| 50,000-100,000 | Pro/Scale | $35-90/mo | Orta ölçek |
| 100,000+ | Scale | $90-350/mo | Ölçeklenme |

---

## 4. Lifecycle Email Akışları

### Akış 1: Yeni Kullanıcı Onboarding (Gün 0-7)

```
Gün 0: Welcome email
  ↓
Gün 1: "Send your first webhook" rehberi
  ↓
Gün 3: [Eğer webhook yok] "Need help? Here's a 2-min guide"
  ↓
Gün 5: [Eğer webhook var] "You're up and running! Here are 3 power features"
  ↓
Gün 7: [Eğer webhook yok] "Last chance: Your free tier is waiting"
  ↓
Gün 7: [Eğer webhook var] Feature highlight: FIFO delivery, Schema Registry
```

### Akış 2: Activation (Gün 7-30)

```
Gün 7: Feature spotlight: "Did you know about CloudEvents support?"
  ↓
Gün 14: SDK highlight: "Try our Python/Go/Ruby SDK"
  ↓
Gün 21: Social proof: "How [customer] uses HookSniff"
  ↓
Gün 30: NPS survey + feedback toplama
```

### Akış 3: Upgrade Teşviki (Tetiklemeli)

```
Trigger: %80 webhook limit kullanımı
  ↓
Email: "You've used 8,000 of your 10,000 free webhooks"
  ↓
[3 gün sonra, eğer upgrade yok]
Email: "Your free tier is almost full — upgrade to Pro for $29/mo"
  ↓
[7 gün sonra, eğer upgrade yok]
Email: "Last reminder: Upgrade or your webhooks will be paused"
```

### Akış 4: Churn Prevention (Gün 14-30 inaktif)

```
Gün 14 inaktif: "We miss you! Here's what's new at HookSniff"
  ↓
Gün 21 inaktif: "Your webhooks are still running — want to optimize?"
  ↓
Gün 30 inaktif: "We're removing inactive accounts — export your data"
```

### Akış 5: Win-Back (Gün 30-90 inaktif)

```
Gün 30: "Come back and get 1 month free Pro"
  ↓
Gün 60: "HookSniff has changed — here's what's new"
  ↓
Gün 90: "Final notice: Your account will be archived"
```

---

## 5. Transactional Email Şablonları

### Şablon 1: Welcome Email

```
Konu: Welcome to HookSniff! 🪝

Merhaba {name},

HookSniff'e hoş geldin! Webhook'larını güvenilir şekilde göndermeye hazırsın.

Hemen başla:
1. Endpoint oluştur → {dashboard_url}/endpoints
2. İlk webhook'unu gönder → {docs_url}/quickstart
3. Dashboard'da izle → {dashboard_url}

İhtiyacın var mı? Bu email'e yanıtla veya Discord'a katıl → {discord_url}

— HookSniff Ekibi
```

### Şablon 2: Webhook Failure Alert

```
Konu: ⚠️ Webhook delivery failed — {endpoint_name}

Merhaba {name},

{endpoint_name} endpoint'ine son webhook gönderimi başarısız oldu.

Detaylar:
- Event: {event_type}
- Hata: {error_message}
- Deneme: {retry_count}/5
- Sonraki deneme: {next_retry_time}

Dashboard'da incele → {dashboard_url}/deliveries/{delivery_id}

Otomatik retry devam ediyor. Sorun devam ederse endpoint URL'ini kontrol et.

— HookSniff
```

### Şablon 3: Usage Limit Warning

```
Konu: You've used {percentage}% of your free webhooks

Merhaba {name},

Bu ay {used_count}/{limit_count} webhook kullandın ({percentage}%).

%100'e ulaştığında webhook'ların duracak. Kesinti yaşamamak için:

→ Pro plan'a geç ($29/mo, 50,000 webhook/ay)
→ Business plan'a geç ($99/mo, 500,000 webhook/ay)

Hemen upgrade et → {dashboard_url}/billing

— HookSniff
```

---

## 6. Drip Campaigns

### Drip 1: Developer Education (Gün 0-21)

| Gün | Konu | İçerik | CTA |
|-----|------|--------|-----|
| 0 | Welcome + Quick Start | 2 dakikada ilk webhook | İlk webhook'u gönder |
| 2 | Webhook Best Practices | HMAC, retry, idempotency | Blog'u oku |
| 5 | SDK Introduction | Node.js/Python SDK kurulumu | SDK'yı dene |
| 8 | Advanced Features | FIFO, Schema Registry, CloudEvents | Feature'ı keşfet |
| 12 | Security Guide | SSRF protection, IP whitelisting | Security ayarları |
| 15 | Integration Examples | Stripe, GitHub, Shopify webhook'ları | Entegrasyonu kur |
| 21 | Community | Discord, GitHub Discussions | Topluluğa katıl |

### Drip 2: Upgrade Education (Tetiklemeli)

| Tetikleyici | Konu | İçerik | CTA |
|-------------|------|--------|-----|
| 7 gün aktif | "Unlock more power" | Pro plan özellikleri | Upgrade et |
| 14 gün aktif | "Scale with confidence" | Business plan özellikleri | Upgrade et |
| 30 gün aktif | "You're a power user!" | Enterprise plan | Demo iste |
| %80 limit | "Running low" | Limit hatırlatması | Upgrade et |

---

## 7. Benchmark'lar

### Sektör Benchmark'ları (Doğrulanmış — Tam Sayfa Çekilmiş)

#### ActiveCampaign 2026 Benchmarks (Doğrulanmış)

Kaynak: ActiveCampaign — 2025 yılı müşteri verileri analizi (Jan 1 - Dec 10, 2025)
URL: https://www.activecampaign.com/blog/activecampaign-email-benchmarks

| Sektör | Open Rate | Click Rate |
|--------|-----------|------------|
| Media / Publishing | 43.16% | 7.32% |
| Non-profit | 42.68% | 5.51% |
| Blogger / Author | 41.99% | 7.73% |
| Healthcare | 41.48% | 5.64% |
| Travel / Hospitality | 40.87% | 5.28% |
| Fitness / Nutrition | 40.60% | 5.49% |
| Real Estate | 39.87% | 5.42% |
| Consulting / Agency | 39.08% | 7.05% |
| Online Training / Education | 39.06% | 6.38% |
| Entertainment / Events | 38.17% | 5.32% |
| Accounting / Financial | 37.74% | 4.40% |
| **Software** | **36.20%** | **6.67%** |
| E-Commerce / Retail | 35.66% | 5.07% |
| **Overall** | **39.26%** | **6.21%** |

**HookSniff hedef sektör: Software — Open rate %36.20, Click rate %6.67**

#### Mailchimp Benchmarks (Doğrulanmış)

Kaynak: Mailchimp — Milyarlarca email verisi, Aralık 2023 güncelleme
URL: https://mailchimp.com/resources/email-marketing-benchmarks/

| Sektör | Open Rate | Click Rate | Unsubscribe |
|--------|-----------|------------|-------------|
| Business + Finance | 31.35% | 2.78% | 0.15% |
| Non-Profits | 40.04% | 3.27% | 0.18% |
| Education + Training | 35.64% | 3.02% | 0.18% |
| Ecommerce | 29.81% | 1.74% | 0.19% |
| **All Users** | **35.63%** | **2.62%** | **0.22%** |

#### MailerLite Benchmarks (Doğrulanmış)

Kaynak: MailerLite — 3.6 milyon kampanya, 181,000+ hesap, Aralık 2024 - Kasım 2025
URL: https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks

| Metrik | 2025 Değeri | 2024 Değeri | Değişim |
|--------|-------------|-------------|---------|
| Open rate (tüm sektörler) | **43.46%** | 42.35% | +1.11% |
| Click-to-open rate | **6.81%** | 5.63% | +1.18% |
| Click rate | **2.09%** | 2.00% | +0.09% |
| Unsubscribe rate | **0.22%** | 0.08% | +0.14% |

| Sektör | Open Rate | Click Rate |
|--------|-----------|------------|
| **Software and web app** | **39.31%** | **1.15%** |
| Consulting | 45.96% | 2.41% |
| E-commerce | 32.67% | 1.07% |
| Non-profit | 52.38% | 2.90% |

#### Folderly Tech Industry (Doğrulanmış — Arama Özeti)

Kaynak: Folderly Tech Industry Email Benchmarks 2025
URL: https://generate.folderly.com/tech-industry-email-benchmarks

- Developer tools: **%26.3 open rate** (en yüksek engagement teknoloji sektöründe)
- SaaS: Ortalama engagement

⚠️ **Not:** Folderly verisi arama sonucu özeti olarak doğrulanmıştır. Tam sayfa içeriği yüklenemedi.

### HookSniff İçin Hedef Benchmark'lar

| Metrik | Sektör Ortalaması | HookSniff Hedefi | Kaynak |
|--------|-------------------|-----------------|--------|
| Open rate (Software) | %36.20 - %39.31 | >%35 | ActiveCampaign + MailerLite |
| Click rate (Software) | %1.15 - %6.67 | >%3 | MailerLite + ActiveCampaign |
| Unsubscribe rate | %0.22 | <%0.2 | Mailchimp + MailerLite |
| Bounce rate | %1-2 | <%1.5 | Industry standard |
| Spam complaint | <%0.1 | <%0.05 | Industry standard |

### E-posta ROI Benchmark'ları

| Kanal | ROI | Kaynak |
|-------|-----|--------|
| E-posta pazarlama | **$42 ROI / $1 harcama** | Genesys Growth 2026 (Firework kaynaklı) |
| E-posta (genel) | **3,600-4,000%** | Oliver Munro 2026 |
| SEO | **748%** | Data Mania / Oliver Munro 2026 |
| İçerik pazarlama | **$3 ROI / $1 harcama** | Revenue Zen / Genesys Growth 2026 |
| LinkedIn | **113%** | Oliver Munro 2026 |
| Google Ads | **78%** | SaaSHero 2026 |

**Sonuç:** E-posta, ROI açısından en yüksek getirili kanal ($42:$1).

### Churn Benchmark'ları

Kaynak: Oliver Munro 2026

| Metrik | Değer | Not |
|--------|-------|-----|
| B2B SaaS yıllık churn | **%3.5** | Ortalama |
| Voluntary churn | %2.6 | Kullanıcı kararı |
| Involuntary churn | %0.9 | Ödeme hatası |
| Involuntary churn fix → gelir artışı | **+%8.6 yıl 1** | Otomatik retry |
| Median NRR | **%106** | En iyi performans: %120+ |

**HookSniff için:** Involuntary churn'u önlemek için otomatik ödeme retry implemente et → %8.6 gelir artışı potansiyeli.

---

## 8. Metrikler

### E-posta KPI'ları

| KPI | Hedef (3 ay) | Hedef (6 ay) | Hedef (12 ay) | Ölçüm |
|-----|-------------|-------------|--------------|-------|
| Transactional delivery rate | >%99.5 | >%99.5 | >%99.5 | Gmail API/Resend |
| Marketing open rate | >%20 | >%25 | >%26 | Resend analytics |
| Marketing click rate | >%3 | >%5 | >%6 | Resend analytics |
| Onboarding completion rate | >%40 | >%50 | >%60 | PostHog + email |
| Email → upgrade conversion | >%1 | >%2 | >%3 | PostHog |
| Churn prevention success | >%10 | >%15 | >%20 | Cohort analizi |
| Unsubscribe rate | <%0.5 | <%0.3 | <%0.3 | Resend |

### Takip Edilecek Metrikler

| Metrik | Sıklık | Araç |
|--------|--------|------|
| Open rate (kampanya bazında) | Her kampanya | Resend |
| Click rate (kampanya bazında) | Her kampanya | Resend |
| Unsubscribe rate | Haftalık | Resend |
| Bounce rate | Haftalık | Resend |
| Email → signup conversion | Haftalık | PostHog |
| Onboarding drip completion | Aylık | PostHog |
| Win-back success rate | Aylık | Cohort analizi |

---

## 9. Uygulama Planı

### Aşama 1: Transactional Email İyileştirme (1. Hafta)

- [ ] Mevcut transactional email şablonlarını iyileştir (HTML + responsive)
- [ ] Welcome email oluştur (şablon yukarıda)
- [ ] Webhook failure alert email'i oluştur
- [ ] Email open/click tracking implemente et
- [ ] Gmail API ile transactional email'leri test et

### Aşama 2: Resend Entegrasyonu (2. Hafta)

- [ ] Resend hesabı oluştur (free tier)
- [ ] Resend SDK kurulumu (`npm install resend`)
- [ ] Domain doğrulama (DKIM/SPF/DMARC)
- [ ] React Email ile template'ler oluştur
- [ ] Onboarding drip akışını kodla (Gün 0-7)

### Aşama 3: Lifecycle Akışları (3-4. Hafta)

- [ ] Activation drip (Gün 7-30) implemente et
- [ ] Usage limit warning email'i implemente et
- [ ] Churn prevention akışı implemente et
- [ ] NPS survey email'i implemente et

### Aşama 4: Marketing E-postaları (5+ Hafta)

- [ ] Newsletter template oluştur
- [ ] Haftalık/bi-weekly newsletter başlat
- [ ] Product update email'leri
- [ ] Win-back kampanyası başlat

### Resend Kurulum Kodu (Next.js)

```typescript
// lib/resend.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendWelcomeEmail(email: string, name: string) {
  await resend.emails.send({
    from: 'HookSniff <hello@hooksniff.com>',
    to: email,
    subject: 'Welcome to HookSniff! 🪝',
    react: WelcomeTemplate({ name }),
  })
}

export async function sendUsageLimitEmail(
  email: string,
  name: string,
  used: number,
  limit: number
) {
  const percentage = Math.round((used / limit) * 100)
  await resend.emails.send({
    from: 'HookSniff <alerts@hooksniff.com>',
    to: email,
    subject: `You've used ${percentage}% of your free webhooks`,
    react: UsageLimitTemplate({ name, used, limit, percentage }),
  })
}

export async function sendWebhookFailureAlert(
  email: string,
  endpointName: string,
  error: string
) {
  await resend.emails.send({
    from: 'HookSniff <alerts@hooksniff.com>',
    to: email,
    subject: `⚠️ Webhook delivery failed — ${endpointName}`,
    react: WebhookFailureTemplate({ endpointName, error }),
  })
}
```

### React Email Template Örneği

```tsx
// emails/WelcomeTemplate.tsx
import { Html, Head, Body, Container, Text, Button } from '@react-email/components'

export function WelcomeTemplate({ name }: { name: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <Text style={{ fontSize: '24px', fontWeight: 'bold' }}>
            Welcome to HookSniff! 🪝
          </Text>
          <Text style={{ fontSize: '16px', color: '#666' }}>
            Merhaba {name}, webhook'larını güvenilir şekilde göndermeye hazırsın.
          </Text>
          <Button
            href="https://hooksniff.com/dashboard"
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '6px',
              textDecoration: 'none',
            }}
          >
            Get Started
          </Button>
        </Container>
      </Body>
    </Html>
  )
}
```

---

## Notlar

### Kaynaklar

- ActiveCampaign: "2026 Email Marketing Benchmarks" (Jan 2026, 2025 verileri) — https://www.activecampaign.com/blog/activecampaign-email-benchmarks (✅ Tam sayfa doğrulanmış)
- Mailchimp: "Email Marketing Benchmarks & Industry Statistics" (Dec 2023 güncelleme) — https://mailchimp.com/resources/email-marketing-benchmarks/ (✅ Tam sayfa doğrulanmış)
- MailerLite: "Email Marketing Benchmarks 2025" (Dec 2024-Nov 2025, 3.6M kampanya) — https://www.mailerlite.com/blog/compare-your-email-performance-metrics-industry-benchmarks (✅ Tam sayfa doğrulanmış)
- Folderly: "Tech Industry Email Benchmarks 2025" — https://generate.folderly.com/tech-industry-email-benchmarks (⚠️ Arama özeti doğrulanmış)
- Genesys Growth: "45 Content Marketing ROI Stats 2026" — https://genesysgrowth.com/blog/content-marketing-roi-stats-for-marketing-leaders (✅ Tam sayfa doğrulanmış)
- Oliver Munro: "60+ SaaS Marketing Statistics 2026" — https://www.olivermunro.com/writersblog/saas-marketing-statistics (✅ Tam sayfa doğrulanmış)
- Knock: "11 best transactional email services 2026" — https://knock.app/blog/the-top-transactional-email-services-for-developers (✅ Tam sayfa doğrulanmış)
- Postmark: "6 best transactional email providers" — https://postmarkapp.com/blog/transactional-email-providers (✅ Tam sayfa doğrulanmış)
- Postmark Pricing (✅ doğrulanmış): https://postmarkapp.com/pricing
- Resend Pricing (✅ doğrulanmış): https://resend.com/pricing

### Dikkat Edilecekler

1. **CAN-SPAM / GDPR uyumluluğu** — Her email'de unsubscribe linki zorunlu
2. **Spam complaints <%0.05** — Yüksek şikayet = domain reputation düşer
3. **Double opt-in** — Marketing email için double opt-in kullan
4. **Transactional vs Marketing ayrımı** — Aynı IP'den gönderme, stream ayır (Postmark'ın Message Streams modeli)
5. **A/B test** — Subject line ve send time test et (bkz. AB_TESTING_STRATEGY.md)
6. **Email warm-up** — Yeni domain'de yavaş yavaş artır (100 → 500 → 1K → 5K)
7. **Resend free tier limiti** — 100/gün limiti var, batch job'ları buna göre ayarla
8. **Gmail API limiti** — 2,000/gün, transactional için yeterli ama marketing için Resend kullan
