# SDK Strateji Planı

> Son güncelleme: 2026-05-17 22:06 GMT+8

---

## 🎯 Hedef

HookSniff SDK'larını **Svix seviyesinde** (Stripe'ın %75'i) yapmak.
Kullanıcı SDK'yı indirdiğinde aynı kalitede deneyim yaşamalı.

---


### Ne demek?
- Svix'in **altyapı kodunu** (request, retry, webhook verify, pagination) al
- HookSniff'in **API endpoint'leri** (resource'lar, model'ler) ile değiştir
- MIT lisansı → yasal, credit ver yeterli

### Neden bu strateji?
1. **Hız** — 2-3 saat vs 1-2 gün (SDK başına)
2. **Kalite** — Svix production'da test edilmiş, 22M+ npm indirme/ay
3. **Tutarlılık** — Tüm diller aynı pattern, aynı DX
4. **Bakım** — Svix güncelleme yaptığında biz de güncelleyebiliriz

---

## 🗓️ Faz Planı

### Faz 1 — En Kritik 4 SDK ✅ (2026-05-17)
| SDK | Durum | Kalite |
|-----|-------|--------|
| Node.js | ✅ Tamamlandı | %70-75 |
| Python | ⬜ Sıradaki | → %70-75 |
| Go | ⬜ Sıradaki | → %70-75 |
| Rust | ⬜ Sıradaki | → %70-75 |

**Neden bunlar?**
- Node.js: En popüler dil, en çok kullanıcı
- Python: Data/AI dünyası, ikinci popüler
- Go: Backend developer'lar, performans odaklı
- Rust: HookSniff'in kendisi Rust, dogfooding

### Faz 2 — Kalan 7 SDK (opsiyonel)
Ruby, Java, Kotlin, PHP, C#, Swift, Elixir

**Ne zaman?** Faz 1 tamamlandıktan sonra, kullanıcı talebine göre.

### Faz 3 — Kalite Artışı (tüm SDK'lar)
1. Test suite (her SDK için)
2. CI/CD (GitHub Actions)
3. Publish otomasyonu
4. Dokümantasyon

---

## 🔧 Teknik Detaylar

### Her SDK için yapılıcak adımlar
```
1. Svix SDK deposunu klonla
2. Core dosyaları al (request, webhook, util, pagination)
3. "svix" → "hooksniff" isim değişikliği
4. Svix'e özel feature'ları çıkar (region detection, connectors vs.)
5. HookSniff OpenAPI spec'ten resource dosyaları oluştur
6. HookSniff model'lerini yaz (TypeScript/Python/Go type'ları)
7. Main class oluştur (HookSniff/Svix class'ı yerine)
8. Build et, test et
9. Publish et
```

### Svix SDK Referans Linkleri
| Dil | Repo |
|-----|------|
| TypeScript | `github.com/svix/svix-webhooks/javascript/` |
| Python | `github.com/svix/svix-webhooks/python/` |
| Go | `github.com/svix/svix-webhooks/go/` |
| Rust | `github.com/svix/svix-webhooks/rust/` |
| Ruby | `github.com/svix/svix-webhooks/ruby/` |
| Java | `github.com/svix/svix-webhooks/java/` |
| Kotlin | `github.com/svix/svix-webhooks/kotlin/` |
| PHP | `github.com/svix/svix-webhooks/php/` |
| C# | `github.com/svix/svix-webhooks/csharp/` |
| Swift | `github.com/svix/svix-webhooks/swift/` |
| Elixir | `github.com/svix/svix-webhooks/elixir/` |

---

## ⚠️ Kurallar

1. **Onay almadan başlama** — Servet onay vermeden yeni SDK'ya geçme
2. **Her SDK sonrası commit + push** — GitHub'a sync et
3. **`.ai-context/sdk-roadmap/` güncelle** — STATUS.md, DONE.md, TODO.md
4. **MEMORY.md güncelle** — Oturum sonunda yeni iş kaydı
5. **Breaking change varsa haber ver** — Kullanıcı etkilenirse söyle

---

## 📊 Başarı Kriterleri

| Kriter | Hedef | Ölçüm |
|--------|-------|-------|
| SDK kalitesi | %70+ (her dil) | Retry, pagination, webhook verify var mı? |
| Versiyon tutarlılığı | Tümü 0.5.0 | STATUS.md |
| Test coverage | %80+ | CI pipeline |
| Publish | 11/11 registry | STATUS.md |
| Kullanıcı DX | Svix ile aynı | Code comparison |
