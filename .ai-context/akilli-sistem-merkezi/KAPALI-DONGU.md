# 🔄 Kapalı Döngü Sistemi (Closed Feedback Loop)

> Oluşturma: 2026-05-20

---

## Nedir?

Kapalı döngü, sistemin yaptığı her aksiyonun sonucunu ölçüp bir sonraki kararına dahil etmesidir. Bu, sistemi "otomatik"den "otonom"a geçirir.

```
Gözle → Karar Ver → Uygula → Ölç → Öğren → Tekrarla
  ↑                                              │
  └──────────────────────────────────────────────┘
```

---

## Örnek Senaryo: Yavaşlayan Endpoint

### ADIM 1 — GÖZLE (Signal Collector)

```
14:00 — Latency: 230ms (normal)
14:05 — Latency: 450ms (↑%96)
14:10 — Latency: 890ms (↑%287)
14:15 — Latency: 1200ms (↑%422)

Sinyal: "Latency trendi pozitif, hızla artıyor"
```

### ADIM 2 — KARAR (Predictive Engine)

```
Bu endpoint'in normal p95 latency'si: 890ms
Şu anki latency: 1200ms (p95'in %135 üstünde)
Son 15 dakikadaki artış hızı: +%96/dk
Tahmin: 14:30'da 5000ms'e ulaşacak

Karar: "Bu endpoint 15 dakika içinde fail olacak"
```

### ADIM 3 — UYGULA (Self-Healing Engine)

```
Aksiyon 1: Retry bekleme süresini 2x artır
Aksiyon 2: Circuit breaker eşik değerini 3'e düşür (5'ten)
Aksiyon 3: Müşteriye bildirim gönder
  └─ "⚠️ payment-webhook endpoint'iniz yavaşlıyor.
     Normal: 230ms, Şu an: 1200ms.
     Sunucunuzu kontrol edin."
Aksiyon 4: Fallback URL varsa, trafiği oraya yönlendir
```

### ADIM 4 — ÖLÇ (Feedback)

```
14:20 — Müşteri bildirimi gördü, sunucuyu restart etti
14:22 — Latency: 340ms (normale döndü)

Sistem kaydetti: "Bu endpoint için latency eşiği 890ms,
artış hızı kritik eşiği %96/dk"
```

### ADIM 5 — ÖĞREN (Profile Update)

```
endpoint_profiles güncellendi:
  latency_p95: 890ms → 920ms (son olay dahil)
  alert_threshold: 890ms × 1.3 = 1157ms (yeni eşik)
  recovery_pattern: "Müşteri 5 dakika içinde müdahale etti"

Bir sonraki sefer: 1157ms'de alert gönder (daha erken)
```

---

## Kapalı Döngünün 4 Bileşeni (Confluent Modeli)

### 1. Continuous Data Ingestion (Sürekli Veri Akışı)

- Polling yok, event-driven
- Her delivery anında yakalanır
- PostgreSQL trigger veya Redis Streams ile

### 2. Real-Time Processing + Context (Bağlam Oluşturma)

- Ham veri + geçmiş veri = anlamlı sinyal
- "Latency 1200ms" tek başına anlamsız
- "Latency 1200ms + normal 230ms + %422 artış" = anlamlı

### 3. Decision Logic (Karar Mantığı)

- Deterministik: "If latency > p95 * 1.5 then alert"
- Probabilistik: "Bu endpoint'in fail olma olasılığı %73"
- Kurallar + istatistik birlikte

### 4. Automated Execution + Feedback (Aksiyon + Geri Bildirim)

- Aksiyon uygula
- Sonucu ölç
- Sonucu profile'a yaz
- Bir sonraki kararda kullan

---

## Öğrenme Döngüsü

```
Hafta 1: Sistem bilmiyor → Varsayılan kurallar (5 fail → circuit aç)
         ↓ Her olaydan öğrenir
Hafta 2: "Bu endpoint 3 fail'den sonra düzeliyor" → Eşik 3'e düşer
         ↓ Daha fazla veri toplar
Hafta 3: "Bu endpoint gece 3'te bakım yapıyor" → O saatteki alert'i filtreler
         ↓ Pattern'ları tanır
Hafta 4: "Bu endpoint'in sunucusu her Pazartesi yavaşlıyor" → Önceden hazırlık
         ↓ Uzmanlaşır
Ay 2:    Her endpoint için farklı, optimize edilmiş kurallar
```

---

## Geri Bildirim Türleri

### Pozitif Geri Bildirim (Başarı)

```
Aksiyon: Retry bekleme süresini artır
Sonuç: Başarı oranı arttı
Öğrenme: "Bu endpoint için daha uzun bekle daha iyi"
```

### Negatif Geri Bildirim (Başarısızlık)

```
Aksiyon: Circuit breaker'ı aç
Sonuç: Endpoint hâlâ fail (sorun endpoint'te değil, network'te)
Öğrenme: "Bu durumda circuit breaker işe yaramıyor, farklı aksiyon gerek"
```

### Nötr Geri Bildirim (Etkisiz)

```
Aksiyon: Müşteriye bildirim gönder
Sonuç: Müşteri 2 saat sonra müdahale etti
Öğrenme: "Bu müşteri geç müdahale ediyor, otomatik aksiyon öncelikli olsun"
```

---

## HookSniff İçin Kapalı Döngü Akışı

```
Her delivery:
  1. delivery_signals'a yaz (sinyal)
  2. endpoint_profiles'dan "normal" değerleri al (bağlam)
  3. Anomali skoru hesapla (karar)
  4. Eğer skor > 70:
     a. healing_actions'a yaz (aksiyon)
     b. Müşteriye bildirim gönder
     c. Otomatik aksiyon uygula
  5. 15 dakika sonra:
     a. Durumu tekrar kontrol et (ölç)
     b. endpoint_profiles güncelle (öğren)
     c. Bir sonraki kararda bu bilgiyi kullan
```
