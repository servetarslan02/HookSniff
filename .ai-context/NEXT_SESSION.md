# NEXT_SESSION.md — Sonraki Oturum Planı

> Son güncelleme: 2026-05-11 19:15 GMT+8

---

## 📦 SDK Publish — Kalan 5 SDK

### Öncelik 1: Kotlin (Maven Central)
- Build config düzeltildi ✅ (Oturum 111)
- **Gerekli:** Java 11+, GPG key import, OSSRH credentials
- **Komut:** `cd sdks/kotlin && ./gradlew publishMavenPublicationToOssrhRepository`
- **Eğer Servet'te Java varsa** hemen publish edilebilir

### Öncelik 2: PHP (Packagist)
- composer.json düzeltildi ✅ (Oturum 111)
- **Servet yapacak:** packagist.org'da `hooksniff/hooksniff-php` olarak repo bağla
- Packagist webhook GitHub'a eklenmeli (auto-update için)

### Öncelik 3: Ruby (RubyGems) — Servet'in PC'si
- gemspec düzeltildi ✅
- `gem build hooksniff.gemspec && gem push hooksniff-0.3.0.gem`

### Öncelik 4: C# (NuGet) — Servet'in PC'si
- .csproj doğru ✅
- `dotnet pack -c Release && dotnet nuget push bin/Release/*.nupkg --source https://api.nuget.org/v3/index.json`

### Öncelik 5: Elixir (Hex) — Servet'in PC'si
- mix.exs düzeltildi ✅
- `mix hex.publish --yes`

---

## 🚨 KRİTİK BLOKLAR (Oturum 109 SONU — hala geçerli)

### 1. Cloud Run API — DEPLOY BAŞARISIZ
- Son 5 revision başarısız, revision 00058 hala %100 traffic
- Docker image build sorunu muhtemel neden
- Cloud Build loglarını incele, Dockerfile.api'de Rust sürümünü sabitle

### 2. GitHub Actions Billing — BİTTİ
- GCP Cloud Build kullan (cloudbuild.yaml zaten var)

### 3. Grafana OTEL — Veri Akışı
- API deploy olmadan OTEL verisi akmaz

### 4. Grafana Trial — 9 Gün Kaldı (May 20)
- Upgrade veya alternatif bul
