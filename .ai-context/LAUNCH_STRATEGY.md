# HookSniff — Lansman ve Büyüme Stratejisi

> Oluşturma: 2026-05-09
> Durum: Taslak — Servet onayı bekliyor

---

## İçindekiler

1. [Rakip Analizi](#1-rakip-analizi)
2. [Fiyatlandırma Stratejisi](#2-fiyatlandırma-stratejisi)
3. [Ödeme Sistemi Seçimi](#3-ödeme-sistemi-seçimi)
4. [Müşteri Bulma — Türkiye](#4-müşteri-bulma--türkiye)
5. [Müşteri Bulma — Global](#5-müşteri-bulma--global)
6. [Lansman Takvimi](#6-lansman-takvimi)
7. [İçerik Şablonları](#7-içerik-şablonları)
8. [Beklenen Sonuçlar](#8-beklenen-sonuçlar)
9. [Servet'in Yapması Gerekenler](#9-servetin-yapması-gerekenler)

---

## 1. Rakip Analizi

### Doğrudan Rakipler

| | Svix | Hookdeck | Hook0 | HookSniff |
|---|---|---|---|---|
| Ne yapıyor | Webhook gönderme | Webhook alma (inbound) | Webhook gönderme | Webhook gönderme |
| Free plan | $0, 50 msg/sn, 30 gün | $0, 10K event, 3 gün | $0, self-hosted sınırsız | $0, 10K webhook, 7 gün |
| Pro plan | $490/ay | $39/ay | Self-hosted ücretsiz | $49/ay |
| Enterprise | Özel fiyat | $499/ay | Özel fiyat | Özel fiyat |
| Self-hosted | Kısmi (open-core) | Yok | Tam (SSPL lisans) | Yok |
| SDK sayısı | 5 | 4 | 2 | 11 |
| Fonlama | $17M yatırımlı | $5.5M yatırımlı | Self-funded | $0 |

### Pazar Pozisyonu

- **Svix:** Pahalı ($490/ay), büyük şirketlere yönelik. Açık kaynak versiyonu eksik (open-core).
- **Hookdeck:** Farklı sorun çözüyor (webhook alma). Aslında rakip değil, tamamlayıcı olabilir.
- **Hook0:** En tehlikeli rakip. Açık kaynak, self-hosted ücretsiz. Ama sadece 2 SDK var.
- **HookSniff avantajları:** 11 SDK, FIFO teslimat, Schema Registry, CloudEvents desteği. Türkiye'de rakip yok.

### Rakiplerin Yapamadıkları (HookSniff'te Var)

| Özellik | Svix | Hookdeck | Hook0 | HookSniff |
|---------|------|----------|-------|-----------|
| FIFO teslimat | Yok | Yok | Yok | Var |
| Schema Registry | Yok | Yok | Yok | Var |
| CloudEvents v1.0 | Yok | Yok | Yok | Var |
| 11 SDK | Yok (5) | Yok (4) | Yok (2) | Var |
| Türkiye fiyatlandırması | Yok | Yok | Yok | Var |

---

## 2. Fiyatlandırma Stratejisi

### Global Fiyatlar

| Plan | Fiyat | Webhook | Endpoint | Retention | Kullanıcı |
|------|-------|---------|----------|-----------|-----------|
| Free | $0/ay | 5.000 | 2 | 3 gün | 1 |
| Starter | $29/ay | 25.000 | 10 | 30 gün | 3 |
| Pro | $99/ay | 200.000 | 100 | 90 gün | 10 |
| Enterprise | Özel | Sınırsız | Sınırsız | 365 gün | Sınırsız |

### Türkiye Fiyatları

| Plan | Fiyat | Webhook | Endpoint | Retention | Kullanıcı |
|------|-------|---------|----------|-----------|-----------|
| Free | ₺0/ay | 5.000 | 2 | 3 gün | 1 |
| Starter | ₺99/ay | 25.000 | 10 | 30 gün | 3 |
| Pro | ₺299/ay | 200.000 | 100 | 90 gün | 10 |
| Enterprise | Özel | Sınırsız | Sınırsız | 365 gün | Sınırsız |

### Neden Bu Fiyatlar?

- **$29 Starter:** Hookdeck $39, onlardan ucuz olmak için. İlk müşterileri kapmak gerekli.
- **$99 Pro:** Svix $490, "5 kat ucuz" mesajı güçlü bir pazarlama argümanı.
- **₺99 Starter (Türkiye):** $29 = ~₺1000, Türkiye'de pahalı. ₺99 psikolojik olarak erişilebilir.
- **₺299 Pro (Türkiye):** Kurumsal bütçe için uygun seviye.
- **5K free (10K değil):** Daha agresif geçiş. Kullanıcı 5K'dan sonra Pro'ya geçsin.

### Opsiyonel İndirimler

| İndirim | Oran | Koşul |
|---------|------|-------|
| Yıllık ödeme | %20 | 12 ay peşin ödeme |
| Founding User | %50 ömür boyu | İlk 100 kullanıcı |
| Startup programı | %75 ilk yıl | Yeni kurulan şirketler |

### Pazarlama Mesajları

- Landing page: "5x cheaper than Svix"
- Türkiye: "Türkiye'nin ilk webhook platformu"
- Global: "Reliable webhook delivery for developers"

---

## 3. Ödeme Sistemi Seçimi

### Başlangıç: Polar.sh

| Konu | Detay |
|------|-------|
| Komisyon | %4 + 40¢ per transaction |
| Uluslararası kart | +1.5% |
| Abonelik | +0.5% |
| Şirket gerekli mi? | Hayır (MoR — Merchant of Record) |
| Vergi | Polar.sh halleder |
| Türkiye kart desteği | Var (Stripe üzerinden) |
| Payout | Stripe üzerinden, $2/ay + %0.25 |

**Neden Polar.sh?**
- Türkiye'de şirket kurmadan satış yapılabilir
- MoR olarak KDV/müşteri işlerini Polar halleder
- Entegrasyonu kolay
- HookSniff zaten Polar.sh entegrasyonuna sahip

### Sonra: iyzico (Şirket Kurulduktan Sonra)

| Konu | Detay |
|------|-------|
| Komisyon | ~%2-3 |
| Şirket gerekli mi? | Evet (vergi levhası şart) |
| Türkiye kart desteği | Tam (taksit imkanı dahil) |
| Avantaj | Düşük komisyon, taksit |

**Ne zaman iyzico'ya geç?**
- Şirket kurulduktan sonra
- Aylık $500+ gelir olduğunda
- Türkiye'den ciddi müşteri geldiğinde

---

## 4. Müşteri Bulma — Türkiye

### 4.1 Reddit — r/CodingTR

**Ne:** Türkiye'nin en büyük developer subreddit'i.

**Post formatı:**
```
Başlık: Sıfır maliyetle webhook platformu yaptım — 11 dilde SDK

Herkese merhaba,

Son birkaç aydır webhook teslimat platformu geliştiriyorum.
Bugün itibarıyla:

- 11 dilde SDK (Node.js, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)
- 952 test, 0 hata
- $0/ay hosting maliyeti
- HMAC-SHA256 imzalama
- Otomatik retry + dead letter queue
- FIFO teslimat

Rakipler: Svix $490/ay, Hookdeck $39/ay
Ben: $49/ay (Türkiye'de ₺99/ay)

Demo: [link]
GitHub: [link]

Beta programı açık, ilk 20 kişiye 6 ay ücretsiz Pro.

Ne dersiniz, nasıl olmuş?
```

**Kurallar:**
- Hafta içi 10:00-14:00 arası paylaş
- Reklam gibi görünme, "yaptım, nasıl olmuş?" formatında ol
- Her yorumu cevapla
- Aynı hafta 2'den fazla post atma

### 4.2 Twitter/X Türkiye

**Tweet dizisi:**
```
1/ Webhook altyapısı kurdum. Rust ile yazdım. 11 dilde SDK var.
   $0/ay maliyetle çalışıyor. Rakipler $490/ay istiyor. 🧵

2/ Neden webhook? API'ler arasında güvenilir veri iletimi lazım.
   Sipariş oluşturuldu → Stok güncelle. Basit ama kritik.

3/ Teknik: Axum + PostgreSQL + Redis. 952 test. Standard Webhooks
   HMAC-SHA256 uyumlu. SSRF koruması. Rate limiting.

4/ Maliyet: Google Cloud Run free tier + Neon PostgreSQL + Vercel.
   Hiçbir sunucu parası yok. $0/ay.

5/ Rakipler: Svix $490/ay. Hookdeck $39/ay. Ben $49/ay.
   Türkiye'de ₺99/ay. 5x daha ucuz.

6/ Denemek isteyen: [link]
   Beta: İlk 20 kişiye 6 ay ücretsiz Pro.
   #yazılımcı #startup #saas #webdev
```

**Hashtag'ler:** #yazılımcı #startup #saas #webdev #api #opensource #türkiye #teknoloji

### 4.3 LinkedIn Türkiye

**Post:**
```
2 ay önce webhook altyapısı yazmaya başladım.

Bugün:
✅ 11 dilde SDK
✅ 952 test, 0 hata
✅ $0/ay hosting
✅ HMAC-SHA256 imzalama
✅ Otomatik retry

Svix $490/ay istiyor.
Hookdeck $39/ay istiyor.
Ben $49/ay (Türkiye'de ₺99/ay).

Neden bu kadar ucuz? Çünkü Google Cloud Run free tier + Neon PostgreSQL
+ Vercel kullanıyorum. Hiçbir sunucu parası yok.

Denemek isteyenler yorum bıraksın. Beta programı açık.

#startup #saas #yazılımcı #teknoloji #türkiye
```

**Kurallar:**
- Startup founder'larını ve CTO'ları etiketle
- Her yorumu cevapla
- 1 hafta sonra update post paylaş ("50 kişi kaydoldu" gibi)

### 4.4 Ekşi Sözlük

- "hooksniff" başlığı aç
- Girişimci gözünden deneyimi anlat
- Teknik detaylardan çok "neden yaptım, ne işe yarar" anlat
- Kalıcı SEO sağlar

### 4.5 Türkiye Platformları

| Platform | Ne yapılacak |
|----------|-------------|
| Patika.dev | Toplulukta paylaş |
| Kodluyoruz | Projeyi tanıt |
| GDG Istanbul/Ankara | Online etkinliklerde paylaş |
| Startupcentrum | Kayıt ol, profili doldur |
| Telegram grupları | 1-2 gün sonra paylaş |
| Discord sunucuları | #showcase kanalında paylaş |

---

## 5. Müşteri Bulma — Global

### 5.1 Hacker News — "Show HN"

**En iyi zaman:** Salı veya Çarşamba, ABD Doğu saati 09:00-11:00 (Türkiye 16:00-18:00)

**Başlık:**
```
Show HN: HookSniff – Reliable webhook delivery, 11 SDKs, $0/month hosting
```

**İlk yorum (teknik detay):**
```
Hi HN, I built HookSniff — a webhook delivery platform in Rust.

What it does:
- Sends webhooks reliably with automatic retries
- HMAC-SHA256 signatures (Standard Webhooks compliant)
- 11 SDKs (Node, Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)
- FIFO ordered delivery, schema validation, smart routing
- Dead letter queue for failed deliveries

Tech stack:
- API: Rust (Axum)
- DB: PostgreSQL (Neon)
- Cache: Redis (Upstash)
- Dashboard: Next.js 15 (41 pages)
- Hosting: Google Cloud Run (free tier)

How it compares:
- 11 SDKs (Svix has 5, Hookdeck has 4)
- FIFO delivery (neither has this)
- Schema registry (neither has this)
- CloudEvents v1.0 support
- $0/month hosting on free tiers

952 tests, 0 failures. Open to feedback.

Demo: https://hooksniff.vercel.app
API: https://hooksniff-api-1046140057667.europe-west1.run.app
GitHub: https://github.com/servetarslan02/HookSniff
```

**Kurallar:**
- Her yorumu cevapla, eleştiriye açık ol
- İlk saatte 10+ upvote gelirse front page'e düşer
- Teknik detay ver, satış yapma

### 5.2 Reddit (İngilizce)

| Subreddit | Üye | Ne paylaşılacak | Ne zaman |
|-----------|-----|----------------|----------|
| r/webdev | 2.5M+ | Teknik post (Showoff Saturday) | Cumartesi |
| r/SaaS | 200K+ | Haftalık feedback thread | Pazartesi |
| r/SideProject | 150K+ | Direkt ürün tanıtımı | Her gün |
| r/opensource | 500K+ | Açık kaynak proje | Her gün |
| r/rust | 300K+ | Rust projesi | Salı |
| r/startups | 1M+ | Haftalık paylaşım thread | Haftalık |
| r/indiehackers | 50K+ | Indie ürün | Her gün |

**r/webdev post:**
```
Title: I built a webhook delivery platform in Rust that runs on $0/month

Body:
I've been working on a webhook delivery service for the past few months.
Here's what I learned:

- Rust + Axum is great for this kind of work
- PostgreSQL LISTEN/NOTIFY works well for real-time
- Standard Webhooks HMAC-SHA256 is the way to go

Features: 11 SDKs, automatic retries, FIFO delivery, schema validation,
dead letter queue.

Free to try: [link]

Would love feedback from the community.
```

**r/SideProject post:**
```
Title: HookSniff — Reliable webhook delivery for developers

Body:
Built a webhook platform in Rust. 11 SDKs, 952 tests, $0/month hosting.

Looking for feedback on:
1. Is the landing page clear?
2. Is the API easy to understand?
3. What features are missing?

[link]
```

**Kurallar:**
- r/webdev ve r/programming'de doğrudan reklam yasak
- r/SaaS'de haftalık "Share your project" thread'ini kullan
- Her yorumu cevapla

### 5.3 Dev.to + Hashnode

**Yazılar:**

| # | Başlık | Amaç |
|---|--------|------|
| 1 | "How I built a webhook delivery platform in Rust" | Teknik hikaye, Show HN ile aynı gün |
| 2 | "Webhook best practices for developers" | Eğitici, SEO kalıcı trafik |
| 3 | "Svix vs Hookdeck vs HookSniff: A comparison" | Karşılaştırma, rakip kullanıcıları çekme |
| 4 | "Building a webhook platform with $0/month hosting" | Maliyet breakdown, indie developer'lar |

**Paylaşım stratejisi:**
- Dev.to'da publish et → Hashnode'da cross-post et
- Canonical URL ayarla (duplicate content önlemi)
- Twitter ve Reddit'te paylaş

### 5.4 Product Hunt

**Hazırlık (2 hafta önce):**
- Ürün sayfası oluştur (logo, açıklama, ekran görüntüleri)
- "Notify me" butonu ekle
- 30-60 saniyelik demo video hazırla
- Promosyon görselleri hazırla (1270x760 banner, feature images)

**Lansman günü:**
- ABD saati 00:01'de (Pasifik) yayınla
- İlk 2 saat çok önemli, upvote topla
- Tüm platformlarda paylaş
- Beta kullanıcılardan destek iste

**En iyi gün:** Salı (en yüksek trafik) veya Cumartesi (daha az rekabet)

### 5.5 DevHunt.org

- Product Hunt'tan 1 hafta önce DevHunt'ta yayınla
- Developer tool'lara özel platform, daha az rekabet
- Aynı görselleri ve videoyu kullan
- Test run olarak kullan, Product Hunt için pratik

### 5.6 Launch Dizinleri (Ücretsiz)

| Platform | Neden | Maliyet |
|----------|-------|---------|
| BetaList | Yüksek trafik, backlink | Ücretsiz (yavaş) veya $129 (hızlı) |
| Peerlist Launchpad | Developer topluluğu | Ücretsiz |
| DevHunt | Developer tool odaklı | Ücretsiz |
| Uneed | Indie ürün platformu | Ücretsiz |
| AlternativeTo | Karşılaştırma sitesi | Ücretsiz |
| GitHub Awesome Lists | Açık kaynak listeleri | Ücretsiz (PR ile) |

**GitHub Awesome Lists:**
- `awesome-webhooks` listesine PR aç
- `awesome-selfhosted` listesine ekle
- `awesome-developer-tools` listesine ekle

### 5.7 Indie Hackers

- Ürün sayfası oluştur
- Milestone post: "Just launched my webhook platform"
- Progress update'ler paylaş: "Week 1: 50 signups"
- Diğer indie hacker'ların ürünlerine feedback ver

---

## 6. Lansman Takvimi

### Hafta 1: Türkiye Başlangıcı

| Gün | Platform | İçerik |
|-----|----------|--------|
| Pazartesi | Twitter/X TR | Tweet dizisi |
| Salı | r/CodingTR | Türkçe post |
| Çarşamba | LinkedIn TR | Kısa post |
| Perşembe | Telegram/Discord | Topluluklarda paylaş |
| Cuma | Ekşi Sözlük | Başlık aç |

### Hafta 2: Global Başlangıç

| Gün | Platform | İçerik |
|-----|----------|--------|
| Salı | **Hacker News** | Show HN |
| Salı | r/rust | Rust projesi |
| Çarşamba | r/webdev | Teknik post |
| Perşembe | r/SideProject | Ürün tanıtımı |
| Cuma | Dev.to | "How I built this" yazısı |

### Hafta 3: Blog + Dizinler

| Gün | Platform | İçerik |
|-----|----------|--------|
| Pazartesi | Hashnode | Karşılaştırma yazısı |
| Salı | BetaList | Kayıt ol |
| Çarşamba | DevHunt | Yayınla |
| Perşembe | r/SaaS | Feedback thread |
| Cuma | Indie Hackers | Milestone post |

### Hafta 4: Product Hunt

| Gün | Platform | İçerik |
|-----|----------|--------|
| Pazartesi | Product Hunt | Teaser sayfası |
| Salı | Twitter/X + LinkedIn | Lansman haberi |
| Çarşamba | Reddit | Hatırlatma |
| Perşembe | Tüm platformlar | Destek çağrısı |
| Cuma | **Product Hunt** | Lansman! |

### Hafta 5-8: Büyüme

- Geri bildirimlere göre ürün geliştirme
- Haftalık update post'ları paylaş
- Blog yazıları üretmeye devam et
- Beta kullanıcılarından testimonial topla

---

## 7. İçerik Şablonları

### Hazırlanması Gerekenler

| İçerik | Format | Nerede kullanılacak |
|--------|--------|---------------------|
| Demo video (30-60 sn) | MP4 | Product Hunt, DevHunt, Twitter |
| Banner görsel (1270x760) | PNG/JPG | Product Hunt, LinkedIn |
| Feature görseller (3-4 tane) | PNG/JPG | Product Hunt, Reddit |
| Logo (256x256) | PNG | Tüm platformlar |
| Show HN metni | Metin | Hacker News |
| Reddit post şablonları (5 tane) | Metin | Reddit |
| Blog yazıları (2-3 tane) | Metin | Dev.to, Hashnode |
| Tweet dizisi (2 tane) | Metin | Twitter/X |
| LinkedIn post (2 tane) | Metin | LinkedIn |

---

## 8. Beklenen Sonuçlar

### İlk 2 Ay Tahminleri

| Kaynak | Ziyaretçi | Signup | Ödeme |
|--------|-----------|--------|-------|
| Hacker News | 500-2.000 | 50-200 | 5-20 |
| Product Hunt | 300-1.000 | 30-100 | 3-10 |
| Reddit (toplam) | 200-500 | 20-50 | 2-5 |
| Dev.to/Hashnode | 100-300 | 10-30 | 1-3 |
| Dizinler | 50-100 | 5-10 | 0-1 |
| Türkiye platformları | 200-500 | 20-50 | 2-5 |
| **Toplam** | **1.350-4.400** | **135-440** | **13-44** |

### Gelir Projeksiyonu

| Ay | Kullanıcı | Aylık Gelir |
|----|-----------|-------------|
| 1 | 10-30 beta | $0 (hepsi free) |
| 2 | 30-80 | $100-300 |
| 3 | 50-150 | $300-800 |
| 6 | 150-400 | $1.000-3.000 |
| 12 | 400-1.000 | $3.000-10.000 |

Dönüşüm oranı: ~%10 signup, ~%10 ödeme (standart SaaS ortalaması)

---

## 9. Servet'in Yapması Gerekenler

### Hemen (Bu Hafta)

- [ ] iyzico hesabı aç (vergi levhası + banka hesabı)
- [ ] Twitter/X hesabı aç (yoksa) veya mevcut hesabı aktif kullan
- [ ] LinkedIn profili güncelle (girişimci olarak)
- [ ] Demo video hazırla (Canva ile, 30-60 saniye)
- [ ] Logo ve banner görselleri hazırla

### Kısa Vadeli (2-4 Hafta)

- [ ] Türkiye post'larını paylaş (Reddit TR, Twitter TR, LinkedIn TR)
- [ ] Hacker News'te Show HN paylaş
- [ ] Reddit'te İngilizce post'ları paylaş
- [ ] Dev.to'da ilk blog yazısını paylaş
- [ ] Beta kullanıcıları topla (hedef: 20 kişi)

### Orta Vadeli (1-3 Ay)

- [ ] Product Hunt lansmanı yap
- [ ] İlk ödeme müşterilerini al
- [ ] Beta kullanıcılarından testimonial topla
- [ ] Haftalık update post'ları paylaş
- [ ] Blog yazıları üretmeye devam et

---

## Notlar

- Tüm içerikler Türkçe ve İngilizce hazırlanacak
- Türkiye platformlarında Türkçe, global platformlarda İngilizce
- Her post'ta demo linki ve GitHub linki olacak
- Spam yapma: aynı gün 5 platformda paylaşma, yay
- Her yorumu cevapla: Reddit ve LinkedIn algoritması bunu sever
- Reklam gibi görünme: "Yaptım, nasıl olmuş?" formatında ol
