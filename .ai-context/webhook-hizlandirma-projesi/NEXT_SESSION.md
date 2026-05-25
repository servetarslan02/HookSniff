# 📋 Sonraki Oturum Rehberi — Webhook Hızlandırma

> **Son güncelleme:** 2026-05-26
> **Bu dosya her oturum başında okunur.** Yeni oturum buradan devam eder.

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Repo güncelle
cd /root/.openclaw/workspace/HookSniff
git pull origin main

# 2. Hafıza oku (ÖNCELİK SIRASI!)
cat .ai-context/webhook-hizlandirma-projesi/NEXT_SESSION.md  ← BU DOSYA
cat .ai-context/webhook-hizlandirma-projesi/MEMORY.md        ← Kararlar + uyarılar
cat .ai-context/webhook-hizlandirma-projesi/UYGULAMA-PLANI.md ← Ana plan (13 bölüm)

# 3. Kalınan yerden devam et
```

---

## 📍 Sıradaki Adım: FAZ 1 — Redis Streams Queue

### Ne Yapılacak?

Redis Streams kullanarak webhook kuyruğunu PostgreSQL'den Redis'e taşı. İlk tetikleme süresi 1000ms'den 10ms'ye düşecek.

### Adım Sırası (Önemli!)

| # | Adım | Dosya | Açıklama |
|---|------|-------|----------|
| 1 | Cargo.toml | `api/Cargo.toml`, `worker/Cargo.toml` | `streams` feature ekle |
| 2 | queue.rs | `api/src/queue.rs` | YENİ — RedisQueue struct + enqueue/read_batch/ack/claim_pending |
| 3 | main.rs (API) | `api/src/main.rs` | `mod queue` + Redis bağlantı startup |
| 4 | publish_to_queue | `api/src/db.rs` | Redis-first + PG fallback |
| 5 | queue.rs (Worker) | `worker/src/queue.rs` | Aynı queue modülü (veya common/) |
| 6 | secret_cache.rs | `worker/src/secret_cache.rs` | YENİ — Signing secret cache |
| 7 | main.rs (Worker) | `worker/src/main.rs` | Ana loop değişikliği — Redis consumer |
| 8 | process_queue_message | `worker/src/main.rs` | YENİ — Redis mesaj işleme fonksiyonu |
| 9 | Helper fonksiyonlar | `worker/src/main.rs` | get_signing_secret, commit_delivery, schedule_retry, mark_dead_letter |
| 10 | Feature flag | `api/src/config.rs`, `worker/src/config.rs` | `USE_REDIS_QUEUE` env var |
| 11 | FIFO kontrolü | `api/src/db.rs` | FIFO endpoint'ler PG queue'da kalsın |
| 12 | Test | — | `cargo check && cargo test` |

### Kritik Kurallar

1. **WebhookMessage uyumu:** `delivery_id` ve `endpoint_id` **String** olmalı (Uuid değil)
2. **Circuit breaker:** `allow_request()` methodu kullanılacak (is_open() değil)
3. **RedisQueue Clone:** `#[derive(Clone)]` ekle (ConnectionManager Clone implement ediyor)
4. **Consumer name:** `worker-{pid}` formatı
5. **PG fallback:** Redis yoksa veya başarısızsa PG queue kullanılacak
6. **claim_pending:** Worker startup'ta crash recovery için çağırılacak
7. **Deploy sırası:** Worker önce → API sonra → Feature flag aç
8. **FIFO:** FIFO endpoint'ler PG queue'da kalır (Redis paralel okuma FIFO'yu bozar)
9. **Redis OOM:** `maxmemory-policy: noeviction` — OOM'da PG fallback

### Test Komutları

```bash
# Rust derleme kontrolü
cd /root/.openclaw/workspace/HookSniff
cargo check --workspace

# Testler
cargo test --workspace

# Redis Streams manuel test
redis-cli XADD hooksniff:webhooks '*' delivery_id 'test-1' endpoint_id 'ep-1' payload '{"test":true}'
redis-cli XINFO STREAM hooksniff:webhooks
```

### Başarılı Olursa

```bash
git add -A
git commit -m "feat: Redis Streams queue — webhook teslimatı 1000ms → < 10ms"
git push origin main

# Hafıza güncelle
# MEMORY.md → Faz 1 ✅ yap, tarih ekle
# NEXT_SESSION.md → Sıradaki: Faz 1 Ek (Production Config)
```

---

## 🔜 Sonraki Adımlar

| Sıra | Faz | Süre | Not |
|------|-----|------|-----|
| 1 | **Faz 1: Redis Streams** | 2-3 oturum | ⬅️ Sıradaki |
| 2 | Faz 1 Ek: Production Config | 1 oturum | Feature flag, deploy, FIFO, OOM, benchmark |
| 3 | Faz 2: HTTP/2 | 1 oturum | |
| 4 | Faz 3: 3 Katmanlı Retry | 1-2 oturum | |
| 5 | Faz 4: DNS + SSRF Cache | 1 oturum | |
| 6 | Faz 5: Dynamic Concurrency | 1 oturum | |
| 7 | Faz 6: Batch Processing | 2 oturum | |

---

## ⚠️ Bilinen Sorunlar

1. **Build hatası (0f11eca1):** Dashboard content dosyalarında Suspense tag hatası — ayrı proje
2. **Upstash free tier:** 500K komut/ay — mevcut 2-5K webhook/ay için yeterli

---

## 📊 Oturum Zaman Planı (1 Saat)

| Dakika | İşlem |
|--------|-------|
| 0-5 | Repo pull, hafıza oku |
| 5-25 | Sıradaki adımı uygula |
| 25-30 | Test et (`cargo check`) |
| 30-35 | Hata varsa düzelt |
| 35-50 | İkinci adıma başla |
| 50-55 | Test et |
| 55-60 | Commit + push + hafıza güncelle |

---

*Bu dosya her oturumda güncellenir. v2: 2026-05-26*
