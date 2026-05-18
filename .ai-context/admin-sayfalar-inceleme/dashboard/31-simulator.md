# 🧪 Simülatör (Simulator)

> Sayfa: ❌ OLUŞTURULMALI
> Route: `/dashboard/simulator`
> Backend: `api/src/routes/simulator.rs` — mevcut
> İnceleme Tarihi: 2026-05-13

## Backend Durumu

### Mevcut Endpoint'ler
| Method | Route | Açıklama |
|--------|-------|----------|
| POST | `/v1/simulator` | Webhook simülasyonu çalıştır |

## Frontend Yapılacaklar

### Sayfa Yapısı
1. **Senaryo Seçici** — Önceden tanımlı senaryolar
   - Order created, payment completed, user registered, custom
2. **Endpoint Seçici** — Hedef endpoint seçimi
3. **Payload Editor** — JSON textarea (senaryo ile dolu)
4. **Gönder Butonu** — Simülasyonu çalıştır
5. **Sonuç Paneli** — Teslimat sonucu, response code, latency, attempts

### Sidebar Ekleme
```typescript
// sections.tools.items'a ekle (playground'un yanına):
{ name: t('simulator'), href: '/simulator', icon: '🧪' }
```

### i18n Anahtarları (EN + TR)
- simulator, simulatorDesc, runSimulation, simulationResult, scenario, selectScenario
- deliverySuccessful, deliveryFailed, responseTime, attempts

### Playground'tan Farkı
- Playground: Manuel API çağrısı (herhangi bir endpoint)
- Simulator: Webhook delivery simülasyonu (gerçek delivery akışı)

### Öncelik: 🟡 YÜKSEK — Müşteri webhook akışını test edebilmeli
