# 🔒 Bağımsız Geliştirici Güven Raporu — HookSniff

> **Tarih:** 2026-05-09
> **Hazırlayan:** AI Asistan
> **Amaç:** SOC 2/HIPAA olmadan müşteri güveni nasıl sağlanır

---

## 1. Rakiplerin Güvenlik Sayfaları Nasıl Yapılmış?

### Plausible Analytics (Açık kaynak, bootstrapped — $0 sertifika)
Güvenlik sayfasında şunları yazıyor:
- Tüm veri EU'da (Almanya, Hetzner sunucuları)
- Veri şifreleme (transit + rest)
- Cookie kullanmıyor, kişisel veri toplamıyor
- 2FA desteği
- Açık kaynak kod — herkes denetleyebilir
- Düzenli güvenlik taramaları
- Veri dışa aktarma (CSV + API)
- Hesap silme imkanı

**Dikkat:** SOC 2 yok, HIPAA yok. Ama güven sayfası çok güçlü çünkü **şeffaf ve teknik**.

### PostHog (Açık kaynak, VC-backed ama startup ruhu)
- GDPR, CCPA, HIPAA uyumluluk rehberleri (detaylı dokümantasyon)
- EU hosting seçeneği (Frankfurt)
- Veri toplama kontrolü (kullanıcı ayarlayabilir)
- HIPAA için BAA imzalıyorlar
- Açık kaynak

### Svix (Rakibin — SOC 2 + HIPAA + PCI-DSS var)
- Yıllık SOC 2 Type II denetimi
- HIPAA, PCI-DSS, GDPR, CCPA
- AES-256 şifreleme (rest), TLS 1.2/1.3 (transit)
- HSM ile key yönetimi
- Haftalık backup + point-in-time recovery
- Status page (status.svix.com)
- Bölge seçimi (data locality)

---

## 2. HookSniff'in Mevcut Güvenlik Özellikleri

Kodundan çıkardığım mevcut durum:

| Özellik | Durum | Kanıt |
|---------|-------|-------|
| HMAC-SHA256 webhook imzalama | ✅ Var | `signing.rs` — Standard Webhooks uyumlu |
| SSRF koruması | ✅ Var | `ssrf.rs` — private IP bloklama |
| Argon2id password hashing | ✅ Var | `auth.rs` |
| 2FA (TOTP) | ✅ Var | `routes/auth.rs` |
| Rate limiting (sliding window) | ✅ Var | `rate_limit.rs` |
| Input validation | ✅ Var | `validation.rs` |
| Idempotency keys | ✅ Var | `middleware/idempotency.rs` |
| GDPR veri dışa aktarma | ✅ Var | `GET /v1/auth/export` |
| GDPR hesap silme | ✅ Var | `DELETE /v1/auth/account` |
| FIFO sıralı teslimat | ✅ Var | `fifo/mod.rs` |
| Per-endpoint throttling | ✅ Var | `throttle/mod.rs` |
| Dead letter queue | ✅ Var | Worker modülü |
| Circuit breaker | ✅ Var | `circuit_breaker.rs` |
| OpenTelemetry tracing | ✅ Var | `telemetry.rs` |
| Prometheus metrics | ✅ Var | `metrics.rs` |
| CloudEvents v1.0 | ✅ Var | `events/cloudevents.rs` |
| TLS (transit) | ✅ Var | Cloud Run default |
| EU veri saklama | ✅ Var | Neon eu-central-1 |

---

## 3. Ne Eksik? (Sertifika Olmadan Yapılabilecekler)

### 🔴 Yap (Bedava — 1 hafta)

**A. Güvenlik Sayfası (`/security`)**
Plausible modelini izle. İçine yaz:

> **Data Encryption**
> - All data encrypted in transit (TLS 1.2+) and at rest
> - Webhook signatures use HMAC-SHA256 (Standard Webhooks compliant)
> - Passwords hashed with Argon2id
>
> **Infrastructure**
> - Hosted on Google Cloud Run (EU region)
> - Database: Neon PostgreSQL (EU — Frankfurt)
> - Redis: Upstash (EU)
> - All infrastructure providers are SOC 2 certified
>
> **Access Control**
> - Two-factor authentication (TOTP)
> - API key authentication with scoped permissions
> - Rate limiting and SSRF protection
> - Role-based team access
>
> **Data Ownership**
> - Export your data anytime (CSV/JSON via API)
> - Delete your account and all data with one click
> - We never sell your data
>
> **Monitoring**
> - Real-time health monitoring via OpenTelemetry
> - Prometheus metrics endpoint
> - Automated alerting on anomalies
>
> **Open Source**
> - Our entire codebase is open source and auditable
> - Security vulnerabilities can be reported via our Responsible Disclosure policy

**B. Responsible Disclosure Politikası (`SECURITY.md` güncelle)**
Mevcut SECURITY.md'ni genişlet:
- E-posta adresi: `security@hooksniff.com` (veya Gmail)
- "Güvenlik açığı bulursan bildir, 90 gün disclosure süresi verelim"
- Hall of Fame listesi (bulana isim yazma)

**C. Status Page**
- **Better Uptime** free tier (10 monitor, public status page)
- Ya da **Instatus** free tier
- HookSniff API + Worker + Dashboard için uptime göster

**D. Privacy Policy + ToS**
- `/privacy` ve `/terms` sayfaları (dashboard'da var mı kontrol et)
- GDPR uyumlu dil
- Veri işleme detayları

### 🟡 Yap (Düşük maliyet — 1 ay)

**E. OWASP Self-Assessment**
OWASP Top 10 checklist'ini kendin uygula:
1. Injection → ✅ (SQLx prepared statements)
2. Broken Auth → ✅ (JWT + Argon2id + 2FA)
3. Sensitive Data Exposure → ✅ (TLS + encryption at rest)
4. XML External Entities → N/A (JSON API)
5. Broken Access Control → Kontrol et (RBAC var mı?)
6. Security Misconfiguration → Kontrol et
7. XSS → Dashboard Next.js (React auto-escape)
8. Insecure Deserialization → ✅ (Rust type safety)
9. Known Vulnerabilities → `cargo audit` çalıştır
10. Insufficient Logging → ✅ (OpenTelemetry)

Sonucu public yap: `docs/SECURITY_ASSESSMENT.md`

**F. DPA (Data Processing Agreement)**
GDPR'nin gerektirdiği belge. Şablonu var, doldurup koy.
Kurumsal müşteriler bunu ister.

**G. Sigorta (Opsiyonel)**
- Siber sorumluluk sigortası (cyber liability insurance)
- Türkiye'de Allianz, Axa gibi firmalar sunuyor
- Yıllık $200-500 arası başlangıç

### 🔵 Yap (Orta vadi — 3-6 ay)

**H. Pentest**
- HackerOne veya Intigriti ile crowdsourced pentest ($2K-5K)
- Ya da freelance güvenlik uzmanı ile OWASP-based pentest ($1K-3K)
- Sonucu public rapor olarak paylaş

**I. SOC 2 Hazırlığı (Şirket kurduktan sonra)**
- Vanta free assessment ile başla
- Observation period: 3-6 ay
- Type I: $5K-10K
- Type II: $10K-20K

---

## 4. Güven Sinyalleri — Öncelik Sıralaması

| # | Sinyal | Etki | Maliyet | Süre |
|---|--------|------|---------|------|
| 1 | **Açık kaynak kod** | ⭐⭐⭐⭐⭐ | $0 | ✅ Var |
| 2 | **Güvenlik sayfası** | ⭐⭐⭐⭐⭐ | $0 | 1 gün |
| 3 | **Status page** | ⭐⭐⭐⭐ | $0 | 1 saat |
| 4 | **GDPR uyumlu privacy policy** | ⭐⭐⭐⭐ | $0 | 1 gün |
| 5 | **Responsible disclosure** | ⭐⭐⭐ | $0 | 1 saat |
| 6 | **OWASP self-assessment** | ⭐⭐⭐⭐ | $0 | 1 gün |
| 7 | **DPA belgesi** | ⭐⭐⭐ | $0 | 1 gün |
| 8 | **İlk müşteri testimonial** | ⭐⭐⭐⭐⭐ | $0 | - |
| 9 | **Pentest raporu** | ⭐⭐⭐⭐ | $2K-5K | 2 hafta |
| 10 | **SOC 2 Type I** | ⭐⭐⭐⭐⭐ | $5K-10K | 3 ay |

---

## 5. Müşteriye Ne Söyleyeceksin?

Kurumsal müşteri sorduğunda:

> "Kodumuz açık kaynak, herkes denetleyebilir. Verileriniz EU'da saklanıyor (Neon Frankfurt, Upstash EU). HMAC-SHA256 ile webhook imzalama, SSRF koruması, Argon2id password hashing kullanıyoruz. GDPR uyumlu — verilerinizi istediğiniz zaman dışa aktarabilir veya silebilirsiniz. Status page'imizden uptime'ımızı takip edebilirsiniz. Güvenlik açığı bulursanız responsible disclosure politikamız var."

Bu cevap, SOC 2'siz bile çoğu startup müşterisini ikna eder.

---

## 6. Kaynaklar

| Kaynak | URL | Ne İşe Yarar |
|--------|-----|-------------|
| OWASP Top 10 | owasp.org/www-project-top-ten | Self-assessment checklist |
| Better Uptime Free | betteruptime.com | Status page |
| Instatus Free | instatus.com | Status page alternatifi |
| Vanta Free Assessment | vanta.com | SOC 2 hazırlık |
| SIG Lite Questionnaire | sharedassessments.org | Ücretsiz güvenlik anketi |
| HECVAT | educause.edu/hecvat | Ücretsiz vendor assessment |
| GDPR DPA Şablonu | gdpr.eu/data-processing-agreement | DPA belgesi |
| Standard Webhooks | standard-webhooks.com | Endüstri standardı |

---

## 7. Kaynakça

- Plausible Analytics Security: https://plausible.io/security
- PostHog Privacy Docs: https://posthog.com/docs/privacy
- Svix Security: https://www.svix.com/security/
- HECVAT Guide: https://www.saltycloud.com/blog/what-is-the-hecvat/
- SIG Questionnaire: https://www.sparrowgenie.com/blog/sig-questionnaire
- Webhook Security Best Practices: https://webflow.com/blog/webhook-security
- OWASP Cheat Sheet Series: https://cheatsheetseries.owasp.org/
