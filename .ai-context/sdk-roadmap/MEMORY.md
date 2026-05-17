# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-17 23:58 GMT+8

## Durum
- Node.js SDK: ✅ Svix'ten adapte edildi (0.5.0, %70-75)
- Python SDK: ✅ Svix SDK'dan doğrudan adapte edildi (127 dosya, 101 model) (1.0.0, %80)
- Go SDK: ✅ Svix SDK'dan doğrudan adapte edildi (115 dosya, 99 model) (1.0.0, %80)
- Rust SDK: ✅ Svix SDK'dan doğrudan adapte edildi (118 dosya, 98 model) (1.0.0, %80)
- 7 SDK daha: ⬜ Beklemede (Ruby, Java, Kotlin, PHP, C#, Swift, Elixir)

## Adaptasyon Yöntemi
1. Svix SDK'yı kopyala
2. `svix` → `hooksniff` yeniden adlandır
3. API base URL'ini değiştir
4. Svix-specific features kaldır
5. GitHub'a push et

## Sıradaki
1. Kalan 7 SDK (Ruby, Java, Kotlin, PHP, C#, Swift, Elixir)
2. Faz 1-7: Core kalite, test, CI/CD, codegen, docs
