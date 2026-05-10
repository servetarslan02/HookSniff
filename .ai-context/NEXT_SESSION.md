# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 06:54 GMT+8

---

## ✅ Tüm Dış Servisler Tamamlandı (Oturum 102 + 103)

| Servis | Durum | Detay |
|--------|-------|-------|
| Vercel Analytics | ✅ Aktif | Hobby plan, 50K events/ay |
| Vercel Speed Insights | ✅ Kod eklendi | Deploy yarın otomatik olur |
| Grafana Alerts | ✅ Aktif | 7 rule + email → servetarslan02@gmail.com |
| Polar.sh Checkout | ✅ Link hazır | Pro $49/mo, 1 ay free trial |
| Neon Backup | ✅ Cron aktif | Her gün 03:00 UTC, 30 gün retention |
| Resend | ✅ Entegre | EmailProvider: Resend → GCloud fallback |
| Git Email | ✅ Düzeltildi | servetarslan02@users.noreply.github.com |

---

## 📋 Yapılacaklar (Sıralı)

### 🔴 Yüksek Öncelik — Bir Sonraki Oturum

| # | Görev | Kim | Açıklama |
|---|-------|-----|----------|
| 1 | **Grafana OTEL trace debug** | AI | Auth düzeltildi (v5), endpoint doğru, direct test 200 ✅ ama API'den trace gitmiyor. Detaylı debug gerekli. |
| 2 | **Email adreslerini sil** | AI | `@hooksniff.vercel.app` adresleri çalışmıyor (MX kaydı yok). Contact form'a çevir. |

### 🟡 Orta Öncelik

| # | Görev | Kim | Açıklama |
|---|-------|-----|----------|
| 3 | **GitHub Actions workflow'ları** | AI + Servet | Token'da `workflow` scope'u yok. Servet'ten yeni token istenecek. |
| 4 | **Polar.sh identity verification** | Servet | Kimlik doğrulaması gerekli. Para almak için zorunlu. |

### 🟢 Düşük Öncelik — Lansman Sonrası

| # | Görev | Kim | Açıklama |
|---|-------|-----|----------|
| 5 | **db.rs test (HS-085)** | AI | Gerçek PostgreSQL gerekli (Neon test DB). |
| 6 | **SDK otomatik güncelleme (HS-090)** | AI | Lansman sonrası, detaylı araştırma gerekli. |

---

## 🔧 Grafana OTEL Durumu (Oturum 103)

### Yapılan
- Grafana org adı `hookrelay` (hooksniff değilmiş)
- OTLP endpoint: `https://otlp-gateway-prod-eu-west-2.grafana.net/otlp`
- Auth format: `Authorization=Basic base64(1625476:glc_...)`
- Yeni access policy token oluşturuldu: `hooksniff-otel`
- Cloud Run `otel-headers` secret v5 ile güncellendi
- Cloud Run revision 00057 deploy edildi

### Sonraki Adımlar
1. API'nin OTEL exporter'ının trace gönderip göndermediğini kontrol et (silent failure olabilir)
2. `opentelemetry-otlp` crate'inin `http-proto` feature'ı protobuf gönderir — Grafana JSON da kabul eder ama protobuf'u tercih eder
3. Batch exporter flush sorunu olabilir — `TracerGuard` drop'ta flush eder ama Cloud Run graceful shutdown'da yeterli zaman olmayabilir
4. Endpoint URL'inin `/v1/traces` suffix'iyle doğru oluştuğunu kontrol et

### Token Bilgileri
- Grafana API Key: `glsa_EvV4uYJF4e9oOdmVLXgJ6rqa6JkrQVG1_50d9e12f`
- Grafana OTLP Token: `glc_eyJvIjoiMTc1NzMzNSIsIm4iOiJob29rc25pZmYtaG9va3NuaWZmLW90ZWwiLCJrIjoiOHZuSDRNdlU0NTEzTkMzbGt3eDE0eDljIiwibSI6eyJyIjoidXMifX0=`
- Grafana Access Policy ID: `b6aea6c9-bd32-4a2d-9184-a3d2da591a8a`
- Instance ID: `1625476`
- Cloud Run SA: `/tmp/hooksniff-sa.json` (hooksniff-deploy@hooksniff-app.iam.gserviceaccount.com)
