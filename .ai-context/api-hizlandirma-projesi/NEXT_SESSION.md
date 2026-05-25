# 📋 Sonraki Oturum Rehberi — API Hızlandırma

> **Son güncelleme:** 2026-05-26
> **Bu dosya her oturum başında okunur.** Yeni oturum buradan devam eder.

---

## 🚀 Hızlı Başlangıç

```bash
# 1. Repo güncelle
cd /root/.openclaw/workspace/HookSniff
git pull origin main

# 2. Hafıza oku (ÖNCELİK SIRASI!)
cat .ai-context/api-hizlandirma-projesi/NEXT_SESSION.md  ← BU DOSYA
cat .ai-context/api-hizlandirma-projesi/MEMORY.md        ← Kararlar + uyarılar
cat .ai-context/api-hizlandirma-projesi/UYGULAMA-PLANI.md ← Ana plan (7 faz)

# 3. Kalınan yerden devam et
```

---

## 📍 Sıradaki Adım: FAZ 1 — Auth Middleware Optimizasyonu

### Ne Yapılacak?

Her webhook isteğinde auth kontrolü yapılıyor. Şu an in-memory cache var (30s TTL) ama multi-instance'da tutarsızlık yaratıyor. Çift katmanlı cache (in-memory + Redis) ile bu sorun çözülecek.

### Adım Sırası

| # | Adım | Dosya | Açıklama |
|---|------|-------|----------|
| 1 | AuthCacheV2 struct | `api/src/middleware/mod.rs` | Çift katmanlı cache (in-memory + Redis) |
| 2 | get() fonksiyonu | `api/src/middleware/mod.rs` | In-memory → Redis → DB fallback zinciri |
| 3 | insert() fonksiyonu | `api/src/middleware/mod.rs` | Her iki katmana da yaz |
| 4 | API key lookup | `api/src/middleware/mod.rs` | Redis cache ile optimize |
| 5 | Cache invalidation | `api/src/middleware/mod.rs` | Plan değişikliğinde Redis key sil |
| 6 | Auth cache metrics | `api/src/metrics.rs` | AUTH_LATENCY_MS, cache hit/miss |
| 7 | Test | — | `cargo check && cargo test` |

### Kritik Kurallar

1. **In-memory TTL kısa (10s):** Multi-instance tutarsızlık riskini azaltır
2. **Redis TTL orta (60s):** DB yükünü azaltır, makul güncelleme gecikmesi
3. **DB fallback:** Cache miss olursa DB'den çekilir, cache'e eklenir
4. **Cache invalidation:** Plan değişikliği → Redis key silinmeli
5. **Feature flag:** `USE_AUTH_CACHE_V2` ile aç/kapat

### Test Komutları

```bash
cd /root/.openclaw/workspace/HookSniff
cargo check --workspace
cargo test --workspace

# Cache hit rate testi (Grafana'dan)
# Hedef: > %95 hit rate
```

### Başarılı Olursa

```bash
git add -A
git commit -m "perf: auth middleware — çift katmanlı cache (in-memory + Redis)"
git push origin main
# MEMORY.md → Faz 1 ✅
# NEXT_SESSION.md → Sıradaki: Faz 2
```

---

## 🔜 Sonraki Adımlar

| Sıra | Faz | Süre | Not |
|------|-----|------|-----|
| 1 | **Faz 1: Auth Middleware** | 1-2 oturum | ⬅️ Sıradaki |
| 2 | Faz 2: Rate Limiting → Redis | 1 oturum | |
| 3 | Faz 3: Plan Limiti Cache | 1 oturum | |
| 4 | Faz 4: Connection Pool Tuning | 1 oturum | |
| 5 | Faz 5: Response Compression | 1 oturum | |
| 6 | Faz 6: JSON Serialization | 1 oturum | Opsiyonel |
| 7 | Faz 7: Cold Start | 1 oturum | |

---

## ⚠️ Bilinen Sorunlar

1. **Build hatası (0f11eca1):** Dashboard content dosyalarında Suspense tag hatası — ayrı proje
2. **Auth cache tutarsızlığı:** In-memory 10s, Redis 60s → kısa pencerede tutarsızlık olabilir (kabul edilebilir)

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

*Bu dosya her oturumda güncellenir. v1: 2026-05-26*
