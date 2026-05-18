# MEMORY.md — HookSniff Proje Hafızası

> Son güncelleme: 2026-05-19 00:36 GMT+8 (Tüm SDK registry publish tamamlandı)
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
| **Demo giriş** | email: demo@hooksniff.com / şifre: Demo1234! |
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
| 1 | Node.js | npm | 1.1.0 | ✅ Yüklendi |
| 2 | Python | PyPI | 1.1.0 | ✅ Yüklendi |
| 3 | Go | GitHub tag | v1.1.0 | ✅ |
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

## ⚠️ KRİTİK KURALLAR

1. **SDK sıfırdan yazılmaz** — Svix SDK'dan kopyala, adapte et
2. **Eksik iş bırakma** — Her faz: Migration + API + Dashboard + 11 SDK + Sidebar + i18n + Push
3. **Ayrı repolar var** — SDK'lar `sdks/` klasörü DEĞİL, ayrı GitHub repolarında
4. **Oturumlar 1 saat** — Her şeyi dosyalara yaz, push et
5. **Cloud Build manuel** — API deploy için tetikleme gerekli

---

## 📝 Son Oturum (2026-05-19)

- Tüm SDK registry publish işlemleri tamamlandı (Ruby, Java, Kotlin, C#, Elixir)
- 11 SDK → 11 registry'de yüklü ✅
- **Pagination Helper** tüm 11 SDK'ya eklendi ✅
  - Python: `ListResponse` + `for msg in response:` auto-paginate
  - Node.js: `listAll()` methodu + `createPaginator()` helper
  - Go: generic `Paginator[T]` + `ListAll()` methodu
  - PHP: `Paginator::paginate()` generator
  - Java: `Paginator<T>` Iterable class
  - Kotlin: `Paginator<T>` Iterable class
  - Ruby: `Paginator` Enumerable class
  - C#: `Paginator<T>` IAsyncEnumerable
  - Elixir: `Paginator.paginate()` Stream
  - Rust: `Paginator<T>` struct with async collect
  - Swift: `Paginator<T>` AsyncSequence
- Sıradaki: Error class çeşitliliği veya imza doğrulama

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
