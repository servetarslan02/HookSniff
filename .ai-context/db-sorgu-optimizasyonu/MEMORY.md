# 🧠 DB Sorgu Optimizasyonu — Hafıza

> **Son güncelleme:** 2026-05-26

## Kararlar

### Karar 1: Önce Ölç, Sonra Optimize Et
- Slow query log aç → en yavaş sorguları tespit et → onları optimize et

### Karar 2: Index Stratejisi
- pg_stat_statements ile en çok kullanılan sorguları bul
- EXPLAIN ANALYZE ile index kullanımını doğrula
- CONCURRENTLY ile index oluştur (table lock yok)

### Karar 3: N+1 Tespiti
- Tek tek sorgu yerine toplu sorgu (IN, ANY)

### Karar 4: ANALYZE Düzenli Çalıştır
- Query planner doğru tahmin yapsın

## İlerleme

| Faz | Durum |
|-----|-------|
| Faz 1: Slow Query Log | ⏳ |
| Faz 2: Index Optimizasyonu | ⏳ |
| Faz 3: N+1 Tespiti | ⏳ |
| Faz 4: Query Plan Analizi | ⏳ |
| Faz 5: Pool & Prepared | ⏳ |
