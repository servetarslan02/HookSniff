# 📦 HookSniff — SDK Stratejisi

> Son güncelleme: 2026-05-08 19:34 GMT+8
> Karar: 6 aktif SDK, 5 pasif (community)

---

## Aktif Bakım Yapılan SDK'lar (6)

| # | Dil | Registry | Paket Adı | Bağımlılık | Bakım |
|---|-----|----------|-----------|------------|-------|
| 1 | Node.js/TypeScript | npm | `@hooksniff/sdk` | 0 (fetch) | Düşük |
| 2 | Python | PyPI | `hooksniff` | 1 (requests) | Düşük |
| 3 | Go | Go modules | `hooksniff-go` | 0 (net/http) | Çok düşük |
| 4 | Java | Maven Central | `com.hooksniff` | 0 (java.net.http) | Düşük |
| 5 | PHP | Packagist | `hooksniff/hooksniff` | 0 (curl) | Düşük |
| 6 | Ruby | RubyGems | `hooksniff` | 0 (net/http) | Düşük |

## Community Maintained SDK'lar (5)

| # | Dil | Registry | Durum |
|---|-----|----------|-------|
| 1 | C# | NuGet | PR gelirse merge edilir |
| 2 | Kotlin | Maven Central | PR gelirse merge edilir |
| 3 | Elixir | Hex | PR gelirse merge edilir |
| 4 | Swift | Swift Package Manager | PR gelirse merge edilir |
| 5 | Rust | crates.io | PR gelirse merge edilir |

---

## Güvenlik ve Bakım Planı

### 1. Dependabot
- `.github/dependabot.yml` kurulacak
- Aktif SDK'ların dizinlerini tarar
- Bağımlılık açığı bulunca otomatik PR açar
- Servet sadece "Merge" butonuna basar

### 2. CI Testleri
- Her aktif SDK için minimal test:
  - Import başarılı mı?
  - Client instantiation çalışıyor mu?
  - Signature verification çalışıyor mu?
- CI'da otomatik çalışır, kırmızı ✗ = sorun var

### 3. Güvenlik Açığı Senaryoları

| Senaryo | Tehlike | Aksiyon |
|---------|---------|---------|
| `requests` (Python) açık | Düşük | Dependabot PR → AI inceler → merge |
| SDK kendi kodunda açık | Orta | Issue → AI düzeltir → Servet onaylar |
| Yeni Python/Node sürümü | Düşük | Genellikle bozulmaz. Bozulursa AI düzeltir |
| Yeni API endpoint | Normal | OpenAPI spec güncellenir → SDK'lar üretilir |

### 4. Gelecek: OpenAPI Spec + Otomatik Üretim
- API için `openapi.json` oluşturulacak
- Swagger Codegen veya OpenAPI Generator ile SDK'lar otomatik üretilir
- CI/CD'de otomatik test + publish
- Yeni dil eklemek 5 dakika sürer

---

## Neden Bu Diller?

| Dil | Neden Seçildi |
|-----|---------------|
| Node.js | En yaygın webhook tüketicisi, tüm modern backend'ler |
| Python | İkinci en yaygın, data/AI/ML dünyası |
| Go | Backend geliştiricileri, DevOps araçları |
| Java | Enterprise dünya, büyük şirketler |
| PHP | WordPress, Laravel, hâlâ çok yaygın |
| Ruby | Rails ekosistemi, startup'lar |

---

## Kritik Kural

> **Ne kadar az bağımlılık = o kadar az güvenlik riski**

SDK'lar sadece API wrapper'ı. Karmaşık iş mantığı yok. Minimal bağımlılık, minimal risk.
