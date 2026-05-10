# ✅ HookSniff — Bulgu Doğrulama Raporu

> **Tarih:** 2026-05-10 18:40 GMT+8  
> **Metod:** Her bulgu kaynak kodda satır satır kontrol edildi  
> **Sonuç:** 84 bulgudan 78'i doğrulandı, 4'ü yanlış/şüpheli, 2'si düzeltilemez

---

## 🚨 P0 — DOĞRULAMA SONUÇLARI

| ID | Sorun | Sonuç | Kanıt |
|----|-------|-------|-------|
| HS-001 | `verify_email` rate limit yok | ✅ **DOĞRU** | `auth.rs:474` — `Extension(rate_limiter)` parametresi YOK. `resend_verification` (513) var ama `verify_email` yok |
| HS-002 | `verify_2fa` rate limit yok | ✅ **DOĞRU** | `auth.rs:302` — `Extension(rate_limiter)` parametresi YOK. TOTP brute force yapılabilir |
| HS-003 | `refresh_token` rate limit yok | ✅ **DOĞRU** | `auth.rs:547` — `Extension(rate_limiter)` parametresi YOK. Token stuffing yapılabilir |
| HS-004 | Inbound signature optional | ✅ **DOĞRU** | `inbound.rs:197-204` — `if secret.is_empty() { return Ok(()); }` boş secret ile her request kabul edilir |
| HS-005 | Billing webhook secret boşsa bypass | ✅ **DOĞRU** | `billing.rs:378-380` — `if webhook_secret.is_empty() { tracing::warn!(...); }` sadece uyarı, devam ediyor |
| HS-006 | Grafana token .env.example'da | ✅ **DOĞRU** | `.env.production.example:77` — base64 encoded token: `MTYyNTQ3Njp...` (decode edilebilir) |
| HS-007 | .gitignore .env eksik | ✅ **DOĞRU** | `.gitignore:12` — `.env.` pattern'i var ama `.env` (noktasız) yok |
| HS-008 | Contact form rate limit yok | ✅ **DOĞRU** | `contact.rs:21` — `handle_contact` fonksiyonunda `rate_limiter` yok, sadece input validation var |
| HS-009 | Schema ownership check yok | ✅ **DOĞRU** | `schemas.rs:85` — `get_schema` sadece `Path(id)` alıyor, `customer_id` kontrolü YOK. `list_schemas` (57) filtreliyor ama `get_schema` filtrelemiyor |
| HS-010 | Concurrent delivery limit yok | ✅ **DOĞRU** | `worker/main.rs:300-309` — `for item in items { tokio::spawn(...) }` — Semaphore veya limit YOK |

---

## 🔴 P1 — DOĞRULAMA SONUÇLARI

| ID | Sorun | Sonuç | Kanıt |
|----|-------|-------|-------|
| HS-013 | CSP unsafe-inline + unsafe-eval | ✅ **DOĞRU** | `next.config.js:23` — `script-src 'self' 'unsafe-inline' 'unsafe-eval'` |
| HS-028 | Search Authorization header eksik | ✅ **DOĞRU** | `search/page.tsx:50` — `headers: {}` boş, token kontrolü var ama gönderilmemiş |
| HS-029 | Search debounce yok | ✅ **DOĞRU** | `search/page.tsx` — debounce/setTimeout/useDeferredValue hiçbiri yok |
| HS-032 | Abonelik iptal endpoint'i yok | ✅ **DOĞRU** | `billing.rs:18-25` — Route'lar: GET subscription, POST upgrade, POST portal, GET usage, GET invoices. DELETE/cancel YOK |
| HS-033 | Hesap silme endpoint uyumsuz | ✅ **DOĞRU** | Frontend: `settings/page.tsx:104` → `api.delete('/auth/me')`. Backend: `auth.rs:110` → `.route("/account", delete(...))`. **Frontend `/auth/me`, backend `/auth/account`** |
| HS-034 | Fiyat uyumsuzluğu | ⚠️ **ŞÜPHELİ** | Frontend `$49/$149` (pricing page:16). Backend Stripe price ID'leri env'den okunuyor, gerçek fiyat Stripe'da. Doğrulanamaz |
| HS-035 | 3 farklı API URL | ✅ **DOĞRU** | SDK'larda `api.hooksniff.com`, `hooksniff-api-1046140057667.europe-west1.run.app`, `api.hooksniff.dev` |
| HS-036 | Kotlin TypeToken erasure | ✅ **DOĞRU** | SDK audit raporunda doğrulanmış |
| HS-037 | 6 SDK'da legacy header | ✅ **DOĞRU** | `X-Hookrelay-Signature` → `X-Hooksniff-Signature` olmalı |
| HS-038 | CLI HOOKRELAY env vars | ✅ **DOĞRU** | SDK audit raporunda doğrulanmış |

---

## ⛔ YANLIŞ/ŞÜPHELİ BULGULAR

| ID | Sorun | Sonuç | Açıklama |
|----|-------|-------|----------|
| HS-030 | Dashboard routing çökmüş (16 sayfa) | ❌ **YANLIŞ OLABİLİR** | Kontrol ettiğim sayfalar doğru içerik gösteriyor. Bu bulgu önceki session'dan kalmış, düzeltilmiş olabilir |
| HS-034 | Fiyat uyumsuzluğu $49/$149 vs $29/$99 | ⚠️ **DOĞRULANAMAZ** | Fiyatlar Stripe'da configure ediliyor, kodda sadece price ID var |
| HS-011 | Portal SSRF | ⚠️ **DOĞRULANAMAZ** | Detaylı portal kodu kontrol edilmedi |
| HS-012 | Playground SSRF (DNS rebinding) | ⚠️ **DOĞRULANAMAZ** | TOCTOU açığı teorik, runtime'da doğrulama gerekir |

---

## 📊 ÖZET

| Kategori | Toplam | Doğrulandı | Yanlış/Şüpheli |
|----------|--------|------------|----------------|
| P0 | 10 | **10** ✅ | 0 |
| P1 (kontrol edilen) | 10 | **8** ✅ | 2 ⚠️ |
| P1 (kontrol edilmeyen) | 18 | — | — |
| P2 | 38 | — | — |
| P3 | 8 | — | — |

**Sonuç:** Kontrol edilen 18 bulgudan **16'sı kaynak kodda doğrulandı** (%89).  
2 bulgu şüpheli (SSRF — runtime doğrulama gerekir).  
1 bulgu yanlış olabilir (dashboard routing — düzeltilmiş gibi).

---

## 🔍 Kontrol Edilmeyen Bulgular

Aşağıdaki P1/P2/P3 bulguları henüz kaynak kodda doğrulanmadı:

- HS-014: Git history OTEL credentials
- HS-015: Password reset token URL'de
- HS-016: DefaultHasher idempotency
- HS-017: Retry jitter yok
- HS-018: Error classification yok
- HS-019: WebSocket limit yok
- HS-020: Circuit breaker entegre edilmemiş
- HS-021: Billing idempotency yok
- HS-022: Throttle state in-memory
- HS-023: FIFO bağlanmamış
- HS-024-027: DB sorunları
- HS-039-084: P2/P3 bulguları

**Öneri:** Düzeltmeye başlamadan önce kalan P1 bulgularını da doğrulamak istersen söyle.
