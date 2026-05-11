# 🏆 HookSniff vs Rakipler — SDK Karşılaştırması

> Tarih: 2026-05-11 21:32 GMT+8
> Karşılaştırılan: Svix (ana rakip), Hookdeck, Convoy

## Genel Bakış

| Kriter | Svix | HookSniff | Hookdeck | Convoy |
|--------|------|-----------|----------|--------|
| Dil sayısı | 7 | 11 ✅ | 3 | 4 |
| npm versiyon | 1.93.0 (371) | 0.3.0 (2) | 0.4.0 | 0.4.1 |
| GitHub stars | 3,202 | ? | ? | ? |
| İlk yayın | 2021 | 2026 | 2021 | 2021 |

## Dil Bazlı Karşılaştırma

### Node.js (npm)
| Kriter | Svix | HookSniff |
|--------|------|-----------|
| Versiyon | v1.93.0 | v0.3.0 |
| Bağımlılık | 1 (node-fetch) | 2 (request — DEPRECATED!) |
| Wrapper class | ✅ `new Svix(key)` | ❌ Ham API class |
| İmza verify | ✅ `Webhook.verify()` | ❌ Yok |
| Retry | ✅ Built-in fetch wrapper | ✅ Built-in |
| Dosya sayısı | 742 | 266 |
| Model sayısı | 654 | 194 |
| API sayısı | 69 | 68 |
| TypeScript | ✅ | ✅ |

### Python (PyPI)
| Kriter | Svix | HookSniff |
|--------|------|-----------|
| Versiyon | v1.93.0 | v0.3.0 |
| HTTP lib | httpx | urllib3 |
| Model lib | pydantic + attrs | pydantic |
| Wrapper class | ✅ `Svix()` | ❌ Ham API class |
| İmza verify | ✅ `Webhook.verify()` | ❌ Yok |
| Python 3.6+ | ✅ | ✅ (3.8+) |

### Go
| Kriter | Svix | HookSniff |
|--------|------|-----------|
| Versiyon | v1.93.0 | v0.3.0 |
| Bağımlılık | 0 (net/http) | 0 (net/http) |
| Wrapper | ✅ `svix.New()` | ❌ `NewAPIClient()` |

### Rust (crates.io)
| Kriter | Svix | HookSniff |
|--------|------|-----------|
| Versiyon | v1.93.0 | v0.3.0 |
| İndirme | 742,560 | 22 |
| Wrapper | ✅ | ❌ |

### Ruby (RubyGems)
| Kriter | Svix | HookSniff |
|--------|------|-----------|
| Versiyon | v1.93.0 | v0.3.0 |
| İndirme | yüksek | 183 |

### Java (Maven Central)
| Kriter | Svix | HookSniff |
|--------|------|-----------|
| Group | com.svix | io.github.servetarslan02 |
| Artifact | svix | hooksniff-sdk |
| Versiyon | 1.93.0 | 0.3.0 |

### C# (NuGet)
| Kriter | Svix | HookSniff |
|--------|------|-----------|
| Versiyon | v1.93.0 | v0.3.0 |

## Svix'in Olmadığı Diller
- ❌ Kotlin — HookSniff'te var ✅
- ❌ PHP — HookSniff'te var ✅
- ❌ Elixir — HookSniff'te var ✅
- ❌ Swift — HookSniff'te var ✅

## HookSniff'in Eksiklikleri
1. **Wrapper class yok** — Kullanıcı ham API class'ları kullanmak zorunda
2. **İmza doğrulama yok** — SDK'da `verifySignature()` fonksiyonu yok
3. **Node.js'te deprecated `request` library** — `node-fetch` veya native `fetch` kullanılmalı
4. **SDK testi yok** — Hiçbir SDK'da unit test yok
5. **CHANGELOG yok** — Versiyon geçişleri takip edilemiyor

## HookSniff'in Avantajları
1. **11 dil desteği** — Svix 7, diğerleri 3-4
2. **Kotlin, PHP, Elixir, Swift** — Rakiplerin hiçbiri yok
3. **Düşük bağımlılık** — Go, Ruby, PHP sıfır bağımlılık
4. **Detaylı README** — Svix sadece link veriyor
5. **OpenAPI spec** — Tüm SDK'lar spec'ten üretilmiş, tutarlı

## Öneri Sırası
1. Wrapper class ekle (tüm dillerde)
2. İmza doğrulama ekle (tüm dillerde)
3. Node.js `request` → `node-fetch` veya native `fetch` değiştir
4. Her SDK'ya en az 10 unit test ekle
5. CHANGELOG oluştur
