# SDK Durum Tablosu

> Son güncelleme: 2026-05-18 01:20 GMT+8

## Genel Bakış

| # | SDK | Dil | Yöntem | Versiyon | Dosya | Model | Durum |
|---|-----|-----|--------|----------|-------|-------|-------|
| 1 | **Node.js** | TypeScript | Svix'ten adapte | 0.5.0 | — | 80+ | ✅ |
| 2 | **Python** | Python | Svix SDK doğrudan | 1.0.0 | 127 | 101 | ✅ |
| 3 | **Go** | Go | Svix SDK doğrudan | 1.0.0 | 115 | 99 | ✅ |
| 4 | **Rust** | Rust | Svix SDK doğrudan | 1.0.0 | 118 | 98 | ✅ |
| 5 | **Ruby** | Ruby | Svix'ten adapte | 1.0.0 | 74 | 48 | ✅ |
| 6 | **Java** | Java | Svix'ten adapte | 1.0.0 | 158 | 104 | ✅ |
| 7 | **Kotlin** | Kotlin | Svix'ten adapte | 1.0.0 | 131 | 103 | ✅ |
| 8 | **PHP** | PHP | Svix'ten adapte | 1.0.0 | 89 | ~50 | ✅ |
| 9 | **C#** | C# | Svix'ten adapte | 1.0.0 | 67 | ~40 | ✅ |
| 10 | Swift | Swift | Svix'ten adapte | — | — | — | ⬜ |
| 11 | Elixir | Elixir | Svix'ten adapte | — | — | — | ⬜ |

## Resource Mapping (Svix → HookSniff)

| Svix Resource | HookSniff Resource | Durum |
|---------------|-------------------|-------|
| Application | Endpoint (HookSniff endpoint kullanıyor) | ✅ |
| Authentication | Authentication | ✅ |
| Endpoint | Endpoint | ✅ |
| EventType | EventType | ✅ |
| Message | Message | ✅ |
| MessageAttempt | MessageAttempt | ✅ |
| Statistics | Statistics | ✅ |
| BackgroundTask | — (kaldırıldı) | ❌ |
| Connector | — (kaldırıldı) | ❌ |
| Environment | — (kaldırıldı) | ❌ |
| Ingest | — (kaldırıldı) | ❌ |
| Integration | — (kaldırıldı) | ❌ |
| OperationalWebhook | — (kaldırıldı) | ❌ |
| Streaming | — (kaldırıldı) | ❌ |

## Adaptasyon Adımları (Tekrarlanabilir)

1. `git clone https://github.com/svix/svix-webhooks.git`
2. İlgili dil klasörünü kopyala
3. `find . -name "*.py" -exec sed -i 's/svix/hooksniff/g' {} +` (veya dil equivalentı)
4. Import path'lerini düzelt
5. Svix-specific dosyaları sil
6. Syntax-check yap
7. `git add . && git commit && git push`
8. Bu dosyayı güncelle
