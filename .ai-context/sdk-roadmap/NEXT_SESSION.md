# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-18 16:45 GMT+8

## ✅ Yapılan
- Java SDK v1.1.2 → Maven Central publish edildi
- sdks/ klasörü ana repodan silindi
- Credential'lar MEMORY.md'ye kaydedildi

## ⏳ Kalan İşler

### 1. Kotlin SDK — EN KRİTİK
hooksniff-kotlin repo'sunda build hataları var:
- Package çakışması: bazı dosyalar `com.hooksniff`, bazıları `com.hooksniff.kotlin`
- Eksik tipler: BackgroundTaskStatus, BackgroundTaskType, ApplicationIn
- `client.request()` methodu tanımlı değil
- **Çözüm:** Tüm dosyaları `com.hooksniff.kotlin` package'ına taşı, eksik tipleri ekle

### 2. Ruby SDK Publish
```bash
cd hooksniff-ruby
gem build hooksniff.gemspec
gem push hooksniff-*.gem
```

### 3. C# SDK Publish
```bash
cd hooksniff-csharp
dotnet pack -c Release
dotnet nuget push "bin/Release/*.nupkg" --api-key <NUGET_KEY> --source https://api.nuget.org/v3/index.json
```

### 4. Elixir SDK Publish
```bash
cd hooksniff-elixir
mix hex.publish --yes
```

## 🔧credential Lokasyonu
Tüm credential'lar `.ai-context/sdk-roadmap/MEMORY.md` içinde.
