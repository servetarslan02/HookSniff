# 🪝 HookRelay — Yapılacaklar Listesi

> Son güncelleme: 2026-05-06
> Bu dosya GitHub'da takip edilir. Her tamamlanan iş ✅ yapılır.

---

## 📋 Teknoloji Kararı (2026-05-06)
- **Backend:** Rust (Axum) — mevcut kod
- **Frontend:** Next.js (React) — mevcut kod
- **Database:** PostgreSQL (CockroachDB yerine)
- **Queue:** PostgreSQL tablo (Kafka yerine)
- **Workflow:** Basit retry loop (Temporal yerine)
- **Hosting:** Fly.io + Neon (ücretsiz tier)
- **Local:** Docker Compose (3 servis: PostgreSQL + API + Dashboard)

---

## 🔴 Yapılacak (Öncelik Sırasıyla)

### 1. Sadeleştirme (Bu Hafta)
- [x] CockroachDB → PostgreSQL geçiş ✅
- [x] Kafka → PostgreSQL queue ✅ (webhook_queue tablosu)
- [x] Temporal → Basit retry loop ✅ (worker polling)
- [x] docker-compose.yml (4 servis: PostgreSQL + API + Worker + Dashboard) ✅
- [x] Makefile: `make local`, `make fix`, `make reset`, `make status` ✅
- [x] TROUBLESHOOTING.md ✅
- [x] Eski Kafka/Temporal/CockroachDB kodları temizlendi ✅
- [x] Dockerfile'lar sadeleştirildi ✅

### 2. Test ve Doğrulama (Bu Hafta)
- [ ] `docker compose -f docker-compose.local.yml up` çalıştır
- [ ] Dashboard açılıyor mu kontrol et
- [ ] API health check kontrol et
- [ ] Webhook gönderme test et
- [ ] SDK test et (Node.js)

### 3. SDK Publish (Gelecek Hafta)
- [ ] Node SDK → npm publish (`@hookrelay/sdk`)
- [ ] Python SDK → pypi publish (`hookrelay`)
- [ ] README'leri güncelle

### 4. Dokümantasyon (Gelecek Hafta)
- [ ] Quick Start Guide
- [ ] API Reference (OpenAPI)
- [ ] SDK Kullanım Kılavuzu
- [ ] Self-hosted kurulum rehberi

### 5. Deploy (Hazır Olunca)
- [ ] Fly.io hesabı aç
- [ ] Neon hesabı aç
- [ ] Fly.io config (fly.toml) oluştur
- [ ] Deploy et
- [ ] Domain al (opsiyonel)

---

## ✅ Tamamlanan İşler (2026-05-06)

### Kod İncelemesi
- [x] Kapsamlı kod incelemesi (REVIEW.md)
- [x] 6 kritik sorun düzeltildi
- [x] 8 orta sorun düzeltildi
- [x] Rate limiter aktif edildi
- [x] CORS kısıtlandı
- [x] Production secret validation

### Rekabet Analizi
- [x] Rakip analizi (COMPETITIVE_ANALYSIS.md)
- [x] Derinlemesine analiz (COMPETITIVE_DEEP_DIVE.md)
- [x] Svix, Hookdeck, Hook0 karşılaştırma

### Yeni Feature'lar
- [x] FIFO sıralı teslimat (api/src/fifo/)
- [x] Per-endpoint throttling (api/src/throttle/)
- [x] Embeddable portal widget (portal/embed.js)
- [x] Customer self-service API (routes/customer_portal.rs)
- [x] Standard Webhooks tam uyumluluk (signing.rs)
- [x] AI Center health endpoint

### Altyapı
- [x] .dockerignore oluşturuldu
- [x] Go SDK go.mod oluşturuldu
- [x] Python SDK versiyon同步
- [x] CI/Deploy workflow'ları ai-center eklendi
- [x] k8s secrets template

---

## 📝 Notlar

### Neden PostgreSQL?
- Ücretsiz hosting (Neon, Supabase)
- Kafka ve Temporal yerine	queue olarak kullanılabilir
- CockroachDB ile aynı SQL (uyumluluk)
- Daha basit, daha az servis

### Neden Basit Retry?
- Temporal Rust SDK prerelease, stabil değil
- Basit loop yeterli (polling + exponential backoff)
- Büyüyünce Temporal eklenir

### Hosting Planı
- Şimdi: Local (Docker Desktop, $0)
- 100 kullanıcı: Fly.io ücretsiz tier ($0)
- 1000 kullanıcı: Fly.io Pro ($20/ay)
- 10000+ kullanıcı: AWS/GCP

---

> 💡 Her hafta bu dosyayı güncelle. Tamamlanan işleri ✅ yap, yeni işler ekle.
