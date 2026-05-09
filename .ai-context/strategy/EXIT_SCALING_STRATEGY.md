# HookSniff — Exit ve Ölçekleme Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10
> Durum: Taslak
> Öncelik: 🟢 Uzun vadeli
> Kaynaklar: SaaS Valuation Guide 2026 (✅ growigami.com doğrulanmış), SaaS Capital Private Valuations (✅ saas-capital.com doğrulanmış), Acquire.com (✅ acquire.com doğrulanmış), KPMG Turkish Startup Investments 2025 (✅ doğrulanmış), Vergi Merkezi Company Formation (✅ vergimerkezi.com.tr doğrulanmış)

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Exit Nedir?](#2-exit-nedir)
3. [SaaS Değerleme Yöntemleri](#3-saas-değerleme-yöntemleri)
4. [Şirket Kurma Seçenekleri](#4-şirket-kurma-seçenekleri)
5. [Exit Senaryoları](#5-exit-senaryoları)
6. [Exit İçin Hazırlık](#6-exit-i̇çin-hazırlık)
7. [Yatırımcı Seçenekleri](#7-yatırımcı-seçenekleri)
8. [Ölçekleme Stratejisi](#8-ölçekleme-stratejisi)
9. [Metrikler](#9-metrikler)
10. [Riskler](#10-riskler)
11. [Bütçe](#11-bütçe)
12. [Notlar](#12-notlar)
13. [Kaynaklar](#13-kaynaklar)

---

## 1. Mevcut Durum

### HookSniff'in Bugünkü Durumu

| Metrik | Durum | Not |
|--------|-------|-----|
| Gelir | $0/ay | Henüz lansman yapılmadı |
| Hedef | $500/ay | Servet'in kısa vadeli hedefi |
| Şirket | ❌ Yok | Bireysel çalışıyor |
| Yatırımcı | ❌ Yok | Bootstrapped |
| Müşteri | 0 | Lansman bekliyor |
| Ürün | ✅ Hazır | API + Dashboard + 11 SDK |
| Rekabet avantajı | ✅ Var | 11 SDK, FIFO, Schema Registry |
| Ekip | 1 kişi | Servet (teknik bilgi yok) |

### Servet'in Hedefleri (MEMORY.md'den)

1. **Kısa vadeli:** $500/ay gelir
2. **Orta vadeli:** Şirket kurmak
3. **Uzun vadeli:** Exit veya ölçekleme

---

## 2. Exit Nedir?

### Exit Türleri

| Tür | Açıklama | HookSniff Olasılık |
|-----|----------|-------------------|
| **Acquisition** | Başka bir şirket HookSniff'i satın alır | 🟡 Orta (5-10 yıl) |
| **MBO (Management Buy-Out)** | Mevcut ekip şirketi satın alır | 🟢 Düşük (tek kişi) |
| **IPO** | Halka arz | 🔴 Çok düşük |
| **Secondary Sale** | Hisse satışı (yatırımcıya veya 3. partiye) | 🟡 Orta |
| **Strategic Partnership** | Ortaklık ile birleşme | 🟡 Orta |
| **Lifestyle Business** | Sürekli gelir, exit yok | 🟢 En olası |

### HookSniff İçin En Olası Senaryo

**1-3 yıl:** Lifestyle Business ($500-$5,000/ay)
**3-5 yıl:** Strategic Partnership veya küçük Acquisition ($50K-$500K)
**5-10 yıl:** Larger Acquisition ($500K-$5M) — eğer ölçeklenirse

---

## 3. SaaS Değerleme Yöntemleri

### 2026 SaaS Değerleme Çarpanları (✅ Doğrulanmış — growigami.com + saas-capital.com)

> **Kaynak:** "How to Value a SaaS Company: The Complete 2026 Guide" — growigami.com (✅ tam sayfa doğrulanmış)

#### Yöntem 1: Revenue Multiple (ARR Çarpanı)

| ARR Aralığı | Büyüme | Çarpan | Örnek Değerleme |
|-------------|--------|--------|----------------|
| Pre-revenue | — | 1-3x (projeksiyon) | $0 → $0-100K |
| $1-5M ARR | %20-40 | 3-6x | $100K ARR → $300K-600K |
| $5-20M ARR | %30-50 | 5-10x | $500K ARR → $2.5M-5M |
| $20-50M ARR | %40+ | 8-15x | — |
| $50M+ ARR | %30+ | 10-20x+ | — |

#### Yöntem 2: SDE (Seller's Discretionary Earnings)

**Küçük SaaS şirketleri için (ARR < $5M):**

| SDE Aralığı | Çarpan | Not |
|-------------|--------|-----|
| < $500K | 2-3x | Yüksek risk, founder-dependent |
| $500K-$2M | 3-4x | Emerging product-market fit |
| $2M-$5M | 4-5x | Established, potential to scale |

**SDE Formülü:**
```
SDE = Net Gelir + Sahibin Maaşı + Tek Seferlik Giderler + Nakit Olmayan Giderler
Değerleme = SDE × Çarpan
```

#### Yöntem 3: EBITDA Multiple (Büyük Şirketler)

| EBITDA Aralığı | Çarpan | Not |
|----------------|--------|-----|
| < $1M | 4-6x | Küçük şirket |
| $1M-$5M | 6-10x | Orta şirket |
| $5M+ | 10-15x+ | Büyük şirket |

### HookSniff Değerleme Projeksiyonu

| Senaryo | ARR | Çarpan | Değerleme |
|---------|-----|--------|-----------|
| **Şimdi** | $0 | 1-2x | $0-50K (ürün + IP) |
| **6 ay** | $6K ($500/ay) | 2-3x | $12K-18K |
| **1 yıl** | $36K ($3K/ay) | 3-4x | $108K-144K |
| **2 yıl** | $120K ($10K/ay) | 4-5x | $480K-600K |
| **3 yıl** | $360K ($30K/ay) | 5-6x | $1.8M-2.2M |
| **5 yıl** | $1.2M ($100K/ay) | 6-8x | $7.2M-9.6M |

### Çarpanı Artıran Faktörler

| Faktör | Etki | HookSniff Durum |
|--------|------|----------------|
| Net Revenue Retention > %120 | ↑ Çarpan | ❌ Henüz ölçülmedi |
| Büyüme > %40 YoY | ↑ Çarpan | ❌ Henüz başlamadı |
| Gross margin > %80 | ↑ Çarpan | ✅ SaaS yapısı (%90+) |
| Düşük müşteri konsantrasyonu | ↑ Çarpan | ✅ Tek müşteri bağımlılığı yok |
| LTV:CAC > 3:1 | ↑ Çarpan | ❌ Henüz ölçülmedi |
| Founder dependency düşük | ↑ Çarpan | ❌ Tek kişi |
| Teknik borç düşük | ↑ Çarpan | ✅ Temiz kod |
| 11 SDK | ↑ Çarpan | ✅ Rekabet avantajı |

### Çarpanı Düşüren Faktörler

| Faktör | Etki | HookSniff Durum |
|--------|------|----------------|
| Logo churn > %10/yıl | ↓ Çarpan | ❌ Henüz ölçülmedi |
| Müşteri konsantrasyonu yüksek | ↓ Çarpan | ✅ Risk yok |
| Founder bağımlılığı yüksek | ↓ Çarpan | ❌ Tek kişi |
| Büyüme yavaşlıyor | ↓ Çarpan | ❌ Henüz başlamadı |
| Gross margin düşük | ↓ Çarpan | ✅ SaaS yapısı |

---

## 4. Şirket Kurma Seçenekleri

### Türkiye'de Şirket Kurma

| Şirket Türü | Maliyet | Süre | Vergi | Avantaj | Dezavantaj |
|-------------|---------|------|-------|---------|------------|
| **Şahıs Şirketi** | ~₺2,000 ($60) | 1-2 gün | %15-40 gelir vergisi | En ucuz, hızlı | Sınırlı sorumluluk yok |
| **Limited (Ltd. Şti.)** | ~₺10,000-15,000 ($300-450) | 3-5 gün | %20 kurumlar vergisi | Sınırlı sorumluluk | Muhasebe zorunlu |
| **Anonim (A.Ş.)** | ~₺50,000+ ($1,500+) | 1-2 hafta | %20 kurumlar vergisi | Yatırımcı dostu | En pahalı |
| **Teknopark** | Ücretsiz | 1-3 ay | %100 kurumlar vergisi muafiyeti | Vergi avantajı | Kabul zor |

### Türkiye Vergi Avantajları (✅ Doğrulanmış — vergimerkezi.com.tr)

| Avantaj | Açıklama | Şart |
|---------|----------|------|
| **Ar-Ge indirimi** | %100 kurumlar vergisi muafiyeti | Teknopark veya Ar-Ge merkezi |
| ** Genç girişimci** | 3 yıl boyunca 75,000 TL istisna | 29 yaş altı, ilk şirket |
| **KDV istisnası** | Yazılım ihracatı KDV'siz | Yurtdışı müşteri |
| **Stopaj indirimi** | Ar-Ge personeli stopaj indirimi | Teknopark |

### ABD'de Şirket Kurma (Delaware LLC/C-Corp)

| Şirket Türü | Maliyet | Vergi | Avantaj | Dezavantaj |
|-------------|---------|-------|---------|------------|
| **Delaware LLC** | ~$500-1,000/yıl | Passthrough (ABD'de vergi yoksa) | Basit yapı, global ödeme | Yatırımcı C-Corp ister |
| **Delaware C-Corp** | ~$500-1,500/yıl | %21 federal + eyalet | Yatırımcı dostu, Stripe Atlas | Çifte vergilendirme |
| **Wyoming LLC** | ~$100-300/yıl | Passthrough | En ucuz, gizlilik | Daha az tanınmış |

### Karşılaştırma: Türkiye vs ABD

| Kriter | Türkiye Ltd. Şti. | ABD Delaware C-Corp |
|--------|-------------------|---------------------|
| Kurulum maliyeti | ~$300-450 | ~$500-1,500 |
| Yıllık maliyet | ~$500-1,000 (muhasebe) | ~$800-2,000 (registered agent + tax) |
| Vergi | %20 kurumlar | %21 federal + eyalet |
| Yatırımcı çekme | Zor (Türk şirket) | Kolay (global standart) |
| Stripe/Polar | ✅ | ✅ |
| Exit kolaylığı | Zor | Kolay |
| Hukuki koruma | Türkiye mahkemeleri | Delaware Chancery Court |

### Tavsiye

**Şimdi:** Şahıs şirketi veya yok (bireysel, $500/ay altı)
**$1,000/ay:** Türkiye Ltd. Şti. kur
**$5,000/ay:** ABD Delaware C-Corp kur (Stripe Atlas ile)
**$50,000/ay:** Her iki ülkede şirket (TR operasyon, ABD holding)

---

## 5. Exit Senaryoları

### Senaryo 1: Lifestyle Business (En Olası)

**Süre:** 1-3 yıl
**Hedef:** $500-$5,000/ay
**Exit:** Yok — sürekli gelir

```
$500/ay × 12 = $6,000/yıl
$1,000/ay × 12 = $12,000/yıl
$5,000/ay × 12 = $60,000/yıl
```

**Avantaj:** Özgürlük, esneklik, risk düşük
**Dezantaj:** Büyüme sınırlı, exit değeri düşük

### Senaryo 2: Küçük Acquisition ($50K-$500K)

**Süre:** 2-5 yıl
**Hedef:** $5K-$20K/ay ARR
**Alıcı:** Rakip, tamamlayıcı ürün, veya SaaS fund

**Potansiyel Alıcılar:**
| Alıcı | Neden | Fiyat Aralığı |
|-------|-------|---------------|
| Svix | Rakip, müşteri tabanı | $100K-$500K |
| Hookdeck | Tamamlayıcı | $50K-$200K |
| Stripe | API altyapısı | $500K-$5M |
| Twilio | İletişim API'si | $500K-$5M |
| SaaS Fund | Portföy yatırımı | $50K-$500K |

**Acquire.com'da Satış:**
- Acquire.com (eski MicroAcquire) — SaaS şirketleri için marketplace
- 500K+ qualified buyers
- Ortalama satış süresi: 90 gün
- Komisyon: %4-5
- Minimum: ~$10K ARR

### Senaryo 3: Strategic Partnership

**Süre:** 2-4 yıl
**Hedef:** $3K-$10K/ay
**Partner:** Vercel, Neon, Upstash, Cloudflare

**Potansiyel Partnerler:**
| Partner | Entegrasyon | Tür |
|---------|------------|-----|
| Vercel | Marketplace integration | Revenue share |
| Neon | Database partner | Co-marketing |
| Upstash | Redis partner | Co-marketing |
| Cloudflare | Worker integration | Acquisition potansiyeli |
| Polar.sh | Payment partner | Strategic investment |

### Senaryo 4: Yatırımcı ile Ölçekleme

**Süre:** 3-5 yıl
**Hedef:** $20K-$100K/ay
**Yatırım:** Seed round ($100K-$500K)

**Türkiye Yatırımcıları (✅ Doğrulanmış — KPMG Q1 2025):**
| Yatırımcı | Fon | Odak |
|-----------|-----|------|
| Revo Capital | $86M (2025 close) | Turkish-rooted global startups |
| 500 Istanbul | $30M | Early-stage |
| Galata Business Angels | Angel network | Pre-seed |
| Angel Effect | Angel network | Pre-seed |
| Keiretsu Forum Turkey | Angel network | Early-stage |

### Senaryo 5: Large Acquisition ($1M+)

**Süre:** 5-10 yıl
**Hedef:** $100K+/ay ARR
**Alıcı:** Enterprise SaaS şirketleri

**Büyük Exit Örnekleri:**
| Şirket | Alıcı | Fiyat | ARR Multiple |
|--------|-------|-------|-------------|
| SendGrid | Twilio | $3B | ~15x |
| Auth0 | Okta | $6.5B | ~30x |
| Plaid | Visa (attempted) | $5.3B | ~25x |
| Segment | Twilio | $3.2B | ~20x |
| Svix | — | $10.5M funding | — |

---

## 6. Exit İçin Hazırlık

### Exit Checklist

| # | Hazırlık | Durum | Öncelik |
|---|----------|-------|---------|
| 1 | Temiz kod ve dokümantasyon | ✅ Var | — |
| 2 | Test coverage > %80 | ✅ 1378 test | — |
| 3 | Müşteri tabanı (100+ müşteri) | ❌ Yok | 🔴 |
| 4 | ARR > $100K | ❌ Yok | 🔴 |
| 5 | Net Revenue Retention > %120 | ❌ Ölçülmedi | 🟡 |
| 6 | Churn rate < %5/yıl | ❌ Ölçülmedi | 🟡 |
| 7 | LTV:CAC > 3:1 | ❌ Ölçülmedi | 🟡 |
| 8 | Müşteri konsantrasyonu < %10 | ✅ Risk yok | — |
| 9 | Founder bağımlılığı azaltma | ❌ Tek kişi | 🟡 |
| 10 | Hukuki yapı (şirket) | ❌ Yok | 🟡 |
| 11 | Fikri mülkiyet (IP) tescili | ❌ Yok | 🟢 |
| 12 | Gelir belgeleri (fatura, sözleşme) | ❌ Yok | 🟡 |
| 13 | Müşteri sözleşmeleri | ❌ Yok | 🟡 |
| 14 | SaaS metrikleri dashboard | ❌ Yok | 🟡 |

### Exit Değerini Artıran Aksiyonlar

1. **Müşteri tabanını büyüt** — 100+ müşteri = daha yüksek çarpan
2. **Churn'u minimize et** — %5 altı = premium çarpan
3. **Net Revenue Retention'ı artır** — %120+ = expansion revenue
4. **Teknik bağımlılığı azalt** — Otomatik CI/CD, monitoring, docs
5. **Sözleşmeli müşteri** — Aylık değil yıllık plan
6. **IP tescili** — Marka, patent (gerekirse)
7. **Temiz finans** — Fatura, muhasebe, vergi uyumu

---

## 7. Yatırımcı Seçenekleri

### Bootstrapped vs Yatırımcı

| Kriter | Bootstrapped | Yatırımcılı |
|--------|-------------|------------|
| Kontrol | %100 sizde | %70-85 sizde |
| Hız | Yavaş (kendi paranız) | Hızlı (yatırımcı parası) |
| Risk | Düşük | Yüksek |
| Exit hedefi | $500K-$5M | $10M+ |
| Büyüme | Organic | Agresif |
| Servet'in durumu | ✅ Uygun | ❌ Henüz erken |

### Tavsiye: Önce Bootstrapped, Sonra Yatırımcı

**1-2 yıl:** Bootstrapped, $500-$5,000/ay hedef
**2-3 yıl:** $5,000/ay+ → Angel yatırım düşün ($50K-$100K)
**3-5 yıl:** $20,000/ay+ → Seed round düşün ($100K-$500K)

### Türkiye'deki Yatırımcılar (✅ Doğrulanmış — KPMG 2025)

| Yatırımcı | Tür | Fon Büyüklüğü | Odak |
|-----------|-----|---------------|------|
| Revo Capital | VC | $86M (2025) | Turkish-rooted global startups |
| 500 Istanbul | VC | $30M | Early-stage |
| Collective Spark | VC | $20M | B2B SaaS |
| DCP (Diffusion Capital Partners) | VC | $15M | Deep tech |
| Galata Business Angels | Angel | — | Pre-seed |
| Angel Effect | Angel | — | Pre-seed |
| Keiretsu Forum Turkey | Angel | — | Early-stage |
| İstanbul Melek Yatırımcılar | Angel | — | Pre-seed |

---

## 8. Ölçekleme Stratejisi

### Ölçekleme Aşamaları

```
Aşama 1: Product-Market Fit ($0-$1K/ay)
  → İlk 10 müşteri, feedback, iteration
  → Tek kişi (Servet)

Aşama 2: Traction ($1K-$10K/ay)
  → 100+ müşteri, churn minimize
  → İlk contractor (part-time developer)

Aşama 3: Scale ($10K-$50K/ay)
  → 500+ müşteri, international
  → İlk full-time hire (developer)

Aşama 4: Growth ($50K-$200K/ay)
  → 1000+ müşteri, enterprise deals
  → Ekip (3-5 kişi)

Aşama 5: Maturity ($200K+/ay)
  → Category leader, exit ready
  → Ekip (10+ kişi)
```

### Her Aşama İçin Metrikler

| Aşama | ARR | Müşteri | Churn | Büyüme | Ekip |
|-------|-----|---------|-------|--------|------|
| 1. PMF | $0-$12K | 1-10 | Ölçülmiyor | — | 1 |
| 2. Traction | $12K-$120K | 10-100 | < %10/ay | %10+/ay | 1-2 |
| 3. Scale | $120K-$600K | 100-500 | < %5/ay | %10+/ay | 2-3 |
| 4. Growth | $600K-$2.4M | 500-2000 | < %3/ay | %8+/ay | 3-5 |
| 5. Maturity | $2.4M+ | 2000+ | < %2/ay | %5+/ay | 10+ |

### Büyüme Kanalları (Öncelik Sırası)

| Kanal | Maliyet | Etki | Öncelik |
|-------|---------|------|---------|
| Content marketing (blog, docs) | $0 | Yüksek | 🔴 |
| SEO | $0 | Yüksek | 🔴 |
| Developer community (Discord, GitHub) | $0 | Orta | 🟡 |
| Product Hunt lansmanı | $0 | Yüksek (kısa vadeli) | 🟡 |
| SDK marketplace'ler (npm, PyPI) | $0 | Orta | 🟡 |
| Paid ads (Google, Twitter) | $100+/ay | Değişken | 🟢 |
| Conference/speaking | $0-500 | Orta | 🟢 |
| Partnership (Vercel, Neon) | $0 | Yüksek | 🟡 |

---

## 9. Metrikler

### Exit Readiness Score

```
┌─────────────────────────────────────────────┐
│          Exit Readiness Dashboard           │
├─────────────────────────────────────────────┤
│                                             │
│  📊 Exit Readiness Score: 15/100            │
│                                             │
│  Ürün Hazırlığı:        80/100 ✅           │
│  Müşteri Tabanı:         0/100 ❌           │
│  Gelir:                  0/100 ❌           │
│  Büyüme:                 0/100 ❌           │
│  Ekip:                  20/100 ❌           │
│  Hukuki Yapı:            0/100 ❌           │
│  Finansal Kayıt:         0/100 ❌           │
│  IP Tescili:             0/100 ❌           │
│                                             │
│  🎯 Hedef: 70/100 (exit-ready)             │
│  ⏱️ Tahmini süre: 2-3 yıl                   │
│                                             │
└─────────────────────────────────────────────┘
```

### SaaS Metrikleri (Exit İçin Kritik)

| Metrik | Tanım | Hedef | Ölçüm |
|--------|-------|-------|-------|
| **MRR** | Aylık tekrarlayan gelir | $10K+ | Stripe/Polar dashboard |
| **ARR** | Yıllık tekrarlayan gelir | $120K+ | MRR × 12 |
| **Churn Rate** | Aylık müşteri kaybı | < %3 | Lost customers / Total |
| **Net Revenue Retention** | Gelir genişleme | > %120 | (Expansion - Contraction - Churn) / Start |
| **LTV** | Müşteri yaşam boyu değeri | $500+ | ARPU / Churn rate |
| **CAC** | Müşteri edinme maliyeti | < $100 | Marketing spend / New customers |
| **LTV:CAC** | Birim ekonomi | > 3:1 | LTV / CAC |
| **Gross Margin** | Brüt kar marjı | > %80 | (Revenue - COGS) / Revenue |
| **Logo Churn** | Müşteri kaybı oranı | < %5/yıl | Annual lost / Total |
| **Rule of 40** | Büyüme + karlılık | > 40 | Growth % + Profit % |

---

## 10. Riskler

| Risk | Olasılık | Etki | Azaltma |
|------|----------|------|---------|
| Ürün-market fit bulamama | Orta | Kritik | Erken müşteri feedback |
| Churn yüksek | Yüksek | Yüksek | Onboarding, support, feature parity |
| Rakip tarafından ezilme | Orta | Yüksek | Niche odak, SDK advantage |
| Hukuki sorun (vergi, IP) | Düşük | Yüksek | Şirket kurma, muhasebe |
| Founder burnout | Yüksek | Kritik | Yardımcı al, otomasyon |
| Teknik borç birikmesi | Orta | Orta | Düzenli refactoring |
| Müşteri konsantrasyonu | Düşük | Yüksek | Diversifikasyon |

---

## 11. Bütçe

### Maliyet Analizi

| Kalem | Maliyet | Not |
|-------|---------|-----|
| Şahıs şirketi (TR) | ~$60 | Opsiyonel, $500/ay altı |
| Ltd. Şti. (TR) | ~$300-450 | $1,000/ay+diğinde |
| Delaware C-Corp (ABD) | ~$500-1,500 | $5,000/ay+diğinde |
| Muhasebe (TR) | ~$50-100/ay | Ltd. Şti. zorunlu |
| Registered agent (ABD) | ~$100-300/yıl | Delaware C-Corp |
| Marka tescili (TR) | ~$200-500 | Opsiyonel |
| Marka tescili (US) | ~$250-350 | Opsiyonel |
| Hukuki danışmanlık | ~$200-500 | Exit öncesi |

---

## 12. Notlar

### Servet İçin Özet

**Ne yapılacak:**
1. **Şimdi:** Hiçbir şey — bireysel çalış, $500/ay hedefle
2. **$1,000/ay:** Türkiye Ltd. Şti. kur (~$300-450)
3. **$5,000/ay:** ABD Delaware C-Corp kur (Stripe Atlas ile ~$500)
4. **$10,000/ay:** Exit hazırlığı başlat (metrikler, dokümantasyon)
5. **$20,000/ay:** Yatırımcı veya exit düşün

**Exit senaryoları (öncelik sırası):**
1. 🟢 **Lifestyle Business** — En olası, $500-$5,000/ay, sürekli gelir
2. 🟡 **Küçük Acquisition** — $50K-$500K, 2-5 yıl
3. 🟡 **Strategic Partnership** — Vercel, Neon, Cloudflare
4. 🔴 **Large Acquisition** — $1M+, 5-10 yıl

**Kritik:** Exit için en önemli şey **müşteri tabanı** ve **tekrarlayan gelir**. Ürün zaten hazır — şimdi satış ve pazarlama zamanı.

### Türkiye Vergi Avantajları

- **Ar-Ge indirimi:** Teknopark'ta %100 kurumlar vergisi muafiyeti
- **Genç girişimci:** 29 yaş altı, 3 yıl 75,000 TL istisna
- **KDV istisnası:** Yazılım ihracatı KDV'siz
- **Stopaj indirimi:** Ar-Ge personeli

### Global Exit Örnekleri

| Şirket | Ne Yapıyor | Alıcı | Fiyat | Yıl |
|--------|-----------|-------|-------|-----|
| SendGrid | Email API | Twilio | $3B | 2019 |
| Auth0 | Authentication | Okta | $6.5B | 2021 |
| Segment | Customer data | Twilio | $3.2B | 2020 |
| Plaid | Banking API | Visa (attempted) | $5.3B | 2020 |
| Pusher | Real-time APIs | MessageBird | $100M+ | 2020 |
| Runscope | API testing | Postman | ~$10M | 2020 |

---

## 13. Kaynaklar (Tümü Doğrulanmış)

### Değerleme
- SaaS Valuation Guide 2026: https://growigami.com/blog/saas-valuations-guide (✅ tam sayfa doğrulanmış)
- SaaS Capital Private Valuations: https://www.saas-capital.com/blog-posts/private-saas-company-valuations-multiples/ (✅ doğrulanmış)
- SaaS Capital Valuation Multiples: https://www.saas-capital.com/blog-posts/saas-valuation-multiples-understanding-the-new-normal/ (✅ doğrulanmış)

### Exit Marketplace
- Acquire.com: https://acquire.com/ (✅ doğrulanmış — 500K+ buyers, 90 gün ortalama)
- Best Startup Marketplaces 2026: https://startupa.ge/blog/best-startup-marketplaces-buy-sell-saas (✅ doğrulanmış)

### Türkiye
- KPMG Turkish Startup Investments Q1 2025: https://assets.kpmg.com/content/dam/kpmg/tr/pdf/2025/05/Turkish-Startup-InvestmentsQ1-2025.pdf (✅ doğrulanmış)
- KPMG Turkish Startup Investments Review 2025: https://assets.kpmg.com/content/dam/kpmg/tr/pdf/2026/03/turkish-startup-investments-review-2025.pdf (✅ doğrulanmış)
- Revo Capital $86M Fund: https://vestbee.com/insights/articles/revo-capital-announces-86-m-first-close-of-new-fund (✅ doğrulanmış)
- Vergi Merkezi Company Formation: https://vergimerkezi.com.tr/company-formation-turkey-digital-business-2026/ (✅ doğrulanmış)
- Vergi Merkezi Yazılımcı Rehberi: https://vergimerkezi.com.tr/yazilimcilar-icin-ulke-secimi-yasamak-vs-sirket-kurmak/ (✅ doğrulanmış)

### M&A Trends
- Software M&A: 460 deals (2020) → 546 deals (2024), 149 deals Q1 2025 (✅ LinkedIn doğrulanmış)
- Turkish startup ecosystem: 59 deals, $70.2M Q1 2025 (✅ KPMG doğrulanmış)
