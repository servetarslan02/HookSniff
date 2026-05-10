# 🎯 HookSniff — Master Takip Belgesi

> **Son güncelleme:** 2026-05-11 01:59 GMT+8  
> **Oturum:** 97  
> **Amaç:** Tüm sorunları tek yerden takip et. Ne yaptık, ne kaldı, sırada ne var.

---

## 📊 Genel Durum

| Kategori | Toplam | ✅ Yapıldı | ⚠️ Kısmen | ⬜ Beklemede | ❌ İptal |
|----------|--------|-----------|----------|------------|---------|
| 🚨 P0 — Acil | 10 | 10 | 0 | 0 | 0 |
| 🔴 P1 — Yüksek | 42 | 33 | 3 | 4 | 2 |
| 🟡 P2 — Orta | 38 | 24 | 2 | 12 | 0 |
| 🟢 P3 — Düşük | 13 | 5 | 0 | 8 | 0 |
| **TOPLAM** | **103** | **72** | **5** | **24** | **2** |

**İlerleme: %70 tamamlandı**

---

## ✅ YAPILANLAR (72 sorun)

### P0 — Hepsi Tamam ✅ (10/10)

| ID | Sorun | Ne Yapıldı | Tarih |
|----|-------|-----------|-------|
| HS-001 | `verify_email` rate limit yok | 5 deneme/dakika/IP eklendi | 2026-05-10 |
| HS-002 | `verify_2fa` rate limit yok | 5 deneme/dakika/IP eklendi | 2026-05-10 |
| HS-003 | `refresh_token` rate limit yok | 10 deneme/dakika/IP eklendi | 2026-05-10 |
| HS-004 | Inbound webhook signature optional | Boş secret → 403 | 2026-05-10 |
| HS-005 | Billing webhook secret boşsa atlıyor | Boş secret → 403 | 2026-05-10 |
| HS-006 | Grafana token .env.example'da açıkta | Placeholder yapıldı | 2026-05-10 |
| HS-007 | .gitignore'da .env eksik | Pattern eklendi | 2026-05-10 |
| HS-008 | Contact form rate limit yok | 3 deneme/dakika/IP eklendi | 2026-05-10 |
| HS-009 | Schema ownership check yok | customer_id filtresi eklendi | 2026-05-10 |
| HS-010 | Concurrent delivery limit yok | Semaphore max 10 eklendi | 2026-05-10 |

### P1 — Yapılanlar (33)

| ID | Sorun | Ne Yapıldı | Tarih |
|----|-------|-----------|-------|
| HS-011 | Portal notification SSRF | URL validation eklendi | 2026-05-10 |
| HS-013 | CSP unsafe-inline + unsafe-eval | Kaldırıldı, HSTS eklendi | 2026-05-10 |
| HS-016 | DefaultHasher idempotency | SHA-256 ile değiştirildi | 2026-05-10 |
| HS-018 | Error classification yok | 4xx→dead letter, 429/5xx→retry | 2026-05-10 |
| HS-019 | WebSocket connection limit yok | Max connection eklendi | 2026-05-10 |
| HS-020 | Circuit breaker entegre değil | Worker'a entegre edildi | 2026-05-10 |
| HS-021 | Billing webhook idempotency yok | Idempotency kontrolü eklendi | 2026-05-10 |
| HS-023 | FIFO worker'a bağlı değil | Worker döngüsüne bağlandı | 2026-05-10 |
| HS-025 | CHECK constraint eksik | Migration ile eklendi | 2026-05-10 |
| HS-026 | webhook_queue FK eksik | Foreign key eklendi | 2026-05-10 |
| HS-029 | Search debounce yok | 300ms debounce eklendi | 2026-05-10 |
| HS-030 | Dashboard routing çökmüş | getLocalizedHref düzeltildi | 2026-05-10 |
| HS-031 | Frontend-Backend API uyumsuz | Format eşleştirildi | 2026-05-10 |
| HS-032 | Abonelik iptal endpoint yok | DELETE /billing/subscription eklendi | 2026-05-10 |
| HS-033 | Hesap silme bozuk | Endpoint düzeltildi | 2026-05-10 |
| HS-034 | Fiyat uyumsuzluğu | $49/$149 → $29/$99 düzeltildi | 2026-05-10 |
| HS-035 | 3 farklı API URL | Tek URL'ye birleştirildi | 2026-05-10 |
| HS-036 | Kotlin SDK generic crash | TypeToken fix | 2026-05-10 |
| HS-037 | 6 SDK legacy header | Güncellendi | 2026-05-10 |
| HS-038 | CLI HOOKRELAY env vars | HOOKSNIFF yapıldı | 2026-05-10 |
| HS-038a | handle_inbound bypass | Argon2 hash doğrulaması eklendi | 2026-05-10 |
| HS-038b | Prefix length mismatch | 20→15 karakter düzeltildi | 2026-05-10 |
| HS-038c | Billing webhook rate limit yok | 30/dakika/IP eklendi | 2026-05-10 |
| HS-038f | Timing attack login | Sabit hata mesajı | 2026-05-10 |
| HS-038g | Error serialization leak | Internal error gizlendi | 2026-05-10 |
| HS-038h | Email enumeration | Genel mesaj döndürülüyor | 2026-05-10 |
| HS-038i | Auth cache mutex deadlock | tokio::sync::Mutex ile değiştirildi | 2026-05-10 |
| HS-038j | rate_limit unwrap panic | expect→unwrap_or ile değiştirildi | 2026-05-10 |
| HS-038k | Alert validation eksik | Whitelist eklendi | 2026-05-10 |
| HS-038l | Polar webhook error leak | Internal config gizlendi | 2026-05-10 |
| HS-038m | output:standalone eksik | next.config.js'e eklendi | 2026-05-10 |
| HS-039 | Dual onboarding modal | Tek modal'a düşürüldü | 2026-05-10 |
| HS-040 | Toast dismiss/aria-live yok | Eklendi | 2026-05-10 |

### P2 — Yapılanlar (24)

| ID | Sorun | Ne Yapıldı | Tarih |
|----|-------|-----------|-------|
| HS-041 | Client+server pagination çelişkisi | Düzeltildi | 2026-05-10 |
| HS-042 | Status count sadece mevcut sayfa | Düzeltildi | 2026-05-10 |
| HS-043 | useEffect cleanup eksik | Kritikler düzeltildi | 2026-05-10 |
| HS-044 | Stale closure riskleri | Düzeltildi | 2026-05-10 |
| HS-045 | lucide-react unused (~150KB) | Kaldırıldı | 2026-05-10 |
| HS-046 | 13 tablo overflow-x-auto yok | Eklendi | 2026-05-10 |
| HS-047 | blog/[slug] 1922 satır mega | data.ts'a çıkarıldı (308 satır) | 2026-05-10 |
| HS-048 | dangerouslySetInnerHTML | XSS güvenli (HTML-escape var) | 2026-05-10 |
| HS-049 | Toggle role="switch" eksik | Eklendi | 2026-05-10 |
| HS-050 | Delete modal focus trap | Zaten mevcut | 2026-05-10 |
| HS-051 | weeklyDigest local-only | API'ye bağlandı | 2026-05-10 |
| HS-052 | Dark mode eksik | 101/104 sayfa düzeltildi | 2026-05-10 |
| HS-053 | Footer eksik | Layout'larda eklendi | 2026-05-10 |
| HS-054 | 20+ eksik DB index | Migration ile eklendi | 2026-05-10 |
| HS-055 | updated_at trigger eksik | Eklendi | 2026-05-10 |
| HS-056 | UNIQUE constraint eksik | Eklendi | 2026-05-10 |
| HS-057 | Delivery index eksik | Migration 044 ile eklendi | 2026-05-10 |
| HS-058 | Proration yok | Eklendi | 2026-05-10 |
| HS-059 | Grace period yok | Eklendi | 2026-05-10 |
| HS-060 | Downgrade cleanup yok | Eklendi | 2026-05-10 |
| HS-061 | Custom metric yok | Eklendi | 2026-05-10 |
| HS-062 | Simple exporter (sync) | Batch exporter yapıldı | 2026-05-10 |
| HS-063 | Sampling strategy yok | Parent-based sampling eklendi | 2026-05-10 |
| HS-064 | PII trace'de loglanıyor | Filtrelendi | 2026-05-10 |

### P3 — Yapılanlar (5)

| ID | Sorun | Ne Yapıldı | Tarih |
|----|-------|-----------|-------|
| HS-069 | FAQ eksik | 8 dile 40 anahtar eklendi | 2026-05-10 |
| HS-077 | Stale branch temizliği | Temizlendi | 2026-05-10 |
| HS-079 | Commit convention tutarsız | Düzeltildi | 2026-05-10 |
| HS-080 | ESLint 8→9 migration | Yapıldı | 2026-05-10 |
| HS-081 | 11 SDK'da retry logic yok | Tüm SDK'lara eklendi | 2026-05-11 |

---

## ⚠️ KISMEN YAPILANLAR (5 sorun)

| ID | Sorun | Durum | Ne Kaldı |
|----|-------|-------|---------|
| HS-014 | Git history OTEL credentials | ⚠️ | .env.example placeholder yapıldı ama git history BFG gerektirir (operasyonel) |
| HS-015 | Password reset token URL'de | ⚠️ | Standart pratik (GitHub/Stripe de aynı). Tek kullanımlık, 1 saat geçerli. Düzeltilmesi opsiyonel |
| HS-022 | Throttle state in-memory | ⚠️ | In-memory yeterli, DB persistence gelecekte yapılacak |
| HS-024 | İki migration sistemi senkron değil | ⚠️ | db.rs tek kaynak, SQL dosyaları referans. Gelecekte refactor |
| HS-066 | 71 sayfada metadata eksik | ⚠️ | Client component, layout'tan geliyor. Kapsamlı refactor gerekli |

---

## ⬜ BEKLEMEDE OLANLAR (24 sorun)

### P1 — Beklemede (4)

| ID | Sorun | Neden Bekliyor | Öncelik |
|----|-------|---------------|---------|
| HS-012 | Playground SSRF (DNS rebinding) | Runtime test gerekli, teorik açık | Orta |
| HS-017 | ~~Retry'da jitter yok~~ | ❌ YANLIŞ — jitter var | İptal |
| HS-038d | ~~custom_domains command injection~~ | ❌ Domain sanitize edilmiş | İptal |
| HS-038e | ~~Dynamic SQL construction~~ | ❌ Parametrize edilmiş | İptal |

### P2 — Beklemede (12)

| ID | Sorun | Neden Bekliyor | Öncelik |
|----|-------|---------------|---------|
| HS-065 | 920+ hardcoded string (i18n) | En büyük iş, birden fazla oturum | Yüksek |
| HS-067 | Kurgusal müşteri hikayeleri | PayStack→PayFlow yapıldı, disclaimer eklendi ✅ | Düşük |
| HS-068 | Türkçe çeviri hataları | "APIimize", "Ölü Mektup Kuyruğu" düzeltilmeli | Orta |
| HS-070 | next.config.js output:standalone | Eklendi ✅ (Oturum 83) | — |
| HS-071 | HSTS header eksik | Eklendi ✅ (Oturum 83) | — |
| HS-072 | token! non-null assertion | ❌ if (!token) return guard'ı var | İptal |
| HS-073 | Hardcoded YOUR_TOKEN | Düzeltildi ✅ | — |
| HS-074 | health page auth yok | ❌ credentials:include cookie gönderiyor | İptal |
| HS-075 | store.tsx token 'cookie' | ❌ Kasıtlı sentinel değer | İptal |
| HS-076 | api-keys credentials yanlış yerde | Düzeltildi ✅ | — |
| HS-078 | 20+ Dependabot PR | Açık PR kalmamış ✅ | — |
| HS-083 | OpenAPI schema mismatch | SDK audit'te doğrulandı ✅ | — |

### P3 — Beklemede (8)

| ID | Sorun | Neden Bekliyor | Öncelik |
|----|-------|---------------|---------|
| HS-082 | SDK version mismatch (Kotlin) | Version bump publishing gerektirir | Orta |
| HS-084 | iyzico fatura handler yok | iyzico hesabı gerekli (Servet) | Yüksek |
| HS-085 | db.rs test yok (1029 satır) | Gerçek PostgreSQL gerekli | Orta |
| HS-086 | delivery/mod.rs test yok | 12 yeni test eklendi ✅ | — |
| HS-087 | worker/main.rs test yok | 16 yeni test eklendi ✅ | — |
| HS-088 | AuthGuard component test yok | Frontend test yazılmalı | Düşük |
| HS-089 | SSO page test yok | Frontend test yazılmalı | Düşük |

---

## 🗓️ SIRADAKI İŞLER (Öncelik Sırası)

### 🔥 Hemen Şimdi — Oturum 97

| # | İş | ID | Tahmini Süre |
|---|---|----|-------------|
| 1 | **Staging test** — API health, login, rate limit, webhook | — | 15 dk |
| 2 | **Türkçe çeviri hataları** — "APIimize", "Ölü Mektup Kuyruğu" | HS-068 | 20 dk |
| 3 | **Kalan dark mode** — 3 sayfa eksik | HS-052 | 15 dk |

### 📋 Sonraki Oturumlar

| Oturum | İş | ID'ler | Tahmini |
|--------|---|--------|---------|
| 98 | **i18n — Sayfa 1-5** (dashboard core) | HS-065 | 1 oturum |
| 99 | **i18n — Sayfa 6-10** (settings, billing) | HS-065 | 1 oturum |
| 100 | **i18n — Sayfa 11-15** (tools, admin) | HS-065 | 1 oturum |
| 101 | **i18n — Sayfa 16-20** (blog, docs) | HS-065 | 1 oturum |
| 102 | **SDK version mismatch** | HS-082 | Yarım oturum |
| 103 | **iyzico entegrasyonu** | HS-084 | 1 oturum (hesap açılınca) |
| 104 | **Test coverage** — db.rs | HS-085 | 1 oturum |
| 105 | **Test coverage** — AuthGuard, SSO | HS-088, HS-089 | 1 oturum |
| 106 | **Git history BFG** | HS-014 | Operasyonel (Servet) |

---

## 📁 Dosya Haritası

| Kategori | Ana Dosya | Konum |
|----------|----------|-------|
| Bu belge | `TRACKING.md` | `.ai-context/TRACKING.md` |
| Sorun listesi | `ISSUE-TRACKER.md` | `.ai-context/visual-bugs/ISSUE-TRACKER.md` |
| Aksiyon planı | `ACTION-PLAN.md` | `.ai-context/visual-bugs/ACTION-PLAN.md` |
| Konsolide rapor | `CONSOLIDATED-REPORT.md` | `.ai-context/visual-bugs/CONSOLIDATED-REPORT.md` |
| Doğrulama | `VERIFICATION-REPORT.md` | `.ai-context/visual-bugs/VERIFICATION-REPORT.md` |
| Oturum planı | `SESSION-PLAN.md` | `.ai-context/SESSION-PLAN.md` |
| Sonraki oturum | `NEXT_SESSION.md` | `.ai-context/NEXT_SESSION.md` |

---

## 📝 Notlar

- **Bu belge ana takip dosyasıdır.** Her oturum sonunda güncellenmeli.
- **SESSION-PLAN.md** eski format, artık TRACKING.md kullanılacak.
- **NEXT_SESSION.md** sonraki oturum detayları için.
- **ISSUE-TRACKER.md** orijinal 103 sorunun detaylı listesi.
- Yanlış çıkan 5 bulgu iptal edildi (❌ işaretli).
- Kısmen yapılan 5 sorun var — ileride tamamlanacak.
- i18n (HS-065) en büyük iş, 4-5 oturum sürecek.
