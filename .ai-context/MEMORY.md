# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-20 21:03 GMT+8 (SSO Test + DNS Fix)
> Bu dosya GitHub'da kalıcıdır. Oturumlar 1 saat sürer, silinir. Bu dosya her oturum başı okunur.

---

## 🚀 Hızlı Başlangıç (Her Oturum)

1. `git pull` — en son kodu çek
2. Bu dosyayı oku (MEMORY.md)
3. `NEXT_SESSION.md` oku — yapılacaklar listesi
4. İşe başla
5. Oturum sonunda: değişiklikleri push et, bu dosyayı güncelle

---

## 📋 Proje Nedir?

**HookSniff** bir webhook altyapı platformu. Kullanıcılar webhook endpoint'leri oluşturur, HookSniff webhook'ları alır, işler ve teslim eder.

- **Dil:** Rust (API + Worker), TypeScript/Next.js (Dashboard)
- **Veritabanı:** Neon PostgreSQL (Free tier)
- **Cache/Queue:** Upstash Redis (Free tier)
- **Deploy:** Google Cloud Build → Cloud Run (API + Worker), Vercel (Dashboard)
- **Repo:** https://github.com/servetarslan02/HookSniff

---

## 👤 Kullanıcı

- **İsim:** Servet Arslan
- **GitHub:** servetarslan02
- **Email:** servetarslan02@gmail.com
- **Teknik bilgi:** Yok — ilk proje, kodu AI yazıyor
- **Hedef:** $500/ay gelir, sonra şirket kur
- **Dil:** Türkçe konuşuyor, teknik terimleri basit açıkla

---

## 🏗️ Mimari

```
HookSniff/
├── api/          → Rust API (axum framework, port 3000)
├── worker/       → Rust background worker (webhook teslimatı)
├── common/       → Paylaşılan Rust kütüphanesi
├── dashboard/    → Next.js admin panel (Vercel'de deploy)
├── cli/          → Rust CLI aracı
├── sdks/         → 11 dilde SDK (referans/geliştirme kopyası)
├── migrations/   → SQL migration dosyaları (001-064)
├── deploy/       → Terraform, deploy scriptleri
├── monitoring/   → Grafana dashboard JSON
├── cloudbuild.yaml → GCP Cloud Build config
├── Dockerfile.api → API Docker image
├── Dockerfile.worker → Worker Docker image
└── .ai-context/  → 🔑 KALICI HAFIZA (GitHub'da sync)
```

---

## 🔑 Hesap Bilgileri

| Servis | Bilgi |
|--------|-------|
| **Admin giriş** | email: servetarslan02@gmail.com |
| **Demo giriş** | email: demo@hooksniff.com (şifre: .sdk-tokens.env) |
| **Google Cloud** | proje: hooksniff-app |
| **Neon DB** | proje: hookrelay (org: Servet, Free tier) |
| **Dashboard URL** | https://hooksniff.vercel.app |
| **API URL** | https://hooksniff-api-1046140057667.europe-west1.run.app |
| **Grafana** | https://hookrelay.grafana.net |

---

## 📊 SDK ROADMAP — TÜM FAZLAR TAMAMLANDI (8-15)

### Faz Durumu

| Faz | İçerik | Durum |
|-----|--------|-------|
| 8 | Environment | ✅ |
| 9 | Background Task | ✅ |
| 10 | Operational Webhook | ✅ (worker dispatch dahil) |
| 11 | Message Poller | ✅ |
| 12 | Ingest | ✅ |
| 13 | Connector | ✅ |
| 14 | Integration | ✅ |
| 15 | Streaming | ✅ |

### DB Tabloları (Neon PostgreSQL)

| Tablo | Migration | Durum |
|-------|-----------|-------|
| environments | 056 | ✅ |
| environment_variables | 057 | ✅ |
| background_tasks | 058 | ✅ |
| operational_webhook_endpoints | 059 | ✅ |
| operational_webhook_deliveries | 060 | ✅ |
| message_cursors | 061 | ✅ |
| connectors | 062 | ✅ (8 seed) |
| connector_configs | 062 | ✅ |
| integrations | 063 | ✅ |
| integration_events | 063 | ✅ |
| stream_channels | 064 | ✅ |
| stream_subscriptions | 064 | ✅ |
| stream_messages | 064 | ✅ |

### API Endpoint'leri (Rust Axum)

| Resource | Route | Dosya |
|----------|-------|-------|
| Environment | /v1/environments | api/src/routes/environments.rs |
| Background Task | /v1/background-tasks | api/src/routes/background_tasks.rs |
| Operational Webhook | /v1/operational-webhooks | api/src/routes/operational_webhooks.rs |
| Message Poller | /v1/message-poller | api/src/routes/message_poller.rs |
| Inbound | /v1/inbound | api/src/routes/inbound.rs |
| Connector | /v1/connectors | api/src/routes/connectors.rs |
| Integration | /v1/integrations | api/src/routes/integrations.rs |
| Stream | /v1/stream | api/src/routes/stream.rs |

### Dashboard Sayfaları

| Sayfa | URL | Dosya |
|-------|-----|-------|
| Environments | /environments | dashboard/src/app/[locale]/(dashboard)/environments/ |
| Background Tasks | /background-tasks | dashboard/src/app/[locale]/(dashboard)/background-tasks/ |
| Operational Webhooks | /operational-webhooks | dashboard/src/app/[locale]/(dashboard)/operational-webhooks/ |
| Message Poller | /message-poller | dashboard/src/app/[locale]/(dashboard)/message-poller/ |
| Inbound Webhooks | /inbound | dashboard/src/app/[locale]/(dashboard)/inbound/ |
| Connectors | /connectors | dashboard/src/app/[locale]/(dashboard)/connectors/ |
| Integrations | /integrations | dashboard/src/app/[locale]/(dashboard)/integrations/ |
| Streaming | /streaming | dashboard/src/app/[locale]/(dashboard)/streaming/ |

---

## 📦 SDK Durumu

### Registry Publish

| # | SDK | Registry | Versiyon | Durum |
|---|-----|----------|----------|-------|
| 1 | Node.js | npm | 1.3.0 | ✅ Yüklendi |
| 2 | Python | PyPI | 1.1.0 | ✅ Yüklendi |
| 3 | Go | GitHub tag | v1.3.0 | ✅ |
| 4 | Rust | crates.io | 1.1.0 | ✅ Yüklendi |
| 5 | Ruby | RubyGems | 1.2.0 | ✅ Yüklendi (30+ resource) |
| 6 | Java | Maven Central | 1.1.0 | ✅ Yüklendi |
| 7 | Kotlin | Maven Central | 1.1.0 | ✅ Yüklendi |
| 8 | PHP | Packagist | 1.1.0 | ✅ Otomatik (GitHub push) |
| 9 | C# | NuGet | 1.2.0 | ✅ Yüklendi |
| 10 | Elixir | Hex.pm | 1.1.0 | ✅ Yüklendi |
| 11 | Swift | GitHub tag | v1.1.0 | ✅ |

### Ayrı Repo Durumu (Hepsi v1.1.0 kodu push edildi)

| Repo | URL | Son Commit |
|------|-----|-----------|
| hooksniff-node | github.com/servetarslan02/hooksniff-node | 5b028fc3 |
| hooksniff-python | github.com/servetarslan02/hooksniff-python | 5e63e29d |
| hooksniff-go | github.com/servetarslan02/hooksniff-go | 030e85e2 |
| hooksniff-rust | github.com/servetarslan02/hooksniff-rust | e0ea50cc |
| hooksniff-ruby | github.com/servetarslan02/hooksniff-ruby | c1cefdd3 |
| hooksniff-java | github.com/servetarslan02/hooksniff-java | 811a0276 |
| hooksniff-kotlin | github.com/servetarslan02/hooksniff-kotlin | b39874c6 |
| hooksniff-php | github.com/servetarslan02/hooksniff-php | 7e6cf61e |
| hooksniff-csharp | github.com/servetarslan02/hooksniff-csharp | 9fc19648 |
| hooksniff-elixir | github.com/servetarslan02/hooksniff-elixir | 5fd0f41f |
| hooksniff-swift | github.com/servetarslan02/hooksniff-swift | 69479f1f |

### ✅ TÜM REGISTRY PUBLISH İŞLEMLERİ TAMAMLANDI

11 SDK'nın hepsi ilgili registry'lere yüklendi.

---

## ☁️ External Servisler

| Servis | Durum | Not |
|--------|-------|-----|
| **Vercel** | ✅ Aktif | Dashboard deploy, Hobby plan |
| **Neon PostgreSQL** | ✅ Aktif | Free tier, 1 branch (production) |
| **Upstash Redis** | ✅ Aktif | Free tier, cache + queue |
| **Google Cloud Run** | ✅ Aktif | API + Worker deploy |
| **Google Cloud Build** | ✅ Aktif | Otomatik deploy (push → build) |
| **Polar.sh** | ✅ Aktif | Ödeme sistemi |
| **Grafana Cloud** | ✅ Aktif | OTEL monitoring |
| **Cloudflare R2** | ✅ Aktif | Dosya depolama |

---

## 💳 Dunning Sistemi (2026-05-20 02:07)

**Ödeme akışı yeniden tasarlandı.** Commit: `0ae98f57`

### Akış (Grace Period Yok!)
```
Dönem sonu → Polar ödeme dener
├── Başarılı → plan devam, current_period_end yenilenir
└── Başarısız → HEMEN free'ye düşür (grace period yok)

Dunning email'leri dönem bitmeden GÖNDERİLİR:
  3 gün kala → ⚠️ Amber email + bildirim
  2 gün kala → 🔴 Orange email + bildirim
  1 gün kala → 🚨 Red email + bildirim (son uyarı)
```

### Dosyalar
| Dosya | İşlev |
|-------|-------|
| `api/src/jobs/dunning.rs` | Pre-expiry dunning email'leri |
| `migrations/072_dunning_system.sql` | `dunning_reminders` tablosu |
| `migrations/073_remove_grace_period.sql` | `current_period_end` sütunu |
| `api/src/routes/billing/webhooks.rs` | Payment failed → immediate downgrade |
| `api/src/main.rs` | Job kaydı (24 saat interval) |

### Veritabanı
- **`customers.current_period_end`** — Billing dönem sonu tarihi
- **`dunning_reminders`** — Hangi müşteriye hangi gün email gönderildi
- Grace period kaldırıldı ✅

---

## 🔒 Güvenlik Denetimi (2026-05-19 08:25)

**Kapsamlı güvenlik taraması yapıldı — 26 bulgu, 14 düzeltme.**

### Düzeltilen Yüksek Riskler
1. Endpoint signing_secret API'de açık → skip_serializing
2. Inbound webhook secret API'de açık → skip_serializing
3. SameSite=None cookie (önceki oturumda)
4. WS origin localhost production (önceki oturumda)
5. Timing attack login (önceki oturumda)

### Düzeltilen Orta Riskler
6. HTML sanitizer bypass → javascript:/data:/vbscript: filtrelendi
7. Cookie Secure flag eksik → tüm cookie'lerde Secure
8. Password max length → 128 karakter limit
9. Reverse tabnapping → rel="noopener noreferrer"

### Rapor
- Detaylı rapor: `.ai-context/SECURITY-AUDIT-FULL.md`
- npm audit: 0 vulnerabilities
- unsafe blok: yok
- Kalan 12 bulgu: hepsi düşük öncelik

---

## ⚠️ KRİTİK KURALLAR

1. **SDK sıfırdan yazılmaz** — Svix SDK'dan kopyala, adapte et
2. **Eksik iş bırakma** — Her faz: Migration + API + Dashboard + 11 SDK + Sidebar + i18n + Push
3. **Ayrı repolar var** — SDK'lar `sdks/` klasörü DEĞİL, ayrı GitHub repolarında
4. **Oturumlar 1 saat** — Her şeyi dosyalara yaz, push et
5. **Cloud Build manuel** — API deploy için tetikleme gerekli

---

## 📝 Son Oturum (2026-05-20 19:34–19:40 — Inbound Webhook URL Fix)

### Özet
Servet ile oturum. Dashboard'daki inbound webhook URL'leri 401 hatası veriyordu. API key zorunluluğu kaldırıldı, endpoint-specific URL'ler eklendi. 4 dosya değişti.

### Yapılan İşler:
1. **API key zorunluluğu kaldırıldı** — `handle_inbound_to_endpoint` artık API key gerektirmiyor
2. **Helper fonksiyonlar** — `resolve_customer_from_api_key`, `resolve_customer_from_endpoint`, `process_inbound`
3. **Dashboard URL'leri düzeltildi** — `/v1/inbound/{provider}/{endpoint_id}` formatında
4. **Açıklayıcı hata mesajları** — Config yoksa ne yapılacağını söyleyen mesajlar
5. **i18n** — 3 yeni key (en + tr)

### Değişen Dosyalar:
- `api/src/routes/inbound.rs` — refactoring + API key opsionel
- `dashboard/src/app/[locale]/(dashboard)/inbound/page.tsx` — endpoint-specific URL'ler
- `dashboard/src/messages/en.json` + `tr.json` — yeni i18n key'ler

### Push: `9556dead`

---

## 📝 Son Oturum (2026-05-20 18:24–18:30 — Stat Card Minimalizasyonu)

### Özet
Servet ile oturum. Dashboard ana sayfasındaki istatistik kartları minimalize edildi. 3 dosya değişti.

### Yapılan İşler:
1. **StatCard component** — padding, ikon, metin boyutları küçültüldü (p-6→p-4, w-11→w-9, text-3xl→text-2xl)
2. **DashboardOverview** — grid gap, chart yüksekliği, panel paddingleri küçültüldü
3. **Skeleton loader** — yeni boyutlara uygun hale getirildi

### Değişen Dosyalar:
- `dashboard/src/components/tremor/StatCard.tsx` — shared component (tüm sayfalar etkilenir)
- `dashboard/src/app/[locale]/(dashboard)/DashboardOverview.tsx` — ana sayfa
- `dashboard/src/app/[locale]/(dashboard)/core/page.tsx` — skeleton

---

## 📝 Son Oturum (2026-05-20 05:24–06:20 — Login Fix + Dashboard Build)

### Özet
Servet ile oturum. Login DATABASE_ERROR fix, dashboard build fix, gcloud CLI kurulumu. 8+ commit.

### Yapılan İşler:
1. **Login DATABASE_ERROR** — `ColumnNotFound("paused_at")` tespit edildi, CUSTOMER_SELECT'e 3 kolon eklendi
2. **Email .await bug** — 4 send_email_with_fallback çağrısına .await eklendi
3. **SSO module path** — main.rs'de `sso::` → `routes::sso::`
4. **Dashboard** — 20+ dosyada unused imports, type errors, corrupted imports düzeltildi
5. **gcloud CLI** — kuruldu, Cloud Build tetikleme ve log okuma için kullanıldı

### Kritik Bulgular:
- **Upstash Redis 500K limit dolu** — plan yükseltme veya fallback gerekli
- **email_verified = false** — Servet ve demo hesapları login yapamaz

---

## 📝 Son Oturum (2026-05-20 02:56–03:47 — Broadcast + Security + Email)

### Özet
Servet ile yeni oturum. Broadcast bildirim sistemi, güvenlik izleme sistemi ve e-posta düzeltmeleri yapıldı. 8+ commit, 3500+ satır kod.

### Yapılan İşler:

**1. Broadcast Bildirim Sistemi (02:57–03:10)**
- `broadcasts` + `broadcast_dismissals` tabloları (migration 075)
- Admin CRUD API: GET/POST/PUT/DELETE `/v1/admin/broadcasts`
- User API: GET `/v1/broadcasts`, POST `/:id/dismiss`, GET `/unread-count`
- Admin sayfası: E-posta/Bildirim toggle (tek sayfada birleştirildi)
- NotificationCenter: broadcast'ler çan ikonunda
- BroadcastBanner: warning/critical dashboard'da banner

**2. E-posta Düzeltmeleri (03:12–03:25)**
- Resend from_name: `HookSniff <onboarding@resend.dev>`
- GCloud from_name: `HookSniff <noreply@example.com>`
- RESEND_API_KEY Cloud Run'da doğrulandı
- Test emaili gönderildi (servetarslan02@gmail.com)

**3. Güvenlik İzleme Sistemi (03:28–03:40)**
- `security_events` tablosu (migration 076)
- `login_attempts` tablosu (brute force tracking)
- `ip_blocklist` tablosu (migration 077)
- `security_monitor.rs`: 11 saldırı tespiti
  - Brute force, credential stuffing, password spray
  - SQL injection, XSS, path traversal
  - Scanner detection, suspicious UA
- Auth akışına entegrasyon
- Admin güvenlik sayfası: olaylar + IP blok listesi

### Kritik Bulgu: Alert Evaluation Worker Eksik
- `alert_rules` tablosu var, CRUD API var
- Ama **background worker yok** — kurallar tetiklenmiyor
- TODO: Item 254 olarak işaretli
- Bir sonraki oturumda yapılacak

### Neon DB: 5 tablo eklendi, 3 migration uygulandı

---

## 📝 Son Oturum (2026-05-19 22:34–22:40 — Özel Alan Adı Kapsamlı Denetim)

### Özet
Custom Domain sayfası detaylı incelendi. 14 sorun tespit edildi, hepsi düzeltildi. 2 commit push edildi.

### Tespit Edilen ve Düzeltilen Sorunlar:
1. CNAME doğrulama mantığı hatalı → `vercel-dns.com` artık kabul ediliyor
2. DNS kayıtları sayfa yenilendeğinde kayboluyordu → mevcut unverified domain'lerde gösteriliyor
3. Verify sonrası domain listesi yenilenmiyordu → `fetchDomains()` çağrısı eklendi
4. Buton yazısı "Verifying..." → "Adding…" olarak düzeltildi
5. Loading skeleton eklendi
6. Empty state eklendi
7. Environments sekmesi ikonu 🌐 → 📦
8. Test import path düzeltildi
9. Hardcoded Vercel credentials kaldırıldı
10. http/https prefix otomatik temizleniyor
11. Load error + retry butonu
12. İngilizce fallback kaldırıldı
13. TXT record name kopyalanabiliyor
14. Enter tuşu ile form gönderimi

### Değişilen Dosyalar:
- `api/src/routes/custom_domains.rs` — CNAME verification + credentials
- `dashboard/.../custom-domain/page.tsx` — 396 satır
- `dashboard/.../routing-config/page.tsx` — ikon
- `dashboard/src/messages/en.json` + `tr.json` — 5 yeni key
- `dashboard/src/__tests__/custom-domain-page.test.tsx` — import path

### Commit: `ef178b8d`

---

## 📝 Son Oturum (2026-05-19 22:31–22:35 — İmza Aracı Kapsamlı İnceleme)

### Özet
İmza Aracı (Signature Verifier) sayfası detaylı incelendi. 8 sorun tespit edildi, hepsi düzeltildi. 4 dosya değişti, 252 satır eklendi.

### Yapılan İşler:
1. **CSS mükerrerleri düzeltildi** — textarea ve input'larda tekrarlanan sınıflar temizlendi
2. **Temizleme butonu eklendi** — "🗑️ Temizle" butonu (tüm alanları sıfırlar)
3. **Gizli anahtar toggle** — göz ikonu ile password/text geçişi
4. **İmza format otomatik normalize** — hex yapıştırınca `sha256=` prefix ekleniyor
5. **Çok dilli kod örnekleri** — Node.js + Python + Go (tab'lı geçiş)
6. **Kopyalama fallback** — HTTPS olmayan ortamlarda textarea+execCommand
7. **Klavye kısayolu** — Ctrl/Cmd + Enter ile doğrulama
8. **Test import yolu düzeltildi** — `[username]` → `(dashboard)`

### Değişiklikler:
- `dashboard/src/app/[locale]/(dashboard)/signature-verifier/page.tsx` — +223/-30
- `dashboard/src/__tests__/signature-verifier-page.test.tsx` — +43/-1
- `dashboard/src/messages/en.json` — +8
- `dashboard/src/messages/tr.json` — +8

### Push: `f8b0bbde`

---

## 📝 Son Oturum (2026-05-19 22:00–22:14 — Dokümantasyon Türkçe Çeviri)

### Özet
13 hardcoded İngilizce dokümantasyon sayfası Türkçe'ye çevrildi. 300+ i18n key oluşturuldu. 2 mevcut çeviri kalite sorunu düzeltildi.

### Yapılan İşler:
1. **13 sayfa i18n'e geçirildi** — multi-tenant, security, dashboard, idempotency, inbound-webhooks, monitor-performance, cloudevents, playground, smart-routing, changelog, transforms, support, templates
2. **300+ i18n key oluşturuldu** — EN + TR JSON dosyalarına eklendi
3. **2 kalite düzeltmesi** — `gettingStartedDesc` ve `sdksDesc` eksik cümleler tamamlandı
4. **TSX dosyaları güncellendi** — Tüm hardcoded İngilizce metinler `t()` ile değiştirildi

### Değişiklikler:
- `dashboard/src/messages/en.json` — 300+ yeni key
- `dashboard/src/messages/tr.json` — 300+ yeni key
- `dashboard/src/app/[locale]/docs/*/page.tsx` — 13 dosya i18n'e geçirildi

### Teknik terimler çevrilmedi:
- endpoint, webhook, payload, retry, signature, SDK, API, DLQ, FIFO, HMAC, TLS, SSRF, CloudEvents, Round-Robin, Failover, Token Bucket, OpenTelemetry, Prometheus, Grafana

---

## 📝 Son Oturum (2026-05-19 21:00–21:10 — Endpoint Limits Kaldırıldı)

### Özet
Tüm planlardan endpoint limiti kaldırıldı — artık tüm planlarda sınırsız endpoint. 9 dosya değişti, 30 satır eklendi, 53 satır silindi.

### Yapılan İşler:
1. **Backend** — `max_endpoints()` tüm planlarda `u32::MAX` döndürüyor
2. **Admin settings** — Tüm plan default'ları `i32::MAX`
3. **Portal sayfası** — Endpoint usage bar kaldırıldı, "∞" gösteriliyor
4. **Plan kartları** — Tüm planlarda "Unlimited endpoints"
5. **i18n** — en.json + tr.json güncellendi
6. **Landing page** — Free/Pro/Business "Unlimited endpoints"
7. **Tests** — Grace ve billing test'leri güncellendi

### Değişiklikler:
- `api/src/billing/mod.rs` — max_endpoints() → u32::MAX
- `api/src/routes/admin/settings.rs` — default'lar i32::MAX
- `api/src/routes/billing/grace.rs` — test data
- `api/src/routes/billing/tests.rs` — test data
- `dashboard/.../billing/components/PlanCards.tsx` — features + limits display
- `dashboard/.../portal-manage/page.tsx` — endpoint bar kaldırıldı
- `dashboard/src/messages/en.json` + `tr.json` — i18n
- `landing/index.html` — pricing section

### Push: `3388a752`

---

## 📝 Son Oturum (2026-05-19 20:48–20:55 — Settings Tabbed Redesign)

### Özet
Account → Settings sayfası uzun dikey scroll'dan tab'lı layout'a çevrildi. 3 dosya değişti, 124 satır eklendi.

### Yapılan İşler:
1. **Settings sayfası tab'lı yapı** — Profile, Security, Notifications, Privacy, Danger Zone
2. **Sol sidebar navigasyon** — SVG ikonlar, aktif tab highlight, brand renk
3. **Mobil uyum** — Yatay scroll tab'lar
4. **Animasyon** — Tab geçişlerinde slide-up
5. **TypeScript düzeltmeleri** — ServiceTokenResponse.token optional, Team.owner_id fallback

### Değişiklikler:
- `dashboard/src/app/[locale]/(dashboard)/settings/page.tsx` — 159 satır
- `dashboard/src/app/[locale]/(dashboard)/team/page.tsx` — 1 satır
- `dashboard/src/lib/api-types.ts` — 1 satır

### Push: `866fe21c`

---

## 📝 Son Oturum (2026-05-19 20:32–20:47 — Documentation Premium Redesign)

### Özet
Documentation sayfası premium bir tasarıma kavuşturuldu. Stripe/Vercel/Resend docs'tan ilham alındı. 2 dosya değişti, 491 satır eklendi.

### Yapılan İşler:
1. **Docs Layout** — Yeni sidebar tasarımı: sticky nav, mobil overlay, badge'ler (Quickstart: "5 min", SDKs: "11", Popular)
2. **Main Docs Page** — Hero section, gradient quick links (3 adet), API info bar, improved sections, rate limits table, bottom CTA
3. **Build doğrulama** — TypeScript hataları düzeltildi, build başarılı
4. **Push** — `fd6f50f0`, Vercel otomatik deploy

### Değişiklikler:
- `dashboard/src/app/[locale]/docs/layout.tsx` — 299 satır değişiklik
- `dashboard/src/app/[locale]/docs/page.tsx` — 391 satır değişiklik

### Tasarım İyileştirmeleri:
- Hero section (gradient glow, CTA butonları)
- Quick links kartları (ikon, gradient bg, hover glow)
- API Base URL + Auth bilgi barı
- Section'larda description text
- Rate limits tablosunda Popular badge
- Bottom CTA section (gradient bg)
- Sidebar: compact, badge'ler, mobil overlay

---

## 📝 Önceki Oturum (2026-05-19 19:20–20:18 — Organization Kapsamlı Denetim + SSO Organizasyona Taşıma)

### Özet
Organization sistemi (Team + SSO + Audit Log) kapsamlı denetim yapıldı. 17 sorun tespit edildi, 10 düzeltme uygulandı. SSO organizasyona taşındı. Frontend güncellendi. 5 commit, 1000+ satır değişiklik.

### Yapılan İşler:
1. **Organization denetimi** — 17 sorun, 10 düzeltme
2. **P0 düzeltmeler** — API key log, rate limit, admin lockout
3. **P1 düzeltmeler** — Team CRUD (delete/leave/transfer), SAML validation
4. **SSO organizasyona taşıma** — migration 069 (team_id + created_by)
5. **Frontend** — takım seçici, verified domain, i18n
6. **P2** — SSO login attempts cleanup

### Değişiklikler:
- `api/src/routes/sso.rs` — 400+ satır değişiklik
- `api/src/routes/auth.rs` — 20 satır ekleme
- `api/src/routes/teams.rs` — 150 satır ekleme
- `api/src/jobs/retention.rs` — 18 satır ekleme
- `dashboard/` — 7 dosya, 83 satır
- `migrations/067 + 068 + 069` — 3 yeni migration

### Rakip Analizi:
- Clerk, WorkOS, Stripe, GitHub, Svix, Hookdeck, Hook0 incelendi
- SSO scope: rakipler organizasyon bazlı → HookSniff de organizasyona taşındı
- Auto-join: rakiplerde yok → HookSniff'de var (avantaj)
- Admin bypass: rakiplerde yok → HookSniff'de var (avantaj)

### Sıradaki:
- Cloud Build deploy
- Manuel SSO test
- Verified domain doğrulama

---

## 📝 Önceki Oturum (2026-05-19 17:23–18:15 — SSO Full Implementasyon + Navigasyon)

### Özet
Servet ile ilk oturum. SSO sayfası incelendi, 6 sorun tespit edildi, tam SSO implementasyonu yapıldı, navigasyon düzenlendi, Enterprise plan kısıtlaması eklendi, enforce akışı kuruldu.

---

### 🔐 SSO/SAML/OIDC — Nasıl Çalışır?

#### Veritabanı Tabloları

**`sso_configs`** — Her müşteri için tek SSO config (migration 022 + 023):
```
id              UUID (PK)
customer_id     UUID (FK → customers, UNIQUE)
provider        VARCHAR(20) — 'saml' veya 'oidc'
enabled         BOOLEAN — SSO zorunlu mu?
admin_bypass    BOOLEAN — Admin şifre ile girebilir mi?
metadata_url    TEXT — SAML IdP metadata URL
entity_id       TEXT — SAML SP entity ID
sso_url         TEXT — SAML IdP SSO URL
certificate     TEXT — SAML X.509 sertifika (PEM)
issuer_url      TEXT — OIDC issuer URL
client_id       TEXT — OIDC client ID
client_secret_encrypted TEXT — OIDC client secret (AES-256-GCM)
created_at      TIMESTAMPTZ
updated_at      TIMESTAMPTZ
```

**`sso_login_attempts`** — Audit log (migration 022):
```
id, customer_id, email, provider, success, error_message, ip_address, user_agent, created_at
```

#### API Endpoint'leri

**Config (Protected — JWT gerekir):**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/sso/config` | SSO config'i getir |
| POST | `/sso/config` | SSO config kaydet/güncelle |
| DELETE | `/sso/config` | SSO config sil |
| POST | `/sso/test` | Gerçek IdP bağlantısını test et |

**Login (Public — JWT gerekmez):**
| Method | Path | İşlev |
|--------|------|-------|
| GET | `/sso/login?email=...` | SSO login başlat (IdP'ye redirect) |
| POST | `/sso/saml/callback` | SAML ACS callback (IdP'den dönüş) |
| GET | `/sso/oidc/callback` | OIDC callback (IdP'den dönüş) |
| GET | `/sso/providers?domain=...` | Domain bazlı SSO sorgulama |

#### SAML Login Akışı
```
1. Kullanıcı → GET /sso/login?email=user@company.com
2. Sistem → customer'ı bul, SSO config'i kontrol et
3. Sistem → SAML AuthnRequest oluştur (XML)
4. Sistem → Base64 encode + URL encode
5. Sistem → IdP'ye redirect (SAMLRequest + RelayState=state)
6. Kullanıcı → IdP'de giriş yapar
7. IdP → POST /sso/saml/callback (SAMLResponse + RelayState)
8. Sistem → Base64 decode → XML parse → assertion çıkar
9. Sistem → NameID, attributes, NotOnOrAfter doğrula
10. Sistem → customer bul veya otomatik oluştur
11. Sistem → JWT token üret, cookie set et, dashboard'a redirect
```

#### OIDC Login Akışı
```
1. Kullanıcı → GET /sso/login?email=user@company.com
2. Sistem → customer'ı bul, SSO config'i kontrol et
3. Sistem → /.well-known/openid-configuration fetch
4. Sistem → authorization_endpoint'i al
5. Sistem → IdP'ye redirect (client_id, redirect_uri, scope, state, nonce)
6. Kullanıcı → IdP'de giriş yapar
7. IdP → GET /sso/oidc/callback?code=...&state=...
8. Sistem → state'i doğrula (CSRF koruması)
9. Sistem → code'u token ile exchange et
10. Sistem → id_token'ı decode et (JWT payload)
11. Sistem → email claim'ini çıkar
12. Sistem → customer bul veya otomatik oluştur
13. Sistem → JWT token üret, cookie set et, dashboard'a redirect
```

#### SSO Enforce Akışı (Frontend — 4 Adım)
```
Adım 1: Sağlayıcı Seçimi → SAML 2.0 veya OpenID Connect
Adım 2: Yapılandırma → IdP bilgilerini gir, kaydet
Adım 3: Test Et → Gerçek IdP'ye bağlan, bağlantıyı doğrula
Adım 4: Zorunlu Kıl → Onay modal'ı:
  ⚠️ "Tüm ekip üyeleri SSO ile giriş yapacak"
  ⚠️ "Şifre girişi kapatılacak"
  ✅ "Admin hariç" (checkbox, varsayılan açık)
  → Onayla → SSO aktif
```

#### Enterprise Plan Kısıtlaması
- SSO sadece `plan === 'enterprise'` olan müşteriler kullanabilir
- Enterprise olmayan → upgrade prompt gösterilir
- Enterprise olan → tam SSO config formu gösterilir

#### Dosya Yapısı
```
api/src/routes/sso.rs           → SSO API (config + login + callback)
api/migrations/022_sso_configs.sql → sso_configs + sso_login_attempts
api/migrations/023_sso_admin_bypass.sql → admin_bypass sütunu

dashboard/src/app/[locale]/(dashboard)/sso/page.tsx → SSO config sayfası
dashboard/src/app/[locale]/(dashboard)/organization/page.tsx → Organization (Team + SSO + Audit Log)
dashboard/src/lib/api.ts → ssoApi (testSso, deleteSso, getLoginUrl)
dashboard/src/schemas/api.ts → SsoConfigSchema (Zod)
dashboard/src/messages/en.json → sso.* i18n anahtarları
dashboard/src/messages/tr.json → sso.* i18n anahtarları
```

#### Navigasyon Değişikliği
```
Eski yapı:
  Routing & Config → SSO, Audit Log
  Account → Team

Yeni yapı:
  Organization → Team, SSO, Audit Log
  Routing & Config → (sadece routing/retry/domain/env/rate-limit)
  Account → Settings, Notifications, Portal
```

#### Kritik Notlar
- **SSO login engelleme henüz yok** — Backend login akışında SSO kontrolü eklenmeli
- **SSO state in-memory** — Production'da Redis'e taşınmalı
- **ID token imza doğrulaması yok** — Şimdilik decode-only, JWKS ile doğrulama eklenebilir
- **Cloud Build manuel** — API deploy için tetikleme gerekli
- **Vercel otomatik** — Dashboard push edildiğinde otomatik deploy olur

---

### 📝 Önceki Oturum (2026-05-19 08:13 — Login Error Fix + SESSION-PLAN Update)

### Yapılan İşler:
- **Login error mesajı düzeltildi** — "Unauthorized" → "Invalid email or password"
  - Disabled account: "Account is disabled. Contact support."
  - `api/src/routes/auth.rs` güncellendi
- **SESSION-PLAN.md güncellendi** — 18 madde ⬜ → ✅ (önceki oturumlarda yapılmış)
  - P0: 14/14 tamamlandı, P1: 44/44 tamamlandı
  - Toplam: 75/103

### Sıradaki:
1. Cloud Build ile deploy (security fixes)
2. P2 kalan sorunlar (21 adet)
3. Token ayarları (.sdk-tokens.env)

---

## 📝 Önceki Oturum (2026-05-19 08:10 — Kapsamlı Güvenlik Denetimi)

- 26 güvenlik bulgusu tespit edildi, 14 düzeltme yapıldı
- Endpoint/Inbound secret sızıntısı düzeltildi
- HTML sanitizer güçlendirildi
- Cookie Secure flag eklendi
- Password max length 128 karakter
- rel="noopener noreferrer" eklendi
- Detaylı rapor: `.ai-context/SECURITY-AUDIT-FULL.md`

---

## 📝 Önceki Oturum (2026-05-19 06:38 — API Entegrasyon Testi + DB Fix + SDK Sync)

### Yapılan İşler:
- **API entegrasyon testleri** — 15+ endpoint test edildi (curl ile)
  - Health ✅, Login ✅, Endpoints ✅, Events ✅, Webhooks ✅, Plans ✅, Stats ✅, Templates ✅, Applications ✅, API Keys ✅, Notifications ✅
- **`pgcrypto` extension eklendi** — Neon DB'ye `CREATE EXTENSION IF NOT EXISTS pgcrypto` çalıştırıldı
  - Çözüm: `function digest(text, unknown) does not exist` hatası
  - Webhook oluşturma artık çalışıyor
- **`custom_headers` sütunu eklendi** — `deliveries` tablosuna `ALTER TABLE deliveries ADD COLUMN custom_headers jsonb`
  - Çözüm: Worker orphaned delivery reaper hatası
  - Worker processing artık çalışıyor (httpbin.org'a delivery test edildi, HTTP 200)
- **Demo şifresi**: `Demo1234!` (RUNBOOK.md'den bulundu)
- **OpenAPI SDK sync workflow** — `.github/workflows/openapi-sdk-sync.yml` oluşturuldu
  - `docs/openapi.yaml` değiştiğinde 11 SDK'yı ayrı repolara push eder
  - `SDK_PUSH_TOKEN` secret eklendi
  - Billing yenilendiğinde otomatik çalışacak
- **`sdks/` klasörü ana repodan kaldırıldı** — SDK'lar ayrı repolarda duruyor

### DB Değişiklikleri (Neon PostgreSQL):
```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;  -- v1.3
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS custom_headers jsonb;
```

### Sıradaki:
1. GitHub Actions billing yenilendiğinde SDK sync workflow test
2. Onboarding/quickstart düzenlemeleri
3. Token'ları ayarla (`.sdk-tokens.env`)

---

## 📝 Önceki Oturum (2026-05-19 06:10 — Grafana Alert Düzeltmeleri + Worker Health)

### Yapılan İşler:
- **Grafana alert sistemi tamamen düzeltildi** (15 alert incelendi)
- 3 LogQL alert pause edildi (eski/duplicate)
- 4 hooksniff-critical alert pause edildi (duplicate veya metrik yok)
- 5 alert düzeltildi (olmayan metrikler → doğru metriklerle değiştirildi)
- **Worker health metriği eklendi**: `worker/src/metrics_push.rs`
  - `hooksniff_worker_healthy = 1` her 60 saniyede bir OTLP ile push
  - Worker Down alert aktif edildi
- 2 commit push edildi

### Alert Final Durumu:
- **8 aktif**: API Down, Queue Backlog, Delivery Failures, DB Latency, Success Rate, Queue Latency (x2), Worker Down
- **7 pause**: Eski LogQL (3), Duplicate critical (4)

### Sıradaki:
1. Cloud Build ile deploy (worker değişikliği)
2. Token'ları ayarla (`.sdk-tokens.env`)

### Yapılan İşler:
- **`build-stripe-like` sayfası i18n'e geçirildi** — 38 yeni çeviri anahtarı (en + tr)
- **`retries` sayfası eksik anahtarları tamamlandı** — `default` ve `description` eklendi
- **Tüm 11 docs sayfası doğrulandı** — hepsi getTranslations kullanıyor, eksik anahtar yok
- **Docs i18n oranı: %100** (18/18 sayfa)

### Sıradaki:
1. Dashboard sayfaları kalan %5 kontrol
2. Yeni özellik geliştirme
3. Token'ları ayarla (`.sdk-tokens.env`)

---

## 📝 Önceki Oturum (2026-05-19 05:03 — Svix Temizliği + CI/CD + Güvenlik)

### Yapılan İşler:
- **`local-release.sh` oluşturuldu** — GitHub Actions yerine local CI/CD
- **Svix kalıntıları temizlendi** — Go, Ruby, Python SDK'lardan Svix-specific method'lar silindi
- **Güvenlik taraması** — Ayrı SDK repo'ları tarandı, sızıntı yok
- **Credential temizliği** — Ana repo .ai-context dosyalarından şifreler kaldırıldı
- SDK kalite skoru: **%100**

### Kullanım:
```bash
./local-release.sh dry-run        # Test et
./local-release.sh patch           # 1.2.0 → 1.2.1 publish
./local-release.sh node            # Sadece Node.js
./local-release.sh status          # Durum raporu
```

### Sıradaki:
1. Token'ları ayarla (`.sdk-tokens.env`)
2. Opsiyonel: JSDoc, Streaming, Rate Limit Parsing

---

## 📝 Önceki Oturum (2026-05-19 01:52 — SDK Quality Audit)

### Doğrulama Sonucu:
- **SDK-QUALITY-GAPS.md güncelliğini yitirmiş** — Faz 1 (imza, retry, pagination) zaten tamamlanmış
- **İmza Doğrulama:** ✅ 11/11 SDK'da mevcut (HMAC-SHA256, 5 dk tolerance)
- **Retry/Backoff:** ✅ 11/11 SDK'da mevcut (429 Retry-After + exponential backoff)
- **Pagination:** ✅ 11/11 SDK'da mevcut
- **Error Types:** ❌ 6 SDK'da eksik (Rust, Java, Kotlin, C#, Elixir, Swift)
- **Gerçek kalite skoru:** %72 (önceki tahmin: %62)

### Sıradaki:
1. ~~Error class çeşitliliği (6 SDK) — tek kalan kritik eksik~~ ✅ TAMAMLANDI (11/11)
2. ~~Webhook Payload Parsing~~ ✅ TAMAMLANDI (11/11) — verify() → WebhookEvent
3. Idempotency Key — 🔴 YÜKSEK (1-2 saat)
4. Config options (tüm diller)
5. CI/CD otomatik publish

### Python SDK v1.2.0 Büyük Düzeltme (2026-05-18 22:52)
- **Kritik sorun düzeltildi**: Tüm API yolları Svix'ten kalmıştı, HookSniff'e uyarlandı
- `/api/v1/app/{app_id}/...` → `/v1/...` (16 API modülü)
- `app_id` parametresi kaldırıldı (JWT ile otomatik belirleniyor)
- Model'ler HookSniff gerçek response'larıyla uyumlu hale getirildi
- `application_id` field'ı EndpointOut'a eklendi (gerçek API'den doğrulandı)
- 22 yeni model dosyası oluşturuldu
- PyPI v1.2.0 yüklendi: https://pypi.org/project/hooksniff/1.2.0/
- Demo hesapla gerçek API test edildi: ✅ Uyumlu

### Java SDK Düzeltmeleri (2026-05-18 23:17)
- Aynı sorun: tüm API yolları `/api/v1/...` kullanıyordu
- 17 dosya düzeltildi, 720 satır silindi, 224 satır eklendi
- Endpoint.java: `app_id` kaldırıldı, `/v1/endpoints` kullanıyor
- Message.java: `/v1/webhooks` formatına çevrildi
- MessageAttempt.java: `/v1/webhooks/{id}/attempts` kullanıyor
- Authentication.java: HookSniff auth endpoint'leri (login, register, me)
- GitHub'a push edildi: ffb9786
