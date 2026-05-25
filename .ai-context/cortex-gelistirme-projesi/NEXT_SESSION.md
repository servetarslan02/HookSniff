# 📋 Sonraki Oturum Rehberi — Cortex Geliştirme

> **Son güncelleme:** 2026-05-26

## 🚀 Hızlı Başlangıç

```bash
cd /root/.openclaw/workspace/HookSniff && git pull origin main
cat .ai-context/cortex-gelistirme-projesi/NEXT_SESSION.md
cat .ai-context/cortex-gelistirme-projesi/UYGULAMA-PLANI.md
```

## 📍 Sıradaki Adım: FAZ 1 — Concept Drift Detection

| # | Adım | Dosya | Açıklama |
|---|------|-------|----------|
| 1 | drift_detection.rs | `api/src/cortex/ml/drift_detection.rs` | YENİ — Page-Hinkley + ADWIN + KS testi |
| 2 | drift_handler.rs | `api/src/cortex/ml/drift_handler.rs` | YENİ — Drift sonrası otomatik yeniden eğitim |
| 3 | Scheduler | `api/src/cortex/scheduler.rs` | DriftDetection stage ekle |
| 4 | Migration | `migrations/` | ml_drift_events tablosu |
| 5 | Metrics | `api/src/cortex/metrics.rs` | DRIFT_EVENTS, DRIFT_RETRAINS |
| 6 | Test | — | `cargo check && cargo test` |
