# 🪝 HookRelay — Yapılacaklar Listesi

> Son güncelleme: 2026-05-06
> Bu dosya GitHub'da takip edilir. Her tamamlanan iş ✅ yapılır.

---

## 📋 Teknoloji Kararı (2026-05-06)
- **Backend:** Rust (Axum) — mevcut kod
- **Frontend:** Next.js (React) — mevcut kod
- **Database:** PostgreSQL (Neon — serverless, ücretsiz)
- **Cache:** Redis (Upstash — serverless, ücretsiz)
- **Queue:** PostgreSQL tablo (webhook_queue) + Redis (rate limiting)
- **Workflow:** Basit retry loop (worker polling)
- **Hosting:** Oracle Cloud Always Free (API + Worker) + Vercel (Dashboard)
- **Monitoring:** Grafana Cloud (ücretsiz tier)
- **Storage:** Cloudflare R2 (ücretsiz tier)
- **Email:** Resend (ücretsiz tier)
- **CDN:** Cloudflare (ücretsiz plan)

---

## 🔴 Yapılacak (Öncelik Sırasıyla)

### 1. Production Deploy (Bu Hafta)
- [ ] Neon hesabı aç ve PostgreSQL projesi oluştur
- [ ] Upstash hesabı aç ve Redis oluştur
- [ ] Oracle Cloud Always Free ARM VM oluştur
- [ ] VM'de Docker kur ve container'ları deploy et
- [ ] Vercel'de dashboard deploy et
- [ ] Domain al ($12) — hookrelay.com veya alternatifi
- [ ] Cloudflare ile DNS/SSL ayarla
- [ ] Grafana Cloud kur (monitoring)
- [ ] Cloudflare R2 kur (storage)
- [ ] Resend kur (email)
- [ ] .env.production güncelle (tüm credentials)
- [ ] End-to-end test (webhook gönder → teslim et)

### 2. Test ve Doğrulama (Bu Hafta)
- [ ] Production'da webhook gönderme test et
- [ ] Dashboard açılıyor mu kontrol et (Vercel URL)
- [ ] API health check kontrol et
- [ ] SDK test et (Node.js)
- [ ] Monitoring dashboard'larını kontrol et

### 3. SDK Publish (Gelecek Hafta)
- [ ] Node SDK → npm publish (`@hookrelay/sdk`)
- [ ] Python SDK → pypi publish (`hookrelay`)
- [ ] README'leri güncelle

### 4. Dokümantasyon (Gelecek Hafta)
- [ ] API Reference (OpenAPI)
- [ ] SDK Kullanım Kılavuzu
- [ ] Self-hosted kurulum rehberi

### 5. Büyüme (Hazır Olunca)
- [ ] Beta kullanıcı bul (Reddit/HN/ProductHunt)
- [ ] İlk ücretli müşteri ($49)
- [ ] Embeddable portal
- [ ] Webhook transformations

---

## ✅ Tamamlanan İşler (2026-05-06)

### Kod İncelemesi
- [x] Kapsamlı kod incelemesi yapıldı
- [x] 6 kritik sorun düzeltildi
- [x] 8 orta sorun düzeltildi
- [x] Rate limiter aktif edildi
- [x] CORS kısıtlandı
- [x] Production secret validation

### Rekabet Analizi
- [x] Rakip analizi (COMPETITIVE_ANALYSIS.md)
- [x] Svix, Hookdeck, Hook0 karşılaştırma

### Yeni Feature'lar
- [x] FIFO sıralı teslimat (api/src/fifo/)
- [x] Per-endpoint throttling (api/src/throttle/)
- [x] Embeddable portal widget (portal/embed.js)
- [x] Customer self-service API (routes/customer_portal.rs)
- [x] Standard Webhooks tam uyumluluk (signing.rs)

### Altyapı
- [x] .dockerignore oluşturuldu
- [x] Go SDK go.mod oluşturuldu
- [x] Python SDK versiyon同步
- [x] k8s secrets template
- [x] Free-tier altyapı planı oluşturuldu
- [x] FREE_TIER_SETUP.md yazıldı

### Sadeleştirme
- [x] ~~Kafka~~ → PostgreSQL queue ✅
- [x] ~~Temporal~~ → Basit retry loop ✅
- [x] ~~CockroachDB~~ → PostgreSQL (Neon) ✅
- [x] Eski Kafka/Temporal/CockroachDB kodları temizlendi ✅
- [x] Dockerfile'lar sadeleştirildi ✅
- [x] docker-compose.yml güncellendi (4 servis) ✅
- [x] Makefile güncellendi ✅

### Dokümantasyon Temizliği
- [x] REVIEW.md silindi (kapsamlı ama güncel değil)
- [x] USEFUL_REPOS.md silindi (COMPETITIVE_ANALYSIS.md ile birleştirildi)
- [x] QUICKSTART.md silindi (FREE_TIER_SETUP.md ile değiştirildi)
- [x] TROUBLESHOOTING.md silindi (FREE_TIER_SETUP.md'ye taşındı)
- [x] COMPETITIVE_DEEP_DIVE.md silindi (COMPETITIVE_ANALYSIS.md ile birleştirildi)
- [x] RISKS.md silindi (CONTEXT.md'ye taşındı)
- [x] BUGS.md silindi (sorunlar düzeltildi)
- [x] FEATURES.md güncellendi (AI Center kaldırıldı)
- [x] README.md güncellendi (free-tier tech stack)
- [x] CONTEXT.md güncellendi

---

## 📝 Notlar

### Neden Free-Tier?
- Sıfır maliyet ile başla
- Gelir olmadan harcama yapma
- Oracle Cloud Always Free → süresiz ücretsiz
- Neon/Upstash/Vercel/Grafana/R2/Resend → cömert ücretsiz tier
- Büyüyünce ücretli planlara geç

### Hosting Planı
- Şimdi: Free-tier servisler ($0)
- 100 kullanıcı: Free-tier yeterli
- 1000 kullanıcı: Neon Scale ($19) + Vercel Pro ($20)
- 10000+ kullanıcı: Dedicated infra ($100+)

### Ölçeklenme Adımları
```
Şimdi:     PostgreSQL queue (10K event/dk)
1. adım:   Redis queue (100K event/dk)
2. adım:   Ayrı message queue (1M+ event/dk)
```

---

> 💡 Her hafta bu dosyayı güncelle. Tamamlanan işleri ✅ yap, yeni işler ekle.
