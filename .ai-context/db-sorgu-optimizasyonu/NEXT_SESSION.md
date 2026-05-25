# 📋 Sonraki Oturum Rehberi — DB Sorgu Optimizasyonu

> **Son güncelleme:** 2026-05-26

## 🚀 Hızlı Başlangıç

```bash
cd /root/.openclaw/workspace/HookSniff && git pull origin main
cat .ai-context/db-sorgu-optimizasyonu/NEXT_SESSION.md
cat .ai-context/db-sorgu-optimizasyonu/UYGULAMA-PLANI.md
```

## 📍 Sıradaki Adım: FAZ 1 — Slow Query Log

| # | Adım | Dosya | Açıklama |
|---|------|-------|----------|
| 1 | Neon dashboard | Neon UI | Query Log aç (threshold: 100ms) |
| 2 | Query timing wrapper | `api/src/db.rs` | timed_query fonksiyonu |
| 3 | pg_stat_statements | Neon SQL | En yavaş sorguları listele |
| 4 | Grafana metric | `api/src/metrics.rs` | SLOW_QUERY_COUNT |
