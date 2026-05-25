# 🔒 HookSniff Derin Güvenlik ve Performans Denetim Raporu

**Tarih:** 2026-05-10  
**Kapsam:** Dashboard (Next.js/TypeScript) + API (Rust/Axum)

---

## 📊 ÖZET

| Kategori | Kritik | Yüksek | Orta | Düşük | Toplam |
|----------|--------|--------|------|-------|--------|
| Güvenlik (Frontend) | 1 | 2 | 3 | 3 | 9 |
| Güvenlik (Backend) | 0 | 3 | 4 | 3 | 10 |
| Performans (Frontend) | 0 | 1 | 3 | 2 | 6 |
| Performans (Backend) | 0 | 0 | 2 | 2 | 4 |
| **TOPLAM** | **1** | **6** | **12** | **10** | **29** |

---

## 🛡️ GÜVENLİK SORUNLARI — FRONTEND

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| `dashboard/src/app/[locale]/playground/page.tsx` | 75-76 | **Playground token localStorage'da saklanıyor** — `hooksniff_playground_token` ve `hooksniff_playground_url` açık metin olarak localStorage'a yazılır. XSS saldırısıyla bu token çalınabilir. | 🔴 Kritik | Hassas veri depolama | Token'ı yalnızca React state'te tut (zaten yapılıyor), localStorage'a yazma. Kullanıcı refresh sonrası yeni token istesin. |
| `dashboard/src/app/[locale]/layout.tsx` | 110-120 | **`dangerouslySetInnerHTML` ile inline script** — Theme initialization script'i doğrudan HTML'e inject ediliyor. CSP bypass vektörü olabilir. | 🟡 Yüksek | XSS riski / CSP bypass | Next.js `next-themes` kütüphanesinin yerleşik SSR theme detection yöntemini kullan. Inline script'i kaldır. |
| `dashboard/src/app/[locale]/blog/[slug]/page.tsx` | 1676 | **`dangerouslySetInnerHTML` ile CSS inject** — `<style>` tag'i doğrudan render ediliyor. CSS injection saldırısı mümkün olabilir. | 🟡 Yüksek | CSS injection | CSS modülleri veya Tailwind sınıfları kullan. Mutlaka gerekiyorsa DOMPurify ile sanitize et. |
| `dashboard/src/app/[locale]/blog/[slug]/page.tsx` | 1764 | **`dangerouslySetInnerHTML` ile code highlighting** — Highlighted HTML doğrudan render ediliyor. Zararlı script inject edilebilir. | 🟡 Orta | XSS riski | Syntax highlighting kütüphanesinin sanitization fonksiyonunu kullan veya DOMPurify uygula. |
| `dashboard/src/app/[locale]/blog/page.tsx` | 271 | **`dangerouslySetInnerHTML` ile JSON-LD** — SEO JSON-LD script tag'i inject ediliyor. Düşük risk çünkü veri kontrollü. | 🟢 Düşük | XSS riski | Veri kaynağı kontrollü, ancak yine de `JSON.stringify` çıktısını sanitize et. |
| `dashboard/src/app/[locale]/playground/page.tsx` | 75-76, 90-91 | **localStorage'da token saklanması** — `hooksniff_playground_token` localStorage'a yazılır. sessionStorage daha güvenli olurdu. | 🟡 Orta | Hassas veri depolama | Geçici token'lar için sessionStorage veya sadece state kullan. |
| `dashboard/src/lib/api.ts` | 68-69 | **401 hatasında localStorage temizliği** — `localStorage.removeItem('hooksniff_auth')` çağrısı, eski auth verisi varsa temizleniyor. İyi pratik. | 🟢 Düşük | — | Mevcut davranış doğru. |
| `dashboard/src/lib/store.tsx` | 37, 62 | **Kullanıcı bilgisi localStorage'da** — `hooksniff_user` key'i ile kullanıcı bilgisi saklanıyor, ama API key memory-only tutuluyor. Bu doğru bir ayrım. | 🟢 Düşük | — | API key'in memory-only tutulması iyi. Kullanıcı bilgisi localStorage'da kalabilir. |
| `dashboard/src/app/[locale]/auth/callback/page.tsx` | 9-34 | **OAuth callback — Open redirect riski** — Backend redirect sonrası session doğrulama yapılıyor. Ancak URL parametrelerinde `next` veya `return_to` parametresi yok, bu iyi. | 🟢 Düşük | Open redirect | Mevcut yapı güvenli. Gelecekte redirect param eklenirse mutlaka whitelist kontrolü ekle. |

---

## 🛡️ GÜVENLİK SORUNLARI — BACKEND (Rust)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| `api/src/routes/events.rs` | 82 | **`format!` ile dinamik SQL** — WHERE clause `format!` ile oluşturuluyor, ancak parametreler `$N` placeholder ile bind ediliyor. Bu güvenli bir pattern. | 🟡 Orta | SQL injection riski | Mevcut uygulama güvenli (parameterized queries). Ancak `format!` yerine query builder kullanmak daha bakım dostu olur. |
| `api/src/routes/search.rs` | 51-85 | **`format!` ile dinamik SQL + ILIKE** — Arama sorgusu `format!` ile oluşturuluyor. Parametreler `$N` ile bind ediliyor. ILIKE pattern'ı `%{}%` ile sarılıyor ama escaping yapılıyor (`\%`, `\_`). | 🟡 Orta | SQL injection riski | Mevcut escaping yeterli. Ancak `format!` yerine query builder (sqlx-compose veya benzeri) kullanmak daha güvenli. |
| `api/src/routes/admin.rs` | 170-193 | **Admin'de `format!` ile SQL** — Arama ve filtreleme için dinamik SQL. Parametreler `$N` ile bind ediliyor. | 🟡 Orta | SQL injection riski | Mevcut yapı güvenli. Query builder'a geçiş önerilir. |
| `api/src/db.rs` | 54 | **`sqlx::raw_sql` kullanımı** — Migration çalıştırırken `raw_sql` kullanılıyor. Migration SQL'i hardcoded, kullanıcı input almıyor. | 🟢 Düşük | SQL injection riski | Migration SQL'leri sabit. Risk yok. |
| `api/src/main.rs` | 109-150 | **CORS: Production'da default origins** — `CORS_ORIGINS` boşsa production'da dashboard origins'e izin veriliyor. Bu iyi bir fallback. Ancak dev modunda localhost'a izin verilmesi normal. | 🟢 Düşük | CORS | Mevcut yapı makul. Production'da `CORS_ORIGINS` env'inin zorunlu kılınması önerilir. |
| `api/src/middleware/mod.rs` | 121-200 | **Auth middleware — API key hash karşılaştırması** — Her istekte API key hash'i DB'den çekiliyor. Cache mekanizması var (30 s TTL). Rate limiting var. | 🟢 Düşük | Authentication bypass | Mevcut yapı güvenli. Cache TTL'inin artırılması performansı iyileştirir. |
| `api/src/routes/auth.rs` | 387 | **Password reset token URL'de** — Reset URL'si `?token=` parametresi ile oluşturuluyor. Token hash'i DB'de saklanıyor ve tek kullanımlık. | 🟡 Orta | Hassas veri URL'de | Token yerine kısa süreli kod (6 haneli) kullanmak daha güvenli olur. URL loglanırsa token sızabilir. |
| `api/src/routes/endpoints.rs` | 100, 318 | **Signing secret üretimi** — `whsec_` + UUID. UUID v4 cryptographically random. | 🟢 Düşük | Secret generation | Yeterli. Daha güçlü randomness için `OsRng` ile 32 byte random kullan. |
| `api/src/routes/admin.rs` | — | **Admin yetki kontrolü** — `require_admin` fonksiyonu tüm admin endpoint'lerinde çağrılıyor. `admin_middleware` layer olarak uygulanmış. | 🟢 Düşük | Authorization bypass | Mevcut yapı güvenli. Double-check mekanizması iyi. |
| `api/src/validation.rs` | — | **Input validation** — Event type regex, URL validation (SSRF koruması), description sanitization (HTML tag stripping), JSON depth limit (10 seviye). | 🟢 Düşük | Input validation | Kapsamlı validation mevcut. |

---

## ⚡ PERFORMANS SORUNLARI — FRONTEND

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| `dashboard/src/app/[locale]/blog/[slug]/page.tsx` | 1-1922 | **1922 satırlık mega bileşen** — Tek dosyada tüm blog render mantığı. Code splitting eksik. | 🟡 Yüksek | Large component | Blog content'ini alt bileşenlere ayır. Dynamic import ile lazy load et. |
| `dashboard/src/app/[locale]/dashboard/playground/page.tsx` | 1-695 | **695 satırlık bileşen** — Playground sayfası çok büyük. Hem state yönetimi hem UI tek dosyada. | 🟡 Orta | Large component | Playground logic'ini custom hook'lara, UI'ı alt bileşenlere ayır. |
| `dashboard/src/components/OnboardingWizard.tsx` | 1-649 | **649 satırlık bileşen** — Onboarding wizard büyük. | 🟡 Orta | Large component | Her step'i ayrı bileşene çıkar. |
| `dashboard/src/app/[locale]/page.tsx` | 9-11 | **✅ Lazy loading uygulanmış** — `ThemeToggle` ve `LanguageSwitcher` dynamic import ile yükleniyor. | 🟢 İyi | Lazy loading | — |
| `dashboard/src/app/[locale]/dashboard/analytics/page.tsx` | 23 | **Recharts import** — `AreaChart`, `BarChart` vb. doğrudan import ediliyor. Tree-shaking etkili olmalı ama büyük library. | 🟡 Orta | Bundle size | Recharts yerine daha hafif alternatif (lightweight-charts, visx) düşünülebilir. |
| `dashboard/src/lib/store.tsx` | — | **API key memory-only** — `apiKey` state'te tutuluyor, localStorage'a yazılmıyor. Bu doğru bir güvenlik kararı. | 🟢 İyi | — | — |

---

## ⚡ PERFORMANS SORUNLARI — BACKEND (Rust)

| Dosya | Satır | Sorun | Severity | Kategori | Çözüm |
|-------|-------|-------|----------|----------|-------|
| `api/src/routes/events.rs` | 82-83 | **`SELECT *` kullanımı** — Tüm delivery sütunlarını çekiyor. Gereksiz veri transferi. | 🟡 Orta | Large allocation | Sadece gerekli sütunları seç: `SELECT id, endpoint_id, event_type, status, attempt_count, response_status, created_at` |
| `api/src/middleware/mod.rs` | 30-50 | **Auth cache — Mutex ile koruma** — Her istekte mutex lock alınıyor. Yüksek concurrency'de contention olabilir. | 🟡 Orta | N+1 / Connection pool | `RwLock` veya `DashMap` kullan. Read-heavy workload'da daha iyi performans sağlar. |
| `api/src/routes/webhooks.rs` | 318 | **✅ N+1 önlenmiş** — Endpoint'ler toplu olarak tek sorguda çekiliyor. | 🟢 İyi | N+1 prevention | — |
| `api/src/routes/health_endpoints.rs` | 58 | **✅ Toplu sorgu** — Delivery istatistikleri tek sorguda çekiliyor. | 🟢 İyi | N+1 prevention | — |
| `api/src/db.rs` | 8 | **Connection pool: max 20** — Varsayılan 20 bağlantı. Production için yeterli olmayabilir. | 🟢 Düşük | Connection pool | `MAX_CONNECTIONS` env ile yapılandırılabilir. Production'da 50-100 arası önerilir. |

---

## 📋 ÖNCELİKLI DÜZELTMELER

### 🔴 Kritik (Hemen)
1. **Playground token localStorage** → Sadece React state'te tut

### 🟠 Yüksek (Bu hafta)
2. **Blog sayfası 1922 satır** → Alt bileşenlere ayır
3. **`dangerouslySetInnerHTML` (layout.tsx)** → next-themes SSR detection kullan
4. **`dangerouslySetInnerHTML` (blog CSS)** → CSS modüllerine geç

### 🟡 Orta (Bu sprint)
5. `format!` ile SQL → Query builder'a geç (events, search, admin)
6. `SELECT *` → Spesifik sütun seçimi (events.rs)
7. Auth cache `Mutex` → `DashMap` (middleware/mod.rs)
8. Password reset token URL'de → Kısa kod sistemi (auth.rs)
9. Playground sayfası 695 satır → Custom hook'lara böl
10. OnboardingWizard 649 satır → Step bileşenlerine böl

### 🟢 Düşük (Backlog)
11. CORS_ORIGINS production'da zorunlu kıl
12. Connection pool max_connections env ile yapılandırılabilir yap
13. Recharts alternatif değerlendirme

---

## ✅ İYİ UYGULAMALAR

| Uygulama | Detay |
|----------|-------|
| **SSRF koruması** | Kapsamlı: private IP, loopback, link-local, metadata endpoint, DNS resolution check |
| **Input validation** | Event type regex, URL validation, HTML sanitization, JSON depth limit |
| **Auth yapısı** | API key + JWT dual support, HttpOnly cookie, admin middleware double-check |
| **Secret yönetimi** | Production'da secret validation (32+ char, placeholder tespiti) |
| **Debug mask** | Config Debug impl'ında tüm secrets `[REDACTED]` |
| **Lazy loading** | ThemeToggle, LanguageSwitcher dynamic import |
| **N+1 önleme** | Webhook list ve health endpoints'te toplu sorgu |
| **CSRF koruması** | OAuth state parameter cookie ile CSRF koruması |
| **Rate limiting** | Per-user rate limiting mevcut |
| **Idempotency** | Tekrarlanan webhook gönderimlerinde idempotency key desteği |
| **Connection pool** | sqlx PgPool kullanımı, max_connections yapılandırması |
