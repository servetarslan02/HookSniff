# 🔧 Yapılandırma Notları

Bu dosya sistemi aktif hale getirmek için yapman gerekenleri listeler.

---

## 1. API Key'ler (ZORUNLU DEĞİL — ama güçlü AI için önerilir)

### MiMo API Key
- **Ne için:** Log analizi, anomali tespiti, güvenlik tehdidi analizi
- **Nereden alınır:** https://mimo.xiaomi.com
- **Ortam değişkeni:** `MIMO_API_KEY`
- **Maliyet:** Ücretsiz/ücretli planlar mevcut

### OpenAI API Key
- **Ne için:** Kod inceleme, otomatik fix önerisi, doğal dil komutları
- **Nereden alınır:** https://platform.openai.com/api-keys
- **Ortam değişkeni:** `OPENAI_API_KEY`
- **Maliyet:** ~$0.15/1M token (gpt-4o-mini)
- **Önerilen model:** gpt-4o-mini (ucuz ve yeterli)

### Her ikisi de opsiyonel
- İkisi de yoksa → Kural tabanlı analiz çalışır (eşik tabanlı, matematiksel)
- Biri varsa → O kullanılır
- İkisi de varsa → MiMo log analizi, OpenAI kod inceleme için tercih edilir

---

## 2. Veritabanı

### Mevcut
- PostgreSQL / CockroachDB zaten yapılandırılmış
- `DATABASE_URL` ortam değişkeni tanımlı

### AI Center Tabloları (otomatik oluşur)
- `ai_events` — AI olay kayıtları
- `risk_scores` — Risk skor geçmişi
- `ai_actions` — Aksiyon kayıtları (onay/red/geri alma)
- `ai_blocklist` — IP/müşteri/endpoint engelleme listesi
- `ai_config` — AI yapılandırma

---

## 3. Servisler

### Mevcut Servisler
| Servis | Port | Durum |
|--------|------|-------|
| API (Axum) | 3000 | ✅ Çalışıyor |
| Worker (Kafka consumer) | - | ✅ Çalışıyor |
| Dashboard (Next.js) | 3001 | ✅ Çalışıyor |

### Yeni Eklenen
| Servis | Port | Durum |
|--------|------|-------|
| AI Center | - | ✅ Eklendi (30sn döngü) |

### AI Center Ne Yapıyor (her 30 saniye)
1. Sistem metriklerini topla (CPU, RAM, disk)
2. Webhook sağlık durumunu kontrol et
3. Risk skorlarını hesapla (0-100)
4. Saldırı taraması (DDoS, spam, injection)
5. Otomatik fix (circuit breaker, retry ayarlama)
6. **EĞER AI API key varsa:** AI ile derin analiz yap

---

## 4. Docker / Kubernetes

### Docker Compose ile Çalıştırma
```bash
# .env dosyasını oluştur
cp .env.example .env
# API key'leri düzenle
nano .env

# Tüm servisleri başlat
docker-compose up -d

# AI Center'ı ayrı başlat
docker-compose -f docker-compose.ai.yml up -d
```

### Kubernetes ile Deploy
```bash
# Secret'ları oluştur (API key'ler dahil)
kubectl apply -f k8s/secrets.yaml

# Tüm servisleri deploy et
kubectl apply -f k8s/
```

---

## 5. Dashboard

### AI Merkezi Paneli
- URL: `http://localhost:3001/dashboard/ai-center`
- Özellikler:
  - Durum kartları (aktif olaylar, kritik, risk skoru)
  - Olay tablosu (tüm AI olayları)
  - Risk skorları (endpoint bazlı)
  - Aksiyon yönetimi (onayla/reddet/geri al)
  - Engelleme listesi

---

## 6. API Endpoints (AI Center)

### Durum
```
GET /v1/ai/status
```

### Olaylar
```
GET /v1/ai/events?severity=critical&limit=50
```

### Risk Skorları
```
GET /v1/ai/risks
```

### Aksiyonlar
```
GET /v1/ai/actions
POST /v1/ai/actions/{id}/approve
POST /v1/ai/actions/{id}/reject
POST /v1/ai/actions/{id}/rollback
```

### Engelleme Listesi
```
GET /v1/ai/blocklist
POST /v1/ai/blocklist
DELETE /v1/ai/blocklist/{id}
```

---

## 7. Otonom Davranış Tablosı

| Durum | AI Aksiyonu | İnsan Gerekli mi? |
|-------|-------------|-------------------|
| CPU > %80 | Olay logla | ❌ |
| CPU > %95 | Kritik olay + bildirim | ❌ |
| Hata oranı > %20 | Retry policy artır | ❌ |
| Hata oranı > %50 | Circuit break | ❌ |
| DDoS spike tespiti | Rate limit sıkılaştır | ❌ |
| Payload injection | İsteği reddet + logla | ❌ |
| Risk skoru > 80 | **Sadece bildirim gönder** | ✅ |
| Manuel müdahale | Aksiyon kuyruğuna al | ✅ |

---

## 8. Gelecek Planlar (Henüz Eklenmedi)

- [ ] ML tabanlı anomali tespiti (scikit-learn, TensorFlow)
- [ ] Webhook trafik tahmini (time series forecasting)
- [ ] Otomatik kapasite planlama
- [ ] Email/Slack/Discord bildirimleri
- [ ] Rapor oluşturu (PDF/HTML)
- [ ] Multi-region AI koordinasyonu

---

## 9. Sorun Giderme

### AI Center çalışmıyor
```bash
# Logları kontrol et
docker logs hookrelay-ai-center

# Veritabanı bağlantısını test et
psql $DATABASE_URL -c "SELECT 1"
```

### API key çalışmıyor
```bash
# MiMo test
curl -H "Authorization: Bearer $MIMO_API_KEY" https://api.mimo.xiaomi.com/v1/models

# OpenAI test
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
```

### Risk skorları çok yüksek
- Endpoint'in retry policy'sini kontrol et
- Hedef endpoint'in çalışıp çalışmadığını kontrol et
- Dead letter queue'yu incele
