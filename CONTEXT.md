# 🧠 HookRelay — Development Context

> Bu dosya AI助手 için sürekli güncellenen bir hafıza dosyasıdır.
> Yeni oturumda bu dosyayı okuyarak projenin durumunu ve konuşulanları hatırlayabilirsin.

---

## 📅 Son Güncelleme: 2026-05-06 19:38

## 👤 Hakkında

- **Geliştirici:** Servet
- **Konum:** Türkiye
- **Hedef:** HookRelay'ı bireysel olarak satmak, şirket kurmadan başlamak
- **Gelir hedefi:** $500/ay gelir gördüğünde şirket kur
- **Çalışma durumu:** Bireysel / Part-time
- **Deneyim:** Bu işe ilk defa giriyor, bilgisi sınırlı

## 🪝 HookRelay Nedir?

Webhook delivery servisi. Geliştiricilere yönelik.
- Gönder, teslim edelim. Başarısız olursa tekrar deneyelim. Basit.
- Rakipler: Svix ($490/ay), Hookdeck ($39/ay), Convoy (kapandı), Hook0 (açık kaynak)
- ⚠️ hookrelay.dev zaten var! İsim çakışması — alternatif isim düşünülmeli

## 🆓 Free-Tier Altyapı Migrasyonu (2026-05-06)

HookRelay artık tamamen ücretsiz servisler üzerinde çalışıyor:

| Servis | Amaç | Free Tier |
|--------|------|-----------|
| **Oracle Cloud** | API + Worker hosting | 4 OCPU ARM, 24 GB RAM (Always Free) |
| **Neon** | PostgreSQL veritabanı | 0.5 GB, 100 CU-hours |
| **Upstash** | Redis (rate limiting, cache) | 256 MB, 500K komut/ay |
| **Vercel** | Dashboard hosting | 100 GB bandwidth |
| **Grafana Cloud** | Monitoring + tracing | 10K metrics, 50 GB logs |
| **Cloudflare R2** | Storage (webhook payload) | 10 GB, egress ücretsiz |
| **Resend** | Email bildirimleri | 3,000/ay, 100/gün |
| **Cloudflare** | CDN, DNS, SSL, DDoS | Ücretsiz plan |

**Toplam maliyet: $0/ay** — Taahhüt yok, kredi kartı sadece Oracle Cloud'da kimlik doğrulama için.

### Eski Teknolojilerden Uzaklaşma
- ~~Kafka~~ → PostgreSQL queue (`webhook_queue` tablosu) ✅
- ~~Temporal~~ → Basit retry loop (worker polling) ✅
- ~~CockroachDB~~ → PostgreSQL (Neon) ✅
- ~~Self-hosted infra~~ → Free-tier managed servisler ✅

## ✅ Yapılan İşler (2026-05-06)

### Bug Fixes (2026-05-06 17:50)
- [x] **Auth middleware JWT desteği** — `auth_middleware` artık hem API key (`hr_live_*`) hem JWT token destekliyor.
- [x] **Search endpoint filtreleri** — `search_deliveries` artık `q`, `event`, `status`, `endpoint_id`, `date_from`, `date_to` parametrelerini uyguluyor.
- [x] **Billing fiyat düzeltmesi** — Business planı $199'dan $149'a düzeltildi.
- [x] **Billing feature sayıları** — Free: 5 endpoint, Pro: 50 endpoint, retention günleri eklendi.
- [x] **Stripe Checkout entegrasyonu** — Upgrade butonu artık gerçek Stripe Checkout API'sini çağırıyor.
- [x] **Aylık webhook_count sıfırlama** — Retention job'ı artık her ayın 1'inde webhook_count'u sıfırlıyor.
- [x] **UTF-8 güvenli truncation** — `truncate()` ve `sanitize_description()` artık multi-byte karakterlerde panic yapmıyor.
- [x] **Worker config temizliği** — Kullanılmayan `max_attempts` kaldırıldı.
- [x] **Billing gerçek kullanım verisi** — Artık `/v1/billing/usage` endpoint'inden gerçek veri çekiyor.
- [x] **Queue cleanup** — Retention job'ı artık işlenmiş `webhook_queue` ve `seen_webhooks` kayıtlarını temizliyor.

### Altyapı & Konfigürasyon
- [x] GitHub repo private yapıldı
- [x] docker-compose.yml: full stack (API + Worker + Dashboard + Infra)
- [x] Makefile: 20+ komut
- [x] .env.example güncellendi (Stripe config eklendi)
- [x] README güncellendi
- [x] Free-tier altyapı planı oluşturuldu
- [x] FREE_TIER_SETUP.md: Servis kurulum rehberi

### Backend (Rust/Axum)
- [x] Stripe entegrasyonu (checkout, portal, webhook handler)
- [x] 15+ integration test
- [x] 6 yeni API route (api_keys, playground, delivery_details, alerts, search, health_endpoints)

### Frontend (Next.js)
- [x] Landing page (dark theme, code snippet, pricing, waitlist)
- [x] ToS + Privacy Policy
- [x] 4 yeni dashboard sayfası (api-keys, alerts, health, search)
- [x] Dashboard sidebar güncellendi (5 → 12 sayfa)

### SDK & CLI
- [x] CLI tool (cli/index.js)
- [x] Go SDK (sdks/go/)

### Dokümantasyon
- [x] CONTEXT.md: AI hafıza dosyası
- [x] FEATURES.md: Feature tracking
- [x] Rakip analizi (COMPETITIVE_ANALYSIS.md)
- [x] FREE_TIER_SETUP.md: Ücretsiz servis kurulum rehberi
- [x] Eski dosyalar temizlendi (REVIEW.md, USEFUL_REPOS.md, QUICKSTART.md, TROUBLESHOOTING.md, COMPETITIVE_DEEP_DIVE.md)

## ❌ Yapılmayan / Eksik İşler

| İş | Öncelik | Not |
|----|---------|-----|
| Production deploy (Oracle Cloud) | 🔴 Yüksek | FREE_TIER_SETUP.md rehberini takip et |
| Domain al | 🔴 Yüksek | $12, hookrelay.com veya alternatifi |
| Stripe hesabı aç | 🔴 Yüksek | Dashboard'dan ödeme almak için |
| Neon + Upstash kurulumu | 🔴 Yüksek | .env.production güncelle |
| Grafana Cloud kurulumu | 🟡 Orta | Monitoring dashboard'ları |
| Beta kullanıcı bul | 🟡 Orta | Reddit/HN/ProductHunt paylaşım |
| İlk ücretli müşteri | 🟡 Orta | $49 hedef |
| Embeddable portal | 🟡 Orta | Müşteri dashboard'una eklenebilir UI |
| Ruby SDK | 🟢 Düşük | Referans: svix-webhooks |
| Java SDK | 🟢 Düşük | Referans: svix-webhooks |
| Self-hosted Docker image | 🟢 Düşük | Tek komutla kurulabilir |
| Webhook transformations | 🟢 Düşük | Filter, map, enrich |

## ⚠️ Güvenlik Uyarıları

- `.env.production` hala placeholder secrets içeriyor → deploy önce değiştirilmeli
- Stripe webhook secret configure edilmeli
- Oracle Cloud VM'de SSH erişimi kısıtlanmalı (sadece kendi IP)
- Cloudflare ile SSL Full (Strict) modu kullanılmalı

## 🗺️ Plan / Yol Haritası

| Zaman | Hedef |
|-------|-------|
| Şimdi | Free-tier servisleri kur (Neon, Upstash, Oracle Cloud) |
| 1. hafta | Production deploy, domain al |
| 2. hafta | Beta kullanıcı bul (10-20 kişi) |
| 1. ay | Geri bildirim al, düzelt |
| 2-3. ay | İlk ücretli müşteri ($49) |
| 6. ay | $500/ay gelir → şirket kur |

## 💰 Fiyatlandırma

| Plan | Fiyat | Webhooks/ay | Endpoint | Retention |
|------|-------|-------------|----------|-----------|
| Free | $0 | 1,000 | 5 | 7 gün |
| Pro | $49/mo | 50,000 | 50 | 30 gün |
| Business | $149/mo | 500,000 | 500 | 90 gün |

## 🔧 Teknik Notlar

- **Dil:** Rust (API + Worker), TypeScript (Dashboard), Node.js (CLI), Go (SDK)
- **Framework:** Axum (API), Next.js 15 (Dashboard)
- **DB:** PostgreSQL (Neon — serverless, ücretsiz)
- **Cache:** Redis (Upstash — serverless, ücretsiz)
- **Queue:** PostgreSQL (webhook_queue tablosu) + Redis (rate limiting)
- **Hosting:** Oracle Cloud Always Free (API + Worker), Vercel (Dashboard)
- **Auth:** JWT + API key (hr_live_ prefix) + Argon2
- **Signing:** Standard Webhooks HMAC-SHA256
- **Billing:** Stripe Checkout + Customer Portal + Webhook handler
- **Monitoring:** Grafana Cloud (OpenTelemetry)
- **Storage:** Cloudflare R2 (S3-compatible)
- **Email:** Resend (REST API)
- **CDN:** Cloudflare (DNS, SSL, DDoS)

## ⚠️ Risk Analizi Özeti

| Risk | Olasılık | Etki | Hafifletme |
|------|----------|------|------------|
| Müşteri kazanamama | Orta | Kritik | Freemium + $49/ay fiyat |
| Nakit akışı | Yüksek | Kritik | Stripe + $0 altyapı maliyeti |
| Veri kaybı | Orta | Kritik | At-least-once delivery + DLQ |
| KVKK/GDPR | Yüksek | Yüksek | DPA + aydınlatma metni (eksik) |
| Güvenlik açığı | Orta | Kritik | Rate limit + auth + Cloudflare |
| Ölçeklenememe | Düşük | Yüksek | PostgreSQL → Redis → ayrı queue |
| Tek kişi | Orta | Yüksek | Auto-restart + Grafana alert |

## 📝 Konuşulan Konular (2026-05-06)

1. Tanışma ve proje tanıtımı
2. HookRelay iş planı paylaşıldı
3. GitHub repo private yapıldı
4. Repo kodları incelendi — teknik yapı değerlendirildi
5. Rakip analizi (Svix, Hookdeck, Convoy, Hook0, Hostedhooks)
6. ⚠️ hookrelay.dev zaten var — isim çakışması tespit edildi
7. 40 eksik feature listelendi ve kategorize edildi
8. Yasallık konuşuldu (bireysel satış, Stripe, ToS/Privacy Policy)
9. Kapsamlı rekabet analizi yapıldı
10. Detaylı kod incelemesi yapıldı
11. hookrelay.dev isim çakışması — alternatif isim önerileri
12. Free-tier altyapı planı oluşturuldu (Oracle Cloud, Neon, Upstash, Vercel, Grafana, R2, Resend)
13. Dokümantasyon güncellendi

## 🔗 Linkler

- **GitHub:** https://github.com/servetarslan02/hookrelay
- **Feature tracking:** FEATURES.md
- **Free-tier kurulum:** FREE_TIER_SETUP.md
- **Rakip analizi:** COMPETITIVE_ANALYSIS.md

## 📚 Yardımcı Repolar

- svix/svix-webhooks: SDK referans, embeddable portal, CLI
- standard-webhooks/standard-webhooks: İmzalama standardı
- hook0/hook0: Self-hosted setup, retry pattern
- hookdeck/outpost: Multi-tenant architecture

---

> 💡 Bu dosyayı her önemli konuşma veya iş sonrası güncelle.
