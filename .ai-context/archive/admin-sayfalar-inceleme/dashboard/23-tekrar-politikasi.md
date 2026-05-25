# 🔄 Tekrar Politikası (Retry Policy)

> Sayfa: `dashboard/src/app/[locale]/dashboard/retry-policy/page.tsx`
> Route: `/dashboard/retry-policy`
> İnceleme Tarihi: 2026-05-12

## Sayfa Yapısı
- RetrySettingsCard — Max attempts, initial delay, max delay
- DeadLetterQueueCard — Dead letter queue ayarları
- StatusCodesCard — Retry edilecek HTTP status kodları
- DelayPreviewCard — Gecikme önizleme (exponential backoff)

### GlobalRetryPolicy
- default_max_attempts, default_initial_delay_secs, default_max_delay_secs
- multiplier, retryable_status_codes

## Özellikler
- ✅ Max attempts ayarı
- ✅ Initial/max delay ayarı
- ✅ Multiplier (exponential backoff)
- ✅ Retryable status codes
- ✅ Dead letter queue
- ✅ Delay preview (gecikme önizleme)
- ✅ Bileşenlere ayrılmış yapı

## Tespit Edilen Durumlar
### ⚠️ Potansiyel Sorunlar
- **Veri dönüşümü** — API'den endpoint verisi çekiliyor, policy formatına dönüştürülüyor
- **Endpoint bazlı policy yok** — Global policy

### 🔴 Eksiklikler
- Endpoint bazlı retry policy
- Retry geçmişi (kaç retry yapıldı)
- Dead letter queue item listesi
- Retry test butonu
