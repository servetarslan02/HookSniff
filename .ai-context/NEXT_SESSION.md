# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-20 04:10 GMT+8

## ✅ Tamamlanan (Bu Oturum — Alert Evaluation Worker)

### 1. Alert Evaluation Worker (KRİTİK — Item 254)
- ✅ Migration 078: `alert_history` tablosu + `last_triggered_at`, `webhook_url`, `cooldown_minutes` kolonları
- ✅ `api/src/jobs/alert_eval.rs` — Background worker (her 5 dk)
  - `failure_rate`: Son 30 dk'da failed/total * 100
  - `latency`: Son 30 dk'da avg(duration_ms)
  - `consecutive_failures`: endpoint.failure_streak max
  - 15 dk cooldown (alert storms engeli)
  - 3 kanal: email (Resend), slack (webhook), operational webhook
  - In-app notification + alert_history log
- ✅ `jobs/mod.rs` — modül kaydı
- ✅ `main.rs` — background task spawn (5 dk interval, distributed lock)

### 2. Revenue Export Report Açıklaması
- Admin → Revenue sayfasındaki "Export Report" butonu → son 12 aylık gelir CSV'si

### 3. Fatura/Ödeme Görüntüleme
- Admin → Users → [Kullanıcı] → Billing sekmesi (invoices, payments, refunds)
- Admin → Revenue → genel gelir özeti

## 📋 Sıradaki

### 1. Deploy
- Migration 078'i Neon DB'ye uygula (`node run-migrations.js`)
- Cloud Build ile API deploy (alert_eval worker dahil)
- Vercel otomatik deploy (dashboard değişiklik yok)

### 2. communication_history Tablosu
- Bulk email iletişim loglaması için gerekli
- Şu an eksik, `let _ =` ile sessizce geçiliyor

### 3. P2 Kalan Sorunlar
- SSO state → Redis
- OIDC JWKS imza doğrulaması
- Verified domain TXT record verification
