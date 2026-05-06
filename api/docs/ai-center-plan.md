# HookRelay AI Merkezi — Tam Plan

## Vizyon
HookRelay platformunun **kendi kendini yöneten, koruyan ve optimize eden** otonom bir AI sistemine sahip olması.
İnsan müdahalesi yalnızca **yüksek riskli** işlemlerde gerekecek.

---

## Sistem Mimarisi

```
┌─────────────────────────────────────────────────────────────┐
│                     AI MERKEZİ (ai-center)                  │
├──────────┬──────────┬──────────┬──────────┬─────────────────┤
│ MONİTÖR │ RİSK    │ SAVUNMA  │ OTOMATİK │ YÖNETİM         │
│ MOTORU   │ ANALİZ  │ KALKANI  │ FIX      │ KONSOLU         │
├──────────┴──────────┴──────────┴──────────┴─────────────────┤
│                    ORTAK KATMAN                             │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Karar    │ │ Olay     │ │ Bellek   │ │ API      │      │
│  │ Motoru   │ │ Kuyruğu  │ │ (State)  │ │ Gateway  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│              VERİ KAYNAKLARI & ENTEGRASYONLAR               │
│  PostgreSQL │ Kafka │ Prometheus │ Logs │ Webhook Events    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. İZLEME MOTORU (Monitor)

### 1.1 Sistem Sağlık İzleme
- **CPU / RAM / Disk** kullanımı (eşik: %80 uyarı, %95 kritik)
- **API yanıt süreleri** (p50, p95, p99)
- **Kafka lag** (consumer gecikmesi)
- **DB bağlantı havuzu** durumu
- **Aktif bağlantı sayısı**

### 1.2 Webhook Sağlık İzleme
- **Teslimat başarı oranı** (son 1 saat / 24 saat / 7 gün)
- **Hata paternleri** (hangi endpoint'ler başarısız?)
- **Retry dağılımı** (kaç denemede başarıyor?)
- **Dead letter queue** büyüme hızı
- **Ortalama teslimat süresi**

### 1.3 Trafik İzleme
- **İstek hacmi** (anormal artış/azalış tespiti)
- **Müşteri başına trafik** dağılımı
- **Coğrafi dağılım** (varsa)
- **Endpoint bazlı trafik** paternleri

### 1.4 Olay Kaydı (Event Log)
- Tüm önemli olayları `ai_events` tablosuna kaydet
- Her olaya: tür, seviye, açıklama, alınan aksiyon
- Geçmiş analizi için kullanılacak

```sql
CREATE TABLE ai_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type STRING NOT NULL,      -- 'risk', 'defense', 'fix', 'optimization'
    severity STRING NOT NULL,         -- 'info', 'warning', 'critical'
    title STRING NOT NULL,
    description STRING,
    action_taken STRING,              -- AI'ın ne yaptığı
    target_type STRING,               -- 'endpoint', 'customer', 'delivery', 'system'
    target_id UUID,
    metadata JSONB,
    resolved BOOL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 2. RİSK ANALİZİ MOTORU

### 2.1 Risk Skorlama (0-100)
Her **endpoint** ve **müşteri** için sürekli risk puanı hesapla:

| Faktör | Ağırlık | Açıklama |
|--------|---------|----------|
| Hata oranı | %30 | Son 1 saatteki başarısız teslimat % |
| Retry yoğunluğu | %20 | Ortalama retry sayısı |
| Trafik anomalisi | %15 | Normal paternin dışına çıkma |
| Yanıt süresi | %15 | Hedef endpoint'in yavaşlığı |
| Dead letter oranı | %10 | Dead letter'a düşme % |
| Endpoint yaşı | %5 | Yeni endpoint = daha riskli |
| İmza doğrulama | %5 | Geçersiz imza denemeleri |

### 2.2 Risk Seviyeleri

| Seviye | Puan | AI Aksiyonu |
|--------|------|-------------|
| 🟢 Düşük | 0-30 | İzle, optimize et |
| 🟡 Orta | 31-60 | Uyarı gönder, retry policy ayarla |
| 🟠 Yüksek | 61-80 | Endpoint'i geçici devre dışı bırak, müşteriye bildir |
| 🔴 Kritik | 81-100 | **İnsan müdahalesi gerekli** — otomatik aksiyon yok |

### 2.3 Anomali Tespiti
- **Z-score** tabanlı anormal trafik tespiti
- **Spike detection** (ani trafik artışı)
- **Pattern matching** (tekrarlayan hata paternleri)
- **Seasonal awareness** (iş saatleri vs gece farkı)

---

## 3. SAVUNMA KALKANI (Defense)

### 3.1 Saldırı Tespiti
- **DDoS pattern** — Tek IP'den aşırı istek
- **Credential stuffing** — Çoklu başarısız auth denemesi
- **SSRF attempt** — İç IP'lere erişim denemesi (zaten var, genişlet)
- **Payload injection** — Şüpheli JSON paternleri
- **Rate limit bypass** — Farklı API key'lerle rotasyon
- **Webhook spam** — Sahte webhook gönderimi

### 3.2 Otomatik Savunma Aksiyonları

| Tehdit | Aksiyon | Risk Seviyesi |
|--------|---------|---------------|
| DDoS pattern | IP geçici engelle + rate limit artır | 🟡 Orta |
| Credential fail | Hesabı geçici kilitle + bildirim | 🟡 Orta |
| SSRF attempt | IP engelle + log | 🟠 Yüksek |
| Payload injection | İsteği reddet + log | 🟠 Yüksek |
| Spam tespiti | Rate limit sıkılaştır | 🟡 Orta |
| Şüpheli pattern | İnsan incelemesine al | 🔴 Kritik |

### 3.3 Dinamik Rate Limiting
- Normal durum: 100 istek/dakika
- Anomali tespit edildiğinde: otomatik sıkılaştır
- Saldırı bittiğinde: normale dön
- Müşteri bazlı: iyi müşterilere daha esnek limit

### 3.4 IP Reputation
- Bilinen kötü IP'leri blacklist'e al
- Coğrafi engelleme (istenirse)
- Tor çıkış node'larını tespit et

---

## 4. OTOMATİK FIX MOTORU (Auto-Fix)

### 4.1 Self-Healing Aksiyonları

#### Teslimat Düzeltmeleri
| Sorun | Çözüm | Risk |
|-------|-------|------|
| Endpoint yavaş (>5s) | Timeout'u artır, retry aralığını aç | 🟢 |
| Endpoint %100 hata | Geçici devre dışı bırak, müşteriye bildir | 🟡 |
| Dead letter dolu | Eski kayıtları temizle, rapor oluştur | 🟢 |
| Retry fırtınası | Backoff stratejisini değiştir | 🟡 |
| Kafka lag yüksek | Consumer sayısını artır | 🟢 |

#### Sistem Düzeltmeleri
| Sorun | Çözüm | Risk |
|-------|-------|------|
| DB yavaş | Sorgu optimizasyonu, index önerisi | 🟡 |
| Disk dolu | Log temizliği, eski veri arşivleme | 🟢 |
| Bağlantı havuzu dolu | Havuz boyutunu artır | 🟢 |
| Memory leak | Servis yeniden başlatma | 🔴 (insan onayı) |

#### Kod Düzeltmeleri
| Sorun | Çözüm | Risk |
|-------|-------|------|
| Tekrarlayan hata | Log analizi + fix önerisi | 🟡 |
| Performans darboğazı | Profil analizi + optimizasyon | 🟡 |
| Güvenlik açığı | Yama uygulama (onaylı) | 🔴 (insan onayı) |

### 4.2 Retry Policy Otonom Ayarlama
```
Hata oranı < %1  →  default policy (3 deneme, exponential)
Hata oranı %1-5  →  artır (5 deneme, daha uzun backoff)
Hata oranı %5-20 →  agresif (7 deneme, circuit breaker)
Hata oranı > %20 →  devre dışı bırak + bildirim
```

### 4.3 Circuit Breaker
- Belirli bir endpoint'te hata oranı %50'yi aşarsa → otomatik circuit break
- 5 dakika bekle → tek test isteği gönder
- Başarılıysa → circuit'ı kapat, trafiği aç
- Başarısızysa → 15 dakika daha bekle

---

## 5. YÖNETİM KONSOLU (Dashboard Entegrasyonu)

### 5.1 AI Merkezi Paneli
Mevcut Next.js dashboard'a yeni sayfa: `/dashboard/ai-center`

#### Bileşenler:
- **Risk Haritası** — Tüm endpoint'lerin risk durumu (heatmap)
- **Olay Akışı** — Gerçek zamanlı AI olayları (WebSocket)
- **Savunma Durumu** — Aktif tehditler, engellenen saldırılar
- **Performans Grafiği** — Teslimat başarı oranı trendi
- **AI Aksiyonları** — Yapılan ve bekleyen aksiyonlar
- **Onay Kuyruğu** — İnsan onayı bekleyen yüksek riskli aksiyonlar

### 5.2 Bildirim Sistemi
- **Email** — Kritik olaylar için
- **Slack/Discord webhook** — Tüm olaylar
- **Dashboard toast** — Anlık bildirimler
- **SMS** — Çok kritik (opsiyonel)

### 5.3 Onay Mekanizması
```
Düşük risk aksiyon  → Otomatik uygula, logla
Orta risk aksiyon   → Uygula + 15 dk içinde geri alabilir
Yüksek risk aksiyon → Kuyruğa al, insan onayı bekle
Kritik aksiyon      → Yalnızca uyarı, aksiyon yok
```

---

## 6. VERİ TABANI

### Yeni Tablolar

```sql
-- AI olay kayıtları
CREATE TABLE ai_events (...);  -- yukarıda tanımlı

-- Risk skor geçmişi
CREATE TABLE risk_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_type STRING NOT NULL,    -- 'endpoint' veya 'customer'
    target_id UUID NOT NULL,
    score INT NOT NULL,             -- 0-100
    factors JSONB,                  -- hangi faktörler etkili
    created_at TIMESTAMPTZ DEFAULT now()
);

-- AI aksiyon kayıtları
CREATE TABLE ai_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    action_type STRING NOT NULL,    -- 'fix', 'defense', 'optimization'
    description STRING NOT NULL,
    target_type STRING,
    target_id UUID,
    status STRING DEFAULT 'pending', -- 'pending', 'approved', 'executed', 'rejected', 'rolled_back'
    risk_level STRING NOT NULL,      -- 'low', 'medium', 'high', 'critical'
    auto_approved BOOL DEFAULT false,
    executed_at TIMESTAMPTZ,
    rolled_back_at TIMESTAMPTZ,
    created_by STRING DEFAULT 'ai',
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Kara liste (IP, müşteri, endpoint)
CREATE TABLE ai_blocklist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_type STRING NOT NULL,     -- 'ip', 'customer', 'endpoint'
    block_value STRING NOT NULL,
    reason STRING,
    expires_at TIMESTAMPTZ,         -- NULL = kalıcı
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Yapılandırma
CREATE TABLE ai_config (
    key STRING PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. KAYNAK DOSYALAR (API)

```
hookrelay/ai-center/
├── Cargo.toml
├── src/
│   ├── main.rs              # Ana döngü (scheduler)
│   ├── config.rs            # Yapılandırma
│   ├── db.rs                # Veritabanı bağlantıları
│   │
│   ├── monitor/             # İZLEME MOTORU
│   │   ├── mod.rs
│   │   ├── system.rs        # CPU/RAM/Disk izleme
│   │   ├── webhooks.rs      # Teslimat izleme
│   │   ├── traffic.rs       # Trafik analizi
│   │   └── metrics.rs       # Metrik toplama
│   │
│   ├── risk/                # RİSK ANALİZİ
│   │   ├── mod.rs
│   │   ├── scorer.rs        # Risk skor hesaplama
│   │   ├── anomaly.rs       # Anomali tespiti
│   │   └── patterns.rs      # Pattern matching
│   │
│   ├── defense/             # SAVUNMA
│   │   ├── mod.rs
│   │   ├── detector.rs      # Saldırı tespiti
│   │   ├── blocker.rs       # IP/müşteri engelleme
│   │   ├── rate_limit.rs    # Dinamik rate limiting
│   │   └── firewall.rs      # WAF kuralları
│   │
│   ├── fix/                 # OTOMATİK FIX
│   │   ├── mod.rs
│   │   ├── healer.rs        # Self-healing
│   │   ├── retry.rs         # Retry policy ayarlama
│   │   ├── circuit.rs       # Circuit breaker
│   │   └── optimizer.rs     # Performans optimizasyonu
│   │
│   ├── actions/             # AKSİYON YÖNETİMİ
│   │   ├── mod.rs
│   │   ├── executor.rs      # Aksiyon yürütme
│   │   ├── approval.rs      # Onay mekanizması
│   │   └── rollback.rs      # Geri alma
│   │
│   └── notify/              # BİLDİRİMLER
│       ├── mod.rs
│       ├── email.rs
│       ├── slack.rs
│       └── webhook.rs
│
└── migrations/
    └── 003_ai_center.sql
```

---

## 8. ÇALIŞMA DÖNGÜSÜ

```
Her 30 saniye:
├── Sistem metriklerini topla
├── Webhook sağlık durumunu kontrol et
├── Risk skorlarını hesapla
├── Anomali var mı?
│   ├── Evet → Savunma aksiyonu al
│   └── Hayır → Devam et
├── Hata paterni var mı?
│   ├── Evet → Fix önerisi oluştur
│   │   ├── Düşük risk → Otomatik uygula
│   │   ├── Orta risk → Uygula + izle
│   │   └── Yüksek risk → Kuyruğa al
│   └── Hayır → Devam et
├── Optimizasyon fırsatı var mı?
│   ├── Evet → Öneri oluştur
│   └── Hayır → Devam et
└── Olayları logla
```

---

## 9. GÜVENLİK PRENSİPLERİ

1. **Fail-safe** — AI yanılırsa, güvenli duruma dön
2. **Audit trail** — Her aksiyon loglanır, geri alınabilir
3. **Rate limiting** — AI'ın kendisi de rate limit'e tabi
4. **Sandbox** — Tehlikeli aksiyonlar sandbox'ta test edilir
5. **Human override** — İnsan her zaman devralabilir
6. **Rollback** — Her aksiyon geri alınabilir şekilde tasarlanır
7. **Transparency** — Dashboard'da tüm aksiyonlar görünür

---

## 10. UYGULAMA SIRASI

### Faz 1 — Temel (Hafta 1)
- [ ] Veritabanı tabloları (ai_events, risk_scores, ai_actions, ai_blocklist, ai_config)
- [ ] Temel izleme motoru (sistem + webhook sağlık)
- [ ] Risk skorlama sistemi
- [ ] Event logging

### Faz 2 — Savunma (Hafta 2)
- [ ] Saldırı tespiti
- [ ] Dinamik rate limiting
- [ ] IP engelleme
- [ ] Circuit breaker

### Faz 3 — Otonom Fix (Hafta 3)
- [ ] Self-healing aksiyonları
- [ ] Retry policy otomatik ayarlama
- [ ] Performans optimizasyonu
- [ ] Onay mekanizması

### Faz 4 — Dashboard (Hafta 4)
- [ ] AI Merkezi paneli (/dashboard/ai-center)
- [ ] Risk haritası
- [ ] Olay akışı (WebSocket)
- [ ] Bildirim sistemi (email, Slack)

### Faz 5 — İleri Seviye (Hafta 5+)
- [ ] ML tabanlı anomali tespiti
- [ ] Tahmine dayalı bakım
- [ ] Otomatik kapasite planlama
- [ ] Rapor oluşturma
