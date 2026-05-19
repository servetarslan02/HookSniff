# 🎮 Reinforcement Learning (RL) — Derinlemesine İnceleme

> Oluşturma: 2026-05-20 05:10 GMT+8
> Kaynak: ResearchGate, arXiv, ACM, IEEE, Nature, Medium, Confluent, Dynatrace
> Amaç: HookSniff'e RL nasıl uyarlanır?

---

## Nedir?

Reinforcement Learning (Pekiştirmeli Öğrenme), bir sistemin **deneme-yanılma** ile kendi kurallarını optimize etmesidir.

```
Klasik Programlama:
  İnsan kural yazar → Sistem o kuralı uygular
  Kural yanlışsa → Sistem yanlış yapar
  Düzeltmek için → İnsan yeni kural yazar

Reinforcement Learning:
  Sistem bir aksiyon alır → Sonucu ölçer → Ödül/ceza alır → Kurallarını günceller
  Kural yanlışsa → Sistem kendini düzeltir
  Düzeltmek için → İnsan müdahale etmez
```

---

## 3 Temel Bileşen

```
┌─────────────────────────────────────────────────────────┐
│              REINFORCEMENT LEARNING                      │
│                                                          │
│  1. STATE (Durum)                                       │
│     → Sistemin mevcut durumu                            │
│     → HookSniff: endpoint'in sağlık durumu              │
│                                                          │
│  2. ACTION (Aksiyon)                                    │
│     → Sistemin yapabileceği şeyler                      │
│     → HookSniff: circuit aç, retry yavaşlat, alert gönder│
│                                                          │
│  3. REWARD (Ödül)                                       │
│     → Aksiyonun sonucu (iyi mi, kötü mü?)               │
│     → HookSniff: success rate arttı → +ödül, düştü → -ceza│
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### State (Durum) — HookSniff İçin

```python
state = {
    "endpoint_id": "abc-123",
    "success_rate_1h": 0.85,          # Son 1 saat başarı oranı
    "latency_p95_ms": 1200,           # 95. persentil latency
    "failure_streak": 3,              # Üst üste başarısız sayısı
    "error_type": "timeout",          # Hata tipi
    "traffic_rate": 45.3,             # Saatlik trafik
    "time_of_day": 14,                # Saat
    "day_of_week": 2,                 # Gün (Salı)
    "circuit_state": "closed",        # Circuit breaker durumu
    "last_action": "none",            # Son yapılan aksiyon
    "hours_since_last_action": 2.5,   # Son aksiyondan bu yana geçen süre
}
```

### Action (Aksiyon) — HookSniff İçin

```python
actions = [
    "do_nothing",              # Hiçbir şey yapma
    "alert_customer",          # Müşteriye bildirim gönder
    "increase_retry_delay",    # Retry bekleme süresini artır
    "decrease_retry_delay",    # Retry bekleme süresini azalt
    "open_circuit",            # Circuit breaker'ı aç
    "close_circuit",           # Circuit breaker'ı kapat
    "throttle_increase",       # Rate limit'i artır
    "throttle_decrease",       # Rate limit'i azalt
    "auto_disable_endpoint",   # Endpoint'i otomatik kapat
    "auto_enable_endpoint",    # Endpoint'i otomatik aç
    "reroute_traffic",         # Traffiği başka URL'ye yönlendir
    "escalate_to_human",       # İnsana havale et
]
```

### Reward (Ödül) — HookSniff İçin

```python
def calculate_reward(state_before, state_after, action):
    reward = 0
    
    # Başarı oranı arttı → pozitif ödül
    if state_after.success_rate > state_before.success_rate:
        reward += (state_after.success_rate - state_before.success_rate) * 100
    
    # Başarı oranı düştü → negatif ödül (ceza)
    if state_after.success_rate < state_before.success_rate:
        reward -= (state_before.success_rate - state_after.success_rate) * 100
    
    # Latency azaldı → pozitif ödül
    if state_after.latency_p95 < state_before.latency_p95:
        reward += 10
    
    # Latency arttı → negatif ödül
    if state_after.latency_p95 > state_before.latency_p95:
        reward -= 10
    
    # Gereksiz aksiyon → küçük ceza
    if action != "do_nothing" and state_after.success_rate == state_before.success_rate:
        reward -= 5  # Gereksiz aksiyon
    
    # Başarısız endpoint'i kapatmak → büyük ödül (kaynak tasarrufu)
    if action == "auto_disable_endpoint" and state_before.success_rate < 0.1:
        reward += 50
    
    # Yanlış endpoint'i kapatmak → büyük ceza
    if action == "auto_disable_endpoint" and state_before.success_rate > 0.9:
        reward -= 100
    
    return reward
```

---

## RL Türleri ve HookSniff İçin Uygunluğu

### 1. Multi-Armed Bandit (En Basit, En Uygun)

```
Problem: Birden fazla seçenek var, hangisini seçmeli?

Örnek: Bir endpoint için 3 retry stratejisi var:
  A: Sabit 5 saniye bekle
  B: Exponential backoff (1→2→4→8→16 sn)
  C: Exponential backoff + jitter

Hangisi en iyi? → Deneme-yanılma ile bul

Nasıl çalışır:
  1. Her stratejiyi dene
  2. Sonuçları ölç (success rate)
  3. En iyi performans göstereni daha sık kullan
  4. Ama bazen diğerlerini de dene (exploration)
```

**HookSniff'e uyarlaması:**
```sql
CREATE TABLE rl_strategy_performance (
    endpoint_id UUID NOT NULL,
    strategy_name VARCHAR(50) NOT NULL,  -- 'fixed_5s', 'exponential', 'exp_jitter'
    total_trials INT DEFAULT 0,
    total_successes INT DEFAULT 0,
    avg_reward FLOAT DEFAULT 0,
    last_used TIMESTAMPTZ,
    PRIMARY KEY (endpoint_id, strategy_name)
);
```

**Neden uygun?**
- Basit, anlaşılır
- PostgreSQL'de çalışır (ML kütüphanesi gerektirmez)
- Hemen uygulanabilir
- Gerçek veriyle çalışır

### 2. Contextual Bandit (Orta Seviye)

```
Multi-Armed Bandit'ten farkı: Bağlamı da dikkate alır

Örnek: Aynı endpoint için:
  - Gece → Strateji A daha iyi (trafik düşük)
  - Gündüz → Strateji B daha iyi (trafik yüksek)
  - Haftasonu → Strateji C daha iyi (farklı patern)

Nasıl çalışır:
  1. Mevcut bağlamı al (saat, gün, trafik)
  2. Bu bağlam için en iyi stratejiyi seç
  3. Sonucu ölç
  4. Bu bağlam için strateji skorunu güncelle
```

**HookSniff'e uyarlaması:**
```sql
CREATE TABLE rl_contextual_performance (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    context_hash VARCHAR(64) NOT NULL,  -- Bağlamın hash'i
    context JSONB NOT NULL,             -- {"time_of_day": 14, "traffic_level": "high"}
    strategy_name VARCHAR(50) NOT NULL,
    total_trials INT DEFAULT 0,
    total_successes INT DEFAULT 0,
    avg_reward FLOAT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Neden uygun?**
- Multi-Armed Bandit'ten daha akıllı
- Hâlâ PostgreSQL'de çalışabilir
- Bağlamsal karar verir

### 3. Q-Learning (Tam RL)

```
En klasik RL algoritması.

Nasıl çalışır:
  1. Her (state, action) çifti için bir "Q-değeri" tutulur
  2. Q-değeri = "Bu durumda bu aksiyonu alırsam, uzun vadede ne kadar ödül alırım?"
  3. Her adımda Q-değerini güncelle:
     Q(s,a) = Q(s,a) + α * (reward + γ * max(Q(s',a')) - Q(s,a))
  4. Zamanla en iyi politikayı öğrenir

State space: {success_rate, latency, error_type, time_of_day, ...}
Action space: {do_nothing, alert, circuit_open, throttle, ...}
Reward: success_rate arttı → +, düştü → -
```

**HookSniff'e uyarlaması:**
```sql
CREATE TABLE rl_q_values (
    id BIGSERIAL PRIMARY KEY,
    endpoint_id UUID NOT NULL,
    state_hash VARCHAR(64) NOT NULL,
    action VARCHAR(50) NOT NULL,
    q_value FLOAT DEFAULT 0.0,
    visit_count INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

**Neden uygun?**
- En güçlü RL algoritması
- Ama state space çok büyükse yavaşlar
- HookSniff için: 10-15 state değişkeni → milyonlarca state → zor

### 4. Deep RL (En Güçlü, En Zor)

```
Q-Learning'in neural network ile genişletilmiş hali.

Nasıl çalışır:
  1. State'i neural network'e ver
  2. Network en iyi aksiyonu tahmin et
  3. Sonucu ölç, network'ü güncelle

Neden güçlü:
  - Milyonlarca state ile başa çıkabilir
  - Karmaşık pattern'ları öğrenir

Neden zor:
  - Eğitim verisi gerekir
  - GPU gerekir
  - Debug etmesi zor
  - Production'da tehlikeli olabilir
```

**HookSniff için: GEREK YOK.** Q-Learning veya Contextual Bandit yeterli.

---

## 🎯 HookSniff İçin RL Uygulaması

### Aşama 1: Multi-Armed Bandit (En Basit)

**Ne optimize edecek?** Retry stratejisi.

```
Her endpoint için 3 strateji:
  A: Sabit bekleme (5s)
  B: Exponential backoff (1→2→4→8→16s)
  C: Exponential backoff + jitter

Her retry'da:
  1. Strateji seç (en iyi performans göstereni, ama bazen diğerlerini de dene)
  2. Sonucu ölç (başarılı/başarısız)
  3. Strateji skorunu güncelle

100 retry sonra:
  → Bu endpoint için en iyi stratejiyi öğrenmiş olur
  → O stratejiyi otomatik kullanmaya başlar
```

**SQL implementasyonu:**
```sql
-- Her endpoint için strateji performansı
CREATE TABLE rl_retry_strategies (
    endpoint_id UUID NOT NULL,
    strategy VARCHAR(50) NOT NULL,  -- 'fixed', 'exponential', 'exp_jitter'
    trials INT DEFAULT 0,
    successes INT DEFAULT 0,
    avg_reward FLOAT DEFAULT 0.0,
    last_used TIMESTAMPTZ,
    PRIMARY KEY (endpoint_id, strategy)
);

-- Thompson Sampling algoritması (basit ama etkili)
-- Her strateji için beta dağılımı kullanarak seçim yap
-- İyi performans → daha yüksek olasılıkla seçilir
-- Kötü performans → daha düşük olasılıkla seçilir
-- Ama her zaman biraz exploration (diğerlerini deneme)
```

### Aşama 2: Contextual Bandit (Orta Seviye)

**Ne optimize edecek?** Circuit breaker eşiği.

```
Problem: Circuit breaker'ın kaç fail'de açılması gerektiği endpoint'e göre değişir.
  → Bazı endpoint'ler 3 fail'den sonra düzeliyor (eşik 3 olsun)
  → Bazı endpoint'ler 10 fail'den sonra düzeliyor (eşik 10 olsun)
  → Sabit eşik (5) her ikisi için de yanlış

Çözüm: Her endpoint için en iyi eşiği öğren.

Bağlam:
  - Endpoint'in türü (payment, notification, analytics)
  - Trafik seviyesi (düşük, orta, yüksek)
  - Saat (gece, gündüz)
  - Son hata tipi (timeout, 5xx, dns)

Aksiyon:
  - Eşik = 3
  - Eşik = 5
  - Eşik = 7
  - Eşik = 10

Ödül:
  - Circuit açıldıktan sonra endpoint düzeldi → +ödül
  - Circuit açıldı ama endpoint düzelmedi → -ceza
  - Circuit açılmadı ama endpoint fail oldu → -ceza
```

### Aşama 3: Q-Learning (İleri Seviye)

**Ne optimize edecek?** Tüm self-healing aksiyonları.

```
State: {success_rate_bin, latency_bin, error_type, time_bin, traffic_bin}
  → success_rate_bin: [0-20, 20-40, 40-60, 60-80, 80-100]
  → latency_bin: [fast, medium, slow, very_slow]
  → error_type: [timeout, 5xx, dns, connection, none]
  → time_bin: [night, morning, afternoon, evening]
  → traffic_bin: [low, medium, high, spike]

Total state space: 5 × 4 × 5 × 4 × 4 = 1,600 state

Action: {do_nothing, alert, circuit_open, throttle_increase, auto_disable, reroute}
  → 6 aksiyon

Total Q-table: 1,600 × 6 = 9,600 entry
  → PostgreSQL'de rahatça saklanabilir ✅

Öğrenme:
  Her 15 dakikada bir:
    1. Mevcut state'i hesapla
    2. En yüksek Q-değerine sahip aksiyonu seç (veya exploration ile rastgele)
    3. Aksiyonu uygula
    4. 15 dakika sonra sonucu ölç
    5. Q-değerini güncelle
```

---

## 📊 RL vs Kural Tabanlı: Karşılaştırma

| Özellik | Kural Tabanlı | Multi-Armed Bandit | Contextual Bandit | Q-Learning |
|---------|--------------|-------------------|-------------------|------------|
| **Karmaşıklık** | Düşük | Düşük | Orta | Yüksek |
| **Öğrenme** | ❌ | ✅ Basit | ✅ Bağlamsal | ✅ Derin |
| **Uygulama kolaylığı** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| **Veri gereksinimi** | Yok | Az | Orta | Çok |
| **PostgreSQL'de çalışır** | ✅ | ✅ | ✅ | ✅ (küçük Q-table) |
| **ML kütüphanesi** | ❌ | ❌ | ❌ | ❌ (basit versiyon) |
| **Risk** | Sıfır | Düşük | Düşük | Orta |
| **HookSniff için uygunluk** | ✅ Şimdi | ✅ Aşama 2 | ✅ Aşama 3 | ⚠️ Aşama 5+ |

---

## 🏆 Dünyadan Örnekler

### 1. Kubernetes Autoscaling (Deep RL)

```
Problem: Pod sayısını ne zaman artıralım?
  → Sabit eşik (CPU > 80%) → Yanlış (bazı workloads %90 normal)
  → RL ile → Her workload için optimal eşiği öğrenir

Araştırma sonuçları:
  - RL ile %30 daha az kaynak kullanımı
  - SLA ihlali %50 azaldı
  - Otomatik öğrenme, manuel ayar gerektirmez
```

### 2. Stripe Smart Retries (ML + RL elementleri)

```
Stripe tam RL kullanmıyor ama RL'nin elementlerini kullanıyor:
  - Her retry'da sonucu ölçüyor (reward)
  - Stratejiyi güncelliyor (learning)
  - Bağlamı dikkate alıyor (context)
  - Exploration vs exploitation dengesi var
```

### 3. Netflix Predictive Scaling (RL elementleri)

```
Netflix'in auto-scaling sistemi:
  - Trafik patern'larını öğrenir (state)
  - Ne zaman ölçekleneceğine karar verir (action)
  - Performansı ölçer (reward)
  - Stratejiyi günceller (learning)
```

### 4. Dynatrace Davis AI (Deterministik + RL elementleri)

```
Dynatrace tam RL kullanmıyor ama:
  - Past incident'lardan öğrenir
  - Remediation stratejilerini günceller
  - Hangi aksiyonun daha iyi olduğunu bilir
```

---

## 🎯 HookSniff İçin RL Yol Haritası

```
AŞAMA 1 (Şimdi): Kural tabanlı (sabit kurallar)
  → Circuit breaker: 5 fail → aç
  → Retry: exponential backoff
  → Throttle: sabit rate limit
  → Risk: Sıfır

AŞAMA 2 (1-2 ay sonra): Multi-Armed Bandit
  → Retry stratejisini optimize et
  → 3 strateji: fixed, exponential, exp_jitter
  → Her endpoint için en iyi stratejiyi öğren
  → Risk: Düşük

AŞAMA 3 (3-4 ay sonra): Contextual Bandit
  → Circuit breaker eşik değerini optimize et
  → Bağlam: saat, trafik, hata tipi
  → Her endpoint için en iyi eşiği öğren
  → Risk: Düşük

AŞAMA 4 (6+ ay sonra): Q-Learning
  → Tüm self-healing aksiyonlarını optimize et
  → 1,600 state × 6 action = 9,600 Q-table entry
  → PostgreSQL'de saklanır
  → Risk: Orta

AŞAMA 5 (1+ yıl sonra): Deep RL (opsiyonel)
  → Daha karmaşık pattern'lar
  → Neural network gerekir
  → Sadece yeterli veri olduğunda
  → Risk: Yüksek
```

---

## 💡 SONUÇ: RL HookSniff'e Ne Katar?

### Kural Tabanlı Sistem (Şu An)
```
"5 fail → circuit aç" → Her endpoint için aynı
"Exponential backoff" → Her endpoint için aynı
"Sabit rate limit" → Her endpoint için aynı
```

### RL Destekli Sistem (Hedef)
```
"Bu endpoint 3 fail'den sonra düzeliyor → eşik 3"
"Bu endpoint için exponential + jitter en iyi"
"Bu endpoint gece daha yüksek rate limit kaldırabilir"
"Saat 14:00'te bu endpoint genelde yavaşlıyor → önceden hazırlık"
```

**Fark:** Her endpoint kendi optimal kurallarını öğrenir. Sabit kurallar yerine adapte olan kurallar.

**Ancak:** RL eklemek için önce kural tabanlı sistemi kurmak gerekir. RL, mevcut verilerden öğrenir. Veri yoksa, RL de öğrenemez.

**Öneri:** Aşama 1-3 (kural tabanlı + Multi-Armed Bandit + Contextual Bandit) yeterli. Q-Learning ve Deep RL sadece büyük ölçek (>100K delivery/gün) ve yeterli veri (>100K delivery) olduğunda.
