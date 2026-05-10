# 🔍 SDK İnceleme

> Kapsam: 11 dil (Python, Node.js, Go, Rust, Java, Kotlin, C#, Ruby, PHP, Swift, Elixir)
> Tarih: 2026-05-10

---

## 🔴 Kritik

| # | Sorun | SDK | Dosya |
|---|-------|-----|-------|
| 1 | 11 SDK'da GCP Cloud Run URL hardcoded (proje ID `1046140057667` ifşa) | Tümü | Tüm client dosyaları | ✅ Düzeltildi (2026-05-10) |

## 🟠 Yüksek

| # | Sorun | SDK |
|---|-------|-----|
| 1 | Search API tutarsız: Swift expose etmiyor, Elixir implement etmemiş | Swift, Elixir |
| 2 | `HOOKRELAY_KEY` env var adı docs'da (HOOKSNIFF_API_KEY olmalı) | Docs sayfaları |

## 🟡 Orta

| # | Sorun | SDK | Dosya |
|---|-------|-----|-------|
| 1 | API key validation zayıf (sadece null kontrol, boş string geçiyor) | C# | `HookSniffClient.cs` |
| 2 | CancellationToken desteği yok (async methodlar) | C# | `HookSniffClient.cs` |
| 3 | Retry logic yok (transient failures) | C# | `HookSniffClient.cs` |
| 4 | `@unchecked Sendable` — data race riski | Swift | `HookSniff.swift` |
| 5 | Force-cast `as! HTTPURLResponse` — crash riski | Swift | `HookSniff.swift` |
| 6 | `:patch` method eksik — FunctionClauseError | Elixir | `hooksniff.ex` |
| 7 | `curl_close()` deprecated (PHP 8.0+ otomatik kapatıyor) | PHP | `HookSniffClient.php` |
| 8 | `SearchAsync` untyped `object` döndürüyor | C# | `HookSniffClient.cs` |

## 🟢 Güçlü Yönler

- ✅ Tüm SDK'larda WebhookVerifier constant-time comparison kullanıyor
- ✅ Python: Argon2id + proper exception hierarchy
- ✅ Go: 580 satır, kapsamlı, test var
- ✅ Rust: 689 satır, type-safe
- ✅ Java: Proper model classes
- ✅ Ruby: Clean module structure
- ✅ Elixir: SSL verification enabled (`verify: :verify_peer`)

## SDK Bazlı Özet

| SDK | Satır | Test | Constant-time | Search | Not |
|-----|-------|------|---------------|--------|-----|
| Python | ~500 | ✅ | ✅ | ✅ | En iyi SDK |
| Node.js | ~300 | ❌ | ✅ | ✅ | |
| Go | 580 | ✅ | ✅ | ✅ | |
| Rust | 689 | ❌ | ✅ | ✅ | |
| Java | ~400 | ❌ | ✅ | ✅ | |
| Kotlin | ~300 | ❌ | ✅ | ⚠️ | SearchResource var ama expose edilmemiş |
| C# | 465 | ❌ | ✅ | ⚠️ | Untyped return |
| Ruby | ~300 | ❌ | ✅ | ✅ | |
| PHP | ~300 | ❌ | ✅ | ✅ | |
| Swift | ~400 | ❌ | ✅ | ❌ | SearchResource var ama expose edilmemiş |
| Elixir | ~300 | ❌ | ✅ | ❌ | Implement edilmemiş |
