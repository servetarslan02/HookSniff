# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-17 23:55 GMT+8

## Durum
- Node.js SDK: ✅ Svix'ten adapte edildi (0.5.0, %70-75)
- Python SDK: ✅ Svix SDK'dan doğrudan adapte edildi (127 dosya, 101 model, sync+async) (1.0.0, %80)
- Go SDK: ✅ Svix SDK'dan doğrudan adapte edildi (115 dosya, 99 model) (1.0.0, %80)
- Rust SDK: ⬜ Sıradaki
- 7 SDK daha: ⬜ Beklemede

## Yaklaşım
- Svix'in mevcut SDK'larını alıp HookSniff'e uyarlıyoruz
- Her SDK: kopyala → svix→hooksniff yeniden adlandır → Svix-specific temizle → push
- Hedef: %100 (Stripe seviyesi)

## Sıradaki
1. Rust SDK (Svix Rust core'dan adapte)
2. Kalan 7 SDK (Ruby, Java, Kotlin, PHP, C#, Swift, Elixir)
3. Faz 1-7: Core kalite, test, CI/CD, codegen, docs
