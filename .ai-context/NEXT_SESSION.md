# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 17:21 GMT+8

---

## 🚨 KRİTİK BLOKLAR (Oturum 108)

### 1. GitHub Actions Billing — BİTTİ
- **Sorun:** GitHub Actions dakikaları dolmuş, CI/CD çalışmıyor
- **Çözüm: GCP Cloud Build kullan** — GitHub Actions'a gerek yok
- **Komut:** `gcloud builds submit --config=cloudbuild.yaml --substitutions=_IMAGE_TAG=latest`
- **veya:** GCP Console > Cloud Build > Triggers > tetikle
- `cloudbuild.yaml` zaten repo'da mevcut

### 2. Cloud Run API — Revision 00063 Deploy Edildi ⏳
- **Durum:** GCP Console üzerinden manuel deploy tetiklendi (Oturum 108)
- **Önceki sorun:** Son 3 revision (00059/00060/00061) startup timeout ile başarısız olmuştu
- **OTEL env var'ları doğrulandı:** OTEL_ENABLED=true, endpoint eu-west-2, headers secret mevcut
- **Beklenen:** Revision 00063 başarılı olursa OTEL verisi akmaya başlayacak
- **Kontrol:** `curl https://hooksniff-api-1046140057667.europe-west1.run.app/health` → otel objesi var mı?

### 3. Grafana OTEL — Veri Akışı Kontrol Edilecek ⏳
- **Durum:** Prometheus up series = 0 (Oturum 108 başında)
- **Sebep:** API Unavailable + OTEL verisi gönderilemiyor
- **Beklenen:** Revision 00063 başarılı olursa OTEL otomatik başlayacak
- **Kontrol:** Grafana'da `otel_boot_test` span'ı ve metrics ara

### 4. Grafana Trial — 9 Gün Kaldı
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

## 🔧 Grafana OTEL Durumu (Oturum 108)

### GÜNCEL DURUM
- **Revision 00063 deploy edildi** — GCP Console üzerinden manuel deploy (Oturum 108)
- OTEL env var'ları doğru: OTEL_ENABLED=true, endpoint eu-west-2, headers secret mevcut
- **Kontrol edilecek:** Deploy başarılı olduktan sonra OTEL veri akışı

### Yapılan (Oturum 103 + 104 + 108)
- Grafana org adı `hookrelay` (hooksniff değilmiş)
- OTLP endpoint: `https://otlp-gateway-prod-eu-west-2.grafana.net/otlp`
- Auth format: `Authorization=Basic base64(1625476:glc_...)`
- Yeni access policy token oluşturuldu: `hooksniff-otel`
- Cloud Run `otel-headers` secret v5 ile güncellendi
- Deploy scriptleri eu-west-2'ye düzeltildi (4 dosya)
- Boot test span eklendi (deploy sonrası Grafana'da görülecek)
- Health endpoint'e OTEL durumu eklendi
- **Oturum 108:** GCP Console browser ile açıldı, OTEL env var'ları doğrulandı, revision 00063 deploy edildi

### Sonraki Adımlar
1. Deploy tamamlandıktan sonra `/health` endpoint'inden `otel` durumunu kontrol et
2. Prometheus'ta `up` series sayısını kontrol et (şu an 0)
3. Boot test span'ı Grafana'da ara (`otel_boot_test`)
4. Sorun devam ederse: Cloud Run logs'da `OTEL config` ve `OTLP exporter` loglarını kontrol et

### Token Bilgileri
- Grafana API Key: `glsa_EvV4uYJF4e9oOdmVLXgJ6rqa6JkrQVG1_50d9e12f`
- Grafana OTLP Token: `glc_eyJvIjoiMTc1NzMzNSIsIm4iOiJob29rc25pZmYtaG9va3NuaWZmLW90ZWwiLCJrIjoiOHZuSDRNdlU0NTEzTkMzbGt3eDE0eDljIiwibSI6eyJyIjoidXMifX0=`
- Grafana Access Policy ID: `b6aea6c9-bd32-4a2d-9184-a3d2da591a8a`
- Instance ID: `1625476`
- **SA key compromize:** Git history'de bulundu (commit 12d1855), rotate edilmiş, geçersiz
- **Yeni SA key gerekli:** GCP Console > IAM > Service Accounts > hooksniff-deploy > Keys > Create
