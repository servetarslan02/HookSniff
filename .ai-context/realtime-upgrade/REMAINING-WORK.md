# Real-Time Upgrade — Eksik İşler Listesi

> Son güncelleme: 2026-05-17 00:04 GMT+8

---

## ✅ TAMAMLANAN İŞLER (Kod)

### FAZ 1: React Query — ✅ %100
- [x] 35/35 sayfa React Query'de
- [x] TypeScript hataları düzeltildi

### FAZ 2: Event System — ✅ %100
- [x] auth.rs → UserCreated event
- [x] endpoints.rs → EndpointCreated/Updated/Deleted/StatusChanged
- [x] applications.rs → ApplicationCreated/Updated/Deleted

### FAZ 3: WebSocket — ✅ %100
- [x] Origin validation
- [x] Per-user connection limit
- [x] WS metrics (prometheus)

### FAZ 4: Entegrasyon — ✅ %100
- [x] useRealtime.ts
- [x] useDeliveryStream (SSE fallback + Live indicator)
- [x] Fallback polling (30sn)
- [x] Connection indicator

### FAZ 5: Optimizasyon — ✅ %100
- [x] Sentry DSN + OTLP entegrasyonu
- [x] Sentry test butonu (admin settings, dev-only)
- [x] ISR (revalidate=3600)
- [x] VirtualTable entegrasyonu (admin users + deliveries)
- [x] Image optimization (Next.js Image)
- [x] Code splitting (dynamic import)

### FAZ 6: Güvenlik — ✅ %100
- [x] Origin validation
- [x] k6 stress test scriptleri
- [x] ConnectionRateLimiter
- [x] Token refresh → WS reconnect
- [x] WS monitoring metrics

### SDK Dokümantasyon — ✅ %100
- [x] 10 Quick Start Guide (Python, Go, Rust, Ruby, Java, Kotlin, PHP, C#, Elixir, Swift)
- [x] Error Handling Guide
- [x] Pagination Guide

---

## 🔴 EKSİK — Deploy & Ayarlar (Manuel Gerekli)

| # | İş | Durum | Detay |
|---|-----|-------|-------|
| 1 | **Cloud Run API deploy** | ⏳ Bekliyor | cloudbuild.yaml güncellendi (Sentry OTLP) ama yeni build tetiklenmedi. GCP Console → Cloud Build → Triggers → Run |
| 2 | **Sentry auth token** | ⏳ Bekliyor | Mevcut token scope'ları yetersiz (403). Yeni token gerekli: `org:read`, `project:releases`, `project:write` |
| 3 | **Sentry alert rules** | ⏳ Bekliyor | Yeni hata bildirimi, yüksek hata oranı, performance regression. Token yenilendikten sonra API'den oluşturulabilir |
| 4 | **Sentry Vercel integration** | ⏳ Bekliyor | Sentry dashboard → Settings → Integrations → Vercel → Add Installation (OAuth flow, browser gerekli) |
| 5 | **Sentry team member** | ⏳ Bekliyor | servetarslan02@gmail.com eklenecek. Alert routing için gerekli |
| 6 | **Sentry release tracking** | ⏳ Bekliyor | Vercel integration bağlandıktan sonra otomatik çalışacak |

---

## 📊 Deploy Durumu

| Servis | Durum | Not |
|--------|-------|-----|
| Dashboard (Vercel) | ✅ Canlı | Son deploy 5dk önce, auto-deploy aktif |
| API (Cloud Run) | ⚠️ Eski versiyon | Yeni build tetiklenmedi |
| Sentry (Dashboard) | ✅ DSN aktif | Dashboard'da hata yakalıyor |
| Sentry (OTLP) | ⏳ Bekliyor | API yeniden deploy edilmeli |
| Secret Manager | ✅ Güncellendi | otel-headers + gcp-sa-json |

---

## 📝 Sonraki Adımlar (Öncelik Sırası)

1. Sentry auth token yeniden oluştur → bana gönder
2. GCP Console'da Cloud Build tetikle
3. Sentry alert rules oluştur (ben yaparım)
4. Sentry Vercel integration bağla (sen yap, OAuth)
