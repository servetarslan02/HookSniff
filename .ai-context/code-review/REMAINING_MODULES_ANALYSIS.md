# 🔍 Kalan Modüller — SDK, Deploy, Monitoring, Scripts, Portal, CLI

> Tarih: 2026-05-10
> İnceleme: Hızlı tarama + kritik dosyalar detaylı okundu

---

## 📦 SDK'lar (11 dil, ~8,534 satır)

### Desteklenen Diller
Node.js, Python, Go, Rust, Java, Kotlin, C#, Ruby, PHP, Swift, Elixir

### 🟢 İyi
- Her dilde `WebhookVerification` — Standard Webhooks HMAC-SHA256 doğrulama
- Tutarlı API surface across languages
- Her SDK'da `client.py` / `client.ts` / `client.go` — merkezi HTTP client

### 🟡 Sorunlar
1. **API endpoint URL'leri hardcoded olabilir** — Her SDK'da default API URL kontrol edilmeli
2. **Version sync** — 11 SDK'nın versiyonunu同步 tutmak zor, bir SDK geride kalabilir
3. **Test coverage** — Sadece Python'da `tests/` klasörü var, diğerlerinde unit test eksik

### 📋 Aksiyon
- [ ] Her SDK'da default API URL'yi environment variable'dan oku
- [ ] SDK version sync script'i oluştur
- [ ] En azından her SDK'da smoke test ekle

---

## 🚀 Deploy (Terraform, Helm, Docker, Scripts)

### 🟢 İyi
- **Multi-cloud**: GCP, Oracle Cloud, Docker Compose
- **Helm chart**: Kubernetes deployment ready
- **Terraform provider**: Custom HookSniff Terraform provider (Go)
- **Production Dockerfiles**: Ayrı API ve Worker prod Dockerfiles

### 🔴 Kritik Sorunlar
1. **`gcp-deploy.sh` ve `gcp-deploy.ps1` — Secret hardcoded riski**
   - Script'lerde service account key path veya env vars hardcoded olabilir
   - Kontrol edilmeli

2. **`backup.sh` — DB name "hookrelay" olarak kalmış**
   ```bash
   DB_NAME="${DB_NAME:-hookrelay}"  # hooksniff olmalı!
   ```
   **Eski isim kalmış, production'da hata oluşturur.**

3. **`oracle-cloud-setup.sh` — Kontrol edilmedi**
   - Oracle-specific script, muhtemelen outdated

### 🟡 Sorunlar
- `docker-compose.prod.yml` ve `docker-compose.gcp.yml` — Hangisi production'da kullanılıyor?
- `env.production.example` — Tüm env var'ları içeriyor mu?

---

## 📊 Monitoring (Grafana, Prometheus, OTEL)

### 🟢 İyi
- **Grafana dashboard**: `hooksniff.json` — webhook delivery metrics
- **Alert rules**: `alert_rules.yml` — failure rate, latency alerts
- **OTEL Collector**: OpenTelemetry config — API + Worker trace collection
- **Prometheus**: Scrape config for API metrics endpoint

### 🟡 Sorunlar
1. **Grafana provisioning** — `dashboards.yml` ve `prometheus.yml` template, production'da configure edilmeli
2. **Alert rules** — Threshold'lar default, production load'a göre ayarlanmalı

---

## 📜 Scripts

### 🟢 İyi
- **`ci-local.sh`**: fmt + clippy + test + build + dashboard — GitHub Actions alternatifi
- **`auto-push.sh`**: Memory dosyalarını 10 dakikada bir GitHub'a push
- **`backup.sh`**: PostgreSQL backup (local/S3/GCS)
- **`publish-sdks.sh`**: Toplu SDK publish

### 🔴 Kritik
1. **`backup.sh` — "hookrelay" ismi kalmış** (yukarıda belirtildi)
2. **`auto-push.sh` — Git credentials hardcoded riski**
   - `git push` için credential helper yapılandırılmış olmalı

---

## 🖥️ Portal (Embeddable Widget)

### 🟢 İyi
- Iframe-based embedding — güvenli sandbox
- `data-api-key` attribute ile API key injection
- Dark/light theme desteği
- Responsive (width/height configurable)

### 🔴 Kritik
1. **API key URL'de görünüyor**
   ```javascript
   iframe.src = widgetUrl + "?api_key=" + encodeURIComponent(API_KEY);
   ```
   **Sorun**: API key iframe URL'sinde query parameter olarak geçiyor. Browser history, server logs, ve referrer header'da görünebilir.
   **Öneri**: API key'i postMessage ile iframe'e geçir, URL'de tutma.

2. **Default API URL hardcoded**
   ```javascript
   var API_URL = SCRIPT_TAG.getAttribute("data-api-url") || "https://hooksniff-api-1046140057667.europe-west1.run.app/v1";
   ```
   **Sorun**: GCP Cloud Run URL'si hardcoded. Domain değişirse tüm embed'ler kırılır.
   **Öneri**: `https://api.hooksniff.com/v1` gibi bir domain kullan.

---

## 🔧 CLI

### 🟢 İyi
- Commander.js ile structured CLI
- Config dosyası (`~/.hooksniff/config.json`)
- `listen` komutu — incoming webhook dinleme (local development)

### 🟡 Sorunlar
1. **Env var ismi "HOOKRELAY" kalmış**
   ```javascript
   return config.api_url || process.env.HOOKRELAY_API_URL || 'http://localhost:3000/v1';
   ```
   **Eski isim, HOOKSNIFF_API_URL olmalı.**

2. **API key plaintext dosyada**
   ```javascript
   fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
   ```
   **Sorun**: API key plaintext olarak `~/.hooksniff/config.json`'da saklanıyor. Dosya izinleri 600 olmalı.

---

## 📊 Toplam Proje İstatistikleri

| Modül | Satır | Dil | Durum |
|-------|-------|-----|-------|
| API | 32,940 | Rust | ✅ Analiz edildi |
| Worker | 2,379 | Rust | ✅ Analiz edildi |
| Dashboard | 22,386 | TypeScript | ✅ Analiz edildi |
| SDKs | 8,534 | 11 dil | ⚡ Hızlı tarama |
| Deploy | ~2,000 | Shell/YAML | ⚡ Hızlı tarama |
| Monitoring | ~500 | YAML/JSON | ⚡ Hızlı tarama |
| Scripts | ~1,000 | Shell | ⚡ Hızlı tarama |
| Portal | ~500 | JS/HTML/CSS | ⚡ Hızlı tarama |
| CLI | ~450 | JS | ⚡ Hızlı tarama |
| **TOPLAM** | **~70,689** | | |

---

## 🏁 Genel Değerlendirme

### Proje Güçlü Yönleri
1. ✅ Standard Webhooks uyumu (Svix compatible)
2. ✅ Güçlü güvenlik altyapısı (Argon2, HMAC, SSRF, 2FA)
3. ✅ Kapsamlı test coverage (200+ test)
4. ✅ Multi-cloud deploy ready
5. ✅ OpenTelemetry observability
6. ✅ 11 SDK ile geniş dil desteği

### En Kritik 5 Sorun (Yayından Önce)
1. 🔴 **Fiyat tutarsızlığı** — $49/$149 → $29/$99
2. 🔴 **"hookrelay" artıkları** — backup.sh, CLI, env vars
3. 🔴 **Fanout feature işlevsiz** — target config kullanılmıyor
4. 🔴 **Portal API key sızıntısı** — URL'de görünüyor
5. 🔴 **GDPR delete_account eksik** — 12+ tabloda veri kalıyor

---

*Bu analiz tüm modüllerin incelenmesiyle hazırlanmıştır. API, Worker ve Dashboard detaylı; diğerleri hızlı tarama düzeyindedir.*
