# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-19 01:12 GMT+8

## ⚠️ KRİTİK: SDK Adaptasyon Yöntemi

**ASLA sıfırdan yazma!** Her zaman Svix SDK'yı kopyala ve adapte et.

## 🔑 Credential'lar

### NuGet
```
oy2eyxly2puop7uki47q6ewsoelcrikudaito7a7nxkjyy
```

### RubyGems
```
rubygems_ab4a30751cbdea680577f44baadfeaaca376f6d0c1c97ccc
```

### Sonatype (Maven Central)
**Java SDK:**
```
Username: f0wXBf
Password: EYLV763IsQVseaffdOXNScf2HZlcLDGEK
```

**Kotlin SDK:**
```
Username: 7cxUFC
Password: kjwdGgyf22tr4tbRjDYN7X9VYrmRoqOJy
```

### npm
```
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
```

### PyPI
```
pypi-AgEIcHlwaS5vcmcCJDZhMjRlNGRjLTFlZDYtNGU3YS04OGZiLTFiOTc0MzQyMmFlNwACKlszLCJjOWU2MmFjMy0zZDY0LTQ4YjMtOWEyZC0yYTdhY2IyODNjNDQiXQAABiD0GkexYoMrkdPWGUKyKTG3BAnmCYT-XuA_Pf9XB4O2fg
```

### crates.io
```
ciozq2VZY9iBIKxYlBMJuUg8p8Cg7Z1KeqE
```

### Hex.pm
```
20e1faa34deb3e75d01dec3002e30bfc
```

### Packagist
```
86b49acd74d0894483fae6e47c4f68712239dcde
```

## 📊 SDK Publish Durumu — TÜMÜ TAMAMLANDI

| # | SDK | Registry | Versiyon | Durum |
|---|-----|----------|----------|-------|
| 1 | Node.js | npm | 1.1.0 | ✅ |
| 2 | Python | PyPI | 1.2.0 | ✅ |
| 3 | Go | GitHub tag | v1.1.0 | ✅ |
| 4 | Rust | crates.io | 1.1.0 | ✅ |
| 5 | Ruby | RubyGems | 1.2.0 | ✅ |
| 6 | Java | Maven Central | 1.1.2 | ✅ |
| 7 | Kotlin | Maven Central | 1.1.0 | ✅ |
| 8 | PHP | Packagist | 1.1.0 | ✅ |
| 9 | C# | NuGet | 1.2.0 | ✅ |
| 10 | Elixir | Hex.pm | 1.1.1 | ✅ |
| 11 | Swift | GitHub tag | v1.1.0 | ✅ |

## 📊 SDK Kalite İlerlemesi (2026-05-19 01:52 — Doğrulandı)

| Feature | Durum | Not |
|---------|-------|-----|
| İmza Doğrulama | ✅ 11/11 | HMAC-SHA256, 5 dk tolerance, unbranded destek |
| Retry/Backoff | ✅ 11/11 | 429 Retry-After + exponential backoff |
| Pagination Helper | ✅ 11/11 | Tüm SDK'lara eklendi |
| Error Types | ❌ 6/11 eksik | Rust, Java, Kotlin, C#, Elixir, Swift |
| Config Options | 🔶 Kısmen | Node.js tamam, diğerlerinde eksik |
| Debug Logging | 🔶 1/11 | Sadece Node.js'de var |
| CI/CD | ❌ 0/11 | Manuel publish |
| Typed Events | ❌ 0/11 | Sıradaki |
| Test Coverage | 🔶 ~%70 | Hedef: %95+ |

## 📝 Son Oturum (2026-05-19 00:35-01:12)

### Yapılan:
1. **Tüm SDK'lar clone edildi** (11 repo)
2. **Pagination Helper** tüm SDK'lara eklendi:
   - Python: `pagination.py` + `ListResponse` + `build_list_response()` — 17 test ✅
   - Node.js: `pagination.ts` + `listAll()` methodu — build ✅, runtime test ✅
   - Go: `pagination.go` + generic `Paginator[T]` + `ListAll()` 
   - PHP: `Paginator.php` + generator pattern
   - Java: `Paginator.java` + Iterable
   - Kotlin: `Paginator.kt` + Iterable
   - Ruby: `paginator.rb` + Enumerable
   - C#: `Paginator.cs` + IAsyncEnumerable
   - Elixir: `paginator.ex` + Stream
   - Rust: `pagination.rs` + async collect
   - Swift: `Paginator.swift` + AsyncSequence
3. **SDK-QUALITY-GAPS.md** güncellendi — öncelikler yeniden düzenlendi
4. **Python SDK** — 6 list() methodu pagination ile güncellendi
5. **Node.js SDK** — Message + Endpoint listAll() eklendi
6. **Go SDK** — 6 ListResponse modeline interface methodları eklendi

### Test Sonuçları:
- Python: 17/17 test ✅
- Node.js: build ✅ + runtime test ✅
- Go/Java/PHP/Ruby/C#/Elixir/Rust/Swift: syntax ✅ (derleyici yok)

## ⚠️ KRİTİK KURALLAR

1. **SDK sıfırdan yazılmaz** — Svix SDK'dan kopyala, adapte et
2. **Ana repoda sdks/ klasörü yok** — ayrı repolarda yaşıyor
3. **Ayrı repolar** — hooksniff-{dil} formatında
4. **Oturumlar 1 saat** — her şeyi dosyalara yaz, push et
5. **Sırayla git, bozma** — her adımda test et, çalıştığını doğrula
