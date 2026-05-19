# 🔬 Cortex Araştırma Raporu

> Oluşturma: 2026-05-20
> İçerik: 7 şirket derinlemesine + Reinforcement Learning + Kapalı Döngü + Rakip Analizi

---

## 1. STRIPE — Ödeme Zekasının Zirvesi ($91.5B değerleme)

### Smart Retries
- 500+ özellik ile ML modeli (müşteri, iş, ödeme, zaman, fatura)
- Ensemble model: XGBoost → TabTransformer+ (deep neural network)
- Sentence Transformers ile multimodal data (text + sayısal)
- Sonuç: Her $1 harcama için $9 gelir kurtarılıyor

### Adaptive Acceptance
- Gerçek zamanlı retry (müşteri hiç reddedildiğini görmez)
- %70 daha yüksek precision, %35 daha az retry attempt
- 2024'te $6 milyar kurtarılan gelir (rekor)

### Payments Foundation Model
- Milyarlarca transaction ile eğitilmiş tek model
- Her ödeme için versatile embedding
- Card testing tespiti: %59'dan %97'ye (gece içinde)

### HookSniff Dersleri
- 500+ özellik yerine 12 sinyal (yeterli)
- Benchmark karşılaştırması (müşteriye göster)
- Hızlı model güncelleme (haftada birkaç kez)

---

## 2. CONFLUENT — Otonom Veri Sistemlerinin Öncüsü (IBM $11B)

### 4 Bileşenli Kapalı Döngü
1. Continuous Ingestion — Her olay anında yakalanır, polling yok
2. Real-Time Context — Ham veri + geçmiş = anlamlı sinyal
3. Decision Logic — Deterministik kurallar + ML modelleri
4. Automated Execution + Feedback — Sonucu ölç, kendini düzelt

### Kritik Insight: Otomatik vs Otonom
- Otomatik: Sabit kurallar, bakım gerektirir
- Otonom: Self-correcting, bakım gerektirmez
- Fark: Geri bildirim döngüsü

### Olgunluk Modeli
- Seviye 0: Manuel (insan karar verir)
- Seviye 1: Desteklenen (sistem önerir)
- Seviye 2: Otomatik (kurala göre uygular)
- Seviye 3: Otonom (kendini düzeltir) ← HEDEF

---

## 3. DATADOG — AIOps'un Kralı ($40B değerleme)

### Watchdog AI
- Autodetection: Konfigürasyon yok, sistem kendi kendine öğrenir
- Root Cause Analysis: Kök neden otomatik bulunur
- Contextual Insights: Hangi component hataya neden oldu
- Impact Analysis: Kaç kullanıcı etkilendi

### Adaptive Thresholds
- Sabit eşik yok → Her metrik kendi "normal"ini öğrenir
- Standart sapma ile normal bölge belirlenir
- Dışarı çıkan → anomali

### Alert Correlation
- 100 alert geldiyse → kaçı aynı kök neden?
- 1 alert göster (kök neden), 100 değil

---

## 4. DYNATRACE — Deterministik Nedensel AI

### Davis AI — Korelasyon vs Nedensellik
- Korelasyon (Datadog): "Bu 2 metrik birlikte artıyor" → neden bilinmiyor
- Nedensellik (Dynatrace): "Bu metrik BU yüzden artıyor" → kesin neden

### Hypermodal AI
- Deterministik AI: Gerçek neden-sonuç
- Probabilistik AI: Anomaly detection, trend
- Generatif AI: Doğal dilde açıklama, remediation taslağı

### Smartscape
- Otomatik keşif grafı (servis bağımlılıkları)
- 24 saatte 3M problem analizi

---

## 5. PAGERDUTY — Intelligent Incident Management

### Event Correlation
- 100 alert → 5 incident (gruplama)
- Önceliklendirme (iş etkisine göre)

### Intelligent Routing
- Hangi ekip sorumlu? (service ownership)
- Hangi kişi müsait? (on-call schedule)
- Bu sorun daha önce nasıl çözülmüş?

### Runbook Automation
- Sorun tespit → ilgili runbook bul → otomatik çalıştır → doğrula

---

## 6. HOOKDECK — Webhook Dünyasının En Akıllısı

### Recovery Surge Pattern (Dahice)
- Shopify 500K webhook/sn → yavaşladı → 8 saat birikti → düzeldi → 3x trafik geldi → tüketici çöktü
- Asıl sorun kesinti SONRASI, kesinti kendisi değil

### Çözüm
- Durable queue: Webhook'lar queue'da kalıcı
- Centralized retry: Tüketiciye kontrollü hızda gönderir
- Backpressure: Tüketici hızına göre throttling
- Idempotency: Tekrarlanan webhook'ları filtreler

### Radar
- 3. parti webhook sağlayıcıların gecikmesini gerçek zamanlı izler
- ÜCRETSİZ

---

## 7. NETFLIX — Self-Healing'in Babası

### Chaos Monkey
- Production sunucularını RASTGELE öldürür
- Amaç: Dayanıklılığı test etmek
- Simian Army: Chaos, Latency, Security, Janitor Monkey

### Automated Rollback
- Yeni deploy → canary → metrikler izlenir → sorun → otomatik geri al
- Saniyeler içinde, insan müdahalesi gerektirmez

### Predictive Scaling
- Trafik patern'larını öğrenir
- Peak'ten ÖNCE otomatik ölçeklenir

### Self-Healing 4 Katman
1. Detection (algılama)
2. Diagnosis (teşhis)
3. Remediation (iyileştirme)
4. Verification (doğrulama)

---

## 8. REINFORCEMENT LEARNING — Sistem Kendini Nasıl Öğrenir?

### Temel Kavram
```
Sistem aksiyon alır → Sonucu ölçer → Ödül/ceza alır → Kurallarını günceller
```

### 3 Bileşen
- State (durum): endpoint'in mevcut durumu
- Action (aksiyon): circuit aç, retry yavaşlat, alert gönder
- Reward (ödül): success rate arttı → +, düştü → -

### RL Türleri

| Tür | Karmaşıklık | HookSniff İçin |
|-----|------------|----------------|
| Multi-Armed Bandit | Düşük | ✅ En uygun (Aşama 2) |
| Contextual Bandit | Orta | ✅ Uygun (Aşama 3) |
| Q-Learning | Yüksek | ⚠️ Büyük ölçek (Aşama 5+) |
| Deep RL | Çok yüksek | ❌ Gerek yok |

### Multi-Armed Bandit (En Basit)
- 3 retry stratejisi: fixed, exponential, exp_jitter
- Her endpoint için en iyi stratejiyi dene-yanılma ile bul
- 100 retry sonra öğrenir

### Contextual Bandit
- Bağlamı dikkate alır (saat, trafik, hata tipi)
- Gece → Strateji A, Gündüz → Strateji B

### Q-Learning
- Her (durum, aksiyon) çifti için Q-değeri tutar
- 1,600 durum × 6 aksiyon = 9,600 entry
- PostgreSQL'de saklanır

### Deep RL — Gerek Yok
- 1,000,000+ durum gerektiren problemler için
- HookSniff'in 1,600 durumu var → Q-Learning yeterli
- GPU gerekir, "kara kutu" riskli

### HookSniff İçin RL Yol Haritası
```
Aşama 1: Kural tabanlı (sabit kurallar)
Aşama 2: Multi-Armed Bandit (retry stratejisi)
Aşama 3: Contextual Bandit (circuit breaker eşiği)
Aşama 4: Q-Learning (tüm self-healing)
```

---

## 9. KAPALI DÖNGÜ NASIL ÇALIŞIR?

### Örnek Senaryo: Yavaşlayan Endpoint

```
14:00 — Latency: 230ms (normal)
14:05 — Latency: 450ms (↑%96)        → Sinyal toplandı
14:10 — Latency: 890ms (↑%287)       → Anomali skoru: 45
14:15 — Latency: 1200ms (↑%422)      → Anomali skoru: 78 → Alert

KARAR: "Bu endpoint 15 dakika içinde fail olacak"
UYGULA: Retry 2x artır, circuit eşik 3'e düşür, müşteriye bildirim
ÖLÇ:   14:22 — Müşteri restart etti, latency 340ms
ÖĞREN: "Bu endpoint için latency eşiği 890ms, artış hızı kritik %96/dk"
```

### 4 Bileşen (Confluent Modeli)
1. Continuous Ingestion → delivery_signals
2. Stateful Enrichment → endpoint_profiles
3. Decision Logic → anomaly_scorer + healing_engine
4. Feedback → profile güncelleme

---

## 10. RAKİP ÖZET TABLOSU

| Özellik | Stripe | Confluent | Datadog | Dynatrace | PagerDuty | Hookdeck | Netflix | HookSniff (Mevcut) | HookSniff (Hedef) |
|---------|--------|-----------|---------|-----------|-----------|----------|---------|--------------------|--------------------|
| ML Kullanımı | ✅ 500+ | ✅ Flink | ✅ Watchdog | ✅ Davis | ✅ | ❌ | ❌ | ❌ | ✅ |
| Kapalı Döngü | ✅ | ✅ Tanımladı | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Self-Learning | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Adaptive Eşikler | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Recovery Surge | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ | ❌ | ✅ |
| Anomaly Detection | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Root Cause | ❌ | ❌ | ✅ | ✅🏆 | ✅ | ❌ | ✅ | ❌ | ✅ |
| Deterministik AI | ❌ | ❌ | ❌ | ✅🏆 | ❌ | ❌ | ❌ | ❌ | ❌ |
| Prediction | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ |
| Alert Correlation | ❌ | ❌ | ✅ | ✅ | ✅🏆 | ❌ | ❌ | ❌ | ✅ |

---

## 💡 SONUÇ

**HookSniff'in hedeflediği sistem:**
- Stripe'ın zekası (adaptif öğrenme)
- Confluent'in mimarisi (kapalı döngü)
- Datadog'un anomali tespiti (adaptive thresholds)
- Hookdeck'in recovery surge'ı (spike koruması)
- Netflix'in self-healing'i (otomatik iyileştirme)

**Tüm bunlar dış API gerektirmez. PostgreSQL aggregation + basit istatistik + kural motoru ile yapılır.**
