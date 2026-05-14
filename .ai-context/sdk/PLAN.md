# SDK Execution Plan — Aşama Aşama

> Oluşturulma: 2026-05-15 07:50 GMT+8
> Son güncelleme: 2026-05-15 08:00 GMT+8
> Kural: Birini bitirmeden diğerine geçme. Tikle = bitti.

---

## 📊 İlerleme Özeti

| Aşama | Durum | Tamamlanma |
|-------|-------|------------|
| Aşama 1: OpenAPI Spec | ✅ | 100% |
| Aşama 2: Wrapper + İmza | ✅ | 11/11 |
| Aşama 3: Unit Testler | ✅ | 11/11 |
| Aşama 4: Operasyonel | ⏳ | 0% |

---

## ✅ AŞAMA 1 — OpenAPI Spec Genişletme

- [x] Model sayısı 148 → tüm SDK'larda mevcut
- [x] Aşama 1.4 kalite kontrol: 11/11 SDK doğrulandı

## ✅ AŞAMA 2 — Wrapper + İmza Doğrulama (11/11)

| Dil | Wrapper | İmza | Test | Durum |
|-----|---------|------|------|-------|
| Node.js | ✅ | ✅ | ✅ 211 test | ✅ TAMAM |
| Python | ✅ | ✅ | ✅ 77 test | ✅ TAMAM |
| Go | ✅ | ✅ | ✅ | ✅ TAMAM |
| Rust | ✅ | ✅ | ✅ 6 test dosyası | ✅ TAMAM |
| Ruby | ✅ | ✅ | ✅ 170+ spec | ✅ TAMAM |
| Java | ✅ | ✅ | ✅ 209 test | ✅ TAMAM |
| Kotlin | ✅ | ✅ | ✅ 179 test | ✅ TAMAM |
| PHP | ✅ | ✅ | ✅ | ✅ TAMAM |
| C# | ✅ | ✅ | ✅ 220 test | ✅ TAMAM |
| Elixir | ✅ | ✅ | ✅ 21 test | ✅ TAMAM |
| Swift | ✅ | ✅ | ✅ 10 test dosyası | ✅ TAMAM |

## ✅ AŞAMA 3 — Kalite ve Güvenilirlik

- [x] Unit testler — Node.js (211), Python (77), Go, Rust (6 dosya), Ruby (170+), Java (209), Kotlin (179), PHP, C# (220), Elixir (21), Swift (10 dosya)
- [x] CHANGELOG.md — her SDK için mevcut
- [x] Webhook verification — tüm dillerde HMAC-SHA256, timing-safe

---

## 🔴 AŞAMA 4 — Operasyonel Mükemmellik

### 4.1 CI/CD Pipeline
- [ ] `.github/workflows/sdk-test.yml` — PR'da tüm SDK'ları test et
- [ ] `.github/workflows/sdk-publish.yml` — tag'de publish
- [ ] Her dil için build job (npm, pip, cargo, mvn, bundle, composer, dotnet, mix, swift)

### 4.2 Otomatik Versiyon Yönetimi
- [ ] Semver convention belirle (0.x → 1.0.0 zamanlaması)
- [ ] OpenAPI spec değişince SDK versiyonu otomatik art
- [ ] Version bump script

### 4.3 SDK Dokümantasyon Sitesi
- [ ] Platform seç: Docusaurus veya Mintlify
- [ ] Her dil için Quick Start
- [ ] Her dil için Full API Reference
- [ ] Code examples (her endpoint için)
- [ ] Migration guide (0.1.0 → 0.2.0 → 0.3.0 → 1.0.0)
- [ ] Error handling guide
- [ ] İmza doğrulama guide
- [ ] docs.hooksniff.dev domain

### 4.4 Performance Benchmarking
- [ ] Her SDK için benchmark script
- [ ] İlk bağlantı süresi
- [ ] Request/response latency
- [ ] Memory usage
- [ ] Bundle size (Node.js, Python)
- [ ] Sonuçları dokümantasyona ekle

### 4.5 Publish Durumu Kontrol
- [ ] npm — hooksniff-sdk güncel mi?
- [ ] PyPI — hooksniff güncel mi?
- [ ] crates.io — hooksniff güncel mi?
- [ ] RubyGems — hooksniff güncel mi?
- [ ] Maven Central — hooksniff-sdk güncel mi?
- [ ] NuGet — HookSniff güncel mi?
- [ ] Hex.pm — hooksniff güncel mi?
- [ ] Swift Package Index — HookSniff güncel mi?

---

## 📝 Notlar

### Kalite Kuralları
1. Zero/minimum dependency (sadece native crypto + HTTP)
2. Her dilin idiomlarına uygun kodlama
3. Error handling: ApiException(statusCode, body, message)
4. Timeout: configurable, default 30s
5. Retry: exponential backoff + jitter
6. User-Agent: `hooksniff-sdk/{version} ({lang})`
