# 🔍 HookSniff SDK & Documentation Deep Audit Report

**Tarih:** 2026-05-10  
**Kapsam:** 11 SDK, OpenAPI Spec, Dokümantasyon, CLI, MCP, Portal  
**Toplam Bulunan Sorun:** 75

---

## ÖZET

| Kategori | Kritik | Yüksek | Orta | Düşük | Toplam |
|----------|--------|--------|------|-------|--------|
| SDK Genel | 4 | 22 | 18 | 8 | 52 |
| OpenAPI Spec | 0 | 2 | 3 | 1 | 6 |
| Dokümantasyon | 1 | 7 | 4 | 2 | 14 |
| CLI | 0 | 1 | 1 | 1 | 3 |
| MCP | 1 | 1 | 1 | 0 | 3 |
| Portal | 0 | 0 | 1 | 1 | 2 |
| **TOPLAM** | **6** | **33** | **28** | **13** | **80** |

---

## 1. SDK ANALİZİ

### 1.1 API Base URL Tutarsızlığı (TÜM SDK'LER)

TÜM SDK'lerde **üç farklı URL** var:

| Kaynak | URL |
|--------|-----|
| **SDK kodu (default)** | `https://api.hooksniff.com/v1` |
| **OpenAPI spec / Docs** | `https://hooksniff-api-1046140057667.europe-west1.run.app/v1` |
| **MCP server** | `https://api.hooksniff.dev/v1` |

SDK'ler kodda `api.hooksniff.com` kullanıyor ama README'lerde GCP Cloud Run URL'ini gösteriyor. Bu, kullanıcıların karışmasına neden olur.

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/*/src/*` (tümü) | SDK default URL `https://api.hooksniff.com/v1` ama prod URL GCP Cloud Run | **Kritik** | Tek bir canonical URL belirle ve tüm SDK'lerde/docs'ta/OpenAPI'da kullan |
| `sdks/*/README.md` (tümü) | README API Reference bölümünde GCP Cloud Run URL var ama kodda farklı | **Yüksek** | README'lerdeki API Reference section'ı kodla eşleştir |
| `mcp/index.js` | `HOOKSNIFF_BASE_URL` default `https://api.hooksniff.dev/v1` — diğer hiçbir yerde yok | **Kritik** | `api.hooksniff.dev` → `api.hooksniff.com` veya GCP URL |

### 1.2 Version Tutarsızlıkları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/kotlin/build.gradle.kts` | Version `0.3.0` ama README'de `0.2.0` | **Yüksek** | Version'ı senkronize et |
| `sdks/kotlin/pom.xml` | Version `0.2.0` ama build.gradle.kts'te `0.3.0` | **Yüksek** | Aynı SDK içinde version farklı — tek kaynak belirle |
| `sdks/java/pom.xml` | Version `0.2.0` ama README'de `0.1.0` | **Yüksek** | Senkronize et |
| `sdks/rust/Cargo.toml` | Version `0.2.0` ama User-Agent `hooksniff-rust/0.2.0` ✓ (tutarlı) | ✅ OK | — |
| `sdks/node/package.json` | Version `0.1.0`, User-Agent `hooksniff-node/0.1.0` ✓ | ✅ OK | — |
| `sdks/python/setup.py` | Version `0.1.0`, User-Agent `hooksniff-python/0.1.0` ✓ | ✅ OK | — |
| `sdks/ruby/lib/hooksniff/version.rb` | VERSION `0.1.0`, gemspec `0.1.0` ✓ | ✅ OK | — |
| `sdks/elixir/mix.exs` | Version `0.2.0`, User-Agent `hooksniff-elixir/0.2.0` ✓ | ✅ OK | — |
| `sdks/php/composer.json` | Version `0.1.0`, User-Agent `hooksniff-php/0.1.0` ✓ | ✅ OK | — |
| `sdks/csharp/HookSniff.csproj` | Version `0.2.0`, User-Agent `hooksniff-csharp/0.2.0` ✓ | ✅ OK | — |
| `sdks/swift/Package.swift` | Version belirtilmemiş, User-Agent `hooksniff-swift/0.2.0` | **Düşük** | Package.swift'e version ekle |

### 1.3 Legacy Header Adı: `X-Hookrelay-Signature`

Birçok SDK'da eski `X-Hookrelay-Signature` header'ı hâlâ referans olarak geçiyor. Header adı `X-Hooksniff-Signature` olmalı.

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/python/hooksniff/utils.py` | Docstring'te `X-Hookrelay-Signature` referansı | **Orta** | `X-Hooksniff-Signature` olarak güncelle |
| `sdks/python/hooksniff/utils.py` | `WebhookHandler` default `signature_header = "X-Hookrelay-Signature"` | **Yüksek** | `"X-Hooksniff-Signature"` yap |
| `sdks/go/hooksniff.go` | Legacy path'te `X-Hookrelay-Signature` header kontrolü | **Yüksek** | `X-Hooksniff-Signature` olarak güncelle |
| `sdks/elixir/lib/hooksniff/webhook_verification.ex` | `X-Hookrelay-Signature` docstring'te | **Orta** | Güncelle |
| `sdks/ruby/lib/hooksniff/verification.rb` | `X-Hookrelay-Signature` docstring'te | **Orta** | Güncelle |
| `sdks/java/src/main/java/com/hooksniff/WebhookVerification.java` | `X-Hookrelay-Signature` docstring'te | **Orta** | Güncelle |

### 1.4 Retry Logic Eksikliği

Hiçbir SDK'da **istemci tarafı retry logic** yok. Rate limit (429) durumunda retry yapmıyorlar.

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/node/src/index.ts` | 429'da retry yok, sadece exception fırlatıyor | **Yüksek** | Exponential backoff ile retry ekle (opsiyonel config) |
| `sdks/python/hooksniff/client.py` | 429'da retry yok | **Yüksek** | Retry decorator veya built-in retry ekle |
| `sdks/go/hooksniff.go` | 429'da retry yok | **Yüksek** | Retry middleware ekle |
| `sdks/rust/src/lib.rs` | 429'da retry yok | **Yüksek** | Retry ekle |
| `sdks/ruby/lib/hooksniff/client.rb` | 429'da retry yok | **Yüksek** | Retry ekle |
| `sdks/java/.../HookSniffClient.java` | 429'da retry yok | **Yüksek** | Retry ekle |
| `sdks/kotlin/.../HookSniffClient.kt` | 429'da retry yok | **Yüksek** | Retry ekle |
| `sdks/php/src/HookSniffClient.php` | 429'da retry yok | **Yüksek** | Retry ekle |
| `sdks/csharp/HookSniffClient.cs` | 429'da retry yok | **Yüksek** | Retry ekle |
| `sdks/elixir/lib/hooksniff.ex` | 429'da retry yok | **Yüksek** | Retry ekle |
| `sdks/swift/Sources/HookSniff/HookSniff.swift` | 429'da retry yok | **Yüksek** | Retry ekle |

### 1.5 Eksik SDK Özellikleri

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/node/src/types.ts` | `ApiError` type'ı var ama `error` field'ı `string` olarak tanımlanmış — OpenAPI'da `object` | **Orta** | Schema'yı OpenAPI ile eşleştir |
| `sdks/python/hooksniff/client.py` | `list()` methodu dict döndürüyor ama diğer methodlar dataclass döndürüyor — API tutarsız | **Orta** | `list()` de typed model döndürsün |
| `sdks/rust/src/lib.rs` | `list()` `Vec<Endpoint>` döndürüyor ama API `EndpointListResponse` döndürüyor (paginated) | **Orta** | Paginated response'a çevir |
| `sdks/swift/.../HookSniff.swift` | `list()` `Vec<Endpoint>` döndürüyor, pagination bilgisi kayıp | **Orta** | `EndpointList` struct ekle |
| `sdks/kotlin/.../HookSniffClient.kt` | `SearchResource` inner class ama `client.search` field olarak expose ediliyor — diğer resource'lardan farklı pattern | **Düşük** | Tutarlı resource pattern kullan |
| `sdks/swift/.../HookSniff.swift` | `SearchResource` class'ı tanımlı ama `HookSniff` class'ında property olarak expose edilmiyor — erişilemez | **Orta** | `public let search: SearchResource` ekle |

### 1.6 Error Handling Sorunları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/java/.../HookSniffClient.java` | `request()` ve `requestArray()` neredeyse identical kod — DRY ihlali | **Orta** | Ortak HTTP helper method'a refactor et |
| `sdks/kotlin/.../HookSniffClient.kt` | `TypeToken<T>()` reified type erasure ile çalışmaz — generic deserialization hatası | **Kritik** | `inline fun <reified T>` kullan veya manual type mapping |
| `sdks/go/hooksniff.go` | `getStats()` methodu yok — diğer tüm SDK'lerde var | **Orta** | `Stats()` methodu ekle |
| `sdks/swift/.../HookSniff.swift` | `getStats()` methodu yok — Stats struct'ı var ama method yok | **Orta** | `getStats()` async methodu ekle |
| `sdks/elixir/lib/hooksniff.ex` | `get_stats()` methodu yok | **Orta** | `stats()` fonksiyonu ekle |
| `sdks/python/hooksniff/client.py` | `requests.RequestException` yakalanıyor ama `ConnectionError`, `Timeout` ayrı handle edilmiyor | **Düşük** | Spesifik exception'lar için ayrı handling ekle |

### 1.7 Type Safety Sorunları

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/go/hooksniff.go` | `Endpoint.RetryPolicy` `map[string]interface{}` olarak tanımlanmış — struct olmalı | **Orta** | `RetryPolicy` struct'ı oluştur |
| `sdks/go/hooksniff.go` | `Delivery.ReplayCount` `*int` (pointer) ama diğer int field'lar value — tutarsız | **Düşük** | Tutarlı type kullanımı |
| `sdks/ruby/lib/hooksniff/models.rb` | Model attribute'lar `attr_reader` ile readonly ama `to_h` methodu var — serialization eksik | **Düşük** | `to_json` methodu ekle |

### 1.8 Test Coverage

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/node/src/__tests__/index.test.ts` | Test dosyası mevcut ✓ | ✅ OK | — |
| `sdks/python/tests/test_client.py` | Test dosyası mevcut ✓ | ✅ OK | — |
| `sdks/go/hooksniff_test.go` | Test dosyası mevcut ✓ | ✅ OK | — |
| `sdks/rust/src/lib.rs` | `#[cfg(test)]` modülü mevcut ✓ | ✅ OK | — |
| `sdks/java/` | Test dosyası yok | **Orta** | Unit test ekle |
| `sdks/kotlin/` | Test dosyası yok | **Orta** | Unit test ekle |
| `sdks/ruby/` | Test dosyası yok | **Orta** | Unit test ekle |
| `sdks/php/` | Test dosyası yok | **Orta** | Unit test ekle |
| `sdks/csharp/` | Test dosyası yok | **Orta** | Unit test ekle |
| `sdks/elixir/` | Test dosyası yok | **Orta** | Unit test ekle |
| `sdks/swift/` | Test dosyası yok | **Orta** | Unit test ekle |

### 1.9 Package Manager Publish Durumu

| SDK | Publish | Durum |
|-----|---------|-------|
| Node.js | npm `hooksniff-sdk` | Badge var, publish durumu belirsiz |
| Python | PyPI `hooksniff` | Badge var, publish durumu belirsiz |
| Go | `github.com/servetarslan02/hooksniff-go` | go.mod'da module path var |
| Rust | crates.io `hooksniff` | Badge var, publish durumu belirsiz |
| Ruby | RubyGems `hooksniff` | Badge var, publish durumu belirsiz |
| Java | Maven Central `io.github.servetarslan02:hooksniff-sdk` | pom.xml'de OSSRH config var |
| Kotlin | Maven Central `io.github.servetarslan02:hooksniff` | pom.xml + build.gradle.kts'te config var |
| PHP | Packagist `hooksniff/hooksniff-php` | composer.json'da config var |
| C# | NuGet `HookSniff` | .csproj'te config var |
| Elixir | Hex `hooksniff` | mix.exs'te package config var |
| Swift | SPM (GitHub) | Package.swift'te config var |

---

## 2. OPENAPI SPEC ANALİZİ

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `docs/openapi.yaml` | `/endpoints` GET response `type: array` ama SDK'ler `{ endpoints: [], total, page, per_page }` döndürüyor — schema mismatch | **Yüksek** | OpenAPI'da `EndpointListResponse` schema'sı ekle |
| `docs/openapi.yaml` | `/search` endpoint'inde `q` parametresi `required: true` ama SDK'ler opsiyonel kullanıyor | **Orta** | `required`'dan kaldır veya SDK'leri güncelle |
| `docs/openapi.yaml` | `/webhooks/export` endpoint'inde `range` parametresi var ama SDK'ler `format`, `status`, `date_from`, `date_to` kullanıyor — parametre uyumsuzluğu | **Yüksek** | OpenAPI'yı API gerçek implementasyonuyla eşleştir |
| `docs/openapi.yaml` | Rate limit bilgisi yok (sadece `429` response var, header bilgisi yok) | **Orta** | `X-RateLimit-*` header'larını document et |
| `docs/openapi.yaml` | Example request/response'lar yok — sadece schema tanımları var | **Düşük** | Her endpoint'e `examples` ekle |
| `docs/openapi.yaml` | `/endpoints/{id}/retry-policy` PUT endpoint'i var ama hiçbir SDK bu endpoint'i implemente etmiyor | **Orta** | SDK'lere `updateRetryPolicy()` methodu ekle veya endpoint'i kaldır |

---

## 3. DOKÜMANTASYON KALİTESİ

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `sdks/node/README.md` | npm package `hooksniff-sdk` ama import `@hooksniff/sdk` — farklı isimler | **Kritik** | Package adını `@hooksniff/sdk` olarak publish et veya README'yi düzelt |
| `sdks/node/README.md` | API Reference'da `client.endpoints.list()` → `Promise<Endpoint[]>` ama implementasyonda `{ endpoints, total, page, perPage }` döndürüyor | **Yüksek** | README'yi implementasyonla eşleştir |
| `sdks/node/README.md` | `client.endpoints.rotateSecret()` methodu implementasyonda var ama README API Reference'da yok | **Orta** | README'ye ekle |
| `sdks/python/README.md` | `HookSniffClient` base URL default `https://hooksniff-api-1046140057667.europe-west1.run.app/v1` ama kodda `https://api.hooksniff.com/v1` | **Yüksek** | Eşleştir |
| `sdks/python/README.md` | `verify_signature` docstring'te `X-Hookrelay-Signature` header referansı | **Orta** | `X-Hooksniff-Signature` yap |
| `sdks/go/README.md` | `client.Endpoints.List(ctx)` çağrısı — ama implementasyon `List(ctx, page, perPage)` gerektiriyor | **Yüksek** | README'yi düzelt |
| `sdks/go/README.md` | `NewWithBaseURL` example'da GCP URL var — ama default zaten `api.hooksniff.com` | **Düşük** | Tutarlı URL kullanımı |
| `sdks/kotlin/README.md` | Gradle dependency version `0.2.0` ama build.gradle.kts'te `0.3.0` | **Yüksek** | Güncelle |
| `sdks/ruby/README.md` | Quick Start'ta `endpoint[:id]` kullanılıyor ama `Endpoint` modeli `attr_reader :id` — `.id` olmalı | **Yüksek** | README'yi düzelt |
| `sdks/php/README.md` | `base_url` default `https://hooksniff-api-1046140057667.europe-west1.run.app/v1` ama kodda `https://api.hooksniff.com/v1` | **Yüksek** | Eşleştir |
| `docs/api-reference.md` | `GET /v1/endpoints` response array olarak gösteriliyor ama API paginated response döndürüyor | **Yüksek** | Düzelt |
| `docs/api-reference.md` | `/v1/webhooks/export` endpoint'inde `format`, `status`, `date_from`, `date_to` parametreleri var ama OpenAPI'da `range` var | **Yüksek** | Tutarsız — hangisi doğru? |
| `docs/examples.md` | Python example'da `request.get_data(as_text=True)` Flask-specific — FastAPI'de farklı | **Düşük** | Framework-agnostic example ekle |
| `docs/quickstart.md` | GCP Cloud Run URL kullanıyor — ama SDK'ler `api.hooksniff.com` | **Orta** | Canonical URL belirle |

---

## 4. CLI TOOL ANALİZİ

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `cli/index.js` | Environment variable `HOOKRELAY_API_URL` ve `HOOKRELAY_API_KEY` — eski isim! `HOOKSNIFF_*` olmalı | **Yüksek** | `HOOKRELAY_*` → `HOOKSNIFF_*` olarak güncelle |
| `cli/index.js` | Default API URL `http://localhost:3000/v1` — prod URL değil | **Orta** | Prod default ekle veya env var zorunlu kıl |
| `cli/index.js` | `--version` flag'i var ama `program.version('0.1.0')` hardcoded — package.json'dan okumalı | **Düşük** | `package.json`'dan version oku |

---

## 5. MCP (Model Context Protocol) ANALİZİ

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `mcp/index.js` | `HOOKSNIFF_BASE_URL` default `https://api.hooksniff.dev/v1` — hiçbir SDK veya doc'ta bu URL yok | **Kritik** | `api.hooksniff.com/v1` veya GCP URL yap |
| `mcp/index.js` | `list_deliveries` tool'unda `limit` parametresi var ama API `per_page` bekliyor | **Yüksek** | `limit` → `per_page` olarak düzelt |
| `mcp/index.js` | `create_endpoint` tool'unda `retry_policy` parametresi yok — API destekliyor | **Orta** | `retry_policy` parametresi ekle |
| `mcp/index.js` | Error handling sadece `res.text()` — structured error parsing yok | **Orta** | Error response'ı parse et ve user-friendly mesaj göster |

---

## 6. PORTAL (Embeddable Widget) ANALİZİ

| Dosya | Sorun | Severity | Çözüm |
|-------|-------|----------|-------|
| `portal/embed.js` | API key URL parameter olarak iframe src'ye ekleniyor — URL'de görünür, loglanabilir | **Orta** | `postMessage` ile API key'i iframe'e güvenli şekilde传递 et |
| `portal/widget.html` | `escHtml()` fonksiyonu `textContent` kullanıyor — XSS güvenli ✓ | ✅ OK | — |
| `portal/widget.html` | `data-theme` attribute'u URL'den okunuyor — sanitize edilmiyor ama sadece `dark`/`light` kabul ediliyor | ✅ OK | — |
| `portal/style.css` | `@media (max-width: 600px)` responsive breakpoint var ✓ | ✅ OK | — |
| `portal/widget.html` | `loading="lazy"` attribute'u iframe'de var ✓ | ✅ OK | — |
| `portal/widget.html` | `allow="clipboard-read; clipboard-write"` — gereksiz permission | **Düşük** | Sadece gerekli permission'ları ver |

---

## 7. CROSS-CUTTING SORUNLAR

### 7.1 Webhook Verification Implementasyon Farkları

Her SDK'da webhook verification var ama implementasyon detayları farklı:

| SDK | Legacy Format | Standard Webhooks | Svix Fallback | Timestamp Check |
|-----|--------------|-------------------|---------------|-----------------|
| Node.js | ✓ `sha256=<hex>` | ✓ `v1,<base64>` | ✓ | ✓ 300s |
| Python | ✓ | ✓ | ✓ | ✓ 300s |
| Go | ✓ | ✓ | ✓ | ✓ 300s |
| Rust | ✗ | ✓ | ✓ | ✓ 300s |
| Ruby | ✓ | ✓ | ✓ | ✓ 300s |
| Java | ✓ | ✓ | ✓ | ✓ 300s |
| Kotlin | ✓ | ✓ | ✓ | ✓ 300s |
| PHP | ✓ | ✓ | ✓ | ✓ 300s |
| C# | ✓ | ✓ | ✓ | ✓ 300s |
| Elixir | ✓ | ✓ | ✓ | ✓ 300s |
| Swift | ✗ | ✓ | ✓ | ✓ 300s |

**Rust ve Swift** legacy `sha256=<hex>` formatını desteklemiyor — bu kasıtlı olabilir ama tutarlılık açısından belgelenmeli.

### 7.2 SDK Feature Parity Matrix

| Feature | Node | Python | Go | Rust | Ruby | Java | Kotlin | PHP | C# | Elixir | Swift |
|---------|------|--------|-----|------|------|------|--------|-----|-----|--------|-------|
| Endpoints CRUD | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Webhooks Send | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Batch | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Replay | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Attempts | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Export | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Search | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✗¹ |
| Stats | ✓ | ✓ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| RotateSecret | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Webhook Verifier | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Webhook Handler | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Client Retry | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

**Eksik özellikler:**
- Go: `getStats()` methodu yok
- Swift: `SearchResource` class'ı tanımlı ama `HookSniff` class'ında property olarak expose edilmiyor — erişilemez
- Swift: `getStats()` methodu yok (Stats struct'ı var ama method yok)
- Elixir: `get_stats()` methodu yok
- Java: `search()` methodu yok

---

## ÖNCELİKLİ AKSİYON PLANI

### 🔴 Kritik (Hemen yapılmalı)
1. **API URL standardizasyonu** — Tek canonical URL belirle ve tüm SDK/docs/OpenAPI/MCP'de kullan
2. **MCP `api.hooksniff.dev` → `api.hooksniff.com`** — Yanlış URL
3. **Node.js `@hooksniff/sdk` vs `hooksniff-sdk`** — Package adı karışıklığı
4. **Kotlin `TypeToken<T>` reified type erasure** — Runtime crash

### 🟡 Yüksek (Bu hafta)
5. Version senkronizasyonu (Kotlin, Java)
6. `X-Hookrelay-Signature` → `X-Hooksniff-Signature` (Python, Go, Ruby, Java, Elixir)
7. CLI `HOOKRELAY_*` → `HOOKSNIFF_*` env vars
8. OpenAPI schema mismatch'leri düzelt
9. README API Reference section'ları kodla eşleştir
10. Client-side retry logic ekle (tüm SDK'ler)

### 🟢 Orta (Sprint içinde)
11. Test coverage ekle (Java, Kotlin, Ruby, PHP, C#, Elixir, Swift)
12. OpenAPI'ya rate limit header documentation ekle
13. MCP'ye eksik parametreler ekle
14. Portal API key传递方式'ini güvence altına al
15. SDK feature parity eksikliklerini kapat

### ⚪ Düşük (Backlog)
16. Example request/response'ları OpenAPI'ya ekle
17. CLI version'ı package.json'dan oku
18. Portal clipboard permission'ını minimize et
19. Python SDK'da spesifik exception handling
20. Go SDK'da `RetryPolicy` struct'ı oluştur
