# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-18 16:45 GMT+8

## ⚠️ KRİTİK: SDK Adaptasyon Yöntemi

**ASLA sıfırdan yazma!** Her zaman Svix SDK'yı kopyala ve adapte et.

## 🔑 Credential'lar

### Sonatype (Maven Central)
**Java SDK (aktif):**
```
Username: f0wXBf
Password: EYLV763IsQVseaffdOXNScf2HZlcLDGEK
```

**Yedek / Kotlin SDK:**
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

### RubyGems
```
rubygems_236be4c92841e391cbb1cb11e2bd18f04f97bc05abbd78e5
```

### NuGet
```
oy2eyxly2puop7uki47q6ewsoelcrikudaito7a7nxkjyy
```

### Hex.pm
```
20e1faa34deb3e75d01dec3002e30bfc
```

### Packagist
```
86b49acd74d0894483fae6e47c4f68712239dcde
```

### Cloudflare R2 (S3)
```
Access Key ID: 00e106b8f3ef03184261d1cd5a9163e7
Secret Access Key: c2154c6c31d2e429e62955de20b3f59627c74ef5ea899778e6fc12c03137e927
Endpoint: https://2a7ee86912c49fd36cff048204c37f70.r2.cloudflarestorage.com
```

### Terraform
```
ghaot-scyXJUiMzsXcNvV1
```

## 📊 SDK Publish Durumu (2026-05-18 16:54 Gerçek Durum)

| # | SDK | Registry | Versiyon | Faz 8-15 | Durum |
|---|-----|----------|----------|----------|-------|
| 1 | **Node.js** | npm | 1.1.0 | 8/8 ✅ | ✅ Yüklendi |
| 2 | **Python** | PyPI | 1.1.0 | 8/8 ✅ | ✅ Yüklendi |
| 3 | **Go** | GitHub tag | v1.1.0 | 5/8 ❌ | ⏳ background_task, op_webhook, poller, inbound eksik |
| 4 | **Rust** | crates.io | 1.1.0 | 8/8 ✅ | ✅ Yüklendi |
| 5 | **Java** | Maven Central | 1.1.2 | 8/8 ✅ | ✅ Yüklendi (2026-05-18) |
| 6 | **Kotlin** | Maven Central | 1.1.0 | var/bozuk | ❌ Build hatalı, rewrite gerekiyor |
| 7 | **Ruby** | RubyGems | 1.0.0 | 2/8 ❌ | ⏳ env, bg_task, op_webhook, poller, inbound, connector eksik |
| 8 | **PHP** | Packagist | 1.1.0 | 2/8 ❌ | ⏳ Aynı eksikler |
| 9 | **C#** | NuGet | 1.0.0 | 2/8 ❌ | ⏳ Aynı eksikler |
| 10 | **Elixir** | Hex.pm | 1.1.1 | 0/8 ❌ | ⏳ Hiçbir faz resource'ı yok |
| 11 | **Swift** | GitHub tag | v1.1.0 | 3/8 ❌ | ⏳ env, bg_task, op_webhook, poller, connector eksik |

⚠️ **ÖNEMLİ:** MEMORY.md'nin eski halinde "tüm fazlar tamamlandı, 11 SDK v1.1.0" yazıyordu ama bu doğru değil.
Sadece Node.js, Python ve Rust'ta tüm Faz 8-15 kaynakları mevcut.

## 📊 Faz İlerlemesi — TÜMÜ TAMAMLANDI

| Faz | İçerik | Durum |
|-----|--------|-------|
| 8 | Environment | ✅ |
| 9 | Background Task | ✅ |
| 10 | Operational Webhook | ✅ (worker dispatch dahil) |
| 11 | Message Poller | ✅ |
| 12 | Ingest | ✅ |
| 13 | Connector | ✅ |
| 14 | Integration | ✅ |
| 15 | Streaming | ✅ |

## 🏗️ Build Ortamı (Bu Sunucu)
- JDK 17: /opt/jdk-17
- Node.js: v22.22.1
- GPG key: /tmp/gpg-hooksniff (geçici, sunucu restart'ta silinir)

## ⚠️ KRİTİK KURALLAR

1. **SDK sıfırdan yazılmaz** — Svix SDK'dan kopyala, adapte et
2. **Ana repoda sdks/ klasörü yok** — ayrı repolarda yaşıyor
3. **Ayrı repolar** — hooksniff-{dil} formatında
4. **Oturumlar 1 saat** — her şeyi dosyalara yaz, push et

## 📝 Son Oturum (2026-05-18)
- Java SDK v1.1.2 Maven Central'a publish edildi (Version.java düzeltildi)
- Kotlin SDK build hâlâ bozuk (package çakışması: com.hooksniff vs com.hooksniff.kotlin)
- Ana repodaki sdks/ klasörü silindi (1861 dosya)
- GPG key keyserver'a yüklendi
