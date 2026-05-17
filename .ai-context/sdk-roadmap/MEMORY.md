# SDK Roadmap MEMORY

> Son güncelleme: 2026-05-18 01:30 GMT+8

## ⚠️ KRİTİK: SDK Adaptasyon Yöntemi

**ASLA sıfırdan yazma!** Her zaman Svix SDK'yı kopyala ve adapte et.

### Adımlar (her SDK için aynı):
1. Svix repo'sundan ilgili dil SDK'sını kopyala (`svix-libs/python/`, `svix-libs/go/`, `svix-libs/rust/` vb.)
2. Bulk find-replace yap: `svix` → `hooksniff`, `Svix` → `HookSniff`, `SVIX` → `HOOKSNIFF`
3. Import path'lerini değiştir: `github.com/svix/svix-webhooks` → `github.com/servetarslan02/hooksniff-go` vb.
4. API base URL'ini değiştir: `api.svix.com` → `api.hooksniff.com`
5. Svix-specific features kaldır (aşağıya bak)
6. `svix-id`/`svix-signature`/`svix-timestamp` header'larını `hooksniff-id`/`hooksniff-signature`/`hooksniff-timestamp` olarak değiştir
7. Syntax-check yap
8. GitHub'a push et
9. `.ai-context/sdk-roadmap/` dosyalarını güncelle

### Kaldırılacak Svix-specific features:
- autoconfig (svix autoconfig token)
- streaming (svix streaming)
- ingest (svix ingest endpoints/sources)
- connectors (svix connectors - shopify, stripe vb.)
- environment (svix environment)
- integration (svix integration)
- operational_webhook (svix operational webhooks)
- background_task (svix background tasks)
- message_poller (svix message poller)
- application (svix application - HookSniff endpoint kullanıyor)
- Svix-specific connector config'ler (*_config.go, *_config_out.go vb.)

### Dosya yapısı (Python örneği):
```
sdks/python/
├── hooksniff/
│   ├── __init__.py
│   ├── exceptions.py
│   ├── webhooks.py
│   ├── py.typed
│   ├── api/
│   │   ├── __init__.py
│   │   ├── client.py          (attrs-based)
│   │   ├── common.py          (ApiBase - httpx)
│   │   ├── hooksniff.py       (main client)
│   │   ├── errors/
│   │   ├── endpoint.py
│   │   ├── message.py
│   │   ├── message_attempt.py
│   │   ├── authentication.py
│   │   ├── event_type.py
│   │   └── statistics.py
│   └── models/
│       └── __init__.py
├── tests/
├── pyproject.toml
└── README.md
```

## Mevcut Durum
- Node.js SDK: ✅ Svix'ten adapte edildi (0.5.0)
- Python SDK: ✅ Svix SDK'dan doğrudan adapte edildi (1.0.0, 127 dosya, 101 model)
- Go SDK: ✅ Svix SDK'dan doğrudan adapte edildi (1.0.0, 115 dosya, 99 model)
- Rust SDK: ✅ Svix SDK'dan doğrudan adapte edildi (1.0.0, 118 dosya, 98 model)
- Ruby: ✅ Svix'ten adapte edildi (1.0.0, 74 dosya, 48 model)
- Java: ✅ Svix'ten adapte edildi (1.0.0, 158 dosya, 104 model)
- Kotlin: ✅ Svix'ten adapte edildi (1.0.0, 131 dosya, 103 model)
- PHP: ✅ Svix'ten adapte edildi (1.0.0, 89 dosya, ~50 model)
- C#: ✅ Svix'ten adapte edildi (1.0.0, 67 dosya, ~40 model)
- Swift: ✅ HookSniff custom (1.0.0, ~14 dosya)
- Elixir: ✅ OpenAPI'den adapte edildi (1.0.0, 247 dosya)

## Svix Repo
- GitHub: `https://github.com/svix/svix-webhooks`
- Python: `svix-libs/python/svix/`
- Go: `svix-libs/go/`
- Rust: `svix-libs/rust/`
- Ruby: `svix-libs/ruby/`
- Java: `svix-libs/java/`
- Kotlin: `svix-libs/kotlin/`
- PHP: `svix-libs/php/`
- C#: `svix-libs/csharp/` veya `svix-libs/dotnet/`
- Swift: `svix-libs/swift/`
- Elixir: `svix-libs/elixir/`

## HookSniff API Bilgileri
- Base URL: `https://api.hooksniff-1046140057667.europe-west1.run.app`
- API versioning: `/v1/` prefix
- Auth: Bearer token
- Webhook headers: `hooksniff-id`, `hooksniff-signature`, `hooksniff-timestamp`
