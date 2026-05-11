# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 15:35 GMT+8

---

## 🚨 KRİTİK BLOKLAR (Oturum 106)

### 1. GitHub Actions Billing — ACİL
- **Sorun:** "The job was not started because recent account payments have failed"
- **Etki:** Tüm CI/CD workflow'ları blok, deploy tetiklenemiyor
- **Çözüm:** GitHub Settings > Billing & plans > ödeme yöntemini güncelle
- **Link:** https://github.com/settings/billing

### 2. Cloud Run API Unavailable — ACİL
- **Sorun:** `api:latest` image'ı bozulmuş, son 3 revision (00059/00060/00061) startup timeout
- **Son çalışan:** Revision `hooksniff-api-00058-kq6` (8 saat önce, %100 traffic ama Unavailable)
- **Çözüm:** 00058'in image digest'ini bul, onunla yeni revision deploy et
- **Veya:** GitHub Actions billing'i düzelt, CI/CD otomatik deploy etsin

### 3. Grafana OTEL — Veri Yok
- **Durum:** Metrics: 6 series, Logs: 0 bytes, Traces: 0 bytes
- **Sebep:** API Unavailable olduğu için OTEL verisi gönderilemiyor
- **Çözüm:** API'yi çalıştır, OTEL otomatik başlayacak (env var'lar mevcut)

### 4. Grafana Trial — 10 Gün Kaldı
- **Deadline:** May 20, 2026
- **Çözüm:** Upgrade veya alternatif bul

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

### 🔴 Kritik — Servet'in Yapması Gereken

| # | Görev | Kim | Açıklama |
|---|-------|-----|----------|
| 1 | **Cloud Run OTEL endpoint güncelle** | Servet | `OTEL_EXPORTER_OTLP_ENDPOINT` env var'ını Cloud Run'da `https://otlp-gateway-prod-eu-west-2.grafana.net/otlp` olarak güncelle. Deploy scriptlerinde düzeltildi ama mevcut Cloud Run revision hala eski endpoint'i kullanıyor olabilir. |
| 2 | **OTEL headers secret kontrol** | Servet | Cloud Run'daki `hooksniff-otel-headers` secret'ının `Authorization=Basic base64(1625476:glc_...)` formatında olduğunu doğrula. |
| 3 | **Deploy et** | Servet | `3f83bfb` commit'ini Cloud Run'a deploy et (CI/CD veya Cloud Build). |
| 4 | **Grafana kontrol** | Servet | Deploy sonrası Grafana dashboard'da trace/metrics/logs gelip gelmediğini kontrol et. |

### 🔴 Yüksek Öncelik — AI

| # | Görev | Kim | Açıklama |
|---|-------|-----|----------|
| 5 | **Grafana OTEL doğrula** | AI | Servet deploy ettikten sonra `/health` endpoint'inden OTEL durumunu kontrol et. Boot test span'ı Grafana'da görünmeli. |

### 🟡 Orta Öncelik

| # | Görev | Kim | Açıklama |
|---|-------|-----|----------|
| 6 | **GitHub Actions workflow'ları** | AI + Servet | Token'da `workflow` scope'u yok. Servet'ten yeni token istenecek. |
| 7 | **Polar.sh identity verification** | Servet | Kimlik doğrulaması gerekli. Para almak için zorunlu. |

### 🟢 Düşük Öncelik — Lansman Sonrası

| # | Görev | Kim | Açıklama |
|---|-------|-----|----------|
| 8 | **db.rs test (HS-085)** | AI | Gerçek PostgreSQL gerekli (Neon test DB). |
| 9 | **SDK otomatik güncelleme (HS-090)** | AI | Lansman sonrası, detaylı araştırma gerekli. |

---

## 🔧 Grafana OTEL Durumu (Oturum 104)

### KRİTİK BULGU
- Deploy scriptlerinde **yanlış region** vardı: `us-east-0` → `eu-west-2` olarak düzeltildi
- Cloud Run'daki mevcut revision hala eski endpoint'i kullanıyor olabilir
- **Servet'in Cloud Run'dan manuel kontrol etmesi gerekiyor**

### Yapılan (Oturum 103 + 104)
- Grafana org adı `hookrelay` (hooksniff değilmiş)
- OTLP endpoint: `https://otlp-gateway-prod-eu-west-2.grafana.net/otlp`
- Auth format: `Authorization=Basic base64(1625476:glc_...)`
- Yeni access policy token oluşturuldu: `hooksniff-otel`
- Cloud Run `otel-headers` secret v5 ile güncellendi
- Deploy scriptleri eu-west-2'ye düzeltildi (4 dosya)
- Boot test span eklendi (deploy sonrası Grafana'da görülecek)
- Health endpoint'e OTEL durumu eklendi

### Sonraki Adımlar (Servet Deploy Ettikten Sonra)
1. API'nin OTEL exporter'ının trace gönderip göndermediğini kontrol et
2. `/health` endpoint'inden `otel` durumunu kontrol et
3. Boot test span'ı Grafana'da ara (`otel_boot_test`)
4. Sorun devam ederse: Cloud Run logs'da `OTEL config` ve `OTLP exporter` loglarını kontrol et

### Token Bilgileri
- Grafana API Key: `glsa_EvV4uYJF4e9oOdmVLXgJ6rqa6JkrQVG1_50d9e12f`
- Grafana OTLP Token: `glc_eyJvIjoiMTc1NzMzNSIsIm4iOiJob29rc25pZmYtaG9va3NuaWZmLW90ZWwiLCJrIjoiOHZuSDRNdlU0NTEzTkMzbGt3eDE0eDljIiwibSI6eyJyIjoidXMifX0=`
- Grafana Access Policy ID: `b6aea6c9-bd32-4a2d-9184-a3d2da591a8a`
- Instance ID: `1625476`
- Cloud Run SA: `/tmp/hooksniff-sa.json` (hooksniff-deploy@hooksniff-app.iam.gserviceaccount.com)
