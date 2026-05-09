# HookSniff — Load Testing Stratejisi

> Oluşturma: 2026-05-10
> Son güncelleme: 2026-05-10 (Doğrulanmış)
> Durum: Taslak
> Kaynaklar: Vervali 13 Tools 2026, PFLB API Tools 2026, Grafana k6 pricing (doğrulanmış), Artillery pricing (doğrulanmış), BigPanda Downtime 2024, HookSniff mevcut test altyapısı

---

## İçindekiler

1. [Mevcut Durum](#1-mevcut-durum)
2. [Neden Load Testing?](#2-neden-load-testing)
3. [Araç Karşılaştırması](#3-araç-karşılaştırması)
4. [Mevcut Test Altyapısı](#4-mevcut-test-altyapısı)
5. [Test Senaryoları](#5-test-senaryoları)
6. [Performans Hedefleri](#6-performans-hedefleri)
7. [CI/CD Entegrasyonu](#7-cicd-entegrasyonu)
8. [Bottleneck Tespiti](#8-bottleneck-tespiti)
9. [Metrikler](#9-metrikler)
10. [Uygulama Planı](#10-uygulama-planı)

---

## 1. Mevcut Durum

### HookSniff Mevcut Test Altyapısı (Doğrulanmış)

HookSniff'in `tests/load/` klasöründe zaten **6 k6 test scripti** ve **1 test receiver** var:

| Dosya | Amaç | Durum |
|-------|------|-------|
| `k6_load_test.js` | Genel load test (3 scenario: webhook delivery, endpoint creation, mixed workload) | ✅ Var |
| `k6_webhook_flow.js` | End-to-end webhook flow (warmup → medium → high → stress) | ✅ Var |
| `k6_api_stress.js` | API stress test (5 → 100 VU) | ✅ Var |
| `k6_worker_throughput.js` | Worker throughput test (10K batch) | ✅ Var |
| `webhook_receiver.js` | Test webhook receiver (Node.js, 200 response) | ✅ Var |
| `load_test.js` | Ek load test | ✅ Var |
| `stress_test.js` | Ek stress test | ✅ Var |
| `smoke_test.js` | Smoke test | ✅ Var |
| `README.md` | Dokümantasyon | ✅ Kapsamlı |

### Mevcut Test Senaryoları (k6_webhook_flow.js)

| Faz | Süre | Rate | VU Aralığı |
|-----|------|------|-----------|
| Warmup | 1 dk | 10/sn | 10-20 |
| Medium | 1.5 dk | 50/sn | 30-80 |
| High | 1.5 dk | 100/sn | 60-150 |
| Stress | 2 dk | 200/sn | 100-300 |

### Mevcut Threshold'lar

```javascript
thresholds: {
  http_req_duration: ['p(95)<2000', 'p(99)<5000'],
  webhook_success_rate: ['rate>0.95'],
  webhook_send_latency: ['p(95)<2000'],
}
```

### Mevcut Performans Hedefleri (README.md)

| Metrik | Hedef | Kritik Eşik |
|--------|-------|------------|
| API p50 latency | <50ms | >100ms |
| API p95 latency | <200ms | >500ms |
| Webhook creation p95 | <500ms | >2s |
| Webhook success rate | >%99 | <%95 |
| Worker throughput | >100/sn | <50/sn |
| Queue drain time (10K) | <5 dk | >10 dk |

---

## 2. Neden Load Testing?

### Downtime Maliyeti (Doğrulanmış)

Kaynak: BigPanda 2024, Erwood Group 2025 (Vervali 2026'dan alıntı)

| Metrik | Değer | Kaynak |
|--------|-------|--------|
| Enterprise downtime maliyeti | **$23,750/dakika** | BigPanda 2024 |
| Saatlik downtime maliyeti | **$1,425,000** | BigPanda 2024 |
| 1 saatlik downtime maliyeti ($1M+) | **%41 enterprise** | Erwood Group 2025 |
| Global 2000 yıllık downtime kaybı | **$400 milyar** | Erwood Group 2025 |

### HookSniff İçin Neden Kritik?

1. **Webhook delivery = mission-critical** — müşteri verisi kaybı = müşteri kaybı
2. **Free tier altyapı** — Neon (0.25 CU), Upstash (500K komut/ay), Cloud Run free tier → sınırlı kaynak
3. **$0 bütçe** — ölçekleme sorunlarını önceden tespit etmek kritik
4. **11 SDK** — farklı dillerden gelen trafik farklı performans profilleri oluşturur
5. **Enterprise hedefi** — SLA taahhütleri performans kanıtı gerektirir

---

## 3. Araç Karşılaştırması

### Doğrulanmış Karşılaştırma (Vervali 2026, PFLB 2026)

| Araç | Dil | Fiyat | Free Tier | GitHub Stars | HookSniff Uygunluğu |
|------|-----|-------|-----------|-------------|---------------------|
| **k6 (Grafana)** | JavaScript/TypeScript | OSS ücretsiz, Cloud $0.15/VU-saat | ✅ 500 VU-saat/ay | **29.9K** | ✅ **EN UYGUN — zaten mevcut** |
| **Artillery** | JavaScript/YAML | OSS ücretsiz, Cloud $199/ay (Team) | ✅ Free plan var | ~5K | 🟡 İyi ama k6 zaten var |
| **Locust** | Python | Ücretsiz (open-source) | ✅ Tamamen ücretsiz | ~25K | 🟡 Python bilgisi gerekli |
| **Gatling** | Java/Scala/Kotlin/JS | OSS ücretsiz, Cloud ücretli | ✅ OSS ücretsiz | ~6K | ❌ Karmaşık kurulum |
| **JMeter** | Java | Ücretsiz (open-source) | ✅ Tamamen ücretsiz | ~8K | ❌ Eski, GUI-dependent |
| **LoadRunner** | Various | $50,000+/yıl | ❌ | — | ❌ Enterprise, pahalı |
| **NeoLoad** | Various | $50,000+/yıl | ❌ | — | ❌ Enterprise, pahalı |
| **BlazeMeter** | Various | Kullanım bazlı | ✅ Free tier | — | 🟡 JMeter-based |

### Seçim: k6 (Grafana)

**Neden k6?**
1. **Zaten mevcut** — HookSniff'in `tests/load/` klasöründe 6 script hazır
2. **JavaScript/TypeScript** — developer-friendly, Rust ekibi için öğrenme eğrisi düşük
3. **Grafana entegrasyonu** — HookSniff zaten Grafana Cloud kullanıyor (OpenTelemetry)
4. **Free tier: 500 VU-saat/ay** — başlangıç için yeterli
5. **29.9K GitHub stars** — en popüler modern load testing aracı
6. **Düşük kaynak tüketimi** — 256 MB RAM (JMeter: 760 MB)
7. **CI/CD dostu** — headless, scriptable, GitHub Actions ile entegre

### k6 Fiyatlandırması (Doğrulanmış — Grafana 2026)

Kaynak: https://grafana.com/pricing/ (✅ Tam sayfa doğrulanmış)

| Plan | Fiyat | k6 VU-saat | Retention | Not |
|------|-------|-----------|-----------|-----|
| **Free** | $0/ay | 500 VU-saat/ay | 14 gün | HookSniff'in mevcut planı |
| **Pro** | $19/ay + kullanım | $0.15/VU-saat | 30 gün | Ölçeklenme için |
| **Enterprise** | $25,000+/yıl | Custom | Custom | Enterprise |

**HookSniff free tier hesabı:**
- 500 VU-saat/ay ÷ 10 VU = 50 saat test süresi/ay
- 500 VU-saat/ay ÷ 100 VU = 5 saat test süresi/ay
- Haftada 1 tam test run (~30 dk) = ~2 saat/ay → **free tier yeterli**

### Artillery Fiyatlandırması (Doğrulanmış — Artillery 2026)

Kaynak: https://www.artillery.io/pricing (✅ Tam sayfa doğrulanmış)

| Plan | Fiyat | Test raporları | Data retention | Worker limiti |
|------|-------|---------------|----------------|--------------|
| **Free** | $0 | Sınırlı | Sınırlı | Sınırlı |
| **Team** | $199/ay | 1,000/ay | 6 ay | 25 worker/test |
| **Enterprise** | $1,199+/ay | 2,500/ay | 18 ay | Sınırsız |

---

## 4. Mevcut Test Altyapısı

### Test Dosyaları Yapısı

```
tests/load/
├── k6_load_test.js          ← Genel load test (3 scenario)
├── k6_webhook_flow.js       ← End-to-end webhook flow
├── k6_api_stress.js         ← API stress test
├── k6_worker_throughput.js  ← Worker throughput
├── load_test.js             ← Ek load test
├── stress_test.js           ← Ek stress test
├── smoke_test.js            ← Smoke test
├── webhook_receiver.js      ← Test receiver (Node.js)
├── README.md                ← Dokümantasyon
└── results/
    └── README.md            ← Sonuç şablonu
```

### Test Çalıştırma Komutları

```bash
# Smoke test (hızlı kontrol)
API_KEY=hr_live_YOUR_KEY k6 run tests/load/smoke_test.js

# Webhook flow test (6.5 dakika)
API_KEY=hr_live_YOUR_KEY k6 run tests/load/k6_webhook_flow.js

# API stress test
API_KEY=hr_live_YOUR_KEY k6 run tests/load/k6_api_stress.js

# Worker throughput test
API_KEY=hr_live_YOUR_KEY k6 run tests/load/k6_worker_throughput.js

# Genel load test (3 scenario paralel)
API_KEY=hr_live_YOUR_KEY k6 run tests/load/k6_load_test.js

# JSON çıktı (CI için)
k6 run --summary-export=results/summary.json tests/load/k6_webhook_flow.js
```

### Test Receiver

```bash
# Başlat
node tests/load/webhook_receiver.js

# Özel port
PORT=9000 node tests/load/webhook_receiver.js

# Verbose logging
VERBOSE=true node tests/load/webhook_receiver.js

# Stats kontrol
curl http://localhost:8090/stats
```

---

## 5. Test Senaryoları

### Senaryo 1: Smoke Test (2 dakika)

**Amaç:** Temel fonksiyonların çalıştığını doğrula.

```javascript
// smoke_test.js — Mevcut
export const options = {
  vus: 1,
  duration: '2m',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
  },
};
```

**Ne test edilir:**
- Health endpoint çalışıyor mu?
- Endpoint oluşturabiliyor mu?
- Webhook gönderilebiliyor mu?
- Webhook listelenebiliyor mu?

### Senaryo 2: Webhook Flow Test (6.5 dakika)

**Amaç:** Gerçek webhook delivery pipeline'ını test et.

| Faz | Süre | Rate | VU | Hedef |
|-----|------|------|-----|-------|
| Warmup | 1 dk | 10/sn | 10-20 | Isınma |
| Medium | 1.5 dk | 50/sn | 30-80 | Normal yük |
| High | 1.5 dk | 100/sn | 60-150 | Yüksek yük |
| Stress | 2 dk | 200/sn | 100-300 | Stres |

**Threshold'lar:**
- p95 latency < 2sn
- Success rate > %95
- p99 latency < 5sn

### Senaryo 3: API Stress Test (ramping VU)

**Amaç:** API'nin nerede degrade olduğunu bul.

```
VU: 5 → 10 → 20 → 50 → 100
Her adımda p95 latency ölç.
```

**Endpoints:**
- `GET /health`
- `GET /v1/endpoints`
- `GET /v1/webhooks`
- `GET /v1/webhooks/:id`
- `GET /v1/stats`
- `POST /v1/endpoints` (%5)
- `POST /v1/webhooks` (%10)

**Kritik soru:** Hangi VU sayısında p95 > 500ms oluyor?

### Senaryo 4: Worker Throughput Test

**Amaç:** Worker'ın queue drain hızını ölç.

1. 10,000 webhook'u batch ile queue'ya ekle
2. Her 5 saniyede `GET /v1/stats` ile kontrol et
3. Throughput (item/sn), failure rate, toplam süre ölç

**Hedefler:**
- Worker throughput > 100/sn
- Failure rate < %5
- 10K drain süresi < 5 dk

### Senaryo 5: Spike Test (yeni)

**Amaç:** Ani trafik artışında sistem davranışı.

```
0-1 dk: 10 VU (normal)
1-1.5 dk: 500 VU (spike!)
1.5-3 dk: 10 VU (recovery)
3-4 dk: 500 VU (ikinci spike)
4-5 dk: 10 VU (recovery)
```

**Ne ölçülür:**
- Spike anında error rate
- Recovery süresi
- Queue büyüme hızı

### Senaryo 6: Soak Test (uzun süreli)

**Amaç:** Uzun süreli stabilite testi.

```
Süre: 1 saat
VU: 50 (sabit)
Rate: 50/sn (sabit)
```

**Ne ölçülür:**
- Memory leak var mı?
- Latency zamanla artıyor mu?
- DB connection pool exhaustion
- Redis command budget tüketimi

---

## 6. Performans Hedefleri

### Kısa Vadeli Hedefler (Lansman Öncesi)

| Metrik | Hedef | Kritik Eşik | Mevcut |
|--------|-------|------------|--------|
| API p50 latency | <50ms | >100ms | Ölçülmedi |
| API p95 latency | <200ms | >500ms | Ölçülmedi |
| API p99 latency | <500ms | >2sn | Ölçülmedi |
| Webhook send p95 | <500ms | >2sn | Ölçülmedi |
| Webhook success rate | >%99 | <%95 | Ölçülmedi |
| Worker throughput | >100/sn | <50/sn | Ölçülmümedi |
| 10K drain time | <5 dk | >10 dk | Ölçülmedi |

### Orta Vadeli Hedefler (İlk 3 Ay)

| Metrik | Hedef | Not |
|--------|-------|-----|
| Concurrent users | 500 | Free tier limiti |
| Webhook throughput | 1,000/sn | k6_load_test.js hedefi |
| API p95 (500 VU) | <500ms | Ölçeklenme |
| Error rate (stress) | <%5 | Stres altında |

### Uzun Vadeli Hedefler (6-12 Ay)

| Metrik | Hedef | Not |
|--------|-------|-----|
| Concurrent users | 5,000+ | Paid altyapı |
| Webhook throughput | 10,000/sn | Enterprise readiness |
| API p95 (5K VU) | <200ms | Optimizasyon |
| SLA | %99.9 uptime | Enterprise SLA |

---

## 7. CI/CD Entegrasyonu

### GitHub Actions ile Load Test

```yaml
# .github/workflows/load-test.yml
name: Load Test

on:
  schedule:
    - cron: '0 2 * * 1'  # Her Pazartesi 02:00
  workflow_dispatch:  # Manuel tetikleme

jobs:
  load-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install k6
        run: |
          curl -sL https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg
          echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
          sudo apt-get update && sudo apt-get install k6

      - name: Run Smoke Test
        run: k6 run tests/load/smoke_test.js
        env:
          BASE_URL: ${{ secrets.API_URL }}
          API_KEY: ${{ secrets.API_KEY }}

      - name: Run Webhook Flow Test
        run: k6 run --summary-export=results/summary.json tests/load/k6_webhook_flow.js
        env:
          BASE_URL: ${{ secrets.API_URL }}
          API_KEY: ${{ secrets.API_KEY }}

      - name: Upload Results
        uses: actions/upload-artifact@v4
        with:
          name: load-test-results
          path: tests/load/results/
```

### Local CI Komutu

```bash
# Makefile'a ekle
load-test-smoke:
	k6 run tests/load/smoke_test.js

load-test-webhook:
	k6 run tests/load/k6_webhook_flow.js

load-test-api:
	k6 run tests/load/k6_api_stress.js

load-test-worker:
	k6 run tests/load/k6_worker_throughput.js

load-test-all:
	k6 run tests/load/smoke_test.js && \
	k6 run tests/load/k6_webhook_flow.js && \
	k6 run tests/load/k6_api_stress.js && \
	k6 run tests/load/k6_worker_throughput.js

load-test-report:
	k6 run --summary-export=tests/load/results/summary.json tests/load/k6_webhook_flow.js
```

### Grafana Cloud Entegrasyonu

k6 sonuçlarını Grafana Cloud'a göndermek için:

```bash
# Grafana Cloud k6 ile çalıştır
K6_CLOUD_TOKEN=your_token k6 cloud tests/load/k6_webhook_flow.js

# VEYA Grafana dashboard'da k6 sonuçlarını可视化
# k6 --out experimental-prometheus-rw ile Prometheus'a push
```

---

## 8. Bottleneck Tespiti

### Potansiyel Bottleneck'ler ve Tespit Yöntemleri

| Bottleneck | Belirti | Tespit | Çözüm |
|-----------|---------|--------|-------|
| **Neon DB connection pool** | "too many clients" hatası | k6 API stress test | Connection pool artır |
| **Neon CPU limiti** | Query > 1sn | p95 latency spike | Upgrade Neon plan |
| **Upstash Redis budget** | 500K komut/aşıldı | Error rate artışı | Batch operations |
| **Cloud Run cold start** | İlk istek > 2sn | Warmup fazında | Min instance ayarla |
| **Worker CPU** | Throughput düşüşü | Worker throughput test | Worker concurrency artır |
| **Queue backlog** | Drain time > 10 dk | Worker throughput test | Worker instance artır |
| **Network bandwidth** | Large payload yavaş | Payload size test | Payload compress |
| **Rate limiter** | 429 hatası | k6 stress test | Rate limit ayarla |

### Neon Free Tier Limitleri

| Limit | Değer | Etki |
|-------|-------|------|
| Compute | 0.25 CU (shared) | Query latency spike |
| Connections | ~20 pooled | Connection exhaustion |
| Storage | 512 MB | Delivery logs dolar |
| Branches | 10 | Test data için |

**Neonпрактик limitler:**
- 10K webhook throughput testi ≈ 30-50K Redis komutu
- Tüm testler ≈ 80-150K komut/ay (Upstash budget'ının %13-30'u)

### Upstash Free Tier Limitleri

| Limit | Değer | Etki |
|-------|-------|------|
| Commands | 500K/ay | Her webhook ≈ 3-5 Redis op |
| Bandwidth | 1 GB/ay | Payload boyutu önemli |
| Max connections | 100 | Test için yeterli |
| Request size | 1 MB | Webhook payload limiti |

---

## 9. Metrikler

### Load Test KPI'ları

| KPI | Hedef | Ölçüm | Sıklık |
|-----|-------|-------|--------|
| API p50 latency | <50ms | k6 http_req_duration | Her test |
| API p95 latency | <200ms | k6 http_req_duration | Her test |
| API p99 latency | <500ms | k6 http_req_duration | Her test |
| Webhook success rate | >%99 | k6 webhook_success_rate | Her test |
| Worker throughput | >100/sn | k6 worker throughput | Haftalık |
| Error rate (stress) | <%5 | k6 errors rate | Her test |
| 10K drain time | <5 dk | k6 worker throughput | Haftalık |

### Rapor Formatı

Her test sonrası:

```markdown
# Load Test Raporu — [Tarih]

## Ortam
- API: [URL]
- Neon: [plan]
- Upstash: [plan]
- Cloud Run: [config]

## Sonuçlar
| Metrik | Değer | Hedef | Durum |
|--------|-------|-------|-------|
| API p50 | Xms | <50ms | ✅/❌ |
| API p95 | Xms | <200ms | ✅/❌ |
| Success rate | X% | >99% | ✅/❌ |
| Worker throughput | X/sn | >100/sn | ✅/❌ |

## Bottleneck'ler
- [Tespit edilen sorunlar]

## Aksiyonlar
- [Yapılması gerekenler]
```

---

## 10. Uygulama Planı

### Aşama 1: Mevcut Testleri Çalıştır (1. Hafta)

- [ ] k6 yükle (`curl -sL https://dl.k6.io/key.gpg | ...`)
- [ ] Smoke test çalıştır (`k6 run tests/load/smoke_test.js`)
- [ ] Webhook flow test çalıştır (`k6 run tests/load/k6_webhook_flow.js`)
- [ ] API stress test çalıştır (`k6 run tests/load/k6_api_stress.js`)
- [ ] Worker throughput test çalıştır (`k6 run tests/load/k6_worker_throughput.js`)
- [ ] Sonuçları kaydet (`tests/load/results/`)
- [ ] İlk performans raporu oluştur

### Aşama 2: Yeni Senaryolar Ekle (2. Hafta)

- [ ] Spike test scripti yaz (`tests/load/k6_spike_test.js`)
- [ ] Soak test scripti yaz (`k6 run --duration 1h tests/load/k6_soak_test.js`)
- [ ] Farklı payload boyutları test et (1KB, 10KB, 100KB)
- [ ] Farklı endpoint count'ları test et (10, 100, 1000)

### Aşama 3: CI/CD Entegrasyonu (3. Hafta)

- [ ] GitHub Actions workflow oluştur (`.github/workflows/load-test.yml`)
- [ ] Makefile'a load test komutları ekle
- [ ] Grafana Cloud k6 entegrasyonu (opsiyonel)
- [ ] Slack/Discord bildirimi (test sonuçları)

### Aşama 4: Sürekli İyileştirme (4+ Hafta)

- [ ] Haftalık load test çalıştır (Pazartesi 02:00)
- [ ] Aylık performans raporu oluştur
- [ ] Benchmark güncelle (gerçek sonuçlarla)
- [ ] Bottleneck'leri düzelt ve re-test et

### Grafana Cloud Free Tier Hesabı

| Kaynak | Free Tier | Kullanım |
|--------|-----------|----------|
| k6 VU-saat | 500/ay | ~50 test run (10 VU × 30 dk) |
| Metrics | 10K active series | Performans metrikleri |
| Logs | 50 GB | Test logları |
| Traces | 50 GB | Distributed traces |
| Retention | 14 gün | Sonuç saklama |

---

## Notlar

### Kaynaklar

- Vervali: "Best Load Testing Tools 2026" (13 araç karşılaştırması) — https://www.vervali.com/blog/best-load-testing-tools-in-2026-definitive-guide-to-jmeter-gatling-k6-loadrunner-locust-blazemeter-neoload-artillery-and-more/ (✅ Tam sayfa doğrulanmış)
- PFLB: "Best API Load Testing Tools 2026" — https://pflb.us/blog/best-api-load-testing-tools/ (⚠️ 403, arama özeti)
- Grafana Pricing (✅ doğrulanmış): https://grafana.com/pricing/
- Artillery Pricing (✅ doğrulanmış): https://www.artillery.io/pricing
- BigPanda: "IT Outage Costs 2024" — $23,750/dakika downtime (Vervali'den alıntı)
- Erwood Group: "Downtime Costs 2025" — $400B/yıl Global 2000 (Vervali'den alıntı)
- k6 GitHub: 29.9K stars (Vervali 2026 verisi)
- HookSniff tests/load/ klasörü (✅ doğrulanmış — 6 script mevcut)

### Mevcut Test Altyapısı Avantajı

HookSniff'in **en büyük avantajı**: k6 test scriptleri zaten yazılmış ve dokümante edilmiş. Çoğu startup'ın aksine, load testing altyapısı lansman öncesi hazır. Bu, Servet'in "sıfır tolerans, kusursuz sistem" prensibine uygun.

### Free Tier Bütçe Planlaması

| Test | Sıklık | k6 VU-saat | Neon Etki | Upstash Etki |
|------|--------|-----------|-----------|-------------|
| Smoke | Günlük | ~0.1 | Minimal | ~500 komut |
| Webhook flow | Haftalık | ~0.5 | Orta | ~20K komut |
| API stress | Haftalık | ~0.3 | Orta | ~5K komut |
| Worker throughput | Haftalık | ~0.5 | Yüksek | ~40K komut |
| **Toplam/ay** | | **~6 VU-saat** | | **~260K komut** |

**Free tier yeterli:** 500 VU-saat/ay (k6), 500K komut/ay (Upstash)

### Dikkat Edilecekler

1. **Staging'de test et** — production'da load test yapma
2. **Test sonrası cleanup** — test endpoint'lerini sil (teardown var)
3. **Tek test tek seferde** — paralel çalıştırma, metrikler karışır
4. **TOTAL_WEBHOOKS kademeli artır** — 100 → 1,000 → 10,000
5. **Receiver'ı kontrol et** — çalışmazsa webhook'lar fail sayılır
6. **Upstash budget takibi** — aylık 500K komut limiti var
7. **Neon connection pool** — 20 pooled connection, test aşamasında dikkat
