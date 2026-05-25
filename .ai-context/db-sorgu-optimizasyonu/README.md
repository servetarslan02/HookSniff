# 🗄️ DB Sorgu Optimizasyonu

> **Hedef:** Tüm sorgular < 5ms | **Maliyet:** $0

## 📂 Dosyalar

| Dosya | İçerik |
|-------|--------|
| **`UYGULAMA-PLANI.md`** | 5 faz, SQL örnekleri, index stratejisi |
| **`NEXT_SESSION.md`** | Sonraki oturum rehberi |
| **`MEMORY.md`** | Kararlar |

## 📊 Fazlar

| Faz | Açıklama | Etki |
|-----|----------|------|
| 1 | Slow Query Log | Yavaş sorgular tespit |
| 2 | Index Optimizasyonu | Seq scan → Index scan |
| 3 | N+1 Tespiti | 101 sorgu → 1 sorgu |
| 4 | Query Plan Analizi | Planner doğru karar |
| 5 | Pool & Prepared | Bağlantı overhead |
