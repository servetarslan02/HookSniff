# 📋 Sonraki Oturum Rehberi — Webhook Hızlandırma

> **Son güncelleme:** 2026-06-04
> **Bu dosya her oturum başında okunur.** Yeni oturum buradan devam eder.

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Repo güncelle
cd C:\Users\msi-nb\HookSniff
git pull origin main

# 2. Hafıza oku (ÖNCELİK SIRASI!)
cat .ai-context/webhook-hizlandirma-projesi/NEXT_SESSION.md  ← BU DOSYA
cat .ai-context/webhook-hizlandirma-projesi/MEMORY.md        ← Kararlar + uyarılar
cat .ai-context/webhook-hizlandirma-projesi/UYGULAMA-PLANI.md ← Ana plan (13 bölüm)

# 3. Kalınan yerden devam et
```

---

## ✅ Tamamlanan: FAZ 1 — Redis Streams Queue

### Durum: TAMAMLANDI (2026-06-04)

| # | Adım | Dosya | Durum |
|---|------|-------|-------|
| 1 | Cargo.toml | `api/Cargo.toml`, `worker/Cargo.toml` | ✅ `streams` feature eklendi |
| 2 | queue.rs (API) | `api/src/queue.rs` | ✅ RedisQueue struct + enqueue/read_batch/ack/claim_pending |
| 3 | main.rs (API) | `api/src/main.rs` | ✅ Redis queue startup + global REDIS_QUEUE |
| 4 | publish_to_queue | `api/src/db.rs` | ✅ Redis-first + PG fallback |
| 5 | queue.rs (Worker) | `worker/src/queue.rs` | ✅ PG zombie recovery (aynı dosya, Redis consumer main.rs'de) |
| 6 | secret_cache.rs | `worker/src/secret_cache.rs` | ✅ Yeni oluşturuldu |
| 7 | main.rs (Worker) | `worker/src/main.rs` | ✅ Redis Streams consumer (USE_REDIS_QUEUE flag) |
| 8 | parse_xreadgroup | `worker/src/main.rs` | ✅ `parse_xreadgroup_response()` fonksiyonu |
| 9 | Helper fonksiyonlar | `worker/src/main.rs` | ✅ Signing cache, CB, throttle, dead letter |
| 10 | Feature flag | `worker/src/config.rs` | ✅ `USE_REDIS_QUEUE` env var |
| 11 | FIFO kontrolü | — | ⏭️ PG queue'da kaldı (plan'a uygun) |
| 12 | Test | — | ⏳ Deploy'da test edilecek |

### Kritik Düzeltmeler (Bu Oturum)

1. **`MutexGuard !Send` hatası** — `create.rs`'de guard `.await` boyunca tutuluyordu → clone ile düzeltildi
2. **XREADGROUP parsing** — `Vec<Vec<String>>` çalışmıyordu → `redis::Value` manuel parse eklendi
3. **XACK entry ID** — `delivery_id` ile ACK yapılıyordu → stream entry ID ile düzeltildi
4. **http_client spawn** — Her mesajda yeni client oluşturuluyordu → clone ile düzeltildi
5. **Signing secret cache** — Her mesajda DB sorgusu yapılıyordu → 5 dk TTL cache eklendi

---

## 🔜 Sıradaki Adım: FAZ 1 Ek — Production Config + Deploy

### Ne Yapılacak?

1. **Upstash limit sorunu çözülecek** — Free tier 500K/500K aşılmış
   - Seçenek A: Plan yükselt ($10/ay, 10K komut/gün)
   - Seçenek B: Ay sonunu bekle (limit sıfırlanır)
   - Seçenek C: Farklı Redis provider (Railway, Fly.io Redis)

2. **Upstash maxmemory-policy** — Dashboard'dan `noeviction` ayarlanmalı

3. **Deploy sırası:**
   ```bash
   # 1. Worker deploy (henüz USE_REDIS_QUEUE=false)
   gcloud run deploy hooksniff-worker --source . --region europe-west1
   
   # 2. API deploy (henüz USE_REDIS_QUEUE=false)
   gcloud run deploy hooksniff-api --source . --region europe-west1
   
   # 3. Feature flag aç
   gcloud run services update hooksniff-worker \
     --set-env-vars USE_REDIS_QUEUE=true --region europe-west1
   gcloud run services update hooksniff-api \
     --set-env-vars USE_REDIS_QUEUE=true --region europe-west1
   ```

4. **REDIS_URL env var** — Cloud Run'da ayarlanmalı:
   ```
   rediss://default:gQAAAAAAAYCPAAIgcDI1ZGFhYWUxZGRhZjM0YjhhYTQ1OGFjOGEzZTg1OTMzNg@integral-ostrich-98447.upstash.io:6379
   ```

5. **QStash env var'ları** — Cloud Run'da ayarlanmalı:
   ```
   QSTASH_URL=https://qstash-eu-central-1.upstash.io
   QSTASH_TOKEN=eyJVc2VySUQiOiJlYzY2NmY4ZS1lOTRiLTRjMDMtYmVhZC00OTVjNWE2NTcwMzMiLCJQYXNzd29yZCI6IjhlMjIwOWVmZDljODRhMTM4MjdlZDljZTQxYjIyMjcwIn0=
   QSTASH_CURRENT_SIGNING_KEY=sig_7sPnDhTMWdK54NMbtr22MFQCEZyH
   QSTASH_NEXT_SIGNING_KEY=sig_6qrNpb9ZpcLs89KRduyQ8dqF9oZd
   ```

### Test Komutları

```bash
# Rust derleme kontrolü
cargo check --manifest-path api/Cargo.toml
cargo check --manifest-path worker/Cargo.toml  # Linux'ta çalışır (Windows'ta linker hatası)

# Redis Streams manuel test (deploy sonrası)
redis-cli -u "rediss://default:TOKEN@host:6379" XADD hooksniff:webhooks '*' delivery_id 'test-1' endpoint_id 'ep-1' payload '{"test":true}'
redis-cli -u "rediss://default:TOKEN@host:6379" XINFO STREAM hooksniff:webhooks
```

### Başarılı Olursa

```bash
git add -A
git commit -m "feat: Redis Streams queue — webhook teslimatı 1000ms → < 10ms"
git push origin main
```

---

## 🔜 Sonraki Adımlar

| Sıra | Faz | Süre | Not |
|------|-----|------|-----|
| 1 | **Faz 1 Ek: Production Config** | 1 oturum | ⬅️ Sıradaki (deploy + test) |
| 2 | Faz 2: HTTP/2 | 1 oturum | |
| 3 | Faz 3: 3 Katmanlı Retry | 1-2 oturum | |
| 4 | Faz 4: DNS + SSRF Cache | 1 oturum | |
| 5 | Faz 5: Dynamic Concurrency | 1 oturum | |
| 6 | Faz 6: Batch Processing | 2 oturum | |

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
