# 🎯 SDK Kalite Yol Haritası — Svix ile EŞİT Seviye Hedefi

> Oluşturulma: 2026-05-11 21:48 GMT+8
> Hedef: Tüm SDK'ları Svix ile AYNI kalite seviyesine çıkarmak
> Referans: Svix v1.93.0 SDK'ları (MIT lisans, açık kaynak)
> Kaynak: https://github.com/svix/svix-webhooks
> Kural: Eksik nokta kalmayacak

---

## ⚠️ TEMEL KURALLAR (Her oturumda uygulanacak)

1. **Eksik iş bırakılmayacak** — başlanan iş bitecek, yarım kalmayacak
2. **Yarım iş yapılmayacak** — compile + test + push olmadan iş bitmiş sayılmaz
3. **Kolaya kaçılmayacak** — "çabuk bitireyim" diye kaliteden ödün verilmeyecek
4. **Kusursuz olmazsa düzeltilecek** — test fail ederse veya kalite düşükse, geri dönüp düzeltilecek
5. **Her dilde aynı standart** — ister Node.js ister Elixir, kalite farkı olmayacak
6. **Backward compatibility** — mevcut kullanıcılar bozulmayacak
7. **Test zorunlu** — test olmadan publish yok
8. **Yanlış bulgu yok** — sorun varsa kanıtla, emin değilsen araştır, tahmin yürütme
9. **Her oturum sonunda sync** — MEMORY.md + NEXT_SESSION.md güncelle, GitHub'a push et
10. **Sor, tahmin yürütme** — emin olmadığın konuda Servet'e sor, varsayma
11. **Tek seferde doğru yap** — "düzeltiriz sonra" yok, ilk seferde doğru çıkacak
12. **Sadece görsel değil, işlev de tam olacak** — UI yapılıyorsa arkasındaki API/veri akışı da tamamlanacak, görsel güzel ama işlev eksik bırakılmayacak
13. **Bir dili yapıp diğerini salmayacağız** — başlanan dil bitecek, tüm diller aynı anda tamamlanacak, parça parça bırakılmayacak
14. **Gerektiğinde agent kullanılacak** — büyük işlerde paralel subagent ile çalışılacak, tek tek yapmak zorunda değiliz
15. **İnternetten derin araştırma yapılacak** — her konuda referans bulunacak, GitHub repolardan destek alınacak, tahminle değil veriyle çalışılacak
16. **Her iş sonrası detaylı denetim** — biten iş tekrar kontrol edilecek, eksik/hata varsa düzeltilecek, "yaptım bitti" yok
17. **Agentlar çalışırken boş durmayacaksın** — ana agent da çalışacak, farklı işleri paralel yürütecek
18. **Boşa çıkan agent yeni işe** — agent bitince yeni görev varsa hemen atanacak, diğerlerine de yardımcı olacak

---

## 📊 Mevcut Durum vs Hedef

| Kriter | Svix | HookSniff (şimdi) | Hedef | Fark |
|--------|------|-------------------|-------|------|
| Unique model types | 218 | 97 | **218+** | +121 model |
| Wrapper class | ✅ Svix() | ❌ | **✅** | Tüm diller |
| İmza doğrulama | ✅ Webhook.verify() | ❌ | **✅** | Tüm diller |
| HTTP library | native fetch+retry | request (deprecated) | **node-fetch** | Değiştir |
| Serialization | ✅ _toJsonObject/_fromJsonObject | ❌ | **✅** | Tüm diller |
| Deserialization | ✅ _fromJsonObject | ❌ | **✅** | Tüm diller |
| Pagination | ✅ Iterator pattern | ❌ | **✅** | Tüm diller |
| User-Agent header | ✅ svix-libs/version | ❌ | **✅** | Tüm diller |
| SDK version header | ✅ | ❌ | **✅** | Tüm diller |
| Idempotency key | ✅ Built-in | ❌ | **✅** | Tüm diller |
| Injectable HTTP | ✅ Custom fetch | ❌ | **✅** | Tüm diller |
| Timeout | ✅ Configurable | ❌ | **✅** | Tüm diller |
| Error classes | ✅ ApiException | ✅ HttpError | **✅** | Aynı |
| Retry logic | ✅ Exponential | ✅ Var | **✅** | Aynı |
| TypeScript types | ✅ | ✅ | **✅** | Aynı |
| Unit testler | ✅ CI | ❌ | **✅** | Her dilde 20+ |
| CHANGELOG | ❌ | ❌ | **✅** | Biz daha iyi |
| CI/CD | ✅ | ❌ | **✅** | GitHub Actions |
| Dokümantasyon | ✅ docs.svix.com | ❌ | **✅** | docs.hooksniff.dev |

---

## 🔴 AŞAMA 1 — OpenAPI Spec Genişletme (3-5 oturum)

**AMAÇ:** Model sayısını 97'den 218+'ya çıkarmak

Her endpoint için In/Out/Patch/PatchResponse model'leri tanımlanacak.

### 1.1 Mevcut Endpoint'lerin Model Eksikliklerini Tespit Et (1 oturum)
- `docs/openapi.yaml`'ı analiz et
- Her endpoint'in request/response model'lerini kontrol et
- Eksik Patch, Filter, ListResponse model'lerini listele
- **Çıktı:** Eksik model listesi (dosya: `.ai-context/sdk/MISSING_MODELS.md`)

### 1.2 Eksik Model'leri Ekle (2-3 oturum)
- Her endpoint kategorisi için:
  - `*Request` model (create/update)
  - `*Response` model (detail)
  - `*PatchRequest` model (partial update)
  - `*ListResponse` model (pagination wrapper)
  - `*Filter` model (arama/filtre parametreleri)
- **Kategoriler:**
  - Auth (login, register, 2FA, password reset)
  - Endpoints (CRUD, health, retry policy, secret rotation)
  - Webhooks (send, batch, replay, export, attempts)
  - Billing (subscription, usage, invoices, portal)
  - Alerts (rules, notifications, conditions)
  - Analytics (trends, success rate, latency)
  - Teams (members, invites, roles)
  - Notifications (preferences, read/unread)
  - Schemas (register, validate)
  - Admin (users, system, revenue)
  - Search (query, filters, results)
  - Routing (rules, transforms)
  - Rate Limits (config, usage)
  - Custom Domains (verify, DNS)
  - SSO (config, providers)
  - Templates (list, apply)

### 1.3 SDK'ları Yeniden Üret (1 oturum)
```bash
openapi-generator-cli generate \
  -i docs/openapi.yaml \
  -g typescript-node \
  -o sdks/node
# Her dil için tekrarla
```

---

## 🟠 AŞAMA 2 — Wrapper Class + İmza Doğrulama (6-8 oturum)

**AMAÇ:** `new HookSniff(key)` → `client.endpoints.create()` pattern

### 2.1 Node.js Referans Implementasyonu (2 oturum)
- **Dosya:** `sdks/node/src/hooksniff.ts` (yeni)
- **İçerik:**
  ```typescript
  export class HookSniff {
    constructor(apiKey: string, options?: { baseUrl?: string; timeout?: number; fetch?: typeof fetch })
    
    endpoints: {
      create(req: CreateEndpointRequest): Promise<Endpoint>
      get(id: string): Promise<Endpoint>
      list(): Promise<Endpoint[]>
      update(id: string, req: UpdateEndpointRequest): Promise<Endpoint>
      delete(id: string): Promise<void>
      rotateSecret(id: string): Promise<{ secret: string }>
      updateRetryPolicy(id: string, policy: RetryPolicy): Promise<Endpoint>
      getHealth(id: string): Promise<EndpointHealth>
    }
    
    webhooks: {
      send(req: CreateWebhookRequest): Promise<Delivery>
      get(id: string): Promise<Delivery>
      list(options?: { status?: string; page?: number }): Promise<DeliveryList>
      replay(id: string): Promise<Delivery>
      batch(req: BatchWebhookRequest): Promise<BatchResponse>
      attempts(id: string): Promise<DeliveryAttempt[]>
      export(range?: string): Promise<string>
    }
    
    auth: { ... }
    alerts: { ... }
    analytics: { ... }
    billing: { ... }
    teams: { ... }
    notifications: { ... }
    schemas: { ... }
    search: { ... }
    admin: { ... }
    auditLog: { ... }
    inbound: { ... }
    templates: { ... }
    routing: { ... }
    rateLimits: { ... }
    customDomains: { ... }
    sso: { ... }
    // ... tüm API grupları
  }
  ```

### 2.2 Node.js İmza Doğrulama (1 oturum)
- **Dosya:** `sdks/node/src/webhook.ts` (yeni)
- **İçerik:**
  ```typescript
  export class Webhook {
    constructor(secret: string)
    verify(payload: string | Buffer, headers: Record<string, string>): boolean
    static sign(payload: string | Buffer, secret: string): string
  }
  ```
- **Algoritma:** HMAC-SHA256
- **Header formatı:** `v1,<timestamp>,<signature>`
- **Timestamp validation:** ±5 dakika tolerance
- **Timing-safe comparison:** `crypto.timingSafeEqual()`

### 2.3 Node.js HTTP Library Değişimi (1 oturum)
- **Dosya:** Tüm `sdks/node/src/api/*.ts` dosyaları
- **Değişiklik:** `request` → `node-fetch` veya native `fetch`
- **User-Agent:** `hooksniff-sdk/0.3.0 (node)`
- **Timeout:** Configurable, default 30s
- **Retry:** Exponential backoff (zaten var, modernize et)

### 2.4 Node.js Serialization Katmanı (1 oturum)
- **Dosya:** Tüm `sdks/node/src/model/*.ts` dosyaları
- **İçerik:** Her model için:
  ```typescript
  static _toJsonObject(obj: Endpoint): Record<string, unknown> { ... }
  static _fromJsonObject(json: Record<string, unknown>): Endpoint { ... }
  ```

### 2.5 Node.js Pagination Iterator (1 oturum)
- **Dosya:** `sdks/node/src/pagination.ts` (yeni)
- **İçerik:**
  ```typescript
  async function* paginate<T>(fetchPage: (page: number) => Promise<{ data: T[]; hasMore: boolean }>): AsyncGenerator<T> {
    let page = 1;
    while (true) {
      const { data, hasMore } = await fetchPage(page);
      yield* data;
      if (!hasMore) break;
      page++;
    }
  }
  ```

### 2.6 Python Wrapper + İmza + Serialization (1 oturum)
- `sdks/python/hooksniff/client.py` (yeni)
- `sdks/python/hooksniff/webhook.py` (yeni)
- Node.js kalıbını Python'a çevir

### 2.7 Go Wrapper + İmza (1 oturum)
- `sdks/go/hooksniff.go` (yeni)
- `sdks/go/webhook.go` (yeni)

### 2.8 Rust, Java, Kotlin, Ruby, PHP, C#, Elixir, Swift (批量, 1-2 oturum)
- Aynı kalıbı tüm dillere kopyala
- Her dilin idiomlarına uygun hale getir

---

## 🟡 AŞAMA 3 — Kalite ve Güvenilirlik (8-10 oturum)

### 3.1 Unit Testler — Node.js (2 oturum)
- **Dosya:** `sdks/node/tests/` (yeni klasör)
- **Test sayısı:** 25+ test
- **Kapsam:**
  - Wrapper class instantiation
  - API method parametreleri
  - Model serialization/deserialization
  - İmza doğrulama (geçerli/geçersiz/expired)
  - Pagination iterator
  - Error handling (401, 404, 429, 500)
  - Timeout behavior
  - Retry logic
  - User-Agent header
  - Idempotency key

### 3.2 Unit Testler — Python (1 oturum)
- `sdks/python/tests/` — pytest ile 20+ test

### 3.3 Unit Testler — Go (1 oturum)
- `sdks/go/*_test.go` — testing ile 20+ test

### 3.4 Unit Testler — Rust (1 oturum)
- `sdks/rust/tests/` — #[test] ile 20+ test

### 3.5 Unit Testler — Kalan 7 Dil (2-3 oturum)
- Java: JUnit, Kotlin: JUnit, Ruby: RSpec, PHP: PHPUnit, C#: xUnit, Elixir: ExUnit, Swift: XCTest

### 3.6 CHANGELOG Oluşturma (1 oturum)
- Her SDK için `CHANGELOG.md`
- Format: Keep a Changelog (https://keepachangelog.com/)
- Mevcut versiyonlar: 0.1.0, 0.2.0, 0.3.0

### 3.7 Eski Versiyon Dokümantasyonu (1 oturum)
- Migration guide: 0.1.0 → 0.2.0 → 0.3.0
- Breaking changes listesi

---

## 🟢 AŞAMA 4 — Operasyonel Mükemmellik (5-7 oturum)

### 4.1 CI/CD Pipeline (2 oturum)
- `.github/workflows/sdk-test.yml` — PR'da test
- `.github/workflows/sdk-publish.yml` — tag'de publish
- Alternatif: GCP Cloud Build (GitHub Actions billing sorunu)

### 4.2 Otomatik Versiyon Yönetimi (1 oturum)
- OpenAPI spec değişince → SDK versiyonu otomatik art
- Semver: PATCH (fix), MINOR (new endpoint), MAJOR (breaking)

### 4.3 SDK Dokümantasyon Sitesi (2-3 oturum)
- Her dil için:
  - Quick Start
  - Full API reference
  - Code examples (her endpoint için)
  - Migration guide
  - Error handling guide
  - İmza doğrulama guide
- Platform: Docusaurus veya Mintlify

### 4.4 Performance Benchmarking (1 oturum)
- Her SDK için:
  - İlk bağlantı süresi
  - Request/response latency
  - Memory usage
  - Bundle size (Node.js, Python)

---

## 📊 Dil Kapsamı (Karar: 2026-05-11)

**Öncelikli 6 dil (Svix seviyesi hedefi):**
| # | Dil | Registry | Neden öncelikli |
|---|-----|----------|-----------------|
| 1 | Node.js | npm | En yaygın webhook tüketicisi |
| 2 | Python | PyPI | İkinci en yaygın |
| 3 | Go | Go modules | DevOps/backend dünyası |
| 4 | Java | Maven Central | Enterprise |
| 5 | Ruby | RubyGems | Rails ekosistemi |
| 6 | C# | NuGet | .NET ekosistemi |

**Lansman sonrası (talep gelince):**
Kotlin, PHP, Elixir, Swift, Rust — aynı kalıbı uygulayarak genişletilecek

---

## 📋 Oturum Uygulama Planı (Toplam: ~15 oturum — 6 dil)

### Hafta 1 (5 oturum) — Aşama 1 + Aşama 2 başlangıcı
| Oturum | Görev | Aşama |
|--------|-------|-------|
| 1 | OpenAPI spec analizi — eksik model listesi | 1.1 |
| 2 | OpenAPI spec — Auth + Endpoint modelleri | 1.2 |
| 3 | OpenAPI spec — Webhook + Billing + kalan modeller | 1.2 |
| 4 | SDK'ları yeniden üret (tüm diller) | 1.3 |
| 5 | Node.js wrapper class (referans implementasyon) | 2.1 |

### Hafta 2 (5 oturum) — Aşama 2 devam
| Oturum | Görev | Aşama |
|--------|-------|-------|
| 6 | Node.js imza doğrulama + serialization | 2.2 + 2.4 |
| 7 | Node.js HTTP lib fix + pagination | 2.3 + 2.5 |
| 8 | Python wrapper + imza + serialization | 2.6 |
| 9 | Go wrapper + imza | 2.7 |
| 10 | Rust, Java, Kotlin批量 wrapper | 2.8 |

### Hafta 3 (5 oturum) — Aşama 2 bitiş + Aşama 3 başlangıcı
| Oturum | Görev | Aşama |
|--------|-------|-------|
| 11 | Ruby, PHP, C#, Elixir, Swift批量 wrapper | 2.8 |
| 12 | Node.js unit testler | 3.1 |
| 13 | Python unit testler | 3.2 |
| 14 | Go unit testler | 3.3 |
| 15 | Rust unit testler | 3.4 |

### Hafta 4 (5 oturum) — Aşama 3 bitiş + Aşama 4
| Oturum | Görev | Aşama |
|--------|-------|-------|
| 16 | Kalan 7 dil testler (批量) | 3.5 |
| 17 | CHANGELOG + migration guide | 3.6 + 3.7 |
| 18 | CI/CD pipeline | 4.1 |
| 19 | Otomatik versiyon yönetimi | 4.2 |
| 20 | SDK dokümantasyon sitesi başlangıcı | 4.3 |

### Hafta 5 (2-5 oturum) — Bitiş
| Oturum | Görev | Aşama |
|--------|-------|-------|
| 21 | SDK dokümantasyon sitesi devam | 4.3 |
| 22 | Performance benchmarking | 4.4 |
| 23-25 | Buffer — eksik kalan, düzeltme, polish | - |

---

## ⚠️ Dikkat Edilecekler

1. **Her oturum sonunda GitHub'a push et** — yarım iş bırakma
2. **Backward compatibility** — mevcut kullanıcılar bozulmamalı
3. **Semver** — breaking change = major version bump (0.3.0 → 1.0.0)
4. **Test zorunlu** — test olmadan publish yok
5. **CHANGELOG güncelle** — her değişiklik kaydedilmeli
6. **Svix kodunu doğrudan kopyalama** — mimariyi örnek al, kodu yaz
7. **OpenAPI spec önce** — SDK'dan önce spec'i güncelle
8. **Her dilin idiomlarına uy** — Pythonic, Go-style, Rust-idiomatic vb.
9. **Bağımlılık minimal tut** — Svix'in 1 bağımlılık standardı
10. **Publish sonrası smoke test** — her registry'de `install + import` test et

---

## 🔧 Teknik Referanslar

### Svix Kaynak Kodu (MIT Lisans — mimari referans)
- Node.js: https://github.com/svix/svix-webhooks/tree/main/javascript/src
- Python: https://github.com/svix/svix-webhooks/tree/main/python/svix
- Go: https://github.com/svix/svix-webhooks/tree/main/go
- Rust: https://github.com/svix/svix-webhooks/tree/main/rust/src
- Webhook verify: https://github.com/svix/svix-webhooks/blob/main/javascript/src/webhook.ts

### Standard Webhooks
- Spec: https://github.com/standard-webhooks/standard-webhooks
- HMAC-SHA256, `svix-id`, `svix-timestamp`, `svix-signature` header'ları

### OpenAPI Generator
- Docs: https://openapi-generator.tech/
- HookSniff spec: `docs/openapi.yaml`
- Config: `openapitools.json`
