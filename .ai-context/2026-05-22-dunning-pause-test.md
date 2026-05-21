# 2026-05-22 — Dunning + Pause/Resume Test Sonuçları

## Test Edilen Sistemler
1. Dunning (pre-expiry email hatırlatma)
2. Pause/Resume (abonelik dondurma/aktifleştirme)
3. Cancel (abonelik iptal)

## Tespit Edilen ve Düzeltilen Buglar

### Bug 1: Resume endpoint INTERNAL_ERROR (KRİTİK)
- **Sorun:** `resume_subscription()` her zaman `checkout()` çağırıyordu
- Demo hesabının `polar_subscription_id`'si null → Polar API hatası → INTERNAL_ERROR
- **Çözüm:** Checkout kaldırıldı. Artık DB'de plan restore ediliyor:
  - `plan` = preserved plan
  - `webhook_limit` = plan limiti
  - `endpoint_limit` = plan limiti
  - `cancel_at_period_end` = false
  - `paused_at/paused_until/pause_plan` = NULL
- Dosya: `api/src/routes/billing/subscription.rs`

### Bug 2: activate_paused_subscriptions asla çalışmıyor (KRİTİK)
- **Sorun:** Job `paused_at IS NULL` kontrolü yapıyor
- Ama pause fonksiyonu zaten `paused_at = NOW()` set ediyor
- Koşul asla TRUE olmuyor → dönem sonunda müşteriler free'ye düşmüyor
- **Çözüm:** `paused_at IS NULL` yerine `plan != 'free'` kontrolü eklendi
- Dosya: `api/src/jobs/dunning.rs`

### Bug 3: Yıllık plan dunning email'i gönderilemiyor
- **Sorun:** Migration'da `CHECK (days_remaining BETWEEN 1 AND 7)`
- Yıllık planlarda `DUNNING_DAYS_ANNUAL = [30, 7, 3, 2, 1]` kullanılıyor
- Day 30 CHECK constraint'i aşıyor → INSERT hatası
- **Çözüm:** CHECK constraint `BETWEEN 1 AND 30` olarak değiştirildi
- Dosya: `migrations/072_dunning_system.sql`

## Test Sonuçları Tablosu

| Endpoint | Durum | Not |
|----------|-------|-----|
| GET /billing/subscription | ✅ | Status: paused doğru |
| POST /billing/pause | ✅ | "already paused" hatası doğru |
| POST /billing/resume | ✅ | Düzeltildi (önce INTERNAL_ERROR) |
| DELETE /billing/subscription | ✅ | "already scheduled" hatası doğru |
| Dunning job | ⚠️ | CHECK constraint migration gerekli |

## Sonraki Adımlar
- Migration 072 canlı DB'ye uygulanmalı (CHECK constraint fix)
- Resume endpoint deploy edilmeli
- activate_paused_subscriptions deploy edilmeli
