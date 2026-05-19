# 🔍 Rakip Analizi — Akıllı Sistem Karşılaştırması

> Oluşturma: 2026-05-20
> Kaynak: Svix docs, Hookdeck blog, Confluent blog, Stripe engineering blog

---

## Rakip Özet Tablosu

| Özellik | Svix | Hookdeck | Hook0 | Hook Mesh | HookSniff (Mevcut) | HookSniff (Hedef) |
|---------|------|----------|-------|-----------|--------------------|--------------------|
| **Zeka Seviyesi** | ⚪ Orta | 🟢 Yüksek | ⚪ Düşük | ⚪ Düşük | ⚪ Orta | 🟢🟢 Ultra |
| Auto-disable | ✅ 5 gün | ❌ | ❌ | ❌ | ❌ | ✅ Adaptif |
| Recovery test | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Retry | ✅ Sabit | ✅ Sabit | ✅ Sabit | ✅ Sabit | ✅ Sabit | ✅ Adaptif |
| Rate limiting | ✅ Sabit | ✅ Per-tenant | ❌ | ❌ | ✅ Adaptif | ✅ Adaptif |
| Anomaly detection | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ 0-100 skor |
| Failure prediction | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Haftalık rapor | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Customer health | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Cascade prevention | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Recovery surge | ❌ | ✅ | ❌ | ❌ | ❌ | ✅ |
| Smart routing | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Recommendations | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Feedback loop | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Svix — Pazar Lideri ($35M Yatırım)

### Ne Yapıyor?
- **Otomatik endpoint disable:** 5 gün üst üste tüm attempt'ler başarısızsa → endpoint kapatılır
- **Operational webhooks:** endpoint.disabled, message.attempt.exhausted event'leri
- **Email notifications:** Endpoint disable olunca müşteriye whitelabel email
- **Retry takvimi:** 0sn → 5sn → 5dk → 30dk → 2sa → 5sa → 10sa → 10sa
- **FIFO delivery:** Sıralı teslimat
- **Connectors:** Webhook'ları 3. parti servislere yönlendirme

### Ne Yapmıyor?
- ❌ Adaptif eşikler (sabit 5 gün kuralı)
- ❌ Anomali tespiti
- ❌ Failure prediction
- ❌ Haftalık rapor
- ❌ Customer health score
- ❌ Geri bildirim döngüsü

### HookSniff'ten Farkı
- Svix daha olgun, daha fazla müşteri
- Ama akıllı sistem açısından eşit veya geride

---

## Hookdeck — En Akıllı Rakip

### Ne Yapıyor?
- **Recovery Surge Protection:** Trafik spike olduğunda otomatik throttling
- **Durable queue:** Webhook'lar queue'da kalıcı, endpoint down olsa bile kaybolmaz
- **Radar:** Shopify/GitHub gibi sağlayıcıların webhook gecikmesini gerçek zamanlı izler
- **Per-tenant rate limiting:** Her müşteri için ayrı rate limit
- **Backpressure:** Tüketici hızına göre otomatik throttling
- **Idempotency enforcement:** Tekrarlanan webhook'ları otomatik filtreler

### Ne Yapmıyor?
- ❌ ML-based retry (sabit exponential backoff)
- ❌ Failure prediction
- ❌ Haftalık rapor
- ❌ Customer health score
- ❌ Self-learning (sabit kurallar)

### HookSniff'ten Farkı
- Hookdeck'in "Recovery Surge" pattern'i çok akıllıca
- Ama HookSniff hedeflediğimiz seviyeye çıkarsa geçebiliriz

---

## Stripe — Smart Retries (Referans)

### Ne Yapıyor?
- **500+ özellik** ile ML modeli
- **Ensemble model:** XGBoost + Sentence Transformers + Auto-ML
- **Multimodal data:** Text + numerical verileri birleştirir
- **Sonuç:** Her $1 harcama için $9 gelir kurtarılıyor

### HookSniff'e Uyarlanabilir Mi?
- Evet, ama basitleştirilmiş versiyonu
- 500+ özellik yerine 12 sinyal
- ML modeli yerine istatistiksel kurallar
- Yine de etkili olabilir

---

## Confluent — Autonomous Data Systems (Referans)

### Ne Yapıyor?
- **4 bileşenli kapalı döngü:** Ingestion → Context → Decision → Feedback
- **Event-driven:** Polling yok, her olay anında yakalanır
- **Self-correcting:** Her aksiyonun sonucu ölçülür, sistem kendini düzeltir

### HookSniff'e Uyarlanabilir Mi?
- Evet, bu tam olarak hedeflediğimiz mimari
- PostgreSQL + Redis ile implementasyon mümkün

---

## Netflix — Self-Healing (Referans)

### Ne Yapıyor?
- **Chaos Monkey:** Rastgele sunucuları öldürür, dayanıklılığı test eder
- **Automated rollback:** Sorunlu deploy otomatik geri alınır
- **Predictive scaling:** Trafik patern'ını öğrenir, patlama önce ölçeklenir

### HookSniff'e Uyarlanabilir Mi?
- Chaos Monkey → HookSniff için aşırı
- Automated rollback → Vercel/Cloud Build'de zaten var
- Predictive scaling → Capacity forecast ile uyarlanabilir

---

## Datadog — Adaptive Thresholds (Referans)

### Ne Yapıyor?
- **Sabit eşik yok:** Sistem "normal" olanı öğrenir
- **Anomaly detection:** Standart sapma ile normal bölgeyi belirler
- **Alert correlation:** 100 alert'in kaçı aynı kök neden?

### HookSniff'e Uyarlanabilir Mi?
- Evet, bu tam olarak Anomaly Scoring katmanımız
- PostgreSQL aggregation ile implementasyon mümkün

---

## Sonuç: HookSniff Nerede Olacak?

| Katman | Rakipler | HookSniff Hedef |
|--------|----------|-----------------|
| Temel delivery | ✅ Hepsi | ✅ Zaten var |
| Retry + circuit breaker | ✅ Hepsi | ✅ Zaten var |
| Auto-disable | ✅ Svix | ✅ Daha akıllı |
| Recovery surge | ✅ Hookdeck | ✅ Eşit |
| Anomaly detection | ❌ Hiçbiri | ✅ Üstün |
| Failure prediction | ❌ Hiçbiri | ✅ Üstün |
| Haftalık rapor | ❌ Hiçbiri | ✅ Üstün |
| Customer health | ❌ Hiçbiri | ✅ Üstün |
| Feedback loop | ❌ Hiçbiri | ✅ Üstün |
| Smart routing | ❌ Hiçbiri | ✅ Üstün |

**Hedef: Rakiplerin yapmadığı şeyleri yaparak fark yarat.**
