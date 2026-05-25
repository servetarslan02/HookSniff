# 🔒 Güvenlik Geliştirme Projesi — Aşamalı Uygulama Planı

> **Başlangıç:** 2026-05-26
> **Hedef:** HookSniff'i sektörün en güvenli webhook platformu yapmak
> **Mevcut:** 7/10 (iyi) → **Hedef: 10/10 (mükemmel)**
> **Ek Maliyet:** $0

---

## 📖 İçindekiler

1. [Mevcut Güvenlik Sistemi & Eksikler](#1-mevcut-güvenlik-sistemi--eksikler)
2. [Sektör Karşılaştırması & Tezler](#2-sektör-karşılaştırması--tezler)
3. [Faz 1: OWASP API Security Top 10 Uyumluluğu](#3-faz-1-owasp-api-security-top-10-uyumluluğu)
4. [Faz 2: Advanced Threat Detection](#4-faz-2-advanced-threat-detection)
5. [Faz 3: Supply Chain Security](#5-faz-3-supply-chain-security)
6. [Faz 4: Secret Management & Rotation](#6-faz-4-secret-management--rotation)
7. [Faz 5: DDoS Protection](#7-faz-5-ddos-protection)
8. [Faz 6: Security Headers & CSP](#8-faz-6-security-headers--csp)
9. [Faz 7: Penetration Testing Framework](#9-faz-7-penetration-testing-framework)
10. [Faz 8: Incident Response & Forensics](#10-faz-8-incident-response--forensics)
11. [Faz 9: Zero Trust Architecture](#11-faz-9-zero-trust-architecture)
12. [Faz 10: Compliance & Audit](#12-faz-10-compliance--audit)
13. [Grafana Metrikleri & Monitoring](#13-grafana-metrikleri--monitoring)
14. [Test & Doğrulama](#14-test--doğrulama)
15. [Rollback Planı](#15-rollback-planı)
16. [Zaman Çizelgesi](#16-zaman-çizelgesi)

---

## 1. Mevcut Güvenlik Sistemi & Eksikler

### Mevcut Güvenlik Katmanları

```
Güvenlik Mimarisi (Mevcut)
│
├── 🔐 Authentication
│   ├── API Key (Argon2id hash, hr_live_*/hr_test_* format)
│   ├── JWT (HS256, 24h expiry, HttpOnly cookie)
│   ├── 2FA (TOTP — Google Authenticator)
│   └── Password (Argon2id, reset token 1h)
│
├── 🛡️ Authorization
│   ├── Team roles (viewer, developer, admin, owner)
│   ├── RBAC middleware
│   └── Plan-based limits
│
├── 🔍 Input Validation
│   ├── Event type regex (^[a-zA-Z0-9._]{1,100}$)
│   ├── URL validation (SSRF protection)
│   ├── JSON depth limit (10 levels)
│   └── Payload size limit (256KB-10MB)
│
├── 🚫 SSRF Protection
│   ├── Private IP blocking (10.x, 172.16.x, 192.168.x)
│   ├── Loopback blocking (127.x, ::1)
│   ├── Metadata endpoint blocking (169.254.169.254)
│   └── DNS rebinding protection
│
├── 🔒 Encryption
│   ├── AES-256-GCM (secrets at rest)
│   ├── TLS 1.2+ (in transit)
│   └── HttpOnly cookies (XSS mitigation)
│
├── 📊 Monitoring
│   ├── Security events (brute force, credential stuffing)
│   ├── Audit log (all critical actions)
│   ├── OpenTelemetry tracing
│   └── Prometheus metrics
│
├── 🚦 Rate Limiting
│   ├── Sliding window (per-customer, per-plan)
│   ├── Login: 10/15min per IP
│   └── Registration: 5/hour per IP
│
└── 📋 Compliance
    ├── GDPR (data export + account deletion)
    └── Standard Webhooks (HMAC-SHA256)
```

### Tespit Edilen Eksikler (OWASP API Security Top 10 2023)

| # | OWASP Kategori | Mevcut Durum | Eksik |
|---|---------------|-------------|-------|
| API1 | Broken Object Level Authorization | 🟡 Kısmen | Endpoint-level auth kontrolü zayıf |
| API2 | Broken Authentication | ✅ İyi | API key rotation otomatik değil |
| API3 | Broken Object Property Level Authorization | 🔴 Eksik | Field-level filtering yok |
| API4 | Unrestricted Resource Consumption | 🟡 Kısmen | Pagination limitleri zayıf |
| API5 | Broken Function Level Authorization | 🟡 Kısmen | Admin endpoint'leri korunmuş ama audit eksik |
| API6 | Unrestricted Access to Sensitive Business Flows | 🔴 Eksik | Bot detection yok |
| API7 | Server Side Request Forgery | ✅ İyi | SSRF koruması sağlam |
| API8 | Security Misconfiguration | 🟡 Kısmen | Security headers eksik |
| API9 | Improper Inventory Management | 🔴 Eksik | API versiyonlama yok |
| API10 | Unsafe Consumption of APIs | 🟡 Kısmen | Webhook doğrulama var ama timeout zayıf |

### Tespit Edilen Eksikler (Genel)

| # | Eksik | Etki | Öncelik |
|---|-------|------|---------|
| 1 | OWASP uyumsuzluk | Güvenlik açığı | 🔴 Kritik |
| 2 | Advanced threat detection (ML) | Saldırı tespit edilemiyor | 🔴 Kritik |
| 3 | Supply chain security | Bağımlılık zafiyeti | 🔴 Kritik |
| 4 | Otomatik secret rotation | Eski secret'lar risk | 🟡 Yüksek |
| 5 | DDoS protection | Servis dışı kalma | 🟡 Yüksek |
| 6 | Security headers (CSP, HSTS) | XSS, clickjacking | 🟡 Yüksek |
| 7 | Penetration testing framework | Zafiyet tespit edilemiyor | 🟡 Yüksek |
| 8 | Incident response plan | Müdahale gecikmesi | 🟡 Yüksek |
| 9 | Zero trust architecture | İç tehdit riski | 🟢 Orta |
| 10 | Compliance automation | Manuel audit | 🟢 Orta |

---

## 2. Sektör Karşılaştırması & Tezler

### Rakip Güvenlik Seviyeleri

| Platform | OWASP | 2FA | SSRF | DDoS | Supply Chain | Incident Response |
|----------|-------|-----|------|------|-------------|-------------------|
| **Stripe** | ✅ Full | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Svix** | ✅ Partial | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Hookdeck** | ✅ Partial | ✅ | ✅ | ❌ | ❌ | ❌ |
| **HookSniff (mevcut)** | 🟡 Partial | ✅ | ✅ | ❌ | ❌ | ❌ |
| **HookSniff (hedef)** | ✅ Full | ✅ | ✅ | ✅ | ✅ | ✅ |

### Tez 1: Neden OWASP Uyumluluğu?

OWASP API Security Top 10, API güvenliği için endüstri standardı. Uyumsuzluk = güvenlik açığı.

### Tez 2: Neden ML-based Threat Detection?

Geleneksel kurallar (regex, pattern) yeni saldırıları tespit edemez. ML ile anomali tabanlı tespit.

| Durum | Kural Tabanlı | ML Tabanlı |
|-------|--------------|------------|
| Bilinen saldırılar | ✅ Tespit eder | ✅ Tespit eder |
| Bilinmeyen saldırılar | ❅ Tespit edemez | ✅ Tespit eder |
| False positive | Yüksek | Düşük |
| Adaptif | ❌ | ✅ |

### Tez 3: Neden Supply Chain Security?

Bağımlılıklardaki zafiyetler en büyük güvenlik riski. SolarWinds saldırısı bunun en büyük örneği.

| Durum | Supply Chain Güvenlik Yok | Supply Chain Güvenlik Var |
|-------|--------------------------|--------------------------|
| Zafiyet tespiti | Manuel | Otomatik |
| SBOM | Yok | Otomatik üretilir |
| Audit | Nadir | Her deploy'da |

---

## 3. Faz 1: OWASP API Security Top 10 Uyumluluğu

> **Süre:** 2-3 oturum | **Etki:** Tüm OWASP kategorileri korunur | **Risk:** Düşük

### 3.1 API1: Broken Object Level Authorization

```rust
// middleware/authz.rs — Object-level authorization

/// Endpoint erişim kontrolü — sadece sahibi erişebilir
pub async fn check_endpoint_ownership(
    pool: &PgPool,
    customer_id: Uuid,
    endpoint_id: Uuid,
) -> Result<(), AppError> {
    let owner: Option<(Uuid,)> = sqlx::query_as(
        "SELECT customer_id FROM endpoints WHERE id = $1"
    )
    .bind(endpoint_id)
    .fetch_optional(pool)
    .await?;

    match owner {
        Some((owner_id,)) if owner_id == customer_id => Ok(()),
        Some(_) => Err(AppError::Forbidden("Not your endpoint".into())),
        None => Err(AppError::NotFound("Endpoint not found".into())),
    }
}

/// Delivery erişim kontrolü — sadece endpoint sahibi erişebilir
pub async fn check_delivery_access(
    pool: &PgPool,
    customer_id: Uuid,
    delivery_id: Uuid,
) -> Result<(), AppError> {
    let access: Option<(bool,)> = sqlx::query_as(
        r#"
        SELECT EXISTS(
            SELECT 1 FROM deliveries d
            JOIN endpoints e ON e.id = d.endpoint_id
            WHERE d.id = $1 AND e.customer_id = $2
        )
        "#
    )
    .bind(delivery_id)
    .bind(customer_id)
    .fetch_one(pool)
    .await?;

    if access.map(|(exists,)| exists).unwrap_or(false) {
        Ok(())
    } else {
        Err(AppError::Forbidden("Access denied".into()))
    }
}
```

### 3.2 API3: Broken Object Property Level Authorization

```rust
// middleware/field_filter.rs — Field-level filtering

/// Hassas alanları filtrele (customer rolüne göre)
pub fn filter_sensitive_fields<T: Serialize>(
    data: &T,
    role: &str,
) -> serde_json::Value {
    let mut value = serde_json::to_value(data).unwrap_or_default();

    if role != "admin" && role != "owner" {
        // Admin olmayan kullanıcılar için hassas alanları kaldır
        if let Some(obj) = value.as_object_mut() {
            obj.remove("signing_secret");
            obj.remove("api_key_hash");
            obj.remove("internal_notes");
            obj.remove("billing_email");
        }
    }

    value
}
```

### 3.3 API4: Unrestricted Resource Consumption

```rust
// middleware/pagination.rs — Pagination limitleri

/// Maksimum pagination limiti
const MAX_PAGE_SIZE: usize = 100;
const DEFAULT_PAGE_SIZE: usize = 20;

/// Pagination parametrelerini doğrula
pub fn validate_pagination(page: Option<usize>, per_page: Option<usize>) -> (usize, usize) {
    let page = page.unwrap_or(1).max(1);
    let per_page = per_page
        .unwrap_or(DEFAULT_PAGE_SIZE)
        .min(MAX_PAGE_SIZE)
        .max(1);

    (page, per_page)
}
```

### 3.4 API6: Unrestricted Access to Sensitive Business Flows

```rust
// middleware/bot_detection.rs — Bot detection

/// Bot detection — şüpheli kullanıcı ajanı kontrolü
pub fn detect_bot(user_agent: Option<&str>) -> bool {
    let ua = match user_agent {
        Some(ua) => ua.to_lowercase(),
        None => return true,  // UA yoksa şüpheli
    };

    let bot_patterns = [
        "curl", "wget", "python-requests", "httpie",
        "postman", "insomnia", "scrapy", "selenium",
        "headless", "phantom", "bot", "crawler",
    ];

    bot_patterns.iter().any(|pattern| ua.contains(pattern))
}

/// Honeypot endpoint — bot'ları tuzak
pub async fn honeypot_handler() -> StatusCode {
    // Bu endpoint hiçbir zaman gerçek veri dönmez
    // Bot'lar bu endpoint'e erişmeye çalışırsa tespit edilir
    StatusCode::NOT_FOUND
}
```

### 3.5 API9: Improper Inventory Management

```rust
// routes/versioning.rs — API versiyonlama

/// API versiyon header'ı
pub fn get_api_version(headers: &HeaderMap) -> String {
    headers
        .get("X-API-Version")
        .and_then(|v| v.to_str().ok())
        .unwrap_or("v1")
        .to_string()
}

/// Deprecated endpoint uyarısı
pub fn deprecation_warning(version: &str) -> Option<String> {
    match version {
        "v1" => Some("API v1 is deprecated. Please migrate to v2.".to_string()),
        _ => None,
    }
}
```

### 3.6 Faz 1 Doğrulama

- [ ] API1: Object-level authorization çalışıyor
- [ ] API3: Field-level filtering çalışıyor
- [ ] API4: Pagination limitleri uygulanıyor
- [ ] API6: Bot detection çalışıyor
- [ ] API9: API versiyonlama çalışıyor
- [ ] OWASP test senaryoları geçiyor

---

## 4. Faz 2: Advanced Threat Detection

> **Süre:** 2 oturum | **Etki:** ML tabanlı saldırı tespiti | **Risk:** Düşük

### 4.1 ML-based Anomaly Detection

```rust
// security/threat_detector.rs — YENİ DOSYA

/// Tehdit tespit sonucu
pub struct ThreatResult {
    pub is_threat: bool,
    pub threat_type: ThreatType,
    pub confidence: f64,       // 0.0-1.0
    pub action: ThreatAction,
    pub details: String,
}

pub enum ThreatType {
    BruteForce,
    CredentialStuffing,
    ApiAbuse,
    DataExfiltration,
    SuspiciousPattern,
    DDoSAttempt,
}

pub enum ThreatAction {
    Allow,
    Warn,
    RateLimit,
    Block,
    Alert,
}

/// IRequest pattern analizi
pub async fn analyze_request(
    pool: &PgPool,
    customer_id: Uuid,
    ip: &str,
    endpoint: &str,
    method: &str,
    user_agent: Option<&str>,
) -> ThreatResult {
    let mut score = 0.0;
    let mut reasons = Vec::new();

    // 1. Rate limit kontrolü
    let recent_count: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '5 minutes'"
    )
    .bind(ip)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    let count = recent_count.map(|(c,)| c).unwrap_or(0);
    if count > 100 {
        score += 0.4;
        reasons.push(format!("High request rate: {} in 5min", count));
    }

    // 2. Farklı endpoint'lere erişim
    let unique_endpoints: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(DISTINCT resource_id) FROM security_events WHERE ip_address = $1 AND created_at > NOW() - INTERVAL '10 minutes'"
    )
    .bind(ip)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    let unique = unique_endpoints.map(|(c,)| c).unwrap_or(0);
    if unique > 20 {
        score += 0.3;
        reasons.push(format!("Scanning behavior: {} unique endpoints", unique));
    }

    // 3. Hata oranı
    let error_count: Option<(i64,)> = sqlx::query_as(
        "SELECT COUNT(*) FROM security_events WHERE ip_address = $1 AND severity IN ('high', 'critical') AND created_at > NOW() - INTERVAL '1 hour'"
    )
    .bind(ip)
    .fetch_optional(pool)
    .await
    .unwrap_or(None);

    let errors = error_count.map(|(c,)| c).unwrap_or(0);
    if errors > 10 {
        score += 0.3;
        reasons.push(format!("High error rate: {} errors in 1h", errors));
    }

    // 4. Bot detection
    if super::detect_bot(user_agent) {
        score += 0.2;
        reasons.push("Bot user agent detected".to_string());
    }

    // Sonuç
    let is_threat = score > 0.5;
    let action = if score > 0.8 {
        ThreatAction::Block
    } else if score > 0.5 {
        ThreatAction::RateLimit
    } else if score > 0.3 {
        ThreatAction::Warn
    } else {
        ThreatAction::Allow
    };

    ThreatResult {
        is_threat,
        threat_type: ThreatType::SuspiciousPattern,
        confidence: score,
        action,
        details: reasons.join("; "),
    }
}
```

### 4.2 Behavioral Analysis

```rust
// security/behavioral.rs — Davranış analizi

/// Kullanıcı davranış profili
pub struct BehaviorProfile {
    pub customer_id: Uuid,
    pub typical_hours: Vec<u8>,        // Genellikle hangi saatlerde
    pub typical_endpoints: Vec<String>, // Genellikle hangi endpoint'ler
    pub typical_volume: f64,            // Ortalama webhook hacmi
    pub typical_countries: Vec<String>, // Genellikle hangi ülkelerden
}

/// Anomali tespiti — davranış profiliyle karşılaştır
pub fn detect_behavioral_anomaly(
    profile: &BehaviorProfile,
    current_hour: u8,
    current_endpoint: &str,
    current_volume: f64,
    current_country: &str,
) -> (bool, f64) {
    let mut anomaly_score = 0.0;

    // Saat anomali
    if !profile.typical_hours.contains(&current_hour) {
        anomaly_score += 0.2;
    }

    // Endpoint anomali
    if !profile.typical_endpoints.contains(&current_endpoint.to_string()) {
        anomaly_score += 0.2;
    }

    // Hacim anomali
    let volume_ratio = current_volume / profile.typical_volume;
    if volume_ratio > 3.0 || volume_ratio < 0.1 {
        anomaly_score += 0.3;
    }

    // Ülke anomali
    if !profile.typical_countries.contains(&current_country.to_string()) {
        anomaly_score += 0.3;
    }

    (anomaly_score > 0.5, anomaly_score)
}
```

### 4.3 Faz 2 Doğrulama

- [ ] ML tabanlı threat detection çalışıyor
- [ ] Behavioral analysis çalışıyor
- [ ] False positive oranı < %5
- [ ] Gerçek saldırı simülasyonu tespit ediliyor

---

## 5. Faz 3: Supply Chain Security

> **Süre:** 1-2 oturum | **Etki:** Bağımlılık zafiyetleri tespit edilir | **Risk:** Düşük

### 5.1 SBOM (Software Bill of Materials)

```yaml
# .github/workflows/sbom.yml — SBOM üretimi
name: SBOM Generation
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  sbom:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Generate SBOM
        uses: anchore/sbom-action@v0
        with:
          format: spdx-json
          output-file: sbom.spdx.json
      - name: Upload SBOM
        uses: actions/upload-artifact@v4
        with:
          name: sbom
          path: sbom.spdx.json
```

### 5.2 Cargo Audit (Zaten Var — Genişletilmiş)

```yaml
# .github/workflows/security-audit.yml — Güvenlik taraması
name: Security Audit
on:
  schedule:
    - cron: '0 8 * * 1'  # Her Pazartesi 08:00
  push:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Cargo Audit
        uses: actions-rs/audit-check@v1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
      - name: Cargo Deny
        uses: EmbarkStudios/cargo-deny-action@v1
        with:
          command: check
          arguments: --all-features
```

### 5.3 Dependency Scanning

```toml
# deny.toml — Bağımlılık politikaları
[advisories]
vulnerability = "deny"      # Zafiyetli bağımlılık → build fail
unmaintained = "warn"       # Bakımsız bağımlılık → uyarı
yanked = "deny"             # Yanked versiyon → build fail

[licenses]
unlicensed = "deny"         # Lisanssız bağımlılık → build fail
allow = [
    "MIT",
    "Apache-2.0",
    "BSD-2-Clause",
    "BSD-3-Clause",
    "ISC",
    "Zlib",
]

[bans]
multiple-versions = "warn"  # Aynı bağımlılığın birden fazla versiyonu → uyarı
wildcards = "deny"           # Wildcard versiyon → build fail
```

### 5.4 Faz 3 Doğrulama

- [ ] SBOM her deploy'da üretiliyor
- [ ] Cargo audit her hafta çalışıyor
- [ ] cargo-deny politikaları uygulanıyor
- [ ] Zafiyetli bağımlılık tespit ediliyor

---

## 6. Faz 4: Secret Management & Rotation

> **Süre:** 1-2 oturum | **Etki:** Secret'lar otomatik yenilenir | **Risk:** Düşük

### 6.1 Otomatik API Key Rotation

```rust
// security/secret_rotation.rs — YENİ DOSYA

/// API key rotation politikası
pub struct RotationPolicy {
    pub max_age_days: u32,           // Maksimum 90 gün
    pub warn_before_days: u32,       // 7 gün önce uyar
    pub auto_rotate: bool,           // Otomatik yenileme
}

impl Default for RotationPolicy {
    fn default() -> Self {
        Self {
            max_age_days: 90,
            warn_before_days: 7,
            auto_rotate: false,
        }
    }
}

/// Süresi dolmak üzere olan API key'leri uyar
pub async fn check_rotation_needed(
    pool: &PgPool,
    policy: &RotationPolicy,
) -> Result<Vec<RotationWarning>, sqlx::Error> {
    let warnings: Vec<RotationWarning> = sqlx::query_as(
        r#"
        SELECT
            ak.id,
            ak.name,
            ak.created_at,
            EXTRACT(DAY FROM NOW() - ak.created_at)::INT as age_days,
            c.email
        FROM api_keys ak
        JOIN customers c ON c.id = ak.customer_id
        WHERE ak.revoked = false
          AND EXTRACT(DAY FROM NOW() - ak.created_at) > $1
        ORDER BY ak.created_at ASC
        "#
    )
    .bind(policy.max_age_days as i32 - policy.warn_before_days as i32)
    .fetch_all(pool)
    .await?;

    Ok(warnings)
}

/// Otomatik rotation (Enterprise plan)
pub async fn auto_rotate_key(
    pool: &PgPool,
    key_id: Uuid,
) -> Result<String, sqlx::Error> {
    // Yeni key oluştur
    let new_key = generate_api_key();
    let key_hash = hash_api_key(&new_key);

    // Eski key'i deaktif et
    sqlx::query(
        "UPDATE api_keys SET revoked = true, revoked_at = NOW() WHERE id = $1"
    )
    .bind(key_id)
    .execute(pool)
    .await?;

    // Yeni key'i kaydet
    sqlx::query(
        "INSERT INTO api_keys (customer_id, name, key_hash, key_prefix, rotated_from)
         SELECT customer_id, name, $2, $3, $1 FROM api_keys WHERE id = $1"
    )
    .bind(key_id)
    .bind(&key_hash)
    .bind(&new_key[..15])
    .execute(pool)
    .await?;

    Ok(new_key)
}
```

### 6.2 Signing Secret Rotation

```rust
/// Endpoint signing secret rotation (24 saat overlap)
pub async fn rotate_signing_secret(
    pool: &PgPool,
    endpoint_id: Uuid,
) -> Result<(String, String), sqlx::Error> {
    let new_secret = generate_signing_secret();

    // Eski secret'ı 24 saat daha tut
    sqlx::query(
        "UPDATE endpoints SET
         previous_signing_secret = signing_secret,
         previous_secret_expires_at = NOW() + INTERVAL '24 hours',
         signing_secret = $1,
         secret_rotated_at = NOW()
         WHERE id = $2"
    )
    .bind(&new_secret)
    .bind(endpoint_id)
    .execute(pool)
    .await?;

    let old_secret: Option<(String,)> = sqlx::query_as(
        "SELECT previous_signing_secret FROM endpoints WHERE id = $1"
    )
    .bind(endpoint_id)
    .fetch_one(pool)
    .await?;

    Ok((old_secret.map(|(s,)| s).unwrap_or_default(), new_secret))
}
```

### 6.3 Faz 4 Doğrulama

- [ ] Rotation policy tanımlı (90 gün)
- [ ] Uyarı e-postası gönderiliyor
- [ ] Otomatik rotation çalışıyor (Enterprise)
- [ ] Signing secret rotation 24 saat overlap ile çalışıyor

---

## 7. Faz 5: DDoS Protection

> **Süre:** 1-2 oturum | **Etki:** DDoS saldırıları engellenir | **Risk:** Düşük

### 7.1 Multi-Layer DDoS Protection

```rust
// security/ddos.rs — YENİ DOSYA

/// DDoS koruma katmanları
pub struct DdosProtection {
    /// Katman 1: IP-based rate limiting
    pub ip_limiter: RateLimiter,
    /// Katman 2: Endpoint-based rate limiting
    pub endpoint_limiter: RateLimiter,
    /// Katman 3: Global rate limiting
    pub global_limiter: RateLimiter,
    /// Katman 4: Behavioral analysis
    pub behavioral: BehavioralAnalyzer,
}

impl DdosProtection {
    /// Request'i kontrol et
    pub async fn check_request(
        &self,
        ip: &str,
        endpoint_id: Option<Uuid>,
        customer_id: Option<Uuid>,
    ) -> DdosResult {
        // Katman 1: IP limit
        let ip_result = self.ip_limiter.check(ip, 1000, 60).await;
        if !ip_result.allowed {
            return DdosResult::Blocked("IP rate limit exceeded".into());
        }

        // Katman 2: Endpoint limit
        if let Some(eid) = endpoint_id {
            let ep_result = self.endpoint_limiter.check(&eid.to_string(), 100, 60).await;
            if !ep_result.allowed {
                return DdosResult::Blocked("Endpoint rate limit exceeded".into());
            }
        }

        // Katman 3: Global limit
        let global_result = self.global_limiter.check("global", 10000, 60).await;
        if !global_result.allowed {
            return DdosResult::Blocked("Global rate limit exceeded".into());
        }

        DdosResult::Allowed
    }
}

pub enum DdosResult {
    Allowed,
    Blocked(String),
    Challenged(String),  // CAPTCHA veya challenge
}
```

### 7.2 Cloudflare Entegrasyonu (Opsiyonel)

```yaml
# cloudflare-rules.yml — Cloudflare WAF kuralları
rules:
  - name: "Block known bad IPs"
    action: block
    expression: "ip.src in $bad_ips"

  - name: "Rate limit API"
    action: rate_limit
    expression: "http.request.uri.path matches \"^/v1/\""
    rate_limit:
      threshold: 100
      period: 60
      action: block

  - name: "Challenge suspicious traffic"
    action: challenge
    expression: "cf.threat_score > 10"
```

### 7.3 Faz 5 Doğrulama

- [ ] IP-based rate limiting çalışıyor
- [ ] Endpoint-based rate limiting çalışıyor
- [ ] Global rate limiting çalışıyor
- [ ] DDoS simülasyonu engelleniyor

---

## 8. Faz 6: Security Headers & CSP

> **Süre:** 1 oturum | **Etki:** XSS, clickjacking engellenir | **Risk:** Çok düşük

### 8.1 Security Headers

```rust
// middleware/security_headers.rs — YENİ DOSYA

/// Security headers middleware
pub async fn security_headers(req: Request, next: Next) -> Response {
    let mut response = next.run(req).await;
    let headers = response.headers_mut();

    // HSTS — HTTPS zorunlu
    headers.insert(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload".parse().unwrap(),
    );

    // XSS Protection
    headers.insert("X-XSS-Protection", "1; mode=block".parse().unwrap());

    // Content Type Options
    headers.insert("X-Content-Type-Options", "nosniff".parse().unwrap());

    // Frame Options — clickjacking engelleme
    headers.insert("X-Frame-Options", "DENY".parse().unwrap());

    // Referrer Policy
    headers.insert("Referrer-Policy", "strict-origin-when-cross-origin".parse().unwrap());

    // Permissions Policy
    headers.insert(
        "Permissions-Policy",
        "camera=(), microphone=(), geolocation=(), payment=()".parse().unwrap(),
    );

    response
}
```

### 8.2 Content Security Policy

```rust
/// CSP header — XSS engelleme
pub fn csp_header() -> String {
    vec![
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "connect-src 'self' https://api.hooksniff.com wss://ws.hooksniff.com",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "upgrade-insecure-requests",
    ].join("; ")
}
```

### 8.3 Faz 6 Doğrulama

- [ ] HSTS header mevcut
- [ ] XSS Protection mevcut
- [ ] CSP header mevcut
- [ ] Clickjacking engelleniyor
- [ ] SecurityHeaders.com test: A+ skoru

---

## 9. Faz 7: Penetration Testing Framework

> **Süre:** 2 oturum | **Etki:** Zafiyetler otomatik tespit edilir | **Risk:** Orta (dikkatli kullanılmalı)

### 9.1 Automated Security Tests

```rust
// tests/security/ — Güvenlik testleri

/// OWASP API Security test senaryoları
#[cfg(test)]
mod owasp_tests {
    use super::*;

    /// API1: Object-level authorization
    #[tokio::test]
    async fn test_api1_object_level_auth() {
        // Başka kullanıcının endpoint'ine erişim denemesi → 403
    }

    /// API2: Broken authentication
    #[tokio::test]
    async fn test_api2_broken_auth() {
        // Geçersiz token → 401
        // Süresi dolmuş token → 401
        // Boş header → 401
    }

    /// API3: Property-level authorization
    #[tokio::test]
    async fn test_api3_property_auth() {
        // signing_secret field'ı sadece owner'a görünür
    }

    /// API4: Resource consumption
    #[tokio::test]
    async fn test_api4_resource_consumption() {
        // 1000 sayfa → max 100'e sınırlanır
        // 10MB payload → reddedilir
    }

    /// API6: Business flow abuse
    #[tokio::test]
    async fn test_api6_business_flow() {
        // Bot user agent → tespit edilir
        // Honeypot endpoint → bot tuzağı
    }

    /// API7: SSRF
    #[tokio::test]
    async fn test_api7_ssrf() {
        // 127.0.0.1 → engellenir
        // 10.0.0.1 → engellenir
        // 169.254.169.254 → engellenir
        // metadata.google.internal → engellenir
    }

    /// API8: Security misconfiguration
    #[tokio::test]
    async fn test_api8_security_headers() {
        // HSTS mevcut
        // CSP mevcut
        // X-Frame-Options: DENY
    }

    /// API10: Unsafe API consumption
    #[tokio::test]
    async fn test_api10_unsafe_consumption() {
        // Webhook signature doğrulama
        // Timeout uygulanıyor
    }
}
```

### 9.2 Fuzzing

```rust
// tests/fuzz/ — Fuzzing testleri

/// Payload fuzzing — rastgele veri ile test
#[cfg(test)]
mod fuzz_tests {
    use super::*;

    #[tokio::test]
    async fn fuzz_webhook_payload() {
        let payloads = vec![
            "",                           // Boş
            "null",                       // Null
            "{\"a\":}".                   // Geçersiz JSON
            "A".repeat(10_000_000),       // 10MB
            "\x00\x01\x02",             // Binary
            "<script>alert(1)</script>", // XSS
            "'; DROP TABLE--",           // SQL injection
            "../../../etc/passwd",       // Path traversal
        ];

        for payload in payloads {
            let result = send_webhook(payload).await;
            // Hiçbir durumda crash olmamalı
            assert!(result.is_ok() || result.status() == 400);
        }
    }
}
```

### 9.3 Faz 7 Doğrulama

- [ ] OWASP test senaryoları geçiyor
- [ ] Fuzzing testleri geçiyor (crash yok)
- [ ] SQL injection denemeleri engelleniyor
- [ ] XSS denemeleri engelleniyor
- [ ] Path traversal denemeleri engelleniyor

---

## 10. Faz 8: Incident Response & Forensics

> **Süre:** 1-2 oturum | **Etki:** Olay müdahalesi otomatikleşir | **Risk:** Düşük

### 10.1 Incident Response Plan

```rust
// security/incident.rs — YENİ DOSYA

/// Olay müdahalesi
pub struct IncidentResponse {
    pub detection_time: chrono::DateTime<chrono::Utc>,
    pub severity: Severity,
    pub affected_customers: Vec<Uuid>,
    pub actions_taken: Vec<String>,
    pub status: IncidentStatus,
}

pub enum IncidentStatus {
    Detected,
    Investigating,
    Contained,
    Eradicated,
    Recovered,
    Closed,
}

/// Otomatik olay müdahalesi
pub async fn handle_incident(
    pool: &PgPool,
    event: &SecurityEvent,
) -> Result<IncidentResponse, sqlx::Error> {
    let mut response = IncidentResponse {
        detection_time: chrono::Utc::now(),
        severity: event.severity.clone(),
        affected_customers: vec![],
        actions_taken: vec![],
        status: IncidentStatus::Detected,
    };

    // 1. Olayı kaydet
    sqlx::query(
        "INSERT INTO security_incidents (detection_time, severity, event_type, details)
         VALUES ($1, $2, $3, $4)"
    )
    .bind(&response.detection_time)
    .bind(response.severity.as_str())
    .bind(&event.event_type)
    .bind(&event.details)
    .execute(pool)
    .await?;

    // 2. Otomatik containment
    match event.severity {
        Severity::Critical => {
            // IP'yi engelle
            block_ip(pool, &event.ip_address).await?;
            response.actions_taken.push(format!("Blocked IP: {}", event.ip_address));

            // Etkilenen müşterileri uyar
            notify_affected_customers(pool, &event).await?;
            response.actions_taken.push("Notified affected customers".to_string());

            response.status = IncidentStatus::Contained;
        }
        Severity::High => {
            // Rate limit artır
            increase_rate_limit(pool, &event.ip_address).await?;
            response.actions_taken.push(format!("Rate limited IP: {}", event.ip_address));

            response.status = IncidentStatus::Investigating;
        }
        _ => {
            response.status = IncidentStatus::Investigating;
        }
    }

    Ok(response)
}
```

### 10.2 Forensic Logging

```rust
/// Forensic log — detaylı olay kaydı
pub async fn log_forensic(
    pool: &PgPool,
    event: &SecurityEvent,
) -> Result<(), sqlx::Error> {
    sqlx::query(
        "INSERT INTO forensic_logs (
            timestamp, event_type, severity,
            source_ip, user_agent, request_path, request_method,
            request_headers, request_body,
            response_status, response_body,
            customer_id, session_id, trace_id
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)"
    )
    .bind(chrono::Utc::now())
    .bind(&event.event_type)
    .bind(event.severity.as_str())
    .bind(&event.ip_address)
    .bind(&event.user_agent)
    .bind(&event.request_path)
    .bind(&event.request_method)
    .bind(&event.request_headers)
    .bind(&event.request_body)
    .bind(event.response_status)
    .bind(&event.response_body)
    .bind(event.customer_id)
    .bind(&event.session_id)
    .bind(&event.trace_id)
    .execute(pool)
    .await?;

    Ok(())
}
```

### 10.3 Faz 8 Doğrulama

- [ ] Incident response planı tanımlı
- [ ] Otomatik containment çalışıyor
- [ ] Forensic logging çalışıyor
- [ ] Olay müdahalesi < 5 dakika

---

## 11. Faz 9: Zero Trust Architecture

> **Süre:** 2 oturum | **Etki:** İç tehdit riski azalır | **Risk:** Orta

### 11.1 Zero Trust Prensipleri

```rust
// security/zero_trust.rs — YENİ DOSYA

/// Zero Trust — "hiçbir şeye güvenme, her şeyi doğrula"
pub struct ZeroTrustPolicy {
    /// Her istek için doğrulama
    pub verify_every_request: bool,
    /// En az yetki prensibi
    pub least_privilege: bool,
    /// Micro-segmentation
    pub micro_segmentation: bool,
    /// Continuous verification
    pub continuous_verification: bool,
}

/// Her istek için doğrulama
pub async fn verify_request(
    pool: &PgPool,
    request: &Request,
) -> Result<TrustLevel, AppError> {
    let mut trust = TrustLevel::Untrusted;

    // 1. Token doğrulama
    if let Some(token) = extract_token(request) {
        if verify_token(&token).await? {
            trust = TrustLevel::Authenticated;
        }
    }

    // 2. IP doğrulama
    let ip = extract_ip(request);
    if is_known_good_ip(pool, ip).await? {
        trust = trust.elevate(TrustLevel::TrustedIp);
    }

    // 3. Device doğrulama
    if let Some(device_id) = extract_device_id(request) {
        if is_known_device(pool, device_id).await? {
            trust = trust.elevate(TrustLevel::TrustedDevice);
        }
    }

    // 4. Behavioral doğrulama
    if is_normal_behavior(pool, request).await? {
        trust = trust.elevate(TrustLevel::NormalBehavior);
    }

    Ok(trust)
}

pub enum TrustLevel {
    Untrusted,
    Authenticated,
    TrustedIp,
    TrustedDevice,
    NormalBehavior,
    FullyTrusted,
}
```

### 11.2 En Az Yetki Prensibi

```rust
/// En az yetki — sadece gerekli izinler
pub fn apply_least_privilege(
    customer: &Customer,
    resource: &str,
    action: &str,
) -> bool {
    let permissions = get_customer_permissions(customer);

    // Varsayılan: hiçbir izin yok
    let required_permission = format!("{}:{}", resource, action);

    permissions.contains(&required_permission)
}
```

### 11.3 Faz 9 Doğrulama

- [ ] Her istek doğrulanıyor
- [ ] En az yetki uygulanıyor
- [ ] Micro-segmentation çalışıyor
- [ ] Continuous verification çalışıyor

---

## 12. Faz 10: Compliance & Audit

> **Süre:** 1-2 oturum | **Etki:** Compliance otomatikleşir | **Risk:** Düşük

### 12.1 Compliance Checklist

```rust
// security/compliance.rs — YENİ DOSYA

/// Compliance kontrolü
pub async fn run_compliance_check(
    pool: &PgPool,
) -> Result<ComplianceReport, sqlx::Error> {
    let mut report = ComplianceReport::new();

    // GDPR kontrolü
    report.add_check("GDPR", "Data export endpoint exists", check_gdpr_export(pool).await?);
    report.add_check("GDPR", "Account deletion endpoint exists", check_gdpr_delete(pool).await?);
    report.add_check("GDPR", "Data retention policy", check_retention_policy(pool).await?);

    // SOC 2 kontrolü
    report.add_check("SOC2", "Audit logging enabled", check_audit_logging(pool).await?);
    report.add_check("SOC2", "Access control implemented", check_access_control(pool).await?);
    report.add_check("SOC2", "Encryption at rest", check_encryption_at_rest(pool).await?);

    // PCI DSS (opsiyonel)
    report.add_check("PCI", "No card data stored", check_no_card_data(pool).await?);

    Ok(report)
}

pub struct ComplianceReport {
    pub checks: Vec<ComplianceCheck>,
    pub score: f64,
    pub timestamp: chrono::DateTime<chrono::Utc>,
}

pub struct ComplianceCheck {
    pub framework: String,    // GDPR, SOC2, PCI
    pub check_name: String,
    pub passed: bool,
    pub details: String,
}
```

### 12.2 Faz 10 Doğrulama

- [ ] GDPR kontrolü geçiyor
- [ ] SOC 2 kontrolü geçiyor
- [ ] Compliance raporu üretiliyor
- [ ] Periyodik kontrol (haftalık)

---

## 13. Grafana Metrikleri & Monitoring

### 13.1 Yeni Metrikler

```rust
// security/metrics.rs

// Threat detection
pub static THREATS_DETECTED: AtomicU64 = AtomicU64::new(0);
pub static THREATS_BLOCKED: AtomicU64 = AtomicU64::new(0);
pub static FALSE_POSITIVES: AtomicU64 = AtomicU64::new(0);

// DDoS
pub static DDOS_ATTACKS_DETECTED: AtomicU64 = AtomicU64::new(0);
pub static DDOS_REQUESTS_BLOCKED: AtomicU64 = AtomicU64::new(0);

// Secret rotation
pub static KEYS_ROTATED: AtomicU64 = AtomicU64::new(0);
pub static SECRETS_ROTATED: AtomicU64 = AtomicU64::new(0);

// Compliance
pub static COMPLIANCE_SCORE: AtomicU64 = AtomicU64::new(0); // percentage

// Incident response
pub static INCIDENTS_DETECTED: AtomicU64 = AtomicU64::new(0);
pub static INCIDENTS_CONTAINED: AtomicU64 = AtomicU64::new(0);
pub static INCIDENT_RESPONSE_TIME_MS: AtomicU64 = AtomicU64::new(0);
```

### 13.2 Grafana Dashboard Panelleri

```json
{
  "panels": [
    {
      "title": "Threats Detected (son 24s)",
      "targets": [{"expr": "rate(hooksniff_threats_detected[24h])"}],
      "type": "stat",
      "alert": {
        "name": "High Threat Rate",
        "condition": "rate(hooksniff_threats_detected[1h]) > 10",
        "message": "Unusual number of threats detected"
      }
    },
    {
      "title": "DDoS Attacks Blocked",
      "targets": [{"expr": "hooksniff_ddos_requests_blocked"}],
      "type": "stat"
    },
    {
      "title": "Secret Rotation Status",
      "targets": [
        {"expr": "hooksniff_keys_rotated", "legendFormat": "API Keys"},
        {"expr": "hooksniff_secrets_rotated", "legendFormat": "Signing Secrets"}
      ],
      "type": "stat"
    },
    {
      "title": "Compliance Score (%)",
      "targets": [{"expr": "hooksniff_compliance_score"}],
      "type": "gauge",
      "thresholds": [
        {"value": 90, "color": "green"},
        {"value": 70, "color": "yellow"},
        {"value": 50, "color": "red"}
      ]
    },
    {
      "title": "Incident Response Time",
      "targets": [{"expr": "hooksniff_incident_response_time_ms"}],
      "type": "timeseries",
      "thresholds": [
        {"value": 300000, "color": "green"},   // 5 dakika
        {"value": 900000, "color": "yellow"},  // 15 dakika
        {"value": 3600000, "color": "red"}     // 1 saat
      ]
    }
  ]
}
```

---

## 14. Test & Doğrulama

### 14.1 Güvenlik Test Senaryoları

```bash
# OWASP ZAP ile otomatik tarama
docker run -t owasp/zap2docker-stable zap-api-scan.py \
  -t https://hooksniff-api.run.app/v1/openapi.json \
  -f openapi -r zap-report.html

# SQL injection testi
curl -X POST $API_URL/v1/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"event":"test'\'' OR 1=1--","data":{}}'

# XSS testi
curl -X POST $API_URL/v1/webhooks \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"event":"<script>alert(1)</script>","data":{}}'

# SSRF testi
curl -X POST $API_URL/v1/endpoints \
  -H "Authorization: Bearer $API_KEY" \
  -d '{"url":"http://169.254.169.254/latest/meta-data/"}'

# Path traversal testi
curl $API_URL/v1/../../../etc/passwd
```

### 14.2 Before/After Karşılaştırma

| Metrik | Before | After | İyileşme |
|--------|--------|-------|----------|
| OWASP uyumluluğu | 6/10 | 10/10 | **+4** |
| Threat detection | Kural tabanlı | ML tabanlı | **Adaptif** |
| Supply chain | ❌ | ✅ | **Yeni** |
| Secret rotation | Manuel | Otomatik | **∞** |
| DDoS protection | ❌ | ✅ | **Yeni** |
| Security headers | B eksik | A+ | **Mükemmel** |
| Incident response | ❌ | ✅ | **Yeni** |
| Zero trust | ❌ | ✅ | **Yeni** |
| Compliance | Kısmen | Tam | **Mükemmel** |
| **Güvenlik puanı** | **7/10** | **10/10** | **+3 puan** |

---

## 15. Rollback Planı

```bash
# Security headers devre dışı bırak
# middleware'den security_headers fonksiyonunu kaldır

# DDoS protection devre dışı bırak
USE_DDOS_PROTECTION=false

# Bot detection devre dışı bırak
USE_BOT_DETECTION=false

# Otomatik rotation devre dışı bırak
AUTO_ROTATE_KEYS=false
```

---

## 16. Zaman Çizelgesi

| Faz | Süre | Etki | Oturum |
|-----|------|------|--------|
| **Faz 1:** OWASP Uyumluluğu | 2-3 oturum | Tüm OWASP kategorileri | 1-3 |
| **Faz 2:** Advanced Threat Detection | 2 oturum | ML tabanlı tespit | 4-5 |
| **Faz 3:** Supply Chain Security | 1-2 oturum | Bağımlılık zafiyetleri | 6-7 |
| **Faz 4:** Secret Management | 1-2 oturum | Otomatik rotation | 8-9 |
| **Faz 5:** DDoS Protection | 1-2 oturum | DDoS engelleme | 10-11 |
| **Faz 6:** Security Headers | 1 oturum | A+ skoru | 12 |
| **Faz 7:** Penetration Testing | 2 oturum | Zafiyet tespiti | 13-14 |
| **Faz 8:** Incident Response | 1-2 oturum | Otomatik müdahale | 15-16 |
| **Faz 9:** Zero Trust | 2 oturum | İç tehdit koruması | 17-18 |
| **Faz 10:** Compliance | 1-2 oturum | Otomatik audit | 19-20 |

**Toplam:** ~20 oturum, **$0 ek maliyet**

### Beklenen Sonuçlar

| Kategori | Before | After |
|----------|--------|-------|
| OWASP uyumluluğu | 6/10 | 10/10 |
| Threat detection | 5/10 | 9/10 |
| Supply chain | 2/10 | 9/10 |
| Secret management | 6/10 | 9/10 |
| DDoS protection | 1/10 | 9/10 |
| Security headers | 5/10 | 10/10 |
| Penetration testing | 3/10 | 9/10 |
| Incident response | 2/10 | 9/10 |
| Zero trust | 1/10 | 9/10 |
| Compliance | 4/10 | 9/10 |
| **Genel** | **7/10** | **10/10** |

---

## 📚 Kaynaklar

- [OWASP API Security Top 10 2023](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [Standard Webhooks](https://www.standardwebhooks.com/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/archive/2023/2023_top25_list.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [Cloudflare DDoS Protection](https://www.cloudflare.com/ddos/)
- [cargo-deny](https://github.com/EmbarkStudios/cargo-deny)
- [OWASP ZAP](https://www.zaproxy.org/)

---

*Bu plan HookSniff'i sektörün en güvenli webhook platformu yapmayı hedefler.*
*Son güncelleme: 2026-05-26*
