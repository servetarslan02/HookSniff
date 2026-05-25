# 🧠 API Hızlandırma — Hafıza

> **Son güncelleme:** 2026-05-26
> **Bu dosya:** Proje geçmişi, kararlar, öğrenilen dersler

---

## 📋 Proje Özeti

**Hedef:** HookSniff API yanıt süresini minimuma indirmek.
- Mevcut: ~50-200ms (webhook kabul, 7-10 DB sorgusu)
- Hedef: < 10ms (0-1 DB sorgusu)
- Ek maliyet: $0 (mevcut Upstash Redis)

---

## 🔑 Alınan Kararlar

### Karar 1: Çift Katmanlı Cache (In-Memory + Redis)
- **Tarih:** 2026-05-26
- **Sebep:** In-memory en hızlı (~0.01ms) ama multi-instance'da tutarsız. Redis paylaşımlı (~0.5ms).
- **Çözüm:** Katman 1 in-memory (10s TTL), Katman 2 Redis (60s TTL), Katman 3 PG (fallback)

### Karar 2: Rate Limiting Redis'e Taşınmalı
- **Tarih:** 2026-05-26
- **Sebep:** Cloud Run multi-instance'da in-memory rate limiter her instance ayrı sayac tutar
- **Çözüm:** Redis Lua script ile atomik token bucket, feature flag ile geçiş

### Karar 3: Plan Limiti Cache (Redis)
- **Tarih:** 2026-05-26
- **Sebep:** Her webhook isteğinde plan limiti DB'den kontrol ediliyor (~10ms)
- **Çözüm:** Redis cache (60s TTL), plan değişikliği → 1 dk içinde güncellenir

### Karar 4: Connection Pool Artırımı
- **Tarih:** 2026-05-26
- **Sebep:** max_connections: 20, yüksek trafikte yetersiz olabilir
- **Çözüm:** 30'a çıkar, min_connections: 5'e çıkar

### Karar 5: Response Compression
- **Tarih:** 2026-05-26
- **Sebep:** 10KB JSON response doğrudan gönderiliyor, bandwidth israfı
- **Çözüm:** Tower CompressionLayer, gzip, ~%80 azalma

### Karar 6: Cold Start → Minimum Instance
- **Tarih:** 2026-05-26
- **Sebep:** Cloud Run'da container uykudan uyandığında 1-5s gecikme
- **Çözüm:** minScale: "1", warm-up health check

---

## ⚠️ Kritik Uyarılar

1. **Cache invalidation:** Kullanıcı plan değiştirdiğinde cache nasıl temizlenecek? → Redis key silme + TTL
2. **Rate limit Redis down:** Redis yoksa in-memory fallback'e dönülmeli
3. **Auth cache tutarsızlığı:** In-memory 10s TTL, Redis 60s → kısa pencerede tutarsızlık olabilir
4. **Compression CPU overhead:** gzip CPU kullanır, Cloud Run'da CPU limiti var
5. **simd-json opsiyonel:** Önce diğer optimizasyonları yap, sonra benchmark et

---

## 📁 Dosya Yapısı

```
api-hizlandirma-projesi/
├── UYGULAMA-PLANI.md    ← TÜM PLAN TEK BELDE (7 faz, 13 bölüm)
├── MEMORY.md            ← Bu dosya (hafıza)
├── NEXT_SESSION.md      ← Sonraki oturum rehberi
└── README.md            ← Klasör rehberi
```

---

## 📊 İlerleme Takibi

| Faz | Durum | Tarih | Not |
|-----|-------|-------|-----|
| Faz 1: Auth Middleware | ⏳ Bekliyor | — | En kritik faz |
| Faz 2: Rate Limiting → Redis | ⏳ Bekliyor | — | |
| Faz 3: Plan Limiti Cache | ⏳ Bekliyor | — | |
| Faz 4: Connection Pool Tuning | ⏳ Bekliyor | — | |
| Faz 5: Response Compression | ⏳ Bekliyor | — | |
| Faz 6: JSON Serialization | ⏳ Bekliyor | — | Opsiyonel |
| Faz 7: Cold Start | ⏳ Bekliyor | — | |

---

*Bu dosya her oturumda güncellenir.*
