# 2026-05-20 — Alert Evaluation Worker

## Yapılanlar

### Alert Evaluation Worker (Item 254 — KRİTİK)
- `migrations/078_alert_eval_worker.sql` — alert_history tablosu + yeni kolonlar
- `api/src/jobs/alert_eval.rs` — Background worker
- `jobs/mod.rs` — modül kaydı
- `main.rs` — background task spawn

### Worker Detayları
- **Sıklık:** Her 5 dakika
- **Koşullar:** failure_rate (%), latency (ms), consecutive_failures (count)
- **Kanallar:** email (Resend), slack (incoming webhook), operational webhook
- **Cooldown:** 15 dakika (alert storms engeli)
- **Pencere:** Son 30 dakika
- **Log:** alert_history tablosu + in-app notification

### Diğer
- Revenue Export Report açıklandı (CSV indirme)
- Admin fatura/ödeme görüntüleme açıklandı
