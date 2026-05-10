# 🐛 HookSniff — MEGA DERİNLEMESİNE DENETİM (3. DALGA)

> **Tarih:** 2026-05-10 17:01-17:08 GMT+8  
> **Denetim Metodu:** 5 paralel AI agent — Rust satır okuma, component mantık, bağımlılık, test, SDK  
> **Taranan:** ~200+ dosya, ~30,000+ satır kod  

---

## 📊 3. DALGA ÖZETİ

| Agent | Kategori | 🔴 Crit | 🟠 High | 🟡 Med | 🟢 Low | **Toplam** |
|-------|----------|---------|---------|--------|--------|-----------|
| deep-rust-api | Rust API Güvenlik | 2 | 4 | 5 | 3 | **41** |
| deep-component-logic | React Mantık | 5 | 12 | 15 | 10 | **42** |
| deep-deps-config | Bağımlılık & Config | 2 | 8 | 9 | 6 | **25** |
| deep-test-coverage | Test Coverage | 6 | 0 | 0 | 0 | **6 kritik** |
| deep-sdk-docs | SDK & Dokümantasyon | 6 | 33 | 28 | 13 | **80** |
| **TOPLAM** | | **21** | **57** | **57** | **32** | **~194** |

---

## 🔴 KRİTİK SORUNLAR (21)

### Güvenlik Kritik (4)
| # | Dosya | Sorun |
|---|-------|-------|
| 1 | `routes/inbound.rs:385` | **Authorization bypass** — API key sadece prefix ile eşleştiriliyor, tam hash doğrulaması atlanmış |
| 2 | `routes/inbound.rs:385` | API key prefix 20 char ama `api_key_prefix` 15 char — eşleşme hatası |
| 3 | `.env.production.example` | **Gerçek Grafana Cloud token** base64 encoded — revoke et! |
| 4 | `playground/page.tsx:75-76` | Token localStorage'da — XSS riski |

### Component Mantık Kritik (5)
| # | Dosya | Sorun |
|---|-------|-------|
| 5 | `store.tsx` | Token her zaman `'cookie'` → tüm API istekleri anlamsız `Authorization: Bearer cookie` gönderiyor |
| 6 | `api-keys/page.tsx` | `credentials: 'include'` yanlışlıkla `headers` içinde → cookie auth hiç çalışmıyor |
| 7 | `search/page.tsx` | Her tuş vuruşunda API çağrısı (debounce yok) → rate limit riski |
| 8 | `health/page.tsx` | Token kullanmıyor — herkes sağlık verisine erişebilir |
| 9 | `store.tsx` | Playground hardcoded token — auth bypass |

### Config Kritik (2)
| # | Dosya | Sorun |
|---|-------|-------|
| 10 | `next.config.js` | `output: 'standalone'` eksik → Docker build başarısız olur |
| 11 | `next.config.js` | CSP'de `'unsafe-inline'` + `'unsafe-eval'` — XSS riski |

### SDK Kritik (6)
| # | Dosya | Sorun |
|---|-------|-------|
| 12 | SDK'lar | **3 farklı API URL** (api.hooksniff.com, GCP Cloud Run, api.hooksniff.dev) |
| 13 | Node.js SDK | npm `hooksniff-sdk` vs import `@hooksniff/sdk` — isim eşleşmiyor |
| 14 | Kotlin SDK | `TypeToken<T>` type erasure — generic deserialization crash olur |
| 15 | MCP | `api.hooksniff.dev` kullanıyor — bu URL başka yerde yok |
| 16 | CLI | `HOOKRELAY_*` env vars kullanıyor — `HOOKSNIFF_*` olmalı |
| 17 | 6 SDK | `X-Hookrelay-Signature` legacy header — `X-Hooksniff-Signature` olmalı |

### Test Kritik (6)
| # | Dosya | Satır | Sorun |
|---|-------|-------|-------|
| 18 | `api/src/db.rs` | 1,029 | **TEST YOK** — veritabanı katmanı |
| 19 | `worker/src/delivery/mod.rs` | 404 | **TEST YOK** — delivery state machine |
| 20 | `worker/src/main.rs` | 807 | **TEST YOK** — worker başlatma |
| 21 | Dashboard | — | AuthGuard, SSO — **TEST YOK** |

---

## 🟠 YÜKSEK SORUNLAR (57)

### Rust API (4)
- Billing webhook'larında rate limiting yok
- DNS rebinding TOCTOU açığı
- `DefaultHasher` idempotency hash'te (kriptografik değil)
- Password reset token URL'de

### Component Logic (12)
- Toast'ta dismiss/aria-live yok
- Email verification banner hata durumunda gizleniyor
- Client-side search + server-side pagination çelişkisi
- Status count'lar sadece mevcut sayfadan hesaplanıyor
- Dual onboarding modal
- Stale closure riskleri (4 useEffect)
- Unmount sonrası state güncelleme
- Notification preferences hardcoded
- Negatif threshold input
- SSR hydration mismatch

### Config (8)
- Dockerfile'larda Rust base image tag不稳定
- `lucide-react` hiç kullanılmıyor (~150KB wasted)
- ESLint 8 + Next.js 15 uyumsuzluğu
- `.gitignore`'da `.env` ignore edilmemiş
- HSTS header eksik
- Kullanılmayan Rust deps (cookie, async-stream, aes-gcm)
- Eski `rand`/`argon2` version
- Image wildcard remotePatterns

### SDK (33)
- 11 SDK'da retry logic yok
- Version mismatch (Kotlin 0.2.0 vs 0.3.0, Java 0.1.0 vs 0.2.0)
- OpenAPI schema vs actual API mismatch
- README API Reference sections eşleşmiyor
- Swift `SearchResource` tanımlı ama client'ta exposed değil
- 7 SDK'da test eksik
- Portal API key iframe URL'de exposed

---

## 📈 TÜM DALLARIN BİRLEŞTİRİLMİŞ ÖZETİ

| Dal | Taranan | Toplam Sorun |
|-----|---------|-------------|
| 1. Dalga (sayfa düzeyi) | ~70 sayfa | ~82 |
| 2. Dalga (kod satırı) | ~160 dosya | ~1,200+ |
| 3. Dalga (derin) | ~200+ dosya | ~194 |
| **GENEL TOPLAM** | **~200+ dosya** | **~1,476+** |

### En Kritik 20 Sorun (Tüm Dalgalar):
1. 🔴 Authorization bypass (inbound.rs)
2. 🔴 Token her zaman 'cookie' (store.tsx)
3. 🔴 API keys cookie auth çalışmıyor (api-keys/page.tsx)
4. 🔴 Playground token localStorage'da (XSS)
5. 🔴 Gerçek Grafana token .env.example'da
6. 🔴 3 farklı API URL (SDK tutarsızlığı)
7. 🔴 Kotlin generic crash
8. 🔴 db.rs 1,029 satır — TEST YOK
9. 🔴 worker/main.rs 807 satır — TEST YOK
10. 🔴 71 sayfada metadata eksik (SEO)
11. 🟠 920+ hardcoded İngilizce string
12. 🟠 0 htmlFor kullanımı (23+ dosya)
13. 🟠 63 useEffect'ten %75'inde cleanup eksik
14. 🟠 blog/[slug] 1922 satır mega component
15. 🟠 dangerouslySetInnerHTML (CSP bypass)
16. 🟠 ErrorBoundary tanımlı ama kullanılmamış
17. 🟠 13 tablo overflow-x-auto olmadan
18. 🟠 Search debounce yok
19. 🟠 Billing webhook rate limiting yok
20. 🟠 DNS rebinding TOCTOU açığı

---

## 📁 TÜM RAPOR DOSYALARI (.ai-context/visual-bugs/)

| Dosya | İçerik |
|-------|--------|
| `FULL-AUDIT-2026-05-10.md` | 1. Dalga — sayfa düzeyi |
| `DEEP-FINAL-2026-05-10.md` | 2. Dalga — birleştirilmiş |
| `DEEP-HARDCODED-STRINGS.md` | 920+ hardcoded string |
| `DEEP-A11Y-SEO.md` | Erişilebilirlik + SEO |
| `DEEP-CSS-STYLING.md` | CSS & responsive |
| `DEEP-TYPESCRIPT.md` | TypeScript & React |
| `DEEP-SECURITY-PERF.md` | Güvenlik & performans |
| `DEEP-I18N-JSON.md` | Çeviri JSON |
| `DEEP-RUST-API.md` | Rust API denetimi |
| `DEEP-COMPONENT-LOGIC.md` | Component mantık |
| `DEEP-DEPS-CONFIG.md` | Bağımlılık & config |
| `DEEP-TEST-COVERAGE.md` | Test coverage |
| `DEEP-SDK-DOCS.md` | SDK & dokümantasyon |

*13 rapor dosyası, ~15,000+ satır rapor, ~30,000+ satır kod analizi.*
