# 🧠 HookRelay — Development Context

> Bu dosya AI助手 için sürekli güncellenen bir hafıza dosyasıdır.
> Yeni oturumda bu dosyayı okuyarak projenin durumunu ve konuşulanları hatırlayabilirsin.

---

## 📅 Son Güncelleme: 2026-05-06 17:50

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

## ✅ Yapılan İşler (2026-05-06)

### Bug Fixes (2026-05-06 17:50)
- [x] **Auth middleware JWT desteği** — `auth_middleware` artık hem API key (`hr_live_*`) hem JWT token destekliyor. Dashboard artık API'ye erişebilir.
- [x] **Search endpoint filtreleri** — `search_deliveries` artık `q`, `event`, `status`, `endpoint_id`, `date_from`, `date_to` parametrelerini uyguluyor.
- [x] **Billing fiyat düzeltmesi** — Business planı $199'dan $149'a düzeltildi (backend ile uyumlu).
- [x] **Billing feature sayıları** — Free: 5 endpoint, Pro: 50 endpoint, retention günleri eklendi.
- [x] **Stripe Checkout entegrasyonu** — Upgrade butonu artık gerçek Stripe Checkout API'sini çağırıyor.
- [x] **Aylık webhook_count sıfırlama** — Retention job'ı artık her ayın 1'inde webhook_count'u sıfırlıyor.
- [x] **UTF-8 güvenli truncation** — `truncate()` ve `sanitize_description()` artık multi-byte karakterlerde panic yapmıyor.
- [x] **Worker config temizliği** — Kullanılmayan `max_attempts` kaldırıldı (per-endpoint retry_policy kullanılıyor).
- [x] **Billing gerçek kullanım verisi** — Artık hardcoded 650 yerine `/v1/billing/usage` endpoint'inden gerçek veri çekiyor.
- [x] **Queue cleanup** — Retention job'ı artık işlenmiş `webhook_queue` ve `seen_webhooks` kayıtlarını temizliyor.

### Altyapı & Konfigürasyon
- [x] GitHub repo private yapıldı
- [x] docker-compose.yml: full stack (API + Worker + Dashboard + Infra)
- [x] Makefile: 20+ komut (dev, stop, clean, logs, test, status)
- [x] QUICKSTART.md: 5 dakika kurulum rehberi
- [x] .env.example güncellendi (Stripe config eklendi)
- [x] README güncellendi

### Backend (Rust/Axum)
- [x] Stripe entegrasyonu (checkout, portal, webhook handler)
- [x] 15+ integration test
- [x] 6 yeni API route:
  - api_keys.rs: API key CRUD + rotate
  - playground.rs: Webhook tester + sample payloads
  - delivery_details.rs: Teslimat detay + attempt inspection
  - alerts.rs: Alarm kuralları CRUD + test notification
  - search.rs: Webhook log arama
  - health_endpoints.rs: Endpoint sağlık izleme

### Frontend (Next.js)
- [x] Landing page (dark theme, code snippet, pricing, waitlist)
- [x] ToS + Privacy Policy (gerçek içerikli React sayfaları)
- [x] 4 yeni dashboard sayfası:
  - api-keys/page.tsx: API key yönetimi
  - alerts/page.tsx: Alarm kuralları
  - health/page.tsx: Endpoint sağlık durumu
  - search/page.tsx: Webhook arama
- [x] Dashboard sidebar güncellendi (5 → 12 sayfa)

### SDK & CLI
- [x] CLI tool (cli/index.js): auth, endpoints, webhooks, listen komutları
- [x] Go SDK (sdks/go/): Endpoints + Webhooks servisleri

### Dokümantasyon
- [x] CONTEXT.md: AI hafıza dosyası
- [x] FEATURES.md: 40 feature tracking
- [x] Rakip analizi (Svix, Hookdeck, Hook0, Hostedhooks, Webhook Relay)

## ❌ Yapılmayan / Eksik İşler

| İş | Öncelik | Not |
|----|---------|-----|
| Domain al | 🔴 Yüksek | $12, hookrelay.com veya alternatifi |
| Stripe hesabı aç | 🔴 Yüksek | Dashboard'dan ödeme almak için |
| Production deploy | 🔴 Yüksek | Oracle Cloud Free Tier veya Railway |
| Beta kullanıcı bul | 🟡 Orta | Reddit/HN/ProductHunt paylaşım |
| İlk ücretli müşteri | 🟡 Orta | $49 hedef |
| Embeddable portal | 🟡 Orta | Müşteri dashboard'una eklenebilir UI |
| Ruby SDK | 🟢 Düşük | Referans: svix-webhooks |
| Java SDK | 🟢 Düşük | Referans: svix-webhooks |
| Self-hosted Docker image | 🟢 Düşük | Tek komutla kurulabilir |
| Webhook transformations | 🟢 Düşük | Filter, map, enrich |

## 🗺️ Plan / Yol Haritası

| Zaman | Hedef |
|-------|-------|
| Şimdi | Local test, hataları düzelt |
| 1. hafta | Deploy et, domain al |
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
- **DB:** PostgreSQL (Neon)
- **Queue:** PostgreSQL (webhook_queue tablosu)
- **Workflow:** Basit retry loop (PostgreSQL polling)
- **Auth:** JWT + API key (hr_live_ prefix) + Argon2
- **Signing:** Standard Webhooks HMAC-SHA256
- **Billing:** Stripe Checkout + Customer Portal + Webhook handler

## 📝 Konuşulan Konular (2026-05-06)

1. Tanışma ve proje tanıtımı
2. HookRelay iş planı paylaşıldı
3. GitHub repo private yapıldı
4. Repo kodları incelendi — teknik yapı değerlendirildi
5. Rakip analizi (Svix, Hookdeck, Convoy, Hook0, Hostedhooks)
6. ⚠️ hookrelay.dev zaten var — isim çakışması tespit edildi
7. 40 eksik feature listelendi ve kategorize edildi
8. Yasallık konuşuldu:
   - Türkiye'de bireysel satış < 150K TL → basit usul mükellef
   - Stripe bireysel kullanım
   - ToS/Privacy Policy gerekli
   - SLA verme, "best effort" yeterli
9. Full-time mı part-time mı sorusu soruldu (cevaplanmadı)
10. GitHub yardımcı repolar araştırıldı (svix-webhooks, standard-webhooks, hook0)
11. Servet bu işe ilk defa giriyor, bilgisi sınırlı — yönlendirme lazım
12. Kapsamlı rekabet analizi yapıldı → COMPETITIVE_ANALYSIS.md
13. Detaylı kod incelemesi yapıldı → REVIEW.md (sub-agent tarafından)
14. hookrelay.dev isim çakışması — alternatif isim önerileri hazırlandı
15. Yasal uyumluluk eksiklikleri tespit edildi (SOC2, GDPR, PCI-DSS yok)
16. Standard Webhooks uyumluluğu kontrol edilecek
17. Customer portal ve embeddable portal eksik

## ⚠️ Güvenlik Uyarıları

- GitHub token sohbette açıkça paylaşıldı → **revoke edilmeli**
- `.env.production` hala placeholder secrets içeriyor → deploy önce değiştirilmeli
- Stripe webhook secret configure edilmeli

## 🔗 Linkler

- **GitHub:** https://github.com/servetarslan02/hookrelay
- **Plan dosyası:** projects/hookrelay/PLAN.md
- **Yol haritası:** projects/hookrelay/ROADMAP.md
- **Feature tracking:** FEATURES.md

## 📚 Yardımcı Repolar

- svix/svix-webhooks: SDK referans, embeddable portal, CLI
- standard-webhooks/standard-webhooks: İmzalama standardı
- hook0/hook0: Self-hosted setup, retry pattern
- frain-dev/convoy: API design referans (kapandı ama kod duruyor)

---

> 💡 Bu dosyayı her önemli konuşma veya iş sonrası güncelle.
> Yeni oturumda bu dosyayı okuyarak kaldığın yerden devam et.
