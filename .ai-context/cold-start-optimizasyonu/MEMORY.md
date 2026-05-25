# 🧠 Cold Start Optimizasyonu — Hafıza

> **Son güncelleme:** 2026-05-26

## Kararlar

### Karar 1: minScale: 1
- Container her zaman 1+ instance çalışır → cold start tamamen ortadan kalkar
- Maliyet: $0 (idle state ücretsiz)

### Karar 2: Warm-up Health Check
- Her 30s'de DB ve Redis ping → bağlantılar sıcak kalır

### Karar 3: Binary Optimizasyonu
- strip + LTO + codegen-units=1 → boyut %30-50 azalma

## İlerleme

| Faz | Durum |
|-----|-------|
| Faz 1: Minimum Instance | ⏳ |
| Faz 2: Health Check Warm-up | ⏳ |
| Faz 3: Binary Optimizasyonu | ⏳ |
| Faz 4: Startup Monitoring | ⏳ |
