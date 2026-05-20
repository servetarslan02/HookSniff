# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-21 01:00 GMT+8

## ✅ Yapılan İşler (Bu Oturum)

### 1. GCP Cloud Build Path Filter
- Cloud Build trigger'a `includedFiles` filtrosi eklendi
- Sadece `api/**`, `worker/**`, `common/**`, `Dockerfile.*`, `cloudbuild.yaml`, `Cargo.*` değişirse deploy olur
- Dashboard/docs/SDK değişiklikleri deploy tetiklemez
- Commit: trigger update via gcloud API

### 2. Sağlık Sayfası Zaman Aralığı
- **Sorun:** Sağlık sayfası son 24 saatte delivery yoksa hep sıfır gösteriyordu
- **Çözüm:** 24h/7d/30d/90d zaman aralığı seçici eklendi
- Varsayılan: 7 gün
- API: `?range=7d` query parametresi eklendi
- Dashboard: toggle butonları (24s/7g/30g/90g)
- Commit: `fde61846`

### 3. Değişen Dosyalar
- `api/src/routes/health_endpoints.rs` — range parametresi, dinamik SQL interval
- `dashboard/src/app/[locale]/(dashboard)/health/page.tsx` — zaman aralığı seçici
- `dashboard/src/hooks/useDashboardData.ts` — range parametre geçişi
- `dashboard/src/lib/api.ts` — range query string

## Sıradaki
1. Vercel deploy sorununu çöz (son 3 commit FAILED)
2. Build başarılı olursa gerçek yükleme sürelerini ölç
3. Kalan 20 sayfaya dynamic import uygula
