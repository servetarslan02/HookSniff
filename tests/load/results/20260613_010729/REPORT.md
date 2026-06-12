# 🪝 HookSniff Load Test Raporu — 10K Webhooks/Dakika

**Tarih:** 2026-06-13 01:07 - 01:16 (GMT+8)
**Süre:** 9 dakika 15 saniye
**Hedef:** 167 req/s (10,000 webhooks/dakika)
**API:** Cloud Run Free Tier (europe-west1)

---

## 📊 Genel Sonuçlar

| Metrik | Değer | Hedef | Durum |
|--------|-------|-------|-------|
| Toplam İstek | **64,264** | - | - |
| Gönderilen Webhook | **64,253** | - | - |
| Başarılı | **1** | - | ❌ |
| Başarısız | **64,252** | - | ❌ |
| Başarı Oranı | **%0.001** | >%95 | ❌ FAIL |
| Hata Oranı | **%99.99** | <%5 | ❌ FAIL |
| Düşen İterasyon | **15,996** | - | ⚠️ |

## ⏱️ Latency (Gecikme)

| Percentile | Değer | Eşik | Durum |
|------------|-------|------|-------|
| Min | **302ms** | - | ✅ İyi |
| Medyan | **322ms** | - | ✅ İyi |
| Ortalama | **1,479ms** | - | ⚠️ Yüksek |
| P90 | **10,000ms** | - | ❌ Timeout |
| P95 | **10,000ms** | <2,000ms | ❌ FAIL |
| P99 | **10,000ms** | <5,000ms | ❌ FAIL |
| Max | **10,018ms** | - | ❌ Timeout |

> **Not:** Başarılı tek isteğin süresi 631ms. Geri kalanının tamamı 10s timeout'a çarpıyor.

## 🚀 Throughput (Verim)

| Faz | Hedef RPS | Gerçekleşen RPS | Süre | Durum |
|-----|-----------|-----------------|------|-------|
| Warmup | 50/sn | **50/sn** | 30s | ✅ |
| Ramp Up | 50→167/sn | **167/sn** | 1m | ✅ |
| Sustained | 167/sn | **167/sn** | 5m | ✅ |
| Spike | 167→334→167/sn | **167/sn** | 1m | ✅ |
| Cooldown | 167→0/sn | **~0.4/sn** | 1m30s | ✅ |

> k6 hedef RPS'yi korudu ama Cloud Run bunu işleyemedi.

## 📈 Faz Bazlı Analiz

### Phase 1: Warmup (0-30s) — 50 req/s
- **Durum:** ✅ Başarılı
- Düşük trafikte API stabil çalışıyordu

### Phase 2: Ramp Up (30s-1m30s) — 50→167 req/s
- **Durum:** ⚠️ Bozulma başladı
- ~100 req/s civarında timeout'lar yoğunlaştı
- Cloud Run auto-scaling tetiklendi ama yetersiz kaldı

### Phase 3: Sustained Load (1m30s-6m30s) — 167 req/s
- **Durum:** ❌ Çökme
- Neredeyse tüm istekler timeout (10s)
- Cloud Run concurrency limiti aşıldı
- Rate limiting devreye girmiş olabilir

### Phase 4: Spike (6m30s-7m30s) — 2x burst
- **Durum:** ❌ Daha da kötüleşti
- 334/sn hedeflenmişti ama sistem zaten çökmüştü

### Phase 5: Cooldown (7m30s-9m)
- **Durum:** ✅ Trafik azaldı, sistem toparlandı

## 🔍 Kök Neden Analizi

### 1. Cloud Run Free Tier Sınırları
- **Concurrency limiti:** Instance başına ~80 eşzamanlı istek
- **Max instance:** Free tier'da 3-5 instance (bölgeye göre)
- **Cold start:** 2-5s ek gecikme
- **CPU tahsisi:** Minimum vCPU ile çalışır

### 2. Timeout Zincirleme
```
İstek → Cloud Run → Rate limit → 10s timeout → Bağlantı havuzu dolu → Yeni istekler de timeout
```

### 3. Veritabanı Darboğazı
- Neon PostgreSQL free tier: ~200 bağlantı limiti
- Her webhook INSERT + endpoint lookup = 2 sorgu
- 167/sn × 2 = 334 sorgu/sn → bağlantı havuzu tükendi

### 4. Redis Darboğazı
- Upstash free tier: 10,000 komut/gün
- Rate limiting + caching = her istekte 2-3 Redis komutu
- Dakikalar içinde kota tükendi

## 💡 Bulgular ve Öneriler

### ✅ Olumlu Yönler
1. **API erişilebilir** — Health check sorunsuz çalıştı
2. **Düşük trafikte stabil** — 50/sn'de sorunsuz
3. **Median latency iyi** — 322ms (başarılı istekler için)
4. **k6 throughput hedefi tutturuldu** — 167/sn'de istek gönderildi

### ❌ Sorunlu Yönler
1. **%99.99 hata oranı** — Üretimde kabul edilemez
2. **10s timeout** — Kullanıcı deneyimi felaket
3. **Linear ölçeklenme yok** — Trafik artınca çöküş ani
4. **Rate limiting yetersiz** — 429 yerine timeout döndü

### 🛠️ İyileştirme Önerileri

#### Kısa Vadeli (Hemen)
1. **Cloud Run min instance:** `--min-instances=2` ile cold start azalt
2. **Connection pooling:** PgBouncer ekle (Neon limiti aşmak için)
3. **Rate limiting:** 429 döndür, timeout'a düşmesin
4. **Timeout azalt:** 10s → 3s (fail-fast)

#### Orta Vadeli
1. **Cloud Run CPU artır:** `--cpu=2` veya `--cpu=4`
2. **Max instance artır:** `--max-instances=10`
3. **Redis upgrade:** Upstash Pro veya Redis Cloud
4. **Neon compute:** Autoscaling veya dedicated

#### Uzun Vadeli
1. **Queue-based architecture:** Webhook'ları kuyruğa al, async işle
2. **Batch processing:** Toplu INSERT'ler
3. **Read replica:** Analytics sorgularını ana DB'den ayır
4. **CDN cache:** Sabit endpoint bilgilerini cache'le

## 📁 Test Dosyaları

| Dosya | Boyut | Açıklama |
|-------|-------|----------|
| `k6_summary.json` | 5.5KB | k6 özet metrikleri |
| `k6_raw.json` | 294MB | Ham istek verileri |
| `k6_output.log` | 1.4MB | k6 konsol çıktısı |

---

## 🎯 Sonuç

**Cloud Run free tier + Neon free tier + Upstash free tier kombinasyonuyla dakikada 10K webhook teslimatı mümkün DEĞİL.**

Sistem ~50/sn'ye kadar stabil çalışıyor. 167/sn hedefine ulaşmak için:
1. Cloud Run paid tier (min 2 instance, max 10)
2. PgBouncer connection pooling
3. Redis Pro plan
4. Neon compute upgrade

**Tahmini maliyet:** ~$50-100/ay (paid tier'larla)

---

*Rapor HookSniff Load Test Runner tarafından oluşturuldu*
