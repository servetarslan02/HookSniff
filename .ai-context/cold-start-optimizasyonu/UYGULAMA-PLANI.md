# 🚀 Cold Start Optimizasyonu — Aşamalı Uygulama Planı

> **Başlangıç:** 2026-05-26
> **Hedef:** Cloud Run cold start süresini tamamen ortadan kaldırmak
> **Mevcut:** İlk istek 1-5s (container uykudan uyanır) → **Hedef: 0s**
> **Ek Maliyet:** $0 (Cloud Run free tier'da idle instance ücret alınmaz)

---

## 📖 İçindekiler

1. [Mevcut Durum & Darboğazlar](#1-mevcut-durum--darboğazlar)
2. [Sektör Karşılaştırması & Tezler](#2-sektör-karşılaştırması--tezler)
3. [Faz 1: Minimum Instance (minScale)](#3-faz-1-minimum-instance-minscale)
4. [Faz 2: Health Check Warm-up](#4-faz-2-health-check-warm-up)
5. [Faz 3: Binary Optimizasyonu](#5-faz-3-binary-optimizasyonu)
6. [Faz 4: Startup Time Monitoring](#6-faz-4-startup-time-monitoring)
7. [Test & Doğrulama](#7-test--doğrulama)
8. [Rollback Planı](#8-rollback-planı)
9. [Zaman Çizelgesi](#9-zaman-çizelgesi)

---

## 1. Mevcut Durum & Darboğazlar

### Cold Start Akışı

```
Container Uykuda (0 instance)
    │
    ▼ Cloud Run istek alır
    │
    ▼ Container başlatılır
    ├─ Rust binary yüklenir              ~50ms (Rust avantajı)
    ├─ DB bağlantısı kurulur             ~100-500ms ← DARBOĞAZ
    ├─ Redis bağlantısı kurulur          ~50-100ms
    ├─ Migration çalıştırılır            ~100ms
    ├─ Cache warm-up                     ~0ms (soğuk)
    └─ İlk istek işlenir                 ~500ms-1s (soğuk cache)
    │
    ▼ Toplam cold start: ~1-2s (Rust sayesinde zaten hızlı)
    ▼ Ama müşteri için bu 1-2s hissedilir
```

### Mevcut Cloud Run Config

```yaml
# cloudbuild.yaml — mevcut config
spec:
  template:
    spec:
      containers:
        - image: gcr.io/$PROJECT_ID/hooksniff-api
          ports:
            - containerPort: 3000
          resources:
            limits:
              cpu: "1"
              memory: "512Mi"
    # minScale belirtilmemiş → varsayılan 0 (container kapanır)
```

### Tespit Edilen Sorunlar

| # | Sorun | Etki | Öncelik |
|---|-------|------|---------|
| 1 | minScale: 0 (varsayılan) | Container kapanır, cold start | 🔴 Kritik |
| 2 | DB bağlantısı soğuk | İlk istekte 100-500ms gecikme | 🟡 Yüksek |
| 3 | Redis bağlantısı soğuk | İlk istekte 50-100ms gecikme | 🟡 Yüksek |
| 4 | Cache soğuk | İlk istekte %0 hit rate | 🟢 Orta |
| 5 | Startup time izlenmiyor | Cold start süresi bilinmiyor | 🟢 Orta |

---

## 2. Sektör Karşılaştırması & Tezler

### Rakip Cold Start Süreleri

| Platform | Cold Start | Teknik |
|----------|-----------|--------|
| **Stripe** | 0s | Özel altyapı, her zaman sıcak |
| **Svix** | 0s | Minimum instance |
| **Hookdeck** | 0s | Minimum instance |
| **HookSniff (mevcut)** | 1-5s | minScale: 0 |
| **HookSniff (hedef)** | **0s** | **minScale: 1** |

### Tez 1: Neden minScale: 1?

Cloud Run'da `minScale: 0` = container kapanır, sonraki istekte yeniden başlar.
`minScale: 1` = en az 1 container her zaman çalışır → cold start tamamen ortadan kalkar.

**Maliyet etkisi:** Cloud Run free tier'da idle state'de CPU/memory kullanılmaz, ücret alınmaz. Sadece aktif isteklerde ücret var.

### Tez 2: Neden Warm-up Health Check?

Container her zaman sıcak olsa bile, DB ve Redis bağlantıları idle timeout'a düşebilir. Warm-up health check bu bağlantıları sıcak tutar.

### Tez 3: Neden Binary Optimizasyonu?

Rust binary'si zaten küçük ve hızlı (~50ms). Ama daha da küçültülebilir:
- `strip: true` → debug sembollerini kaldır
- `lto: true` → link-time optimization
- `codegen-units: 1` → daha iyi optimizasyon

---

## 3. Faz 1: Minimum Instance (minScale)

> **Süre:** 1 oturum | **Etki:** 1-5s → 0s | **Risk:** Çok düşük

### 3.1 cloudbuild.yaml Değişikliği

```yaml
# cloudbuild.yaml — minScale ekle
spec:
  template:
    metadata:
      annotations:
        # Minimum 1 instance her zaman çalışır → cold start yok
        autoscaling.knative.dev/minScale: "1"
        # Maksimum 10 instance (ihtiyaç olursa)
        autoscaling.knative.dev/maxScale: "10"
    spec:
      containers:
        - image: gcr.io/$PROJECT_ID/hooksniff-api
          ports:
            - containerPort: 3000
          resources:
            limits:
              cpu: "1"
              memory: "512Mi"
          # Startup probe — container hazır olana kadar trafik gelmesin
          startupProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 2
            failureThreshold: 3
```

### 3.2 render.yaml (Opsiyonel — Render.com için)

```yaml
# render.yaml — Render.com'da minimum instance
services:
  - name: hooksniff-api
    type: web
    runtime: docker
    numInstances: 1  # Minimum 1 instance
    minInstances: 1
    maxInstances: 10
```

### 3.3 Cloud Run Deploy

```bash
# minScale ile deploy
gcloud run deploy hooksniff-api \
  --source . \
  --region europe-west1 \
  --min-instances 1 \
  --max-instances 10 \
  --cpu 1 \
  --memory 512Mi

# Worker için de aynı
gcloud run deploy hooksniff-worker \
  --source . \
  --region europe-west1 \
  --min-instances 1 \
  --max-instances 5
```

### 3.4 Faz 1 Doğrulama

- [ ] Container her zaman 1+ instance çalışıyor
- [ ] Cold start süresi ölçülebilir değil (0s)
- [ ] İlk istek < 100ms
- [ ] Maliyet artışı yok (idle state ücretsiz)

---

## 4. Faz 2: Health Check Warm-up

> **Süre:** 1 oturum | **Etki:** Bağlantılar sıcak kalır | **Risk:** Çok düşük

### 4.1 Warm-up Endpoint

```rust
// routes/health.rs — Warm-up endpoint

/// Warm-up endpoint: DB ve Redis bağlantılarını sıcak tutar
/// Cloud Run health check: her 10 saniyede bir çağırır
pub async fn warmup(
    Extension(pool): Extension<PgPool>,
    Extension(redis): Extension<Option<cache::CacheLayer>>,
) -> &'static str {
    // DB bağlantısını sıcak tut
    let _ = sqlx::query("SELECT 1").execute(&pool).await;

    // Redis bağlantısını sıcak tut
    if let Some(ref redis) = redis {
        let _ = redis.ping().await;
    }

    "ok"
}

// Router'a ekle
Router::new()
    .route("/warmup", get(warmup))
```

### 4.2 Background Warm-up Task

```rust
// main.rs — Background warm-up (her 30 saniyede bir)

tokio::spawn(async move {
    let mut interval = tokio::time::interval(Duration::from_secs(30));
    loop {
        interval.tick().await;

        // DB bağlantısını sıcak tut
        let _ = sqlx::query("SELECT 1").execute(&pool).await;

        // Redis bağlantısını sıcak tut
        if let Some(ref redis) = cache_layer {
            let _ = redis.ping().await;
        }
    }
});
```

### 4.3 Cloud Run Health Check Config

```yaml
# cloudbuild.yaml — Liveness probe
livenessProbe:
  httpGet:
    path: /warmup
    port: 3000
  periodSeconds: 30
  timeoutSeconds: 5
  failureThreshold: 3

# Readiness probe
readinessProbe:
  httpGet:
    path: /health
    port: 3000
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### 4.4 Faz 2 Doğrulama

- [ ] Warm-up endpoint her 30s'de bir çağrılıyor
- [ ] DB bağlantısı sıcak (acquire timeout yok)
- [ ] Redis bağlantısı sıcak (ping başarılı)
- [ ] Cache warm (ilk istekte hit rate > %0)

---

## 5. Faz 3: Binary Optimizasyonu

> **Süre:** 1 oturum | **Etki:** Binary boyutu %30-50 azalma | **Risk:** Düşük

### 5.1 Cargo.toml Optimizasyonu

```toml
# api/Cargo.toml — Release profile
[profile.release]
strip = true           # Debug sembollerini kaldır
lto = true             # Link-time optimization
codegen-units = 1      # Daha iyi optimizasyon (daha yavaş compile)
opt-level = "z"        # Boyut için optimize et (speed için "3")
panic = "abort"        # Unwind tablolarını kaldır
```

### 5.2 Dockerfile Optimizasyonu

```dockerfile
# Dockerfile.api — Multi-stage build
FROM rust:1.82-slim as builder
WORKDIR /app
COPY . .
RUN cargo build --release

# Minimal runtime image
FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /app/target/release/hooksniff-api /usr/local/bin/
EXPOSE 3000
CMD ["hooksniff-api"]
```

### 5.3 Binary Boyut Karşılaştırması

| Durum | Boyut | Başlatma Süresi |
|-------|-------|-----------------|
| Debug | ~50MB | ~500ms |
| Release (varsayılan) | ~15MB | ~100ms |
| Release + strip + LTO | ~8MB | ~50ms |
| Release + strip + LTO + opt-level=z | ~5MB | ~40ms |

### 5.4 Faz 3 Doğrulama

- [ ] `cargo build --release` başarılı
- [ ] Binary boyutu < 10MB
- [ ] Container başlatma süresi < 100ms
- [ ] Tüm endpoint'ler doğru çalışıyor

---

## 6. Faz 4: Startup Time Monitoring

> **Süre:** 1 oturum | **Etki:** Cold start süresi izlenir | **Risk:** Çok düşük

### 6.1 Startup Time Metric

```rust
// main.rs — Startup time ölçümü

#[tokio::main]
async fn main() -> Result<()> {
    let startup_start = std::time::Instant::now();

    // ... mevcut startup kodu ...

    let startup_duration = startup_start.elapsed();
    tracing::info!(
        startup_ms = startup_duration.as_millis() as u64,
        "✅ API started"
    );

    // Metric olarak kaydet
    metrics::STARTUP_TIME_MS.store(
        startup_duration.as_millis() as u64,
        std::sync::atomic::Ordering::Relaxed,
    );

    // ... server başlat ...
}
```

### 6.2 Grafana Alert

```json
{
  "alert": {
    "name": "Cold Start Detected",
    "condition": "hooksniff_startup_time_ms > 1000",
    "message": "API cold start detected (> 1s). Check minScale config."
  }
}
```

### 6.3 Faz 4 Doğrulama

- [ ] Startup time Grafana'da görünüyor
- [ ] Cold start alert çalışıyor
- [ ] Startup time < 100ms (sıcak container)

---

## 7. Test & Doğrulama

### 7.1 Cold Start Testi

```bash
# 1. Container'ı kapat (manually scale to 0)
gcloud run services update hooksniff-api --min-instances 0 --region europe-west1

# 2. 30 saniye bekle (container kapansın)

# 3. İlk istek gönder (cold start)
time curl -s -o /dev/null -w "%{time_total}\n" \
  $API_URL/health

# 4. Sonuç: İlk istek ~1-2s (cold start)
# 5. İkinci istek: ~10ms (sıcak)
```

### 7.2 Sıcak Container Testi

```bash
# minScale: 1 ile
# Herhangi bir zamanda istek gönder
time curl -s -o /dev/null -w "%{time_total}\n" \
  $API_URL/health

# Sonuç: Her zaman < 100ms (soğuk container yok)
```

### 7.3 Before/After Karşılaştırma

| Metrik | Before (minScale: 0) | After (minScale: 1) | İyileşme |
|--------|---------------------|---------------------|----------|
| İlk istek | 1-5s | < 100ms | **50x** |
| İkinci istek | ~10ms | ~10ms | Aynı |
| Cold start sıklığı | Her idle sonrası | Hiçbir zaman | **∞** |
| Maliyet | $0 | $0 | Aynı |

---

## 8. Rollback Planı

```bash
# minScale'ı 0'a geri al (container kapanabilir)
gcloud run services update hooksniff-api --min-instances 0 --region europe-west1
```

---

## 9. Zaman Çizelgesi

| Faz | Süre | Etki | Oturum |
|-----|------|------|--------|
| **Faz 1:** Minimum Instance | 1 oturum | 1-5s → 0s | 1 |
| **Faz 2:** Health Check Warm-up | 1 oturum | Bağlantılar sıcak | 2 |
| **Faz 3:** Binary Optimizasyonu | 1 oturum | Boyut %30-50 azalma | 3 |
| **Faz 4:** Startup Monitoring | 1 oturum | İzleme | 4 |

**Toplam:** ~4 oturum, **$0 ek maliyet**

---

## 📚 Kaynaklar

- [Cloud Run Cold Start](https://cloud.google.com/run/docs/tips/general)
- [Cloud Run Min Instances](https://cloud.google.com/run/docs/configuring/min-instances)
- [Rust Binary Size Optimization](https://github.com/johnthagen/min-sized-rust)
- [Kubernetes Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)

---

*Bu plan HookSniff'in cold start sorununu tamamen çözmeyi hedefler.*
*Son güncelleme: 2026-05-26*
