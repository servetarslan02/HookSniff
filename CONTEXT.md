# 🧠 HookRelay — Development Context

> Bu dosya AI助手 için sürekli güncellenen bir hafıza dosyasıdır.
> Yeni oturumda bu dosyayı okuyarak projenin durumunu ve konuşulanları hatırlayabilirsin.

---

## 📅 Son Güncelleme: 2026-05-06

## 👤 Hakkında

- **Geliştirici:** Servet
- **Konum:** Türkiye
- **Hedef:** HookRelay'ı bireysel olarak satmak, şirket kurmadan başlamak
- **Gelir hedefi:** $500/ay gelir gördüğünde şirket kur
- **Çalışma durumu:** Bireysel / Part-time

## 🪝 HookRelay Nedir?

Webhook delivery servisi. Geliştiricilere yönelik.
- Gönder, teslim edelim. Başarısız olursa tekrar deneyelim. Basit.
- Rakipler: Svix ($490/ay), Hookdeck ($39/ay), Convoy (kapandı)

## ✅ Yapılan İşler

### 2026-05-06 — İlk Gün
- [x] GitHub repo private yapıldı
- [x] Repo kodları incelendi (Rust/Axum + CockroachDB + Redpanda + Temporal)
- [x] Rakip analizi ve yol haritası çıkarıldı
- [x] Fiyat stratejisi belirlendi: Free/$49/$149
- [x] Landing page oluşturuldu (dark theme, code snippet, pricing, waitlist form)
- [x] Landing page GitHub'a push edildi
- [x] ToS + Privacy Policy yazıldı (gerçek içerikli React sayfaları)
- [x] Stripe entegrasyonu yazıldı (checkout, portal, webhook handler)
- [x] Integration testler yazıldı (15+ test: signing, billing, auth, validation)
- [x] README güncellendi
- [x] .env.example güncellendi (Stripe config eklendi)
- [x] Fiyat düzeltmesi: Business $299 → $149 (PLAN.md ile tutarlı)

### Mevcut Kod Yapısı (Repo'da Var)
- [x] API: Rust/Axum — webhook CRUD, batch, replay, export
- [x] Worker: Temporal workflow — retry, exponential backoff, dead letter queue
- [x] Dashboard: Next.js 15 — endpoints, deliveries, analytics, billing, settings
- [x] Auth: JWT + API key + Argon2 password hashing
- [x] Standard Webhooks HMAC-SHA256 imzalama
- [x] SSRF koruması (internal IP engelleme)
- [x] Rate limiting, idempotency keys
- [x] Kafka/Redpanda entegrasyonu
- [x] OpenTelemetry + Prometheus metrics
- [x] Docker Compose + K8s manifestleri
- [x] Node.js + Python SDK'lar
- [x] Monitoring: Grafana + Prometheus
- [x] CI/CD GitHub Actions
- [x] Login/Register sayfası (frontend)

## ❌ Yapılmayan / Eksik İşler

| İş | Öncelik | Not |
|----|---------|-----|
| Domain al (hookrelay.com) | 🔴 Yüksek | $12, Cloudflare'den alınacak |
| Stripe hesabı aç | 🔴 Yüksek | Dashboard'dan ödeme almak için |
| Production deploy | 🔴 Yüksek | Oracle Cloud Free Tier veya Railway |
| Beta kullanıcı bul | 🟡 Orta | Reddit/HN/ProductHunt paylaşım |
| İlk ücretli müşteri | 🟡 Orta | $49 hedef |
| ToS/Privacy → gerçek sayfalar | 🟢 Düşük | React component olarak yazıldı, ama içerik placeholder olabilir |
| AI Center scope küçültme | 🟢 Düşük | MVP sonrası için ayrılabilir |
| Integration testlerin CI'da çalıştırılması | 🟢 Düşük | Testler yazıldı ama CI config güncellenmeli |

## 🗺️ Plan / Yol Haritası

| Zaman | Hedef |
|-------|-------|
| Şimdi | Domain al, Stripe hesabı aç, local test |
| 1. ay | Deploy et, beta kullanıcı bul (10-20 kişi) |
| 2-3. ay | Geri bildirim al, düzelt, ilk ücretli müşteri ($49) |
| 6. ay | $500/ay gelir → şirket kur |
| 12. ay | $2K+/ay → SOC2 düşün |

## 💰 Fiyatlandırma

| Plan | Fiyat | Webhooks/ay | Endpoint | Retention |
|------|-------|-------------|----------|-----------|
| Free | $0 | 1,000 | 5 | 7 gün |
| Pro | $49/mo | 50,000 | 50 | 30 gün |
| Business | $149/mo | 500,000 | 500 | 90 gün |

## 🔧 Teknik Notlar

- **Dil:** Rust (API + Worker), TypeScript (Dashboard)
- **Framework:** Axum (API), Next.js 15 (Dashboard)
- **DB:** CockroachDB (PostgreSQL uyumlu)
- **Queue:** Kafka/Redpanda
- **Workflow:** Temporal
- **Auth:** JWT + API key (hr_live_ prefix) + Argon2
- **Signing:** Standard Webhooks HMAC-SHA256
- **Billing:** Stripe Checkout + Customer Portal + Webhook handler

## 📝 Konuşulan Konular (2026-05-06)

1. Tanışma ve proje tanıtımı
2. HookRelay iş planı paylaşıldı
3. GitHub repo private yapıldı
4. Repo kodları incelendi — teknik yapı değerlendirildi
5. Rakip analizi (Svix, Hookdeck, Convoy)
6. Yasallık konuşuldu:
   - Türkiye'de bireysel satış < 150K TL → basit usul mükellef
   - Stripe bireysel kullanım
   - ToS/Privacy Policy gerekli
   - SLA verme, "best effort" yeterli
7. Full-time mı part-time mı sorusu soruldu (cevaplanmadı)
8. 6 iş paralel yapılacakken sırayla yapıldı (düzeltilecek)

## ⚠️ Güvenlik Uyarıları

- GitHub token sohbette açıkça paylaşıldı → **revoke edilmeli**
- `.env.production` hala placeholder secrets içeriyor → deploy önce değiştirilmeli
- Stripe webhook secret configure edilmeli

## 🔗 Linkler

- **GitHub:** https://github.com/servetarslan02/hookrelay
- **Plan dosyası:** projects/hookrelay/PLAN.md
- **Yol haritası:** projects/hookrelay/ROADMAP.md

---

> 💡 Bu dosyayı her önemli konuşma veya iş sonrası güncelle.
> Yeni oturumda bu dosyayı okuyarak kaldığın yerden devam et.
