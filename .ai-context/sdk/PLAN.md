# SDK Execution Plan — Aşama Aşama

> Oluşturulma: 2026-05-15 07:50 GMT+8
> Kural: Birini bitirmeden diğerine geçme. Tikle = bitti.

---

## 📊 İlerleme Özeti

| Aşama | Durum | Tamamlanma |
|-------|-------|------------|
| Aşama 1: OpenAPI Spec | ✅ | 100% |
| Aşama 2: Wrapper + İmza | ⏳ | 3/11 |
| Aşama 3: Unit Testler | ⏳ | 3/11 |
| Aşama 4: Operasyonel | ❌ | 0% |

---

## 🔴 AŞAMA 2 — Wrapper + İmza Doğrulama (KALAN 8 DİL)

Sırasıyla git. Her dil: wrapper → imza → test → commit.

### Dil 1: Rust
- [ ] `sdks/rust/src/client.rs` — HookSniff wrapper (endpoints, webhooks, alerts, billing, teams, notifications, schemas, search, admin, audit_log, inbound, templates, routing, rate_limits, custom_domains, sso)
- [ ] `sdks/rust/src/webhook.rs` — HMAC-SHA256 imza doğrulama (timing-safe)
- [ ] `sdks/rust/src/error.rs` — ApiException
- [ ] `sdks/rust/tests/` — unit testler (20+)
- [ ] Cargo.toml güncelle (version, dependencies)
- [ ] `cargo build` + `cargo test`
- [ ] git commit + push

### Dil 2: Ruby
- [ ] `sdks/ruby/lib/hooksniff/client.rb` — HookSniff wrapper
- [ ] `sdks/ruby/lib/hooksniff/webhook.rb` — HMAC-SHA256 imza doğrulama
- [ ] `sdks/ruby/lib/hooksniff/error.rb` — ApiException
- [ ] `sdks/ruby/spec/` — RSpec testler (20+)
- [ ] Gemspec güncelle
- [ ] `bundle install` + `bundle exec rspec`
- [ ] git commit + push

### Dil 3: Java
- [ ] `sdks/java/src/main/java/com/hooksniff/HookSniffClient.java` — wrapper
- [ ] `sdks/java/src/main/java/com/hooksniff/WebhookVerifier.java` — imza
- [ ] `sdks/java/src/main/java/com/hooksniff/ApiException.java` — error
- [ ] `sdks/java/src/test/java/` — JUnit testler (20+)
- [ ] pom.xml / build.gradle güncelle
- [ ] `mvn compile` / `gradle build`
- [ ] git commit + push

### Dil 4: Kotlin
- [ ] `sdks/kotlin/src/main/kotlin/com/hooksniff/HookSniffClient.kt` — wrapper
- [ ] `sdks/kotlin/src/main/kotlin/com/hooksniff/WebhookVerifier.kt` — imza
- [ ] `sdks/kotlin/src/test/kotlin/` — JUnit testler (20+)
- [ ] build.gradle.kts güncelle
- [ ] `gradle build`
- [ ] git commit + push

### Dil 5: PHP
- [ ] `sdks/php/src/HookSniffClient.php` — wrapper (mevcut kodu düzelt)
- [ ] `sdks/php/src/WebhookVerifier.php` — imza
- [ ] `sdks/php/tests/` — PHPUnit testler (20+)
- [ ] composer.json güncelle
- [ ] `composer install` + `phpunit`
- [ ] git commit + push

### Dil 6: C#
- [ ] `sdks/csharp/src/HookSniff/HookSniffClient.cs` — wrapper
- [ ] `sdks/csharp/src/HookSniff/WebhookVerifier.cs` — imza
- [ ] `sdks/csharp/src/HookSniff/ApiException.cs` — error
- [ ] `sdks/csharp/tests/` — xUnit testler (20+)
- [ ] .csproj güncelle
- [ ] `dotnet build` + `dotnet test`
- [ ] git commit + push

### Dil 7: Elixir
- [ ] `sdks/elixir/lib/hooksniff/client.ex` — wrapper
- [ ] `sdks/elixir/lib/hooksniff/webhook.ex` — imza
- [ ] `sdks/elixir/test/` — ExUnit testler (20+)
- [ ] mix.exs güncelle
- [ ] `mix deps.get` + `mix test`
- [ ] git commit + push

### Dil 8: Swift
- [ ] `sdks/swift/Sources/HookSniffSDK/HookSniffClient.swift` — wrapper
- [ ] `sdks/swift/Sources/HookSniffSDK/WebhookVerifier.swift` — imza
- [ ] `sdks/swift/Tests/` — XCTest testler (20+)
- [ ] Package.swift güncelle
- [ ] `swift build` + `swift test`
- [ ] git commit + push

---

## 🟡 AŞAMA 3 — Kalite ve Güvenilirlik (AŞAMA 2'DEN SONRA)

- [ ] Tüm dillerde unit test coverage raporu
- [ ] CHANGELOG.md — her SDK için (Keep a Changelog formatı)
- [ ] Migration guide: 0.1.0 → 0.2.0 → 0.3.0
- [ ] Breaking changes listesi

---

## 🟢 AŞAMA 4 — Operasyonel Mükemmellik (AŞAMA 3'TEN SONRA)

- [ ] CI/CD pipeline — `.github/workflows/sdk-test.yml`
- [ ] CI/CD pipeline — `.github/workflows/sdk-publish.yml`
- [ ] Otomatik versiyon yönetimi (semver)
- [ ] SDK dokümantasyon sitesi (Docusaurus/Mintlify)
- [ ] Performance benchmarking (tüm diller)

---

## 📝 Notlar

### Wrapper Pattern (Referans: Node.js)
```typescript
// sdks/node/src/hooksniff.ts
export class HookSniff {
  constructor(apiKey: string, options?: { baseUrl?: string; timeout?: number })
  endpoints: EndpointsResource
  webhooks: WebhooksResource
  alerts: AlertsResource
  // ... tüm API grupları
}
```

### İmza Doğrulama Pattern (Referans: Node.js)
```typescript
// sdks/node/src/webhook.ts
export class Webhook {
  constructor(secret: string)
  verify(payload: string | Buffer, headers: Record<string, string>): boolean
  // HMAC-SHA256, timing-safe comparison
  // Header'lar: webhook-id, webhook-timestamp, webhook-signature
}
```

### Kalite Kuralları
1. Zero/minimum dependency (sadece native crypto + HTTP)
2. ESM + CJS dual export (Node.js), idiomatic patterns (diğer diller)
3. TypeScript strict mode (Node), type safety (tüm diller)
4. Error handling: ApiException(statusCode, body, message)
5. Timeout: configurable, default 30s
6. Retry: exponential backoff + jitter
7. User-Agent: `hooksniff-sdk/{version} ({lang})`
