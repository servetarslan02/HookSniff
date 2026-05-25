# 🧠 Cortex Geliştirme — Hafıza

> **Son güncelleme:** 2026-05-26

## Kararlar

### Karar 1: Concept Drift Detection (Page-Hinkley + ADWIN + KS)
- Page-Hinkley: Ani değişimler için
- ADWIN: Kademeli değişimler için
- KS testi: Dağılım değişimi için
- Drift sonrası otomatik yeniden eğitim

### Karar 2: Model Monitoring (Accuracy + Precision + Recall + F1)
- Per-endpoint model sağlık kontrolü
- Grafana heatmap
- Alert: accuracy < 0.7 veya F1 < 0.6

### Karar 3: Explainable AI (Basitleştirilmiş SHAP)
- Feature contributions hesaplama
- İnsan tarafından okunabilir özet
- Dashboard entegrasyonu

### Karar 4: Feature Store (PostgreSQL + In-Memory Cache)
- Merkezi feature yönetimi
- Cache: in-memory (60s) + DB (1 saat)
- Feature tekrarı yok

### Karar 5: Model Versiyonlama (PostgreSQL)
- Her model versiyonu kaydediliyor
- Rollback tek komut
- Audit trail tam

### Karar 6: Enhanced Holt-Winters (Prophet alternatifi)
- Çoklu mevsimsellik
- Changepoint detection (CUSUM)
- Bayesian güven aralığı

### Karar 7: Chaos Engineering (Senaryo bazlı)
- Redis down, DB slow, endpoint down, traffic spike
- Otomatik test sonuçları
- Dikkatli kullanılmalı

### Karar 8: A/B Testing (Traffic split)
- Model karşılaştırması
- Rastgele seçim (split oranında)
- Kazanan otomatik belirleniyor

### Karar 9: AutoML (Bayesian Optimization)
- Search space tanımlı
- En iyi parametreler otomatik bulunuyor
- Her deneme kaydediliyor

## İlerleme

| Faz | Durum |
|-----|-------|
| Faz 1: Drift Detection | ⏳ |
| Faz 2: Model Monitoring | ⏳ |
| Faz 3: Explainable AI | ⏳ |
| Faz 4: Distributed Tracing | ⏳ |
| Faz 5: Feature Store | ⏳ |
| Faz 6: Model Versiyonlama | ⏳ |
| Faz 7: Advanced Forecasting | ⏳ |
| Faz 8: Chaos Engineering | ⏳ |
| Faz 9: A/B Testing | ⏳ |
| Faz 10: AutoML | ⏳ |
