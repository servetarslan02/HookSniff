# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-18 18:29 GMT+8

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

## 📊 SDK Publish Durumu (2026-05-18 18:29 Gerçek Durum)

| # | SDK | Registry | Versiyon | Faz 8-15 | Ek Resource | Durum |
|---|-----|----------|----------|----------|-------------|-------|
| 1 | **Node.js** | npm | 1.1.0 | 8/8 ✅ | — | ✅ Yüklendi |
| 2 | **Python** | PyPI | 1.1.0 | 8/8 ✅ | — | ✅ Yüklendi |
| 3 | **Go** | GitHub tag | v1.1.0 | 5/8 ❌ | — | ✅ (eksik resource var) |
| 4 | **Rust** | crates.io | 1.1.0 | 8/8 ✅ | — | ✅ Yüklendi |
| 5 | **Ruby** | **RubyGems** | **1.2.0** | **8/8 ✅** | **30+** | ✅ **Yüklendi (2026-05-18)** |
| 6 | **Java** | Maven Central | 1.1.2 | 8/8 ✅ | — | ✅ Yüklendi |
| 7 | **Kotlin** | Maven Central | 1.1.0 | bozuk | — | ❌ Build fix gerekli |
| 8 | **PHP** | Packagist | 1.1.0 | 2/8 ❌ | — | ✅ (eksik resource var) |
| 9 | **C#** | **NuGet** | **1.2.0** | **8/8 ✅** | **30+** | ✅ **Yüklendi (2026-05-18)** |
| 10 | **Elixir** | Hex.pm | 1.1.1 | 0/8 ❌ | — | ⏳ Publish gerekli |
| 11 | **Swift** | GitHub tag | v1.1.0 | 3/8 ❌ | — | ✅ (eksik resource var) |

## 📊 Faz İlerlemesi — TÜMÜ TAMAMLANDI

| Faz | İçerik | Durum |
|-----|--------|-------|
| 8 | Environment | ✅ |
| 9 | Background Task | ✅ |
| 10 | Operational Webhook | ✅ |
| 11 | Message Poller | ✅ |
| 12 | Ingest | ✅ |
| 13 | Connector | ✅ |
| 14 | Integration | ✅ |
| 15 | Streaming | ✅ |

## 📝 Son Oturum (2026-05-18 18:29)

### Yapılan:
- **Ruby SDK v1.2.0** → RubyGems'e publish edildi
  - 24 yeni API dosyası eklendi (Environment, BackgroundTask, OperationalWebhook, MessagePoller, Inbound, Connector + 18 ek resource)
  - hooksniff.rb güncellendi (tüm resource require + client accessor)
  - Ruby 3.2.4 kaynak koddan derlendi (libyaml + psych + openssl)
  - curl ile RubyGems API'ye push edildi
  - GitHub'a push edildi

- **C# SDK v1.2.0** → NuGet'e publish edildi
  - 25+ yeni resource eklendi (Environment, BackgroundTask, OperationalWebhook, MessagePoller, Inbound, Connector, Integration, Stream + 18 ek resource)
  - 21 yeni model dosyası oluşturuldu
  - HookSniffClient.cs güncellendi (30+ resource property)
  - dotnet SDK 8.0 kuruldu
  - GitHub'a push edildi

### Kalan:
- **Kotlin** → Build fix + Maven Central publish
- **Elixir** → Hex.pm publish
- **Go, PHP, Swift** → Eksik Faz 8-15 resource'ları (düşük öncelik)

## ⚠️ KRİTİK KURALLAR

1. **SDK sıfırdan yazılmaz** — Svix SDK'dan kopyala, adapte et
2. **Ana repoda sdks/ klasörü yok** — ayrı repolarda yaşıyor
3. **Ayrı repolar** — hooksniff-{dil} formatında
4. **Oturumlar 1 saat** — her şeyi dosyalara yaz, push et
